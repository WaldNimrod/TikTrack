from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from .base import BaseModel

class User(BaseModel):
    __tablename__ = "users"
    
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=True)
    last_login = Column(DateTime, nullable=True)
    
    # יחסים
    user_roles = relationship("UserRole", back_populates="user")
    
    def __repr__(self):
        return f"<User(username='{self.username}', email='{self.email}')>"
    
    def to_dict(self):
        """המרה למילון עם טיפול מיוחד ב-last_login"""
        result = {}
        for c in self.__table__.columns:
            value = getattr(self, c.name)
            if c.name == 'last_login' and value:
                try:
                    result[c.name] = value.strftime('%Y-%m-%d %H:%M:%S')
                except:
                    result[c.name] = None
            elif hasattr(value, 'strftime'):  # אם זה תאריך אחר
                result[c.name] = value.strftime('%Y-%m-%d %H:%M:%S') if value else None
            else:
                result[c.name] = value
        return result
