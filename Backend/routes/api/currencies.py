from flask import Blueprint, jsonify, request
import sqlite3
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

currencies_bp = Blueprint('currencies', __name__, url_prefix='/api/v1/currencies')

def get_db_connection():
    """Get database connection"""
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DB_PATH = os.path.join(BASE_DIR, "db", "simpleTrade_new.db")
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@currencies_bp.route('/', methods=['GET'])
def get_currencies():
    """Get all currencies"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM currencies ORDER BY symbol")
        currencies = cursor.fetchall()
        
        # Convert to list of dictionaries
        currencies_list = []
        for currency in currencies:
            currencies_list.append({
                'id': currency[3],  # id is at index 3
                'symbol': currency[0],  # symbol is at index 0
                'name': currency[1],  # name is at index 1
                'usd_rate': currency[2],  # usd_rate is at index 2
                'created_at': currency[4]  # created_at is at index 4
            })
        
        conn.close()
        
        return jsonify({
            "status": "success",
            "data": currencies_list,
            "message": "Currencies retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error getting currencies: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve currencies"},
            "version": "v1"
        }), 500

@currencies_bp.route('/<int:currency_id>', methods=['GET'])
def get_currency(currency_id: int):
    """Get currency by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM currencies WHERE id = ?", (currency_id,))
        currency = cursor.fetchone()
        
        conn.close()
        
        if currency:
            currency_dict = {
                'id': currency[3],  # id is at index 3
                'symbol': currency[0],  # symbol is at index 0
                'name': currency[1],  # name is at index 1
                'usd_rate': currency[2],  # usd_rate is at index 2
                'created_at': currency[4]  # created_at is at index 4
            }
            
            return jsonify({
                "status": "success",
                "data": currency_dict,
                "message": "Currency retrieved successfully",
                "version": "v1"
            })
        
        return jsonify({
            "status": "error",
            "error": {"message": "Currency not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error getting currency {currency_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve currency"},
            "version": "v1"
        }), 500

@currencies_bp.route('/', methods=['POST'])
def create_currency():
    """Create new currency"""
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert new currency
        cursor.execute("""
            INSERT INTO currencies (symbol, name, usd_rate, created_at)
            VALUES (?, ?, ?, ?)
        """, (
            data.get('symbol'),
            data.get('name'),
            data.get('usd_rate'),
            datetime.now().isoformat()
        ))
        
        currency_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Get the created currency
        return get_currency(currency_id)
    except Exception as e:
        logger.error(f"Error creating currency: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400

@currencies_bp.route('/<int:currency_id>', methods=['PUT'])
def update_currency(currency_id: int):
    """Update currency"""
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if currency exists
        cursor.execute("SELECT id FROM currencies WHERE id = ?", (currency_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({
                "status": "error",
                "error": {"message": "Currency not found"},
                "version": "v1"
            }), 404
        
        # Update currency
        cursor.execute("""
            UPDATE currencies 
            SET symbol = ?, name = ?, usd_rate = ?
            WHERE id = ?
        """, (
            data.get('symbol'),
            data.get('name'),
            data.get('usd_rate'),
            currency_id
        ))
        
        conn.commit()
        conn.close()
        
        # Get the updated currency
        return get_currency(currency_id)
    except Exception as e:
        logger.error(f"Error updating currency {currency_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to update currency"},
            "version": "v1"
        }), 500

@currencies_bp.route('/<int:currency_id>', methods=['DELETE'])
def delete_currency(currency_id: int):
    """Delete currency"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if currency exists
        cursor.execute("SELECT id FROM currencies WHERE id = ?", (currency_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({
                "status": "error",
                "error": {"message": "Currency not found"},
                "version": "v1"
            }), 404
        
        # Delete currency
        cursor.execute("DELETE FROM currencies WHERE id = ?", (currency_id,))
        conn.commit()
        conn.close()
        
        return jsonify({
            "status": "success",
            "message": "Currency deleted successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error deleting currency {currency_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to delete currency"},
            "version": "v1"
        }), 500
