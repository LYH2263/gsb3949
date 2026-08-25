from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.experiment_config import ExperimentConfig

router = APIRouter()


@router.get("/", response_model=List[dict])
async def list_experiments(db: Session = Depends(get_db)):
    """获取所有实验配置列表（公开，无需鉴权）"""
    configs = db.query(ExperimentConfig).all()
    return [{"id": c.id, "name": c.name, "category": c.category,
             "difficulty": c.difficulty, "description": c.description} for c in configs]


@router.get("/{experiment_id}")
async def get_experiment(experiment_id: int, db: Session = Depends(get_db)):
    """获取实验详情（含原理/步骤/器材/试剂/反应规则/安全规则）"""
    config = db.query(ExperimentConfig).filter(ExperimentConfig.id == experiment_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return {
        "id": config.id,
        "name": config.name,
        "category": config.category,
        "difficulty": config.difficulty,
        "description": config.description,
        "principle_equation": config.principle_equation,
        "principle_explanation": config.principle_explanation,
        "instruments": config.instruments,
        "reagents": config.reagents,
        "steps": config.steps,
        "reactions": config.reactions,
        "safety_rules": config.safety_rules
    }
