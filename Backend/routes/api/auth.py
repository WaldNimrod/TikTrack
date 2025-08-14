from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from services.auth_service import AuthService
from utils.auth import require_auth
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    """התחברות משתמש"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({
                "status": "error",
                "error": {"message": "Username and password are required"},
                "version": "v1"
            }), 400
        
        db: Session = next(get_db())
        user = AuthService.authenticate_user(db, username, password)
        
        if not user:
            return jsonify({
                "status": "error",
                "error": {"message": "Invalid credentials"},
                "version": "v1"
            }), 401
        
        if not user.is_active:
            return jsonify({
                "status": "error",
                "error": {"message": "User account is disabled"},
                "version": "v1"
            }), 401
        
        # יצירת token
        token_data = {
            "user_id": user.id,
            "username": user.username,
            "email": user.email
        }
        access_token = AuthService.create_access_token(token_data)
        
        # עדכון זמן התחברות אחרון
        AuthService.update_last_login(db, user.id)
        
        return jsonify({
            "status": "success",
            "data": {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email
                }
            },
            "message": "Login successful",
            "version": "v1"
        })
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Login failed"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@auth_bp.route('/roles', methods=['GET'])
def get_roles():
    """קבלת כל התפקידים"""
    try:
        db: Session = next(get_db())
        roles = AuthService.get_all_roles(db)
        
        roles_data = []
        for role in roles:
            roles_data.append({
                "id": role.id,
                "name": role.name,
                "description": role.description,
                "permissions": role.permissions
            })
        
        return jsonify({
            "status": "success",
            "data": roles_data,
            "message": "Roles retrieved successfully",
            "version": "v1"
        })
        
    except Exception as e:
        logger.error(f"Get roles error: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to get roles"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@auth_bp.route('/roles', methods=['POST'])
def create_role():
    """יצירת תפקיד חדש"""
    try:
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')
        permissions = data.get('permissions', [])
        
        if not name:
            return jsonify({
                "status": "error",
                "error": {"message": "Role name is required"},
                "version": "v1"
            }), 400
        
        db: Session = next(get_db())
        role = AuthService.create_role(db, name, description, permissions)
        
        return jsonify({
            "status": "success",
            "data": {
                "id": role.id,
                "name": role.name,
                "description": role.description,
                "permissions": role.permissions
            },
            "message": "Role created successfully",
            "version": "v1"
        }), 201
        
    except ValueError as e:
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    except Exception as e:
        logger.error(f"Create role error: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to create role"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@auth_bp.route('/users/<int:user_id>/roles', methods=['GET'])
def get_user_roles(user_id):
    """קבלת תפקידי משתמש"""
    try:
        db: Session = next(get_db())
        roles = AuthService.get_user_roles(db, user_id)
        
        return jsonify({
            "status": "success",
            "data": {
                "user_id": user_id,
                "roles": roles
            },
            "message": "User roles retrieved successfully",
            "version": "v1"
        })
        
    except Exception as e:
        logger.error(f"Get user roles error: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to get user roles"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@auth_bp.route('/users/<int:user_id>/roles', methods=['POST'])
def assign_roles_to_user(user_id):
    """הקצאת תפקידים למשתמש"""
    try:
        data = request.get_json()
        roles = data.get('roles', [])
        
        if not roles:
            return jsonify({
                "status": "error",
                "error": {"message": "Roles list is required"},
                "version": "v1"
            }), 400
        
        db: Session = next(get_db())
        success = AuthService.assign_roles_to_user(db, user_id, roles)
        
        if success:
            return jsonify({
                "status": "success",
                "data": {
                    "user_id": user_id,
                    "assigned_roles": roles
                },
                "message": "Roles assigned successfully",
                "version": "v1"
            })
        else:
            return jsonify({
                "status": "error",
                "error": {"message": "User not found"},
                "version": "v1"
            }), 404
        
    except Exception as e:
        logger.error(f"Assign roles error: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to assign roles"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@auth_bp.route('/register', methods=['POST'])
def register():
    """רישום משתמש חדש"""
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        roles = data.get('roles', [])
        
        if not username or not email or not password:
            return jsonify({
                "status": "error",
                "error": {"message": "Username, email and password are required"},
                "version": "v1"
            }), 400
        
        db: Session = next(get_db())
        user = AuthService.create_user(db, username, email, password, roles)
        
        return jsonify({
            "status": "success",
            "data": {
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email
                }
            },
            "message": "User registered successfully",
            "version": "v1"
        }), 201
        
    except ValueError as e:
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Registration failed"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """קבלת פרטי המשתמש הנוכחי"""
    db = None
    try:
        # בדיקת token מה-header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({
                "status": "error",
                "error": {"message": "Authorization header required"},
                "version": "v1"
            }), 401
        
        token = auth_header.split(" ")[1]
        payload = AuthService.verify_token(token)
        
        if not payload:
            return jsonify({
                "status": "error",
                "error": {"message": "Invalid token"},
                "version": "v1"
            }), 401
        
        db: Session = next(get_db())
        user = db.query(AuthService.User).filter(AuthService.User.id == payload.get('user_id')).first()
        
        if not user:
            return jsonify({
                "status": "error",
                "error": {"message": "User not found"},
                "version": "v1"
            }), 404
        
        # קבלת תפקידי המשתמש
        user_roles = AuthService.get_user_roles(db, user.id)
        
        return jsonify({
            "status": "success",
            "data": {
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_active": user.is_active,
                    "last_login": user.last_login.isoformat() if user.last_login else None,
                    "roles": user_roles
                }
            },
            "message": "User details retrieved successfully",
            "version": "v1"
        })
        
    except Exception as e:
        logger.error(f"Get current user error: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to get user details"},
            "version": "v1"
        }), 500
    finally:
        if db:
            db.close()

@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    """רענון token"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({
                "status": "error",
                "error": {"message": "Authorization header required"},
                "version": "v1"
            }), 401
        
        token = auth_header.split(" ")[1]
        payload = AuthService.verify_token(token)
        
        if not payload:
            return jsonify({
                "status": "error",
                "error": {"message": "Invalid token"},
                "version": "v1"
            }), 401
        
        # יצירת token חדש
        new_token_data = {
            "user_id": payload.get('user_id'),
            "username": payload.get('username'),
            "email": payload.get('email')
        }
        new_access_token = AuthService.create_access_token(new_token_data)
        
        return jsonify({
            "status": "success",
            "data": {
                "access_token": new_access_token,
                "token_type": "bearer"
            },
            "message": "Token refreshed successfully",
            "version": "v1"
        })
        
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Token refresh failed"},
            "version": "v1"
        }), 500

@auth_bp.route('/users', methods=['GET'])
@require_auth
def get_all_users():
    """קבלת כל המשתמשים"""
    db = None
    try:
        from models.user import User
        db: Session = next(get_db())
        users = db.query(User).all()
        
        return jsonify({
            "status": "success",
            "data": [{
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "last_login": user.last_login.isoformat() if user.last_login else None,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "roles": AuthService.get_user_roles(db, user.id)
            } for user in users],
            "message": "Users retrieved successfully",
            "version": "v1"
        })
        
    except Exception as e:
        logger.error(f"Get all users error: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to get users"},
            "version": "v1"
        }), 500
    finally:
        if db:
            db.close()

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """התנתקות"""
    # ב-JWT אין צורך לעשות משהו בשרת, אבל אפשר להוסיף לוגיקה עתידית
    return jsonify({
        "status": "success",
        "message": "Logout successful",
        "version": "v1"
    })
