"""
User Preferences V2 Model - TikTrack New Architecture
=====================================================

מודל מתקדם למערכת הגדרות משתמש עם תמיכה בפרופילים מרובים,
יבוא/יצוא הגדרות, ומבנה נתונים משופר.

Author: TikTrack Development Team
Version: 2.0
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


class PreferenceProfile(BaseModel):
    """פרופיל הגדרות - מאפשר מספר פרופילים לכל משתמש"""
    __tablename__ = 'preference_profiles'
    
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    profile_name = Column(String(100), nullable=False, default='ברירת מחדל')
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    description = Column(Text)
    
    # מטא-דטה
    created_by = Column(Integer, ForeignKey('users.id'))
    last_used_at = Column(DateTime(timezone=True))
    usage_count = Column(Integer, default=0)
    
    # קשרים - מושבתים עד יצירת הטבלאות
    # user = relationship("User", foreign_keys=[user_id], back_populates="preference_profiles")
    # preferences = relationship("UserPreferencesV2", back_populates="profile", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<PreferenceProfile(user_id={self.user_id}, name='{self.profile_name}')>"


class UserPreferences(BaseModel):
    """מודל הגדרות משתמש מתקדם V2"""
    __tablename__ = 'user_preferences_v2'
    
    # יחסים בסיסיים
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    profile_id = Column(Integer, ForeignKey('preference_profiles.id'), nullable=False)
    
    # ===== הגדרות כלליות =====
    
    # בסיסי
    primary_currency = Column(String(10), default='USD')
    secondary_currency = Column(String(10), default='ILS')
    timezone = Column(String(64), default='Asia/Jerusalem')
    language = Column(String(10), default='he')
    date_format = Column(String(20), default='DD/MM/YYYY')
    number_format = Column(String(20), default='1,234.56')
    
    # מסחר
    default_stop_loss = Column(Float, default=5.0)
    default_target_price = Column(Float, default=10.0)
    default_commission = Column(Float, default=1.0)
    default_trade_amount = Column(Float)
    risk_percentage = Column(Float, default=2.0)
    
    # שעות מסחר
    trading_hours_start = Column(String(10), default='09:30')
    trading_hours_end = Column(String(10), default='16:00')
    
    # ===== פילטרים ברירת מחדל =====
    
    default_status_filter = Column(String(20), default='open')
    default_type_filter = Column(String(20), default='swing')
    default_account_filter = Column(String(20), default='all')
    default_date_range_filter = Column(String(20), default='this_week')
    default_search_filter = Column(String(100), default='')
    
    # פילטרים מתקדמים
    default_profit_filter = Column(String(20), default='all')  # all, profit, loss
    default_min_amount = Column(Float)
    default_max_amount = Column(Float)
    
    # ===== הגדרות ממשק משתמש =====
    
    # תצוגה כללית
    theme = Column(String(20), default='light')  # light, dark, auto
    compact_mode = Column(Boolean, default=False)
    show_animations = Column(Boolean, default=True)
    sidebar_position = Column(String(10), default='right')  # left, right
    default_page = Column(String(50), default='dashboard')
    
    # טבלאות
    table_page_size = Column(Integer, default=25)
    table_show_icons = Column(Boolean, default=True)
    table_auto_refresh = Column(Boolean, default=False)
    table_refresh_interval = Column(Integer, default=30)  # seconds
    
    # גרפים וצ'ארטים
    chart_theme = Column(String(20), default='modern')
    chart_animation = Column(Boolean, default=True)
    show_chart_grid = Column(Boolean, default=True)
    default_chart_period = Column(String(20), default='1M')
    
    # ===== הגדרות נתונים חיצוניים =====
    
    # ספקי נתונים
    primary_data_provider = Column(String(50), default='yahoo')
    secondary_data_provider = Column(String(50), default='google')
    fallback_data_provider = Column(String(50), default='alpha_vantage')
    
    # רענון נתונים
    data_refresh_interval = Column(Integer, default=5)  # minutes
    cache_ttl = Column(Integer, default=5)  # minutes
    max_batch_size = Column(Integer, default=25)
    request_delay = Column(Integer, default=200)  # milliseconds
    
    # התמודדות עם כשלים
    retry_attempts = Column(Integer, default=3)
    retry_delay = Column(Integer, default=5)  # seconds
    timeout_duration = Column(Integer, default=30)  # seconds
    
    # הצגת נתונים
    show_percentage_changes = Column(Boolean, default=True)
    show_volume = Column(Boolean, default=True)
    show_market_cap = Column(Boolean, default=False)
    show_52_week_range = Column(Boolean, default=False)
    
    # ===== הגדרות התראות =====
    
    # התראות כלליות
    enable_notifications = Column(Boolean, default=True)
    notification_sound = Column(Boolean, default=True)
    notification_popup = Column(Boolean, default=True)
    notification_email = Column(Boolean, default=False)
    
    # התראות מסחר
    notify_on_trade_executed = Column(Boolean, default=True)
    notify_on_stop_loss = Column(Boolean, default=True)
    notify_on_target_reached = Column(Boolean, default=True)
    notify_on_margin_call = Column(Boolean, default=True)
    
    # התראות נתונים
    notify_on_data_failures = Column(Boolean, default=True)
    notify_on_stale_data = Column(Boolean, default=False)
    notify_on_price_alerts = Column(Boolean, default=True)
    
    # ===== הגדרות קונסול ולוגים =====
    
    console_cleanup_interval = Column(Integer, default=60)  # seconds
    console_auto_clear = Column(Boolean, default=True)
    console_max_entries = Column(Integer, default=1000)
    verbose_logging = Column(Boolean, default=False)
    log_level = Column(String(20), default='INFO')
    
    # ===== הגדרות מתקדמות =====
    
    # ביצועים
    enable_caching = Column(Boolean, default=True)
    prefetch_data = Column(Boolean, default=True)
    lazy_loading = Column(Boolean, default=True)
    
    # אבטחה
    session_timeout = Column(Integer, default=30)  # minutes
    auto_backup = Column(Boolean, default=True)
    backup_interval = Column(Integer, default=24)  # hours
    
    # ניתוח ודו"חות
    track_user_activity = Column(Boolean, default=True)
    generate_reports = Column(Boolean, default=False)
    
    # ===== JSON Fields למבנים מורכבים =====
    
    # מערכת צבעים מלאה
    color_scheme_json = Column(Text, nullable=True)
    
    # הגדרות שקיפות וחוות צבע
    opacity_settings_json = Column(Text, nullable=True)
    
    # הגדרות רענון מתקדמות 
    refresh_overrides_json = Column(Text, nullable=True)
    
    # הגדרות דאשבורד מותאמות אישית
    dashboard_layout_json = Column(Text, nullable=True)
    
    # הגדרות קיצורי מקשים
    keyboard_shortcuts_json = Column(Text, nullable=True)
    
    # הגדרות התראות מתקדמות
    advanced_alerts_json = Column(Text, nullable=True)
    
    # הגדרות יבוא/יצוא
    import_export_settings_json = Column(Text, nullable=True)
    
    # מטא-דטה
    version = Column(String(20), default='2.0')
    migrated_from_v1 = Column(Boolean, default=False)
    migration_date = Column(DateTime(timezone=True))
    last_validation = Column(DateTime(timezone=True))
    validation_errors_json = Column(Text)
    
    # זמני עדכון
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # קשרים - מושבתים עד יצירת הטבלאות
    # user = relationship("User", back_populates="user_preferences_v2")
    # profile = relationship("PreferenceProfile", back_populates="preferences")
    
    def __repr__(self):
        return f"<UserPreferencesV2(user_id={self.user_id}, profile_id={self.profile_id})>"
    
    # ===== מתודות עזר =====
    
    def to_dict(self) -> Dict[str, Any]:
        """המר את ההגדרות למילון"""
        result = {}
        
        # הגדרות בסיסיות
        result['general'] = {
            'primaryCurrency': self.primary_currency,
            'secondaryCurrency': self.secondary_currency,
            'timezone': self.timezone,
            'language': self.language,
            'dateFormat': self.date_format,
            'numberFormat': self.number_format,
            'defaultStopLoss': self.default_stop_loss,
            'defaultTargetPrice': self.default_target_price,
            'defaultCommission': self.default_commission,
            'defaultTradeAmount': self.default_trade_amount,
            'riskPercentage': self.risk_percentage,
            'tradingHours': {
                'start': self.trading_hours_start,
                'end': self.trading_hours_end
            }
        }
        
        # פילטרים ברירת מחדל
        result['defaultFilters'] = {
            'status': self.default_status_filter,
            'type': self.default_type_filter,
            'account': self.default_account_filter,
            'dateRange': self.default_date_range_filter,
            'search': self.default_search_filter,
            'profit': self.default_profit_filter,
            'minAmount': self.default_min_amount,
            'maxAmount': self.default_max_amount
        }
        
        # הגדרות ממשק משתמש
        result['ui'] = {
            'theme': self.theme,
            'compactMode': self.compact_mode,
            'showAnimations': self.show_animations,
            'sidebarPosition': self.sidebar_position,
            'defaultPage': self.default_page,
            'table': {
                'pageSize': self.table_page_size,
                'showIcons': self.table_show_icons,
                'autoRefresh': self.table_auto_refresh,
                'refreshInterval': self.table_refresh_interval
            },
            'charts': {
                'theme': self.chart_theme,
                'animation': self.chart_animation,
                'showGrid': self.show_chart_grid,
                'defaultPeriod': self.default_chart_period
            }
        }
        
        # נתונים חיצוניים
        result['externalData'] = {
            'providers': {
                'primary': self.primary_data_provider,
                'secondary': self.secondary_data_provider,
                'fallback': self.fallback_data_provider
            },
            'refresh': {
                'interval': self.data_refresh_interval,
                'cacheTTL': self.cache_ttl,
                'maxBatchSize': self.max_batch_size,
                'requestDelay': self.request_delay
            },
            'reliability': {
                'retryAttempts': self.retry_attempts,
                'retryDelay': self.retry_delay,
                'timeoutDuration': self.timeout_duration
            },
            'display': {
                'showPercentageChanges': self.show_percentage_changes,
                'showVolume': self.show_volume,
                'showMarketCap': self.show_market_cap,
                'show52WeekRange': self.show_52_week_range
            }
        }
        
        # התראות
        result['notifications'] = {
            'general': {
                'enabled': self.enable_notifications,
                'sound': self.notification_sound,
                'popup': self.notification_popup,
                'email': self.notification_email
            },
            'trading': {
                'tradeExecuted': self.notify_on_trade_executed,
                'stopLoss': self.notify_on_stop_loss,
                'targetReached': self.notify_on_target_reached,
                'marginCall': self.notify_on_margin_call
            },
            'data': {
                'dataFailures': self.notify_on_data_failures,
                'staleData': self.notify_on_stale_data,
                'priceAlerts': self.notify_on_price_alerts
            }
        }
        
        # קונסול
        result['console'] = {
            'cleanupInterval': self.console_cleanup_interval,
            'autoClear': self.console_auto_clear,
            'maxEntries': self.console_max_entries,
            'verboseLogging': self.verbose_logging,
            'logLevel': self.log_level
        }
        
        # הגדרות מתקדמות
        result['advanced'] = {
            'performance': {
                'enableCaching': self.enable_caching,
                'prefetchData': self.prefetch_data,
                'lazyLoading': self.lazy_loading
            },
            'security': {
                'sessionTimeout': self.session_timeout,
                'autoBackup': self.auto_backup,
                'backupInterval': self.backup_interval
            },
            'analytics': {
                'trackUserActivity': self.track_user_activity,
                'generateReports': self.generate_reports
            }
        }
        
        # JSON fields
        if self.color_scheme_json:
            try:
                result['colorScheme'] = json.loads(self.color_scheme_json)
            except (json.JSONDecodeError, TypeError):
                result['colorScheme'] = {}
        
        if self.opacity_settings_json:
            try:
                result['opacitySettings'] = json.loads(self.opacity_settings_json)
            except (json.JSONDecodeError, TypeError):
                result['opacitySettings'] = {}
        
        if self.refresh_overrides_json:
            try:
                result['refreshOverrides'] = json.loads(self.refresh_overrides_json)
            except (json.JSONDecodeError, TypeError):
                result['refreshOverrides'] = {}
        
        if self.dashboard_layout_json:
            try:
                result['dashboardLayout'] = json.loads(self.dashboard_layout_json)
            except (json.JSONDecodeError, TypeError):
                result['dashboardLayout'] = {}
        
        # מטא-דטה
        result['metadata'] = {
            'version': self.version,
            'migratedFromV1': self.migrated_from_v1,
            'migrationDate': self.migration_date.isoformat() if self.migration_date else None,
            'lastValidation': self.last_validation.isoformat() if self.last_validation else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }
        
        return result
    
    def from_dict(self, data: Dict[str, Any]) -> None:
        """עדכן את ההגדרות ממילון"""
        
        # הגדרות כלליות
        if 'general' in data:
            general = data['general']
            if 'primaryCurrency' in general:
                self.primary_currency = general['primaryCurrency']
            if 'secondaryCurrency' in general:
                self.secondary_currency = general['secondaryCurrency']
            if 'timezone' in general:
                self.timezone = general['timezone']
            if 'language' in general:
                self.language = general['language']
            if 'defaultStopLoss' in general:
                self.default_stop_loss = general['defaultStopLoss']
            if 'defaultTargetPrice' in general:
                self.default_target_price = general['defaultTargetPrice']
            if 'defaultCommission' in general:
                self.default_commission = general['defaultCommission']
            
            if 'tradingHours' in general:
                trading_hours = general['tradingHours']
                if 'start' in trading_hours:
                    self.trading_hours_start = trading_hours['start']
                if 'end' in trading_hours:
                    self.trading_hours_end = trading_hours['end']
        
        # פילטרים
        if 'defaultFilters' in data:
            filters = data['defaultFilters']
            if 'status' in filters:
                self.default_status_filter = filters['status']
            if 'type' in filters:
                self.default_type_filter = filters['type']
            if 'account' in filters:
                self.default_account_filter = filters['account']
            if 'dateRange' in filters:
                self.default_date_range_filter = filters['dateRange']
            if 'search' in filters:
                self.default_search_filter = filters['search']
        
        # ממשק משתמש
        if 'ui' in data:
            ui = data['ui']
            if 'theme' in ui:
                self.theme = ui['theme']
            if 'compactMode' in ui:
                self.compact_mode = ui['compactMode']
            if 'showAnimations' in ui:
                self.show_animations = ui['showAnimations']
            
            if 'table' in ui:
                table = ui['table']
                if 'pageSize' in table:
                    self.table_page_size = table['pageSize']
                if 'autoRefresh' in table:
                    self.table_auto_refresh = table['autoRefresh']
        
        # נתונים חיצוניים
        if 'externalData' in data:
            external = data['externalData']
            if 'providers' in external:
                providers = external['providers']
                if 'primary' in providers:
                    self.primary_data_provider = providers['primary']
                if 'secondary' in providers:
                    self.secondary_data_provider = providers['secondary']
            
            if 'refresh' in external:
                refresh = external['refresh']
                if 'interval' in refresh:
                    self.data_refresh_interval = refresh['interval']
                if 'cacheTTL' in refresh:
                    self.cache_ttl = refresh['cacheTTL']
        
        # JSON fields
        if 'colorScheme' in data:
            self.color_scheme_json = json.dumps(data['colorScheme'])
        if 'opacitySettings' in data:
            self.opacity_settings_json = json.dumps(data['opacitySettings'])
        if 'refreshOverrides' in data:
            self.refresh_overrides_json = json.dumps(data['refreshOverrides'])
        if 'dashboardLayout' in data:
            self.dashboard_layout_json = json.dumps(data['dashboardLayout'])
        
        self.updated_at = datetime.utcnow()
    
    def validate(self) -> Dict[str, List[str]]:
        """בדוק את תקינות ההגדרות"""
        errors = {}
        
        # בדיקת מטבע
        if self.primary_currency and len(self.primary_currency) != 3:
            errors.setdefault('currency', []).append('Primary currency must be 3 characters')
        
        # בדיקת אחוזים
        if self.default_stop_loss is not None and (self.default_stop_loss < 0 or self.default_stop_loss > 100):
            errors.setdefault('trading', []).append('Stop loss must be between 0 and 100')
        
        if self.default_target_price is not None and (self.default_target_price < 0 or self.default_target_price > 1000):
            errors.setdefault('trading', []).append('Target price must be between 0 and 1000')
        
        # בדיקת מרווחי זמן
        if self.data_refresh_interval is not None and (self.data_refresh_interval < 1 or self.data_refresh_interval > 1440):
            errors.setdefault('external_data', []).append('Refresh interval must be between 1 and 1440 minutes')
        
        return errors
    
    def export_settings(self, include_sensitive: bool = False) -> Dict[str, Any]:
        """יצא הגדרות לקובץ"""
        data = self.to_dict()
        
        # הסר מידע רגיש אם לא נדרש
        if not include_sensitive:
            if 'advanced' in data and 'security' in data['advanced']:
                data['advanced']['security'] = {}
        
        return {
            'version': '2.0',
            'exportDate': datetime.utcnow().isoformat(),
            'preferences': data
        }
    
    @classmethod
    def import_settings(cls, data: Dict[str, Any]) -> 'UserPreferencesV2':
        """יבא הגדרות מקובץ"""
        instance = cls()
        
        if 'preferences' in data:
            instance.from_dict(data['preferences'])
        
        # סמן שזה נוצר מייבוא
        instance.version = data.get('version', '2.0')
        
        return instance


class PreferenceHistory(BaseModel):
    """היסטוריית שינויים בהגדרות"""
    __tablename__ = 'preference_history'
    
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    profile_id = Column(Integer, ForeignKey('preference_profiles.id'), nullable=False)
    
    # פרטי השינוי
    change_type = Column(String(50), nullable=False)  # create, update, delete, import, export
    field_name = Column(String(100))
    old_value = Column(Text)
    new_value = Column(Text)
    
    # קונטקסט
    changed_by = Column(Integer, ForeignKey('users.id'))
    change_reason = Column(String(200))
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    
    # קשרים - מושבתים עד יצירת הטבלאות
    # user = relationship("User", foreign_keys=[user_id])
    # profile = relationship("PreferenceProfile", foreign_keys=[profile_id])
    # changed_by_user = relationship("User", foreign_keys=[changed_by])
    
    def __repr__(self):
        return f"<PreferenceHistory(user_id={self.user_id}, type='{self.change_type}')>"


# הוספת קשרים למודל User
def add_relationships():
    """הוסף קשרים למודל User הקיים"""
    try:
        from .user import User
        
        # הוסף קשרים חדשים - רק אם הטבלאות קיימות
        # User.preference_profiles = relationship("PreferenceProfile", foreign_keys="PreferenceProfile.user_id", back_populates="user")
        # User.user_preferences_v2 = relationship("UserPreferencesV2", back_populates="user")
        
    except ImportError:
        pass  # User model לא זמין עדיין