from flask import Blueprint, jsonify, request, send_from_directory, g
from config.database import get_db
from models.note import Note
from services.validation_service import ValidationService
from services.advanced_cache_service import cache_for, invalidate_cache
from services.date_normalization_service import DateNormalizationService
from services.preferences_service import PreferencesService
from services.business_logic import NoteBusinessService
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
@handle_database_session()
def get_notes():
    """Get all notes (filtered by user_id if authenticated)"""
    try:
        logger.info("🔄 Starting get_notes function")
        db: Session = g.db
        logger.info("✅ Database connection established")
        
        # Get user_id from Flask context (set by auth middleware)
        user_id = getattr(g, 'user_id', None)
        logger.info(f"🔍 User ID from context: {user_id}")
        
        # Use SQLAlchemy ORM to ensure correct column mapping
        try:
            query = db.query(Note).order_by(Note.created_at.desc())
            # Filter by user_id if authenticated
            if user_id is not None:
                query = query.filter(Note.user_id == user_id)
                logger.info(f"✅ Filtering notes by user_id: {user_id}")
            notes = query.all()
            logger.info(f"✅ Successfully retrieved {len(notes)} notes using ORM")
            
            # Convert to dictionaries using to_dict() which handles column mapping correctly
            notes_list = []
            for note in notes:
                note_dict = note.to_dict()
                
                # Set related_type according to related_type_id
                related_type = None
                if note.related_type_id == 1:
                    related_type = 'trading_account'
                elif note.related_type_id == 2:
                    related_type = 'trade'
                elif note.related_type_id == 3:
                    related_type = 'trade_plan'
                elif note.related_type_id == 4:
                    related_type = 'ticker'
                
                note_dict['related_type'] = related_type
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
    # Don't close db here - handle_database_session decorator will do it

@notes_bp.route('/<int:note_id>', methods=['GET'])
@handle_database_session()
def get_note(note_id: int):
    """Get note by ID (filtered by user_id if authenticated)"""
    try:
        db: Session = g.db
        # Get user_id from Flask context (set by auth middleware)
        user_id = getattr(g, 'user_id', None)
        
        query = db.query(Note).filter(Note.id == note_id)
        # Filter by user_id if authenticated
        if user_id is not None:
            query = query.filter(Note.user_id == user_id)
        note = query.first()
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
    # Don't close db here - handle_database_session decorator will do it

