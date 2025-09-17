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
    """Get user preferences from database"""
    try:
        db = SessionLocal()
        try:
            # Get current user (for now, use default user ID 1)
            user_id = 1
            
            # Get preferences from database
            preferences = PreferencesService.get_preferences(db, user_id)
            if preferences:
                # Return actual preferences from database
                preferences_data = preferences.to_dict()
                logger.info(f"✅ Retrieved preferences from database for user {user_id}")
            else:
                # No preferences found, return fallback defaults
                preferences_data = PreferencesService.get_fallback_defaults()
                logger.info(f"⚠️ No preferences found for user {user_id}, returning fallback defaults")
            
            # Get profiles
            profiles = PreferencesService.get_profiles(db, user_id)
            
            return jsonify({
                "success": True,
                "data": {
                    "preferences": preferences_data,
                    "profiles": [profile.to_dict() for profile in profiles] if profiles else [{
                        "id": 1,
                        "name": "ברירת מחדל",
                        "isDefault": True,
                        "description": "פרופיל ברירת מחדל"
                    }]
                },
                "timestamp": "2025-01-07T21:55:00Z"
            }), 200
            
        finally:
            db.close()
        
    except Exception as e:
        logger.error(f"Error getting user preferences: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": "2025-01-07T21:55:00Z"
        }), 500

@preferences_bp.route('/user', methods=['POST'])
@rate_limit_api(requests_per_minute=60)
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
        
        # Save to database using PreferencesService
        db = SessionLocal()
        try:
            # Get current user (for now, use default user ID 1)
            user_id = 1
            
            # Save preferences using the service
            result = PreferencesService.save_user_preferences(
                db=db,
                user_id=user_id,
                preferences_data=data,
                profile_name="ברירת מחדל"
            )
            
            if result:
                logger.info(f"✅ Preferences saved successfully for user {user_id}: {list(data.keys())}")
                return jsonify({
                    "success": True,
                    "message": "Preferences saved successfully to database",
                    "data": {
                        "saved_keys": list(data.keys()),
                        "user_id": user_id
                    },
                    "timestamp": "2025-01-07T21:55:00Z"
                }), 200
            else:
                logger.error(f"❌ Failed to save preferences for user {user_id}")
                return jsonify({
                    "success": False,
                    "error": "Failed to save preferences to database",
                    "timestamp": "2025-01-07T21:55:00Z"
                }), 500
                
        finally:
            db.close()
        
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

@preferences_bp.route('/profiles/create', methods=['POST'])
@rate_limit_api(requests_per_minute=10)
def create_profile() -> Any:
    """Create a new profile"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided",
                "timestamp": "2025-01-07T21:55:00Z"
            }), 400
        
        # Validate required fields
        profile_name = data.get('name', '').strip()
        if not profile_name:
            return jsonify({
                "success": False,
                "error": "Profile name is required",
                "timestamp": "2025-01-07T21:55:00Z"
            }), 400
        
        # Get user ID (for now, use 1 as default)
        user_id = 1
        
        # Create new profile
        db = SessionLocal()
        new_profile = PreferencesService.create_profile(
            db=db,
            user_id=user_id,
            profile_name=profile_name,
            description=data.get('description', ''),
            is_default=False
        )
        
        if new_profile:
            return jsonify({
                "success": True,
                "message": "Profile created successfully",
                "data": new_profile.to_dict(),
                "timestamp": "2025-01-07T21:55:00Z"
            }), 201
        else:
            return jsonify({
                "success": False,
                "error": "Failed to create profile",
                "timestamp": "2025-01-07T21:55:00Z"
            }), 500
        
    except Exception as e:
        logger.error(f"Error creating profile: {e}")
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
