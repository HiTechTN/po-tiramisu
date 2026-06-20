from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..security import get_current_user
from ..schemas.user import UserResponse, UserUpdate, AddressCreate, AddressUpdate, AddressResponse, PasswordChangeRequest
from ..security import hash_password, verify_password
from ..crud.user import get_addresses, get_address_by_id, create_address, update_address, delete_address, update_user
from ..models.user import Address

router = APIRouter(prefix="/api", tags=["users"])


@router.get("/users/me", response_model=dict)
async def get_user_profile(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "uuid": str(current_user.uuid),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "avatar_url": current_user.avatar_url,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "email_verified": current_user.email_verified,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }


@router.put("/users/me", response_model=dict)
async def update_user_profile(
    body: UserUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updated = update_user(db, current_user, **body.model_dump(exclude_unset=True))
    return {
        "id": updated.id,
        "uuid": str(updated.uuid),
        "email": updated.email,
        "full_name": updated.full_name,
        "phone": updated.phone,
        "avatar_url": updated.avatar_url,
        "role": updated.role,
    }


@router.post("/users/me/change-password")
async def change_password(
    body: PasswordChangeRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(body.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    update_user(db, current_user, password_hash=hash_password(body.new_password))
    return {"success": True, "message": "Password changed successfully"}


@router.get("/addresses", response_model=list[AddressResponse])
async def list_addresses(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    addresses = get_addresses(db, current_user.id)
    return addresses


@router.post("/addresses", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
async def create_new_address(
    body: AddressCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    address = create_address(db, current_user.id, body)
    return address


@router.put("/addresses/{address_id}", response_model=AddressResponse)
async def update_existing_address(
    address_id: int,
    body: AddressUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    address = get_address_by_id(db, address_id, current_user.id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    updated = update_address(db, address, body)
    return updated


@router.delete("/addresses/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_address(
    address_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    address = get_address_by_id(db, address_id, current_user.id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    delete_address(db, address)
    return None
