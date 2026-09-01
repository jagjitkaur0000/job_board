from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    JSON,
    String,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    email = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    password_hash = Column(
        String,
        nullable=False,
    )

    role_id = Column(
        Integer,
        ForeignKey("roles.id"),
        nullable=False,
    )

    full_name = Column(
        String(255),
        nullable=True,
    )

    phone = Column(
        String(50),
        nullable=True,
    )

    preferred_locations = Column(
        JSON,
        nullable=True,
    )

    resume_url = Column(
        String(500),
        nullable=True,
    )

    profile_photo_url = Column(
        String(500),
        nullable=True,
    )

    email_verified = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    role = relationship(
        "Role",
        back_populates="users",
    )

    companies = relationship(
        "Company",
        back_populates="owner",
    )

    applications = relationship(
        "Application",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    saved_jobs = relationship(
        "SavedJob",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    email_verification_otps = relationship(
        "EmailVerificationOTP",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    scheduled_interviews = relationship(
        "Interview",
        foreign_keys="Interview.recruiter_id",
        back_populates="recruiter",
        cascade="all, delete-orphan",
    )

    candidate_interviews = relationship(
        "Interview",
        foreign_keys="Interview.candidate_id",
        back_populates="candidate",
        cascade="all, delete-orphan",
    )