"""
Shared in-memory state for the application.

In production, replace the in-memory dict with Redis (see redis_client.py).
For now, this module ensures all routes share the same cart data.
"""

DELIVERY_FEE = 5.0

# In-memory cart per user (user_id -> cart dict)
_user_carts: dict[int, dict] = {}


def get_user_cart(user_id: int) -> dict:
    """Get or create a cart for the given user."""
    if user_id not in _user_carts:
        _user_carts[user_id] = {"items": [], "promo_code": None, "discount": 0}
    return _user_carts[user_id]


def clear_user_cart(user_id: int) -> None:
    """Clear a user's cart."""
    _user_carts[user_id] = {"items": [], "promo_code": None, "discount": 0}
