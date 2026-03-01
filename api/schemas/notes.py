"""
Notes Schemas - Pydantic (D35)
OPENAPI_SPEC_V2.5.2_NOTES_ATTACHMENTS_ADDENDUM
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class NoteCreate(BaseModel):
    parent_type: str = Field(..., description="trade|trade_plan|ticker|account|general")
    parent_id: Optional[str] = None
    title: str = Field(..., max_length=200, description="Required per G5R2 error-contract parity (BF-G5R-002)")
    content: str = Field(..., description="Rich Text HTML — sanitized server-side")
    category: str = Field(default="GENERAL")
    is_pinned: bool = False
    tags: Optional[list] = None


class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = None
    category: Optional[str] = None
    is_pinned: Optional[bool] = None
    tags: Optional[list] = None


class NoteResponse(BaseModel):
    id: str
    user_id: str
    parent_type: str
    parent_id: Optional[str] = None
    title: Optional[str] = None
    content: str
    category: str
    is_pinned: bool
    tags: Optional[list] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotesSummaryResponse(BaseModel):
    """TEAM_30 request — סקשן סיכום עמוד הערות"""
    total_notes: int
    recent_notes: int  # 10 ימים אחרונים
    total_attachments: int
    pinned_notes: int
    notes_with_tags: int
    notes_by_parent_type: dict  # ticker, trade, trade_plan, account, general


class NoteAttachmentResponse(BaseModel):
    id: str
    note_id: str
    storage_path: str
    original_filename: str
    content_type: str
    file_size_bytes: int
    created_at: datetime

    class Config:
        from_attributes = True
