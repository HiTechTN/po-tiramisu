"""
Redis-backed cart storage with in-memory fallback.

Uses ``redis.asyncio`` (built into redis-py >= 4.2).  When Redis is
unavailable (e.g. during unit tests without a Redis container), every
function silently falls back to an in-memory dictionary so the existing
test-suite continues to work unchanged.
"""

import json
import logging
from typing import Any, Dict, Optional

from .config import get_settings

logger = logging.getLogger(__name__)

# ── In-memory fallback ──────────────────────────────────────────
_IN_MEMORY_CARTS: Dict[int, Dict[str, Any]] = {}

# Module-level cached Redis client (lazy singleton)
_redis_client = None


async def _get_redis_client():
    """Return a cached ``redis.asyncio`` client, or *None* if unavailable."""
    global _redis_client
    if _redis_client is not None:
        return _redis_client

    try:
        import redis.asyncio as aioredis
        settings = get_settings()
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=2,
        )
        # Quick connectivity check
        await _redis_client.ping()
        logger.info("Redis connection established (%s)", settings.REDIS_URL)
        return _redis_client
    except Exception as exc:
        logger.warning("Redis unavailable, using in-memory fallback: %s", exc)
        _redis_client = None
        return None


async def close_redis_client():
    """Gracefully close the Redis connection (called on app shutdown)."""
    global _redis_client
    if _redis_client is not None:
        try:
            await _redis_client.close()
        except Exception:
            pass
        _redis_client = None


# ── Cart helpers ────────────────────────────────────────────────

_EMPTY_CART: Dict[str, Any] = {"items": [], "promo_code": None, "discount": 0}


def _cart_key(user_id: int) -> str:
    return f"cart:{user_id}"


async def get_cart(user_id: int) -> Dict[str, Any]:
    """Return a user's cart.  Redis → in-memory fallback."""
    client = await _get_redis_client()
    if client is not None:
        try:
            raw = await client.get(_cart_key(user_id))
            if raw is None:
                return {"items": [], "promo_code": None, "discount": 0}
            return json.loads(raw)
        except Exception:
            pass
    return _IN_MEMORY_CARTS.get(user_id, {"items": [], "promo_code": None, "discount": 0})


async def set_cart(user_id: int, cart: Dict[str, Any]) -> None:
    """Persist a user's cart.  Redis → in-memory fallback."""
    client = await _get_redis_client()
    if client is not None:
        try:
            await client.set(_cart_key(user_id), json.dumps(cart))
            return
        except Exception:
            pass
    _IN_MEMORY_CARTS[user_id] = cart


async def delete_cart(user_id: int) -> None:
    """Delete a user's cart.  Redis → in-memory fallback."""
    client = await _get_redis_client()
    if client is not None:
        try:
            await client.delete(_cart_key(user_id))
            return
        except Exception:
            pass
    _IN_MEMORY_CARTS.pop(user_id, None)


def reset_carts() -> None:
    """Clear all in-memory carts (for use in tests)."""
    _IN_MEMORY_CARTS.clear()
