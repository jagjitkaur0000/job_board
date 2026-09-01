from datetime import datetime
from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
)


# ============================================================
# APPLICATION
# ============================================================

class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    status: str
    created_at: datetime
    withdrawn_at: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True
    )


class ApplicantResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    status: str
    created_at: datetime
    withdrawn_at: Optional[datetime] = None

    applicant_email: EmailStr
    applicant_name: Optional[str] = None
    applicant_phone: Optional[str] = None
    resume_url: Optional[str] = None
    profile_photo_url: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True
    )


class ApplicationStatusUpdate(BaseModel):
    status: str = Field(
        ...,
        min_length=3,
        max_length=50,
    )


# ============================================================
# INTERVIEW
# ============================================================

class InterviewCreate(BaseModel):
    scheduled_at: datetime

    meeting_link: Optional[str] = Field(
        default=None,
        max_length=1000,
    )

    message: Optional[str] = Field(
        default=None,
        max_length=2000,
    )


class InterviewUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None

    meeting_link: Optional[str] = Field(
        default=None,
        max_length=1000,
    )

    message: Optional[str] = Field(
        default=None,
        max_length=2000,
    )

    status: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=50,
    )


class InterviewResponse(BaseModel):
    id: int
    application_id: int
    recruiter_id: int
    candidate_id: int
    scheduled_at: datetime
    meeting_link: Optional[str] = None
    message: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True
    )