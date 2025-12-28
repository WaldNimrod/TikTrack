import os
from pathlib import Path

# Environment detection - check if production mode is requested
ENVIRONMENT = os.getenv("TIKTRACK_ENV", "development").lower()
IS_PRODUCTION = ENVIRONMENT == "production"
IS_TESTING = os.getenv("TESTING", "false").lower() == "true"

# Paths
BASE_DIR = Path(__file__).parent.parent
UI_DIR = BASE_DIR.parent / "trading-ui"

# PostgreSQL database configuration
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "TikTrack-db-development")
POSTGRES_USER = os.getenv("POSTGRES_USER", "TikTrakDBAdmin")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "BigMeZoo1974!?")

# Build PostgreSQL DATABASE_URL (required)
if POSTGRES_HOST:
    DEFAULT_DATABASE_URL = (
        f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASSWORD}"
        f"@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    )
else:
    # PostgreSQL is required
    # This will raise an error when DATABASE_URL is accessed if POSTGRES_HOST is not set
    DEFAULT_DATABASE_URL = None

DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)

# Validate DATABASE_URL - PostgreSQL is required
if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL is not configured. "
        "POSTGRES_HOST environment variable is required. "
        "PostgreSQL is required. "
        "Please set PostgreSQL environment variables or use start_server.sh which sets them automatically."
    )

if not DATABASE_URL.startswith("postgresql"):
    raise ValueError(
        f"Invalid DATABASE_URL: {DATABASE_URL}. "
        "Only PostgreSQL is supported."
    )

# Flask settings
DEBUG = False
HOST = "127.0.0.1"
PORT = int(os.getenv("PORT", 5001 if IS_PRODUCTION else 8080))

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
