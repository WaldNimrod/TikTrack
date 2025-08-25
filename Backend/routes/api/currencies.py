from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from services.currency_service import CurrencyService
import logging
import os
import sqlite3
import re

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
        
        cursor.execute("SELECT symbol, name, usd_rate, id, created_at FROM currencies ORDER BY id")
        currencies = cursor.fetchall()
        
        conn.close()
        
        result = []
        for currency in currencies:
            result.append({
                'symbol': currency[0],  # symbol is at index 0
                'name': currency[1],    # name is at index 1
                'usd_rate': currency[2], # usd_rate is at index 2
                'id': currency[3],      # id is at index 3
                'created_at': currency[4] # created_at is at index 4
            })
        
        return jsonify({
            "status": "success",
            "data": result,
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
        
        cursor.execute("SELECT symbol, name, usd_rate, id, created_at FROM currencies WHERE id = ?", (currency_id,))
        currency = cursor.fetchone()
        
        conn.close()
        
        if currency:
            currency_dict = {
                'symbol': currency[0],  # symbol is at index 0
                'name': currency[1],    # name is at index 1
                'usd_rate': currency[2], # usd_rate is at index 2
                'id': currency[3],      # id is at index 3
                'created_at': currency[4] # created_at is at index 4
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
        symbol = data.get('symbol', '').strip().upper()
        name = data.get('name', '').strip()
        usd_rate = data.get('usd_rate', 1.0)
        
        # וולידציה של שדות חובה
        if not symbol:
            return jsonify({
                "status": "error",
                "error": {"message": "סמל מטבע הוא שדה חובה"},
                "version": "v1"
            }), 400
        
        if not name:
            return jsonify({
                "status": "error",
                "error": {"message": "שם מטבע הוא שדה חובה"},
                "version": "v1"
            }), 400
        
        # וולידציה של תבנית סמל מטבע
        if not re.match(r'^[A-Z]+$', symbol):
            return jsonify({
                "status": "error",
                "error": {"message": "סמל מטבע חייב להכיל רק אותיות אנגליות גדולות"},
                "version": "v1"
            }), 400
        
        # וולידציה של אורך סמל מטבע
        if len(symbol) > 10:
            return jsonify({
                "status": "error",
                "error": {"message": "סמל מטבע לא יכול להיות יותר מ-10 תווים"},
                "version": "v1"
            }), 400
        
        # וולידציה של שער דולר
        try:
            usd_rate = float(usd_rate)
            if usd_rate < 0:
                return jsonify({
                    "status": "error",
                    "error": {"message": "שער דולר חייב להיות מספר חיובי"},
                    "version": "v1"
                }), 400
        except (ValueError, TypeError):
            return jsonify({
                "status": "error",
                "error": {"message": "שער דולר חייב להיות מספר תקין"},
                "version": "v1"
            }), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # בדיקה אם סמל המטבע כבר קיים
        cursor.execute("SELECT id FROM currencies WHERE symbol = ?", (symbol,))
        if cursor.fetchone():
            conn.close()
            return jsonify({
                "status": "error",
                "error": {"message": "סמל מטבע זה כבר קיים במערכת"},
                "version": "v1"
            }), 400
        
        cursor.execute(
            "INSERT INTO currencies (symbol, name, usd_rate) VALUES (?, ?, ?)",
            (symbol, name, usd_rate)
        )
        currency_id = cursor.lastrowid
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "status": "success",
            "data": {
                'id': currency_id,
                'symbol': symbol,
                'name': name,
                'usd_rate': usd_rate,
                'created_at': None  # Will be set by database default
            },
            "message": "מטבע נוסף בהצלחה",
            "version": "v1"
        }), 201
    except Exception as e:
        logger.error(f"Error creating currency: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה פנימית בשרת"},
            "version": "v1"
        }), 500

@currencies_bp.route('/<int:currency_id>', methods=['PUT'])
def update_currency(currency_id: int):
    """Update currency"""
    try:
        data = request.get_json()
        symbol = data.get('symbol', '').strip().upper()
        name = data.get('name', '').strip()
        usd_rate = data.get('usd_rate')
        
        # וולידציה של שדות חובה
        if not symbol:
            return jsonify({
                "status": "error",
                "error": {"message": "סמל מטבע הוא שדה חובה"},
                "version": "v1"
            }), 400
        
        if not name:
            return jsonify({
                "status": "error",
                "error": {"message": "שם מטבע הוא שדה חובה"},
                "version": "v1"
            }), 400
        
        # וולידציה של תבנית סמל מטבע
        if not re.match(r'^[A-Z]+$', symbol):
            return jsonify({
                "status": "error",
                "error": {"message": "סמל מטבע חייב להכיל רק אותיות אנגליות גדולות"},
                "version": "v1"
            }), 400
        
        # וולידציה של אורך סמל מטבע
        if len(symbol) > 10:
            return jsonify({
                "status": "error",
                "error": {"message": "סמל מטבע לא יכול להיות יותר מ-10 תווים"},
                "version": "v1"
            }), 400
        
        # וולידציה של שער דולר
        if usd_rate is not None:
            try:
                usd_rate = float(usd_rate)
                if usd_rate < 0:
                    return jsonify({
                        "status": "error",
                        "error": {"message": "שער דולר חייב להיות מספר חיובי"},
                        "version": "v1"
                    }), 400
            except (ValueError, TypeError):
                return jsonify({
                    "status": "error",
                    "error": {"message": "שער דולר חייב להיות מספר תקין"},
                    "version": "v1"
                }), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if currency exists
        cursor.execute("SELECT id FROM currencies WHERE id = ?", (currency_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({
                "status": "error",
                "error": {"message": "המטבע לא נמצא במערכת"},
                "version": "v1"
            }), 404
        
        # בדיקה אם סמל המטבע כבר קיים (למעט המטבע הנוכחי)
        cursor.execute("SELECT id FROM currencies WHERE symbol = ? AND id != ?", (symbol, currency_id))
        if cursor.fetchone():
            conn.close()
            return jsonify({
                "status": "error",
                "error": {"message": "סמל מטבע זה כבר קיים במערכת"},
                "version": "v1"
            }), 400
        
        # Update currency
        if usd_rate is not None:
            cursor.execute(
                "UPDATE currencies SET symbol = ?, name = ?, usd_rate = ? WHERE id = ?",
                (symbol, name, usd_rate, currency_id)
            )
        else:
            cursor.execute(
                "UPDATE currencies SET symbol = ?, name = ? WHERE id = ?",
                (symbol, name, currency_id)
            )
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "status": "success",
            "data": {
                'id': currency_id,
                'symbol': symbol,
                'name': name,
                'usd_rate': usd_rate
            },
            "message": "מטבע עודכן בהצלחה",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error updating currency {currency_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה פנימית בשרת"},
            "version": "v1"
        }), 500

@currencies_bp.route('/dropdown', methods=['GET'])
def get_currencies_dropdown():
    """Get currencies for dropdown display"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, symbol, name FROM currencies ORDER BY symbol")
        currencies = cursor.fetchall()
        
        conn.close()
        
        result = []
        for currency in currencies:
            result.append({
                'id': currency[0],
                'symbol': currency[1],
                'name': currency[2]
            })
        
        return jsonify({
            "status": "success",
            "data": result,
            "message": "Currencies for dropdown retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error getting currencies for dropdown: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve currencies for dropdown"},
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
