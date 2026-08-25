from sqlalchemy import Column, Integer, String, Text, JSON, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class ExperimentConfig(Base):
    """实验配置元数据（seed数据，不是用户记录）"""
    __tablename__ = "experiment_configs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    difficulty = Column(String(20), default="easy")
    description = Column(Text, nullable=False)
    principle_equation = Column(String(500), nullable=False)
    principle_explanation = Column(Text, nullable=False)
    instruments = Column(JSON, default=[])
    reagents = Column(JSON, default=[])
    steps = Column(JSON, default=[])
    reactions = Column(JSON, default=[])
    safety_rules = Column(JSON, default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now())
