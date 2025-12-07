"""
Trading Journal API Routes - TikTrack
=======================================

This module provides API endpoints for retrieving trading journal data.

Endpoints:
    GET /api/trading-journal/entries - Get journal entries
    GET /api/trading-journal/statistics - Get journal statistics
    GET /api/trading-journal/calendar - Get calendar data
    GET /api/trading-journal/by-entity - Get entries by entity

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

trading_journal_bp = Blueprint('trading_journal', __name__, url_prefix='/api/trading-journal')


@trading_journal_bp.route('/entries', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=180, dependencies=['notes', 'trades', 'executions'])
def get_journal_entries():
    """
    Get journal entries (notes, trades, executions) for a date range.
    
    Query Parameters:
        start_date (required): Start date (ISO format)
        end_date (required): End date (ISO format)
        entity_type (optional): Filter by entity type ('trade', 'execution', 'note', 'all') - default: 'all'
        entity_id (optional): Filter by specific entity ID
    
    Returns:
        JSON response with journal entries
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
        entity_type = request.args.get('entity_type', 'all')
        entity_id = request.args.get('entity_id', type=int)
        
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
        
        # Parse entity types
        if entity_type == 'all':
            entity_types = ['trade', 'execution', 'note']
        else:
            entity_types = [entity_type]
        
        # Initialize service
        service = HistoricalDataBusinessService(db_session=db)
        
        # Aggregate journal entries
        result = service.aggregate_journal_entries(
            user_id=user_id,
            date_range={
                'start_date': start_date,
                'end_date': end_date
            },
            entity_types=entity_types
        )
        
        if not result.get('is_valid'):
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                result.get('error', 'Failed to aggregate journal entries')
            )
            return jsonify(error_payload), 500
        
        # Filter by entity_id if provided
        entries = result.get('entries', [])
        if entity_id:
            entries = [e for e in entries if e.get('id') == entity_id]
        
        result['entries'] = entries
        result['count'] = len(entries)
        
        # Normalize output
        normalized_data = normalizer.normalize_output(result)
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=normalized_data,
            message="Journal entries retrieved successfully"
        )
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting journal entries: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Failed to retrieve journal entries: {str(e)}"
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
        entity_type (optional): Filter by entity type
        period (optional): Period filter ('day', 'week', 'month', 'year')
    
    Returns:
        JSON response with journal statistics
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
        entity_type = request.args.get('entity_type', 'all')
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
        
        # Parse entity types
        if entity_type == 'all':
            entity_types = ['trade', 'execution', 'note']
        else:
            entity_types = [entity_type]
        
        # Initialize service
        service = HistoricalDataBusinessService(db_session=db)
        
        # Get entries
        entries_result = service.aggregate_journal_entries(
            user_id=user_id,
            date_range={
                'start_date': start_date,
                'end_date': end_date
            },
            entity_types=entity_types
        )
        
        if not entries_result.get('is_valid'):
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                entries_result.get('error', 'Failed to get journal entries')
            )
            return jsonify(error_payload), 500
        
        entries = entries_result.get('entries', [])
        
        # Calculate statistics
        stats_result = service.calculate_journal_statistics(
            entries=entries,
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
            message="Journal statistics retrieved successfully"
        )
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting journal statistics: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Failed to retrieve journal statistics: {str(e)}"
        )
        return jsonify(error_payload), 500


@trading_journal_bp.route('/calendar', methods=['GET'])
@handle_database_session()
@cache_with_deps(ttl=180, dependencies=['notes', 'trades', 'executions'])
def get_journal_calendar():
    """
    Get journal calendar data for a specific month.
    
    Query Parameters:
        month (required): Month (1-12)
        year (required): Year (e.g., 2025)
        entity_type (optional): Filter by entity type
    
    Returns:
        JSON response with calendar data
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
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        entity_type = request.args.get('entity_type', 'all')
        
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
        from datetime import date as date_class
        start_date = datetime(year, month, 1, tzinfo=timezone.utc)
        
        # Get last day of month
        if month == 12:
            end_date = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
        else:
            end_date = datetime(year, month + 1, 1, tzinfo=timezone.utc)
        
        # Subtract 1 second to get last moment of the month
        from datetime import timedelta
        end_date = end_date - timedelta(seconds=1)
        
        # Parse entity types
        if entity_type == 'all':
            entity_types = ['trade', 'execution', 'note']
        else:
            entity_types = [entity_type]
        
        # Initialize service
        service = HistoricalDataBusinessService(db_session=db)
        
        # Get entries for the month
        result = service.aggregate_journal_entries(
            user_id=user_id,
            date_range={
                'start_date': start_date,
                'end_date': end_date
            },
            entity_types=entity_types
        )
        
        if not result.get('is_valid'):
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                result.get('error', 'Failed to get journal entries')
            )
            return jsonify(error_payload), 500
        
        # Group entries by day
        entries_by_day = {}
        for entry in result.get('entries', []):
            entry_date = entry.get('date')
            if isinstance(entry_date, str):
                entry_date = datetime.fromisoformat(entry_date.replace('Z', '+00:00'))
            if isinstance(entry_date, datetime):
                day_key = entry_date.strftime('%Y-%m-%d')
                if day_key not in entries_by_day:
                    entries_by_day[day_key] = []
                entries_by_day[day_key].append(entry)
        
        calendar_data = {
            'month': month,
            'year': year,
            'entries_by_day': entries_by_day,
            'total_entries': len(result.get('entries', []))
        }
        
        # Normalize output
        normalized_data = normalizer.normalize_output(calendar_data)
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=normalized_data,
            message="Journal calendar data retrieved successfully"
        )
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting journal calendar: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Failed to retrieve journal calendar: {str(e)}"
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
        
        if entity_type not in ['trade', 'execution', 'note']:
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                "entity_type must be one of: trade, execution, note"
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
            from datetime import timedelta
            end_date = datetime.now(timezone.utc)
            start_date = end_date - timedelta(days=365)
        
        # Initialize service
        service = HistoricalDataBusinessService(db_session=db)
        
        # Get entries
        result = service.aggregate_journal_entries(
            user_id=user_id,
            date_range={
                'start_date': start_date,
                'end_date': end_date
            },
            entity_types=[entity_type]
        )
        
        if not result.get('is_valid'):
            error_payload = BaseEntityUtils.create_error_payload(
                normalizer,
                result.get('error', 'Failed to get journal entries')
            )
            return jsonify(error_payload), 500
        
        # Filter by entity_id
        entries = [e for e in result.get('entries', []) if e.get('id') == entity_id]
        
        result['entries'] = entries
        result['count'] = len(entries)
        
        # Normalize output
        normalized_data = normalizer.normalize_output(result)
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=normalized_data,
            message="Journal entries by entity retrieved successfully"
        )
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting journal entries by entity: {str(e)}", exc_info=True)
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f"Failed to retrieve journal entries by entity: {str(e)}"
        )
        return jsonify(error_payload), 500

