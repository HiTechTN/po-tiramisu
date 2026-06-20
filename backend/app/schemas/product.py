from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


# ---- Product ----
class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    slug: Optional[str] = None
    description: Optional[str] = None
    price_dt: float = Field(gt=0)
    cost_dt: Optional[float] = None
    quantity_available: int = Field(default=0, ge=0)
    image_url: Optional[str] = None
    images: List[str] = []
    category: Optional[str] = None
    tags: List[str] = []
    is_active: bool = True


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    price_dt: Optional[float] = None
    cost_dt: Optional[float] = None
    quantity_available: Optional[int] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    id: int
    uuid: UUID
    name: str
    slug: str
    description: Optional[str] = None
    price_dt: float
    cost_dt: Optional[float] = None
    quantity_available: int
    quantity_reserved: int
    image_url: Optional[str] = None
    images: List[str] = []
    category: Optional[str] = None
    tags: List[str] = []
    is_active: bool
    average_rating: Optional[float] = None
    reviews_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    skip: int
    limit: int


# ---- Review ----
class ReviewCreate(BaseModel):
    product_id: int
    order_id: Optional[int] = None
    rating: int = Field(ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    product_id: Optional[int] = None
    order_id: Optional[int] = None
    rating: int
    title: Optional[str] = None
    comment: Optional[str] = None
    user_name: Optional[str] = None
    is_verified: bool
    helpful_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewListResponse(BaseModel):
    items: List[ReviewResponse]
    average_rating: Optional[float] = 0
    total_reviews: int = 0
    rating_distribution: dict = {}
