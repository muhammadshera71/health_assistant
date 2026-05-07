"""lumiere e-commerce schema

Revision ID: 0003
Revises: 0002
Create Date: 2026-04-28
"""

from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE SCHEMA IF NOT EXISTS lumiere")

    op.execute("""
        CREATE TABLE lumiere.users (
            id          BIGSERIAL PRIMARY KEY,
            email       TEXT NOT NULL,
            hashed_password TEXT NOT NULL,
            first_name  TEXT NOT NULL DEFAULT '',
            last_name   TEXT NOT NULL DEFAULT '',
            is_active   BOOLEAN NOT NULL DEFAULT TRUE,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("CREATE UNIQUE INDEX lumiere_users_email_idx ON lumiere.users (email)")

    op.execute("""
        CREATE TABLE lumiere.refresh_tokens (
            id          BIGSERIAL PRIMARY KEY,
            user_id     BIGINT NOT NULL REFERENCES lumiere.users(id) ON DELETE CASCADE,
            token_hash  TEXT NOT NULL,
            expires_at  TIMESTAMPTZ NOT NULL,
            revoked     BOOLEAN NOT NULL DEFAULT FALSE,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute(
        "CREATE INDEX lumiere_refresh_tokens_user_revoked_idx "
        "ON lumiere.refresh_tokens (user_id, revoked)"
    )

    op.execute("""
        CREATE TABLE lumiere.addresses (
            id          BIGSERIAL PRIMARY KEY,
            user_id     BIGINT NOT NULL REFERENCES lumiere.users(id) ON DELETE CASCADE,
            label       TEXT NOT NULL DEFAULT 'Home',
            line1       TEXT NOT NULL,
            line2       TEXT,
            city        TEXT NOT NULL,
            postcode    TEXT NOT NULL,
            country     TEXT NOT NULL DEFAULT 'United Kingdom',
            is_default  BOOLEAN NOT NULL DEFAULT FALSE,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX lumiere_addresses_user_idx ON lumiere.addresses (user_id)")

    op.execute("""
        CREATE TABLE lumiere.products (
            id           BIGSERIAL PRIMARY KEY,
            slug         TEXT NOT NULL,
            name         TEXT NOT NULL,
            type         TEXT,
            price        NUMERIC(10,2) NOT NULL,
            size         TEXT,
            short_desc   TEXT,
            description  TEXT,
            skin_types   TEXT[] NOT NULL DEFAULT '{}',
            concerns     TEXT[] NOT NULL DEFAULT '{}',
            ingredients  TEXT[] NOT NULL DEFAULT '{}',
            how_to_use   TEXT,
            image        TEXT,
            images       TEXT[] NOT NULL DEFAULT '{}',
            rating       NUMERIC(3,2) NOT NULL DEFAULT 0.0,
            review_count INTEGER NOT NULL DEFAULT 0,
            badge        TEXT,
            in_stock     BOOLEAN NOT NULL DEFAULT TRUE,
            featured     BOOLEAN NOT NULL DEFAULT FALSE,
            created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("CREATE UNIQUE INDEX lumiere_products_slug_idx ON lumiere.products (slug)")
    op.execute("CREATE INDEX lumiere_products_featured_idx ON lumiere.products (featured)")

    op.execute("""
        CREATE TABLE lumiere.cart_items (
            id          BIGSERIAL PRIMARY KEY,
            user_id     BIGINT NOT NULL REFERENCES lumiere.users(id) ON DELETE CASCADE,
            product_id  BIGINT NOT NULL REFERENCES lumiere.products(id) ON DELETE CASCADE,
            quantity    INTEGER NOT NULL DEFAULT 1,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT uq_cart_user_product UNIQUE (user_id, product_id)
        )
    """)

    op.execute("""
        CREATE TABLE lumiere.orders (
            id               BIGSERIAL PRIMARY KEY,
            user_id          BIGINT NOT NULL REFERENCES lumiere.users(id) ON DELETE SET NULL,
            status           TEXT NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
            subtotal         NUMERIC(10,2) NOT NULL,
            shipping         NUMERIC(10,2) NOT NULL DEFAULT 0,
            total            NUMERIC(10,2) NOT NULL,
            address_snapshot JSONB NOT NULL DEFAULT '{}'::JSONB,
            created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute(
        "CREATE INDEX lumiere_orders_user_created_idx "
        "ON lumiere.orders (user_id, created_at DESC)"
    )

    op.execute("""
        CREATE TABLE lumiere.order_items (
            id          BIGSERIAL PRIMARY KEY,
            order_id    BIGINT NOT NULL REFERENCES lumiere.orders(id) ON DELETE CASCADE,
            product_id  BIGINT REFERENCES lumiere.products(id) ON DELETE SET NULL,
            name        TEXT NOT NULL,
            price       NUMERIC(10,2) NOT NULL,
            quantity    INTEGER NOT NULL,
            image       TEXT
        )
    """)


def downgrade() -> None:
    op.execute("DROP SCHEMA IF EXISTS lumiere CASCADE")
