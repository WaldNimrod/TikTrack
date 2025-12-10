#!/usr/bin/env python3
"""
Authentication API Routes - User registration and login
"""

from flask import Blueprint, request, jsonify, current_app, g
from typing import Dict, Any
import logging
from datetime import datetime
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

from services.auth_service import AuthService
from services.password_reset_service import PasswordResetService

logger = logging.getLogger(__name__)

# Create blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Initialize auth service
auth_service = AuthService()
password_reset_service = PasswordResetService()


def _get_serializer():
    return URLSafeTimedSerializer(
        current_app.config['SECRET_KEY'],
        salt='tiktrack-auth-token'
    )


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user
    
    Request Body:
        {
            "username": "string",
            "password": "string",
            "email": "string (optional)",
            "first_name": "string (optional)",
            "last_name": "string (optional)"
        }
    
    Returns:
        {
            "status": "success" | "error",
            "data": {
                "user": {...},
                "message": "User registered successfully"
            } | null,
            "error": {...} | null
        }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'error': {'message': 'No data provided'}
            }), 400
        
        username = data.get('username')
        password = data.get('password')
        
        if not username:
            return jsonify({
                'status': 'error',
                'error': {'message': 'Username is required'}
            }), 400
        
        if not password:
            return jsonify({
                'status': 'error',
                'error': {'message': 'Password is required'}
            }), 400
        
        # Validate password length
        if len(password) < 6:
            return jsonify({
                'status': 'error',
                'error': {'message': 'Password must be at least 6 characters'}
            }), 400
        
        # Register user
        result = auth_service.register_user(
            username=username,
            password=password,
            email=data.get('email'),
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
        )
        
        if result['success']:
            # Create token (no cookies)
            serializer = _get_serializer()
            token = serializer.dumps({
                "user_id": result['user']['id'],
                "username": result['user']['username']
            })
            
            return jsonify({
                'status': 'success',
                'data': {
                    'user': result['user'],
                    'access_token': token,
                    'message': 'User registered successfully'
                }
            }), 201
        else:
            return jsonify({
                'status': 'error',
                'error': {'message': result.get('error', 'Registration failed')}
            }), 400
            
    except Exception as e:
        logger.error(f"Error in register endpoint: {e}")
        return jsonify({
            'status': 'error',
            'error': {'message': f'Registration failed: {str(e)}'}
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticate user and create session
    
    Request Body:
        {
            "username": "string",
            "password": "string"
        }
    
    Returns:
        {
            "status": "success" | "error",
            "data": {
                "user": {...},
                "access_token": "session_id (for now)",
                "message": "Login successful"
            } | null,
            "error": {...} | null
        }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'error': {'message': 'No data provided'}
            }), 400
        
        username = data.get('username')
        password = data.get('password')
        
        if not username:
            return jsonify({
                'status': 'error',
                'error': {'message': 'Username is required'}
            }), 400
        
        if not password:
            return jsonify({
                'status': 'error',
                'error': {'message': 'Password is required'}
            }), 400
        
        # Authenticate user
        result = auth_service.authenticate_user(username, password)
        
        if result['success']:
            # Create token (no cookies)
            serializer = _get_serializer()
            access_token = serializer.dumps({
                "user_id": result['user']['id'],
                "username": result['user']['username']
            })
            
            return jsonify({
                'status': 'success',
                'data': {
                    'user': result['user'],
                    'access_token': access_token,
                    'message': 'Login successful'
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {'message': result.get('error', 'Authentication failed')}
            }), 401
            
    except Exception as e:
        logger.error(f"Error in login endpoint: {e}")
        return jsonify({
            'status': 'error',
            'error': {'message': f'Login failed: {str(e)}'}
        }), 500


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """
    Logout user (stateless) - client removes token
    """
    try:
        return jsonify({
            'status': 'success',
            'data': {
                'message': 'Logged out successfully'
            }
        }), 200
    except Exception as e:
        logger.error(f"Error in logout endpoint: {e}")
        return jsonify({
            'status': 'error',
            'error': {'message': f'Logout failed: {str(e)}'}
        }), 500


@auth_bp.route('/me/password', methods=['PUT'])
def update_password():
    """
    Update current user password
    
    Request Body:
        {
            "current_password": "string",
            "new_password": "string"
        }
    
    Returns:
        {
            "status": "success" | "error",
            "data": {
                "message": "Password updated successfully"
            } | null,
            "error": {...} | null
        }
    """
    try:
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            return jsonify({
                'status': 'error',
                'error': {'message': 'Not authenticated'}
            }), 401
        
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'error': {'message': 'No data provided'}
            }), 400
        
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return jsonify({
                'status': 'error',
                'error': {'message': 'Current password and new password are required'}
            }), 400
        
        # Validate new password length
        if len(new_password) < 6:
            return jsonify({
                'status': 'error',
                'error': {'message': 'New password must be at least 6 characters'}
            }), 400
        
        # Get user from database
        from config.database import SessionLocal
        from models.user import User
        from sqlalchemy import select
        
        db = SessionLocal()
        try:
            user = db.scalars(select(User).where(User.id == user_id)).first()
            
            if not user:
                return jsonify({
                    'status': 'error',
                    'error': {'message': 'User not found'}
                }), 404
            
            # Verify current password
            if not user.check_password(current_password):
                return jsonify({
                    'status': 'error',
                    'error': {'message': 'Current password is incorrect'}
                }), 401
            
            # Update password
            user.set_password(new_password)
            db.commit()
            
            logger.info(f"Password updated for user {user_id}")
            
            return jsonify({
                'status': 'success',
                'data': {
                    'message': 'Password updated successfully'
                }
            }), 200
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Error updating password: {e}")
        return jsonify({
            'status': 'error',
            'error': {'message': f'Password update failed: {str(e)}'}
        }), 500


