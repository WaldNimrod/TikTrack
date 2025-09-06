"""
User Preferences API V1 - TikTrack (LEGACY)

⚠️ DEPRECATED: This module is kept for backward compatibility.
Use preferences_v2.py for new implementations.

This module provides API endpoints for managing user preferences.
Supports multi-user system with fallback to default user.

Author: TikTrack Development Team
Version: 1.0 (LEGACY)
Date: August 2025
Deprecated: January 2025 (replaced by V2)
"""

from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from config.database import get_db
from services.user_service import UserService
from services.advanced_cache_service import cache_with_deps, invalidate_cache

# Create blueprint
preferences_bp = Blueprint('preferences', __name__)

# Default preferences - hardcoded, no more JSON file
DEFAULT_PREFERENCES = {
    "primaryCurrency": "USD",
    "timezone": "Asia/Jerusalem", 
    "defaultStopLoss": 5,
    "defaultTargetPrice": 10,
    "defaultCommission": 1.0,
    "defaultStatusFilter": "open",
    "defaultTypeFilter": "swing",
    "defaultAccountFilter": "all",
    "defaultDateRangeFilter": "this_week",
    "defaultSearchFilter": "",
    "consoleCleanupInterval": 60000,
    "dataRefreshInterval": 5,
    "primaryDataProvider": "yahoo",
    "secondaryDataProvider": "google",
    "cacheTTL": 5,
    "maxBatchSize": 25,
    "requestDelay": 200,
    "retryAttempts": 2,
    "retryDelay": 5,
    "autoRefresh": False,
    "verboseLogging": False,
    # External data preferences
    "showPercentageChanges": True,
    "showVolume": True,
    "notifyOnDataFailures": True,
    "notifyOnStaleData": False,
    "refreshOverrides": {},
    "headerOpacity": {
        "main": 60,
        "sub": 30
    },
    "statusColors": {
        "open": {
            "light": "rgba(40, 167, 69, 0.1)",
            "medium": "#28a745",
            "dark": "#155724",
            "border": "rgba(40, 167, 69, 0.3)"
        },
        "closed": {
            "light": "rgba(108, 117, 125, 0.1)",
            "medium": "#6c757d",
            "dark": "#383d41",
            "border": "rgba(108, 117, 125, 0.3)"
        },
        "cancelled": {
            "light": "rgba(220, 53, 69, 0.1)",
            "medium": "#dc3545",
            "dark": "#721c24",
            "border": "rgba(220, 53, 69, 0.3)"
        }
    },
    "investmentTypeColors": {
        "swing": {
            "light": "rgba(0, 123, 255, 0.1)",
            "medium": "#007bff",
            "dark": "#0056b3",
            "border": "rgba(0, 123, 255, 0.3)"
        },
        "investment": {
            "light": "rgba(40, 167, 69, 0.1)",
            "medium": "#28a745",
            "dark": "#155724",
            "border": "rgba(40, 167, 69, 0.3)"
        },
        "passive": {
            "light": "rgba(111, 66, 193, 0.1)",
            "medium": "#6f42c1",
            "dark": "#4a2c7a",
            "border": "rgba(111, 66, 193, 0.3)"
        }
    }
}

def get_user_id_from_request() -> int:
    """Get user ID from request, default to default user"""
    try:
        # In the future, this will get user ID from session/token
        # For now, always return default user ID
        return UserService.get_current_user_id()
    except Exception as e:
        print(f"❌ Error getting user ID from request: {e}")
        return UserService.DEFAULT_USER_ID

@preferences_bp.route('/api/v1/preferences/', methods=['GET'])
@cache_with_deps(ttl=300, dependencies=['preferences'])  # Cache for 5 minutes with dependency
def get_preferences():
    """Get user preferences with fallback to default user"""
    try:
        db: Session = next(get_db())
        user_id = get_user_id_from_request()
        
        # Get preferences from database
        preferences = UserService.get_user_preferences(db, user_id)
        
        return jsonify(preferences)
    except Exception as e:
        print(f"❌ Error getting preferences: {e}")
        return jsonify(DEFAULT_PREFERENCES)

