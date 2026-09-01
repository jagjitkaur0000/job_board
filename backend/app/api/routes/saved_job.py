from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.session import get_db
from app.models.job import Job
from app.models.saved_job import SavedJob
from app.models.user import User
from app.schemas.saved_job import SavedJobResponse


router = APIRouter(
    prefix="/saved-jobs",
    tags=["Saved Jobs"],
)


# ============================================================
# SAVE JOB
# ============================================================

@router.post(
    "/{job_id}",
    response_model=SavedJobResponse,
    status_code=status.HTTP_201_CREATED,
)
def save_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("applicant")
    ),
):
    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    existing_saved_job = (
        db.query(SavedJob)
        .filter(
            SavedJob.user_id == current_user.id,
            SavedJob.job_id == job_id,
        )
        .first()
    )

    if existing_saved_job:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job is already saved",
        )

    saved_job = SavedJob(
        user_id=current_user.id,
        job_id=job_id,
    )

    db.add(saved_job)
    db.commit()
    db.refresh(saved_job)

    return saved_job


# ============================================================
# GET MY SAVED JOBS
# ============================================================

@router.get(
    "",
    response_model=List[SavedJobResponse],
)
def get_my_saved_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("applicant")
    ),
):
    saved_jobs = (
        db.query(SavedJob)
        .filter(
            SavedJob.user_id == current_user.id
        )
        .order_by(
            SavedJob.created_at.desc()
        )
        .all()
    )

    return saved_jobs


# ============================================================
# REMOVE SAVED JOB
# ============================================================

@router.delete(
    "/{job_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_saved_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("applicant")
    ),
):
    saved_job = (
        db.query(SavedJob)
        .filter(
            SavedJob.user_id == current_user.id,
            SavedJob.job_id == job_id,
        )
        .first()
    )

    if not saved_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved job not found",
        )

    db.delete(saved_job)
    db.commit()

    return None