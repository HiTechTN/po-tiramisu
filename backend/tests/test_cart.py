"""Tests for Cart API endpoints.

Covers:
- GET /api/cart (empty cart, cart with items)
- POST /api/cart/add (add item, duplicate add, insufficient stock, inactive product)
- PUT /api/cart/update?product_id=X&quantity=Y (update qty, remove via qty=0, nonexistent item)
- DELETE /api/cart/remove/{product_id}
- DELETE /api/cart/clear
- POST /api/cart/apply-promo (valid, expired, nonexistent codes)
"""
from app.security import create_access_token


def auth_header(user) -> dict:
    token = create_access_token(data={"sub": str(user.uuid), "role": user.role})
    return {"Authorization": f"Bearer {token}"}


# ============================================================
# GET /api/cart
# ============================================================
class TestGetCart:
    def test_empty_cart(self, client, test_user):
        resp = client.get("/api/cart", headers=auth_header(test_user))
        assert resp.status_code == 200
        data = resp.json()
        assert data["items"] == []
        assert data["subtotal_dt"] == 0
        assert data["total_dt"] == 0

    def test_cart_with_items(self, client, test_user, test_product):
        # Add item first
        client.post(
            "/api/cart/add",
            json={"product_id": test_product.id, "quantity": 2},
            headers=auth_header(test_user),
        )
        resp = client.get("/api/cart", headers=auth_header(test_user))
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["product_id"] == test_product.id
        assert data["items"][0]["quantity"] == 2
        assert data["subtotal_dt"] == 90.0  # 45 * 2
        assert data["delivery_fee_dt"] == 5.0
        assert data["total_dt"] == 95.0

    def test_unauthenticated(self, client):
        resp = client.get("/api/cart", headers={"Authorization": "Bearer invalid-token"})
        assert resp.status_code == 401


