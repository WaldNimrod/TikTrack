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

# Add constraint service
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from services.constraint_service import ConstraintService

# Import Advanced Cache System
from services.advanced_cache_service import cache_with_deps, invalidate_cache

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
    
    ✅ משולב עם AdvancedCacheService המרכזי של המערכת
    
    תכונות מרכזיות:
    - שימוש ב-@cache_with_deps decorators (TTL=300s, dependency='preferences')
    - ביטול cache אוטומטי עם @invalidate_cache
    - פונקציות נגישות מהירות
    - טיפול בשגיאות מפורט
    - תמיכה בפרופילים מרובים
    - משתלב עם /api/cache/clear המרכזי
    """
    
    def __init__(self, db_path: str = None):
        """אתחול השירות"""
        if db_path is None:
            # Default database path
            current_dir = os.path.dirname(os.path.abspath(__file__))
            db_path = os.path.join(current_dir, "..", "db", "simpleTrade_new.db")

        self.db_path = db_path
        
        # ✅ NO LOCAL CACHE - Using AdvancedCacheService!
        # Cache is managed automatically by decorators:
        # - @cache_with_deps(ttl=300, dependencies=['preferences'])  for GET methods
        # - @invalidate_cache(['preferences']) for SAVE methods
        
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
    
    # ✅ REMOVED: _get_cache_key, _is_cache_valid, _invalidate_user_cache
    # Now using AdvancedCacheService decorators (@cache_with_deps, @invalidate_cache)
    # These functions are no longer needed!
    
    def _get_active_profile_id(self, user_id: int) -> int:
        """קבלת פרופיל פעיל של משתמש"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
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
                raise ValueError(f"No active profile found for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error getting active profile for user {user_id}: {e}")
            raise

    def get_active_profile_info(self, user_id: int) -> Dict[str, Any]:
        """החזרת מידע על הפרופיל הפעיל של המשתמש (id, last_used_at)."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            cursor.execute(
                '''
                SELECT id, last_used_at
                FROM preference_profiles
                WHERE user_id = ? AND is_active = 1
                ORDER BY is_default DESC, last_used_at DESC
                LIMIT 1
                ''',
                (user_id,)
            )

            result = cursor.fetchone()
            conn.close()

            if not result:
                raise ValueError(f"No active profile found for user {user_id}")

            return {
                'profile_id': result[0],
                'last_used_at': result[1]
            }
        except Exception as e:
            logger.error(f"Error getting active profile info for user {user_id}: {e}")
            raise

    @cache_with_deps(ttl=60, dependencies=['preferences'])
    def get_preferences_version(self, user_id: int, profile_id: Optional[int] = None) -> Dict[str, Any]:
        """
        החזרת גרסת ההעדפות (timestamp מקסימלי של updated_at עבור פרופיל פעיל/נתון).

        Returns: { 'profile_id': int, 'version': str(ISO8601) }
        """
        try:
            # Resolve profile
            if profile_id is None:
                profile_id = self._get_active_profile_id(user_id)

            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            # Use MAX(updated_at); fallback to MAX(created_at) if updated_at is NULL
            cursor.execute(
                '''
                SELECT COALESCE(MAX(updated_at), MAX(created_at))
                FROM user_preferences
                WHERE user_id = ? AND profile_id = ?
                ''',
                (user_id, profile_id)
            )
            row = cursor.fetchone()
            conn.close()

            max_ts = row[0] if row else None
            # Fallback to current timestamp if no prefs exist yet
            if not max_ts:
                max_ts = datetime.utcnow().isoformat()

            return {
                'profile_id': profile_id,
                'version': str(max_ts)
            }
        except Exception as e:
            logger.error(f"Error computing preferences version for user {user_id}, profile {profile_id}: {e}")
            raise
    
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
    
    @cache_with_deps(ttl=300, dependencies=['preferences'])
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
            
            # ✅ Cache handled automatically by @cache_with_deps decorator!
            # No manual cache checking needed
            
            # שאילתה לבסיס הנתונים
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT up.saved_value, pt.data_type, pt.default_value
                FROM user_preferences up
                JOIN preference_types pt ON up.preference_id = pt.id
                WHERE up.user_id = ? AND up.profile_id = ? AND pt.preference_name = ?
            ''', (user_id, profile_id, preference_name))
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                saved_value, data_type, default_value = result
                value = self._convert_value(saved_value, data_type)
                
                # ✅ Cache handled automatically by @cache_with_deps decorator!
                
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
                    
                    # ✅ Cache handled automatically by decorator!
                    
                    logger.debug(f"Using default value for {preference_name}: {value}")
                    return value
                else:
                    raise ValueError(f"Preference not found: {preference_name}")
            
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
            
            # ✅ Cache handled automatically by decorator!
            
            # קבלת מזהה קבוצה
            group_id = self._get_group_id(group_name)
            
            # שאילתה לבסיס הנתונים
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT pt.preference_name, 
                       COALESCE(up.saved_value, pt.default_value) as value,
                       pt.data_type
                FROM preference_types pt
                LEFT JOIN user_preferences up ON pt.id = up.preference_id 
                    AND up.user_id = ? AND up.profile_id = ?
                WHERE pt.group_id = ? AND pt.is_active = TRUE
            ''', (user_id, profile_id, group_id))
            
            results = cursor.fetchall()
            conn.close()
            
            preferences = {}
            for preference_name, value, data_type in results:
                preferences[preference_name] = self._convert_value(value, data_type)
            
            # ✅ Cache handled automatically by decorator!
            
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
                
                # בניית שאילתה לכל ההעדפות בבת אחת
                placeholders = ','.join(['?' for _ in preference_names])
                query = f'''
                    SELECT pt.preference_name, up.saved_value, pt.data_type, pt.default_value
                    FROM preference_types pt
                    LEFT JOIN user_preferences up ON pt.id = up.preference_id 
                        AND up.user_id = ? AND up.profile_id = ?
                    WHERE pt.preference_name IN ({placeholders})
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
    
    @cache_with_deps(ttl=300, dependencies=['preferences'])
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
            
            # ✅ Cache handled automatically by @cache_with_deps decorator!
            
            # שאילתה לבסיס הנתונים
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT pt.preference_name, 
                       COALESCE(up.saved_value, pt.default_value) as value,
                       pt.data_type,
                       pg.group_name
                FROM preference_types pt
                JOIN preference_groups pg ON pt.group_id = pg.id
                LEFT JOIN user_preferences up ON pt.id = up.preference_id 
                    AND up.user_id = ? AND up.profile_id = ?
                WHERE pt.is_active = TRUE
                ORDER BY pg.group_name, pt.preference_name
            ''', (user_id, profile_id))
            
            results = cursor.fetchall()
            conn.close()
            
            preferences = {}
            for preference_name, value, data_type, group_name in results:
                preferences[preference_name] = self._convert_value(value, data_type)
            
            # ✅ Cache handled automatically by @cache_with_deps decorator!
            
            logger.debug(f"Retrieved {len(preferences)} total preferences")
            return preferences
            
        except Exception as e:
            logger.error(f"Error getting all preferences for user {user_id}: {e}")
            raise
    
    @invalidate_cache(['preferences'])
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
            
            cursor.execute('''
                INSERT OR REPLACE INTO user_preferences 
                (user_id, profile_id, preference_id, saved_value, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ''', (user_id, profile_id, preference_id, string_value))
            
            conn.commit()
            conn.close()
            
            # ✅ Cache invalidation handled automatically by @invalidate_cache decorator!
            
            logger.info(f"Saved preference {preference_name} for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving preference {preference_name} for user {user_id}: {e}")
            raise
    
    @invalidate_cache(['preferences'])
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
                    
                    # שמירה לבסיס הנתונים
                    cursor.execute('''
                        INSERT OR REPLACE INTO user_preferences 
                        (user_id, profile_id, preference_id, saved_value, updated_at)
                        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                    ''', (user_id, profile_id, preference_id, string_value))
                except Exception as e:
                    logger.warning(f"Failed to save preference {preference_name}: {e}")
                    continue
            
            conn.commit()
            conn.close()
            
            # ✅ Cache invalidation handled automatically by @invalidate_cache decorator!
            
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
    
    def get_user_profiles(self, user_id: int) -> List[Dict[str, Any]]:
        """קבלת פרופילים של משתמש"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, profile_name, is_active, is_default, description,
                       last_used_at, usage_count, created_at
                FROM preference_profiles
                WHERE user_id = ?
                ORDER BY is_default DESC, last_used_at DESC
            ''', (user_id,))
            
            results = cursor.fetchall()
            conn.close()
            
            profiles = []
            for row in results:
                profiles.append({
                    'id': row[0],
                    'name': row[1],
                    'active': bool(row[2]),
                    'default': bool(row[3]),
                    'description': row[4],
                    'last_used': row[5],
                    'usage_count': row[6],
                    'created_at': row[7]
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

    def activate_profile(self, user_id: int, profile_id: int) -> bool:
        """הפעלת פרופיל"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # בטל הפעלה מכל הפרופילים של המשתמש
            cursor.execute('''
                UPDATE preference_profiles 
                SET is_active = 0 
                WHERE user_id = ?
            ''', (user_id,))
            
            # הפעל את הפרופיל הנבחר
            cursor.execute('''
                UPDATE preference_profiles 
                SET is_active = 1, last_used_at = CURRENT_TIMESTAMP,
                    usage_count = usage_count + 1
                WHERE user_id = ? AND id = ?
            ''', (user_id, profile_id))
            
            conn.commit()
            conn.close()
            
            return True
            
        except Exception as e:
            logger.error(f"Error activating profile {profile_id} for user {user_id}: {e}")
            return False
    
    def get_all_preference_types(self) -> List[Dict[str, Any]]:
        """
        קבלת כל סוגי ההעדפות מהמערכת
        
        Returns:
            רשימת כל סוגי ההעדפות עם פרטיהם
        """
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT 
                    pt.id,
                    pt.group_id,
                    pt.preference_name,
                    pt.data_type,
                    pt.default_value,
                    pt.description,
                    pt.constraints,
                    pt.is_required,
                    pt.is_active,
                    pg.group_name
                FROM preference_types pt
                LEFT JOIN preference_groups pg ON pt.group_id = pg.id
                WHERE pt.is_active = 1
                ORDER BY pg.group_name, pt.preference_name
            ''')
            
            results = cursor.fetchall()
            conn.close()
            
            # המרה לרשימת dictionaries
            preference_types = []
            for row in results:
                preference_types.append({
                    'id': row['id'],
                    'group_id': row['group_id'],
                    'group_name': row['group_name'],
                    'preference_name': row['preference_name'],
                    'data_type': row['data_type'],
                    'default_value': row['default_value'],
                    'description': row['description'],
                    'constraints': row['constraints'],
                    'is_required': bool(row['is_required']),
                    'is_active': bool(row['is_active'])
                })
            
            logger.info(f"Retrieved {len(preference_types)} preference types")
            return preference_types
            
        except Exception as e:
            logger.error(f"Error getting all preference types: {e}")
            raise
    
    def clear_cache(self):
        """
        ניקוי מטמון של preferences - משתלב עם AdvancedCacheService
        
        ⚠️  NOTE: PreferencesService צריך לעבור refactoring מלא כדי להשתמש
        ב-AdvancedCacheService decorators במקום self.cache הפנימי.
        
        כרגע הפונקציה מנקה:
        1. AdvancedCacheService (דרך dependency 'preferences')
        2. self.cache הפנימי (legacy - לביטול בעתיד)
        
        תוכנית: להחליף את כל self.cache ב-decorators:
        - @cache_with_deps(ttl=300, dependencies=['preferences'])
        - @invalidate_cache(['preferences'])
        """
        try:
            # 1. Clear AdvancedCacheService cache with 'preferences' dependency
            from services.advanced_cache_service import advanced_cache_service
            advanced_cache_service.invalidate_by_dependency('preferences')
            
            # ✅ No legacy cache to clear - PreferencesService is now fully integrated!
            
            logger.info(f"✅ PreferencesService cache cleared via AdvancedCacheService (dependency: 'preferences')")
            return cache_size
        except Exception as e:
            logger.error(f"❌ Error clearing PreferencesService cache: {e}")
            return 0

    def create_profile(self, user_id: int, profile_name: str, description: str = '') -> int:
        """
        Create new profile with system default values
        
        Args:
            user_id: User ID
            profile_name: Name for the new profile
            description: Optional description
            
        Returns:
            New profile ID
            
        Raises:
            ValueError: If profile name already exists for user
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 1. Check if profile_name already exists for user
            cursor.execute('''
                SELECT id FROM preference_profiles
                WHERE user_id = ? AND profile_name = ?
            ''', (user_id, profile_name))
            
            if cursor.fetchone():
                conn.close()
                raise ValueError(f"Profile '{profile_name}' already exists for user {user_id}")
            
            # 2. INSERT INTO preference_profiles
            cursor.execute('''
                INSERT INTO preference_profiles 
                (user_id, profile_name, description, is_active, is_default, created_at)
                VALUES (?, ?, ?, 0, 0, CURRENT_TIMESTAMP)
            ''', (user_id, profile_name, description))
            
            new_profile_id = cursor.lastrowid
            logger.info(f"✅ Created profile '{profile_name}' (ID: {new_profile_id}) for user {user_id}")
            
            # 3. Get all preference_types with default_value
            cursor.execute('''
                SELECT id, default_value
                FROM preference_types
                WHERE is_active = 1 AND default_value IS NOT NULL
            ''')
            
            preference_types = cursor.fetchall()
            
            # 4. INSERT INTO user_preferences for each preference with default value
            for pref_id, default_value in preference_types:
                cursor.execute('''
                    INSERT INTO user_preferences 
                    (user_id, profile_id, preference_id, saved_value, created_at, updated_at)
                    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ''', (user_id, new_profile_id, pref_id, default_value))
            
            logger.info(f"✅ Added {len(preference_types)} default preferences to profile {new_profile_id}")
            
            # 5. Activate the new profile (set as active)
            cursor.execute('''
                UPDATE preference_profiles 
                SET is_active = 0 
                WHERE user_id = ?
            ''', (user_id,))
            
            cursor.execute('''
                UPDATE preference_profiles 
                SET is_active = 1, last_used_at = CURRENT_TIMESTAMP,
                    usage_count = 1
                WHERE id = ?
            ''', (new_profile_id,))
            
            logger.info(f"✅ Activated new profile {new_profile_id}")
            
            # Commit all changes in single transaction
            conn.commit()
            conn.close()
            
            # 6. Clear cache
            self.clear_cache()
            
            # 7. Return new profile id
            return new_profile_id
            
        except Exception as e:
            logger.error(f"Error creating profile '{profile_name}' for user {user_id}: {e}")
            raise

    def delete_profile(self, user_id: int, profile_id: int) -> bool:
        """
        Delete profile and all its preferences
        
        Args:
            user_id: User ID
            profile_id: Profile ID to delete
            
        Returns:
            True on success
            
        Raises:
            ValueError: If profile is the only one for user or doesn't exist
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 1. Check profile exists and belongs to user
            cursor.execute('''
                SELECT profile_name, is_active, is_default
                FROM preference_profiles
                WHERE user_id = ? AND id = ?
            ''', (user_id, profile_id))
            
            profile = cursor.fetchone()
            if not profile:
                conn.close()
                raise ValueError(f"Profile {profile_id} not found for user {user_id}")
            
            profile_name, is_active, is_default = profile
            
            # 2. Check not the only profile (count >= 2)
            cursor.execute('''
                SELECT COUNT(*) FROM preference_profiles
                WHERE user_id = ?
            ''', (user_id,))
            
            profile_count = cursor.fetchone()[0]
            if profile_count <= 1:
                conn.close()
                raise ValueError("Cannot delete the only profile for user")
            
            # 3. If is_active=1, switch to default profile first
            if is_active:
                logger.info(f"Profile {profile_id} is active, switching to default profile first")
                
                # Find default profile or fallback to first profile
                cursor.execute('''
                    SELECT id FROM preference_profiles
                    WHERE user_id = ? AND id != ?
                    ORDER BY is_default DESC, id ASC
                    LIMIT 1
                ''', (user_id, profile_id))
                
                new_active_profile = cursor.fetchone()
                if new_active_profile:
                    self.activate_profile(user_id, new_active_profile[0])
                    logger.info(f"✅ Switched to profile {new_active_profile[0]}")
            
            # 4. DELETE FROM user_preferences WHERE profile_id=?
            cursor.execute('''
                DELETE FROM user_preferences
                WHERE user_id = ? AND profile_id = ?
            ''', (user_id, profile_id))
            
            deleted_prefs = cursor.rowcount
            logger.info(f"✅ Deleted {deleted_prefs} preferences from profile {profile_id}")
            
            # 5. DELETE FROM preference_profiles WHERE id=?
            cursor.execute('''
                DELETE FROM preference_profiles
                WHERE user_id = ? AND id = ?
            ''', (user_id, profile_id))
            
            conn.commit()
            conn.close()
            
            logger.info(f"✅ Deleted profile '{profile_name}' (ID: {profile_id}) for user {user_id}")
            
            # 6. Clear cache
            self.clear_cache()
            
            # 7. Return True
            return True
            
        except Exception as e:
            logger.error(f"Error deleting profile {profile_id} for user {user_id}: {e}")
            raise


# יצירת מופע גלובלי
preferences_service = PreferencesService()
