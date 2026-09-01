from sqlalchemy.orm import Session, joinedload

from app.models.job import Job
from app.models.user import User


def get_recommended_jobs_for_user(
    db: Session,
    user: User,
    limit: int = 10,
) -> list[Job]:

    if not user.preferred_locations:
        return []

    locations = [
        str(location).strip()
        for location in user.preferred_locations
        if str(location).strip()
    ]

    if not locations:
        return []

    query = (
        db.query(Job)
        .options(
            joinedload(Job.company)
        )
        .filter(
            Job.is_active.is_(True)
        )
    )

    location_filters = []

    for location in locations:

        location_filters.append(
            Job.location.ilike(
                f"%{location}%"
            )
        )

    from sqlalchemy import or_

    query = query.filter(
        or_(*location_filters)
    )

    jobs = (
        query
        .order_by(
            Job.created_at.desc()
        )
        .limit(limit)
        .all()
    )

    return jobs