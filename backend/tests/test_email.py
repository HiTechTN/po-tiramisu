"""Tests for the email notification system.

Covers:
- send_contact_email
- send_order_confirmation
- send_order_shipped
- send_order_delivered
- send_payment_failed
- _send_email_sync (fallback when SMTP not configured)
"""
from unittest.mock import patch, MagicMock
import logging


class TestSendEmailSync:
    """Tests for the core _send_email_sync function."""

    def test_skips_send_when_smtp_not_configured(self, caplog):
        """Email should be logged (not sent) when SMTP credentials are missing."""
        from app.utils.email import _send_email_sync

        with caplog.at_level(logging.INFO):
            _send_email_sync("test@example.com", "Test Subject", "<h1>Hello</h1>")

        assert any("EMAIL SKIPPED" in record.message for record in caplog.records)
        assert any("test@example.com" in record.message for record in caplog.records)

    @patch("app.utils.email.get_settings")
    def test_builds_mime_message_correctly(self, mock_settings):
        """Email message should have correct headers and content."""
        mock_settings.return_value = MagicMock(
            SMTP_SERVER="smtp.test.com",
            SMTP_PORT=587,
            SMTP_USER="sender@test.com",
            SMTP_PASSWORD="password123",
            FRONTEND_URL="http://localhost:3000",
        )
        from app.utils.email import _send_email_sync

        mock_server = MagicMock()
        mock_server.__enter__ = MagicMock(return_value=mock_server)
        mock_server.__exit__ = MagicMock(return_value=False)

        with patch("app.utils.email.smtplib") as mock_smtp:
            mock_smtp.SMTP.return_value = mock_server

            _send_email_sync("recipient@test.com", "Subject Line", "<p>Body</p>")

            mock_server.login.assert_called_once_with("sender@test.com", "password123")
            mock_server.starttls.assert_called_once()
            call_args = mock_server.sendmail.call_args
            assert call_args[0][0] == "sender@test.com"
            assert call_args[0][1] == "recipient@test.com"

    @patch("app.utils.email.get_settings")
    def test_logs_error_on_send_failure(self, mock_settings, caplog):
        """Failed sends should log an error, not raise."""
        mock_settings.return_value = MagicMock(
            SMTP_SERVER="smtp.test.com",
            SMTP_PORT=587,
            SMTP_USER="sender@test.com",
            SMTP_PASSWORD="password123",
            FRONTEND_URL="http://localhost:3000",
        )
        from app.utils.email import _send_email_sync

        mock_server = MagicMock()
        mock_server.__enter__ = MagicMock(return_value=mock_server)
        mock_server.__exit__ = MagicMock(return_value=False)
        mock_server.sendmail.side_effect = Exception("Connection refused")

        with patch("app.utils.email.smtplib") as mock_smtp:
            mock_smtp.SMTP.return_value = mock_server

            with caplog.at_level(logging.ERROR):
                _send_email_sync("recipient@test.com", "Test", "<p>Hi</p>")

            assert any("Failed to send email" in record.message for record in caplog.records)

    @patch("app.utils.email.get_settings")
    def test_with_text_body(self, mock_settings):
        """Plain text body should be attached when provided."""
        mock_settings.return_value = MagicMock(
            SMTP_SERVER="smtp.test.com", SMTP_PORT=587,
            SMTP_USER="sender@test.com", SMTP_PASSWORD="pass",
            FRONTEND_URL="http://localhost:3000",
        )
        from app.utils.email import _send_email_sync

        mock_server = MagicMock()
        mock_server.__enter__ = MagicMock(return_value=mock_server)
        mock_server.__exit__ = MagicMock(return_value=False)

        with patch("app.utils.email.smtplib") as mock_smtp:
            mock_smtp.SMTP.return_value = mock_server

            _send_email_sync("to@test.com", "Subject", "<p>HTML</p>", text_body="Plain text")

            call_args = mock_server.sendmail.call_args
            assert call_args is not None


class TestSendContactEmail:
    """Tests for the contact form email function."""

    @patch("app.utils.email.asyncio")
    def test_delegates_to_run_in_executor(self, mock_asyncio):
        """send_contact_email should schedule via run_in_executor."""
        from app.utils.email import send_contact_email

        send_contact_email(
            name="Jean Dupont",
            email="jean@example.com",
            subject="Question",
            message="Bonjour, j'ai une question sur vos tiramisus.",
        )
        mock_asyncio.get_running_loop.return_value.run_in_executor.assert_called_once()
        call_args = mock_asyncio.get_running_loop.return_value.run_in_executor.call_args
        # args: (executor, func, to_email, subject, html)
        assert call_args[0][2] == "contact@po-tiramisu.tn"  # admin email recipient

    @patch("app.utils.email.asyncio")
    def test_html_escaping_in_template(self, mock_asyncio):
        """User input should be HTML-escaped in the email body."""
        from app.utils.email import send_contact_email

        send_contact_email(
            name="<script>alert('xss')</script>",
            email="hacker@evil.com",
            subject="Test & <b>Bold</b>",
            message="Normal message content here please.",
        )
        # Get the HTML body passed to run_in_executor
        call_args = mock_asyncio.get_running_loop.return_value.run_in_executor.call_args
        html_body = call_args[0][4]  # 5th positional arg is the HTML body
        # XSS payloads should be escaped
        assert "<script>" not in html_body
        assert "&lt;script&gt;" in html_body
        assert "&amp;" in html_body


class TestOrderEmails:
    """Tests for order lifecycle email functions."""

    @patch("app.utils.email.asyncio")
    def test_order_confirmation(self, mock_asyncio):
        from app.utils.email import send_order_confirmation
        send_order_confirmation("user@test.com", "Alice", 42, 95.0)
        mock_asyncio.get_running_loop.return_value.run_in_executor.assert_called_once()
        call_args = mock_asyncio.get_running_loop.return_value.run_in_executor.call_args
        assert call_args[0][2] == "user@test.com"  # to_email
        # Check HTML contains order info
        html = call_args[0][4]
        assert "#42" in html
        assert "95.00" in html

    @patch("app.utils.email.asyncio")
    def test_order_shipped(self, mock_asyncio):
        from app.utils.email import send_order_shipped
        send_order_shipped("user@test.com", "Alice", 42)
        mock_asyncio.get_running_loop.return_value.run_in_executor.assert_called_once()
        call_args = mock_asyncio.get_running_loop.return_value.run_in_executor.call_args
        assert call_args[0][2] == "user@test.com"

    @patch("app.utils.email.asyncio")
    def test_order_delivered(self, mock_asyncio):
        from app.utils.email import send_order_delivered
        send_order_delivered("user@test.com", "Alice", 42)
        mock_asyncio.get_running_loop.return_value.run_in_executor.assert_called_once()
        call_args = mock_asyncio.get_running_loop.return_value.run_in_executor.call_args
        assert call_args[0][2] == "user@test.com"

    @patch("app.utils.email.asyncio")
    def test_payment_failed(self, mock_asyncio):
        from app.utils.email import send_payment_failed
        send_payment_failed("user@test.com", "Alice", 42)
        mock_asyncio.get_running_loop.return_value.run_in_executor.assert_called_once()
        call_args = mock_asyncio.get_running_loop.return_value.run_in_executor.call_args
        assert call_args[0][2] == "user@test.com"
