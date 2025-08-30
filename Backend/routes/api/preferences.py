"""
User Preferences API - TikTrack

This module provides API endpoints for managing user preferences.
Supports multi-user system with fallback to default user.

Author: TikTrack Development Team
Version: 1.0
Date: August 2025
"""

import json
import os
from flask import Blueprint, request, jsonify
from pathlib import Path
from sqlalchemy.orm import Session
from config.database import get_db
from services.user_service import UserService

# Create blueprint
preferences_bp = Blueprint('preferences', __name__)

# Path to preferences file (for backward compatibility)
PREFERENCES_FILE = Path(__file__).parent.parent.parent.parent / 'trading-ui' / 'config' / 'preferences.json'

# Default preferences
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
    "consoleCleanupInterval": 60000
}

def load_preferences_file():
    """Load preferences file (for backward compatibility)"""
    try:
        if PREFERENCES_FILE.exists():
            with open(PREFERENCES_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            # Create new file with defaults
            default_data = {
                "defaults": DEFAULT_PREFERENCES,
                "users": {
                    "nimrod": DEFAULT_PREFERENCES
                }
            }
            save_preferences_file(default_data)
            return default_data
    except Exception as e:
        print(f"❌ Error loading preferences file: {e}")
        return {
            "defaults": DEFAULT_PREFERENCES,
            "users": {
                "nimrod": DEFAULT_PREFERENCES
            }
        }

def save_preferences_file(data):
    """Save preferences file (for backward compatibility)"""
    try:
        # Ensure directory exists
        PREFERENCES_FILE.parent.mkdir(parents=True, exist_ok=True)
        
        with open(PREFERENCES_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"❌ Error saving preferences file: {e}")
        return False

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
            return jsonify({"success": True, "message": "Preferences saved successfully"})
        else:
            return jsonify({"success": False, "message": "Error saving preferences"}), 500
    except Exception as e:
        print(f"❌ Error saving preferences: {e}")
        return jsonify({"success": False, "message": "Error saving preferences"}), 500

@preferences_bp.route('/api/v1/preferences/<key>', methods=['PUT'])
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
            return jsonify({"success": True, "message": f"Preference {key} saved successfully"})
        else:
            return jsonify({"success": False, "message": "Error saving preference"}), 500
    except Exception as e:
        print(f"❌ Error updating preference {key}: {e}")
        return jsonify({"success": False, "message": "Error updating preference"}), 500

@preferences_bp.route('/api/v1/preferences/reset', methods=['POST'])
def reset_preferences():
    """Reset preferences to defaults with fallback to default user"""
    try:
        db: Session = next(get_db())
        user_id = get_user_id_from_request()
        
        # Reset to default preferences
        success = UserService.set_user_preferences(db, DEFAULT_PREFERENCES, user_id)
        
        if success:
            return jsonify({"success": True, "message": "Preferences reset to defaults"})
        else:
            return jsonify({"success": False, "message": "Error resetting preferences"}), 500
    except Exception as e:
        print(f"❌ Error resetting preferences: {e}")
        return jsonify({"success": False, "message": "Error resetting preferences"}), 500
