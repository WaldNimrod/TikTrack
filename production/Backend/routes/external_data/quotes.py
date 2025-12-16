"""
# pyright: reportGeneralTypeIssues=false
Quotes API Routes - External Data Integration
API endpoints for quote operations
"""

from flask import Blueprint, request, jsonify, g
from datetime import datetime, timezone, timedelta
import logging

from models.ticker import Ticker
from models.external_data import MarketDataQuote, ExternalDataProvider
from config.database import get_db
from routes.api.base_entity_decorators import require_authentication, handle_database_session

logger = logging.getLogger(__name__)

# Create blueprint
quotes_bp = Blueprint('external_data_quotes', __name__, url_prefix='/api/external-data/quotes')


@quotes_bp.route('/<int:ticker_id>', methods=['GET'])
@handle_database_session()
def get_ticker_quote(ticker_id):
    """Get quote for a specific ticker"""
    try:
        # Enforce authenticated user
        user_id = getattr(g, 'user_id', None)
        if user_id is None:
            return jsonify({
                'status': 'error',
                'message': 'User authentication required'
            }), 401
        
        # Get database session
        db_session = g.db
        
        try:
            # Get ticker information
            ticker = db_session.query(Ticker).filter(Ticker.id == ticker_id).first()
            if not ticker:
                return jsonify({
                    'status': 'error',
                    'message': f'Ticker with ID {ticker_id} not found',
                    'error_code': 'TICKER_NOT_FOUND'
                }), 404
            
            # Get latest quote from database
            quote = db_session.query(MarketDataQuote).filter(
                MarketDataQuote.ticker_id == ticker_id
            ).order_by(MarketDataQuote.fetched_at.desc()).first()
            
            if not quote:
                return jsonify({
                    'status': 'error',
                    'message': f'No quote data available for ticker {ticker.symbol}',
                    'error_code': 'NO_QUOTE_DATA',
                    'ticker_symbol': ticker.symbol,
                    'suggestion': 'Data may not have been fetched yet. Try refreshing the data.'
                }), 404
            
            # Check if quote is stale (older than 24 hours)
            now = datetime.now(timezone.utc)
            
            # Ensure fetched_at has timezone info
            if quote.fetched_at.tzinfo is None:
                # If no timezone, assume UTC
                fetched_at_utc = quote.fetched_at.replace(tzinfo=timezone.utc)
            else:
                fetched_at_utc = quote.fetched_at
            
            quote_age = (now - fetched_at_utc).total_seconds() / 60  # minutes
            is_stale_data = quote_age > 1440  # 24 hours = 1440 minutes
            
            # Build response with real data
            quote_data = {
                'ticker_id': ticker_id,
                'symbol': ticker.symbol,
                'price': quote.price,
                'change_pct_day': quote.change_pct_day,
                'change_amount_day': quote.change_amount_day,
                'volume': quote.volume,
                'market_cap': quote.market_cap,
                'currency': quote.currency,
                'provider': quote.provider.name if quote.provider else 'unknown',
                'asof_utc': quote.asof_utc.isoformat() if quote.asof_utc else None,
                'fetched_at': quote.fetched_at.isoformat(),
                'is_stale': is_stale_data or quote.is_stale,  # Mark as stale if older than 24 hours
                'quality_score': quote.quality_score,
                # Technical indicators
                'atr': quote.atr,
                'atr_period': quote.atr_period or 14
            }
            
            # Add warning if data is stale
            if is_stale_data:
                quote_data['stale_warning'] = {
                    'message': f'Quote data for {ticker.symbol} is older than 24 hours ({quote_age:.1f} minutes old)',
                    'quote_age_minutes': round(quote_age, 1),
                    'suggestion': 'Data should be refreshed from external provider'
                }
            
            return jsonify({
                'status': 'success',
                'data': quote_data
            }), 200
            
        finally:
            db_session.close()
        
    except Exception as e:
        logger.error(f"Failed to get quote for ticker {ticker_id}: {e}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': f'Failed to get quote for ticker {ticker_id}',
            'error_code': 'INTERNAL_SERVER_ERROR',
            'error': str(e),
            'suggestion': 'Please try again later or contact support if the issue persists'
        }), 500


