from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class ExperimentStatus(str, Enum):
    """Experiment status enum"""
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class ExperimentStepCreate(BaseModel):
    """Create experiment step schema"""
    step_number: int
    step_name: str
    description: Optional[str] = None
    instruments_used: List[str] = []
    reagents_used: List[Dict[str, Any]] = []
    observations: Optional[str] = None


class ExperimentStepResponse(ExperimentStepCreate):
    """Experiment step response schema"""
    id: int
    experiment_id: int
    completed_at: datetime
    
    class Config:
        from_attributes = True


class ExperimentRecordCreate(BaseModel):
    """Create experiment record schema"""
    experiment_type: str = Field(..., min_length=1, max_length=50)
    title: str = Field(..., min_length=1, max_length=200)
    total_steps: int = Field(default=1, ge=1)


class ExperimentRecordUpdate(BaseModel):
    """Update experiment record schema"""
    status: Optional[ExperimentStatus] = None
    steps_completed: Optional[int] = None
    data: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class ExperimentRecordResponse(BaseModel):
    """Experiment record response schema"""
    id: int
    user_id: int
    experiment_type: str
    title: str
    status: ExperimentStatus
    steps_completed: int
    total_steps: int
    data: Dict[str, Any]
    notes: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    steps: List[ExperimentStepResponse] = []
    
    class Config:
        from_attributes = True


class ExperimentSummary(BaseModel):
    """Experiment summary for list view"""
    id: int
    experiment_type: str
    title: str
    status: ExperimentStatus
    steps_completed: int
    total_steps: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
