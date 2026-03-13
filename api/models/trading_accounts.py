"""
Trading Accounts Model - SQLAlchemy ORM
Task: Trading Accounts View Backend Implementation
Status: COMPLETED

SQLAlchemy ORM model for trading_accounts table.
Based on PHX_DB_SCHEMA_V2.5_FULL_DDL.sql
"""

import uuid
from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from sqlalchemy import (
    String,
    Boolean,
    Integer,
    Text,
    ForeignKey,
    Numeric,
    CheckConstraint,
    Index,
    TIMESTAMP,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func

from .base import Base


class TradingAccount(Base):
    """
    Trading Account model - maps to user_data.trading_accounts table.

    Represents a user's trading account with a broker.
    """

    __tablename__ = "trading_accounts"
    __table_args__ = ({"schema": "user_data"},)

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

    # Account Details
    account_name: Mapped[str] = mapped_column(String(100), nullable=False)
    broker: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    account_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # External Integration
    external_account_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    last_sync_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )

    # Balances
    initial_balance: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    cash_balance: Mapped[Decimal] = mapped_column(
        Numeric(20, 6), nullable=False, default=Decimal("0"), server_default="0"
    )
    total_deposits: Mapped[Decimal] = mapped_column(
        Numeric(20, 6), nullable=False, default=Decimal("0"), server_default="0"
    )
    total_withdrawals: Mapped[Decimal] = mapped_column(
        Numeric(20, 6), nullable=False, default=Decimal("0"), server_default="0"
    )
    currency: Mapped[str] = mapped_column(
        String(3), nullable=False, default="USD", server_default="USD"
    )

    # Status
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true"
    )

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
    account_metadata: Mapped[Optional[dict]] = mapped_column(
        "metadata", JSONB, nullable=True, default=dict, server_default="'{}'::JSONB"
    )

    # Relationships
    # Note: These will be defined after Trade and CashFlow models are created
    # trades: Mapped[List["Trade"]] = relationship("Trade", back_populates="trading_account")
    # cash_flows: Mapped[List["CashFlow"]] = relationship("CashFlow", back_populates="trading_account")
