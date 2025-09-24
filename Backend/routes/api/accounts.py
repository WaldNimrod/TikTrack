from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from config.database import get_db
from services.account_service import AccountService
from services.advanced_cache_service import cache_for, invalidate_cache
import logging

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

accounts_bp = Blueprint('accounts', __name__, url_prefix='/api/accounts')

# Initialize base API
base_api = BaseEntityAPI('accounts', AccountService, 'accounts')

@accounts_bp.route('/', methods=['GET'])
@api_endpoint(cache_ttl=60, rate_limit=60)
@handle_database_session()
def get_accounts():
    """Get all accounts using base API"""
    db: Session = g.db
    response, status_code = base_api.get_all(db)
    return jsonify(response), status_code

@accounts_bp.route('/open', methods=['GET'])
@api_endpoint(cache_ttl=60, rate_limit=60)
@handle_database_session()
def get_open_accounts():
    """Get all open accounts - custom implementation"""
    try:
        db: Session = g.db
        accounts = AccountService.get_open_accounts(db)
        return jsonify({
            "status": "success",
            "data": [account.to_dict() for account in accounts],
            "message": "Open accounts retrieved successfully",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting open accounts: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve open accounts"},
            "version": "1.0"
        }), 500

@accounts_bp.route('/<int:account_id>', methods=['GET'])
@api_endpoint(cache_ttl=120, rate_limit=60)
@handle_database_session()
def get_account(account_id: int):
    """Get account by ID using base API"""
    db: Session = g.db
    response, status_code = base_api.get_by_id(db, account_id)
    return jsonify(response), status_code

@accounts_bp.route('/', methods=['POST'])
def create_account():
    """Create new account"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        account = AccountService.create(db, data)
        
        # Invalidate cache when creating new account
        invalidate_cache('accounts')
        
        return jsonify({
            "status": "success",
            "data": account.to_dict(),
            "message": "Account created successfully",
            "version": "1.0"
        }), 201
    except ValueError as e:
        # Validation errors - return 400 Bad Request
        logger.warning(f"Validation error creating account: {str(e)}")
        return jsonify({
            "status": "error",
            "error_code": "VALIDATION_ERROR",
            "message": str(e),
            "details": "The provided data is invalid",
            "version": "1.0"
        }), 400
    except Exception as e:
        # Server errors - return 500 Internal Server Error
        logger.error(f"Server error creating account: {str(e)}")
        return jsonify({
            "status": "error",
            "error_code": "INTERNAL_ERROR",
            "message": "An internal error occurred",
            "details": "The server encountered an unexpected error",
            "version": "1.0"
        }), 500
    finally:
        db.close()

@accounts_bp.route('/<int:account_id>', methods=['PUT'])
def update_account(account_id: int):
    """Update account"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        account = AccountService.update(db, account_id, data)
        if account:
            # Invalidate cache when updating account
            invalidate_cache('accounts')
            invalidate_cache(f'account_{account_id}')
            return jsonify({
                "status": "success",
                "data": account.to_dict(),
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
        logger.warning(f"Validation error updating account {account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error_code": "VALIDATION_ERROR",
            "message": str(e),
            "details": "The provided data is invalid",
            "version": "1.0"
        }), 400
    except Exception as e:
        # Server errors - return 500 Internal Server Error
        logger.error(f"Server error updating account {account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error_code": "INTERNAL_ERROR",
            "message": "An internal error occurred",
            "details": "The server encountered an unexpected error",
            "version": "1.0"
        }), 500
    finally:
        db.close()

@accounts_bp.route('/<int:account_id>/open-trades', methods=['GET'])
@cache_for(ttl=30)  # Cache for 30 seconds - open trades change frequently
def get_account_open_trades(account_id: int):
    """Get account's open trades"""
    try:
        db: Session = next(get_db())
        open_trades = AccountService.get_open_trades(db, account_id)
        return jsonify({
            "status": "success",
            "data": open_trades,
            "message": "Open trades retrieved successfully",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting open trades for account {account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve open trades"},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@accounts_bp.route('/<int:account_id>', methods=['DELETE'])
def delete_account(account_id: int):
    """Delete account"""
    try:
        db: Session = next(get_db())
        
        # הגנה על החשבון האחרון
        all_accounts = AccountService.get_all(db)
        if len(all_accounts) == 1:
            return jsonify({
                "status": "error",
                "error": {
                    "message": "לא ניתן למחוק את החשבון האחרון במערכת. חייב להיות לפחות חשבון אחד."
                },
                "version": "1.0"
            }), 403
        
        # Check if there are open trades
        open_trades = AccountService.get_open_trades(db, account_id)
        if open_trades:
            return jsonify({
                "status": "error",
                "error": {
                    "message": "Cannot delete account with open trades",
                    "open_trades": open_trades
                },
                "version": "1.0"
            }), 400
        
        # Try to delete (this will check for all linked items)
        success = AccountService.delete(db, account_id)
        if success:
            # Invalidate cache when deleting account
            invalidate_cache('accounts')
            invalidate_cache(f'account_{account_id}')
            return jsonify({
                "status": "success",
                "message": "Account deleted successfully",
                "version": "1.0"
            })
        
        # If deletion failed, it means there are linked items
        return jsonify({
            "status": "error",
            "error": {
                "message": "Cannot delete account - it has linked trades, executions, or other items"
            },
            "version": "1.0"
        }), 400
    except Exception as e:
        logger.error(f"Error deleting account {account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@accounts_bp.route('/<int:account_id>/stats', methods=['GET'])
@cache_for(ttl=60)  # Cache for 1 minute - stats don't change frequently
def get_account_stats(account_id: int):
    """Get account statistics"""
    try:
        db: Session = next(get_db())
        stats = AccountService.get_stats(db, account_id)
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
        logger.error(f"Error getting account stats {account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve account stats"},
            "version": "1.0"
        }), 500
    finally:
        db.close()
