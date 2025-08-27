from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, CheckConstraint, event
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


# ========================================
# SQLAlchemy Event Listeners for Automatic active_trades Updates
# ========================================

def update_ticker_active_trades(session, ticker_id: int) -> None:
    """
    Update the active_trades field for a specific ticker based on open trades
    
    Args:
        session: SQLAlchemy session
        ticker_id: ID of the ticker to update
    """
    try:
        from .ticker import Ticker
        
        # Count open trades for this ticker
        open_trades_count = session.query(Trade).filter(
            Trade.ticker_id == ticker_id,
            Trade.status == 'open'
        ).count()
        
        # Update the ticker's active_trades field
        ticker = session.query(Ticker).filter(Ticker.id == ticker_id).first()
        if ticker:
            ticker.active_trades = open_trades_count > 0
            ticker.updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            session.flush()  # Flush to ensure the change is applied
            
            print(f"✅ Updated ticker {ticker.symbol} (ID: {ticker_id}) active_trades to: {ticker.active_trades}")
        
    except Exception as e:
        print(f"❌ Error updating ticker {ticker_id} active_trades: {e}")
        session.rollback()


@event.listens_for(Trade, 'after_insert')
def trade_inserted(mapper, connection, target):
    """
    Event listener for when a trade is inserted
    Updates the active_trades field of the related ticker
    """
    print(f"🔄 Trade inserted: ID {target.id}, Ticker ID {target.ticker_id}, Status {target.status}")
    
    if target.status == 'open':
        # Get the session from the connection
        session = connection.session
        if session:
            update_ticker_active_trades(session, target.ticker_id)


@event.listens_for(Trade, 'after_update')
def trade_updated(mapper, connection, target):
    """
    Event listener for when a trade is updated
    Updates the active_trades field of the related ticker
    """
    print(f"🔄 Trade updated: ID {target.id}, Ticker ID {target.ticker_id}, Status {target.status}")
    
    # Get the session from the connection
    session = connection.session
    if session:
        update_ticker_active_trades(session, target.ticker_id)


@event.listens_for(Trade, 'after_delete')
def trade_deleted(mapper, connection, target):
    """
    Event listener for when a trade is deleted
    Updates the active_trades field of the related ticker
    """
    print(f"🔄 Trade deleted: ID {target.id}, Ticker ID {target.ticker_id}")
    
    # Get the session from the connection
    session = connection.session
    if session:
        update_ticker_active_trades(session, target.ticker_id)
