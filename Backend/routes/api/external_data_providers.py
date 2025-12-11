#!/usr/bin/env python3
"""
External Data Providers API Routes
Date: October 30, 2025
Description: API routes for managing external data providers
Updated: 17 November 2025 - Migrated to SQLAlchemy
"""

from flask import Blueprint, request, jsonify, g
from sqlalchemy.orm import Session
from config.database import get_db
from models.external_data import ExternalDataProvider
from services.advanced_cache_service import cache_for
from routes.api.base_entity_decorators import handle_database_session
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Create blueprint
external_data_providers_bp = Blueprint('external_data_providers', __name__, url_prefix='/api/external-data-providers')

@external_data_providers_bp.route('/', methods=['GET'])
@handle_database_session()
@cache_for(ttl=600)  # Cache for 10 minutes - providers don't change often
def get_external_data_providers():
    """Get all external data providers using SQLAlchemy (requires authentication)"""
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
        # External data providers are system-wide (shared), but require authentication
        providers = db.query(ExternalDataProvider).order_by(ExternalDataProvider.id).all()
        
        # Convert to list of dictionaries
        result = []
        for provider in providers:
            provider_dict = {
                'id': provider.id,
                'name': provider.name,
                'display_name': provider.display_name,
                'is_active': provider.is_active,
                'provider_type': provider.provider_type,
                'api_key': provider.api_key,
                'base_url': provider.base_url,
                'rate_limit_per_hour': provider.rate_limit_per_hour,
                'timeout_seconds': provider.timeout_seconds,
                'retry_attempts': provider.retry_attempts,
                'cache_ttl_hot': provider.cache_ttl_hot,
                'cache_ttl_warm': provider.cache_ttl_warm,
                'max_symbols_per_batch': provider.max_symbols_per_batch,
                'preferred_batch_size': provider.preferred_batch_size,
                'last_successful_request': provider.last_successful_request.isoformat() if provider.last_successful_request else None,
                'last_error': provider.last_error,
                'error_count': provider.error_count,
                'is_healthy': provider.is_healthy,
                'created_at': provider.created_at.isoformat() if provider.created_at else None,
                'updated_at': provider.updated_at.isoformat() if provider.updated_at else None
            }
            result.append(provider_dict)
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved {len(result)} external_data_providers records',
            'data': result,
            'count': len(result),
            'version': '1.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting external data providers: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving external data providers: {str(e)}',
            'version': '1.0'
        }), 500

@external_data_providers_bp.route('/<int:provider_id>', methods=['GET'])
@handle_database_session()
@cache_for(ttl=600)
def get_external_data_provider(provider_id):
    """Get a specific external data provider by ID using SQLAlchemy (requires authentication)"""
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
        # External data providers are system-wide (shared), but require authentication
        provider = db.query(ExternalDataProvider).filter(ExternalDataProvider.id == provider_id).first()
        
        if not provider:
            return jsonify({
                'status': 'error',
                'message': f'External data provider with ID {provider_id} not found',
                'version': '1.0'
            }), 404
        
        provider_dict = {
            'id': provider.id,
            'name': provider.name,
            'display_name': provider.display_name,
            'is_active': provider.is_active,
            'provider_type': provider.provider_type,
            'api_key': provider.api_key,
            'base_url': provider.base_url,
            'rate_limit_per_hour': provider.rate_limit_per_hour,
            'timeout_seconds': provider.timeout_seconds,
            'retry_attempts': provider.retry_attempts,
            'cache_ttl_hot': provider.cache_ttl_hot,
            'cache_ttl_warm': provider.cache_ttl_warm,
            'max_symbols_per_batch': provider.max_symbols_per_batch,
            'preferred_batch_size': provider.preferred_batch_size,
            'last_successful_request': provider.last_successful_request.isoformat() if provider.last_successful_request else None,
            'last_error': provider.last_error,
            'error_count': provider.error_count,
            'is_healthy': provider.is_healthy,
            'created_at': provider.created_at.isoformat() if provider.created_at else None,
            'updated_at': provider.updated_at.isoformat() if provider.updated_at else None
        }
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved external data provider {provider_id}',
            'data': provider_dict,
            'version': '1.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting external data provider {provider_id}: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving external data provider: {str(e)}',
            'version': '1.0'
        }), 500
