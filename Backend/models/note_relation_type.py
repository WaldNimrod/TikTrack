from sqlalchemy import Column, Integer, String
from .base import BaseModel

class NoteRelationType(BaseModel):
    __tablename__ = "note_relation_types"
    
    note_relation_type = Column(String(20), nullable=False, unique=True)
    
    def __repr__(self):
        return f"<NoteRelationType(id={self.id}, type='{self.note_relation_type}')>"
    
    def to_dict(self):
        """המרה למילון"""
        result = super().to_dict()
        result['note_relation_type'] = self.note_relation_type
        return result
