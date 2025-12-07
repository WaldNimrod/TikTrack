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
- documentation/02-ARCHITECTURE/BACKEND/HISTORICAL_DATA_SERVICE.md
- documentation/03-DEVELOPMENT/PLANS/HISTORICAL_PAGES_FULL_IMPLEMENTATION_PLAN.md
"""

from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from services.business_logic.historical_data_business_service import HistoricalDataBusinessService
from services.advanced_cache_service import cache_with_deps
from services.user_service import UserService
from .base_entity_decorators import handle_database_session
from .base_entity_utils import BaseEntityUtils
import logging
from typing import Optional

logger = logging.getLogger(__name__)

trade_history_bp = Blueprint('trade_history', __name__, url_prefix='/api/trade-history')
user_service = UserService()


def _resolve_user_id() -> int:
    """
    Return active user id from Flask context (set by auth middleware).
    Falls back to default user if not authenticated (for backward compatibility).
    """
    # Primary: Get from Flask context (set by auth middleware)
    user_id = getattr(g, 'user_id', None)
    if user_id is not None:
        return user_id
    
    # Fallback: Check query parameter
    user_id = request.args.get('user_id', type=int)
    if user_id is not None:
        return user_id
    
    # Fallback: Default user (for backward compatibility and tools)
    default_user = user_service.get_default_user()
    return default_user["id"] if default_user else 1


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
        
        # Resolve user_id with fallback
        user_id = _resolve_user_id()
        
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
        if status and status != 'all':
            filters['status'] = status
        if investment_type:
            filters['investment_type'] = investment_type
        
        # Validate request
        validation_data = {
            'user_id': user_id,
            **filters
        }
        
        service = HistoricalDataBusinessService(db_session=db)
        validation_result = service.validate(validation_data)
        
        if not validation_result['is_valid']:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                f"Validation failed: {', '.join(validation_result['errors'])}"
            )
            return jsonify(error_payload), 400
        
        # Get trade history
        result = service.aggregate_trade_history(
            user_id=user_id,
            filters=filters,
            group_by=group_by
        )
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=result,
            extra={'count': result.get('count', 0)}
        )
        
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting trade history: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Error retrieving trade history: {str(e)}"
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
        period (optional): Period for statistics ('day', 'week', 'month', 'year')
    
    Returns:
        JSON response with trade statistics
    """
    normalizer = None
    try:
        db: Session = g.db
        
        # Resolve user_id with fallback
        user_id = _resolve_user_id()
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
        status = request.args.get('status')
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
        
        # Validate request
        validation_data = {
            'user_id': user_id,
            **filters
        }
        
        service = HistoricalDataBusinessService(db_session=db)
        validation_result = service.validate(validation_data)
        
        if not validation_result['is_valid']:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                f"Validation failed: {', '.join(validation_result['errors'])}"
            )
            return jsonify(error_payload), 400
        
        # Get statistics
        result = service.calculate_trade_statistics(
            user_id=user_id,
            filters=filters,
            period=period
        )
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=result
        )
        
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting trade statistics: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Error retrieving trade statistics: {str(e)}"
        )
        return jsonify(error_payload), 500


@trade_history_bp.route('/plan-vs-execution', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=300, dependencies=['trades', 'trade-plans'])
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
        
        # Resolve user_id with fallback
        user_id = _resolve_user_id()
        
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
        
        # Validate request
        validation_data = {
            'user_id': user_id,
            'start_date': start_date,
            'end_date': end_date
        }
        
        service = HistoricalDataBusinessService(db_session=db)
        validation_result = service.validate(validation_data)
        
        if not validation_result['is_valid']:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                f"Validation failed: {', '.join(validation_result['errors'])}"
            )
            return jsonify(error_payload), 400
        
        # Get plan vs execution analysis
        result = service.calculate_plan_vs_execution_analysis(
            user_id=user_id,
            date_range={
                'start_date': start_date,
                'end_date': end_date
            }
        )
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=result
        )
        
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting plan vs execution analysis: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Error retrieving plan vs execution analysis: {str(e)}"
        )
        return jsonify(error_payload), 500


