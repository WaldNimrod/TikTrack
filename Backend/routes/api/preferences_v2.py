"""
User Preferences API V2 - TikTrack New Architecture
==================================================

API מתקדם למערכת הגדרות משתמש עם תמיכה בפרופילים מרובים,
יבוא/יצוא הגדרות ומיגרציה מV1.

Author: TikTrack Development Team
Version: 2.0
Date: January 2025
"""

from flask import Blueprint, request, jsonify, send_file
from sqlalchemy.orm import Session
from config.database import get_db
from services.preferences_service_v2 import PreferencesServiceV2
from services.advanced_cache_service import cache_with_deps, invalidate_cache
from datetime import datetime
import tempfile
import json
import os
from typing import Optional

# Create blueprint
preferences_v2_bp = Blueprint('preferences_v2', __name__)


def get_user_id_from_request() -> int:
    """Get user ID from request (for now always default user)"""
    # בעתיד זה יקרא מה-session או token
    return 1  # Default user


@preferences_v2_bp.route('/api/v2/preferences/', methods=['GET'])
@cache_with_deps(ttl=300, dependencies=['preferences_v2'])
def get_preferences_v2():
    """קבל הגדרות V2 עבור המשתמש"""
    try:
        db: Session = next(get_db())
        user_id = get_user_id_from_request()
        profile_id = request.args.get('profile_id', type=int)
        
        # קבל הגדרות
        preferences = PreferencesServiceV2.get_preferences_v2(db, user_id, profile_id)
        if not preferences:
            return jsonify({
                'success': False,
                'error': 'Preferences not found',
                'code': 'PREFERENCES_NOT_FOUND'
            }), 404
        
        # קבל פרופיל
        profile = None
        if preferences.profile_id:
            profiles = PreferencesServiceV2.get_user_profiles(db, user_id)
            profile = next((p for p in profiles if p.id == preferences.profile_id), None)
        
        return jsonify({
            'success': True,
            'data': {
                'preferences': preferences.to_dict(),
                'profile': {
                    'id': profile.id if profile else None,
                    'name': profile.profile_name if profile else 'Unknown',
                    'description': profile.description if profile else '',
                    'isDefault': profile.is_default if profile else False
                } if profile else None
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'INTERNAL_ERROR'
        }), 500


@preferences_v2_bp.route('/api/v2/preferences/', methods=['POST'])
@invalidate_cache(['preferences_v2', 'preferences'])
def update_preferences_v2():
    """עדכן הגדרות V2"""
    try:
        db: Session = next(get_db())
        user_id = get_user_id_from_request()
        
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided',
                'code': 'NO_DATA'
            }), 400
        
        profile_id = data.get('profile_id')
        preferences_data = data.get('preferences', {})
        
        if not profile_id:
            # השתמש בפרופיל ברירת המחדל
            default_profile = PreferencesServiceV2.get_default_profile(db, user_id)
            if not default_profile:
                return jsonify({
                    'success': False,
                    'error': 'No default profile found',
                    'code': 'NO_DEFAULT_PROFILE'
                }), 404
            profile_id = default_profile.id
        
        success = PreferencesServiceV2.update_preferences_v2(
            db, user_id, profile_id, preferences_data, user_id
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Preferences updated successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to update preferences',
                'code': 'UPDATE_FAILED'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'INTERNAL_ERROR'
        }), 500


@preferences_v2_bp.route('/api/v2/preferences/profiles', methods=['GET'])
def get_user_profiles():
    """קבל את כל הפרופילים של המשתמש"""
    try:
        db: Session = next(get_db())
        user_id = get_user_id_from_request()
        
        profiles = PreferencesServiceV2.get_user_profiles(db, user_id)
        
        profiles_data = []
        for profile in profiles:
            profiles_data.append({
                'id': profile.id,
                'name': profile.profile_name,
                'description': profile.description,
                'isDefault': profile.is_default,
                'isActive': profile.is_active,
                'createdAt': profile.created_at.isoformat() if profile.created_at else None,
                'lastUsed': profile.last_used_at.isoformat() if profile.last_used_at else None,
                'usageCount': profile.usage_count
            })
        
        return jsonify({
            'success': True,
            'data': profiles_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'INTERNAL_ERROR'
        }), 500


