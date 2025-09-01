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
from services.advanced_cache_service import (
    get_cache_stats,
    cache_health_check,
    clear_cache,
    invalidate_cache
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
