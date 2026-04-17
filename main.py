from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse

from database import close_db, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    pool = await init_db()
    app.state.db_pool = pool
    try:
        yield
    finally:
        await close_db(pool)


app = FastAPI(title="Healthcare AI Assistant", lifespan=lifespan)


@app.get("/", include_in_schema=False)
async def root() -> RedirectResponse:
    return RedirectResponse(url="/docs")


@app.get("/health")
async def health() -> dict:
    pool = app.state.db_pool
    try:
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"db unavailable: {exc}") from exc
    return {"status": "ok", "db": "up"}
