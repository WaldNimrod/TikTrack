"""
Notes Router - D35 (Rich Text + Attachments)
TEAM_10_TO_TEAM_20_D35_RICH_TEXT_ATTACHMENTS_MANDATE
"""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..utils.dependencies import get_current_user
from ..models.identity import User
from ..services.notes_service import get_notes_service
from ..services.note_attachments_service import get_note_attachments_service
from ..schemas.notes import NoteCreate, NoteUpdate, NoteResponse, NoteAttachmentResponse

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("/summary", response_model=dict)
async def get_notes_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    TEAM_30 request — סקשן "סיכום מידע" בעמוד הערות.
    recent_notes = 10 ימים אחרונים (דוח תאימות §10).
    """
    service = get_notes_service()
    return await service.get_notes_summary(db=db, user_id=current_user.id)


@router.get("", response_model=list)
async def list_notes(
    parent_type: Optional[str] = Query(None, description="trade|trade_plan|ticker|account"),
    parent_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = get_notes_service()
    return await service.list_notes(
        db=db,
        user_id=current_user.id,
        parent_type=parent_type,
        parent_id=parent_id,
    )


@router.post("", response_model=dict, status_code=201)
async def create_note(
    body: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = get_notes_service()
    data = body.model_dump(exclude_unset=False)
    return await service.create_note(db=db, user_id=current_user.id, data=data)


@router.get("/{note_id}", response_model=dict)
async def get_note(
    note_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = get_notes_service()
    note = await service.get_note(db=db, note_id=note_id, user_id=current_user.id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.put("/{note_id}", response_model=dict)
async def update_note(
    note_id: uuid.UUID,
    body: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = get_notes_service()
    data = body.model_dump(exclude_unset=True)
    note = await service.update_note(db=db, note_id=note_id, user_id=current_user.id, data=data)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.delete("/{note_id}", status_code=204)
async def delete_note(
    note_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = get_notes_service()
    ok = await service.delete_note(db=db, note_id=note_id, user_id=current_user.id)
    if not ok:
        raise HTTPException(status_code=404, detail="Note not found")


# --- Attachments ---

@router.get("/{note_id}/attachments", response_model=list)
async def list_attachments(
    note_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = get_note_attachments_service()
    attachments = await service.list_attachments(db=db, note_id=note_id, user_id=current_user.id)
    if attachments is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return attachments


@router.post("/{note_id}/attachments", response_model=dict, status_code=201)
async def upload_attachment(
    note_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    content = await file.read()
    service = get_note_attachments_service()
    result, err_code, err_detail = await service.upload_attachment(
        db=db,
        note_id=note_id,
        user_id=current_user.id,
        file_content=content,
        original_filename=file.filename or "unnamed",
        claimed_content_type=file.content_type,
    )
    if err_code:
        raise HTTPException(status_code=err_code, detail=err_detail)
    return result


@router.get("/{note_id}/attachments/{attachment_id}", response_model=dict)
async def get_attachment(
    note_id: uuid.UUID,
    attachment_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = get_note_attachments_service()
    attachment = await service.get_attachment(
        db=db, note_id=note_id, attachment_id=attachment_id, user_id=current_user.id
    )
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    return attachment


@router.get("/{note_id}/attachments/{attachment_id}/download")
async def download_attachment(
    note_id: uuid.UUID,
    attachment_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    G7R Batch3: Attachment proof flow — stream file with Content-Disposition.
    """
    service = get_note_attachments_service()
    result = await service.get_attachment_download(
        db=db, note_id=note_id, attachment_id=attachment_id, user_id=current_user.id
    )
    if not result:
        raise HTTPException(status_code=404, detail="Attachment not found")
    full_path, content_type, original_filename = result
    return FileResponse(
        path=full_path,
        media_type=content_type,
        filename=original_filename,
    )


@router.delete("/{note_id}/attachments/{attachment_id}", status_code=204)
async def delete_attachment(
    note_id: uuid.UUID,
    attachment_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = get_note_attachments_service()
    err = await service.delete_attachment(
        db=db, note_id=note_id, attachment_id=attachment_id, user_id=current_user.id
    )
    if err == 404:
        raise HTTPException(status_code=404, detail="Attachment not found")
