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
