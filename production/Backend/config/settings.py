import os
from pathlib import Path

# Production environment - always production mode when in production/Backend/
# This file is in production/Backend/, so we're always in production mode
IS_PRODUCTION = True
ENVIRONMENT = 'production'

# Paths
BASE_DIR = Path(__file__).parent.parent  # production/Backend/

# Database path - always production database
DB_PATH = BASE_DIR / "db" / "TikTrack_DB.db"

# UI directory - go up from production/Backend/ to project root, then to trading-ui
UI_DIR = BASE_DIR.parent.parent / "trading-ui"

# Flask settings
DEBUG = False
HOST = '127.0.0.1'

# Port - always production port
PORT = 5001

# Production mode settings - always production
DEVELOPMENT_MODE = False
CACHE_DISABLED = False  # Cache enabled in production for performance

# Cache settings
if DEVELOPMENT_MODE:
    # מצב פיתוח - Cache מופחת
    DEFAULT_CACHE_TTL = 10  # 10 שניות במקום 300
else:
    # מצב ייצור - Cache רגיל
    DEFAULT_CACHE_TTL = 300  # 5 דקות

# Cache enabled/disabled setting applies to both modes
CACHE_ENABLED = not CACHE_DISABLED

# Database settings
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Checks (skip in testing mode)
if not os.getenv('TESTING') and not UI_DIR.exists():
    raise FileNotFoundError(f"UI directory not found at: {UI_DIR}")

