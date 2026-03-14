"""
Trade Plans Model - SQLAlchemy ORM
TEAM_10_PHASE_C_CARRYOVER — dynamic entity loader dependency
Maps to user_data.trade_plans table per PHX_DB_SCHEMA_V2.5
"""

import uuid
from datetime import datetime
from typing import Optional
from decimal import Decimal
from sqlalchemy import String, Text, Integer, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from sqlalchemy import TIMESTAMP

from .base import Base


class TradePlan(Base):
    """Trade Plan model - maps to user_data.trade_plans table."""

    __tablename__ = "trade_plans"
    __table_args__ = {"schema": "user_data"}

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user_data.users.id", ondelete="CASCADE"),
        nullable=False,
    )
    ticker_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("market_data.tickers.id", ondelete="RESTRICT"),
        nullable=False,
    )
    trading_account_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user_data.trading_accounts.id", ondelete="SET NULL"),
        nullable=True,
    )
    strategy_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
    )
    plan_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    thesis: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    direction: Mapped[str] = mapped_column(String(20), nullable=False)
    planned_entry_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 8), nullable=True)
    planned_quantity: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 8), nullable=True)
    planned_stop_loss: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 8), nullable=True)
    planned_take_profit: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 8), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="DRAFT")
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True,
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user_data.users.id", ondelete="CASCADE"),
        nullable=False,
    )
    updated_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user_data.users.id", ondelete="CASCADE"),
        nullable=False,
    )
    trade_plan_metadata: Mapped[Optional[dict]] = mapped_column(
        "metadata",
        JSONB,
        nullable=True,
        default=dict,
    )
    tags: Mapped[Optional[list]] = mapped_column(ARRAY(String), nullable=True)
