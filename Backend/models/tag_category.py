"""
TagCategory Model - TikTrack
============================

Represents a logical collection of tags for a specific user. Categories
control display properties (color, ordering) and can be toggled on/off
without removing associated tags.

Author: TikTrack Development Team
Created: November 2025
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from .base import BaseModel


class TagCategory(BaseModel):
    """Two-level hierarchy container for user tags."""

    __tablename__ = "tag_categories"
    __table_args__ = (
        {
            "sqlite_autoincrement": True,
        },
    )

    user_id = Column(Integer, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    color_hex = Column(String(7), nullable=True)
    order_index = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )

    tags = relationship(
        "Tag",
        back_populates="category",
        cascade="all, delete-orphan",
        order_by="Tag.name",
    )

    def __repr__(self) -> str:
        return f"<TagCategory(id={self.id}, name='{self.name}', user_id={self.user_id})>"

    def to_dict(self):
        """Convert category to serializable dictionary."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "color_hex": self.color_hex,
            "order_index": self.order_index,
            "is_active": self.is_active,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "tag_count": len(self.tags) if self.tags else 0,
        }


