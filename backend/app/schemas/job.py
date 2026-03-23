from pydantic import BaseModel, Field
from datetime import datetime
from typing import List


class JobCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)


class JobResponse(BaseModel):
    id: int
    title: str
    description: str
    company_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    total: int
    page: int
    items: List[JobResponse]