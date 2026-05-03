"""FastAPI dependencies for auth and access control."""

from typing import Annotated

import redis
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database import DBSession, get_db
from app.models.user import User
from app.redis_client import RedisClient, get_redis
from app.security import TokenType, decode_token, extract_access_token

# Redis key prefix for revoked refresh token JTIs
_REVOKED_PREFIX = "rt_revoked:"
# Redis key prefix for refresh token family tracking
_FAMILY_PREFIX = "rt_family:"


def _get_current_user_or_none(
    request: Request,
    db: Session = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
) -> User | None:
    """Core logic: extract + verify token, load user. Returns None if missing."""
    token = extract_access_token(request)
    if not token:
        return None

    payload = decode_token(token, TokenType.ACCESS)
    user_id: str = payload["sub"]

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        return None

    return user


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
) -> User:
    """Require an authenticated active user. Raises 401 if not present."""
    user = _get_current_user_or_none(request, db, redis_client)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_optional_user(
    request: Request,
    db: Session = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
) -> User | None:
    """Optionally load current user — returns None if unauthenticated."""
    return _get_current_user_or_none(request, db, redis_client)


# ── Annotated type aliases ────────────────────────────────────────────────────

CurrentUserDep = Annotated[User, Depends(get_current_user)]
OptionalUserDep = Annotated[User | None, Depends(get_optional_user)]


# ── Refresh token helpers (used by auth router) ───────────────────────────────


def revoke_refresh_token(jti: str, family: str, redis_client: redis.Redis) -> None:
    """Mark a refresh token JTI as revoked in Redis."""
    ttl = 60 * 60 * 24 * 31  # 31 days (slightly over max refresh TTL)
    redis_client.setex(f"{_REVOKED_PREFIX}{jti}", ttl, "1")


def is_refresh_token_revoked(jti: str, redis_client: redis.Redis) -> bool:
    return redis_client.exists(f"{_REVOKED_PREFIX}{jti}") == 1


def revoke_entire_family(family: str, redis_client: redis.Redis) -> None:
    """Invalidate all tokens in a family (theft detection).

    Stores a revoked-family marker; individual token checks also scan this.
    """
    ttl = 60 * 60 * 24 * 31
    redis_client.setex(f"{_FAMILY_PREFIX}{family}:revoked", ttl, "1")


def is_family_revoked(family: str, redis_client: redis.Redis) -> bool:
    return redis_client.exists(f"{_FAMILY_PREFIX}{family}:revoked") == 1
