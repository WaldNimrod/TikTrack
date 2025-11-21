"""
External Data Refresh Policy Provider
------------------------------------
Single source of truth for refresh TTL per ticker status, aligned to
NY market hours. Reads system-level settings from SystemSettingsService
with safe fallbacks to plan defaults.
"""

from datetime import datetime, timedelta
from typing import Optional
import pytz


NY_TZ = pytz.timezone('America/New_York')


def is_market_hours(now_utc: Optional[datetime] = None) -> bool:
    """
    Determine if now is within NYSE regular trading hours.
    """
    if now_utc is None:
        now_utc = datetime.utcnow()
    ny_time = now_utc.replace(tzinfo=pytz.utc).astimezone(NY_TZ)
    # Weekend
    if ny_time.weekday() >= 5:
        return False
    start = ny_time.replace(hour=9, minute=30, second=0, microsecond=0)
    end = ny_time.replace(hour=16, minute=0, second=0, microsecond=0)
    return start <= ny_time <= end


def get_refresh_policy_for_status(db_session, status: str, market_hours: Optional[bool] = None) -> int:
    """
    Return TTL in seconds for the given logical status.
    Status values: 'active', 'open', 'closed', 'cancelled'.
    Reads from system settings keys (external_data_settings group):
      ttlActiveSeconds, ttlOpenSeconds, ttlClosedSeconds, ttlCancelledSeconds
    Falls back to plan defaults if not configured.
    """
    status_key = (status or '').strip().lower()
    if market_hours is None:
        market_hours = is_market_hours()

    # Defaults per plan
    defaults = {
        'active': 5 * 60,        # 5 minutes
        'open': 15 * 60,         # 15 minutes
        'closed': 60 * 60,       # 60 minutes
        'cancelled': 24 * 60 * 60,  # 24 hours
    }

    try:
        from services.system_settings_service import SystemSettingsService
        settings = SystemSettingsService(db_session)
        # Base keys
        ttl_active = settings.get_setting('ttlActiveSeconds', defaults['active'])
        ttl_open = settings.get_setting('ttlOpenSeconds', defaults['open'])
        ttl_closed = settings.get_setting('ttlClosedSeconds', defaults['closed'])
        ttl_cancelled = settings.get_setting('ttlCancelledSeconds', defaults['cancelled'])

        # Optional off-hours overrides
        ttl_active_off = settings.get_setting('ttlActiveOffHoursSeconds', None)
        ttl_open_off = settings.get_setting('ttlOpenOffHoursSeconds', None)

        if status_key == 'active':
            return int(ttl_active_off if (ttl_active_off and not market_hours) else ttl_active)
        if status_key == 'open':
            return int(ttl_open_off if (ttl_open_off and not market_hours) else ttl_open)
        if status_key == 'closed':
            return int(ttl_closed)
        if status_key == 'cancelled':
            return int(ttl_cancelled)
        # Unknown -> conservative default
        return int(defaults['open'])
    except Exception:
        return int(defaults.get(status_key, defaults['open']))


