"""
Notes Schemas - Pydantic (D35)
OPENAPI_SPEC_V2.5.2_NOTES_ATTACHMENTS_ADDENDUM
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, model_validator


# G7R Stream1: datetime added for temporal linkage. BF-G7-014: 'general' not allowed
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
        if str(v).lower() == "general":
            raise ValueError("parent_type 'general' is not allowed. Use ticker, trade, trade_plan, account, or datetime.")
        if v not in VALID_PARENT_TYPES:
            raise ValueError(f"parent_type must be one of {sorted(VALID_PARENT_TYPES)}, got '{v}'")
        return v

    @model_validator(mode="after")
    def validate_linked_entity_required(self):
        """BF-G7-017: linked_entity mandatory — entity types require parent_id; datetime requires parent_datetime."""
        pt = (self.parent_type or "ticker").lower()
        if pt in ("ticker", "trade", "trade_plan", "account"):
            if not self.parent_id or not str(self.parent_id).strip():
                raise ValueError(f"parent_id required when parent_type is {pt}")
        elif pt == "datetime":
            if not self.parent_datetime:
                raise ValueError("parent_datetime required when parent_type is datetime")
        return self


class NoteUpdate(BaseModel):
    """BF-G7-018: Supports linked_entity change via parent_type, parent_id, parent_datetime."""
    parent_type: Optional[str] = Field(None, description="trade|trade_plan|ticker|account|datetime")
    parent_id: Optional[str] = None
    parent_datetime: Optional[datetime] = None
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = None
    category: Optional[str] = None
    is_pinned: Optional[bool] = None
    tags: Optional[list] = None

    @field_validator("parent_type")
    @classmethod
    def parent_type_valid(cls, v):
        if v is None or v == "":
            return None
        if str(v).lower() == "general":
            raise ValueError("parent_type 'general' is not allowed.")
        if v not in VALID_PARENT_TYPES:
            raise ValueError(f"parent_type must be one of {sorted(VALID_PARENT_TYPES)}")
        return v

    @model_validator(mode="after")
    def validate_linked_entity_update(self):
        """BF-G7-018: When changing parent_type, require matching parent_id or parent_datetime."""
        if self.parent_type is None:
            return self
        pt = str(self.parent_type).lower()
        if pt in ("ticker", "trade", "trade_plan", "account"):
            if self.parent_id is None or not str(self.parent_id).strip():
                raise ValueError(f"parent_id required when parent_type is {pt}")
            if self.parent_datetime is not None:
                raise ValueError("parent_datetime not allowed when parent_type is entity")
        elif pt == "datetime":
            if not self.parent_datetime:
                raise ValueError("parent_datetime required when parent_type is datetime")
            if self.parent_id is not None:
                raise ValueError("parent_id not allowed when parent_type is datetime")
        return self


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
