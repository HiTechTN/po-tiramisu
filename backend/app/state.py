"""
Shared cart state for the application.

Cart data is persisted in Redis when available, with an automatic
in-memory fallback for development and testing.  All functions are
``async`` so they can ``await`` the Redis helpers in ``redis_client.py``.
"""

from .redis_client import get_cart, set_cart, delete_cart, reset_carts

DELIVERY_FEE = 5.0


async def get_user_cart(user_id: int) -> dict:
    """Return the user's cart, creating an empty one if it doesn't exist."""
    cart = await get_cart(user_id)
    if not cart or "items" not in cart:
        return {"items": [], "promo_code": None, "discount": 0}
    return cart


async def clear_user_cart(user_id: int) -> None:
    """Reset the user's cart to an empty state."""
    await set_cart(user_id, {"items": [], "promo_code": None, "discount": 0})


async def save_user_cart(user_id: int, cart: dict) -> None:
    """Persist a modified cart back to storage."""
    await set_cart(user_id, cart)
