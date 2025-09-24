#!/usr/bin/env python3
"""
Users API Routes - Updated with BaseEntityAPI
Date: September 23, 2025
Description: API endpoints for user management using unified base
"""

from flask import Blueprint, request, jsonify, g
from sqlalchemy.orm import Session
from config.database import get_db
from typing import Dict, Any
import logging

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

# Import user service
from services.user_service import UserService

logger = logging.getLogger(__name__)

# Create blueprint
users_bp = Blueprint('users', __name__, url_prefix='/api/users')

# Initialize base API and user service
user_service = UserService()

# Create a wrapper class for BaseEntityAPI compatibility
class UserServiceWrapper:
    @staticmethod
    def get_all(db):
        return user_service.get_all_users(db)
    
    @staticmethod
    def get_by_id(db, user_id):
        return user_service.get_user_by_id(db, user_id)

base_api = BaseEntityAPI('users', UserServiceWrapper, 'users')

@users_bp.route('/', methods=['GET'])
def get_all_users():
    """Get default user (single user system)"""
    try:
        # Get default user from database
        default_user = user_service.get_default_user()
        if default_user:
            return jsonify({
                "status": "success",
                "data": [default_user],  # Return as array for consistency
                "message": "Default user retrieved successfully",
                "version": "1.0"
            }), 200
        else:
            return jsonify({
                "status": "error",
                "error": {"message": "No default user found"},
                "version": "1.0"
            }), 404
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": {"message": f"Error: {str(e)}"},
            "version": "1.0"
        }), 500

@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id: int):
    """Get default user (single user system) - ignores user_id"""
    try:
        # Get default user from database (ignore user_id for now)
        default_user = user_service.get_default_user()
        if default_user:
            return jsonify({
                "status": "success",
                "data": default_user,
                "message": "Default user retrieved successfully",
                "version": "1.0"
            }), 200
        else:
            return jsonify({
                "status": "error",
                "error": {"message": "No default user found"},
                "version": "1.0"
            }), 404
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": {"message": f"Error: {str(e)}"},
            "version": "1.0"
        }), 500

@users_bp.route('/username/<username>', methods=['GET'])
@api_endpoint(cache_ttl=300, rate_limit=60)
@handle_database_session()
def get_user_by_username(username: str):
    """Get user by username - custom implementation"""
    try:
        db: Session = g.db
        user = user_service.get_user_by_username(username)
        if user:
            return jsonify({
                'status': 'success',
                'data': user
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': f'User with username {username} not found'
            }), 404
    except Exception as e:
        logger.error(f"Error getting user by username {username}: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@users_bp.route('/default', methods=['GET'])
def get_default_user():
    """Get default user"""
    try:
        user = user_service.get_default_user()
        if user:
            return jsonify({
                'status': 'success',
                'data': user
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': 'No default user found'
            }), 404
    except Exception as e:
        logger.error(f"Error getting default user: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@users_bp.route('/', methods=['POST'])
def create_user():
    """Create a new user"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No data provided'
            }), 400
        
        username = data.get('username')
        if not username:
            return jsonify({
                'status': 'error',
                'message': 'Username is required'
            }), 400
        
        user = user_service.create_user(
            username=username,
            email=data.get('email'),
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            is_default=data.get('is_default', False)
        )
        
        if user:
            return jsonify({
                'status': 'success',
                'data': user,
                'message': f'User {username} created successfully'
            }), 201
        else:
            return jsonify({
                'status': 'error',
                'message': f'Failed to create user {username}'
            }), 400
            
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@users_bp.route('/<int:user_id>', methods=['PUT'])
def update_user(user_id: int):
    """Update user"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No data provided'
            }), 400
        
        user = user_service.update_user(user_id, **data)
        if user:
            return jsonify({
                'status': 'success',
                'data': user,
                'message': f'User {user_id} updated successfully'
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': f'User {user_id} not found or update failed'
            }), 404
            
    except Exception as e:
        logger.error(f"Error updating user {user_id}: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@users_bp.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id: int):
    """Delete user (soft delete)"""
    try:
        success = user_service.delete_user(user_id)
        if success:
            return jsonify({
                'status': 'success',
                'message': f'User {user_id} deleted successfully'
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': f'User {user_id} not found or cannot be deleted'
            }), 404
            
    except Exception as e:
        logger.error(f"Error deleting user {user_id}: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@users_bp.route('/<int:user_id>/preferences', methods=['GET'])
def get_user_preferences(user_id: int):
    """Get user preferences"""
    try:
        preferences = user_service.get_user_preferences(user_id)
        return jsonify({
            'status': 'success',
            'data': preferences,
            'count': len(preferences)
        }), 200
    except Exception as e:
        logger.error(f"Error getting preferences for user {user_id}: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@users_bp.route('/<int:user_id>/preferences', methods=['POST'])
def set_user_preferences(user_id: int):
    """Set user preferences"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No preferences data provided'
            }), 400
        
        success = user_service.set_user_preferences(user_id, data)
        if success:
            return jsonify({
                'status': 'success',
                'message': f'Preferences for user {user_id} updated successfully'
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': f'Failed to update preferences for user {user_id}'
            }), 400
            
    except Exception as e:
        logger.error(f"Error setting preferences for user {user_id}: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@users_bp.route('/<int:user_id>/statistics', methods=['GET'])
def get_user_statistics(user_id: int):
    """Get user statistics"""
    try:
        stats = user_service.get_user_statistics(user_id)
        if stats:
            return jsonify({
                'status': 'success',
                'data': stats
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': f'User {user_id} not found'
            }), 404
    except Exception as e:
        logger.error(f"Error getting statistics for user {user_id}: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500