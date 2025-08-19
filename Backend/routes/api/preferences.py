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
    """טוען את כל ההעדפות מקובץ JSON"""
    try:
        preferences_path = os.path.join(os.path.dirname(__file__), '..', '..', 'trading-ui', 'config', 'preferences.json')
        with open(preferences_path, 'r', encoding='utf-8') as f:
            preferences = json.load(f)
        return jsonify(preferences)
    except FileNotFoundError:
        # אם הקובץ לא קיים, מחזיר ברירות מחדל
        default_preferences = {
            "defaults": {
                "primaryCurrency": "USD"
            },
            "user": {
                "primaryCurrency": "USD"
            }
        }
        return jsonify(default_preferences)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@preferences_bp.route('/api/preferences', methods=['POST'])
def save_preferences() -> Any:
    """שומר את כל ההעדפות לקובץ JSON"""
    try:
        data = request.json
        preferences_path = os.path.join(os.path.dirname(__file__), '..', '..', 'trading-ui', 'config', 'preferences.json')
        
        # יוצר את התיקייה אם היא לא קיימת
        os.makedirs(os.path.dirname(preferences_path), exist_ok=True)
        
        with open(preferences_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        return jsonify({"status": "success", "message": "העדפות נשמרו בהצלחה"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@preferences_bp.route('/api/preferences/<key>', methods=['PUT'])
def update_preference(key: str) -> Any:
    """מעדכן הגדרה ספציפית"""
    try:
        preferences_path = os.path.join(os.path.dirname(__file__), '..', '..', 'trading-ui', 'config', 'preferences.json')
        
        # טוען העדפות קיימות
        try:
            with open(preferences_path, 'r', encoding='utf-8') as f:
                preferences = json.load(f)
        except FileNotFoundError:
            preferences = {
                "defaults": {
                    "primaryCurrency": "USD"
                },
                "user": {
                    "primaryCurrency": "USD"
                }
            }
        
        # מעדכן את ההגדרה
        data = request.json
        if 'value' in data:
            preferences['user'][key] = data['value']
        
        # שומר חזרה לקובץ
        os.makedirs(os.path.dirname(preferences_path), exist_ok=True)
        with open(preferences_path, 'w', encoding='utf-8') as f:
            json.dump(preferences, f, indent=2, ensure_ascii=False)
        
        return jsonify({"status": "success", "message": f"הגדרה {key} עודכנה בהצלחה"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
