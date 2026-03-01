"""
User Tickers Model - SQLAlchemy ORM
Task: 20.UT.1
Source: TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF

Junction table user_data.user_tickers (user_id, ticker_id).
Per work plan: UNIQUE (user_id, ticker_id) WHERE deleted_at IS NULL.
"""

import uuid
from datetime import datetime
from sqlalchemy import ForeignKey, TIMESTAMP, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from sqlalchemy.sql import func

from .base import Base


class UserTicker(Base):
    """
    User Tickers model - maps to user_data.user_tickers table.
    
    Junction: user ↔ ticker for "הטיקרים שלי" (My Tickers).
    Soft delete via deleted_at.
    """
    __tablename__ = "user_tickers"
    __table_args__ = ({"schema": "user_data"},)

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
    ticker_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("market_data.tickers.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True,
    )
    # G7 M-001: canonical status + user notes
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        server_default="'active'",
    )
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    user = relationship("User", back_populates="user_tickers")
    ticker = relationship("Ticker", back_populates="user_tickers")
