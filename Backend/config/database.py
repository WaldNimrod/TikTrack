from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from .settings import DATABASE_URL
from typing import Generator
import logging

logger = logging.getLogger(__name__)

# יצירת engine עם Connection Pool מתקדם
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=QueuePool,
    pool_size=10,           # מספר חיבורים קבועים
    max_overflow=20,        # חיבורים נוספים בעת עומס
    pool_timeout=30,        # זמן המתנה לחיבור (שניות)
    pool_recycle=3600,      # רענון חיבורים כל שעה
    pool_pre_ping=True,     # בדיקת חיבור לפני שימוש
    echo=False
)

# יצירת session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """פונקציה לקבלת DB session"""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def init_db() -> None:
    """יצירת כל הטבלאות"""
    from models.base import Base
    from models import ticker, trade, account, trade_plan, alert, cash_flow, note, execution, currency, note_relation_type, user, user_preferences, user_preferences_v2
    Base.metadata.create_all(bind=engine)
