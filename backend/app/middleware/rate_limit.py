"""Redis sliding-window rate limiter dependency.

Usage:
    @router.post("/login", dependencies=[Depends(auth_rate_limit)])
    def login(...): ...
"""

import time
from collections.abc import Callable

import redis
from fastapi import Depends, HTTPException, Request, status

from app.redis_client import RedisClient, get_redis

_RATE_LIMIT_PREFIX = "rl:"


def _make_rate_limiter(max_requests: int, window_seconds: int) -> Callable:
    """Factory that returns a FastAPI dependency enforcing a sliding window."""

    def rate_limit(
        request: Request,
        redis_client: redis.Redis = Depends(get_redis),
    ) -> None:
        # Use forwarded IP if behind a trusted proxy, otherwise direct client IP
        forwarded_for = request.headers.get("X-Forwarded-For")
        client_ip = forwarded_for.split(",")[0].strip() if forwarded_for else (
            request.client.host if request.client else "unknown"
        )

        key = f"{_RATE_LIMIT_PREFIX}{request.url.path}:{client_ip}"
        now = time.time()
        window_start = now - window_seconds

        pipe = redis_client.pipeline()
        # Remove entries outside the window
        pipe.zremrangebyscore(key, "-inf", window_start)
        # Add the current request timestamp (score = timestamp, member = timestamp)
        pipe.zadd(key, {str(now): now})
        # Count requests in window
        pipe.zcard(key)
        # Expire the key so it self-cleans
        pipe.expire(key, window_seconds + 1)
        results = pipe.execute()

        count: int = results[2]
        if count > max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
                headers={"Retry-After": str(window_seconds)},
            )

    return rate_limit


# Predefined limiters — import and use as a dependency
auth_rate_limit = _make_rate_limiter(max_requests=5, window_seconds=60)
register_rate_limit = _make_rate_limiter(max_requests=3, window_seconds=60)
