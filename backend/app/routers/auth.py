"""Authentication router.

Endpoints
---------
POST /auth/register   — create account
POST /auth/login      — issue token pair
POST /auth/refresh    — rotate refresh token
POST /auth/logout     — revoke refresh token + clear cookies
GET  /auth/me         — return current user profile
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import DBSession
from app.dependencies import (
    CurrentUserDep,
    is_family_revoked,
    is_refresh_token_revoked,
    revoke_entire_family,
    revoke_refresh_token,
)
from app.middleware.rate_limit import auth_rate_limit, register_rate_limit
from app.models.user import User
from app.redis_client import RedisClient
from app.schemas.auth import (
    LoginRequest,
    ProfileUpdateRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserPublicResponse,
)
from app.security import (
    TokenType,
    create_access_token,
    create_refresh_token,
    decode_token,
    extract_refresh_token,
    get_cookie_kwargs,
    hash_password,
    verify_password,
)
from app.config import get_settings

settings = get_settings()

router = APIRouter(prefix="/auth", tags=["auth"])

_COOKIE_ACCESS = "access_token"
_COOKIE_REFRESH = "refresh_token"


# ── Helpers ───────────────────────────────────────────────────────────────────


def _issue_tokens(
    user_id: str,
    response: Response,
    family: str | None = None,
) -> TokenResponse:
    """Create a new token pair, set httpOnly cookies, return body payload."""
    access_token, _ = create_access_token(user_id)
    refresh_token, _ = create_refresh_token(user_id, family=family)

    cookie_kw = get_cookie_kwargs()

    response.set_cookie(
        key=_COOKIE_ACCESS,
        value=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        **cookie_kw,
    )
    response.set_cookie(
        key=_COOKIE_REFRESH,
        value=refresh_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/api/v1/auth/refresh",  # scope refresh cookie to refresh endpoint
        **cookie_kw,
    )

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(_COOKIE_ACCESS)
    response.delete_cookie(_COOKIE_REFRESH, path="/api/v1/auth/refresh")


# ── Routes ────────────────────────────────────────────────────────────────────


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(register_rate_limit)],
)
def register(
    body: RegisterRequest,
    response: Response,
    db: DBSession,
) -> TokenResponse:
    existing = db.scalar(select(User).where(User.email == body.email))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        display_name=body.display_name,
        sports_preferences=body.sports,
        profile_complete=len(body.sports) > 0,
    )
    db.add(user)
    db.commit()

    return _issue_tokens(user.id, response)


@router.post(
    "/login",
    response_model=TokenResponse,
    dependencies=[Depends(auth_rate_limit)],
)
def login(
    body: LoginRequest,
    response: Response,
    db: DBSession,
) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == body.email))

    # Constant-time path: verify even if user not found to prevent enumeration
    dummy_hash = "$2b$12$placeholder.hash.for.timing.attack.prevention.only"
    actual_hash = user.hashed_password if (user and user.hashed_password) else dummy_hash
    password_ok = verify_password(body.password, actual_hash)

    if not user or not user.is_active or not password_ok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
        )

    return _issue_tokens(user.id, response)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    request: Request,
    body: RefreshRequest,
    response: Response,
    db: DBSession,
    redis_client: RedisClient,
) -> TokenResponse:
    # Accept token from cookie (web) or body (mobile)
    token = extract_refresh_token(request) or body.refresh_token
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required.",
        )

    payload = decode_token(token, TokenType.REFRESH)
    jti: str = payload["jti"]
    family: str = payload.get("family", jti)
    user_id: str = payload["sub"]

    # Detect reuse of already-revoked token → revoke entire family (theft defense)
    if is_refresh_token_revoked(jti, redis_client) or is_family_revoked(
        family, redis_client
    ):
        revoke_entire_family(family, redis_client)
        _clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token reuse detected. Please log in again.",
        )

    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive.",
        )

    # Revoke the consumed token before issuing the new pair
    revoke_refresh_token(jti, family, redis_client)

    return _issue_tokens(user.id, response, family=family)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    request: Request,
    body: RefreshRequest,
    response: Response,
    redis_client: RedisClient,
) -> None:
    token = extract_refresh_token(request) or body.refresh_token
    if token:
        try:
            payload = decode_token(token, TokenType.REFRESH)
            jti = payload["jti"]
            family = payload.get("family", jti)
            revoke_refresh_token(jti, family, redis_client)
        except HTTPException:
            pass  # Already expired / invalid — clear cookies anyway

    _clear_auth_cookies(response)


@router.get("/me", response_model=UserPublicResponse)
def get_me(current_user: CurrentUserDep) -> UserPublicResponse:
    return UserPublicResponse.model_validate(current_user)


@router.put("/profile", response_model=UserPublicResponse)
def update_profile(
    body: ProfileUpdateRequest,
    current_user: CurrentUserDep,
    db: DBSession,
) -> UserPublicResponse:
    if body.display_name is not None:
        current_user.display_name = body.display_name
    if body.bio is not None:
        current_user.bio = body.bio
    if body.location is not None:
        current_user.location = body.location
    if body.city is not None:
        current_user.city = body.city
    if body.phone is not None:
        current_user.phone = body.phone
    current_user.sports_preferences = body.sports_preferences
    current_user.profile_complete = True
    db.commit()
    db.refresh(current_user)
    return UserPublicResponse.model_validate(current_user)
