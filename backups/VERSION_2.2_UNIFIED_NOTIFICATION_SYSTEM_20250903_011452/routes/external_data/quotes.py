"""
Quotes API Routes - External Data Integration
API endpoints for quote operations
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import logging

from services.external_data import YahooFinanceAdapter
from models.external_data import ExternalDataProvider
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
        
        # This would be implemented when the service is integrated
        quote_data = {
            'ticker_id': ticker_id,
            'symbol': 'AAPL',  # Would be fetched from database
            'price': 150.25,
            'change_amount': 2.50,
            'change_percent': 1.69,
            'volume': 1500000,
            'high_24h': 152.00,
            'low_24h': 148.50,
            'provider': 'yahoo_finance',
            'asof_utc': datetime.now(timezone.utc).isoformat(),
            'fetched_at': datetime.now(timezone.utc).isoformat(),
            'refresh_interval': 5,
            'next_refresh': datetime.now(timezone.utc).isoformat()
        }
        
        # Add timezone info if user_id provided
        if user_id:
            quote_data['asof_local'] = quote_data['asof_utc']  # Placeholder
            quote_data['fetched_at_local'] = quote_data['fetched_at']  # Placeholder
        
        return jsonify({
            'status': 'success',
            'data': quote_data
        }), 200
        
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
        
        # This would be implemented when the service is integrated
        quotes_data = []
        for ticker_id in ticker_ids:
            quote_data = {
                'ticker_id': ticker_id,
                'symbol': f'SYMBOL_{ticker_id}',  # Would be fetched from database
                'price': 100.0 + ticker_id,
                'change_amount': 1.0,
                'change_percent': 1.0,
                'volume': 1000000,
                'high_24h': 102.0,
                'low_24h': 98.0,
                'provider': 'yahoo_finance',
                'asof_utc': datetime.now(timezone.utc).isoformat(),
                'fetched_at': datetime.now(timezone.utc).isoformat()
            }
            
            # Add timezone info if user_id provided
            if user_id:
                quote_data['asof_local'] = quote_data['asof_utc']  # Placeholder
                quote_data['fetched_at_local'] = quote_data['fetched_at']  # Placeholder
            
            quotes_data.append(quote_data)
        
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
        
        # This would be implemented when historical data is available
        history_data = [
            {
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'price': 150.25,
                'volume': 1500000
            }
        ]
        
        return jsonify({
            'status': 'success',
            'data': {
                'ticker_id': ticker_id,
                'history': history_data,
                'days': days,
                'interval': interval
            }
        }), 200
        
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
        
        # This would be implemented when the service is integrated
        result = {
            'ticker_id': ticker_id,
            'message': 'Refresh initiated',
            'force_refresh': force_refresh,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        return jsonify({
            'status': 'success',
            'data': result
        }), 200
        
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
                    adapter = YahooFinanceAdapter(db_session, provider.id)
                    status = adapter.get_provider_status()
                    
                    providers_data.append({
                        'id': provider.id,
                        'name': provider.name,
                        'display_name': provider.display_name,
                        'is_active': provider.is_active,
                        'is_healthy': provider.is_healthy,
                        'last_successful_request': provider.last_successful_request.isoformat() if provider.last_successful_request else None,
                        'last_error': provider.last_error,
                        'error_count': provider.error_count,
                        'rate_limit_remaining': status.get('rate_limit_remaining', 0),
                        'recent_success_rate': status.get('recent_success_rate', 0)
                    })
                    
                except Exception as e:
                    logger.error(f"Error getting status for provider {provider.id}: {e}")
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
