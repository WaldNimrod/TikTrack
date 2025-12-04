"""
Quotes API Routes - External Data Integration
API endpoints for quote operations
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timezone, timedelta
import logging

from models.ticker import Ticker
from models.external_data import MarketDataQuote, ExternalDataProvider
from config.database import get_db

logger = logging.getLogger(__name__)

# Create blueprint
quotes_bp = Blueprint('external_data_quotes', __name__, url_prefix='/api/external-data/quotes')


@quotes_bp.route('/<int:ticker_id>', methods=['GET'])
def get_ticker_quote(ticker_id):
    """Get quote for a specific ticker"""
    try:
        # Query parameters
        user_id = request.args.get('user_id', type=int)
        
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
            
            if quote_age > 1440:  # 24 hours = 1440 minutes
                return jsonify({
                    'status': 'error',
                    'message': f'Quote data for {ticker.symbol} is too old ({quote_age:.1f} minutes old)',
                    'error_code': 'STALE_QUOTE_DATA',
                    'ticker_symbol': ticker.symbol,
                    'quote_age_minutes': round(quote_age, 1),
                    'last_fetched': quote.fetched_at.isoformat(),
                    'suggestion': 'Data needs to be refreshed from external provider'
                }), 410  # Gone (stale data)
            
            # Build response with real data
            quote_data = {
                'ticker_id': ticker_id,
                'symbol': ticker.symbol,
                'price': quote.price,
                'change_pct_day': quote.change_pct_day,
                'change_amount_day': quote.change_amount_day,
                'volume': quote.volume,
                'currency': quote.currency,
                'provider': quote.provider.name if quote.provider else 'unknown',
                'asof_utc': quote.asof_utc.isoformat() if quote.asof_utc else None,
                'fetched_at': quote.fetched_at.isoformat(),
                'is_stale': quote.is_stale,
                'quality_score': quote.quality_score,
                # Technical indicators
                'atr': quote.atr,
                'atr_period': quote.atr_period or 14
            }
            
            # Add timezone info if user_id provided
            if user_id:
                # TODO: Implement timezone conversion based on user preferences
                quote_data['asof_local'] = quote_data['asof_utc']
                quote_data['fetched_at_local'] = quote_data['fetched_at']
            
            return jsonify({
                'status': 'success',
                'data': quote_data
            }), 200
            
        finally:
            db_session.close()
        
    except Exception as e:
        logger.error(f"Failed to get quote for ticker {ticker_id}: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get quote for ticker {ticker_id}'
        }), 500


@quotes_bp.route('/batch', methods=['GET'])
def get_batch_quotes():
    """Get quotes for multiple tickers"""
    try:
        # Query parameters
        ticker_ids_str = request.args.get('ticker_ids', '')
        user_id = request.args.get('user_id', type=int)
        
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
        db_session = next(get_db())
        
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
                    
                    if quote_age > 1440:  # 24 hours = 1440 minutes
                        errors.append({
                            'ticker_id': ticker_id,
                            'symbol': ticker.symbol,
                            'error': f'Quote data is too old ({quote_age:.1f} minutes old)',
                            'error_code': 'STALE_QUOTE_DATA',
                            'quote_age_minutes': round(quote_age, 1),
                            'last_fetched': quote.fetched_at.isoformat(),
                            'suggestion': 'Data needs to be refreshed from external provider'
                        })
                        continue
                    
                    # Build response with real data
                    quote_data = {
                        'ticker_id': ticker_id,
                        'symbol': ticker.symbol,
                        'price': quote.price,
                        'change_pct_day': quote.change_pct_day,
                        'change_amount_day': quote.change_amount_day,
                        'volume': quote.volume,
                        'currency': quote.currency,
                        'provider': quote.provider.name if quote.provider else 'unknown',
                        'asof_utc': quote.asof_utc.isoformat() if quote.asof_utc else None,
                        'fetched_at': quote.fetched_at.isoformat(),
                        'is_stale': quote.is_stale,
                        'quality_score': quote.quality_score,
                        # Technical indicators
                        'atr': quote.atr,
                        'atr_period': quote.atr_period or 14
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
    """Get quote history for a ticker"""
    try:
        # Query parameters
        days = int(request.args.get('days', 30))
        interval = request.args.get('interval', '1d')
        
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
            
            # TODO: Implement historical data retrieval from intraday_slots table
            # For now, return error indicating feature not implemented
            return jsonify({
                'status': 'error',
                'message': 'Historical data retrieval not yet implemented',
                'error_code': 'FEATURE_NOT_IMPLEMENTED',
                'ticker_symbol': ticker.symbol,
                'suggestion': 'This feature will be available in the next update'
            }), 501  # Not Implemented
            
        finally:
            db_session.close()
        
    except Exception as e:
        logger.error(f"Failed to get quote history for ticker {ticker_id}: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get quote history for ticker {ticker_id}'
        }), 500


@quotes_bp.route('/<int:ticker_id>/refresh', methods=['POST'])
def refresh_ticker_quote(ticker_id):
    """Manually refresh quote for a ticker"""
    try:
        data = request.get_json() or {}
        force_refresh = data.get('force_refresh', False)
        
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
            adapter = YahooFinanceAdapter(db_session, provider.id)
            
            # Fetch quote with force refresh (bypass cache)
            # First, clear any cached quote to force fresh fetch
            try:
                # Delete recent quotes to force refresh
                cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=5)
                db_session.query(MarketDataQuote).filter(
                    MarketDataQuote.ticker_id == ticker_id,
                    MarketDataQuote.provider_id == provider.id,
                    MarketDataQuote.fetched_at >= cutoff_time
                ).delete()
                db_session.commit()
            except Exception as clear_error:
                logger.warning(f"Could not clear cached quotes before refresh: {clear_error}")
                db_session.rollback()
            
            # Fetch current quote (will fetch fresh from API since cache is cleared)
            quote_data = adapter.get_quote(ticker.symbol, ticker=ticker)
            
            # Also fetch historical data (150 days for MA 150 calculation)
            # This ensures we have enough data for technical indicators
            historical_count = 0
            try:
                historical_count = adapter.fetch_and_save_historical_quotes(ticker, days_back=150)
                logger.info(f"📊 Fetched {historical_count} historical quotes for {ticker.symbol}")
            except Exception as hist_error:
                logger.warning(f"Could not fetch historical data for {ticker.symbol}: {hist_error}", exc_info=True)
                # Continue even if historical fetch fails
            
            # Pre-calculate technical indicators after fetching historical data
            # This ensures calculations are ready when entity_details is called
            if historical_count > 0:
                try:
                    from services.external_data.technical_indicators_calculator import TechnicalIndicatorsCalculator
                    from services.external_data.week52_calculator import Week52Calculator
                    from services.advanced_cache_service import advanced_cache_service
                    
                    tech_calculator = TechnicalIndicatorsCalculator(db_session)
                    week52_calculator = Week52Calculator(db_session)
                    
                    logger.info(f"📊 Pre-calculating technical indicators for {ticker.symbol} after fetching {historical_count} historical quotes")
                    
                    # Pre-calculate Volatility (needs 30+ days)
                    if historical_count >= 30:
                        try:
                            volatility = tech_calculator.calculate_volatility(ticker_id, period=30, db_session=db_session)
                            if volatility is not None:
                                volatility_cache_key = f"ticker_{ticker_id}_volatility_30"
                                advanced_cache_service.set(volatility_cache_key, volatility, ttl=3600)
                                logger.info(f"✅ Pre-calculated Volatility for {ticker.symbol}: {volatility:.2f}%")
                            else:
                                logger.warning(f"⚠️ Volatility calculation returned None for {ticker.symbol} (have {historical_count} quotes)")
                        except Exception as vol_error:
                            logger.warning(f"Error pre-calculating volatility for {ticker.symbol}: {vol_error}", exc_info=True)
                    
                    # Pre-calculate MA 20 (needs 20+ days)
                    if historical_count >= 20:
                        try:
                            sma_20 = tech_calculator.calculate_sma(ticker_id, period=20, db_session=db_session)
                            if sma_20 is not None:
                                ma20_cache_key = f"ticker_{ticker_id}_ma_20"
                                advanced_cache_service.set(ma20_cache_key, sma_20, ttl=3600)
                                logger.info(f"✅ Pre-calculated MA 20 for {ticker.symbol}: {sma_20:.2f}")
                            else:
                                logger.warning(f"⚠️ MA 20 calculation returned None for {ticker.symbol} (have {historical_count} quotes)")
                        except Exception as ma20_error:
                            logger.warning(f"Error pre-calculating MA 20 for {ticker.symbol}: {ma20_error}", exc_info=True)
                    
                    # Pre-calculate MA 150 (needs 150 trading days ≈ 120+ quotes due to weekends/holidays)
                    # With weekends and holidays, 150 trading days ≈ 210 calendar days
                    # So we check if we have at least 120 quotes (80% of 150)
                    if historical_count >= 120:
                        try:
                            sma_150 = tech_calculator.calculate_sma(ticker_id, period=150, db_session=db_session)
                            if sma_150 is not None:
                                ma150_cache_key = f"ticker_{ticker_id}_ma_150"
                                advanced_cache_service.set(ma150_cache_key, sma_150, ttl=3600)
                                logger.info(f"✅ Pre-calculated MA 150 for {ticker.symbol}: {sma_150:.2f}")
                            else:
                                logger.warning(f"⚠️ MA 150 calculation returned None for {ticker.symbol} (have {historical_count} quotes)")
                        except Exception as ma150_error:
                            logger.warning(f"Error pre-calculating MA 150 for {ticker.symbol}: {ma150_error}", exc_info=True)
                    
                    # Pre-calculate 52W range (needs 10+ days, but better with more)
                    if historical_count >= 10:
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
                                logger.info(f"✅ Pre-calculated 52W range for {ticker.symbol}: high={week52_result.high:.2f}, low={week52_result.low:.2f}")
                            else:
                                logger.warning(f"⚠️ 52W range calculation returned None for {ticker.symbol} (have {historical_count} quotes)")
                        except Exception as week52_error:
                            logger.warning(f"Error pre-calculating 52W range for {ticker.symbol}: {week52_error}", exc_info=True)
                    
                    logger.info(f"✅ Completed pre-calculation of technical indicators for {ticker.symbol}")
                except Exception as calc_error:
                    logger.warning(f"Error pre-calculating technical indicators for {ticker.symbol}: {calc_error}", exc_info=True)
                    # Continue even if pre-calculation fails - calculations will happen on-demand
            
            if quote_data and quote_data.price:
                # Quote fetched and saved successfully
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
                    
                    # Invalidate technical indicators cache to force recalculation
                    # These are calculated on-demand and cached, so we need to clear them
                    advanced_cache_service.invalidate(f"ticker_{ticker_id}_week52")
                    advanced_cache_service.invalidate(f"ticker_{ticker_id}_volatility_30")
                    advanced_cache_service.invalidate(f"ticker_{ticker_id}_ma_20")
                    advanced_cache_service.invalidate(f"ticker_{ticker_id}_ma_150")
                    
                    logger.info(f"✅ Invalidated cache for ticker {ticker_id} (including technical indicators)")
                except Exception as cache_error:
                    logger.warning(f"Could not invalidate cache: {cache_error}", exc_info=True)
                
                return jsonify({
                    'status': 'success',
                    'message': f'Quote refreshed successfully for {ticker.symbol}',
                    'data': {
                        'ticker_id': ticker_id,
                        'ticker_symbol': ticker.symbol,
                        'price': quote_data.price,
                        'change_percent': quote_data.change_percent or quote_data.change_pct_day,
                        'volume': quote_data.volume,
                        'fetched_at': quote_data.asof_utc.isoformat() if quote_data.asof_utc else None
                    }
                })
            else:
                return jsonify({
                    'status': 'error',
                    'message': f'Failed to fetch quote for {ticker.symbol}',
                    'error_code': 'QUOTE_FETCH_FAILED',
                    'ticker_symbol': ticker.symbol
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
