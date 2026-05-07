from pydantic import BaseModel, ConfigDict


class ProductListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    type: str | None
    price: float
    size: str | None
    short_desc: str | None
    image: str | None
    rating: float
    review_count: int
    badge: str | None
    in_stock: bool
    featured: bool


class ProductDetail(ProductListItem):
    description: str | None
    skin_types: list[str]
    concerns: list[str]
    ingredients: list[str]
    how_to_use: str | None
    images: list[str]


class ProductListResponse(BaseModel):
    products: list[ProductListItem]
    total: int
