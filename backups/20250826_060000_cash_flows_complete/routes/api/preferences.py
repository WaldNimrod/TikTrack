"""
API routes for preferences management
"""
import json
import os
from flask import request, jsonify
from flask import Blueprint
from typing import Dict, Any, Union

preferences_bp = Blueprint('preferences', __name__, url_prefix='/api/v1/preferences')

@preferences_bp.route('/', methods=['GET'])
def get_preferences() -> Any:
    """Load all preferences from JSON file"""
    try:
        preferences_path = os.path.join(os.path.dirname(__file__), '..', '..', 'trading-ui', 'config', 'preferences.json')
        
        # Default user for development
        default_user = "nimrod"
        
        try:
            with open(preferences_path, 'r', encoding='utf-8') as f:
                preferences = json.load(f)
        except FileNotFoundError:
            print("DEBUG: File not found, creating new preferences structure")
            preferences = {
                "defaults": {
                    "primaryCurrency": "USD",
                    "defaultStopLoss": 5,
                    "defaultTargetPrice": 10,
                    "defaultCommission": 1.0,
                    "consoleCleanupInterval": 60000,
                    "timezone": "Asia/Jerusalem",
                    "defaultStatusFilter": "open",
                    "defaultTypeFilter": "swing",
                    "defaultAccountFilter": "all",
                    "defaultDateRangeFilter": "this_week",
                    "defaultSearchFilter": ""
                },
                "users": {
                    default_user: {
                        "primaryCurrency": "USD",
                        "defaultStopLoss": 5,
                        "defaultTargetPrice": 10,
                        "defaultCommission": 1.0,
                        "consoleCleanupInterval": 60000,
                        "timezone": "Asia/Jerusalem",
                        "defaultStatusFilter": "open",
                        "defaultTypeFilter": "swing",
                        "defaultAccountFilter": "all",
                        "defaultDateRangeFilter": "this_week",
                        "defaultSearchFilter": ""
                    }
                },
                "currentUser": default_user
            }
            
            # Save the new preferences to file
            os.makedirs(os.path.dirname(preferences_path), exist_ok=True)
            with open(preferences_path, 'w', encoding='utf-8') as f:
                json.dump(preferences, f, indent=2, ensure_ascii=False)
            print("DEBUG: Created new preferences file")
        
        # Ensure proper structure with multi-user support
        if 'defaults' not in preferences:
            preferences['defaults'] = {
                "primaryCurrency": "USD",
                "defaultStopLoss": 5,
                "defaultTargetPrice": 10,
                "defaultCommission": 1.0,
                "consoleCleanupInterval": 60000,
                "timezone": "Asia/Jerusalem",
                "defaultStatusFilter": "open",
                "defaultTypeFilter": "swing",
                "defaultAccountFilter": "all",
                "defaultDateRangeFilter": "this_week",
                "defaultSearchFilter": ""
            }
        else:
            # Update existing defaults to new values
            preferences['defaults'].update({
                "defaultStatusFilter": "open",
                "defaultTypeFilter": "swing",
                "defaultDateRangeFilter": "this_week"
            })
        
        if 'users' not in preferences:
            preferences['users'] = {}
        
        if 'currentUser' not in preferences:
            preferences['currentUser'] = default_user
        
        # Ensure current user exists
        current_user = preferences.get('currentUser', default_user)
        if current_user not in preferences['users']:
                            preferences['users'][current_user] = {
                    "primaryCurrency": "USD",
                    "defaultStopLoss": 5,
                    "defaultTargetPrice": 10,
                    "defaultCommission": 1.0,
                    "consoleCleanupInterval": 60000,
                    "timezone": "Asia/Jerusalem",
                    "defaultStatusFilter": "open",
                    "defaultTypeFilter": "swing",
                    "defaultAccountFilter": "all",
                    "defaultDateRangeFilter": "this_week",
                    "defaultSearchFilter": ""
                }
        
        # Keep backward compatibility - set 'user' to current user's preferences
        preferences['user'] = preferences['users'][current_user].copy()
        
        # Update user preferences to match defaults if they're old
        if preferences['user'].get('defaultStatusFilter') == 'all':
            preferences['user']['defaultStatusFilter'] = 'open'
        if preferences['user'].get('defaultTypeFilter') == 'all':
            preferences['user']['defaultTypeFilter'] = 'swing'
        if preferences['user'].get('defaultDateRangeFilter') == 'all':
            preferences['user']['defaultDateRangeFilter'] = 'this_week'
            
        # Update users preferences to match defaults if they're old
        if current_user in preferences['users']:
            if preferences['users'][current_user].get('defaultStatusFilter') == 'all':
                preferences['users'][current_user]['defaultStatusFilter'] = 'open'
            if preferences['users'][current_user].get('defaultTypeFilter') == 'all':
                preferences['users'][current_user]['defaultTypeFilter'] = 'swing'
            if preferences['users'][current_user].get('defaultDateRangeFilter') == 'all':
                preferences['users'][current_user]['defaultDateRangeFilter'] = 'this_week'
        
        # Save updated preferences to file
        os.makedirs(os.path.dirname(preferences_path), exist_ok=True)
        with open(preferences_path, 'w', encoding='utf-8') as f:
            json.dump(preferences, f, indent=2, ensure_ascii=False)
        
        return jsonify(preferences)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@preferences_bp.route('/', methods=['POST'])
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

