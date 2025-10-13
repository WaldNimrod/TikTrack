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
from services.system_settings_service import SystemSettingsService
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
            
            # Get cache stats (settings from system-level)
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
                    
                    # Only check health for active providers
                    if provider.is_active and not provider.is_healthy:
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
                    # Only mark as unhealthy if provider is active
                    if provider.is_active:
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
            
            logger.info(
                f"external_data_status: providers={total_providers} active={active_providers} healthy={healthy_providers} "
                f"quotes={cache_stats.total_quotes} intraday={cache_stats.total_intraday_slots} recent_ops={len(recent_logs)}"
            )
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
            # Implement invalidate external_data + tickers per plan
            from services.advanced_cache_service import advanced_cache_service
            advanced_cache_service.invalidate_by_dependency('external_data')
            advanced_cache_service.invalidate_by_dependency('tickers')
            response = {
                'success': True,
                'message': 'External data cache invalidated (external_data, tickers)'
            }
            
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
            cache_manager = CacheManager(db_session)
            result = cache_manager.optimize_cache()
            response = {
                'success': True,
                'message': 'Cache optimized',
                'result': result
            }
            
            return jsonify(response), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error in optimize_cache_endpoint: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@status_bp.route('/group-refresh-history', methods=['GET'])
def get_group_refresh_history():
    """
    Get group refresh history for dashboard
    
    Returns:
    - JSON response with group refresh history
    """
    try:
        from services.data_refresh_scheduler import data_refresh_scheduler
        
        # Get limit from query parameters
        limit = request.args.get('limit', 50, type=int)
        
        if data_refresh_scheduler:
            history = data_refresh_scheduler.get_group_refresh_history(limit)
        else:
            # Fallback: query database directly
            from models.external_data import DataRefreshLog
            from config.database import SessionLocal
            
            db_session = SessionLocal()
            logs = db_session.query(DataRefreshLog).order_by(
                DataRefreshLog.start_time.desc()
            ).limit(limit).all()
            
            history = [
                {
                    'id': log.id,
                    'category': log.category,
                    'time_period': log.time_period,
                    'ticker_count': log.ticker_count,
                    'status': log.status,
                    'started_at': log.start_time.isoformat() if log.start_time else None,
                    'completed_at': log.end_time.isoformat() if log.end_time else None,
                    'successful_count': log.successful_count,
                    'failed_count': log.failed_count,
                    'message': log.message
                }
                for log in logs
            ]
        
        response = {
            'success': True,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'group_refresh_history': history,
            'total_entries': len(history),
            'source': 'data_refresh_scheduler'
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error in get_group_refresh_history: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@status_bp.route('/logs', methods=['GET'])
def get_data_logs():
    """
    Get data refresh logs for dashboard from server log files
    
    Returns:
    - JSON response with logs
    """
    try:
        import os
        import re
        from pathlib import Path
        
        # Get logs directory
        logs_dir = Path('logs')
        app_log_file = logs_dir / 'app.log'
        
        logs_data = []
        
        if app_log_file.exists():
            # Read last 5000 lines from app.log to get more historical data
            with open(app_log_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                # Get last 5000 lines to include more historical logs
                recent_lines = lines[-5000:] if len(lines) > 5000 else lines
                
                # Filter for external data related logs
                external_data_lines = []
                for line in recent_lines:
                    if any(keyword in line.lower() for keyword in ['yahoo', 'external', 'data', 'refresh', 'quote', 'symbol']):
                        external_data_lines.append(line.strip())
                
                # Parse logs and create log entries
                for line in external_data_lines:
                    try:
                        # Parse timestamp and log level
                        timestamp_match = re.search(r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})', line)
                        level_match = re.search(r' - (\w+) - ', line)
                        
                        if timestamp_match and level_match:
                            timestamp_str = timestamp_match.group(1)
                            level = level_match.group(1).lower()
                            
                            # Convert timestamp to ISO format
                            try:
                                from datetime import datetime
                                dt = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S,%f')
                                timestamp_iso = dt.isoformat()
                            except:
                                timestamp_iso = timestamp_str
                            
                            # Extract message (everything after the log level)
                            message_start = line.find(f' - {level_match.group(1)} - ') + len(f' - {level_match.group(1)} - ')
                            message = line[message_start:].strip()
                            
                            # Determine log level for display
                            if level in ['error', 'critical']:
                                display_level = 'error'
                            elif level in ['warning', 'warn']:
                                display_level = 'warning'
                            else:
                                display_level = 'info'
                            
                            log_entry = {
                                'timestamp': timestamp_iso,
                                'level': display_level,
                                'message': message,
                                'raw_line': line
                            }
                            logs_data.append(log_entry)
                            
                    except Exception as e:
                        # If parsing fails, create a basic log entry
                        log_entry = {
                            'timestamp': datetime.now(timezone.utc).isoformat(),
                            'level': 'info',
                            'message': line,
                            'raw_line': line
                        }
                        logs_data.append(log_entry)
                
                # Sort by timestamp (newest first) and limit to 100
                logs_data.sort(key=lambda x: x['timestamp'], reverse=True)
                logs_data = logs_data[:100]
        
        response = {
            'success': True,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'logs': logs_data,
            'total_logs': len(logs_data),
            'source': 'server_log_files'
        }
        
        return jsonify(response), 200
        
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
        
        svc = SystemSettingsService(next(get_db()))
        updates = {
            'ttlActiveSeconds': hot_cache_ttl * 60,
            'ttlOpenSeconds': warm_cache_ttl * 60,
            'externalDataMaxBatchSize': max_requests_hour // 10  # simple mapping; can be refined
        }
        results = {}
        for k, v in updates.items():
            results[k] = svc.set_setting(k, v, updated_by='external_data_dashboard')
        # Invalidate caches per plan
        from services.advanced_cache_service import advanced_cache_service
        advanced_cache_service.invalidate_by_dependency('external_data')
        advanced_cache_service.invalidate_by_dependency('tickers')
        return jsonify({
            'success': True,
            'message': 'Settings updated',
            'results': results
        }), 200
        
    except Exception as e:
        logger.error(f"Error in update_external_data_settings: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@status_bp.route('/groups/status', methods=['GET'])
def get_group_refresh_status():
    """
    Get refresh status for all ticker groups
    
    Returns:
    - JSON response with group refresh status
    """
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            from models.ticker import Ticker
            from models.trade import Trade
            from models.market_data_quote import MarketDataQuote
            
            # Get current time
            current_time = datetime.now()
            
            # Define groups and their refresh intervals (in minutes)
            groups = {
                'open_active_trades': {
                    'name': 'Open + Active Trades',
                    'refresh_interval': 5,  # 5 minutes for active trades
                    'description': 'טיקרים פתוחים עם טריידים פעילים'
                },
                'open_no_active_trades': {
                    'name': 'Open + No Active Trades', 
                    'refresh_interval': 60,  # 60 minutes for no active trades
                    'description': 'טיקרים פתוחים ללא טריידים פעילים'
                },
                'closed_cancelled': {
                    'name': 'Closed/Cancelled',
                    'refresh_interval': 1440,  # 24 hours (daily)
                    'description': 'טיקרים סגורים או מבוטלים'
                }
            }
            
            group_status = {}
            
            for group_key, group_info in groups.items():
                # Query tickers for this group
                if group_key == 'open_active_trades':
                    # Tickers with active trades
                    tickers = db_session.query(Ticker).join(
                        Trade, Ticker.id == Trade.ticker_id
                    ).filter(
                        Ticker.status == 'open',
                        Trade.status == 'open'
                    ).distinct().all()
                    
                elif group_key == 'open_no_active_trades':
                    # Tickers without active trades
                    tickers = db_session.query(Ticker).outerjoin(
                        Trade, (Ticker.id == Trade.ticker_id) & (Trade.status == 'open')
                    ).filter(
                        Ticker.status == 'open',
                        Trade.id.is_(None)
                    ).all()
                    
                else:  # closed_cancelled
                    # Closed or cancelled tickers
                    tickers = db_session.query(Ticker).filter(
                        Ticker.status.in_(['closed', 'cancelled'])
                    ).all()
                
                # Get last refresh time for this group
                if tickers:
                    ticker_ids = [t.id for t in tickers]
                    last_quote = db_session.query(MarketDataQuote).filter(
                        MarketDataQuote.ticker_id.in_(ticker_ids)
                    ).order_by(MarketDataQuote.asof_utc.desc()).first()
                    
                    last_refresh = last_quote.asof_utc if last_quote else None
                else:
                    last_refresh = None
                
                # Calculate next refresh time
                if last_refresh:
                    next_refresh = last_refresh + timedelta(minutes=group_info['refresh_interval'])
                    time_since_refresh = (current_time - last_refresh).total_seconds() / 60
                    needs_refresh = time_since_refresh >= group_info['refresh_interval']
                else:
                    next_refresh = None
                    time_since_refresh = None
                    needs_refresh = True
                
                group_status[group_key] = {
                    'name': group_info['name'],
                    'description': group_info['description'],
                    'ticker_count': len(tickers),
                    'symbols': [t.symbol for t in tickers[:10]],  # First 10 symbols
                    'refresh_interval_minutes': group_info['refresh_interval'],
                    'last_refresh': last_refresh.isoformat() if last_refresh else None,
                    'next_refresh': next_refresh.isoformat() if next_refresh else None,
                    'time_since_refresh_minutes': round(time_since_refresh, 2) if time_since_refresh else None,
                    'needs_refresh': needs_refresh,
                    'status': 'needs_refresh' if needs_refresh else 'up_to_date'
                }
            
            response = {
                'success': True,
                'timestamp': current_time.isoformat(),
                'groups': group_status,
                'summary': {
                    'total_groups': len(groups),
                    'groups_needing_refresh': sum(1 for g in group_status.values() if g['needs_refresh']),
                    'total_tickers': sum(g['ticker_count'] for g in group_status.values())
                }
            }
            
            return jsonify(response), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error in get_group_refresh_status: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500
