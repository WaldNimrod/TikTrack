#!/usr/bin/env python3
"""
User Preferences List API Routes
Date: October 30, 2025
Description: API routes for listing all user preferences from database table
"""

from flask import Blueprint, request, jsonify
from typing import Dict, Any
import logging
import os
import sqlite3
from config.settings import DB_PATH  # Use production DB path

logger = logging.getLogger(__name__)

# Create blueprint
user_preferences_list_bp = Blueprint('user_preferences_list', __name__, url_prefix='/api/user_preferences')

def get_db_connection():
    """Get database connection - uses production DB path from config"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

@user_preferences_list_bp.route('/', methods=['GET'])
def get_user_preferences():
    """Get all user preferences"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM user_preferences_v3 ORDER BY id")
        preferences = cursor.fetchall()
        
        conn.close()
        
        # Convert to list of dictionaries
        result = []
        for pref in preferences:
            result.append(dict(pref))
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved {len(result)} user_preferences_v3 records',
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

