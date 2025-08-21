from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from models.currency import Currency
import logging

logger = logging.getLogger(__name__)

currencies_bp = Blueprint('currencies', __name__, url_prefix='/api/v1/currencies')

@currencies_bp.route('/', methods=['GET'])
def get_currencies():
    """Get all currencies"""
    try:
        db: Session = next(get_db())
        currencies = db.query(Currency).order_by(Currency.symbol).all()
        return jsonify({
            "status": "success",
            "data": [currency.to_dict() for currency in currencies],
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
    finally:
        db.close()

@currencies_bp.route('/<int:currency_id>', methods=['GET'])
def get_currency(currency_id: int):
    """Get currency by ID"""
    try:
        db: Session = next(get_db())
        currency = db.query(Currency).filter(Currency.id == currency_id).first()
        if currency:
            return jsonify({
                "status": "success",
                "data": currency.to_dict(),
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
    finally:
        db.close()

@currencies_bp.route('/', methods=['POST'])
def create_currency():
    """Create new currency"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        currency = Currency(**data)
        db.add(currency)
        db.commit()
        db.refresh(currency)
        return jsonify({
            "status": "success",
            "data": currency.to_dict(),
            "message": "Currency created successfully",
            "version": "v1"
        }), 201
    except Exception as e:
        logger.error(f"Error creating currency: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@currencies_bp.route('/<int:currency_id>', methods=['PUT'])
def update_currency(currency_id: int):
    """Update currency"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        currency = db.query(Currency).filter(Currency.id == currency_id).first()
        if currency:
            for key, value in data.items():
                if hasattr(currency, key):
                    setattr(currency, key, value)
            db.commit()
            db.refresh(currency)
            return jsonify({
                "status": "success",
                "data": currency.to_dict(),
                "message": "Currency updated successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Currency not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error updating currency {currency_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to update currency"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@currencies_bp.route('/<int:currency_id>', methods=['DELETE'])
def delete_currency(currency_id: int):
    """Delete currency"""
    try:
        db: Session = next(get_db())
        currency = db.query(Currency).filter(Currency.id == currency_id).first()
        if currency:
            db.delete(currency)
            db.commit()
            return jsonify({
                "status": "success",
                "message": "Currency deleted successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Currency not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error deleting currency {currency_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to delete currency"},
            "version": "v1"
        }), 500
    finally:
        db.close()
