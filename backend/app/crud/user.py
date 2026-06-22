from sqlalchemy.orm import Session
from typing import Optional
from ..models.user import User, Address
from ..schemas.user import UserRegister, AddressCreate, AddressUpdate
from ..security import hash_password


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_uuid(db: Session, user_uuid: str) -> Optional[User]:
    return db.query(User).filter(User.uuid == user_uuid).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user_data: UserRegister) -> User:
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        phone=user_data.phone,
        password_hash=hash_password(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_admin_user(db: Session, email: str, password: str, full_name: str) -> User:
    user = User(
        email=email,
        full_name=full_name,
        password_hash=hash_password(password),
        role="admin",
        email_verified=True,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, **kwargs) -> User:
    for key, value in kwargs.items():
        if value is not None:
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


def list_users(db: Session, skip: int = 0, limit: int = 50, role: str = None):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    total = query.count()
    items = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return items, total


# ---- Addresses ----
def get_addresses(db: Session, user_id: int):
    return db.query(Address).filter(Address.user_id == user_id).order_by(Address.is_default.desc()).all()


def get_address_by_id(db: Session, address_id: int, user_id: int) -> Optional[Address]:
    return db.query(Address).filter(Address.id == address_id, Address.user_id == user_id).first()


def create_address(db: Session, user_id: int, address_data: AddressCreate) -> Address:
    if address_data.is_default:
        db.query(Address).filter(
            Address.user_id == user_id, Address.is_default == True
        ).update({"is_default": False})

    address = Address(user_id=user_id, **address_data.model_dump())
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


def update_address(db: Session, address: Address, address_data: AddressUpdate) -> Address:
    update_data = address_data.model_dump(exclude_unset=True)
    if update_data.get("is_default"):
        db.query(Address).filter(
            Address.user_id == address.user_id, Address.is_default == True
        ).update({"is_default": False})

    for key, value in update_data.items():
        setattr(address, key, value)
    db.commit()
    db.refresh(address)
    return address


def delete_address(db: Session, address: Address):
    db.delete(address)
    db.commit()
