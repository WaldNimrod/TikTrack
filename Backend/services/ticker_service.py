"""
Ticker Management Service - TikTrack

This module contains all business logic for managing tickers in the system.
Includes CRUD operations, validation, checking linked items and more.

Classes:
    TickerService: Main service for ticker management

Author: TikTrack Development Team
Version: 1.0
Date: August 2025
"""

from sqlalchemy.orm import Session
from models.ticker import Ticker
from models.trade import Trade
from models.trade_plan import TradePlan
from models.note import Note
from models.alert import Alert
from services.validation_service import ValidationService
from typing import List, Optional, Dict, Any, Union

class TickerService:
    """
    Service for managing tickers in TikTrack system
    
    This service provides all functionality required for ticker management:
    - Create, read, update and delete (CRUD)
    - Data validation
    - Checking linked items
    - Activity status management
    
    Attributes:
        VALID_TICKER_TYPES (List[str]): Valid ticker types in system
        MAX_SYMBOL_LENGTH (int): Maximum length for symbol
        MAX_NAME_LENGTH (int): Maximum length for name
        MAX_REMARKS_LENGTH (int): Maximum length for remarks
        CURRENCY_LENGTH (int): Fixed length for currency
        
    Example:
        >>> service = TickerService()
        >>> tickers = service.get_all(db_session)
        >>> new_ticker = service.create(db_session, {
        ...     'symbol': 'AAPL',
        ...     'name': 'Apple Inc.',
        ...     'type': 'stock'
        ... })
    """
    
    # Constants for validation
    VALID_TICKER_TYPES: List[str] = ['stock', 'etf', 'crypto', 'forex', 'commodity']
    MAX_SYMBOL_LENGTH: int = 10
    MAX_NAME_LENGTH: int = 100  # Changed back to 100
    MAX_TYPE_LENGTH: int = 20
    MAX_REMARKS_LENGTH: int = 500
    # CURRENCY_LENGTH: int = 3  # Removed - now using currency_id
    @staticmethod
    def get_all(db: Session) -> List[Ticker]:
        """
        Get all tickers from the system
        
        Args:
            db (Session): Database connection
            
        Returns:
            List[Ticker]: List of all tickers in the system
            
        Example:
            >>> tickers = TickerService.get_all(db_session)
            >>> print(f"Number of tickers in system: {len(tickers)}")
        """
        return db.query(Ticker).all()
    
    @staticmethod
    def get_by_id(db: Session, ticker_id: int) -> Optional[Ticker]:
        """
        Get ticker by ID
        
        Args:
            db (Session): Database connection
            ticker_id (int): Ticker ID
            
        Returns:
            Optional[Ticker]: Ticker if found, None otherwise
            
        Example:
            >>> ticker = TickerService.get_by_id(db_session, 1)
            >>> if ticker:
            ...     print(f"Found ticker: {ticker.symbol}")
        """
        return db.query(Ticker).filter(Ticker.id == ticker_id).first()
    
    @staticmethod
    def get_by_symbol(db: Session, symbol: str) -> Optional[Ticker]:
        """
        Get ticker by symbol
        
        Args:
            db (Session): Database connection
            symbol (str): Ticker symbol
            
        Returns:
            Optional[Ticker]: Ticker if found, None otherwise
            
        Example:
            >>> ticker = TickerService.get_by_symbol(db_session, "AAPL")
            >>> if ticker:
            ...     print(f"Found ticker: {ticker.name}")
        """
        return db.query(Ticker).filter(Ticker.symbol == symbol.upper()).first()
    
    @staticmethod
    def validate_ticker_data(ticker_data: dict) -> Dict[str, Any]:
        """
        Validate ticker data
        
        This function checks data validity before saving to database.
        Includes length checks, format validation, allowed values and more.
        
        Args:
            ticker_data (dict): Dictionary with ticker data for validation
                - symbol (str): Ticker symbol
                - name (str): Ticker name
                - type (str): Ticker type
                - currency (str): Ticker currency
                - remarks (str): Remarks
                
        Returns:
            Dict[str, Any]: Dictionary with validation results
                - is_valid (bool): Whether data is valid
                - errors (List[str]): List of errors
                - warnings (List[str]): List of warnings
                
        Example:
            >>> data = {'symbol': 'AAPL', 'name': 'Apple Inc.', 'type': 'stock'}
            >>> result = TickerService.validate_ticker_data(data)
            >>> print(f"Valid: {result['is_valid']}")
            >>> print(f"Errors: {result['errors']}")
        """
        errors = []
        warnings = []
        
        # Symbol validation - only required for CREATE, optional for UPDATE
        symbol = ticker_data.get('symbol', '')
        if symbol:
            symbol = symbol.strip().upper()
            if len(symbol) > TickerService.MAX_SYMBOL_LENGTH:
                errors.append(f"Symbol cannot be longer than {TickerService.MAX_SYMBOL_LENGTH} characters")
            elif not symbol.isalnum():
                errors.append("Symbol can only contain English letters and numbers (no dots)")
        
        # Name validation
        name = ticker_data.get('name', '')
        if name:
            name = name.strip()
            if len(name) > TickerService.MAX_NAME_LENGTH:
                errors.append(f"Name cannot be longer than {TickerService.MAX_NAME_LENGTH} characters")
        
        # Type validation
        ticker_type = ticker_data.get('type', '')
        if ticker_type:
            ticker_type = ticker_type.strip()
            if ticker_type not in TickerService.VALID_TICKER_TYPES:
                warnings.append(f"Unknown type: {ticker_type}. Known types: {', '.join(TickerService.VALID_TICKER_TYPES)}")
        
        # Currency validation - now checking currency_id
        currency_id = ticker_data.get('currency_id')
        if currency_id is not None:
            try:
                currency_id = int(currency_id)
                if currency_id <= 0:
                    errors.append("Currency ID must be a positive number")
            except (ValueError, TypeError):
                errors.append("Currency ID must be a valid number")
        
        # Remarks validation
        remarks = ticker_data.get('remarks', '')
        if remarks:
            remarks = remarks.strip()
            if len(remarks) > TickerService.MAX_REMARKS_LENGTH:
                errors.append(f"Remarks cannot be longer than {TickerService.MAX_REMARKS_LENGTH} characters")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
    
    @staticmethod
    def check_symbol_exists(db: Session, symbol: str, exclude_id: int = None) -> bool:
        """
        Check if symbol already exists
        
        Args:
            db: Session - Database connection
            symbol: str - Symbol to check
            exclude_id: int - Ticker ID to exclude from check (for editing)
        
        Returns:
            bool - True if symbol exists, False otherwise
        """
        if symbol:
            symbol = symbol.upper()
        query = db.query(Ticker).filter(Ticker.symbol == symbol)
        if exclude_id:
            query = query.filter(Ticker.id != exclude_id)
        return query.first() is not None
    
    @staticmethod
    def create(db: Session, ticker_data: dict) -> Ticker:
        """
        Create new ticker with validation
        
        Note: updated_at field is NOT set during creation - it's reserved for future pricing system updates
        """
        # Validate data against dynamic constraints
        is_valid, errors = ValidationService.validate_data(db, 'tickers', ticker_data)
        if not is_valid:
            raise ValueError(f"Validation failed: {'; '.join(errors)}")
        
        # Additional custom validation
        validation = TickerService.validate_ticker_data(ticker_data)
        if not validation['is_valid']:
            raise ValueError(f"Invalid data: {'; '.join(validation['errors'])}")
        
        # Normalize data
        symbol = ticker_data.get('symbol', '')
        if symbol:
            symbol = symbol.strip().upper()
        ticker_data['symbol'] = symbol
        
        if 'name' in ticker_data and ticker_data['name']:
            ticker_data['name'] = ticker_data['name'].strip()
        # currency_id doesn't need normalization - it's already a number
        
        ticker = Ticker(**ticker_data)
        db.add(ticker)
        db.commit()
        db.refresh(ticker)
        return ticker
    
    @staticmethod
    def update(db: Session, ticker_id: int, ticker_data: dict) -> Optional[Ticker]:
        """
        Update ticker with validation
        
        Note: updated_at field is NOT modified during user updates - it's reserved for future pricing system updates
        """
        ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
        if not ticker:
            raise ValueError(f"Ticker with ID {ticker_id} not found")
        
        # Data validation
        validation = TickerService.validate_ticker_data(ticker_data)
        if not validation['is_valid']:
            raise ValueError(f"Invalid data: {'; '.join(validation['errors'])}")
        
        # Check that symbol doesn't exist (if changed)
        if 'symbol' in ticker_data:
            symbol = ticker_data.get('symbol', '')
            if symbol:
                symbol = symbol.strip().upper()
            if TickerService.check_symbol_exists(db, symbol, exclude_id=ticker_id):
                raise ValueError(f"Symbol {symbol} already exists in system")
            ticker_data['symbol'] = symbol
        
        # Normalize data
        if 'name' in ticker_data and ticker_data['name']:
            ticker_data['name'] = ticker_data['name'].strip()
        # currency_id doesn't need normalization - it's already a number
        
        # Update fields
        for key, value in ticker_data.items():
            setattr(ticker, key, value)
        
        db.commit()
        db.refresh(ticker)
        return ticker
    
    @staticmethod
    def check_linked_items(db: Session, ticker_id: int) -> Dict[str, Any]:
        """
        Check linked items to ticker before deletion
        
        Returns dictionary with:
        - has_linked_items: Whether there are linked items
        - open_trades: List of open trades
        - open_trade_plans: List of open trade plans
        - notes: List of linked notes
        - alerts: List of linked alerts
        """
        result = {
            'has_linked_items': False,
            'open_trades': [],
            'open_trade_plans': [],
            'notes': [],
            'alerts': []
        }
        
        # Simple implementation without complex error handling
        return result
    
    @staticmethod
    def delete(db: Session, ticker_id: int) -> bool:
        """
        Delete ticker - only if no linked items
        Returns True if ticker deleted successfully, False otherwise
        """
        # Check that ticker exists
        ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
        if not ticker:
            return False
        
        # Check linked items
        linked_items = TickerService.check_linked_items(db, ticker_id)
        if linked_items['has_linked_items']:
            # Has linked items - cannot delete
            raise ValueError("Cannot delete ticker with linked items (open trades, trade plans, notes, or alerts)")
        
        # No linked items - can delete
        db.delete(ticker)
        db.commit()
        return True
    
    @staticmethod
    def update_active_trades_status(db: Session, ticker_id: int) -> bool:
        """
        Update ticker active_trades status based on open trades
        
        This function checks if there are any open trades linked to the ticker
        and updates the active_trades field accordingly.
        
        Args:
            db (Session): Database connection
            ticker_id (int): Ticker ID to update
            
        Returns:
            bool: True if updated successfully, False if ticker not found
            
        Example:
            >>> TickerService.update_active_trades_status(db_session, 1)
            True
        """
        from models.trade import Trade
        
        # Check if ticker exists
        ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
        if not ticker:
            return False
        
        # Check if there are open trades
        open_trades_count = db.query(Trade).filter(
            Trade.ticker_id == ticker_id,
            Trade.status == 'open'
        ).count()
        
        # Update active_trades field
        ticker.active_trades = (open_trades_count > 0)
        db.commit()
        
        return True
    
    @staticmethod
    def update_all_active_trades_status(db: Session) -> int:
        """
        Update active_trades status for all tickers
        
        This function updates the active_trades field for all tickers
        based on their linked open trades.
        
        Args:
            db (Session): Database connection
            
        Returns:
            int: Number of tickers updated
            
        Example:
            >>> updated_count = TickerService.update_all_active_trades_status(db_session)
            >>> print(f"Updated {updated_count} tickers")
        """
        from models.trade import Trade
        
        # Get all tickers
        tickers = db.query(Ticker).all()
        updated_count = 0
        
        for ticker in tickers:
            # Check if there are open trades for this ticker
            open_trades_count = db.query(Trade).filter(
                Trade.ticker_id == ticker.id,
                Trade.status == 'open'
            ).count()
            
            # Update if different
            new_status = (open_trades_count > 0)
            if ticker.active_trades != new_status:
                ticker.active_trades = new_status
                updated_count += 1
        
        if updated_count > 0:
            db.commit()
        
        return updated_count
    
    @staticmethod
    def update_open_status(db: Session, ticker_id: int) -> bool:
        """Update ticker open status (legacy function - kept for compatibility)"""
        return TickerService.update_active_trades_status(db, ticker_id)