@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """
    Get current authenticated user
    
    Returns:
        {
            "status": "success" | "error",
            "data": {
                "user": {...}
            } | null,
            "error": {...} | null
        }
    """
    try:
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            return jsonify({
                'status': 'error',
                'error': {'message': 'Not authenticated'}
            }), 401
        
        # Get user from service
        from services.user_service import UserService
        user_service = UserService()
        user = user_service.get_user_by_id(user_id)
        
        if user:
            return jsonify({
                'status': 'success',
                'data': {
                    'user': user
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {'message': 'User not found'}
            }), 404
            
    except Exception as e:
        logger.error(f"Error in /me endpoint: {e}")
        return jsonify({
            'status': 'error',
            'error': {'message': f'Failed to get user: {str(e)}'}
        }), 500


@auth_bp.route('/me', methods=['PUT'])
def update_current_user():
    """
    Update current authenticated user profile
    
    Request Body:
        {
            "email": "string (optional)",
            "first_name": "string (optional)",
            "last_name": "string (optional)"
        }
    
    Returns:
        {
            "status": "success" | "error",
            "data": {
                "user": {...},
                "message": "User updated successfully"
            } | null,
            "error": {...} | null
        }
    """
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'status': 'error',
                'error': {'message': 'Not authenticated'}
            }), 401
        
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'error': {'message': 'No data provided'}
            }), 400
        
        # Get user service
        from services.user_service import UserService
        user_service = UserService()
        
        # Update user (only allowed fields)
        allowed_fields = ['email', 'first_name', 'last_name']
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not update_data:
            return jsonify({
                'status': 'error',
                'error': {'message': 'No valid fields to update'}
            }), 400
        
        user = user_service.update_user(user_id, **update_data)
        
        if user:
            return jsonify({
                'status': 'success',
                'data': {
                    'user': user,
                    'message': 'User updated successfully'
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {'message': 'Failed to update user'}
            }), 400
            
    except Exception as e:
        logger.error(f"Error updating user: {e}")
        return jsonify({
            'status': 'error',
            'error': {'message': f'Update failed: {str(e)}'}
        }), 500


@auth_bp.route('/password-reset/request', methods=['POST'])
def request_password_reset():
    """
    Request password reset - sends email with reset link
    
    Request Body:
        {
            "email": "string (optional)",
            "username": "string (optional)"
        }
    
    Returns:
        {
            "status": "success" | "error",
            "data": {
                "message": "If the email exists, a password reset link has been sent."
            } | null,
            "error": {...} | null
        }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'error': {'message': 'No data provided'}
            }), 400
        
        email = data.get('email')
        username = data.get('username')
        
        if not email and not username:
            return jsonify({
                'status': 'error',
                'error': {'message': 'Email or username is required'}
            }), 400
        
        # Get base URL from request
        base_url = request.host_url.rstrip('/')
        if request.is_secure:
            base_url = base_url.replace('http://', 'https://')
        
        # Request password reset
        result = password_reset_service.request_password_reset(
            email=email,
            username=username,
            base_url=base_url
        )
        
        if result['success']:
            return jsonify({
                'status': 'success',
                'data': {
                    'message': result['message']
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {'message': result.get('error', 'Failed to send reset email')}
            }), 400
            
    except Exception as e:
        logger.error(f"Error in password reset request: {e}")
        return jsonify({
            'status': 'error',
            'error': {'message': f'Password reset request failed: {str(e)}'}
        }), 500


@auth_bp.route('/password-reset/validate', methods=['POST'])
def validate_reset_token():
    """
    Validate password reset token
    
    Request Body:
        {
            "token": "string"
        }
    
    Returns:
        {
            "status": "success" | "error",
            "data": {
                "valid": bool
            } | null,
            "error": {...} | null
        }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'error': {'message': 'No data provided'}
            }), 400
        
        token = data.get('token')
        if not token:
            return jsonify({
                'status': 'error',
                'error': {'message': 'Token is required'}
            }), 400
        
        result = password_reset_service.validate_token(token)
        
        if result['success']:
            return jsonify({
                'status': 'success',
                'data': {
                    'valid': result.get('valid', False)
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {'message': result.get('error', 'Token validation failed')}
            }), 400
            
    except Exception as e:
        logger.error(f"Error validating reset token: {e}")
        return jsonify({
            'status': 'error',
            'error': {'message': f'Token validation failed: {str(e)}'}
        }), 500


@auth_bp.route('/password-reset/reset', methods=['POST'])
def reset_password():
    """
    Reset password using token
    
    Request Body:
        {
            "token": "string",
            "new_password": "string"
        }
    
    Returns:
        {
            "status": "success" | "error",
            "data": {
                "message": "Password reset successfully"
            } | null,
            "error": {...} | null
        }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'error': {'message': 'No data provided'}
            }), 400
        
        token = data.get('token')
        new_password = data.get('new_password')
        
        if not token:
            return jsonify({
                'status': 'error',
                'error': {'message': 'Token is required'}
            }), 400
        
        if not new_password:
            return jsonify({
                'status': 'error',
                'error': {'message': 'New password is required'}
            }), 400
        
        # Validate password length
        if len(new_password) < 6:
            return jsonify({
                'status': 'error',
                'error': {'message': 'Password must be at least 6 characters'}
            }), 400
        
        # Reset password
        result = password_reset_service.reset_password(token, new_password)
        
        if result['success']:
            return jsonify({
                'status': 'success',
                'data': {
                    'message': result['message']
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {'message': result.get('error', 'Password reset failed')}
            }), 400
            
    except Exception as e:
        logger.error(f"Error resetting password: {e}")
        return jsonify({
            'status': 'error',
            'error': {'message': f'Password reset failed: {str(e)}'}
        }), 500

