from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from services.trade_service import TradeService
import logging

logger = logging.getLogger(__name__)

trades_bp = Blueprint('trades', __name__, url_prefix='/api/v1/trades')

@trades_bp.route('/', methods=['GET'])
def get_trades():
    """קבלת כל הטריידים"""
    try:
        db: Session = next(get_db())
        trades = TradeService.get_all(db)
        return jsonify({
            "status": "success",
            "data": [trade.to_dict() for trade in trades],
            "message": "Trades retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error getting trades: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve trades"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@trades_bp.route('/<int:trade_id>', methods=['GET'])
def get_trade(trade_id: int):
    """קבלת טרייד לפי מזהה"""
    try:
        db: Session = next(get_db())
        trade = TradeService.get_by_id(db, trade_id)
        if trade:
            return jsonify({
                "status": "success",
                "data": trade.to_dict(),
                "message": "Trade retrieved successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Trade not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error getting trade {trade_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve trade"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@trades_bp.route('/account/<int:account_id>', methods=['GET'])
def get_trades_by_account(account_id: int):
    """קבלת טריידים לפי חשבון"""
    try:
        db: Session = next(get_db())
        trades = TradeService.get_by_account(db, account_id)
        return jsonify({
            "status": "success",
            "data": [trade.to_dict() for trade in trades],
            "message": "Account trades retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error getting trades for account {account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve account trades"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@trades_bp.route('/', methods=['POST'])
def create_trade():
    """יצירת טרייד חדש"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        trade = TradeService.create(db, data)
        return jsonify({
            "status": "success",
            "data": trade.to_dict(),
            "message": "Trade created successfully",
            "version": "v1"
        }), 201
    except Exception as e:
        logger.error(f"Error creating trade: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@trades_bp.route('/<int:trade_id>', methods=['PUT'])
def update_trade(trade_id: int):
    """עדכון טרייד"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        trade = TradeService.update(db, trade_id, data)
        if trade:
            return jsonify({
                "status": "success",
                "data": trade.to_dict(),
                "message": "Trade updated successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Trade not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error updating trade {trade_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@trades_bp.route('/<int:trade_id>/close', methods=['POST'])
def close_trade(trade_id: int):
    """סגירת טרייד"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        trade = TradeService.close_trade(db, trade_id, data)
        if trade:
            return jsonify({
                "status": "success",
                "data": trade.to_dict(),
                "message": "Trade closed successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Trade not found or already closed"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error closing trade {trade_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@trades_bp.route('/<int:trade_id>/cancel', methods=['POST'])
def cancel_trade(trade_id: int):
    """ביטול טרייד"""
    try:
        data = request.get_json()
        cancel_reason = data.get('cancel_reason', 'Cancelled by user')
        db: Session = next(get_db())
        trade = TradeService.cancel_trade(db, trade_id, cancel_reason)
        if trade:
            return jsonify({
                "status": "success",
                "data": trade.to_dict(),
                "message": "Trade cancelled successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Trade not found or already cancelled"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error cancelling trade {trade_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@trades_bp.route('/summary', methods=['GET'])
def get_trade_summary():
    """קבלת סיכום טריידים"""
    try:
        account_id = request.args.get('account_id', type=int)
        db: Session = next(get_db())
        summary = TradeService.get_trade_summary(db, account_id)
        return jsonify({
            "status": "success",
            "data": summary,
            "message": "Trade summary retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error getting trade summary: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve trade summary"},
            "version": "v1"
        }), 500
    finally:
        db.close()