@preferences_v2_bp.route('/api/v2/preferences/profiles', methods=['POST'])
@invalidate_cache(['preferences_v2'])
def create_profile():
    """צור פרופיל חדש"""
    try:
        db: Session = next(get_db())
        user_id = get_user_id_from_request()
        
        data = request.get_json()
        if not data or 'name' not in data:
            return jsonify({
                'success': False,
                'error': 'Profile name is required',
                'code': 'NAME_REQUIRED'
            }), 400
        
        profile_name = data['name']
        description = data.get('description', '')
        is_default = data.get('isDefault', False)
        
        profile = PreferencesServiceV2.create_profile(
            db, user_id, profile_name, is_default, description
        )
        
        return jsonify({
            'success': True,
            'data': {
                'id': profile.id,
                'name': profile.profile_name,
                'description': profile.description,
                'isDefault': profile.is_default,
                'createdAt': profile.created_at.isoformat() if profile.created_at else None
            }
        }), 201
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'VALIDATION_ERROR'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'INTERNAL_ERROR'
        }), 500


@preferences_v2_bp.route('/api/v2/preferences/migrate', methods=['POST'])
@invalidate_cache(['preferences_v2', 'preferences'])
def migrate_from_v1():
    """מגרר הגדרות מV1 לV2"""
    try:
        db: Session = next(get_db())
        user_id = get_user_id_from_request()
        
        data = request.get_json() or {}
        force = data.get('force', False)
        
        success = PreferencesServiceV2.migrate_from_v1(db, user_id, force)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Migration completed successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Migration failed',
                'code': 'MIGRATION_FAILED'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'INTERNAL_ERROR'
        }), 500


@preferences_v2_bp.route('/api/v2/preferences/export', methods=['GET'])
def export_preferences():
    """יצא הגדרות לקובץ"""
    try:
        db: Session = next(get_db())
        user_id = get_user_id_from_request()
        
        profile_id = request.args.get('profile_id', type=int)
        include_sensitive = request.args.get('include_sensitive', 'false').lower() == 'true'
        
        export_data = PreferencesServiceV2.export_preferences(
            db, user_id, profile_id, include_sensitive
        )
        
        if not export_data:
            return jsonify({
                'success': False,
                'error': 'No preferences found to export',
                'code': 'NO_PREFERENCES'
            }), 404
        
        # צור קובץ זמני
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)
            temp_file = f.name
        
        # קבע שם קובץ
        profile_name = export_data.get('profile', {}).get('name', 'default')
        filename = f"tiktrack_preferences_{profile_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        return send_file(
            temp_file,
            as_attachment=True,
            download_name=filename,
            mimetype='application/json'
        )
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'INTERNAL_ERROR'
        }), 500
    finally:
        # נקה קובץ זמני
        if 'temp_file' in locals():
            try:
                os.unlink(temp_file)
            except:
                pass


@preferences_v2_bp.route('/api/v2/preferences/import', methods=['POST'])
@invalidate_cache(['preferences_v2', 'preferences'])
def import_preferences():
    """יבא הגדרות מקובץ"""
    try:
        db: Session = next(get_db())
        user_id = get_user_id_from_request()
        
        # בדוק אם יש קובץ
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided',
                'code': 'NO_FILE'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected',
                'code': 'NO_FILE_SELECTED'
            }), 400
        
        # אפשרויות ייבוא
        create_new_profile = request.form.get('create_new_profile', 'true').lower() == 'true'
        profile_name = request.form.get('profile_name', '')
        
        try:
            # קרא את הקובץ
            import_data = json.loads(file.read().decode('utf-8'))
        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            return jsonify({
                'success': False,
                'error': 'Invalid JSON file',
                'code': 'INVALID_JSON'
            }), 400
        
        success = PreferencesServiceV2.import_preferences(
            db, user_id, import_data, create_new_profile, profile_name
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Preferences imported successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Import failed',
                'code': 'IMPORT_FAILED'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'INTERNAL_ERROR'
        }), 500


