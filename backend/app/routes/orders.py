from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from ..database import get_db
from ..security import get_current_user
from ..schemas.order import (
    OrderCreate,
    OrderResponse,
    OrderListResponse,
    OrderItemResponse,
    OrderTimelineItem,
)
from ..crud.order import create_order_from_cart, get_order_by_id, list_user_orders
from ..crud.payment import create_payment
from ..crud.delivery import create_delivery
from ..models.user import Address
import json

router = APIRouter(prefix="/api/orders", tags=["orders"])

_user_carts = {}


def _get_user_cart(user_id: int) -> dict:
    if user_id not in _user_carts:
        _user_carts[user_id] = {"items": [], "promo_code": None, "discount": 0}
    return _user_carts[user_id]


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validate address
    address = db.query(Address).filter(
        Address.id == order_data.address_id, Address.user_id == current_user.id
    ).first()
    if not address:
        raise HTTPException(status_code=400, detail="Invalid delivery address")

    # Get cart
    cart = _get_user_cart(current_user.id)
    if not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Calculate totals
    from ..models.product import Product

    subtotal = 0
    cart_items = []
    for item in cart["items"]:
        product = db.query(Product).filter(Product.id == item["product_id"]).first()
        if not product or not product.is_active:
            raise HTTPException(status_code=400, detail=f"Product {item['product_id']} unavailable")
        if product.quantity_available < item["quantity"]:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
        subtotal += product.price_dt * item["quantity"]
        cart_items.append(item)

    delivery_fee = 5.0
    discount = cart.get("discount", 0)
    total = max(0, subtotal + delivery_fee - discount)

    # Create order
    order = create_order_from_cart(
        db=db,
        user_id=current_user.id,
        order_data=order_data,
        cart_items=cart_items,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        discount=discount,
        total=total,
        promo_code=cart.get("promo_code"),
    )

    # Create payment record
    if order_data.payment_method != "cash":
        payment = create_payment(db, order.id, current_user.id, total, order_data.payment_method)
        order.payment_ref = f"PAY-{payment.id}"
        db.commit()

    # Clear cart
    _user_carts[current_user.id] = {"items": [], "promo_code": None, "discount": 0}

    # Build timeline
    timeline = [
        OrderTimelineItem(
            status="pending",
            timestamp=order.created_at,
            message="Commande reçue",
        )
    ]

    return OrderResponse(
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
        delivery_address={
            "id": address.id,
            "street": address.street,
            "city": address.city,
            "postal_code": address.postal_code,
            "governorate": address.governorate,
            "country": address.country,
        },
        delivery_notes=order.delivery_notes,
        payment_method=order.payment_method,
        payment_ref=order.payment_ref,
        created_at=order.created_at,
        updated_at=order.updated_at,
        timeline=timeline,
    )


@router.get("", response_model=OrderListResponse)
async def list_orders(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status_filter: str = Query(None, alias="status"),
):
    items, total = list_user_orders(db, current_user.id, skip, limit, status_filter)

    result = []
    for order in items:
        timeline = [
            OrderTimelineItem(
                status="pending",
                timestamp=order.created_at,
                message="Commande reçue",
            )
        ]
        if order.status != "pending":
            timeline.append(
                OrderTimelineItem(status=order.status, timestamp=order.updated_at, message=order.status)
            )

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
                created_at=order.created_at,
                updated_at=order.updated_at,
                timeline=timeline,
            )
        )

    return OrderListResponse(items=result, total=total, skip=skip, limit=limit)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order_detail(
    order_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = get_order_by_id(db, order_id)
    if not order or (order.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="Order not found")

    # Build timeline
    timeline = [
        OrderTimelineItem(
            status="pending",
            timestamp=order.created_at,
            message="Commande reçue",
        )
    ]
    status_messages = {
        "confirmed": "Paiement confirmé",
        "preparing": "En préparation",
        "ready": "Prête pour livraison",
        "shipped": "Expédiée",
        "delivered": "Livrée",
        "cancelled": "Annulée",
    }
    if order.status != "pending":
        timeline.append(
            OrderTimelineItem(
                status=order.status,
                timestamp=order.updated_at,
                message=status_messages.get(order.status, order.status),
            )
        )

    # Delivery info
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

    # Address
    addr = None
    if order.delivery_address:
        addr = {
            "id": order.delivery_address.id,
            "street": order.delivery_address.street,
            "city": order.delivery_address.city,
            "postal_code": order.delivery_address.postal_code,
            "governorate": order.delivery_address.governorate,
            "country": order.delivery_address.country,
        }

    return OrderResponse(
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
        delivery_address=addr,
        delivery_notes=order.delivery_notes,
        payment_method=order.payment_method,
        payment_ref=order.payment_ref,
        estimated_delivery=order.estimated_delivery,
        actual_delivery=order.actual_delivery,
        created_at=order.created_at,
        updated_at=order.updated_at,
        timeline=timeline,
        delivery=delivery_info,
    )


@router.patch("/{order_id}/cancel")
async def cancel_order(
    order_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = get_order_by_id(db, order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status not in ("pending", "confirmed"):
        raise HTTPException(status_code=400, detail="Cannot cancel order in current status")

    order.status = "cancelled"

    # Restore inventory
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.quantity_available += item.quantity
            product.quantity_reserved = max(0, product.quantity_reserved - item.quantity)

    db.commit()

    return {
        "success": True,
        "message": "Commande annulée",
        "refund_amount": order.total_dt if order.payment_status == "completed" else 0,
    }
