import logging

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
)

from sqlalchemy.orm import Session

from app.core.dependencies import (
    require_role,
)

from app.db.session import get_db

from app.models.user import User

from app.services.email_service import (
    send_job_recommendation_email,
)

from app.services.recommendation_service import (
    get_recommended_jobs_for_user,
)


logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)


@router.post(
    "/send",
)
def send_recommendations(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("applicant")
    ),
):

    jobs = get_recommended_jobs_for_user(
        db,
        current_user,
        limit=10,
    )

    if not jobs:

        return {
            "message": (
                "No matching jobs found"
            ),
            "jobs_found": 0,
        }

    candidate_name = (
        current_user.full_name
        if current_user.full_name
        else current_user.email
    )

    background_tasks.add_task(
        send_job_recommendation_email,
        current_user.email,
        candidate_name,
        jobs,
    )

    return {
        "message": (
            "Recommendation email scheduled"
        ),
        "jobs_found": len(jobs),
    }