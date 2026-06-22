"""Unit tests for app.state cart functions (async).

Tests the async cart storage layer independently of the API:
- get_user_cart: returns existing cart, creates new cart, isolation between users
- clear_user_cart: resets cart to empty, is idempotent
- DELIVERY_FEE constant
"""

import pytest
from app.state import get_user_cart, clear_user_cart, DELIVERY_FEE


class TestDeliveryFee:
    def test_delivery_fee_value(self):
        assert DELIVERY_FEE == 5.0

    def test_delivery_fee_is_float(self):
        assert isinstance(DELIVERY_FEE, float)


@pytest.mark.asyncio
class TestGetUserCart:
    async def test_creates_new_cart_for_new_user(self):
        cart = await get_user_cart(9999)
        assert cart == {"items": [], "promo_code": None, "discount": 0}
        assert cart["items"] == []

    async def test_returns_cart_with_items(self):
        cart = await get_user_cart(1)
        cart["items"].append({"product_id": 10, "quantity": 2})
        retrieved = await get_user_cart(1)
        assert len(retrieved["items"]) == 1
        assert retrieved["items"][0]["product_id"] == 10

    async def test_different_users_get_separate_carts(self):
        cart_a = await get_user_cart(1)
        cart_a["items"].append({"product_id": 10, "quantity": 1})

        cart_b = await get_user_cart(2)
        assert cart_b["items"] == []

    async def test_cart_starts_with_promo_code_none(self):
        cart = await get_user_cart(3)
        assert cart["promo_code"] is None

    async def test_cart_starts_with_zero_discount(self):
        cart = await get_user_cart(4)
        assert cart["discount"] == 0

    async def test_cart_is_mutable(self):
        cart = await get_user_cart(5)
        cart["promo_code"] = "SUMMER"
        cart["discount"] = 10.0
        cart["items"].append({"product_id": 1, "quantity": 3})

        retrieved = await get_user_cart(5)
        assert retrieved["promo_code"] == "SUMMER"
        assert retrieved["discount"] == 10.0
        assert len(retrieved["items"]) == 1

    async def test_user_id_zero(self):
        cart = await get_user_cart(0)
        assert cart == {"items": [], "promo_code": None, "discount": 0}

    async def test_large_user_id(self):
        cart = await get_user_cart(999_999)
        assert isinstance(cart, dict)
        assert "items" in cart


@pytest.mark.asyncio
class TestClearUserCart:
    async def test_clears_existing_cart(self):
        cart = await get_user_cart(10)
        cart["items"].append({"product_id": 1, "quantity": 5})
        cart["promo_code"] = "CODE"
        cart["discount"] = 15.0

        await clear_user_cart(10)

        cleared = await get_user_cart(10)
        assert cleared["items"] == []
        assert cleared["promo_code"] is None
        assert cleared["discount"] == 0

    async def test_clear_is_idempotent(self):
        await clear_user_cart(20)
        cart = await get_user_cart(20)
        assert cart["items"] == []

        await clear_user_cart(20)
        cart = await get_user_cart(20)
        assert cart["items"] == []

    async def test_clear_does_not_affect_other_users(self):
        cart_a = await get_user_cart(30)
        cart_a["items"].append({"product_id": 1, "quantity": 2})

        await clear_user_cart(31)  # different user

        cart_a_after = await get_user_cart(30)
        assert len(cart_a_after["items"]) == 1

    async def test_clear_then_add_works(self):
        await clear_user_cart(40)

        cart = await get_user_cart(40)
        cart["items"].append({"product_id": 5, "quantity": 1})

        assert len(cart["items"]) == 1
        assert cart["items"][0]["product_id"] == 5

    async def test_clear_nonexistent_user_is_safe(self):
        await clear_user_cart(77777)
        cart = await get_user_cart(77777)
        assert cart["items"] == []
