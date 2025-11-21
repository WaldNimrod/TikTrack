#!/usr/bin/env python3
"""
Preference Groups API Routes
Date: October 30, 2025
Description: API routes for managing preference groups
Updated: 17 November 2025 - Migrated to SQLAlchemy
"""

from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from config.database import get_db
from models.preferences import PreferenceGroup
from services.advanced_cache_service import cache_for
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Create blueprint
preference_groups_bp = Blueprint('preference_groups', __name__, url_prefix='/api/preference-groups')

@preference_groups_bp.route('/', methods=['GET'])
@cache_for(ttl=600)  # Cache for 10 minutes - preference groups don't change often
def get_preference_groups():
    """Get all preference groups using SQLAlchemy"""
    db: Session = next(get_db())
    try:
        groups = db.query(PreferenceGroup).order_by(PreferenceGroup.id).all()
        
        # Convert to list of dictionaries
        result = []
        for group in groups:
            group_dict = {
                'id': group.id,
                'group_name': group.group_name,
                'description': group.description,
                'created_at': group.created_at.isoformat() if group.created_at else None
            }
            result.append(group_dict)
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved {len(result)} preference_groups records',
            'data': result,
            'count': len(result),
            'version': '1.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting preference groups: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving preference groups: {str(e)}',
            'version': '1.0'
        }), 500
    finally:
        db.close()

@preference_groups_bp.route('/<int:group_id>', methods=['GET'])
@cache_for(ttl=600)
def get_preference_group(group_id):
    """Get a specific preference group by ID using SQLAlchemy"""
    db: Session = next(get_db())
    try:
        group = db.query(PreferenceGroup).filter(PreferenceGroup.id == group_id).first()
        
        if not group:
            return jsonify({
                'status': 'error',
                'message': f'Preference group with ID {group_id} not found',
                'version': '1.0'
            }), 404
        
        group_dict = {
            'id': group.id,
            'group_name': group.group_name,
            'description': group.description,
            'created_at': group.created_at.isoformat() if group.created_at else None
        }
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved preference group {group_id}',
            'data': group_dict,
            'version': '1.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting preference group {group_id}: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving preference group: {str(e)}',
            'version': '1.0'
        }), 500
    finally:
        db.close()
