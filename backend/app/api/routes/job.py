from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import asc, desc, or_
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import require_role
from app.db.session import get_db
from app.models.company import Company
from app.models.job import Job
from app.models.user import User
from app.schemas.job import (
    JobCreate,
    JobListResponse,
    JobResponse,
    JobUpdate,
)


router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"],
)


@router.post(
    "/companies/{company_id}",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_job(
    company_id: int,
    job_data: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    if (
        job_data.salary_min is not None
        and job_data.salary_max is not None
        and job_data.salary_min > job_data.salary_max
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="salary_min cannot be greater than salary_max",
        )

    company = (
        db.query(Company)
        .filter(Company.id == company_id)
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
            detail="Not allowed to post jobs for this company",
        )

    new_job = Job(
        title=job_data.title,
        description=job_data.description,
        location=job_data.location,
        employment_type=job_data.employment_type,
        work_mode=job_data.work_mode,
        experience_required=job_data.experience_required,
        salary_min=job_data.salary_min,
        salary_max=job_data.salary_max,
        salary_currency=job_data.salary_currency,
        contact_email=job_data.contact_email,
        contact_phone=job_data.contact_phone,
        benefits=job_data.benefits,
        preferred_gender=job_data.preferred_gender,
        is_urgent=job_data.is_urgent,
        expires_at=job_data.expires_at,
        company_id=company.id,
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return new_job


@router.get(
    "/my",
    response_model=JobListResponse,
)
def get_my_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    query = (
        db.query(Job)
        .join(
            Company,
            Company.id == Job.company_id,
        )
        .options(
            joinedload(Job.company)
        )
        .filter(
            Company.owner_id == current_user.id
        )
    )

    total = query.count()

    jobs = (
        query
        .order_by(
            desc(Job.created_at)
        )
        .offset(
            (page - 1) * limit
        )
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": jobs,
    }


@router.get(
    "/",
    response_model=JobListResponse,
)
def browse_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    title: str | None = Query(None, min_length=1),
    location: str | None = Query(None, min_length=1),
    work_mode: str | None = Query(None),
    employment_type: str | None = Query(None),
    experience_required: str | None = Query(None),
    min_salary: int | None = Query(None, ge=0),
    max_salary: int | None = Query(None, ge=0),
    is_urgent: bool | None = Query(None),
    posted_within_days: int | None = Query(
        None,
        ge=1,
        le=365,
    ),
    sort: str = Query("newest"),
    db: Session = Depends(get_db),
):
    if (
        min_salary is not None
        and max_salary is not None
        and min_salary > max_salary
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="min_salary cannot be greater than max_salary",
        )

    now = datetime.now(timezone.utc)

    query = (
        db.query(Job)
        .options(
            joinedload(Job.company)
        )
        .filter(
            Job.is_active.is_(True)
        )
        .filter(
            or_(
                Job.expires_at.is_(None),
                Job.expires_at > now,
            )
        )
    )

    if title:
        query = query.filter(
            Job.title.ilike(
                f"%{title.strip()}%"
            )
        )

    if location:
        query = query.filter(
            Job.location.ilike(
                f"%{location.strip()}%"
            )
        )

    if work_mode:
        query = query.filter(
            Job.work_mode == work_mode
        )

    if employment_type:
        query = query.filter(
            Job.employment_type == employment_type
        )

    if experience_required:
        query = query.filter(
            Job.experience_required.ilike(
                f"%{experience_required.strip()}%"
            )
        )

    if min_salary is not None:
        query = query.filter(
            or_(
                Job.salary_max.is_(None),
                Job.salary_max >= min_salary,
            )
        )

    if max_salary is not None:
        query = query.filter(
            or_(
                Job.salary_min.is_(None),
                Job.salary_min <= max_salary,
            )
        )

    if is_urgent is not None:
        query = query.filter(
            Job.is_urgent == is_urgent
        )

    if posted_within_days is not None:
        date_threshold = (
            now
            - timedelta(
                days=posted_within_days
            )
        )

        query = query.filter(
            Job.created_at >= date_threshold
        )

    total = query.count()

    if sort == "newest":
        query = query.order_by(
            desc(Job.created_at)
        )

    elif sort == "oldest":
        query = query.order_by(
            asc(Job.created_at)
        )

    elif sort == "salary_high":
        query = query.order_by(
            desc(Job.salary_max)
        )

    elif sort == "salary_low":
        query = query.order_by(
            asc(Job.salary_min)
        )

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid sort value. Allowed values: "
                "newest, oldest, salary_high, salary_low"
            ),
        )

    offset = (
        page - 1
    ) * limit

    jobs = (
        query
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": jobs,
    }


@router.get(
    "/{job_id}",
    response_model=JobResponse,
)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)

    job = (
        db.query(Job)
        .options(
            joinedload(Job.company)
        )
        .filter(
            Job.id == job_id,
            Job.is_active.is_(True),
            or_(
                Job.expires_at.is_(None),
                Job.expires_at > now,
            ),
        )
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    return job


@router.put(
    "/{job_id}",
    response_model=JobResponse,
)
def update_job(
    job_id: int,
    job_data: JobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    job = (
        db.query(Job)
        .filter(
            Job.id == job_id
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
            detail="You are not allowed to edit this job",
        )

    update_data = job_data.model_dump(
        exclude_unset=True
    )

    new_salary_min = update_data.get(
        "salary_min",
        job.salary_min,
    )

    new_salary_max = update_data.get(
        "salary_max",
        job.salary_max,
    )

    if (
        new_salary_min is not None
        and new_salary_max is not None
        and new_salary_min > new_salary_max
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="salary_min cannot be greater than salary_max",
        )

    for field, value in update_data.items():
        setattr(
            job,
            field,
            value,
        )

    db.commit()
    db.refresh(job)

    return job


@router.patch(
    "/{job_id}/close",
    response_model=JobResponse,
)
def close_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    job = (
        db.query(Job)
        .filter(
            Job.id == job_id
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
            detail="You are not allowed to close this job",
        )

    job.is_active = False

    db.commit()
    db.refresh(job)

    return job


@router.delete(
    "/{job_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter")),
):
    job = (
        db.query(Job)
        .filter(
            Job.id == job_id
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
            detail="You are not allowed to delete this job",
        )

    db.delete(job)
    db.commit()

    return None