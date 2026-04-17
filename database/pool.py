import asyncpg

from config import get_settings


async def init_db() -> asyncpg.Pool:
    s = get_settings()
    return await asyncpg.create_pool(
        host=s.db_host,
        port=s.db_port,
        database=s.db_name,
        user=s.db_user,
        password=s.db_password,
        ssl=s.db_ssl_mode if s.db_ssl_mode != "disable" else None,
        min_size=s.db_min_pool_size,
        max_size=s.db_max_pool_size,
        server_settings={"search_path": "renal_consultants,public"},
    )


async def close_db(pool: asyncpg.Pool) -> None:
    await pool.close()
