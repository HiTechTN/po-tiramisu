"""
Redis caching utility for frequently queried data.

Provides a simple get/set/delete interface with automatic JSON
serialization and optional TTL.  Falls back to a no-op when Redis
is unavailable so the application continues to work.
"""

import json
from typing import Any, Optional

from ..redis_client import _get_redis_client

_PRODUCT_CACHE_TTL = 300  # 5 minutes


async def cache_get(key: str) -> Optional[Any]:
    """Retrieve a cached value by key."""
    client = await _get_redis_client()
    if client is None:
        return None
    try:
        raw = await client.get(f"cache:{key}")
        if raw is None:
            return None
        return json.loads(raw)
    except Exception:
        return None


async def cache_set(key: str, value: Any, ttl: int = _PRODUCT_CACHE_TTL) -> None:
    """Store a value in cache with a TTL (seconds)."""
    client = await _get_redis_client()
    if client is None:
        return
    try:
        await client.set(f"cache:{key}", json.dumps(value, default=str), ex=ttl)
    except Exception:
        pass


async def cache_delete(key: str) -> None:
    """Remove a cached value."""
    client = await _get_redis_client()
    if client is None:
        return
    try:
        await client.delete(f"cache:{key}")
    except Exception:
        pass


async def cache_invalidate_pattern(pattern: str) -> None:
    """Invalidate all keys matching a pattern."""
    client = await _get_redis_client()
    if client is None:
        return
    try:
        keys = await client.keys(f"cache:{pattern}")
        if keys:
            await client.delete(*keys)
    except Exception:
        pass
