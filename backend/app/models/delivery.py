from sqlalchemy import (
    Column, Integer, Float, DateTime, Enum as SQLEnum, ForeignKey, JSON, Text, String
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from datetime import datetime, timezone
import uuid as uuid_mod

from ..database import Base


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(PG_UUID(as_uuid=True), unique=True, default=uuid_mod.uuid4, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), unique=True, nullable=False)
    delivery_person_id = Column(Integer, ForeignKey("users.id"))

    status = Column(
        SQLEnum("pending", "assigned", "in_progress", "delivered", "failed", name="delivery_status_enum"),
        default="pending",
        index=True,
    )

    # Tracking
    pickup_time = Column(DateTime)
    delivery_time = Column(DateTime)

    # Location
    current_latitude = Column(Float)
    current_longitude = Column(Float)
    location_history = Column(JSON, default=list)

    # Notes
    notes = Column(Text)
    signature_url = Column(String(255))

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    order = relationship("Order", back_populates="delivery")
    delivery_person = relationship("User", foreign_keys=[delivery_person_id])
