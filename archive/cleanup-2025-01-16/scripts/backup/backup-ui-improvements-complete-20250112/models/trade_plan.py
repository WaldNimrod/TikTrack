from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, event, Computed
from sqlalchemy.orm import relationship
from .base import BaseModel
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class TradePlan(BaseModel):
    __tablename__ = "trade_plans"
    
    trading_account_id = Column(Integer, ForeignKey('trading_accounts.id'), nullable=False)
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=False)
    investment_type = Column(String(20), default='swing', nullable=False)  # NOT NULL per constraints
    side = Column(String(10), default='Long', nullable=False)  # NOT NULL per constraints
    status = Column(String(20), default='open', nullable=False)  # NOT NULL per constraints
    planned_amount = Column(Float, default=1000, nullable=False)  # NOT NULL, default 1000 per constraints
    entry_conditions = Column(String(500), nullable=True)
    
    # Source of truth: Prices only
    stop_price = Column(Float, nullable=True)
    target_price = Column(Float, nullable=True)
    
    # Input mode metadata - tracks what user entered (added Jan 12, 2025)
    amount_input_mode = Column(String(10), default='amount', nullable=True)  # 'amount' or 'shares'
    stop_input_mode = Column(String(20), default='price', nullable=True)  # 'price' or 'percentage'
    target_input_mode = Column(String(20), default='price', nullable=True)  # 'price' or 'percentage'
    
    reasons = Column(String(500), nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    cancel_reason = Column(String(500), nullable=True)
    
    # Relationships
    account = relationship("TradingAccount", back_populates="trade_plans")
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
                    'name': self.ticker.name,
                    'current_price': getattr(self.ticker, 'current_price', 0)
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
                logger.info(f"Trade plan {self.id}: TradingAccount relationship not loaded, using trading_account_id")
                result['account'] = {'id': self.trading_account_id, 'name': f'TradingAccount_{self.trading_account_id}'}
        except Exception as e:
            logger.error(f"Trade plan {self.id}: Error with account relationship: {str(e)}")
            # If there's a problem with the account relationship, use trading_account_id
            result['account'] = {'id': self.trading_account_id, 'name': f'TradingAccount_{self.trading_account_id}'}
        
        return result
    
    def __repr__(self) -> str:
        return f"<TradePlan(id={self.id}, type='{self.investment_type}')>"
    
    @staticmethod
    def calculate_price_from_percentage(ticker_price: float, percentage: float, is_stop: bool = True, side: str = 'Long') -> float:
        """
        Helper method to convert percentage to price
        
        Args:
            ticker_price: Current ticker price (from market data)
            percentage: Percentage value (e.g., 5 for 5%)
            is_stop: True for stop (below entry), False for target (above entry)
            side: 'Long' or 'Short'
            
        Returns:
            Calculated price
            
        Example:
            >>> TradePlan.calculate_price_from_percentage(100, 5, is_stop=True, side='Long')
            95.0  # Stop at 5% below entry for Long
        """
        if ticker_price is None or percentage is None:
            return None
        
        if side == 'Long':
            if is_stop:
                # Long stop: below current price
                return ticker_price * (1 - percentage / 100)
            else:
                # Long target: above current price
                return ticker_price * (1 + percentage / 100)
        else:  # Short
            if is_stop:
                # Short stop: above current price
                return ticker_price * (1 + percentage / 100)
            else:
                # Short target: below current price
                return ticker_price * (1 - percentage / 100)
    
    @staticmethod
    def calculate_percentage_from_price(ticker_price: float, target_price: float, is_stop: bool = True, side: str = 'Long') -> float:
        """
        Helper method to convert price to percentage
        
        Args:
            ticker_price: Current ticker price (from market data)
            target_price: Stop or target price
            is_stop: True for stop, False for target
            side: 'Long' or 'Short'
            
        Returns:
            Calculated percentage
            
        Example:
            >>> TradePlan.calculate_percentage_from_price(100, 95, is_stop=True, side='Long')
            5.0  # 5% below entry for Long
        """
        if ticker_price is None or target_price is None or ticker_price == 0:
            return None
        
        if side == 'Long':
            if is_stop:
                return round(((ticker_price - target_price) / ticker_price) * 100, 2)
            else:
                return round(((target_price - ticker_price) / ticker_price) * 100, 2)
        else:  # Short
            if is_stop:
                return round(((target_price - ticker_price) / ticker_price) * 100, 2)
            else:
                return round(((ticker_price - target_price) / ticker_price) * 100, 2)


# ========================================
# SQLAlchemy Event Listeners for Automatic Ticker Status Updates
# ========================================

@event.listens_for(TradePlan, 'after_insert')
def trade_plan_inserted(mapper, connection, target):
    """
    Event listener for when a trade plan is inserted
    Updates the ticker status based on linked items
    """
    try:
        from .ticker import Ticker
        from sqlalchemy.orm import Session
        
        # Get session from connection
        session = Session(bind=connection)
        
        # Update ticker status
        Ticker.update_ticker_status_from_linked_items(session, target.ticker_id)
        
        session.close()
    except Exception as e:
        logger.error(f"Error in trade_plan_inserted event: {e}")
        pass


@event.listens_for(TradePlan, 'after_update')
def trade_plan_updated(mapper, connection, target):
    """
    Event listener for when a trade plan is updated
    Updates the ticker status based on linked items
    """
    try:
        from .ticker import Ticker
        from sqlalchemy.orm import Session
        
        # Get session from connection
        session = Session(bind=connection)
        
        # Update ticker status
        Ticker.update_ticker_status_from_linked_items(session, target.ticker_id)
        
        session.close()
    except Exception as e:
        logger.error(f"Error in trade_plan_updated event: {e}")
        pass


@event.listens_for(TradePlan, 'after_delete')
def trade_plan_deleted(mapper, connection, target):
    """
    Event listener for when a trade plan is deleted
    Updates the ticker status based on linked items
    """
    try:
        from .ticker import Ticker
        from sqlalchemy.orm import Session
        
        # Get session from connection
        session = Session(bind=connection)
        
        # Update ticker status
        Ticker.update_ticker_status_from_linked_items(session, target.ticker_id)
        
        session.close()
    except Exception as e:
        logger.error(f"Error in trade_plan_deleted event: {e}")
        pass
