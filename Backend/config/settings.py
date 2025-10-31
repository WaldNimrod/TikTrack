import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent.parent
DB_PATH = BASE_DIR / "db" / "simpleTrade_new.db"
UI_DIR = BASE_DIR.parent / "trading-ui"

# Flask settings
DEBUG = False
HOST = '127.0.0.1'
PORT = 8080

# Development settings
DEVELOPMENT_MODE = os.getenv('TIKTRACK_DEV_MODE', 'true').lower() == 'true'  # Changed to 'true' for development
CACHE_DISABLED = os.getenv('TIKTRACK_CACHE_DISABLED', 'true').lower() == 'true'  # Changed to 'true' to disable cache

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

