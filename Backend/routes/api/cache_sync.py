"""
Cache Sync API Routes - TikTrack
================================

Backend API endpoints for cache synchronization between frontend and backend.

Features:
- Sync frontend cache data to backend
- Retrieve cached data from backend
- Invalidate cache by dependencies
- Support for CacheSyncManager integration

Author: TikTrack Development Team
Created: January 2025
Version: 1.0.0
"""

from flask import Blueprint, request, jsonify
from services.advanced_cache_service import advanced_cache_service
from utils.performance_monitor import monitor_performance
import logging

# Create blueprint
cache_sync_bp = Blueprint('cache_sync', __name__, url_prefix='/api/cache')

logger = logging.getLogger(__name__)

@cache_sync_bp.route('/sync', methods=['POST'])
@monitor_performance("cache_sync")
def sync_cache():
    """
    Sync frontend cache data to backend cache
    
    Expected JSON payload:
    {
        "key": "cache_key_name",
        "data": {...},
        "dependencies": ["dep1", "dep2"],
        "ttl": 300,
        "timestamp": 1234567890
    }
    
    Returns:
    {
        "success": true,
        "key": "cache_key_name",
        "message": "Cache synced successfully"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400
        
        # Extract required fields
        key = data.get('key')
        cache_data = data.get('data')
        dependencies = data.get('dependencies', [])
        ttl = data.get('ttl', 300)  # Default 5 minutes
        timestamp = data.get('timestamp')
        
        # Validate required fields
        if not key:
            return jsonify({
                'success': False,
                'error': 'Missing required field: key'
            }), 400
        
        if cache_data is None:
            return jsonify({
                'success': False,
                'error': 'Missing required field: data'
            }), 400
        
        # Store in backend cache
        advanced_cache_service.set(
            key=key,
            data=cache_data,
            ttl=ttl,
            dependencies=dependencies
        )
        
        logger.info(f"Cache synced: {key} (TTL: {ttl}s, Dependencies: {dependencies})")
        
        return jsonify({
            'success': True,
            'key': key,
            'message': 'Cache synced successfully',
            'data': {
                'key': key,
                'ttl': ttl,
                'dependencies': dependencies,
                'timestamp': timestamp
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error syncing cache: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@cache_sync_bp.route('/<key>', methods=['GET'])
@monitor_performance("cache_get")
def get_cache(key):
    """
    Get cached data from backend cache
    
    URL Parameters:
    - key: Cache key to retrieve
    
    Returns:
    {
        "success": true,
        "data": {...},
        "key": "cache_key_name"
    }
    """
    try:
        # Get data from backend cache
        data = advanced_cache_service.get(key)
        
        if data is None:
            return jsonify({
                'success': False,
                'error': 'Cache key not found',
                'key': key
            }), 404
        
        logger.info(f"Cache retrieved: {key}")
        
        return jsonify({
            'success': True,
            'data': data,
            'key': key
        }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving cache {key}: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}',
            'key': key
        }), 500

@cache_sync_bp.route('/invalidate', methods=['POST'])
@monitor_performance("cache_invalidate")
def invalidate_cache():
    """
    Invalidate cache entries by dependencies
    
    Expected JSON payload:
    {
        "dependencies": ["dep1", "dep2"]
    }
    
    Returns:
    {
        "success": true,
        "clearedCount": 5,
        "dependencies": ["dep1", "dep2"]
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400
        
        dependencies = data.get('dependencies', [])
        
        if not dependencies:
            return jsonify({
                'success': False,
                'error': 'No dependencies provided'
            }), 400
        
        # Invalidate cache by dependencies
        cleared_count = 0
        for dependency in dependencies:
            count = advanced_cache_service.invalidate_by_dependency(dependency)
            cleared_count += count
        
        logger.info(f"Cache invalidated: {dependencies} ({cleared_count} entries)")
        
        return jsonify({
            'success': True,
            'clearedCount': cleared_count,
            'dependencies': dependencies,
            'message': f'Invalidated {cleared_count} cache entries'
        }), 200
        
    except Exception as e:
        logger.error(f"Error invalidating cache: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@cache_sync_bp.route('/status', methods=['GET'])
@monitor_performance("cache_status")
def cache_status():
    """
    Get cache sync system status
    
    Returns:
    {
        "success": true,
        "data": {
            "backend_cache_stats": {...},
            "sync_endpoints": ["/sync", "/<key>", "/invalidate"],
            "status": "operational"
        }
    }
    """
    try:
        # Get backend cache statistics
        backend_stats = advanced_cache_service.get_stats()
        
        return jsonify({
            'success': True,
            'data': {
                'backend_cache_stats': backend_stats,
                'sync_endpoints': ['/sync', '/<key>', '/invalidate'],
                'status': 'operational',
                'version': '1.0.0'
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting cache status: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500
