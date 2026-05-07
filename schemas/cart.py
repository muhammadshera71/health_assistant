from pydantic import BaseModel, ConfigDict, Field

from schemas.product import ProductListItem


class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = Field(ge=1, default=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)


class CartItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    product: ProductListItem


class CartResponse(BaseModel):
    items: list[CartItemResponse]
    subtotal: float
    item_count: int
