from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel
from typing import Dict, Any, Optional

class Execution(BaseModel):
    __tablename__ = "executions"
    
    trade_id = Column(Integer, ForeignKey('trades.id'), nullable=False)
    action = Column(String(20), nullable=False)  # buy, sell
    date = Column(DateTime, nullable=True)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    fee = Column(Float, default=0, nullable=True)
    source = Column(String(50), default='manual', nullable=True)  # manual, api, etc.
    
    # יחסים
    trade = relationship("Trade", back_populates="executions")
    
    def __repr__(self) -> str:
        return f"<Execution(id={self.id}, action='{self.action}', quantity={self.quantity})>"
