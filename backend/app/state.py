"""
Shared in-memory state for the application.

In production, this should be replaced with Redis or a database-backed store.
For now, this module ensures all routes share the same cart data.
"""

# In-memory cart per user (user_id -> cart dict)
# Cart storage will now use Redis instead of in-memory dictionary.
# The Redis key pattern is ``cart:{user_id}``. The value will be a JSON string representing the cart structure.
# Example value: {
#   "items": [...],
#   "promo_code": null,
#   "discount": 0.0
# }
# This module provides helper functions to interact with Redis.

# Import the Redis client lazily to avoid creating a connection at import time.
from .redis_client import get_redis_client


DELIVERY_FEE = 5.0


def get_user_cart(user_id: int) -> dict:
    """Get or create a cart for the given user."""
    if user_id not in _user_carts:
        _user_carts[user_id] = {"items": [], "promo_code": None, "discount": 0}
    return _user_carts[user_id]


def clear_user_cart(user_id: int) -> None:
    """Clear a user's cart."""
    _user_carts[user_id] = {"items": [], "promo_code": None, "discount": 0}
