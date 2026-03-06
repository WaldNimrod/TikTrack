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
from ..models.tickers import Ticker
from ..models.trades import Trade
from ..models.trade_plans import TradePlan
from ..models.trading_accounts import TradingAccount
from ..models.enums import NoteCategory
from ..utils.rich_text_sanitizer import sanitize_rich_text


async def _resolve_parent_display_names(
    db: AsyncSession,
    notes: List[Note],
    user_id: uuid.UUID,
) -> dict:
    """G7R Batch3: Resolve parent_id -> display name for ticker, trade, trade_plan, account."""
    out = {}
    ticker_ids = []
    trade_ids = []
    plan_ids = []
    account_ids = []
    for n in notes:
        if not n.parent_id:
            continue
        if n.parent_type == "ticker":
            ticker_ids.append(n.parent_id)
        elif n.parent_type == "trade":
            trade_ids.append(n.parent_id)
        elif n.parent_type == "trade_plan":
            plan_ids.append(n.parent_id)
        elif n.parent_type == "account":
            account_ids.append(n.parent_id)
    if ticker_ids:
        stmt = select(Ticker.id, Ticker.symbol).where(Ticker.id.in_(ticker_ids))
        res = await db.execute(stmt)
        for row in res.all():
            out[("ticker", row[0])] = row[1] or str(row[0])
    if trade_ids:
        stmt = (
            select(Trade.id, Ticker.symbol, Trade.direction)
            .join(Ticker, Trade.ticker_id == Ticker.id)
            .where(Trade.id.in_(trade_ids), Trade.user_id == user_id)
        )
        res = await db.execute(stmt)
        for row in res.all():
            out[("trade", row[0])] = f"{row[1] or '?'} {row[2] or ''}".strip()
    if plan_ids:
        stmt = select(TradePlan.id, TradePlan.plan_name).where(
            TradePlan.id.in_(plan_ids), TradePlan.user_id == user_id
        )
        res = await db.execute(stmt)
        for row in res.all():
            out[("trade_plan", row[0])] = row[1] or str(row[0])
    if account_ids:
        stmt = select(TradingAccount.id, TradingAccount.account_name).where(
            TradingAccount.id.in_(account_ids), TradingAccount.user_id == user_id
        )
        res = await db.execute(stmt)
        for row in res.all():
            out[("account", row[0])] = row[1] or str(row[0])
    return out


