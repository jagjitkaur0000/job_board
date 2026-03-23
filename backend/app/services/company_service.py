from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.user import User


def create_company(
    db: Session,
    recruiter: User,
    name: str,
) -> Company:

    existing_company = (
        db.query(Company)
        .filter(Company.owner_id == recruiter.id)
        .first()
    )

    if existing_company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recruiter already has a company",
        )

    company = Company(
        name=name,
        owner_id=recruiter.id
    )

    db.add(company)
    db.commit()
    db.refresh(company)

    return company