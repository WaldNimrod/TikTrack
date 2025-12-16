from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from config.database import get_db
from models.note_relation_type import NoteRelationType
from services.advanced_cache_service import cache_for, invalidate_cache
import logging
import re

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

note_relation_types_bp = Blueprint('note_relation_types', __name__, url_prefix='/api/note-relation-types')

@note_relation_types_bp.route('/', methods=['GET'])
@api_endpoint(cache_ttl=600, rate_limit=60)
@handle_database_session()
@cache_for(ttl=600)  # Cache for 10 minutes - note relation types don't change
def get_note_relation_types():
    """Get all note relation types using SQLAlchemy (requires authentication)"""
    db: Session = g.db
    
    # Get user_id from Flask context (set by auth middleware)
    user_id = getattr(g, 'user_id', None)
    
    if user_id is None:
        return jsonify({
            "status": "error",
            "error": {"message": "User authentication required"},
            "version": "1.0"
        }), 401
    
    try:
        # Note relation types are system-wide (shared), but require authentication
        note_relation_types = db.query(NoteRelationType).order_by(NoteRelationType.id).all()
        
        result = [note_type.to_dict() for note_type in note_relation_types]
        
        return jsonify({
            "status": "success",
            "data": result,
            "message": "רשימת סוגי הקישור נטענה בהצלחה",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting note relation types: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה בטעינת רשימת סוגי הקישור"},
            "version": "1.0"
        }), 500

@note_relation_types_bp.route('/<int:type_id>', methods=['GET'])
@handle_database_session()
@cache_for(ttl=600)
def get_note_relation_type(type_id: int):
    """Get note relation type by ID using SQLAlchemy (requires authentication)"""
    db: Session = g.db
    
    # Get user_id from Flask context (set by auth middleware)
    user_id = getattr(g, 'user_id', None)
    
    if user_id is None:
        return jsonify({
            "status": "error",
            "error": {"message": "User authentication required"},
            "version": "1.0"
        }), 401
    
    try:
        # Note relation types are system-wide (shared), but require authentication
        note_type = db.query(NoteRelationType).filter(NoteRelationType.id == type_id).first()
        
        if not note_type:
            return jsonify({
                "status": "error",
                "error": {"message": "Note relation type not found"},
                "version": "1.0"
            }), 404
        
        return jsonify({
            "status": "success",
            "data": note_type.to_dict(),
            "message": "פרטי סוג הקישור נטענו בהצלחה",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting note relation type {type_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה בטעינת פרטי סוג הקישור"},
            "version": "1.0"
        }), 500

@note_relation_types_bp.route('/', methods=['POST'])
@handle_database_session()
@invalidate_cache('note_relation_types')
def create_note_relation_type():
    """Create new note relation type using SQLAlchemy (requires authentication)"""
    db: Session = g.db
    
    # Get user_id from Flask context (set by auth middleware)
    user_id = getattr(g, 'user_id', None)
    
    if user_id is None:
        return jsonify({
            "status": "error",
            "error": {"message": "User authentication required"},
            "version": "1.0"
        }), 401
    try:
        data = request.get_json()
        note_relation_type = data.get('note_relation_type', '').strip()
        
        # וולידציה של שדה חובה
        if not note_relation_type:
            return jsonify({
                "status": "error",
                "error": {"message": "סוג קישור הוא שדה חובה. יש להזין שם לסוג הקישור."},
                "version": "1.0"
            }), 400
        
        # וולידציה של אורך סוג קישור
        if len(note_relation_type) > 20:
            return jsonify({
                "status": "error",
                "error": {"message": "סוג קישור לא יכול להיות יותר מ-20 תווים. נסה שם קצר יותר."},
                "version": "1.0"
            }), 400
        
        # וולידציה של תבנית סוג קישור - רק אותיות, מספרים וקווים תחתונים
        if not re.match(r'^[a-zA-Z0-9_]+$', note_relation_type):
            return jsonify({
                "status": "error",
                "error": {"message": "סוג קישור חייב להכיל רק אותיות אנגליות, מספרים וקווים תחתונים. אסור להשתמש ברווחים או תווים מיוחדים."},
                "version": "1.0"
            }), 400
        
        # Create new note relation type
        new_type = NoteRelationType(note_relation_type=note_relation_type)
        db.add(new_type)
        db.commit()
        db.refresh(new_type)
        
        return jsonify({
            "status": "success",
            "data": new_type.to_dict(),
            "message": "סוג קישור נוסף בהצלחה",
            "version": "1.0"
        }), 201
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error creating note relation type: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "סוג קישור זה כבר קיים במערכת"},
            "version": "1.0"
        }), 400
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating note relation type: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400

