"""
User Management Service - TikTrack

This module contains all business logic for managing users in the system.
Includes user operations, preferences management, and fallback to default user.

Classes:
    UserService: Main service for user management

Author: TikTrack Development Team
Version: 1.0
Date: August 2025
"""

from sqlalchemy.orm import Session
from models.user import User
from typing import List, Optional, Dict, Any
import json
import logging

logger = logging.getLogger(__name__)

class UserService:
    """
    Service for managing users in TikTrack system
    
    This service provides all functionality required for user management:
    - Create, read, update and delete (CRUD)
    - Preferences management
    - Default user fallback
    - User validation
    """
    
    # Constants
    DEFAULT_USER_ID: int = 1
    DEFAULT_USERNAME: str = "nimrod"
    
    @staticmethod
    def get_default_user(db: Session) -> Optional[User]:
        """Get the default user from database"""
        try:
            return db.query(User).filter(User.is_default == True).first()
        except Exception as e:
            logger.error(f"Error getting default user: {str(e)}")
            return None
    
    @staticmethod
    def create_default_user(db: Session) -> User:
        """Create default user if not exists"""
        try:
            # Check if default user exists
            default_user = UserService.get_default_user(db)
            if default_user:
                return default_user
            
            # Create default user with preferences from JSON file
            default_preferences = UserService.load_default_preferences()
            
            default_user = User(
                username=UserService.DEFAULT_USERNAME,
                email="nimrod@tiktrack.com",
                first_name="Nimrod",
                last_name="User",
                is_active=True,
                is_default=True,
                preferences=json.dumps(default_preferences, ensure_ascii=False)
            )
            
            db.add(default_user)
            db.commit()
            db.refresh(default_user)
            
            logger.info(f"Created default user: {default_user.username}")
            return default_user
            
        except Exception as e:
            logger.error(f"Error creating default user: {str(e)}")
            db.rollback()
            raise
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID with fallback to default user"""
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                return user
            
            # Fallback to default user
            logger.warning(f"User {user_id} not found, falling back to default user")
            return UserService.get_default_user(db)
            
        except Exception as e:
            logger.error(f"Error getting user by ID {user_id}: {str(e)}")
            return UserService.get_default_user(db)
    
    @staticmethod
    def deep_merge_dicts(d1: Dict, d2: Dict) -> Dict:
        """Deep merge two dictionaries"""
        merged = d1.copy()
        for k, v in d2.items():
            if k in merged and isinstance(merged[k], dict) and isinstance(v, dict):
                merged[k] = UserService.deep_merge_dicts(merged[k], v)
            else:
                merged[k] = v
        return merged
    
    @staticmethod
    def get_user_preferences(db: Session, user_id: int = None) -> Dict[str, Any]:
        """Get user preferences with fallback to default user"""
        try:
            # If no user_id provided, use default user
            if user_id is None:
                user_id = UserService.DEFAULT_USER_ID
            
            # Start with default preferences
            default_preferences = UserService.load_default_preferences()
            
            # Try to get preferences from the new user_preferences table
            try:
                from models.user_preferences import UserPreferences
                user_prefs = db.query(UserPreferences).filter(UserPreferences.user_id == user_id).first()
                if user_prefs:
                    # Convert database preferences to dictionary format
                    db_preferences = user_prefs.to_dict()
                    # Deep merge with defaults (database preferences override defaults)
                    current_user_preferences = UserService.deep_merge_dicts(default_preferences, db_preferences)
                    return current_user_preferences
            except Exception as e:
                logger.warning(f"Could not load preferences from user_preferences table: {e}")
            
            # Fallback to old method (user.get_preferences() from legacy JSON field)
            user = UserService.get_user_by_id(db, user_id)
            if user:
                user_preferences = user.get_preferences()
                # Deep merge user preferences with defaults (user preferences override defaults)
                current_user_preferences = UserService.deep_merge_dicts(default_preferences, user_preferences)
                return current_user_preferences
            
            # Fallback to default preferences
            logger.warning(f"User {user_id} not found, using default preferences")
            return default_preferences
            
        except Exception as e:
            logger.error(f"Error getting user preferences for user {user_id}: {str(e)}")
            return UserService.load_default_preferences()
    
    @staticmethod
    def set_user_preferences(db: Session, preferences: Dict[str, Any], user_id: int = None) -> bool:
        """Set user preferences with fallback to default user"""
        try:
            # If no user_id provided, use default user
            if user_id is None:
                user_id = UserService.DEFAULT_USER_ID
            
            # Try to get preferences from the new user_preferences table
            try:
                from models.user_preferences import UserPreferences
                user_prefs = db.query(UserPreferences).filter(UserPreferences.user_id == user_id).first()
                if user_prefs:
                    # Get current preferences and merge with new ones
                    current_db_preferences = UserService.get_user_preferences(db, user_id)
                    merged_preferences_to_save = UserService.deep_merge_dicts(current_db_preferences, preferences)
                    
                    # Update the preferences object
                    user_prefs.from_dict(merged_preferences_to_save)
                    db.commit()
                    logger.info(f"Updated preferences for user {user_id} in user_preferences table")
                    return True
            except Exception as e:
                logger.warning(f"Could not update preferences in user_preferences table: {e}")
            
            # Fallback to old method (user.set_preferences() from legacy JSON field)
            user = UserService.get_user_by_id(db, user_id)
            if user:
                # Get current preferences and merge with new ones
                current_preferences = user.get_preferences()
                # Start with default preferences and merge with current and new
                default_preferences = UserService.load_default_preferences()
                merged_preferences = default_preferences.copy()
                merged_preferences.update(current_preferences)
                merged_preferences.update(preferences)
                user.set_preferences(merged_preferences)
                db.commit()
                logger.info(f"Updated preferences for user {user_id} in legacy field")
                return True
            
            logger.error(f"User {user_id} not found, cannot update preferences")
            return False
            
        except Exception as e:
            logger.error(f"Error setting user preferences for user {user_id}: {str(e)}")
            db.rollback()
            return False
    
    @staticmethod
    def load_default_preferences() -> Dict[str, Any]:
        """Load default preferences - hardcoded defaults only"""
        # Hardcoded defaults - no more JSON file dependency
        return {
            "primaryCurrency": "USD",
            "defaultStopLoss": 5,
            "defaultTargetPrice": 10,
            "defaultCommission": 1.0,
            "consoleCleanupInterval": 60000,
            "timezone": "Asia/Jerusalem",
            "defaultStatusFilter": "open",
            "defaultTypeFilter": "swing",
            "defaultAccountFilter": "all",
            "defaultDateRangeFilter": "this_week",
            "defaultSearchFilter": "",
            "dataRefreshInterval": 5,
            "primaryDataProvider": "yahoo",
            "secondaryDataProvider": "google",
            "cacheTTL": 5,
            "maxBatchSize": 25,
            "requestDelay": 200,
            "retryAttempts": 2,
            "retryDelay": 5,
            "autoRefresh": False,
            "verboseLogging": False,
            # External data preferences
            "showPercentageChanges": True,
            "showVolume": True,
            "notifyOnDataFailures": True,
            "notifyOnStaleData": False,
            "refreshOverrides": {},
            # הגדרות שקיפות כותרות
            "headerOpacity": {
                "main": 60,
                "sub": 30
            },
            # הגדרות צבעים לפי סטטוסים
            "statusColors": {
                "open": {
                    "light": "rgba(40, 167, 69, 0.1)",
                    "medium": "#28a745",
                    "dark": "#155724",
                    "border": "rgba(40, 167, 69, 0.3)"
                },
                "closed": {
                    "light": "rgba(108, 117, 125, 0.1)",
                    "medium": "#6c757d",
                    "dark": "#383d41",
                    "border": "rgba(108, 117, 125, 0.3)"
                },
                "cancelled": {
                    "light": "rgba(220, 53, 69, 0.1)",
                    "medium": "#dc3545",
                    "dark": "#721c24",
                    "border": "rgba(220, 53, 69, 0.3)"
                }
            },
            # הגדרות צבעים לפי סוגי השקעה
            "investmentTypeColors": {
                "swing": {
                    "light": "rgba(0, 123, 255, 0.1)",
                    "medium": "#007bff",
                    "dark": "#0056b3",
                    "border": "rgba(0, 123, 255, 0.3)"
                },
                "investment": {
                    "light": "rgba(40, 167, 69, 0.1)",
                    "medium": "#28a745",
                    "dark": "#155724",
                    "border": "rgba(40, 167, 69, 0.3)"
                },
                "passive": {
                    "light": "rgba(111, 66, 193, 0.1)",
                    "medium": "#6f42c1",
                    "dark": "#4a2c7a",
                    "border": "rgba(111, 66, 193, 0.3)"
                }
            }
        }
    
    @staticmethod
    def get_current_user_id() -> int:
        """Get current user ID (for now always returns default user ID)"""
        return UserService.DEFAULT_USER_ID
    
    @staticmethod
    def ensure_default_user_exists(db: Session) -> User:
        """Ensure default user exists in database"""
        try:
            default_user = UserService.get_default_user(db)
            if not default_user:
                default_user = UserService.create_default_user(db)
            
            return default_user
            
        except Exception as e:
            logger.error(f"Error ensuring default user exists: {str(e)}")
            raise
    
    @staticmethod
    def get_all_users(db: Session) -> List[User]:
        """Get all users from database"""
        try:
            return db.query(User).all()
        except Exception as e:
            logger.error(f"Error getting all users: {str(e)}")
            return []
    
    @staticmethod
    def validate_user_data(user_data: dict) -> Dict[str, Any]:
        """Validate user data"""
        errors = []
        warnings = []
        
        # Username validation
        username = user_data.get('username', '')
        if username:
            if len(username) < 3:
                errors.append("Username must be at least 3 characters long")
            if len(username) > 50:
                errors.append("Username cannot be longer than 50 characters")
            if not username.isalnum():
                errors.append("Username can only contain letters and numbers")
        
        # Email validation
        email = user_data.get('email', '')
        if email:
            if '@' not in email or '.' not in email:
                errors.append("Email must be a valid email address")
        
        # Name validation
        first_name = user_data.get('first_name', '')
        if not first_name:
            errors.append("First name is required")
        elif len(first_name) > 50:
            errors.append("First name cannot be longer than 50 characters")
        
        last_name = user_data.get('last_name', '')
        if not last_name:
            errors.append("Last name is required")
        elif len(last_name) > 50:
            errors.append("Last name cannot be longer than 50 characters")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
