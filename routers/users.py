from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth.dependencies import get_current_user
from database.session import get_db
from models.address import Address
from models.user import User
from schemas.user import AddressCreate, AddressResponse, ProfileResponse, ProfileUpdateRequest

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user)) -> ProfileResponse:
    return ProfileResponse.model_validate(current_user)


@router.put("/profile", response_model=ProfileResponse)
async def update_profile(
    body: ProfileUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProfileResponse:
    if body.first_name is not None:
        current_user.first_name = body.first_name
    if body.last_name is not None:
        current_user.last_name = body.last_name
    db.add(current_user)
    return ProfileResponse.model_validate(current_user)


@router.get("/addresses", response_model=list[AddressResponse])
async def list_addresses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[AddressResponse]:
    rows = await db.scalars(select(Address).where(Address.user_id == current_user.id))
    return [AddressResponse.model_validate(r) for r in rows]


@router.post("/addresses", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
async def create_address(
    body: AddressCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AddressResponse:
    if body.is_default:
        existing = await db.scalars(select(Address).where(Address.user_id == current_user.id))
        for addr in existing:
            addr.is_default = False

    address = Address(user_id=current_user.id, **body.model_dump())
    db.add(address)
    await db.flush()
    return AddressResponse.model_validate(address)


@router.delete("/addresses/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(
    address_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    address = await db.get(Address, address_id)
    if not address or address.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
    await db.delete(address)
