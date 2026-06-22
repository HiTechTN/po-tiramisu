from sqlalchemy import (
    Column, Integer, Float, DateTime, Enum as SQLEnum, ForeignKey, JSON, String, Text, Boolean
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from datetime import datetime, timezone
import uuid as uuid_mod

from ..database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(PG_UUID(as_uuid=True), unique=True, default=uuid_mod.uuid4, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    amount_dt = Column(Float, nullable=False)
    currency = Column(String(3), default="TND")

    provider = Column(SQLEnum("flouci", "paymee", name="payment_provider_enum"), nullable=False)
    provider_reference = Column(String(255))

    status = Column(
        SQLEnum("pending", "completed", "failed", "refunded", name="payment_status_enum"),
        default="pending",
        index=True,
    )

    metadata_json = Column("metadata", JSON)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime)

    # Relationships
    order = relationship("Order", back_populates="payments")


class PromoCode(Base):
    __tablename__ = "promo_codes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)

    discount_percent = Column(Integer)
    discount_fixed_dt = Column(Float)

    valid_from = Column(DateTime)
    valid_until = Column(DateTime)

    max_uses = Column(Integer)
    uses_count = Column(Integer, default=0)

    min_order_dt = Column(Float)
    applicable_products = Column(JSON)

    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    type = Column(
        SQLEnum("order", "delivery", "promotion", "system", name="notification_type_enum"),
        default="system",
    )
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)

    is_read = Column(Boolean, default=False)
    action_url = Column(Text)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="notifications")
