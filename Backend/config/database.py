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
    # SQLite and PostgreSQL do not allow subqueries in CHECK constraints; strip problematic ones
    # These constraints will be implemented as triggers instead
    try:
        from sqlalchemy import CheckConstraint
        from models.ticker import Ticker
        removable_names = {"active_trades_consistency", "ticker_status_auto_update"}
        table = Ticker.__table__
        for constraint in list(table.constraints):
            if isinstance(constraint, CheckConstraint) and getattr(constraint, "name", None) in removable_names:
                table.constraints.remove(constraint)
    except Exception:
        # Best-effort; if stripping fails, proceed and let create raise
        pass
    Base.metadata.create_all(bind=engine, checkfirst=True)
