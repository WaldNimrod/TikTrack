"""
API Routes for Ticker Management - TikTrack

This module contains all API endpoints for managing tickers in the system.
Includes CRUD operations, linked items checking and more.

Endpoints:
    GET /api/tickers/ - Get all tickers
    GET /api/tickers/<id> - Get ticker by ID
    POST /api/tickers/ - Create new ticker
    PUT /api/tickers/<id> - Update ticker
    DELETE /api/tickers/<id> - Delete ticker
    GET /api/tickers/<id>/linked-items - Check linked items

Author: TikTrack Development Team
Version: 1.0
Date: August 2025
"""

from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from config.database import get_db
from services.ticker_service import TickerService
from services.trade_service import TradeService
from services.advanced_cache_service import cache_for, invalidate_cache
from services.tag_service import TagService
from services.date_normalization_service import DateNormalizationService
from services.preferences_service import PreferencesService
from services.user_service import UserService
import logging
from typing import Dict, Any, Optional

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

tickers_bp = Blueprint('tickers', __name__, url_prefix='/api/tickers')

# Initialize base API
base_api = BaseEntityAPI('tickers', TickerService, 'tickers')

# Initialize preferences service for date normalization
preferences_service = PreferencesService()
user_service = UserService()

def _resolve_user_id() -> int:
    """Return active user id from Flask context (set by auth middleware).
    Falls back to default user if not authenticated (for backward compatibility)."""
    # Primary: Get from Flask context (set by auth middleware)
    user_id = getattr(g, 'user_id', None)
    if user_id is not None:
        return user_id
    
    # Fallback: Check query parameter
    user_id = request.args.get('user_id', type=int)
    if user_id is not None:
        return user_id
    
    # Fallback: Default user (for backward compatibility and tools)
    default_user = user_service.get_default_user()
    return default_user["id"] if default_user else 1

def _get_tickers_normalizer() -> DateNormalizationService:
    """Resolve timezone and create a DateNormalizationService for tickers endpoints."""
    try:
        timezone_name = DateNormalizationService.resolve_timezone(
            request,
            preferences_service=preferences_service
        )
        return DateNormalizationService(timezone_name)
    except Exception as e:
        logger.warning(f"Failed to resolve timezone for tickers, using UTC: {str(e)}")
        return DateNormalizationService("UTC")

@tickers_bp.route('/', methods=['GET'])
@handle_database_session()
def get_tickers():
    """Get all tickers or tickers for a specific user if user_id is provided"""
    db: Session = g.db
    user_id = getattr(g, 'user_id', None) or request.args.get('user_id', type=int)
    
    try:
        if user_id:
            tickers = TickerService.get_user_tickers(db, user_id)
        else:
            # If no user_id, fetch all tickers (e.g., shared/public tickers)
            tickers = TickerService.get_all(db)
        
        # Convert tickers to dict with market data
        tickers_data = []
        for ticker in tickers:
            try:
                ticker_dict = ticker.to_dict()
                
                # Add custom fields from user_ticker association
                if hasattr(ticker, 'name_custom'):
                    ticker_dict['name_custom'] = ticker.name_custom
                if hasattr(ticker, 'type_custom'):
                    ticker_dict['type_custom'] = ticker.type_custom
                if hasattr(ticker, 'user_ticker_status'):
                    ticker_dict['user_ticker_status'] = ticker.user_ticker_status
                
                # Add market data fields if they exist (dynamically added by TickerService)
                try:
                    if hasattr(ticker, 'current_price'):
                        ticker_dict['current_price'] = ticker.current_price
                    if hasattr(ticker, 'change_percent'):
                        ticker_dict['change_percent'] = ticker.change_percent
                    if hasattr(ticker, 'change_amount'):
                        ticker_dict['change_amount'] = ticker.change_amount
                    if hasattr(ticker, 'volume'):
                        ticker_dict['volume'] = ticker.volume
                    if hasattr(ticker, 'yahoo_updated_at'):
                        ticker_dict['yahoo_updated_at'] = ticker.yahoo_updated_at.isoformat() if ticker.yahoo_updated_at else None
                    if hasattr(ticker, 'data_source'):
                        ticker_dict['data_source'] = ticker.data_source
                    # Open price data
                    if hasattr(ticker, 'open_price'):
                        ticker_dict['open_price'] = ticker.open_price
                    if hasattr(ticker, 'change_from_open'):
                        ticker_dict['change_from_open'] = ticker.change_from_open
                    if hasattr(ticker, 'change_from_open_percent'):
                        ticker_dict['change_from_open_percent'] = ticker.change_from_open_percent
                except Exception as market_attr_error:
                    # Handle errors when accessing market data attributes
                    logger.warning(f"Error accessing market data attributes for ticker {ticker.id}: {str(market_attr_error)}")
                    
                tickers_data.append(ticker_dict)
            except Exception as ticker_error:
                # Handle errors when converting ticker to dict
                logger.warning(f"Error converting ticker {ticker.id if hasattr(ticker, 'id') else 'unknown'} to dict: {str(ticker_error)}")
                # Add minimal ticker data to prevent complete failure
                try:
                    minimal_dict = {'id': ticker.id if hasattr(ticker, 'id') else None}
                    tickers_data.append(minimal_dict)
                except:
                    pass  # Skip this ticker if we can't even get its ID
        
        return jsonify({
            "status": "success",
            "data": tickers_data,
            "count": len(tickers_data),
            "version": "1.0"
        }), 200
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error getting tickers: {str(e)}\nTraceback:\n{error_trace}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to retrieve tickers: {str(e)}"},
            "version": "1.0"
        }), 500

