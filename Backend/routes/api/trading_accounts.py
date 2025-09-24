from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from config.database import get_db
from services.trading_trading_account_service import TradingTradingAccountService
from services.advanced_cache_service import cache_for, invalidate_cache
import logging

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

trading_trading_trading_accounts_bp = Blueprint('trading_trading_trading_accounts', __name__, url_prefix='/api/trading-trading_trading_accounts')

# Initialize base API
base_api = BaseEntityAPI('trading_trading_trading_accounts', TradingTradingAccountService, 'trading_trading_trading_accounts')

@trading_trading_trading_accounts_bp.route('/', methods=['GET'])
@api_endpoint(cache_ttl=60, rate_limit=60)
@handle_database_session()
def get_trading_trading_trading_accounts():
    """Get all trading trading_trading_accounts using base API"""
    db: Session = g.db
    response, status_code = base_api.get_all(db)
    return jsonify(response), status_code

@trading_trading_trading_accounts_bp.route('/open', methods=['GET'])
@api_endpoint(cache_ttl=60, rate_limit=60)
@handle_database_session()
def get_open_trading_trading_trading_accounts():
    """Get all open trading trading_trading_accounts - custom implementation"""
    try:
        db: Session = g.db
        trading_trading_trading_accounts = TradingTradingAccountService.get_open_trading_trading_accounts(db)
        return jsonify({
            "status": "success",
            "data": [trading_trading_account.to_dict() for trading_trading_account in trading_trading_trading_accounts],
            "message": "Open trading trading_trading_accounts retrieved successfully",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting open trading trading_trading_accounts: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve open trading trading_trading_accounts"},
            "version": "1.0"
        }), 500

@trading_trading_trading_accounts_bp.route('/<int:trading_trading_trading_account_id>', methods=['GET'])
@api_endpoint(cache_ttl=120, rate_limit=60)
@handle_database_session()
def get_trading_trading_account(trading_trading_trading_account_id: int):
    """Get trading trading_account by ID using base API"""
    db: Session = g.db
    response, status_code = base_api.get_by_id(db, trading_trading_trading_account_id)
    return jsonify(response), status_code

@trading_trading_trading_accounts_bp.route('/', methods=['POST'])
def create_trading_trading_account():
    """Create new trading trading_account"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        trading_trading_account = TradingTradingAccountService.create(db, data)
        
        # Invalidate cache when creating new trading trading_account
        invalidate_cache('trading_trading_trading_accounts')
        
        return jsonify({
            "status": "success",
            "data": trading_trading_account.to_dict(),
            "message": "Trading trading_account created successfully",
            "version": "1.0"
        }), 201
    except ValueError as e:
        # Validation errors - return 400 Bad Request
        logger.warning(f"Validation error creating trading trading_account: {str(e)}")
        return jsonify({
            "status": "error",
            "error_code": "VALIDATION_ERROR",
            "message": str(e),
            "details": "The provided data is invalid",
            "version": "1.0"
        }), 400
    except Exception as e:
        # Server errors - return 500 Internal Server Error
        logger.error(f"Server error creating trading trading_account: {str(e)}")
        return jsonify({
            "status": "error",
            "error_code": "INTERNAL_ERROR",
            "message": "An internal error occurred",
            "details": "The server encountered an unexpected error",
            "version": "1.0"
        }), 500
    finally:
        db.close()

@trading_trading_trading_accounts_bp.route('/<int:trading_trading_account_id>', methods=['PUT'])
def update_trading_account(trading_trading_account_id: int):
    """Update trading_account"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        trading_account = TradingAccountService.update(db, trading_trading_account_id, data)
        if trading_account:
            # Invalidate cache when updating trading_account
            invalidate_cache('trading_trading_accounts')
            invalidate_cache(f'trading_account_{trading_trading_account_id}')
            return jsonify({
                "status": "success",
                "data": trading_account.to_dict(),
                "message": "Account updated successfully",
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Account not found"},
            "version": "1.0"
        }), 404
    except ValueError as e:
        # Validation errors - return 400 Bad Request
        logger.warning(f"Validation error updating trading_account {trading_trading_account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error_code": "VALIDATION_ERROR",
            "message": str(e),
            "details": "The provided data is invalid",
            "version": "1.0"
        }), 400
    except Exception as e:
        # Server errors - return 500 Internal Server Error
        logger.error(f"Server error updating trading_account {trading_trading_account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error_code": "INTERNAL_ERROR",
            "message": "An internal error occurred",
            "details": "The server encountered an unexpected error",
            "version": "1.0"
        }), 500
    finally:
        db.close()

@trading_trading_trading_accounts_bp.route('/<int:trading_trading_account_id>/open-trades', methods=['GET'])
@cache_for(ttl=30)  # Cache for 30 seconds - open trades change frequently
def get_trading_account_open_trades(trading_trading_account_id: int):
    """Get trading_account's open trades"""
    try:
        db: Session = next(get_db())
        open_trades = TradingAccountService.get_open_trades(db, trading_trading_account_id)
        return jsonify({
            "status": "success",
            "data": open_trades,
            "message": "Open trades retrieved successfully",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting open trades for trading_account {trading_trading_account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve open trades"},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@trading_trading_trading_accounts_bp.route('/<int:trading_trading_account_id>', methods=['DELETE'])
def delete_trading_account(trading_trading_account_id: int):
    """Delete trading_account"""
    try:
        db: Session = next(get_db())
        
        # הגנה על החשבון האחרון
        all_trading_trading_accounts = TradingAccountService.get_all(db)
        if len(all_trading_trading_accounts) == 1:
            return jsonify({
                "status": "error",
                "error": {
                    "message": "לא ניתן למחוק את החשבון האחרון במערכת. חייב להיות לפחות חשבון אחד."
                },
                "version": "1.0"
            }), 403
        
        # Check if there are open trades
        open_trades = TradingAccountService.get_open_trades(db, trading_trading_account_id)
        if open_trades:
            return jsonify({
                "status": "error",
                "error": {
                    "message": "Cannot delete trading_account with open trades",
                    "open_trades": open_trades
                },
                "version": "1.0"
            }), 400
        
        # Try to delete (this will check for all linked items)
        success = TradingAccountService.delete(db, trading_trading_account_id)
        if success:
            # Invalidate cache when deleting trading_account
            invalidate_cache('trading_trading_accounts')
            invalidate_cache(f'trading_account_{trading_trading_account_id}')
            return jsonify({
                "status": "success",
                "message": "Account deleted successfully",
                "version": "1.0"
            })
        
        # If deletion failed, it means there are linked items
        return jsonify({
            "status": "error",
            "error": {
                "message": "Cannot delete trading_account - it has linked trades, executions, or other items"
            },
            "version": "1.0"
        }), 400
    except Exception as e:
        logger.error(f"Error deleting trading_account {trading_trading_account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@trading_trading_trading_accounts_bp.route('/<int:trading_trading_account_id>/stats', methods=['GET'])
@cache_for(ttl=60)  # Cache for 1 minute - stats don't change frequently
def get_trading_account_stats(trading_trading_account_id: int):
    """Get trading_account statistics"""
    try:
        db: Session = next(get_db())
        stats = TradingAccountService.get_stats(db, trading_trading_account_id)
        if stats:
            return jsonify({
                "status": "success",
                "data": stats,
                "message": "Account stats retrieved successfully",
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Account not found"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error getting trading_account stats {trading_trading_account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve trading_account stats"},
            "version": "1.0"
        }), 500
    finally:
        db.close()