# ============================================================
# POST /api/cart/add
# ============================================================
class TestAddToCart:
    def test_add_new_item(self, client, test_user, test_product):
        resp = client.post(
            "/api/cart/add",
            json={"product_id": test_product.id, "quantity": 1},
            headers=auth_header(test_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["product_id"] == test_product.id
        assert data["items"][0]["quantity"] == 1
        assert data["subtotal_dt"] == 45.0

    def test_add_duplicate_item_merges(self, client, test_user, test_product):
        client.post(
            "/api/cart/add",
            json={"product_id": test_product.id, "quantity": 1},
            headers=auth_header(test_user),
        )
        resp = client.post(
            "/api/cart/add",
            json={"product_id": test_product.id, "quantity": 2},
            headers=auth_header(test_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["quantity"] == 3  # 1 + 2

    def test_add_multiple_products(self, client, test_user, test_product, test_product_2):
        client.post(
            "/api/cart/add",
            json={"product_id": test_product.id, "quantity": 1},
            headers=auth_header(test_user),
        )
        resp = client.post(
            "/api/cart/add",
            json={"product_id": test_product_2.id, "quantity": 2},
            headers=auth_header(test_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["items"]) == 2
        assert data["subtotal_dt"] == 145.0  # 45 + (50 * 2)

    def test_nonexistent_product(self, client, test_user):
        resp = client.post(
            "/api/cart/add",
            json={"product_id": 99999, "quantity": 1},
            headers=auth_header(test_user),
        )
        assert resp.status_code == 404

    def test_inactive_product(self, client, test_user, inactive_product):
        resp = client.post(
            "/api/cart/add",
            json={"product_id": inactive_product.id, "quantity": 1},
            headers=auth_header(test_user),
        )
        assert resp.status_code == 404

    def test_insufficient_stock(self, client, test_user, test_product):
        resp = client.post(
            "/api/cart/add",
            json={"product_id": test_product.id, "quantity": 100},
            headers=auth_header(test_user),
        )
        assert resp.status_code == 400
        assert "Insufficient stock" in resp.json()["detail"]


# ============================================================
# PUT /api/cart/update?product_id=X&quantity=Y
# ============================================================
class TestUpdateCartItem:
    def test_update_quantity(self, client, test_user, test_product):
        # Add item first
        client.post(
            "/api/cart/add",
            json={"product_id": test_product.id, "quantity": 1},
            headers=auth_header(test_user),
        )
        # Update via query params
        resp = client.put(
            f"/api/cart/update?product_id={test_product.id}&quantity=5",
            headers=auth_header(test_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["quantity"] == 5
        assert data["subtotal_dt"] == 225.0  # 45 * 5

    def test_update_removes_when_quantity_zero(self, client, test_user, test_product):
        client.post(
            "/api/cart/add",
            json={"product_id": test_product.id, "quantity": 2},
            headers=auth_header(test_user),
        )
        resp = client.put(
            f"/api/cart/update?product_id={test_product.id}&quantity=0",
            headers=auth_header(test_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["items"]) == 0
        assert data["subtotal_dt"] == 0

    def test_update_nonexistent_item(self, client, test_user):
        resp = client.put(
            "/api/cart/update?product_id=99999&quantity=5",
            headers=auth_header(test_user),
        )
        assert resp.status_code == 404

    def test_update_requires_query_params(self, client, test_user):
        # Missing product_id and quantity
        resp = client.put(
            "/api/cart/update",
            headers=auth_header(test_user),
        )
        assert resp.status_code == 422  # Unprocessable Entity

    def test_update_requires_quantity_param(self, client, test_user, test_product):
        # Missing quantity
        resp = client.put(
            f"/api/cart/update?product_id={test_product.id}",
            headers=auth_header(test_user),
        )
        assert resp.status_code == 422

    def test_update_requires_product_id_param(self, client, test_user, test_product):
        # Missing product_id
        resp = client.put(
            f"/api/cart/update?quantity=5",
            headers=auth_header(test_user),
        )
        assert resp.status_code == 422

    def test_unauthenticated_update(self, client):
        resp = client.put("/api/cart/update?product_id=1&quantity=5", headers={"Authorization": "Bearer invalid-token"})
        assert resp.status_code == 401


# ============================================================
# DELETE /api/cart/remove/{product_id}
# ============================================================
class TestRemoveFromCart:
    def test_remove_item(self, client, test_user, test_product):
        client.post(
            "/api/cart/add",
            json={"product_id": test_product.id, "quantity": 2},
            headers=auth_header(test_user),
        )
        resp = client.delete(
            f"/api/cart/remove/{test_product.id}",
            headers=auth_header(test_user),
        )
        assert resp.status_code == 204

        # Verify empty
        cart_resp = client.get("/api/cart", headers=auth_header(test_user))
        assert len(cart_resp.json()["items"]) == 0

    def test_remove_nonexistent_item(self, client, test_user):
        resp = client.delete(
            "/api/cart/remove/99999",
            headers=auth_header(test_user),
        )
        assert resp.status_code == 204  # Idempotent

    def test_remove_one_item_keeps_others(self, client, test_user, test_product, test_product_2):
        client.post(
            "/api/cart/add",
            json={"product_id": test_product.id, "quantity": 1},
            headers=auth_header(test_user),
        )
        client.post(
            "/api/cart/add",
            json={"product_id": test_product_2.id, "quantity": 1},
            headers=auth_header(test_user),
        )
        resp = client.delete(
            f"/api/cart/remove/{test_product.id}",
            headers=auth_header(test_user),
        )
        assert resp.status_code == 204

        cart_resp = client.get("/api/cart", headers=auth_header(test_user))
        assert len(cart_resp.json()["items"]) == 1
        assert cart_resp.json()["items"][0]["product_id"] == test_product_2.id


# ============================================================
# DELETE /api/cart/clear
# ============================================================
class TestClearCart:
    def test_clear_cart(self, client, test_user, test_product):
        client.post(
            "/api/cart/add",
            json={"product_id": test_product.id, "quantity": 3},
            headers=auth_header(test_user),
        )
        resp = client.delete("/api/cart/clear", headers=auth_header(test_user))
        assert resp.status_code == 204

        # Verify empty
        cart_resp = client.get("/api/cart", headers=auth_header(test_user))
        assert len(cart_resp.json()["items"]) == 0
        assert cart_resp.json()["subtotal_dt"] == 0

    def test_clear_empty_cart(self, client, test_user):
        resp = client.delete("/api/cart/clear", headers=auth_header(test_user))
        assert resp.status_code == 204


# ============================================================
# POST /api/cart/apply-promo
# ============================================================
class TestApplyPromo:
    def test_valid_promo_code(self, client, test_user, test_product, valid_promo):
        # Add item to cart first
        client.post(
            "/api/cart/add",
            json={"product_id": test_product.id, "quantity": 2},
            headers=auth_header(test_user),
        )
        resp = client.post(
            "/api/cart/apply-promo",
            json={"promo_code": "TESTPROMO"},
            headers=auth_header(test_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["discount_dt"] > 0
        assert data["new_total_dt"] > 0

    def test_nonexistent_promo_code(self, client, test_user, test_product):
        client.post(
            "/api/cart/add",
            json={"product_id": test_product.id, "quantity": 1},
            headers=auth_header(test_user),
        )
        resp = client.post(
            "/api/cart/apply-promo",
            json={"promo_code": "DOESNOTEXIST"},
            headers=auth_header(test_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is False
        assert "invalide" in data["message"].lower()

    def test_expired_promo_code(self, client, test_user, test_product, expired_promo):
        client.post(
            "/api/cart/add",
            json={"product_id": test_product.id, "quantity": 1},
            headers=auth_header(test_user),
        )
        resp = client.post(
            "/api/cart/apply-promo",
            json={"promo_code": "EXPIRED"},
            headers=auth_header(test_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is False
        assert "expiré" in data["message"].lower()

    def test_promo_on_empty_cart(self, client, test_user, valid_promo):
        resp = client.post(
            "/api/cart/apply-promo",
            json={"promo_code": "TESTPROMO"},
            headers=auth_header(test_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is False

    def test_promo_case_insensitive(self, client, test_user, test_product, valid_promo):
        client.post(
            "/api/cart/add",
            json={"product_id": test_product.id, "quantity": 2},
            headers=auth_header(test_user),
        )
        resp = client.post(
            "/api/cart/apply-promo",
            json={"promo_code": "testpromo"},
            headers=auth_header(test_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
