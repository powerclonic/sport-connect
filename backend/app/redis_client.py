from collections.abc import Generator
from typing import Annotated

import redis
from fastapi import Depends

from app.config import get_settings

_settings = get_settings()

_pool = redis.ConnectionPool.from_url(
    _settings.REDIS_URL,
    decode_responses=True,
    max_connections=20,
)


def get_redis() -> Generator[redis.Redis, None, None]:
    client: redis.Redis = redis.Redis(connection_pool=_pool)
    try:
        yield client
    finally:
        client.close()


RedisClient = Annotated[redis.Redis, Depends(get_redis)]
