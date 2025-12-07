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
            # Set user context
            g.user_id = user_id
            g.username = session.get('username')
            
            # Optionally load full user object
            try:
                from services.user_service import UserService
                user_service = UserService()
                user = user_service.get_user_by_id(user_id)
                if user:
                    g.current_user = user
                else:
                    # User not found - clear session
                    logger.warning(f"User {user_id} not found, clearing session")
                    session.clear()
                    g.user_id = None
                    g.current_user = None
            except Exception as e:
                logger.error(f"Error loading user {user_id}: {e}")
                g.user_id = None
                g.current_user = None
        else:
            # No user in session
            g.user_id = None
            g.current_user = None
            g.username = None

