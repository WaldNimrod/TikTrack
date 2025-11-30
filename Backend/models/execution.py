from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, event
from sqlalchemy.orm import relationship
from .base import BaseModel
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class Execution(BaseModel):
    __tablename__ = "executions"
    
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True,
                    comment="User who owns this execution")
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=False)  # Required - every execution must have a ticker
    trading_account_id = Column(Integer, ForeignKey('trading_accounts.id'), nullable=True)
    trade_id = Column(Integer, ForeignKey('trades.id'), nullable=True)  # Make nullable - executions can exist without trades
    action = Column(String(20), nullable=False, default='buy')  # ENUM: buy, sell, short, cover
    date = Column(DateTime, nullable=False)  # NOT NULL, must be >= trade.open_date
    quantity = Column(Float, nullable=False)  # RANGE: quantity > 0
    price = Column(Float, nullable=False)  # RANGE: price > 0
    fee = Column(Float, default=0, nullable=True)  # RANGE: fee >= 0
    source = Column(String(50), default='manual', nullable=True)  # ENUM: manual, api, file_import, direct_import
    external_id = Column(String(100), nullable=True)  # מזהה חיצוני
    notes = Column(String(5000), nullable=True)  # הערות על העסקה
    realized_pl = Column(Integer, nullable=True, default=None)  # Realized P/L: NULL in buy/short (opening), required in sell/cover (closing)
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
        for column in self.__table__.columns:
            result[column.name] = getattr(self, column.name)
        
        # Add related data if available
        if hasattr(self, 'trading_account') and self.trading_account:
            result['account_name'] = self.trading_account.name
        else:
            result['account_name'] = f'TradingAccount_{self.trading_account_id}' if self.trading_account_id else 'לא מוגדר'
        
        if hasattr(self, 'ticker') and self.ticker:
            result['symbol'] = self.ticker.symbol
            result['ticker_symbol'] = self.ticker.symbol  # Also include ticker_symbol for frontend compatibility
        else:
            symbol_value = f'Ticker_{self.ticker_id}' if self.ticker_id else 'לא מוגדר'
            result['symbol'] = symbol_value
            result['ticker_symbol'] = symbol_value  # Also include ticker_symbol for frontend compatibility
        
        return result


# ========================================
# SQLAlchemy Event Listeners for Tag Links Cleanup
# ========================================

@event.listens_for(Execution, 'after_delete')
def execution_deleted(mapper, connection, target):
    """
    Event listener for when an execution is deleted.
    Automatically removes all associated tag links.
    """
    try:
        from services.tag_service import TagService
        from sqlalchemy.orm import Session
        
        session = Session(bind=connection)
        TagService.remove_all_tags_for_entity(
            session, 'execution', target.id
        )
        session.close()
    except Exception as e:
        logger.error(f"Error cleaning up tags for execution {target.id}: {e}")
        # Don't raise - allow deletion to proceed even if tag cleanup fails
