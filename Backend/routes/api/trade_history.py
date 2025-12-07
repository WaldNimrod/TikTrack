"""
Trade History API Routes - TikTrack
====================================

This module provides API endpoints for retrieving trade history data.

Endpoints:
    GET /api/trade-history/ - Get trade history with filters
    GET /api/trade-history/statistics - Get trade statistics
    GET /api/trade-history/plan-vs-execution - Get plan vs execution analysis
    GET /api/trade-history/aggregated - Get aggregated trade history

Author: TikTrack Development Team
Version: 1.0.0
Date: January 2025

Documentation:
- documentation/02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md
- documentation/03-DEVELOPMENT/PLANS/HISTORICAL_PAGES_FULL_IMPLEMENTATION_PLAN.md
"""

from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from services.business_logic.historical_data_business_service import HistoricalDataBusinessService
from services.advanced_cache_service import cache_with_deps
from .base_entity_decorators import handle_database_session
from .base_entity_utils import BaseEntityUtils
import logging
from typing import Optional

logger = logging.getLogger(__name__)

trade_history_bp = Blueprint('trade_history', __name__, url_prefix='/api/trade-history')


@trade_history_bp.route('/', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=300, dependencies=['trades', 'executions', 'trade-plans'])
def get_trade_history():
    """
    Get trade history with filters.
    
    Query Parameters:
        account_id (optional): Filter by account ID
        ticker_id (optional): Filter by ticker ID
        start_date (optional): Start date (ISO format)
        end_date (optional): End date (ISO format)
        status (optional): Filter by status ('open', 'closed', 'all')
        investment_type (optional): Filter by investment type
        group_by (optional): Group by ('period', 'ticker', 'account')
    
    Returns:
        JSON response with trade history data
    """
    normalizer = None
    try:
        db: Session = g.db
        
        # Get user_id from Flask context (set by auth middleware)
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            error_payload = BaseEntityUtils.create_error_payload(
                None,
                "User authentication required"
            )
            return jsonify(error_payload), 401
        
        normalizer = BaseEntityUtils.get_request_normalizer(request)
        
        # Parse query parameters
        account_id = request.args.get('account_id', type=int)
        ticker_id = request.args.get('ticker_id', type=int)
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        status = request.args.get('status', 'all')
        investment_type = request.args.get('investment_type')
        group_by = request.args.get('group_by')
        
        # Normalize dates
        start_date = None
        end_date = None
        if start_date_str:
            start_date = normalizer.normalize_input_payload(start_date_str)
            if isinstance(start_date, str):
                start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=timezone.utc)
        
        if end_date_str:
            end_date = normalizer.normalize_input_payload(end_date_str)
            if isinstance(end_date, str):
                end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            if end_date.tzinfo is None:
                end_date = end_date.replace(tzinfo=timezone.utc)
        
        # Build filters
        filters = {}
        if account_id:
            filters['account_id'] = account_id
        if ticker_id:
            filters['ticker_id'] = ticker_id
        if start_date:
            filters['start_date'] = start_date
        if end_date:
            filters['end_date'] = end_date
        if status:
            filters['status'] = status
        if investment_type:
            filters['investment_type'] = investment_type
        
        # Initialize service
        service = HistoricalDataBusinessService(db_session=db)
        
        # Aggregate trade history
        result = service.aggregate_trade_history(
            user_id=user_id,
            filters=filters,
            group_by=group_by
        )
        
        if not result.get('is_valid'):
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                result.get('error', 'Failed to aggregate trade history')
            )
            return jsonify(error_payload), 500
        
        # Normalize output
        normalized_data = normalizer.normalize_output(result)
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=normalized_data,
            message="Trade history retrieved successfully"
        )
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting trade history: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Failed to retrieve trade history: {str(e)}"
        )
        return jsonify(error_payload), 500


@trade_history_bp.route('/statistics', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=300, dependencies=['trades', 'executions'])
def get_trade_statistics():
    """
    Get trade statistics.
    
    Query Parameters:
        account_id (optional): Filter by account ID
        ticker_id (optional): Filter by ticker ID
        start_date (optional): Start date (ISO format)
        end_date (optional): End date (ISO format)
        status (optional): Filter by status
        period (optional): Period filter ('day', 'week', 'month', 'year')
    
    Returns:
        JSON response with trade statistics
    """
    normalizer = None
    try:
        db: Session = g.db
        
        # Get user_id from Flask context
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            error_payload = BaseEntityUtils.create_error_payload(
                None,
                "User authentication required"
            )
            return jsonify(error_payload), 401
        
        normalizer = BaseEntityUtils.get_request_normalizer(request)
        
        # Parse query parameters
        account_id = request.args.get('account_id', type=int)
        ticker_id = request.args.get('ticker_id', type=int)
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        status = request.args.get('status', 'all')
        period = request.args.get('period')
        
        # Normalize dates
        start_date = None
        end_date = None
        if start_date_str:
            start_date = normalizer.normalize_input_payload(start_date_str)
            if isinstance(start_date, str):
                start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=timezone.utc)
        
        if end_date_str:
            end_date = normalizer.normalize_input_payload(end_date_str)
            if isinstance(end_date, str):
                end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            if end_date.tzinfo is None:
                end_date = end_date.replace(tzinfo=timezone.utc)
        
        # Build filters
        filters = {}
        if account_id:
            filters['account_id'] = account_id
        if ticker_id:
            filters['ticker_id'] = ticker_id
        if start_date:
            filters['start_date'] = start_date
        if end_date:
            filters['end_date'] = end_date
        if status:
            filters['status'] = status
        
        # Initialize service
        service = HistoricalDataBusinessService(db_session=db)
        
        # Get trades
        trades_result = service.aggregate_trade_history(
            user_id=user_id,
            filters=filters,
            group_by=None
        )
        
        if not trades_result.get('is_valid'):
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                trades_result.get('error', 'Failed to get trades')
            )
            return jsonify(error_payload), 500
        
        trades = trades_result.get('trades', [])
        
        # Calculate statistics
        stats_result = service.calculate_trade_statistics(
            trades=trades,
            period=period
        )
        
        if not stats_result.get('is_valid'):
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                stats_result.get('error', 'Failed to calculate statistics')
            )
            return jsonify(error_payload), 500
        
        # Normalize output
        normalized_data = normalizer.normalize_output(stats_result)
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=normalized_data,
            message="Trade statistics retrieved successfully"
        )
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting trade statistics: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Failed to retrieve trade statistics: {str(e)}"
        )
        return jsonify(error_payload), 500


