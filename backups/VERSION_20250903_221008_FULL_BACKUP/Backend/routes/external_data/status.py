"""
External Data Status API Routes
Handles system status and health monitoring for external data services
"""

from flask import Blueprint, request, jsonify, current_app
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List

from services.external_data import YahooFinanceAdapter, CacheManager
from models.external_data import ExternalDataProvider, DataRefreshLog, MarketDataQuote
from config.database import get_db

# Configure logging
logger = logging.getLogger(__name__)

# Create Blueprint
status_bp = Blueprint('external_data_status', __name__, url_prefix='/api/external-data/status')

@status_bp.route('/', methods=['GET'])
def get_system_status():
    """
    Get overall system status for external data services
    
    Returns:
    - JSON response with system status
    """
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get all providers
            providers = db_session.query(ExternalDataProvider).all()
            
            # Get cache stats
            cache_manager = CacheManager(db_session)
            cache_stats = cache_manager.get_cache_stats()
            
            # Get recent activity
            now = datetime.now(timezone.utc)
            hour_ago = now - timedelta(hours=1)
            day_ago = now - timedelta(days=1)
            
            recent_logs = db_session.query(DataRefreshLog).filter(
                DataRefreshLog.start_time >= hour_ago
            ).all()
            
            recent_quotes = db_session.query(MarketDataQuote).filter(
                MarketDataQuote.fetched_at >= hour_ago
            ).count()
            
            # Calculate success rates
            successful_logs = [log for log in recent_logs if log.status == 'success']
            success_rate = len(successful_logs) / len(recent_logs) if recent_logs else 0
            
            # Provider statuses
            provider_statuses = []
            overall_health = True
            
            for provider in providers:
                try:
                    adapter = YahooFinanceAdapter(db_session, provider.id)
                    status = adapter.get_provider_status()
                    
                    provider_statuses.append({
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
                    
                    if not provider.is_healthy:
                        overall_health = False
                        
                except Exception as e:
                    logger.error(f"Error getting status for provider {provider.id}: {e}")
                    provider_statuses.append({
                        'id': provider.id,
                        'name': provider.name,
                        'display_name': provider.display_name,
                        'is_active': provider.is_active,
                        'is_healthy': False,
                        'error': str(e)
                    })
                    overall_health = False
            
            # System metrics
            total_providers = len(providers)
            active_providers = len([p for p in providers if p.is_active])
            healthy_providers = len([p for p in providers if p.is_healthy])
            
            response = {
                'success': True,
                'timestamp': now.isoformat(),
                'service': 'external_data_system',
                'status': 'operational' if overall_health else 'degraded',
                'overall_health': overall_health,
                'providers': {
                    'total': total_providers,
                    'active': active_providers,
                    'healthy': healthy_providers,
                    'details': provider_statuses
                },
                'cache': {
                    'total_quotes': cache_stats.total_quotes,
                    'total_intraday_slots': cache_stats.total_intraday_slots,
                    'cache_hit_rate': cache_stats.cache_hit_rate,
                    'stale_data_count': cache_stats.stale_data_count
                },
                'recent_activity': {
                    'last_hour': {
                        'refresh_operations': len(recent_logs),
                        'success_rate': success_rate,
                        'quotes_fetched': recent_quotes
                    },
                    'last_24_hours': {
                        'quotes_fetched': db_session.query(MarketDataQuote).filter(
                            MarketDataQuote.fetched_at >= day_ago
                        ).count()
                    }
                }
            }
            
            return jsonify(response), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error in get_system_status: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@status_bp.route('/providers', methods=['GET'])
def get_providers_status():
    """
    Get detailed status for all providers
    
    Returns:
    - JSON response with provider statuses
    """
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            providers = db_session.query(ExternalDataProvider).all()
            
            provider_details = []
            for provider in providers:
                try:
                    adapter = YahooFinanceAdapter(db_session, provider.id)
                    status = adapter.get_provider_status()
                    
                    # Get recent logs for this provider
                    hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
                    recent_logs = db_session.query(DataRefreshLog).filter(
                        DataRefreshLog.provider_id == provider.id,
                        DataRefreshLog.start_time >= hour_ago
                    ).all()
                    
                    successful_logs = [log for log in recent_logs if log.status == 'success']
                    success_rate = len(successful_logs) / len(recent_logs) if recent_logs else 0
                    
                    provider_details.append({
                        'id': provider.id,
                        'name': provider.name,
                        'display_name': provider.display_name,
                        'provider_type': provider.provider_type,
                        'is_active': provider.is_active,
                        'is_healthy': provider.is_healthy,
                        'base_url': provider.base_url,
                        'rate_limit_per_hour': provider.rate_limit_per_hour,
                        'timeout_seconds': provider.timeout_seconds,
                        'retry_attempts': provider.retry_attempts,
                        'last_successful_request': provider.last_successful_request.isoformat() if provider.last_successful_request else None,
                        'last_error': provider.last_error,
                        'error_count': provider.error_count,
                        'recent_activity': {
                            'operations_last_hour': len(recent_logs),
                            'success_rate': success_rate,
                            'rate_limit_remaining': status.get('rate_limit_remaining', 0)
                        },
                        'created_at': provider.created_at.isoformat() if provider.created_at else None,
                        'updated_at': provider.updated_at.isoformat() if provider.updated_at else None
                    })
                    
                except Exception as e:
                    logger.error(f"Error getting detailed status for provider {provider.id}: {e}")
                    provider_details.append({
                        'id': provider.id,
                        'name': provider.name,
                        'display_name': provider.display_name,
                        'error': str(e)
                    })
            
            response = {
                'success': True,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'service': 'external_data_providers',
                'providers_count': len(providers),
                'providers': provider_details
            }
            
            return jsonify(response), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error in get_providers_status: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@status_bp.route('/providers/<int:provider_id>', methods=['GET'])
def get_provider_status(provider_id: int):
    """
    Get detailed status for a specific provider
    
    Path Parameters:
    - provider_id: Provider ID
    
    Returns:
    - JSON response with provider status
    """
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            provider = db_session.query(ExternalDataProvider).filter(
                ExternalDataProvider.id == provider_id
            ).first()
            
            if not provider:
                return jsonify({
                    'error': f'Provider {provider_id} not found'
                }), 404
            
            # Get detailed status
            adapter = YahooFinanceAdapter(db_session, provider_id)
            status = adapter.get_provider_status()
            
            # Get recent logs
            hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
            day_ago = datetime.now(timezone.utc) - timedelta(days=1)
            
            recent_logs = db_session.query(DataRefreshLog).filter(
                DataRefreshLog.provider_id == provider_id,
                DataRefreshLog.start_time >= hour_ago
            ).all()
            
            daily_logs = db_session.query(DataRefreshLog).filter(
                DataRefreshLog.provider_id == provider_id,
                DataRefreshLog.start_time >= day_ago
            ).all()
            
            # Calculate metrics
            successful_recent = [log for log in recent_logs if log.status == 'success']
            successful_daily = [log for log in daily_logs if log.status == 'success']
            
            recent_success_rate = len(successful_recent) / len(recent_logs) if recent_logs else 0
            daily_success_rate = len(successful_daily) / len(daily_logs) if daily_logs else 0
            
            # Get recent quotes count
            recent_quotes = db_session.query(MarketDataQuote).filter(
                MarketDataQuote.provider_id == provider_id,
                MarketDataQuote.fetched_at >= hour_ago
            ).count()
            
            response = {
                'success': True,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'provider': {
                    'id': provider.id,
                    'name': provider.name,
                    'display_name': provider.display_name,
                    'provider_type': provider.provider_type,
                    'is_active': provider.is_active,
                    'is_healthy': provider.is_healthy,
                    'base_url': provider.base_url,
                    'rate_limit_per_hour': provider.rate_limit_per_hour,
                    'timeout_seconds': provider.timeout_seconds,
                    'retry_attempts': provider.retry_attempts,
                    'cache_ttl_hot': provider.cache_ttl_hot,
                    'cache_ttl_warm': provider.cache_ttl_warm,
                    'max_symbols_per_batch': provider.max_symbols_per_batch,
                    'preferred_batch_size': provider.preferred_batch_size,
                    'last_successful_request': provider.last_successful_request.isoformat() if provider.last_successful_request else None,
                    'last_error': provider.last_error,
                    'error_count': provider.error_count,
                    'created_at': provider.created_at.isoformat() if provider.created_at else None,
                    'updated_at': provider.updated_at.isoformat() if provider.updated_at else None
                },
                'status': status,
                'metrics': {
                    'last_hour': {
                        'operations': len(recent_logs),
                        'success_rate': recent_success_rate,
                        'quotes_fetched': recent_quotes
                    },
                    'last_24_hours': {
                        'operations': len(daily_logs),
                        'success_rate': daily_success_rate
                    }
                }
            }
            
            return jsonify(response), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error in get_provider_status for {provider_id}: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@status_bp.route('/health', methods=['GET'])
def health_check():
    """
    Simple health check endpoint
    
    Returns:
    - JSON response with health status
    """
    try:
        response = {
            'success': True,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'service': 'external_data_system',
            'status': 'healthy',
            'version': '1.0.0'
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error in health_check: {e}")
        return jsonify({
            'success': False,
            'error': 'Health check failed',
            'message': str(e)
        }), 500

@status_bp.route('/yahoo-finance', methods=['GET'])
def get_yahoo_finance_status():
    """
    Get Yahoo Finance provider status
    
    Returns:
    - JSON response with Yahoo Finance status
    """
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get Yahoo Finance provider
            provider = db_session.query(ExternalDataProvider).filter(
                ExternalDataProvider.name == 'yahoo_finance'
            ).first()
            
            if not provider:
                return jsonify({
                    'error': 'Yahoo Finance provider not found'
                }), 404
            
            # Get provider status
            adapter = YahooFinanceAdapter(db_session, provider.id)
            status = adapter.get_provider_status()
            
            response = {
                'success': True,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'provider': {
                    'id': provider.id,
                    'name': provider.name,
                    'display_name': provider.display_name,
                    'is_active': provider.is_active,
                    'is_healthy': provider.is_healthy,
                    'last_successful_request': provider.last_successful_request.isoformat() if provider.last_successful_request else None,
                    'last_error': provider.last_error,
                    'error_count': provider.error_count
                },
                'status': status
            }
            
            return jsonify(response), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error in get_yahoo_finance_status: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@status_bp.route('/cache', methods=['GET'])
def get_cache_status():
    """
    Get cache status
    
    Returns:
    - JSON response with cache status
    """
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get cache stats
            cache_manager = CacheManager(db_session)
            cache_stats = cache_manager.get_cache_stats()
            
            response = {
                'success': True,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'cache': {
                    'total_quotes': cache_stats.total_quotes,
                    'total_intraday_slots': cache_stats.total_intraday_slots,
                    'cache_hit_rate': cache_stats.cache_hit_rate,
                    'stale_data_count': cache_stats.stale_data_count
                }
            }
            
            return jsonify(response), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error in get_cache_status: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@status_bp.route('/database', methods=['GET'])
def get_database_status():
    """
    Get database status
    
    Returns:
    - JSON response with database status
    """
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get basic database info
            providers_count = db_session.query(ExternalDataProvider).count()
            quotes_count = db_session.query(MarketDataQuote).count()
            logs_count = db_session.query(DataRefreshLog).count()
            
            response = {
                'success': True,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'database': {
                    'providers_count': providers_count,
                    'quotes_count': quotes_count,
                    'logs_count': logs_count,
                    'status': 'healthy'
                }
            }
            
            return jsonify(response), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error in get_database_status: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@status_bp.route('/api', methods=['GET'])
def get_api_status():
    """
    Get API status
    
    Returns:
    - JSON response with API status
    """
    try:
        response = {
            'success': True,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'api': {
                'status': 'operational',
                'version': '1.0.0',
                'endpoints': [
                    '/api/external-data/status',
                    '/api/external-data/quotes',
                    '/api/external-data/status/yahoo-finance',
                    '/api/external-data/status/cache',
                    '/api/external-data/status/database',
                    '/api/external-data/status/api'
                ]
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error in get_api_status: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

# Additional endpoints for dashboard

@status_bp.route('/cache/stats', methods=['GET'])
def get_detailed_cache_stats():
    """
    Get detailed cache statistics for dashboard
    
    Returns:
    - JSON response with detailed cache statistics
    """
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get cache stats
            cache_manager = CacheManager(db_session)
            cache_stats = cache_manager.get_cache_stats()
            
            response = {
                'success': True,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'total_quotes': cache_stats.total_quotes,
                'total_intraday_slots': cache_stats.total_intraday_slots,
                'cache_hit_rate': cache_stats.cache_hit_rate,
                'stale_data': cache_stats.stale_data_count,
                'avg_quote_age_minutes': cache_stats.avg_quote_age_minutes if hasattr(cache_stats, 'avg_quote_age_minutes') else 0
            }
            
            return jsonify(response), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error in get_detailed_cache_stats: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@status_bp.route('/cache/clear', methods=['POST'])
def clear_cache_endpoint():
    """
    Clear the cache
    
    Returns:
    - JSON response with operation result
    """
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # TODO: Implement actual cache clearing
            # For now, return error indicating feature not implemented
            return jsonify({
                'success': False,
                'error_code': 'FEATURE_NOT_IMPLEMENTED',
                'message': 'Cache clearing not yet implemented',
                'suggestion': 'This feature will be available in the next update'
            }), 501  # Not Implemented
            
            return jsonify(response), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error in clear_cache_endpoint: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@status_bp.route('/cache/optimize', methods=['POST'])
def optimize_cache_endpoint():
    """
    Optimize the cache
    
    Returns:
    - JSON response with operation result
    """
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # TODO: Implement actual cache optimization
            # For now, return error indicating feature not implemented
            return jsonify({
                'success': False,
                'error_code': 'FEATURE_NOT_IMPLEMENTED',
                'message': 'Cache optimization not yet implemented',
                'suggestion': 'This feature will be available in the next update'
            }), 501  # Not Implemented
            
            return jsonify(response), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error in optimize_cache_endpoint: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@status_bp.route('/logs', methods=['GET'])
def get_data_logs():
    """
    Get data refresh logs for dashboard
    
    Returns:
    - JSON response with logs
    """
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get recent logs
            logs = db_session.query(DataRefreshLog).order_by(DataRefreshLog.start_time.desc()).limit(100).all()
            
            logs_data = []
            for log in logs:
                log_data = {
                    'id': log.id,
                    'timestamp': log.start_time.isoformat() if log.start_time else None,
                    'level': 'info' if log.status == 'success' else 'error',
                    'message': f"{log.operation_type}: {log.status} - {log.symbols_successful}/{log.symbols_requested} symbols",
                    'provider_id': log.provider_id,
                    'status': log.status,
                    'operation_type': log.operation_type,
                    'symbols_requested': log.symbols_requested,
                    'symbols_successful': log.symbols_successful,
                    'symbols_failed': log.symbols_failed,
                    'total_duration_ms': log.total_duration_ms,
                    'error_message': log.error_message
                }
                logs_data.append(log_data)
            
            response = {
                'success': True,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'logs': logs_data
            }
            
            return jsonify(response), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error in get_data_logs: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@status_bp.route('/logs/clear', methods=['POST'])
def clear_data_logs():
    """
    Clear data refresh logs
    
    Returns:
    - JSON response with operation result
    """
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # TODO: Implement actual log clearing
            # For now, return error indicating feature not implemented
            return jsonify({
                'success': False,
                'error_code': 'FEATURE_NOT_IMPLEMENTED',
                'message': 'Log clearing not yet implemented',
                'suggestion': 'This feature will be available in the next update'
            }), 501  # Not Implemented
            
            return jsonify(response), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error in clear_data_logs: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@status_bp.route('/providers/test-all', methods=['POST'])
def test_all_providers_endpoint():
    """
    Test all external data providers
    
    Returns:
    - JSON response with test results
    """
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get all providers
            providers = db_session.query(ExternalDataProvider).all()
            
            test_results = []
            overall_success = True
            
            for provider in providers:
                try:
                    # TODO: Implement actual provider testing
                    # For now, return basic status
                    logger.info(f"Testing provider: {provider.name}")
                    
                    test_result = {
                        'provider_id': provider.id,
                        'provider_name': provider.name,
                        'display_name': provider.display_name,
                        'test_status': 'not_implemented',
                        'response_time_ms': 0,  # Will be measured when implemented
                        'is_healthy': provider.is_healthy,
                        'is_active': provider.is_active,
                        'message': 'Provider testing not yet implemented'
                    }
                    
                    if not provider.is_healthy:
                        overall_success = False
                        test_result['test_status'] = 'warning'
                    
                    test_results.append(test_result)
                    
                except Exception as e:
                    logger.error(f"Error testing provider {provider.name}: {e}")
                    test_result = {
                        'provider_id': provider.id,
                        'provider_name': provider.name,
                        'display_name': provider.display_name,
                        'test_status': 'error',
                        'error_message': str(e),
                        'is_healthy': False,
                        'is_active': provider.is_active
                    }
                    test_results.append(test_result)
                    overall_success = False
            
            response = {
                'success': overall_success,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'message': f'Tested {len(providers)} providers',
                'test_results': test_results,
                'total_providers': len(providers),
                'successful_tests': len([r for r in test_results if r['test_status'] == 'success']),
                'failed_tests': len([r for r in test_results if r['test_status'] == 'error'])
            }
            
            return jsonify(response), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error in test_all_providers_endpoint: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@status_bp.route('/settings', methods=['POST'])
def update_external_data_settings():
    """
    Update external data system settings
    
    Returns:
    - JSON response with operation result
    """
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Bad request',
                'message': 'No data provided'
            }), 400
        
        # Extract settings
        hot_cache_ttl = data.get('hot_cache_ttl', 1)
        warm_cache_ttl = data.get('warm_cache_ttl', 5)
        max_requests_hour = data.get('max_requests_hour', 900)
        
        # Validate settings
        if not (1 <= hot_cache_ttl <= 60):
            return jsonify({
                'error': 'Bad request',
                'message': 'hot_cache_ttl must be between 1 and 60'
            }), 400
        
        if not (1 <= warm_cache_ttl <= 120):
            return jsonify({
                'error': 'Bad request',
                'message': 'warm_cache_ttl must be between 1 and 120'
            }), 400
        
        if not (100 <= max_requests_hour <= 2000):
            return jsonify({
                'error': 'Bad request',
                'message': 'max_requests_hour must be between 100 and 2000'
            }), 400
        
        # TODO: Implement actual settings update
        # For now, return error indicating feature not implemented
        return jsonify({
            'success': False,
            'error_code': 'FEATURE_NOT_IMPLEMENTED',
            'message': 'Settings update not yet implemented',
            'suggestion': 'This feature will be available in the next update'
        }), 501  # Not Implemented
        
    except Exception as e:
        logger.error(f"Error in update_external_data_settings: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500
