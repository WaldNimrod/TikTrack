"""
Preferences API Routes - TikTrack
=================================

API endpoints for user preferences management.

Author: TikTrack Development Team
Version: 2.0
Date: January 2025
"""

from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from config.database import SessionLocal
from services.preferences_service import PreferencesService
# from utils.response_optimizer import optimize_response
from utils.rate_limiter import rate_limit_api
from typing import Any
import logging

logger = logging.getLogger(__name__)

# Create blueprint
preferences_bp = Blueprint('preferences', __name__, url_prefix='/api/v1/preferences')

@preferences_bp.route('/defaults', methods=['GET'])
@rate_limit_api(requests_per_minute=30)
def get_defaults() -> Any:
    """Get default preferences"""
    try:
        defaults = PreferencesService.get_fallback_defaults()
        
        return jsonify({
            "success": True,
            "data": {
                "defaults": defaults
            },
            "timestamp": "2025-01-07T21:55:00Z"
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting defaults: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": "2025-01-07T21:55:00Z"
        }), 500

@preferences_bp.route('/user', methods=['GET'])
@rate_limit_api(requests_per_minute=30)
def get_user_preferences() -> Any:
    """Get user preferences (fallback implementation)"""
    try:
        # For now, return fallback defaults
        defaults = PreferencesService.get_fallback_defaults()
        
        return jsonify({
            "success": True,
            "data": {
                "preferences": defaults,
                "profiles": [{
                    "id": 1,
                    "name": "ברירת מחדל",
                    "isDefault": True,
                    "description": "פרופיל ברירת מחדל"
                }]
            },
            "timestamp": "2025-01-07T21:55:00Z"
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting user preferences: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": "2025-01-07T21:55:00Z"
        }), 500

@preferences_bp.route('/user', methods=['POST'])
@rate_limit_api(requests_per_minute=10)
def save_user_preferences() -> Any:
    """Save user preferences"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided",
                "timestamp": "2025-01-07T21:55:00Z"
            }), 400
        
        # For now, just return success
        logger.info(f"Received preferences data: {list(data.keys())}")
        
        return jsonify({
            "success": True,
            "message": "Preferences saved successfully",
            "timestamp": "2025-01-07T21:55:00Z"
        }), 200
        
    except Exception as e:
        logger.error(f"Error saving user preferences: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": "2025-01-07T21:55:00Z"
        }), 500

@preferences_bp.route('/ui', methods=['GET', 'POST'])
@rate_limit_api(requests_per_minute=30)
def ui_preferences() -> Any:
    """Get/Set UI preferences"""
    try:
        if request.method == 'GET':
            ui_prefs = PreferencesService.get_ui_preferences()
            return jsonify({
                "success": True,
                "data": {"ui_preferences": ui_prefs},
                "timestamp": "2025-01-07T21:55:00Z"
            }), 200
        else:
            data = request.get_json()
            result = PreferencesService.set_ui_preferences(data)
            return jsonify({
                "success": True,
                "data": {"updated": result},
                "timestamp": "2025-01-07T21:55:00Z"
            }), 200
            
    except Exception as e:
        logger.error(f"Error with UI preferences: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": "2025-01-07T21:55:00Z"
        }), 500

@preferences_bp.route('/system', methods=['GET', 'POST'])
@rate_limit_api(requests_per_minute=30)
def system_preferences() -> Any:
    """Get/Set system preferences"""
    try:
        if request.method == 'GET':
            system_prefs = PreferencesService.get_system_preferences()
            return jsonify({
                "success": True,
                "data": {"system_preferences": system_prefs},
                "timestamp": "2025-01-07T21:55:00Z"
            }), 200
        else:
            data = request.get_json()
            result = PreferencesService.set_system_preferences(data)
            return jsonify({
                "success": True,
                "data": {"updated": result},
                "timestamp": "2025-01-07T21:55:00Z"
            }), 200
            
    except Exception as e:
        logger.error(f"Error with system preferences: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": "2025-01-07T21:55:00Z"
        }), 500

@preferences_bp.route('/advanced', methods=['GET', 'POST'])
@rate_limit_api(requests_per_minute=30)
def advanced_preferences() -> Any:
    """Get/Set advanced preferences"""
    try:
        if request.method == 'GET':
            advanced_prefs = PreferencesService.get_advanced_preferences()
            return jsonify({
                "success": True,
                "data": {"advanced_preferences": advanced_prefs},
                "timestamp": "2025-01-07T21:55:00Z"
            }), 200
        else:
            data = request.get_json()
            result = PreferencesService.set_advanced_preferences(data)
            return jsonify({
                "success": True,
                "data": {"updated": result},
                "timestamp": "2025-01-07T21:55:00Z"
            }), 200
            
    except Exception as e:
        logger.error(f"Error with advanced preferences: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": "2025-01-07T21:55:00Z"
        }), 500

@preferences_bp.route('/profiles', methods=['GET'])
@rate_limit_api(requests_per_minute=30)
def get_profiles() -> Any:
    """Get user profiles"""
    try:
        # For now, return fallback profile
        profiles = [{
            "id": 1,
            "name": "ברירת מחדל",
            "isDefault": True,
            "description": "פרופיל ברירת מחדל"
        }]
        
        return jsonify({
            "success": True,
            "data": profiles,
            "timestamp": "2025-01-07T21:55:00Z"
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting profiles: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": "2025-01-07T21:55:00Z"
        }), 500

@preferences_bp.route('/colors', methods=['GET'])
@rate_limit_api(requests_per_minute=30)
def get_colors() -> Any:
    """Get color preferences"""
    try:
        # Return default colors for now
        colors = {
            "numeric-positive-color": "#28a745",
            "numeric-negative-color": "#dc3545", 
            "numeric-zero-color": "#6c757d",
            "entity-trade-color": "#007bff",
            "entity-account-color": "#28a745",
            "entity-ticker-color": "#dc3545",
            "entity-alert-color": "#ff9c05",
            "entity-execution-color": "#17a2b8",
            "entity-cash-flow-color": "#20c997",
            "entity-trade-plan-color": "#17a2b8",
            "entity-note-color": "#6f42c1",
            "status-open-color": "#28a745",
            "status-closed-color": "#6c757d",
            "status-cancelled-color": "#dc3545",
            "status-pending-color": "#ffc107",
            "type-swing-color": "#007bff",
            "type-investment-color": "#28a745",
            "type-passive-color": "#6f42c1",
            "type-day-trading-color": "#fd7e14",
            "type-scalping-color": "#dc3545"
        }
        
        return jsonify(colors), 200
        
    except Exception as e:
        logger.error(f"Error getting colors: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": "2025-01-07T21:55:00Z"
        }), 500
