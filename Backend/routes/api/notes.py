from flask import Blueprint, jsonify, request, send_from_directory, g
from config.database import get_db
from models.note import Note
from services.validation_service import ValidationService
from services.advanced_cache_service import cache_for, invalidate_cache
from services.date_normalization_service import DateNormalizationService
from services.preferences_service import PreferencesService
from services.tag_service import TagService
import logging
import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from typing import Optional, Dict, Any, List
from werkzeug.datastructures import FileStorage
from sqlalchemy.orm import Session
from sqlalchemy import text

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

notes_bp = Blueprint('notes', __name__, url_prefix='/api/notes')

# Initialize base API (Note doesn't have a service, so we'll use the model directly)
# For now, we'll skip the base API for notes due to its complexity

# File settings
UPLOAD_FOLDER = 'uploads/notes'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}
MAX_FILE_SIZE = 524288  # 512KB

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file: FileStorage) -> Optional[str]:
    """Save uploaded file with unique name"""
    logger.info(f"📎 save_uploaded_file called with file: {file.filename if file else 'None'}")
    
    if file and allowed_file(file.filename):
        logger.info(f"✅ File type allowed: {file.filename}")
        # Create unique filename with date
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_id = str(uuid.uuid4())[:8]
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        
        new_filename = f"{timestamp}_{unique_id}_{name}{ext}"
        file_path = os.path.join(UPLOAD_FOLDER, new_filename)
        
        logger.info(f"📎 Saving file to: {file_path}")
        
        # Save file
        try:
            file.save(file_path)
            logger.info(f"✅ File saved successfully: {file_path}")
            return new_filename
        except Exception as e:
            logger.error(f"❌ Error saving file: {str(e)}")
            return None
    else:
        logger.warning(f"❌ File not allowed or missing: {file.filename if file else 'None'}")
        return None


def delete_uploaded_file(filename: str) -> bool:
    """Delete uploaded file"""
    if filename:
        try:
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"File deleted: {file_path}")
                return True
            else:
                logger.warning(f"File not found for deletion: {file_path}")
                return False
        except Exception as e:
            logger.error(f"Error deleting file {filename}: {str(e)}")
            return False
    return False

def cleanup_orphaned_files() -> int:
    """Cleanup orphaned files (files not linked to notes)"""
    try:
        db = next(get_db())
        
        # Get all file names linked to notes
        notes = db.query(Note).filter(Note.attachment.isnot(None)).all()
        attached_files = {note.attachment for note in notes if note.attachment}
        
        # Get all files in directory
        if os.path.exists(UPLOAD_FOLDER):
            files_in_folder = set(os.listdir(UPLOAD_FOLDER))
            
            # Find orphaned files
            orphaned_files = files_in_folder - attached_files
            
            deleted_count = 0
            for filename in orphaned_files:
                if delete_uploaded_file(filename):
                    deleted_count += 1
            
            logger.info(f"Cleaned up {deleted_count} orphaned files")
            return deleted_count
        else:
            logger.warning(f"Upload folder does not exist: {UPLOAD_FOLDER}")
            return 0
            
    except Exception as e:
        logger.error(f"Error cleaning up orphaned files: {str(e)}")
        return 0
    finally:
        db.close()


def _get_notes_normalizer() -> DateNormalizationService:
    """Resolve timezone and create a DateNormalizationService for notes endpoints."""
    try:
        timezone_name = DateNormalizationService.resolve_timezone(
            request,
            preferences_service=PreferencesService()
        )
    except Exception as tz_error:
        logger.warning("⚠️ Unable to resolve timezone in notes endpoint, defaulting to UTC: %s", tz_error)
        timezone_name = "UTC"
    return DateNormalizationService(timezone_name)

@notes_bp.route('/', methods=['GET'])
def get_notes():
    """Get all notes"""
    try:
        logger.info("🔄 Starting get_notes function")
        db = next(get_db())
        logger.info("✅ Database connection established")
        
        # Use direct SQL with text() from SQLAlchemy
        try:
            result = db.execute(text("SELECT * FROM notes ORDER BY created_at DESC"))
            notes_data = result.fetchall()
            logger.info(f"✅ Successfully retrieved {len(notes_data)} notes using direct SQL")
            
            # Convert to dictionaries
            notes_list = []
            for row in notes_data:
                # Set related_type according to related_type_id
                related_type = None
                if row[4] == 1:  # related_type_id (now at index 4)
                    related_type = 'trading_account'
                elif row[4] == 2:
                    related_type = 'trade'
                elif row[4] == 3:
                    related_type = 'trade_plan'
                elif row[4] == 4:
                    related_type = 'ticker'
                
                note_dict = {
                    'id': row[0],
                    'content': row[1],
                    'attachment': row[2],
                    'created_at': row[3],
                    'related_type_id': row[4],
                    'related_id': row[5],
                    'related_type': related_type
                }
                
                notes_list.append(note_dict)
            
        except Exception as sql_error:
            logger.error(f"❌ Error with direct SQL: {str(sql_error)}")
            return jsonify({
                "status": "error",
                "error": {"message": f"Database error: {str(sql_error)}"},
                "version": "1.0"
            }), 500
            
        normalizer = _get_notes_normalizer()
        normalized_notes = normalizer.normalize_output(notes_list)

        return jsonify({
            "status": "success",
            "data": normalized_notes,
            "message": "Notes retrieved successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"❌ Error getting notes: {str(e)}")
        import traceback
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to retrieve notes: {str(e)}"},
            "version": "1.0"
        }), 500
    finally:
        if 'db' in locals():
            db.close()

