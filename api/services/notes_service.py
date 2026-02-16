"""
Notes Service - D35 (Rich Text + Attachments)
TEAM_10_TO_TEAM_20_D35_RICH_TEXT_ATTACHMENTS_MANDATE
"""

import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from ..models.notes import Note, NoteAttachment
from ..models.enums import NoteCategory
from ..utils.rich_text_sanitizer import sanitize_rich_text


def _note_to_response(note: Note) -> dict:
    tags_val = note.tags
    if tags_val is not None and not isinstance(tags_val, list):
        tags_val = list(tags_val) if tags_val else None
    return {
        "id": str(note.id),
        "user_id": str(note.user_id),
        "parent_type": note.parent_type,
        "parent_id": str(note.parent_id) if note.parent_id else None,
        "title": note.title,
        "content": note.content,
        "category": (
            note.category.value
            if hasattr(note.category, "value")
            else str(getattr(note.category, "name", note.category))
        ),
        "is_pinned": note.is_pinned,
        "tags": tags_val,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
    }


class NotesService:
    _instance: Optional["NotesService"] = None

    @classmethod
    def get_instance(cls) -> "NotesService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def list_notes(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        parent_type: Optional[str] = None,
        parent_id: Optional[str] = None,
    ) -> List[dict]:
        conditions = [
            Note.user_id == user_id,
            Note.deleted_at.is_(None),
        ]
        if parent_type:
            conditions.append(Note.parent_type == parent_type)
        if parent_id:
            try:
                conditions.append(Note.parent_id == uuid.UUID(parent_id))
            except ValueError:
                pass
        stmt = select(Note).where(and_(*conditions)).order_by(Note.created_at.desc())
        result = await db.execute(stmt)
        notes = result.scalars().all()
        return [_note_to_response(n) for n in notes]

    async def get_note(
        self,
        db: AsyncSession,
        note_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Optional[dict]:
        stmt = select(Note).where(
            and_(
                Note.id == note_id,
                Note.user_id == user_id,
                Note.deleted_at.is_(None),
            )
        )
        result = await db.execute(stmt)
        note = result.scalar_one_or_none()
        return _note_to_response(note) if note else None

    async def create_note(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        data: dict,
    ) -> dict:
        content = data.get("content", "")
        sanitized = sanitize_rich_text(content)
        if sanitized is None:
            sanitized = ""

        parent_id = None
        if data.get("parent_id"):
            try:
                parent_id = uuid.UUID(data["parent_id"])
            except (ValueError, TypeError):
                pass

        cat_val = (data.get("category") or "GENERAL").upper()
        if cat_val not in ("TRADE", "PSYCHOLOGY", "ANALYSIS", "GENERAL"):
            cat_val = "GENERAL"
        category = NoteCategory(cat_val)

        tags_val = data.get("tags")
        if tags_val is not None and not isinstance(tags_val, list):
            tags_val = None

        note = Note(
            user_id=user_id,
            parent_type=data.get("parent_type", "general"),
            parent_id=parent_id,
            title=data.get("title"),
            content=sanitized,
            category=category,
            is_pinned=data.get("is_pinned", False),
            tags=tags_val,
            created_by=user_id,
            updated_by=user_id,
        )
        db.add(note)
        await db.flush()
        await db.refresh(note)
        return _note_to_response(note)

    async def update_note(
        self,
        db: AsyncSession,
        note_id: uuid.UUID,
        user_id: uuid.UUID,
        data: dict,
    ) -> Optional[dict]:
        stmt = select(Note).where(
            and_(
                Note.id == note_id,
                Note.user_id == user_id,
                Note.deleted_at.is_(None),
            )
        )
        result = await db.execute(stmt)
        note = result.scalar_one_or_none()
        if not note:
            return None

        if "title" in data:
            note.title = data["title"]
        if "content" in data:
            sanitized = sanitize_rich_text(data["content"])
            note.content = sanitized if sanitized is not None else note.content
        if "category" in data:
            cat = (data["category"] or "GENERAL").upper()
            if cat in ("TRADE", "PSYCHOLOGY", "ANALYSIS", "GENERAL"):
                note.category = NoteCategory(cat)
        if "is_pinned" in data:
            note.is_pinned = bool(data["is_pinned"])
        if "tags" in data:
            note.tags = data["tags"] if isinstance(data["tags"], list) else None

        note.updated_by = user_id
        await db.flush()
        await db.refresh(note)
        return _note_to_response(note)

    async def delete_note(
        self,
        db: AsyncSession,
        note_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> bool:
        stmt = select(Note).where(
            and_(
                Note.id == note_id,
                Note.user_id == user_id,
                Note.deleted_at.is_(None),
            )
        )
        result = await db.execute(stmt)
        note = result.scalar_one_or_none()
        if not note:
            return False
        from datetime import datetime, timezone
        note.deleted_at = datetime.now(timezone.utc)
        note.updated_by = user_id
        await db.flush()
        return True

    async def get_notes_summary(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> dict:
        """
        TEAM_30 request — סיכום סקשן "סיכום מידע" בעמוד הערות.
        recent_notes = 10 ימים אחרונים (לפי דוח תאימות §10).
        """
        base = and_(Note.user_id == user_id, Note.deleted_at.is_(None))

        # total_notes, pinned_notes, recent_notes, notes_with_tags
        total_stmt = select(func.count()).select_from(Note).where(base)
        total = (await db.execute(total_stmt)).scalar() or 0

        pinned_stmt = select(func.count()).select_from(Note).where(
            and_(base, Note.is_pinned.is_(True))
        )
        pinned = (await db.execute(pinned_stmt)).scalar() or 0

        cutoff = datetime.now(timezone.utc) - timedelta(days=10)
        recent_stmt = select(func.count()).select_from(Note).where(
            and_(base, Note.created_at >= cutoff)
        )
        recent = (await db.execute(recent_stmt)).scalar() or 0

        # notes_with_tags: tags IS NOT NULL AND cardinality > 0 (PostgreSQL)
        tags_stmt = select(func.count()).select_from(Note).where(
            and_(base, Note.tags.isnot(None), func.coalesce(func.cardinality(Note.tags), 0) > 0)
        )
        notes_with_tags = (await db.execute(tags_stmt)).scalar() or 0

        # notes_by_parent_type
        parent_stmt = (
            select(Note.parent_type, func.count().label("cnt"))
            .where(base)
            .group_by(Note.parent_type)
        )
        parent_result = (await db.execute(parent_stmt)).all()
        notes_by_parent_type = {pt: 0 for pt in ("ticker", "trade", "trade_plan", "account", "general")}
        for row in parent_result:
            notes_by_parent_type[row.parent_type] = row.cnt

        # total_attachments (for user's notes)
        attach_stmt = (
            select(func.count())
            .select_from(NoteAttachment)
            .join(Note, NoteAttachment.note_id == Note.id)
            .where(base)
        )
        total_attachments = (await db.execute(attach_stmt)).scalar() or 0

        return {
            "total_notes": total,
            "recent_notes": recent,
            "total_attachments": total_attachments,
            "pinned_notes": pinned,
            "notes_with_tags": notes_with_tags,
            "notes_by_parent_type": notes_by_parent_type,
        }


def get_notes_service() -> NotesService:
    return NotesService.get_instance()
