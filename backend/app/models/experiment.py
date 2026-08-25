from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class ExperimentRecord(Base):
    """Experiment record model"""
    __tablename__ = "experiment_records"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    experiment_type = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    status = Column(String(20), default="in_progress")  # in_progress, completed, failed
    steps_completed = Column(Integer, default=0)
    total_steps = Column(Integer, default=0)
    data = Column(JSON, default={})
    notes = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    user = relationship("User", back_populates="experiments")


class ExperimentStep(Base):
    """Individual experiment step record"""
    __tablename__ = "experiment_steps"
    
    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiment_records.id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    step_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    instruments_used = Column(JSON, default=[])
    reagents_used = Column(JSON, default=[])
    observations = Column(Text, nullable=True)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    experiment = relationship("ExperimentRecord", back_populates="steps")


# Add relationship to User model
from app.models.user import User
User.experiments = relationship("ExperimentRecord", back_populates="user")
ExperimentRecord.steps = relationship("ExperimentStep", back_populates="experiment")
