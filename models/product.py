from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, LUMIERE_SCHEMA


class Product(Base):
    __tablename__ = "products"
    __table_args__ = {"schema": LUMIERE_SCHEMA}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str | None] = mapped_column(String, nullable=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    size: Mapped[str | None] = mapped_column(String, nullable=True)
    short_desc: Mapped[str | None] = mapped_column(String, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    skin_types: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    concerns: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    ingredients: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    how_to_use: Mapped[str | None] = mapped_column(Text, nullable=True)
    image: Mapped[str | None] = mapped_column(String, nullable=True)
    images: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    rating: Mapped[float] = mapped_column(Numeric(3, 2), default=0.0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    badge: Mapped[str | None] = mapped_column(String, nullable=True)
    in_stock: Mapped[bool] = mapped_column(Boolean, default=True)
    featured: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    cart_items: Mapped[list["CartItem"]] = relationship(back_populates="product")  # noqa: F821
    order_items: Mapped[list["OrderItem"]] = relationship(back_populates="product")  # noqa: F821