@trade_history_bp.route('/plan-vs-execution', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=300, dependencies=['trades', 'trade-plans', 'executions'])
def get_plan_vs_execution():
    """
    Get plan vs execution analysis.
    
    Query Parameters:
        start_date (required): Start date (ISO format)
        end_date (required): End date (ISO format)
    
    Returns:
        JSON response with plan vs execution analysis
    """
    normalizer = None
    try:
        db: Session = g.db
        
        # Get user_id from Flask context
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            error_payload = BaseEntityUtils.create_error_payload(
                None,
                "User authentication required"
            )
            return jsonify(error_payload), 401
        
        normalizer = BaseEntityUtils.get_request_normalizer(request)
        
        # Parse query parameters
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        if not start_date_str or not end_date_str:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                "start_date and end_date are required"
            )
            return jsonify(error_payload), 400
        
        # Normalize dates
        start_date = normalizer.normalize_input_payload(start_date_str)
        if isinstance(start_date, str):
            start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if start_date.tzinfo is None:
            start_date = start_date.replace(tzinfo=timezone.utc)
        
        end_date = normalizer.normalize_input_payload(end_date_str)
        if isinstance(end_date, str):
            end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        if end_date.tzinfo is None:
            end_date = end_date.replace(tzinfo=timezone.utc)
        
        # Initialize service
        service = HistoricalDataBusinessService(db_session=db)
        
        # Get analysis
        result = service.calculate_plan_vs_execution_analysis(
            user_id=user_id,
            date_range={
                'start_date': start_date,
                'end_date': end_date
            }
        )
        
        if not result.get('is_valid'):
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                result.get('error', 'Failed to calculate plan vs execution analysis')
            )
            return jsonify(error_payload), 500
        
        # Normalize output
        normalized_data = normalizer.normalize_output(result)
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=normalized_data,
            message="Plan vs execution analysis retrieved successfully"
        )
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting plan vs execution analysis: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Failed to retrieve plan vs execution analysis: {str(e)}"
        )
        return jsonify(error_payload), 500


@trade_history_bp.route('/aggregated', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=300, dependencies=['trades', 'executions'])
def get_aggregated_trade_history():
    """
    Get aggregated trade history.
    
    Query Parameters:
        account_id (optional): Filter by account ID
        ticker_id (optional): Filter by ticker ID
        start_date (optional): Start date (ISO format)
        end_date (optional): End date (ISO format)
        group_by (required): Group by ('period', 'ticker', 'account')
    
    Returns:
        JSON response with aggregated trade history
    """
    normalizer = None
    try:
        db: Session = g.db
        
        # Get user_id from Flask context
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            error_payload = BaseEntityUtils.create_error_payload(
                None,
                "User authentication required"
            )
            return jsonify(error_payload), 401
        
        normalizer = BaseEntityUtils.get_request_normalizer(request)
        
        # Parse query parameters
        account_id = request.args.get('account_id', type=int)
        ticker_id = request.args.get('ticker_id', type=int)
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        group_by = request.args.get('group_by')
        
        if not group_by:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                "group_by parameter is required"
            )
            return jsonify(error_payload), 400
        
        if group_by not in ['period', 'ticker', 'account']:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                "group_by must be one of: period, ticker, account"
            )
            return jsonify(error_payload), 400
        
        # Normalize dates
        start_date = None
        end_date = None
        if start_date_str:
            start_date = normalizer.normalize_input_payload(start_date_str)
            if isinstance(start_date, str):
                start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=timezone.utc)
        
        if end_date_str:
            end_date = normalizer.normalize_input_payload(end_date_str)
            if isinstance(end_date, str):
                end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            if end_date.tzinfo is None:
                end_date = end_date.replace(tzinfo=timezone.utc)
        
        # Build filters
        filters = {}
        if account_id:
            filters['account_id'] = account_id
        if ticker_id:
            filters['ticker_id'] = ticker_id
        if start_date:
            filters['start_date'] = start_date
        if end_date:
            filters['end_date'] = end_date
        
        # Initialize service
        service = HistoricalDataBusinessService(db_session=db)
        
        # Aggregate trade history
        result = service.aggregate_trade_history(
            user_id=user_id,
            filters=filters,
            group_by=group_by
        )
        
        if not result.get('is_valid'):
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                result.get('error', 'Failed to aggregate trade history')
            )
            return jsonify(error_payload), 500
        
        # Normalize output
        normalized_data = normalizer.normalize_output(result)
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=normalized_data,
            message="Aggregated trade history retrieved successfully"
        )
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting aggregated trade history: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Failed to retrieve aggregated trade history: {str(e)}"
        )
        return jsonify(error_payload), 500

