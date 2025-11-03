"""
Positions & Portfolio API Routes - TikTrack

This module provides API endpoints for retrieving position and portfolio data.

Endpoints:
    GET /api/positions/account/<account_id> - Get all positions for an account
    GET /api/positions/portfolio - Get portfolio summary across all accounts
    GET /api/positions/<account_id>/<ticker_id>/details - Get detailed position info
    GET /api/portfolio/summary - Get portfolio summary (minimal or full)

Author: TikTrack Development Team
Version: 1.0.0
Date: January 2025

Documentation: documentation/02-ARCHITECTURE/BACKEND/POSITION_PORTFOLIO_SERVICE.md
"""

from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from services.position_portfolio_service import PositionPortfolioService
from services.advanced_cache_service import cache_for, cache_with_deps, invalidate_cache
from .base_entity_decorators import handle_database_session
import logging
from typing import Optional

logger = logging.getLogger(__name__)

positions_bp = Blueprint('positions', __name__, url_prefix='/api/positions')


@positions_bp.route('/account/<int:account_id>', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=60, dependencies=['executions', 'market_data_quotes'])
def get_account_positions(account_id: int):
    """
    Get all positions for a specific trading account
    
    Query Parameters:
        include_closed (optional): Include closed positions (default: false)
    
    Returns:
        JSON response with list of positions
    """
    try:
        db: Session = g.db
        
        # Parse query parameters
        include_closed = request.args.get('include_closed', 'false').lower() == 'true'
        
        positions = PositionPortfolioService.calculate_all_account_positions(
            db=db,
            trading_account_id=account_id,
            include_closed=include_closed,
            include_market_data=True
        )
        
        return jsonify({
            "status": "success",
            "data": {
                "account_id": account_id,
                "positions": positions,
                "count": len(positions)
            },
            "message": f"Retrieved {len(positions)} positions for account {account_id}",
            "version": "1.0"
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting positions for account {account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 500


@positions_bp.route('/portfolio', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=60, dependencies=['executions', 'market_data_quotes'])
def get_portfolio():
    """
    Get portfolio summary across all accounts
    
    Query Parameters:
        account_id (optional): Filter by specific account ID (default: all accounts)
        include_closed (optional): Include closed positions (default: false)
        unify_accounts (optional): Unify positions with same ticker across accounts (default: false)
        side (optional): Filter by side - 'long', 'short', or omit for all
    
    Returns:
        JSON response with portfolio summary and positions list
    """
    try:
        db: Session = g.db
        
        # Parse query parameters
        account_id_filter = request.args.get('account_id')
        account_id_filter = int(account_id_filter) if account_id_filter and account_id_filter.isdigit() else None
        include_closed = request.args.get('include_closed', 'false').lower() == 'true'
        unify_accounts = request.args.get('unify_accounts', 'false').lower() == 'true'
        side_filter = request.args.get('side')  # 'long', 'short', or None
        
        portfolio_data = PositionPortfolioService.calculate_portfolio_summary(
            db=db,
            account_id_filter=account_id_filter,
            include_closed=include_closed,
            unify_accounts=unify_accounts,
            side_filter=side_filter
        )
        
        return jsonify({
            "status": "success",
            "data": portfolio_data,
            "message": "Portfolio summary retrieved successfully",
            "version": "1.0"
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting portfolio summary: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 500


@positions_bp.route('/<int:account_id>/<int:ticker_id>/details', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=60, dependencies=['executions', 'market_data_quotes'])
def get_position_details(account_id: int, ticker_id: int):
    """
    Get detailed position information including linked executions
    
    Args:
        account_id: Trading account ID
        ticker_id: Ticker ID
    
    Returns:
        JSON response with detailed position data including executions
    """
    try:
        db: Session = g.db
        
        position_details = PositionPortfolioService.get_position_details(
            db=db,
            trading_account_id=account_id,
            ticker_id=ticker_id
        )
        
        if not position_details:
            return jsonify({
                "status": "error",
                "error": {"message": f"Position not found for account {account_id}, ticker {ticker_id}"},
                "version": "1.0"
            }), 404
        
        return jsonify({
            "status": "success",
            "data": position_details,
            "message": "Position details retrieved successfully",
            "version": "1.0"
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting position details for account {account_id}, ticker {ticker_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 500


# Portfolio summary endpoint (alternative route)
portfolio_bp = Blueprint('portfolio', __name__, url_prefix='/api/portfolio')


@portfolio_bp.route('/summary', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=60, dependencies=['executions', 'market_data_quotes'])
def get_portfolio_summary():
    """
    Get portfolio summary in minimal or full format
    
    Query Parameters:
        size (optional): 'minimal' or 'full' (default: 'full')
        account_id (optional): Filter by specific account ID (default: all accounts)
        include_closed (optional): Include closed positions (default: false)
        unify_accounts (optional): Unify positions with same ticker (default: false)
        side (optional): Filter by side - 'long', 'short', or omit for all
    
    Returns:
        JSON response with portfolio summary
    """
    try:
        db: Session = g.db
        
        # Parse query parameters
        size = request.args.get('size', 'full')  # 'minimal' or 'full'
        account_id_filter = request.args.get('account_id')
        account_id_filter = int(account_id_filter) if account_id_filter and account_id_filter.isdigit() else None
        include_closed = request.args.get('include_closed', 'false').lower() == 'true'
        unify_accounts = request.args.get('unify_accounts', 'false').lower() == 'true'
        side_filter = request.args.get('side')
        
        portfolio_data = PositionPortfolioService.calculate_portfolio_summary(
            db=db,
            account_id_filter=account_id_filter,
            include_closed=include_closed,
            unify_accounts=unify_accounts,
            side_filter=side_filter
        )
        
        # Format response based on size
        if size == 'minimal':
            # Return only summary totals, not individual positions
            response_data = {
                "summary": portfolio_data.get('summary', {}),
                "positions_count": len(portfolio_data.get('positions', []))
            }
        else:
            # Return full data
            response_data = portfolio_data
        
        return jsonify({
            "status": "success",
            "data": response_data,
            "message": "Portfolio summary retrieved successfully",
            "version": "1.0"
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting portfolio summary: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 500

