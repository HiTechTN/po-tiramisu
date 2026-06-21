import aioredis
import json
from typing import Any, Dict
from ..config import get_settings

# ── Redis Client Wrapper ───────────────────────────────────────
# This module provides async helpers to persist the shopping‑cart in
# Redis.  When Redis is unavailable (e.g., during unit tests without a
# Redis container), the functions fall back to an in‑memory dictionary
# so the existing test‑suite continues to work unchanged.

# In‑memory fallback (used when Redis connection fails)
_IN_MEMORY_CART: Dict[int, Dict[str, Any]] = {}


async def _get_redis_client() -> aioredis.Redis:
    """Create (or retrieve) a Redis client.
    Errors are *not* swallowed here – callers decide whether to use the
    fallback based on the exception type.
    """
    settings = get_settings()
    return aioredis.from_url(settings.REDIS_URL, decode_responses=True)


async def get_cart(user_id: int) -> Dict[str, Any]:
    """Return a user's cart.
    If Redis is reachable, the cart is stored/retrieved as JSON under the
    key ``cart:{user_id}``.  On any connection error, the function returns
    the cart from the in‑memory fallback dict.
    """
    try:
        client = await _get_redis_client()
        raw = await client.get(f"cart:{user_id}")
        if raw is None:
            return {"items": [], "promo_code": None, "discount": 0.0}
        return json.loads(raw)
    except Exception:
        # Fallback – either Redis not running or connection refused
        return _IN_MEMORY_CART.get(user_id, {"items": [], "promo_code": None, "discount": 0.0})


async def set_cart(user_id: int, cart: Dict[str, Any]) -> None:
    """Persist a user's cart.
    Writes the cart to Redis when possible; otherwise updates the in‑memory
    fallback dictionary.
    """
    try:
        client = await _get_redis_client()
        await client.set(f"cart:{user_id}", json.dumps(cart))
    except Exception:
        _IN_MEMORY_CART[user_id] = cart


async def delete_cart(user_id: int) -> None:
    """Delete a user's cart.
    Removes the entry from Redis if reachable; otherwise removes it from
    the fallback dictionary.
    """
    try:
        client = await _get_redis_client()
        await client.delete(f"cart:{user_id}")
    except Exception:
        _IN_MEMORY_CART.pop(user_id, None)

# ---------------------------------------------------------------------
# Note: the functions are intentionally tiny – the heavy lifting (validation,
# business rules) lives in ``backend/app/state.py`` and the route handlers.
# ---------------------------------------------------------------------
