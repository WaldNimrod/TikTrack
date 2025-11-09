#!/usr/bin/env python3
"""
Plan Conditions List API Routes
Date: October 30, 2025
Description: API routes for listing all plan conditions from database table
"""

from flask import Blueprint, request, jsonify
from typing import Dict, Any
import logging
import os
import sqlite3
from config.settings import DB_PATH  # Use production DB path

logger = logging.getLogger(__name__)

# Create blueprint
plan_conditions_list_bp = Blueprint('plan_conditions_list', __name__, url_prefix='/api/plan_conditions')

def get_db_connection():
    """Get database connection - uses production DB path from config"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

@plan_conditions_list_bp.route('/', methods=['GET'])
def get_plan_conditions():
    """Get all plan conditions"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM plan_conditions ORDER BY id")
        conditions = cursor.fetchall()
        
        conn.close()
        
        # Convert to list of dictionaries
        result = []
        for condition in conditions:
            result.append(dict(condition))
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved {len(result)} plan_conditions records',
            'data': result,
            'count': len(result),
            'version': '1.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting plan conditions: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving plan conditions: {str(e)}',
            'version': '1.0'
        }), 500

