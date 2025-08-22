from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from .settings import DATABASE_URL
from typing import Generator
import logging

logger = logging.getLogger(__name__)

# יצירת engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=False,
    pool_pre_ping=True,  # בדיקת חיבור לפני שימוש
    pool_recycle=3600    # רענון חיבורים כל שעה
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
    from models import ticker, trade, account, trade_plan, alert, cash_flow, note, execution, currency
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
