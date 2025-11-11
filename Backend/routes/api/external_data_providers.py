#!/usr/bin/env python3
"""
External Data Providers API Routes
Date: October 30, 2025
Description: API routes for managing external data providers
"""

from flask import Blueprint, request, jsonify
from typing import Dict, Any
import logging
import os
import sqlite3

logger = logging.getLogger(__name__)

# Create blueprint
external_data_providers_bp = Blueprint('external_data_providers', __name__, url_prefix='/api/external-data-providers')

def get_db_connection():
    """Get database connection"""
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DB_PATH = os.path.join(BASE_DIR, "db", "simpleTrade_new.db")
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@external_data_providers_bp.route('/', methods=['GET'])
def get_external_data_providers():
    """Get all external data providers"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM external_data_providers ORDER BY id")
        providers = cursor.fetchall()
        
        conn.close()
        
        # Convert to list of dictionaries
        result = []
        for provider in providers:
            result.append(dict(provider))
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved {len(result)} external_data_providers records',
            'data': result,
            'count': len(result),
            'version': '1.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting external data providers: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving external data providers: {str(e)}',
            'version': '1.0'
        }), 500

@external_data_providers_bp.route('/<int:provider_id>', methods=['GET'])
def get_external_data_provider(provider_id):
    """Get a specific external data provider by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM external_data_providers WHERE id = ?", (provider_id,))
        provider = cursor.fetchone()
        
        conn.close()
        
        if not provider:
            return jsonify({
                'status': 'error',
                'message': f'External data provider with ID {provider_id} not found',
                'version': '1.0'
            }), 404
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved external data provider {provider_id}',
            'data': dict(provider),
            'version': '1.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting external data provider {provider_id}: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving external data provider: {str(e)}',
            'version': '1.0'
        }), 500

