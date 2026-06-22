from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class PaymentInitRequest(BaseModel):
    order_id: int
    amount_dt: float = Field(gt=0)


class PaymentInitResponse(BaseModel):
    payment_url: Optional[str] = None
    session_id: Optional[str] = None
    expires_at: Optional[datetime] = None


class PaymentCallbackRequest(BaseModel):
    order_id: int
    session_id: Optional[str] = None
    status: str
    reference: Optional[str] = None
    amount: Optional[float] = None


class PaymentStatusResponse(BaseModel):
    order_id: int
    status: str
    amount: float
    reference: Optional[str] = None
    provider: str
    completed_at: Optional[datetime] = None


class PaymentResponse(BaseModel):
    id: int
    uuid: UUID
    order_id: int
    user_id: int
    amount_dt: float
    currency: str
    provider: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---- Admin ----
class AdminDashboardResponse(BaseModel):
    total_orders: int
    total_revenue_dt: float
    pending_orders: int
    active_customers: int
    recent_orders: list = []
    top_products: list = []
    revenue_by_day: list = []
    order_status_distribution: dict = {}