@notes_bp.route('/', methods=['POST'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['notes'])
def create_note():
    """Create new note"""
    try:
        # Log initial request details
        logger.info(f"🔄 Creating note - Request method: {request.method}, Content-Type: {request.content_type}")
        logger.debug(f"📋 Request JSON: {request.get_json() if request.is_json else 'Not JSON'}")
        logger.debug(f"📋 Request form: {dict(request.form) if request.form else 'No form data'}")
        logger.debug(f"📋 Request files: {list(request.files.keys()) if request.files else 'No files'}")
        
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
                    logger.warning(f"⚠️ File too large: {file.content_length} bytes")
                    return jsonify({
                        "status": "error",
                        "error": {"message": "File too large. Maximum size is 512KB"},
                        "version": "1.0"
                    }), 400
                
                attachment_filename = save_uploaded_file(file)
                if not attachment_filename:
                    logger.warning(f"⚠️ Invalid file type: {file.filename}")
                    return jsonify({
                        "status": "error",
                        "error": {"message": "Invalid file type. Allowed: JPG, PNG, GIF, PDF"},
                        "version": "1.0"
                    }), 400
                logger.info(f"📎 Attachment saved: {attachment_filename}")
            
            # Get data from form data
            content = request.form.get('content', '')
            logger.debug(f"🔍 DEBUG: Content from form - type: {type(content)}, length: {len(content) if content else 0}")
            logger.debug(f"🔍 DEBUG: Content preview: {content[:100] if content else 'None'}...")
            
            # Check content before sanitization
            if not content or len(content.strip()) == 0:
                logger.warning(f"⚠️ Empty content received from form. Request form keys: {list(request.form.keys())}")
                return jsonify({
                    "status": "error",
                    "error": {"message": "Note content is required"},
                    "version": "1.0"
                }), 400
            
            # Sanitize HTML content
            if content:
                original_length = len(content)
                content = BaseEntityUtils.sanitize_rich_text(content)
                if content and len(content) != original_length:
                    logger.warning(f"⚠️ Content length changed after sanitization: {original_length} -> {len(content)}")
                logger.info(f"📝 Content extracted from form: length={len(content) if content else 0}, has_content={bool(content)}")
            else:
                logger.error(f"❌ Content is None from form - cannot sanitize. Request form keys: {list(request.form.keys())}")
                content = None
            
            related_type_id = request.form.get('related_type_id')
            related_id = request.form.get('related_id')
        else:
            # Get data from JSON - try multiple methods
            # IMPORTANT: Use get_data() directly to bypass normalization that might affect content
            data = None
            try:
                # First try: get raw data and parse manually (bypasses _normalized_get_json)
                raw_data = request.get_data(as_text=True)
                if raw_data:
                    import json
                    data = json.loads(raw_data)
                    logger.info(f"🔍 DEBUG: Manual JSON parse from get_data() returned: {data}")
                else:
                    logger.warning(f"⚠️ get_data() returned empty, trying get_json()")
                    # Fallback: try get_json (with normalization)
                    data = request.get_json(force=True, silent=True)
                    logger.info(f"🔍 DEBUG: get_json(force=True, silent=True) returned: {data}")
            except Exception as e:
                logger.warning(f"⚠️ Manual JSON parse failed: {e}, trying get_json()")
                # Final fallback: try get_json
                try:
                    data = request.get_json(force=True, silent=True)
                    logger.info(f"🔍 DEBUG: get_json fallback returned: {data}")
                except Exception as e2:
                    logger.error(f"❌ get_json also failed: {e2}")
                    data = None
            
            logger.info(f"🔍 DEBUG: Final data: {data}")
            logger.info(f"🔍 DEBUG: Request content-type: {request.content_type}")
            logger.info(f"🔍 DEBUG: Request is_json: {request.is_json}")
            
            # Extract content - handle both 'content' and potential other field names
            content = None
            if data:
                content = data.get('content') or data.get('note') or data.get('text') or ''
                # Convert to string if not already
                if content is not None:
                    content = str(content).strip()
                else:
                    content = ''
            else:
                logger.error(f"❌ No data received from request!")
                content = ''
            
            logger.info(f"🔍 DEBUG: Content from JSON - type: {type(content)}, length: {len(content) if content else 0}")
            logger.info(f"🔍 DEBUG: Content value: {content[:100] if content else 'None'}...")
            
            # Check content before sanitization
            if not content or len(content.strip()) == 0:
                logger.warning(f"⚠️ Empty content received from JSON. Request data keys: {list(data.keys()) if data else 'None'}")
                logger.debug(f"🔍 DEBUG: Full request data: {data}")
                return jsonify({
                    "status": "error",
                    "error": {"message": "Note content is required"},
                    "version": "1.0"
                }), 400
            
            # Sanitize HTML content - but preserve original if sanitization fails
            if content:
                original_content = content
                original_length = len(content)
                sanitized_content = BaseEntityUtils.sanitize_rich_text(content)
                # Check if sanitization removed all content
                if sanitized_content and len(sanitized_content.strip()) > 0:
                    content = sanitized_content
                    if len(content) != original_length:
                        logger.warning(f"⚠️ Content length changed after sanitization: {original_length} -> {len(content)}")
                    logger.info(f"📝 Content extracted from JSON: length={len(content) if content else 0}, has_content={bool(content)}")
                else:
                    # Sanitization removed all content - use original if it was valid
                    logger.warning(f"⚠️ Sanitization removed all content, using original")
                    content = original_content.strip() if original_content else ''
                    if not content or len(content.strip()) == 0:
                        logger.error(f"❌ Content is empty after sanitization. Original: {original_content[:50]}")
                        return jsonify({
                            "status": "error",
                            "error": {"message": "Note content is required and cannot be empty"},
                            "version": "1.0"
                        }), 400
            else:
                logger.error(f"❌ Content is None - cannot sanitize. Request data: {data}")
                content = ''
            
            related_type_id = data.get('related_type_id') if data else None
            related_id = data.get('related_id') if data else None
            attachment_filename = data.get('attachment') if data else None
        
        # Determine relation using related_type_id and related_id
        if not related_type_id or not related_id:
            logger.warning(f"⚠️ Missing relation data - related_type_id: {related_type_id}, related_id: {related_id}")
            return jsonify({
                "status": "error",
                "error": {"message": "Note must have related_type_id and related_id"},
                "version": "1.0"
            }), 400
        
        # Validate related_type_id
        valid_types = [1, 2, 3, 4]  # account, trade, trade_plan, ticker
        if int(related_type_id) not in valid_types:
            logger.warning(f"⚠️ Invalid related_type_id: {related_type_id}")
            return jsonify({
                "status": "error",
                "error": {"message": "Invalid related_type_id. Must be: 1 (account), 2 (trade), 3 (trade_plan), or 4 (ticker)"},
                "version": "1.0"
            }), 400
        
        # Get user_id from Flask context (set by auth middleware)
        user_id = getattr(g, 'user_id', None)
        logger.debug(f"🔍 DEBUG: User ID from context: {user_id}, Type: {type(user_id)}")
        if not user_id:
            logger.error("❌ User ID not found in Flask context - user not authenticated")
            return jsonify({
                "status": "error",
                "error": {"message": "User authentication required"},
                "version": "1.0"
            }), 401
        logger.info(f"✅ User ID verified: {user_id}")
        
        # Validate content exists before creating note_data
        if not content or (isinstance(content, str) and len(content.strip()) == 0):
            logger.error(f"❌ Content is empty or None - cannot create note. Content type: {type(content)}, Content value: {content[:100] if content else 'None'}")
            return jsonify({
                "status": "error",
                "error": {"message": "Note content is required and cannot be empty"},
                "version": "1.0"
            }), 400
        
        # Create note with new structure
        note_data = {
            'user_id': user_id,
            'content': content,
            'attachment': attachment_filename,
            'related_type_id': related_type_id,
            'related_id': related_id
        }
        content_length = len(content) if content else 0
        logger.debug(f"📋 Note data prepared: user_id={note_data['user_id']}, content_length={content_length}, related_type_id={note_data['related_type_id']}, related_id={note_data['related_id']}")
        logger.info(f"✅ Note data prepared with: content_length={content_length}, related_type_id={related_type_id}, related_id={related_id}, user_id={user_id}")
        
        # Initialize Business Logic Service and validate
        logger.info("🔄 Validating note data using Business Logic Layer")
        note_service = NoteBusinessService(db_session=db)
        validation_result = note_service.validate(note_data)
        
        if not validation_result['is_valid']:
            error_message = "; ".join(validation_result['errors'])
            logger.error(f"❌ Note business validation failed: {error_message}")
            logger.debug(f"🔍 DEBUG: Validation result: {validation_result}")
            # Delete file if validation failed
            if attachment_filename:
                delete_uploaded_file(attachment_filename)
            return jsonify({
                "status": "error",
                "error": {"message": f"Note validation failed: {error_message}"},
                "version": "1.0"
            }), 400
        
        logger.info(f"✅ Validation passed: {validation_result['is_valid']}")
        logger.debug(f"🔍 DEBUG: Validation result: {validation_result}")
        
        # Create note in database
        logger.info("💾 Creating note in database...")
        note = Note(**note_data)
        db.add(note)
        db.commit()
        db.refresh(note)
        
        logger.info(f"✅ Note created successfully: id={note.id}")
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
        logger.error(f"❌ Error creating note: {str(e)}", exc_info=True)
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
        
        # Get user_id from Flask context (set by auth middleware)
        user_id = getattr(g, 'user_id', None)
        
        if user_id is None:
            return jsonify({
                "status": "error",
                "error": {"message": "User authentication required"},
                "version": "1.0"
            }), 401
        
        # Use the session from the decorator (in g.db)
        db: Session = g.db
        note = db.query(Note).filter(Note.id == note_id, Note.user_id == user_id).first()
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
        # Get user_id from Flask context (set by auth middleware)
        user_id = getattr(g, 'user_id', None)
        
        if user_id is None:
            return jsonify({
                "status": "error",
                "error": {"message": "User authentication required"},
                "version": "1.0"
            }), 401
        
        # Use the session from the decorator (in g.db)
        db: Session = g.db
        note = db.query(Note).filter(Note.id == note_id, Note.user_id == user_id).first()
        if note:
            # Delete attached file if exists
            if note.attachment:
                delete_uploaded_file(note.attachment)
            
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
