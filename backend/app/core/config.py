from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # App
    PROJECT_NAME: str = "Chemistry Lab Experiment System"
    PROJECT_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/chemistry_lab"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3100",
        "http://localhost:3101",
        "http://127.0.0.1:3101",
        "http://frontend:80",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
