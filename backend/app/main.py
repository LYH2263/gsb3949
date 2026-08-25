from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, experiments, users
from app.api.public import experiments as public_experiments
from seed.seed_runner import run_seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager"""
    # Startup
    Base.metadata.create_all(bind=engine)
    run_seed()  # 启动时自动填充测试数据
    yield
    # Shutdown


app = FastAPI(
    title="Chemistry Lab Experiment System API",
    description="Backend API for middle school chemistry experiments",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# 现有 /api/v1/* 路由
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(experiments.router, prefix="/api/v1/experiments", tags=["experiments"])

# 新增公开路由（无需鉴权）
app.include_router(public_experiments.router, prefix="/api/public/experiments", tags=["public-experiments"])

# 私有记录路由（需鉴权）- 指向已有的实验记录功能
app.include_router(experiments.router, prefix="/api/private/records", tags=["private-records"])


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "chemistry-lab-api"}


@app.get("/", tags=["root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Chemistry Lab Experiment System API",
        "version": "1.0.0",
        "docs": "/docs"
    }
