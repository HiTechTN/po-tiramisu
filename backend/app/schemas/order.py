from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID


# ---- Cart ----
class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


class CartItemResponse(BaseModel):
    product_id: int
    product_name: str
    product_image: Optional[str] = None
    quantity: int
    unit_price_dt: float
    total_price_dt: float
    in_stock: bool = True


class CartResponse(BaseModel):
    user_id: int
    items: List[CartItemResponse]
    subtotal_dt: float
    delivery_fee_dt: float
    discount_dt: float
    total_dt: float
    promo_code: Optional[str] = None


class PromoCodeApply(BaseModel):
    promo_code: str


class PromoCodeResponse(BaseModel):
    success: bool
    message: str
    discount_dt: float = 0
    new_total_dt: float = 0


# ---- Order ----
class OrderCreate(BaseModel):
    address_id: int
    payment_method: str = Field(default="flouci", pattern="^(flouci|paymee|cash)$")
    delivery_date: Optional[str] = None
    notes: Optional[str] = None
    promo_code: Optional[str] = None


class OrderItemResponse(BaseModel):
    product_id: int
    product_name: str
    product_image: Optional[str] = None
    quantity: int
    unit_price_dt: float
    total_price_dt: float

    class Config:
        from_attributes = True


class OrderTimelineItem(BaseModel):
    status: str
    timestamp: datetime
    message: str


class DeliveryInfoResponse(BaseModel):
    id: int
    uuid: UUID
    status: str
    delivery_person_name: Optional[str] = None
    delivery_person_phone: Optional[str] = None
    current_location: Optional[dict] = None
    estimated_delivery: Optional[datetime] = None
    location_history: List[dict] = []

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    uuid: UUID
    user_id: int
    status: str
    payment_status: str
    subtotal_dt: float
    delivery_fee_dt: float
    discount_dt: float
    total_dt: float
    items: List[OrderItemResponse] = []
    delivery_address: Optional[dict] = None
    delivery_notes: Optional[str] = None
    payment_method: Optional[str] = None
    payment_ref: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    actual_delivery: Optional[datetime] = None
    timeline: List[OrderTimelineItem] = []
    delivery: Optional[DeliveryInfoResponse] = None
    payment_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    items: List[OrderResponse]
    total: int
    skip: int
    limit: int


class OrderStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None


# ---- Delivery ----
class DeliveryCreate(BaseModel):
    order_id: int
    delivery_person_id: Optional[int] = None
    notes: Optional[str] = None


class DeliveryAssign(BaseModel):
    delivery_person_id: int


class DeliveryLocationUpdate(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = 10
    timestamp: Optional[datetime] = None


class DeliveryResponse(BaseModel):
    id: int
    uuid: UUID
    order_id: int
    delivery_person_id: Optional[int] = None
    status: str
    pickup_time: Optional[datetime] = None
    delivery_time: Optional[datetime] = None
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    location_history: List[dict] = []
    notes: Optional[str] = None
    signature_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DeliveryTrackingResponse(BaseModel):
    id: int
    uuid: UUID
    order_id: int
    status: str
    delivery_person_name: Optional[str] = None
    delivery_person_phone: Optional[str] = None
    current_location: Optional[dict] = None
    estimated_delivery: Optional[datetime] = None
    location_history: List[dict] = []
