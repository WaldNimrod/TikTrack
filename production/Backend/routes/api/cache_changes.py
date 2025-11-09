"""
Cache Changes API - TikTrack
=============================

API endpoints for polling-based cache invalidation.
Allows Frontend clients to check for cache changes without WebSocket.

Endpoints:
- GET /api/cache/changes - Get cache changes since timestamp
- GET /api/cache/changes/stats - Get change log statistics

Author: TikTrack Development Team
Created: January 2025
Version: 1.0
"""

from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Create blueprint
cache_changes_bp = Blueprint('cache_changes', __name__)


@cache_changes_bp.route('/changes', methods=['GET'])
def get_cache_changes():
    """
    Get cache changes since a specific timestamp.
    
    Query Parameters:
        since: ISO timestamp (optional, default: last 60 seconds)
               Example: 2025-01-13T02:30:00.000Z
        limit: Maximum number of changes to return (optional, default: 100)
    
    Returns:
        {
            'changes': [
                {
                    'keys': ['trades', 'tickers'],
                    'reason': 'API call: create_trade',
                    'timestamp': '2025-01-13T02:30:15.123456',
                    'created_by': 'backend_api'
                },
                ...
            ],
            'count': 5,
            'server_time': '2025-01-13T02:30:45.678901',
            'since': '2025-01-13T02:30:00.000000'
        }
    
    Status Codes:
        200: Success
        400: Invalid parameters
        500: Server error
    """
    try:
        from services.cache_changes_tracker import cache_changes_tracker
        
        # Get 'since' parameter
        since_param = request.args.get('since')
        limit = int(request.args.get('limit', 100))
        
        if since_param:
            try:
                # Parse ISO timestamp (handle both with and without 'Z')
                since_str = since_param.replace('Z', '+00:00')
                since_timestamp = datetime.fromisoformat(since_str)
                # Convert to UTC if needed
                if since_timestamp.tzinfo:
                    since_timestamp = since_timestamp.replace(tzinfo=None)
            except ValueError as e:
                return jsonify({
                    'error': f'Invalid timestamp format: {since_param}',
                    'expected_format': 'ISO 8601 (e.g. 2025-01-13T02:30:00.000Z)',
                    'changes': [],
                    'count': 0
                }), 400
        else:
            # Default: last 60 seconds
            since_timestamp = datetime.utcnow() - timedelta(seconds=60)
        
        # Get changes from tracker
        changes = cache_changes_tracker.get_changes_since(since_timestamp, limit=limit)
        
        # Return response
        return jsonify({
            'changes': changes,
            'count': len(changes),
            'server_time': datetime.utcnow().isoformat(),
            'since': since_timestamp.isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_cache_changes: {e}")
        return jsonify({
            'error': str(e),
            'changes': [],
            'count': 0,
            'server_time': datetime.utcnow().isoformat()
        }), 500


@cache_changes_bp.route('/changes/stats', methods=['GET'])
def get_cache_changes_stats():
    """
    Get statistics about cache change logs.
    
    Returns:
        {
            'total_logs': 150,
            'logs_last_hour': 12,
            'logs_today': 45,
            'oldest_log': '2025-01-06T10:30:00.000000',
            'enabled': true
        }
    
    Status Codes:
        200: Success
        500: Server error
    """
    try:
        from services.cache_changes_tracker import cache_changes_tracker
        
        stats = cache_changes_tracker.get_stats()
        
        return jsonify(stats), 200
        
    except Exception as e:
        logger.error(f"Error in get_cache_changes_stats: {e}")
        return jsonify({
            'error': str(e)
        }), 500


@cache_changes_bp.route('/log', methods=['POST'])
def log_cache_action():
    """
    Log a cache clearing action triggered from the frontend cache menu (Stage B-Lite).

    Payload example:
        {
            "action": "memory",
            "layers": ["memory"],
            "stage": "B-Lite",
            "metadata": {
                "profileId": 4,
                "userId": 1,
                "page": "/preferences",
                "triggeredAt": "2025-02-11T10:15:20.123Z"
            }
        }
    """
    from config.logging import get_cache_logger

    try:
        payload = request.get_json(silent=True) or {}
        action = payload.get('action')
        layers = payload.get('layers', [])
        stage = payload.get('stage', 'unknown')
        metadata = payload.get('metadata', {})

        if not action:
            return jsonify({
                'status': 'error',
                'message': 'Missing cache action identifier'
            }), 400

        cache_logger = get_cache_logger()
        cache_logger.info(
            '🧹 Frontend cache action',
            extra={
                'action': action,
                'layers': layers,
                'stage': stage,
                'metadata': metadata
            }
        )

        try:
            from services.cache_changes_tracker import cache_changes_tracker

            tracker_keys = [f'frontend:{layer}' for layer in layers] or [f'frontend:{action}']
            cache_changes_tracker.log_change(
                keys=tracker_keys,
                reason=f'Frontend cache menu action: {action}',
                created_by='frontend_cache_menu'
            )
        except Exception as tracker_error:
            logger.warning(f"⚠️ Failed to log cache action to tracker: {tracker_error}")

        return jsonify({'status': 'success'}), 200

    except Exception as e:
        logger.error(f"Error logging cache action: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

