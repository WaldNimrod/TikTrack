from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.exc import IntegrityError
from .base import BaseModel
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime
from .trade_plan import TradePlan

class Trade(BaseModel):
    __tablename__ = "trades"
    
    account_id = Column(Integer, ForeignKey('accounts.id'), nullable=False)
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=False)
    trade_plan_id = Column(Integer, ForeignKey('trade_plans.id'), nullable=True)  # Allow NULL for trades without plans
    status = Column(String(20), default='open', nullable=True)
    investment_type = Column(String(20), default='swing', nullable=False)  # NOT NULL per constraints
    side = Column(String(10), default='Long', nullable=True)  # Long, Short
    # opened_at field removed - using created_at from BaseModel instead
    closed_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    cancel_reason = Column(String(500), nullable=True)
    total_pl = Column(Float, default=0, nullable=True)
    notes = Column(String(500), nullable=True)
    
    # Relationships
    account = relationship("Account", back_populates="trades")
    ticker = relationship("Ticker")
    trade_plan = relationship("TradePlan", back_populates="trades")
    executions = relationship("Execution", back_populates="trade")
    # Notes relationship removed - notes now use related_type and related_id
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with relationships"""
        import logging
        logger = logging.getLogger(__name__)
        
        result: Dict[str, Any] = {}
        for c in self.__table__.columns:
            value = getattr(self, c.name)
            if hasattr(value, 'strftime'):
                result[c.name] = value.strftime('%Y-%m-%d %H:%M:%S') if value else None
            else:
                result[c.name] = value
        
        # Add relationships
        try:
            if hasattr(self, 'account') and self.account:
                result['account_name'] = self.account.name
                logger.info(f"Added account_name: {self.account.name}")
            else:
                result['account_name'] = f'Account_{self.account_id}'
                logger.info(f"No account relationship, using fallback: Account_{self.account_id}")
        except Exception as e:
            result['account_name'] = f'Account_{self.account_id}'
            logger.error(f"Error getting account name: {e}")
        
        try:
            if hasattr(self, 'ticker') and self.ticker:
                result['ticker_symbol'] = self.ticker.symbol
                logger.info(f"Added ticker_symbol: {self.ticker.symbol}")
            else:
                result['ticker_symbol'] = f'Ticker_{self.ticker_id}'
                logger.info(f"No ticker relationship, using fallback: Ticker_{self.ticker_id}")
        except Exception as e:
            result['ticker_symbol'] = f'Ticker_{self.ticker_id}'
            logger.error(f"Error getting ticker symbol: {e}")
        
        return result
    
    def __repr__(self) -> str:
        return f"<Trade(id={self.id}, status='{self.status}', investment_type='{self.investment_type}')>"
