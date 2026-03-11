"""
Provider Cooldown — TEAM_90_RATELIMIT_SCALING_LOCK / SOP-015
When provider returns 429 → cooldown; no further calls during window.
SSOT: MARKET_DATA_PIPE_SPEC §8.1 rule 3
FIX-3: Alpha quota exhaustion → set_cooldown_hours with DB persistence.
FIX-4: Alpha daily quota tracker (25/day) — proactive guard before calling Alpha.
"""

import logging
import time
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

_cooldowns: Dict[str, float] = {}  # provider_name -> cooldown_until (epoch)

# Alpha Vantage daily quota tracking (FIX-4)
# Free plan: 25 requests/day hard limit. Track proactively to avoid burning quota.
_alpha_daily_calls: Dict[str, int] = {}  # UTC date_str -> call count
ALPHA_DAILY_LIMIT = 25  # Hard limit per Alpha Vantage free plan


def _today_utc_str() -> str:
    """UTC date string for today — quota resets at midnight UTC."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def increment_alpha_calls(n: int = 1) -> int:
    """
    Increment Alpha Vantage daily call counter.
    Returns new total for today (UTC).
    Call this immediately before each Alpha API request.
    """
    key = _today_utc_str()
    _alpha_daily_calls[key] = _alpha_daily_calls.get(key, 0) + n
    # Prune old keys to avoid unbounded growth
    for k in list(_alpha_daily_calls.keys()):
        if k != key:
            del _alpha_daily_calls[k]
    return _alpha_daily_calls[key]


def get_alpha_calls_today() -> int:
    """Alpha calls made today (UTC day)."""
    return _alpha_daily_calls.get(_today_utc_str(), 0)


def get_alpha_remaining_today(daily_limit: int = ALPHA_DAILY_LIMIT) -> int:
    """
    Remaining Alpha calls for today (UTC day).
    Returns 0 if exhausted. Use before deciding to call Alpha.
    """
    return max(0, daily_limit - get_alpha_calls_today())


def get_cooldown_status() -> List[Tuple[str, float, int]]:
    """SOP-015: Report current cooldowns for Team 90 audit. Returns [(provider, until_epoch, remaining_sec)]."""
    now = time.time()
    out = []
    for name, until in list(_cooldowns.items()):
        if now < until:
            out.append((name, until, int(until - now)))
        else:
            del _cooldowns[name]
    return out


def set_cooldown(provider_name: str, minutes: int) -> None:
    """Set provider in cooldown for `minutes`."""
    _cooldowns[provider_name] = time.time() + (minutes * 60)


def set_cooldown_hours(provider_name: str, hours: int) -> None:
    """Set provider cooldown for hours (e.g. Alpha daily quota exhaustion). FIX-3."""
    _cooldowns[provider_name] = time.time() + (hours * 3600)
    if provider_name == "ALPHA_VANTAGE":
        _persist_alpha_cooldown(hours)


def _persist_alpha_cooldown(hours: int) -> None:
    """Write alpha_cooldown_until to market_data.system_settings."""
    try:
        from api.integrations.market_data.market_data_settings import _get_sync_db_url

        until = datetime.now(timezone.utc) + timedelta(hours=hours)
        url = _get_sync_db_url()
        if not url:
            return
        import psycopg2

        conn = psycopg2.connect(url)
        try:
            cur = conn.cursor()
            cur.execute(
                """
                INSERT INTO market_data.system_settings (key, value, value_type, updated_at)
                VALUES ('alpha_cooldown_until', %s, 'string', NOW())
                ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
                """,
                (until.isoformat(),),
            )
            conn.commit()
        finally:
            conn.close()
    except Exception as e:
        logger.warning("Could not persist alpha cooldown to DB: %s", e)


def _read_alpha_cooldown_from_db() -> Optional[float]:
    """Read alpha_cooldown_until from market_data.system_settings. Returns epoch float or None."""
    try:
        from api.integrations.market_data.market_data_settings import _get_sync_db_url

        url = _get_sync_db_url()
        if not url:
            return None
        import psycopg2

        conn = psycopg2.connect(url)
        try:
            cur = conn.cursor()
            cur.execute("SELECT value FROM market_data.system_settings WHERE key = 'alpha_cooldown_until'")
            row = cur.fetchone()
            if not row:
                return None
            dt = datetime.fromisoformat(row[0].replace("Z", "+00:00"))
            return dt.timestamp()
        finally:
            conn.close()
    except Exception:
        return None


def is_in_cooldown(provider_name: str) -> bool:
    """True if provider is in cooldown window. For Alpha, also checks DB persistence."""
    until = _cooldowns.get(provider_name)
    if not until:
        if provider_name == "ALPHA_VANTAGE":
            db_until = _read_alpha_cooldown_from_db()
            if db_until and time.time() < db_until:
                _cooldowns[provider_name] = db_until
                return True
        return False
    if time.time() >= until:
        del _cooldowns[provider_name]
        return False
    return True


def clear_cooldown(provider_name: str) -> None:
    """Clear cooldown (for tests)."""
    _cooldowns.pop(provider_name, None)