@preferences_v2_bp.route('/api/v2/preferences/history', methods=['GET'])
def get_preference_history():
    """קבל היסטוריית שינויים"""
    try:
        db: Session = next(get_db())
        user_id = get_user_id_from_request()
        
        profile_id = request.args.get('profile_id', type=int)
        days = request.args.get('days', 30, type=int)
        
        # הגבל ל-365 ימים
        days = min(days, 365)
        
        history = PreferencesServiceV2.get_preference_history(db, user_id, profile_id, days)
        
        history_data = []
        for entry in history:
            history_data.append({
                'id': entry.id,
                'changeType': entry.change_type,
                'fieldName': entry.field_name,
                'oldValue': json.loads(entry.old_value) if entry.old_value else None,
                'newValue': json.loads(entry.new_value) if entry.new_value else None,
                'changedBy': entry.changed_by,
                'changeReason': entry.change_reason,
                'createdAt': entry.created_at.isoformat() if entry.created_at else None
            })
        
        return jsonify({
            'success': True,
            'data': history_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'INTERNAL_ERROR'
        }), 500


@preferences_v2_bp.route('/api/v2/preferences/validate', methods=['GET'])
def validate_user_preferences():
    """בדוק תקינות הגדרות המשתמש"""
    try:
        db: Session = next(get_db())
        user_id = get_user_id_from_request()
        profile_id = request.args.get('profile_id', type=int)
        
        preferences = PreferencesServiceV2.get_preferences_v2(db, user_id, profile_id)
        if not preferences:
            return jsonify({
                'success': False,
                'error': 'Preferences not found',
                'code': 'PREFERENCES_NOT_FOUND'
            }), 404
        
        errors = preferences.validate()
        is_valid = len(errors) == 0
        
        return jsonify({
            'success': True,
            'data': {
                'isValid': is_valid,
                'errors': errors,
                'lastValidation': preferences.last_validation.isoformat() if preferences.last_validation else None
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'INTERNAL_ERROR'
        }), 500


@preferences_v2_bp.route('/api/v2/preferences/system/validate', methods=['POST'])
def validate_all_preferences():
    """בדוק תקינות של כל ההגדרות במערכת (Admin only)"""
    try:
        db: Session = next(get_db())
        
        validation_results = PreferencesServiceV2.validate_all_preferences(db)
        
        return jsonify({
            'success': True,
            'data': {
                'totalInvalid': len(validation_results),
                'results': validation_results,
                'validatedAt': datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'INTERNAL_ERROR'
        }), 500


@preferences_v2_bp.route('/api/v2/preferences/system/stats', methods=['GET'])
def get_system_statistics():
    """קבל סטטיסטיקות מערכת העדפות"""
    try:
        db: Session = next(get_db())
        
        stats = PreferencesServiceV2.get_system_statistics(db)
        
        return jsonify({
            'success': True,
            'data': stats
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'INTERNAL_ERROR'
        }), 500


@preferences_v2_bp.route('/api/v2/preferences/system/cleanup', methods=['POST'])
def cleanup_old_history():
    """נקה היסטוריה ישנה (Admin only)"""
    try:
        db: Session = next(get_db())
        
        data = request.get_json() or {}
        days = data.get('days', 90)
        
        # הגבל בין 7 ל-365 ימים
        days = max(7, min(days, 365))
        
        deleted_count = PreferencesServiceV2.cleanup_old_history(db, days)
        
        return jsonify({
            'success': True,
            'data': {
                'deletedEntries': deleted_count,
                'cleanupDate': datetime.utcnow().isoformat(),
                'retentionDays': days
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'INTERNAL_ERROR'
        }), 500


# Routes לבדיקת תאימות לאחור עם V1
@preferences_v2_bp.route('/api/v2/preferences/compatibility/v1', methods=['GET'])
def check_v1_compatibility():
    """בדוק תאימות עם V1"""
    try:
        db: Session = next(get_db())
        user_id = get_user_id_from_request()
        
        # בדוק אם יש נתונים בV1
        v1_data = PreferencesServiceV2._get_v1_preferences(db, user_id)
        has_v1_data = v1_data is not None
        
        # בדוק אם יש נתונים בV2
        v2_prefs = PreferencesServiceV2.get_preferences_v2(db, user_id)
        has_v2_data = v2_prefs is not None
        
        # בדוק אם V2 נוצר ממיגרציה
        migrated_from_v1 = v2_prefs.migrated_from_v1 if v2_prefs else False
        
        return jsonify({
            'success': True,
            'data': {
                'hasV1Data': has_v1_data,
                'hasV2Data': has_v2_data,
                'migratedFromV1': migrated_from_v1,
                'migrationDate': v2_prefs.migration_date.isoformat() if v2_prefs and v2_prefs.migration_date else None,
                'recommendation': (
                    'migration_needed' if has_v1_data and not has_v2_data else
                    'migration_complete' if has_v2_data and migrated_from_v1 else
                    'v2_only' if has_v2_data and not migrated_from_v1 else
                    'no_data'
                )
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'INTERNAL_ERROR'
        }), 500


@preferences_v2_bp.route('/api/v2/preferences/defaults', methods=['GET'])
@cache_with_deps(ttl=300, dependencies=['preferences_defaults'])
def get_defaults():
    """קבל ברירות מחדל נוכחיות"""
    try:
        defaults = PreferencesServiceV2.load_defaults_from_file()
        
        return jsonify({
            'success': True,
            'data': {
                'defaults': defaults,
                'lastUpdated': defaults.get('lastUpdated'),
                'version': defaults.get('version')
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'DEFAULTS_LOAD_FAILED'
        }), 500


@preferences_v2_bp.route('/api/v2/preferences/defaults', methods=['POST'])
def update_defaults():
    """עדכן ברירות מחדל"""
    try:
        data = request.get_json()
        if not data or 'defaults' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing defaults data',
                'code': 'INVALID_REQUEST'
            }), 400
        
        defaults = data['defaults']
        
        # שמור ברירות מחדל לקובץ
        success = PreferencesServiceV2.save_defaults_to_file(defaults)
        
        if success:
            # בטל מטמון
            invalidate_cache('preferences_defaults')
            
            return jsonify({
                'success': True,
                'message': 'Defaults updated successfully',
                'data': {
                    'lastUpdated': defaults.get('lastUpdated'),
                    'version': defaults.get('version')
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to save defaults',
                'code': 'SAVE_FAILED'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'DEFAULTS_UPDATE_FAILED'
        }), 500


@preferences_v2_bp.route('/api/v2/preferences/defaults/save-from-current', methods=['POST'])
def save_current_as_defaults():
    """שמור את ההגדרות הנוכחיות כברירות מחדל"""
    try:
        db: Session = next(get_db())
        user_id = get_user_id_from_request()
        data = request.get_json()
        
        profile_id = data.get('profile_id') if data else None
        
        # קבל הגדרות נוכחיות
        preferences = PreferencesServiceV2.get_preferences_v2(db, user_id, profile_id)
        if not preferences:
            return jsonify({
                'success': False,
                'error': 'No preferences found to save as defaults',
                'code': 'PREFERENCES_NOT_FOUND'
            }), 404
        
        # המר להגדרות ברירת מחדל
        defaults = preferences.to_dict()
        
        # שמור ברירות מחדל לקובץ
        success = PreferencesServiceV2.save_defaults_to_file(defaults)
        
        if success:
            # בטל מטמון
            invalidate_cache('preferences_defaults')
            
            return jsonify({
                'success': True,
                'message': 'Current preferences saved as defaults',
                'data': {
                    'lastUpdated': defaults.get('lastUpdated'),
                    'version': defaults.get('version')
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to save defaults',
                'code': 'SAVE_FAILED'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'SAVE_DEFAULTS_FAILED'
        }), 500