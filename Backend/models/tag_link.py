"""
TagLink Model - TikTrack
========================

Join table associating tags with entity records. Uses a polymorphic
entity_type + entity_id pair to support all eight tagged entities.

Tag links are automatically cleaned up when entities are deleted through
SQLAlchemy event listeners defined in each entity model. See:
- documentation/02-ARCHITECTURE/BACKEND/TAG_LINKS_CLEANUP_SYSTEM.md

Author: TikTrack Development Team
Created: November 2025
Updated: January 2025 - Added automatic cleanup system
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    func,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from .base import BaseModel


class TagLink(BaseModel):
    """Stores association between a tag and a target entity."""

    __tablename__ = "tag_links"
    __table_args__ = (
        UniqueConstraint("tag_id", "entity_type", "entity_id", name="uq_tag_entity"),
        Index("ix_tag_links_entity", "entity_type", "entity_id"),
        Index("ix_tag_links_tag_id", "tag_id"),
    )

    tag_id = Column(Integer, ForeignKey("tags.id", ondelete="CASCADE"), nullable=False)
    entity_type = Column(String(40), nullable=False)
    entity_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    created_by = Column(Integer, nullable=True)

    tag = relationship("Tag", back_populates="links")

    def __repr__(self) -> str:
        return (
            f"<TagLink(id={self.id}, tag_id={self.tag_id}, "
            f"entity_type='{self.entity_type}', entity_id={self.entity_id})>"
        )

    def to_dict(self):
        """Return serialized representation of the association."""
        return {
            "id": self.id,
            "tag_id": self.tag_id,
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "created_at": self.created_at,
            "created_by": self.created_by,
        }




