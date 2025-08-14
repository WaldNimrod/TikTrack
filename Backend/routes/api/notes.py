from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from models.note import Note
from utils.auth import require_auth
import logging

logger = logging.getLogger(__name__)

notes_bp = Blueprint('notes', __name__, url_prefix='/api/v1/notes')

@notes_bp.route('/', methods=['GET'])
# @require_auth  # זמנית ללא אימות לבדיקה
def get_notes():
    """קבלת כל ההערות"""
    try:
        db: Session = next(get_db())
        notes = db.query(Note).all()
        return jsonify({
            "status": "success",
            "data": [note.to_dict() for note in notes],
            "message": "Notes retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error getting notes: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve notes"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@notes_bp.route('/<int:note_id>', methods=['GET'])
@require_auth
def get_note(note_id: int):
    """קבלת הערה לפי מזהה"""
    try:
        db: Session = next(get_db())
        note = db.query(Note).filter(Note.id == note_id).first()
        if note:
            return jsonify({
                "status": "success",
                "data": note.to_dict(),
                "message": "Note retrieved successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Note not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error getting note {note_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve note"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@notes_bp.route('/', methods=['POST'])
@require_auth
def create_note():
    """יצירת הערה חדשה"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        note = Note(**data)
        db.add(note)
        db.commit()
        db.refresh(note)
        return jsonify({
            "status": "success",
            "data": note.to_dict(),
            "message": "Note created successfully",
            "version": "v1"
        }), 201
    except Exception as e:
        logger.error(f"Error creating note: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@notes_bp.route('/<int:note_id>', methods=['PUT'])
@require_auth
def update_note(note_id: int):
    """עדכון הערה"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        note = db.query(Note).filter(Note.id == note_id).first()
        if note:
            for key, value in data.items():
                if hasattr(note, key):
                    setattr(note, key, value)
            db.commit()
            db.refresh(note)
            return jsonify({
                "status": "success",
                "data": note.to_dict(),
                "message": "Note updated successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Note not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error updating note {note_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@notes_bp.route('/<int:note_id>', methods=['DELETE'])
@require_auth
def delete_note(note_id: int):
    """מחיקת הערה"""
    try:
        db: Session = next(get_db())
        note = db.query(Note).filter(Note.id == note_id).first()
        if note:
            db.delete(note)
            db.commit()
            return jsonify({
                "status": "success",
                "message": "Note deleted successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Note not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error deleting note {note_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 500
    finally:
        db.close()
