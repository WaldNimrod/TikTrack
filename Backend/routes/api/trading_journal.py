"""
Trading Journal API Routes - TikTrack
======================================

This module provides API endpoints for retrieving trading journal data.

Endpoints:
    GET /api/trading-journal/entries - Get journal entries for date range
    GET /api/trading-journal/statistics - Get journal statistics
    GET /api/trading-journal/calendar - Get calendar data for specific month
    GET /api/trading-journal/by-entity - Get entries by entity type and ID

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

trading_journal_bp = Blueprint('trading_journal', __name__, url_prefix='/api/trading-journal')


@trading_journal_bp.route('/entries', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=180, dependencies=['notes', 'trades', 'executions'])
def get_journal_entries():
    """
    Get journal entries for a date range.
    
    Query Parameters:
        start_date (required): Start date (ISO format)
        end_date (required): End date (ISO format)
        entity_type (optional): Entity type ('trade', 'execution', 'note', 'all', default: 'all')
        entity_id (optional): Entity ID
    
    Returns:
        JSON response with journal entries data
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
        entity_type = request.args.get('entity_type', 'all')
        entity_id = request.args.get('entity_id', type=int)
        ticker_symbol = request.args.get('ticker_symbol')
        
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
        
        # Build entity types list
        entity_types = None
        if entity_type and entity_type != 'all':
            entity_types = [entity_type]
        
        # Get journal entries
        result = service.aggregate_journal_entries(
            user_id=user_id,
            date_range={
                'start_date': start_date,
                'end_date': end_date
            },
            entity_types=entity_types
        )
        
        # Filter by entity_id if provided
        if entity_id and result.get('entries'):
            result['entries'] = [
                entry for entry in result['entries']
                if entry.get('entity_id') == entity_id
            ]
        
        # Filter by ticker_symbol if provided
        if ticker_symbol and result.get('entries'):
            result['entries'] = [
                entry for entry in result['entries']
                if entry.get('ticker_symbol') == ticker_symbol
            ]
            result['count'] = len(result['entries'])
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=result,
            extra={'count': result.get('count', 0)}
        )
        
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting journal entries: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Error retrieving journal entries: {str(e)}"
        )
        return jsonify(error_payload), 500


@trading_journal_bp.route('/statistics', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=180, dependencies=['notes', 'trades', 'executions'])
def get_journal_statistics():
    """
    Get journal statistics.
    
    Query Parameters:
        start_date (required): Start date (ISO format)
        end_date (required): End date (ISO format)
        entity_type (optional): Entity type filter
        period (optional): Period filter
    
    Returns:
        JSON response with journal statistics
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
        entity_type = request.args.get('entity_type')
        period = request.args.get('period')
        
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
        
        # Get journal statistics
        result = service.calculate_journal_statistics(
            user_id=user_id,
            date_range={
                'start_date': start_date,
                'end_date': end_date
            },
            entity_type=entity_type
        )
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=result
        )
        
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting journal statistics: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Error retrieving journal statistics: {str(e)}"
        )
        return jsonify(error_payload), 500


@trading_journal_bp.route('/calendar', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=180, dependencies=['notes', 'trades', 'executions'])
def get_journal_calendar():
    """
    Get calendar data for a specific month.
    
    Query Parameters:
        month (required): Month (1-12)
        year (required): Year (e.g., 2025)
        entity_type (optional): Entity type filter
    
    Returns:
        JSON response with calendar data
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
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        entity_type = request.args.get('entity_type')
        
        if not month or not year:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                "month and year are required"
            )
            return jsonify(error_payload), 400
        
        if month < 1 or month > 12:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                "month must be between 1 and 12"
            )
            return jsonify(error_payload), 400
        
        # Calculate date range for the month
        start_date = datetime(year, month, 1, tzinfo=timezone.utc)
        if month == 12:
            end_date = datetime(year + 1, 1, 1, tzinfo=timezone.utc) - timedelta(days=1)
        else:
            end_date = datetime(year, month + 1, 1, tzinfo=timezone.utc) - timedelta(days=1)
        
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
        
        # Build entity types list
        entity_types = None
        if entity_type and entity_type != 'all':
            entity_types = [entity_type]
        
        # Get journal entries for the month
        result = service.aggregate_journal_entries(
            user_id=user_id,
            date_range={
                'start_date': start_date,
                'end_date': end_date
            },
            entity_types=entity_types
        )
        
        # Group entries by day for calendar display
        entries_by_day = {}
        for entry in result.get('entries', []):
            entry_date = entry.get('date') or entry.get('created_at')
            if entry_date:
                if isinstance(entry_date, str):
                    entry_date = datetime.fromisoformat(entry_date.replace('Z', '+00:00'))
                day_key = entry_date.strftime('%Y-%m-%d')
                if day_key not in entries_by_day:
                    entries_by_day[day_key] = []
                entries_by_day[day_key].append(entry)
        
        calendar_result = {
            'month': month,
            'year': year,
            'entries_by_day': entries_by_day,
            'total_entries': result.get('count', 0),
            'is_valid': True
        }
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=calendar_result
        )
        
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting journal calendar: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Error retrieving journal calendar: {str(e)}"
        )
        return jsonify(error_payload), 500


