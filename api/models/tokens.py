"""
Token Models - Refresh Tokens & Revoked Tokens
Task: 20.1.5 (Supporting models)
Status: COMPLETED

SQLAlchemy ORM models for JWT refresh token management and blacklist.
Based on Architectural Answer + GIN-2026-008 (Appendix A)
"""

import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMPTZ
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func

from .base import Base


class UserRefreshToken(Base):
    """
    User Refresh Token model - maps to user_data.user_refresh_tokens table.
    
    Stores refresh tokens for JWT authentication with rotation support.
    """
    __tablename__ = "user_refresh_tokens"
    __table_args__ = (
        {"schema": "user_data"},
        CheckConstraint("LENGTH(jti) > 0", name="user_refresh_tokens_jti_not_empty"),
        CheckConstraint("LENGTH(token_hash) > 0", name="user_refresh_tokens_hash_not_empty"),
    )
    
    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid()
    )
    
    # Foreign Key
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user_data.users.id", ondelete="CASCADE"),
        nullable=False
    )
    
    # Token Data
    token_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    jti: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    
    # Expiration
    expires_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, nullable=False)
    
    # Revocation
    revoked_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMPTZ, nullable=True)
    
    # Audit
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMPTZ,
        nullable=False,
        server_default=func.now()
    )
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="refresh_tokens")
    
    def __repr__(self) -> str:
        return f"<UserRefreshToken(id={self.id}, user_id={self.user_id}, jti={self.jti[:8]}..., expires_at={self.expires_at})>"


class RevokedToken(Base):
    """
    Revoked Token model - maps to user_data.revoked_tokens table.
    
    Blacklist for revoked JWT access tokens (logout, security).
    """
    __tablename__ = "revoked_tokens"
    __table_args__ = (
        {"schema": "user_data"},
        CheckConstraint("LENGTH(jti) > 0", name="revoked_tokens_jti_not_empty"),
    )
    
    # Primary Key
    jti: Mapped[str] = mapped_column(String(255), primary_key=True)
    
    # Expiration (for automatic cleanup)
    expires_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, nullable=False)
    
    # Revocation timestamp
    revoked_at: Mapped[datetime] = mapped_column(
        TIMESTAMPTZ,
        nullable=False,
        server_default=func.now()
    )
    
    def __repr__(self) -> str:
        return f"<RevokedToken(jti={self.jti[:8]}..., expires_at={self.expires_at}, revoked_at={self.revoked_at})>"
