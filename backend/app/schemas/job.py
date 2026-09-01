from datetime import datetime
from typing import List, Literal, Optional

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
)


EmploymentType = Literal[
    "full_time",
    "part_time",
    "contract",
    "internship",
    "freelance",
]

WorkMode = Literal[
    "onsite",
    "remote",
    "hybrid",
]


class JobCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=3,
        max_length=255,
    )

    description: str = Field(
        ...,
        min_length=10,
    )

    location: Optional[str] = Field(
        None,
        max_length=255,
    )

    employment_type: EmploymentType = (
        "full_time"
    )

    work_mode: WorkMode = "onsite"

    experience_required: Optional[str] = Field(
        None,
        max_length=100,
    )

    salary_min: Optional[int] = Field(
        None,
        ge=0,
    )

    salary_max: Optional[int] = Field(
        None,
        ge=0,
    )

    salary_currency: Optional[str] = Field(
        "INR",
        max_length=10,
    )

    contact_email: Optional[EmailStr] = None

    contact_phone: Optional[str] = Field(
        None,
        max_length=50,
    )

    benefits: Optional[str] = None

    preferred_gender: Optional[str] = Field(
        None,
        max_length=20,
    )

    is_urgent: bool = False

    expires_at: Optional[datetime] = None


class JobUpdate(BaseModel):
    title: Optional[str] = Field(
        None,
        min_length=3,
        max_length=255,
    )

    description: Optional[str] = Field(
        None,
        min_length=10,
    )

    location: Optional[str] = Field(
        None,
        max_length=255,
    )

    employment_type: Optional[
        EmploymentType
    ] = None

    work_mode: Optional[WorkMode] = None

    experience_required: Optional[str] = Field(
        None,
        max_length=100,
    )

    salary_min: Optional[int] = Field(
        None,
        ge=0,
    )

    salary_max: Optional[int] = Field(
        None,
        ge=0,
    )

    salary_currency: Optional[str] = Field(
        None,
        max_length=10,
    )

    contact_email: Optional[EmailStr] = None

    contact_phone: Optional[str] = Field(
        None,
        max_length=50,
    )

    benefits: Optional[str] = None

    preferred_gender: Optional[str] = Field(
        None,
        max_length=20,
    )

    is_urgent: Optional[bool] = None

    expires_at: Optional[datetime] = None


class CompanyPublic(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class JobResponse(BaseModel):
    id: int

    title: str
    description: str

    location: Optional[str]

    employment_type: str
    work_mode: str

    experience_required: Optional[str]

    salary_min: Optional[int]
    salary_max: Optional[int]
    salary_currency: Optional[str]

    contact_email: Optional[str]
    contact_phone: Optional[str]

    benefits: Optional[str]

    preferred_gender: Optional[str]

    is_urgent: bool

    expires_at: Optional[datetime]

    is_active: bool

    company_id: int

    company: CompanyPublic

    created_at: datetime

    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[JobResponse]