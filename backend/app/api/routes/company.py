from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.company import CompanyCreate, CompanyResponse
from app.services.company_service import create_company
from app.core.dependencies import require_role
from app.models.user import User

router = APIRouter(
    prefix="/companies",
    tags=["Companies"]
)


@router.post(
    "/",
    response_model=CompanyResponse,
    status_code=status.HTTP_201_CREATED
)
def create_company_route(
    company_in: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter"))
):
    """
    Create a company.

    Access: recruiter only
    """

    company = create_company(
        db=db,
        recruiter=current_user,
        name=company_in.name
    )

    return company