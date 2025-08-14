from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from .base import BaseModel

class Role(BaseModel):
    __tablename__ = "roles"
    
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(200), nullable=True)
    permissions = Column(String(1000), nullable=True)  # JSON string of permissions
    
    # יחסים
    user_roles = relationship("UserRole", back_populates="role")
    
    def __repr__(self):
        return f"<Role(name='{self.name}', description='{self.description}')>"
