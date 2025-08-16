from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.sql import func
from config.database import Base

class BaseModel(Base):
    """מודל בסיס עם שדות משותפים"""
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    def to_dict(self):
        """המרה למילון"""
        result = {}
        for c in self.__table__.columns:
            try:
                value = getattr(self, c.name)
                if hasattr(value, 'strftime'):  # אם זה תאריך
                    result[c.name] = value.strftime('%Y-%m-%d %H:%M:%S') if value else None
                else:
                    result[c.name] = value
            except AttributeError:
                # Skip fields that don't exist in the database
                continue
        return result
    
    def __repr__(self):
        return f"<{self.__class__.__name__}(id={self.id})>"
