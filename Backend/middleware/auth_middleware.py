#!/usr/bin/env python3
"""
Authentication Middleware - Check session and set user context
"""

from flask import g, request, current_app
from typing import Optional
import logging
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

logger = logging.getLogger(__name__)


def setup_auth_middleware(app):
    """
    Token-based authentication middleware (no cookies).
    - Expects Authorization: Bearer <token>
    - Sets g.user_id / g.current_user if token is valid
    """
    
    PUBLIC_ENDPOINTS = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/health',
        '/api/ai-analysis/templates',  # Templates are shared and public
    ]

    def _get_serializer():
        return URLSafeTimedSerializer(
            current_app.config['SECRET_KEY'],
            salt='tiktrack-auth-token'
        )

    @app.before_request
    def load_user():
        # Skip authentication for public endpoints
        if any(request.path.startswith(endpoint) for endpoint in PUBLIC_ENDPOINTS):
            return

        g.user_id = None
        g.current_user = None
        g.username = None

        auth_header = request.headers.get('Authorization', '')
        if not auth_header.lower().startswith('bearer '):
            logger.debug(f"⚠️ [Auth Middleware] No Bearer token for path={request.path}")
            return

        token = auth_header.split(' ', 1)[1].strip()
        if not token:
            return

        try:
            serializer = _get_serializer()
            data = serializer.loads(token, max_age=60 * 60 * 24)  # 24h
            user_id = data.get('user_id')
            username = data.get('username')
            if not user_id:
                return

            try:
                from services.user_service import UserService
                user_service = UserService()
                user = user_service.get_user_by_id(user_id)
                if user and user.get('is_active', True):
                    g.user_id = user_id
                    g.username = username or user.get('username')
                    g.current_user = user
                    logger.debug(f"✅ [Auth Middleware] Set g.user_id={user_id} for path={request.path}")
                else:
                    logger.warning(f"User {user_id} not found or inactive, token ignored")
            except Exception as e:
                logger.error(f"Error loading user {user_id} from token: {e}")
                g.user_id = None
                g.current_user = None
                g.username = None

        except SignatureExpired:
            logger.info("Auth token expired")
        except BadSignature:
            logger.info("Invalid auth token")
        except Exception as e:
            logger.error(f"Token decode error: {e}")

