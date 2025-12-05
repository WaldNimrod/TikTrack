"""
External Data Status API Routes
Handles system status and health monitoring for external data services
"""

from flask import Blueprint, request, jsonify, current_app
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from pathlib import Path

from services.external_data import YahooFinanceAdapter, CacheManager
from services.advanced_cache_service import advanced_cache_service
from models.external_data import ExternalDataProvider, DataRefreshLog, MarketDataQuote, IntradayDataSlot
from config.database import get_db
from routes.api.base_entity_decorators import require_authentication

# Configure logging
logger = logging.getLogger(__name__)

# External data refresh scheduler instance will be set from app.py
data_refresh_scheduler = None

def set_data_refresh_scheduler(scheduler):
    """Set the data refresh scheduler instance from app.py"""
    global data_refresh_scheduler
    data_refresh_scheduler = scheduler

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

            # Prepare shared adapter for formatting (fall back to provider 1)
            formatter_adapter = None
            if providers:
                try:
                    formatter_adapter = YahooFinanceAdapter(db_session, providers[0].id)
                except Exception:
                    formatter_adapter = None
            if formatter_adapter is None:
                formatter_adapter = YahooFinanceAdapter(db_session, providers[0].id if providers else 1)

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
                        'last_successful_request': status.get('last_successful_request') or adapter.build_time_payload(provider.last_successful_request),
                        'last_error': provider.last_error,
                        'error_count': provider.error_count,
                        'rate_limit_per_hour': provider.rate_limit_per_hour,
                        'rate_limit_remaining': status.get('rate_limit_remaining', 0),
                        'recent_success_rate': status.get('recent_success_rate', 0),
                        'market_status': status.get('market_status'),
                        'cache_ttl_hot': provider.cache_ttl_hot,
                        'cache_ttl_warm': provider.cache_ttl_warm,
                        'metrics_timestamp': status.get('timestamp')
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
                'timestamp': formatter_adapter.build_time_payload(now),
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
                    'stale_data_count': cache_stats.stale_data_count,
                    'avg_quote_age_minutes': cache_stats.avg_quote_age_minutes,
                    'avg_intraday_age_minutes': cache_stats.avg_intraday_age_minutes,
                    'ttl_seconds': getattr(cache_manager, 'ttl_settings', None),
                    'ttl_minutes': {
                        key: round(value / 60, 2)
                        for key, value in getattr(cache_manager, 'ttl_settings', {}).items()
                    } if getattr(cache_manager, 'ttl_settings', None) else None
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
            formatter_adapter = None
            if providers:
                try:
                    formatter_adapter = YahooFinanceAdapter(db_session, providers[0].id)
                except Exception:
                    formatter_adapter = None
            if formatter_adapter is None:
                formatter_adapter = YahooFinanceAdapter(db_session, providers[0].id if providers else 1)

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
                        'last_successful_request': status.get('last_successful_request') or adapter.build_time_payload(provider.last_successful_request),
                        'last_error': provider.last_error,
                        'error_count': provider.error_count,
                        'recent_activity': {
                            'operations_last_hour': len(recent_logs),
                            'success_rate': success_rate,
                            'rate_limit_remaining': status.get('rate_limit_remaining', 0)
                        },
                        'created_at': adapter.build_time_payload(provider.created_at),
                        'updated_at': adapter.build_time_payload(provider.updated_at)
                    })
                    
                except Exception as e:
                    logger.error(f"Error getting detailed status for provider {provider.id}: {e}")
                    provider_details.append({
                        'id': provider.id,
                        'name': provider.name,
                        'display_name': provider.display_name,
                        'error': str(e)
                    })
            
            now = datetime.now(timezone.utc)
            response = {
                'success': True,
                'timestamp': formatter_adapter.build_time_payload(now),
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
                'timestamp': adapter.build_time_payload(datetime.now(timezone.utc)),
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
                    'last_successful_request': adapter.build_time_payload(provider.last_successful_request),
                    'last_error': provider.last_error,
                    'error_count': provider.error_count,
                    'created_at': adapter.build_time_payload(provider.created_at),
                    'updated_at': adapter.build_time_payload(provider.updated_at)
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
                'timestamp': adapter.build_time_payload(datetime.now(timezone.utc)),
                'provider': {
                    'id': provider.id,
                    'name': provider.name,
                    'display_name': provider.display_name,
                    'is_active': provider.is_active,
                    'is_healthy': provider.is_healthy,
                    'last_successful_request': adapter.build_time_payload(provider.last_successful_request),
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
                'status': 'success',
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'data': {
                    'total_entries': cache_stats.total_quotes,
                    'total_quotes': cache_stats.total_quotes,
                    'total_intraday_slots': cache_stats.total_intraday_slots,
                    'expired_entries': cache_stats.stale_data_count,
                    'stale_data': cache_stats.stale_data_count,
                    'stale_data_count': cache_stats.stale_data_count,
                    'hit_rate': cache_stats.cache_hit_rate,
                    'cache_hit_rate': cache_stats.cache_hit_rate,
                    'estimated_memory_mb': 0,  # Not calculated for external data cache
                    'avg_quote_age_minutes': cache_stats.avg_quote_age_minutes if hasattr(cache_stats, 'avg_quote_age_minutes') else 0
                }
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
@require_authentication()  # TODO: Add admin role check when roles are implemented
def clear_cache_endpoint():
    """
    Clear the cache
    
    Returns:
    - JSON response with operation result
    """
    try:
        db_session = next(get_db())
        deleted_quotes = deleted_intraday = deleted_logs = quotes_last_deleted = 0
        try:
            deleted_quotes = db_session.query(MarketDataQuote).delete()
            deleted_intraday = db_session.query(IntradayDataSlot).delete()
            deleted_logs = db_session.query(DataRefreshLog).delete()
            quotes_last_result = db_session.execute(text("DELETE FROM quotes_last"))
            quotes_last_deleted = quotes_last_result.rowcount if quotes_last_result else 0
            db_session.commit()
        except Exception as db_error:
            db_session.rollback()
            raise db_error
        finally:
            db_session.close()

        try:
            advanced_cache_service.clear()
        except Exception as cache_error:
            logger.warning(f"Failed to clear advanced cache: {cache_error}")

        response = {
            'success': True,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'message': 'External data cache cleared successfully',
            'cleared': {
                'market_data_quotes': deleted_quotes,
                'intraday_slots': deleted_intraday,
                'data_refresh_logs': deleted_logs,
                'quotes_last': quotes_last_deleted,
            }
        }
        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Error in clear_cache_endpoint: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@status_bp.route('/cache/optimize', methods=['POST'])
@require_authentication()  # TODO: Add admin role check when roles are implemented
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

@status_bp.route('/scheduler/history', methods=['GET'])
@status_bp.route('/group-refresh-history', methods=['GET'])
def get_group_refresh_history():
    """
    Get group refresh history for dashboard
    
    Returns:
    - JSON response with group refresh history
    """
    try:
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
@require_authentication()  # TODO: Add admin role check when roles are implemented
def clear_data_logs():
    """
    Clear data refresh logs
    
    Returns:
    - JSON response with operation result
    """
    try:
        logs_dir = Path('logs')
        cleared_files = []
        if logs_dir.exists():
            for log_file in logs_dir.glob('*.log*'):
                if log_file.is_file():
                    try:
                        log_file.write_text('', encoding='utf-8')
                        cleared_files.append(log_file.name)
                    except Exception as file_error:
                        logger.warning(f"Failed to clear log file {log_file}: {file_error}")

        db_session = next(get_db())
        deleted_logs = 0
        try:
            deleted_logs = db_session.query(DataRefreshLog).delete()
            db_session.commit()
        except Exception as db_error:
            db_session.rollback()
            raise db_error
        finally:
            db_session.close()

        response = {
            'success': True,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'message': 'External data logs cleared successfully',
            'cleared': {
                'data_refresh_logs': deleted_logs,
                'log_files': cleared_files
            }
        }

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Error in clear_data_logs: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@status_bp.route('/providers/test-all', methods=['POST'])
@require_authentication()  # TODO: Add admin role check when roles are implemented
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
@require_authentication()  # TODO: Add admin role check when roles are implemented
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

@status_bp.route('/scheduler/monitoring', methods=['GET'])
def get_scheduler_monitoring():
    """
    Get comprehensive scheduler monitoring information
    
    Returns:
    - JSON response with scheduler status, history, performance metrics, and alerts
    """
    try:
        from models.external_data import DataRefreshLog
        from config.database import SessionLocal
        
        db_session = SessionLocal()
        
        try:
            # Get scheduler status
            scheduler_status = None
            if data_refresh_scheduler:
                scheduler_status = data_refresh_scheduler.get_scheduler_status()
            else:
                scheduler_status = {
                    'scheduler_running': False,
                    'message': 'Scheduler not available',
                    'current_ny_time': datetime.now(timezone.utc).isoformat(),
                    'is_trading_time': False,
                    'refresh_policy': None,
                    'config': None,
                    'last_refresh': None,
                    'next_refresh': None,
                    'total_refreshes': 0,
                    'successful_refreshes': 0,
                    'failed_refreshes': 0,
                    'started_at': None
                }
            
            # Get recent refresh history (last 10)
            recent_refreshes = db_session.query(DataRefreshLog).filter(
                DataRefreshLog.operation_type == 'group_refresh'
            ).order_by(
                DataRefreshLog.start_time.desc()
            ).limit(10).all()
            
            refresh_history = [
                {
                    'id': log.id,
                    'category': log.category,
                    'time_period': log.time_period,
                    'ticker_count': log.ticker_count,
                    'status': log.status,
                    'started_at': log.start_time.isoformat() if log.start_time else None,
                    'completed_at': log.end_time.isoformat() if log.end_time else None,
                    'duration_ms': log.total_duration_ms,
                    'successful_count': log.successful_count,
                    'failed_count': log.failed_count,
                    'message': log.message
                }
                for log in recent_refreshes
            ]
            
            # Calculate performance metrics
            total_refreshes = scheduler_status.get('total_refreshes', 0)
            successful_refreshes = scheduler_status.get('successful_refreshes', 0)
            failed_refreshes = scheduler_status.get('failed_refreshes', 0)
            
            success_rate = (successful_refreshes / total_refreshes * 100) if total_refreshes > 0 else 0
            
            # Calculate average duration from recent refreshes
            completed_refreshes = [r for r in refresh_history if r['completed_at'] and r['duration_ms']]
            avg_duration_ms = sum(r['duration_ms'] for r in completed_refreshes) / len(completed_refreshes) if completed_refreshes else None
            
            performance_metrics = {
                'total_refreshes': total_refreshes,
                'successful_refreshes': successful_refreshes,
                'failed_refreshes': failed_refreshes,
                'success_rate': round(success_rate, 2),
                'average_duration_ms': round(avg_duration_ms, 2) if avg_duration_ms else None,
                'recent_refreshes_count': len(refresh_history)
            }
            
            # Generate alerts
            alerts = []
            
            # Check if scheduler is not running
            if not scheduler_status.get('scheduler_running', False):
                alerts.append({
                    'level': 'warning',
                    'message': 'Scheduler is not running',
                    'type': 'scheduler_stopped'
                })
            
            # Check success rate
            if total_refreshes > 10 and success_rate < 80:
                alerts.append({
                    'level': 'error',
                    'message': f'Low success rate: {success_rate:.1f}%',
                    'type': 'low_success_rate',
                    'value': success_rate
                })
            elif total_refreshes > 10 and success_rate < 90:
                alerts.append({
                    'level': 'warning',
                    'message': f'Moderate success rate: {success_rate:.1f}%',
                    'type': 'moderate_success_rate',
                    'value': success_rate
                })
            
            # Check for recent failures
            recent_failures = [r for r in refresh_history[:5] if r['status'] == 'failed']
            if recent_failures:
                alerts.append({
                    'level': 'warning',
                    'message': f'{len(recent_failures)} recent refresh(es) failed',
                    'type': 'recent_failures',
                    'count': len(recent_failures)
                })
            
            # Check if last refresh is too old (more than 2 hours)
            last_refresh_str = scheduler_status.get('last_refresh')
            if last_refresh_str:
                try:
                    last_refresh_time = datetime.fromisoformat(last_refresh_str.replace('Z', '+00:00'))
                    time_since_last = (datetime.now(timezone.utc) - last_refresh_time).total_seconds()
                    if time_since_last > 7200:  # 2 hours
                        alerts.append({
                            'level': 'warning',
                            'message': f'Last refresh was {int(time_since_last / 3600)} hours ago',
                            'type': 'stale_refresh',
                            'hours_ago': round(time_since_last / 3600, 1)
                        })
                except Exception:
                    pass
            
            return jsonify({
                'status': 'success',
                'data': {
                    'scheduler_status': scheduler_status,
                    'refresh_history': refresh_history,
                    'performance_metrics': performance_metrics,
                    'alerts': alerts
                },
                'timestamp': datetime.now(timezone.utc).isoformat()
            }), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error in get_scheduler_monitoring: {e}", exc_info=True)
        return jsonify({
            'status': 'error',
            'error': 'Internal server error',
            'message': str(e),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }), 500

@status_bp.route('/scheduler/start', methods=['POST'])
@require_authentication()  # TODO: Add admin role check when roles are implemented
def start_scheduler():
    """
    Manually start the external data refresh scheduler
    
    Returns:
    - JSON response with scheduler start result
    """
    try:
        if not data_refresh_scheduler:
            return jsonify({
                'success': False,
                'error': 'Scheduler not available',
                'message': 'External data refresh scheduler is not initialized',
                'timestamp': datetime.now(timezone.utc).isoformat()
            }), 503
        
        # Check if scheduler is already running
        if hasattr(data_refresh_scheduler, 'running') and data_refresh_scheduler.running:
            return jsonify({
                'success': True,
                'message': 'Scheduler is already running',
                'status': 'running',
                'timestamp': datetime.now(timezone.utc).isoformat()
            }), 200
        
        # Start the scheduler
        try:
            data_refresh_scheduler.start()
            
            # Verify scheduler is running
            if hasattr(data_refresh_scheduler, 'running') and data_refresh_scheduler.running:
                logger.info("✅ External data refresh scheduler started manually via API")
                return jsonify({
                    'success': True,
                    'message': 'External data refresh scheduler started successfully',
                    'status': 'started',
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }), 200
            else:
                logger.warning("⚠️ Scheduler start() called but scheduler.running is False")
                return jsonify({
                    'success': False,
                    'error': 'Scheduler start failed',
                    'message': 'Scheduler start() was called but scheduler is not running',
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }), 500
                
        except Exception as start_error:
            logger.error(f"❌ Failed to start scheduler: {start_error}", exc_info=True)
            return jsonify({
                'success': False,
                'error': 'Failed to start scheduler',
                'message': str(start_error),
                'timestamp': datetime.now(timezone.utc).isoformat()
            }), 500
            
    except Exception as e:
        logger.error(f"Error in start_scheduler: {e}", exc_info=True)
        return jsonify({
            'error': 'Internal server error',
            'message': str(e),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }), 500

@status_bp.route('/scheduler/stop', methods=['POST'])
@require_authentication()  # TODO: Add admin role check when roles are implemented
def stop_scheduler():
    """
    Manually stop the external data refresh scheduler
    
    Returns:
    - JSON response with scheduler stop result
    """
    try:
        if not data_refresh_scheduler:
            return jsonify({
                'success': False,
                'error': 'Scheduler not available',
                'message': 'External data refresh scheduler is not initialized',
                'timestamp': datetime.now(timezone.utc).isoformat()
            }), 503
        
        # Check if scheduler is already stopped
        if not (hasattr(data_refresh_scheduler, 'running') and data_refresh_scheduler.running):
            return jsonify({
                'success': True,
                'message': 'Scheduler is already stopped',
                'status': 'stopped',
                'timestamp': datetime.now(timezone.utc).isoformat()
            }), 200
        
        # Stop the scheduler
        try:
            data_refresh_scheduler.stop()
            logger.info("⏸️ External data refresh scheduler stopped manually via API")
            return jsonify({
                'success': True,
                'message': 'External data refresh scheduler stopped successfully',
                'status': 'stopped',
                'timestamp': datetime.now(timezone.utc).isoformat()
            }), 200
                
        except Exception as stop_error:
            logger.error(f"❌ Failed to stop scheduler: {stop_error}", exc_info=True)
            return jsonify({
                'success': False,
                'error': 'Failed to stop scheduler',
                'message': str(stop_error),
                'timestamp': datetime.now(timezone.utc).isoformat()
            }), 500
            
    except Exception as e:
        logger.error(f"Error in stop_scheduler: {e}", exc_info=True)
        return jsonify({
            'error': 'Internal server error',
            'message': str(e),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }), 500

@status_bp.route('/tickers/missing-data', methods=['GET'])
def get_tickers_missing_data():
    """
    Get list of tickers with missing data
    
    Returns:
    - JSON response with tickers missing current quotes, historical data, or technical indicators
    """
    try:
        from models.ticker import Ticker
        from models.external_data import MarketDataQuote
        from services.advanced_cache_service import advanced_cache_service
        from config.database import SessionLocal
        
        db_session = SessionLocal()
        
        try:
            # Get all open tickers
            open_tickers = db_session.query(Ticker).filter(Ticker.status == 'open').all()
            
            tickers_missing_current = []
            tickers_missing_historical = []
            tickers_missing_indicators = []
            recommendations = []
            
            for ticker in open_tickers:
                if not ticker.symbol:
                    continue
                
                ticker_info = {
                    'id': ticker.id,
                    'symbol': ticker.symbol,
                    'name': ticker.name
                }
                
                # Check for current quote
                current_quote = db_session.query(MarketDataQuote).filter(
                    MarketDataQuote.ticker_id == ticker.id
                ).order_by(MarketDataQuote.asof_utc.desc()).first()
                
                if not current_quote:
                    tickers_missing_current.append(ticker_info)
                    recommendations.append({
                        'ticker_id': ticker.id,
                        'symbol': ticker.symbol,
                        'priority': 'high',
                        'reason': 'missing_current_quote',
                        'message': f'{ticker.symbol} - חסר quote נוכחי'
                    })
                    continue
                
                # Check for historical data (need at least 150 quotes)
                historical_count = db_session.query(MarketDataQuote).filter(
                    MarketDataQuote.ticker_id == ticker.id
                ).count()
                
                if historical_count < 150:
                    tickers_missing_historical.append({
                        **ticker_info,
                        'current_count': historical_count,
                        'required_count': 150,
                        'missing_count': 150 - historical_count
                    })
                    recommendations.append({
                        'ticker_id': ticker.id,
                        'symbol': ticker.symbol,
                        'priority': 'medium' if historical_count >= 50 else 'high',
                        'reason': 'insufficient_historical_data',
                        'message': f'{ticker.symbol} - יש רק {historical_count} quotes היסטוריים (נדרש 150)'
                    })
                
                # Check for technical indicators in cache
                volatility_key = f"ticker_{ticker.id}_volatility_30"
                ma20_key = f"ticker_{ticker.id}_ma_20"
                ma150_key = f"ticker_{ticker.id}_ma_150"
                week52_key = f"ticker_{ticker.id}_week52"
                
                missing_indicators = []
                if historical_count >= 30:
                    if not advanced_cache_service.get(volatility_key):
                        missing_indicators.append('volatility_30')
                if historical_count >= 20:
                    if not advanced_cache_service.get(ma20_key):
                        missing_indicators.append('ma_20')
                if historical_count >= 120:
                    if not advanced_cache_service.get(ma150_key):
                        missing_indicators.append('ma_150')
                if historical_count >= 10:
                    if not advanced_cache_service.get(week52_key):
                        missing_indicators.append('week52')
                
                if missing_indicators:
                    tickers_missing_indicators.append({
                        **ticker_info,
                        'missing_indicators': missing_indicators,
                        'historical_count': historical_count
                    })
                    recommendations.append({
                        'ticker_id': ticker.id,
                        'symbol': ticker.symbol,
                        'priority': 'low',
                        'reason': 'missing_technical_indicators',
                        'message': f'{ticker.symbol} - חסרים חישובים טכניים: {", ".join(missing_indicators)}'
                    })
            
            # Sort recommendations by priority
            priority_order = {'high': 0, 'medium': 1, 'low': 2}
            recommendations.sort(key=lambda x: priority_order.get(x['priority'], 3))
            
            return jsonify({
                'status': 'success',
                'data': {
                    'tickers_missing_current': tickers_missing_current,
                    'tickers_missing_historical': tickers_missing_historical,
                    'tickers_missing_indicators': tickers_missing_indicators,
                    'recommendations': recommendations,
                    'summary': {
                        'total_open_tickers': len(open_tickers),
                        'missing_current_count': len(tickers_missing_current),
                        'missing_historical_count': len(tickers_missing_historical),
                        'missing_indicators_count': len(tickers_missing_indicators),
                        'total_recommendations': len(recommendations)
                    }
                },
                'timestamp': datetime.now(timezone.utc).isoformat()
            }), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error in get_tickers_missing_data: {e}", exc_info=True)
        return jsonify({
            'status': 'error',
            'error': 'Internal server error',
            'message': str(e),
            'timestamp': datetime.now(timezone.utc).isoformat()
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
