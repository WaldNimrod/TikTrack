"""
Tag Model - TikTrack
====================

Stores an individual tag that can be attached to multiple entity records.
Tags belong to a user and optionally to a category for organization and
color mapping.

Author: TikTrack Development Team
Created: November 2025
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Text,
    ForeignKey,
    DateTime,
    func,
)
from sqlalchemy.orm import relationship
from .base import BaseModel


class Tag(BaseModel):
    """Describes a single tag with metadata and usage counters."""

    __tablename__ = "tags"
    user_id = Column(Integer, nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("tag_categories.id"), nullable=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    usage_count = Column(Integer, nullable=False, default=0)
    last_used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )

    category = relationship("TagCategory", back_populates="tags")
    links = relationship(
        "TagLink",
        back_populates="tag",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return f"<Tag(id={self.id}, name='{self.name}', user_id={self.user_id})>"

    def to_dict(self):
        """Return dictionary representation with optional category metadata."""
        base = {
            "id": self.id,
            "user_id": self.user_id,
            "category_id": self.category_id,
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "is_active": self.is_active,
            "usage_count": self.usage_count,
            "last_used_at": self.last_used_at,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
        if self.category:
            base["category"] = {
                "id": self.category.id,
                "name": self.category.name,
                "color_hex": self.category.color_hex,
            }
        return base




