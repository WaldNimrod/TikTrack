from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel
from typing import Dict, Any, Optional

class Execution(BaseModel):
    __tablename__ = "executions"
    
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=True)
    trading_account_id = Column(Integer, ForeignKey('trading_accounts.id'), nullable=True)
    trade_id = Column(Integer, ForeignKey('trades.id'), nullable=True)  # Make nullable - executions can exist without trades
    action = Column(String(20), nullable=False, default='buy')  # ENUM: buy, sale
    date = Column(DateTime, nullable=False)  # NOT NULL, must be >= trade.open_date
    quantity = Column(Float, nullable=False)  # RANGE: quantity > 0
    price = Column(Float, nullable=False)  # RANGE: price > 0
    fee = Column(Float, default=0, nullable=True)  # RANGE: fee >= 0
    source = Column(String(50), default='manual', nullable=True)  # ENUM: manual, api, file_import, direct_import
    external_id = Column(String(100), nullable=True)  # מזהה חיצוני
    notes = Column(String(500), nullable=True)  # הערות על העסקה
    realized_pl = Column(Integer, nullable=True, default=None)  # Realized P/L: NULL in buy, required in sell
    mtm_pl = Column(Integer, nullable=True, default=None)  # MTM P/L: optional in both buy and sell
    
    # Relationships
    ticker = relationship("Ticker")
    trading_account = relationship("TradingAccount")
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
        
        # Add related data if available
        if hasattr(self, 'trading_account') and self.trading_account:
            result['account_name'] = self.trading_account.name
        else:
            result['account_name'] = f'TradingAccount_{self.trading_account_id}' if self.trading_account_id else 'לא מוגדר'
        
        if hasattr(self, 'ticker') and self.ticker:
            result['symbol'] = self.ticker.symbol
        else:
            result['symbol'] = f'Ticker_{self.ticker_id}' if self.ticker_id else 'לא מוגדר'
        
        return result
