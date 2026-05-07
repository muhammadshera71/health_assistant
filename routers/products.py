from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from models.product import Product
from schemas.product import ProductDetail, ProductListItem, ProductListResponse

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=ProductListResponse)
async def list_products(
    db: AsyncSession = Depends(get_db),
    skin_type: str | None = Query(None),
    concern: str | None = Query(None),
    type: str | None = Query(None),
    featured: bool | None = Query(None),
    in_stock: bool | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> ProductListResponse:
    stmt = select(Product)

    if skin_type:
        stmt = stmt.where(Product.skin_types.any(skin_type))
    if concern:
        stmt = stmt.where(Product.concerns.any(concern))
    if type is not None:
        stmt = stmt.where(Product.type == type)
    if featured is not None:
        stmt = stmt.where(Product.featured == featured)
    if in_stock is not None:
        stmt = stmt.where(Product.in_stock == in_stock)

    total = await db.scalar(select(func.count()).select_from(stmt.subquery()))
    rows = await db.scalars(stmt.offset(offset).limit(limit))

    return ProductListResponse(
        products=[ProductListItem.model_validate(p) for p in rows],
        total=total or 0,
    )


@router.get("/{slug}", response_model=ProductDetail)
async def get_product(slug: str, db: AsyncSession = Depends(get_db)) -> ProductDetail:
    product = await db.scalar(select(Product).where(Product.slug == slug))
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return ProductDetail.model_validate(product)
