from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel
from typing import Dict, Any, Optional

class Execution(BaseModel):
    __tablename__ = "executions"
    
    trade_id = Column(Integer, ForeignKey('trades.id'), nullable=False)
    action = Column(String(20), nullable=False, default='buy')  # ENUM: buy, sale
    date = Column(DateTime, nullable=False)  # NOT NULL, must be >= trade.open_date
    quantity = Column(Float, nullable=False)  # RANGE: quantity > 0
    price = Column(Float, nullable=False)  # RANGE: price > 0
    fee = Column(Float, default=0, nullable=True)  # RANGE: fee >= 0
    source = Column(String(50), default='manual', nullable=True)  # ENUM: manual, api, file_import, direct_import
    external_id = Column(String(100), nullable=True)  # מזהה חיצוני
    notes = Column(String(500), nullable=True)  # הערות על העסקה
    
    # Relationships
    trade = relationship("Trade", back_populates="executions")
    
    def __repr__(self) -> str:
        return f"<Execution(id={self.id}, action='{self.action}', quantity={self.quantity})>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with trade relationship data"""
        result: Dict[str, Any] = {}
        for c in self.__table__.columns:
            value = getattr(self, c.name)
            if hasattr(value, 'strftime'):  # If it's a date
                result[c.name] = value.strftime('%Y-%m-%d %H:%M:%S') if value else None
            else:
                result[c.name] = value
        
        # Add trade relationship data if loaded
        if hasattr(self, 'trade') and self.trade:
            result['trade_ticker_symbol'] = self.trade.ticker.symbol if hasattr(self.trade, 'ticker') and self.trade.ticker else None
            result['trade_side'] = self.trade.side
            result['trade_date'] = self.trade.created_at.strftime('%d/%m/%Y') if self.trade.created_at else None
            
            # Create formatted display string: "AAPL | 15/01/2025 | Long"
            if result['trade_ticker_symbol'] and result['trade_date'] and result['trade_side']:
                result['trade_display'] = f"{result['trade_ticker_symbol']} | {result['trade_date']} | {result['trade_side']}"
            else:
                result['trade_display'] = f"Trade {self.trade_id}"
        
        return result
