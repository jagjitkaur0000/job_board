from datetime import datetime, timezone
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

from app.models.application import Application
from app.models.company import Company
from app.models.job import Job
from app.models.notification import Notification
from app.models.user import User

from app.schemas.application import (
    ApplicantResponse,
    ApplicationResponse,
    ApplicationStatusUpdate,
)


router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
)


# ============================================================
# APPLY TO JOB
# ============================================================

@router.post(
    "/jobs/{job_id}/apply",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def apply_to_job(
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

    if not job.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This job is closed",
        )

    now = datetime.now(timezone.utc)

    if (
        job.expires_at is not None
        and job.expires_at <= now
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This job has expired",
        )

    existing_application = (
        db.query(Application)
        .filter(
            Application.user_id == current_user.id,
            Application.job_id == job_id,
        )
        .first()
    )

    if existing_application:
        if existing_application.status == "withdrawn":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "You previously withdrew your "
                    "application for this job"
                ),
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already applied to this job",
        )

    new_application = Application(
        user_id=current_user.id,
        job_id=job_id,
        status="applied",
    )

    db.add(new_application)
    db.commit()
    db.refresh(new_application)

    return new_application


# ============================================================
# GET MY APPLICATIONS
# ============================================================

@router.get(
    "",
    response_model=List[ApplicationResponse],
)
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("applicant")
    ),
):
    return (
        db.query(Application)
        .filter(
            Application.user_id == current_user.id
        )
        .order_by(
            Application.created_at.desc()
        )
        .all()
    )


# ============================================================
# WITHDRAW APPLICATION
# ============================================================

@router.patch(
    "/{application_id}/withdraw",
    response_model=ApplicationResponse,
)
def withdraw_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("applicant")
    ),
):
    application = (
        db.query(Application)
        .filter(
            Application.id == application_id
        )
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    if application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You are not allowed to withdraw "
                "this application"
            ),
        )

    if application.status == "withdrawn":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application is already withdrawn",
        )

    if application.status == "hired":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "A hired application cannot be withdrawn"
            ),
        )

    application.status = "withdrawn"
    application.withdrawn_at = datetime.now(
        timezone.utc
    )

    db.commit()
    db.refresh(application)

    return application


# ============================================================
# RECRUITER: VIEW APPLICANTS
# ============================================================

@router.get(
    "/jobs/{job_id}/applicants",
    response_model=List[ApplicantResponse],
)
def get_job_applicants(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("recruiter")
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

    company = (
        db.query(Company)
        .filter(
            Company.id == job.company_id
        )
        .first()
    )

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    if company.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You are not allowed to view applicants "
                "for this job"
            ),
        )

    applications = (
        db.query(
            Application,
            User.email.label("applicant_email"),
            User.full_name.label("applicant_name"),
            User.phone.label("applicant_phone"),
            User.resume_url.label("resume_url"),
            User.profile_photo_url.label(
                "profile_photo_url"
            ),
        )
        .join(
            User,
            User.id == Application.user_id,
        )
        .filter(
            Application.job_id == job_id
        )
        .order_by(
            Application.created_at.desc()
        )
        .all()
    )

    result = []

    for (
        application,
        applicant_email,
        applicant_name,
        applicant_phone,
        resume_url,
        profile_photo_url,
    ) in applications:
        result.append(
            {
                "id": application.id,
                "user_id": application.user_id,
                "job_id": application.job_id,
                "status": application.status,
                "created_at": application.created_at,
                "withdrawn_at": application.withdrawn_at,
                "applicant_email": applicant_email,
                "applicant_name": applicant_name,
                "applicant_phone": applicant_phone,
                "resume_url": resume_url,
                "profile_photo_url": profile_photo_url,
            }
        )

    return result


# ============================================================
# RECRUITER: UPDATE APPLICATION STATUS
# ============================================================

@router.patch(
    "/{application_id}/status",
    response_model=ApplicationResponse,
)
def update_application_status(
    application_id: int,
    status_data: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("recruiter")
    ),
):
    application = (
        db.query(Application)
        .filter(
            Application.id == application_id
        )
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    if application.status == "withdrawn":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "A withdrawn application cannot be updated"
            ),
        )

    job = (
        db.query(Job)
        .filter(
            Job.id == application.job_id
        )
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    company = (
        db.query(Company)
        .filter(
            Company.id == job.company_id
        )
        .first()
    )

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    if company.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You are not allowed to update "
                "this application"
            ),
        )

    allowed_statuses = {
        "applied",
        "reviewing",
        "shortlisted",
        "rejected",
        "hired",
    }

    new_status = (
        status_data.status
        .strip()
        .lower()
    )

    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid status. Allowed values: "
                "applied, reviewing, shortlisted, "
                "rejected, hired"
            ),
        )

    old_status = application.status

    application.status = new_status

    if old_status != new_status:
        notification = Notification(
            user_id=application.user_id,
            application_id=application.id,
            type="application_status",
            title="Application status updated",
            message=(
                f"Your application for "
                f"'{job.title}' has been updated to "
                f"'{new_status}'."
            ),
            is_read=False,
        )

        db.add(notification)

    db.commit()
    db.refresh(application)

    return application