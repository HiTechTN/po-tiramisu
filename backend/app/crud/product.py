from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from ..models.product import Product, Review
from ..schemas.product import ProductCreate, ProductUpdate, ReviewCreate


def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
    return db.query(Product).filter(Product.id == product_id).first()


def get_product_by_slug(db: Session, slug: str) -> Optional[Product]:
    return db.query(Product).filter(Product.slug == slug).first()


def list_products(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    category: str = None,
    search: str = None,
    is_active: bool = True,
    sort: str = "name",
    order: str = "asc",
):
    query = db.query(Product)

    if is_active is not None:
        query = query.filter(Product.is_active == is_active)
    if category:
        query = query.filter(Product.category == category)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            Product.name.ilike(search_term) | Product.description.ilike(search_term)
        )

    total = query.count()

    sort_col = getattr(Product, sort, Product.name)
    if order == "desc":
        query = query.order_by(sort_col.desc())
    else:
        query = query.order_by(sort_col.asc())

    items = query.offset(skip).limit(limit).all()
    return items, total


def get_categories(db: Session):
    categories = (
        db.query(Product.category, func.count(Product.id))
        .filter(Product.is_active == True, Product.category.isnot(None))
        .group_by(Product.category)
        .all()
    )
    return [{"name": c[0], "count": c[1]} for c in categories]


def create_product(db: Session, product_data: ProductCreate) -> Product:
    import re

    data = product_data.model_dump()
    if not data.get("slug"):
        slug = data["name"].lower().strip()
        slug = re.sub(r"[^\w\s-]", "", slug)
        slug = re.sub(r"[\s_]+", "-", slug)
        data["slug"] = slug

    product = Product(**data)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product: Product, product_data: ProductUpdate) -> Product:
    update_data = product_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product: Product):
    db.delete(product)
    db.commit()


def adjust_inventory(db: Session, product: Product, adjustment: int, reason: str = None) -> Product:
    product.quantity_available = max(0, product.quantity_available + adjustment)
    db.commit()
    db.refresh(product)
    return product


# ---- Reviews ----
def create_review(db: Session, user_id: int, review_data: ReviewCreate) -> Review:
    review = Review(
        user_id=user_id,
        product_id=review_data.product_id,
        order_id=review_data.order_id,
        rating=review_data.rating,
        title=review_data.title,
        comment=review_data.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


def get_product_reviews(db: Session, product_id: int):
    reviews = (
        db.query(Review)
        .filter(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
        .all()
    )

    if not reviews:
        return reviews, 0, 0, {}

    avg_rating = sum(r.rating for r in reviews) / len(reviews)
    total = len(reviews)
    distribution = {str(i): 0 for i in range(1, 6)}
    for r in reviews:
        distribution[str(r.rating)] = distribution.get(str(r.rating), 0) + 1

    return reviews, avg_rating, total, distribution


def get_product_avg_rating(db: Session, product_id: int):
    result = db.query(func.avg(Review.rating)).filter(Review.product_id == product_id).scalar()
    return result or 0


def get_product_reviews_count(db: Session, product_id: int):
    return db.query(func.count(Review.id)).filter(Review.product_id == product_id).scalar() or 0