@notes_bp.route('/<int:note_id>', methods=['GET'])
def get_note(note_id: int):
    """Get note by ID"""
    try:
        db = next(get_db())
        note = db.query(Note).filter(Note.id == note_id).first()
        if note:
            normalizer = _get_notes_normalizer()
            payload = normalizer.normalize_output(note.to_dict())
            return jsonify({
                "status": "success",
                "data": payload,
                "message": "Note retrieved successfully",
                "timestamp": normalizer.now_envelope(),
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Note not found"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error getting note {note_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve note"},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@notes_bp.route('/', methods=['POST'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['notes'])
def create_note():
    """Create new note"""
    try:
        # Use the session from the decorator (in g.db)
        db: Session = g.db
        
        # Check if there's a file or JSON
        if request.files:
            # File handling
            file = request.files.get('attachment')
            attachment_filename = None
            
            if file and file.filename:
                # Check file size
                if file.content_length and file.content_length > MAX_FILE_SIZE:
                    return jsonify({
                        "status": "error",
                        "error": {"message": "File too large. Maximum size is 512KB"},
                        "version": "1.0"
                    }), 400
                
                attachment_filename = save_uploaded_file(file)
                if not attachment_filename:
                    return jsonify({
                        "status": "error",
                        "error": {"message": "Invalid file type. Allowed: JPG, PNG, GIF, PDF"},
                        "version": "1.0"
                    }), 400
            
            # Get data from form data
            content = request.form.get('content', '')
            # Sanitize HTML content
            content = BaseEntityUtils.sanitize_rich_text(content)
            related_type_id = request.form.get('related_type_id')
            related_id = request.form.get('related_id')
        else:
            # Get data from JSON
            data = request.get_json()
            content = data.get('content', '')
            # Sanitize HTML content
            content = BaseEntityUtils.sanitize_rich_text(content)
            related_type_id = data.get('related_type_id')
            related_id = data.get('related_id')
            attachment_filename = data.get('attachment')
        
        # Determine relation using related_type_id and related_id
        if not related_type_id or not related_id:
            return jsonify({
                "status": "error",
                "error": {"message": "Note must have related_type_id and related_id"},
                "version": "1.0"
            }), 400
        
        # Validate related_type_id
        valid_types = [1, 2, 3, 4]  # account, trade, trade_plan, ticker
        if int(related_type_id) not in valid_types:
            return jsonify({
                "status": "error",
                "error": {"message": "Invalid related_type_id. Must be: 1 (account), 2 (trade), 3 (trade_plan), or 4 (ticker)"},
                "version": "1.0"
            }), 400
        
        # Create note with new structure
        note_data = {
            'content': content,
            'attachment': attachment_filename,
            'related_type_id': related_type_id,
            'related_id': related_id
        }
        
        # Validate data against constraints
        logger.info("Validating note data before creation")
        is_valid, errors = ValidationService.validate_data(db, 'notes', note_data)
        if not is_valid:
            error_message = "; ".join(errors)
            logger.error(f"Note validation failed: {error_message}")
            # Delete file if validation failed
            if attachment_filename:
                delete_uploaded_file(attachment_filename)
            return jsonify({
                "status": "error",
                "error": {"message": f"Note validation failed: {error_message}"},
                "version": "1.0"
            }), 400
        
        note = Note(**note_data)
        db.add(note)
        db.commit()
        db.refresh(note)
        normalizer = _get_notes_normalizer()
        payload = normalizer.normalize_output(note.to_dict())
        return jsonify({
            "status": "success",
            "data": payload,
            "message": "Note created successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 201
    except Exception as e:
        logger.error(f"Error creating note: {str(e)}")
        # Delete file if there was an error creating the note
        if 'attachment_filename' in locals() and attachment_filename:
            delete_uploaded_file(attachment_filename)
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    # Don't close db here - handle_database_session decorator will do it

@notes_bp.route('/<int:note_id>', methods=['PUT'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['notes'])
def update_note(note_id: int):
    """Update note"""
    try:
        logger.info(f"🔄 Starting update_note for note_id: {note_id}")
        logger.info(f"📋 Request method: {request.method}")
        logger.info(f"📋 Request content type: {request.content_type}")
        logger.info(f"📋 Request files: {list(request.files.keys()) if request.files else 'No files'}")
        logger.info(f"📋 Request form: {dict(request.form) if request.form else 'No form data'}")
        logger.info(f"📋 Request JSON: {request.get_json() if request.is_json else 'Not JSON'}")
        
        # Use the session from the decorator (in g.db)
        db: Session = g.db
        note = db.query(Note).filter(Note.id == note_id).first()
        if note:
            logger.info(f"✅ Found note: {note.id}")
            
            # Check if there's a file or JSON
            if request.files:
                logger.info("📎 Processing file upload")
                # File handling
                file = request.files.get('attachment')
                attachment_filename = None
                
                if file and file.filename:
                    logger.info(f"📎 File received: {file.filename}, size: {file.content_length}")
                    # Check file size
                    if file.content_length and file.content_length > MAX_FILE_SIZE:
                        logger.warning(f"❌ File too large: {file.content_length} > {MAX_FILE_SIZE}")
                        return jsonify({
                            "status": "error",
                            "error": {"message": "File too large. Maximum size is 512KB"},
                            "version": "1.0"
                        }), 400
                    
                    attachment_filename = save_uploaded_file(file)
                    logger.info(f"📎 File saved as: {attachment_filename}")
                    if not attachment_filename:
                        logger.error("❌ Failed to save file")
                        return jsonify({
                            "status": "error",
                            "error": {"message": "Invalid file type. Allowed: JPG, PNG, GIF, PDF"},
                            "version": "1.0"
                        }), 400
                
                # Get data from form data
                content = request.form.get('content', '')
                # Sanitize HTML content
                content = BaseEntityUtils.sanitize_rich_text(content)
                related_type_id = request.form.get('related_type_id')
                related_id = request.form.get('related_id')
                logger.info(f"📋 Form data - content: {content[:50]}..., related_type_id: {related_type_id}, related_id: {related_id}")
                
                # Validate related_type_id
                if not related_type_id or related_type_id not in ['1', '2', '3', '4']:
                    logger.error(f"❌ Invalid related_type_id: {related_type_id}")
                    return jsonify({
                        "status": "error",
                        "error": {"message": "Invalid related_type_id. Must be: 1, 2, 3, or 4"},
                        "version": "1.0"
                    }), 400
            else:
                logger.info("📋 Processing JSON data")
                # Get data from JSON
                data = request.get_json()
                content = data.get('content', '')
                # Sanitize HTML content
                content = BaseEntityUtils.sanitize_rich_text(content)
                related_type_id = data.get('related_type_id')
                related_id = data.get('related_id')
                attachment_filename = data.get('attachment')
                logger.info(f"📋 JSON data - content: {content[:50]}..., related_type_id: {related_type_id}, related_id: {related_id}, attachment: {attachment_filename}")
                
                # Validate related_type_id
                if not related_type_id or related_type_id not in [1, 2, 3, 4]:
                    logger.error(f"❌ Invalid related_type_id: {related_type_id}")
                    return jsonify({
                        "status": "error",
                        "error": {"message": "Invalid related_type_id. Must be: 1, 2, 3, or 4"},
                        "version": "1.0"
                    }), 400
            
            # Determine relation using related_type_id and related_id
            if not related_type_id or not related_id:
                logger.error("❌ No relation found")
                return jsonify({
                    "status": "error",
                    "error": {"message": "Note must have related_type_id and related_id"},
                    "version": "1.0"
                }), 400
            
            logger.info(f"🔍 Determining relation - related_type_id: {related_type_id}, related_id: {related_id}")
            
            # Convert string to int if needed
            related_type_id = int(related_type_id) if isinstance(related_type_id, str) else related_type_id
            
            logger.info(f"✅ Relation determined: related_type_id={related_type_id} -> {related_id}")
            
            # Prepare data for validation
            update_data = {
                'content': content,
                'related_type_id': related_type_id,
                'related_id': related_id
            }
            if attachment_filename:
                update_data['attachment'] = attachment_filename
            
            # Validate data against constraints
            logger.info("Validating note data before update")
            is_valid, errors = ValidationService.validate_data(db, 'notes', update_data, exclude_id=note_id)
            if not is_valid:
                error_message = "; ".join(errors)
                logger.error(f"Note validation failed: {error_message}")
                # Delete new file if validation failed
                if attachment_filename:
                    delete_uploaded_file(attachment_filename)
                return jsonify({
                    "status": "error",
                    "error": {"message": f"Note validation failed: {error_message}"},
                    "version": "1.0"
                }), 400
            
            # Update fields
            logger.info(f"📝 Updating note fields - content: {content[:50]}..., attachment: {attachment_filename}")
            note.content = content
            
            # Handle attachment updates
            if attachment_filename:
                # Delete old file if exists
                if note.attachment:
                    logger.info(f"🗑️ Deleting old attachment: {note.attachment}")
                    delete_uploaded_file(note.attachment)
                note.attachment = attachment_filename
                logger.info(f"📎 New attachment set: {attachment_filename}")
            elif request.form.get('remove_attachment') == 'true':
                # Remove attachment if requested
                if note.attachment:
                    logger.info(f"🗑️ Removing attachment: {note.attachment}")
                    delete_uploaded_file(note.attachment)
                    note.attachment = None
                    logger.info("📎 Attachment removed")
            
            note.related_type_id = related_type_id
            note.related_id = related_id
            
            logger.info("💾 Committing to database...")
            db.commit()
            db.refresh(note)
            logger.info("✅ Note updated successfully")
            normalizer = _get_notes_normalizer()
            payload = normalizer.normalize_output(note.to_dict())
            return jsonify({
                "status": "success",
                "data": payload,
                "message": "Note updated successfully",
                "timestamp": normalizer.now_envelope(),
                "version": "1.0"
            })
        logger.error(f"❌ Note not found: {note_id}")
        return jsonify({
            "status": "error",
            "error": {"message": "Note not found"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"❌ Error updating note {note_id}: {str(e)}")
        logger.error(f"❌ Exception type: {type(e).__name__}")
        import traceback
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")
        
        # Delete new file if there was an error updating the note
        if 'attachment_filename' in locals() and attachment_filename:
            logger.info(f"🗑️ Cleaning up attachment file: {attachment_filename}")
            delete_uploaded_file(attachment_filename)
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    # Don't close db here - handle_database_session decorator will do it

@notes_bp.route('/<int:note_id>', methods=['DELETE'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['notes'])
def delete_note(note_id: int):
    """Delete note"""
    try:
        # Use the session from the decorator (in g.db)
        db: Session = g.db
        note = db.query(Note).filter(Note.id == note_id).first()
        if note:
            # Delete attached file if exists
            if note.attachment:
                delete_uploaded_file(note.attachment)

            try:
                TagService.remove_all_tags_for_entity(db, 'note', note_id)
            except ValueError as tag_error:
                logger.warning(
                    "Failed to remove tags for note %s before deletion: %s",
                    note_id,
                    tag_error,
                )
            
            # Delete note from database
            db.delete(note)
            db.commit()
            normalizer = _get_notes_normalizer()
            return jsonify({
                "status": "success",
                "message": "Note deleted successfully",
                "timestamp": normalizer.now_envelope(),
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Note not found"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error deleting note {note_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 500
    # Don't close db here - handle_database_session decorator will do it

@notes_bp.route('/files/cleanup', methods=['POST'])
def cleanup_files():
    """Clean up orphaned files"""
    try:
        deleted_count = cleanup_orphaned_files()
        return jsonify({
            "status": "success",
            "message": f"Cleaned up {deleted_count} orphaned files",
            "deleted_count": deleted_count,
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error in cleanup endpoint: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 500

@notes_bp.route('/files/<filename>', methods=['GET', 'DELETE'])
def handle_file(filename: str):
    """File handling - display and delete"""
    if request.method == 'GET':
        """Display uploaded file"""
        try:
            return send_from_directory(UPLOAD_FOLDER, filename)
        except Exception as e:
            logger.error(f"Error serving file {filename}: {str(e)}")
            return jsonify({
                "status": "error",
                "error": {"message": "File not found"},
                "version": "1.0"
            }), 404
    elif request.method == 'DELETE':
        """Delete single file (for maintenance purposes)"""
        try:
            if delete_uploaded_file(filename):
                return jsonify({
                    "status": "success",
                    "message": "File deleted successfully",
                    "version": "1.0"
                })
            else:
                return jsonify({
                    "status": "error",
                    "error": {"message": "File not found or could not be deleted"},
                    "version": "1.0"
                }), 404
        except Exception as e:
            logger.error(f"Error deleting file {filename}: {str(e)}")
            return jsonify({
                "status": "error",
                "error": {"message": str(e)},
                "version": "1.0"
            }), 500
