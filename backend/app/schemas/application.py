from pydantic import BaseModel
from datetime import datetime


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True