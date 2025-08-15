from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from services.ticker_service import TickerService
import logging

logger = logging.getLogger(__name__)

tickers_bp = Blueprint('tickers', __name__, url_prefix='/api/v1/tickers')

@tickers_bp.route('/', methods=['GET'])
def get_tickers():
    """קבלת כל הטיקרים"""
    try:
        db: Session = next(get_db())
        tickers = TickerService.get_all(db)
        return jsonify({
            "status": "success",
            "data": [ticker.to_dict() for ticker in tickers],
            "message": "Tickers retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error getting tickers: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve tickers"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@tickers_bp.route('/<int:ticker_id>', methods=['GET'])
def get_ticker(ticker_id: int):
    """קבלת טיקר לפי מזהה"""
    try:
        db: Session = next(get_db())
        ticker = TickerService.get_by_id(db, ticker_id)
        if ticker:
            return jsonify({
                "status": "success",
                "data": ticker.to_dict(),
                "message": "Ticker retrieved successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Ticker not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error getting ticker {ticker_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve ticker"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@tickers_bp.route('/', methods=['POST'])
def create_ticker():
    """יצירת טיקר חדש"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        ticker = TickerService.create(db, data)
        return jsonify({
            "status": "success",
            "data": ticker.to_dict(),
            "message": "Ticker created successfully",
            "version": "v1"
        }), 201
    except Exception as e:
        logger.error(f"Error creating ticker: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@tickers_bp.route('/<int:ticker_id>', methods=['PUT'])
def update_ticker(ticker_id: int):
    """עדכון טיקר"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        ticker = TickerService.update(db, ticker_id, data)
        if ticker:
            return jsonify({
                "status": "success",
                "data": ticker.to_dict(),
                "message": "Ticker updated successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Ticker not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error updating ticker {ticker_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@tickers_bp.route('/<int:ticker_id>', methods=['DELETE'])
def delete_ticker(ticker_id: int):
    """מחיקת טיקר"""
    try:
        db: Session = next(get_db())
        success = TickerService.delete(db, ticker_id)
        if success:
            return jsonify({
                "status": "success",
                "message": "Ticker deleted successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Ticker not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error deleting ticker {ticker_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 500
    finally:
        db.close()
