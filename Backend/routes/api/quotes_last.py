#!/usr/bin/env python3
"""
Quotes Last API Routes
Date: October 30, 2025
Description: API routes for managing last quotes data
Updated: 16 November 2025 - Migrated to SQLAlchemy models
"""

from flask import Blueprint, request, jsonify, g
from sqlalchemy.orm import Session
from typing import Dict, Any
import logging

from config.database import get_db
from models.quotes_last import QuotesLast
from services.date_normalization_service import DateNormalizationService
from services.preferences_service import PreferencesService
from routes.api.base_entity_decorators import handle_database_session

logger = logging.getLogger(__name__)

# Create blueprint
quotes_last_bp = Blueprint('quotes_last', __name__, url_prefix='/api/quotes-last')


def _get_date_normalizer() -> DateNormalizationService:
    """Get date normalization service with user preferences"""
    try:
        # Get user_id from Flask context (set by auth middleware)
        user_id = getattr(g, 'user_id', None) or 1  # Fallback to default user
        preferences_service = PreferencesService()
        profile_context = preferences_service.build_profile_context(user_id)
        timezone_name = profile_context.get('versions', {}).get('timezone', {}).get('saved_value', 'UTC')
        return DateNormalizationService(timezone_name)
    except Exception as e:
        logger.warning(f"Error getting date normalizer, using UTC: {e}")
        return DateNormalizationService('UTC')


@quotes_last_bp.route('/', methods=['GET'])
@handle_database_session()
def get_quotes_last():
    """Get all last quotes (requires authentication)"""
    db: Session = g.db
    
    # Get user_id from Flask context (set by auth middleware)
    user_id = getattr(g, 'user_id', None)
    
    if user_id is None:
        return jsonify({
            'status': 'error',
            'message': 'User authentication required',
            'version': '1.0'
        }), 401
    
    try:
        # Quotes are system-wide (shared), but require authentication
        quotes = db.query(QuotesLast).order_by(QuotesLast.id).all()
        
        # Convert to list of dictionaries
        result = [quote.to_dict() for quote in quotes]
        
        # Normalize dates
        normalizer = _get_date_normalizer()
        result = normalizer.normalize_output(result)
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved {len(result)} quotes_last records',
            'data': result,
            'count': len(result),
            'version': '1.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting quotes last: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving quotes last: {str(e)}',
            'version': '1.0'
        }), 500


@quotes_last_bp.route('/<int:quote_id>', methods=['GET'])
@handle_database_session()
def get_quote_last(quote_id):
    """Get a specific last quote by ID (requires authentication)"""
    db: Session = g.db
    
    # Get user_id from Flask context (set by auth middleware)
    user_id = getattr(g, 'user_id', None)
    
    if user_id is None:
        return jsonify({
            'status': 'error',
            'message': 'User authentication required',
            'version': '1.0'
        }), 401
    
    try:
        # Quotes are system-wide (shared), but require authentication
        quote = db.query(QuotesLast).filter(QuotesLast.id == quote_id).first()
        
        if not quote:
            return jsonify({
                'status': 'error',
                'message': f'Last quote with ID {quote_id} not found',
                'version': '1.0'
            }), 404
        
        # Convert to dictionary and normalize dates
        result = quote.to_dict()
        normalizer = _get_date_normalizer()
        result = normalizer.normalize_output([result])[0]
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved last quote {quote_id}',
            'data': result,
            'version': '1.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting last quote {quote_id}: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving last quote: {str(e)}',
            'version': '1.0'
        }), 500

