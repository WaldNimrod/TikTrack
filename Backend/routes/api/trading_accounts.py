from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from config.database import get_db
from services.trading_account_service import TradingAccountService
from services.advanced_cache_service import cache_for, invalidate_cache
import logging

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

trading_accounts_bp = Blueprint('trading_accounts', __name__, url_prefix='/api/trading-accounts')

# Initialize base API
base_api = BaseEntityAPI('trading_accounts', TradingAccountService, 'trading_accounts')

@trading_accounts_bp.route('/', methods=['GET'])
@handle_database_session()
def get_trading_accounts():
    """Get all trading accounts using base API"""
    db: Session = g.db
    response, status_code = base_api.get_all(db)
    return jsonify(response), status_code

@trading_accounts_bp.route('/open', methods=['GET'])
@api_endpoint(cache_ttl=60, rate_limit=60)
@handle_database_session()
def get_open_trading_accounts():
    """Get all open trading accounts - custom implementation"""
    try:
        db: Session = g.db
        trading_accounts = TradingAccountService.get_open_trading_accounts(db)
        return jsonify({
            "status": "success",
            "data": [trading_account.to_dict() for trading_account in trading_accounts],
            "message": "Open trading accounts retrieved successfully",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting open trading accounts: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve open trading accounts"},
            "version": "1.0"
        }), 500

@trading_accounts_bp.route('/<int:trading_account_id>', methods=['GET'])
@api_endpoint(cache_ttl=120, rate_limit=60)
@handle_database_session()
def get_trading_account(trading_account_id: int):
    """Get trading account by ID using base API"""
    db: Session = g.db
    response, status_code = base_api.get_by_id(db, trading_account_id)
    return jsonify(response), status_code

@trading_accounts_bp.route('/by-name/<account_name>', methods=['GET'])
@api_endpoint(cache_ttl=120, rate_limit=60)
@handle_database_session()
def get_trading_account_by_name(account_name: str):
    """Get trading account by name"""
    try:
        db: Session = g.db
        trading_account = TradingAccountService.get_by_name(db, account_name)
        
        if not trading_account:
            return jsonify({
                "status": "error",
                "error": {"message": f"Trading account with name '{account_name}' not found"},
                "version": "1.0"
            }), 404
        
        return jsonify({
            "status": "success",
            "data": trading_account.to_dict(),
            "message": "Trading account retrieved successfully",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting trading account by name {account_name}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve trading account"},
            "version": "1.0"
        }), 500

@trading_accounts_bp.route('/', methods=['POST'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['trading_accounts'])
def create_trading_account():
    """Create new trading account"""
    try:
        data = request.get_json()
        db: Session = g.db
        trading_account = TradingAccountService.create(db, data)
        
        return jsonify({
            "status": "success",
            "data": trading_account.to_dict(),
            "message": "Trading account created successfully",
            "version": "1.0"
        }), 201
    except ValueError as e:
        # Validation errors - return 400 Bad Request
        logger.warning(f"Validation error creating trading account: {str(e)}")
        return jsonify({
            "status": "error",
            "error_code": "VALIDATION_ERROR",
            "message": str(e),
            "details": "The provided data is invalid",
            "version": "1.0"
        }), 400
    except Exception as e:
        # Server errors - return 500 Internal Server Error
        logger.error(f"Server error creating trading account: {str(e)}")
        return jsonify({
            "status": "error",
            "error_code": "INTERNAL_ERROR",
            "message": "An internal error occurred",
            "details": "The server encountered an unexpected error",
            "version": "1.0"
        }), 500

@trading_accounts_bp.route('/<int:trading_account_id>', methods=['PUT'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['trading_accounts'])
def update_trading_account(trading_account_id: int):
    """Update trading account"""
    try:
        data = request.get_json()
        db: Session = g.db
        trading_account = TradingAccountService.update(db, trading_account_id, data)
        if trading_account:
            return jsonify({
                "status": "success",
                "data": trading_account.to_dict(),
                "message": "Trading account updated successfully",
                "version": "1.0"
            })
        else:
            return jsonify({
                "status": "error",
                "error": {"message": "Trading account not found"},
                "version": "1.0"
            }), 404
    except ValueError as e:
        # Validation errors - return 400 Bad Request
        logger.warning(f"Validation error updating trading account {trading_account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error_code": "VALIDATION_ERROR",
            "message": str(e),
            "details": "The provided data is invalid",
            "version": "1.0"
        }), 400
    except Exception as e:
        # Server errors - return 500 Internal Server Error
        logger.error(f"Server error updating trading account {trading_account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error_code": "INTERNAL_ERROR",
            "message": "An internal error occurred",
            "details": "The server encountered an unexpected error",
            "version": "1.0"
        }), 500

@trading_accounts_bp.route('/<int:trading_account_id>/open-trades', methods=['GET'])
@cache_for(ttl=30)  # Cache for 30 seconds - open trades change frequently
def get_trading_account_open_trades(trading_account_id: int):
    """Get trading account's open trades"""
    try:
        db: Session = next(get_db())
        open_trades = TradingAccountService.get_open_trades(db, trading_account_id)
        return jsonify({
            "status": "success",
            "data": open_trades,
            "message": "Open trades retrieved successfully",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting open trades for trading account {trading_account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve open trades"},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@trading_accounts_bp.route('/<int:trading_account_id>', methods=['DELETE'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['trading_accounts'])
def delete_trading_account(trading_account_id: int):
    """Delete trading account"""
    try:
        db: Session = g.db
        
        # הגנה על חשבון המסחר האחרון
        all_trading_accounts = TradingAccountService.get_all(db)
        if len(all_trading_accounts) == 1:
            return jsonify({
                "status": "error",
                "error": {
                    "message": "Cannot delete the last trading account in the system"
                },
                "version": "1.0"
            }), 400
        
        # Check if there are open trades
        open_trades = TradingAccountService.get_open_trades(db, trading_account_id)
        if open_trades:
            return jsonify({
                "status": "error",
                "error": {
                    "message": "Cannot delete trading account with open trades",
                    "open_trades": open_trades
                },
                "version": "1.0"
            }), 400
        
        # Try to delete (this will check for all linked items)
        success = TradingAccountService.delete(db, trading_account_id)
        if success:
            return jsonify({
                "status": "success",
                "message": "Trading account deleted successfully",
                "version": "1.0"
            })
        else:
            return jsonify({
                "status": "error",
                "error": {
                    "message": "Cannot delete trading account - it has linked trades, executions, or other items"
                },
                "version": "1.0"
            }), 400
    except Exception as e:
        logger.error(f"Error deleting trading account {trading_account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to delete trading account"},
            "version": "1.0"
        }), 500

@trading_accounts_bp.route('/<int:trading_account_id>/stats', methods=['GET'])
@cache_for(ttl=60)  # Cache for 1 minute - stats don't change frequently
def get_trading_account_stats(trading_account_id: int):
    """Get trading account statistics"""
    try:
        db: Session = next(get_db())
        stats = TradingAccountService.get_stats(db, trading_account_id)
        if stats:
            return jsonify({
                "status": "success",
                "data": stats,
                "message": "Trading account stats retrieved successfully",
                "version": "1.0"
            })
        else:
            return jsonify({
                "status": "error",
                "error": {"message": "Trading account not found"},
                "version": "1.0"
            }), 404
    except Exception as e:
        logger.error(f"Error getting trading account stats {trading_account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve trading account stats"},
            "version": "1.0"
        }), 500
    finally:
        db.close()