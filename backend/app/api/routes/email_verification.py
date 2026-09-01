import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db

from app.models.user import User
from app.models.email_verification import (
    EmailVerificationOTP,
)

from app.schemas.email import (
    ResendVerificationRequest,
    VerifyEmailRequest,
)

from app.services.email_service import (
    send_verification_email,
)


router = APIRouter(
    prefix="/email-verification",
    tags=["Email Verification"],
)


def generate_otp() -> str:

    return f"{secrets.randbelow(1_000_000):06d}"


def hash_otp(otp: str) -> str:

    value = (
        f"{otp}:"
        f"{settings.EMAIL_OTP_SECRET}"
    )

    return hashlib.sha256(
        value.encode("utf-8")
    ).hexdigest()


def create_otp_for_user(
    db: Session,
    user: User,
) -> str:

    db.query(
        EmailVerificationOTP
    ).filter(
        EmailVerificationOTP.user_id
        == user.id,
        EmailVerificationOTP.is_used
        == False,
    ).update(
        {
            "is_used": True
        }
    )

    otp = generate_otp()

    otp_record = EmailVerificationOTP(
        user_id=user.id,
        otp_hash=hash_otp(otp),
        expires_at=(
            datetime.now(timezone.utc)
            + timedelta(
                minutes=settings.EMAIL_OTP_EXPIRE_MINUTES
            )
        ),
        is_used=False,
    )

    db.add(otp_record)
    db.commit()

    return otp


# ============================================================
# SEND / RESEND OTP
# ============================================================

@router.post(
    "/send",
    status_code=status.HTTP_200_OK,
)
def send_verification_otp(
    request: ResendVerificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(
            User.email == request.email
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.email_verified:
        return {
            "message": "Email already verified"
        }

    otp = create_otp_for_user(
        db,
        user,
    )

    background_tasks.add_task(
        send_verification_email,
        user.email,
        otp,
    )

    return {
        "message": (
            "Verification OTP sent"
        )
    }


# ============================================================
# VERIFY EMAIL
# ============================================================

@router.post(
    "/verify",
    status_code=status.HTTP_200_OK,
)
def verify_email(
    request: VerifyEmailRequest,
    db: Session = Depends(get_db),
):

    user = (
        db.query(User)
        .filter(
            User.email == request.email
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.email_verified:

        return {
            "message": (
                "Email already verified"
            )
        }

    otp_record = (
        db.query(
            EmailVerificationOTP
        )
        .filter(
            EmailVerificationOTP.user_id
            == user.id,
            EmailVerificationOTP.is_used
            == False,
        )
        .order_by(
            EmailVerificationOTP.created_at.desc()
        )
        .first()
    )

    if not otp_record:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active verification OTP",
        )

    now = datetime.now(timezone.utc)

    if otp_record.expires_at <= now:

        otp_record.is_used = True

        db.commit()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired",
        )

    if hash_otp(request.otp) != (
        otp_record.otp_hash
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP",
        )

    otp_record.is_used = True

    user.email_verified = True

    db.commit()

    return {
        "message": (
            "Email verified successfully"
        )
    }