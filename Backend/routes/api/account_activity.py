"""
Account Activity API Routes - TikTrack

This module provides API endpoints for retrieving account activity data,
including cash flows and executions grouped by currency.

Endpoints:
    GET /api/account-activity/<account_id> - Get account activity with optional date filters

Author: TikTrack Development Team
Version: 1.0.0
Date: November 2025
"""

from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from datetime import date, datetime
from services.account_activity_service import AccountActivityService
from services.advanced_cache_service import cache_for, invalidate_cache
from .base_entity_decorators import handle_database_session
import logging
from typing import Optional

logger = logging.getLogger(__name__)

account_activity_bp = Blueprint('account_activity', __name__, url_prefix='/api/account-activity')


@account_activity_bp.route('/<int:account_id>', methods=['GET'])
@handle_database_session()
@cache_for(ttl=60)  # Cache for 60 seconds
def get_account_activity(account_id: int):
    """
    Get account activity (cash flows + executions) grouped by currency
    
    Query Parameters:
        start_date (optional): Filter start date (YYYY-MM-DD format)
        end_date (optional): Filter end date (YYYY-MM-DD format)
    
    Returns:
        JSON response with account info, currencies, movements, and balances
    """
    try:
        db: Session = g.db
        
        # Parse optional date filters
        start_date = None
        end_date = None
        
        start_date_str = request.args.get('start_date')
        if start_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    "status": "error",
                    "error": {"message": "Invalid start_date format. Use YYYY-MM-DD"},
                    "version": "1.0"
                }), 400
        
        end_date_str = request.args.get('end_date')
        if end_date_str:
            try:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    "status": "error",
                    "error": {"message": "Invalid end_date format. Use YYYY-MM-DD"},
                    "version": "1.0"
                }), 400
        
        # Validate date range
        if start_date and end_date and start_date > end_date:
            return jsonify({
                "status": "error",
                "error": {"message": "start_date must be before or equal to end_date"},
                "version": "1.0"
            }), 400
        
        # Get account activity data
        activity_data = AccountActivityService.get_account_activity(
            db=db,
            account_id=account_id,
            start_date=start_date,
            end_date=end_date
        )
        
        return jsonify({
            "status": "success",
            "data": activity_data,
            "message": "Account activity retrieved successfully",
            "version": "1.0"
        }), 200
        
    except ValueError as e:
        logger.error(f"ValueError getting account activity for account {account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 404
    
    except Exception as e:
        logger.error(f"Error getting account activity for account {account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve account activity"},
            "version": "1.0"
        }), 500


@account_activity_bp.route('/<int:account_id>/balance/<int:currency_id>', methods=['GET'])
@handle_database_session()
@cache_for(ttl=60)
def get_balance_by_currency(account_id: int, currency_id: int):
    """
    Get balance for specific currency in account
    
    Returns:
        JSON response with balance amount
    """
    try:
        db: Session = g.db
        
        balance = AccountActivityService.calculate_balance_by_currency(
            db=db,
            account_id=account_id,
            currency_id=currency_id
        )
        
        return jsonify({
            "status": "success",
            "data": {
                "account_id": account_id,
                "currency_id": currency_id,
                "balance": round(balance, 2)
            },
            "message": "Balance retrieved successfully",
            "version": "1.0"
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting balance for account {account_id}, currency {currency_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve balance"},
            "version": "1.0"
        }), 500


@account_activity_bp.route('/<int:account_id>/balances', methods=['GET'])
@handle_database_session()
@cache_for(ttl=60)
def get_account_balances(account_id: int):
    """
    Get account balances - base currency total and balances by currency
    
    Returns:
        JSON response with:
        - base_currency_total: Main balance in account's base currency
        - base_currency: Base currency symbol
        - balances_by_currency: List of balances per currency (including base)
        Each currency includes: currency_id, currency_symbol, balance
    """
    try:
        db: Session = g.db
        
        # Get account activity using existing service (reuses existing code)
        activity_data = AccountActivityService.get_account_activity(
            db=db,
            account_id=account_id,
            start_date=None,
            end_date=None
        )
        
        # Extract balances from activity data
        balances_by_currency = []
        for curr_data in activity_data.get('currencies', []):
            balances_by_currency.append({
                'currency_id': curr_data.get('currency_id'),
                'currency_symbol': curr_data.get('currency_symbol'),
                'currency_name': curr_data.get('currency_name'),
                'balance': round(curr_data.get('balance', 0.0), 2)
            })
        
        return jsonify({
            "status": "success",
            "data": {
                "account_id": account_id,
                "account_name": activity_data.get('account_name'),
                "base_currency_total": activity_data.get('base_currency_total', 0.0),
                "base_currency": activity_data.get('base_currency', 'USD'),
                "base_currency_id": activity_data.get('base_currency_id', 1),
                "balances_by_currency": balances_by_currency,
                "exchange_rates_used": activity_data.get('exchange_rates_used', {})
            },
            "message": "Account balances retrieved successfully",
            "version": "1.0"
        }), 200
        
    except ValueError as e:
        logger.error(f"ValueError getting balances for account {account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 404
    
    except Exception as e:
        logger.error(f"Error getting balances for account {account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve account balances"},
            "version": "1.0"
        }), 500


@account_activity_bp.route('/<int:account_id>/timeline', methods=['GET'])
@handle_database_session()
@cache_for(ttl=60)
def get_movements_timeline(account_id: int):
    """
    Get chronological timeline of all movements for account
    
    Query Parameters:
        start_date (optional): Filter start date (YYYY-MM-DD format)
        end_date (optional): Filter end date (YYYY-MM-DD format)
    
    Returns:
        JSON response with chronological list of movements
    """
    try:
        db: Session = g.db
        
        # Parse optional date filters
        start_date = None
        end_date = None
        
        start_date_str = request.args.get('start_date')
        if start_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    "status": "error",
                    "error": {"message": "Invalid start_date format. Use YYYY-MM-DD"},
                    "version": "1.0"
                }), 400
        
        end_date_str = request.args.get('end_date')
        if end_date_str:
            try:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    "status": "error",
                    "error": {"message": "Invalid end_date format. Use YYYY-MM-DD"},
                    "version": "1.0"
                }), 400
        
        # Get timeline
        movements = AccountActivityService.get_movements_timeline(
            db=db,
            account_id=account_id,
            start_date=start_date,
            end_date=end_date
        )
        
        return jsonify({
            "status": "success",
            "data": {
                "account_id": account_id,
                "movements": movements,
                "count": len(movements)
            },
            "message": "Timeline retrieved successfully",
            "version": "1.0"
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting timeline for account {account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve timeline"},
            "version": "1.0"
        }), 500

