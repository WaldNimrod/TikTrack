"""
Quotes API Routes - External Data Integration
API endpoints for quote operations
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
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
            
            # TODO: Implement actual refresh logic using YahooFinanceAdapter
            # For now, return error indicating feature not implemented
            return jsonify({
                'status': 'error',
                'message': 'Manual quote refresh not yet implemented',
                'error_code': 'FEATURE_NOT_IMPLEMENTED',
                'ticker_symbol': ticker.symbol,
                'suggestion': 'This feature will be available in the next update. Data is refreshed automatically by the scheduler.'
            }), 501  # Not Implemented
            
        finally:
            db_session.close()
        
    except Exception as e:
        logger.error(f"Failed to refresh quote for ticker {ticker_id}: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to refresh quote for ticker {ticker_id}'
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
