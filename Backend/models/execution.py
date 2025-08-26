from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel
from typing import Dict, Any, Optional

class Execution(BaseModel):
    __tablename__ = "executions"
    
    trade_id = Column(Integer, ForeignKey('trades.id'), nullable=False)
    action = Column(String(20), nullable=False, default='buy')  # Default per constraints
    date = Column(DateTime, nullable=True)
    quantity = Column(Float, nullable=False)  # NOT NULL per constraints
    price = Column(Float, nullable=False)  # NOT NULL per constraints
    fee = Column(Float, default=0, nullable=True)
    source = Column(String(50), default='manual', nullable=True)  # manual, api, etc.
    external_id = Column(String(100), nullable=True)  # מזהה חיצוני
    notes = Column(String(500), nullable=True)  # הערות על העסקה
    
    # Relationships
    trade = relationship("Trade", back_populates="executions")
    
    def __repr__(self) -> str:
        return f"<Execution(id={self.id}, action='{self.action}', quantity={self.quantity})>"
    
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
