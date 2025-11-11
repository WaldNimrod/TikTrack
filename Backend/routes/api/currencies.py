from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from config.database import get_db
from services.currency_service import CurrencyService
from services.advanced_cache_service import cache_for, cache_with_deps, invalidate_cache
import logging
import os
import sqlite3
import re

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

currencies_bp = Blueprint('currencies', __name__, url_prefix='/api/currencies')

# Initialize base API (currencies uses direct SQLite, so we'll use it selectively)

def get_db_connection():
    """Get database connection"""
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DB_PATH = os.path.join(BASE_DIR, "db", "tiktrack.db")
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@currencies_bp.route('/', methods=['GET'])
@api_endpoint(cache_ttl=3600, rate_limit=60)
@handle_database_session()
@cache_with_deps(ttl=3600, dependencies=['currencies'])  # Cache for 1 hour - static data
def get_currencies():
    """Get all currencies using base API patterns"""
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
            "message": "רשימת המטבעות נטענה בהצלחה",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting currencies: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה בטעינת רשימת המטבעות"},
            "version": "1.0"
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
                "message": "פרטי המטבע נטענו בהצלחה",
                "version": "1.0"
            })
        
        return jsonify({
            "status": "error",
            "error": {"message": "Currency not found"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error getting currency {currency_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה בטעינת פרטי המטבע"},
            "version": "1.0"
        }), 500

@currencies_bp.route('/', methods=['POST'])
@invalidate_cache(['currencies'])  # Invalidate cache after creating currency
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
                "version": "1.0"
            }), 400
        
        if not name:
            return jsonify({
                "status": "error",
                "error": {"message": "שם מטבע הוא שדה חובה"},
                "version": "1.0"
            }), 400
        
        # וולידציה של תבנית סמל מטבע - בדיוק 3 אותיות גדולות
        if not re.match(r'^[A-Z]{3}$', symbol):
            return jsonify({
                "status": "error",
                "error": {"message": "סמל מטבע חייב להיות בדיוק 3 אותיות אנגליות גדולות (למשל: USD, EUR, ILS). אסור להשתמש במספרים או אותיות קטנות."},
                "version": "1.0"
            }), 400
        
        # וולידציה של אורך שם מטבע
        if len(name) > 25:
            return jsonify({
                "status": "error",
                "error": {"message": "שם מטבע לא יכול להיות יותר מ-25 תווים. נסה שם קצר יותר."},
                "version": "1.0"
            }), 400
        
        # וולידציה של שער דולר
        try:
            usd_rate = float(usd_rate)
            if usd_rate <= 0:
                return jsonify({
                    "status": "error",
                    "error": {"message": "שער דולר חייב להיות מספר חיובי גדול מ-0. נסה מספר עם נקודה עשרונית (למשל: 1.5)."},
                    "version": "1.0"
                }), 400
        except (ValueError, TypeError):
            return jsonify({
                "status": "error",
                "error": {"message": "שער דולר חייב להיות מספר תקין. נסה מספר עם נקודה עשרונית (למשל: 1.5)."},
                "version": "1.0"
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
                "version": "1.0"
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
            "version": "1.0"
        }), 201
    except Exception as e:
        logger.error(f"Error creating currency: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה פנימית בשרת"},
            "version": "1.0"
        }), 500

@currencies_bp.route('/<int:currency_id>', methods=['PUT'])
@invalidate_cache(['currencies'])  # Invalidate cache after updating currency
def update_currency(currency_id: int):
    """Update currency"""
    try:
        # הגנה על רשומת הבסיס (מזהה 1)
        if currency_id == 1:
            return jsonify({
                "status": "error",
                "error": {"message": "לא ניתן לערוך רשומת בסיס מוגנת"},
                "version": "1.0"
            }), 403
        
        data = request.get_json()
        symbol = data.get('symbol', '').strip().upper()
        name = data.get('name', '').strip()
        usd_rate = data.get('usd_rate')
        
        # וולידציה של שדות חובה
        if not symbol:
            return jsonify({
                "status": "error",
                "error": {"message": "סמל מטבע הוא שדה חובה"},
                "version": "1.0"
            }), 400
        
        if not name:
            return jsonify({
                "status": "error",
                "error": {"message": "שם מטבע הוא שדה חובה"},
                "version": "1.0"
            }), 400
        
        # וולידציה של תבנית סמל מטבע - בדיוק 3 אותיות גדולות
        if not re.match(r'^[A-Z]{3}$', symbol):
            return jsonify({
                "status": "error",
                "error": {"message": "סמל מטבע חייב להיות בדיוק 3 אותיות אנגליות גדולות (למשל: USD, EUR, ILS). אסור להשתמש במספרים או אותיות קטנות."},
                "version": "1.0"
            }), 400
        
        # וולידציה של אורך שם מטבע
        if len(name) > 25:
            return jsonify({
                "status": "error",
                "error": {"message": "שם מטבע לא יכול להיות יותר מ-25 תווים. נסה שם קצר יותר."},
                "version": "1.0"
            }), 400
        
        # וולידציה של שער דולר
        if usd_rate is not None:
            try:
                usd_rate = float(usd_rate)
                if usd_rate <= 0:
                    return jsonify({
                        "status": "error",
                        "error": {"message": "שער דולר חייב להיות מספר חיובי גדול מ-0. נסה מספר עם נקודה עשרונית (למשל: 1.5)."},
                        "version": "1.0"
                    }), 400
            except (ValueError, TypeError):
                return jsonify({
                    "status": "error",
                    "error": {"message": "שער דולר חייב להיות מספר תקין. נסה מספר עם נקודה עשרונית (למשל: 1.5)."},
                    "version": "1.0"
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
                "version": "1.0"
            }), 404
        
        # בדיקה אם סמל המטבע כבר קיים (למעט המטבע הנוכחי)
        cursor.execute("SELECT id FROM currencies WHERE symbol = ? AND id != ?", (symbol, currency_id))
        if cursor.fetchone():
            conn.close()
            return jsonify({
                "status": "error",
                "error": {"message": "סמל מטבע זה כבר קיים במערכת"},
                "version": "1.0"
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
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error updating currency {currency_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה פנימית בשרת"},
            "version": "1.0"
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
            "message": "רשימת המטבעות לתפריט נפתח נטענה בהצלחה",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting currencies for dropdown: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה בטעינת רשימת המטבעות לתפריט נפתח"},
            "version": "1.0"
        }), 500

@currencies_bp.route('/<int:currency_id>', methods=['DELETE'])
@invalidate_cache(['currencies'])  # Invalidate cache after deleting currency
def delete_currency(currency_id: int):
    """Delete currency"""
    try:
        # הגנה על רשומת הבסיס (מזהה 1)
        if currency_id == 1:
            return jsonify({
                "status": "error",
                "error": {"message": "לא ניתן למחוק רשומת בסיס מוגנת"},
                "version": "1.0"
            }), 403
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if currency exists
        cursor.execute("SELECT id FROM currencies WHERE id = ?", (currency_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({
                "status": "error",
                "error": {"message": "Currency not found"},
                "version": "1.0"
            }), 404
        
        # Delete currency
        cursor.execute("DELETE FROM currencies WHERE id = ?", (currency_id,))
        conn.commit()
        conn.close()
        
        return jsonify({
            "status": "success",
            "message": "Currency deleted successfully",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error deleting currency {currency_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה במחיקת המטבע"},
            "version": "1.0"
        }), 500
