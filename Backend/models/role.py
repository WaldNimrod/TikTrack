from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from .base import BaseModel

class Role(BaseModel):
    __tablename__ = 'roles'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True, index=True)
    description = Column(String(200))
    permissions = Column(String(1000))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}')>"
