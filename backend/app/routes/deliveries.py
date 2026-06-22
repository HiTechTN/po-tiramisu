from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..security import get_current_user
from ..schemas.order import DeliveryAssign, DeliveryLocationUpdate, DeliveryResponse
from ..crud.delivery import (
    get_delivery_by_id,
    get_delivery_by_order_id,
    assign_delivery_person,
    update_delivery_status,
    update_delivery_location,
    list_deliveries,
)
from ..crud.user import get_user_by_id

router = APIRouter(prefix="/api/deliveries", tags=["deliveries"])


@router.get("/{delivery_id}/track")
async def track_delivery(
    delivery_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    delivery = get_delivery_by_id(db, delivery_id)
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    dp = get_user_by_id(db, delivery.delivery_person_id) if delivery.delivery_person_id else None

    current_location = None
    if delivery.current_latitude and delivery.current_longitude:
        current_location = {
            "latitude": delivery.current_latitude,
            "longitude": delivery.current_longitude,
            "timestamp": delivery.updated_at.isoformat() if delivery.updated_at else None,
        }

    return {
        "id": delivery.id,
        "uuid": str(delivery.uuid),
        "order_id": delivery.order_id,
        "status": delivery.status,
        "delivery_person_name": dp.full_name if dp else None,
        "delivery_person_phone": dp.phone if dp else None,
        "current_location": current_location,
        "estimated_delivery": delivery.pickup_time.isoformat() if delivery.pickup_time else None,
        "location_history": delivery.location_history or [],
    }


@router.patch("/{delivery_id}/assign")
async def assign_delivery(
    delivery_id: int,
    body: DeliveryAssign,
    admin=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    delivery = get_delivery_by_id(db, delivery_id)
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    dp = get_user_by_id(db, body.delivery_person_id)
    if not dp or dp.role != "delivery":
        raise HTTPException(status_code=400, detail="Invalid delivery person")

    updated = assign_delivery_person(db, delivery, dp.id)
    return {"success": True, "message": f"Assigned to {dp.full_name}"}


@router.patch("/{delivery_id}/status")
async def update_status(
    delivery_id: int,
    status_val: str = Query(..., alias="status"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    delivery = get_delivery_by_id(db, delivery_id)
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    valid_statuses = ["pending", "assigned", "in_progress", "delivered", "failed"]
    if status_val not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    updated = update_delivery_status(db, delivery, status_val)
    return {"success": True, "status": updated.status}


@router.post("/{delivery_id}/update-location")
async def update_delivery_loc(
    delivery_id: int,
    body: DeliveryLocationUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    delivery = get_delivery_by_id(db, delivery_id)
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    updated = update_delivery_location(db, delivery, body.latitude, body.longitude)
    return {"success": True, "location": {"latitude": updated.current_latitude, "longitude": updated.current_longitude}}


@router.get("")
async def list_all_deliveries(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status_filter: str = Query(None, alias="status"),
    admin=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items, total = list_deliveries(db, skip, limit, status_filter)
    result = []
    for d in items:
        dp = get_user_by_id(db, d.delivery_person_id) if d.delivery_person_id else None
        result.append({
            "id": d.id,
            "uuid": str(d.uuid),
            "order_id": d.order_id,
            "status": d.status,
            "delivery_person_name": dp.full_name if dp else None,
            "current_latitude": d.current_latitude,
            "current_longitude": d.current_longitude,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        })

    return {"items": result, "total": total, "skip": skip, "limit": limit}
