#!/usr/bin/env python3
"""
Preference Groups API Routes
Date: October 30, 2025
Description: API routes for managing preference groups
"""

from flask import Blueprint, request, jsonify
from typing import Dict, Any
import logging
import os
import sqlite3

logger = logging.getLogger(__name__)

# Create blueprint
preference_groups_bp = Blueprint('preference_groups', __name__, url_prefix='/api/preference-groups')

def get_db_connection():
    """Get database connection"""
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DB_PATH = os.path.join(BASE_DIR, "db", "tiktrack.db")
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@preference_groups_bp.route('/', methods=['GET'])
def get_preference_groups():
    """Get all preference groups"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM preference_groups ORDER BY id")
        groups = cursor.fetchall()
        
        conn.close()
        
        # Convert to list of dictionaries
        result = []
        for group in groups:
            result.append(dict(group))
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved {len(result)} preference_groups records',
            'data': result,
            'count': len(result),
            'version': '1.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting preference groups: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving preference groups: {str(e)}',
            'version': '1.0'
        }), 500

@preference_groups_bp.route('/<int:group_id>', methods=['GET'])
def get_preference_group(group_id):
    """Get a specific preference group by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM preference_groups WHERE id = ?", (group_id,))
        group = cursor.fetchone()
        
        conn.close()
        
        if not group:
            return jsonify({
                'status': 'error',
                'message': f'Preference group with ID {group_id} not found',
                'version': '1.0'
            }), 404
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved preference group {group_id}',
            'data': dict(group),
            'version': '1.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting preference group {group_id}: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving preference group: {str(e)}',
            'version': '1.0'
        }), 500

