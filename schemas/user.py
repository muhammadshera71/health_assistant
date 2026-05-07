from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProfileUpdateRequest(BaseModel):
    first_name: str | None = None
    last_name: str | None = None


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    first_name: str
    last_name: str
    created_at: datetime


class AddressCreate(BaseModel):
    label: str = "Home"
    line1: str
    line2: str | None = None
    city: str
    postcode: str
    country: str = "United Kingdom"
    is_default: bool = False


class AddressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    label: str
    line1: str
    line2: str | None
    city: str
    postcode: str
    country: str
    is_default: bool
