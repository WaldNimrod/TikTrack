from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from config.database import get_db
from models.note_relation_type import NoteRelationType
from services.advanced_cache_service import cache_for, invalidate_cache
import logging
import os
import sqlite3
import re

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

note_relation_types_bp = Blueprint('note_relation_types', __name__, url_prefix='/api/note_relation_types')

# Initialize base API (note_relation_types uses direct SQLite, so we'll use it selectively)

def get_db_connection():
    """Get database connection"""
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DB_PATH = os.path.join(BASE_DIR, "db", "simpleTrade_new.db")
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@note_relation_types_bp.route('/', methods=['GET'])
@api_endpoint(cache_ttl=600, rate_limit=60)
@handle_database_session()
@cache_for(ttl=600)  # Cache for 10 minutes - note relation types don't change
def get_note_relation_types():
    """Get all note relation types using base API patterns"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM note_relation_types ORDER BY id")
        note_relation_types = cursor.fetchall()
        
        conn.close()
        
        result = []
        for note_type in note_relation_types:
            result.append({
                'id': note_type[0],  # id is at index 0
                'note_relation_type': note_type[1],  # note_relation_type is at index 1
                'created_at': note_type[2]  # created_at is at index 2
            })
        
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
def get_note_relation_type(type_id: int):
    """Get note relation type by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM note_relation_types WHERE id = ?", (type_id,))
        note_type = cursor.fetchone()
        
        conn.close()
        
        if note_type:
            note_type_dict = {
                'id': note_type[0],  # id is at index 0
                'note_relation_type': note_type[1],  # note_relation_type is at index 1
                'created_at': note_type[2]  # created_at is at index 2
            }
            
            return jsonify({
                "status": "success",
                "data": note_type_dict,
                "message": "פרטי סוג הקישור נטענו בהצלחה",
                "version": "1.0"
            })
        
        return jsonify({
            "status": "error",
            "error": {"message": "Note relation type not found"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error getting note relation type {type_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה בטעינת פרטי סוג הקישור"},
            "version": "1.0"
        }), 500

@note_relation_types_bp.route('/', methods=['POST'])
def create_note_relation_type():
    """Create new note relation type"""
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
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO note_relation_types (note_relation_type) VALUES (?)",
            (note_relation_type,)
        )
        type_id = cursor.lastrowid
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "status": "success",
            "data": {
                'id': type_id,
                'note_relation_type': note_relation_type,
                'created_at': None  # Will be set by database default
            },
            "message": "סוג קישור נוסף בהצלחה",
            "version": "1.0"
        }), 201
    except Exception as e:
        logger.error(f"Error creating note relation type: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400

@note_relation_types_bp.route('/<int:type_id>', methods=['PUT'])
def update_note_relation_type(type_id: int):
    """Update note relation type"""
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
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if note relation type exists
        cursor.execute("SELECT id FROM note_relation_types WHERE id = ?", (type_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({
                "status": "error",
                "error": {"message": "סוג קישור לא נמצא במערכת"},
                "version": "1.0"
            }), 404
        
        # Update note relation type
        cursor.execute(
            "UPDATE note_relation_types SET note_relation_type = ? WHERE id = ?",
            (note_relation_type, type_id)
        )
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "status": "success",
            "data": {
                'id': type_id,
                'note_relation_type': note_relation_type
            },
            "message": "סוג קישור עודכן בהצלחה",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error updating note relation type {type_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה בעדכון סוג קישור"},
            "version": "1.0"
        }), 500

@note_relation_types_bp.route('/<int:type_id>', methods=['DELETE'])
def delete_note_relation_type(type_id: int):
    """Delete note relation type"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if note relation type exists
        cursor.execute("SELECT id FROM note_relation_types WHERE id = ?", (type_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({
                "status": "error",
                "error": {"message": "Note relation type not found"},
                "version": "1.0"
            }), 404
        
        # Delete note relation type
        cursor.execute("DELETE FROM note_relation_types WHERE id = ?", (type_id,))
        conn.commit()
        conn.close()
        
        return jsonify({
            "status": "success",
            "message": "סוג קישור נמחק בהצלחה",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error deleting note relation type {type_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה במחיקת סוג קישור"},
            "version": "1.0"
        }), 500
