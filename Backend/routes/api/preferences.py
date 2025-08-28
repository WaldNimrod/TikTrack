"""
Simple Preferences API
API פשוט לניהול העדפות
"""

import json
import os
from flask import Blueprint, request, jsonify
from pathlib import Path

# יצירת blueprint
preferences_bp = Blueprint('preferences', __name__)

# נתיב לקובץ ההעדפות
PREFERENCES_FILE = Path(__file__).parent.parent.parent.parent / 'trading-ui' / 'config' / 'preferences.json'

# ברירות מחדל
DEFAULT_PREFERENCES = {
    "primaryCurrency": "USD",
    "timezone": "Asia/Jerusalem", 
    "defaultStopLoss": 5,
    "defaultTargetPrice": 10,
    "defaultCommission": 1.0,
    "defaultStatusFilter": "all",
    "defaultTypeFilter": "all",
    "defaultAccountFilter": "all",
    "defaultDateRangeFilter": "all",
    "defaultSearchFilter": ""
}

def load_preferences_file():
    """טוען את קובץ ההעדפות"""
    try:
        if PREFERENCES_FILE.exists():
            with open(PREFERENCES_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            # יצירת קובץ חדש עם ברירות מחדל
            default_data = {
                "defaults": DEFAULT_PREFERENCES,
                "users": {
                    "nimrod": DEFAULT_PREFERENCES
                }
            }
            save_preferences_file(default_data)
            return default_data
    except Exception as e:
        print(f"❌ שגיאה בטעינת קובץ העדפות: {e}")
        return {
            "defaults": DEFAULT_PREFERENCES,
            "users": {
                "nimrod": DEFAULT_PREFERENCES
            }
        }

def save_preferences_file(data):
    """שומר את קובץ ההעדפות"""
    try:
        # וודא שהתיקייה קיימת
        PREFERENCES_FILE.parent.mkdir(parents=True, exist_ok=True)
        
        with open(PREFERENCES_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"❌ שגיאה בשמירת קובץ העדפות: {e}")
        return False

@preferences_bp.route('/api/v1/preferences/', methods=['GET'])
def get_preferences():
    """מחזיר את כל ההעדפות"""
    try:
        data = load_preferences_file()
        user_preferences = data.get('users', {}).get('nimrod', data.get('defaults', DEFAULT_PREFERENCES))
        return jsonify(user_preferences)
    except Exception as e:
        print(f"❌ שגיאה בקבלת העדפות: {e}")
        return jsonify(DEFAULT_PREFERENCES)

@preferences_bp.route('/api/v1/preferences/', methods=['POST'])
def save_all_preferences():
    """שומר את כל ההעדפות"""
    try:
        data = load_preferences_file()
        new_preferences = request.json.get('preferences', {})
        
        # עדכן העדפות משתמש
        if 'users' not in data:
            data['users'] = {}
        data['users']['nimrod'] = new_preferences
        
        if save_preferences_file(data):
            return jsonify({"success": True, "message": "העדפות נשמרו בהצלחה"})
        else:
            return jsonify({"success": False, "message": "שגיאה בשמירת העדפות"}), 500
    except Exception as e:
        print(f"❌ שגיאה בשמירת העדפות: {e}")
        return jsonify({"success": False, "message": "שגיאה בשמירת העדפות"}), 500

@preferences_bp.route('/api/v1/preferences/<key>', methods=['PUT'])
def update_preference(key):
    """מעדכן העדפה אחת"""
    try:
        data = load_preferences_file()
        value = request.json.get('value')
        
        if value is None:
            return jsonify({"success": False, "message": "ערך חסר"}), 400
        
        # עדכן העדפה
        if 'users' not in data:
            data['users'] = {}
        if 'nimrod' not in data['users']:
            data['users']['nimrod'] = {}
        
        data['users']['nimrod'][key] = value
        
        if save_preferences_file(data):
            return jsonify({"success": True, "message": f"העדפה {key} נשמרה בהצלחה"})
        else:
            return jsonify({"success": False, "message": "שגיאה בשמירת העדפה"}), 500
    except Exception as e:
        print(f"❌ שגיאה בעדכון העדפה {key}: {e}")
        return jsonify({"success": False, "message": "שגיאה בעדכון העדפה"}), 500

@preferences_bp.route('/api/v1/preferences/reset', methods=['POST'])
def reset_preferences():
    """מאפס העדפות לברירות מחדל"""
    try:
        data = load_preferences_file()
        data['users']['nimrod'] = DEFAULT_PREFERENCES.copy()
        
        if save_preferences_file(data):
            return jsonify({"success": True, "message": "העדפות אופסו לברירות מחדל"})
        else:
            return jsonify({"success": False, "message": "שגיאה באיפוס העדפות"}), 500
    except Exception as e:
        print(f"❌ שגיאה באיפוס העדפות: {e}")
        return jsonify({"success": False, "message": "שגיאה באיפוס העדפות"}), 500
