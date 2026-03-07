"""
Tickers Model - SQLAlchemy ORM
Task: Trading Accounts View Backend Implementation (Supporting model)
Status: COMPLETED

SQLAlchemy ORM model for tickers table.
Based on PHX_DB_SCHEMA_V2.5_FULL_DDL.sql
"""

import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    String, Boolean, Date, ForeignKey, TIMESTAMP
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from .base import Base
from .enums import ticker_type_enum


class Ticker(Base):
    """
    Ticker model - maps to market_data.tickers table.
    
    Represents static ticker metadata (NOT prices/quotes).
    """
    __tablename__ = "tickers"
    __table_args__ = (
        {"schema": "market_data"},
    )
    
    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid()
    )
    
    # Basic Info
    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    exchange_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("market_data.exchanges.id", ondelete="SET NULL"),
        nullable=True
    )
    company_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    ticker_type: Mapped[str] = mapped_column(
        ticker_type_enum,
        nullable=False,
        default="STOCK",
        server_default="STOCK",
    )
    
    # Metadata
    sector_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("market_data.sectors.id", ondelete="SET NULL"),
        nullable=True
    )
    industry_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("market_data.industries.id", ondelete="SET NULL"),
        nullable=True
    )
    market_cap_group_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("market_data.market_cap_groups.id", ondelete="SET NULL"),
        nullable=True
    )
    
    # Identifiers
    cusip: Mapped[Optional[str]] = mapped_column(String(9), nullable=True)
    isin: Mapped[Optional[str]] = mapped_column(String(12), nullable=True)
    figi: Mapped[Optional[str]] = mapped_column(String(12), nullable=True)
    
    # Status (per TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT: pending|active|inactive|cancelled)
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        server_default="'active'"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true"
    )
    delisted_date: Mapped[Optional[Date]] = mapped_column(Date, nullable=True)
    
    # Audit
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
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True
    )
    
    # Metadata (renamed from 'metadata' - reserved name in SQLAlchemy)
    ticker_metadata: Mapped[Optional[dict]] = mapped_column(
        "metadata",
        JSONB,
        nullable=True,
        default=dict,
        server_default="'{}'::JSONB"
    )
    user_tickers = relationship("UserTicker", back_populates="ticker")