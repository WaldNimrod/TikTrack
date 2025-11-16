#!/usr/bin/env python3
"""
User Preferences List API Routes
Date: October 30, 2025
Description: API routes for listing all user preferences from database table
"""

from flask import Blueprint, request, jsonify
from routes.api.base_entity_decorators import require_authentication
from typing import Dict, Any
import logging
import os
import sqlite3

logger = logging.getLogger(__name__)

# Create blueprint
user_preferences_list_bp = Blueprint('user_preferences_list', __name__, url_prefix='/api/user-preferences')

def get_db_connection():
    """Get database connection"""
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    # Use the unified tiktrack.db database file (standardized for dev and production)
    DB_PATH = os.path.join(BASE_DIR, "db", "tiktrack.db")
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@user_preferences_list_bp.route('/', methods=['GET'])
@require_authentication()
def get_user_preferences():
    """Get all user preferences"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM user_preferences ORDER BY id")
        preferences = cursor.fetchall()
        
        conn.close()
        
        # Convert to list of dictionaries
        result = []
        for pref in preferences:
            result.append(dict(pref))
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved {len(result)} user_preferences records',
            'data': result,
            'count': len(result),
            'version': '1.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting user preferences: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving user preferences: {str(e)}',
            'version': '1.0'
        }), 500

