from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from .base import BaseModel
from typing import Dict, Any, Optional

class Ticker(BaseModel):
    __tablename__ = "tickers"
    
    symbol = Column(String(10), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=True)
    type = Column(String(20), nullable=True)
    remarks = Column(String(500), nullable=True)
    currency = Column(String(3), default='USD', nullable=True)
    active_trades = Column(Boolean, default=False, nullable=True)
    
    # Relationships
    trades = relationship("Trade")
    trade_plans = relationship("TradePlan")
    
    def __repr__(self) -> str:
        return f"<Ticker(symbol='{self.symbol}', name='{self.name}')>"
