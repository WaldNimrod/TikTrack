"""
Cache Management API - TikTrack
API endpoints for managing the advanced cache system.

This module provides endpoints for:
- Cache statistics
- Cache health check
- Cache invalidation
- Cache management operations

Author: TikTrack Development Team
Created: September 2025
Version: 1.0
"""

from flask import Blueprint, jsonify, request, g
from services.advanced_cache_service import (
    get_cache_stats,
    cache_health_check,
    clear_cache,
    advanced_cache_service
)
import logging

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

# Create blueprint
cache_management_bp = Blueprint('cache_management', __name__, url_prefix='/api/cache')

# Initialize base API (cache management is complex, so we'll use it selectively)


@cache_management_bp.route('/stats', methods=['GET'])
@api_endpoint(cache_ttl=60, rate_limit=60)
@handle_database_session()
def get_cache_statistics():
    """Get cache statistics using base API patterns"""
    try:
        stats = get_cache_stats()
        return jsonify({
            'status': 'success',
            'data': stats,
            'message': 'Cache statistics retrieved successfully',
            'version': '1.0'
        }), 200
    except Exception as e:
        logger.error(f"Failed to get cache stats: {e}")
        return jsonify({
            'status': 'error',
            'error': {'message': f'Failed to get cache statistics: {str(e)}'},
            'version': '1.0'
        }), 500


@cache_management_bp.route('/health', methods=['GET'])
@api_endpoint(cache_ttl=30, rate_limit=60)
@handle_database_session()
def check_cache_health():
    """Check cache health status using base API patterns"""
    try:
        health = cache_health_check()
        return jsonify({
            'status': 'success',
            'data': health,
            'message': 'Cache health check completed successfully',
            'version': '1.0'
        }), 200
    except Exception as e:
        logger.error(f"Failed to check cache health: {e}")
        return jsonify({
            'status': 'error',
            'error': {'message': f'Failed to check cache health: {str(e)}'},
            'version': '1.0'
        }), 500


@cache_management_bp.route('/status', methods=['GET'])
@api_endpoint(cache_ttl=30, rate_limit=60)
@handle_database_session()
def get_cache_status():
    """Get cache system status using base API patterns"""
    try:
        stats = get_cache_stats()
        health = cache_health_check()
        
        # Determine overall status
        if health['status'] == 'healthy':
            overall_status = 'active'
        elif health['status'] == 'warning':
            overall_status = 'degraded'
        else:
            overall_status = 'inactive'
        
        status_info = {
            'system': 'Advanced Cache System',
            'version': '2.0.0',
            'status': overall_status,
            'health': health['status'],
            'memory_usage_mb': stats['estimated_memory_mb'],
            'memory_usage_percent': stats['memory_usage_percent'],
            'total_entries': stats['total_entries'],
            'hit_rate_percent': stats['hit_rate_percent'],
            'endpoints': [
                '/stats',
                '/health',
                '/clear',
                '/invalidate'
            ],
            'features': [
                'Dependency-based invalidation',
                'TTL management',
                'Memory optimization',
                'Performance monitoring'
            ]
        }
        
        return jsonify({
            'status': 'success',
            'data': status_info,
            'message': 'Cache status retrieved successfully',
            'version': '1.0'
        }), 200
    except Exception as e:
        logger.error(f"Failed to get cache status: {e}")
        return jsonify({
            'status': 'error',
            'error': {'message': f'Failed to get cache status: {str(e)}'},
            'version': '1.0'
        }), 500


@cache_management_bp.route('/clear', methods=['POST'])
def clear_all_cache():
    """Clear all cache entries"""
    try:
        clear_cache()
        logger.info("Cache cleared by API request")
        return jsonify({
            'status': 'success',
            'message': 'Cache cleared successfully'
        }), 200
    except Exception as e:
        logger.error(f"Failed to clear cache: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to clear cache: {str(e)}'
        }), 500


@cache_management_bp.route('/invalidate', methods=['POST'])
def invalidate_cache_by_dependency():
    """Invalidate cache by dependency"""
    try:
        data = request.get_json()
        if not data or 'dependency' not in data:
            return jsonify({
                'status': 'error',
                'message': 'dependency field is required'
            }), 400
        
        dependency = data['dependency']
        advanced_cache_service.invalidate_by_dependency(dependency)
        
        logger.info(f"Cache invalidated for dependency: {dependency}")
        return jsonify({
            'status': 'success',
            'message': f'Cache invalidated for dependency: {dependency}'
        }), 200
    except Exception as e:
        logger.error(f"Failed to invalidate cache: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to invalidate cache: {str(e)}'
        }), 500


@cache_management_bp.route('/invalidate/pattern', methods=['POST'])
def invalidate_cache_by_pattern():
    """Invalidate cache by pattern"""
    try:
        data = request.get_json()
        if not data or 'pattern' not in data:
            return jsonify({
                'status': 'error',
                'message': 'pattern field is required'
            }), 400
        
        pattern = data['pattern']
        # Note: This would require adding pattern invalidation to the cache service
        # For now, we'll return a not implemented message
        
        return jsonify({
            'status': 'error',
            'message': 'Pattern-based invalidation not yet implemented'
        }), 501
    except Exception as e:
        logger.error(f"Failed to invalidate cache by pattern: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to invalidate cache by pattern: {str(e)}'
        }), 500


@cache_management_bp.route('/info', methods=['GET'])
def get_cache_info():
    """Get general cache information"""
    try:
        stats = get_cache_stats()
        health = cache_health_check()
        
        info = {
            'cache_type': 'Advanced Cache Service',
            'version': '1.0',
            'features': [
                'TTL-based caching',
                'Dependency-based invalidation',
                'Memory optimization',
                'Performance monitoring',
                'Thread-safe operations'
            ],
            'current_status': health['status'],
            'statistics': stats,
            'health_check': health
        }
        
        return jsonify({
            'status': 'success',
            'data': info
        }), 200
    except Exception as e:
        logger.error(f"Failed to get cache info: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get cache information: {str(e)}'
        }), 500


@cache_management_bp.route('/log', methods=['POST'])
def log_cache_action():
    """
    Log cache action from frontend for monitoring/debugging.
    
    Expected JSON payload:
    {
        "action": "full|light|medium|nuclear|memory|local-storage|indexeddb",
        "layers": ["memory", "localStorage", "indexedDB"],
        "source": "import-user-data:execute",
        "timestamp": "2025-11-23T02:35:23.873Z",
        "durationMs": 123,
        "context": {...},
        "error": null
    }
    
    Returns:
    {
        "status": "success",
        "message": "Cache action logged successfully"
    }
    """
    try:
        data = request.get_json(silent=True) or {}
        
        # Extract action details
        action = data.get('action', 'unknown')
        source = data.get('source', 'unknown')
        timestamp = data.get('timestamp')
        duration_ms = data.get('durationMs')
        error = data.get('error')
        
        # Log to server logs (for debugging/monitoring)
        if error:
            logger.warning(f"Cache action '{action}' from '{source}' completed with error: {error}", extra={
                'action': action,
                'source': source,
                'timestamp': timestamp,
                'duration_ms': duration_ms
            })
        else:
            logger.info(f"Cache action '{action}' from '{source}' completed successfully", extra={
                'action': action,
                'source': source,
                'timestamp': timestamp,
                'duration_ms': duration_ms
            })
        
        # Note: Could optionally store in database for analytics, but for now just log to server logs
        
        return jsonify({
            'status': 'success',
            'message': 'Cache action logged successfully',
            'version': '1.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to log cache action: {e}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': f'Failed to log cache action: {str(e)}',
            'version': '1.0'
        }), 500
