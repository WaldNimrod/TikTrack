"""
Notes Schemas - Pydantic (D35)
OPENAPI_SPEC_V2.5.2_NOTES_ATTACHMENTS_ADDENDUM
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


# G7R Stream1: datetime added for temporal linkage
VALID_PARENT_TYPES = frozenset(("trade", "trade_plan", "ticker", "account", "datetime"))


class NoteCreate(BaseModel):
    parent_type: str = Field(default="ticker", description="trade|trade_plan|ticker|account|datetime")
    parent_id: Optional[str] = None
    parent_datetime: Optional[datetime] = None
    title: str = Field(..., min_length=1, max_length=200, description="Required per G5R2 error-contract parity (BF-G5R-002)")
    content: str = Field(..., description="Rich Text HTML — sanitized server-side")
    category: str = Field(default="GENERAL")
    is_pinned: bool = False
    tags: Optional[list] = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        """G5R2: missing or empty title must return 422 (BF-G5R-002)."""
        if not v or not str(v).strip():
            raise ValueError("title is required and cannot be empty")
        return v.strip()

    @field_validator("parent_type")
    @classmethod
    def parent_type_valid(cls, v):
        if v is None or v == "":
            return None
        if v not in VALID_PARENT_TYPES:
            raise ValueError(f"parent_type must be one of {sorted(VALID_PARENT_TYPES)}, got '{v}'")
        return v


class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = None
    category: Optional[str] = None
    is_pinned: Optional[bool] = None
    tags: Optional[list] = None


class NoteResponse(BaseModel):
    id: str
    user_id: str
    parent_type: Optional[str] = None
    parent_id: Optional[str] = None
    parent_datetime: Optional[datetime] = None
    linked_entity_display: Optional[str] = None  # G7R Batch3: resolved entity name
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
    notes_by_parent_type: dict  # ticker, trade, trade_plan, account


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
