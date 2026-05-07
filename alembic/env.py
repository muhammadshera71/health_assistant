import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

from config import get_settings

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


def get_url() -> str:
    s = get_settings()
    ssl = f"?ssl={s.db_ssl_mode}" if s.db_ssl_mode != "disable" else ""
    return f"postgresql+asyncpg://{s.db_user}:{s.db_password}@{s.db_host}:{s.db_port}/{s.db_name}{ssl}"


def run_migrations_offline() -> None:
    context.configure(
        url=get_url(),
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    engine = create_async_engine(get_url())
    async with engine.connect() as connection:
        await connection.run_sync(_run_sync_migrations)
    await engine.dispose()


def _run_sync_migrations(sync_conn):
    context.configure(connection=sync_conn)
    with context.begin_transaction():
        context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
