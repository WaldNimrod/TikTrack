"""
Users API - TikTrack

This module provides API endpoints for managing users.
Supports multi-user system with fallback to default user.

Author: TikTrack Development Team
Version: 1.0
Date: August 2025
"""

from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from config.database import get_db
from services.user_service import UserService
from models.user import User
from services.advanced_cache_service import cache_for, invalidate_cache

# Create blueprint
users_bp = Blueprint('users', __name__)

@users_bp.route('/api/v1/users/', methods=['GET'])
@cache_for(ttl=300)  # Cache for 5 minutes - users don't change frequently
def get_users():
    """Get all users"""
    try:
        db: Session = next(get_db())
        users = UserService.get_all_users(db)
        
        return jsonify({
            "success": True,
            "data": [user.to_dict() for user in users],
            "count": len(users)
        })
    except Exception as e:
        print(f"❌ Error getting users: {e}")
        return jsonify({"success": False, "message": "Error getting users"}), 500

@users_bp.route('/api/v1/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get user by ID with fallback to default user"""
    try:
        db: Session = next(get_db())
        user = UserService.get_user_by_id(db, user_id)
        
        if user:
            return jsonify({
                "success": True,
                "data": user.to_dict()
            })
        else:
            return jsonify({"success": False, "message": "User not found"}), 404
    except Exception as e:
        print(f"❌ Error getting user {user_id}: {e}")
        return jsonify({"success": False, "message": "Error getting user"}), 500

@users_bp.route('/api/v1/users/default', methods=['GET'])
def get_default_user():
    """Get default user"""
    try:
        db: Session = next(get_db())
        default_user = UserService.get_default_user(db)
        
        if default_user:
            return jsonify({
                "success": True,
                "data": default_user.to_dict()
            })
        else:
            return jsonify({"success": False, "message": "Default user not found"}), 404
    except Exception as e:
        print(f"❌ Error getting default user: {e}")
        return jsonify({"success": False, "message": "Error getting default user"}), 500

@users_bp.route('/api/v1/users/current', methods=['GET'])
def get_current_user():
    """Get current user (for now returns default user)"""
    try:
        db: Session = next(get_db())
        current_user_id = UserService.get_current_user_id()
        user = UserService.get_user_by_id(db, current_user_id)
        
        if user:
            return jsonify({
                "success": True,
                "data": user.to_dict()
            })
        else:
            return jsonify({"success": False, "message": "Current user not found"}), 404
    except Exception as e:
        print(f"❌ Error getting current user: {e}")
        return jsonify({"success": False, "message": "Error getting current user"}), 500

@users_bp.route('/api/v1/users/', methods=['POST'])
def create_user():
    """Create new user"""
    try:
        db: Session = next(get_db())
        user_data = request.json
        
        if not user_data:
            return jsonify({"success": False, "message": "User data is required"}), 400
        
        # Validate user data
        validation = UserService.validate_user_data(user_data)
        if not validation['is_valid']:
            return jsonify({
                "success": False, 
                "message": "Invalid user data",
                "errors": validation['errors']
            }), 400
        
        # Check if username already exists
        existing_user = UserService.get_user_by_username(db, user_data.get('username', ''))
        if existing_user:
            return jsonify({"success": False, "message": "Username already exists"}), 409
        
        # Create new user
        new_user = User(
            username=user_data.get('username'),
            email=user_data.get('email'),
            first_name=user_data.get('first_name'),
            last_name=user_data.get('last_name'),
            is_active=user_data.get('is_active', True),
            is_default=user_data.get('is_default', False),
            preferences=user_data.get('preferences', '{}')
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return jsonify({
            "success": True,
            "message": "User created successfully",
            "data": new_user.to_dict()
        }), 201
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        db.rollback()
        return jsonify({"success": False, "message": "Error creating user"}), 500

@users_bp.route('/api/v1/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Update user"""
    try:
        db: Session = next(get_db())
        user = UserService.get_user_by_id(db, user_id)
        
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404
        
        user_data = request.json
        if not user_data:
            return jsonify({"success": False, "message": "User data is required"}), 400
        
        # Update user fields
        if 'username' in user_data:
            # Check if new username already exists
            existing_user = UserService.get_user_by_username(db, user_data['username'])
            if existing_user and existing_user.id != user_id:
                return jsonify({"success": False, "message": "Username already exists"}), 409
            user.username = user_data['username']
        
        if 'email' in user_data:
            user.email = user_data['email']
        
        if 'first_name' in user_data:
            user.first_name = user_data['first_name']
        
        if 'last_name' in user_data:
            user.last_name = user_data['last_name']
        
        if 'is_active' in user_data:
            user.is_active = user_data['is_active']
        
        if 'is_default' in user_data:
            user.is_default = user_data['is_default']
        
        if 'preferences' in user_data:
            user.set_preferences(user_data['preferences'])
        
        db.commit()
        db.refresh(user)
        
        return jsonify({
            "success": True,
            "message": "User updated successfully",
            "data": user.to_dict()
        })
        
    except Exception as e:
        print(f"❌ Error updating user {user_id}: {e}")
        db.rollback()
        return jsonify({"success": False, "message": "Error updating user"}), 500

@users_bp.route('/api/v1/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete user (soft delete by setting is_active=False)"""
    try:
        db: Session = next(get_db())
        user = UserService.get_user_by_id(db, user_id)
        
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404
        
        # Don't allow deleting default user
        if user.is_default:
            return jsonify({"success": False, "message": "Cannot delete default user"}), 400
        
        # Soft delete by setting is_active=False
        user.is_active = False
        db.commit()
        
        return jsonify({
            "success": True,
            "message": "User deleted successfully"
        })
        
    except Exception as e:
        print(f"❌ Error deleting user {user_id}: {e}")
        db.rollback()
        return jsonify({"success": False, "message": "Error deleting user"}), 500

@users_bp.route('/api/v1/users/ensure-default', methods=['POST'])
def ensure_default_user():
    """Ensure default user exists in database"""
    try:
        db: Session = next(get_db())
        default_user = UserService.ensure_default_user_exists(db)
        
        return jsonify({
            "success": True,
            "message": "Default user ensured",
            "data": default_user.to_dict()
        })
        
    except Exception as e:
        print(f"❌ Error ensuring default user: {e}")
        return jsonify({"success": False, "message": "Error ensuring default user"}), 500
