from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..security import get_current_user
from ..schemas.product import ReviewCreate, ReviewResponse, ReviewListResponse
from ..crud.product import create_review, get_product_reviews, get_product_by_id, get_product_avg_rating, get_product_reviews_count
from ..crud.user import get_user_by_id

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.get("/product/{product_id}", response_model=ReviewListResponse)
async def get_reviews_for_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    reviews, avg_rating, total, distribution = get_product_reviews(db, product_id)

    items = []
    for r in reviews:
        user = get_user_by_id(db, r.user_id)
        items.append(
            ReviewResponse(
                id=r.id,
                user_id=r.user_id,
                product_id=r.product_id,
                order_id=r.order_id,
                rating=r.rating,
                title=r.title,
                comment=r.comment,
                user_name=user.full_name if user else None,
                is_verified=r.is_verified,
                helpful_count=r.helpful_count,
                created_at=r.created_at,
            )
        )

    return ReviewListResponse(
        items=items,
        average_rating=round(float(avg_rating), 1),
        total_reviews=total,
        rating_distribution=distribution,
    )


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_new_review(
    review_data: ReviewCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = get_product_by_id(db, review_data.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    review = create_review(db, current_user.id, review_data)

    return ReviewResponse(
        id=review.id,
        user_id=review.user_id,
        product_id=review.product_id,
        order_id=review.order_id,
        rating=review.rating,
        title=review.title,
        comment=review.comment,
        user_name=current_user.full_name,
        is_verified=review.is_verified,
        helpful_count=review.helpful_count,
        created_at=review.created_at,
    )
