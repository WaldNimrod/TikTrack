from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from services.account_service import AccountService
from utils.auth import require_auth
import logging

logger = logging.getLogger(__name__)

accounts_bp = Blueprint('accounts', __name__, url_prefix='/api/v1/accounts')

@accounts_bp.route('/', methods=['GET'])
@require_auth
def get_accounts():
    """קבלת כל החשבונות"""
    try:
        db: Session = next(get_db())
        accounts = AccountService.get_all(db)
        return jsonify({
            "status": "success",
            "data": [account.to_dict() for account in accounts],
            "message": "Accounts retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error getting accounts: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve accounts"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@accounts_bp.route('/<int:account_id>', methods=['GET'])
@require_auth
def get_account(account_id: int):
    """קבלת חשבון לפי מזהה"""
    try:
        db: Session = next(get_db())
        account = AccountService.get_by_id(db, account_id)
        if account:
            return jsonify({
                "status": "success",
                "data": account.to_dict(),
                "message": "Account retrieved successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Account not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error getting account {account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve account"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@accounts_bp.route('/', methods=['POST'])
@require_auth
def create_account():
    """יצירת חשבון חדש"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        account = AccountService.create(db, data)
        return jsonify({
            "status": "success",
            "data": account.to_dict(),
            "message": "Account created successfully",
            "version": "v1"
        }), 201
    except Exception as e:
        logger.error(f"Error creating account: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@accounts_bp.route('/<int:account_id>', methods=['PUT'])
@require_auth
def update_account(account_id: int):
    """עדכון חשבון"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        account = AccountService.update(db, account_id, data)
        if account:
            return jsonify({
                "status": "success",
                "data": account.to_dict(),
                "message": "Account updated successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Account not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error updating account {account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@accounts_bp.route('/<int:account_id>', methods=['DELETE'])
@require_auth
def delete_account(account_id: int):
    """מחיקת חשבון"""
    try:
        db: Session = next(get_db())
        success = AccountService.delete(db, account_id)
        if success:
            return jsonify({
                "status": "success",
                "message": "Account deleted successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Account not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error deleting account {account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 500
    finally:
        db.close()

@accounts_bp.route('/<int:account_id>/stats', methods=['GET'])
@require_auth
def get_account_stats(account_id: int):
    """קבלת סטטיסטיקות חשבון"""
    try:
        db: Session = next(get_db())
        stats = AccountService.get_stats(db, account_id)
        if stats:
            return jsonify({
                "status": "success",
                "data": stats,
                "message": "Account stats retrieved successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Account not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error getting account stats {account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve account stats"},
            "version": "v1"
        }), 500
    finally:
        db.close()
