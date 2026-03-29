from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.job import Job
from app.models.application import Application
from app.schemas.application import ApplicationResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/applications", tags=["Applications"])


# APPLY TO JOB
@router.post(
    "/jobs/{job_id}/apply",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def apply_to_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    if current_user.role is None or current_user.role.name != "applicant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only applicants can apply to jobs",
        )

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    existing_application = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.job_id == job_id
    ).first()

    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already applied to this job",
        )

    new_application = Application(
        user_id=current_user.id,
        job_id=job_id,
        status="applied"
    )

    db.add(new_application)
    db.commit()
    db.refresh(new_application)

    return new_application


# GET MY APPLICATIONS
@router.get(
    "",
    response_model=List[ApplicationResponse]
)
def get_my_applications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    applications = db.query(Application).filter(
        Application.user_id == current_user.id
    ).all()

    return applications