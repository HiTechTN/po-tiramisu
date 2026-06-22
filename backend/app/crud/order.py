from sqlalchemy.orm import Session, joinedload
from typing import Optional
from ..models.order import Order, OrderItem
from ..models.product import Product
from ..models.user import Address
from ..schemas.order import OrderCreate


def create_order_from_cart(
    db: Session,
    user_id: int,
    order_data: OrderCreate,
    cart_items: list,
    subtotal: float,
    delivery_fee: float,
    discount: float,
    total: float,
    promo_code: str = None,
) -> Order:
    order = Order(
        user_id=user_id,
        status="pending",
        payment_status="pending",
        subtotal_dt=subtotal,
        delivery_fee_dt=delivery_fee,
        discount_dt=discount,
        total_dt=total,
        delivery_address_id=order_data.address_id,
        delivery_notes=order_data.notes,
        payment_method=order_data.payment_method,
    )
    db.add(order)
    db.flush()

    for item in cart_items:
        product = db.query(Product).filter(Product.id == item["product_id"]).first()
        if not product:
            continue

        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=item["quantity"],
            unit_price_dt=product.price_dt,
            total_price_dt=product.price_dt * item["quantity"],
            product_snapshot={
                "name": product.name,
                "price": product.price_dt,
                "image_url": product.image_url,
            },
        )
        db.add(order_item)

        # Reserve inventory
        product.quantity_available = max(0, product.quantity_available - item["quantity"])
        product.quantity_reserved += item["quantity"]

    db.commit()
    db.refresh(order)
    return order


def get_order_by_id(db: Session, order_id: int) -> Optional[Order]:
    return (
        db.query(Order)
        .options(joinedload(Order.items), joinedload(Order.delivery), joinedload(Order.payments))
        .filter(Order.id == order_id)
        .first()
    )


def get_order_by_uuid(db: Session, order_uuid: str) -> Optional[Order]:
    return (
        db.query(Order)
        .options(joinedload(Order.items), joinedload(Order.delivery))
        .filter(Order.uuid == order_uuid)
        .first()
    )


def list_user_orders(db: Session, user_id: int, skip: int = 0, limit: int = 20, status: str = None):
    query = db.query(Order).filter(Order.user_id == user_id)
    if status:
        query = query.filter(Order.status == status)
    total = query.count()
    items = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return items, total


def list_all_orders(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    status: str = None,
    payment_status: str = None,
):
    query = db.query(Order).options(joinedload(Order.items), joinedload(Order.delivery))
    if status:
        query = query.filter(Order.status == status)
    if payment_status:
        query = query.filter(Order.payment_status == payment_status)
    count_query = db.query(Order)
    if status:
        count_query = count_query.filter(Order.status == status)
    if payment_status:
        count_query = count_query.filter(Order.payment_status == payment_status)
    total = count_query.count()
    items = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return items, total


def update_order_status(db: Session, order: Order, status: str, notes: str = None) -> Order:
    order.status = status
    db.commit()
    db.refresh(order)
    return order


def update_order_payment_status(db: Session, order: Order, payment_status: str) -> Order:
    order.payment_status = payment_status
    db.commit()
    db.refresh(order)
    return order


def get_dashboard_stats(db: Session):
    from sqlalchemy import func
    from datetime import datetime, timedelta, timezone

    now = datetime.now(timezone.utc)
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)

    total_orders = db.query(func.count(Order.id)).scalar() or 0
    total_revenue = db.query(func.sum(Order.total_dt)).filter(
        Order.payment_status == "completed"
    ).scalar() or 0
    pending_orders = db.query(func.count(Order.id)).filter(
        Order.status.in_(["pending", "confirmed", "preparing"])
    ).scalar() or 0

    from ..models.user import User
    active_customers = db.query(func.count(User.id)).filter(
        User.role == "customer", User.is_active == True
    ).scalar() or 0

    recent_orders = (
        db.query(Order)
        .order_by(Order.created_at.desc())
        .limit(10)
        .all()
    )

    # Revenue by day (last 30 days)
    thirty_days_ago = now - timedelta(days=30)
    daily_revenue = (
        db.query(
            func.date(Order.created_at).label("date"),
            func.sum(Order.total_dt).label("revenue"),
            func.count(Order.id).label("count"),
        )
        .filter(Order.created_at >= thirty_days_ago, Order.payment_status == "completed")
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
        .all()
    )

    # Order status distribution
    status_dist = (
        db.query(Order.status, func.count(Order.id))
        .group_by(Order.status)
        .all()
    )

    # Top products by sales volume
    from ..models.product import Product
    top_products_raw = (
        db.query(
            Product.name,
            func.sum(OrderItem.quantity).label("count"),
        )
        .join(OrderItem, Product.id == OrderItem.product_id)
        .join(Order, OrderItem.order_id == Order.id)
        .filter(Order.payment_status == "completed")
        .group_by(Product.name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )

    return {
        "total_orders": total_orders,
        "total_revenue_dt": float(total_revenue),
        "pending_orders": pending_orders,
        "active_customers": active_customers,
        "recent_orders": [
            {
                "id": o.id,
                "uuid": str(o.uuid),
                "status": o.status,
                "total_dt": o.total_dt,
                "created_at": o.created_at.isoformat() if o.created_at else None,
                "user_id": o.user_id,
            }
            for o in recent_orders
        ],
        "revenue_by_day": [
            {"date": str(r.date), "revenue": float(r.revenue or 0), "count": r.count}
            for r in daily_revenue
        ],
        "top_products": [{"name": name, "count": int(count or 0)} for name, count in top_products_raw],
        "order_status_distribution": {s: c for s, c in status_dist},
    }