@preferences_bp.route('/api/v1/preferences/', methods=['POST'])
@invalidate_cache(['preferences'])  # Invalidate cache after saving preferences
def save_all_preferences():
    """Save all user preferences with fallback to default user"""
    try:
        db: Session = next(get_db())
        user_id = get_user_id_from_request()
        new_preferences = request.json.get('preferences', {})
        
        # Get current preferences and merge with new ones
        current_preferences = UserService.get_user_preferences(db, user_id)
        current_preferences.update(new_preferences)
        
        # Save merged preferences to database
        success = UserService.set_user_preferences(db, current_preferences, user_id)
        
        if success:
            # Invalidate cache so changes take effect immediately
            invalidate_cache('preferences')
            return jsonify({"success": True, "message": "Preferences saved successfully"})
        else:
            return jsonify({"success": False, "message": "Error saving preferences"}), 500
    except Exception as e:
        print(f"❌ Error saving preferences: {e}")
        return jsonify({"success": False, "message": "Error saving preferences"}), 500

@preferences_bp.route('/api/v1/preferences/<key>', methods=['PUT'])
@invalidate_cache(['preferences'])  # Invalidate cache after updating preference
def update_preference(key):
    """Update single preference with fallback to default user"""
    try:
        db: Session = next(get_db())
        user_id = get_user_id_from_request()
        value = request.json.get('value')
        
        if value is None:
            return jsonify({"success": False, "message": "Value is missing"}), 400
        
        # Get current preferences
        current_preferences = UserService.get_user_preferences(db, user_id)
        
        # Update specific preference
        current_preferences[key] = value
        
        # Save updated preferences
        success = UserService.set_user_preferences(db, current_preferences, user_id)
        
        if success:
            # Invalidate cache so changes take effect immediately
            invalidate_cache('preferences')
            return jsonify({"success": True, "message": f"Preference {key} saved successfully"})
        else:
            return jsonify({"success": False, "message": "Error saving preference"}), 500
    except Exception as e:
        print(f"❌ Error updating preference {key}: {e}")
        return jsonify({"success": False, "message": "Error updating preference"}), 500

@preferences_bp.route('/api/v1/preferences/reset', methods=['POST'])
@invalidate_cache(['preferences'])  # Invalidate cache after resetting preferences
def reset_preferences():
    """Reset preferences to defaults with fallback to default user"""
    try:
        db: Session = next(get_db())
        user_id = get_user_id_from_request()
        
        # Reset to default preferences
        success = UserService.set_user_preferences(db, DEFAULT_PREFERENCES, user_id)
        
        if success:
            # Invalidate cache so changes take effect immediately
            invalidate_cache('preferences')
            return jsonify({"success": True, "message": "Preferences reset to defaults"})
        else:
            return jsonify({"success": False, "message": "Error resetting preferences"}), 500
    except Exception as e:
        print(f"❌ Error resetting preferences: {e}")
        return jsonify({"success": False, "message": "Error resetting preferences"}), 500

@preferences_bp.route('/api/v1/preferences/update-defaults', methods=['POST'])
@invalidate_cache(['preferences'])  # Invalidate cache after updating defaults
def update_system_defaults():
    """Update system default preferences based on current user preferences"""
    try:
        db: Session = next(get_db())
        user_id = get_user_id_from_request()
        
        # Get current user preferences
        current_preferences = UserService.get_user_preferences(db, user_id)
        
        # Update the DEFAULT_PREFERENCES with current user preferences
        # This will affect new users and users who reset their preferences
        global DEFAULT_PREFERENCES
        DEFAULT_PREFERENCES.update(current_preferences)
        
        # Log the update
        print(f"✅ System defaults updated by user {user_id}")
        print(f"📊 Updated {len(current_preferences)} default preferences")
        
        # Invalidate cache so changes take effect immediately
        invalidate_cache('preferences')
        
        return jsonify({
            "success": True, 
            "message": "System defaults updated successfully",
            "updated_count": len(current_preferences)
        })
        
    except Exception as e:
        print(f"❌ Error updating system defaults: {e}")
        return jsonify({"success": False, "message": "Error updating system defaults"}), 500
