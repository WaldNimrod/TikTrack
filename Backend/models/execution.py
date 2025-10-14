from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from .base import BaseModel
from typing import Dict, Any, Optional

class Execution(BaseModel):
    __tablename__ = "executions"
    
    # Flexible association: exactly one of ticker_id or trade_id must be NOT NULL
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=True)  # For executions not yet assigned to a trade
    trade_id = Column(Integer, ForeignKey('trades.id'), nullable=True)  # For executions assigned to a trade
    trading_account_id = Column(Integer, ForeignKey('trading_accounts.id'), nullable=True)  # Required only when trade_id is set
    
    action = Column(String(20), nullable=False, default='buy')  # ENUM: buy, sale
    date = Column(DateTime, nullable=False)  # NOT NULL, must be >= trade.open_date
    quantity = Column(Float, nullable=False)  # RANGE: quantity > 0
    price = Column(Float, nullable=False)  # RANGE: price > 0
    fee = Column(Float, default=0, nullable=True)  # RANGE: fee >= 0
    source = Column(String(50), default='manual', nullable=True)  # ENUM: manual, api, file_import, direct_import
    external_id = Column(String(100), nullable=True)  # מזהה חיצוני
    notes = Column(String(500), nullable=True)  # הערות על העסקה
    
    # CHECK constraint: exactly one of ticker_id or trade_id must be NOT NULL
    __table_args__ = (
        CheckConstraint(
            '(ticker_id IS NOT NULL AND trade_id IS NULL) OR (ticker_id IS NULL AND trade_id IS NOT NULL)',
            name='check_execution_association'
        ),
    )
    
    # Relationships
    ticker = relationship("Ticker")
    trade = relationship("Trade", back_populates="executions")
    account = relationship("TradingAccount")
    
    def __repr__(self) -> str:
        return f"<Execution(id={self.id}, action='{self.action}', quantity={self.quantity})>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with unified format for ticker or trade association"""
        result: Dict[str, Any] = {}
        for c in self.__table__.columns:
            value = getattr(self, c.name)
            if hasattr(value, 'strftime'):  # If it's a date
                result[c.name] = value.strftime('%Y-%m-%d %H:%M:%S') if value else None
            else:
                result[c.name] = value
        
        # Determine association type and add unified display format
        if self.trade_id and hasattr(self, 'trade') and self.trade:
            # Associated with Trade - full information
            result['linked_type'] = 'trade'
            result['linked_id'] = self.trade_id
            
            result['trade_ticker_symbol'] = self.trade.ticker.symbol if hasattr(self.trade, 'ticker') and self.trade.ticker else None
            result['trade_side'] = self.trade.side
            result['trade_date'] = self.trade.created_at.strftime('%d/%m/%Y') if self.trade.created_at else None
            
            # Add account name from trade
            if hasattr(self.trade, 'account') and self.trade.account:
                result['account_name'] = self.trade.account.name
            else:
                result['account_name'] = None
            
            # Create formatted display string: "AAPL | 15/01/2025 | Long"
            if result['trade_ticker_symbol'] and result['trade_date'] and result['trade_side']:
                result['trade_display'] = f"{result['trade_ticker_symbol']} | {result['trade_date']} | {result['trade_side']}"
                result['linked_display'] = result['trade_display']
            else:
                result['trade_display'] = f"Trade {self.trade_id}"
                result['linked_display'] = result['trade_display']
        
        elif self.ticker_id and hasattr(self, 'ticker') and self.ticker:
            # Associated with Ticker only - pending trade assignment
            result['linked_type'] = 'ticker'
            result['linked_id'] = self.ticker_id
            result['ticker_symbol'] = self.ticker.symbol
            result['linked_display'] = f"{self.ticker.symbol} - ממתין לשיוך"
            
            # Add account name if available
            if hasattr(self, 'account') and self.account:
                result['account_name'] = self.account.name
            else:
                result['account_name'] = None
        
        return result
