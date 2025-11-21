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
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}
