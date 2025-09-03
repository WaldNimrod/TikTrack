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

from flask import Blueprint, jsonify, request
from datetime import datetime
from services.advanced_cache_service import (
    get_cache_stats,
    cache_health_check,
    clear_cache,
    invalidate_cache,
    advanced_cache_service
)
from services.cache_warming_service import (
    start_cache_warming,
    stop_cache_warming,
    force_warm_all_critical,
    get_warming_stats,
    get_warming_health,
    cache_warming_service
)
import logging

logger = logging.getLogger(__name__)

# Create blueprint
cache_management_bp = Blueprint('cache_management', __name__, url_prefix='/api/v1/cache')


@cache_management_bp.route('/stats', methods=['GET'])
def get_cache_statistics():
    """Get cache statistics"""
    try:
        stats = get_cache_stats()
        return jsonify({
            'status': 'success',
            'data': stats
        }), 200
    except Exception as e:
        logger.error(f"Failed to get cache stats: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get cache statistics: {str(e)}'
        }), 500


@cache_management_bp.route('/health', methods=['GET'])
def check_cache_health():
    """Check cache health status"""
    try:
        health = cache_health_check()
        return jsonify({
            'status': 'success',
            'data': health
        }), 200
    except Exception as e:
        logger.error(f"Failed to check cache health: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to check cache health: {str(e)}'
        }), 500


@cache_management_bp.route('/status', methods=['GET'])
def get_cache_status():
    """Get cache system status"""
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
            'data': status_info
        }), 200
    except Exception as e:
        logger.error(f"Failed to get cache status: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get cache status: {str(e)}'
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
        invalidate_cache(dependency)
        
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
    """Invalidate cache by pattern - NOW IMPLEMENTED"""
    try:
        data = request.get_json()
        if not data or 'pattern' not in data:
            return jsonify({
                'status': 'error',
                'message': 'pattern field is required'
            }), 400
        
        pattern = data['pattern']
        
        # Validate pattern (basic security check)
        if len(pattern) < 1 or len(pattern) > 100:
            return jsonify({
                'status': 'error',
                'message': 'Pattern must be between 1 and 100 characters'
            }), 400
        
        # Use the advanced cache service pattern invalidation
        advanced_cache_service.invalidate_pattern(pattern)
        
        logger.info(f"Cache invalidated by pattern: {pattern}")
        return jsonify({
            'status': 'success',
            'message': f'Cache invalidated by pattern: {pattern}'
        }), 200
        
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


# ===== CACHE WARMING ENDPOINTS =====

@cache_management_bp.route('/warming/status', methods=['GET'])
def get_warming_status():
    """Get cache warming status and statistics"""
    try:
        warming_stats = get_warming_stats()
        warming_health = get_warming_health()
        
        return jsonify({
            'status': 'success',
            'data': {
                'warming_stats': warming_stats,
                'health': warming_health,
                'timestamp': datetime.utcnow().isoformat()
            }
        }), 200
    except Exception as e:
        logger.error(f"Failed to get warming status: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get warming status: {str(e)}'
        }), 500


@cache_management_bp.route('/warming/start', methods=['POST'])
def start_warming():
    """Start cache warming service"""
    try:
        start_cache_warming()
        logger.info("Cache warming started via API")
        return jsonify({
            'status': 'success',
            'message': 'Cache warming service started'
        }), 200
    except Exception as e:
        logger.error(f"Failed to start warming: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to start warming: {str(e)}'
        }), 500


@cache_management_bp.route('/warming/stop', methods=['POST'])
def stop_warming():
    """Stop cache warming service"""
    try:
        stop_cache_warming()
        logger.info("Cache warming stopped via API")
        return jsonify({
            'status': 'success',
            'message': 'Cache warming service stopped'
        }), 200
    except Exception as e:
        logger.error(f"Failed to stop warming: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to stop warming: {str(e)}'
        }), 500


@cache_management_bp.route('/warming/force-critical', methods=['POST'])
def force_warm_critical():
    """Force immediate warming of critical data"""
    try:
        force_warm_all_critical()
        logger.info("Critical cache warming forced via API")
        return jsonify({
            'status': 'success',
            'message': 'Critical data warming completed'
        }), 200
    except Exception as e:
        logger.error(f"Failed to force warm critical: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to force warm critical data: {str(e)}'
        }), 500


@cache_management_bp.route('/warming/force-pattern', methods=['POST'])
def force_warm_pattern():
    """Force immediate warming of specific pattern"""
    try:
        data = request.get_json()
        if not data or 'pattern' not in data:
            return jsonify({
                'status': 'error',
                'message': 'pattern field is required'
            }), 400
        
        pattern_name = data['pattern']
        success = cache_warming_service.force_warm_pattern(pattern_name)
        
        if success:
            logger.info(f"Pattern warming forced via API: {pattern_name}")
            return jsonify({
                'status': 'success',
                'message': f'Pattern {pattern_name} warming completed'
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': f'Pattern {pattern_name} not found or failed'
            }), 404
            
    except Exception as e:
        logger.error(f"Failed to force warm pattern: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to force warm pattern: {str(e)}'
        }), 500


@cache_management_bp.route('/analytics', methods=['GET'])
def get_cache_analytics():
    """Get comprehensive cache analytics data"""
    try:
        # Get all cache-related data for analytics
        cache_stats = get_cache_stats()
        cache_health = cache_health_check()
        warming_stats = get_warming_stats()
        warming_health = get_warming_health()
        
        analytics = {
            'timestamp': datetime.utcnow().isoformat(),
            'cache': {
                'stats': cache_stats,
                'health': cache_health
            },
            'warming': {
                'stats': warming_stats,
                'health': warming_health
            },
            'performance': {
                'total_hit_rate': cache_stats.get('hit_rate_percent', 0),
                'memory_efficiency': cache_stats.get('memory_usage_percent', 0),
                'warming_coverage': len(warming_stats.get('warming_patterns', {}))
            }
        }
        
        return jsonify({
            'status': 'success',
            'data': analytics
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to get cache analytics: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get cache analytics: {str(e)}'
        }), 500
