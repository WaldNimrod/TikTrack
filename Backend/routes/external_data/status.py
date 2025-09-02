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
