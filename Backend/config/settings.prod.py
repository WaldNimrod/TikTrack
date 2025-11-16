"""
TikTrack Production Settings
============================

Production environment configuration for TikTrack server.

Purpose: Production-specific settings separate from development
Location: Backend/config/settings.prod.py
"""

import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent.parent
UI_DIR = BASE_DIR.parent / "trading-ui"

# Flask settings
DEBUG = False
HOST = "127.0.0.1"
PORT = 5001

# Production settings
DEVELOPMENT_MODE = False
CACHE_DISABLED = False
DEFAULT_CACHE_TTL = 300
CACHE_ENABLED = True

# Database settings – force PostgreSQL in production
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "tiktrack_prod")
POSTGRES_USER = os.getenv("POSTGRES_USER", "tiktrack")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "change_me")
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}",
)

# Logs directory for production
LOG_DIR = BASE_DIR / "logs-production"

if not os.getenv("TESTING") and not UI_DIR.exists():
    raise FileNotFoundError(f"UI directory not found at: {UI_DIR}")

