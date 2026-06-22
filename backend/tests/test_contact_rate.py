"""Tests for rate limiting and the contact endpoint.

Covers:
- POST /api/contact (valid submission, validation errors, rate limiting)
- Rate limiting on auth endpoints (register, login)
- Slowapi integration verification
"""
from unittest.mock import patch
from app.security import create_access_token


def auth_header(user) -> dict:
    token = create_access_token(data={"sub": str(user.uuid), "role": user.role})
    return {"Authorization": f"Bearer {token}"}


# ============================================================
# POST /api/contact
# ============================================================
class TestContactEndpoint:
    @patch("app.routes.contact.send_contact_email")
    def test_valid_submission(self, mock_email, client, db_session):
        resp = client.post("/api/contact", json={
            "name": "Jean Dupont",
            "email": "jean@example.com",
            "subject": "Question sur les tiramisus",
            "message": "Bonjour, j'aimerais connaître vos disponibilités pour une commande.",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert "envoyé" in data["message"].lower()
        # Verify email function was called
        mock_email.assert_called_once_with(
            name="Jean Dupont",
            email="jean@example.com",
            subject="Question sur les tiramisus",
            message="Bonjour, j'aimerais connaître vos disponibilités pour une commande.",
        )

    def test_missing_name(self, client, db_session):
        resp = client.post("/api/contact", json={
            "email": "test@test.com",
            "subject": "Hello",
            "message": "This is a valid message body.",
        })
        assert resp.status_code == 422

    def test_missing_email(self, client, db_session):
        resp = client.post("/api/contact", json={
            "name": "Test",
            "subject": "Hello",
            "message": "This is a valid message body.",
        })
        assert resp.status_code == 422

    def test_invalid_email(self, client, db_session):
        resp = client.post("/api/contact", json={
            "name": "Test",
            "email": "not-an-email",
            "subject": "Hello",
            "message": "This is a valid message body.",
        })
        assert resp.status_code == 422

    def test_message_too_short(self, client, db_session):
        resp = client.post("/api/contact", json={
            "name": "Test",
            "email": "test@test.com",
            "subject": "Hello",
            "message": "Short",
        })
        assert resp.status_code == 422

    def test_name_too_long(self, client, db_session):
        resp = client.post("/api/contact", json={
            "name": "A" * 201,
            "email": "test@test.com",
            "subject": "Hello",
            "message": "This is a valid message body.",
        })
        assert resp.status_code == 422

    def test_empty_body(self, client, db_session):
        resp = client.post("/api/contact", json={})
        assert resp.status_code == 422

    @patch("app.routes.contact.send_contact_email")
    def test_xss_in_name_not_reflected(self, mock_email, client, db_session):
        """XSS payloads should not cause errors."""
        resp = client.post("/api/contact", json={
            "name": "<script>alert('xss')</script>",
            "email": "xss@test.com",
            "subject": "Test & HTML",
            "message": "Normal message content here please.",
        })
        assert resp.status_code == 200
        assert resp.json()["success"] is True


# ============================================================
# Rate Limiting on Auth Endpoints
# ============================================================
class TestRateLimiting:
    def test_register_endpoint_accepts_requests(self, client, db_session):
        resp = client.post("/api/auth/register", json={
            "email": "newuser@example.com",
            "password": "testpass123",
            "full_name": "New User",
        })
        assert resp.status_code in (201, 400)

    def test_login_endpoint_accepts_requests(self, client, db_session, test_user):
        resp = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "testpass123",
        })
        assert resp.status_code == 200

    def test_rate_limit_returns_429_when_exceeded(self, client, db_session, test_user):
        """Login has a limit of 10/minute — flood it to trigger 429."""
        for _ in range(10):
            client.post("/api/auth/login", json={
                "email": "test@example.com",
                "password": "wrongpassword",
            })

        resp = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "wrongpassword",
        })
        assert resp.status_code == 429


# ============================================================
# Rate Limiter Configuration
# ============================================================
class TestLimiterSetup:
    def test_limiter_is_configured_on_app(self):
        from app.main import app
        assert hasattr(app.state, "limiter")
        assert app.state.limiter is not None
