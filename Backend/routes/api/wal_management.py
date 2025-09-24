"""
WAL Management API Routes - TikTrack
===================================

This module provides API endpoints for managing SQLite WAL files
to ensure data consistency and prevent deleted records from reappearing.

Endpoints:
    GET /api/v1/wal/status - Get WAL status and health
    POST /api/v1/wal/checkpoint - Force WAL checkpoint
    POST /api/v1/wal/cleanup - Clean up WAL files
    GET /api/v1/wal/health - Get WAL health report

Author: TikTrack Development Team
Version: 1.0
Date: September 2025
"""

from flask import Blueprint, jsonify, request, g
from utils.wal_manager import get_wal_manager
import logging

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

wal_bp = Blueprint('wal', __name__, url_prefix='/api/wal')

# Initialize base API (wal_management is complex, so we'll use it selectively)

@wal_bp.route('/status', methods=['GET'])
@api_endpoint(cache_ttl=60, rate_limit=60)
@handle_database_session()
def get_wal_status():
    """Get WAL status and information using base API patterns"""
    try:
        wal_manager = get_wal_manager()
        wal_info = wal_manager.get_wal_info()
        
        return jsonify({
            "status": "success",
            "data": wal_info,
            "message": "WAL status retrieved successfully",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting WAL status: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to get WAL status: {str(e)}"},
            "version": "1.0"
        }), 500

@wal_bp.route('/checkpoint', methods=['POST'])
def force_checkpoint():
    """Force WAL checkpoint"""
    try:
        data = request.get_json() if request.is_json else {}
        mode = data.get('mode', 'TRUNCATE')  # PASSIVE, FULL, or TRUNCATE
        
        wal_manager = get_wal_manager()
        success, message = wal_manager.force_checkpoint(mode)
        
        if success:
            return jsonify({
                "status": "success",
                "data": {"message": message},
                "message": "WAL checkpoint completed successfully",
                "version": "1.0"
            })
        else:
            return jsonify({
                "status": "error",
                "error": {"message": message},
                "version": "1.0"
            }), 400
            
    except Exception as e:
        logger.error(f"Error forcing WAL checkpoint: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to force checkpoint: {str(e)}"},
            "version": "1.0"
        }), 500

@wal_bp.route('/cleanup', methods=['POST'])
def cleanup_wal():
    """Clean up WAL files"""
    try:
        wal_manager = get_wal_manager()
        success, message = wal_manager.cleanup_wal_files()
        
        if success:
            return jsonify({
                "status": "success",
                "data": {"message": message},
                "message": "WAL cleanup completed successfully",
                "version": "1.0"
            })
        else:
            return jsonify({
                "status": "error",
                "error": {"message": message},
                "version": "1.0"
            }), 400
            
    except Exception as e:
        logger.error(f"Error cleaning up WAL files: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to cleanup WAL files: {str(e)}"},
            "version": "1.0"
        }), 500

@wal_bp.route('/health', methods=['GET'])
def get_wal_health():
    """Get WAL health report"""
    try:
        wal_manager = get_wal_manager()
        health_report = wal_manager.monitor_wal_health()
        
        return jsonify({
            "status": "success",
            "data": health_report,
            "message": "WAL health report generated successfully",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting WAL health: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to get WAL health: {str(e)}"},
            "version": "1.0"
        }), 500

@wal_bp.route('/optimize', methods=['POST'])
def optimize_wal():
    """Optimize WAL settings"""
    try:
        wal_manager = get_wal_manager()
        success = wal_manager.optimize_wal_settings()
        
        if success:
            return jsonify({
                "status": "success",
                "data": {"message": "WAL settings optimized successfully"},
                "message": "WAL optimization completed",
                "version": "1.0"
            })
        else:
            return jsonify({
                "status": "error",
                "error": {"message": "Failed to optimize WAL settings"},
                "version": "1.0"
            }), 400
            
    except Exception as e:
        logger.error(f"Error optimizing WAL: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to optimize WAL: {str(e)}"},
            "version": "1.0"
        }), 500
