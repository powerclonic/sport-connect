"""Core security utilities.

JWT — access + refresh token creation/verification
Password — bcrypt hashing (bcrypt package, Python 3.13 compatible)
Token extraction — cookie (web) with fallback to Authorization header (mobile)
Encryption — Fernet symmetric encryption for storing OAuth tokens at rest
"""

import uuid
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any

import bcrypt
import jwt
from cryptography.fernet import Fernet
from fastapi import HTTPException, Request, status

from app.config import get_settings

settings = get_settings()

# ── Password hashing ─────────────────────────────────────────────────────────


def hash_password(plain: str) -> str:
    hashed = bcrypt.hashpw(plain.encode(), bcrypt.gensalt(rounds=settings.BCRYPT_ROUNDS))
    return hashed.decode()


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False


# ── JWT token types ───────────────────────────────────────────────────────────


class TokenType(str, Enum):
    ACCESS = "access"
    REFRESH = "refresh"


# ── Token creation ────────────────────────────────────────────────────────────


def create_access_token(user_id: str) -> tuple[str, str]:
    """Return (encoded_token, jti)."""
    jti = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": user_id,
        "jti": jti,
        "type": TokenType.ACCESS,
        "iat": now,
        "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM), jti


def create_refresh_token(user_id: str, family: str | None = None) -> tuple[str, str]:
    """Return (encoded_token, jti).

    ``family`` ties a chain of rotated refresh tokens together so the entire
    family can be invalidated when token theft is detected.
    """
    jti = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": user_id,
        "jti": jti,
        "family": family or jti,  # first token in family = its own jti
        "type": TokenType.REFRESH,
        "iat": now,
        "exp": now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM), jti


# ── Token verification ────────────────────────────────────────────────────────


def decode_token(token: str, expected_type: TokenType) -> dict[str, Any]:
    """Decode and validate a JWT. Raises HTTPException on any failure."""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if payload.get("type") != expected_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


# ── Token extraction (dual transport) ────────────────────────────────────────


def extract_access_token(request: Request) -> str | None:
    """Extract access token from Authorization header or access_token cookie.

    Priority:
      1. ``Authorization: Bearer <token>`` header  (mobile / Capacitor)
      2. ``access_token`` httpOnly cookie           (web browser)
    """
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:]

    return request.cookies.get("access_token")


def extract_refresh_token(request: Request) -> str | None:
    """Extract refresh token from refresh_token cookie or request body field.

    Mobile clients may send it in the JSON body (handled at the router level).
    This helper covers the cookie path.
    """
    return request.cookies.get("refresh_token")


# ── Cookie helpers ────────────────────────────────────────────────────────────


def get_cookie_kwargs(settings=settings) -> dict[str, Any]:
    """Return shared kwargs for set_cookie calls."""
    return {
        "httponly": True,
        "samesite": "lax",  # 'strict' breaks OAuth redirects
        "secure": settings.HTTPS,
    }


# ── Symmetric encryption (OAuth tokens at rest) ───────────────────────────────


def _get_fernet() -> Fernet:
    # Derive a 32-byte URL-safe base64 key from SECRET_KEY.
    # In production, set FERNET_KEY separately to a proper Fernet key.
    import base64
    import hashlib

    key_bytes = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
    fernet_key = base64.urlsafe_b64encode(key_bytes)
    return Fernet(fernet_key)


def encrypt_token(plain: str) -> str:
    return _get_fernet().encrypt(plain.encode()).decode()


def decrypt_token(encrypted: str) -> str:
    return _get_fernet().decrypt(encrypted.encode()).decode()
