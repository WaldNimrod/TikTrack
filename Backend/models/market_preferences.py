"""
Market Preferences Model - External Data Integration
Handles user preferences for market data refresh and timezone settings
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from .base import Base
import json


class MarketPreferences(Base):
    """Market preferences model for user settings"""
    __tablename__ = 'user_preferences'

    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    timezone = Column(String(64), nullable=False, default='UTC')
    refresh_overrides_json = Column(Text)  # JSON string for refresh settings
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())

    def __repr__(self):
        return f"<MarketPreferences(user_id={self.user_id}, timezone='{self.timezone}')>"

    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            'user_id': self.user_id,
            'timezone': self.timezone,
            'refresh_overrides': self.get_refresh_overrides(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def get_refresh_overrides(self):
        """Get refresh overrides as dictionary"""
        if self.refresh_overrides_json:
            try:
                return json.loads(self.refresh_overrides_json)
            except json.JSONDecodeError:
                return {}
        return {}

    def set_refresh_overrides(self, overrides_dict):
        """Set refresh overrides from dictionary"""
        self.refresh_overrides_json = json.dumps(overrides_dict)

    @classmethod
    def get_user_preferences(cls, db_session, user_id):
        """Get user preferences by user ID"""
        return db_session.query(cls).filter(cls.user_id == user_id).first()

    @classmethod
    def get_or_create_preferences(cls, db_session, user_id):
        """Get existing preferences or create new ones with defaults"""
        preferences = cls.get_user_preferences(db_session, user_id)
        
        if not preferences:
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
        """Update refresh settings for user"""
        preferences = cls.get_or_create_preferences(db_session, user_id)
        overrides = preferences.get_refresh_overrides()
        
        # Update specific refresh settings
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
        """Update timezone settings for user"""
        preferences = cls.get_or_create_preferences(db_session, user_id)
        preferences.timezone = timezone
        db_session.commit()
        return preferences

    @classmethod
    def get_default_refresh_overrides(cls):
        """Get default refresh overrides"""
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
        """Get default preferences"""
        return {
            'timezone': 'UTC',
            'refresh_overrides': cls.get_default_refresh_overrides()
        }

    @classmethod
    def validate_timezone(cls, timezone):
        """Validate timezone string (basic validation for Stage-1)"""
        valid_timezones = ['UTC', 'Asia/Jerusalem', 'America/New_York', 'Europe/London']
        return timezone in valid_timezones

    @classmethod
    def validate_refresh_interval(cls, minutes):
        """Validate refresh interval (basic validation for Stage-1)"""
        return 1 <= minutes <= 1440  # 1 minute to 24 hours
