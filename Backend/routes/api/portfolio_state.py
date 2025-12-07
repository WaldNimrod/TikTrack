"""
Portfolio State API Routes - TikTrack
======================================

This module provides API endpoints for retrieving historical portfolio state data.

Endpoints:
    GET /api/portfolio-state/snapshot - Get portfolio state at a specific date
    GET /api/portfolio-state/series - Get portfolio state series for charts
    GET /api/portfolio-state/performance - Get portfolio performance over date range
    GET /api/portfolio-state/comparison - Compare portfolio state between two dates

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

portfolio_state_bp = Blueprint('portfolio_state', __name__, url_prefix='/api/portfolio-state')


@portfolio_state_bp.route('/snapshot', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=600, dependencies=['executions', 'market_data_quotes', 'trades'])
def get_portfolio_snapshot():
    """
    Get portfolio state at a specific date.
    
    Query Parameters:
        account_id (optional): Filter by account ID (None for all accounts)
        date (required): Target date for snapshot (ISO format)
        include_closed (optional): Include closed positions (default: false)
    
    Returns:
        JSON response with portfolio state data
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
        date_str = request.args.get('date')
        include_closed = request.args.get('include_closed', 'false').lower() == 'true'
        
        if not date_str:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                "date parameter is required"
            )
            return jsonify(error_payload), 400
        
        # Normalize date
        target_date = normalizer.normalize_input_payload(date_str)
        if isinstance(target_date, str):
            target_date = datetime.fromisoformat(target_date.replace('Z', '+00:00'))
        if target_date.tzinfo is None:
            target_date = target_date.replace(tzinfo=timezone.utc)
        
        # Initialize service
        service = HistoricalDataBusinessService(db_session=db)
        
        # Calculate portfolio state
        result = service.calculate_portfolio_state_at_date(
            user_id=user_id,
            account_id=account_id,
            target_date=target_date,
            include_closed=include_closed
        )
        
        if not result.get('is_valid'):
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                result.get('error', 'Failed to calculate portfolio state')
            )
            return jsonify(error_payload), 500
        
        # Normalize output
        normalized_data = normalizer.normalize_output(result)
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=normalized_data,
            message="Portfolio snapshot retrieved successfully"
        )
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting portfolio snapshot: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Failed to retrieve portfolio snapshot: {str(e)}"
        )
        return jsonify(error_payload), 500


@portfolio_state_bp.route('/series', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=600, dependencies=['executions', 'market_data_quotes', 'trades'])
def get_portfolio_series():
    """
    Get portfolio state series for charts.
    
    Query Parameters:
        account_id (optional): Filter by account ID
        start_date (required): Start date (ISO format)
        end_date (required): End date (ISO format)
        interval (optional): Interval for snapshots ('day', 'week', 'month') - default: 'day'
    
    Returns:
        JSON response with portfolio state series
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
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        interval = request.args.get('interval', 'day')
        
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
        
        # Generate date series based on interval
        dates = []
        current_date = start_date
        
        if interval == 'day':
            while current_date <= end_date:
                dates.append(current_date)
                from datetime import timedelta
                current_date += timedelta(days=1)
        elif interval == 'week':
            while current_date <= end_date:
                dates.append(current_date)
                from datetime import timedelta
                current_date += timedelta(weeks=1)
        elif interval == 'month':
            while current_date <= end_date:
                dates.append(current_date)
                # Move to next month
                if current_date.month == 12:
                    current_date = current_date.replace(year=current_date.year + 1, month=1)
                else:
                    current_date = current_date.replace(month=current_date.month + 1)
        else:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                "interval must be one of: day, week, month"
            )
            return jsonify(error_payload), 400
        
        # Limit to prevent too many snapshots (max 365)
        if len(dates) > 365:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                "Date range too large - maximum 365 snapshots allowed"
            )
            return jsonify(error_payload), 400
        
        # Initialize service
        service = HistoricalDataBusinessService(db_session=db)
        
        # Calculate snapshot series
        result = service.calculate_portfolio_snapshot_series(
            user_id=user_id,
            account_id=account_id,
            dates=dates
        )
        
        if not result.get('is_valid'):
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                result.get('error', 'Failed to calculate portfolio series')
            )
            return jsonify(error_payload), 500
        
        # Normalize output
        normalized_data = normalizer.normalize_output(result)
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=normalized_data,
            message="Portfolio series retrieved successfully"
        )
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting portfolio series: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Failed to retrieve portfolio series: {str(e)}"
        )
        return jsonify(error_payload), 500


@portfolio_state_bp.route('/performance', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=600, dependencies=['executions', 'market_data_quotes', 'trades'])
def get_portfolio_performance():
    """
    Get portfolio performance over a date range.
    
    Query Parameters:
        account_id (optional): Filter by account ID
        start_date (required): Start date (ISO format)
        end_date (required): End date (ISO format)
    
    Returns:
        JSON response with portfolio performance metrics
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
        
        # Calculate performance
        result = service.calculate_portfolio_performance_range(
            user_id=user_id,
            account_id=account_id,
            start_date=start_date,
            end_date=end_date
        )
        
        if not result.get('is_valid'):
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                result.get('error', 'Failed to calculate portfolio performance')
            )
            return jsonify(error_payload), 500
        
        # Normalize output
        normalized_data = normalizer.normalize_output(result)
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=normalized_data,
            message="Portfolio performance retrieved successfully"
        )
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting portfolio performance: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Failed to retrieve portfolio performance: {str(e)}"
        )
        return jsonify(error_payload), 500


