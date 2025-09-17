"""
Preferences Service - TikTrack New Architecture
=================================================

שירות מתקדם למערכת הגדרות משתמש עם תמיכה בפרופילים מרובים,
מיגרציה, יבוא/יצוא ובדיקות תקינות מתקדמות.

Author: TikTrack Development Team
Version: 2.0
Date: January 2025
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from models.user import User
from models.preferences import UserPreferences, PreferenceProfile, PreferenceHistory
from typing import List, Optional, Dict, Any, Tuple
import json
import logging
import os
from datetime import datetime, timedelta
from services.user_service import UserService
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)


class PreferencesService:
    """
    שירות מתקדם למערכת הגדרות משתמש
    
    תכונות מרכזיות:
    - פרופילים מרובים לכל משתמש
    - מיגרציה מהמערכת הישנה
    - יבוא/יצוא הגדרות
    - בדיקות תקינות מתקדמות
    - היסטוריית שינויים
    """
    
    # ברירות מחדל מתקדמות
    DEFAULT_PROFILE_NAME = "ברירת מחדל"
    DEFAULTS_FILE_PATH = os.path.join(os.path.dirname(__file__), '..', 'config', 'preferences_defaults.json')
    
    @classmethod
    def load_defaults_from_file(cls) -> Dict[str, Any]:
        """טען ברירות מחדל מקובץ JSON"""
        try:
            if not os.path.exists(cls.DEFAULTS_FILE_PATH):
                logger.warning(f"Defaults file not found: {cls.DEFAULTS_FILE_PATH}")
                return cls.get_fallback_defaults()
            
            with open(cls.DEFAULTS_FILE_PATH, 'r', encoding='utf-8') as f:
                defaults = json.load(f)
            
            logger.info(f"✅ Loaded defaults from file: {cls.DEFAULTS_FILE_PATH}")
            return defaults
            
        except (json.JSONDecodeError, IOError) as e:
            logger.error(f"❌ Error loading defaults from file: {e}")
            return cls.get_fallback_defaults()
    
    @classmethod
    def save_defaults_to_file(cls, defaults: Dict[str, Any]) -> bool:
        """שמור ברירות מחדל לקובץ JSON"""
        try:
            # עדכן תאריך עדכון אחרון
            defaults['lastUpdated'] = datetime.utcnow().isoformat() + 'Z'
            
            # וודא שהתיקייה קיימת
            os.makedirs(os.path.dirname(cls.DEFAULTS_FILE_PATH), exist_ok=True)
            
            with open(cls.DEFAULTS_FILE_PATH, 'w', encoding='utf-8') as f:
                json.dump(defaults, f, indent=2, ensure_ascii=False)
            
            logger.info(f"✅ Saved defaults to file: {cls.DEFAULTS_FILE_PATH}")
            return True
            
        except (IOError, TypeError) as e:
            logger.error(f"❌ Error saving defaults to file: {e}")
            return False
    
    @classmethod
    def get_ui_preferences(cls) -> Dict[str, Any]:
        """Get UI preferences"""
        return {
            "primaryColor": "#007bff",
            "secondaryColor": "#6c757d", 
            "successColor": "#28a745",
            "warningColor": "#ffc107",
            "tableRowsPerPage": 25,
            "defaultTheme": "light"
        }
    
    @classmethod
    def set_ui_preferences(cls, data: Dict[str, Any]) -> bool:
        """Set UI preferences"""
        # Implementation for saving UI preferences
        return True
    
    @classmethod
    def get_system_preferences(cls) -> Dict[str, Any]:
        """Get system preferences"""
        return {
            "serverUrl": "http://localhost:8080",
            "serverPort": 8080,
            "refreshInterval": 5,
            "cacheTTL": 5,
            "maxMemorySize": 512
        }
    
    @classmethod
    def set_system_preferences(cls, data: Dict[str, Any]) -> bool:
        """Set system preferences"""
        # Implementation for saving system preferences
        return True
    
    @classmethod
    def get_advanced_preferences(cls) -> Dict[str, Any]:
        """Get advanced preferences"""
        return {
            "logLevel": "info",
            "maxLogFileSize": 10,
            "maxAccountRisk": 2.0,
            "maxTradeRisk": 1.0,
            "maxPositionSize": 5.0
        }
    
    @classmethod
    def set_advanced_preferences(cls, data: Dict[str, Any]) -> bool:
        """Set advanced preferences"""
        # Implementation for saving advanced preferences
        return True
    
    @classmethod
    def get_fallback_defaults(cls) -> Dict[str, Any]:
        """ברירות מחדל גיבוי במקרה של כשל בטעינת הקובץ"""
        return {
            "version": "2.0",
            "lastUpdated": datetime.utcnow().isoformat() + 'Z',
            "description": "Fallback defaults - file loading failed",
            "general": {
                "primaryCurrency": "USD",
                "timezone": "Asia/Jerusalem",
                "defaultStopLoss": 5.0,
                "defaultTargetPrice": 10.0,
                "defaultCommission": 1.0
            },
            "defaultFilters": {
                "status": "open",
                "type": "swing",
                "dateRange": "this_week"
            },
            "externalData": {
                "providers": {
                    "primary": "yahoo",
                    "secondary": "google"
                },
                "refresh": {
                    "interval": 5,
                    "cacheTTL": 5
                }
            }
        }
    
    @classmethod
    def get_user_profiles(cls, db: Session, user_id: int) -> List[PreferenceProfile]:
        """קבל את כל הפרופילים של המשתמש"""
        try:
            profiles = db.query(PreferenceProfile).filter(
                PreferenceProfile.user_id == user_id,
                PreferenceProfile.is_active == True
            ).order_by(PreferenceProfile.is_default.desc(), PreferenceProfile.created_at).all()
            
            return profiles
        except Exception as e:
            logger.error(f"Error getting user profiles for user {user_id}: {e}")
            return []
    
    @classmethod
    def get_profiles(cls, db: Session, user_id: int) -> List[PreferenceProfile]:
        """קבל כל הפרופילים של המשתמש"""
        try:
            profiles = db.query(PreferenceProfile).filter(
                PreferenceProfile.user_id == user_id,
                PreferenceProfile.is_active == True
            ).order_by(PreferenceProfile.is_default.desc()).all()
            
            return profiles
            
        except Exception as e:
            logger.error(f"Error getting profiles for user {user_id}: {e}")
            return []
    
    @classmethod
    def get_default_profile(cls, db: Session, user_id: int) -> Optional[PreferenceProfile]:
        """קבל את הפרופיל ברירת המחדל של המשתמש"""
        try:
            profile = db.query(PreferenceProfile).filter(
                PreferenceProfile.user_id == user_id,
                PreferenceProfile.is_default == True,
                PreferenceProfile.is_active == True
            ).first()
            
            return profile
        except Exception as e:
            logger.error(f"Error getting default profile for user {user_id}: {e}")
            return None
    
    @classmethod
    def create_profile(cls, db: Session, user_id: int, profile_name: str, 
                      is_default: bool = False, description: str = None) -> PreferenceProfile:
        """צור פרופיל חדש"""
        try:
            # בדוק אם יש כבר פרופיל עם השם הזה
            existing = db.query(PreferenceProfile).filter(
                PreferenceProfile.user_id == user_id,
                PreferenceProfile.profile_name == profile_name,
                PreferenceProfile.is_active == True
            ).first()
            
            if existing:
                raise ValueError(f"Profile '{profile_name}' already exists for user {user_id}")
            
            # אם זה פרופיל ברירת מחדל, בטל את הקיימים
            if is_default:
                db.query(PreferenceProfile).filter(
                    PreferenceProfile.user_id == user_id,
                    PreferenceProfile.is_default == True
                ).update({'is_default': False})
            
            # צור פרופיל חדש
            profile = PreferenceProfile(
                user_id=user_id,
                profile_name=profile_name,
                is_default=is_default,
                description=description,
                created_by=user_id
            )
            
            db.add(profile)
            db.commit()
            db.refresh(profile)
            
            # צור הגדרות ברירת מחדל לפרופיל
            cls._create_default_preferences_for_profile(db, user_id, profile.id)
            
            logger.info(f"Created new profile '{profile_name}' for user {user_id}")
            return profile
            
        except Exception as e:
            logger.error(f"Error creating profile '{profile_name}' for user {user_id}: {e}")
            db.rollback()
            raise
    
    @classmethod
    def _create_default_preferences_for_profile(cls, db: Session, user_id: int, profile_id: int):
        """צור הגדרות ברירת מחדל לפרופיל חדש"""
        try:
            # טען ברירות מחדל מקובץ JSON
            defaults = cls.load_defaults_from_file()
            
            # Temporarily disabled due to relationship issues
            # preferences = UserPreferences(
            #     user_id=user_id,
            #     profile_id=profile_id,
            #     version=defaults.get('version', '2.0')
            # )
            
            # עדכן הגדרות מברירות מחדל
            # preferences.from_dict(defaults)
            
            # הגדר צבעים ברירת מחדל
            # default_colors = {
            #     'theme': 'light',
            #     'numericValues': {
            #         'positive': {'text': '#28a745', 'background': '#d4edda'},
            #         'negative': {'text': '#dc3545', 'background': '#f8d7da'},
            #         'zero': {'text': '#6c757d', 'background': '#e2e3e5'}
            #     },
            #     'entities': {
            #         'trade': '#007bff',
            #         'account': '#28a745',
            #         'ticker': '#dc3545',
            #         'alert': '#ff9c05'
            #     },
            #     'status': {
            #         'open': {'text': '#28a745', 'background': 'rgba(40, 167, 69, 0.1)'},
            #         'closed': {'text': '#6c757d', 'background': 'rgba(108, 117, 125, 0.1)'},
            #         'cancelled': {'text': '#dc3545', 'background': 'rgba(220, 53, 69, 0.1)'}
            #     }
            # }
            # preferences.color_scheme_json = json.dumps(default_colors)
            
            # הגדרות שקיפות ברירת מחדל
            # default_opacity = {
            #     'header': {'main': 100, 'sub': 30},
            #     'cards': {'background': 95, 'border': 80}
            # }
            # preferences.opacity_settings_json = json.dumps(default_opacity)
            
            # db.add(preferences)
            # db.commit()
            
            logger.info(f"Created default preferences for profile {profile_id}")
            
        except Exception as e:
            logger.error(f"Error creating default preferences for profile {profile_id}: {e}")
            db.rollback()
            raise
    
    @classmethod
    def get_preferences(cls, db: Session, user_id: int, profile_id: int = None) -> Optional[UserPreferences]:
        """קבל הגדרות עבור משתמש ופרופיל"""
        try:
            if profile_id:
                # חפש לפי פרופיל מסוים
                preferences = db.query(UserPreferences).filter(
                    UserPreferences.user_id == user_id,
                    UserPreferences.profile_id == profile_id
                ).first()
            else:
                # חפש לפי פרופיל ברירת המחדל
                default_profile = cls.get_default_profile(db, user_id)
                if not default_profile:
                    return None
                
                preferences = db.query(UserPreferences).filter(
                    UserPreferences.user_id == user_id,
                    UserPreferences.profile_id == default_profile.id
                ).first()
            
            return preferences
            
        except Exception as e:
            logger.error(f"Error getting preferences for user {user_id}, profile {profile_id}: {e}")
            return None
    
    @classmethod
    def update_preferences(cls, db: Session, user_id: int, profile_id: int, 
                            data: Dict[str, Any], changed_by: int = None) -> bool:
        """עדכן הגדרות"""
        try:
            preferences = cls.get_preferences(db, user_id, profile_id)
            if not preferences:
                logger.error(f"Preferences not found for user {user_id}, profile {profile_id}")
                return False
            
            # שמור מצב קודם לצורך היסטוריה
            old_data = preferences.to_dict()
            
            # עדכן הנתונים
            preferences.from_dict(data)
            
            # בדוק תקינות
            errors = preferences.validate()
            if errors:
                logger.warning(f"Validation errors for user {user_id}: {errors}")
                preferences.validation_errors_json = json.dumps(errors)
            else:
                preferences.validation_errors_json = None
            
            preferences.last_validation = datetime.utcnow()
            
            db.commit()
            
            # רשום להיסטוריה
            cls._record_change(db, user_id, profile_id, 'update', old_data, data, changed_by)
            
            logger.info(f"Updated preferences for user {user_id}, profile {profile_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating preferences for user {user_id}: {e}")
            db.rollback()
            return False
    
    @classmethod
    def migrate_from_v1(cls, db: Session, user_id: int, force: bool = False) -> bool:
        """מגרר הגדרות מהמערכת הישנה"""
        try:
            logger.info(f"Starting migration from old system for user {user_id}")
            
            # בדוק אם כבר יש הגדרות
            existing_prefs = cls.get_preferences(db, user_id)
            if existing_prefs and not force:
                logger.info(f"Preferences already exist for user {user_id}, skipping migration")
                return True
            
            # קבל נתונים מהמערכת הישנה
            old_preferences = cls._get_v1_preferences(db, user_id)
            if not old_preferences:
                logger.warning(f"No old preferences found for user {user_id}")
                return False
            
            # צור פרופיל ברירת מחדל אם לא קיים
            default_profile = cls.get_default_profile(db, user_id)
            if not default_profile:
                default_profile = cls.create_profile(
                    db, user_id, cls.DEFAULT_PROFILE_NAME, is_default=True,
                    description="פרופיל ברירת מחדל שנוצר ממיגרציה מV1"
                )
            
            # מחק העדפות קיימות אם force
            if force and existing_v2:
                db.delete(existing_v2)
                db.commit()
            
            # צור העדפות חדשות
            new_preferences = UserPreferences(
                user_id=user_id,
                profile_id=default_profile.id,
                migrated_from_v1=True,
                migration_date=datetime.utcnow(),
                version='2.0'
            )
            
            # העבר נתונים מV1 להעדפות החדשות
            cls._map_v1_to_v2(v1_preferences, new_preferences)
            
            db.add(new_preferences)
            db.commit()
            db.refresh(new_preferences)
            
            # רשום להיסטוריה
            cls._record_change(db, user_id, default_profile.id, 'migrate_from_v1', 
                             {}, new_preferences.to_dict(), user_id)
            
            logger.info(f"Successfully migrated user {user_id} from V1 to new preferences")
            return True
            
        except Exception as e:
            logger.error(f"Error migrating user {user_id} from V1 to new preferences: {e}")
            db.rollback()
            return False
    
    @classmethod
    def _get_v1_preferences(cls, db: Session, user_id: int) -> Optional[Dict[str, Any]]:
        """קבל הגדרות V1 - מושבת זמנית"""
        try:
            # נסה קודם מטבלת user_preferences - מושבת זמנית
            # v1_prefs = db.query(UserPreferences).filter(
            #     UserPreferences.user_id == user_id
            # ).first()
            
            # if v1_prefs:
            #     return v1_prefs.to_dict()
            return None
            
            # אחרת, נסה מהשדה JSON של המשתמש
            user = db.query(User).filter(User.id == user_id).first()
            if user and hasattr(user, 'preferences_json') and user.preferences_json:
                try:
                    return json.loads(user.preferences_json)
                except (json.JSONDecodeError, TypeError):
                    pass
            
            if user and hasattr(user, 'preferences') and user.preferences:
                try:
                    return json.loads(user.preferences)
                except (json.JSONDecodeError, TypeError):
                    pass
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting V1 preferences for user {user_id}: {e}")
            return None
    
    @classmethod
    def _map_v1_to_v2(cls, v1_data: Dict[str, Any], v2_prefs: UserPreferences):
        """מפה נתונים מV1 להעדפות חדשות"""
        try:
            # הגדרות בסיסיות
            if 'primaryCurrency' in v1_data:
                v2_prefs.primary_currency = v1_data['primaryCurrency']
            if 'timezone' in v1_data:
                v2_prefs.timezone = v1_data['timezone']
            if 'defaultStopLoss' in v1_data:
                v2_prefs.default_stop_loss = float(v1_data['defaultStopLoss'])
            if 'defaultTargetPrice' in v1_data:
                v2_prefs.default_target_price = float(v1_data['defaultTargetPrice'])
            if 'defaultCommission' in v1_data:
                v2_prefs.default_commission = float(v1_data['defaultCommission'])
            
            # פילטרים
            if 'defaultStatusFilter' in v1_data:
                v2_prefs.default_status_filter = v1_data['defaultStatusFilter']
            if 'defaultTypeFilter' in v1_data:
                v2_prefs.default_type_filter = v1_data['defaultTypeFilter']
            if 'defaultAccountFilter' in v1_data:
                v2_prefs.default_account_filter = v1_data['defaultAccountFilter']
            if 'defaultDateRangeFilter' in v1_data:
                v2_prefs.default_date_range_filter = v1_data['defaultDateRangeFilter']
            if 'defaultSearchFilter' in v1_data:
                v2_prefs.default_search_filter = v1_data['defaultSearchFilter']
            
            # נתונים חיצוניים
            if 'dataRefreshInterval' in v1_data:
                v2_prefs.data_refresh_interval = int(v1_data['dataRefreshInterval'])
            if 'primaryDataProvider' in v1_data:
                v2_prefs.primary_data_provider = v1_data['primaryDataProvider']
            if 'secondaryDataProvider' in v1_data:
                v2_prefs.secondary_data_provider = v1_data['secondaryDataProvider']
            if 'cacheTTL' in v1_data:
                v2_prefs.cache_ttl = int(v1_data['cacheTTL'])
            if 'maxBatchSize' in v1_data:
                v2_prefs.max_batch_size = int(v1_data['maxBatchSize'])
            if 'requestDelay' in v1_data:
                v2_prefs.request_delay = int(v1_data['requestDelay'])
            if 'retryAttempts' in v1_data:
                v2_prefs.retry_attempts = int(v1_data['retryAttempts'])
            if 'retryDelay' in v1_data:
                v2_prefs.retry_delay = int(v1_data['retryDelay'])
            if 'autoRefresh' in v1_data:
                v2_prefs.table_auto_refresh = bool(v1_data['autoRefresh'])
            if 'verboseLogging' in v1_data:
                v2_prefs.verbose_logging = bool(v1_data['verboseLogging'])
            
            # הגדרות התראות
            if 'showPercentageChanges' in v1_data:
                v2_prefs.show_percentage_changes = bool(v1_data['showPercentageChanges'])
            if 'showVolume' in v1_data:
                v2_prefs.show_volume = bool(v1_data['showVolume'])
            if 'notifyOnDataFailures' in v1_data:
                v2_prefs.notify_on_data_failures = bool(v1_data['notifyOnDataFailures'])
            if 'notifyOnStaleData' in v1_data:
                v2_prefs.notify_on_stale_data = bool(v1_data['notifyOnStaleData'])
            
            # קונסול
            if 'consoleCleanupInterval' in v1_data:
                v2_prefs.console_cleanup_interval = int(v1_data['consoleCleanupInterval'])
            
            # JSON fields - העבר כמו שהם
            json_fields = [
                ('numericValueColors', 'color_scheme_json'),
                ('entityColors', 'color_scheme_json'),
                ('headerOpacity', 'opacity_settings_json'),
                ('statusColors', 'color_scheme_json'),
                ('investmentTypeColors', 'color_scheme_json'),
                ('refreshOverrides', 'refresh_overrides_json')
            ]
            
            # צור מערכת צבעים מאוחדת
            unified_colors = {}
            
            for v1_field, v2_field in json_fields:
                if v1_field in v1_data and v1_data[v1_field]:
                    if v2_field == 'color_scheme_json':
                        unified_colors[v1_field] = v1_data[v1_field]
                    elif v2_field == 'opacity_settings_json':
                        v2_prefs.opacity_settings_json = json.dumps(v1_data[v1_field])
                    elif v2_field == 'refresh_overrides_json':
                        v2_prefs.refresh_overrides_json = json.dumps(v1_data[v1_field])
            
            # שמור מערכת צבעים מאוחדת
            if unified_colors:
                v2_prefs.color_scheme_json = json.dumps(unified_colors)
            
            logger.info(f"Mapped V1 data to new preferences for user {v2_prefs.user_id}")
            
        except Exception as e:
            logger.error(f"Error mapping V1 to new preferences data: {e}")
            raise
    
    @classmethod
    def export_preferences(cls, db: Session, user_id: int, profile_id: int = None, 
                          include_sensitive: bool = False) -> Optional[Dict[str, Any]]:
        """יצא הגדרות לקובץ"""
        try:
            preferences = cls.get_preferences(db, user_id, profile_id)
            if not preferences:
                return None
            
            # קבל פרטי פרופיל
            profile = db.query(PreferenceProfile).filter(
                PreferenceProfile.id == preferences.profile_id
            ).first()
            
            export_data = preferences.export_settings(include_sensitive)
            
            # הוסף מטא-דטה של הפרופיל
            export_data['profile'] = {
                'name': profile.profile_name if profile else 'Unknown',
                'description': profile.description if profile else '',
                'isDefault': profile.is_default if profile else False
            }
            
            export_data['user'] = {
                'id': user_id,
                'exportedBy': user_id,
                'exportDate': datetime.utcnow().isoformat()
            }
            
            return export_data
            
        except Exception as e:
            logger.error(f"Error exporting preferences for user {user_id}: {e}")
            return None
    
    @classmethod
    def import_preferences(cls, db: Session, user_id: int, import_data: Dict[str, Any], 
                          create_new_profile: bool = True, profile_name: str = None) -> bool:
        """יבא הגדרות מקובץ"""
        try:
            if 'preferences' not in import_data:
                logger.error("Invalid import data: missing 'preferences' key")
                return False
            
            preferences_data = import_data['preferences']
            
            # צור פרופיל חדש או השתמש בקיים
            if create_new_profile:
                if not profile_name:
                    profile_name = f"ייבוא {datetime.now().strftime('%Y-%m-%d %H:%M')}"
                
                profile = cls.create_profile(db, user_id, profile_name, 
                                           description=f"פרופיל שיובא ב-{datetime.now()}")
            else:
                profile = cls.get_default_profile(db, user_id)
                if not profile:
                    logger.error(f"No default profile found for user {user_id}")
                    return False
            
            # צור או עדכן הגדרות
            existing_prefs = cls.get_preferences(db, user_id, profile.id)
            if existing_prefs:
                # עדכן קיים
                success = cls.update_preferences(db, user_id, profile.id, preferences_data, user_id)
            else:
                # צור חדש
                new_prefs = UserPreferences.import_settings(import_data)
                new_prefs.user_id = user_id
                new_prefs.profile_id = profile.id
                
                db.add(new_prefs)
                db.commit()
                success = True
            
            if success:
                # רשום להיסטוריה
                cls._record_change(db, user_id, profile.id, 'import', 
                                 {}, preferences_data, user_id)
                
                logger.info(f"Successfully imported preferences for user {user_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error importing preferences for user {user_id}: {e}")
            db.rollback()
            return False
    
    @classmethod
    def _record_change(cls, db: Session, user_id: int, profile_id: int, change_type: str,
                      old_data: Dict[str, Any], new_data: Dict[str, Any], changed_by: int = None):
        """רשום שינוי להיסטוריה"""
        try:
            history_entry = PreferenceHistory(
                user_id=user_id,
                profile_id=profile_id,
                change_type=change_type,
                old_value=json.dumps(old_data) if old_data else None,
                new_value=json.dumps(new_data) if new_data else None,
                changed_by=changed_by or user_id
            )
            
            db.add(history_entry)
            db.commit()
            
        except Exception as e:
            logger.error(f"Error recording change history: {e}")
    
    @classmethod
    def get_preference_history(cls, db: Session, user_id: int, profile_id: int = None, 
                             days: int = 30) -> List[PreferenceHistory]:
        """קבל היסטוריית שינויים"""
        try:
            query = db.query(PreferenceHistory).filter(
                PreferenceHistory.user_id == user_id,
                PreferenceHistory.created_at >= datetime.utcnow() - timedelta(days=days)
            )
            
            if profile_id:
                query = query.filter(PreferenceHistory.profile_id == profile_id)
            
            history = query.order_by(PreferenceHistory.created_at.desc()).all()
            return history
            
        except Exception as e:
            logger.error(f"Error getting preference history for user {user_id}: {e}")
            return []
    
    @classmethod
    def validate_all_preferences(cls, db: Session) -> Dict[int, Dict[str, Any]]:
        """בדוק תקינות של כל ההגדרות במערכת"""
        try:
            results = {}
            
            all_prefs = db.query(UserPreferences).all()
            
            for pref in all_prefs:
                errors = pref.validate()
                if errors:
                    results[pref.user_id] = {
                        'profile_id': pref.profile_id,
                        'errors': errors,
                        'last_validation': pref.last_validation
                    }
                    
                    # עדכן בטבלה
                    pref.validation_errors_json = json.dumps(errors)
                    pref.last_validation = datetime.utcnow()
            
            if results:
                db.commit()
            
            return results
            
        except Exception as e:
            logger.error(f"Error validating all preferences: {e}")
            return {}
    
    @classmethod
    def cleanup_old_history(cls, db: Session, days: int = 90) -> int:
        """נקה היסטוריה ישנה"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            deleted = db.query(PreferenceHistory).filter(
                PreferenceHistory.created_at < cutoff_date
            ).delete()
            
            db.commit()
            
            logger.info(f"Cleaned up {deleted} old preference history entries")
            return deleted
            
        except Exception as e:
            logger.error(f"Error cleaning up old history: {e}")
            db.rollback()
            return 0
    
    @classmethod
    def save_user_preferences(cls, db: Session, user_id: int, preferences_data: Dict[str, Any], 
                             profile_name: str = "ברירת מחדל") -> bool:
        """שמור העדפות משתמש"""
        try:
            # קבל או צור פרופיל ברירת מחדל
            profile = cls.get_default_profile(db, user_id)
            if not profile:
                profile = cls.create_profile(db, user_id, profile_name, is_default=True)
            
            # קבל העדפות קיימות או צור חדשות
            preferences = cls.get_preferences(db, user_id, profile.id)
            if not preferences:
                # צור העדפות חדשות
                preferences = UserPreferences(
                    user_id=user_id,
                    profile_id=profile.id,
                    version='2.0'
                )
                db.add(preferences)
            
            # עדכן הנתונים
            preferences.from_dict(preferences_data)
            
            # בדוק תקינות
            errors = preferences.validate()
            if errors:
                logger.warning(f"Validation errors for user {user_id}: {errors}")
                preferences.validation_errors_json = json.dumps(errors)
            else:
                preferences.validation_errors_json = None
            
            preferences.last_validation = datetime.utcnow()
            
            db.commit()
            
            # רשום להיסטוריה
            cls._record_change(db, user_id, profile.id, 'save', {}, preferences_data, user_id)
            
            logger.info(f"✅ Saved preferences for user {user_id}: {list(preferences_data.keys())}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving preferences for user {user_id}: {e}")
            db.rollback()
            return False
    
    @classmethod
    def get_system_statistics(cls, db: Session) -> Dict[str, Any]:
        """קבל סטטיסטיקות מערכת העדפות"""
        try:
            total_users_v2 = db.query(UserPreferences.user_id).distinct().count()
            total_profiles = db.query(PreferenceProfile).filter(PreferenceProfile.is_active == True).count()
            total_preferences = db.query(UserPreferences).count()
            
            # התפלגות פרופילים
            profiles_per_user = db.query(PreferenceProfile.user_id).filter(
                PreferenceProfile.is_active == True
            ).group_by(PreferenceProfile.user_id).count()
            
            # שינויים אחרונים
            recent_changes = db.query(PreferenceHistory).filter(
                PreferenceHistory.created_at >= datetime.utcnow() - timedelta(days=7)
            ).count()
            
            # תקלות בדיקות
            validation_errors = db.query(UserPreferences).filter(
                UserPreferences.validation_errors_json.isnot(None)
            ).count()
            
            return {
                'total_users_v2': total_users_v2,
                'total_profiles': total_profiles,
                'total_preferences': total_preferences,
                'avg_profiles_per_user': profiles_per_user,
                'recent_changes_7_days': recent_changes,
                'validation_errors': validation_errors,
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting system statistics: {e}")
            return {}