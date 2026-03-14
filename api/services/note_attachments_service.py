"""
Note Attachments Service - D35
TEAM_10_TO_TEAM_20_D35_RICH_TEXT_ATTACHMENTS_MANDATE
Max 3 per note, 2.5MB per file (BF-G7-025), MIME magic-bytes validated.
Storage: storage/uploads/users/{user_id}/notes/{note_id}/{attachment_id}_{safe_filename}
"""

import re
import uuid
import os
from pathlib import Path
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from ..models.notes import Note, NoteAttachment
from ..core.config import settings
from ..utils.mime_magic import validate_mime_magic

MAX_FILE_BYTES = 2621440  # 2.5MB (BF-G7-025)
MAX_ATTACHMENTS_PER_NOTE = 3


def _safe_filename(filename: str) -> str:
    """Sanitize filename for storage (remove path, special chars)."""
    base = os.path.basename(filename.strip())
    base = re.sub(r"[^\w\-\.]", "_", base)
    return base or "attachment"


def _storage_path(
    user_id: uuid.UUID, note_id: uuid.UUID, attachment_id: uuid.UUID, safe_name: str
) -> str:
    """Relative path: users/{user_id}/notes/{note_id}/{attachment_id}_{safe_filename}"""
    return f"users/{user_id}/notes/{note_id}/{attachment_id}_{safe_name}"


def _full_path(rel_path: str) -> Path:
    """Absolute path for writing/reading."""
    base = Path(settings.storage_uploads_base)
    if not base.is_absolute():
        base = Path(__file__).resolve().parent.parent.parent.parent / base
    return base / rel_path


def _attachment_to_response(a: NoteAttachment) -> dict:
    return {
        "id": str(a.id),
        "note_id": str(a.note_id),
        "storage_path": a.storage_path,
        "original_filename": a.original_filename,
        "content_type": a.content_type,
        "file_size_bytes": a.file_size_bytes,
        "created_at": a.created_at,
    }


class NoteAttachmentsService:
    _instance: Optional["NoteAttachmentsService"] = None

    @classmethod
    def get_instance(cls) -> "NoteAttachmentsService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def count_attachments(self, db: AsyncSession, note_id: uuid.UUID) -> int:
        stmt = (
            select(func.count())
            .select_from(NoteAttachment)
            .where(NoteAttachment.note_id == note_id)
        )
        result = await db.execute(stmt)
        return result.scalar() or 0

    async def list_attachments(
        self,
        db: AsyncSession,
        note_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Optional[List[dict]]:
        # Verify note exists and belongs to user
        note_stmt = select(Note).where(
            and_(Note.id == note_id, Note.user_id == user_id, Note.deleted_at.is_(None))
        )
        note_result = await db.execute(note_stmt)
        if note_result.scalar_one_or_none() is None:
            return None

        stmt = select(NoteAttachment).where(NoteAttachment.note_id == note_id)
        result = await db.execute(stmt)
        attachments = result.scalars().all()
        return [_attachment_to_response(a) for a in attachments]

    async def upload_attachment(
        self,
        db: AsyncSession,
        note_id: uuid.UUID,
        user_id: uuid.UUID,
        file_content: bytes,
        original_filename: str,
        claimed_content_type: Optional[str],
    ) -> Tuple[Optional[dict], Optional[int], Optional[str]]:
        """
        Upload attachment. Returns (response_dict, error_status_code, error_detail).
        """
        # 404: note not found / not owned
        note_stmt = select(Note).where(
            and_(Note.id == note_id, Note.user_id == user_id, Note.deleted_at.is_(None))
        )
        note_result = await db.execute(note_stmt)
        note = note_result.scalar_one_or_none()
        if not note:
            return (None, 404, "Note not found")

        # 413: file > 2.5MB (BF-G7-025)
        if len(file_content) > MAX_FILE_BYTES:
            return (None, 413, "File exceeds 2.5MB limit")

        # 415: MIME validation (magic-bytes) — before quota (422) per D35/Gate-A
        ok, mime_or_err = validate_mime_magic(file_content, claimed_content_type)
        if not ok:
            return (None, 415, mime_or_err)

        # 422: already 3 attachments
        count = await self.count_attachments(db, note_id)
        if count >= MAX_ATTACHMENTS_PER_NOTE:
            return (None, 422, "Maximum 3 attachments per note")

        # Create attachment record and persist file
        attachment_id = uuid.uuid4()
        safe_name = _safe_filename(original_filename)
        rel_path = _storage_path(user_id, note_id, attachment_id, safe_name)
        full_path = _full_path(rel_path)

        # Create parent directories (Team 60 provides base; we create subdirs)
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_bytes(file_content)

        attachment = NoteAttachment(
            id=attachment_id,
            note_id=note_id,
            user_id=user_id,
            storage_path=rel_path,
            original_filename=original_filename,
            content_type=mime_or_err,
            file_size_bytes=len(file_content),
            created_by=user_id,
        )
        db.add(attachment)
        await db.flush()
        await db.refresh(attachment)
        return (_attachment_to_response(attachment), None, None)

    async def get_attachment_download(
        self,
        db: AsyncSession,
        note_id: uuid.UUID,
        attachment_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Optional[Tuple[Path, str, str]]:
        """
        G7R Batch3: Return (full_path, content_type, original_filename) for download.
        Returns None if note/attachment not found or not owned.
        """
        note_stmt = select(Note).where(
            and_(Note.id == note_id, Note.user_id == user_id, Note.deleted_at.is_(None))
        )
        if (await db.execute(note_stmt)).scalar_one_or_none() is None:
            return None

        stmt = select(NoteAttachment).where(
            and_(
                NoteAttachment.id == attachment_id,
                NoteAttachment.note_id == note_id,
            )
        )
        result = await db.execute(stmt)
        a = result.scalar_one_or_none()
        if not a:
            return None
        full_path = _full_path(a.storage_path)
        if not full_path.exists():
            return None
        return (full_path, a.content_type, a.original_filename)

    async def get_attachment(
        self,
        db: AsyncSession,
        note_id: uuid.UUID,
        attachment_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Optional[dict]:
        note_stmt = select(Note).where(
            and_(Note.id == note_id, Note.user_id == user_id, Note.deleted_at.is_(None))
        )
        if (await db.execute(note_stmt)).scalar_one_or_none() is None:
            return None

        stmt = select(NoteAttachment).where(
            and_(
                NoteAttachment.id == attachment_id,
                NoteAttachment.note_id == note_id,
            )
        )
        result = await db.execute(stmt)
        a = result.scalar_one_or_none()
        return _attachment_to_response(a) if a else None

    async def delete_attachment(
        self,
        db: AsyncSession,
        note_id: uuid.UUID,
        attachment_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Optional[int]:
        """Returns 404 if not found, 204 implied on success."""
        note_stmt = select(Note).where(
            and_(Note.id == note_id, Note.user_id == user_id, Note.deleted_at.is_(None))
        )
        if (await db.execute(note_stmt)).scalar_one_or_none() is None:
            return 404

        stmt = select(NoteAttachment).where(
            and_(
                NoteAttachment.id == attachment_id,
                NoteAttachment.note_id == note_id,
            )
        )
        result = await db.execute(stmt)
        a = result.scalar_one_or_none()
        if not a:
            return 404
        # Optionally remove file from disk (best-effort)
        full_path = _full_path(a.storage_path)
        if full_path.exists():
            try:
                full_path.unlink()
            except OSError:
                pass
        await db.delete(a)
        await db.flush()
        return None  # success


def get_note_attachments_service() -> NoteAttachmentsService:
    return NoteAttachmentsService.get_instance()
