#!/usr/bin/env python3
"""
Authentication API Routes - User registration and login
"""

from flask import Blueprint, request, jsonify, session
from typing import Dict, Any
import logging
from datetime import datetime

from services.auth_service import AuthService

logger = logging.getLogger(__name__)

# Create blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Initialize auth service
auth_service = AuthService()


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
            # Set session
            session['user_id'] = result['user']['id']
            session['username'] = result['user']['username']
            
            return jsonify({
                'status': 'success',
                'data': {
                    'user': result['user'],
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
            # Set session
            session['user_id'] = result['user']['id']
            session['username'] = result['user']['username']
            
            # For now, we use session-based auth
            # In the future, we can add JWT tokens here
            access_token = session.get('_id', 'session_based')
            
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
    Logout user and clear session
    
    Returns:
        {
            "status": "success",
            "data": {
                "message": "Logged out successfully"
            }
        }
    """
    try:
        # Clear session
        session.clear()
        
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
        user_id = session.get('user_id')
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
            # User not found - clear session
            session.clear()
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

