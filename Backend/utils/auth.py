from functools import wraps
from flask import request, jsonify, g
from services.auth_service import AuthService
from config.database import get_db
import logging

logger = logging.getLogger(__name__)

def require_auth(f):
    """דקורטור לדרישת אימות"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # קבלת token מה-header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            # אימות ה-token
            payload = AuthService.verify_token(token)
            if payload is None:
                return jsonify({'message': 'Invalid token'}), 401
            
            # שמירת פרטי המשתמש ב-g
            g.user_id = payload.get('user_id')
            g.username = payload.get('username')
            
            # עדכון זמן התחברות אחרון
            db = next(get_db())
            AuthService.update_last_login(db, g.user_id)
            
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return jsonify({'message': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

def require_permission(permission: str):
    """דקורטור לדרישת הרשאה ספציפית"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(g, 'user_id'):
                return jsonify({'message': 'Authentication required'}), 401
            
            db = next(get_db())
            if not AuthService.check_permission(db, g.user_id, permission):
                return jsonify({'message': 'Insufficient permissions'}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def require_role(role_name: str):
    """דקורטור לדרישת תפקיד ספציפי"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(g, 'user_id'):
                return jsonify({'message': 'Authentication required'}), 401
            
            db = next(get_db())
            user_roles = AuthService.get_user_roles(db, g.user_id)
            
            if role_name not in user_roles:
                return jsonify({'message': 'Insufficient role'}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def get_current_user_id():
    """קבלת מזהה המשתמש הנוכחי"""
    return getattr(g, 'user_id', None)

def get_current_username():
    """קבלת שם המשתמש הנוכחי"""
    return getattr(g, 'username', None)
