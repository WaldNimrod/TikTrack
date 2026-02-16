"""
Notes Model - SQLAlchemy ORM (D35)
TEAM_10_TO_TEAM_20_D35_RICH_TEXT_ATTACHMENTS_MANDATE
Maps to user_data.notes table per PHX_DB_SCHEMA_V2.5
"""

import uuid
from typing import Optional
from sqlalchemy import String, Text, ForeignKey, CheckConstraint, BigInteger
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from sqlalchemy import TIMESTAMP

from .base import Base
from .enums import note_category_enum


class Note(Base):
    """
    Note model - maps to user_data.notes table.
    D35: Rich Text content (sanitized server-side); polymorphic parent.
    """
    __tablename__ = "notes"
    __table_args__ = (
        CheckConstraint(
            "parent_type IN ('trade', 'trade_plan', 'ticker', 'account', 'general')",
            name="notes_parent_type_check",
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
    parent_type: Mapped[str] = mapped_column(String(50), nullable=False)
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
    )
    title: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(
        note_category_enum,
        nullable=False,
        default="GENERAL",
        server_default="GENERAL",
    )
    is_pinned: Mapped[bool] = mapped_column(
        default=False,
        server_default="false",
        nullable=False,
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
    created_at: Mapped[object] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[object] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    deleted_at: Mapped[Optional[object]] = mapped_column(
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
    tags: Mapped[Optional[list]] = mapped_column(
        ARRAY(String),
        nullable=True,
    )

    attachments: Mapped[list["NoteAttachment"]] = relationship(
        "NoteAttachment",
        back_populates="note",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class NoteAttachment(Base):
    """
    NoteAttachment model - maps to user_data.note_attachments table.
    D35: Max 3 per note, 1MB per file, MIME magic-bytes validated.
    """
    __tablename__ = "note_attachments"
    __table_args__ = {"schema": "user_data"}

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    note_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user_data.notes.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user_data.users.id", ondelete="CASCADE"),
        nullable=False,
    )
    storage_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str] = mapped_column(String(128), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    created_at: Mapped[object] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user_data.users.id", ondelete="CASCADE"),
        nullable=False,
    )

    note: Mapped["Note"] = relationship("Note", back_populates="attachments")
