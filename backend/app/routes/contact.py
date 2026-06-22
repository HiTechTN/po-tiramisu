from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field

from ..utils.email import send_contact_email
from ..limiter import limiter

router = APIRouter(prefix="/api", tags=["contact"])


class ContactForm(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    subject: str = Field(..., min_length=1, max_length=300)
    message: str = Field(..., min_length=10, max_length=5000)


@router.post("/contact")
@limiter.limit("3/minute")
async def submit_contact_form(body: ContactForm):
    """Accept a contact form submission and email it to the admin."""
    send_contact_email(
        name=body.name,
        email=body.email,
        subject=body.subject,
        message=body.message,
    )
    return {"success": True, "message": "Votre message a été envoyé. Nous vous répondrons bientôt."}
