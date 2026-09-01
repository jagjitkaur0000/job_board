from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(
        Integer,
        primary_key=True,
    )

    title = Column(
        String(255),
        nullable=False,
        index=True,
    )

    description = Column(
        Text,
        nullable=False,
    )

    location = Column(
        String(255),
        nullable=True,
        index=True,
    )

    employment_type = Column(
        String(50),
        nullable=False,
        default="full_time",
        index=True,
    )

    work_mode = Column(
        String(50),
        nullable=False,
        default="onsite",
        index=True,
    )

    experience_required = Column(
        String(100),
        nullable=True,
        index=True,
    )

    salary_min = Column(
        Integer,
        nullable=True,
    )

    salary_max = Column(
        Integer,
        nullable=True,
    )

    salary_currency = Column(
        String(10),
        nullable=True,
        default="INR",
    )

    contact_email = Column(
        String(255),
        nullable=True,
    )

    contact_phone = Column(
        String(50),
        nullable=True,
    )

    benefits = Column(
        Text,
        nullable=True,
    )

    preferred_gender = Column(
        String(20),
        nullable=True,
    )

    is_urgent = Column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
    )

    expires_at = Column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
    )

    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
        index=True,
    )

    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=False,
        index=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )

    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now(),
        nullable=True,
    )

    company = relationship(
        "Company",
        back_populates="jobs",
    )

    applications = relationship(
        "Application",
        back_populates="job",
        cascade="all, delete-orphan",
    )

    saved_by_users = relationship(
        "SavedJob",
        back_populates="job",
        cascade="all, delete-orphan",
    )