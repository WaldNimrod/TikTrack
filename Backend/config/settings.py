import os
from pathlib import Path

# Environment detection - check if production mode is requested
ENVIRONMENT = os.getenv('TIKTRACK_ENV', 'development').lower()  # 'development' or 'production'
IS_PRODUCTION = ENVIRONMENT == 'production'

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

# Port - different for production vs development (see documentation/production/PRODUCTION_SETUP.md)
if IS_PRODUCTION:
    PORT = 5001  # Production port
else:
    PORT = 8080  # Development port

# Development/Production settings
if IS_PRODUCTION:
    # Production mode settings
    DEVELOPMENT_MODE = False
    CACHE_DISABLED = False  # Cache enabled in production for performance
else:
    # Development mode settings
    DEVELOPMENT_MODE = os.getenv('TIKTRACK_DEV_MODE', 'true').lower() == 'true'
    CACHE_DISABLED = os.getenv('TIKTRACK_CACHE_DISABLED', 'true').lower() == 'true'

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

