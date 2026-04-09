from redis.asyncio import Redis, from_url

from app.core.config import settings

_redis: Redis | None = None


async def get_redis() -> Redis:
    global _redis
    if _redis is None:
        if settings.REDIS_URL == "fake":
            # Dev-режим без Redis: используем fakeredis (in-memory)
            try:
                import fakeredis.aioredis as fakeredis  # type: ignore
                _redis = fakeredis.FakeRedis(decode_responses=True)
            except ImportError:
                raise RuntimeError(
                    "Установи fakeredis: pip install fakeredis"
                )
        else:
            _redis = from_url(settings.REDIS_URL, decode_responses=True)
    return _redis


async def close_redis() -> None:
    global _redis
    if _redis:
        await _redis.aclose()
        _redis = None
