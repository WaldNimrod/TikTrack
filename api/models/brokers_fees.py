"""
Brokers Fees Model - SQLAlchemy ORM
Task: Phase 2.1 - Brokers Fees (D18)
Status: ADR-017/018 CLOSED

ORM model for user_data.trading_account_fees table (migrated from brokers_fees).
Endpoint remains /brokers_fees; table is trading_account_fees.
Based on WP_20_09_FIELD_MAP_BROKERS_FEES.md
"""

import uuid
from datetime import datetime
from typing import Optional
from decimal import Decimal
from sqlalchemy import String, ForeignKey, Numeric, CheckConstraint, TIMESTAMP, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from .base import Base

# DB uses user_data.commission_type ENUM — do not create_type
commission_type_enum = Enum(
    "TIERED", "FLAT", name="commission_type", schema="user_data", create_type=False
)


class BrokerFee(Base):
    """
    Broker Fee model - maps to user_data.trading_account_fees table (ADR-017/018).

    Represents trading account commission structures and fees.
    """

    __tablename__ = "trading_account_fees"
    __table_args__ = (
        CheckConstraint("minimum >= 0", name="trading_account_fees_minimum_check"),
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
        UUID(as_uuid=True),
        ForeignKey("user_data.users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    trading_account_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user_data.trading_accounts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Fee structure (broker derived from trading_accounts.broker - ADR-015)

    commission_type: Mapped[str] = mapped_column(commission_type_enum, nullable=False)

    commission_value: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)

    minimum: Mapped[Decimal] = mapped_column(
        Numeric(20, 6), nullable=False, default=Decimal("0.00"), server_default="0"
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )

    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True, index=True
    )
