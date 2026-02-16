"""
Application Configuration
Task: 20.1.5 (Supporting config)
Status: COMPLETED

Centralized configuration using Pydantic Settings.
"""

import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load api/.env explicitly (uvicorn runs from project root, so .env in CWD may not exist)
_config_dir = Path(__file__).resolve().parent.parent  # api/
_env_file = _config_dir / ".env"
if _env_file.exists():
    load_dotenv(_env_file)


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
    
    # D35: Attachments storage base (Team 60 provides path; default relative to project root)
    storage_uploads_base: str = os.getenv("STORAGE_UPLOADS_BASE", "storage/uploads")
    
    # Debug: include exception detail in 500 responses (set DEBUG=true in api/.env)
    debug: bool = False
    
    class Config:
        env_file = str(_env_file) if _env_file.exists() else ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields in .env that aren't in Settings
        
        @classmethod
        def customise_sources(
            cls,
            init_settings,
            env_settings,
            file_secret_settings,
        ):
            # Priority: env_file (.env) > environment variables > init_settings
            return (
                init_settings,
                env_settings,
                file_secret_settings,
            )


# Global settings instance
settings = Settings()
