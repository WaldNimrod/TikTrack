#!/usr/bin/env python3
"""
Simple API Test
===============

בדיקה פשוטה של ה-API החדש
"""

from flask import Flask, jsonify
from services.preferences_service_v3 import preferences_service

app = Flask(__name__)

@app.route('/test/health', methods=['GET'])
def health_check():
    """בדיקת תקינות פשוטה"""
    try:
        # בדיקה של השירות
        timezone = preferences_service.get_preference(1, 'timezone')
        
        return jsonify({
            "success": True,
            "data": {
                "status": "healthy",
                "test_preference": timezone,
                "service": "preferences_v3"
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/test/preference/<preference_name>', methods=['GET'])
def get_test_preference(preference_name):
    """קבלת העדפה לבדיקה"""
    try:
        value = preferences_service.get_preference(1, preference_name)
        
        return jsonify({
            "success": True,
            "data": {
                "preference_name": preference_name,
                "value": value
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == "__main__":
    print("🚀 Starting simple API test server on http://localhost:5000")
    app.run(debug=True, port=5000)