def _note_to_response(
    note: Note,
    linked_entity_display: Optional[str] = None,
    attachment_count: Optional[int] = None,
) -> dict:
    """G7R Batch3: linked_entity_display (BF-G7-012); attachment_count (BF-G7-023)."""
    if note.parent_type == "datetime" and getattr(note, "parent_datetime", None) and not linked_entity_display:
        dt_val = note.parent_datetime
        linked_entity_display = dt_val.strftime("%Y-%m-%d %H:%M UTC") if hasattr(dt_val, "strftime") else str(dt_val)
    tags_val = note.tags
    if tags_val is not None and not isinstance(tags_val, list):
        tags_val = list(tags_val) if tags_val else None
    count = attachment_count if attachment_count is not None else len(getattr(note, "attachments", []))
    return {
        "id": str(note.id),
        "user_id": str(note.user_id),
        "parent_type": note.parent_type,
        "parent_id": str(note.parent_id) if note.parent_id else None,
        "parent_datetime": getattr(note, "parent_datetime", None),
        "linked_entity_display": linked_entity_display,
        "attachment_count": count,
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
        note_ids = [n.id for n in notes]
        count_subq = (
            select(NoteAttachment.note_id, func.count(NoteAttachment.id).label("cnt"))
            .where(NoteAttachment.note_id.in_(note_ids))
            .group_by(NoteAttachment.note_id)
        )
        count_res = await db.execute(count_subq)
        count_map = {row[0]: row[1] for row in count_res.all()}
        display_map = await _resolve_parent_display_names(db, notes, user_id) if notes else {}
        return [
            _note_to_response(
                n,
                linked_entity_display=display_map.get((n.parent_type, n.parent_id)) if n.parent_id else None,
                attachment_count=count_map.get(n.id, 0),
            )
            for n in notes
        ]

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
        if not note:
            return None
        display_map = await _resolve_parent_display_names(db, [note], user_id)
        led = display_map.get((note.parent_type, note.parent_id)) if note.parent_id else None
        return _note_to_response(note, linked_entity_display=led)

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

        parent_type_val = (data.get("parent_type") or "ticker").lower()
        if parent_type_val == "general":
            from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
            raise HTTPExceptionWithCode(status_code=422, detail="parent_type 'general' is not allowed", error_code=ErrorCodes.VALIDATION_INVALID_FORMAT)
        if parent_type_val not in ("trade", "trade_plan", "ticker", "account", "datetime"):
            parent_type_val = "ticker"

        parent_datetime_val = data.get("parent_datetime")
        if parent_datetime_val and isinstance(parent_datetime_val, str):
            try:
                parent_datetime_val = datetime.fromisoformat(parent_datetime_val.replace("Z", "+00:00"))
            except (ValueError, TypeError):
                parent_datetime_val = None

        if parent_type_val == "datetime" and not parent_datetime_val:
            from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
            raise HTTPExceptionWithCode(
                status_code=422,
                detail="parent_datetime required when parent_type=datetime",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
            )
        if parent_type_val != "datetime" and data.get("parent_datetime"):
            from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
            raise HTTPExceptionWithCode(
                status_code=422,
                detail="parent_datetime not allowed when parent_type is entity",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
            )
        # BF-G7-017: entity types require parent_id
        if parent_type_val in ("ticker", "trade", "trade_plan", "account") and not parent_id:
            from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
            raise HTTPExceptionWithCode(status_code=422, detail=f"parent_id required when parent_type is {parent_type_val}", error_code=ErrorCodes.VALIDATION_INVALID_FORMAT)

        cat_val = (data.get("category") or "GENERAL").upper()
        if cat_val not in ("TRADE", "PSYCHOLOGY", "ANALYSIS", "GENERAL"):
            cat_val = "GENERAL"
        category = NoteCategory(cat_val)

        tags_val = data.get("tags")
        if tags_val is not None and not isinstance(tags_val, list):
            tags_val = None

        note = Note(
            user_id=user_id,
            parent_type=parent_type_val,
            parent_id=parent_id if parent_type_val != "datetime" else None,
            parent_datetime=parent_datetime_val if parent_type_val == "datetime" else None,
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
        display_map = await _resolve_parent_display_names(db, [note], user_id)
        led = display_map.get((note.parent_type, note.parent_id)) if note.parent_id else None
        return _note_to_response(note, linked_entity_display=led)

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

        # BF-G7-018: Apply linked_entity change (parent_type, parent_id, parent_datetime)
        if "parent_type" in data or "parent_id" in data or "parent_datetime" in data:
            parent_type_val = (data.get("parent_type") or note.parent_type or "ticker").lower()
            if parent_type_val not in ("trade", "trade_plan", "ticker", "account", "datetime"):
                parent_type_val = note.parent_type or "ticker"
            if parent_type_val == "datetime":
                parent_datetime_val = data.get("parent_datetime")
                if parent_datetime_val and isinstance(parent_datetime_val, str):
                    try:
                        parent_datetime_val = datetime.fromisoformat(parent_datetime_val.replace("Z", "+00:00"))
                    except (ValueError, TypeError):
                        parent_datetime_val = None
                if not parent_datetime_val:
                    from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
                    raise HTTPExceptionWithCode(status_code=422, detail="parent_datetime required when parent_type=datetime", error_code=ErrorCodes.VALIDATION_INVALID_FORMAT)
                note.parent_type = parent_type_val
                note.parent_id = None
                note.parent_datetime = parent_datetime_val
            else:
                parent_id_val = None
                if data.get("parent_id"):
                    try:
                        parent_id_val = uuid.UUID(data["parent_id"])
                    except (ValueError, TypeError):
                        pass
                if not parent_id_val:
                    from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
                    raise HTTPExceptionWithCode(status_code=422, detail=f"parent_id required when parent_type is {parent_type_val}", error_code=ErrorCodes.VALIDATION_INVALID_FORMAT)
                note.parent_type = parent_type_val
                note.parent_id = parent_id_val
                note.parent_datetime = None

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
        display_map = await _resolve_parent_display_names(db, [note], user_id)
        led = display_map.get((note.parent_type, note.parent_id)) if note.parent_id else None
        return _note_to_response(note, linked_entity_display=led)

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
        notes_by_parent_type = {pt: 0 for pt in ("ticker", "trade", "trade_plan", "account")}
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
