"""
Preferences Model - TikTrack New Architecture
==============================================

מודל מתקדם למערכת העדפות עם תמיכה בפרופילים מרובים,
יבוא/יצוא הגדרות, ומבנה נתונים משופר.

Author: TikTrack Development Team
Version: 3.0
Date: January 2025
"""

from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Dict, Any, List, Optional
from enum import Enum
import json

from .base import BaseModel


class PreferenceType(Enum):
    """סוגי הגדרות"""
    GENERAL = "general"
    FILTERS = "filters" 
    COLORS = "colors"
    UI = "ui"
    EXTERNAL_DATA = "external_data"
    NOTIFICATIONS = "notifications"
    TRADING = "trading"


class PreferenceGroup(BaseModel):
    """קבוצת העדפות"""
    __tablename__ = 'preference_groups'
    
    group_name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    
    # יחסים - מושבתים זמנית עד לבניית מודול משתמשים מלא
    # preference_types = relationship("PreferenceType", back_populates="group")
    
    def __repr__(self):
        return f"<PreferenceGroup(name='{self.group_name}')>"


class PreferenceType(BaseModel):
    """סוג העדפה"""
    __tablename__ = 'preference_types'
    
    group_id = Column(Integer, ForeignKey('preference_groups.id'), nullable=False)
    data_type = Column(String(20), nullable=False)  # string, number, boolean, json
    preference_name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    constraints = Column(Text)  # JSON string with validation rules
    default_value = Column(Text)
    is_required = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # יחסים - מושבתים זמנית עד לבניית מודול משתמשים מלא
    # group = relationship("PreferenceGroup", back_populates="preference_types")
    # user_preferences = relationship("UserPreference", back_populates="preference_type")
    
    def __repr__(self):
        return f"<PreferenceType(name='{self.preference_name}', type='{self.data_type}')>"


class PreferenceProfile(BaseModel):
    """פרופיל העדפות"""
    __tablename__ = 'preference_profiles'
    
    # Temporarily remove foreign key constraints to avoid mapping issues
    # user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    user_id = Column(Integer, nullable=False)
    profile_name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    description = Column(Text)
    # created_by = Column(Integer, ForeignKey('users.id'))
    created_by = Column(Integer)
    last_used_at = Column(DateTime)
    usage_count = Column(Integer, default=0)
    
    # יחסים - מושבתים זמנית עד לבניית מודול משתמשים מלא
    # user = relationship("User", foreign_keys=[user_id], back_populates="preference_profiles")
    # user_preferences = relationship("UserPreference", back_populates="profile")
    
    def __repr__(self):
        return f"<PreferenceProfile(user_id={self.user_id}, name='{self.profile_name}')>"


class UserPreference(BaseModel):
    """העדפת משתמש"""
    __tablename__ = 'user_preferences'
    
    # Temporarily remove foreign key constraints to avoid mapping issues
    # user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    user_id = Column(Integer, nullable=False)
    profile_id = Column(Integer, ForeignKey('preference_profiles.id'), nullable=False)
    preference_id = Column(Integer, ForeignKey('preference_types.id'), nullable=False)
    saved_value = Column(Text)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # יחסים - מושבתים זמנית עד לבניית מודול משתמשים מלא
    # preference_type = relationship("PreferenceType", back_populates="user_preferences")
    # profile = relationship("PreferenceProfile", back_populates="user_preferences")
    
    def __repr__(self):
        return f"<UserPreference(user_id={self.user_id}, preference_id={self.preference_id}, value='{self.saved_value}')>"


# UserPreferences model removed - using new dynamic preferences system


class Preference(BaseModel):
    """
    Legacy compatibility model used by the historical test-suite.
    Stores simple key/value preference pairs while reusing the shared BaseModel.
    """
    __tablename__ = 'preferences_legacy'

    key = Column(String(150), nullable=False, unique=True)
    value = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Preference(key='{self.key}', value='{self.value}')>"

# Default preferences for fallback when user preferences are not available
# CRITICAL: This is the single source of truth for all default preference values
# The backend MUST return valid values for all requested preferences, using this as fallback

