"""
Identity Models - User, Password Reset, API Keys
Task: 20.1.2
Status: COMPLETED

SQLAlchemy ORM models for identity and authentication.
Based on PHX_DB_SCHEMA_V2.5_FULL_DDL.sql
LOD 400 Compliance: All fields match SQL schema exactly.
"""

import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    String, Boolean, Integer, Text, ForeignKey,
    CheckConstraint, Index, TIMESTAMP
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func

from .base import Base
from .enums import UserRole, ResetMethod, ApiProvider, user_role_enum, reset_method_enum, api_provider_enum


class User(Base):
    """
    User model - maps to user_data.users table.
    
    Identity fields: username, email, password_hash, phone_number
    Profile: first_name, last_name, display_name
    Security: role, is_active, failed_login_attempts, locked_until
    """
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "phone_number IS NULL OR phone_number ~ '^\\+?[1-9]\\d{1,14}$'",
            name="users_phone_format"
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
    
    # Identity
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Phone Identity (V2.5)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    phone_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    phone_verified_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    
    # Profile
    first_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    display_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Settings
    role: Mapped[UserRole] = mapped_column(
        user_role_enum,
        nullable=False,
        default=UserRole.USER,
        server_default="USER"
    )
    timezone: Mapped[str] = mapped_column(String(50), nullable=False, default="UTC", server_default="UTC")
    language: Mapped[str] = mapped_column(String(5), nullable=False, default="en", server_default="en")
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")
    is_email_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    email_verified_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    
    # Security
    last_login_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    last_login_ip: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    locked_until: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    
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
    deleted_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    
    # Metadata (renamed from 'metadata' - reserved name in SQLAlchemy)
    user_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, server_default="{}")
    
    # Relationships
    password_reset_requests: Mapped[List["PasswordResetRequest"]] = relationship(
        "PasswordResetRequest",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    api_keys: Mapped[List["UserApiKey"]] = relationship(
        "UserApiKey",
        foreign_keys="[UserApiKey.user_id]",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    refresh_tokens: Mapped[List["UserRefreshToken"]] = relationship(
        "UserRefreshToken",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    user_tickers: Mapped[List["UserTicker"]] = relationship(
        "UserTicker",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"


class PasswordResetRequest(Base):
    """
    Password Reset Request model - maps to user_data.password_reset_requests table.
    
    Supports both EMAIL (token) and SMS (verification_code) methods.
    """
    __tablename__ = "password_reset_requests"
    __table_args__ = (
        CheckConstraint("LENGTH(reset_token) >= 32", name="password_reset_token_length"),
        CheckConstraint(
            "verification_code IS NULL OR LENGTH(verification_code) = 6",
            name="password_reset_code_length"
        ),
        CheckConstraint("attempts_count <= max_attempts", name="password_reset_attempts_limit"),
        {"schema": "user_data"},
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
    
    # Method
    method: Mapped[ResetMethod] = mapped_column(reset_method_enum, nullable=False)
    sent_to: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Token (for email)
    reset_token: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    token_expires_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    
    # Code (for SMS)
    verification_code: Mapped[Optional[str]] = mapped_column(String(6), nullable=True)
    code_expires_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    attempts_count: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    max_attempts: Mapped[int] = mapped_column(Integer, default=3, server_default="3")
    
    # Status
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="PENDING",
        server_default="PENDING"
    )
    
    # Usage
    used_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    used_from_ip: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    
    # Audit
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now()
    )
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="password_reset_requests")
    
    def __repr__(self) -> str:
        return f"<PasswordResetRequest(id={self.id}, user_id={self.user_id}, method={self.method}, status={self.status})>"


class UserApiKey(Base):
    """
    User API Key model - maps to user_data.user_api_keys table.
    
    Stores encrypted API keys for multiple providers (IBKR, Polygon, etc.).
    """
    __tablename__ = "user_api_keys"
    __table_args__ = (
        Index(
            "user_api_keys_unique_user_provider",
            "user_id", "provider", "provider_label",
            unique=True,
            postgresql_where=func.deleted_at.is_(None)
        ),
        CheckConstraint("LENGTH(api_key_encrypted) > 0", name="user_api_keys_encrypted_not_empty"),
        CheckConstraint(
            "rate_limit_per_minute IS NULL OR rate_limit_per_minute > 0",
            name="user_api_keys_rate_limit_positive"
        ),
        CheckConstraint("quota_used_today >= 0", name="user_api_keys_quota_logic"),
        {"schema": "user_data"},
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
    
    # Provider
    provider: Mapped[ApiProvider] = mapped_column(api_provider_enum, nullable=False)
    provider_label: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Credentials (ENCRYPTED!)
    api_key_encrypted: Mapped[str] = mapped_column(Text, nullable=False)
    api_secret_encrypted: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    additional_config: Mapped[dict] = mapped_column(JSONB, default=dict, server_default="{}")
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    last_verified_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    verification_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Rate Limiting
    rate_limit_per_minute: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    rate_limit_per_day: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    quota_used_today: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    quota_reset_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    
    # Audit
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user_data.users.id"),
        nullable=False
    )
    updated_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user_data.users.id"),
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
    deleted_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1, server_default="1")
    
    # Metadata (renamed from 'metadata' - reserved name in SQLAlchemy)
    api_key_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, server_default="{}")
    
    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="api_keys"
    )
    
    def __repr__(self) -> str:
        return f"<UserApiKey(id={self.id}, user_id={self.user_id}, provider={self.provider}, is_active={self.is_active})>"