@tickers_bp.route('/my', methods=['GET'])
@handle_database_session()
@api_endpoint(cache_ttl=60, rate_limit=60)
def get_my_tickers():
    """Get tickers for the current authenticated user"""
    from .base_entity_decorators import require_authentication
    
    db: Session = g.db
    user_id = getattr(g, 'user_id', None)
    
    if not user_id:
        return jsonify({
            "status": "error",
            "error": {"message": "Authentication required"},
            "version": "1.0"
        }), 401
    
    try:
        tickers = TickerService.get_user_tickers(db, user_id)
        
        # Convert tickers to dict with market data
        tickers_data = []
        for ticker in tickers:
            try:
                ticker_dict = ticker.to_dict()
                
                # Add custom fields from user_ticker association
                if hasattr(ticker, 'name_custom'):
                    ticker_dict['name_custom'] = ticker.name_custom
                if hasattr(ticker, 'type_custom'):
                    ticker_dict['type_custom'] = ticker.type_custom
                if hasattr(ticker, 'user_ticker_status'):
                    ticker_dict['user_ticker_status'] = ticker.user_ticker_status
                
                # Add market data fields if they exist
                try:
                    if hasattr(ticker, 'current_price'):
                        ticker_dict['current_price'] = ticker.current_price
                    if hasattr(ticker, 'change_percent'):
                        ticker_dict['change_percent'] = ticker.change_percent
                    if hasattr(ticker, 'change_amount'):
                        ticker_dict['change_amount'] = ticker.change_amount
                    if hasattr(ticker, 'volume'):
                        ticker_dict['volume'] = ticker.volume
                    if hasattr(ticker, 'yahoo_updated_at'):
                        ticker_dict['yahoo_updated_at'] = ticker.yahoo_updated_at.isoformat() if ticker.yahoo_updated_at else None
                    if hasattr(ticker, 'data_source'):
                        ticker_dict['data_source'] = ticker.data_source
                    if hasattr(ticker, 'open_price'):
                        ticker_dict['open_price'] = ticker.open_price
                    if hasattr(ticker, 'change_from_open'):
                        ticker_dict['change_from_open'] = ticker.change_from_open
                    if hasattr(ticker, 'change_from_open_percent'):
                        ticker_dict['change_from_open_percent'] = ticker.change_from_open_percent
                except Exception as market_attr_error:
                    logger.warning(f"Error accessing market data attributes for ticker {ticker.id}: {str(market_attr_error)}")
                    
                tickers_data.append(ticker_dict)
            except Exception as ticker_error:
                logger.warning(f"Error converting ticker {ticker.id if hasattr(ticker, 'id') else 'unknown'} to dict: {str(ticker_error)}")
        
        return jsonify({
            "status": "success",
            "data": tickers_data,
            "message": "User tickers retrieved successfully",
            "version": "1.0"
        })
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error getting user tickers: {str(e)}\nTraceback:\n{error_trace}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to retrieve user tickers: {str(e)}"},
            "version": "1.0"
        }), 500

@tickers_bp.route('/with-initial-data', methods=['GET'])
@handle_database_session()
@api_endpoint(cache_ttl=300, rate_limit=60)
def get_tickers_with_initial_data():
    """Get user tickers that have initial market data (latest_quote) - optimized for widgets"""
    db: Session = g.db
    user_id = _resolve_user_id()
    
    try:
        from models.user_ticker import UserTicker
        from models.external_data import MarketDataQuote
        from models.ticker import Ticker
        from sqlalchemy import func, and_
        from sqlalchemy.orm import joinedload
        
        # Get user tickers with latest_quote efficiently using subquery
        # First, get all ticker_ids that have market data
        ticker_ids_with_data = db.query(MarketDataQuote.ticker_id).distinct().subquery()
        
        # Get user tickers that have market data in a single optimized query
        tickers_with_data = db.query(Ticker).join(
            UserTicker, Ticker.id == UserTicker.ticker_id
        ).join(
            ticker_ids_with_data, Ticker.id == ticker_ids_with_data.c.ticker_id
        ).filter(
            UserTicker.user_id == user_id,
            UserTicker.status == 'open'
        ).options(
            joinedload(Ticker.user_tickers)
        ).all()
        
        if not tickers_with_data:
            return jsonify({
                "status": "success",
                "data": [],
                "message": "No tickers with initial data found",
                "version": "1.0"
            })
        
        # Get latest quotes for all tickers in a single query (batch)
        ticker_ids = [t.id for t in tickers_with_data]
        
        # Use window function or subquery to get latest quote per ticker efficiently
        from sqlalchemy import desc
        
        # Get latest quote for each ticker using a more efficient approach
        latest_quotes_subq = db.query(
            MarketDataQuote.ticker_id,
            func.max(MarketDataQuote.fetched_at).label('max_fetched_at')
        ).filter(
            MarketDataQuote.ticker_id.in_(ticker_ids)
        ).group_by(MarketDataQuote.ticker_id).subquery()
        
        latest_quotes = db.query(MarketDataQuote).join(
            latest_quotes_subq,
            and_(
                MarketDataQuote.ticker_id == latest_quotes_subq.c.ticker_id,
                MarketDataQuote.fetched_at == latest_quotes_subq.c.max_fetched_at
            )
        ).all()
        
        # Create a map of ticker_id -> latest_quote for quick lookup
        quotes_map = {q.ticker_id: q for q in latest_quotes}
        
        # Build response with market data
        result = []
        for ticker in tickers_with_data:
            quote = quotes_map.get(ticker.id)
            if quote:
                # Get custom fields from user_ticker association
                name_custom = None
                type_custom = None
                if hasattr(ticker, 'user_tickers') and ticker.user_tickers:
                    for ut in ticker.user_tickers:
                        if ut.user_id == user_id:
                            name_custom = ut.name_custom
                            type_custom = ut.type_custom
                            break
                
                result.append({
                    'id': ticker.id,
                    'symbol': ticker.symbol,
                    'name': ticker.name,
                    'name_custom': name_custom,
                    'type_custom': type_custom,
                    'current_price': float(quote.price) if quote.price else None,
                    'change_percent': float(quote.change_pct_day) if quote.change_pct_day is not None else None,
                    'change_amount': float(quote.change_amount_day) if quote.change_amount_day is not None else None,
                    'volume': int(quote.volume) if quote.volume else None,
                    'has_data': True,
                    'fetched_at': quote.fetched_at.isoformat() if quote.fetched_at else None,
                    'asof_utc': quote.asof_utc.isoformat() if quote.asof_utc else None
                })
        
        # Sort by symbol for consistent ordering
        result.sort(key=lambda x: x['symbol'] or '')
        
        return jsonify({
            "status": "success",
            "data": result,
            "message": f"Found {len(result)} tickers with initial data",
            "version": "1.0"
        })
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error getting tickers with initial data: {str(e)}\nTraceback:\n{error_trace}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to retrieve tickers with initial data: {str(e)}"},
            "version": "1.0"
        }), 500

