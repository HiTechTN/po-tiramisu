from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Enum as SQLEnum,
    ForeignKey, JSON, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from datetime import datetime, timezone
import uuid as uuid_mod

from ..database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(PG_UUID(as_uuid=True), unique=True, default=uuid_mod.uuid4, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Status
    status = Column(
        SQLEnum("pending", "confirmed", "preparing", "ready", "shipped", "delivered", "cancelled", name="order_status_enum"),
        default="pending",
        index=True,
    )
    payment_status = Column(
        SQLEnum("pending", "completed", "failed", name="order_payment_status_enum"),
        default="pending",
        index=True,
    )

    # Pricing
    subtotal_dt = Column(Float, nullable=False)
    delivery_fee_dt = Column(Float, default=0)
    discount_dt = Column(Float, default=0)
    total_dt = Column(Float, nullable=False)

    # Delivery
    delivery_address_id = Column(Integer, ForeignKey("addresses.id"))
    delivery_date = Column(DateTime)
    delivery_notes = Column(Text)

    # Payment
    payment_method = Column(
        SQLEnum("flouci", "paymee", "cash", name="payment_method_enum"),
        default="flouci",
    )
    payment_ref = Column(String(100))

    # Tracking
    estimated_delivery = Column(DateTime)
    actual_delivery = Column(DateTime)

    # Meta
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    delivery = relationship("Delivery", back_populates="order", uselist=False)
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
    delivery_address = relationship("Address", foreign_keys=[delivery_address_id])


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)

    quantity = Column(Integer, nullable=False)
    unit_price_dt = Column(Float, nullable=False)
    total_price_dt = Column(Float, nullable=False)

    # Snapshot of product at order time
    product_snapshot = Column(JSON)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
