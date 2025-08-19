from flask import Blueprint, jsonify, request, send_from_directory
from config.database import get_db
from models.note import Note
import logging
import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from typing import Optional, Dict, Any, List
from werkzeug.datastructures import FileStorage
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

notes_bp = Blueprint('notes', __name__, url_prefix='/api/v1/notes')

# הגדרות לקבצים
UPLOAD_FOLDER = 'uploads/notes'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}
MAX_FILE_SIZE = 524288  # 512KB

def allowed_file(filename: str) -> bool:
    """בדיקה אם סיומת הקובץ מותרת"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file: FileStorage) -> Optional[str]:
    """שמירת קובץ שהועלה עם שם ייחודי"""
    logger.info(f"📎 save_uploaded_file called with file: {file.filename if file else 'None'}")
    
    if file and allowed_file(file.filename):
        logger.info(f"✅ File type allowed: {file.filename}")
        # יצירת שם קובץ ייחודי עם תאריך
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_id = str(uuid.uuid4())[:8]
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        
        new_filename = f"{timestamp}_{unique_id}_{name}{ext}"
        file_path = os.path.join(UPLOAD_FOLDER, new_filename)
        
        logger.info(f"📎 Saving file to: {file_path}")
        
        # שמירת הקובץ
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
    """מחיקת קובץ שהועלה"""
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
    """ניקוי קבצים יתומים (קבצים שלא מקושרים להערות)"""
    try:
        db = next(get_db())
        
        # קבלת כל שמות הקבצים המקושרים להערות
        notes = db.query(Note).filter(Note.attachment.isnot(None)).all()
        attached_files = {note.attachment for note in notes if note.attachment}
        
        # קבלת כל הקבצים בתיקייה
        if os.path.exists(UPLOAD_FOLDER):
            files_in_folder = set(os.listdir(UPLOAD_FOLDER))
            
            # מציאת קבצים יתומים
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

@notes_bp.route('/', methods=['GET'])
def get_notes():
    """קבלת כל ההערות"""
    try:
        logger.info("🔄 Starting get_notes function")
        db = next(get_db())
        logger.info("✅ Database connection established")
        
        # שימוש ב-SQL ישיר במקום SQLAlchemy
        try:
            result = db.execute("SELECT * FROM notes ORDER BY created_at DESC")
            notes_data = result.fetchall()
            logger.info(f"✅ Successfully retrieved {len(notes_data)} notes using direct SQL")
            
            # המרה למילונים
            notes_list = []
            for row in notes_data:
                # קביעת related_type לפי related_type_id
                related_type = None
                if row[3] == 1:  # related_type_id
                    related_type = 'account'
                elif row[3] == 2:
                    related_type = 'trade'
                elif row[3] == 3:
                    related_type = 'trade_plan'
                elif row[3] == 4:
                    related_type = 'ticker'
                
                note_dict = {
                    'id': row[0],
                    'content': row[1],
                    'attachment': row[2],
                    'related_type_id': row[3],
                    'related_id': row[4],
                    'created_at': row[5],
                    'related_type': related_type
                }
                
                # הוספת שדות לתאימות לאחור
                if row[3] == 1:  # account
                    note_dict['account_id'] = row[4]
                    note_dict['trade_id'] = None
                    note_dict['trade_plan_id'] = None
                elif row[3] == 2:  # trade
                    note_dict['account_id'] = None
                    note_dict['trade_id'] = row[4]
                    note_dict['trade_plan_id'] = None
                elif row[3] == 3:  # trade_plan
                    note_dict['account_id'] = None
                    note_dict['trade_id'] = None
                    note_dict['trade_plan_id'] = row[4]
                else:
                    note_dict['account_id'] = None
                    note_dict['trade_id'] = None
                    note_dict['trade_plan_id'] = None
                
                notes_list.append(note_dict)
            
        except Exception as sql_error:
            logger.error(f"❌ Error with direct SQL: {str(sql_error)}")
            return jsonify({
                "status": "error",
                "error": {"message": f"Database error: {str(sql_error)}"},
                "version": "v1"
            }), 500
            
        return jsonify({
            "status": "success",
            "data": notes_list,
            "message": "Notes retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"❌ Error getting notes: {str(e)}")
        import traceback
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to retrieve notes: {str(e)}"},
            "version": "v1"
        }), 500
    finally:
        if 'db' in locals():
            db.close()

@notes_bp.route('/<int:note_id>', methods=['GET'])
def get_note(note_id: int):
    """קבלת הערה לפי מזהה"""
    try:
        db = next(get_db())
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
def create_note():
    """יצירת הערה חדשה"""
    db = None
    try:
        db = next(get_db())
        
        # בדיקה אם יש קובץ או JSON
        if request.files:
            # טיפול בקבצים
            file = request.files.get('attachment')
            attachment_filename = None
            
            if file and file.filename:
                # בדיקת גודל הקובץ
                if file.content_length and file.content_length > MAX_FILE_SIZE:
                    return jsonify({
                        "status": "error",
                        "error": {"message": "File too large. Maximum size is 512KB"},
                        "version": "v1"
                    }), 400
                
                attachment_filename = save_uploaded_file(file)
                if not attachment_filename:
                    return jsonify({
                        "status": "error",
                        "error": {"message": "Invalid file type. Allowed: JPG, PNG, GIF, PDF"},
                        "version": "v1"
                    }), 400
            
            # קבלת נתונים מ-form data
            content = request.form.get('content', '')
            trade_plan_id = request.form.get('trade_plan_id')
            trade_id = request.form.get('trade_id')
            account_id = request.form.get('account_id')
        else:
            # קבלת נתונים מ-JSON
            data = request.get_json()
            content = data.get('content', '')
            trade_plan_id = data.get('trade_plan_id')
            trade_id = data.get('trade_id')
            account_id = data.get('account_id')
            attachment_filename = data.get('attachment')
        
        # קביעת הקשר לפי עדיפות: trade_plan > trade > account
        related_type_id = None
        related_id = None
        
        if trade_plan_id:
            related_type_id = 3  # trade_plan
            related_id = trade_plan_id
        elif trade_id:
            related_type_id = 2  # trade
            related_id = trade_id
        elif account_id:
            related_type_id = 1  # account
            related_id = account_id
        else:
            return jsonify({
                "status": "error",
                "error": {"message": "Note must be related to account, trade, or trade plan"},
                "version": "v1"
            }), 400
        
        # יצירת הערה עם המבנה החדש
        note_data = {
            'content': content,
            'attachment': attachment_filename,
            'related_type_id': related_type_id,
            'related_id': related_id
        }
        
        note = Note(**note_data)
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
        # מחיקת הקובץ אם הייתה שגיאה ביצירת ההערה
        if 'attachment_filename' in locals() and attachment_filename:
            delete_uploaded_file(attachment_filename)
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        if db:
            db.close()

@notes_bp.route('/<int:note_id>', methods=['PUT'])
def update_note(note_id: int):
    """עדכון הערה"""
    db = None
    try:
        logger.info(f"🔄 Starting update_note for note_id: {note_id}")
        logger.info(f"📋 Request method: {request.method}")
        logger.info(f"📋 Request content type: {request.content_type}")
        logger.info(f"📋 Request files: {list(request.files.keys()) if request.files else 'No files'}")
        logger.info(f"📋 Request form: {dict(request.form) if request.form else 'No form data'}")
        logger.info(f"📋 Request JSON: {request.get_json() if request.is_json else 'Not JSON'}")
        
        db = next(get_db())
        note = db.query(Note).filter(Note.id == note_id).first()
        if note:
            logger.info(f"✅ Found note: {note.id}")
            
            # בדיקה אם יש קובץ או JSON
            if request.files:
                logger.info("📎 Processing file upload")
                # טיפול בקבצים
                file = request.files.get('attachment')
                attachment_filename = None
                
                if file and file.filename:
                    logger.info(f"📎 File received: {file.filename}, size: {file.content_length}")
                    # בדיקת גודל הקובץ
                    if file.content_length and file.content_length > MAX_FILE_SIZE:
                        logger.warning(f"❌ File too large: {file.content_length} > {MAX_FILE_SIZE}")
                        return jsonify({
                            "status": "error",
                            "error": {"message": "File too large. Maximum size is 512KB"},
                            "version": "v1"
                        }), 400
                    
                    attachment_filename = save_uploaded_file(file)
                    logger.info(f"📎 File saved as: {attachment_filename}")
                    if not attachment_filename:
                        logger.error("❌ Failed to save file")
                        return jsonify({
                            "status": "error",
                            "error": {"message": "Invalid file type. Allowed: JPG, PNG, GIF, PDF"},
                            "version": "v1"
                        }), 400
                
                # קבלת נתונים מ-form data
                content = request.form.get('content', '')
                trade_plan_id = request.form.get('trade_plan_id')
                trade_id = request.form.get('trade_id')
                account_id = request.form.get('account_id')
                logger.info(f"📋 Form data - content: {content[:50]}..., trade_plan_id: {trade_plan_id}, trade_id: {trade_id}, account_id: {account_id}")
            else:
                logger.info("📋 Processing JSON data")
                # קבלת נתונים מ-JSON
                data = request.get_json()
                content = data.get('content', '')
                trade_plan_id = data.get('trade_plan_id')
                trade_id = data.get('trade_id')
                account_id = data.get('account_id')
                attachment_filename = data.get('attachment')
                logger.info(f"📋 JSON data - content: {content[:50]}..., trade_plan_id: {trade_plan_id}, trade_id: {trade_id}, account_id: {account_id}, attachment: {attachment_filename}")
            
            # קביעת הקשר לפי עדיפות: trade_plan > trade > account
            related_type_id = None
            related_id = None
            
            logger.info(f"🔍 Determining relation - trade_plan_id: {trade_plan_id}, trade_id: {trade_id}, account_id: {account_id}")
            
            if trade_plan_id:
                related_type_id = 3  # trade_plan
                related_id = trade_plan_id
            elif trade_id:
                related_type_id = 2  # trade
                related_id = trade_id
            elif account_id:
                related_type_id = 1  # account
                related_id = account_id
            else:
                logger.error("❌ No relation found")
                return jsonify({
                    "status": "error",
                    "error": {"message": "Note must be related to account, trade, or trade plan"},
                    "version": "v1"
                }), 400
            
            logger.info(f"✅ Relation determined: related_type_id={related_type_id} -> {related_id}")
            
            # עדכון השדות
            logger.info(f"📝 Updating note fields - content: {content[:50]}..., attachment: {attachment_filename}")
            note.content = content
            if attachment_filename:
                # מחיקת הקובץ הישן אם קיים
                if note.attachment:
                    logger.info(f"🗑️ Deleting old attachment: {note.attachment}")
                    delete_uploaded_file(note.attachment)
                note.attachment = attachment_filename
                logger.info(f"📎 New attachment set: {attachment_filename}")
            note.related_type_id = related_type_id
            note.related_id = related_id
            
            logger.info("💾 Committing to database...")
            db.commit()
            db.refresh(note)
            logger.info("✅ Note updated successfully")
            return jsonify({
                "status": "success",
                "data": note.to_dict(),
                "message": "Note updated successfully",
                "version": "v1"
            })
        logger.error(f"❌ Note not found: {note_id}")
        return jsonify({
            "status": "error",
            "error": {"message": "Note not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"❌ Error updating note {note_id}: {str(e)}")
        logger.error(f"❌ Exception type: {type(e).__name__}")
        import traceback
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")
        
        # מחיקת הקובץ החדש אם הייתה שגיאה בעדכון ההערה
        if 'attachment_filename' in locals() and attachment_filename:
            logger.info(f"🗑️ Cleaning up attachment file: {attachment_filename}")
            delete_uploaded_file(attachment_filename)
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        if db:
            logger.info("🔒 Closing database connection")
            db.close()

@notes_bp.route('/<int:note_id>', methods=['DELETE'])
def delete_note(note_id: int):
    """מחיקת הערה"""
    try:
        db = next(get_db())
        note = db.query(Note).filter(Note.id == note_id).first()
        if note:
            # מחיקת הקובץ המצורף אם קיים
            if note.attachment:
                delete_uploaded_file(note.attachment)
            
            # מחיקת ההערה מהמסד נתונים
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

@notes_bp.route('/files/cleanup', methods=['POST'])
def cleanup_files():
    """ניקוי קבצים יתומים"""
    try:
        deleted_count = cleanup_orphaned_files()
        return jsonify({
            "status": "success",
            "message": f"Cleaned up {deleted_count} orphaned files",
            "deleted_count": deleted_count,
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error in cleanup endpoint: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 500

@notes_bp.route('/files/<filename>', methods=['GET', 'DELETE'])
def handle_file(filename: str):
    """טיפול בקבצים - הצגה ומחיקה"""
    if request.method == 'GET':
        """הצגת קובץ שהועלה"""
        try:
            return send_from_directory(UPLOAD_FOLDER, filename)
        except Exception as e:
            logger.error(f"Error serving file {filename}: {str(e)}")
            return jsonify({
                "status": "error",
                "error": {"message": "File not found"},
                "version": "v1"
            }), 404
    elif request.method == 'DELETE':
        """מחיקת קובץ בודד (למטרות תחזוקה)"""
        try:
            if delete_uploaded_file(filename):
                return jsonify({
                    "status": "success",
                    "message": "File deleted successfully",
                    "version": "v1"
                })
            else:
                return jsonify({
                    "status": "error",
                    "error": {"message": "File not found or could not be deleted"},
                    "version": "v1"
                }), 404
        except Exception as e:
            logger.error(f"Error deleting file {filename}: {str(e)}")
            return jsonify({
                "status": "error",
                "error": {"message": str(e)},
                "version": "v1"
            }), 500
