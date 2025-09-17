"""
User Preferences Model - TikTrack New Architecture
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
    
    # קשרים
    user = relationship("User", foreign_keys=[user_id], back_populates="preference_profiles")
    created_by_user = relationship("User", foreign_keys=[created_by])
    preferences = relationship("UserPreferences", back_populates="profile", cascade="all, delete-orphan")
    
    def to_dict(self) -> Dict[str, Any]:
        """המר פרופיל למילון"""
        return {
            'id': self.id,
            'name': self.profile_name,
            'isDefault': self.is_default,
            'isActive': self.is_active,
            'description': self.description,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'lastUsedAt': self.last_used_at.isoformat() if self.last_used_at else None,
            'usageCount': self.usage_count
        }
    
    def __repr__(self):
        return f"<PreferenceProfile(user_id={self.user_id}, name='{self.profile_name}')>"


class UserPreferences(BaseModel):
    """מודל הגדרות משתמש מתקדם"""
    __tablename__ = 'user_preferences'
    
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
    
    # צבעים בסיסיים
    primary_color = Column(String(7), default='#007bff')
    secondary_color = Column(String(7), default='#6c757d')
    success_color = Column(String(7), default='#28a745')
    warning_color = Column(String(7), default='#ffc107')
    danger_color = Column(String(7), default='#dc3545')
    info_color = Column(String(7), default='#007bff')
    
    # צבעי ישויות
    entity_trade_color = Column(String(7), default='#007bff')
    entity_trade_color_light = Column(String(7), default='#e3f2fd')
    entity_trade_color_dark = Column(String(7), default='#0056b3')
    entity_account_color = Column(String(7), default='#28a745')
    entity_account_color_light = Column(String(7), default='#d4edda')
    entity_account_color_dark = Column(String(7), default='#155724')
    entity_ticker_color = Column(String(7), default='#dc3545')
    entity_ticker_color_light = Column(String(7), default='#f8d7da')
    entity_ticker_color_dark = Column(String(7), default='#721c24')
    entity_alert_color = Column(String(7), default='#ff9c05')
    entity_alert_color_light = Column(String(7), default='#fff3cd')
    entity_alert_color_dark = Column(String(7), default='#856404')
    entity_cash_flow_color = Column(String(7), default='#20c997')
    entity_cash_flow_color_light = Column(String(7), default='#d1ecf1')
    entity_cash_flow_color_dark = Column(String(7), default='#0c5460')
    entity_note_color = Column(String(7), default='#6f42c1')
    entity_note_color_light = Column(String(7), default='#e2e3f1')
    entity_note_color_dark = Column(String(7), default='#383d41')
    entity_trade_plan_color = Column(String(7), default='#17a2b8')
    entity_trade_plan_color_light = Column(String(7), default='#d1ecf1')
    entity_trade_plan_color_dark = Column(String(7), default='#0c5460')
    entity_execution_color = Column(String(7), default='#fd7e14')
    entity_execution_color_light = Column(String(7), default='#ffeaa7')
    entity_execution_color_dark = Column(String(7), default='#e17055')
    
    # צבעי סטטוסים
    status_open_color = Column(String(7), default='#28a745')
    status_open_color_light = Column(String(7), default='#d4edda')
    status_open_color_dark = Column(String(7), default='#155724')
    status_closed_color = Column(String(7), default='#6c757d')
    status_closed_color_light = Column(String(7), default='#f8f9fa')
    status_closed_color_dark = Column(String(7), default='#495057')
    status_cancelled_color = Column(String(7), default='#dc3545')
    status_cancelled_color_light = Column(String(7), default='#f8d7da')
    status_cancelled_color_dark = Column(String(7), default='#721c24')
    
    # צבעי סוגי השקעה
    type_swing_color = Column(String(7), default='#007bff')
    type_swing_color_light = Column(String(7), default='#e3f2fd')
    type_swing_color_dark = Column(String(7), default='#0056b3')
    type_investment_color = Column(String(7), default='#28a745')
    type_investment_color_light = Column(String(7), default='#d4edda')
    type_investment_color_dark = Column(String(7), default='#155724')
    type_passive_color = Column(String(7), default='#6f42c1')
    type_passive_color_light = Column(String(7), default='#e2e3f1')
    type_passive_color_dark = Column(String(7), default='#383d41')
    
    # צבעי ערכים
    value_positive_color = Column(String(7), default='#28a745')
    value_positive_color_light = Column(String(7), default='#d4edda')
    value_positive_color_dark = Column(String(7), default='#155724')
    value_negative_color = Column(String(7), default='#dc3545')
    value_negative_color_light = Column(String(7), default='#f8d7da')
    value_negative_color_dark = Column(String(7), default='#721c24')
    value_neutral_color = Column(String(7), default='#6c757d')
    value_neutral_color_light = Column(String(7), default='#f8f9fa')
    value_neutral_color_dark = Column(String(7), default='#495057')
    
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
    
    # קשרים
    user = relationship("User", back_populates="user_preferences")
    profile = relationship("PreferenceProfile", back_populates="preferences")
    
    def __repr__(self):
        return f"<UserPreferences(user_id={self.user_id}, profile_id={self.profile_id})>"
    
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
        
        # צבעים
        result['colors'] = {
            'primaryColor': self.primary_color,
            'secondaryColor': self.secondary_color,
            'successColor': self.success_color,
            'warningColor': self.warning_color,
            'dangerColor': self.danger_color,
            'infoColor': self.info_color,
            'entityTradeColor': self.entity_trade_color,
            'entityTradeColorLight': self.entity_trade_color_light,
            'entityTradeColorDark': self.entity_trade_color_dark,
            'entityAccountColor': self.entity_account_color,
            'entityAccountColorLight': self.entity_account_color_light,
            'entityAccountColorDark': self.entity_account_color_dark,
            'entityTickerColor': self.entity_ticker_color,
            'entityTickerColorLight': self.entity_ticker_color_light,
            'entityTickerColorDark': self.entity_ticker_color_dark,
            'entityAlertColor': self.entity_alert_color,
            'entityAlertColorLight': self.entity_alert_color_light,
            'entityAlertColorDark': self.entity_alert_color_dark,
            'entityCashFlowColor': self.entity_cash_flow_color,
            'entityCashFlowColorLight': self.entity_cash_flow_color_light,
            'entityCashFlowColorDark': self.entity_cash_flow_color_dark,
            'entityNoteColor': self.entity_note_color,
            'entityNoteColorLight': self.entity_note_color_light,
            'entityNoteColorDark': self.entity_note_color_dark,
            'entityTradePlanColor': self.entity_trade_plan_color,
            'entityTradePlanColorLight': self.entity_trade_plan_color_light,
            'entityTradePlanColorDark': self.entity_trade_plan_color_dark,
            'entityExecutionColor': self.entity_execution_color,
            'entityExecutionColorLight': self.entity_execution_color_light,
            'entityExecutionColorDark': self.entity_execution_color_dark,
            'statusOpenColor': self.status_open_color,
            'statusOpenColorLight': self.status_open_color_light,
            'statusOpenColorDark': self.status_open_color_dark,
            'statusClosedColor': self.status_closed_color,
            'statusClosedColorLight': self.status_closed_color_light,
            'statusClosedColorDark': self.status_closed_color_dark,
            'statusCancelledColor': self.status_cancelled_color,
            'statusCancelledColorLight': self.status_cancelled_color_light,
            'statusCancelledColorDark': self.status_cancelled_color_dark,
            'typeSwingColor': self.type_swing_color,
            'typeSwingColorLight': self.type_swing_color_light,
            'typeSwingColorDark': self.type_swing_color_dark,
            'typeInvestmentColor': self.type_investment_color,
            'typeInvestmentColorLight': self.type_investment_color_light,
            'typeInvestmentColorDark': self.type_investment_color_dark,
            'typePassiveColor': self.type_passive_color,
            'typePassiveColorLight': self.type_passive_color_light,
            'typePassiveColorDark': self.type_passive_color_dark,
            'valuePositiveColor': self.value_positive_color,
            'valuePositiveColorLight': self.value_positive_color_light,
            'valuePositiveColorDark': self.value_positive_color_dark,
            'valueNegativeColor': self.value_negative_color,
            'valueNegativeColorLight': self.value_negative_color_light,
            'valueNegativeColorDark': self.value_negative_color_dark,
            'valueNeutralColor': self.value_neutral_color,
            'valueNeutralColorLight': self.value_neutral_color_light,
            'valueNeutralColorDark': self.value_neutral_color_dark
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
        
        # תמיכה בנתונים שטוחים (flat) ומקוננים (nested)
        
        # הגדרות כלליות - תמיכה בשני פורמטים
        if 'general' in data:
            # פורמט מקונן
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
        else:
            # פורמט שטוח - תמיכה ישירה
            if 'primaryCurrency' in data:
                self.primary_currency = data['primaryCurrency']
            if 'secondaryCurrency' in data:
                self.secondary_currency = data['secondaryCurrency']
            if 'timezone' in data:
                self.timezone = data['timezone']
            if 'language' in data:
                self.language = data['language']
            if 'defaultStopLoss' in data:
                self.default_stop_loss = data['defaultStopLoss']
            if 'defaultTargetPrice' in data:
                self.default_target_price = data['defaultTargetPrice']
            if 'defaultCommission' in data:
                self.default_commission = data['defaultCommission']
        
        # פילטרים - תמיכה בשני פורמטים
        if 'defaultFilters' in data:
            # פורמט מקונן
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
        else:
            # פורמט שטוח
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
        
        # צבעים - תמיכה בשני פורמטים
        if 'colors' in data:
            # פורמט מקונן
            colors = data['colors']
            if 'primaryColor' in colors:
                self.primary_color = colors['primaryColor']
            if 'secondaryColor' in colors:
                self.secondary_color = colors['secondaryColor']
            if 'successColor' in colors:
                self.success_color = colors['successColor']
            if 'warningColor' in colors:
                self.warning_color = colors['warningColor']
            if 'dangerColor' in colors:
                self.danger_color = colors['dangerColor']
            if 'infoColor' in colors:
                self.info_color = colors['infoColor']
        else:
            # פורמט שטוח - צבעים ישירים
            if 'primaryColor' in data:
                self.primary_color = data['primaryColor']
            if 'secondaryColor' in data:
                self.secondary_color = data['secondaryColor']
            if 'successColor' in data:
                self.success_color = data['successColor']
            if 'warningColor' in data:
                self.warning_color = data['warningColor']
            if 'dangerColor' in data:
                self.danger_color = data['dangerColor']
            if 'infoColor' in data:
                self.info_color = data['infoColor']
            
            # צבעי ישויות
            if 'entityTradeColor' in data:
                self.entity_trade_color = data['entityTradeColor']
            if 'entityTradeColorLight' in data:
                self.entity_trade_color_light = data['entityTradeColorLight']
            if 'entityTradeColorDark' in data:
                self.entity_trade_color_dark = data['entityTradeColorDark']
            if 'entityAccountColor' in data:
                self.entity_account_color = data['entityAccountColor']
            if 'entityAccountColorLight' in data:
                self.entity_account_color_light = data['entityAccountColorLight']
            if 'entityAccountColorDark' in data:
                self.entity_account_color_dark = data['entityAccountColorDark']
            if 'entityTickerColor' in data:
                self.entity_ticker_color = data['entityTickerColor']
            if 'entityTickerColorLight' in data:
                self.entity_ticker_color_light = data['entityTickerColorLight']
            if 'entityTickerColorDark' in data:
                self.entity_ticker_color_dark = data['entityTickerColorDark']
            if 'entityAlertColor' in data:
                self.entity_alert_color = data['entityAlertColor']
            if 'entityAlertColorLight' in data:
                self.entity_alert_color_light = data['entityAlertColorLight']
            if 'entityAlertColorDark' in data:
                self.entity_alert_color_dark = data['entityAlertColorDark']
            if 'entityCashFlowColor' in data:
                self.entity_cash_flow_color = data['entityCashFlowColor']
            if 'entityCashFlowColorLight' in data:
                self.entity_cash_flow_color_light = data['entityCashFlowColorLight']
            if 'entityCashFlowColorDark' in data:
                self.entity_cash_flow_color_dark = data['entityCashFlowColorDark']
            if 'entityNoteColor' in data:
                self.entity_note_color = data['entityNoteColor']
            if 'entityNoteColorLight' in data:
                self.entity_note_color_light = data['entityNoteColorLight']
            if 'entityNoteColorDark' in data:
                self.entity_note_color_dark = data['entityNoteColorDark']
            if 'entityTradePlanColor' in data:
                self.entity_trade_plan_color = data['entityTradePlanColor']
            if 'entityTradePlanColorLight' in data:
                self.entity_trade_plan_color_light = data['entityTradePlanColorLight']
            if 'entityTradePlanColorDark' in data:
                self.entity_trade_plan_color_dark = data['entityTradePlanColorDark']
            if 'entityExecutionColor' in data:
                self.entity_execution_color = data['entityExecutionColor']
            if 'entityExecutionColorLight' in data:
                self.entity_execution_color_light = data['entityExecutionColorLight']
            if 'entityExecutionColorDark' in data:
                self.entity_execution_color_dark = data['entityExecutionColorDark']
            
            # צבעי סטטוסים
            if 'statusOpenColor' in data:
                self.status_open_color = data['statusOpenColor']
            if 'statusOpenColorLight' in data:
                self.status_open_color_light = data['statusOpenColorLight']
            if 'statusOpenColorDark' in data:
                self.status_open_color_dark = data['statusOpenColorDark']
            if 'statusClosedColor' in data:
                self.status_closed_color = data['statusClosedColor']
            if 'statusClosedColorLight' in data:
                self.status_closed_color_light = data['statusClosedColorLight']
            if 'statusClosedColorDark' in data:
                self.status_closed_color_dark = data['statusClosedColorDark']
            if 'statusCancelledColor' in data:
                self.status_cancelled_color = data['statusCancelledColor']
            if 'statusCancelledColorLight' in data:
                self.status_cancelled_color_light = data['statusCancelledColorLight']
            if 'statusCancelledColorDark' in data:
                self.status_cancelled_color_dark = data['statusCancelledColorDark']
            
            # צבעי סוגי השקעה
            if 'typeSwingColor' in data:
                self.type_swing_color = data['typeSwingColor']
            if 'typeSwingColorLight' in data:
                self.type_swing_color_light = data['typeSwingColorLight']
            if 'typeSwingColorDark' in data:
                self.type_swing_color_dark = data['typeSwingColorDark']
            if 'typeInvestmentColor' in data:
                self.type_investment_color = data['typeInvestmentColor']
            if 'typeInvestmentColorLight' in data:
                self.type_investment_color_light = data['typeInvestmentColorLight']
            if 'typeInvestmentColorDark' in data:
                self.type_investment_color_dark = data['typeInvestmentColorDark']
            if 'typePassiveColor' in data:
                self.type_passive_color = data['typePassiveColor']
            if 'typePassiveColorLight' in data:
                self.type_passive_color_light = data['typePassiveColorLight']
            if 'typePassiveColorDark' in data:
                self.type_passive_color_dark = data['typePassiveColorDark']
            
            # צבעי ערכים
            if 'valuePositiveColor' in data:
                self.value_positive_color = data['valuePositiveColor']
            if 'valuePositiveColorLight' in data:
                self.value_positive_color_light = data['valuePositiveColorLight']
            if 'valuePositiveColorDark' in data:
                self.value_positive_color_dark = data['valuePositiveColorDark']
            if 'valueNegativeColor' in data:
                self.value_negative_color = data['valueNegativeColor']
            if 'valueNegativeColorLight' in data:
                self.value_negative_color_light = data['valueNegativeColorLight']
            if 'valueNegativeColorDark' in data:
                self.value_negative_color_dark = data['valueNegativeColorDark']
            if 'valueNeutralColor' in data:
                self.value_neutral_color = data['valueNeutralColor']
            if 'valueNeutralColorLight' in data:
                self.value_neutral_color_light = data['valueNeutralColorLight']
            if 'valueNeutralColorDark' in data:
                self.value_neutral_color_dark = data['valueNeutralColorDark']
        
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
    def import_settings(cls, data: Dict[str, Any]) -> 'UserPreferences':
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
        # User.user_preferences = relationship("UserPreferences", back_populates="user")
        
    except ImportError:
        pass  # User model לא זמין עדיין