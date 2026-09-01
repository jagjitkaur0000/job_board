from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)

from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.core.dependencies import require_role


router = APIRouter(
    prefix="/candidate",
    tags=["Candidate Files"],
)


UPLOAD_DIR = Path("uploads")

RESUME_DIR = UPLOAD_DIR / "resumes"
PHOTO_DIR = UPLOAD_DIR / "profile_photos"

RESUME_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

PHOTO_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


@router.post("/resume")
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("applicant")
    ),
):
    allowed_extensions = {
        ".pdf",
        ".doc",
        ".docx",
    }

    extension = Path(file.filename).suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOC and DOCX files are allowed",
        )

    filename = (
        f"user_{current_user.id}_resume{extension}"
    )

    file_path = RESUME_DIR / filename

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    current_user.resume = str(file_path)

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Resume uploaded successfully",
        "filename": filename,
    }

@router.post("/profile-photo")
def upload_profile_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("applicant")
    ),
):
    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    }

    extension = Path(file.filename).suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG, PNG and WEBP files are allowed",
        )

    filename = (
        f"user_{current_user.id}_photo{extension}"
    )

    file_path = PHOTO_DIR / filename

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    current_user.profile_photo = str(file_path)

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile photo uploaded successfully",
        "filename": filename,
    }