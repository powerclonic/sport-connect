"""OAuth router.

Endpoints
---------
GET /oauth/{provider}/redirect   — generate provider authorization URL
GET /oauth/{provider}/callback   — handle provider callback, issue JWT pair
"""

import uuid

import httpx
from fastapi import APIRouter, HTTPException, Query, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select

from app.database import DBSession
from app.config import get_settings
from app.models.oauth_account import OAuthAccount
from app.models.user import User
from app.oauth.providers import OAuthProvider, exchange_code, get_authorization_url, get_user_info
from app.redis_client import RedisClient
from app.routers.auth import _issue_tokens
from app.schemas.auth import TokenResponse
from app.security import encrypt_token

router = APIRouter(prefix="/oauth", tags=["oauth"])
settings = get_settings()

_STATE_TTL = 600  # 10 minutes
_STATE_PREFIX = "oauth_state:"


@router.get("/{provider}/redirect")
def oauth_redirect(
    provider: OAuthProvider,
    redis_client: RedisClient,
) -> dict:
    """Return the provider authorization URL. Frontend should redirect the user there."""
    state = str(uuid.uuid4())
    redis_client.setex(f"{_STATE_PREFIX}{state}", _STATE_TTL, provider.value)

    url = get_authorization_url(provider, state)
    return {"authorization_url": url}


@router.get("/{provider}/callback")
def oauth_callback(
    provider: OAuthProvider,
    db: DBSession,
    redis_client: RedisClient,
    code: str = Query(),
    state: str = Query(),
) -> RedirectResponse:
    """Exchange auth code for user info, upsert user + OAuthAccount, issue JWT pair."""

    # ── Validate CSRF state ────────────────────────────────────────────────
    state_key = f"{_STATE_PREFIX}{state}"
    stored_provider = redis_client.get(state_key)
    if not stored_provider or stored_provider != provider.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OAuth state.",
        )
    redis_client.delete(state_key)

    # ── Exchange code for tokens ───────────────────────────────────────────
    try:
        token_data = exchange_code(provider, code)
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to exchange OAuth code with {provider.value}.",
        ) from exc

    access_token: str = token_data.get("access_token", "")
    provider_refresh_token: str | None = token_data.get("refresh_token")

    # ── Fetch user info from provider ──────────────────────────────────────
    try:
        user_info = get_user_info(provider, access_token)
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to retrieve user info from {provider.value}.",
        ) from exc

    # ── Upsert User + OAuthAccount ─────────────────────────────────────────
    oauth_account = db.scalar(
        select(OAuthAccount).where(
            OAuthAccount.provider == provider.value,
            OAuthAccount.provider_user_id == user_info.provider_user_id,
        )
    )

    if oauth_account:
        # Update stored tokens
        oauth_account.access_token_encrypted = encrypt_token(access_token)
        if provider_refresh_token:
            oauth_account.refresh_token_encrypted = encrypt_token(provider_refresh_token)
        user = db.get(User, oauth_account.user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive.",
            )
    else:
        # Try to link to existing user with same email
        user = db.scalar(select(User).where(User.email == user_info.email))

        if not user:
            user = User(
                email=user_info.email,
                display_name=user_info.display_name,
                avatar_url=user_info.avatar_url,
                is_verified=True,  # email verified by provider
            )
            db.add(user)
            db.flush()  # get user.id without committing

        oauth_account = OAuthAccount(
            user_id=user.id,
            provider=provider.value,
            provider_user_id=user_info.provider_user_id,
            access_token_encrypted=encrypt_token(access_token),
            refresh_token_encrypted=(
                encrypt_token(provider_refresh_token) if provider_refresh_token else None
            ),
        )
        db.add(oauth_account)

    db.commit()

    # Issue tokens without setting cookies (this is a browser redirect flow —
    # the frontend SPA will store them in the auth store / localStorage).
    dummy_response = Response()
    token_data: TokenResponse = _issue_tokens(user.id, dummy_response)

    # Redirect to the frontend OAuth callback page with tokens in the hash fragment.
    # Hash fragments are never sent to the server, limiting token exposure.
    redirect_url = (
        f"{settings.FRONTEND_URL}/oauth/callback"
        f"#access_token={token_data.access_token}"
        f"&refresh_token={token_data.refresh_token}"
    )
    return RedirectResponse(url=redirect_url, status_code=status.HTTP_302_FOUND)
