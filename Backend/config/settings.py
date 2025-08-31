import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent.parent
DB_PATH = BASE_DIR / "db" / "simpleTrade_new.db"
UI_DIR = Path("/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui")

# Flask settings
DEBUG = False
HOST = '127.0.0.1'
PORT = 8080

# Database settings
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Checks
if not UI_DIR.exists():
    raise FileNotFoundError(f"UI directory not found at: {UI_DIR}")

