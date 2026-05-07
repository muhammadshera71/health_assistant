from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from auth.dependencies import get_current_user
from database.session import get_db
from models.cart_item import CartItem
from models.product import Product
from models.user import User
from schemas.cart import CartItemAdd, CartItemResponse, CartItemUpdate, CartResponse

router = APIRouter(prefix="/api/cart", tags=["cart"])


async def _cart_response(db: AsyncSession, user_id: int) -> CartResponse:
    rows = await db.scalars(
        select(CartItem)
        .where(CartItem.user_id == user_id)
        .options(joinedload(CartItem.product))
    )
    items = list(rows)
    subtotal = sum(float(i.product.price) * i.quantity for i in items)
    return CartResponse(
        items=[CartItemResponse.model_validate(i) for i in items],
        subtotal=round(subtotal, 2),
        item_count=sum(i.quantity for i in items),
    )


@router.get("", response_model=CartResponse)
async def get_cart(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CartResponse:
    return await _cart_response(db, current_user.id)


@router.post("/items", response_model=CartItemResponse)
async def add_item(
    body: CartItemAdd,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CartItemResponse:
    product = await db.get(Product, body.product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    existing = await db.scalar(
        select(CartItem).where(
            CartItem.user_id == current_user.id,
            CartItem.product_id == body.product_id,
        )
    )
    if existing:
        existing.quantity += body.quantity
        item = existing
    else:
        item = CartItem(user_id=current_user.id, product_id=body.product_id, quantity=body.quantity)
        db.add(item)

    await db.flush()
    await db.refresh(item, ["product"])
    return CartItemResponse.model_validate(item)


@router.put("/items/{item_id}", response_model=CartItemResponse)
async def update_item(
    item_id: int,
    body: CartItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CartItemResponse:
    item = await db.get(CartItem, item_id)
    if not item or item.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    item.quantity = body.quantity
    await db.flush()
    await db.refresh(item, ["product"])
    return CartItemResponse.model_validate(item)


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    item = await db.get(CartItem, item_id)
    if not item or item.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")
    await db.delete(item)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    await db.execute(delete(CartItem).where(CartItem.user_id == current_user.id))