@preferences_bp.route('/<key>', methods=['PUT'])
def update_preference(key: str) -> Any:
    """Update specific setting"""
    try:
        print(f"DEBUG: Starting update_preference for key: {key}")
        preferences_path = os.path.join(os.path.dirname(__file__), '..', '..', 'trading-ui', 'config', 'preferences.json')
        print(f"DEBUG: Preferences path: {preferences_path}")
        
        # Default user for development
        default_user = "nimrod"
        
        # Load existing preferences
        try:
            with open(preferences_path, 'r', encoding='utf-8') as f:
                preferences = json.load(f)
            print("DEBUG: Successfully loaded existing preferences")
        except FileNotFoundError:
            print("DEBUG: File not found, creating default preferences")
            preferences = {
                            "defaults": {
                "primaryCurrency": "USD",
                "defaultStopLoss": 5,
                "defaultTargetPrice": 10,
                "timezone": "Asia/Jerusalem",
                "defaultStatusFilter": "open",
                "defaultTypeFilter": "swing",
                "defaultAccountFilter": "all",
                "defaultDateRangeFilter": "this_week",
                "defaultSearchFilter": ""
            },
                "users": {
                    default_user: {
                        "primaryCurrency": "USD",
                        "defaultStopLoss": 5,
                        "defaultTargetPrice": 10,
                        "timezone": "Asia/Jerusalem",
                        "defaultStatusFilter": "open",
                        "defaultTypeFilter": "swing",
                        "defaultAccountFilter": "all",
                        "defaultDateRangeFilter": "this_week",
                        "defaultSearchFilter": ""
                    }
                },
                "currentUser": default_user
            }
        
        # Ensure users section exists and current user is set
        if 'users' not in preferences:
            preferences['users'] = {}
        if 'currentUser' not in preferences:
            preferences['currentUser'] = default_user
        if preferences['currentUser'] not in preferences['users']:
            preferences['users'][preferences['currentUser']] = {
                "primaryCurrency": "USD",
                "defaultStopLoss": 5,
                "defaultTargetPrice": 10,
                "defaultCommission": 1.0,
                "consoleCleanupInterval": 60000,
                "timezone": "Asia/Jerusalem",
                "defaultStatusFilter": "open",
                "defaultTypeFilter": "swing",
                "defaultAccountFilter": "all",
                "defaultDateRangeFilter": "all",
                "defaultSearchFilter": ""
            }
        
        # Update the setting for current user
        data = request.json
        print(f"DEBUG: Received data: {data}")
        print(f"DEBUG: Current preferences structure: {preferences}")
        
        if 'value' in data:
            current_user = preferences.get('currentUser', default_user)
            print(f"DEBUG: Current user: {current_user}")
            
            # Ensure users section and current user exist
            if 'users' not in preferences:
                preferences['users'] = {}
                print("DEBUG: Created users section")
            if current_user not in preferences['users']:
                preferences['users'][current_user] = {}
                print(f"DEBUG: Created user section for {current_user}")
                
            preferences['users'][current_user][key] = data['value']
            print(f"DEBUG: Set {key} = {data['value']} for user {current_user}")
            
            # Keep backward compatibility with 'user' section
            if 'user' not in preferences:
                preferences['user'] = {}
                print("DEBUG: Created backward compatibility user section")
            preferences['user'][key] = data['value']
            print(f"DEBUG: Set backward compatibility {key} = {data['value']}")
        
        # Save back to file
        os.makedirs(os.path.dirname(preferences_path), exist_ok=True)
        with open(preferences_path, 'w', encoding='utf-8') as f:
            json.dump(preferences, f, indent=2, ensure_ascii=False)
        
        return jsonify({"status": "success", "message": f"Setting {key} updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
