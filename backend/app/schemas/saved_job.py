from datetime import datetime

from pydantic import BaseModel


class SavedJobResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    created_at: datetime

    class Config:
        from_attributes = True