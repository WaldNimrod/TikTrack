import os
from pathlib import Path

# Production config is hardcoded for isolation
ENVIRONMENT = "production"
IS_PRODUCTION = True

# Paths
BASE_DIR = Path(__file__).parent.parent

# NOTE: Production relies on port 5001 with the isolated TikTrack database.
#       Full environment mapping lives in documentation/production/PRODUCTION_SETUP.md.
# Database path - use unified tiktrack database in all environments
DB_PATH = BASE_DIR / "db" / "tiktrack.db"

UI_DIR = BASE_DIR.parent / "trading-ui"

# Flask settings
DEBUG = False
HOST = '127.0.0.1'

# Port / cache flags fixed for production
PORT = 5001
DEVELOPMENT_MODE = False
CACHE_DISABLED = False
DEFAULT_CACHE_TTL = 300  # 5 דקות
CACHE_ENABLED = True

# Database settings
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Checks (skip in testing mode)
if not os.getenv('TESTING') and not UI_DIR.exists():
    raise FileNotFoundError(f"UI directory not found at: {UI_DIR}")

