"""OAuth provider clients using HTTPX.

Each provider implements:
  - get_authorization_url(state) → str
  - exchange_code(code, redirect_uri) → dict
  - get_user_info(access_token) → OAuthUserInfo
"""

from dataclasses import dataclass
from enum import Enum

import httpx

from app.config import get_settings

settings = get_settings()


class OAuthProvider(str, Enum):
    GOOGLE = "google"
    FACEBOOK = "facebook"


@dataclass
class OAuthUserInfo:
    provider: str
    provider_user_id: str
    email: str
    display_name: str | None
    avatar_url: str | None
    access_token: str
    refresh_token: str | None = None


# ── Google ────────────────────────────────────────────────────────────────────

_GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
_GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
_GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

_GOOGLE_SCOPES = "openid email profile"


def google_get_authorization_url(state: str) -> str:
    redirect_uri = f"{settings.OAUTH_REDIRECT_BASE_URL}/api/v1/oauth/google/callback"
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": _GOOGLE_SCOPES,
        "state": state,
        "access_type": "offline",
        "prompt": "consent",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{_GOOGLE_AUTH_URL}?{query}"


def google_exchange_code(code: str) -> dict:
    redirect_uri = f"{settings.OAUTH_REDIRECT_BASE_URL}/api/v1/oauth/google/callback"
    with httpx.Client(timeout=10) as client:
        response = client.post(
            _GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        response.raise_for_status()
        return response.json()


def google_get_user_info(access_token: str) -> OAuthUserInfo:
    with httpx.Client(timeout=10) as client:
        response = client.get(
            _GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        response.raise_for_status()
        data = response.json()

    return OAuthUserInfo(
        provider=OAuthProvider.GOOGLE,
        provider_user_id=data["sub"],
        email=data["email"],
        display_name=data.get("name"),
        avatar_url=data.get("picture"),
        access_token=access_token,
    )


# ── Facebook ──────────────────────────────────────────────────────────────────

_FACEBOOK_AUTH_URL = "https://www.facebook.com/v19.0/dialog/oauth"
_FACEBOOK_TOKEN_URL = "https://graph.facebook.com/v19.0/oauth/access_token"
_FACEBOOK_USERINFO_URL = "https://graph.facebook.com/v19.0/me"

_FACEBOOK_SCOPES = "email,public_profile"


def facebook_get_authorization_url(state: str) -> str:
    redirect_uri = (
        f"{settings.OAUTH_REDIRECT_BASE_URL}/api/v1/oauth/facebook/callback"
    )
    params = {
        "client_id": settings.FACEBOOK_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "scope": _FACEBOOK_SCOPES,
        "state": state,
        "response_type": "code",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{_FACEBOOK_AUTH_URL}?{query}"


def facebook_exchange_code(code: str) -> dict:
    redirect_uri = (
        f"{settings.OAUTH_REDIRECT_BASE_URL}/api/v1/oauth/facebook/callback"
    )
    with httpx.Client(timeout=10) as client:
        response = client.get(
            _FACEBOOK_TOKEN_URL,
            params={
                "client_id": settings.FACEBOOK_CLIENT_ID,
                "client_secret": settings.FACEBOOK_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "code": code,
            },
        )
        response.raise_for_status()
        return response.json()


def facebook_get_user_info(access_token: str) -> OAuthUserInfo:
    with httpx.Client(timeout=10) as client:
        response = client.get(
            _FACEBOOK_USERINFO_URL,
            params={
                "fields": "id,name,email,picture.type(large)",
                "access_token": access_token,
            },
        )
        response.raise_for_status()
        data = response.json()

    avatar_url: str | None = None
    if "picture" in data:
        avatar_url = data["picture"].get("data", {}).get("url")

    return OAuthUserInfo(
        provider=OAuthProvider.FACEBOOK,
        provider_user_id=data["id"],
        email=data.get("email", ""),
        display_name=data.get("name"),
        avatar_url=avatar_url,
        access_token=access_token,
    )


# ── Provider dispatch ─────────────────────────────────────────────────────────

_PROVIDER_MAP = {
    OAuthProvider.GOOGLE: (
        google_get_authorization_url,
        google_exchange_code,
        google_get_user_info,
    ),
    OAuthProvider.FACEBOOK: (
        facebook_get_authorization_url,
        facebook_exchange_code,
        facebook_get_user_info,
    ),
}


def get_authorization_url(provider: OAuthProvider, state: str) -> str:
    return _PROVIDER_MAP[provider][0](state)


def exchange_code(provider: OAuthProvider, code: str) -> dict:
    return _PROVIDER_MAP[provider][1](code)


def get_user_info(provider: OAuthProvider, access_token: str) -> OAuthUserInfo:
    return _PROVIDER_MAP[provider][2](access_token)
