from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import QueuePool
from typing import Dict, Generator

from .settings import DATABASE_URL, USING_SQLITE
import logging

logger = logging.getLogger(__name__)


def _build_engine_kwargs() -> Dict:
    kwargs: Dict = {
        "poolclass": QueuePool,
        "pool_size": 10,
        "max_overflow": 20,
        "pool_timeout": 60,
        "pool_recycle": 3600,
        "pool_pre_ping": True,
        "echo": False,
    }

    if USING_SQLITE:
        kwargs["connect_args"] = {"check_same_thread": False}
    return kwargs


engine = create_engine(DATABASE_URL, **_build_engine_kwargs())
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
    from models import ticker, trade, trading_account, trade_plan, alert, cash_flow, note, execution, currency, note_relation_type, user, preferences
    Base.metadata.create_all(bind=engine)
