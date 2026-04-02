"""
D39 User Preferences — LLD S003-P003-WP001 (GET/PATCH /api/v1/me/preferences).
"""

from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

# Defaults for keys stored in user_data.users.settings JSONB (timezone/language are columns).
_DEFAULT_SETTINGS: Dict[str, Any] = {
    "primary_currency": "USD",
    "date_format": "YYYY-MM-DD",
    "default_trading_account": None,
    "default_order_type": "LIMIT",
    "default_time_in_force": "DAY",
    "default_commission_unit": "%",
    "pl_method": "FIFO",
    "default_price_type": "CLOSE",
    "email_notifications_enabled": False,
    "alert_trigger_email": True,
    "weekly_summary_email": False,
    "price_alert_threshold_pct": 5.0,
    "default_status_filter": "active",
    "rows_per_page": 25,
    "default_sort_column": "updated_at",
    "api_rate_limit": 1000,
    "high_contrast_mode": False,
    "font_size": "medium",
    "rtl_mode": False,
    "decimal_separator": ".",
}


class PreferencesResponse(BaseModel):
    """23 fields — LLD §2.1 GET response."""

    model_config = ConfigDict(from_attributes=True)

    language: str
    timezone: str
    primary_currency: str
    date_format: str
    default_trading_account: Optional[str] = None
    default_order_type: str
    default_time_in_force: str
    default_commission_unit: str
    pl_method: str
    default_price_type: str
    email_notifications_enabled: bool
    alert_trigger_email: bool
    weekly_summary_email: bool
    price_alert_threshold_pct: float
    default_status_filter: str
    rows_per_page: int
    default_sort_column: str
    api_rate_limit: int
    api_key_count: int
    high_contrast_mode: bool
    font_size: str
    rtl_mode: bool
    decimal_separator: str


class PreferencesPatch(BaseModel):
    """Partial update — any subset of the 23 fields (api_key_count read-only, ignored if sent)."""

    model_config = ConfigDict(extra="forbid")

    language: Optional[str] = None
    timezone: Optional[str] = None
    primary_currency: Optional[str] = None
    date_format: Optional[str] = None
    default_trading_account: Optional[str] = None
    default_order_type: Optional[str] = None
    default_time_in_force: Optional[str] = None
    default_commission_unit: Optional[str] = None
    pl_method: Optional[str] = None
    default_price_type: Optional[str] = None
    email_notifications_enabled: Optional[bool] = None
    alert_trigger_email: Optional[bool] = None
    weekly_summary_email: Optional[bool] = None
    price_alert_threshold_pct: Optional[float] = None
    default_status_filter: Optional[str] = None
    rows_per_page: Optional[int] = None
    default_sort_column: Optional[str] = None
    api_rate_limit: Optional[int] = Field(default=None, ge=1)
    high_contrast_mode: Optional[bool] = None
    font_size: Optional[str] = None
    rtl_mode: Optional[bool] = None
    decimal_separator: Optional[str] = None

    @field_validator("rows_per_page")
    @classmethod
    def rows_page_allowed(cls, v: Optional[int]) -> Optional[int]:
        if v is None:
            return v
        if v not in (10, 25, 50, 100):
            raise ValueError("rows_per_page must be one of 10, 25, 50, 100")
        return v


def merge_preferences_from_user(
    *,
    language: str,
    timezone: str,
    settings_blob: Optional[dict],
    api_key_count: int,
) -> PreferencesResponse:
    base = dict(_DEFAULT_SETTINGS)
    if settings_blob:
        base.update(settings_blob)
    return PreferencesResponse(
        language=language,
        timezone=timezone,
        api_key_count=api_key_count,
        primary_currency=base["primary_currency"],
        date_format=base["date_format"],
        default_trading_account=base.get("default_trading_account"),
        default_order_type=base["default_order_type"],
        default_time_in_force=base["default_time_in_force"],
        default_commission_unit=base["default_commission_unit"],
        pl_method=base["pl_method"],
        default_price_type=base["default_price_type"],
        email_notifications_enabled=bool(base["email_notifications_enabled"]),
        alert_trigger_email=bool(base["alert_trigger_email"]),
        weekly_summary_email=bool(base["weekly_summary_email"]),
        price_alert_threshold_pct=float(base["price_alert_threshold_pct"]),
        default_status_filter=base["default_status_filter"],
        rows_per_page=int(base["rows_per_page"]),
        default_sort_column=base["default_sort_column"],
        api_rate_limit=int(base["api_rate_limit"]),
        high_contrast_mode=bool(base["high_contrast_mode"]),
        font_size=base["font_size"],
        rtl_mode=bool(base["rtl_mode"]),
        decimal_separator=base["decimal_separator"],
    )


def settings_keys_for_patch() -> frozenset:
    """Keys that merge into users.settings JSONB (not timezone/language)."""
    return frozenset(_DEFAULT_SETTINGS.keys())
