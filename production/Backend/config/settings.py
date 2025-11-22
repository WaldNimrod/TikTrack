import os
from pathlib import Path

# Environment detection - hardcoded for production
ENVIRONMENT = 'production'  # Hardcoded for production environment
IS_PRODUCTION = True  # Hardcoded for production environment

# Paths
BASE_DIR = Path(__file__).parent.parent
UI_DIR = BASE_DIR.parent / "trading-ui"

# SQLite information (development default)
DB_DIR = BASE_DIR / "db"
# Standardize on tiktrack.db (legacy simpleTrade_new.db kept only for archives/migrations)
STANDARD_DB_FILENAME = "tiktrack.db"
STANDARD_DB_PATH = DB_DIR / STANDARD_DB_FILENAME
# Backwards compatibility constant used by legacy imports (app.py, tests, scripts)
DB_PATH = STANDARD_DB_PATH

# Database source selection
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "tiktrack_dev")
POSTGRES_USER = os.getenv("POSTGRES_USER", "tiktrack")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "tiktrack_dev_password")

if POSTGRES_HOST:
    DEFAULT_DATABASE_URL = (
        f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASSWORD}"
        f"@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    )
else:
    DEFAULT_DATABASE_URL = f"sqlite:///{STANDARD_DB_PATH}"

DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)
USING_SQLITE = DATABASE_URL.startswith("sqlite")

# Flask settings
DEBUG = False
HOST = "127.0.0.1"
PORT = 5001 if IS_PRODUCTION else 8080

# Development/Production settings
if IS_PRODUCTION:
    DEVELOPMENT_MODE = False
    CACHE_DISABLED = False
else:
    DEVELOPMENT_MODE = os.getenv("TIKTRACK_DEV_MODE", "true").lower() == "true"
    CACHE_DISABLED = os.getenv("TIKTRACK_CACHE_DISABLED", "true").lower() == "true"

# Cache settings
DEFAULT_CACHE_TTL = 10 if DEVELOPMENT_MODE else 300
CACHE_ENABLED = not CACHE_DISABLED

# Checks (skip in testing mode)
if not os.getenv("TESTING") and not UI_DIR.exists():
    raise FileNotFoundError(f"UI directory not found at: {UI_DIR}")

