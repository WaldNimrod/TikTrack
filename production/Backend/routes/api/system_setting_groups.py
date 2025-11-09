#!/usr/bin/env python3
"""
System Setting Groups API Routes
Date: October 30, 2025
Description: API routes for managing system setting groups
"""

from flask import Blueprint, request, jsonify
from typing import Dict, Any
import logging
import os
import sqlite3
from config.settings import DB_PATH  # Use production DB path

logger = logging.getLogger(__name__)

# Create blueprint
system_setting_groups_bp = Blueprint('system_setting_groups', __name__, url_prefix='/api/system_setting_groups')

def get_db_connection():
    """Get database connection - uses production DB path from config"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

@system_setting_groups_bp.route('/', methods=['GET'])
def get_system_setting_groups():
    """Get all system setting groups"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM system_setting_groups ORDER BY id")
        groups = cursor.fetchall()
        
        conn.close()
        
        # Convert to list of dictionaries
        result = []
        for group in groups:
            result.append(dict(group))
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved {len(result)} system_setting_groups records',
            'data': result,
            'count': len(result),
            'version': '1.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting system setting groups: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving system setting groups: {str(e)}',
            'version': '1.0'
        }), 500

@system_setting_groups_bp.route('/<int:group_id>', methods=['GET'])
def get_system_setting_group(group_id):
    """Get a specific system setting group by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM system_setting_groups WHERE id = ?", (group_id,))
        group = cursor.fetchone()
        
        conn.close()
        
        if not group:
            return jsonify({
                'status': 'error',
                'message': f'System setting group with ID {group_id} not found',
                'version': '1.0'
            }), 404
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved system setting group {group_id}',
            'data': dict(group),
            'version': '1.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting system setting group {group_id}: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving system setting group: {str(e)}',
            'version': '1.0'
        }), 500

