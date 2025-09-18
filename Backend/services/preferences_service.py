#!/usr/bin/env python3
"""
Preferences Service V3 - TikTrack
=================================

שירות מתקדם למערכת העדפות V3 עם מטמון אופטימלי ופונקציות נגישות

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

logger = logging.getLogger(__name__)

class PreferencesServiceV3:
    """
    שירות מתקדם למערכת העדפות V3
    
    תכונות מרכזיות:
    - מטמון פר משתמש עם TTL ארוך
    - פונקציות נגישות מהירות
    - טיפול בשגיאות מפורט
    - תמיכה בפרופילים מרובים
    - אופטימיזציה מקסימלית
    """
    
    def __init__(self, db_path: str = 'db/simpleTrade_new.db'):
        """אתחול השירות"""
        self.db_path = db_path
        self.cache = {}  # מטמון פנימי
        self.cache_ttl = 24 * 60 * 60  # 24 שעות
        self.cache_timestamps = {}  # זמני יצירת מטמון
        
        # בדיקת קיום בסיס הנתונים
        if not os.path.exists(db_path):
            raise FileNotFoundError(f"Database not found: {db_path}")
    
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
            
            cursor.execute('''
                SELECT upv3.saved_value, pt.data_type, pt.default_value
                FROM user_preferences_v3 upv3
                JOIN preference_types pt ON upv3.preference_id = pt.id
                WHERE upv3.user_id = ? AND upv3.profile_id = ? AND pt.preference_name = ?
            ''', (user_id, profile_id, preference_name))
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                saved_value, data_type, default_value = result
                value = self._convert_value(saved_value, data_type)
                
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
            
            cursor.execute('''
                SELECT pt.preference_name, 
                       COALESCE(upv3.saved_value, pt.default_value) as value,
                       pt.data_type
                FROM preference_types pt
                LEFT JOIN user_preferences_v3 upv3 ON pt.id = upv3.preference_id 
                    AND upv3.user_id = ? AND upv3.profile_id = ?
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
            
            preferences = {}
            
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
            
            cursor.execute('''
                SELECT pt.preference_name, 
                       COALESCE(upv3.saved_value, pt.default_value) as value,
                       pt.data_type,
                       pg.group_name
                FROM preference_types pt
                JOIN preference_groups pg ON pt.group_id = pg.id
                LEFT JOIN user_preferences_v3 upv3 ON pt.id = upv3.preference_id 
                    AND upv3.user_id = ? AND upv3.profile_id = ?
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
                INSERT OR REPLACE INTO user_preferences_v3 
                (user_id, profile_id, preference_id, saved_value, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
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
                    
                    # שמירה לבסיס הנתונים
                    cursor.execute('''
                        INSERT OR REPLACE INTO user_preferences_v3 
                        (user_id, profile_id, preference_id, saved_value, updated_at)
                        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
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


# יצירת מופע גלובלי
preferences_service = PreferencesServiceV3()
