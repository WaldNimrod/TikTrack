#!/usr/bin/env python3
"""
Authentication Middleware - Check session and set user context
"""

from flask import g, session, request
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def setup_auth_middleware(app):
    """
    Setup authentication middleware for Flask app
    
    This middleware:
    1. Checks for user_id in session
    2. Sets g.user_id and g.current_user for authenticated requests
    3. Allows public endpoints (like /api/auth/login, /api/auth/register)
    
    Args:
        app: Flask application instance
    """
    
    # Public endpoints that don't require authentication
    PUBLIC_ENDPOINTS = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/health',
        '/api/ai-analysis/templates',  # Templates are shared and public
    ]
    
    @app.before_request
    def load_user():
        """
        Load user from session before each request
        """
        # Skip authentication for public endpoints
        if any(request.path.startswith(endpoint) for endpoint in PUBLIC_ENDPOINTS):
            return
        
        # Get user_id from session
        user_id = session.get('user_id')
        
        if user_id:
            # Verify session is still valid (not expired)
            # Flask automatically handles PERMANENT_SESSION_LIFETIME, but we verify user still exists
            try:
                from services.user_service import UserService
                user_service = UserService()
                user = user_service.get_user_by_id(user_id)

                # UserService returns dict; older code expected model instance
                is_active = False
                username = session.get('username')
                if isinstance(user, dict):
                    is_active = bool(user.get('is_active'))
                    username = username or user.get('username')
                elif user is not None:
                    is_active = getattr(user, 'is_active', False)
                    username = username or getattr(user, 'username', None)

                if user and is_active:
                    # User exists and is active - set user context
                    g.user_id = user_id
                    g.username = username
                    g.current_user = user
                else:
                    # User not found or inactive - clear session
                    logger.warning(f"User {user_id} not found or inactive, clearing session")
                    session.clear()
                    g.user_id = None
                    g.current_user = None
                    g.username = None
            except Exception as e:
                logger.error(f"Error loading user {user_id}: {e}")
                # On error, clear session to be safe
                session.clear()
                g.user_id = None
                g.current_user = None
                g.username = None
        else:
            # No user in session
            g.user_id = None
            g.current_user = None
            g.username = None

