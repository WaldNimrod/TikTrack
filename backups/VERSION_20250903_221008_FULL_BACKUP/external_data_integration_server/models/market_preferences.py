"""
MarketPreferences Model - External Data Integration
SQLAlchemy model for user market data preferences and settings.

This model stores user-specific preferences for the external data integration
system, including timezone settings, refresh policies, and provider preferences.
Each user can have their own customized settings for how market data is
displayed and updated.

Key Features:
- User-specific timezone settings
- Configurable refresh policies per ticker
- JSON-based flexible preference storage
- Timestamp tracking for preference changes
- Integration with existing user system

Author: TikTrack Development Team
Created: January 2025
Version: 1.0
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from .base import Base
import json


class MarketPreferences(Base):
    """
    Market preferences model for user settings and configurations.
    
    This model stores user-specific preferences for how market data should
    be displayed, updated, and managed. It allows each user to customize
    their experience with the external data integration system.
    
    Attributes:
        user_id: Primary key linking to the user (will be linked to existing users table)
        timezone: User's preferred timezone for data display
        refresh_overrides_json: JSON string containing custom refresh settings
        updated_at: Timestamp when preferences were last updated
    """
    __tablename__ = 'user_preferences'

    # Primary key - links to existing user system
    user_id = Column(Integer, primary_key=True)  # Will be linked to existing users table
    
    # User's preferred timezone for data display
    timezone = Column(String(64), nullable=False, default='UTC')
    
    # JSON string containing custom refresh settings for specific tickers
    # Format: {"AAPL": "high", "GOOGL": "medium", "TSLA": "manual"}
    refresh_overrides_json = Column(Text)
    
    # Timestamp for tracking when preferences were last updated
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())

    def __repr__(self):
        """
        String representation of the preferences for debugging and logging.
        
        Returns:
            str: Human-readable representation of the preferences
        """
        return f"<MarketPreferences(user_id={self.user_id}, timezone='{self.timezone}')>"

    def to_dict(self):
        """
        Convert preferences object to dictionary for API responses.
        
        This method serializes the preferences object into a format suitable
        for JSON API responses, including parsed refresh overrides.
        
        Returns:
            dict: Dictionary representation of the preferences
        """
        return {
            'user_id': self.user_id,
            'timezone': self.timezone,
            'refresh_overrides': self.get_refresh_overrides(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def get_refresh_overrides(self):
        """
        Get refresh overrides as dictionary.
        
        Parses the JSON string stored in the database and returns
        a Python dictionary. Handles JSON decode errors gracefully.
        
        Returns:
            dict: Dictionary containing refresh override settings
        """
        if self.refresh_overrides_json:
            try:
                return json.loads(self.refresh_overrides_json)
            except json.JSONDecodeError:
                return {}
        return {}

    def set_refresh_overrides(self, overrides_dict):
        """
        Set refresh overrides from dictionary.
        
        Converts a Python dictionary to JSON string for storage
        in the database.
        
        Args:
            overrides_dict (dict): Dictionary containing refresh settings
        """
        self.refresh_overrides_json = json.dumps(overrides_dict)

    @classmethod
    def get_user_preferences(cls, db_session, user_id):
        """
        Get user preferences by user ID.
        
        Args:
            db_session: Database session for querying
            user_id (int): The user ID to get preferences for
            
        Returns:
            MarketPreferences or None: The preferences object if found, None otherwise
        """
        return db_session.query(cls).filter(cls.user_id == user_id).first()

    @classmethod
    def get_or_create_preferences(cls, db_session, user_id):
        """
        Get existing preferences or create new ones with defaults.
        
        This method ensures that every user has preference settings,
        creating default preferences if none exist.
        
        Args:
            db_session: Database session for database operations
            user_id (int): The user ID to get/create preferences for
            
        Returns:
            MarketPreferences: The preferences object (existing or newly created)
        """
        preferences = cls.get_user_preferences(db_session, user_id)
        
        if not preferences:
            # Create new preferences with default values
            preferences = cls(
                user_id=user_id,
                timezone='UTC',
                refresh_overrides_json=json.dumps(cls.get_default_refresh_overrides())
            )
            db_session.add(preferences)
            db_session.commit()
        
        return preferences

    @classmethod
    def update_refresh_settings(cls, db_session, user_id, mode, interval):
        """
        Update refresh settings for user.
        
        Updates the refresh mode and interval settings for a specific user.
        Supports auto, manual, and custom refresh modes.
        
        Args:
            db_session: Database session for database operations
            user_id (int): The user ID to update settings for
            mode (str): Refresh mode ('auto', 'manual', 'custom')
            interval: Interval settings (minutes for auto, custom config for custom)
            
        Returns:
            MarketPreferences: The updated preferences object
        """
        preferences = cls.get_or_create_preferences(db_session, user_id)
        overrides = preferences.get_refresh_overrides()
        
        # Update specific refresh settings based on mode
        if mode == 'auto':
            overrides['mode'] = 'auto'
            overrides['interval_minutes'] = interval
        elif mode == 'manual':
            overrides['mode'] = 'manual'
        elif mode == 'custom':
            overrides['mode'] = 'custom'
            overrides['custom_intervals'] = interval
        
        preferences.set_refresh_overrides(overrides)
        db_session.commit()
        return preferences

    @classmethod
    def update_timezone_settings(cls, db_session, user_id, timezone):
        """
        Update timezone settings for user.
        
        Args:
            db_session: Database session for database operations
            user_id (int): The user ID to update timezone for
            timezone (str): The new timezone setting
            
        Returns:
            MarketPreferences: The updated preferences object
        """
        preferences = cls.get_or_create_preferences(db_session, user_id)
        preferences.timezone = timezone
        db_session.commit()
        return preferences

    @classmethod
    def get_default_refresh_overrides(cls):
        """
        Get default refresh overrides configuration.
        
        Returns a comprehensive default configuration for refresh settings
        that covers different market conditions and time periods.
        
        Returns:
            dict: Default refresh configuration
        """
        return {
            'mode': 'auto',
            'interval_minutes': 5,
            'closed': {
                'weekdays': {'offset_minutes_after_close': 45}
            },
            'open': {
                'active': {'in_minutes': 5, 'off_minutes': 60},
                'no_active': {'in_minutes': 60, 'off_minutes': 60}
            },
            'weekend': {
                'open': {'daily_hour_ny': 12}
            }
        }

    @classmethod
    def get_default_preferences(cls):
        """
        Get default preferences configuration.
        
        Returns the complete default preferences structure including
        timezone and refresh settings.
        
        Returns:
            dict: Complete default preferences configuration
        """
        return {
            'timezone': 'UTC',
            'refresh_overrides': cls.get_default_refresh_overrides()
        }

    @classmethod
    def validate_timezone(cls, timezone):
        """
        Validate timezone string (basic validation for Stage-1).
        
        Checks if the provided timezone is in the list of supported timezones.
        This is a basic validation that can be expanded in Stage-2.
        
        Args:
            timezone (str): The timezone string to validate
            
        Returns:
            bool: True if valid, False otherwise
        """
        if not timezone:
            return False
        valid_timezones = ['UTC', 'Asia/Jerusalem', 'America/New_York', 'Europe/London']
        return timezone in valid_timezones

    @classmethod
    def validate_refresh_interval(cls, minutes):
        """
        Validate refresh interval (basic validation for Stage-1).
        
        Ensures the refresh interval is within acceptable bounds
        (1 minute to 24 hours).
        
        Args:
            minutes (int/float): The interval in minutes to validate
            
        Returns:
            bool: True if valid, False otherwise
        """
        if not isinstance(minutes, (int, float)):
            return False
        return 1 <= minutes <= 1440  # 1 minute to 24 hours

    @classmethod
    def validate_refresh_mode(cls, mode):
        """
        Validate refresh mode.
        
        Checks if the provided refresh mode is supported.
        
        Args:
            mode (str): The refresh mode to validate
            
        Returns:
            bool: True if valid, False otherwise
        """
        valid_modes = ['auto', 'manual', 'custom']
        return mode in valid_modes
