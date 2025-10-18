from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, CheckConstraint, event
from sqlalchemy.orm import relationship
from sqlalchemy.exc import IntegrityError
from .base import BaseModel
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime
from .trade_plan import TradePlan
import logging

logger = logging.getLogger(__name__)
logger.info("Trade model loaded - opened_at fix applied")

class Trade(BaseModel):
    __tablename__ = "trades"
    
    trading_account_id = Column(Integer, ForeignKey('trading_accounts.id'), nullable=False)
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
    account = relationship("TradingAccount", back_populates="trades")
    ticker = relationship("Ticker")
    trade_plan = relationship("TradePlan", back_populates="trades")
    executions = relationship("Execution", back_populates="trade")
    conditions = relationship("TradeCondition", back_populates="trade", cascade="all, delete-orphan")
    # Notes relationship removed - notes now use related_type and related_id
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with basic data only"""
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            # Return all necessary fields for the frontend
            result = {
                "id": self.id,
                "trading_account_id": self.trading_account_id,
                "ticker_id": self.ticker_id,
                "trade_plan_id": self.trade_plan_id,
                "status": self.status,
                "investment_type": self.investment_type,
                "side": self.side,
                "notes": self.notes,
                "opened_at": self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
                "closed_at": self.closed_at.strftime('%Y-%m-%d %H:%M:%S') if self.closed_at else None,
                "created_at": self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
                "total_pl": getattr(self, 'total_pl', 0)
            }
            
            # Use loaded relationships if available
            if hasattr(self, 'account') and self.account:
                result["account_name"] = self.account.name
                logger.info(f"Trade {self.id}: Using loaded account name: {self.account.name}")
            else:
                result["account_name"] = f'TradingAccount_{self.trading_account_id}' if self.trading_account_id else 'Unknown TradingAccount'
                logger.info(f"Trade {self.id}: Using fallback account name: {result['account_name']}")
            
            if hasattr(self, 'ticker') and self.ticker:
                result["ticker_symbol"] = self.ticker.symbol
                logger.info(f"Trade {self.id}: Using loaded ticker symbol: {self.ticker.symbol}")
            else:
                result["ticker_symbol"] = f'Ticker_{self.ticker_id}' if self.ticker_id else 'Unknown Ticker'
                logger.info(f"Trade {self.id}: Using fallback ticker symbol: {result['ticker_symbol']}")
            
            # Add any additional fields that might be needed
            for field in ['cancelled_at', 'cancel_reason']:
                if hasattr(self, field):
                    value = getattr(self, field)
                    if hasattr(value, 'strftime'):
                        result[field] = value.strftime('%Y-%m-%d %H:%M:%S') if value else None
                    else:
                        result[field] = value
            
            logger.info(f"Trade {self.id} to_dict result: {result}")
            return result
        except Exception as e:
            logger.error(f"Error in to_dict for trade {getattr(self, 'id', 'unknown')}: {str(e)}")
            # Return absolute minimal data if there's an error
            return {
                "id": getattr(self, 'id', None),
                "trading_account_id": getattr(self, 'trading_account_id', None),
                "ticker_id": getattr(self, 'ticker_id', None),
                "status": getattr(self, 'status', 'unknown'),
                "account_name": "Unknown TradingAccount",
                "ticker_symbol": "Unknown Ticker",
                "error": str(e)
            }
    
    def __repr__(self) -> str:
        return f"<Trade(id={self.id}, status='{self.status}', investment_type='{self.investment_type}')>"


# ========================================
# SQLAlchemy Event Listeners for Automatic active_trades Updates
# ========================================

def update_ticker_active_trades(connection, ticker_id: int) -> None:
    """
    Update the active_trades field for a specific ticker based on open trades
    
    Args:
        connection: SQLAlchemy connection
        ticker_id: ID of the ticker to update
    """
    try:
        from sqlalchemy import text
        
        # Count open trades for this ticker
        open_trades_result = connection.execute(
            text("SELECT COUNT(*) FROM trades WHERE ticker_id = :ticker_id AND status = 'open'"),
            {'ticker_id': ticker_id}
        ).fetchone()
        open_trades_count = open_trades_result[0] if open_trades_result else 0
        
        # Update the ticker's active_trades field
        active_trades_value = 1 if open_trades_count > 0 else 0
        connection.execute(
            text("UPDATE tickers SET active_trades = :active_trades, updated_at = :updated_at WHERE id = :ticker_id"),
            {
                'active_trades': active_trades_value,
                'updated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'ticker_id': ticker_id
            }
        )
        
    except Exception as e:
        logger.error(f"Error in update_ticker_active_trades: {e}")
        connection.rollback()


@event.listens_for(Trade, 'after_insert')
def trade_inserted(mapper, connection, target):
    """
    Event listener for when a trade is inserted
    Updates the active_trades field of the related ticker
    """
    try:
        # Update ticker active_trades field using connection directly
        update_ticker_active_trades(connection, target.ticker_id)
        
    except Exception as e:
        logger.error(f"Error in trade_inserted event: {e}")
        pass


@event.listens_for(Trade, 'after_update')
def trade_updated(mapper, connection, target):
    """
    Event listener for when a trade is updated
    Updates the active_trades field of the related ticker
    """
    try:
        # Update ticker active_trades field using connection directly
        update_ticker_active_trades(connection, target.ticker_id)
        
    except Exception as e:
        logger.error(f"Error in trade_updated event: {e}")
        pass


@event.listens_for(Trade, 'after_delete')
def trade_deleted(mapper, connection, target):
    """
    Event listener for when a trade is deleted
    Updates the active_trades field of the related ticker
    """
    try:
        # Update ticker active_trades field using connection directly
        update_ticker_active_trades(connection, target.ticker_id)
        
    except Exception as e:
        logger.error(f"Error in trade_deleted event: {e}")
        pass