@trade_history_bp.route('/aggregated', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=300, dependencies=['trades', 'executions'])
def get_aggregated_trade_history():
    """
    Get aggregated trade history.
    
    Query Parameters:
        group_by (required): Group by ('period', 'ticker', 'account')
        account_id (optional): Filter by account ID
        ticker_id (optional): Filter by ticker ID
        start_date (optional): Start date (ISO format)
        end_date (optional): End date (ISO format)
    
    Returns:
        JSON response with aggregated trade history
    """
    normalizer = None
    try:
        db: Session = g.db
        
        # Resolve user_id with fallback
        user_id = _resolve_user_id()
        if not user_id:
            error_payload = BaseEntityUtils.create_error_payload(
                None,
                "User authentication required"
            )
            return jsonify(error_payload), 401
        
        normalizer = BaseEntityUtils.get_request_normalizer(request)
        
        # Parse query parameters
        group_by = request.args.get('group_by')
        if not group_by:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                "group_by parameter is required"
            )
            return jsonify(error_payload), 400
        
        account_id = request.args.get('account_id', type=int)
        ticker_id = request.args.get('ticker_id', type=int)
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
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
        
        # Validate request
        validation_data = {
            'user_id': user_id,
            **filters
        }
        
        service = HistoricalDataBusinessService(db_session=db)
        validation_result = service.validate(validation_data)
        
        if not validation_result['is_valid']:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                f"Validation failed: {', '.join(validation_result['errors'])}"
            )
            return jsonify(error_payload), 400
        
        # Get aggregated trade history
        result = service.aggregate_trade_history(
            user_id=user_id,
            filters=filters,
            group_by=group_by
        )
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=result,
            extra={'count': result.get('count', 0)}
        )
        
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting aggregated trade history: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Error retrieving aggregated trade history: {str(e)}"
        )
        return jsonify(error_payload), 500


@trade_history_bp.route('/<int:trade_id>/timeline', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=172800, dependencies=['trades', 'executions', 'trade-plans', 'notes', 'alerts', 'cash-flows'])
def get_trade_timeline(trade_id):
    """
    Get complete timeline for a trade with all linked items and calculations.
    
    Query Parameters:
        include_durations (optional): Include duration calculations between items (default: true)
    
    Returns:
        JSON response with timeline data
    """
    normalizer = None
    try:
        db: Session = g.db
        
        # Resolve user_id with fallback
        user_id = _resolve_user_id()
        
        normalizer = BaseEntityUtils.get_request_normalizer(request)
        
        # Parse query parameters
        include_durations = request.args.get('include_durations', 'true').lower() == 'true'
        
        service = HistoricalDataBusinessService(db_session=db)
        
        # Get timeline
        result = service.calculate_trade_timeline(
            trade_id=trade_id,
            user_id=user_id,
            include_durations=include_durations
        )
        
        if not result.get('is_valid'):
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                result.get('error', 'Failed to calculate timeline')
            )
            return jsonify(error_payload), 400
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=result
        )
        
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting trade timeline for trade {trade_id}: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Error retrieving trade timeline: {str(e)}"
        )
        return jsonify(error_payload), 500


@trade_history_bp.route('/<int:trade_id>/chart-data', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=172800, dependencies=['trades', 'executions', 'market_data_quotes'])
def get_trade_chart_data(trade_id):
    """
    Get chart data for a trade including market prices, position data, and P/L.
    
    Query Parameters:
        days_before (optional): Days before first record to include (default: 7)
        days_after (optional): Days after last record to include (default: 7)
    
    Returns:
        JSON response with chart data
    """
    normalizer = None
    try:
        db: Session = g.db
        
        # Resolve user_id with fallback
        user_id = _resolve_user_id()
        
        normalizer = BaseEntityUtils.get_request_normalizer(request)
        
        # Parse query parameters
        days_before = request.args.get('days_before', type=int) or 7
        days_after = request.args.get('days_after', type=int) or 7
        
        # Validate parameters
        if days_before < 0 or days_before > 30:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                "days_before must be between 0 and 30"
            )
            return jsonify(error_payload), 400
        
        if days_after < 0 or days_after > 30:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                "days_after must be between 0 and 30"
            )
            return jsonify(error_payload), 400
        
        service = HistoricalDataBusinessService(db_session=db)
        
        # Get chart data
        result = service.calculate_trade_chart_data(
            trade_id=trade_id,
            user_id=user_id,
            days_before=days_before,
            days_after=days_after
        )
        
        if not result.get('is_valid'):
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                result.get('error', 'Failed to calculate chart data')
            )
            return jsonify(error_payload), 400
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=result
        )
        
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting trade chart data for trade {trade_id}: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Error retrieving trade chart data: {str(e)}"
        )
        return jsonify(error_payload), 500


