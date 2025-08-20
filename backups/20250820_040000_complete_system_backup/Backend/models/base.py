from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from typing import Dict, Any, Optional
from datetime import datetime

# יצירת base class למודלים
Base = declarative_base()

class BaseModel(Base):
    """
    Base model with common fields for all entities
    
    This model provides common fields that are shared across all entities:
    - id: Primary key
    - created_at: Timestamp when the record was created
    
    Author: TikTrack Development Team
    Version: 1.0
    Last Updated: 2025-08-16
    """
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
    
    def to_dict(self) -> Dict[str, Any]:
        """המרה למילון"""
        result: Dict[str, Any] = {}
        for c in self.__table__.columns:
            value = getattr(self, c.name)
            if hasattr(value, 'strftime'):  # אם זה תאריך
                result[c.name] = value.strftime('%Y-%m-%d %H:%M:%S') if value else None
            else:
                result[c.name] = value
        return result
    
    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}(id={self.id})>"
