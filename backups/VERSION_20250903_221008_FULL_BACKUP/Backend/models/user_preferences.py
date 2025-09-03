"""
User Preferences Model - TikTrack

This module defines the UserPreferences model for storing all user preferences
in the database instead of JSON files.

Author: TikTrack Development Team
Version: 1.0
Date: September 2025
"""

from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Dict, Any
import json

from .base import BaseModel


class UserPreferences(BaseModel):
    """User preferences for the entire system"""
    __tablename__ = 'user_preferences'
    
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, unique=True)
    
    # Basic preferences
    primary_currency = Column(String(10), default='USD')
    timezone = Column(String(64), default='Asia/Jerusalem')
    
    # Trading preferences
    default_stop_loss = Column(Float, default=5.0)
    default_target_price = Column(Float, default=10.0)
    default_commission = Column(Float, default=1.0)
    
    # Filter preferences
    default_status_filter = Column(String(20), default='open')
    default_type_filter = Column(String(20), default='swing')
    default_account_filter = Column(String(20), default='all')
    default_date_range_filter = Column(String(20), default='this_week')
    default_search_filter = Column(String(100), default='')
    
    # Console preferences
    console_cleanup_interval = Column(Integer, default=60000)
    
    # External data preferences
    data_refresh_interval = Column(Integer, default=5)
    primary_data_provider = Column(String(50), default='yahoo')
    secondary_data_provider = Column(String(50), default='google')
    cache_ttl = Column(Integer, default=5)
    max_batch_size = Column(Integer, default=25)
    request_delay = Column(Integer, default=200)
    retry_attempts = Column(Integer, default=2)
    retry_delay = Column(Integer, default=5)
    auto_refresh = Column(Boolean, default=False)
    verbose_logging = Column(Boolean, default=False)
    
    # Numeric value colors (JSON stored as TEXT)
    numeric_value_colors_json = Column(Text, nullable=True)
    
    # Entity colors (JSON stored as TEXT)
    entity_colors_json = Column(Text, nullable=True)
    
    # Timestamps
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="user_preferences")
    
    def __repr__(self):
        return f"<UserPreferences(user_id={self.user_id}, primary_currency='{self.primary_currency}')>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert preferences to dictionary"""
        result = {
            'user_id': self.user_id,
            'primaryCurrency': self.primary_currency,
            'timezone': self.timezone,
            'defaultStopLoss': self.default_stop_loss,
            'defaultTargetPrice': self.default_target_price,
            'defaultCommission': self.default_commission,
            'defaultStatusFilter': self.default_status_filter,
            'defaultTypeFilter': self.default_type_filter,
            'defaultAccountFilter': self.default_account_filter,
            'defaultDateRangeFilter': self.default_date_range_filter,
            'defaultSearchFilter': self.default_search_filter,
            'consoleCleanupInterval': self.console_cleanup_interval,
            'dataRefreshInterval': self.data_refresh_interval,
            'primaryDataProvider': self.primary_data_provider,
            'secondaryDataProvider': self.secondary_data_provider,
            'cacheTTL': self.cache_ttl,
            'maxBatchSize': self.max_batch_size,
            'requestDelay': self.request_delay,
            'retryAttempts': self.retry_attempts,
            'retryDelay': self.retry_delay,
            'autoRefresh': self.auto_refresh,
            'verboseLogging': self.verbose_logging,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        # Add numeric value colors if available
        if self.numeric_value_colors_json:
            try:
                result['numericValueColors'] = json.loads(self.numeric_value_colors_json)
            except (json.JSONDecodeError, TypeError):
                result['numericValueColors'] = {}
        
        # Add entity colors if available
        if self.entity_colors_json:
            try:
                result['entityColors'] = json.loads(self.entity_colors_json)
            except (json.JSONDecodeError, TypeError):
                result['entityColors'] = {}
        
        return result
    
    def from_dict(self, data: Dict[str, Any]) -> None:
        """Update preferences from dictionary"""
        # Basic preferences
        if 'primaryCurrency' in data:
            self.primary_currency = data['primaryCurrency']
        if 'timezone' in data:
            self.timezone = data['timezone']
        
        # Trading preferences
        if 'defaultStopLoss' in data:
            self.default_stop_loss = data['defaultStopLoss']
        if 'defaultTargetPrice' in data:
            self.default_target_price = data['defaultTargetPrice']
        if 'defaultCommission' in data:
            self.default_commission = data['defaultCommission']
        
        # Filter preferences
        if 'defaultStatusFilter' in data:
            self.default_status_filter = data['defaultStatusFilter']
        if 'defaultTypeFilter' in data:
            self.default_type_filter = data['defaultTypeFilter']
        if 'defaultAccountFilter' in data:
            self.default_account_filter = data['defaultAccountFilter']
        if 'defaultDateRangeFilter' in data:
            self.default_date_range_filter = data['defaultDateRangeFilter']
        if 'defaultSearchFilter' in data:
            self.default_search_filter = data['defaultSearchFilter']
        
        # Console preferences
        if 'consoleCleanupInterval' in data:
            self.console_cleanup_interval = data['consoleCleanupInterval']
        
        # External data preferences
        if 'dataRefreshInterval' in data:
            self.data_refresh_interval = data['dataRefreshInterval']
        if 'primaryDataProvider' in data:
            self.primary_data_provider = data['primaryDataProvider']
        if 'secondaryDataProvider' in data:
            self.secondary_data_provider = data['secondaryDataProvider']
        if 'cacheTTL' in data:
            self.cache_ttl = data['cacheTTL']
        if 'maxBatchSize' in data:
            self.max_batch_size = data['maxBatchSize']
        if 'requestDelay' in data:
            self.request_delay = data['requestDelay']
        if 'retryAttempts' in data:
            self.retry_attempts = data['retryAttempts']
        if 'retryDelay' in data:
            self.retry_delay = data['retryDelay']
        if 'autoRefresh' in data:
            self.auto_refresh = data['autoRefresh']
        if 'verboseLogging' in data:
            self.verbose_logging = data['verboseLogging']
        
        # Colors
        if 'numericValueColors' in data:
            self.numeric_value_colors_json = json.dumps(data['numericValueColors'])
        if 'entityColors' in data:
            self.entity_colors_json = json.dumps(data['entityColors'])
        
        self.updated_at = datetime.utcnow()
    
    @classmethod
    def get_default_preferences(cls) -> Dict[str, Any]:
        """Get default preferences"""
        return {
            "primaryCurrency": "USD",
            "timezone": "Asia/Jerusalem",
            "defaultStopLoss": 5.0,
            "defaultTargetPrice": 10.0,
            "defaultCommission": 1.0,
            "defaultStatusFilter": "open",
            "defaultTypeFilter": "swing",
            "defaultAccountFilter": "all",
            "defaultDateRangeFilter": "this_week",
            "defaultSearchFilter": "",
            "consoleCleanupInterval": 60000,
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
            "numericValueColors": {
                "positive": {
                    "light": "#d4edda",
                    "medium": "#28a745",
                    "dark": "#155724",
                    "border": "#c3e6cb",
                },
                "negative": {
                    "light": "#f8d7da",
                    "medium": "#dc3545",
                    "dark": "#721c24",
                    "border": "#f5c6cb",
                },
                "zero": {
                    "light": "#e2e3e5",
                    "medium": "#6c757d",
                    "dark": "#383d41",
                    "border": "#d6d8db",
                },
            },
            "entityColors": {
                "trade": "#007bff",
                "trade_plan": "#0056b3",
                "execution": "#17a2b8",
                "account": "#28a745",
                "cash_flow": "#20c997",
                "ticker": "#dc3545",
                "alert": "#ff9c05",
                "note": "#6f42c1",
                "constraint": "#6c757d",
                "design": "#495057",
                "research": "#343a40",
                "preference": "#adb5bd",
            }
        }

