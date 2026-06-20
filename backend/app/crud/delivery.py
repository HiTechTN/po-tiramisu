from sqlalchemy.orm import Session
from typing import Optional
from ..models.delivery import Delivery
from ..schemas.order import DeliveryCreate


def get_delivery_by_id(db: Session, delivery_id: int) -> Optional[Delivery]:
    return db.query(Delivery).filter(Delivery.id == delivery_id).first()


def get_delivery_by_order_id(db: Session, order_id: int) -> Optional[Delivery]:
    return db.query(Delivery).filter(Delivery.order_id == order_id).first()


def create_delivery(db: Session, order_id: int, delivery_person_id: int = None, notes: str = None) -> Delivery:
    delivery = Delivery(
        order_id=order_id,
        delivery_person_id=delivery_person_id,
        status="pending",
        notes=notes,
    )
    db.add(delivery)
    db.commit()
    db.refresh(delivery)
    return delivery


def update_delivery_status(db: Session, delivery: Delivery, status: str) -> Delivery:
    from datetime import datetime, timezone

    delivery.status = status
    if status == "in_progress":
        delivery.pickup_time = datetime.now(timezone.utc)
    elif status == "delivered":
        delivery.delivery_time = datetime.now(timezone.utc)
    db.commit()
    db.refresh(delivery)
    return delivery


def assign_delivery_person(db: Session, delivery: Delivery, person_id: int) -> Delivery:
    delivery.delivery_person_id = person_id
    delivery.status = "assigned"
    db.commit()
    db.refresh(delivery)
    return delivery


def update_delivery_location(
    db: Session,
    delivery: Delivery,
    latitude: float,
    longitude: float,
) -> Delivery:
    from datetime import datetime, timezone

    history = delivery.location_history or []
    history.append(
        {
            "latitude": latitude,
            "longitude": longitude,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )
    delivery.location_history = history
    delivery.current_latitude = latitude
    delivery.current_longitude = longitude
    db.commit()
    db.refresh(delivery)
    return delivery


def list_deliveries(db: Session, skip: int = 0, limit: int = 20, status: str = None):
    query = db.query(Delivery)
    if status:
        query = query.filter(Delivery.status == status)
    total = query.count()
    items = query.order_by(Delivery.created_at.desc()).offset(skip).limit(limit).all()
    return items, total
