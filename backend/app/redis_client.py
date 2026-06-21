import aioredis
import json
from typing import Any, Dict
from ..config import get_settings

# Simple wrapper around aioredis to provide basic cart operations.
# This client will be used only by the state module; it lazily connects when needed.


async def get_redis_client() -> aioredis.Redis:
    """
    Return a global Redis client instance.
    The client is created lazily – the first call creates the connection pool,
    subsequent calls return the same client.
    """
    settings = get_settings()
    return aioredis.from_url(settings.REDIS_URL, decode_responses=True)


async def get_cart(user_id: int) -> Dict[str, Any]:
    """
    Retrieve a user's cart from Redis.
    If the cart does not exist, a default empty cart dict is returned.
    """
    client = await get_redis_client()
    raw = await client.get(f"cart:{user_id}")
    if raw is None:
        return {"items": [], "promo_code": None, "discount": 0.0}
    return json.loads(raw)


async def set_cart(user_id: int, cart: Dict[str, Any]) -> None:
    """
    Store a user's cart in Redis.
    The cart dict is JSON‑encoded and stored under the key ``cart:{user_id}``.
    """
    client = await get_redis_client()
    await client.set(f"cart:{user_id}", json.dumps(cart))


async def delete_cart(user_id: int) -> None:
    """
    Remove a user's cart from Redis.
    This is used when the cart is cleared or the user logs out.
    """
    client = await get_redis_client()
    await client.delete(f"cart:{user_id}")