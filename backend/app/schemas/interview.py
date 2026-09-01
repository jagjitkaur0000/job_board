from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


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

    class Config:
        from_attributes = True