@tickers_bp.route('/with-trade-counts', methods=['GET'])
@handle_database_session()
def get_tickers_with_trade_counts():
    """
    Get all tickers with the count of associated trades.
    
    Returns:
        JSON response with a list of tickers, each including a 'trade_count' field.
    """
    db: Session = g.db
    user_id = _resolve_user_id()
    normalizer = _get_tickers_normalizer()

    try:
        # Get all tickers (TickerService.get_all doesn't take user_id)
        tickers = TickerService.get_all(db)
        tickers_with_counts = []
        for ticker in tickers:
            ticker_dict = ticker.to_dict()
            # Filter by user_id if ticker has user_id field, or get trade count for user
            trade_count = TradeService.get_trade_count_for_ticker(db, ticker.id, user_id)
            ticker_dict['trade_count'] = trade_count
            tickers_with_counts.append(ticker_dict)
        
        payload = BaseEntityUtils.create_success_payload(normalizer, data=tickers_with_counts)
        return jsonify(payload), 200
    except Exception as e:
        logger.error(f"Error getting tickers with trade counts: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(normalizer, f"Error retrieving tickers with trade counts: {str(e)}")
        return jsonify(error_payload), 500

@tickers_bp.route('/<int:ticker_id>', methods=['GET'])
@handle_database_session()
def get_ticker(ticker_id: int):
    """Get ticker by ID with market data"""
    db: Session = g.db
    try:
        ticker = TickerService.get_by_id(db, ticker_id)
        if ticker:
            # Add market data like in get_all method
            ticker_dict = ticker.to_dict()
            
            # Add provider symbol mappings if they exist
            try:
                from services.ticker_symbol_mapping_service import TickerSymbolMappingService
                logger.info(f"🔍 Attempting to load provider symbol mappings for ticker {ticker_id}")
                mappings = TickerSymbolMappingService.get_all_mappings(db, ticker_id)
                logger.info(f"🔍 get_all_mappings returned {len(mappings) if mappings else 0} mappings")
                if mappings:
                    ticker_dict['provider_symbols'] = mappings
                    logger.info(f"✅ Loaded {len(mappings)} provider symbol mapping(s) for ticker {ticker_id}")
                else:
                    logger.info(f"⚠️ No provider symbol mappings found for ticker {ticker_id}")
            except Exception as mapping_error:
                # Log but don't fail - mappings are optional
                logger.error(f"❌ Could not load provider symbol mappings for ticker {ticker_id}: {str(mapping_error)}")
                import traceback
                logger.error(f"Traceback: {traceback.format_exc()}")
            
            # Try to get market data, but don't fail if database is corrupted
            try:
                from models.external_data import MarketDataQuote
                latest_quote = db.query(MarketDataQuote).filter(
                    MarketDataQuote.ticker_id == ticker.id
                ).order_by(MarketDataQuote.fetched_at.desc()).first()
                
                if latest_quote:
                    ticker_dict['current_price'] = latest_quote.price
                    ticker_dict['change_percent'] = latest_quote.change_pct_day
                    ticker_dict['change_amount'] = latest_quote.change_amount_day
                    ticker_dict['volume'] = latest_quote.volume
                    ticker_dict['yahoo_updated_at'] = latest_quote.fetched_at.isoformat() if latest_quote.fetched_at else None
                    ticker_dict['data_source'] = latest_quote.source
            except Exception as market_data_error:
                # Log but don't fail - market data is optional
                logger.warning(f"Could not load market data for ticker {ticker_id}: {str(market_data_error)}")
                # Continue without market data
            
            return jsonify({
                "status": "success",
                "data": ticker_dict,
                "message": "Ticker retrieved successfully",
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Ticker not found"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error getting ticker {ticker_id}: {str(e)}")
        # Check if it's a database corruption error
        error_msg = str(e).lower()
        if 'database disk image is malformed' in error_msg or 'malformed' in error_msg:
            return jsonify({
                "status": "error",
                "error": {"message": "Database corruption detected. Please contact support."},
                "version": "1.0"
            }), 500
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve ticker"},
            "version": "1.0"
        }), 500