@note_relation_types_bp.route('/<int:type_id>', methods=['PUT'])
@handle_database_session()
@invalidate_cache('note_relation_types')
def update_note_relation_type(type_id: int):
    """Update note relation type using SQLAlchemy (requires authentication)"""
    db: Session = g.db
    
    # Get user_id from Flask context (set by auth middleware)
    user_id = getattr(g, 'user_id', None)
    
    if user_id is None:
        return jsonify({
            "status": "error",
            "error": {"message": "User authentication required"},
            "version": "1.0"
        }), 401
    try:
        data = request.get_json()
        note_relation_type = data.get('note_relation_type', '').strip()
        
        # וולידציה של שדה חובה
        if not note_relation_type:
            return jsonify({
                "status": "error",
                "error": {"message": "סוג קישור הוא שדה חובה. יש להזין שם לסוג הקישור."},
                "version": "1.0"
            }), 400
        
        # וולידציה של אורך סוג קישור
        if len(note_relation_type) > 20:
            return jsonify({
                "status": "error",
                "error": {"message": "סוג קישור לא יכול להיות יותר מ-20 תווים. נסה שם קצר יותר."},
                "version": "1.0"
            }), 400
        
        # וולידציה של תבנית סוג קישור - רק אותיות, מספרים וקווים תחתונים
        if not re.match(r'^[a-zA-Z0-9_]+$', note_relation_type):
            return jsonify({
                "status": "error",
                "error": {"message": "סוג קישור חייב להכיל רק אותיות אנגליות, מספרים וקווים תחתונים. אסור להשתמש ברווחים או תווים מיוחדים."},
                "version": "1.0"
            }), 400
        
        # Get existing note relation type
        note_type = db.query(NoteRelationType).filter(NoteRelationType.id == type_id).first()
        
        if not note_type:
            return jsonify({
                "status": "error",
                "error": {"message": "סוג קישור לא נמצא במערכת"},
                "version": "1.0"
            }), 404
        
        # Update note relation type
        note_type.note_relation_type = note_relation_type
        db.commit()
        db.refresh(note_type)
        
        return jsonify({
            "status": "success",
            "data": note_type.to_dict(),
            "message": "סוג קישור עודכן בהצלחה",
            "version": "1.0"
        })
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error updating note relation type {type_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "סוג קישור זה כבר קיים במערכת"},
            "version": "1.0"
        }), 400
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating note relation type {type_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה בעדכון סוג קישור"},
            "version": "1.0"
        }), 500

@note_relation_types_bp.route('/<int:type_id>', methods=['DELETE'])
@handle_database_session()
@invalidate_cache('note_relation_types')
def delete_note_relation_type(type_id: int):
    """Delete note relation type using SQLAlchemy (requires authentication)"""
    db: Session = g.db
    
    # Get user_id from Flask context (set by auth middleware)
    user_id = getattr(g, 'user_id', None)
    
    if user_id is None:
        return jsonify({
            "status": "error",
            "error": {"message": "User authentication required"},
            "version": "1.0"
        }), 401
    try:
        note_type = db.query(NoteRelationType).filter(NoteRelationType.id == type_id).first()
        
        if not note_type:
            return jsonify({
                "status": "error",
                "error": {"message": "Note relation type not found"},
                "version": "1.0"
            }), 404
        
        db.delete(note_type)
        db.commit()
        
        return jsonify({
            "status": "success",
            "message": "סוג קישור נמחק בהצלחה",
            "version": "1.0"
        })
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting note relation type {type_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה במחיקת סוג קישור"},
            "version": "1.0"
        }), 500
