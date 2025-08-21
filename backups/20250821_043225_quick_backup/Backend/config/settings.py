import os
from pathlib import Path

# נתיבים
BASE_DIR = Path(__file__).parent.parent
DB_PATH = BASE_DIR / "db" / "simpleTrade_new.db"
UI_DIR = Path("/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui")

# הגדרות Flask
DEBUG = False
HOST = '127.0.0.1'
PORT = 8080

# הגדרות DB
DATABASE_URL = f"sqlite:///{DB_PATH}"

# בדיקות
if not UI_DIR.exists():
    raise FileNotFoundError(f"UI directory not found at: {UI_DIR}")

print(f"✅ UI Directory: {UI_DIR}")
print(f"✅ Database will be created at: {DB_PATH}")
