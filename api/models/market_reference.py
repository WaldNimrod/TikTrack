"""
Market Data Reference Models - SQLAlchemy ORM
Purpose: Register market_data.exchanges, sectors, industries, market_cap_groups in metadata
so Ticker's ForeignKey constraints resolve (NoReferencedTableError fix).
Tables created by migration p3_021; models needed for SQLAlchemy FK resolution only.
"""

import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Numeric, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from .base import Base


class Exchange(Base):
    """market_data.exchanges — FK target for tickers.exchange_id."""
    __tablename__ = "exchanges"
    __table_args__ = {"schema": "market_data"}
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True,
        default=uuid.uuid4, server_default=func.gen_random_uuid()
    )
    exchange_code: Mapped[str] = mapped_column(String(10), nullable=False)
    exchange_name: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(3), nullable=False)
    timezone: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="ACTIVE")
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    metadata_column: Mapped[Optional[dict]] = mapped_column("metadata", JSONB, nullable=True, server_default="'{}'::JSONB")


class Sector(Base):
    """market_data.sectors — FK target for tickers.sector_id."""
    __tablename__ = "sectors"
    __table_args__ = {"schema": "market_data"}
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True,
        default=uuid.uuid4, server_default=func.gen_random_uuid()
    )
    sector_name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())


class Industry(Base):
    """market_data.industries — FK target for tickers.industry_id."""
    __tablename__ = "industries"
    __table_args__ = {"schema": "market_data"}
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True,
        default=uuid.uuid4, server_default=func.gen_random_uuid()
    )
    industry_name: Mapped[str] = mapped_column(String(150), nullable=False)
    sector_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("market_data.sectors.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())


class MarketCapGroup(Base):
    """market_data.market_cap_groups — FK target for tickers.market_cap_group_id."""
    __tablename__ = "market_cap_groups"
    __table_args__ = {"schema": "market_data"}
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True,
        default=uuid.uuid4, server_default=func.gen_random_uuid()
    )
    group_name: Mapped[str] = mapped_column(String(50), nullable=False)
    min_market_cap: Mapped[Optional[float]] = mapped_column(Numeric(20, 2), nullable=True)
    max_market_cap: Mapped[Optional[float]] = mapped_column(Numeric(20, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
