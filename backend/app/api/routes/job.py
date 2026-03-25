from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc

from app.db.session import get_db
from app.models.job import Job
from app.models.company import Company
from app.schemas.job import JobCreate, JobResponse, JobListResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post(
    "/companies/{company_id}",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_job(
    company_id: int,
    job_data: JobCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    print("\n=== JOB DEBUG ===")
    print("USER ID:", current_user.id)
    print("ROLE ID:", current_user.role_id)
    print("ROLE NAME:", current_user.role.name)


    if current_user.role is None or current_user.role.name != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only recruiters can post jobs",
        )


    company = db.query(Company).filter(Company.id == company_id).first()

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
        company_id=company.id,
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return new_job



@router.get(
    "/",
    response_model=JobListResponse,
)
def browse_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    sort: str = Query("newest"),
    title: str | None = None,
    db: Session = Depends(get_db),
):

    query = db.query(Job)

    if title:
        query = query.filter(Job.title.ilike(f"%{title}%"))

    total = query.count()


    if sort == "newest":
        query = query.order_by(desc(Job.created_at))
    elif sort == "oldest":
        query = query.order_by(asc(Job.created_at))
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid sort value. Use 'newest' or 'oldest'.",
        )


    offset = (page - 1) * limit
    jobs = query.offset(offset).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": jobs,
    }