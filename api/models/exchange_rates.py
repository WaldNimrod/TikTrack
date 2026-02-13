"""
Exchange Rates Model - SQLAlchemy ORM
Task: Stage-1 (1-002 MARKET_DATA_PIPE) - FOREX_MARKET_SPEC
Status: COMPLETED

ORM model for market_data.exchange_rates table.
Per documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md
"""

import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Numeric, CheckConstraint, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from .base import Base


class ExchangeRate(Base):
    """
    Exchange Rate model - maps to market_data.exchange_rates table.
    
    Per FOREX_MARKET_SPEC: conversion_rate NUMERIC(20,8), ISO 4217.
    """
    __tablename__ = "exchange_rates"
    __table_args__ = (
        CheckConstraint("conversion_rate > 0", name="exchange_rates_positive_rate"),
        {"schema": "market_data"},
    )
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid()
    )
    from_currency: Mapped[str] = mapped_column(String(3), nullable=False)
    to_currency: Mapped[str] = mapped_column(String(3), nullable=False)
    conversion_rate: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    last_sync_time: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now()
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now()
    )
