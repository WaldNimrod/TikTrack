import os
from pathlib import Path

# Production settings file - values are hardcoded for isolation
ENVIRONMENT = "production"
IS_PRODUCTION = True

# Paths
BASE_DIR = Path(__file__).parent.parent

DB_PATH = BASE_DIR / "db" / "tiktrack.db"

UI_DIR = BASE_DIR.parent / "trading-ui"

# Flask settings
DEBUG = False
HOST = '127.0.0.1'

# Production port (permanent)
PORT = 5001

# Production mode toggles
DEVELOPMENT_MODE = False
CACHE_DISABLED = False

# Cache settings (production baseline)
DEFAULT_CACHE_TTL = 300  # 5 דקות
CACHE_ENABLED = not CACHE_DISABLED

# Database settings
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Checks (skip in testing mode)
if not os.getenv('TESTING') and not UI_DIR.exists():
    raise FileNotFoundError(f"UI directory not found at: {UI_DIR}")

