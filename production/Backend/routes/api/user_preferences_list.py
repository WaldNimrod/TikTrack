#!/usr/bin/env python3
"""
User Preferences List API Routes
Date: October 30, 2025
Description: API routes for listing all user preferences from database table
Updated: 17 November 2025 - Migrated to SQLAlchemy
"""

from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from config.database import get_db
from models.preferences import UserPreference
from routes.api.base_entity_decorators import require_authentication
from services.advanced_cache_service import cache_for
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Create blueprint
user_preferences_list_bp = Blueprint('user_preferences_list', __name__, url_prefix='/api/user-preferences')

@user_preferences_list_bp.route('/', methods=['GET'])
@require_authentication()
@cache_for(ttl=300)  # Cache for 5 minutes
def get_user_preferences():
    """Get all user preferences using SQLAlchemy"""
    db: Session = next(get_db())
    try:
        preferences = db.query(UserPreference).order_by(UserPreference.id).all()
        
        # Convert to list of dictionaries
        result = []
        for pref in preferences:
            pref_dict = {
                'id': pref.id,
                'user_id': pref.user_id,
                'profile_id': pref.profile_id,
                'preference_id': pref.preference_id,
                'saved_value': pref.saved_value,
                'created_at': pref.created_at.isoformat() if pref.created_at else None,
                'updated_at': pref.updated_at.isoformat() if pref.updated_at else None
            }
            result.append(pref_dict)
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved {len(result)} user_preferences records',
            'data': result,
            'count': len(result),
            'version': '1.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting user preferences: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving user preferences: {str(e)}',
            'version': '1.0'
        }), 500
    finally:
        db.close()
