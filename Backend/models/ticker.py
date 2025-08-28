from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, Text, DateTime
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
    __table_args__ = {'extend_existing': True}
    
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
                   comment="Ticker status: open, closed, canceled")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    currency = relationship("Currency")
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
        
        Args:
            session: SQLAlchemy session
            ticker_id: ID of the ticker to update
        """
        try:
            from .trade import Trade
            from .trade_plan import TradePlan
            
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
            
            # Determine new status
            has_open_items = open_trades_count > 0 or open_plans_count > 0
            new_status = 'open' if has_open_items else 'closed'
            
            # Update ticker status
            ticker = session.query(Ticker).filter(Ticker.id == ticker_id).first()
            if ticker and ticker.status != new_status:
                ticker.status = new_status
                ticker.updated_at = datetime.now()
                session.flush()
                
                print(f"Updated ticker {ticker.symbol} status to {new_status} (trades: {open_trades_count}, plans: {open_plans_count})")
                
        except Exception as e:
            print(f"Error updating ticker {ticker_id} status: {e}")
            session.rollback()

    @staticmethod
    def update_all_ticker_statuses(session) -> None:
        """
        Update status for all tickers based on their linked trades and trade plans
        
        Args:
            session: SQLAlchemy session
        """
        try:
            from .trade import Trade
            from .trade_plan import TradePlan
            
            # Get all tickers
            tickers = session.query(Ticker).all()
            
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
                
                # Determine new status
                has_open_items = open_trades_count > 0 or open_plans_count > 0
                new_status = 'open' if has_open_items else 'closed'
                
                # Update ticker status if needed
                if ticker.status != new_status:
                    ticker.status = new_status
                    ticker.updated_at = datetime.now()
                    print(f"Updated ticker {ticker.symbol} status from {ticker.status} to {new_status} (trades: {open_trades_count}, plans: {open_plans_count})")
            
            session.commit()
            print("All ticker statuses updated successfully")
                
        except Exception as e:
            print(f"Error updating all ticker statuses: {e}")
            session.rollback()
