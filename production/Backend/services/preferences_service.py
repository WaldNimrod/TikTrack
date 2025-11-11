#!/usr/bin/env python3
"""
Preferences Service - TikTrack
==============================

שירות מתקדם למערכת העדפות עם מטמון אופטימלי ופונקציות נגישות

Author: TikTrack Development Team
Version: 3.0
Date: January 2025
"""

import sqlite3
import json
import logging
import time
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
import os
import sys

from config.settings import DB_PATH

# Add constraint service
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from services.constraint_service import ConstraintService

logger = logging.getLogger(__name__)

# Custom exception classes
class ValidationError(Exception):
    """Exception raised for preference validation errors"""
    pass

class PreferenceNotFoundError(Exception):
    """Exception raised when preference is not found"""
    pass

class UserNotFoundError(Exception):
    """Exception raised when user is not found"""
    pass

class ProfileNotFoundError(Exception):
    """Exception raised when profile is not found"""
    pass

class PreferencesService:
    """
    שירות מתקדם למערכת העדפות
    
    תכונות מרכזיות:
    - מטמון פר משתמש עם TTL ארוך
    - פונקציות נגישות מהירות
    - טיפול בשגיאות מפורט
    - תמיכה בפרופילים מרובים
    - אופטימיזציה מקסימלית
    """
    
    def __init__(self, db_path: str = None):
        """אתחול השירות"""
        if db_path is None:
            # Default database path (production)
            db_path = str(DB_PATH)

        self.db_path = db_path
        self.cache = {}  # מטמון פנימי
        self.cache_ttl = 24 * 60 * 60  # 24 שעות
        self.cache_timestamps = {}  # זמני יצירת מטמון
        
        # Initialize constraint service for validation
        self.constraint_service = ConstraintService(db_path)
        
        # בדיקת קיום בסיס הנתונים
        if not os.path.exists(db_path):
            raise FileNotFoundError(f"Database not found: {db_path}")
    
    def _validate_preference_value(self, preference_name: str, value: Any) -> bool:
        """
        בדיקת תקינות ערך העדפה לפי constraints
        
        Args:
            preference_name: שם ההעדפה
            value: ערך ההעדפה לבדיקה
            
        Returns:
            True אם הערך תקין
            
        Raises:
            ValidationError: אם הערך לא תקין
        """
        try:
            # קבלת constraints לטבלת preference_types
            constraints = self.constraint_service.get_constraints_for_table('preference_types')
            
            # בדיקת constraints רלוונטיים
            for constraint in constraints:
                if constraint['constraint_type'] == 'ENUM' and constraint['column_name'] == 'data_type':
                    # בדיקת סוג נתונים מותר
                    enum_values = [ev['value'] for ev in constraint.get('enum_values', [])]
                    logger.debug(f"Available data types: {enum_values}")
            
            # קבלת סוג הנתון של ההעדפה
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT data_type, constraints, is_required
                FROM preference_types 
                WHERE preference_name = ? AND is_active = 1
            ''', (preference_name,))
            
            result = cursor.fetchone()
            conn.close()
            
            if not result:
                raise ValidationError(f"Preference '{preference_name}' not found")
            
            data_type, constraints_json, is_required = result
            
            # בדיקת ערך ריק
            if value is None or str(value).strip() == '':
                if is_required:
                    raise ValidationError(f"Preference '{preference_name}' is required")
            return True
            
            # בדיקת סוג נתונים
            if data_type == 'integer':
                try:
                    int(value)
                except (ValueError, TypeError):
                    raise ValidationError(f"Preference '{preference_name}' must be an integer")
            
            elif data_type in ['float', 'number']:
                try:
                    float(value)
                except (ValueError, TypeError):
                    raise ValidationError(f"Preference '{preference_name}' must be a number")
            
            elif data_type == 'boolean':
                if str(value).lower() not in ['true', 'false', '1', '0', 'yes', 'no']:
                    raise ValidationError(f"Preference '{preference_name}' must be a boolean value")
            
            elif data_type == 'json':
                try:
                    if isinstance(value, str):
                        json.loads(value)
                except json.JSONDecodeError:
                    raise ValidationError(f"Preference '{preference_name}' must be valid JSON")
            
            elif data_type == 'color':
                value_str = str(value).strip()
                if not value_str.startswith('#') or len(value_str) not in [4, 7]:
                    raise ValidationError(f"Preference '{preference_name}' must be a valid color (hex format)")
            
            # בדיקת constraints נוספים
            if constraints_json:
                try:
                    constraints_data = json.loads(constraints_json)
                    # כאן ניתן להוסיף בדיקות נוספות לפי constraints
                    logger.debug(f"Additional constraints for {preference_name}: {constraints_data}")
                except json.JSONDecodeError:
                    logger.warning(f"Invalid constraints JSON for {preference_name}")
            
            return True
            
        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"Error validating preference {preference_name}: {e}")
            raise ValidationError(f"Validation failed for preference '{preference_name}': {str(e)}")
    
    def _get_cache_key(self, user_id: int, profile_id: int, preference_name: str = None, group_name: str = None) -> str:
        """יצירת מפתח מטמון"""
        if preference_name:
            return f"preferences:{user_id}:{profile_id}:{preference_name}"
        elif group_name:
            return f"preferences:{user_id}:{profile_id}:group:{group_name}"
        else:
            return f"preferences:{user_id}:{profile_id}:all"
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """בדיקת תקינות מטמון"""
        if cache_key not in self.cache:
            return False
        
        if cache_key not in self.cache_timestamps:
            return False
        
        cache_time = self.cache_timestamps[cache_key]
        return time.time() - cache_time < self.cache_ttl
    
    def _invalidate_user_cache(self, user_id: int, profile_id: int = None):
        """מחיקת מטמון משתמש"""
        if profile_id:
            # מחק מטמון פרופיל ספציפי
            pattern = f"preferences:{user_id}:{profile_id}:"
        else:
            # מחק כל המטמון של המשתמש
            pattern = f"preferences:{user_id}:"
        
        keys_to_delete = [key for key in self.cache.keys() if key.startswith(pattern)]
        for key in keys_to_delete:
            self.cache.pop(key, None)
            self.cache_timestamps.pop(key, None)
        
        logger.info(f"Cache invalidated for user {user_id}, profile {profile_id}")
    
    def _get_active_profile_id(self, user_id: int) -> int:
        """קבלת פרופיל פעיל של משתמש
        
        אם אין פרופיל פעיל של המשתמש, מחזיר פרופיל ברירת מחדל (ID: 0)
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Search for active user profile
            cursor.execute('''
                SELECT id FROM preference_profiles 
                WHERE user_id = ? AND is_active = TRUE 
                ORDER BY is_default DESC, last_used_at DESC 
                LIMIT 1
            ''', (user_id,))
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                return result[0]
            else:
                # No active user profile - return default profile
                logger.info(f"No active profile found for user {user_id}, using default profile (ID: 0)")
                return 0
            
        except Exception as e:
            logger.error(f"Error getting active profile for user {user_id}: {e}")
            # In case of error, return default profile
            return 0
    
    def _get_user_identity(self, user_id: int) -> Dict[str, Any]:
        """קבלת נתוני משתמש בסיסיים עבור הודעות"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, username, COALESCE(NULLIF(TRIM(full_name), ''), TRIM(first_name || ' ' || last_name)), email
                FROM users
                WHERE id = ?
            ''', (user_id,))
            row = cursor.fetchone()
            conn.close()
            
            if not row:
                raise UserNotFoundError(f"User {user_id} not found")
            
            user_id_db, username, full_name, email = row
            display_name = full_name if full_name else username or f"User#{user_id_db}"
            return {
                "id": user_id_db,
                "username": username,
                "full_name": full_name,
                "email": email,
                "display_name": display_name
            }
        except Exception as e:
            logger.error(f"Error getting identity for user {user_id}: {e}")
            return {
                "id": user_id,
                "username": None,
                "full_name": None,
                "email": None,
                "display_name": f"User#{user_id}"
            }
    
    def _get_profile_record(self, user_id: int, profile_id: int) -> Optional[Dict[str, Any]]:
        """קבלת פרטי פרופיל עבור משתמש"""
        if profile_id == 0:
            return {
                "id": 0,
                "name": "פרופיל ברירת מחדל",
                "description": "פרופיל ברירת מחדל של המערכת",
                "active": False,
                "default": True,
                "user_id": 0,
                "last_used": None,
                "usage_count": None,
                "created_at": None,
            }
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, profile_name, description, is_active, is_default, last_used_at, usage_count, created_at
                FROM preference_profiles
                WHERE user_id = ? AND id = ?
            ''', (user_id, profile_id))
            row = cursor.fetchone()
            conn.close()
            
            if not row:
                return None
            
            (pid, name, description, is_active, is_default, last_used,
             usage_count, created_at) = row
            
            return {
                "id": pid,
                "name": name,
                "description": description,
                "active": bool(is_active),
                "default": bool(is_default),
                "user_id": user_id,
                "last_used": last_used,
                "usage_count": usage_count,
                "created_at": created_at
            }
        except Exception as e:
            logger.error(f"Error getting profile {profile_id} for user {user_id}: {e}")
            return None
    
    def build_profile_context(self, user_id: int, requested_profile_id: Optional[int] = None) -> Dict[str, Any]:
        """
        בניית הקשר מלא של פרופילים עבור המשתמש
        
        Args:
            user_id: מזהה משתמש
            requested_profile_id: פרופיל שביקש הלקוח (אופציונלי)
        
        Returns:
            מילון עם נתוני משתמש, פרופיל פעיל, פרופיל שנבחר ומידע נוסף
        """
        identity = self._get_user_identity(user_id)
        profiles = self.get_user_profiles(user_id)
        warnings: List[str] = []
        
        active_profiles = [p for p in profiles if p.get('active')]
        if len(active_profiles) > 1:
            warnings.append("זוהו מספר פרופילים עם סטטוס פעיל. מומלץ לבדוק את נתוני preference_profiles.")
        
        inconsistent_profiles = [
            p for p in profiles
            if p.get('id') not in (0, None) and not p.get('active') and p.get('last_used')
        ]
        for profile in inconsistent_profiles:
            warnings.append(
                f"פרופיל {profile.get('name')} (#{profile.get('id')}) מסומן כלא פעיל אך last_used קיים ({profile.get('last_used')})."
            )
        
        active_profile_id = active_profiles[0]['id'] if active_profiles else 0
        active_profile = self._get_profile_record(user_id, active_profile_id)
        
        requested_profile = None
        requested_profile_found = False
        if requested_profile_id is not None:
            if requested_profile_id == 0:
                requested_profile = self._get_profile_record(user_id, 0)
                requested_profile_found = True
            else:
                requested_profile = next((p for p in profiles if p['id'] == requested_profile_id), None)
                requested_profile_found = requested_profile is not None
                if requested_profile_found:
                    requested_profile = self._get_profile_record(user_id, requested_profile_id)
                else:
                    warnings.append(
                        f"פרופיל #{requested_profile_id} לא נמצא עבור המשתמש {identity['display_name']} (#{user_id})."
                    )
        
        if requested_profile_found:
            resolved_profile_id = requested_profile_id
        elif requested_profile_id is not None and active_profile_id not in (None, -1):
            resolved_profile_id = active_profile_id if active_profile_id != 0 else 0
        else:
            resolved_profile_id = active_profile_id
        
        if resolved_profile_id not in (0, None):
            resolved_profile = self._get_profile_record(user_id, resolved_profile_id)
            if not resolved_profile:
                warnings.append(
                    f"פרופיל #{resolved_profile_id} לא זמין – חזרה לנתוני ברירת מחדל."
                )
                resolved_profile_id = 0
                resolved_profile = self._get_profile_record(user_id, 0)
        else:
            resolved_profile_id = 0
            resolved_profile = self._get_profile_record(user_id, 0)
        
        using_default_profile = resolved_profile_id == 0
        has_active_profile = active_profile_id not in (0, None)
        
        if not has_active_profile:
            status = "no_active_profile"
            message = (
                f"⚠️ אין פרופיל פעיל עבור {identity['display_name']} (משתמש #{user_id}) – "
                "מוצגים נתוני ברירת מחדל של המערכת."
            )
        elif requested_profile_id is None or resolved_profile_id == active_profile_id:
            status = "active_profile"
            message = (
                f"מציגים את הפרופיל הפעיל {active_profile.get('name')} "
                f"(#{active_profile_id}) עבור {identity['display_name']}."
            )
        else:
            if using_default_profile:
                status = "fallback_default_profile"
                message = (
                    f"⚠️ פרופיל #{requested_profile_id} לא זמין עבור {identity['display_name']} "
                    "– מוצגים נתוני ברירת מחדל של המערכת."
                )
            else:
                status = "requested_profile"
                message = (
                    f"מציגים את הפרופיל המבוקש {resolved_profile.get('name')} "
                    f"(#{resolved_profile_id}) עבור {identity['display_name']}."
                )
        
        return {
            "user": identity,
            "active_profile": active_profile,
            "resolved_profile": resolved_profile,
            "requested_profile": requested_profile if requested_profile_found else None,
            "requested_profile_id": requested_profile_id,
            "active_profile_id": active_profile_id,
            "resolved_profile_id": resolved_profile_id,
            "has_active_profile": has_active_profile,
            "using_default_profile": using_default_profile,
            "status": status,
            "message": message,
            "warnings": warnings
        }
    
    def _get_preference_type_id(self, preference_name: str) -> int:
        """קבלת מזהה סוג העדפה"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id FROM preference_types 
                WHERE preference_name = ? AND is_active = TRUE
            ''', (preference_name,))
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                return result[0]
            else:
                raise ValueError(f"Preference type not found: {preference_name}")
            
        except Exception as e:
            logger.error(f"Error getting preference type ID for {preference_name}: {e}")
            raise
    
    def _get_group_id(self, group_name: str) -> int:
        """קבלת מזהה קבוצה"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id FROM preference_groups 
                WHERE group_name = ?
            ''', (group_name,))
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                return result[0]
            else:
                raise ValueError(f"Group not found: {group_name}")
            
        except Exception as e:
            logger.error(f"Error getting group ID for {group_name}: {e}")
            raise
    
    def get_preference(self, user_id: int, preference_name: str, profile_id: int = None, use_cache: bool = True) -> Any:
        """
        קבלת העדפה בודדת
        
        Args:
            user_id: מזהה משתמש
            preference_name: שם ההעדפה
            profile_id: מזהה פרופיל (אופציונלי)
            use_cache: האם להשתמש במטמון
        
        Returns:
            ערך ההעדפה
        
        Raises:
            ValueError: אם ההעדפה לא נמצאה
            Exception: שגיאות אחרות
        """
        try:
            # קבלת פרופיל פעיל אם לא צוין
            if profile_id is None:
                profile_id = self._get_active_profile_id(user_id)
            
            # בדיקת מטמון
            if use_cache:
                cache_key = self._get_cache_key(user_id, profile_id, preference_name)
                if self._is_cache_valid(cache_key):
                    logger.debug(f"Cache hit for {preference_name}")
                    return self.cache[cache_key]
            
            # שאילתה לבסיס הנתונים
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Handle default profile (ID: 0) - return default_value only
            if profile_id == 0:
                cursor.execute('''
                    SELECT default_value, data_type FROM preference_types 
                    WHERE preference_name = ? AND is_active = TRUE
                ''', (preference_name,))
                
                result = cursor.fetchone()
                conn.close()
                
                if result:
                    default_value, data_type = result
                    value = self._convert_value(default_value, data_type)
                    
                    # שמירה במטמון
                    if use_cache:
                        cache_key = self._get_cache_key(user_id, profile_id, preference_name)
                        self.cache[cache_key] = value
                        self.cache_timestamps[cache_key] = time.time()
                    
                    logger.debug(f"Using default value for {preference_name}: {value}")
                    return value
                else:
                    # Preference type not found in database
                    logger.warning(f"Preference type '{preference_name}' not found in preference_types table")
                    # Return None instead of raising exception - let API handle it
                    return None
            
            # Regular profile - query user_preferences_v3
            cursor.execute('''
                SELECT up.saved_value, pt.data_type, pt.default_value
                FROM preference_types pt
                LEFT JOIN (
                    SELECT preference_id, saved_value, 
                           ROW_NUMBER() OVER (PARTITION BY preference_id ORDER BY id DESC) as rn
                    FROM user_preferences_v3 
                    WHERE user_id = ? AND profile_id = ?
                ) up ON pt.id = up.preference_id AND up.rn = 1
                WHERE pt.preference_name = ? AND pt.is_active = TRUE
                ORDER BY up.rn DESC
                LIMIT 1
            ''', (user_id, profile_id, preference_name))
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                saved_value, data_type, default_value = result
                # Use saved_value if exists, otherwise default_value
                value_to_use = saved_value if saved_value is not None else default_value
                value = self._convert_value(value_to_use, data_type)
                
                # שמירה במטמון
                if use_cache:
                    cache_key = self._get_cache_key(user_id, profile_id, preference_name)
                    self.cache[cache_key] = value
                    self.cache_timestamps[cache_key] = time.time()
                
                logger.debug(f"Retrieved preference {preference_name}: {value}")
                return value
            else:
                # נסה לקבל ערך ברירת מחדל
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                
                cursor.execute('''
                    SELECT default_value, data_type FROM preference_types 
                    WHERE preference_name = ? AND is_active = TRUE
                ''', (preference_name,))
                
                result = cursor.fetchone()
                conn.close()
                
                if result:
                    default_value, data_type = result
                    value = self._convert_value(default_value, data_type)
                    
                    # שמירה במטמון
                    if use_cache:
                        cache_key = self._get_cache_key(user_id, profile_id, preference_name)
                        self.cache[cache_key] = value
                        self.cache_timestamps[cache_key] = time.time()
                    
                    logger.debug(f"Using default value for {preference_name}: {value}")
                    return value
                else:
                    # Preference type not found in database
                    logger.warning(f"Preference type '{preference_name}' not found in preference_types table")
                    # Return None instead of raising exception - let API handle it
                    return None
            
        except Exception as e:
            logger.error(f"Error getting preference {preference_name} for user {user_id}: {e}")
            raise
    
    def get_group_preferences(self, user_id: int, group_name: str, profile_id: int = None, use_cache: bool = True) -> Dict[str, Any]:
        """
        קבלת כל ההעדפות בקבוצה
        
        Args:
            user_id: מזהה משתמש
            group_name: שם הקבוצה
            profile_id: מזהה פרופיל (אופציונלי)
            use_cache: האם להשתמש במטמון
        
        Returns:
            מילון עם העדפות הקבוצה
        """
        try:
            # קבלת פרופיל פעיל אם לא צוין
            if profile_id is None:
                profile_id = self._get_active_profile_id(user_id)
            
            # בדיקת מטמון
            if use_cache:
                cache_key = self._get_cache_key(user_id, profile_id, group_name=group_name)
                if self._is_cache_valid(cache_key):
                    logger.debug(f"Cache hit for group {group_name}")
                    return self.cache[cache_key]
            
            # קבלת מזהה קבוצה
            group_id = self._get_group_id(group_name)
            
            # שאילתה לבסיס הנתונים
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Handle default profile (ID: 0) - return default_value only
            if profile_id == 0:
                cursor.execute('''
                    SELECT pt.preference_name, 
                           pt.default_value as value,
                           pt.data_type
                    FROM preference_types pt
                    JOIN preference_groups pg ON pt.group_id = pg.id
                    WHERE pt.group_id = ? AND pt.is_active = TRUE
                ''', (group_id,))
            else:
                cursor.execute('''
                    SELECT pt.preference_name, 
                           COALESCE(up.saved_value, pt.default_value) as value,
                           pt.data_type
                    FROM preference_types pt
                    LEFT JOIN (
                        SELECT preference_id, saved_value, 
                               ROW_NUMBER() OVER (PARTITION BY preference_id ORDER BY id DESC) as rn
                        FROM user_preferences_v3 
                        WHERE user_id = ? AND profile_id = ?
                    ) up ON pt.id = up.preference_id AND up.rn = 1
                    WHERE pt.group_id = ? AND pt.is_active = TRUE
                ''', (user_id, profile_id, group_id))
            
            results = cursor.fetchall()
            conn.close()
            
            preferences = {}
            for preference_name, value, data_type in results:
                preferences[preference_name] = self._convert_value(value, data_type)
            
            # שמירה במטמון
            if use_cache:
                cache_key = self._get_cache_key(user_id, profile_id, group_name=group_name)
                self.cache[cache_key] = preferences
                self.cache_timestamps[cache_key] = time.time()
            
            logger.debug(f"Retrieved {len(preferences)} preferences for group {group_name}")
            return preferences
            
        except Exception as e:
            logger.error(f"Error getting group preferences {group_name} for user {user_id}: {e}")
            raise
    
    def get_preferences_by_names(self, user_id: int, preference_names: List[str], profile_id: int = None, use_cache: bool = True) -> Dict[str, Any]:
        """
        קבלת העדפות מרובות לפי שמות
        
        Args:
            user_id: מזהה משתמש
            preference_names: רשימת שמות העדפות
            profile_id: מזהה פרופיל (אופציונלי)
            use_cache: האם להשתמש במטמון
        
        Returns:
            מילון עם העדפות
        """
        try:
            # קבלת פרופיל פעיל אם לא צוין
            if profile_id is None:
                profile_id = self._get_active_profile_id(user_id)
                logger.info(f"Using active profile {profile_id} for user {user_id}")
            else:
                logger.info(f"Using specified profile {profile_id} for user {user_id}")
            
            preferences = {}
            
            if not use_cache:
                # עקיפת מטמון - קריאה ישירה לבסיס הנתונים
                logger.info(f"Bypassing cache for user {user_id}, profile {profile_id}")
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                
                # Handle default profile (ID: 0) - return default_value only
                if profile_id == 0:
                    # בניית שאילתה לכל ההעדפות בבת אחת
                    placeholders = ','.join(['?' for _ in preference_names])
                    query = f'''
                        SELECT pt.preference_name, NULL as saved_value, pt.data_type, pt.default_value
                        FROM preference_types pt
                        WHERE pt.preference_name IN ({placeholders}) AND pt.is_active = TRUE
                    '''
                    cursor.execute(query, preference_names)
                else:
                    # בניית שאילתה לכל ההעדפות בבת אחת
                    placeholders = ','.join(['?' for _ in preference_names])
                    query = f'''
                        SELECT pt.preference_name, up.saved_value, pt.data_type, pt.default_value
                        FROM preference_types pt
                        LEFT JOIN (
                            SELECT preference_id, saved_value, 
                                   ROW_NUMBER() OVER (PARTITION BY preference_id ORDER BY id DESC) as rn
                            FROM user_preferences_v3 
                            WHERE user_id = ? AND profile_id = ?
                        ) up ON pt.id = up.preference_id AND up.rn = 1
                        WHERE pt.preference_name IN ({placeholders}) AND pt.is_active = TRUE
                    '''
                    cursor.execute(query, [user_id, profile_id] + preference_names)
                
                results = cursor.fetchall()
                conn.close()
                
                # בניית מילון תוצאות
                result_dict = {pref_name: None for pref_name in preference_names}
                for preference_name, saved_value, data_type, default_value in results:
                    if saved_value is not None:
                        value = self._convert_value(saved_value, data_type)
                    else:
                        value = self._convert_value(default_value, data_type)
                    result_dict[preference_name] = value
                
                preferences = result_dict
                logger.info(f"Direct DB result for user {user_id}, profile {profile_id}: {preferences}")
                
            else:
                # שימוש בcache - הקוד הקיים
                for preference_name in preference_names:
                    try:
                        preferences[preference_name] = self.get_preference(
                            user_id, preference_name, profile_id, use_cache
                        )
                    except ValueError as e:
                        logger.warning(f"Preference {preference_name} not found: {e}")
                        preferences[preference_name] = None
            
            logger.debug(f"Retrieved {len(preferences)} preferences by names")
            return preferences
            
        except Exception as e:
            logger.error(f"Error getting preferences by names for user {user_id}: {e}")
            raise
    
    def get_all_user_preferences(self, user_id: int, profile_id: int = None, use_cache: bool = True) -> Dict[str, Any]:
        """
        קבלת כל ההעדפות של משתמש
        
        Args:
            user_id: מזהה משתמש
            profile_id: מזהה פרופיל (אופציונלי)
            use_cache: האם להשתמש במטמון
        
        Returns:
            מילון עם כל ההעדפות
        """
        try:
            # קבלת פרופיל פעיל אם לא צוין
            if profile_id is None:
                profile_id = self._get_active_profile_id(user_id)
            
            # בדיקת מטמון
            if use_cache:
                cache_key = self._get_cache_key(user_id, profile_id)
                if self._is_cache_valid(cache_key):
                    logger.debug(f"Cache hit for all preferences")
                    return self.cache[cache_key]
            
            # שאילתה לבסיס הנתונים
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Handle default profile (ID: 0) - return default_value only
            if profile_id == 0:
                cursor.execute('''
                    SELECT pt.preference_name, 
                           pt.default_value as value,
                           pt.data_type,
                           pg.group_name
                    FROM preference_types pt
                    JOIN preference_groups pg ON pt.group_id = pg.id
                    WHERE pt.is_active = TRUE
                    ORDER BY pg.group_name, pt.preference_name
                ''')
            else:
                cursor.execute('''
                    SELECT pt.preference_name, 
                           COALESCE(up.saved_value, pt.default_value) as value,
                           pt.data_type,
                           pg.group_name
                    FROM preference_types pt
                    JOIN preference_groups pg ON pt.group_id = pg.id
                    LEFT JOIN (
                        SELECT preference_id, saved_value, 
                               ROW_NUMBER() OVER (PARTITION BY preference_id ORDER BY id DESC) as rn
                        FROM user_preferences_v3 
                        WHERE user_id = ? AND profile_id = ?
                    ) up ON pt.id = up.preference_id AND up.rn = 1
                    WHERE pt.is_active = TRUE
                    ORDER BY pg.group_name, pt.preference_name
                ''', (user_id, profile_id))
            
            results = cursor.fetchall()
            conn.close()
            
            preferences = {}
            for preference_name, value, data_type, group_name in results:
                preferences[preference_name] = self._convert_value(value, data_type)
            
            # שמירה במטמון
            if use_cache:
                cache_key = self._get_cache_key(user_id, profile_id)
                self.cache[cache_key] = preferences
                self.cache_timestamps[cache_key] = time.time()
            
            logger.debug(f"Retrieved {len(preferences)} total preferences")
            return preferences
            
        except Exception as e:
            logger.error(f"Error getting all preferences for user {user_id}: {e}")
            raise
    
    def save_preference(self, user_id: int, preference_name: str, value: Any, profile_id: int = None) -> bool:
        """
        שמירת העדפה בודדת
        
        Args:
            user_id: מזהה משתמש
            preference_name: שם ההעדפה
            value: ערך ההעדפה
            profile_id: מזהה פרופיל (אופציונלי)
        
        Returns:
            True אם השמירה הצליחה
        """
        try:
            # בדיקת תקינות ערך לפי constraints
            self._validate_preference_value(preference_name, value)
            
            # קבלת פרופיל פעיל אם לא צוין
            if profile_id is None:
                profile_id = self._get_active_profile_id(user_id)
            
            # קבלת מזהה סוג העדפה
            preference_id = self._get_preference_type_id(preference_name)
            
            # המרת ערך למחרוזת
            string_value = str(value)
            
            # שמירה לבסיס הנתונים
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if preference already exists
            cursor.execute('''
                SELECT id FROM user_preferences_v3 
                WHERE user_id = ? AND profile_id = ? AND preference_id = ?
            ''', (user_id, profile_id, preference_id))
            
            existing = cursor.fetchone()
            
            if existing:
                # Update existing preference
                cursor.execute('''
                    UPDATE user_preferences_v3 
                    SET saved_value = ?
                    WHERE user_id = ? AND profile_id = ? AND preference_id = ?
                ''', (string_value, user_id, profile_id, preference_id))
            else:
                # Insert new preference
                cursor.execute('''
                    INSERT INTO user_preferences_v3 
                    (user_id, profile_id, preference_id, saved_value)
                    VALUES (?, ?, ?, ?)
                ''', (user_id, profile_id, preference_id, string_value))
            
            conn.commit()
            conn.close()
            
            # מחיקת מטמון
            self._invalidate_user_cache(user_id, profile_id)
            
            logger.info(f"Saved preference {preference_name} for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving preference {preference_name} for user {user_id}: {e}")
            raise
    
    def save_preferences(self, user_id: int, preferences: Dict[str, Any], profile_id: int = None) -> bool:
        """
        שמירת העדפות מרובות
        
        Args:
            user_id: מזהה משתמש
            preferences: מילון עם העדפות
            profile_id: מזהה פרופיל (אופציונלי)
        
        Returns:
            True אם השמירה הצליחה
        """
        try:
            # קבלת פרופיל פעיל אם לא צוין
            if profile_id is None:
                profile_id = self._get_active_profile_id(user_id)
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            for preference_name, value in preferences.items():
                try:
                    # קבלת מזהה סוג העדפה
                    preference_id = self._get_preference_type_id(preference_name)
                    
                    # המרת ערך למחרוזת
                    string_value = str(value)
                    
                    # Check if preference already exists
                    cursor.execute('''
                        SELECT id FROM user_preferences_v3 
                        WHERE user_id = ? AND profile_id = ? AND preference_id = ?
                    ''', (user_id, profile_id, preference_id))
                    
                    existing = cursor.fetchone()
                    
                    if existing:
                        # Update existing preference
                        cursor.execute('''
                            UPDATE user_preferences_v3 
                            SET saved_value = ?
                            WHERE user_id = ? AND profile_id = ? AND preference_id = ?
                        ''', (string_value, user_id, profile_id, preference_id))
                    else:
                        # Insert new preference
                        cursor.execute('''
                            INSERT INTO user_preferences_v3 
                            (user_id, profile_id, preference_id, saved_value)
                            VALUES (?, ?, ?, ?)
                        ''', (user_id, profile_id, preference_id, string_value))
                except Exception as e:
                    logger.warning(f"Failed to save preference {preference_name}: {e}")
                    continue
            
            conn.commit()
            conn.close()
            
            # מחיקת מטמון
            self._invalidate_user_cache(user_id, profile_id)
            
            logger.info(f"Saved {len(preferences)} preferences for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving preferences for user {user_id}: {e}")
            raise
    
    def _convert_value(self, value: str, data_type: str) -> Any:
        """המרת ערך לפי סוג הנתונים"""
        if value is None:
            return None
        
        try:
            if data_type == 'string':
                return str(value)
            elif data_type == 'number':
                return float(value)
            elif data_type == 'boolean':
                return str(value).lower() in ('true', '1', 'yes', 'on')
            elif data_type == 'json':
                return json.loads(value)
            elif data_type == 'color':
                return str(value)
            elif data_type == 'select':
                return str(value)
            else:
                return str(value)
        except Exception as e:
            logger.warning(f"Error converting value {value} to type {data_type}: {e}")
            return str(value)
    
    def get_preference_info(self, preference_name: str) -> Dict[str, Any]:
        """קבלת מידע על סוג העדפה"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT pt.preference_name, pt.data_type, pt.description, 
                       pt.constraints, pt.default_value, pt.is_required,
                       pg.group_name
                FROM preference_types pt
                JOIN preference_groups pg ON pt.group_id = pg.id
                WHERE pt.preference_name = ? AND pt.is_active = TRUE
            ''', (preference_name,))
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                return {
                    'name': result[0],
                    'type': result[1],
                    'description': result[2],
                    'constraints': json.loads(result[3]) if result[3] else {},
                    'default_value': result[4],
                    'required': bool(result[5]),
                    'group': result[6]
                }
            else:
                raise ValueError(f"Preference type not found: {preference_name}")
            
        except Exception as e:
            logger.error(f"Error getting preference info for {preference_name}: {e}")
            raise
    
    def get_default_preference(self, preference_name: str) -> Any:
        """קבלת ערך ברירת מחדל של העדפה"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT default_value, data_type
                FROM preference_types
                WHERE preference_name = ? AND is_active = TRUE
            ''', (preference_name,))
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                default_value = result[0]
                data_type = result[1]
                
                # Convert to appropriate type
                if data_type == 'number' and default_value is not None:
                    try:
                        return float(default_value)
                    except ValueError:
                        return int(default_value)
                elif data_type == 'boolean' and default_value is not None:
                    return default_value.lower() in ('true', '1', 'yes', 'on')
                elif data_type == 'json' and default_value is not None:
                    return json.loads(default_value)
                else:
                    return default_value
            else:
                return None
                
        except Exception as e:
            logger.error(f"Error getting default preference for {preference_name}: {e}")
            return None
    
    def get_user_profiles(self, user_id: int) -> List[Dict[str, Any]]:
        """קבלת פרופילים של משתמש
        כולל פרופיל ברירת מחדל מיוחד (ID: 0, user_id: 0)
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get user-specific profiles
            cursor.execute('''
                SELECT id, profile_name, is_active, is_default, description,
                       last_used_at, usage_count, created_at, user_id
                FROM preference_profiles
                WHERE user_id = ?
                ORDER BY is_default DESC, last_used_at DESC
            ''', (user_id,))
            
            user_profiles = cursor.fetchall()
            
            # Get default profile (special system profile: ID: 0, user_id: 0)
            cursor.execute('''
                SELECT id, profile_name, is_active, is_default, description,
                       last_used_at, usage_count, created_at, user_id
                FROM preference_profiles
                WHERE user_id = 0 AND is_default = 1
                LIMIT 1
            ''')
            
            default_profile = cursor.fetchone()
            conn.close()
            
            profiles = []
            
            # Add default profile first if exists
            if default_profile:
                # Check if user has any active profile
                has_active_user_profile = any(row[2] for row in user_profiles)
                
                profiles.append({
                    'id': default_profile[0],
                    'name': default_profile[1],
                    'active': not has_active_user_profile,  # Active only if no user profile is active
                    'default': bool(default_profile[3]),
                    'description': default_profile[4] or 'פרופיל ברירת מחדל של המערכת',
                    'last_used': default_profile[5],
                    'usage_count': default_profile[6],
                    'created_at': default_profile[7],
                    'user_id': default_profile[8]
                })
            
            # Add user-specific profiles
            for row in user_profiles:
                profiles.append({
                    'id': row[0],
                    'name': row[1],
                    'active': bool(row[2]),
                    'default': bool(row[3]),
                    'description': row[4],
                    'last_used': row[5],
                    'usage_count': row[6],
                    'created_at': row[7],
                    'user_id': row[8]
                })
            
            return profiles
            
        except Exception as e:
            logger.error(f"Error getting profiles for user {user_id}: {e}")
            raise

    def get_preference_groups(self) -> List[Dict[str, Any]]:
        """קבלת קבוצות העדפות"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, group_name, group_name, description, 
                       1, 0, created_at
                FROM preference_groups
                ORDER BY group_name ASC
            ''')
            
            results = cursor.fetchall()
            conn.close()
            
            groups = []
            for row in results:
                groups.append({
                    'id': row[0],
                    'name': row[1],
                    'display_name': row[2],
                    'description': row[3],
                    'active': bool(row[4]),
                    'sort_order': row[5],
                    'created_at': row[6]
                })
            
            return groups
            
        except Exception as e:
            logger.error(f"Error getting preference groups: {e}")
            raise

    def activate_profile(self, user_id: int, profile_id: int, activated_by: int = None) -> bool:
        """הפעלת פרופיל משתמש
        
        Args:
            user_id: מזהה משתמש
            profile_id: מזהה פרופיל
            activated_by: מזהה משתמש שהפעיל את הפרופיל (אופציונלי)
        
        Returns:
            True אם הפעלה בוצעה בהצלחה, False אחרת
        """
        try:
            # Handle default profile (ID: 0) - special system profile
            if profile_id == 0:
                logger.info(f"Default profile (ID: 0) selected - special system profile, no DB activation needed")
                return True
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if profile exists for this user
            cursor.execute('''
                SELECT id FROM preference_profiles 
                WHERE user_id = ? AND id = ?
            ''', (user_id, profile_id))
            
            if not cursor.fetchone():
                logger.error(f"Profile {profile_id} not found for user {user_id}")
                conn.close()
                return False
            
            # Deactivate all user profiles
            cursor.execute('''
                UPDATE preference_profiles 
                SET is_active = 0 
                WHERE user_id = ?
            ''', (user_id,))
            
            # Activate the selected profile
            cursor.execute('''
                UPDATE preference_profiles 
                SET is_active = 1, last_used_at = CURRENT_TIMESTAMP,
                    usage_count = usage_count + 1
                WHERE user_id = ? AND id = ?
            ''', (user_id, profile_id))
            
            # Verify activation succeeded
            cursor.execute('''
                SELECT is_active FROM preference_profiles 
                WHERE user_id = ? AND id = ?
            ''', (user_id, profile_id))
            
            result = cursor.fetchone()
            if not result or result[0] != 1:
                logger.error(f"Failed to activate profile {profile_id} for user {user_id}")
                conn.rollback()
                conn.close()
                return False
            
            conn.commit()
            conn.close()
            
            logger.info(f"Successfully activated profile {profile_id} for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error activating profile {profile_id} for user {user_id}: {e}")
            return False

    def get_all_preference_types(self) -> List[Dict[str, Any]]:
        """Fetch all preference types with their group metadata."""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            cursor.execute(
                '''
                SELECT
                    pt.id,
                    pt.preference_name,
                    pt.data_type,
                    pt.description,
                    pt.default_value,
                    pt.is_required,
                    pt.is_active,
                    pt.group_id,
                    pg.group_name
                FROM preference_types pt
                LEFT JOIN preference_groups pg ON pt.group_id = pg.id
                ORDER BY pt.id ASC
                '''
            )

            rows = cursor.fetchall()
            conn.close()

            preference_types = []
            for row in rows:
                preference_types.append({
                    "id": row["id"],
                    "preference_name": row["preference_name"],
                    "data_type": row["data_type"],
                    "description": row["description"],
                    "default_value": row["default_value"],
                    "is_required": bool(row["is_required"]),
                    "is_active": bool(row["is_active"]),
                    "group_id": row["group_id"],
                    "group_name": row["group_name"]
                })

            return preference_types

        except Exception as e:
            logger.error(f"Error fetching preference types: {e}")
            raise

    def check_preference_type_exists(self, preference_name: str) -> bool:
        """
        בדיקת קיום סוג העדפה במסד הנתונים
        
        Args:
            preference_name: שם סוג ההעדפה
        
        Returns:
            True אם הסוג קיים, False אחרת
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT COUNT(*) FROM preference_types 
                WHERE preference_name = ? AND is_active = 1
            ''', (preference_name,))
            
            count = cursor.fetchone()[0]
            conn.close()
            
            return count > 0
            
        except Exception as e:
            logger.error(f"Error checking preference type existence for {preference_name}: {e}")
            return False
    
    def create_profile(self, user_id: int, profile_name: str, description: str = '', created_by: int = None, is_default: bool = False) -> Optional[int]:
        """
        יצירת פרופיל חדש
        
        Args:
            user_id: מזהה משתמש
            profile_name: שם הפרופיל
            description: תיאור הפרופיל (אופציונלי)
            created_by: מזהה משתמש שיצר את הפרופיל (אופציונלי)
            is_default: האם זה פרופיל ברירת מחדל (default: False)
        
        Returns:
            מזהה הפרופיל החדש או None אם נכשל
        
        Raises:
            ValidationError: אם שם הפרופיל לא תקין או כבר קיים
        """
        try:
            # בדיקת תקינות שם הפרופיל
            if not profile_name or not profile_name.strip():
                raise ValidationError("Profile name cannot be empty")
            
            profile_name = profile_name.strip()
            
            # בדיקה אם פרופיל עם אותו שם כבר קיים למשתמש
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id FROM preference_profiles 
                WHERE user_id = ? AND profile_name = ?
            ''', (user_id, profile_name))
            
            existing = cursor.fetchone()
            if existing:
                conn.close()
                raise ValidationError(f"Profile '{profile_name}' already exists for this user")
            
            # יצירת הפרופיל החדש
            # חשוב: הפרופיל נוצר עם is_active=0 (לא פעיל) עד שהמשתמש מפעיל אותו
            cursor.execute('''
                INSERT INTO preference_profiles 
                (user_id, profile_name, description, is_active, is_default, created_by, created_at, updated_at)
                VALUES (?, ?, ?, 0, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ''', (user_id, profile_name, description or f'פרופיל {profile_name}', int(is_default), created_by))
            
            profile_id = cursor.lastrowid
            
            # אם זה פרופיל ברירת מחדל, צריך לוודא שאין פרופיל ברירת מחדל אחר למשתמש
            if is_default:
                cursor.execute('''
                    UPDATE preference_profiles 
                    SET is_default = 0 
                    WHERE user_id = ? AND id != ?
                ''', (user_id, profile_id))
            
            conn.commit()
            conn.close()
            
            # ניקוי מטמון
            self._invalidate_user_cache(user_id)
            
            logger.info(f"Created profile '{profile_name}' (ID: {profile_id}) for user {user_id}")
            return profile_id
            
        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"Error creating profile '{profile_name}' for user {user_id}: {e}")
            raise


# יצירת מופע גלובלי
preferences_service = PreferencesService()
