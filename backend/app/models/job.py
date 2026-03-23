from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)

    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="jobs")
    applications = relationship("Application", back_populates="job")
