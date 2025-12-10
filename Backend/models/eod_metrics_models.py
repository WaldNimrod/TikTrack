from sqlalchemy import Column, Integer, String, Date, Numeric, TIMESTAMP, JSON, Text, Index
from sqlalchemy.sql import func
from .base import Base

class DailyPortfolioMetrics(Base):
    """טבלת מדדי פורטפוליו יומיים"""
    __tablename__ = 'daily_portfolio_metrics'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False, index=True)
    account_id = Column(Integer, index=True)  # nullable לצבירה כוללת
    date_utc = Column(Date, nullable=False, index=True)

    # פורטפוליו בסיסי
    nav_total = Column(Numeric(20, 8))
    nav_base_currency = Column(Numeric(20, 8))
    cash_total = Column(Numeric(20, 8))
    positions_count_open = Column(Integer, default=0)
    positions_count_closed = Column(Integer, default=0)
    exposure_long = Column(Numeric(20, 8), default=0)
    exposure_short = Column(Numeric(20, 8), default=0)

    # P&L
    unrealized_pl_amount = Column(Numeric(20, 8), default=0)
    unrealized_pl_percent = Column(Numeric(10, 4), default=0)
    realized_pl_amount = Column(Numeric(20, 8), default=0)
    realized_pl_to_date = Column(Numeric(20, 8), default=0)
    pnl_daily_change_amount = Column(Numeric(20, 8), default=0)
    pnl_daily_change_percent = Column(Numeric(10, 4), default=0)

    # ביצועים
    twr_daily = Column(Numeric(10, 6))
    twr_mtd = Column(Numeric(10, 6))
    twr_ytd = Column(Numeric(10, 6))
    max_drawdown_to_date = Column(Numeric(10, 4))

    # בקרת איכות
    data_quality_status = Column(String(20), default='valid')  # valid/stale/needs_recompute
    validation_errors = Column(JSON)
    computed_at = Column(TIMESTAMP, default=func.now())

    # אינדקסים לביצועים
    __table_args__ = (
        Index('idx_daily_portfolio_user_date', 'user_id', 'date_utc'),
        Index('idx_daily_portfolio_account_date', 'account_id', 'date_utc'),
        {'extend_existing': True}
    )

class DailyTickerPositions(Base):
    """טבלת פוזיציות טיקר יומיות"""
    __tablename__ = 'daily_ticker_positions'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False, index=True)
    account_id = Column(Integer, index=True)
    ticker_id = Column(Integer, nullable=False, index=True)
    date_utc = Column(Date, nullable=False, index=True)

    quantity = Column(Numeric(20, 8), default=0)
    avg_cost = Column(Numeric(20, 8))
    market_value = Column(Numeric(20, 8), default=0)
    unrealized_pl_amount = Column(Numeric(20, 8), default=0)
    unrealized_pl_percent = Column(Numeric(10, 4), default=0)
    realized_pl_today = Column(Numeric(20, 8), default=0)

    close_price = Column(Numeric(20, 8))
    price_source = Column(String(50))
    currency = Column(String(3))

    computed_at = Column(TIMESTAMP, default=func.now())

    # אינדקסים
    __table_args__ = (
        Index('idx_daily_positions_user_date', 'user_id', 'date_utc'),
        Index('idx_daily_positions_ticker_date', 'ticker_id', 'date_utc'),
        {'extend_existing': True}
    )

class DailyCashFlowsAgg(Base):
    """טבלת תזרימי מזומן מצטברים יומיים"""
    __tablename__ = 'daily_cash_flows_agg'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False, index=True)
    account_id = Column(Integer, index=True)
    date_utc = Column(Date, nullable=False, index=True)

    inflow = Column(Numeric(20, 8), default=0)
    outflow = Column(Numeric(20, 8), default=0)
    dividends = Column(Numeric(20, 8), default=0)
    fees = Column(Numeric(20, 8), default=0)
    taxes = Column(Numeric(20, 8), default=0)
    fx_adjustments = Column(Numeric(20, 8), default=0)
    net_flow = Column(Numeric(20, 8), default=0)

    computed_at = Column(TIMESTAMP, default=func.now())

    # אינדקסים
    __table_args__ = (
        Index('idx_daily_cash_user_date', 'user_id', 'date_utc'),
        {'extend_existing': True}
    )

class EODJobRuns(Base):
    """טבלת מעקב ריצות EOD"""
    __tablename__ = 'eod_job_runs'

    id = Column(Integer, primary_key=True)
    job_id = Column(String(100), unique=True, index=True)
    status = Column(String(20), default='running')  # running/completed/failed/completed_with_errors
    scope = Column(JSON)  # {user_id, date_range, accounts}
    errors = Column(JSON)
    duration_seconds = Column(Integer)
    created_at = Column(TIMESTAMP, default=func.now())
    completed_at = Column(TIMESTAMP)

    # אינדקסים
    __table_args__ = (
        Index('idx_eod_jobs_status', 'status'),
        Index('idx_eod_jobs_created', 'created_at'),
        {'extend_existing': True}
    )
