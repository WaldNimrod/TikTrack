import os
from pathlib import Path

# Environment detection - check if production mode is requested
ENVIRONMENT = os.getenv("TIKTRACK_ENV", "development").lower()
IS_PRODUCTION = ENVIRONMENT == "production"
IS_TESTING = os.getenv("TESTING", "false").lower() == "true"

# Paths
BASE_DIR = Path(__file__).parent.parent
UI_DIR = BASE_DIR.parent / "trading-ui"

# Legacy DB_PATH constant for backwards compatibility (deprecated - not used with PostgreSQL)
DB_DIR = BASE_DIR / "db"
DB_PATH = DB_DIR / "tiktrack.db"  # Deprecated - kept for backward compatibility only

# PostgreSQL database configuration (required - no SQLite support)
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "TikTrack-db-development")
POSTGRES_USER = os.getenv("POSTGRES_USER", "TikTrakDBAdmin")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "BigMeZoo1974!?")

# Build PostgreSQL DATABASE_URL (required - no SQLite fallback)
if POSTGRES_HOST:
    DEFAULT_DATABASE_URL = (
        f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASSWORD}"
        f"@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    )
else:
    # PostgreSQL is required - no fallback to SQLite
    # This will raise an error when DATABASE_URL is accessed if POSTGRES_HOST is not set
    DEFAULT_DATABASE_URL = None

DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)

# Validate DATABASE_URL - PostgreSQL is required
if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL is not configured. "
        "POSTGRES_HOST environment variable is required. "
        "SQLite is no longer supported. "
        "Please set PostgreSQL environment variables or use start_server.sh which sets them automatically."
    )

if not DATABASE_URL.startswith("postgresql"):
    raise ValueError(
        f"Invalid DATABASE_URL: {DATABASE_URL}. "
        "Only PostgreSQL is supported. SQLite is no longer supported."
    )

# Legacy constant for backwards compatibility (always False)
USING_SQLITE = False

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
if not IS_TESTING and not UI_DIR.exists():
    raise FileNotFoundError(f"UI directory not found at: {UI_DIR}")
