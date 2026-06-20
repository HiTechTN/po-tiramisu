from sqlalchemy.orm import Session
from typing import Optional
from ..models.payment import Payment, PromoCode
from datetime import datetime, timezone


def create_payment(
    db: Session, order_id: int, user_id: int, amount: float, provider: str
) -> Payment:
    payment = Payment(
        order_id=order_id,
        user_id=user_id,
        amount_dt=amount,
        provider=provider,
        status="pending",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def complete_payment(db: Session, payment: Payment, reference: str = None) -> Payment:
    payment.status = "completed"
    payment.provider_reference = reference
    payment.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(payment)
    return payment


def fail_payment(db: Session, payment: Payment, reference: str = None) -> Payment:
    payment.status = "failed"
    payment.provider_reference = reference
    db.commit()
    db.refresh(payment)
    return payment


def get_payment_by_order_id(db: Session, order_id: int) -> Optional[Payment]:
    return db.query(Payment).filter(Payment.order_id == order_id).first()


def get_payments_by_order_id(db: Session, order_id: int):
    return db.query(Payment).filter(Payment.order_id == order_id).all()


# ---- Promo Codes ----
def get_promo_by_code(db: Session, code: str) -> Optional[PromoCode]:
    return db.query(PromoCode).filter(PromoCode.code == code.upper(), PromoCode.is_active == True).first()


def validate_promo_code(db: Session, code: str, order_total: float = 0):
    from datetime import timezone as _tz
    promo = get_promo_by_code(db, code)
    if not promo:
        return None, "Code promo invalide"

    now = datetime.now(_tz.utc)
    # Ensure promo datetimes are timezone-aware for comparison
    vf = promo.valid_from
    vu = promo.valid_until
    if vf and vf.tzinfo is None:
        vf = vf.replace(tzinfo=_tz.utc)
    if vu and vu.tzinfo is None:
        vu = vu.replace(tzinfo=_tz.utc)
    if vf and now < vf:
        return None, "Code promo pas encore actif"
    if vu and now > vu:
        return None, "Code promo expiré"
    if promo.max_uses and promo.uses_count >= promo.max_uses:
        return None, "Code promo épuisé"
    if promo.min_order_dt and order_total < promo.min_order_dt:
        return None, f"Montant minimum: {promo.min_order_dt} DT"

    return promo, None


def apply_promo_code(db: Session, promo: PromoCode, order_total: float) -> float:
    if promo.discount_percent:
        return order_total * (promo.discount_percent / 100)
    elif promo.discount_fixed_dt:
        return min(promo.discount_fixed_dt, order_total)
    return 0


def increment_promo_usage(db: Session, promo: PromoCode):
    promo.uses_count += 1
    db.commit()
