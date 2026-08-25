# Public API module (no auth required)
from app.api.public.experiments import router as experiments_router

__all__ = ["experiments_router"]
