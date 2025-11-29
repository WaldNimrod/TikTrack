"""
Tag Service - TikTrack
======================

Provides CRUD operations for tag categories and tags, assignment helpers for
all supported entities, analytics utilities, and suggestion endpoints.

Author: TikTrack Development Team
Created: November 2025
"""

from __future__ import annotations

import logging
import re
from datetime import datetime, timedelta
from typing import Dict, Iterable, List, Optional, Sequence, Set

from sqlalchemy import func
from sqlalchemy.orm import Session

from models import TagCategory, Tag, TagLink

logger = logging.getLogger(__name__)

# Function Index
# --------------
# get_categories, create_category, update_category, delete_category
# get_tags, create_tag, update_tag, delete_tag
# get_tags_for_entity, replace_tags_for_entity, remove_tag_from_entity
# get_suggestions and internal validation helpers


SUPPORTED_ENTITY_TYPES: Set[str] = {
    "trade",
    "trade_plan",
    "execution",
    "trading_account",
    "ticker",
    "alert",
    "note",
    "cash_flow",
}


class TagService:
    """
    Service wrapper for managing categories, tags and assignments.

    All methods expect a SQLAlchemy Session managed by the caller.
    """

    # --------------------------------------------------------------------- #
    # Category Operations
    # --------------------------------------------------------------------- #
    @staticmethod
    def get_categories(db: Session, user_id: int) -> List[TagCategory]:
        """Return all tag categories for a user ordered by order_index, name."""
        logger.debug("Fetching tag categories for user_id=%s", user_id)
        return (
            db.query(TagCategory)
            .filter(TagCategory.user_id == user_id)
            .order_by(TagCategory.order_index.asc(), TagCategory.name.asc())
            .all()
        )

    @staticmethod
    def create_category(
        db: Session,
        user_id: int,
        name: str,
        color_hex: Optional[str] = None,
        order_index: Optional[int] = None,
        is_active: bool = True,
    ) -> TagCategory:
        """Create a new tag category."""
        TagService._validate_name(name)
        category = TagCategory(
            user_id=user_id,
            name=name.strip(),
            color_hex=color_hex,
            order_index=order_index or 0,
            is_active=is_active,
        )
        db.add(category)
        db.commit()
        db.refresh(category)
        logger.info("Created tag category %s for user %s", category.id, user_id)
        return category

    @staticmethod
    def update_category(
        db: Session,
        category_id: int,
        user_id: int,
        *,
        name: Optional[str] = None,
        color_hex: Optional[str] = None,
        order_index: Optional[int] = None,
        is_active: Optional[bool] = None,
    ) -> Optional[TagCategory]:
        """Update an existing category; returns updated category or None."""
        category = (
            db.query(TagCategory)
            .filter(TagCategory.id == category_id, TagCategory.user_id == user_id)
            .first()
        )
        if not category:
            logger.warning(
                "Category %s not found for user %s during update", category_id, user_id
            )
            return None

        if name is not None:
            TagService._validate_name(name)
            category.name = name.strip()
        if color_hex is not None:
            category.color_hex = color_hex
        if order_index is not None:
            category.order_index = order_index
        if is_active is not None:
            category.is_active = is_active

        db.commit()
        db.refresh(category)
        logger.info("Updated tag category %s for user %s", category_id, user_id)
        return category

    @staticmethod
    def delete_category(db: Session, category_id: int, user_id: int) -> bool:
        """Delete a category and cascade delete its tags."""
        category = (
            db.query(TagCategory)
            .filter(TagCategory.id == category_id, TagCategory.user_id == user_id)
            .first()
        )
        if not category:
            logger.warning(
                "Category %s not found for user %s during delete", category_id, user_id
            )
            return False

        db.delete(category)
        db.commit()
        logger.info("Deleted tag category %s for user %s", category_id, user_id)
        return True

    # --------------------------------------------------------------------- #
    # Tag Operations
    # --------------------------------------------------------------------- #
    @staticmethod
    def get_tags(
        db: Session,
        user_id: int,
        *,
        include_inactive: bool = False,
        category_id: Optional[int] = None,
    ) -> List[Tag]:
        """Fetch tags for a user with optional filtering."""
        query = db.query(Tag).filter(Tag.user_id == user_id)
        if not include_inactive:
            query = query.filter(Tag.is_active.is_(True))
        if category_id is not None:
            query = query.filter(Tag.category_id == category_id)

        tags = query.order_by(Tag.name.asc()).all()
        logger.debug(
            "Fetched %s tags for user=%s category=%s",
            len(tags),
            user_id,
            category_id or "all",
        )
        return tags

    @staticmethod
    def create_tag(
        db: Session,
        user_id: int,
        name: str,
        *,
        category_id: Optional[int] = None,
        description: Optional[str] = None,
        is_active: bool = True,
    ) -> Tag:
        """Create a new tag."""
        TagService._validate_name(name)
        slug = TagService._slugify(name)

        existing = (
            db.query(Tag)
            .filter(Tag.user_id == user_id, func.lower(Tag.slug) == slug)
            .first()
        )
        if existing:
            raise ValueError("Tag with this name already exists for the user")

        if category_id:
            TagService._assert_category_ownership(db, user_id, category_id)

        tag = Tag(
            user_id=user_id,
            category_id=category_id,
            name=name.strip(),
            slug=slug,
            description=description,
            is_active=is_active,
        )
        db.add(tag)
        db.commit()
        db.refresh(tag)
        logger.info("Created tag %s for user %s", tag.id, user_id)
        return tag

    @staticmethod
    def update_tag(
        db: Session,
        tag_id: int,
        user_id: int,
        *,
        name: Optional[str] = None,
        category_id: Optional[int] = None,
        description: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> Optional[Tag]:
        """Update tag metadata."""
        tag = db.query(Tag).filter(Tag.id == tag_id, Tag.user_id == user_id).first()
        if not tag:
            logger.warning("Tag %s not found for user %s", tag_id, user_id)
            return None

        if name is not None:
            TagService._validate_name(name)
            new_slug = TagService._slugify(name)
            duplicate = (
                db.query(Tag)
                .filter(
                    Tag.user_id == user_id,
                    func.lower(Tag.slug) == new_slug,
                    Tag.id != tag_id,
                )
                .first()
            )
            if duplicate:
                raise ValueError("Another tag with this name already exists")
            tag.name = name.strip()
            tag.slug = new_slug

        if category_id is not None:
            if category_id:
                TagService._assert_category_ownership(db, user_id, category_id)
            tag.category_id = category_id

        if description is not None:
            tag.description = description
        if is_active is not None:
            tag.is_active = is_active

        db.commit()
        db.refresh(tag)
        logger.info("Updated tag %s for user %s", tag_id, user_id)
        return tag

    @staticmethod
    def delete_tag(db: Session, tag_id: int, user_id: int) -> bool:
        """Remove tag and all linked associations."""
        tag = db.query(Tag).filter(Tag.id == tag_id, Tag.user_id == user_id).first()
        if not tag:
            logger.warning("Tag %s not found for user %s during delete", tag_id, user_id)
            return False
        db.delete(tag)
        db.commit()
        logger.info("Deleted tag %s for user %s", tag_id, user_id)
        return True

    # --------------------------------------------------------------------- #
    # Assignment Helpers
    # --------------------------------------------------------------------- #
    @staticmethod
    def get_tags_for_entity(
        db: Session, entity_type: str, entity_id: int, user_id: int
    ) -> List[Tag]:
        """Return list of tags assigned to entity ordered by name."""
        TagService._validate_entity_type(entity_type)
        tags = (
            db.query(Tag)
            .join(TagLink, TagLink.tag_id == Tag.id)
            .filter(
                Tag.user_id == user_id,
                TagLink.entity_type == entity_type,
                TagLink.entity_id == entity_id,
            )
            .order_by(Tag.name.asc())
            .all()
        )
        logger.debug(
            "Fetched %s tags for %s:%s", len(tags), entity_type, entity_id
        )
        return tags

    @staticmethod
    def replace_tags_for_entity(
        db: Session,
        user_id: int,
        entity_type: str,
        entity_id: int,
        tag_ids: Sequence[int],
        *,
        created_by: Optional[int] = None,
    ) -> List[Tag]:
        """
        Replace tags for an entity with provided tag IDs.
        Returns the updated tag list.
        """
        TagService._validate_entity_type(entity_type)
        normalized_ids = TagService._normalize_ids(tag_ids)
        existing_links = (
            db.query(TagLink)
            .filter(TagLink.entity_type == entity_type, TagLink.entity_id == entity_id)
            .all()
        )
        existing_ids = {link.tag_id for link in existing_links}

        # Remove obsolete links
        for link in existing_links:
            if link.tag_id not in normalized_ids:
                db.delete(link)

        # Add new links
        new_ids = normalized_ids - existing_ids
        if new_ids:
            TagService._assert_tags_ownership(db, user_id, new_ids)
            now = datetime.utcnow()
            for tag_id in new_ids:
                db.add(
                    TagLink(
                        tag_id=tag_id,
                        entity_type=entity_type,
                        entity_id=entity_id,
                        created_by=created_by,
                        created_at=now,
                    )
                )
                TagService._increment_usage(db, tag_id, now)

        db.commit()
        logger.info(
            "Replaced tags for %s:%s (user %s) => %s",
            entity_type,
            entity_id,
            user_id,
            list(normalized_ids),
        )
        return TagService.get_tags_for_entity(db, entity_type, entity_id, user_id)

    @staticmethod
    def remove_tag_from_entity(
        db: Session, tag_id: int, entity_type: str, entity_id: int
    ) -> bool:
        """Remove a specific tag link from an entity."""
        TagService._validate_entity_type(entity_type)
        link = (
            db.query(TagLink)
            .filter(
                TagLink.tag_id == tag_id,
                TagLink.entity_type == entity_type,
                TagLink.entity_id == entity_id,
            )
            .first()
        )
        if not link:
            return False
        db.delete(link)
        db.commit()
        logger.info("Removed tag %s from %s:%s", tag_id, entity_type, entity_id)
        return True

    # --------------------------------------------------------------------- #
    # Suggestions & Analytics
    # --------------------------------------------------------------------- #
    @staticmethod
    def get_suggestions(
        db: Session,
        user_id: int,
        *,
        entity_type: Optional[str] = None,
        limit: int = 10,
    ) -> List[Tag]:
        """
        Return suggested tags ordered by usage (desc) then name.
        Optionally filter by entity_type (based on historical usage).
        """
        query = db.query(Tag).filter(Tag.user_id == user_id, Tag.is_active.is_(True))
        if entity_type:
            TagService._validate_entity_type(entity_type)
            query = query.join(TagLink).filter(TagLink.entity_type == entity_type)

        tags = (
            query.order_by(Tag.usage_count.desc(), Tag.last_used_at.desc(), Tag.name.asc())
            .limit(limit)
            .all()
        )
        logger.debug(
            "Suggestion query returned %s tags for user %s (entity=%s)",
            len(tags),
            user_id,
            entity_type or "all",
        )
        return tags

    @staticmethod
    def get_analytics(
        db: Session, user_id: int, *, limit: int = 10
    ) -> Dict[str, Any]:
        """
        Return analytics summary for tags, including usage leaderboard.
        """
        from models import TagLink  # Local import to avoid circular dependency

        summary: Dict[str, Any] = {}

        total_tags = (
            db.query(func.count(Tag.id)).filter(Tag.user_id == user_id).scalar() or 0
        )
        active_tags = (
            db.query(func.count(Tag.id))
            .filter(Tag.user_id == user_id, Tag.is_active.is_(True))
            .scalar()
            or 0
        )
        inactive_tags = total_tags - active_tags
        total_categories = (
            db.query(func.count(TagCategory.id))
            .filter(TagCategory.user_id == user_id)
            .scalar()
            or 0
        )
        active_categories = (
            db.query(func.count(TagCategory.id))
            .filter(TagCategory.user_id == user_id, TagCategory.is_active.is_(True))
            .scalar()
            or 0
        )

        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        usage_last_30_days = (
            db.query(func.count(TagLink.id))
            .join(Tag, Tag.id == TagLink.tag_id)
            .filter(
                Tag.user_id == user_id,
                TagLink.created_at >= thirty_days_ago,
            )
            .scalar()
            or 0
        )

        summary.update(
            {
                "tags_total": total_tags,
                "active_tags": active_tags,
                "inactive_tags": inactive_tags,
                "categories_total": total_categories,
                "active_categories": active_categories,
                "usage_last_30_days": usage_last_30_days,
                "suggestions_cached": min(active_tags, limit),
            }
        )

        leaderboard_rows = (
            db.query(
                Tag.id.label("tag_id"),
                Tag.name.label("tag_name"),
                Tag.usage_count,
                Tag.last_used_at,
                TagCategory.name.label("category_name"),
            )
            .outerjoin(TagCategory, Tag.category_id == TagCategory.id)
            .filter(Tag.user_id == user_id)
            .order_by(Tag.usage_count.desc(), Tag.name.asc())
            .limit(limit)
            .all()
        )

        usage: List[Dict[str, Any]] = []
        for row in leaderboard_rows:
            usage.append(
                {
                    "tag_id": row.tag_id,
                    "tag_name": row.tag_name,
                    "usage_count": row.usage_count or 0,
                    "last_used_at": row.last_used_at,
                    "category_name": row.category_name,
                    "top_entities": [],
                }
            )

        return {
            "summary": summary,
            "usage": usage,
        }

    @staticmethod
    def get_tag_cloud_data(
        db: Session, user_id: int, *, limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Return tag cloud data with usage counts for dashboard display.
        
        Returns active tags sorted by usage_count descending, including
        category name for display.
        
        Args:
            db: Database session
            user_id: User ID to filter tags
            limit: Maximum number of tags to return (default: 50)
            
        Returns:
            List of dicts with keys: tag_id, name, usage_count, category_name
        """
        cloud_rows = (
            db.query(
                Tag.id.label("tag_id"),
                Tag.name.label("name"),
                Tag.usage_count,
                TagCategory.name.label("category_name"),
            )
            .outerjoin(TagCategory, Tag.category_id == TagCategory.id)
            .filter(Tag.user_id == user_id, Tag.is_active.is_(True))
            .order_by(Tag.usage_count.desc(), Tag.name.asc())
            .limit(limit)
            .all()
        )
        
        cloud: List[Dict[str, Any]] = []
        for row in cloud_rows:
            cloud.append(
                {
                    "tag_id": row.tag_id,
                    "name": row.name,
                    "usage_count": row.usage_count or 0,
                    "category_name": row.category_name,
                }
            )
        
        return cloud

    # --------------------------------------------------------------------- #
    # Internal Helpers
    # --------------------------------------------------------------------- #
    @staticmethod
    def _validate_name(name: str) -> None:
        if not name or not name.strip():
            raise ValueError("Name cannot be empty")
        if len(name.strip()) > 100:
            raise ValueError("Name must be 100 characters or less")

    @staticmethod
    def _slugify(name: str) -> str:
        slug = re.sub(r"[^a-zA-Z0-9]+", "-", name.strip().lower()).strip("-")
        return slug[:120]

    @staticmethod
    def _validate_entity_type(entity_type: str) -> None:
        if entity_type not in SUPPORTED_ENTITY_TYPES:
            raise ValueError(f"Unsupported entity_type '{entity_type}'")

    @staticmethod
    def _assert_category_ownership(db: Session, user_id: int, category_id: int) -> None:
        exists = (
            db.query(TagCategory)
            .filter(TagCategory.id == category_id, TagCategory.user_id == user_id)
            .first()
        )
        if not exists:
            raise ValueError("Category does not belong to user")

    @staticmethod
    def _assert_tags_ownership(db: Session, user_id: int, tag_ids: Iterable[int]) -> None:
        tag_ids = set(tag_ids)
        if not tag_ids:
            return
        found_ids = {
            tag.id
            for tag in db.query(Tag).filter(Tag.user_id == user_id, Tag.id.in_(tag_ids))
        }
        missing = tag_ids - found_ids
        if missing:
            raise ValueError(f"Tags not found for user: {sorted(missing)}")

    @staticmethod
    def _increment_usage(db: Session, tag_id: int, timestamp: datetime) -> None:
        db.query(Tag).filter(Tag.id == tag_id).update(
            {
                Tag.usage_count: Tag.usage_count + 1,
                Tag.last_used_at: timestamp,
            },
            synchronize_session=False,
        )

    @staticmethod
    def _normalize_ids(tag_ids: Sequence[int]) -> Set[int]:
        normalized: Set[int] = set()
        for tag_id in tag_ids:
            if tag_id is None:
                continue
            if not isinstance(tag_id, int):
                raise ValueError("Tag IDs must be integers")
            normalized.add(tag_id)
        return normalized

