from sqlalchemy import Column, Integer, String
from .base import BaseModel
from typing import Dict, Any, Optional

class NoteRelationType(BaseModel):
    __tablename__ = "note_relation_types"
    
    note_relation_type = Column(String(20), nullable=False, unique=True)
    
    def __repr__(self) -> str:
        return f"<NoteRelationType(id={self.id}, type='{self.note_relation_type}')>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        result: Dict[str, Any] = {}
        for c in self.__table__.columns:
            value = getattr(self, c.name)
            if hasattr(value, 'strftime'):  # If it's a date
                result[c.name] = value.strftime('%Y-%m-%d %H:%M:%S') if value else None
            else:
                result[c.name] = value
        return result
