from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth.dependencies import get_current_user
from auth.jwt_utils import create_access_token, create_refresh_token, decode_token
from auth.password import hash_password, verify_password
from config import get_settings
from database.session import get_db
from models.refresh_token import RefreshToken
from models.user import User
from schemas.auth import LoginRequest, MeResponse, RegisterRequest

router = APIRouter(prefix="/api/auth", tags=["auth"])

def _cookie_opts() -> dict:
    return dict(httponly=True, samesite="lax", secure=get_settings().cookie_secure)


def _set_auth_cookies(response: Response, access: str, refresh: str, settings) -> None:
    opts = _cookie_opts()
    response.set_cookie(
        "access_token", access,
        max_age=settings.access_token_expire_minutes * 60,
        **opts,
    )
    response.set_cookie(
        "refresh_token", refresh,
        max_age=settings.refresh_token_expire_days * 86400,
        **opts,
    )


@router.post("/register", response_model=MeResponse, status_code=status.HTTP_201_CREATED)
async def register(
    body: RegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> MeResponse:
    settings = get_settings()
    existing = await db.scalar(select(User).where(User.email == body.email))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        first_name=body.first_name,
        last_name=body.last_name,
    )
    db.add(user)
    await db.flush()

    access = create_access_token(user.id, settings)
    raw_refresh, expires_at = create_refresh_token(user.id, settings)
    db.add(RefreshToken(
        user_id=user.id,
        token_hash=hash_password(raw_refresh),
        expires_at=expires_at,
    ))

    _set_auth_cookies(response, access, raw_refresh, settings)
    return MeResponse.model_validate(user)


@router.post("/login", response_model=MeResponse)
async def login(
    body: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> MeResponse:
    settings = get_settings()
    user = await db.scalar(select(User).where(User.email == body.email))
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")

    access = create_access_token(user.id, settings)
    raw_refresh, expires_at = create_refresh_token(user.id, settings)

    db.add(RefreshToken(
        user_id=user.id,
        token_hash=hash_password(raw_refresh),
        expires_at=expires_at,
    ))

    _set_auth_cookies(response, access, raw_refresh, settings)
    return MeResponse.model_validate(user)


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    settings = get_settings()
    raw_refresh = request.cookies.get("refresh_token")
    if raw_refresh:
        result = await db.scalars(
            select(RefreshToken).where(
                RefreshToken.user_id == current_user.id,
                RefreshToken.revoked.is_(False),
            )
        )
        for row in result:
            if verify_password(raw_refresh, row.token_hash):
                row.revoked = True
                break

    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out"}


@router.post("/refresh", response_model=MeResponse)
async def refresh(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> MeResponse:
    settings = get_settings()
    raw_refresh = request.cookies.get("refresh_token")
    if not raw_refresh:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")

    payload = decode_token(raw_refresh, settings)
    if payload.type != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    rows = await db.scalars(
        select(RefreshToken).where(
            RefreshToken.user_id == payload.sub,
            RefreshToken.revoked.is_(False),
        )
    )
    matched: RefreshToken | None = None
    for row in rows:
        if verify_password(raw_refresh, row.token_hash):
            matched = row
            break

    if not matched or matched.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token invalid or expired")

    matched.revoked = True

    user = await db.get(User, payload.sub)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    new_access = create_access_token(user.id, settings)
    new_raw_refresh, new_expires = create_refresh_token(user.id, settings)
    db.add(RefreshToken(
        user_id=user.id,
        token_hash=hash_password(new_raw_refresh),
        expires_at=new_expires,
    ))

    _set_auth_cookies(response, new_access, new_raw_refresh, settings)
    return MeResponse.model_validate(user)


@router.get("/me", response_model=MeResponse)
async def me(current_user: User = Depends(get_current_user)) -> MeResponse:
    return MeResponse.model_validate(current_user)
