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
DB_PATH = BASE_DIR / "db" / "TikTrack_DB.db"  # Production database
UI_DIR = BASE_DIR.parent / "trading-ui"

# Flask settings
DEBUG = False
HOST = '127.0.0.1'
PORT = 5001  # Production port (different from development port 8080)

# Production settings
DEVELOPMENT_MODE = False  # Production mode
CACHE_DISABLED = False  # Cache enabled in production for performance

# Cache settings - Production optimized
DEFAULT_CACHE_TTL = 300  # 5 minutes - standard production cache

# Cache enabled/disabled setting
CACHE_ENABLED = True  # Cache enabled in production

# Database settings
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Logs directory for production
LOG_DIR = BASE_DIR / "logs-production"

# Checks (skip in testing mode)
if not os.getenv('TESTING') and not UI_DIR.exists():
    raise FileNotFoundError(f"UI directory not found at: {UI_DIR}")

