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
from sqlalchemy.exc import DatabaseError
from models.ticker import Ticker
from models.trade import Trade
from models.trade_plan import TradePlan
from models.note import Note
from models.alert import Alert
from models.external_data import MarketDataQuote
from services.validation_service import ValidationService
from services.advanced_cache_service import cache_for, cache_with_deps, invalidate_cache
# from services.smart_query_optimizer import optimize_query, profile_query  # TEMPORARILY DISABLED
from typing import List, Optional, Dict, Any, Union
import logging
import time

logger = logging.getLogger(__name__)

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
    @cache_with_deps(ttl=30, dependencies=['tickers'])  # Cache for 30 seconds - critical data with frequent updates
    def get_all(db: Session) -> List[Ticker]:
        """
        Get all tickers from the system with external market data
        
        Args:
            db (Session): Database connection
            
        Returns:
            List[Ticker]: List of all tickers in the system with market data
            
        Example:
            >>> tickers = TickerService.get_all(db_session)
        """
        # Get tickers with latest market data
        tickers = db.query(Ticker).all()
        logger.info(f"Found {len(tickers)} tickers in database")
        
        # Add market data to each ticker
        for ticker in tickers:
            try:
                latest_quote = db.query(MarketDataQuote).filter(
                    MarketDataQuote.ticker_id == ticker.id
                ).order_by(MarketDataQuote.fetched_at.desc()).first()
            except DatabaseError as db_error:
                logger.error(
                    "Failed to load market data quote for ticker %s due to database error: %s",
                    getattr(ticker, "symbol", ticker.id),
                    db_error
                )
                # Important: rollback the failing transaction so the session remains usable
                db.rollback()
                continue
            except Exception as unexpected_error:
                logger.warning(
                    "Unexpected error while loading market data for ticker %s: %s",
                    getattr(ticker, "symbol", ticker.id),
                    unexpected_error
                )
                continue
            
            if latest_quote:
                # Add market data fields to ticker object
                ticker.current_price = latest_quote.price
                ticker.change_percent = latest_quote.change_pct_day
                ticker.change_amount = latest_quote.change_amount_day
                ticker.volume = latest_quote.volume
                ticker.yahoo_updated_at = latest_quote.fetched_at
                ticker.data_source = latest_quote.source
                logger.debug(f"Added market data to {ticker.symbol}: price={latest_quote.price}")
            else:
                logger.debug(f"No market data found for {ticker.symbol}")
        
        return tickers
    
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
        """
        # Use optimized query with lazy loading
        try:
            from services.query_optimizer import QueryOptimizer
            return QueryOptimizer.get_ticker_with_full_data(db, ticker_id)
        except ImportError:
            # Fallback to original query if optimizer not available
            logger.warning("QueryOptimizer not available, using fallback query")
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
    def get_symbols_to_ids_mapping(db: Session, symbols: List[str]) -> Dict[str, int]:
        """
        Get mapping of ticker symbols to their IDs
        
        Args:
            db: Session - Database connection
            symbols: List[str] - List of ticker symbols to map
            
        Returns:
            Dict[str, int] - Mapping of symbol -> ticker_id
            
        Example:
            >>> mapping = TickerService.get_symbols_to_ids_mapping(db, ["AAPL", "GOOGL", "MSFT"])
            >>> print(mapping)  # {"AAPL": 1, "GOOGL": 2, "MSFT": 3}
        """
        if not symbols:
            return {}
        
        # Convert to uppercase for consistency
        symbols_upper = [symbol.upper() for symbol in symbols]
        
        # Query database for existing tickers
        tickers = db.query(Ticker).filter(Ticker.symbol.in_(symbols_upper)).all()
        
        # Create mapping
        mapping = {ticker.symbol: ticker.id for ticker in tickers}
        
        logger.info(f"📊 Created symbol->ID mapping for {len(mapping)}/{len(symbols)} symbols")
        return mapping
    
    @staticmethod
    def enrich_records_with_ticker_ids(db: Session, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Enrich records with ticker_id field based on symbol
        
        Args:
            db: Session - Database connection
            records: List[Dict[str, Any]] - Records with 'symbol' field
            
        Returns:
            List[Dict[str, Any]] - Records enriched with 'ticker_id' field
            
        Example:
            >>> records = [{"symbol": "AAPL", "action": "buy"}, {"symbol": "GOOGL", "action": "sell"}]
            >>> enriched = TickerService.enrich_records_with_ticker_ids(db, records)
            >>> print(enriched)  # [{"symbol": "AAPL", "action": "buy", "ticker_id": 1}, ...]
        """
        if not records:
            return records
        
        # Get unique symbols from records
        symbols = list(set([record.get('symbol') for record in records if record.get('symbol')]))
        
        if not symbols:
            logger.warning("No symbols found in records")
            return records
        
        # Get mapping
        symbol_to_id = TickerService.get_symbols_to_ids_mapping(db, symbols)
        
        # Enrich records
        enriched_records = []
        missing_symbols = []
        
        for record in records:
            enriched_record = record.copy()
            symbol = record.get('symbol')
            
            if symbol and symbol.upper() in symbol_to_id:
                enriched_record['ticker_id'] = symbol_to_id[symbol.upper()]
                enriched_records.append(enriched_record)
            else:
                if symbol:
                    missing_symbols.append(symbol)
                logger.warning(f"⚠️ No ticker_id found for symbol: {symbol}")
        
        if missing_symbols:
            logger.warning(f"⚠️ Missing ticker_ids for symbols: {missing_symbols}")
        
        logger.info(f"✅ Enriched {len(enriched_records)}/{len(records)} records with ticker_ids")
        return enriched_records
    
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
        Check linked items to ticker before deletion using the linked_items system
        
        Returns dictionary with:
        - has_linked_items: Whether there are linked items
        - open_trades: List of open trades
        - open_trade_plans: List of open trade plans
        - notes: List of linked notes
        - alerts: List of linked alerts
        """
        from models.trade import Trade
        from models.trade_plan import TradePlan
        from models.note import Note
        from models.alert import Alert
        
        result = {
            'has_linked_items': False,
            'open_trades': [],
            'open_trade_plans': [],
            'notes': [],
            'alerts': []
        }
        
        try:
            # Use the linked_items system to get all child entities
            from routes.api.linked_items import get_ticker_child_entities
            import sqlite3
            import os
            
            # Get database connection for linked_items
            BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            DB_PATH = os.path.join(BASE_DIR, "db", "simpleTrade_new.db")
            
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            try:
                # Get all child entities using the linked_items system
                child_entities = get_ticker_child_entities(cursor, ticker_id)
                
                # Categorize entities by type
                for entity in child_entities:
                    if entity['type'] == 'trade':
                        # Check if trade is open
                        trade = db.query(Trade).filter(Trade.id == entity['id']).first()
                        if trade and trade.status == 'open':
                            result['open_trades'].append({
                                'id': entity['id'],
                                'ticker_symbol': trade.ticker.symbol if trade.ticker else 'Unknown',
                                'status': entity['status'],
                                'account_name': trade.account.name if trade.account else 'Unknown',
                                'notes': trade.notes,
                                'created_at': entity['created_at']
                            })
                    
                    elif entity['type'] == 'trade_plan':
                        # Check if trade plan is open
                        plan = db.query(TradePlan).filter(TradePlan.id == entity['id']).first()
                        if plan and plan.status == 'open':
                            result['open_trade_plans'].append({
                                'id': entity['id'],
                                'ticker': {'symbol': plan.ticker.symbol} if plan.ticker else {'symbol': 'Unknown'},
                                'status': entity['status'],
                                'account': {'name': plan.account.name} if plan.account else {'name': 'Unknown'},
                                'target_price': plan.target_price,
                                'created_at': entity['created_at']
                            })
                    
                    elif entity['type'] == 'note':
                        result['notes'].append({
                            'id': entity['id'],
                            'content': entity['description'],
                            'created_at': entity['created_at']
                        })
                    
                    elif entity['type'] == 'alert':
                        result['alerts'].append({
                            'id': entity['id'],
                            'message': entity['description'].replace('התראה: ', ''),
                            'status': entity['status'],
                            'created_at': entity['created_at']
                        })
                
                # Check if there are any linked items
                result['has_linked_items'] = (
                    len(result['open_trades']) > 0 or
                    len(result['open_trade_plans']) > 0 or
                    len(result['notes']) > 0 or
                    len(result['alerts']) > 0
                )
                
            finally:
                conn.close()
                
        except Exception as e:
            logger.error(f"Error checking linked items for ticker {ticker_id}: {str(e)}")
            # Return empty result on error
            pass
        
        return result
    
    @staticmethod
    def check_linked_items_generic(db: Session, entity_type: str, entity_id: int) -> Dict[str, Any]:
        """
        Generic function to check linked items for any entity type
        
        Args:
            db: Database session
            entity_type: Type of entity ('ticker', 'trade', 'account', 'alert', etc.)
            entity_id: ID of the entity
            
        Returns:
            Dictionary with linked items categorized by type
        """
        import logging
        logger = logging.getLogger(__name__)
        
        from routes.api.linked_items import get_child_entities, get_parent_entities
        import sqlite3
        import os
        
        result = {
            'entity_type': entity_type,
            'entity_id': entity_id,
            'has_linked_items': False,
            'child_entities': [],
            'parent_entities': [],
            'open_trades': [],
            'open_trade_plans': [],
            'notes': [],
            'alerts': [],
            'executions': [],
            'cash_flows': []
        }
        
        try:
            # Get database connection for linked_items
            BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            DB_PATH = os.path.join(BASE_DIR, "db", "simpleTrade_new.db")
            
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            try:
                # Get all child entities using the linked_items system
                child_entities = get_child_entities(cursor, entity_type, entity_id)
                parent_entities = get_parent_entities(cursor, entity_type, entity_id)
                
                result['child_entities'] = child_entities
                result['parent_entities'] = parent_entities
                
                # Categorize child entities by type
                for entity in child_entities:
                    if entity['type'] == 'trade':
                        # Check if trade is open
                        from models.trade import Trade
                        trade = db.query(Trade).filter(Trade.id == entity['id']).first()
                        if trade and trade.status == 'open':
                            result['open_trades'].append({
                                'id': entity['id'],
                                'title': entity['title'],
                                'description': entity['description'],
                                'status': entity['status'],
                                'created_at': entity['created_at']
                            })
                    
                    elif entity['type'] == 'trade_plan':
                        # Check if trade plan is open
                        from models.trade_plan import TradePlan
                        plan = db.query(TradePlan).filter(TradePlan.id == entity['id']).first()
                        if plan and plan.status == 'open':
                            result['open_trade_plans'].append({
                                'id': entity['id'],
                                'title': entity['title'],
                                'description': entity['description'],
                                'status': entity['status'],
                                'created_at': entity['created_at']
                            })
                    
                    elif entity['type'] == 'note':
                        result['notes'].append({
                            'id': entity['id'],
                            'title': entity['title'],
                            'description': entity['description'],
                            'status': entity['status'],
                            'created_at': entity['created_at']
                        })
                    
                    elif entity['type'] == 'alert':
                        result['alerts'].append({
                            'id': entity['id'],
                            'title': entity['title'],
                            'description': entity['description'],
                            'status': entity['status'],
                            'created_at': entity['created_at']
                        })
                    
                    elif entity['type'] == 'execution':
                        result['executions'].append({
                            'id': entity['id'],
                            'title': entity['title'],
                            'description': entity['description'],
                            'status': entity['status'],
                            'created_at': entity['created_at']
                        })
                    
                    elif entity['type'] == 'cash_flow':
                        result['cash_flows'].append({
                            'id': entity['id'],
                            'title': entity['title'],
                            'description': entity['description'],
                            'status': entity['status'],
                            'created_at': entity['created_at']
                        })
                
                # Check if there are any linked items
                result['has_linked_items'] = (
                    len(result['child_entities']) > 0 or
                    len(result['parent_entities']) > 0 or
                    len(result['open_trades']) > 0 or
                    len(result['open_trade_plans']) > 0 or
                    len(result['notes']) > 0 or
                    len(result['alerts']) > 0 or
                    len(result['executions']) > 0 or
                    len(result['cash_flows']) > 0
                )
                
            finally:
                conn.close()
                
        except Exception as e:
            logger.error(f"Error checking linked items for {entity_type} {entity_id}: {str(e)}")
            # Return empty result on error
            pass
        
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
    def update_ticker_status_auto(db: Session, ticker_id: int) -> bool:
        """
        Update ticker status automatically based on linked trades and trade plans
        
        Status logic:
        1. If cancelled - ignore (user manually cancelled)
        2. If not cancelled - check for open trades or trade plans
           - If has open trades/plans -> status = 'open'
           - If no open trades/plans -> status = 'closed'
        
        Args:
            db (Session): Database connection
            ticker_id (int): Ticker ID to update
            
        Returns:
            bool: True if updated successfully, False if ticker not found
            
        Example:
            >>> TickerService.update_ticker_status_auto(db_session, 1)
            True
        """
        from models.trade import Trade
        from models.trade_plan import TradePlan
        
        # Check if ticker exists
        ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
        if not ticker:
            return False
        
        # If ticker is cancelled, don't update status (user manually cancelled)
        if ticker.status == 'cancelled':
            return True
        
        # Check if there are open trades
        open_trades_count = db.query(Trade).filter(
            Trade.ticker_id == ticker_id,
            Trade.status == 'open'
        ).count()
        
        # Check if there are open trade plans
        open_plans_count = db.query(TradePlan).filter(
            TradePlan.ticker_id == ticker_id,
            TradePlan.status == 'open'
        ).count()
        
        # Determine new status
        if open_trades_count > 0 or open_plans_count > 0:
            new_status = 'open'
        else:
            new_status = 'closed'
        
        # Update status if different
        if ticker.status != new_status:
            ticker.status = new_status
            db.commit()
        
        return True
    
    @staticmethod
    def update_all_ticker_statuses_auto(db: Session) -> int:
        """
        Update status for all non-cancelled tickers automatically
        
        This function updates the status field for all tickers that are not cancelled
        based on their linked open trades and trade plans.
        
        Args:
            db (Session): Database connection
            
        Returns:
            int: Number of tickers updated
            
        Example:
            >>> updated_count = TickerService.update_all_ticker_statuses_auto(db_session)
        """
        from models.trade import Trade
        from models.trade_plan import TradePlan
        
        # Get all non-cancelled tickers
        tickers = db.query(Ticker).filter(Ticker.status != 'cancelled').all()
        updated_count = 0
        
        for ticker in tickers:
            # Check if there are open trades for this ticker
            open_trades_count = db.query(Trade).filter(
                Trade.ticker_id == ticker.id,
                Trade.status == 'open'
            ).count()
            
            # Check if there are open trade plans for this ticker
            open_plans_count = db.query(TradePlan).filter(
                TradePlan.ticker_id == ticker.id,
                TradePlan.status == 'open'
            ).count()
            
            # Determine new status
            if open_trades_count > 0 or open_plans_count > 0:
                new_status = 'open'
            else:
                new_status = 'closed'
            
            # Update if different
            if ticker.status != new_status:
                ticker.status = new_status
                updated_count += 1
        
        if updated_count > 0:
            db.commit()
        
        return updated_count
    
    @staticmethod
    def update_open_status(db: Session, ticker_id: int) -> bool:
        """Update ticker open status (legacy function - kept for compatibility)"""
        return TickerService.update_active_trades_status(db, ticker_id)
