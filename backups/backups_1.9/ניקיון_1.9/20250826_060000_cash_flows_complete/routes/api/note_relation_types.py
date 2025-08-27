from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from models.note_relation_type import NoteRelationType
import logging
import os
import sqlite3

logger = logging.getLogger(__name__)

note_relation_types_bp = Blueprint('note_relation_types', __name__, url_prefix='/api/v1/note_relation_types')

def get_db_connection():
    """Get database connection"""
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DB_PATH = os.path.join(BASE_DIR, "db", "simpleTrade_new.db")
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@note_relation_types_bp.route('/', methods=['GET'])
def get_note_relation_types():
    """Get all note relation types"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM note_relation_types ORDER BY id")
        note_relation_types = cursor.fetchall()
        
        conn.close()
        
        result = []
        for note_type in note_relation_types:
            result.append({
                'id': note_type[1],  # id is at index 1
                'note_relation_type': note_type[0],  # note_relation_type is at index 0
                'created_at': note_type[2]  # created_at is at index 2
            })
        
        return jsonify({
            "status": "success",
            "data": result,
            "message": "Note relation types retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error getting note relation types: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve note relation types"},
            "version": "v1"
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
                'id': note_type[1],  # id is at index 1
                'note_relation_type': note_type[0],  # note_relation_type is at index 0
                'created_at': note_type[2]  # created_at is at index 2
            }
            
            return jsonify({
                "status": "success",
                "data": note_type_dict,
                "message": "Note relation type retrieved successfully",
                "version": "v1"
            })
        
        return jsonify({
            "status": "error",
            "error": {"message": "Note relation type not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error getting note relation type {type_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve note relation type"},
            "version": "v1"
        }), 500

@note_relation_types_bp.route('/', methods=['POST'])
def create_note_relation_type():
    """Create new note relation type"""
    try:
        data = request.get_json()
        note_relation_type = data.get('note_relation_type')
        
        if not note_relation_type:
            return jsonify({
                "status": "error",
                "error": {"message": "note_relation_type is required"},
                "version": "v1"
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
            "message": "Note relation type created successfully",
            "version": "v1"
        }), 201
    except Exception as e:
        logger.error(f"Error creating note relation type: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400

@note_relation_types_bp.route('/<int:type_id>', methods=['PUT'])
def update_note_relation_type(type_id: int):
    """Update note relation type"""
    try:
        data = request.get_json()
        note_relation_type = data.get('note_relation_type')
        
        if not note_relation_type:
            return jsonify({
                "status": "error",
                "error": {"message": "note_relation_type is required"},
                "version": "v1"
            }), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if note relation type exists
        cursor.execute("SELECT id FROM note_relation_types WHERE id = ?", (type_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({
                "status": "error",
                "error": {"message": "Note relation type not found"},
                "version": "v1"
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
            "message": "Note relation type updated successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error updating note relation type {type_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to update note relation type"},
            "version": "v1"
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
                "version": "v1"
            }), 404
        
        # Delete note relation type
        cursor.execute("DELETE FROM note_relation_types WHERE id = ?", (type_id,))
        conn.commit()
        conn.close()
        
        return jsonify({
            "status": "success",
            "message": "Note relation type deleted successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error deleting note relation type {type_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to delete note relation type"},
            "version": "v1"
        }), 500
