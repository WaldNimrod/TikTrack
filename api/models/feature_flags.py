"""
Feature flags — admin_data.feature_flags (D40, LLD S003-P003-WP001).
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from .base import Base


class FeatureFlag(Base):
    """Maps to admin_data.feature_flags."""

    __tablename__ = "feature_flags"
    __table_args__ = ({"schema": "admin_data"},)

    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    value_bool: Mapped[Optional[bool]] = mapped_column(nullable=True)
    value_text: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    updated_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user_data.users.id", ondelete="SET NULL"),
        nullable=True,
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
