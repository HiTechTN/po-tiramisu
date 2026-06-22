"""
Email notification utility for transactional emails.

When SMTP is not configured (missing credentials), emails are logged
instead of being sent, so the application works in development.
"""

import smtplib
import asyncio
import logging
from html import escape
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from ..config import get_settings

logger = logging.getLogger(__name__)


def _send_email_sync(to_email: str, subject: str, html_body: str, text_body: Optional[str] = None):
    """Synchronous SMTP send (called from a thread)."""
    settings = get_settings()

    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.info("[EMAIL SKIPPED - SMTP not configured] To: %s | Subject: %s", to_email, subject)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Po_Tiramisu <{settings.SMTP_USER}>"
    msg["To"] = to_email

    if text_body:
        msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
        logger.info("Email sent to %s: %s", to_email, subject)
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to_email, exc)


# ── Contact Form Email ─────────────────────────────────────────

def send_contact_email(name: str, email: str, subject: str, message: str):
    """Send a contact form message to the admin email."""
    settings = get_settings()
    admin_email = settings.SMTP_USER or "contact@po-tiramisu.tn"

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #c94a39; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">🍰 Nouveau message de contact</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
            <h2 style="color: #111827;">{escape(subject)}</h2>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <p style="margin: 5px 0; color: #6b7280;"><strong>Nom:</strong> {escape(name)}</p>
                <p style="margin: 5px 0; color: #6b7280;"><strong>Email:</strong> <a href="mailto:{escape(email)}">{escape(email)}</a></p>
            </div>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #374151; white-space: pre-wrap;">{escape(message)}</p>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">Message envoyé via le formulaire de contact de po-tiramisu.tn</p>
        </div>
    </div>
    """
    asyncio.get_running_loop().run_in_executor(
        None, _send_email_sync, admin_email, f"[Contact] {subject} — {name}", html
    )


# ── Order Emails ────────────────────────────────────────────────

def send_order_confirmation(to_email: str, user_name: str, order_id: int, total: float):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #c94a39; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">🍰 Po_Tiramisu</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
            <h2 style="color: #111827;">Commande confirmée !</h2>
            <p style="color: #4b5563;">Bonjour {user_name},</p>
            <p style="color: #4b5563;">Votre commande <strong>#{order_id}</strong> a été reçue avec succès.</p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <p style="margin: 5px 0; color: #6b7280;">Numéro de commande: <strong>#{order_id}</strong></p>
                <p style="margin: 5px 0; color: #6b7280;">Montant total: <strong>{total:.2f} DT</strong></p>
            </div>
            <p style="color: #4b5563;">Nous préparons votre commande et vous tiendrons informé de son avancement.</p>
            <a href="{settings.FRONTEND_URL}/orders/{order_id}" style="display: inline-block; background: #c94a39; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 15px;">Suivre ma commande</a>
        </div>
        <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
            <p>Po_Tiramisu - Tiramisus artisanaux faits avec amour à Tunis</p>
        </div>
    </div>
    """
    asyncio.get_running_loop().run_in_executor(None, _send_email_sync, to_email, f"Commande #{order_id} confirmée - Po_Tiramisu", html)


def send_order_shipped(to_email: str, user_name: str, order_id: int):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #c94a39; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">🍰 Po_Tiramisu</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
            <h2 style="color: #111827;">Votre commande est en livraison ! 🚚</h2>
            <p style="color: #4b5563;">Bonjour {user_name},</p>
            <p style="color: #4b5563;">Votre commande <strong>#{order_id}</strong> est en route vers vous.</p>
            <a href="{settings.FRONTEND_URL}/orders/{order_id}" style="display: inline-block; background: #c94a39; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 15px;">Suivre en temps réel</a>
        </div>
        <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
            <p>Po_Tiramisu - Tiramisus artisanaux faits avec amour à Tunis</p>
        </div>
    </div>
    """
    asyncio.get_running_loop().run_in_executor(None, _send_email_sync, to_email, f"Commande #{order_id} en livraison - Po_Tiramisu", html)


def send_order_delivered(to_email: str, user_name: str, order_id: int):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #c94a39; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">🍰 Po_Tiramisu</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
            <h2 style="color: #111827;">Livraison complétée ! ✅</h2>
            <p style="color: #4b5563;">Bonjour {user_name},</p>
            <p style="color: #4b5563;">Votre commande <strong>#{order_id}</strong> a été livrée avec succès.</p>
            <p style="color: #4b5563;">Nous espérons que vous apprécierez vos tiramisus ! N'hésitez pas à laisser un avis.</p>
            <a href="{settings.FRONTEND_URL}/orders/{order_id}" style="display: inline-block; background: #c94a39; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 15px;">Laisser un avis</a>
        </div>
        <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
            <p>Po_Tiramisu - Tiramisus artisanaux faits avec amour à Tunis</p>
        </div>
    </div>
    """
    asyncio.get_running_loop().run_in_executor(None, _send_email_sync, to_email, f"Commande #{order_id} livrée - Po_Tiramisu", html)


def send_payment_failed(to_email: str, user_name: str, order_id: int):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #c94a39; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">🍰 Po_Tiramisu</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
            <h2 style="color: #111827;">Paiement échoué ❌</h2>
            <p style="color: #4b5563;">Bonjour {user_name},</p>
            <p style="color: #4b5563;">Le paiement de votre commande <strong>#{order_id}</strong> a échoué.</p>
            <p style="color: #4b5563;">Vous pouvez réessayer le paiement depuis votre espace client.</p>
            <a href="{settings.FRONTEND_URL}/orders/{order_id}" style="display: inline-block; background: #c94a39; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 15px;">Réessayer le paiement</a>
        </div>
        <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
            <p>Po_Tiramisu - Tiramisus artisanaux faits avec amour à Tunis</p>
        </div>
    </div>
    """
    asyncio.get_running_loop().run_in_executor(None, _send_email_sync, to_email, f"Paiement échoué - Commande #{order_id} - Po_Tiramisu", html)
