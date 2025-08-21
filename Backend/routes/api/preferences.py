"""
API routes for preferences management
"""
import json
import os
from flask import request, jsonify
from flask import Blueprint
from typing import Dict, Any, Union

preferences_bp = Blueprint('preferences', __name__)

@preferences_bp.route('/api/preferences', methods=['GET'])
def get_preferences() -> Any:
    """Load all preferences from JSON file"""
    try:
        preferences_path = os.path.join(os.path.dirname(__file__), '..', '..', 'trading-ui', 'config', 'preferences.json')
        with open(preferences_path, 'r', encoding='utf-8') as f:
            preferences = json.load(f)
        return jsonify(preferences)
    except FileNotFoundError:
        # If file doesn't exist, return full defaults
        default_preferences = {
            "defaults": {
                "primaryCurrency": "USD",
                "defaultStopLoss": 5,
                "defaultTargetPrice": 10,
                "timezone": "Asia/Jerusalem",
                "defaultStatusFilter": "all",
                "defaultTypeFilter": "all",
                "defaultAccountFilter": "all",
                "defaultDateRangeFilter": "all",
                "defaultSearchFilter": ""
            },
            "user": {
                "primaryCurrency": "USD",
                "defaultStopLoss": 5,
                "defaultTargetPrice": 10,
                "timezone": "Asia/Jerusalem",
                "defaultStatusFilter": "all",
                "defaultTypeFilter": "all",
                "defaultAccountFilter": "all",
                "defaultDateRangeFilter": "all",
                "defaultSearchFilter": ""
            }
        }
        return jsonify(default_preferences)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@preferences_bp.route('/api/preferences', methods=['POST'])
def save_preferences() -> Any:
    """Save all preferences to JSON file"""
    try:
        data = request.json
        preferences_path = os.path.join(os.path.dirname(__file__), '..', '..', 'trading-ui', 'config', 'preferences.json')
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(preferences_path), exist_ok=True)
        
        with open(preferences_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        return jsonify({"status": "success", "message": "Preferences saved successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@preferences_bp.route('/api/preferences/<key>', methods=['PUT'])
def update_preference(key: str) -> Any:
    """Update specific setting"""
    try:
        preferences_path = os.path.join(os.path.dirname(__file__), '..', '..', 'trading-ui', 'config', 'preferences.json')
        
        # Load existing preferences
        try:
            with open(preferences_path, 'r', encoding='utf-8') as f:
                preferences = json.load(f)
        except FileNotFoundError:
            preferences = {
                "defaults": {
                    "primaryCurrency": "USD",
                    "defaultStopLoss": 5,
                    "defaultTargetPrice": 10,
                    "timezone": "Asia/Jerusalem",
                    "defaultStatusFilter": "all",
                    "defaultTypeFilter": "all",
                    "defaultAccountFilter": "all",
                    "defaultDateRangeFilter": "all",
                    "defaultSearchFilter": ""
                },
                "user": {
                    "primaryCurrency": "USD",
                    "defaultStopLoss": 5,
                    "defaultTargetPrice": 10,
                    "timezone": "Asia/Jerusalem",
                    "defaultStatusFilter": "all",
                    "defaultTypeFilter": "all",
                    "defaultAccountFilter": "all",
                    "defaultDateRangeFilter": "all",
                    "defaultSearchFilter": ""
                }
            }
        
        # Update the setting
        data = request.json
        if 'value' in data:
            preferences['user'][key] = data['value']
        
        # Save back to file
        os.makedirs(os.path.dirname(preferences_path), exist_ok=True)
        with open(preferences_path, 'w', encoding='utf-8') as f:
            json.dump(preferences, f, indent=2, ensure_ascii=False)
        
        return jsonify({"status": "success", "message": f"Setting {key} updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