@tickers_bp.route('/<int:ticker_id>/linked-items', methods=['GET'])
def check_linked_items(ticker_id: int):
    """Check linked items to ticker before deletion"""
    try:
        print(f"Starting check_linked_items for ticker {ticker_id}")
        db: Session = next(get_db())
        normalizer = _get_tickers_normalizer()
        
        # Check that ticker exists
        ticker = TickerService.get_by_id(db, ticker_id)
        if not ticker:
            return jsonify({
                "status": "error",
                "error": {"message": "Ticker not found"},
                "timestamp": normalizer.now_envelope(),
                "version": "1.0"
            }), 404
        
        print(f"Ticker found: {ticker.symbol}")
        
        # Check linked items using the generic function
        try:
            print(f"About to call check_linked_items_generic for ticker {ticker_id}")
            linked_items = TickerService.check_linked_items_generic(db, 'ticker', ticker_id)
            print(f"Successfully called check_linked_items_generic, result: {linked_items}")
            
            # Normalize dates in linked_items
            normalized_linked_items = normalizer.normalize_output(linked_items)
        except Exception as e:
            logger.error(f"Error in check_linked_items_generic: {str(e)}")
            print(f"Error in check_linked_items_generic: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({
                "status": "error",
                "error": {"message": f"Failed to check linked items: {str(e)}"},
                "timestamp": normalizer.now_envelope(),
                "version": "1.0"
            }), 500
        
        return jsonify({
            "status": "success",
            "data": normalized_linked_items,
            "message": "Linked items check completed",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error checking linked items for ticker {ticker_id}: {str(e)}")
        print(f"Main error checking linked items for ticker {ticker_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        normalizer = _get_tickers_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to check linked items"},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 500
    finally:
        db.close()

@tickers_bp.route('/', methods=['POST'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['tickers', 'dashboard'])  # Invalidate cache after creating ticker
def create_ticker():
    """Create new ticker"""
    try:
        data = request.get_json()
        if data is None:
            return jsonify({
                "status": "error",
                "error": {"message": "Invalid JSON data"},
                "version": "1.0"
            }), 400
        
        # Use the session from the decorator (in g.db)
        db: Session = g.db
        user_id = getattr(g, 'user_id', None)
        
        if not user_id:
            return jsonify({
                "status": "error",
                "error": {"message": "User ID required"},
                "version": "1.0"
            }), 400
        
        # Extract custom fields and provider_symbols
        name_custom = data.pop('name_custom', None)
        type_custom = data.pop('type_custom', None)
        provider_symbols = data.pop('provider_symbols', None)
        
        # Check if ticker already exists
        from models.ticker import Ticker
        from models.user_ticker import UserTicker
        
        existing_ticker = db.query(Ticker).filter(
            Ticker.symbol == data.get('symbol')
        ).first()
        
        if existing_ticker:
            # Check if user already has this ticker
            existing_association = db.query(UserTicker).filter(
                UserTicker.user_id == user_id,
                UserTicker.ticker_id == existing_ticker.id
            ).first()
            
            if existing_association:
                return jsonify({
                    "status": "error",
                    "error": {"message": "טיקר זה כבר נמצא ברשימה שלך"},
                    "version": "1.0"
                }), 400
            
            # Create association with custom fields
            from datetime import datetime, timezone
            user_ticker = UserTicker(
                user_id=user_id,
                ticker_id=existing_ticker.id,
                name_custom=name_custom,
                type_custom=type_custom,
                status='open',
                created_at=datetime.now(timezone.utc)  # Explicitly set created_at
            )
            db.add(user_ticker)
            db.flush()  # Flush to get ID and check for errors, but don't commit yet
            # Let the decorator handle the commit
            ticker = existing_ticker
        else:
            # Create new ticker
            try:
                ticker = TickerService.create(db, data)
            except Exception as e:
                error_msg = str(e)
                if "UNIQUE constraint failed" in error_msg and "tickers.symbol" in error_msg:
                    return jsonify({
                        "status": "error",
                        "error": {"message": f"טיקר עם סמל '{data.get('symbol', '')}' כבר קיים במערכת"},
                        "version": "1.0"
                    }), 400
                else:
                    return jsonify({
                        "status": "error",
                        "error": {"message": f"שגיאה ביצירת טיקר: {error_msg}"},
                        "version": "1.0"
                    }), 400
            
            # Create association with custom fields
            try:
                from datetime import datetime, timezone
                user_ticker = UserTicker(
                    user_id=user_id,
                    ticker_id=ticker.id,
                    name_custom=name_custom,
                    type_custom=type_custom,
                    status='open',
                    created_at=datetime.now(timezone.utc)  # Explicitly set created_at
                )
                db.add(user_ticker)
                db.flush()  # Flush to get ID and check for errors, but don't commit yet
                # Let the decorator handle the commit
            except Exception as e:
                db.rollback()
                error_msg = str(e)
                logger.error(f"Error creating user_ticker association: {error_msg}")
                import traceback
                logger.error(f"Full traceback: {traceback.format_exc()}")
                # Try to delete the ticker we just created if association fails
                try:
                    db.delete(ticker)
                    db.flush()
                except Exception as del_error:
                    logger.error(f"Error deleting ticker after association failure: {del_error}")
                return jsonify({
                    "status": "error",
                    "error": {"message": f"שגיאה ביצירת קישור טיקר למשתמש: {error_msg}"},
                    "version": "1.0"
                }), 500
            
            # Update ticker status
            try:
                TickerService.update_ticker_status_auto(db, ticker.id)
            except Exception as e:
                logger.warning(f"Could not update ticker status after creation: {e}")
        
        # Create provider symbol mappings if provided
        if provider_symbols and isinstance(provider_symbols, dict):
            try:
                from services.ticker_symbol_mapping_service import TickerSymbolMappingService
                from models.external_data import ExternalDataProvider
                
                for provider_name, provider_symbol in provider_symbols.items():
                    if provider_symbol and isinstance(provider_symbol, str):
                        provider = db.query(ExternalDataProvider).filter(
                            ExternalDataProvider.name == provider_name
                        ).first()
                        
                        if provider:
                            TickerSymbolMappingService.set_provider_symbol(
                                db,
                                ticker.id,
                                provider.id,
                                provider_symbol.strip(),
                                is_primary=True
                            )
                            logger.info(
                                f"Created provider symbol mapping for ticker {ticker.symbol} (ID: {ticker.id}): "
                                f"{provider_name} -> {provider_symbol}"
                            )
                        else:
                            logger.warning(f"Provider '{provider_name}' not found - skipping mapping")
            except Exception as e:
                logger.warning(f"Failed to create provider symbol mappings: {e}")
                # Don't fail ticker creation if mapping fails
        
        # AFTER creating the ticker, try to fetch and cache external data
        external_data_available = False
        external_data_error = None
        quote_data = None
        
        try:
            from services.external_data.yahoo_finance_adapter import YahooFinanceAdapter
            from models.external_data import ExternalDataProvider
            
            # Get or create Yahoo Finance provider
            provider = db.query(ExternalDataProvider).filter(
                ExternalDataProvider.name == 'yahoo_finance'
            ).first()
            
            if not provider:
                # Create provider if it doesn't exist
                provider = ExternalDataProvider(
                    name='yahoo_finance',
                    display_name='Yahoo Finance',
                    is_active=True,
                    provider_type='finance',
                    base_url='https://query1.finance.yahoo.com',
                    rate_limit_per_hour=900,
                    timeout_seconds=20
                )
                db.add(provider)
                db.commit()
                db.refresh(provider)
            
            # Initialize adapter with database session
            yahoo_adapter = YahooFinanceAdapter(db, provider.id)
            
            # Now try to get and cache quote for the newly created ticker
            # Use ticker object to enable provider symbol mapping
            quote_data = yahoo_adapter.get_quote(ticker.symbol, ticker=ticker)
            if quote_data and quote_data.price:
                external_data_available = True
                logger.info(f"✅ External data fetched and cached for new ticker {data['symbol']}: ${quote_data.price}")
            else:
                external_data_error = "No external data available for this symbol"
                logger.warning(f"⚠️ No external data available for new ticker {data['symbol']}")
        except Exception as e:
            external_data_error = f"Failed to fetch external data: {str(e)}"
            logger.warning(f"⚠️ Failed to fetch external data for new ticker {data['symbol']}: {e}")
        
        # CACHE DISABLED - No need to clear cache
        
        # Prepare response with external data status
        response_data = {
            "status": "success",
            "data": ticker.to_dict(),
            "message": "Ticker created successfully",
            "external_data": {
                "available": external_data_available,
                "error": external_data_error,
                "quote": {
                    "price": quote_data.price if quote_data else None,
                    "currency": quote_data.currency if quote_data else None,
                    "volume": quote_data.volume if quote_data else None
                } if quote_data else None
            },
            "version": "1.0"
        }
        
        return jsonify(response_data), 201
    except Exception as e:
        logger.error(f"Error creating ticker: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    # Don't close db here - handle_database_session decorator will do it

@tickers_bp.route('/<int:ticker_id>', methods=['PUT'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['tickers', 'dashboard'])  # Invalidate cache after updating ticker
def update_ticker(ticker_id: int):
    """Update ticker"""
    try:
        data = request.get_json()
        if data is None:
            return jsonify({
                "status": "error",
                "error": {"message": "Invalid JSON data"},
                "version": "1.0"
            }), 400
        
        # Use the session from the decorator (in g.db)
        db: Session = g.db
        
        # Check that ticker exists
        ticker = TickerService.get_by_id(db, ticker_id)
        if not ticker:
            return jsonify({
                "status": "error",
                "error": {"message": "Ticker not found"},
                "version": "1.0"
            }), 404
        
        # Check active_trades constraint - prevent cancellation if ticker has active trades
        if 'status' in data and data['status'] == 'cancelled':
            # Check both active_trades field and actual open trades
            from models.trade import Trade
            from models.trade_plan import TradePlan
            
            # Check actual open trades
            open_trades_count = db.query(Trade).filter(
                Trade.ticker_id == ticker_id,
                Trade.status == 'open'
            ).count()
            
            # Check actual open trade plans
            open_plans_count = db.query(TradePlan).filter(
                TradePlan.ticker_id == ticker_id,
                TradePlan.status == 'open'
            ).count()
            
            if ticker.active_trades or open_trades_count > 0 or open_plans_count > 0:
                return jsonify({
                    "status": "error",
                    "error": {"message": "Cannot cancel ticker with active trades. Please close all open trades first."},
                    "version": "1.0"
                }), 400
        
        # Extract custom fields and provider_symbols
        name_custom = data.pop('name_custom', None)
        type_custom = data.pop('type_custom', None)
        provider_symbols = data.pop('provider_symbols', None)
        
        user_id = getattr(g, 'user_id', None)
        
        # Update custom fields in user_tickers if provided
        if user_id and (name_custom is not None or type_custom is not None):
            from models.user_ticker import UserTicker
            user_ticker = db.query(UserTicker).filter(
                UserTicker.user_id == user_id,
                UserTicker.ticker_id == ticker_id
            ).first()
            
            if user_ticker:
                if name_custom is not None:
                    user_ticker.name_custom = name_custom
                if type_custom is not None:
                    user_ticker.type_custom = type_custom
                db.flush()  # Use flush instead of commit - let the decorator handle the commit
        
        # Update ticker (only general fields - custom fields updated above)
        # Only admin can update general ticker fields
        # For now, allow update but in future add admin check
        ticker = TickerService.update(db, ticker_id, data)
        if ticker:
            # Update provider symbol mappings if provided
            if provider_symbols is not None:
                try:
                    from services.ticker_symbol_mapping_service import TickerSymbolMappingService
                    from models.external_data import ExternalDataProvider
                    
                    if isinstance(provider_symbols, dict):
                        # Update/create mappings
                        for provider_name, provider_symbol in provider_symbols.items():
                            if provider_symbol and isinstance(provider_symbol, str):
                                provider = db.query(ExternalDataProvider).filter(
                                    ExternalDataProvider.name == provider_name
                                ).first()
                                
                                if provider:
                                    TickerSymbolMappingService.set_provider_symbol(
                                        db,
                                        ticker.id,
                                        provider.id,
                                        provider_symbol.strip(),
                                        is_primary=True
                                    )
                                    logger.info(
                                        f"Updated provider symbol mapping for ticker {ticker.symbol} (ID: {ticker.id}): "
                                        f"{provider_name} -> {provider_symbol}"
                                    )
                                else:
                                    logger.warning(f"Provider '{provider_name}' not found - skipping mapping")
                    elif provider_symbols == {}:
                        # Empty dict means delete all mappings (optional - not implemented for safety)
                        logger.debug("Empty provider_symbols dict provided - no mappings deleted (safety)")
                except Exception as e:
                    logger.warning(f"Failed to update provider symbol mappings: {e}")
                    # Don't fail ticker update if mapping fails
            return jsonify({
                "status": "success",
                "data": ticker.to_dict(),
                "message": "Ticker updated successfully",
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Ticker not found"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error updating ticker {ticker_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    # Don't close db here - handle_database_session decorator will do it

@tickers_bp.route('/<int:ticker_id>/provider-symbols', methods=['GET'])
@handle_database_session(auto_commit=False, auto_close=True)
def get_ticker_provider_symbols(ticker_id: int):
    """Get all provider symbol mappings for a ticker"""
    try:
        # Use the session from the decorator (in g.db)
        db: Session = g.db
        
        # Check that ticker exists
        ticker = TickerService.get_by_id(db, ticker_id)
        if not ticker:
            return jsonify({
                "status": "error",
                "error": {"message": "Ticker not found"},
                "version": "1.0"
            }), 404
        
        # Get all mappings
        from services.ticker_symbol_mapping_service import TickerSymbolMappingService
        mappings = TickerSymbolMappingService.get_all_mappings(db, ticker_id)
        
        return jsonify({
            "status": "success",
            "data": mappings,
            "message": f"Retrieved {len(mappings)} provider symbol mappings",
            "version": "1.0"
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting provider symbols for ticker {ticker_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 500

@tickers_bp.route('/<int:ticker_id>', methods=['DELETE'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['tickers', 'dashboard'])  # Invalidate cache after deleting ticker
def delete_ticker(ticker_id: int):
    """Cancel user-ticker association (user cancels their association, not delete ticker)"""
    try:
        # Use the session from the decorator (in g.db)
        db: Session = g.db
        user_id = getattr(g, 'user_id', None)
        
        if not user_id:
            return jsonify({
                "status": "error",
                "error": {"message": "User ID required"},
                "version": "1.0"
            }), 400
        
        # Check that ticker exists
        ticker = TickerService.get_by_id(db, ticker_id)
        if not ticker:
            return jsonify({
                "status": "error",
                "error": {"message": "Ticker not found"},
                "version": "1.0"
            }), 404
        
        # Cancel user-ticker association (not delete ticker)
        from models.user_ticker import UserTicker
        user_ticker = db.query(UserTicker).filter(
            UserTicker.user_id == user_id,
            UserTicker.ticker_id == ticker_id
        ).first()
        
        if not user_ticker:
            return jsonify({
                "status": "error",
                "error": {"message": "Ticker not in your list"},
                "version": "1.0"
            }), 404
        
        # Update status to cancelled
        user_ticker.status = 'cancelled'
        db.commit()
        
        # Update ticker overall status
        try:
            TickerService.update_ticker_status_auto(db, ticker_id)
        except Exception as e:
            logger.warning(f"Could not update ticker status after cancelling association: {e}")
        
        # CACHE DISABLED - No need to clear cache
        
        # Prepare response
        response_data = {
            "status": "success",
            "message": "Ticker removed from your list",
            "version": "1.0"
        }
        
        return jsonify(response_data)
    except Exception as e:
        logger.error(f"Error deleting ticker {ticker_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 500
    # Don't close db here - handle_database_session decorator will do it

@tickers_bp.route('/<int:ticker_id>/update-active-trades', methods=['PUT'])
def update_active_trades(ticker_id: int):
    """Update only the active_trades field for a ticker"""
    try:
        db: Session = next(get_db())
        normalizer = _get_tickers_normalizer()
        ticker = TickerService.get_by_id(db, ticker_id)
        
        if not ticker:
            return jsonify({
                "status": "error",
                "error": {"message": "Ticker not found"},
                "timestamp": normalizer.now_envelope(),
                "version": "1.0"
            }), 404
        
        # Check if there are active plans or trades for this ticker
        from models.trade import Trade
        from models.trade_plan import TradePlan
        
        # Check active trades
        active_trades = db.query(Trade).filter(
            Trade.ticker_id == ticker_id,
            Trade.status == 'open'
        ).count()
        
        # Check active trade plans
        active_plans = db.query(TradePlan).filter(
            TradePlan.ticker_id == ticker_id,
            TradePlan.status == 'open'
        ).count()
        
        # Update active_trades field
        ticker.active_trades = (active_trades > 0 or active_plans > 0)
        db.commit()
        
        logger.info(f"Updated active_trades for ticker {ticker_id} to {ticker.active_trades} (trades: {active_trades}, plans: {active_plans})")
        
        # Normalize dates in ticker dict
        ticker_dict = normalizer.normalize_output(ticker.to_dict())
        
        return jsonify({
            "status": "success",
            "data": ticker_dict,
            "message": "Active trades field updated successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        })
        
    except Exception as e:
        logger.error(f"Error updating active_trades for ticker {ticker_id}: {str(e)}")
        normalizer = _get_tickers_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 500
    finally:
        db.close()

@tickers_bp.route('/update-all-active-trades', methods=['POST'])
@invalidate_cache(['tickers', 'dashboard'])  # Invalidate cache after updating all active trades
def update_all_active_trades():
    """Update active_trades field for all tickers based on open trades and plans"""
    try:
        db: Session = next(get_db())
        
        # Get all tickers
        tickers = TickerService.get_all(db)
        
        updated_count = 0
        
        for ticker in tickers:
            # Check active trades
            from models.trade import Trade
            from models.trade_plan import TradePlan
            
            active_trades = db.query(Trade).filter(
                Trade.ticker_id == ticker.id,
                Trade.status == 'open'
            ).count()
            
            # Check active trade plans
            active_plans = db.query(TradePlan).filter(
                TradePlan.ticker_id == ticker.id,
                TradePlan.status == 'open'
            ).count()
            
            # Update active_trades field
            new_active_trades = (active_trades > 0 or active_plans > 0)
            
            if ticker.active_trades != new_active_trades:
                ticker.active_trades = new_active_trades
                updated_count += 1
                logger.info(f"Updated ticker {ticker.symbol}: active_trades = {new_active_trades} (trades: {active_trades}, plans: {active_plans})")
        
        db.commit()
        
        logger.info(f"Updated active_trades for {updated_count} tickers")
        
        return jsonify({
            "status": "success",
            "data": {
                "updated_count": updated_count,
                "total_tickers": len(tickers)
            },
            "message": f"Updated active_trades for {updated_count} tickers",
            "version": "1.0"
        })
        
    except Exception as e:
        logger.error(f"Error updating all active_trades: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@tickers_bp.route('/<int:ticker_id>/update-status-auto', methods=['PUT'])
def update_ticker_status_auto(ticker_id: int):
    """Update ticker status automatically based on linked trades and trade plans"""
    try:
        db: Session = next(get_db())
        normalizer = _get_tickers_normalizer()
        
        # Check that ticker exists
        ticker = TickerService.get_by_id(db, ticker_id)
        if not ticker:
            return jsonify({
                "status": "error",
                "error": {"message": "Ticker not found"},
                "timestamp": normalizer.now_envelope(),
                "version": "1.0"
            }), 404
        
        # Update ticker status automatically
        success = TickerService.update_ticker_status_auto(db, ticker_id)
        if success:
            # Get updated ticker
            updated_ticker = TickerService.get_by_id(db, ticker_id)
            # Normalize dates in ticker dict
            ticker_dict = normalizer.normalize_output(updated_ticker.to_dict())
            return jsonify({
                "status": "success",
                "data": ticker_dict,
                "message": "Ticker status updated automatically",
                "timestamp": normalizer.now_envelope(),
                "version": "1.0"
            })
        else:
            return jsonify({
                "status": "error",
                "error": {"message": "Failed to update ticker status"},
                "timestamp": normalizer.now_envelope(),
                "version": "1.0"
            }), 500
        
    except Exception as e:
        logger.error(f"Error updating ticker status auto {ticker_id}: {str(e)}")
        normalizer = _get_tickers_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 500
    finally:
        db.close()

@tickers_bp.route('/update-all-statuses-auto', methods=['POST'])
@invalidate_cache(['tickers', 'dashboard'])  # Invalidate cache after updating all statuses
def update_all_statuses_auto():
    """Update status for all non-cancelled tickers automatically"""
    try:
        db: Session = next(get_db())
        
        # Update all ticker statuses automatically
        updated_count = TickerService.update_all_ticker_statuses_auto(db)
        
        # Get updated tickers for response
        tickers = TickerService.get_all(db)
        
        return jsonify({
            "status": "success",
            "data": {
                "updated_count": updated_count,
                "total_tickers": len(tickers),
                "tickers": [ticker.to_dict() for ticker in tickers]
            },
            "message": f"Updated status for {updated_count} tickers automatically",
            "version": "1.0"
        })
        
    except Exception as e:
        logger.error(f"Error updating all ticker statuses auto: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@tickers_bp.route('/<int:ticker_id>/cancel', methods=['POST'])
@invalidate_cache(['tickers', 'dashboard'])  # Invalidate cache after cancelling ticker
def cancel_ticker(ticker_id: int):
    """Cancel ticker"""
    db = None
    try:
        data = request.get_json() if request.is_json else {}
        cancel_reason = data.get('cancel_reason', 'Cancelled by user')
        db: Session = next(get_db())
        
        # Check that ticker exists
        ticker = TickerService.get_by_id(db, ticker_id)
        if not ticker:
            return jsonify({
                "status": "error",
                "error": {"message": "Ticker not found"},
                "version": "1.0"
            }), 404
        
        # Check if ticker is already cancelled
        if ticker.status == 'cancelled':
            return jsonify({
                "status": "error",
                "error": {"message": "Ticker is already cancelled"},
                "version": "1.0"
            }), 400
        
        # Check active_trades constraint - prevent cancellation if ticker has active trades
        from models.trade import Trade
        from models.trade_plan import TradePlan
        
        # Check actual open trades
        open_trades_count = db.query(Trade).filter(
            Trade.ticker_id == ticker_id,
            Trade.status == 'open'
        ).count()
        
        # Check actual open trade plans
        open_plans_count = db.query(TradePlan).filter(
            TradePlan.ticker_id == ticker_id,
            TradePlan.status == 'open'
        ).count()
        
        if ticker.active_trades or open_trades_count > 0 or open_plans_count > 0:
            return jsonify({
                "status": "error",
                "error": {"message": "Cannot cancel ticker with active trades. Please close all open trades first."},
                "version": "1.0"
            }), 400
        
        # Update ticker status to cancelled
        success = TickerService.update(db, ticker_id, {
            'status': 'cancelled'
        })
        
        if success:
            # Get updated ticker
            updated_ticker = TickerService.get_by_id(db, ticker_id)
            return jsonify({
                "status": "success",
                "data": updated_ticker.to_dict(),
                "message": "Ticker cancelled successfully",
                "version": "1.0"
            })
        else:
            return jsonify({
                "status": "error",
                "error": {"message": "Failed to cancel ticker"},
                "version": "1.0"
            }), 500
        
    except Exception as e:
        logger.error(f"Error cancelling ticker {ticker_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    finally:
        if db:
            db.close()

# Endpoint removed - status updates automatically now

@tickers_bp.route('/<int:ticker_id>/add-to-user', methods=['POST'])
@handle_database_session()
@api_endpoint(cache_ttl=0, rate_limit=30)
def add_ticker_to_user(ticker_id: int):
    """Add a ticker to the current user's list"""
    db: Session = g.db
    user_id = getattr(g, 'user_id', None)
    
    if not user_id:
        return jsonify({
            "status": "error",
            "error": {"message": "Authentication required"},
            "version": "1.0"
        }), 401
    
    try:
        success = TickerService.add_ticker_to_user(db, user_id, ticker_id)
        
        if success:
            return jsonify({
                "status": "success",
                "data": {
                    "ticker_id": ticker_id,
                    "user_id": user_id
                },
                "message": "Ticker added to user list successfully",
                "version": "1.0"
            }), 200
        else:
            return jsonify({
                "status": "error",
                "error": {"message": "Ticker already in user list or ticker not found"},
                "version": "1.0"
            }), 400
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error adding ticker to user: {str(e)}\nTraceback:\n{error_trace}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to add ticker to user: {str(e)}"},
            "version": "1.0"
        }), 500

@tickers_bp.route('/<int:ticker_id>/admin-delete', methods=['DELETE'])
@handle_database_session()
@api_endpoint(cache_ttl=0, rate_limit=30)
def admin_delete_ticker(ticker_id: int):
    """Admin-only: Delete ticker from main table"""
    db: Session = g.db
    user_id = getattr(g, 'user_id', None)
    
    if not user_id:
        return jsonify({
            "status": "error",
            "error": {"message": "Authentication required"},
            "version": "1.0"
        }), 401
    
    # Check admin permissions (user_id == 1 is admin, or check role if exists)
    from models.user import User
    user = db.query(User).filter(User.id == user_id).first()
    if not user or (user_id != 1 and not (hasattr(user, 'role') and user.role == 'admin')):
        return jsonify({
            "status": "error",
            "error": {"message": "Admin access required"},
            "version": "1.0"
        }), 403
    
    try:
        # Check for active associations
        from models.user_ticker import UserTicker
        active_associations = db.query(UserTicker).filter(
            UserTicker.ticker_id == ticker_id,
            UserTicker.status == 'open'
        ).count()
        
        if active_associations > 0:
            return jsonify({
                "status": "error",
                "error": {"message": f"Cannot delete: {active_associations} active user associations"},
                "version": "1.0"
            }), 400
        
        # Delete all associations
        db.query(UserTicker).filter(UserTicker.ticker_id == ticker_id).delete()
        
        # Delete ticker (cascade will handle related data)
        ticker = TickerService.get_by_id(db, ticker_id)
        if ticker:
            success = TickerService.delete(db, ticker_id)
            if success:
                return jsonify({
                    "status": "success",
                    "message": "Ticker deleted successfully",
                    "version": "1.0"
                })
        
        return jsonify({
            "status": "error",
            "error": {"message": "Ticker not found"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error deleting ticker {ticker_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 500

@tickers_bp.route('/<int:ticker_id>/remove-from-user', methods=['DELETE'])
@handle_database_session()
@api_endpoint(cache_ttl=0, rate_limit=30)
def remove_ticker_from_user(ticker_id: int):
    """Remove a ticker from the current user's list"""
    db: Session = g.db
    user_id = getattr(g, 'user_id', None)
    
    if not user_id:
        return jsonify({
            "status": "error",
            "error": {"message": "Authentication required"},
            "version": "1.0"
        }), 401
    
    try:
        success = TickerService.remove_ticker_from_user(db, user_id, ticker_id)
        
        if success:
            return jsonify({
                "status": "success",
                "data": {
                    "ticker_id": ticker_id,
                    "user_id": user_id
                },
                "message": "Ticker removed from user list successfully",
                "version": "1.0"
            }), 200
        else:
            return jsonify({
                "status": "error",
                "error": {"message": "Ticker not found in user list"},
                "version": "1.0"
            }), 404
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error removing ticker from user: {str(e)}\nTraceback:\n{error_trace}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to remove ticker from user: {str(e)}"},
            "version": "1.0"
        }), 500