@portfolio_state_bp.route('/comparison', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=600, dependencies=['executions', 'market_data_quotes', 'trades'])
def get_portfolio_comparison():
    """
    Compare portfolio state between two dates.
    
    Query Parameters:
        account_id (optional): Filter by account ID
        date1 (required): First date (ISO format)
        date2 (required): Second date (ISO format)
    
    Returns:
        JSON response with portfolio comparison
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
        date1_str = request.args.get('date1')
        date2_str = request.args.get('date2')
        
        if not date1_str or not date2_str:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                "date1 and date2 are required"
            )
            return jsonify(error_payload), 400
        
        # Normalize dates
        date1 = normalizer.normalize_input_payload(date1_str)
        if isinstance(date1, str):
            date1 = datetime.fromisoformat(date1.replace('Z', '+00:00'))
        if date1.tzinfo is None:
            date1 = date1.replace(tzinfo=timezone.utc)
        
        date2 = normalizer.normalize_input_payload(date2_str)
        if isinstance(date2, str):
            date2 = datetime.fromisoformat(date2.replace('Z', '+00:00'))
        if date2.tzinfo is None:
            date2 = date2.replace(tzinfo=timezone.utc)
        
        # Initialize service
        service = HistoricalDataBusinessService(db_session=db)
        
        # Calculate states
        state1 = service.calculate_portfolio_state_at_date(
            user_id=user_id,
            account_id=account_id,
            target_date=date1,
            include_closed=False
        )
        
        state2 = service.calculate_portfolio_state_at_date(
            user_id=user_id,
            account_id=account_id,
            target_date=date2,
            include_closed=False
        )
        
        if not state1.get('is_valid') or not state2.get('is_valid'):
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                "Failed to calculate portfolio states for comparison"
            )
            return jsonify(error_payload), 500
        
        # Calculate comparison
        comparison = {
            'date1': date1.isoformat(),
            'date2': date2.isoformat(),
            'state1': state1,
            'state2': state2,
            'value_change': state2.get('total_value', 0) - state1.get('total_value', 0),
            'value_change_percent': (
                ((state2.get('total_value', 0) - state1.get('total_value', 0)) / state1.get('total_value', 1) * 100)
                if state1.get('total_value', 0) > 0 else 0.0
            ),
            'pl_change': state2.get('total_pl', 0) - state1.get('total_pl', 0)
        }
        
        # Normalize output
        normalized_data = normalizer.normalize_output(comparison)
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=normalized_data,
            message="Portfolio comparison retrieved successfully"
        )
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting portfolio comparison: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Failed to retrieve portfolio comparison: {str(e)}"
        )
        return jsonify(error_payload), 500