@quotes_bp.route('/batch', methods=['GET'])
@handle_database_session()
def get_batch_quotes():
    """Get quotes for multiple tickers"""
    try:
        # Query parameters
        ticker_ids_str = request.args.get('ticker_ids', '')
        
        # Enforce authenticated user
        user_id = getattr(g, 'user_id', None)
        if user_id is None:
            return jsonify({
                'status': 'error',
                'message': 'User authentication required'
            }), 401
        
        if not ticker_ids_str:
            return jsonify({
                'status': 'error',
                'message': 'ticker_ids parameter is required'
            }), 400
        
        # Parse ticker IDs
        ticker_ids = [int(tid.strip()) for tid in ticker_ids_str.split(',') if tid.strip().isdigit()]
        
        if not ticker_ids:
            return jsonify({
                'status': 'error',
                'message': 'No valid ticker IDs provided'
            }), 400
        
        # Get database session
        db_session = g.db
        
        try:
            quotes_data = []
            errors = []
            
            for ticker_id in ticker_ids:
                try:
                    # Get ticker information
                    ticker = db_session.query(Ticker).filter(Ticker.id == ticker_id).first()
                    if not ticker:
                        errors.append({
                            'ticker_id': ticker_id,
                            'error': 'Ticker not found',
                            'error_code': 'TICKER_NOT_FOUND'
                        })
                        continue
                    
                    # Get latest quote from database
                    quote = db_session.query(MarketDataQuote).filter(
                        MarketDataQuote.ticker_id == ticker_id
                    ).order_by(MarketDataQuote.fetched_at.desc()).first()
                    
                    if not quote:
                        errors.append({
                            'ticker_id': ticker_id,
                            'symbol': ticker.symbol,
                            'error': 'No quote data available',
                            'error_code': 'NO_QUOTE_DATA',
                            'suggestion': 'Data may not have been fetched yet'
                        })
                        continue
                    
                    # Check if quote is stale (older than 24 hours)
                    now = datetime.now(timezone.utc)
                    
                    # Ensure fetched_at has timezone info
                    if quote.fetched_at.tzinfo is None:
                        # If no timezone, assume UTC
                        fetched_at_utc = quote.fetched_at.replace(tzinfo=timezone.utc)
                    else:
                        fetched_at_utc = quote.fetched_at
                    
                    quote_age = (now - fetched_at_utc).total_seconds() / 60  # minutes
                    is_stale_data = quote_age > 1440  # 24 hours = 1440 minutes
                    
                    # Build response with real data
                    quote_data = {
                        'ticker_id': ticker_id,
                        'symbol': ticker.symbol,
                        'price': quote.price,
                        'change_pct_day': quote.change_pct_day,
                        'change_amount_day': quote.change_amount_day,
                        'volume': quote.volume,
                        'market_cap': quote.market_cap,
                        'currency': quote.currency,
                        'provider': quote.provider.name if quote.provider else 'unknown',
                        'asof_utc': quote.asof_utc.isoformat() if quote.asof_utc else None,
                        'fetched_at': quote.fetched_at.isoformat(),
                        'is_stale': is_stale_data or quote.is_stale,  # Mark as stale if older than 24 hours
                        'quality_score': quote.quality_score,
                        # Technical indicators
                        'atr': quote.atr,
                        'atr_period': quote.atr_period or 14
                    }
                    
                    # Add warning if data is stale
                    if is_stale_data:
                        quote_data['stale_warning'] = {
                            'message': f'Quote data for {ticker.symbol} is older than 24 hours ({quote_age:.1f} minutes old)',
                            'quote_age_minutes': round(quote_age, 1),
                            'suggestion': 'Data should be refreshed from external provider'
                        }
                    
                    # Add timezone info if user_id provided
                    if user_id:
                        # TODO: Implement timezone conversion based on user preferences
                        quote_data['asof_local'] = quote_data['asof_utc']
                        quote_data['fetched_at_local'] = quote_data['fetched_at']
                    
                    quotes_data.append(quote_data)
                    
                except Exception as e:
                    errors.append({
                        'ticker_id': ticker_id,
                        'error': f'Failed to process ticker: {str(e)}',
                        'error_code': 'PROCESSING_ERROR'
                    })
            
            # Return results with any errors
            response_data = {
                'quotes': quotes_data,
                'total_requested': len(ticker_ids),
                'total_successful': len(quotes_data),
                'total_failed': len(errors)
            }
            
            if errors:
                response_data['errors'] = errors
                response_data['partial_success'] = len(quotes_data) > 0
                
                if len(quotes_data) == 0:
                    # All failed
                    return jsonify({
                        'status': 'error',
                        'message': 'All requested quotes failed to load',
                        'data': response_data
                    }), 500
                else:
                    # Partial success
                    return jsonify({
                        'status': 'partial_success',
                        'message': f'Some quotes loaded successfully ({len(quotes_data)}/{len(ticker_ids)})',
                        'data': response_data
                    }), 207  # Multi-Status
            
            # All successful
            return jsonify({
                'status': 'success',
                'data': response_data
            }), 200
            
        finally:
            db_session.close()
        
        return jsonify({
            'status': 'success',
            'data': quotes_data
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to get batch quotes: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to get batch quotes'
        }), 500


