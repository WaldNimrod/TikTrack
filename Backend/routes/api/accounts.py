"""
Accounts API Routes - Blueprint for Account Management

This module provides RESTful API endpoints for account management operations.
Following the new backend architecture with proper separation of concerns:
- Presentation Layer: Flask Blueprint routes
- Business Logic: AccountService
- Data Access: SQLAlchemy ORM
- Database: SQLite

Endpoints:
- GET /api/v1/accounts/ - Get all accounts
- GET /api/v1/accounts/<id> - Get specific account
- POST /api/v1/accounts/ - Create new account
- PUT /api/v1/accounts/<id> - Update account
- DELETE /api/v1/accounts/<id> - Delete account
- GET /api/v1/accounts/<id>/stats - Get account statistics

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-16

🚨 CRITICAL REMINDERS:
- This is a BLUEPRINT - never write routes directly in app.py
- Always follow: Models → Services → Routes → App architecture
- Always test: GET, POST, PUT, DELETE operations
- Always use /api/v1/ prefix for versioning
"""

from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from services.account_service import AccountService
import logging

# Configure logging for this module
logger = logging.getLogger(__name__)

# Create Flask Blueprint for accounts API
# URL prefix ensures all routes start with /api/v1/accounts
accounts_bp = Blueprint('accounts', __name__, url_prefix='/api/v1/accounts')

@accounts_bp.route('/', methods=['GET'])
def get_accounts():
    """
    קבלת כל החשבונות במערכת
    
    Returns:
        JSON response with list of all accounts
        Success: 200 with accounts data
        Error: 500 with error message
    """
    try:
        # Get database session from connection pool
        db: Session = next(get_db())
        
        # Use AccountService to retrieve all accounts (Business Logic Layer)
        accounts = AccountService.get_all(db)
        
        # Convert SQLAlchemy objects to dictionaries for JSON serialization
        accounts_data = [account.to_dict() for account in accounts]
        
        return jsonify({
            "status": "success",
            "data": accounts_data,
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
        # Always close database session to prevent connection leaks
        db.close()

@accounts_bp.route('/<int:account_id>', methods=['GET'])
def get_account(account_id: int):
    """
    קבלת חשבון ספציפי לפי מזהה
    
    Args:
        account_id (int): מזהה החשבון המבוקש
        
    Returns:
        JSON response with account data
        Success: 200 with account data
        Not Found: 404 if account doesn't exist
        Error: 500 with error message
    """
    try:
        db: Session = next(get_db())
        
        # Use AccountService to retrieve specific account
        account = AccountService.get_by_id(db, account_id)
        
        if account:
            return jsonify({
                "status": "success",
                "data": account.to_dict(),
                "message": "Account retrieved successfully",
                "version": "v1"
            })
        
        # Account not found
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
def create_account():
    """
    יצירת חשבון חדש במערכת
    
    Expected JSON payload:
    {
        "name": "שם החשבון",
        "currency": "USD",
        "status": "active",
        "cash_balance": 10000.0,
        "notes": "הערות אופציונליות"
    }
    
    Returns:
        JSON response with created account data
        Success: 201 with account data
        Error: 400 with validation error message
    """
    try:
        # Extract JSON data from request
        data = request.get_json()
        
        db: Session = next(get_db())
        
        # Use AccountService to create new account (Business Logic Layer)
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
def update_account(account_id: int):
    """
    עדכון חשבון קיים
    
    Args:
        account_id (int): מזהה החשבון לעדכון
        
    Expected JSON payload (partial update supported):
    {
        "name": "שם חדש",
        "currency": "EUR",
        "status": "inactive",
        "cash_balance": 15000.0,
        "notes": "הערות מעודכנות"
    }
    
    Returns:
        JSON response with updated account data
        Success: 200 with account data
        Not Found: 404 if account doesn't exist
        Error: 400 with validation error message
    """
    try:
        data = request.get_json()
        db: Session = next(get_db())
        
        # Use AccountService to update account
        account = AccountService.update(db, account_id, data)
        
        if account:
            return jsonify({
                "status": "success",
                "data": account.to_dict(),
                "message": "Account updated successfully",
                "version": "v1"
            })
        
        # Account not found
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
def delete_account(account_id: int):
    """
    מחיקת חשבון מהמערכת
    
    Note: Account can only be deleted if it has no active trades
    (Business rule enforced in AccountService)
    
    Args:
        account_id (int): מזהה החשבון למחיקה
        
    Returns:
        JSON response
        Success: 200 with success message
        Not Found: 404 if account doesn't exist
        Error: 500 if deletion fails (e.g., active trades exist)
    """
    try:
        db: Session = next(get_db())
        
        # Use AccountService to delete account (includes business logic validation)
        success = AccountService.delete(db, account_id)
        
        if success:
            return jsonify({
                "status": "success",
                "message": "Account deleted successfully",
                "version": "v1"
            })
        
        # Account not found
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
def get_account_stats(account_id: int):
    """
    קבלת סטטיסטיקות מפורטות של חשבון
    
    Returns comprehensive account statistics including:
    - Total trades count
    - Win/loss ratio
    - Average trade duration
    - Total P&L
    - Performance metrics
    
    Args:
        account_id (int): מזהה החשבון לסטטיסטיקות
        
    Returns:
        JSON response with account statistics
        Success: 200 with stats data
        Not Found: 404 if account doesn't exist
        Error: 500 with error message
    """
    try:
        db: Session = next(get_db())
        
        # Use AccountService to get account statistics
        stats = AccountService.get_stats(db, account_id)
        
        if stats:
            return jsonify({
                "status": "success",
                "data": stats,
                "message": "Account stats retrieved successfully",
                "version": "v1"
            })
        
        # Account not found
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
