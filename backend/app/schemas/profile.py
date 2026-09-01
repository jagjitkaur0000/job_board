from typing import Optional

from pydantic import BaseModel, Field


class CandidateProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=255,
    )

    phone: Optional[str] = Field(
        None,
        max_length=50,
    )

    preferred_locations: Optional[list[str]] = None


class CandidateProfileResponse(BaseModel):
    id: int
    email: str

    full_name: Optional[str] = None
    phone: Optional[str] = None

    preferred_locations: Optional[list[str]] = None

    resume_url: Optional[str] = None
    profile_photo_url: Optional[str] = None

    email_verified: bool

    class Config:
        from_attributes = True