@quotes_bp.route('/<int:ticker_id>/history', methods=['GET'])
def get_quote_history(ticker_id):
    """Get quote history for a ticker from market_data_quotes table"""
    try:
        from datetime import datetime, timedelta, timezone
        from sqlalchemy import desc
        
        # Query parameters
        days = int(request.args.get('days', 30))
        interval = request.args.get('interval', '1d')
        
        # Validate parameters
        if days < 1 or days > 365:
            return jsonify({
                'status': 'error',
                'message': 'Days parameter must be between 1 and 365',
                'error_code': 'INVALID_PARAMETER'
            }), 400
        
        if interval not in ['1d', '1w', '1m']:
            return jsonify({
                'status': 'error',
                'message': 'Interval must be one of: 1d, 1w, 1m',
                'error_code': 'INVALID_PARAMETER'
            }), 400
        
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get ticker information
            ticker = db_session.query(Ticker).filter(Ticker.id == ticker_id).first()
            if not ticker:
                return jsonify({
                    'status': 'error',
                    'message': f'Ticker with ID {ticker_id} not found',
                    'error_code': 'TICKER_NOT_FOUND'
                }), 404
            
            # Get provider ID for Yahoo Finance
            from models.external_data import ExternalDataProvider
            provider = db_session.query(ExternalDataProvider).filter(
                ExternalDataProvider.name == 'yahoo_finance'
            ).first()
            
            if not provider:
                return jsonify({
                    'status': 'error',
                    'message': 'Yahoo Finance provider not configured',
                    'error_code': 'PROVIDER_NOT_CONFIGURED'
                }), 503
            
            # Calculate date range
            end_date = datetime.now(timezone.utc)
            start_date = end_date - timedelta(days=days)
            
            # Query historical quotes from market_data_quotes table
            from models.external_data import MarketDataQuote
            quotes = db_session.query(MarketDataQuote).filter(
                MarketDataQuote.ticker_id == ticker_id,
                MarketDataQuote.provider_id == provider.id,
                MarketDataQuote.asof_utc >= start_date,
                MarketDataQuote.asof_utc <= end_date
            ).order_by(desc(MarketDataQuote.asof_utc)).all()
            
            # Format response data
            history_data = []
            for quote in quotes:
                history_data.append({
                    'date': quote.asof_utc.isoformat() if quote.asof_utc else None,
                    'price': float(quote.price) if quote.price else None,
                    'open': float(quote.open_price) if quote.open_price else None,
                    'high': float(quote.high_price) if quote.high_price else None,
                    'low': float(quote.low_price) if quote.low_price else None,
                    'close': float(quote.close_price) if quote.close_price else None,
                    'volume': int(quote.volume) if quote.volume else None
                })
            
            logger.info(f"📊 Retrieved {len(history_data)} historical quotes for {ticker.symbol} (ticker_id: {ticker_id}, days: {days})")
            
            return jsonify({
                'status': 'success',
                'data': history_data,
                'ticker_id': ticker_id,
                'ticker_symbol': ticker.symbol,
                'count': len(history_data),
                'days_requested': days,
                'interval': interval,
                'date_range': {
                    'start': start_date.isoformat(),
                    'end': end_date.isoformat()
                }
            }), 200
            
        finally:
            db_session.close()
        
    except ValueError as e:
        logger.error(f"Invalid parameter for quote history: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Invalid parameter: {str(e)}',
            'error_code': 'INVALID_PARAMETER',
            'suggestion': 'Please check that days is between 1-365 and interval is one of: 1d, 1w, 1m'
        }), 400
    except Exception as e:
        logger.error(f"Failed to get quote history for ticker {ticker_id}: {e}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': f'Failed to get quote history for ticker {ticker_id}',
            'error_code': 'INTERNAL_SERVER_ERROR',
            'error': str(e),
            'suggestion': 'Please try again later or contact support if the issue persists'
        }), 500


