from sqlalchemy import (
    Column, ForeignKey, Integer, String, Text, Float, Boolean, DateTime, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from datetime import datetime, timezone
import uuid as uuid_mod

from ..database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(PG_UUID(as_uuid=True), unique=True, default=uuid_mod.uuid4, index=True)

    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text)

    # Pricing
    price_dt = Column(Float, nullable=False)
    cost_dt = Column(Float)

    # Inventory
    quantity_available = Column(Integer, default=0)
    quantity_reserved = Column(Integer, default=0)

    # Media
    image_url = Column(Text)
    images = Column(JSON, default=list)

    # Meta
    category = Column(String(100), index=True)
    tags = Column(JSON, default=list)
    is_active = Column(Boolean, default=True, index=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    order_items = relationship("OrderItem", back_populates="product")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), index=True)

    rating = Column(Integer, nullable=False)
    title = Column(String(255))
    comment = Column(Text)

    is_verified = Column(Boolean, default=False)
    helpful_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")