@trading_journal_bp.route('/by-entity', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=180, dependencies=['notes', 'trades', 'executions'])
def get_journal_by_entity():
    """
    Get journal entries by entity type and ID.
    
    Query Parameters:
        entity_type (required): Entity type ('trade', 'execution', 'note')
        entity_id (required): Entity ID
        start_date (optional): Start date filter (ISO format)
        end_date (optional): End date filter (ISO format)
    
    Returns:
        JSON response with journal entries for the entity
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
        entity_type = request.args.get('entity_type')
        entity_id = request.args.get('entity_id', type=int)
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        if not entity_type or not entity_id:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                "entity_type and entity_id are required"
            )
            return jsonify(error_payload), 400
        
        # Normalize dates if provided
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
        
        # If no date range provided, use a wide range (last year)
        if not start_date or not end_date:
            end_date = datetime.now(timezone.utc)
            start_date = end_date - timedelta(days=365)
        
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
        
        # Get journal entries filtered by entity
        result = service.aggregate_journal_entries(
            user_id=user_id,
            date_range={
                'start_date': start_date,
                'end_date': end_date
            },
            entity_types=[entity_type]
        )
        
        # Filter by entity_id
        if result.get('entries'):
            result['entries'] = [
                entry for entry in result['entries']
                if entry.get('entity_id') == entity_id
            ]
            result['count'] = len(result['entries'])
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=result,
            extra={'count': result.get('count', 0)}
        )
        
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting journal by entity: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Error retrieving journal by entity: {str(e)}"
        )
        return jsonify(error_payload), 500


@trading_journal_bp.route('/activity-stats', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=180, dependencies=['notes', 'trades', 'executions'])
def get_activity_stats():
    """
    Get activity statistics for a date range.
    
    Query Parameters:
        start_date (required): Start date (ISO format)
        end_date (required): End date (ISO format)
        view_mode (optional): 'daily' or 'weekly' (default: 'daily')
        entity_type (optional): Entity type filter ('trade', 'execution', 'note', 'all', default: 'all')
        ticker_symbol (optional): Ticker symbol filter
    
    Returns:
        JSON response with activity statistics
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
        view_mode = request.args.get('view_mode', 'daily')
        entity_type = request.args.get('entity_type', 'all')
        ticker_symbol = request.args.get('ticker_symbol')
        
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
        
        # Validate view_mode
        if view_mode not in ['daily', 'weekly']:
            view_mode = 'daily'
        
        service = HistoricalDataBusinessService(db_session=db)
        
        # Get activity statistics
        result = service.calculate_activity_stats(
            user_id=user_id,
            date_range={
                'start_date': start_date,
                'end_date': end_date
            },
            view_mode=view_mode,
            entity_type=entity_type if entity_type != 'all' else None,
            ticker_symbol=ticker_symbol
        )
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=result
        )
        
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error in get_activity_stats: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Error retrieving activity stats: {str(e)}"
        )
        return jsonify(error_payload), 500

