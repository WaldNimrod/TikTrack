from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from config.database import get_db
from services.currency_service import CurrencyService
from services.advanced_cache_service import cache_for, cache_with_deps, invalidate_cache
from decimal import Decimal
import logging
import re

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

currencies_bp = Blueprint('currencies', __name__, url_prefix='/api/currencies')

@currencies_bp.route('/', methods=['GET'])
@api_endpoint(cache_ttl=3600, rate_limit=60)
@handle_database_session()
@cache_with_deps(ttl=3600, dependencies=['currencies'])  # Cache for 1 hour - static data
def get_currencies():
    """Get all currencies using CurrencyService"""
    db: Session = next(get_db())
    try:
        currencies = CurrencyService.get_all(db)
        
        result = []
        for currency in currencies:
            result.append({
                'symbol': currency.symbol,
                'name': currency.name,
                'usd_rate': float(currency.usd_rate) if currency.usd_rate else None,
                'id': currency.id,
                'created_at': currency.created_at.isoformat() if currency.created_at else None
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
    finally:
        db.close()

@currencies_bp.route('/<int:currency_id>', methods=['GET'])
@cache_for(ttl=3600)
def get_currency(currency_id: int):
    """Get currency by ID using CurrencyService"""
    db: Session = next(get_db())
    try:
        currency = CurrencyService.get_by_id(db, currency_id)
        
        if not currency:
            return jsonify({
                "status": "error",
                "error": {"message": "Currency not found"},
                "version": "1.0"
            }), 404
        
        currency_dict = {
            'symbol': currency.symbol,
            'name': currency.name,
            'usd_rate': float(currency.usd_rate) if currency.usd_rate else None,
            'id': currency.id,
            'created_at': currency.created_at.isoformat() if currency.created_at else None
        }
        
        return jsonify({
            "status": "success",
            "data": currency_dict,
            "message": "פרטי המטבע נטענו בהצלחה",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting currency {currency_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה בטעינת פרטי המטבע"},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@currencies_bp.route('/', methods=['POST'])
@invalidate_cache(['currencies'])  # Invalidate cache after creating currency
def create_currency():
    """Create new currency using CurrencyService"""
    db: Session = next(get_db())
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
            usd_rate = Decimal(str(usd_rate))
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
        
        # Create currency using CurrencyService
        currency_data = {
            'symbol': symbol,
            'name': name,
            'usd_rate': usd_rate
        }
        
        currency = CurrencyService.create(db, currency_data)
        
        return jsonify({
            "status": "success",
            "data": {
                'id': currency.id,
                'symbol': currency.symbol,
                'name': currency.name,
                'usd_rate': float(currency.usd_rate) if currency.usd_rate else None,
                'created_at': currency.created_at.isoformat() if currency.created_at else None
            },
            "message": "מטבע נוסף בהצלחה",
            "version": "1.0"
        }), 201
    except ValueError as e:
        logger.error(f"Validation error creating currency: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error creating currency: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "סמל מטבע זה כבר קיים במערכת"},
            "version": "1.0"
        }), 400
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating currency: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה פנימית בשרת"},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@currencies_bp.route('/<int:currency_id>', methods=['PUT'])
@invalidate_cache(['currencies'])  # Invalidate cache after updating currency
def update_currency(currency_id: int):
    """Update currency using CurrencyService"""
    db: Session = next(get_db())
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
        update_data = {'symbol': symbol, 'name': name}
        if usd_rate is not None:
            try:
                usd_rate_decimal = Decimal(str(usd_rate))
                if usd_rate_decimal <= 0:
                    return jsonify({
                        "status": "error",
                        "error": {"message": "שער דולר חייב להיות מספר חיובי גדול מ-0. נסה מספר עם נקודה עשרונית (למשל: 1.5)."},
                        "version": "1.0"
                    }), 400
                update_data['usd_rate'] = usd_rate_decimal
            except (ValueError, TypeError):
                return jsonify({
                    "status": "error",
                    "error": {"message": "שער דולר חייב להיות מספר תקין. נסה מספר עם נקודה עשרונית (למשל: 1.5)."},
                    "version": "1.0"
                }), 400
        
        # Update currency using CurrencyService
        currency = CurrencyService.update(db, currency_id, update_data)
        
        return jsonify({
            "status": "success",
            "data": {
                'id': currency.id,
                'symbol': currency.symbol,
                'name': currency.name,
                'usd_rate': float(currency.usd_rate) if currency.usd_rate else None
            },
            "message": "מטבע עודכן בהצלחה",
            "version": "1.0"
        })
    except ValueError as e:
        logger.error(f"Validation error updating currency {currency_id}: {str(e)}")
        error_message = str(e)
        if "not found" in error_message.lower():
            return jsonify({
                "status": "error",
                "error": {"message": "המטבע לא נמצא במערכת"},
                "version": "1.0"
            }), 404
        return jsonify({
            "status": "error",
            "error": {"message": error_message},
            "version": "1.0"
        }), 400
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error updating currency {currency_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "סמל מטבע זה כבר קיים במערכת"},
            "version": "1.0"
        }), 400
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating currency {currency_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה פנימית בשרת"},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@currencies_bp.route('/dropdown', methods=['GET'])
@cache_for(ttl=3600)
def get_currencies_dropdown():
    """Get currencies for dropdown display using CurrencyService"""
    db: Session = next(get_db())
    try:
        result = CurrencyService.get_currencies_for_dropdown(db)
        
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
    finally:
        db.close()

@currencies_bp.route('/<int:currency_id>', methods=['DELETE'])
@invalidate_cache(['currencies'])  # Invalidate cache after deleting currency
def delete_currency(currency_id: int):
    """Delete currency using CurrencyService"""
    db: Session = next(get_db())
    try:
        # הגנה על רשומת הבסיס (מזהה 1)
        if currency_id == 1:
            return jsonify({
                "status": "error",
                "error": {"message": "לא ניתן למחוק רשומת בסיס מוגנת"},
                "version": "1.0"
            }), 403
        
        # Delete currency using CurrencyService
        CurrencyService.delete(db, currency_id)
        
        return jsonify({
            "status": "success",
            "message": "Currency deleted successfully",
            "version": "1.0"
        })
    except ValueError as e:
        logger.error(f"Validation error deleting currency {currency_id}: {str(e)}")
        error_message = str(e)
        if "not found" in error_message.lower():
            return jsonify({
                "status": "error",
                "error": {"message": "Currency not found"},
                "version": "1.0"
            }), 404
        return jsonify({
            "status": "error",
            "error": {"message": error_message},
            "version": "1.0"
        }), 400
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting currency {currency_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה במחיקת המטבע"},
            "version": "1.0"
        }), 500
    finally:
        db.close()
