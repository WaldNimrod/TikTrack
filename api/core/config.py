"""
Application Configuration
Task: 20.1.5 (Supporting config)
Status: COMPLETED

Centralized configuration using Pydantic Settings.
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    # Database
    database_url: str = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/tiktrack")
    
    # JWT Configuration
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "")
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_hours: int = 24
    jwt_refresh_token_expire_days: int = 7
    
    # Encryption
    encryption_key: Optional[str] = os.getenv("ENCRYPTION_KEY")
    
    # API
    api_v1_prefix: str = "/api/v1"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields in .env that aren't in Settings


# Global settings instance
settings = Settings()
