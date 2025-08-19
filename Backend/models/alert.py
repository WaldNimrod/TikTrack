from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel
from typing import Dict, Any, Optional

class Alert(BaseModel):
    __tablename__ = "alerts"
    
    type = Column(String(50), nullable=False)
    status = Column(String(20), default='open', nullable=True)
    condition = Column(String(500), nullable=False)
    message = Column(String(500), nullable=True)
    triggered_at = Column(DateTime, nullable=True)
    is_triggered = Column(String(20), default='false', nullable=True)  # false, new, true
    related_type_id = Column(Integer, ForeignKey('note_relation_types.id'), nullable=False)
    related_id = Column(Integer, nullable=False)
    
    def __repr__(self) -> str:
        return f"<Alert(id={self.id}, type='{self.type}', active={self.is_active})>"
