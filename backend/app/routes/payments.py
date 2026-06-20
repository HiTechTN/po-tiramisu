from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
import httpx

from ..database import get_db
from ..security import get_current_user
from ..schemas.payment import PaymentInitRequest, PaymentInitResponse, PaymentStatusResponse
from ..crud.payment import create_payment, complete_payment, fail_payment, get_payment_by_order_id
from ..crud.order import get_order_by_id, update_order_payment_status
from ..config import get_settings

router = APIRouter(prefix="/api/payments", tags=["payments"])
settings = get_settings()


@router.post("/flouci/init", response_model=PaymentInitResponse)
async def init_flouci_payment(
    body: PaymentInitRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = get_order_by_id(db, body.order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.payment_status == "completed":
        raise HTTPException(status_code=400, detail="Order already paid")

    # Create payment record
    payment = create_payment(db, order.id, current_user.id, body.amount_dt, "flouci")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.FLOUCI_API_URL}/v1/payment",
                headers={"Authorization": f"Bearer {settings.FLOUCI_API_KEY}"},
                json={
                    "amount": body.amount_dt,
                    "currency": "TND",
                    "customer": {
                        "email": current_user.email,
                        "phone": current_user.phone,
                        "name": current_user.full_name,
                    },
                    "order_id": str(order.id),
                    "reference": str(payment.id),
                },
                timeout=10.0,
            )

            if response.status_code == 201:
                data = response.json()
                return PaymentInitResponse(
                    payment_url=data.get("payment_url", data.get("result", {}).get("link", "")),
                    session_id=data.get("session_id"),
                )
    except Exception:
        pass

    # Fallback: return mock payment URL for development
    return PaymentInitResponse(
        payment_url=f"{settings.FRONTEND_URL}/orders/{order.id}?payment=demo",
        session_id=f"demo_{payment.id}",
    )


@router.post("/flouci/callback")
async def flouci_callback(request: Request, db: Session = Depends(get_db)):
    """Webhook from Flouci on payment completion."""
    body = await request.json()
    order_id = body.get("order_id")
    session_id = body.get("session_id")
    pay_status = body.get("status")
    reference = body.get("reference")

    if not order_id:
        raise HTTPException(status_code=400, detail="Missing order_id")

    order = get_order_by_id(db, int(order_id))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    payment = get_payment_by_order_id(db, order.id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if pay_status == "success":
        complete_payment(db, payment, reference)
        update_order_payment_status(db, order, "completed")
    else:
        fail_payment(db, payment, reference)
        update_order_payment_status(db, order, "failed")

    return {"success": True, "message": "Webhook processed"}


@router.post("/demo-complete/{order_id}")
async def demo_complete_payment(
    order_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Demo endpoint to simulate successful payment (dev only)."""
    if settings.ENVIRONMENT == "production":
        raise HTTPException(status_code=404, detail="Not available in production")

    order = get_order_by_id(db, order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")

    payment = get_payment_by_order_id(db, order.id)
    if payment and payment.status == "pending":
        complete_payment(db, payment, f"DEMO-{payment.id}")
        update_order_payment_status(db, order, "completed")

    return {"success": True, "message": "Payment simulated successfully"}


@router.get("/{order_id}/status", response_model=PaymentStatusResponse)
async def get_payment_status(
    order_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = get_order_by_id(db, order_id)
    if not order or (order.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="Order not found")

    payment = get_payment_by_order_id(db, order.id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    return PaymentStatusResponse(
        order_id=order.id,
        status=payment.status,
        amount=payment.amount_dt,
        reference=payment.provider_reference,
        provider=payment.provider,
        completed_at=payment.completed_at,
    )
