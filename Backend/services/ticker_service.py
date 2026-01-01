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

from sqlalchemy import text
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
from services.constraint_service import ConstraintService
# from services.smart_query_optimizer import optimize_query, profile_query  # TEMPORARILY DISABLED
from typing import List, Optional, Dict, Any, Union, Tuple
import logging
import time
import threading

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
        DEFAULT_TICKER_TYPES (List[str]): Fallback ticker types if dynamic lookup fails
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
    DEFAULT_TICKER_TYPES: List[str] = ['stock', 'etf', 'bond', 'crypto', 'forex', 'commodity', 'other']
    MAX_SYMBOL_LENGTH: int = 10
    MAX_NAME_LENGTH: int = 100  # Changed back to 100
    MAX_TYPE_LENGTH: int = 20
    MAX_REMARKS_LENGTH: int = 500
    # CURRENCY_LENGTH: int = 3  # Removed - now using currency_id
    PLACEHOLDER_PREFIXES: Tuple[str, ...] = (
        'TEST', 'DEMO', 'PLACEHOLDER', 'DUMMY', 'UNIQUE', 'FRESH', 'SAMPLE'
    )
    _constraint_service = ConstraintService()
    _valid_ticker_types_cache: List[str] = DEFAULT_TICKER_TYPES.copy()
    _types_cache_expires_at: float = 0
    _types_cache_lock = threading.Lock()
    _TYPES_CACHE_TTL_SECONDS: int = 300

    @classmethod
    def get_valid_ticker_types(cls, db: Optional[Session] = None, force_refresh: bool = False) -> List[str]:
        """
        Retrieve active ticker types from the dynamic constraints table with caching.

        Falls back to DEFAULT_TICKER_TYPES if constraints query fails.
        """
        now = time.time()

        if not force_refresh and cls._valid_ticker_types_cache and now < cls._types_cache_expires_at:
            return cls._valid_ticker_types_cache

        types: List[str] = []

        # Try to use current SQLAlchemy session first
        if db is not None:
            try:
                result = db.execute(
                    text("""
                        SELECT ev.value
                        FROM constraints c
                        JOIN enum_values ev ON c.id = ev.constraint_id
                        WHERE c.table_name = :table
                          AND c.column_name = :column
                          AND c.constraint_type = 'ENUM'
                          AND c.is_active = TRUE
                          AND ev.is_active = TRUE
                        ORDER BY ev.sort_order
                    """),
                    {"table": "tickers", "column": "type"}
                ).fetchall()
                types = [row[0] for row in result]
            except Exception as db_error:
                logger.warning("Failed to load ticker type enum values via session: %s", db_error)

        # Fallback to constraint service if needed
        if not types:
            try:
                enum_values = cls._constraint_service.get_enum_values('tickers', 'type')
                types = [value['value'] for value in enum_values] if enum_values else []
            except Exception as constraint_error:
                logger.warning("Failed to load ticker type enum values via ConstraintService: %s", constraint_error)

        if not types:
            types = cls.DEFAULT_TICKER_TYPES.copy()

        with cls._types_cache_lock:
            cls._valid_ticker_types_cache = types
            cls._types_cache_expires_at = now + cls._TYPES_CACHE_TTL_SECONDS

        return cls._valid_ticker_types_cache
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
                # Open price data
                ticker.open_price = latest_quote.open_price
                ticker.change_from_open = latest_quote.change_amount_from_open
                ticker.change_from_open_percent = latest_quote.change_pct_from_open
                logger.debug(f"Added market data to {ticker.symbol}: price={latest_quote.price}, change_from_open={latest_quote.change_pct_from_open}%")
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
            ticker = QueryOptimizer.get_ticker_with_full_data(db, ticker_id)
        except ImportError:
            # Fallback to original query if optimizer not available
            logger.warning("QueryOptimizer not available, using fallback query")
            ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
        
        # Add market data fields if ticker exists
        if ticker:
            try:
                latest_quote = db.query(MarketDataQuote).filter(
                    MarketDataQuote.ticker_id == ticker.id
                ).order_by(MarketDataQuote.fetched_at.desc()).first()
                
                if latest_quote:
                    # Add market data fields to ticker object
                    ticker.current_price = latest_quote.price
                    ticker.change_percent = latest_quote.change_pct_day
                    ticker.change_amount = latest_quote.change_amount_day
                    ticker.volume = latest_quote.volume
                    ticker.yahoo_updated_at = latest_quote.fetched_at
                    ticker.data_source = latest_quote.source
                    # Open price data
                    ticker.open_price = latest_quote.open_price
                    ticker.change_from_open = latest_quote.change_amount_from_open
                    ticker.change_from_open_percent = latest_quote.change_pct_from_open
            except Exception as e:
                logger.warning(f"Error adding market data to ticker {ticker_id}: {str(e)}")
        
        return ticker
    
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
        normalized_symbol = TickerService._normalize_symbol(symbol)
        if not normalized_symbol:
            return None
        return db.query(Ticker).filter(Ticker.symbol == normalized_symbol).first()
    
    @staticmethod
    def _normalize_symbol(symbol: Optional[str]) -> Optional[str]:
        """Normalize ticker symbol to canonical uppercase form."""
        if symbol is None:
            return None
        normalized = symbol.strip().upper()
        return normalized or None
    
    @staticmethod
    def _is_symbol_valid(symbol: Optional[str]) -> bool:
        """Validate ticker symbol against project rules."""
        if not symbol:
            return False
        
        allowed_extra_chars = {'.', '-', '_', '/'}
        for char in symbol:
            if char.isalnum():
                continue
            if char in allowed_extra_chars:
                continue
            return False
        return True
    
    @classmethod
    def validate_ticker_data(cls, ticker_data: dict, db: Optional[Session] = None) -> Dict[str, Any]:
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
        
        symbol = ticker_data.get('symbol')
        normalized_symbol = cls._normalize_symbol(symbol)
        if normalized_symbol:
            if len(normalized_symbol) > cls.MAX_SYMBOL_LENGTH:
                errors.append(f"Symbol cannot be longer than {cls.MAX_SYMBOL_LENGTH} characters")
            elif not cls._is_symbol_valid(normalized_symbol):
                errors.append("Symbol may only contain letters, numbers, '.', '-', '_' or '/'")
        else:
            errors.append("Symbol is required")
        
        # Name validation
        name = ticker_data.get('name', '')
        if name:
            name = name.strip()
            if len(name) > cls.MAX_NAME_LENGTH:
                errors.append(f"Name cannot be longer than {cls.MAX_NAME_LENGTH} characters")
        
        # Type validation
        ticker_type = ticker_data.get('type', '')
        if ticker_type:
            ticker_type = ticker_type.strip()
            valid_types = cls.get_valid_ticker_types(db)
            if ticker_type not in valid_types:
                warnings.append(f"Unknown type: {ticker_type}. Known types: {', '.join(valid_types)}")
        
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
        symbol = TickerService._normalize_symbol(symbol)
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
        
        normalized_symbols = []
        for symbol in symbols:
            normalized = TickerService._normalize_symbol(symbol)
            if normalized:
                normalized_symbols.append(normalized)
        
        if not normalized_symbols:
            return {}
        
        tickers = db.query(Ticker).filter(Ticker.symbol.in_(normalized_symbols)).all()
        
        # Create mapping
        mapping = {ticker.symbol: ticker.id for ticker in tickers}
        
        logger.info(f"📊 Created symbol->ID mapping for {len(mapping)}/{len(symbols)} symbols")
        return mapping
    
    @staticmethod
    def enrich_records_with_ticker_ids(db: Session, records: List[Dict[str, Any]], user_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Enrich records with ticker_id field based on symbol.
        Creates ticker and user_ticker association if needed.
        
        Args:
            db: Session - Database connection
            records: List[Dict[str, Any]] - Records with 'symbol' field
            user_id: Optional[int] - User ID for creating user_ticker associations
            
        Returns:
            List[Dict[str, Any]] - Records enriched with 'ticker_id' field
            
        Example:
            >>> records = [{"symbol": "AAPL", "action": "buy"}, {"symbol": "GOOGL", "action": "sell"}]
            >>> enriched = TickerService.enrich_records_with_ticker_ids(db, records, user_id=1)
            >>> print(enriched)  # [{"symbol": "AAPL", "action": "buy", "ticker_id": 1}, ...]
        """
        if not records:
            return records
        
        normalized_symbols = set()
        invalid_symbols = []
        for record in records:
            raw_symbol = record.get('symbol')
            normalized = TickerService._normalize_symbol(raw_symbol)
            if normalized and TickerService._is_symbol_valid(normalized):
                normalized_symbols.add(normalized)
            else:
                if raw_symbol is not None:
                    invalid_symbols.append(raw_symbol)
        
        if invalid_symbols:
            logger.warning(f"⚠️ Invalid symbols encountered while enriching records: {invalid_symbols}")
        
        if not normalized_symbols:
            logger.warning("No valid symbols found in records")
            return records
        
        symbol_to_id = TickerService.get_symbols_to_ids_mapping(db, list(normalized_symbols))
        
        enriched_records = []
        missing_symbols = []
        
        # Import UserTicker model for creating associations
        from models.user_ticker import UserTicker
        from models.currency import Currency
        from datetime import datetime, timezone
        
        for record in records:
            enriched_record = record.copy()
            raw_symbol = record.get('symbol')
            normalized = TickerService._normalize_symbol(raw_symbol)
            
            if normalized and normalized in symbol_to_id:
                # Ticker exists - check if user_ticker association exists
                ticker_id = symbol_to_id[normalized]
                
                if user_id:
                    # Check if user_ticker association exists
                    user_ticker = db.query(UserTicker).filter(
                        UserTicker.user_id == user_id,
                        UserTicker.ticker_id == ticker_id
                    ).first()
                    
                    if not user_ticker:
                        # Create user_ticker association
                        try:
                            new_user_ticker = UserTicker(
                                user_id=user_id,
                                ticker_id=ticker_id,
                                status='open',
                                created_at=datetime.now(timezone.utc)
                            )
                            db.add(new_user_ticker)
                            db.flush()  # Flush to get ID, but don't commit yet
                            logger.info(f"✅ Created user_ticker association: user_id={user_id}, ticker_id={ticker_id}")
                        except Exception as e:
                            logger.warning(f"⚠️ Failed to create user_ticker association: {e}")
                            # Continue anyway - ticker exists, just no association
                
                enriched_record['ticker_id'] = ticker_id
                enriched_record['symbol'] = normalized
                enriched_records.append(enriched_record)
            else:
                # Ticker doesn't exist - create it if user_id is provided
                if raw_symbol is not None and user_id:
                    try:
                        # Double-check if ticker exists (might have been created by another process)
                        existing_ticker = db.query(Ticker).filter(Ticker.symbol == normalized).first()
                        
                        if existing_ticker:
                            # Ticker exists - just create user_ticker association
                            ticker_id = existing_ticker.id
                            user_ticker = db.query(UserTicker).filter(
                                UserTicker.user_id == user_id,
                                UserTicker.ticker_id == ticker_id
                            ).first()
                            
                            if not user_ticker:
                                try:
                                    new_user_ticker = UserTicker(
                                        user_id=user_id,
                                        ticker_id=ticker_id,
                                        status='open',
                                        created_at=datetime.now(timezone.utc)
                                    )
                                    db.add(new_user_ticker)
                                    db.flush()
                                    logger.info(f"✅ Created user_ticker association for existing ticker: symbol={normalized}, ticker_id={ticker_id}, user_id={user_id}")
                                except Exception as e:
                                    logger.warning(f"⚠️ Failed to create user_ticker association: {e}")
                            
                            enriched_record['ticker_id'] = ticker_id
                            enriched_record['symbol'] = normalized
                            enriched_records.append(enriched_record)
                        else:
                            # Ticker doesn't exist - create it
                            # Get currency from record or default to USD
                            currency_code = record.get('currency', 'USD')
                            currency = db.query(Currency).filter(Currency.symbol == currency_code).first()
                            
                            if not currency:
                                logger.warning(f"⚠️ Currency {currency_code} not found, using USD")
                                currency = db.query(Currency).filter(Currency.symbol == 'USD').first()
                            
                            if currency:
                                # Create new ticker
                                ticker_data = {
                                    'symbol': normalized,
                                    'name': normalized,  # Default name to symbol
                                    'type': record.get('type', 'stock'),
                                    'currency_id': currency.id,
                                    'status': 'open'
                                }
                                
                                new_ticker = TickerService.create(db, ticker_data)
                                db.flush()  # Flush to get ID
                                
                                # Create user_ticker association
                                try:
                                    new_user_ticker = UserTicker(
                                        user_id=user_id,
                                        ticker_id=new_ticker.id,
                                        status='open',
                                        created_at=datetime.now(timezone.utc)
                                    )
                                    db.add(new_user_ticker)
                                    db.flush()
                                    
                                    enriched_record['ticker_id'] = new_ticker.id
                                    enriched_record['symbol'] = normalized
                                    enriched_records.append(enriched_record)
                                    logger.info(f"✅ Created ticker and user_ticker: symbol={normalized}, ticker_id={new_ticker.id}, user_id={user_id}")
                                except Exception as e:
                                    logger.error(f"❌ Failed to create user_ticker after creating ticker: {e}")
                                    # Rollback ticker creation
                                    db.delete(new_ticker)
                                    db.flush()
                                    missing_symbols.append(raw_symbol)
                            else:
                                missing_symbols.append(raw_symbol)
                    except Exception as e:
                        logger.error(f"❌ Failed to create ticker for symbol {raw_symbol}: {e}")
                        # Check if ticker was created by another process
                        existing_ticker = db.query(Ticker).filter(Ticker.symbol == normalized).first()
                        if existing_ticker:
                            # Ticker exists - try to create user_ticker association
                            try:
                                user_ticker = db.query(UserTicker).filter(
                                    UserTicker.user_id == user_id,
                                    UserTicker.ticker_id == existing_ticker.id
                                ).first()
                                
                                if not user_ticker:
                                    new_user_ticker = UserTicker(
                                        user_id=user_id,
                                        ticker_id=existing_ticker.id,
                                        status='open',
                                        created_at=datetime.now(timezone.utc)
                                    )
                                    db.add(new_user_ticker)
                                    db.flush()
                                
                                enriched_record['ticker_id'] = existing_ticker.id
                                enriched_record['symbol'] = normalized
                                enriched_records.append(enriched_record)
                                logger.info(f"✅ Recovered from error - using existing ticker: symbol={normalized}, ticker_id={existing_ticker.id}, user_id={user_id}")
                            except Exception as e2:
                                logger.error(f"❌ Failed to recover from error: {e2}")
                                missing_symbols.append(raw_symbol)
                        else:
                            missing_symbols.append(raw_symbol)
                else:
                    if raw_symbol is not None:
                        missing_symbols.append(raw_symbol)
                    logger.warning(f"⚠️ No ticker_id found for symbol: {raw_symbol}")
        
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
        validation = TickerService.validate_ticker_data(ticker_data, db)
        if not validation['is_valid']:
            raise ValueError(f"Invalid data: {'; '.join(validation['errors'])}")
        
        # Normalize data
        normalized_symbol = TickerService._normalize_symbol(ticker_data.get('symbol'))
        ticker_data['symbol'] = normalized_symbol

        if 'name' in ticker_data and ticker_data['name']:
            ticker_data['name'] = ticker_data['name'].strip()
        # currency_id doesn't need normalization - it's already a number

        # Remove unsupported fields that may come from API requests
        unsupported_fields = ['exchange', 'market', 'country', 'sector', 'industry']
        for field in unsupported_fields:
            ticker_data.pop(field, None)

        ticker = Ticker(**ticker_data)
        db.add(ticker)
        db.flush()  # Use flush instead of commit - let the decorator handle the commit
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
        validation = TickerService.validate_ticker_data(ticker_data, db)
        if not validation['is_valid']:
            raise ValueError(f"Invalid data: {'; '.join(validation['errors'])}")
        
        # Check that symbol doesn't exist (if changed)
        if 'symbol' in ticker_data:
            normalized_symbol = TickerService._normalize_symbol(ticker_data.get('symbol'))
            if TickerService.check_symbol_exists(db, normalized_symbol, exclude_id=ticker_id):
                raise ValueError(f"Symbol {normalized_symbol} already exists in system")
            ticker_data['symbol'] = normalized_symbol
        
        # Normalize data
        if 'name' in ticker_data and ticker_data['name']:
            ticker_data['name'] = ticker_data['name'].strip()
        # currency_id doesn't need normalization - it's already a number
        
        # Update fields
        for key, value in ticker_data.items():
            setattr(ticker, key, value)
        
        db.flush()  # Use flush instead of commit - let the decorator handle the commit
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
            # Use EntityDetailsService to get all child entities (SQLAlchemy)
            from services.entity_details_service import EntityDetailsService
            
            # Get all linked items using EntityDetailsService
            linked_items = EntityDetailsService.get_linked_items(db, 'ticker', ticker_id)
            
            # Filter to get only child entities (linked_items returns all, we need to categorize)
            # For now, treat all as potential children - the schema will determine parent/child
            child_entities = linked_items
            
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
        
        from services.entity_details_service import EntityDetailsService
        
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
            # Get all linked items using EntityDetailsService (SQLAlchemy)
            linked_items = EntityDetailsService.get_linked_items(db, entity_type, entity_id)
            
            # Separate into children and parents based on schema
            from services.entity_relationship_schema import ENTITY_RELATIONSHIPS
            
            child_entities = []
            parent_entities = []
            
            if entity_type in ENTITY_RELATIONSHIPS:
                entity_schema = ENTITY_RELATIONSHIPS[entity_type]
                
                # Get list of child types from schema
                child_types = set()
                if 'children' in entity_schema:
                    children = entity_schema['children']
                    if isinstance(children, dict):
                        child_types = set(children.keys())
                
                # Get list of parent types from schema
                parent_types = set()
                if 'parents' in entity_schema:
                    parents = entity_schema['parents']
                    if isinstance(parents, dict):
                        parent_types = set(parents.keys())
                
                # Separate linked items
                for item in linked_items:
                    item_type = item.get('type')
                    if item_type in child_types:
                        child_entities.append(item)
                    elif item_type in parent_types:
                        parent_entities.append(item)
                    else:
                        # If not in schema, assume it's a child (for backward compatibility)
                        child_entities.append(item)
            else:
                # Fallback: if schema not found, treat all as children
                child_entities = linked_items
                
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
        
        Note: This method also deletes related market data (quotes, intraday slots, quotes_last)
        before deleting the ticker to avoid foreign key constraint violations.
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
        
        # Delete related market data before deleting ticker
        # This prevents foreign key constraint violations
        from models.external_data import IntradayDataSlot
        from models.quotes_last import QuotesLast
        
        # Delete related market data before deleting ticker
        # This prevents foreign key constraint violations
        # Note: We use flush() instead of commit() to allow the decorator to handle the final commit
        
        # Delete market data quotes
        market_quotes_count = db.query(MarketDataQuote).filter(
            MarketDataQuote.ticker_id == ticker_id
        ).delete(synchronize_session=False)
        if market_quotes_count > 0:
            logger.debug(f"Deleted {market_quotes_count} market data quotes for ticker {ticker_id}")
        
        # Delete intraday data slots
        intraday_slots_count = db.query(IntradayDataSlot).filter(
            IntradayDataSlot.ticker_id == ticker_id
        ).delete(synchronize_session=False)
        if intraday_slots_count > 0:
            logger.debug(f"Deleted {intraday_slots_count} intraday data slots for ticker {ticker_id}")
        
        # Delete quotes_last entry
        quotes_last_count = db.query(QuotesLast).filter(
            QuotesLast.ticker_id == ticker_id
        ).delete(synchronize_session=False)
        if quotes_last_count > 0:
            logger.debug(f"Deleted {quotes_last_count} quotes_last entry for ticker {ticker_id}")
        
        # Now delete the ticker (provider_symbols will be deleted automatically via CASCADE)
        db.delete(ticker)
        # Use flush() instead of commit() to allow the decorator to handle the final commit
        db.flush()
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
    def update_user_ticker_status(db: Session, user_id: int, ticker_id: int) -> bool:
        """
        Update user-ticker association status based on user's trades/plans
        
        Status logic:
        1. If manually cancelled - don't update (user manually cancelled)
        2. If not cancelled - check for open trades or trade plans for this user
           - If has open trades/plans -> status = 'open'
           - If no open trades/plans -> status = 'closed'
        
        Args:
            db: Database session
            user_id: User ID
            ticker_id: Ticker ID
            
        Returns:
            bool: True if updated successfully, False if association not found
            
        Example:
            >>> TickerService.update_user_ticker_status(db_session, 1, 5)
            True
        """
        from models.user_ticker import UserTicker
        from models.trade import Trade
        from models.trade_plan import TradePlan
        
        user_ticker = db.query(UserTicker).filter(
            UserTicker.user_id == user_id,
            UserTicker.ticker_id == ticker_id
        ).first()
        
        if not user_ticker:
            return False
        
        # Don't update if manually cancelled
        if user_ticker.status == 'cancelled':
            return True
        
        # Check for open trades for this user
        open_trades = db.query(Trade).filter(
            Trade.ticker_id == ticker_id,
            Trade.user_id == user_id,
            Trade.status == 'open'
        ).count()
        
        # Check for open trade plans for this user
        open_plans = db.query(TradePlan).filter(
            TradePlan.ticker_id == ticker_id,
            TradePlan.user_id == user_id,
            TradePlan.status == 'open'
        ).count()
        
        new_status = 'open' if (open_trades > 0 or open_plans > 0) else 'closed'
        
        if user_ticker.status != new_status:
            user_ticker.status = new_status
            db.flush()  # Use flush instead of commit - let the caller/decorator handle the commit
        
        return True
    
    @staticmethod
    def update_ticker_status_auto(db: Session, ticker_id: int) -> bool:
        """
        Update ticker overall status based on all user associations
        
        Status logic:
        1. If cancelled - don't update (user manually cancelled)
        2. Check all user-ticker associations for this ticker
           - If any user has status = 'open' -> ticker status = 'open'
           - If no user has status = 'open' -> ticker status = 'closed'
        
        Args:
            db (Session): Database connection
            ticker_id (int): Ticker ID to update
            
        Returns:
            bool: True if updated successfully, False if ticker not found
            
        Example:
            >>> TickerService.update_ticker_status_auto(db_session, 1)
            True
        """
        from models.user_ticker import UserTicker
        
        # Check if ticker exists
        ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
        if not ticker:
            return False
        
        # If ticker is cancelled, don't update
        if ticker.status == 'cancelled':
            return True
        
        # Check if any user has this ticker with status 'open'
        open_associations = db.query(UserTicker).filter(
            UserTicker.ticker_id == ticker_id,
            UserTicker.status == 'open'
        ).count()
        
        new_status = 'open' if open_associations > 0 else 'closed'
        
        # Update status if different
        if ticker.status != new_status:
            ticker.status = new_status
            db.flush()  # Use flush instead of commit - let the decorator handle the commit
        
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
    
    @classmethod
    def cleanup_invalid_tickers(cls, db: Session) -> Dict[str, Any]:
        """
        Remove invalid tickers and normalize symbols that violate formatting rules.
        Returns summary dictionary with affected records.
        """
        tickers: List[Ticker] = db.query(Ticker).all()
        to_delete: List[int] = []
        to_normalize: List[Tuple[int, str]] = []
        
        for ticker in tickers:
            normalized_symbol = cls._normalize_symbol(ticker.symbol)
            placeholder_match = False
            if normalized_symbol:
                for prefix in cls.PLACEHOLDER_PREFIXES:
                    if normalized_symbol.startswith(prefix):
                        placeholder_match = True
                        break

            if placeholder_match or not cls._is_symbol_valid(normalized_symbol):
                to_delete.append(ticker.id)
                logger.warning(f"Deleting invalid ticker {ticker.id} with symbol '{ticker.symbol}'")
                continue
            
            if ticker.symbol != normalized_symbol:
                to_normalize.append((ticker.id, normalized_symbol))
        
        deleted_count = 0
        normalized_count = 0
        
        if to_delete:
            deleted_count = db.query(Ticker).filter(Ticker.id.in_(to_delete)).delete(synchronize_session=False)
            logger.info(f"Removed {deleted_count} invalid tickers")
        
        if to_normalize:
            for ticker_id, normalized_symbol in to_normalize:
                db.query(Ticker).filter(Ticker.id == ticker_id).update(
                    {'symbol': normalized_symbol}, synchronize_session=False
                )
            normalized_count = len(to_normalize)
            logger.info(f"Normalized symbols for {normalized_count} tickers")
        
        if deleted_count or normalized_count:
            db.commit()
        
        return {
            'total_processed': len(tickers),
            'deleted': deleted_count,
            'normalized': normalized_count,
            'invalid_ids': to_delete
        }
    
    @staticmethod
    def update_open_status(db: Session, ticker_id: int) -> bool:
        """Update ticker open status (legacy function - kept for compatibility)"""
        return TickerService.update_active_trades_status(db, ticker_id)
    
    # ------------------------------------------------------------------
    # User Tickers Management (Many-to-Many)
    # ------------------------------------------------------------------
    
    @staticmethod
    def get_user_tickers(db: Session, user_id: int) -> List[Ticker]:
        """
        Get all tickers for a specific user (through user_tickers junction table)
        Includes custom fields (name_custom, type_custom, status) from user_tickers
        AND market data (current_price, change_percent, etc.) from MarketDataQuote
        
        Optimized to avoid N+1 queries by loading associations in a single query.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            List[Ticker]: List of tickers for the user with custom fields and market data attached
        """
        from models.user_ticker import UserTicker
        from sqlalchemy.orm import joinedload
        
        # Load tickers with user_ticker associations in a single query
        user_tickers = db.query(UserTicker).filter(
            UserTicker.user_id == user_id
        ).options(
            joinedload(UserTicker.ticker)
        ).all()
        
        # Extract tickers and attach custom fields + market data
        tickers = []
        for user_ticker in user_tickers:
            if user_ticker.ticker:
                ticker = user_ticker.ticker
                # Attach custom fields as dynamic attributes
                ticker.name_custom = user_ticker.name_custom
                ticker.type_custom = user_ticker.type_custom
                ticker.user_ticker_status = user_ticker.status
                
                # Add market data from MarketDataQuote (same logic as get_all)
                try:
                    latest_quote = db.query(MarketDataQuote).filter(
                        MarketDataQuote.ticker_id == ticker.id
                    ).order_by(MarketDataQuote.fetched_at.desc()).first()
                    
                    if latest_quote:
                        # Add market data fields to ticker object
                        ticker.current_price = latest_quote.price
                        ticker.change_percent = latest_quote.change_pct_day
                        ticker.change_amount = latest_quote.change_amount_day
                        ticker.volume = latest_quote.volume
                        ticker.yahoo_updated_at = latest_quote.fetched_at
                        ticker.data_source = latest_quote.source
                        # Open price data
                        ticker.open_price = latest_quote.open_price
                        ticker.change_from_open = latest_quote.change_amount_from_open
                        ticker.change_from_open_percent = latest_quote.change_pct_from_open
                        logger.debug(f"Added market data to {ticker.symbol}: price={latest_quote.price}, change_from_open={latest_quote.change_pct_from_open}%")
                    else:
                        logger.debug(f"No market data found for {ticker.symbol}")
                except DatabaseError as db_error:
                    logger.error(
                        "Failed to load market data quote for ticker %s due to database error: %s",
                        getattr(ticker, "symbol", ticker.id),
                        db_error
                    )
                    # Important: rollback the failing transaction so the session remains usable
                    db.rollback()
                except Exception as unexpected_error:
                    logger.warning(
                        "Unexpected error while loading market data for ticker %s: %s",
                        getattr(ticker, "symbol", ticker.id),
                        unexpected_error
                    )
                
                tickers.append(ticker)
        
        return tickers
    
    @staticmethod
    def get_all_tickers(db: Session) -> List[Ticker]:
        """
        Get all tickers in the system (for search/adding to user list)
        Tickers are shared across all users.
        
        Args:
            db: Database session
            
        Returns:
            List[Ticker]: All tickers in the system
        """
        return db.query(Ticker).all()
    
    @staticmethod
    def add_ticker_to_user(db: Session, user_id: int, ticker_id: int) -> bool:
        """
        Add a ticker to a user's list
        
        Args:
            db: Database session
            user_id: User ID
            ticker_id: Ticker ID
            
        Returns:
            bool: True if added successfully, False if already exists or error
        """
        from models.user_ticker import UserTicker
        from sqlalchemy.exc import IntegrityError
        
        # Check if ticker exists
        ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
        if not ticker:
            logger.warning(f"Ticker {ticker_id} not found")
            return False
        
        # Check if already in user's list
        existing = db.query(UserTicker).filter(
            UserTicker.user_id == user_id,
            UserTicker.ticker_id == ticker_id
        ).first()
        if existing:
            logger.info(f"Ticker {ticker_id} already in user {user_id}'s list")
            return False
        
        # Add to user's list
        try:
            user_ticker = UserTicker(
                user_id=user_id,
                ticker_id=ticker_id
            )
            db.add(user_ticker)
            db.commit()
            logger.info(f"Added ticker {ticker_id} to user {user_id}'s list")
            return True
        except IntegrityError:
            db.rollback()
            logger.warning(f"Failed to add ticker {ticker_id} to user {user_id}'s list (integrity error)")
            return False
    
    @staticmethod
    def remove_ticker_from_user(db: Session, user_id: int, ticker_id: int) -> bool:
        """
        Remove a ticker from a user's list
        
        Args:
            db: Database session
            user_id: User ID
            ticker_id: Ticker ID
            
        Returns:
            bool: True if removed successfully, False if not found
        """
        from models.user_ticker import UserTicker
        
        user_ticker = db.query(UserTicker).filter(
            UserTicker.user_id == user_id,
            UserTicker.ticker_id == ticker_id
        ).first()
        
        if not user_ticker:
            logger.warning(f"Ticker {ticker_id} not found in user {user_id}'s list")
            return False
        
        db.delete(user_ticker)
        db.commit()
        logger.info(f"Removed ticker {ticker_id} from user {user_id}'s list")
        return True