@trade_history_bp.route('/<int:trade_id>/statistics', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=300, dependencies=['trades', 'executions'])
def get_trade_statistics_detailed(trade_id):
    """
    Get detailed statistics for a trade.
    
    Returns:
        JSON response with detailed statistics
    """
    normalizer = None
    try:
        db: Session = g.db
        
        # Resolve user_id with fallback
        user_id = _resolve_user_id()
        
        normalizer = BaseEntityUtils.get_request_normalizer(request)
        
        service = HistoricalDataBusinessService(db_session=db)
        
        # Get statistics
        result = service.calculate_trade_statistics_detailed(
            trade_id=trade_id,
            user_id=user_id
        )
        
        if not result.get('is_valid'):
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                result.get('error', 'Failed to calculate statistics')
            )
            return jsonify(error_payload), 400
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=result
        )
        
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting trade statistics for trade {trade_id}: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Error retrieving trade statistics: {str(e)}"
        )
        return jsonify(error_payload), 500


@trade_history_bp.route('/<int:trade_id>/full-analysis', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=172800, dependencies=['trades', 'executions', 'trade-plans', 'notes', 'alerts', 'cash-flows', 'market_data_quotes'])
def get_trade_full_analysis(trade_id):
    """
    Get complete analysis for a trade including timeline, chart data, and statistics.
    This is a unified endpoint optimized for the trade-history page.
    
    Query Parameters:
        days_before (optional): Days before first record to include (default: 7)
        days_after (optional): Days after last record to include (default: 7)
        include_durations (optional): Include duration calculations between items (default: true)
    
    Returns:
        JSON response with complete analysis data
    """
    normalizer = None
    try:
        db: Session = g.db
        
        # Resolve user_id with fallback
        user_id = _resolve_user_id()
        
        normalizer = BaseEntityUtils.get_request_normalizer(request)
        
        # Parse query parameters
        days_before = request.args.get('days_before', type=int) or 7
        days_after = request.args.get('days_after', type=int) or 7
        include_durations = request.args.get('include_durations', 'true').lower() == 'true'
        
        # Validate parameters
        if days_before < 0 or days_before > 30:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                "days_before must be between 0 and 30"
            )
            return jsonify(error_payload), 400
        
        if days_after < 0 or days_after > 30:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                "days_after must be between 0 and 30"
            )
            return jsonify(error_payload), 400
        
        service = HistoricalDataBusinessService(db_session=db)
        
        # Get all data sequentially
        timeline_result = service.calculate_trade_timeline(
            trade_id=trade_id,
            user_id=user_id,
            include_durations=include_durations
        )
        
        chart_result = service.calculate_trade_chart_data(
            trade_id=trade_id,
            user_id=user_id,
            days_before=days_before,
            days_after=days_after
        )
        
        statistics_result = service.calculate_trade_statistics_detailed(
            trade_id=trade_id,
            user_id=user_id
        )
        
        # Combine results
        result = {
            'timeline': timeline_result.get('timeline', []),
            'chart_data': {
                'market_prices': chart_result.get('market_prices', []),
                'position_data': chart_result.get('position_data', []),
                'pl_data': chart_result.get('pl_data', [])
            },
            'statistics': statistics_result.get('statistics', {}),
            'metadata': {
                'trade_id': trade_id,
                **timeline_result.get('metadata', {}),
                'chart_metadata': chart_result.get('metadata', {}),
                'statistics_metadata': statistics_result.get('metadata', {})
            },
            'is_valid': (
                timeline_result.get('is_valid', False) and
                chart_result.get('is_valid', False) and
                statistics_result.get('is_valid', False)
            )
        }
        
        if not result['is_valid']:
            errors = []
            if not timeline_result.get('is_valid'):
                errors.append(timeline_result.get('error', 'Timeline calculation failed'))
            if not chart_result.get('is_valid'):
                errors.append(chart_result.get('error', 'Chart data calculation failed'))
            if not statistics_result.get('is_valid'):
                errors.append(statistics_result.get('error', 'Statistics calculation failed'))
            
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                f"Failed to calculate full analysis: {', '.join(errors)}"
            )
            return jsonify(error_payload), 400
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=result
        )
        
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting full analysis for trade {trade_id}: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Error retrieving full analysis: {str(e)}"
        )
        return jsonify(error_payload), 500

