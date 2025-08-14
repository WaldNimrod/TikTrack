from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from models.user_role import UserRole
from models.user import User
from models.role import Role
from utils.auth import require_auth
import logging

logger = logging.getLogger(__name__)

user_roles_bp = Blueprint('user_roles', __name__, url_prefix='/api/v1/user_roles')

@user_roles_bp.route('/', methods=['GET'])
@require_auth
def get_user_roles():
    """קבלת כל הקצאות התפקידים"""
    try:
        db: Session = next(get_db())
        user_roles = db.query(UserRole).all()
        
        user_roles_data = []
        for user_role in user_roles:
            user = db.query(User).filter(User.id == user_role.user_id).first()
            role = db.query(Role).filter(Role.id == user_role.role_id).first()
            
            user_roles_data.append({
                "id": user_role.id,
                "user_id": user_role.user_id,
                "user_username": user.username if user else "Unknown",
                "role_id": user_role.role_id,
                "role_name": role.name if role else "Unknown",
                "assigned_at": user_role.assigned_at.strftime('%Y-%m-%d %H:%M:%S') if user_role.assigned_at else None,
                "created_at": user_role.created_at.strftime('%Y-%m-%d %H:%M:%S') if user_role.created_at else None
            })
        
        return jsonify({
            "status": "success",
            "data": user_roles_data,
            "message": "User roles retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error getting user roles: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve user roles"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@user_roles_bp.route('/<int:user_role_id>', methods=['GET'])
@require_auth
def get_user_role(user_role_id: int):
    """קבלת הקצאת תפקיד לפי מזהה"""
    try:
        db: Session = next(get_db())
        user_role = db.query(UserRole).filter(UserRole.id == user_role_id).first()
        
        if not user_role:
            return jsonify({
                "status": "error",
                "error": {"message": "User role not found"},
                "version": "v1"
            }), 404
        
        user = db.query(User).filter(User.id == user_role.user_id).first()
        role = db.query(Role).filter(Role.id == user_role.role_id).first()
        
        return jsonify({
            "status": "success",
            "data": {
                "id": user_role.id,
                "user_id": user_role.user_id,
                "user_username": user.username if user else "Unknown",
                "role_id": user_role.role_id,
                "role_name": role.name if role else "Unknown",
                "assigned_at": user_role.assigned_at.strftime('%Y-%m-%d %H:%M:%S') if user_role.assigned_at else None,
                "created_at": user_role.created_at.strftime('%Y-%m-%d %H:%M:%S') if user_role.created_at else None
            },
            "message": "User role retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error getting user role {user_role_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve user role"},
            "version": "v1"
        }), 500
    finally:
        db.close()
