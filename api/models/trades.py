"""
Trades Model - SQLAlchemy ORM
Task: Trading Accounts View Backend Implementation (Supporting model)
Status: COMPLETED

SQLAlchemy ORM model for trades table.
Based on PHX_DB_SCHEMA_V2.5_FULL_DDL.sql
"""

import uuid
from datetime import datetime
from typing import Optional
from decimal import Decimal
from sqlalchemy import String, Integer, Text, ForeignKey, Numeric, CheckConstraint, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func

from .base import Base


# Trade Status Enum (for use in SQLAlchemy)
class TradeStatus(str):
    """Trade status enum values"""

    DRAFT = "DRAFT"
    PLANNED = "PLANNED"
    ACTIVE = "ACTIVE"
    CLOSED = "CLOSED"
    CANCELLED = "CANCELLED"


# Trade Direction Enum
class TradeDirection(str):
    """Trade direction enum values"""

    LONG = "LONG"
    SHORT = "SHORT"


class Trade(Base):
    """
    Trade model - maps to user_data.trades table.

    Represents a trading position (open or closed).
    """

    __tablename__ = "trades"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="trades_positive_quantity"),
        CheckConstraint(
            "parent_trade_id IS NULL OR parent_trade_id != id", name="trades_not_self_parent"
        ),
        {"schema": "user_data"},
    )

    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )

    # Foreign Keys
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user_data.users.id", ondelete="CASCADE"), nullable=False
    )
    ticker_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("market_data.tickers.id", ondelete="RESTRICT"),
        nullable=False,
    )
    trading_account_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user_data.trading_accounts.id", ondelete="RESTRICT"),
        nullable=False,
    )

    # Hierarchy
    parent_trade_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user_data.trades.id", ondelete="SET NULL"), nullable=True
    )

    # Strategy & Plan
    # Note: FK constraints removed - tables may not exist yet (per Team 60)
    strategy_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    origin_plan_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)

    # Alert Link
    # Note: FK constraint removed - table may not exist yet (per Team 60)
    trigger_alert_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)

    # Trade Details
    direction: Mapped[str] = mapped_column(String(20), nullable=False)  # LONG or SHORT

    # Quantity & Price
    quantity: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    avg_entry_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 8), nullable=True)
    avg_exit_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 8), nullable=True)

    # Stop Loss & Take Profit
    stop_loss: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 8), nullable=True)
    take_profit: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 8), nullable=True)

    # P&L
    realized_pl: Mapped[Decimal] = mapped_column(
        Numeric(20, 6), nullable=False, default=Decimal("0"), server_default="0"
    )
    unrealized_pl: Mapped[Decimal] = mapped_column(
        Numeric(20, 6), nullable=False, default=Decimal("0"), server_default="0"
    )
    # total_pl is a generated column in DB, we'll calculate it in Python if needed

    # Fees
    commission: Mapped[Decimal] = mapped_column(
        Numeric(20, 6), nullable=False, default=Decimal("0"), server_default="0"
    )
    fees: Mapped[Decimal] = mapped_column(
        Numeric(20, 6), nullable=False, default=Decimal("0"), server_default="0"
    )

    # Status
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="DRAFT", server_default="DRAFT"
    )
    calculated_status: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Dates
    entry_date: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    exit_date: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)

    # Audit
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user_data.users.id", ondelete="CASCADE"), nullable=False
    )
    updated_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user_data.users.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1, server_default="1")

    # Metadata (renamed from 'metadata' - reserved name in SQLAlchemy)
    trade_metadata: Mapped[Optional[dict]] = mapped_column(
        "metadata", JSONB, nullable=True, default=dict, server_default="'{}'::JSONB"
    )
    tags: Mapped[Optional[list[str]]] = mapped_column(ARRAY(String(255)), nullable=True)

    # Relationships
    # trading_account: Mapped["TradingAccount"] = relationship("TradingAccount", back_populates="trades")
