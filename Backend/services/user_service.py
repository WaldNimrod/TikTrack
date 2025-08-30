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
    def get_user_preferences(db: Session, user_id: int = None) -> Dict[str, Any]:
        """Get user preferences with fallback to default user"""
        try:
            # If no user_id provided, use default user
            if user_id is None:
                user_id = UserService.DEFAULT_USER_ID
            
            # Start with default preferences
            default_preferences = UserService.load_default_preferences()
            
            user = UserService.get_user_by_id(db, user_id)
            if user:
                user_preferences = user.get_preferences()
                # Merge user preferences with defaults (user preferences override defaults)
                merged_preferences = default_preferences.copy()
                merged_preferences.update(user_preferences)
                return merged_preferences
            
            # Fallback to default preferences from JSON file
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
                logger.info(f"Updated preferences for user {user_id}")
                return True
            
            logger.error(f"User {user_id} not found, cannot update preferences")
            return False
            
        except Exception as e:
            logger.error(f"Error setting user preferences for user {user_id}: {str(e)}")
            db.rollback()
            return False
    
    @staticmethod
    def load_default_preferences() -> Dict[str, Any]:
        """Load default preferences from JSON file"""
        try:
            import os
            preferences_file = os.path.join(
                os.path.dirname(__file__), 
                '..', 'trading-ui', 'config', 'preferences.json'
            )
            
            if os.path.exists(preferences_file):
                with open(preferences_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # Return defaults section if available
                    if 'defaults' in data:
                        return data['defaults']
                    elif 'preferences' in data:
                        return data['preferences']
                    else:
                        return {}
            
            # Fallback to hardcoded defaults
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
                "defaultSearchFilter": ""
            }
            
        except Exception as e:
            logger.error(f"Error loading default preferences: {str(e)}")
            # Hardcoded fallback
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
                "defaultSearchFilter": ""
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
