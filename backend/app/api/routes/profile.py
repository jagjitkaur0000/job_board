from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)

from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.session import get_db
from app.models.user import User
from app.schemas.profile import (
    CandidateProfileResponse,
    CandidateProfileUpdate,
)


router = APIRouter(
    prefix="/profile",
    tags=["Candidate Profile"],
)


# ============================================================
# UPLOAD DIRECTORIES
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[3]

UPLOAD_DIR = BASE_DIR / "uploads"

RESUME_DIR = UPLOAD_DIR / "resumes"

PROFILE_PHOTO_DIR = UPLOAD_DIR / "profile_photos"


RESUME_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

PROFILE_PHOTO_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ============================================================
# GET MY PROFILE
# ============================================================

@router.get(
    "/me",
    response_model=CandidateProfileResponse,
)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("applicant")
    ),
):
    return current_user


# ============================================================
# UPDATE PROFILE
# ============================================================

@router.patch(
    "/me",
    response_model=CandidateProfileResponse,
)
def update_my_profile(
    profile_data: CandidateProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("applicant")
    ),
):
    update_data = profile_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            current_user,
            field,
            value,
        )

    db.commit()
    db.refresh(current_user)

    return current_user


# ============================================================
# UPLOAD RESUME
# ============================================================

@router.post(
    "/me/resume",
    response_model=CandidateProfileResponse,
)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("applicant")
    ),
):
    allowed_content_types = {
        "application/pdf",
        "application/msword",
        (
            "application/"
            "vnd.openxmlformats-officedocument."
            "wordprocessingml.document"
        ),
    }

    if file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Only PDF, DOC, and DOCX files "
                "are allowed"
            ),
        )

    file_extension = Path(
        file.filename or ""
    ).suffix.lower()

    if file_extension not in {
        ".pdf",
        ".doc",
        ".docx",
    }:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid resume file extension",
        )

    contents = await file.read()

    max_file_size = 5 * 1024 * 1024

    if len(contents) > max_file_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Resume must not exceed 5 MB"
            ),
        )

    file_name = (
        f"{uuid4()}{file_extension}"
    )

    file_path = RESUME_DIR / file_name

    file_path.write_bytes(contents)

    current_user.resume_url = (
        f"/uploads/resumes/{file_name}"
    )

    db.commit()
    db.refresh(current_user)

    return current_user


# ============================================================
# UPLOAD PROFILE PHOTO
# ============================================================

@router.post(
    "/me/photo",
    response_model=CandidateProfileResponse,
)
async def upload_profile_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("applicant")
    ),
):
    allowed_content_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Only JPEG, PNG, and WEBP images "
                "are allowed"
            ),
        )

    file_extension = Path(
        file.filename or ""
    ).suffix.lower()

    if file_extension not in {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    }:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image file extension",
        )

    contents = await file.read()

    max_file_size = 3 * 1024 * 1024

    if len(contents) > max_file_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Profile photo must not exceed 3 MB"
            ),
        )

    file_name = (
        f"{uuid4()}{file_extension}"
    )

    file_path = (
        PROFILE_PHOTO_DIR / file_name
    )

    file_path.write_bytes(contents)

    current_user.profile_photo_url = (
        f"/uploads/profile_photos/{file_name}"
    )

    db.commit()
    db.refresh(current_user)

    return current_user