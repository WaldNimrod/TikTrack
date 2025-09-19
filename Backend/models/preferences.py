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
    
    # יחסים
    preference_types = relationship("PreferenceType", back_populates="group")
    
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
    
    # יחסים
    group = relationship("PreferenceGroup", back_populates="preference_types")
    user_preferences = relationship("UserPreference", back_populates="preference_type")
    
    def __repr__(self):
        return f"<PreferenceType(name='{self.preference_name}', type='{self.data_type}')>"


class PreferenceProfile(BaseModel):
    """פרופיל העדפות"""
    __tablename__ = 'preference_profiles'
    
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    profile_name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    description = Column(Text)
    created_by = Column(Integer, ForeignKey('users.id'))
    last_used_at = Column(DateTime)
    usage_count = Column(Integer, default=0)
    
    # יחסים - מושבתים זמנית עד לבניית מודול משתמשים מלא
    # user = relationship("User", back_populates="preference_profiles")
    user_preferences = relationship("UserPreference", back_populates="profile")
    
    def __repr__(self):
        return f"<PreferenceProfile(user_id={self.user_id}, name='{self.profile_name}')>"


class UserPreference(BaseModel):
    """העדפת משתמש"""
    __tablename__ = 'user_preferences_v3'
    
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    profile_id = Column(Integer, ForeignKey('preference_profiles.id'), nullable=False)
    preference_id = Column(Integer, ForeignKey('preference_types.id'), nullable=False)
    saved_value = Column(Text)
    
    # יחסים
    preference_type = relationship("PreferenceType", back_populates="user_preferences")
    profile = relationship("PreferenceProfile", back_populates="user_preferences")
    
    def __repr__(self):
        return f"<UserPreference(user_id={self.user_id}, preference='{self.preference_type.preference_name if self.preference_type else 'unknown'}', value='{self.saved_value}')>"


# UserPreferences model removed - using new dynamic preferences system
