from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..security import get_current_user
from ..schemas.order import CartItemAdd, CartResponse, CartItemResponse, PromoCodeApply, PromoCodeResponse
from ..models.product import Product
from ..crud.payment import get_promo_by_code, validate_promo_code, apply_promo_code, increment_promo_usage
import json

router = APIRouter(prefix="/api/cart", tags=["cart"])

# In-memory cart per user (in production, use Redis)
_user_carts = {}

DELIVERY_FEE = 5.0


def _get_user_cart(user_id: int) -> dict:
    if user_id not in _user_carts:
        _user_carts[user_id] = {"items": [], "promo_code": None, "discount": 0}
    return _user_carts[user_id]


def _calculate_totals(cart: dict, db: Session):
    subtotal = 0
    items = []
    for item in cart["items"]:
        product = db.query(Product).filter(Product.id == item["product_id"]).first()
        if product and product.is_active:
            total_price = product.price_dt * item["quantity"]
            subtotal += total_price
            items.append(
                CartItemResponse(
                    product_id=product.id,
                    product_name=product.name,
                    product_image=product.image_url,
                    quantity=item["quantity"],
                    unit_price_dt=product.price_dt,
                    total_price_dt=total_price,
                    in_stock=product.quantity_available >= item["quantity"],
                )
            )

    delivery_fee = DELIVERY_FEE if subtotal > 0 else 0
    discount = cart.get("discount", 0)
    total = max(0, subtotal + delivery_fee - discount)

    return CartResponse(
        user_id=cart.get("user_id", 0),
        items=items,
        subtotal_dt=subtotal,
        delivery_fee_dt=delivery_fee,
        discount_dt=discount,
        total_dt=total,
        promo_code=cart.get("promo_code"),
    )


@router.get("", response_model=CartResponse)
async def get_cart(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = _get_user_cart(current_user.id)
    cart["user_id"] = current_user.id
    return _calculate_totals(cart, db)


@router.post("/add", response_model=CartResponse)
async def add_to_cart(
    item: CartItemAdd,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == item.product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.quantity_available < item.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    cart = _get_user_cart(current_user.id)
    cart["user_id"] = current_user.id

    # Check if item already in cart
    existing = next((i for i in cart["items"] if i["product_id"] == item.product_id), None)
    if existing:
        existing["quantity"] += item.quantity
    else:
        cart["items"].append({"product_id": item.product_id, "quantity": item.quantity})

    return _calculate_totals(cart, db)


@router.put("/update", response_model=CartResponse)
async def update_cart_item(
    quantity: int = Query(..., ge=0),
    product_id: int = Query(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = _get_user_cart(current_user.id)
    cart["user_id"] = current_user.id

    existing = next((i for i in cart["items"] if i["product_id"] == product_id), None)
    if not existing:
        raise HTTPException(status_code=404, detail="Item not in cart")

    if quantity <= 0:
        cart["items"] = [i for i in cart["items"] if i["product_id"] != product_id]
    else:
        existing["quantity"] = quantity

    return _calculate_totals(cart, db)


@router.delete("/remove/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(
    product_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = _get_user_cart(current_user.id)
    cart["items"] = [i for i in cart["items"] if i["product_id"] != product_id]
    return None


@router.delete("/clear", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(current_user=Depends(get_current_user)):
    _user_carts[current_user.id] = {"items": [], "promo_code": None, "discount": 0}
    return None


@router.post("/apply-promo", response_model=PromoCodeResponse)
async def apply_promo(
    body: PromoCodeApply,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = _get_user_cart(current_user.id)
    cart_calc = _calculate_totals(cart, db)

    promo, error = validate_promo_code(db, body.promo_code, cart_calc.subtotal_dt)
    if error:
        return PromoCodeResponse(success=False, message=error)

    discount = apply_promo_code(db, promo, cart_calc.subtotal_dt)
    cart["promo_code"] = body.promo_code.upper()
    cart["discount"] = discount

    new_total = max(0, cart_calc.subtotal_dt + cart_calc.delivery_fee_dt - discount)

    return PromoCodeResponse(
        success=True,
        message="Code promo appliqué avec succès",
        discount_dt=discount,
        new_total_dt=new_total,
    )
