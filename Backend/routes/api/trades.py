from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from services.trade_service import TradeService
from services.advanced_cache_service import cache_for, cache_with_deps, invalidate_cache
import logging

logger = logging.getLogger(__name__)

trades_bp = Blueprint('trades', __name__, url_prefix='/api/v1/trades')

@trades_bp.route('/', methods=['GET'])
@cache_with_deps(ttl=30, dependencies=['trades'])  # Cache for 30 seconds - critical data
def get_trades():
    """Get all trades with filtering options"""
    try:
        db: Session = next(get_db())
        
        # Get filtering parameters
        account_id = request.args.get('account_id', type=int)
        status = request.args.get('status')
        
        # If there are filtering parameters, use appropriate function
        if account_id and status:
            logger.info(f"Filtering trades by account_id={account_id} and status={status}")
            trades = TradeService.get_by_account_and_status(db, account_id, status)
            logger.info(f"Found {len(trades)} trades for account {account_id} with status {status}")
        elif account_id:
            trades = TradeService.get_by_account(db, account_id)
        elif status:
            trades = TradeService.get_by_status(db, status)
        else:
            trades = TradeService.get_all(db)
        
        # Convert trades to dict and log the first one
        trade_dicts = [trade.to_dict() for trade in trades]
        if trade_dicts:
            logger.info(f"First trade data: {trade_dicts[0]}")
        
        return jsonify({
            "status": "success",
            "data": trade_dicts,
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
@cache_with_deps(ttl=60, dependencies=['trades'])  # Cache for 1 minute - individual trades
def get_trade(trade_id: int):
    """Get trade by ID"""
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
    """Get trades by account"""
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
@invalidate_cache(['trades', 'tickers', 'dashboard'])  # Invalidate cache after creating trade
def create_trade():
    """Create a new trade"""
    try:
        data = request.get_json()
        
        # Handle backward compatibility for type field
        if 'type' in data:
            data['investment_type'] = data.pop('type')
        
        # Ensure investment_type has a default value
        if 'investment_type' not in data or not data['investment_type']:
            data['investment_type'] = 'swing'
        
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
@invalidate_cache(['trades', 'tickers', 'dashboard'])  # Invalidate cache after updating trade
def update_trade(trade_id: int):
    """Update trade"""
    try:
        data = request.get_json()
        
        # Handle backward compatibility for type field
        if 'type' in data:
            data['investment_type'] = data.pop('type')
        
        # Ensure investment_type has a default value
        if 'investment_type' not in data or not data['investment_type']:
            data['investment_type'] = 'swing'
        
        db: Session = next(get_db())
        trade = TradeService.update(db, trade_id, data)
        if trade:
            # Commit the transaction
            db.commit()
            logger.info(f"Transaction committed for trade {trade_id}")
            try:
                trade_dict = trade.to_dict()
                return jsonify({
                    "status": "success",
                    "data": trade_dict,
                    "message": "Trade updated successfully",
                    "version": "v1"
                })
            except Exception as e:
                logger.error(f"Error converting trade to dict: {str(e)}")
                # Return basic trade data without relationships
                basic_data = {
                    "id": trade.id,
                    "account_id": trade.account_id,
                    "ticker_id": trade.ticker_id,
                    "trade_plan_id": trade.trade_plan_id,
                    "status": trade.status,
                    "investment_type": trade.investment_type,
                    "side": trade.side,
                    "created_at": trade.created_at.strftime('%Y-%m-%d %H:%M:%S') if trade.created_at else None,
                    "closed_at": trade.closed_at.strftime('%Y-%m-%d %H:%M:%S') if trade.closed_at else None,
                    "notes": trade.notes
                }
                return jsonify({
                    "status": "success",
                    "data": basic_data,
                    "message": "Trade updated successfully (basic data only)",
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
@invalidate_cache(['trades', 'tickers', 'dashboard'])  # Invalidate cache after closing trade
def close_trade(trade_id: int):
    """Close trade"""
    db = None
    try:
        data = request.get_json() if request.is_json else {}
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
        if db:
            db.close()

@trades_bp.route('/<int:trade_id>/cancel', methods=['POST'])
@invalidate_cache(['trades', 'tickers', 'dashboard'])  # Invalidate cache after cancelling trade
def cancel_trade(trade_id: int):
    """Cancel trade"""
    db = None
    try:
        data = request.get_json() if request.is_json else {}
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
        if db:
            db.close()

@trades_bp.route('/<int:trade_id>', methods=['DELETE'])
@invalidate_cache(['trades', 'tickers', 'dashboard'])  # Invalidate cache after deleting trade
def delete_trade(trade_id: int):
    """Delete trade"""
    try:
        db: Session = next(get_db())
        success = TradeService.delete(db, trade_id)
        if success:
            return jsonify({
                "status": "success",
                "message": "Trade deleted successfully",
                "version": "v1"
            })
        
        # If deletion failed, it means there are linked items or trade not found
        return jsonify({
            "status": "error",
            "error": {
                "message": "Cannot delete trade - it has linked executions or other items"
            },
            "version": "v1"
        }), 400
    except Exception as e:
        logger.error(f"Error deleting trade {trade_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@trades_bp.route('/summary', methods=['GET'])
def get_trade_summary():
    """Get trade summary"""
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
