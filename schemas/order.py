from datetime import datetime

from pydantic import BaseModel, ConfigDict

from schemas.user import AddressCreate


class OrderCreate(BaseModel):
    address_id: int | None = None
    address_override: AddressCreate | None = None


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int | None
    name: str
    price: float
    quantity: int
    image: str | None


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: str
    subtotal: float
    shipping: float
    total: float
    address_snapshot: dict
    created_at: datetime
    order_items: list[OrderItemResponse]


class OrderListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: str
    total: float
    created_at: datetime
    item_count: int = 0
