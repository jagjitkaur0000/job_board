from app.db.base import Base

from app.models.role import Role
from app.models.user import User
from app.models.company import Company
from app.models.job import Job
from app.models.application import Application
from app.models.saved_job import SavedJob
from app.models.email_verification import EmailVerificationOTP
from app.models.notification import Notification
from app.models.interview import Interview

__all__ = [
    "Base",
    "Role",
    "User",
    "Company",
    "Job",
    "Application",
    "SavedJob",
    "EmailVerificationOTP",
    "Notification",
    "Interview",
]