@quotes_bp.route('/<int:ticker_id>/refresh', methods=['POST'])
@require_authentication()
def refresh_ticker_quote(ticker_id):
    """Manually refresh quote for a ticker - optimized to only load missing data"""
    start_time = datetime.now(timezone.utc)
    try:
        # Validate ticker_id
        if not isinstance(ticker_id, int) or ticker_id <= 0:
            return jsonify({
                'status': 'error',
                'message': f'Invalid ticker_id: {ticker_id}',
                'error_code': 'INVALID_TICKER_ID'
            }), 400
        
        data = request.get_json() or {}
        force_refresh = data.get('force_refresh', False)
        include_historical = data.get('include_historical', None)  # None = auto-detect
        days_back = data.get('days_back', 150)  # Default to 150 for MA 150 calculation
        
        # Validate days_back
        if not isinstance(days_back, int) or days_back < 1 or days_back > 365:
            return jsonify({
                'status': 'error',
                'message': f'Invalid days_back: {days_back} (must be between 1 and 365)',
                'error_code': 'INVALID_DAYS_BACK'
            }), 400
        
        logger.info(f"🔄 Starting refresh_ticker_quote for ticker_id: {ticker_id}, force_refresh: {force_refresh}")
        
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get ticker information
            ticker = db_session.query(Ticker).filter(Ticker.id == ticker_id).first()
            if not ticker:
                logger.warning(f"⚠️ Ticker with ID {ticker_id} not found")
                return jsonify({
                    'status': 'error',
                    'message': f'Ticker with ID {ticker_id} not found',
                    'error_code': 'TICKER_NOT_FOUND'
                }), 404
            
            logger.info(f"✅ Found ticker: {ticker.symbol} (ID: {ticker_id})")
            
            # Check what data is missing before loading
            from services.external_data.missing_data_checker import MissingDataChecker
            missing_checker = MissingDataChecker(db_session)
            missing_data = missing_checker.check_missing_data(ticker_id)
            
            # Determine what to load based on missing data check
            should_load_quote = force_refresh or missing_data.get('should_refresh_quote', True)
            should_load_historical = False
            should_calculate_indicators = False
            
            if include_historical is None:
                # Auto-detect: only load if missing or stale
                should_load_historical = force_refresh or missing_data.get('should_refresh_historical', False)
            else:
                # Explicit request
                should_load_historical = include_historical
            
            # Check if indicators need calculation
            missing_indicators = missing_data.get('missing_indicators', [])
            should_refresh_indicators = missing_data.get('should_refresh_indicators', [])
            should_calculate_indicators = len(missing_indicators) > 0 or len(should_refresh_indicators) > 0
            
            # Log what will be loaded
            actions = []
            if should_load_quote:
                actions.append('quote')
            if should_load_historical:
                actions.append('historical')
            if should_calculate_indicators:
                actions.append('indicators')
            
            if not actions:
                logger.info(f"ℹ️ All data is fresh for {ticker.symbol}, skipping refresh")
                return jsonify({
                    'status': 'success',
                    'message': f'All data is fresh for {ticker.symbol}, no refresh needed',
                    'data': {
                        'ticker_id': ticker_id,
                        'ticker_symbol': ticker.symbol,
                        'skipped': True,
                        'reason': missing_data.get('recommendations', {}).get('reason', 'all data is fresh'),
                        'data_freshness': missing_data.get('data_freshness', {}),
                        'actions_taken': []
                    },
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }), 200
            
            logger.info(f"📊 Will load: {', '.join(actions)} for {ticker.symbol}")
            
            # Implement refresh logic using YahooFinanceAdapter
            from services.external_data.yahoo_finance_adapter import YahooFinanceAdapter
            from models.external_data import ExternalDataProvider
            
            # Get Yahoo Finance provider
            provider = db_session.query(ExternalDataProvider).filter(
                ExternalDataProvider.name == 'yahoo_finance'
            ).first()
            
            if not provider:
                return jsonify({
                    'status': 'error',
                    'message': 'Yahoo Finance provider not configured',
                    'error_code': 'PROVIDER_NOT_CONFIGURED'
                }), 503
            
            # Initialize adapter
            logger.info(f"🔄 Step 1: Initializing adapter for provider {provider.id} ({provider.name})")
            adapter = YahooFinanceAdapter(db_session, provider.id)
            
            actions_taken = []
            skipped_actions = []
            
            # Step 2: Fetch current quote (only if needed)
            quote_data = None
            if should_load_quote:
                logger.info(f"🔄 Step 2: Fetching current quote for {ticker.symbol}")
                try:
                    quote_data = adapter.get_quote(ticker.symbol, ticker=ticker)
                    if quote_data:
                        logger.info(f"✅ Successfully fetched current quote for {ticker.symbol}: ${quote_data.price}, volume={quote_data.volume}")
                        actions_taken.append('quote_loaded')
                        # If volume is None, try to get it from the database (might have been saved but not returned)
                        if quote_data.volume is None:
                            logger.warning(f"⚠️ Quote volume is None for {ticker.symbol}, checking database...")
                            from models.external_data import MarketDataQuote
                            latest_quote = db_session.query(MarketDataQuote).filter(
                                MarketDataQuote.ticker_id == ticker_id
                            ).order_by(MarketDataQuote.fetched_at.desc()).first()
                            if latest_quote and latest_quote.volume is not None:
                                logger.info(f"✅ Found volume in database for {ticker.symbol}: {latest_quote.volume}")
                                quote_data.volume = latest_quote.volume
                            else:
                                logger.warning(f"⚠️ No volume found in database for {ticker.symbol}")
                    else:
                        logger.warning(f"⚠️ No quote data returned for {ticker.symbol}")
                        actions_taken.append('quote_failed')
                except Exception as quote_error:
                    logger.error(f"❌ Error fetching quote for {ticker.symbol}: {quote_error}", exc_info=True)
                    actions_taken.append('quote_error')
                    # Continue - we'll check if we have existing data in database
            else:
                logger.info(f"⏭️ Skipping quote fetch - data is fresh (age: {missing_data.get('data_freshness', {}).get('quote_age_minutes', 'unknown')} minutes)")
                skipped_actions.append('quote_skipped_fresh')
                # Get existing quote for response
                from models.external_data import MarketDataQuote
                latest_quote = db_session.query(MarketDataQuote).filter(
                    MarketDataQuote.ticker_id == ticker_id
                ).order_by(MarketDataQuote.fetched_at.desc()).first()
                if latest_quote:
                    quote_data = type('QuoteData', (), {
                        'price': latest_quote.price,
                        'volume': latest_quote.volume,
                        'change_pct_day': latest_quote.change_pct_day,
                        'change_pct': latest_quote.change_pct_day,
                        'market_cap': latest_quote.market_cap,
                        'asof_utc': latest_quote.asof_utc
                    })()
            
            # Step 3: Fetch historical data (only if needed)
            historical_count = 0
            if should_load_historical:
                logger.info(f"🔄 Step 3: Fetching historical data for {ticker.symbol} ({days_back} days)")
                try:
                    historical_count = adapter.fetch_and_save_historical_quotes(ticker, days_back=days_back)
                    if historical_count > 0:
                        logger.info(f"✅ Fetched {historical_count} historical quotes for {ticker.symbol} (requested {days_back} days)")
                        actions_taken.append('historical_loaded')
                        if historical_count < 120:
                            logger.warning(f"⚠️ Only {historical_count} quotes fetched for {ticker.symbol}, expected at least 120 for MA 150")
                    else:
                        logger.warning(f"⚠️ No historical quotes fetched for {ticker.symbol}")
                        actions_taken.append('historical_failed')
                except Exception as hist_error:
                    logger.error(f"❌ Could not fetch historical data for {ticker.symbol}: {hist_error}", exc_info=True)
                    actions_taken.append('historical_error')
            else:
                logger.info(f"⏭️ Skipping historical data fetch - data is fresh (age: {missing_data.get('data_freshness', {}).get('historical_age_hours', 'unknown')} hours)")
                skipped_actions.append('historical_skipped_fresh')
                # Count existing historical quotes for response
                historical_count = missing_data.get('historical_count', 0)
            
            # Step 4: Pre-calculate technical indicators (only missing ones)
            indicators_calculated = []
            indicators_skipped = []
            if should_calculate_indicators and historical_count > 0:
                logger.info(f"🔄 Step 4: Pre-calculating missing technical indicators for {ticker.symbol} (have {historical_count} quotes)")
                try:
                    from services.external_data.technical_indicators_calculator import TechnicalIndicatorsCalculator
                    from services.external_data.week52_calculator import Week52Calculator
                    from services.advanced_cache_service import advanced_cache_service
                    
                    tech_calculator = TechnicalIndicatorsCalculator(db_session)
                    week52_calculator = Week52Calculator(db_session)
                    
                    # Only calculate indicators that are missing or need refresh
                    indicators_to_calculate = set(missing_indicators + should_refresh_indicators)
                    
                    # Pre-calculate Volatility (needs 30+ days)
                    if 'volatility_30' in indicators_to_calculate and historical_count >= 30:
                        try:
                            volatility = tech_calculator.calculate_volatility(ticker_id, period=30, db_session=db_session)
                            if volatility is not None:
                                volatility_cache_key = f"ticker_{ticker_id}_volatility_30"
                                advanced_cache_service.set(volatility_cache_key, volatility, ttl=3600)
                                indicators_calculated.append('volatility_30')
                                logger.info(f"✅ Pre-calculated Volatility for {ticker.symbol}: {volatility:.2f}%")
                            else:
                                logger.warning(f"⚠️ Volatility calculation returned None for {ticker.symbol} (have {historical_count} quotes)")
                        except Exception as vol_error:
                            logger.warning(f"⚠️ Error pre-calculating volatility for {ticker.symbol}: {vol_error}", exc_info=True)
                    elif historical_count >= 30:
                        indicators_skipped.append('volatility_30')
                    
                    # Pre-calculate MA 20 (needs 20+ days)
                    if 'ma_20' in indicators_to_calculate and historical_count >= 20:
                        try:
                            sma_20 = tech_calculator.calculate_sma(ticker_id, period=20, db_session=db_session)
                            if sma_20 is not None:
                                ma20_cache_key = f"ticker_{ticker_id}_ma_20"
                                advanced_cache_service.set(ma20_cache_key, sma_20, ttl=3600)
                                indicators_calculated.append('ma_20')
                                logger.info(f"✅ Pre-calculated MA 20 for {ticker.symbol}: {sma_20:.2f}")
                            else:
                                logger.warning(f"⚠️ MA 20 calculation returned None for {ticker.symbol} (have {historical_count} quotes)")
                        except Exception as ma20_error:
                            logger.warning(f"⚠️ Error pre-calculating MA 20 for {ticker.symbol}: {ma20_error}", exc_info=True)
                    elif historical_count >= 20:
                        indicators_skipped.append('ma_20')
                    
                    # Pre-calculate MA 150 (needs 150 trading days ≈ 120+ quotes due to weekends/holidays)
                    if 'ma_150' in indicators_to_calculate and historical_count >= 120:
                        try:
                            sma_150 = tech_calculator.calculate_sma(ticker_id, period=150, db_session=db_session)
                            if sma_150 is not None:
                                ma150_cache_key = f"ticker_{ticker_id}_ma_150"
                                advanced_cache_service.set(ma150_cache_key, sma_150, ttl=3600)
                                indicators_calculated.append('ma_150')
                                logger.info(f"✅ Pre-calculated MA 150 for {ticker.symbol}: {sma_150:.2f}")
                            else:
                                logger.warning(f"⚠️ MA 150 calculation returned None for {ticker.symbol} (have {historical_count} quotes)")
                        except Exception as ma150_error:
                            logger.warning(f"⚠️ Error pre-calculating MA 150 for {ticker.symbol}: {ma150_error}", exc_info=True)
                    elif historical_count >= 120:
                        indicators_skipped.append('ma_150')
                    
                    # Pre-calculate 52W range (needs 10+ days, but better with more)
                    if 'week52' in indicators_to_calculate and historical_count >= 10:
                        try:
                            week52_result = week52_calculator.calculate_52w_range(ticker_id, db_session=db_session)
                            if week52_result:
                                week52_cache_key = f"ticker_{ticker_id}_week52"
                                week52_dict = {
                                    'high': week52_result.high,
                                    'low': week52_result.low,
                                    'warnings': week52_result.warnings if hasattr(week52_result, 'warnings') else []
                                }
                                advanced_cache_service.set(week52_cache_key, week52_dict, ttl=3600)
                                indicators_calculated.append('week52')
                                logger.info(f"✅ Pre-calculated 52W range for {ticker.symbol}: high={week52_result.high:.2f}, low={week52_result.low:.2f}")
                            else:
                                logger.warning(f"⚠️ 52W range calculation returned None for {ticker.symbol} (have {historical_count} quotes)")
                        except Exception as week52_error:
                            logger.warning(f"⚠️ Error pre-calculating 52W range for {ticker.symbol}: {week52_error}", exc_info=True)
                    elif historical_count >= 10:
                        indicators_skipped.append('week52')
                    
                    # Check ATR (from quote)
                    if 'atr' in indicators_to_calculate:
                        # ATR is stored in the quote itself, so it's calculated when quote is loaded
                        if quote_data and hasattr(quote_data, 'atr') and quote_data.atr:
                            indicators_calculated.append('atr')
                        else:
                            # ATR will be calculated by the adapter if historical data is available
                            pass
                    
                    if indicators_calculated:
                        logger.info(f"✅ Step 4 completed: Calculated {len(indicators_calculated)} indicators for {ticker.symbol}: {', '.join(indicators_calculated)}")
                    if indicators_skipped:
                        logger.info(f"⏭️ Skipped {len(indicators_skipped)} indicators (already fresh): {', '.join(indicators_skipped)}")
                except Exception as calc_error:
                    logger.warning(f"Error pre-calculating technical indicators for {ticker.symbol}: {calc_error}", exc_info=True)
                    # Continue even if pre-calculation fails - calculations will happen on-demand
            elif historical_count > 0:
                logger.info(f"⏭️ Skipping indicator calculation - all indicators are fresh")
                skipped_actions.append('indicators_skipped_fresh')
            
            # Check if we got quote data or if we have existing data in database
            if quote_data and quote_data.price:
                # Quote fetched and saved successfully
                # If volume is still None, try to get it from the database (might have been saved but not returned in quote_data)
                if quote_data.volume is None:
                    logger.warning(f"⚠️ Quote volume is None for {ticker.symbol} after get_quote(), checking database...")
                    from models.external_data import MarketDataQuote
                    latest_quote = db_session.query(MarketDataQuote).filter(
                        MarketDataQuote.ticker_id == ticker_id
                    ).order_by(MarketDataQuote.fetched_at.desc()).first()
                    if latest_quote and latest_quote.volume is not None:
                        logger.info(f"✅ Found volume in database for {ticker.symbol}: {latest_quote.volume}")
                        quote_data.volume = latest_quote.volume
                    else:
                        logger.warning(f"⚠️ No volume found in database for {ticker.symbol} either")
                
                # Invalidate backend cache for entity details and all technical indicators
                try:
                    from services.advanced_cache_service import advanced_cache_service
                    from services.entity_details_service import EntityDetailsService
                    
                    # The cache key is generated by cache_for decorator using MD5 hash
                    # We need to invalidate by pattern since we don't know the exact hash
                    # Pattern: "Backend.services.entity_details_service.get_entity_details:*"
                    advanced_cache_service.invalidate_pattern("Backend.services.entity_details_service.get_entity_details:*")
                    
                    # Also use the service's own invalidation method
                    EntityDetailsService.invalidate_entity_cache('ticker', ticker_id)
                    
                    # Don't delete technical indicators cache - they were just calculated and saved
                    # Only invalidate entity details cache to force reload with new data
                    # The technical indicators are already in cache from pre-calculation above
                    logger.info(f"✅ Invalidated entity details cache for ticker {ticker_id} (technical indicators remain in cache)")
                except Exception as cache_error:
                    logger.warning(f"Could not invalidate cache: {cache_error}", exc_info=True)
                
                # Calculate duration
                end_time = datetime.now(timezone.utc)
                duration_seconds = (end_time - start_time).total_seconds()
                
                logger.info(f"✅ refresh_ticker_quote completed for {ticker.symbol}: {len(actions_taken)} actions taken, {len(skipped_actions)} skipped, duration: {duration_seconds:.2f}s")
                
                return jsonify({
                    'status': 'success',
                    'message': f'Refresh completed for {ticker.symbol}',
                    'data': {
                        'ticker_id': ticker_id,
                        'ticker_symbol': ticker.symbol,
                        'price': quote_data.price if quote_data else None,
                        'change_percent': (quote_data.change_pct_day or quote_data.change_pct) if quote_data else None,
                        'volume': quote_data.volume if quote_data else None,
                        'market_cap': quote_data.market_cap if quote_data and hasattr(quote_data, 'market_cap') else None,
                        'fetched_at': quote_data.asof_utc.isoformat() if quote_data and quote_data.asof_utc else None,
                        'historical_quotes_count': historical_count,
                        'indicators_calculated': indicators_calculated,
                        'indicators_skipped': indicators_skipped,
                        'actions_taken': actions_taken,
                        'actions_skipped': skipped_actions,
                        'optimization': {
                            'quote_loaded': 'quote_loaded' in actions_taken,
                            'historical_loaded': 'historical_loaded' in actions_taken,
                            'indicators_calculated_count': len(indicators_calculated),
                            'data_freshness': missing_data.get('data_freshness', {}),
                            'reason': missing_data.get('recommendations', {}).get('reason', 'refresh requested')
                        },
                        'performance': {
                            'duration_seconds': round(duration_seconds, 2),
                            'start_time': start_time.isoformat(),
                            'end_time': end_time.isoformat()
                        }
                    }
                })
            else:
                # Check if we have existing quote data in database (might be fresh enough)
                existing_quote = db_session.query(MarketDataQuote).filter(
                    MarketDataQuote.ticker_id == ticker_id
                ).order_by(MarketDataQuote.fetched_at.desc()).first()
                
                if existing_quote:
                    # We have existing data - refresh might have failed but we have data
                    end_time = datetime.now(timezone.utc)
                    duration_seconds = (end_time - start_time).total_seconds()
                    
                    logger.info(f"⚠️ Quote refresh failed for {ticker.symbol}, but existing data found in database (age: {(datetime.now(timezone.utc) - existing_quote.fetched_at).total_seconds() / 60:.1f} minutes)")
                    return jsonify({
                        'status': 'success',
                        'message': f'Quote refresh attempted for {ticker.symbol}. Using existing data.',
                        'data': {
                            'ticker_id': ticker_id,
                            'ticker_symbol': ticker.symbol,
                            'price': existing_quote.price,
                            'change_percent': existing_quote.change_pct_day,
                            'volume': existing_quote.volume,
                            'market_cap': existing_quote.market_cap,
                            'fetched_at': existing_quote.fetched_at.isoformat() if existing_quote.fetched_at else None,
                            'historical_quotes_count': historical_count,
                            'indicators_calculated': indicators_calculated,
                            'note': 'Using existing data - refresh may have failed',
                            'performance': {
                                'duration_seconds': round(duration_seconds, 2),
                                'start_time': start_time.isoformat(),
                                'end_time': end_time.isoformat()
                            }
                        }
                    }), 200
                else:
                    # No quote data at all - this is a real error
                    end_time = datetime.now(timezone.utc)
                    duration_seconds = (end_time - start_time).total_seconds()
                    
                    logger.error(f"❌ Failed to fetch quote for {ticker.symbol} and no existing data found (duration: {duration_seconds:.2f}s)")
                    return jsonify({
                        'status': 'error',
                        'message': f'Failed to fetch quote for {ticker.symbol} and no existing data available',
                        'error_code': 'QUOTE_FETCH_FAILED',
                        'ticker_symbol': ticker.symbol,
                        'historical_quotes_count': historical_count,
                        'indicators_calculated': indicators_calculated,
                        'performance': {
                            'duration_seconds': round(duration_seconds, 2),
                            'start_time': start_time.isoformat(),
                            'end_time': end_time.isoformat()
                        }
                    }), 500
            
        finally:
            db_session.close()
        
    except Exception as e:
        logger.error(f"Failed to refresh quote for ticker {ticker_id}: {e}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': f'Failed to refresh quote for ticker {ticker_id}: {str(e)}',
            'error': str(e)
        }), 500

