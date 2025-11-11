#!/usr/bin/env python3
"""
Quotes Last API Routes
Date: October 30, 2025
Description: API routes for managing last quotes data
"""

from flask import Blueprint, request, jsonify
from typing import Dict, Any
import logging
import os
import sqlite3

logger = logging.getLogger(__name__)

# Create blueprint
quotes_last_bp = Blueprint('quotes_last', __name__, url_prefix='/api/quotes-last')

def get_db_connection():
    """Get database connection"""
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DB_PATH = os.path.join(BASE_DIR, "db", "tiktrack.db")
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@quotes_last_bp.route('/', methods=['GET'])
def get_quotes_last():
    """Get all last quotes"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM quotes_last ORDER BY id")
        quotes = cursor.fetchall()
        
        conn.close()
        
        # Convert to list of dictionaries
        result = []
        for quote in quotes:
            result.append(dict(quote))
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved {len(result)} quotes_last records',
            'data': result,
            'count': len(result),
            'version': '1.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting quotes last: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving quotes last: {str(e)}',
            'version': '1.0'
        }), 500

@quotes_last_bp.route('/<int:quote_id>', methods=['GET'])
def get_quote_last(quote_id):
    """Get a specific last quote by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM quotes_last WHERE id = ?", (quote_id,))
        quote = cursor.fetchone()
        
        conn.close()
        
        if not quote:
            return jsonify({
                'status': 'error',
                'message': f'Last quote with ID {quote_id} not found',
                'version': '1.0'
            }), 404
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved last quote {quote_id}',
            'data': dict(quote),
            'version': '1.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting last quote {quote_id}: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving last quote: {str(e)}',
            'version': '1.0'
        }), 500

