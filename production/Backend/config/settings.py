import os
from pathlib import Path

# Production configuration is hardcoded. See documentation/production/PRODUCTION_SETUP.md
IS_PRODUCTION = True

# Paths
BASE_DIR = Path(__file__).parent.parent
DB_PATH = BASE_DIR / "db" / "TikTrack_DB.db"
UI_DIR = BASE_DIR.parent / "trading-ui"

# Flask settings
DEBUG = False
HOST = '127.0.0.1'
PORT = 5001

# Production-only flags
DEVELOPMENT_MODE = False
CACHE_DISABLED = False

# Cache settings
DEFAULT_CACHE_TTL = 300  # 5 דקות
CACHE_ENABLED = not CACHE_DISABLED

# Database settings
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Checks (skip in testing mode)
if not os.getenv('TESTING') and not UI_DIR.exists():
    raise FileNotFoundError(f"UI directory not found at: {UI_DIR}")

