from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from auth.dependencies import get_current_user
from database.session import get_db
from models.address import Address
from models.cart_item import CartItem
from models.order import Order
from models.order_item import OrderItem
from models.user import User
from schemas.order import OrderCreate, OrderListItem, OrderResponse

router = APIRouter(prefix="/api/orders", tags=["orders"])

FREE_SHIPPING_THRESHOLD = 75.0
SHIPPING_COST = 6.99


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def place_order(
    body: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OrderResponse:
    if body.address_id is None and body.address_override is None:
        raise HTTPException(status_code=422, detail="Provide address_id or address_override")

    cart_items = list(await db.scalars(
        select(CartItem)
        .where(CartItem.user_id == current_user.id)
        .options(joinedload(CartItem.product))
    ))
    if not cart_items:
        raise HTTPException(status_code=422, detail="Cart is empty")

    if body.address_id is not None:
        addr = await db.get(Address, body.address_id)
        if not addr or addr.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Address not found")
        address_snapshot = {
            "label": addr.label, "line1": addr.line1, "line2": addr.line2,
            "city": addr.city, "postcode": addr.postcode, "country": addr.country,
        }
    else:
        a = body.address_override
        address_snapshot = {
            "label": a.label, "line1": a.line1, "line2": a.line2,
            "city": a.city, "postcode": a.postcode, "country": a.country,
        }

    subtotal = sum(float(i.product.price) * i.quantity for i in cart_items)
    shipping = 0.0 if subtotal >= FREE_SHIPPING_THRESHOLD else SHIPPING_COST
    total = subtotal + shipping

    order = Order(
        user_id=current_user.id,
        subtotal=round(subtotal, 2),
        shipping=round(shipping, 2),
        total=round(total, 2),
        address_snapshot=address_snapshot,
    )
    db.add(order)
    await db.flush()

    for item in cart_items:
        db.add(OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            name=item.product.name,
            price=float(item.product.price),
            quantity=item.quantity,
            image=item.product.image,
        ))

    await db.execute(delete(CartItem).where(CartItem.user_id == current_user.id))
    await db.flush()
    await db.refresh(order, ["order_items"])
    return OrderResponse.model_validate(order)


@router.get("", response_model=list[OrderListItem])
async def list_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[OrderListItem]:
    rows = await db.scalars(
        select(Order)
        .where(Order.user_id == current_user.id)
        .options(joinedload(Order.order_items))
        .order_by(Order.created_at.desc())
    )
    result = []
    for order in rows:
        item = OrderListItem.model_validate(order)
        item.item_count = sum(oi.quantity for oi in order.order_items)
        result.append(item)
    return result


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OrderResponse:
    order = await db.scalar(
        select(Order)
        .where(Order.id == order_id)
        .options(joinedload(Order.order_items))
    )
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return OrderResponse.model_validate(order)