# Color defaults - complete list matching ColorManager.defaultColors
COLOR_DEFAULTS = {
    # Chart colors (7)
    'chartBackgroundColor': '#ffffff',
    'chartBorderColor': '#e0e0e0',
    'chartGridColor': '#f0f0f0',
    'chartPointColor': '#26baac',
    'chartPrimaryColor': '#1a8f83',
    'chartSecondaryColor': '#fc5a06',
    'chartTextColor': '#333333',
    
    # Entity colors (30)
    'entityAlertColor': '#ff9800',
    'entityAlertColorDark': '#f57c00',
    'entityAlertColorLight': '#ffb74d',
    'entityInfoColor': '#17a2b8',
    'entityInfoColorDark': '#138496',
    'entityInfoColorLight': '#bee5eb',
    'entityNoteColor': '#607d8b',
    'entityNoteColorDark': '#455a64',
    'entityNoteColorLight': '#90a4ae',
    'entityTradeColor': '#26baac',
    'entityTradeColorDark': '#1a8f83',
    'entityTradeColorLight': '#6ed8ca',
    'entityTickerColor': '#17a2b8',
    'entityTickerColorDark': '#138496',
    'entityTickerColorLight': '#20c997',
    'entityExecutionColor': '#6f42c1',
    'entityExecutionColorDark': '#5a2d91',
    'entityExecutionColorLight': '#8e44ad',
    'entityTradingAccountColor': '#28a745',
    'entityTradingAccountColorDark': '#1e7e34',
    'entityTradingAccountColorLight': '#34ce57',
    'entityTradePlanColor': '#9c27b0',
    'entityTradePlanColorDark': '#7b1fa2',
    'entityTradePlanColorLight': '#ba68c8',
    'entityCashFlowColor': '#20c997',
    'entityCashFlowColorDark': '#138496',
    'entityCashFlowColorLight': '#20c997',
    'entityPreferencesColor': '#607d8b',
    'entityPreferencesColorDark': '#455a64',
    'entityPreferencesColorLight': '#90a4ae',
    'entityResearchColor': '#9c27b0',
    'entityResearchColorDark': '#7b1fa2',
    'entityResearchColorLight': '#ba68c8',
    
    # Status colors (3)
    'statusOpenColor': '#28a745',
    'statusClosedColor': '#6c757d',
    'statusCancelledColor': '#dc3545',
    
    # Value colors (9)
    'valuePositiveColor': '#28a745',
    'valueNegativeColor': '#dc3545',
    'valueNeutralColor': '#6c757d',
    'valuePositiveColorLight': '#e8f5e8',
    'valuePositiveColorDark': '#1e7e34',
    'valueNegativeColorLight': '#fdeaea',
    'valueNegativeColorDark': '#c82333',
    'valueNeutralColorLight': '#f8f9fa',
    'valueNeutralColorDark': '#495057',
    
    # Theme colors (7)
    'primaryColor': '#26baac',
    'secondaryColor': '#fc5a06',
    'successColor': '#28a745',
    'dangerColor': '#dc3545',
    'warningColor': '#ffc107',
    'infoColor': '#17a2b8',
    'linkColor': '#26baac',
    
    # UI colors (6)
    'backgroundColor': '#ffffff',
    'textColor': '#333333',
    'borderColor': '#dee2e6',
    'shadowColor': '#666666',
    'highlightColor': '#26baac',
    
    # Notification colors (4)
    'notificationSuccessColor': '#28a745',
    'notificationErrorColor': '#dc3545',
    'notificationWarningColor': '#ffc107',
    'notificationInfoColor': '#17a2b8',
}

# Legacy color names (for backward compatibility)
LEGACY_COLOR_DEFAULTS = {
    "primary_color": "#26baac",  # Maps to primaryColor
    "secondary_color": "#fc5a06",  # Maps to secondaryColor
    "chartSecondaryColor": "#26baac",  # Maps to chartSecondaryColor
}

# Unified default preferences - single source of truth
DEFAULT_PREFERENCES = {
    **COLOR_DEFAULTS,
    **LEGACY_COLOR_DEFAULTS,
}