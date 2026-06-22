from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..security import get_current_admin
from ..schemas.product import ProductCreate, ProductUpdate, ProductResponse
from ..schemas.order import OrderStatusUpdate, OrderListResponse, OrderResponse, OrderItemResponse, OrderTimelineItem
from ..schemas.user import UserResponse, UserAdminUpdate
from ..crud.order import get_dashboard_stats, list_all_orders, get_order_by_id, update_order_status
from ..crud.product import create_product, update_product, delete_product, get_product_by_id, list_products, get_product_avg_rating, get_product_reviews_count, adjust_inventory
from ..crud.user import list_users, update_user, get_user_by_id
from ..crud.delivery import create_delivery

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/dashboard")
async def admin_dashboard(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    return get_dashboard_stats(db)


# ---- Orders Management ----
@router.get("/orders", response_model=OrderListResponse)
async def admin_list_orders(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status_filter: str = Query(None, alias="status"),
    payment_status: str = Query(None),
):
    items, total = list_all_orders(db, skip, limit, status_filter, payment_status)

    result = []
    for order in items:
        timeline = [OrderTimelineItem(status="pending", timestamp=order.created_at, message="Commande reçue")]
        if order.status != "pending":
            timeline.append(OrderTimelineItem(status=order.status, timestamp=order.updated_at, message=order.status))

        # Build delivery info if present
        delivery_info = None
        if order.delivery:
            dp = order.delivery.delivery_person
            delivery_info = {
                "id": order.delivery.id,
                "uuid": str(order.delivery.uuid),
                "status": order.delivery.status,
                "delivery_person_name": dp.full_name if dp else None,
                "delivery_person_phone": dp.phone if dp else None,
                "current_location": {
                    "latitude": order.delivery.current_latitude,
                    "longitude": order.delivery.current_longitude,
                } if order.delivery.current_latitude else None,
                "estimated_delivery": order.estimated_delivery.isoformat() if order.estimated_delivery else None,
                "location_history": order.delivery.location_history or [],
            }

        result.append(
            OrderResponse(
                id=order.id,
                uuid=order.uuid,
                user_id=order.user_id,
                status=order.status,
                payment_status=order.payment_status,
                subtotal_dt=order.subtotal_dt,
                delivery_fee_dt=order.delivery_fee_dt,
                discount_dt=order.discount_dt,
                total_dt=order.total_dt,
                items=[
                    OrderItemResponse(
                        product_id=item.product_id,
                        product_name=item.product_snapshot.get("name", "") if item.product_snapshot else "",
                        product_image=item.product_snapshot.get("image_url") if item.product_snapshot else None,
                        quantity=item.quantity,
                        unit_price_dt=item.unit_price_dt,
                        total_price_dt=item.total_price_dt,
                    )
                    for item in order.items
                ],
                delivery=delivery_info,
                created_at=order.created_at,
                updated_at=order.updated_at,
                timeline=timeline,
            )
        )

    return OrderListResponse(items=result, total=total, skip=skip, limit=limit)


@router.patch("/orders/{order_id}/status")
async def admin_update_order_status(
    order_id: int,
    body: OrderStatusUpdate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    order = get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    valid_statuses = ["pending", "confirmed", "preparing", "ready", "shipped", "delivered", "cancelled"]
    if body.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    updated = update_order_status(db, order, body.status, body.notes)

    # Auto-create delivery when shipped
    if body.status == "ready" and not order.delivery:
        create_delivery(db, order_id=order.id)

    return {"success": True, "status": updated.status}


# ---- Products Management ----
@router.get("/products")
async def admin_list_products(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    items, total = list_products(db, skip, limit, is_active=None)
    result = []
    for p in items:
        avg = get_product_avg_rating(db, p.id)
        count = get_product_reviews_count(db, p.id)
        result.append(
            ProductResponse(
                id=p.id, uuid=p.uuid, name=p.name, slug=p.slug, description=p.description,
                price_dt=p.price_dt, cost_dt=p.cost_dt, quantity_available=p.quantity_available,
                quantity_reserved=p.quantity_reserved, image_url=p.image_url, images=p.images or [],
                category=p.category, tags=p.tags or [], is_active=p.is_active,
                average_rating=round(float(avg), 1) if avg else None, reviews_count=count,
                created_at=p.created_at, updated_at=p.updated_at,
            )
        )
    return {"items": result, "total": total, "skip": skip, "limit": limit}


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_product(
    product: ProductCreate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    new_product = create_product(db, product)
    return ProductResponse(
        id=new_product.id, uuid=new_product.uuid, name=new_product.name, slug=new_product.slug,
        description=new_product.description, price_dt=new_product.price_dt, cost_dt=new_product.cost_dt,
        quantity_available=new_product.quantity_available, quantity_reserved=new_product.quantity_reserved,
        image_url=new_product.image_url, images=new_product.images or [], category=new_product.category,
        tags=new_product.tags or [], is_active=new_product.is_active,
        created_at=new_product.created_at, updated_at=new_product.updated_at,
    )


@router.put("/products/{product_id}", response_model=ProductResponse)
async def admin_update_product(
    product_id: int,
    product: ProductUpdate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    existing = get_product_by_id(db, product_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    updated = update_product(db, existing, product)
    return ProductResponse(
        id=updated.id, uuid=updated.uuid, name=updated.name, slug=updated.slug,
        description=updated.description, price_dt=updated.price_dt, cost_dt=updated.cost_dt,
        quantity_available=updated.quantity_available, quantity_reserved=updated.quantity_reserved,
        image_url=updated.image_url, images=updated.images or [], category=updated.category,
        tags=updated.tags or [], is_active=updated.is_active,
        created_at=updated.created_at, updated_at=updated.updated_at,
    )


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_product(
    product_id: int,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    existing = get_product_by_id(db, product_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    delete_product(db, existing)
    return None


# ---- Inventory ----
@router.get("/inventory")
async def admin_get_inventory(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    items, total = list_products(db, limit=100, is_active=None)
    result = []
    for p in items:
        result.append({
            "id": p.id,
            "name": p.name,
            "slug": p.slug,
            "quantity_available": p.quantity_available,
            "quantity_reserved": p.quantity_reserved,
            "category": p.category,
            "is_active": p.is_active,
        })
    return {"items": result, "total": total}


@router.post("/inventory/adjust")
async def admin_adjust_inventory(
    body: dict,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    product_id = body.get("product_id")
    adjustment = body.get("adjustment", 0)

    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    updated = adjust_inventory(db, product, adjustment)
    return {"success": True, "quantity_available": updated.quantity_available}


# ---- Users Management ----
@router.get("/users")
async def admin_list_users(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    role: str = Query(None),
):
    items, total = list_users(db, skip, limit, role)
    result = []
    for u in items:
        result.append(
            UserResponse(
                id=u.id, uuid=u.uuid, email=u.email, full_name=u.full_name,
                phone=u.phone, avatar_url=u.avatar_url, role=u.role,
                is_active=u.is_active, email_verified=u.email_verified,
                created_at=u.created_at, updated_at=u.updated_at,
            )
        )
    return {"items": result, "total": total, "skip": skip, "limit": limit}


@router.patch("/users/{user_id}")
async def admin_update_user(
    user_id: int,
    body: UserAdminUpdate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updated = update_user(db, user, **body.model_dump(exclude_unset=True))
    return {
        "success": True,
        "user": {
            "id": updated.id,
            "email": updated.email,
            "full_name": updated.full_name,
            "role": updated.role,
            "is_active": updated.is_active,
        },
    }
