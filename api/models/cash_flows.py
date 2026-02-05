"""
Cash Flows Model - SQLAlchemy ORM
Task: Trading Accounts View Backend Implementation
Status: COMPLETED

SQLAlchemy ORM model for cash_flows table.
Based on PHX_DB_SCHEMA_V2.5_FULL_DDL.sql
"""

import uuid
from datetime import datetime, date
from typing import Optional
from decimal import Decimal
from sqlalchemy import (
    String, Text, ForeignKey, Numeric, Date, CheckConstraint, TIMESTAMP
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func

from .base import Base


class CashFlow(Base):
    """
    Cash Flow model - maps to user_data.cash_flows table.
    
    Represents deposits, withdrawals, dividends, and other cash movements.
    """
    __tablename__ = "cash_flows"
    __table_args__ = (
        CheckConstraint(
            "flow_type IN ('DEPOSIT', 'WITHDRAWAL', 'DIVIDEND', 'INTEREST', 'FEE', 'OTHER')",
            name="cash_flows_flow_type_check"
        ),
        {"schema": "user_data"},
    )
    
    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid()
    )
    
    # Foreign Keys
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user_data.users.id", ondelete="CASCADE"),
        nullable=False
    )
    trading_account_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user_data.trading_accounts.id", ondelete="CASCADE"),
        nullable=False
    )
    
    # Type
    flow_type: Mapped[str] = mapped_column(String(20), nullable=False)
    
    # Amount
    amount: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    currency: Mapped[str] = mapped_column(
        String(3),
        nullable=False,
        default="USD",
        server_default="USD"
    )
    
    # Details
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False)
    
    # External
    external_reference: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Audit
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user_data.users.id", ondelete="CASCADE"),
        nullable=False
    )
    updated_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user_data.users.id", ondelete="CASCADE"),
        nullable=False
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
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True
    )
    
    # Metadata (renamed from 'metadata' - reserved name in SQLAlchemy)
    flow_metadata: Mapped[Optional[dict]] = mapped_column(
        "metadata",
        JSONB,
        nullable=True,
        default=dict,
        server_default="'{}'::JSONB"
    )
    
    # Relationships
    # Note: Will be defined after TradingAccount model is imported
    # trading_account: Mapped["TradingAccount"] = relationship("TradingAccount", back_populates="cash_flows")
