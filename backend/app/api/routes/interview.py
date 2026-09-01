from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.session import get_db

from app.models.application import Application
from app.models.company import Company
from app.models.interview import Interview
from app.models.job import Job
from app.models.notification import Notification
from app.models.user import User

from app.schemas.application import (
    InterviewCreate,
    InterviewResponse,
    InterviewUpdate,
)

from app.services.email_service import (
    send_interview_scheduled_email,
)


router = APIRouter(
    prefix="/interviews",
    tags=["Interviews"],
)


# ============================================================
# RECRUITER: CREATE / SCHEDULE INTERVIEW
# ============================================================

@router.post(
    "/applications/{application_id}",
    response_model=InterviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_interview(
    application_id: int,
    interview_data: InterviewCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("recruiter")
    ),
):
    # --------------------------------------------------------
    # Find application
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Validate application status
    # --------------------------------------------------------

    if application.status in {
        "withdrawn",
        "rejected",
        "hired",
    }:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Interview cannot be scheduled for "
                "this application status"
            ),
        )

    # --------------------------------------------------------
    # Find job
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Find company
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Verify recruiter owns company
    # --------------------------------------------------------

    if company.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You are not allowed to schedule "
                "this interview"
            ),
        )

    # --------------------------------------------------------
    # Only shortlisted / accepted candidates
    # --------------------------------------------------------

    if application.status not in {
        "shortlisted",
        "accepted",
    }:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Only shortlisted or accepted candidates "
                "can have an interview scheduled"
            ),
        )

    # --------------------------------------------------------
    # Prevent duplicate interview
    # --------------------------------------------------------

    existing = (
        db.query(Interview)
        .filter(
            Interview.application_id == application_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "An interview has already been scheduled "
                "for this candidate"
            ),
        )

    # --------------------------------------------------------
    # Validate interview time
    # --------------------------------------------------------

    scheduled_at = interview_data.scheduled_at

    if scheduled_at.tzinfo is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="scheduled_at must include a timezone",
        )

    # Convert comparison safely to UTC
    scheduled_at_utc = scheduled_at.astimezone(timezone.utc)

    if scheduled_at_utc <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interview time must be in the future",
        )

    # --------------------------------------------------------
    # Find candidate
    # --------------------------------------------------------

    candidate = (
        db.query(User)
        .filter(
            User.id == application.user_id
        )
        .first()
    )

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found",
        )

    # --------------------------------------------------------
    # Create interview
    # --------------------------------------------------------

    interview = Interview(
        application_id=application.id,
        recruiter_id=current_user.id,
        candidate_id=application.user_id,
        scheduled_at=scheduled_at,
        meeting_link=interview_data.meeting_link,
        message=interview_data.message,
        status="scheduled",
    )

    db.add(interview)

    # --------------------------------------------------------
    # Create candidate in-app notification
    # --------------------------------------------------------

    notification_message = (
        f"Your interview for '{job.title}' has been "
        f"scheduled for "
        f"{scheduled_at.strftime('%d %b %Y, %H:%M %Z')}."
    )

    if interview_data.meeting_link:
        notification_message += (
            f" Meeting link: "
            f"{interview_data.meeting_link}"
        )

    if interview_data.message:
        notification_message += (
            f" Message from recruiter: "
            f"{interview_data.message}"
        )

    notification = Notification(
        user_id=application.user_id,
        application_id=application.id,
        type="interview_scheduled",
        title="Interview scheduled",
        message=notification_message,
        is_read=False,
    )

    db.add(notification)

    # --------------------------------------------------------
    # Commit interview + notification
    # --------------------------------------------------------

    db.commit()
    db.refresh(interview)

    # --------------------------------------------------------
    # Candidate name
    # --------------------------------------------------------

    candidate_name = (
        getattr(candidate, "full_name", None)
        or getattr(candidate, "name", None)
        or candidate.email
    )

    # --------------------------------------------------------
    # Company name
    # --------------------------------------------------------

    company_name = (
        company.name
        if company.name
        else "Job Board Company"
    )

    # --------------------------------------------------------
    # Format interview date
    # --------------------------------------------------------

    scheduled_at_text = scheduled_at.strftime(
        "%d %b %Y, %H:%M %Z"
    )

    # --------------------------------------------------------
    # Send candidate email in background
    # --------------------------------------------------------

    background_tasks.add_task(
        send_interview_scheduled_email,
        candidate.email,
        candidate_name,
        job.title,
        company_name,
        scheduled_at_text,
        interview.meeting_link,
        interview.message,
    )

    return interview


# ============================================================
# CANDIDATE: GET MY INTERVIEWS
# ============================================================

@router.get(
    "/my",
    response_model=list[InterviewResponse],
)
def get_my_interviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("applicant")
    ),
):
    return (
        db.query(Interview)
        .filter(
            Interview.candidate_id == current_user.id
        )
        .order_by(
            Interview.scheduled_at.asc()
        )
        .all()
    )


# ============================================================
# CANDIDATE: GET INTERVIEW
# ============================================================

@router.get(
    "/{interview_id}",
    response_model=InterviewResponse,
)
def get_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("applicant")
    ),
):
    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id
        )
        .first()
    )

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found",
        )

    if interview.candidate_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You are not allowed to view "
                "this interview"
            ),
        )

    return interview


# ============================================================
# RECRUITER: UPDATE INTERVIEW
# ============================================================

@router.patch(
    "/{interview_id}",
    response_model=InterviewResponse,
)
def update_interview(
    interview_id: int,
    interview_data: InterviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("recruiter")
    ),
):
    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.recruiter_id == current_user.id,
        )
        .first()
    )

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found",
        )

    # --------------------------------------------------------
    # Update scheduled time
    # --------------------------------------------------------

    if interview_data.scheduled_at is not None:

        scheduled_at = (
            interview_data.scheduled_at
        )

        if scheduled_at.tzinfo is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "scheduled_at must include "
                    "a timezone"
                ),
            )

        scheduled_at_utc = (
            scheduled_at.astimezone(timezone.utc)
        )

        if scheduled_at_utc <= datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Interview time must be "
                    "in the future"
                ),
            )

        interview.scheduled_at = scheduled_at

    # --------------------------------------------------------
    # Update meeting link
    # --------------------------------------------------------

    if interview_data.meeting_link is not None:
        interview.meeting_link = (
            interview_data.meeting_link
        )

    # --------------------------------------------------------
    # Update message
    # --------------------------------------------------------

    if interview_data.message is not None:
        interview.message = (
            interview_data.message
        )

    # --------------------------------------------------------
    # Update status
    # --------------------------------------------------------

    if interview_data.status is not None:

        allowed_statuses = {
            "scheduled",
            "completed",
            "cancelled",
            "rescheduled",
        }

        new_status = (
            interview_data.status
            .strip()
            .lower()
        )

        if new_status not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid interview status. "
                    "Allowed values: scheduled, "
                    "completed, cancelled, "
                    "rescheduled"
                ),
            )

        interview.status = new_status

    # --------------------------------------------------------
    # Notify candidate
    # --------------------------------------------------------

    notification = Notification(
        user_id=interview.candidate_id,
        application_id=interview.application_id,
        type="interview_updated",
        title="Interview updated",
        message=(
            "Your interview details have been "
            "updated by the recruiter."
        ),
        is_read=False,
    )

    db.add(notification)

    db.commit()
    db.refresh(interview)

    return interview