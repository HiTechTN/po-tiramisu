from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
    ReviewCreate,
    ReviewResponse,
    ReviewListResponse,
)
from ..crud.product import (
    get_product_by_id,
    get_product_by_slug,
    list_products,
    create_product,
    update_product,
    delete_product,
    get_categories,
    create_review,
    get_product_reviews,
    get_product_avg_rating,
    get_product_reviews_count,
)
from ..crud.user import get_user_by_id
from ..security import get_current_user, get_current_admin

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=ProductListResponse)
async def list_all_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: str = None,
    search: str = None,
    sort: str = Query("name", regex="^(name|price_dt|created_at)$"),
    order: str = Query("asc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    items, total = list_products(
        db, skip=skip, limit=limit, category=category, search=search,
        sort=sort, order=order,
    )

    result = []
    for p in items:
        avg = get_product_avg_rating(db, p.id)
        count = get_product_reviews_count(db, p.id)
        result.append(
            ProductResponse(
                id=p.id,
                uuid=p.uuid,
                name=p.name,
                slug=p.slug,
                description=p.description,
                price_dt=p.price_dt,
                cost_dt=p.cost_dt,
                quantity_available=p.quantity_available,
                quantity_reserved=p.quantity_reserved,
                image_url=p.image_url,
                images=p.images or [],
                category=p.category,
                tags=p.tags or [],
                is_active=p.is_active,
                average_rating=round(float(avg), 1) if avg else None,
                reviews_count=count,
                created_at=p.created_at,
                updated_at=p.updated_at,
            )
        )

    return ProductListResponse(items=result, total=total, skip=skip, limit=limit)


@router.get("/categories")
async def list_categories(db: Session = Depends(get_db)):
    return get_categories(db)


@router.get("/{product_id_or_slug}")
async def get_product(product_id_or_slug: str, db: Session = Depends(get_db)):
    # Try by ID first, then by slug
    product = None
    if product_id_or_slug.isdigit():
        product = get_product_by_id(db, int(product_id_or_slug))
    if not product:
        product = get_product_by_slug(db, product_id_or_slug)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    avg = get_product_avg_rating(db, product.id)
    count = get_product_reviews_count(db, product.id)

    return ProductResponse(
        id=product.id,
        uuid=product.uuid,
        name=product.name,
        slug=product.slug,
        description=product.description,
        price_dt=product.price_dt,
        cost_dt=product.cost_dt,
        quantity_available=product.quantity_available,
        quantity_reserved=product.quantity_reserved,
        image_url=product.image_url,
        images=product.images or [],
        category=product.category,
        tags=product.tags or [],
        is_active=product.is_active,
        average_rating=round(float(avg), 1) if avg else None,
        reviews_count=count,
        created_at=product.created_at,
        updated_at=product.updated_at,
    )


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_new_product(
    product: ProductCreate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    new_product = create_product(db, product)
    return ProductResponse(
        id=new_product.id,
        uuid=new_product.uuid,
        name=new_product.name,
        slug=new_product.slug,
        description=new_product.description,
        price_dt=new_product.price_dt,
        cost_dt=new_product.cost_dt,
        quantity_available=new_product.quantity_available,
        quantity_reserved=new_product.quantity_reserved,
        image_url=new_product.image_url,
        images=new_product.images or [],
        category=new_product.category,
        tags=new_product.tags or [],
        is_active=new_product.is_active,
        created_at=new_product.created_at,
        updated_at=new_product.updated_at,
    )


@router.put("/{product_id}", response_model=ProductResponse)
async def update_existing_product(
    product_id: int,
    product: ProductUpdate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    existing = get_product_by_id(db, product_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    updated = update_product(db, existing, product)
    avg = get_product_avg_rating(db, updated.id)
    count = get_product_reviews_count(db, updated.id)

    return ProductResponse(
        id=updated.id,
        uuid=updated.uuid,
        name=updated.name,
        slug=updated.slug,
        description=updated.description,
        price_dt=updated.price_dt,
        cost_dt=updated.cost_dt,
        quantity_available=updated.quantity_available,
        quantity_reserved=updated.quantity_reserved,
        image_url=updated.image_url,
        images=updated.images or [],
        category=updated.category,
        tags=updated.tags or [],
        is_active=updated.is_active,
        average_rating=round(float(avg), 1) if avg else None,
        reviews_count=count,
        created_at=updated.created_at,
        updated_at=updated.updated_at,
    )


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_product(
    product_id: int,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    existing = get_product_by_id(db, product_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    delete_product(db, existing)
    return None


# ---- Reviews ----
@router.get("/{product_id}/reviews", response_model=ReviewListResponse)
async def get_product_reviews_list(
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


@router.post("/{product_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_product_review(
    product_id: int,
    review_data: ReviewCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    review_data.product_id = product_id
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
