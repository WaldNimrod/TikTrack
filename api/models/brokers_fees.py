"""
Brokers Fees Model - SQLAlchemy ORM
Task: Phase 2.1 - Brokers Fees (D18)
Status: IN PROGRESS

SQLAlchemy ORM model for brokers_fees table.
Based on WP_20_09_FIELD_MAP_BROKERS_FEES.md
"""

import uuid
from datetime import datetime
from typing import Optional
from decimal import Decimal
from sqlalchemy import (
    String, ForeignKey, Numeric, CheckConstraint, TIMESTAMP, Enum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from .base import Base

# DB uses user_data.commission_type ENUM (create_d18_brokers_fees_table.sql) — do not create_type
commission_type_enum = Enum('TIERED', 'FLAT', name='commission_type', schema='user_data', create_type=False)


class BrokerFee(Base):
    """
    Broker Fee model - maps to user_data.brokers_fees table.
    
    Represents broker commission structures and fees.
    """
    __tablename__ = "brokers_fees"
    __table_args__ = (
        CheckConstraint(
            "minimum >= 0",
            name="brokers_fees_minimum_check"
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
        nullable=False,
        index=True
    )
    
    # Broker Details
    broker: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )
    
    commission_type: Mapped[str] = mapped_column(
        commission_type_enum,
        nullable=False
    )
    
    commission_value: Mapped[Decimal] = mapped_column(
        Numeric(20, 6),
        nullable=False
    )
    
    minimum: Mapped[Decimal] = mapped_column(
        Numeric(20, 6),
        nullable=False,
        default=Decimal("0.00"),
        server_default="0"
    )
    
    # Timestamps
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
        nullable=True,
        index=True
    )
