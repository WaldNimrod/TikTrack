"""
Ticker Prices Model - SQLAlchemy ORM
Task: Trading Accounts View Backend Implementation (Supporting model)
Status: COMPLETED

SQLAlchemy ORM model for ticker_prices table.
Based on PHX_DB_SCHEMA_V2.5_FULL_DDL.sql

Note: This table is partitioned by month, so we'll use a simple model.
"""

import uuid
from datetime import datetime
from typing import Optional
from decimal import Decimal
from sqlalchemy import String, Boolean, Integer, ForeignKey, Numeric, CheckConstraint, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from .base import Base


class TickerPrice(Base):
    """
    Ticker Price model - maps to market_data.ticker_prices table.

    Represents historical ticker prices (partitioned by month).
    """

    __tablename__ = "ticker_prices"
    __table_args__ = (
        CheckConstraint("price > 0", name="ticker_prices_positive_price"),
        {"schema": "market_data"},
    )

    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )

    # Foreign Keys
    ticker_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("market_data.tickers.id", ondelete="CASCADE"), nullable=False
    )
    provider_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("market_data.external_data_providers.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Price Data
    price: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    open_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 8), nullable=True)
    high_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 8), nullable=True)
    low_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 8), nullable=True)
    close_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 8), nullable=True)
    volume: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    market_cap: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 8), nullable=True)  # P3-013

    # Timestamps
    price_timestamp: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    fetched_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )

    # Staleness Tracking
    is_stale: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )
    # staleness_minutes is a generated column, we'll calculate it in Python if needed

    # Audit
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
