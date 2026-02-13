"""
Ticker Prices Intraday Model - SQLAlchemy ORM
Task: P3-016, TEAM_60_TO_TEAM_20_EXTERNAL_DATA_COORDINATION
Status: COMPLETED

ORM model for market_data.ticker_prices_intraday table.
Active tickers only. Retention 30d — Cleanup job (Team 60).
SSOT: MARKET_DATA_PIPE_SPEC §4.1, §7.3
"""

import uuid
from datetime import datetime
from typing import Optional
from decimal import Decimal
from sqlalchemy import (
    Boolean, BigInteger, ForeignKey, Numeric, CheckConstraint, TIMESTAMP
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from .base import Base


class TickerPriceIntraday(Base):
    """
    Ticker Price Intraday — market_data.ticker_prices_intraday.
    Active tickers only. Per TEAM_60_TO_TEAM_20_EXTERNAL_DATA_COORDINATION.
    """
    __tablename__ = "ticker_prices_intraday"
    __table_args__ = (
        CheckConstraint("price > 0", name="ticker_prices_intraday_positive_price"),
        {"schema": "market_data"},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid()
    )
    ticker_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("market_data.tickers.id", ondelete="CASCADE"),
        nullable=False
    )
    provider_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("market_data.external_data_providers.id", ondelete="SET NULL"),
        nullable=True
    )

    price: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    open_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 8), nullable=True)
    high_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 8), nullable=True)
    low_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 8), nullable=True)
    close_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 8), nullable=True)
    volume: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    market_cap: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 8), nullable=True)

    price_timestamp: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False
    )
    fetched_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now()
    )
    is_stale: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false"
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now()
    )
