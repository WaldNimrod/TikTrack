"""
Portfolio State API Routes - TikTrack
======================================

This module provides API endpoints for retrieving portfolio state data.

Endpoints:
    GET /api/portfolio-state/snapshot - Get portfolio snapshot at specific date
    GET /api/portfolio-state/series - Get portfolio series for charts
    GET /api/portfolio-state/performance - Get portfolio performance over date range
    GET /api/portfolio-state/comparison - Get portfolio comparison between dates

Author: TikTrack Development Team
Version: 1.0.0
Date: January 2025

Documentation:
- documentation/02-ARCHITECTURE/BACKEND/HISTORICAL_DATA_SERVICE.md
- documentation/03-DEVELOPMENT/PLANS/HISTORICAL_PAGES_FULL_IMPLEMENTATION_PLAN.md
"""

from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
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
    Get portfolio snapshot at a specific date.
    
    Query Parameters:
        date (required): Target date (ISO format)
        account_id (optional): Account ID (default: all accounts)
        include_closed (optional): Include closed positions (default: false)
    
    Returns:
        JSON response with portfolio snapshot data
    """
    normalizer = None
    try:
        db: Session = g.db
        
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            error_payload = BaseEntityUtils.create_error_payload(
                None,
                "User authentication required"
            )
            return jsonify(error_payload), 401
        
        normalizer = BaseEntityUtils.get_request_normalizer(request)
        
        # Parse query parameters
        date_str = request.args.get('date')
        if not date_str:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                "date parameter is required"
            )
            return jsonify(error_payload), 400
        
        account_id = request.args.get('account_id', type=int)
        include_closed = request.args.get('include_closed', 'false').lower() == 'true'
        
        # Normalize date
        target_date = normalizer.normalize_input_payload(date_str)
        if isinstance(target_date, str):
            target_date = datetime.fromisoformat(target_date.replace('Z', '+00:00'))
        if target_date.tzinfo is None:
            target_date = target_date.replace(tzinfo=timezone.utc)
        
        # Validate request
        validation_data = {
            'user_id': user_id,
            'date': target_date,
            'account_id': account_id
        }
        
        service = HistoricalDataBusinessService(db_session=db)
        validation_result = service.validate(validation_data)
        
        if not validation_result['is_valid']:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                f"Validation failed: {', '.join(validation_result['errors'])}"
            )
            return jsonify(error_payload), 400

        # Ensure historical OHLC data exists for relevant tickers (no fallbacks)
        ticker_ids = service.get_user_ticker_ids_in_range(
            user_id=user_id,
            start_date=target_date - timedelta(days=2),
            end_date=target_date + timedelta(days=2),
            account_id=account_id
        )
        if ticker_ids:
            ensure_result = service.ensure_historical_data_for_tickers(
                ticker_ids=ticker_ids,
                start_date=target_date - timedelta(days=2),
                end_date=target_date + timedelta(days=2)
            )
            if not ensure_result.get('is_valid'):
                error_payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    "Missing historical OHLC data; please refresh external data and retry",
                    extra={'missing_tickers': ensure_result.get('failed', [])}
                )
                return jsonify(error_payload), 424  # Failed Dependency
        
        # Get portfolio snapshot
        result = service.calculate_portfolio_state_at_date(
            user_id=user_id,
            account_id=account_id,
            target_date=target_date,
            include_closed=include_closed
        )
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=result
        )
        
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting portfolio snapshot: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Error retrieving portfolio snapshot: {str(e)}"
        )
        return jsonify(error_payload), 500


@portfolio_state_bp.route('/series', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=600, dependencies=['executions', 'market_data_quotes', 'trades'])
def get_portfolio_series():
    """
    Get portfolio series for charts.
    
    Query Parameters:
        start_date (required): Start date (ISO format)
        end_date (required): End date (ISO format)
        interval (optional): Interval ('day', 'week', 'month', default: 'day')
        account_id (optional): Account ID (default: all accounts)
    
    Returns:
        JSON response with portfolio series data
    """
    normalizer = None
    try:
        db: Session = g.db
        
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
        interval = request.args.get('interval', 'day')
        account_id = request.args.get('account_id', type=int)
        
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
            'end_date': end_date,
            'account_id': account_id
        }
        
        service = HistoricalDataBusinessService(db_session=db)
        validation_result = service.validate(validation_data)
        
        if not validation_result['is_valid']:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                f"Validation failed: {', '.join(validation_result['errors'])}"
            )
            return jsonify(error_payload), 400

        # Ensure historical OHLC data exists for relevant tickers (no fallbacks)
        ticker_ids = service.get_user_ticker_ids_in_range(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            account_id=account_id
        )
        if ticker_ids:
            ensure_result = service.ensure_historical_data_for_tickers(
                ticker_ids=ticker_ids,
                start_date=start_date,
                end_date=end_date
            )
            if not ensure_result.get('is_valid'):
                error_payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    "Missing historical OHLC data; please refresh external data and retry",
                    extra={'missing_tickers': ensure_result.get('failed', [])}
                )
                return jsonify(error_payload), 424  # Failed Dependency
        
        # Generate dates list based on interval
        dates = []
        current_date = start_date
        while current_date <= end_date:
            dates.append(current_date)
            if interval == 'day':
                current_date += timedelta(days=1)
            elif interval == 'week':
                current_date += timedelta(weeks=1)
            elif interval == 'month':
                # Approximate month increment
                if current_date.month == 12:
                    current_date = current_date.replace(year=current_date.year + 1, month=1)
                else:
                    current_date = current_date.replace(month=current_date.month + 1)
            else:
                current_date += timedelta(days=1)
        
        # Get portfolio series
        result = service.calculate_portfolio_snapshot_series(
            user_id=user_id,
            account_id=account_id,
            dates=dates,
            interval=interval
        )
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=result,
            extra={'count': result.get('count', 0)}
        )
        
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting portfolio series: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Error retrieving portfolio series: {str(e)}"
        )
        return jsonify(error_payload), 500


@portfolio_state_bp.route('/performance', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=600, dependencies=['executions', 'market_data_quotes', 'trades'])
def get_portfolio_performance():
    """
    Get portfolio performance over date range.
    
    Query Parameters:
        start_date (required): Start date (ISO format)
        end_date (required): End date (ISO format)
        account_id (optional): Account ID (default: all accounts)
    
    Returns:
        JSON response with portfolio performance data
    """
    normalizer = None
    try:
        db: Session = g.db
        
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
        account_id = request.args.get('account_id', type=int)
        
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
            'end_date': end_date,
            'account_id': account_id
        }
        
        service = HistoricalDataBusinessService(db_session=db)
        validation_result = service.validate(validation_data)
        
        if not validation_result['is_valid']:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                f"Validation failed: {', '.join(validation_result['errors'])}"
            )
            return jsonify(error_payload), 400

        # Ensure historical OHLC data exists for relevant tickers (no fallbacks)
        ticker_ids = service.get_user_ticker_ids_in_range(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            account_id=account_id
        )
        if ticker_ids:
            ensure_result = service.ensure_historical_data_for_tickers(
                ticker_ids=ticker_ids,
                start_date=start_date,
                end_date=end_date
            )
            if not ensure_result.get('is_valid'):
                error_payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    "Missing historical OHLC data; please refresh external data and retry",
                    extra={'missing_tickers': ensure_result.get('failed', [])}
                )
                return jsonify(error_payload), 424  # Failed Dependency
        
        # Get portfolio performance
        result = service.calculate_portfolio_performance_range(
            user_id=user_id,
            account_id=account_id,
            start_date=start_date,
            end_date=end_date
        )
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=result
        )
        
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting portfolio performance: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Error retrieving portfolio performance: {str(e)}"
        )
        return jsonify(error_payload), 500


@portfolio_state_bp.route('/comparison', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=600, dependencies=['executions', 'market_data_quotes', 'trades'])
def get_portfolio_comparison():
    """
    Get portfolio comparison between two dates.
    
    Query Parameters:
        date1 (required): First date (ISO format)
        date2 (required): Second date (ISO format)
        account_id (optional): Account ID (default: all accounts)
    
    Returns:
        JSON response with portfolio comparison data
    """
    normalizer = None
    try:
        db: Session = g.db
        
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            error_payload = BaseEntityUtils.create_error_payload(
                None,
                "User authentication required"
            )
            return jsonify(error_payload), 401
        
        normalizer = BaseEntityUtils.get_request_normalizer(request)
        
        # Parse query parameters
        date1_str = request.args.get('date1')
        date2_str = request.args.get('date2')
        account_id = request.args.get('account_id', type=int)
        
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
        
        # Validate request
        validation_data = {
            'user_id': user_id,
            'date': date1,  # Use date1 for validation
            'account_id': account_id
        }
        
        service = HistoricalDataBusinessService(db_session=db)
        validation_result = service.validate(validation_data)
        
        if not validation_result['is_valid']:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                f"Validation failed: {', '.join(validation_result['errors'])}"
            )
            return jsonify(error_payload), 400

        # Ensure historical OHLC data exists for relevant tickers (no fallbacks)
        ticker_ids = service.get_user_ticker_ids_in_range(
            user_id=user_id,
            start_date=min(date1, date2),
            end_date=max(date1, date2),
            account_id=account_id
        )
        if ticker_ids:
            ensure_result = service.ensure_historical_data_for_tickers(
                ticker_ids=ticker_ids,
                start_date=min(date1, date2),
                end_date=max(date1, date2)
            )
            if not ensure_result.get('is_valid'):
                error_payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    "Missing historical OHLC data; please refresh external data and retry",
                    extra={'missing_tickers': ensure_result.get('failed', [])}
                )
                return jsonify(error_payload), 424  # Failed Dependency
        
        # Get portfolio comparison using the dedicated method
        result = service.calculate_portfolio_comparison(
            user_id=user_id,
            account_id=account_id,
            date1=date1,
            date2=date2
        )
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=result
        )
        
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting portfolio comparison: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Error retrieving portfolio comparison: {str(e)}"
        )
        return jsonify(error_payload), 500

