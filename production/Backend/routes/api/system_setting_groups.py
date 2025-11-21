#!/usr/bin/env python3
"""
System Setting Groups API Routes
Date: October 30, 2025
Description: API routes for managing system setting groups
Updated: 17 November 2025 - Migrated to SQLAlchemy
"""

from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from config.database import get_db
from models.system_settings import SystemSettingGroup
from services.advanced_cache_service import cache_for
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Create blueprint
system_setting_groups_bp = Blueprint('system_setting_groups', __name__, url_prefix='/api/system-setting-groups')

@system_setting_groups_bp.route('/', methods=['GET'])
@cache_for(ttl=600)  # Cache for 10 minutes - system settings don't change often
def get_system_setting_groups():
    """Get all system setting groups using SQLAlchemy"""
    db: Session = next(get_db())
    try:
        groups = db.query(SystemSettingGroup).order_by(SystemSettingGroup.id).all()
        
        # Convert to list of dictionaries
        result = []
        for group in groups:
            group_dict = {
                'id': group.id,
                'name': group.name,
                'description': group.description,
                'created_at': group.created_at.isoformat() if group.created_at else None,
                'updated_at': group.updated_at.isoformat() if group.updated_at else None
            }
            result.append(group_dict)
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved {len(result)} system_setting_groups records',
            'data': result,
            'count': len(result),
            'version': '1.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting system setting groups: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving system setting groups: {str(e)}',
            'version': '1.0'
        }), 500
    finally:
        db.close()

@system_setting_groups_bp.route('/<int:group_id>', methods=['GET'])
@cache_for(ttl=600)
def get_system_setting_group(group_id):
    """Get a specific system setting group by ID using SQLAlchemy"""
    db: Session = next(get_db())
    try:
        group = db.query(SystemSettingGroup).filter(SystemSettingGroup.id == group_id).first()
        
        if not group:
            return jsonify({
                'status': 'error',
                'message': f'System setting group with ID {group_id} not found',
                'version': '1.0'
            }), 404
        
        group_dict = {
            'id': group.id,
            'name': group.name,
            'description': group.description,
            'created_at': group.created_at.isoformat() if group.created_at else None,
            'updated_at': group.updated_at.isoformat() if group.updated_at else None
        }
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved system setting group {group_id}',
            'data': group_dict,
            'version': '1.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting system setting group {group_id}: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving system setting group: {str(e)}',
            'version': '1.0'
        }), 500
    finally:
        db.close()
