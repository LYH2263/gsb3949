from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.schemas.experiment import (
    ExperimentRecordCreate, ExperimentRecordUpdate, 
    ExperimentRecordResponse, ExperimentSummary, ExperimentStepCreate
)
from app.models.experiment import ExperimentRecord, ExperimentStep

router = APIRouter()


@router.post("/", response_model=ExperimentRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_experiment(
    experiment_in: ExperimentRecordCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Create a new experiment record"""
    db_experiment = ExperimentRecord(
        user_id=current_user_id,
        experiment_type=experiment_in.experiment_type,
        title=experiment_in.title,
        total_steps=experiment_in.total_steps,
        status="in_progress"
    )
    
    db.add(db_experiment)
    db.commit()
    db.refresh(db_experiment)
    
    return db_experiment


@router.get("/", response_model=List[ExperimentSummary])
async def list_experiments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """List user's experiment records"""
    query = db.query(ExperimentRecord).filter(ExperimentRecord.user_id == current_user_id)
    
    if status:
        query = query.filter(ExperimentRecord.status == status)
    
    experiments = query.order_by(ExperimentRecord.created_at.desc()).offset(skip).limit(limit).all()
    return experiments


@router.get("/{experiment_id}", response_model=ExperimentRecordResponse)
async def get_experiment(
    experiment_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Get a specific experiment record"""
    experiment = db.query(ExperimentRecord).filter(
        ExperimentRecord.id == experiment_id,
        ExperimentRecord.user_id == current_user_id
    ).first()
    
    if not experiment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experiment not found"
        )
    
    return experiment


@router.put("/{experiment_id}", response_model=ExperimentRecordResponse)
async def update_experiment(
    experiment_id: int,
    experiment_in: ExperimentRecordUpdate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Update an experiment record"""
    experiment = db.query(ExperimentRecord).filter(
        ExperimentRecord.id == experiment_id,
        ExperimentRecord.user_id == current_user_id
    ).first()
    
    if not experiment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experiment not found"
        )
    
    # Update fields
    update_data = experiment_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(experiment, field, value)
    
    db.commit()
    db.refresh(experiment)
    
    return experiment


@router.delete("/{experiment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_experiment(
    experiment_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Delete an experiment record"""
    experiment = db.query(ExperimentRecord).filter(
        ExperimentRecord.id == experiment_id,
        ExperimentRecord.user_id == current_user_id
    ).first()
    
    if not experiment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experiment not found"
        )
    
    try:
        # Remove child rows first to avoid NOT NULL violations on experiment_steps.experiment_id
        db.query(ExperimentStep).filter(
            ExperimentStep.experiment_id == experiment.id
        ).delete(synchronize_session=False)
        db.delete(experiment)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete experiment"
        ) from exc
    
    return None


@router.post("/{experiment_id}/steps", response_model=ExperimentRecordResponse)
async def add_experiment_step(
    experiment_id: int,
    step_in: ExperimentStepCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """Add a step to an experiment"""
    experiment = db.query(ExperimentRecord).filter(
        ExperimentRecord.id == experiment_id,
        ExperimentRecord.user_id == current_user_id
    ).first()
    
    if not experiment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experiment not found"
        )
    
    # Create step
    step = ExperimentStep(
        experiment_id=experiment_id,
        step_number=step_in.step_number,
        step_name=step_in.step_name,
        description=step_in.description,
        instruments_used=step_in.instruments_used,
        reagents_used=step_in.reagents_used,
        observations=step_in.observations
    )
    
    db.add(step)
    
    # Update experiment steps_completed
    experiment.steps_completed = max(experiment.steps_completed, step_in.step_number)
    
    db.commit()
    db.refresh(experiment)
    
    return experiment


@router.get("/stats/summary")
async def get_stats(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    """获取用户实验统计数据"""
    total = db.query(ExperimentRecord).filter(ExperimentRecord.user_id == current_user_id).count()
    completed = db.query(ExperimentRecord).filter(
        ExperimentRecord.user_id == current_user_id,
        ExperimentRecord.status == "completed"
    ).count()
    return {"total": total, "completed": completed, "in_progress": total - completed}
