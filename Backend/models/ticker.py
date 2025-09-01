from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, Text, DateTime, CheckConstraint
from sqlalchemy.orm import relationship, Mapped
from .base import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime

class Ticker(BaseModel):
    """
    Ticker model - represents a stock, ETF, cryptocurrency or any other financial asset
    
    Attributes:
        symbol (str): Ticker symbol - must be unique, maximum 10 characters
        name (str): Company or asset name - maximum 25 characters
        type (str): Asset type - stock, etf, crypto, forex, commodity
        remarks (str): Additional notes - maximum 500 characters
        currency_id (int): Currency ID from currencies table
        active_trades (bool): Whether there are active trades for this asset
        
    Relationships:
        trades: List of trades linked to this ticker
        trade_plans: List of trade plans linked to this ticker
        
    Constraints:
        - symbol must be unique in the system
        - symbol cannot be empty
        - symbol limited to 10 characters
        - name limited to 25 characters
        - currency_id must reference existing currency in currencies table
        
    Example:
        >>> ticker = Ticker(
        ...     symbol="AAPL",
        ...     name="Apple Inc.",
        ...     type="stock",
        ...     currency_id=1,  # USD ID in currencies table
        ...     remarks="American technology company"
        ... )
    """
    __tablename__ = "tickers"
    __table_args__ = (
        CheckConstraint(
            "(active_trades = 1 AND EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = 'open')) OR (active_trades = 0 AND NOT EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = 'open')) OR active_trades IS NULL",
            name="active_trades_consistency"
        ),
        CheckConstraint(
            "(status = 'cancelled') OR (status = 'open' AND (EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = 'open') OR EXISTS (SELECT 1 FROM trade_plans WHERE trade_plans.ticker_id = tickers.id AND trade_plans.status = 'open'))) OR (status = 'closed' AND NOT EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = 'open') AND NOT EXISTS (SELECT 1 FROM trade_plans WHERE trade_plans.ticker_id = tickers.id AND trade_plans.status = 'open'))",
            name="ticker_status_auto_update"
        ),
        {'extend_existing': True}
    )
    
    # Primary fields
    symbol = Column(String(10), unique=True, nullable=False, index=True, 
                   comment="Ticker symbol - must be unique")
    name = Column(String(100), nullable=False, 
                 comment="Company or asset name - max 100 chars per constraints")
    type = Column(String(20), nullable=False, 
                 comment="Asset type: stock, etf, crypto, forex, commodity")
    remarks = Column(String(500), nullable=True, 
                    comment="Additional notes about the ticker - max 500 chars")
    currency_id = Column(Integer, ForeignKey('currencies.id'), nullable=False, 
                        comment="Currency ID from currencies table")
    active_trades = Column(Boolean, default=False, nullable=True, 
                          comment="Whether there are active trades")
    status = Column(String(20), default='open', nullable=False,
                   comment="Ticker status: open, closed, cancelled")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True, 
                       comment="Last price update timestamp from future pricing system - NOT user modification timestamp")
    
    # Relationships
    currency = relationship("Currency", back_populates="tickers")
    trades = relationship("Trade", back_populates="ticker", 
                         cascade="all, delete-orphan")
    trade_plans = relationship("TradePlan", back_populates="ticker", 
                              cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="ticker")
    
    def __repr__(self) -> str:
        """String representation of the ticker"""
        return f"<Ticker(symbol='{self.symbol}', name='{self.name}', type='{self.type}')>"
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert ticker to JSON dictionary
        
        Returns:
            Dict[str, Any]: Dictionary with all ticker fields
            
        Example:
            >>> ticker = Ticker(symbol="AAPL", name="Apple Inc.")
            >>> ticker.to_dict()
            {'id': 1, 'symbol': 'AAPL', 'name': 'Apple Inc.', ...}
        """
        # Call parent to_dict method first
        result = super().to_dict()
        
        # Add any ticker-specific formatting if needed
        return result
    
    @property
    def display_name(self) -> str:
        """
        Display name of the ticker - combination of symbol and name
        
        Returns:
            str: Display name in format "SYMBOL - Name"
            
        Example:
            >>> ticker = Ticker(symbol="AAPL", name="Apple Inc.")
            >>> ticker.display_name
            'AAPL - Apple Inc.'
        """
        if self.name:
            return f"{self.symbol} - {self.name}"
        return self.symbol
    
    def is_active(self) -> bool:
        """
        Check if the ticker is active (has trades or open plans)
        
        Returns:
            bool: True if ticker is active, False otherwise
        """
        return self.active_trades or len(self.trades) > 0 or len(self.trade_plans) > 0
    
    def get_linked_items_count(self) -> Dict[str, int]:
        """
        Count linked items to ticker
        
        Returns:
            Dict[str, int]: Dictionary with count of linked items
            
        Example:
            >>> ticker.get_linked_items_count()
            {'trades': 5, 'trade_plans': 2, 'notes': 1, 'alerts': 0}
        """
        return {
            'trades': len(self.trades),
            'trade_plans': len(self.trade_plans),
            'notes': 0,  # Will be loaded separately if needed
            'alerts': 0   # Will be loaded separately if needed
        }

    @staticmethod
    def update_ticker_status_from_linked_items(session, ticker_id: int) -> None:
        """
        Update ticker status based on linked trades and trade plans
        
        Note: This function respects the 'cancelled' status - if a ticker is cancelled,
        it will not be automatically updated to open/closed status.
        
        Args:
            session: SQLAlchemy session
            ticker_id: ID of the ticker to update
        """
        try:
            from .trade import Trade
            from .trade_plan import TradePlan
            
            # Get the ticker
            ticker = session.query(Ticker).filter(Ticker.id == ticker_id).first()
            if not ticker:
                return
            
            # Don't update if ticker is cancelled (manual status)
            if ticker.status == 'cancelled':
                return
            
            # Count open trades for this ticker
            open_trades_count = session.query(Trade).filter(
                Trade.ticker_id == ticker_id,
                Trade.status == 'open'
            ).count()
            
            # Count open trade plans for this ticker
            open_plans_count = session.query(TradePlan).filter(
                TradePlan.ticker_id == ticker_id,
                TradePlan.status == 'open'
            ).count()
            
            # Update active_trades field
            ticker.active_trades = open_trades_count > 0
            
            # Determine new status
            has_open_items = open_trades_count > 0 or open_plans_count > 0
            new_status = 'open' if has_open_items else 'closed'
            
            # Update ticker status if needed
            if ticker.status != new_status:
                ticker.status = new_status
                ticker.updated_at = datetime.now()
            
            # Flush changes to ensure they are applied
            session.flush()
                
                
        except Exception as e:
            session.rollback()

    @staticmethod
    def update_all_ticker_statuses(session) -> None:
        """
        Update status for all tickers based on their linked trades and trade plans
        
        Note: This function respects the 'cancelled' status - cancelled tickers
        will not be automatically updated to open/closed status.
        
        Args:
            session: SQLAlchemy session
        """
        try:
            from .trade import Trade
            from .trade_plan import TradePlan
            
            # Get all tickers except cancelled ones
            tickers = session.query(Ticker).filter(Ticker.status != 'cancelled').all()
            
            for ticker in tickers:
                # Count open trades for this ticker
                open_trades_count = session.query(Trade).filter(
                    Trade.ticker_id == ticker.id,
                    Trade.status == 'open'
                ).count()
                
                # Count open trade plans for this ticker
                open_plans_count = session.query(TradePlan).filter(
                    TradePlan.ticker_id == ticker.id,
                    TradePlan.status == 'open'
                ).count()
                
                # Update active_trades field
                ticker.active_trades = open_trades_count > 0
                
                # Determine new status
                has_open_items = open_trades_count > 0 or open_plans_count > 0
                new_status = 'open' if has_open_items else 'closed'
                
                # Update ticker status if needed
                if ticker.status != new_status:
                    ticker.status = new_status
                    ticker.updated_at = datetime.now()
            
            session.commit()
                
        except Exception as e:
            session.rollback()

    def can_change_status(self, new_status: str) -> bool:
        """
        Check if the ticker status can be changed to the new status
        
        Args:
            new_status: The new status to check
            
        Returns:
            bool: True if status change is allowed, False otherwise
        """
        # If current status is 'cancelled', only allow manual change to 'open' or 'closed'
        if self.status == 'cancelled':
            return new_status in ['open', 'closed']
        
        # If new status is 'cancelled', always allow (manual cancellation)
        if new_status == 'cancelled':
            return True
        
        # For other status changes, allow if it's a valid status
        return new_status in ['open', 'closed', 'cancelled']
    
    def set_status(self, new_status: str, force: bool = False) -> bool:
        """
        Set the ticker status with validation
        
        Args:
            new_status: The new status to set
            force: If True, bypass validation (use with caution)
            
        Returns:
            bool: True if status was changed, False otherwise
        """
        if not force and not self.can_change_status(new_status):
            return False
        
        if self.status != new_status:
            self.status = new_status
            self.updated_at = datetime.now()
            return True
        
        return False
