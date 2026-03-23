from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    job_id = Column(
        Integer,
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False
    )

    status = Column(String(50), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "job_id", name="unique_application"),
    )

    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")
