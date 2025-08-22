from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel
from typing import Dict, Any, Optional

class TradePlan(BaseModel):
    __tablename__ = "trade_plans"
    
    account_id = Column(Integer, ForeignKey('accounts.id'), nullable=False)
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=False)
    investment_type = Column(String(20), default='swing', nullable=True)
    side = Column(String(10), default='Long', nullable=True)  # Long, Short
    status = Column(String(20), default='open', nullable=True)  # open, closed, cancelled
    planned_amount = Column(Float, default=0, nullable=True)
    entry_conditions = Column(String(500), nullable=True)
    stop_price = Column(Float, nullable=True)
    target_price = Column(Float, nullable=True)
    reasons = Column(String(500), nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    cancel_reason = Column(String(500), nullable=True)
    
    # Relationships
    account = relationship("Account", back_populates="trade_plans")
    ticker = relationship("Ticker")
    trades = relationship("Trade", back_populates="trade_plan")
    # Notes relationship removed - notes now use related_type and related_id
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with relationships"""
        import logging
        logger = logging.getLogger(__name__)
        
        result: Dict[str, Any] = {}
        for c in self.__table__.columns:
            value = getattr(self, c.name)
            if hasattr(value, 'strftime'):  # If it's a date
                result[c.name] = value.strftime('%Y-%m-%d %H:%M:%S') if value else None
            else:
                result[c.name] = value
        
        # Ensure side field appears
        if 'side' not in result:
            result['side'] = getattr(self, 'side', 'Long')
        
        # Add relationships
        try:
            if hasattr(self, 'ticker') and self.ticker:
                logger.info(f"Trade plan {self.id}: Using loaded ticker relationship")
                result['ticker'] = {
                    'id': self.ticker.id,
                    'symbol': self.ticker.symbol,
                    'name': self.ticker.name
                }
            else:
                logger.info(f"Trade plan {self.id}: Ticker relationship not loaded, using ticker_id")
                result['ticker'] = {'id': self.ticker_id, 'symbol': f'Ticker_{self.ticker_id}', 'name': f'Ticker {self.ticker_id}'}
        except Exception as e:
            logger.error(f"Trade plan {self.id}: Error with ticker relationship: {str(e)}")
            # If there's a problem with the ticker relationship, use ticker_id
            result['ticker'] = {'id': self.ticker_id, 'symbol': f'Ticker_{self.ticker_id}', 'name': f'Ticker {self.ticker_id}'}
        
        try:
            if hasattr(self, 'account') and self.account:
                logger.info(f"Trade plan {self.id}: Using loaded account relationship")
                result['account'] = {
                    'id': self.account.id,
                    'name': self.account.name
                }
            else:
                logger.info(f"Trade plan {self.id}: Account relationship not loaded, using account_id")
                result['account'] = {'id': self.account_id, 'name': f'Account_{self.account_id}'}
        except Exception as e:
            logger.error(f"Trade plan {self.id}: Error with account relationship: {str(e)}")
            # If there's a problem with the account relationship, use account_id
            result['account'] = {'id': self.account_id, 'name': f'Account_{self.account_id}'}
        
        return result
    
    def __repr__(self) -> str:
        return f"<TradePlan(id={self.id}, type='{self.investment_type}')>"
