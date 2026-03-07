"""
Alerts Model - SQLAlchemy ORM (D34)
TEAM_30_TO_TEAM_20_MB3A_ALERTS_API_REQUIREMENTS
TEAM_60_TO_TEAM_20_D34_ALERTS_DDL_COORDINATION
Maps to user_data.alerts table per PHX_DB_SCHEMA_V2.5
"""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, Text, ForeignKey, CheckConstraint, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from sqlalchemy import TIMESTAMP

from .base import Base
from .enums import alert_type_enum, alert_priority_enum, AlertType, AlertPriority


class Alert(Base):
    """
    Alert model - maps to user_data.alerts table.
    D34: Price alerts and notifications (polymorphic).
    G7R Stream1: target_type general removed; datetime added; target_datetime added.
    """
    __tablename__ = "alerts"
    __table_args__ = (
        CheckConstraint(
            "target_type IS NULL OR target_type IN ('ticker', 'trade', 'trade_plan', 'account', 'datetime')",
            name="alerts_target_type_check",
        ),
        {"schema": "user_data"},
    )

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
    target_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    target_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
    )
    ticker_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("market_data.tickers.id", ondelete="CASCADE"),
        nullable=True,
    )
    alert_type: Mapped[AlertType] = mapped_column(
        alert_type_enum,
        nullable=False,
    )
    priority: Mapped[AlertPriority] = mapped_column(
        alert_priority_enum,
        nullable=False,
        default=AlertPriority.MEDIUM,
        server_default="MEDIUM",
    )
    condition_field: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    condition_operator: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    condition_value: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 8), nullable=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(
        default=True,
        server_default="true",
        nullable=False,
    )
    is_triggered: Mapped[bool] = mapped_column(
        default=False,
        server_default="false",
        nullable=False,
    )
    trigger_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="untriggered",
        server_default="'untriggered'",
    )
    triggered_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True,
    )
    target_datetime: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True,
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True,
    )
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
    metadata_: Mapped[Optional[dict]] = mapped_column(
        "metadata",
        JSONB,
        nullable=True,
        default=dict,
        server_default="'{}'::JSONB",
    )