@quotes_bp.route('/providers', methods=['GET'])
def get_providers():
    """
    Get list of available providers
    
    Returns:
    - JSON response with providers list
    """
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get all providers
            providers = db_session.query(ExternalDataProvider).all()
            
            providers_data = []
            for provider in providers:
                try:
                    # Basic provider info
                    provider_info = {
                        'id': provider.id,
                        'name': provider.name,
                        'display_name': provider.display_name,
                        'is_active': provider.is_active,
                        'is_healthy': provider.is_healthy,
                        'last_successful_request': provider.last_successful_request.isoformat() if provider.last_successful_request else None,
                        'last_error': provider.last_error,
                        'error_count': provider.error_count
                    }
                    
                    # Try to get detailed status if provider is active
                    if provider.is_active:
                        try:
                            # TODO: Implement provider status checking
                            # For now, return basic info
                            provider_info['rate_limit_remaining'] = provider.rate_limit_per_hour
                            provider_info['recent_success_rate'] = 0  # Will be calculated when scheduler is active
                        except Exception as e:
                            logger.error(f"Error getting detailed status for provider {provider.id}: {e}")
                            provider_info['rate_limit_remaining'] = 0
                            provider_info['recent_success_rate'] = 0
                    else:
                        provider_info['rate_limit_remaining'] = 0
                        provider_info['recent_success_rate'] = 0
                    
                    providers_data.append(provider_info)
                    
                except Exception as e:
                    logger.error(f"Error processing provider {provider.id}: {e}")
                    providers_data.append({
                        'id': provider.id,
                        'name': provider.name,
                        'display_name': provider.display_name,
                        'is_active': provider.is_active,
                        'is_healthy': False,
                        'error': str(e)
                    })
            
            return jsonify({
                'success': True,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'providers': providers_data
            }), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error in get_providers: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500
