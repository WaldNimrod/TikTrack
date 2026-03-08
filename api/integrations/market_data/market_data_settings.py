"""
Market Data System Settings — MD-SETTINGS
SSOT: TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT
Resolution: DB > env (fallback to env if no DB override).

Required controls: max_active_tickers, intraday_interval_minutes,
                   provider_cooldown_minutes, max_symbols_per_request,
                   delay_between_symbols_seconds, intraday_enabled
"""

import os
from typing import Optional

# Env keys (fallback when DB has no value)
_ENV_KEYS = {
    "max_active_tickers": "MAX_ACTIVE_TICKERS",
    "intraday_interval_minutes": "INTRADAY_INTERVAL_MINUTES",
    "off_hours_interval_minutes": "OFF_HOURS_INTERVAL_MINUTES",
    "provider_cooldown_minutes": "PROVIDER_COOLDOWN_MINUTES",
    "max_symbols_per_request": "MAX_SYMBOLS_PER_REQUEST",
    "delay_between_symbols_seconds": "DELAY_BETWEEN_SYMBOLS_SECONDS",
    "intraday_enabled": "INTRADAY_ENABLED",
}

# SSOT: min, max, default per key
_SSOT = {
    "max_active_tickers": (1, 500, 50),
    "intraday_interval_minutes": (5, 240, 15),
    "off_hours_interval_minutes": (15, 240, 60),
    "provider_cooldown_minutes": (5, 120, 15),
    "max_symbols_per_request": (1, 50, 5),
    "delay_between_symbols_seconds": (0, 30, 0),
    "intraday_enabled": (None, None, True),
}


def _get_sync_db_url() -> Optional[str]:
    """Sync DB URL for scripts/service (psycopg2)."""
    from pathlib import Path
    _project = Path(__file__).resolve().parent.parent.parent.parent
    env_file = _project / "api" / ".env"
    url = None
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line.startswith("DATABASE_URL=") and not line.startswith("#"):
                    url = line.split("=", 1)[1].strip().strip("'\"").strip()
                    break
    if not url:
        url = os.getenv("DATABASE_URL")
    if url and "postgresql+asyncpg" in str(url):
        url = str(url).replace("postgresql+asyncpg://", "postgresql://")
    return url


def _get_from_db(key: str) -> Optional[str]:
    """
    Read value from market_data.system_settings. Returns None if table missing or key absent.
    Uses sync psycopg2 (works in scripts and API via FastAPI threadpool).
    """
    url = _get_sync_db_url()
    if not url:
        return None
    try:
        import psycopg2
        conn = psycopg2.connect(url)
        try:
            cur = conn.cursor()
            cur.execute(
                "SELECT value FROM market_data.system_settings WHERE key = %s",
                (key,),
            )
            row = cur.fetchone()
            return row[0] if row else None
        finally:
            conn.close()
    except Exception:
        return None


def _int_from_env(key: str, default: int) -> int:
    env_key = _ENV_KEYS.get(key)
    raw = os.environ.get(env_key) if env_key else None
    if raw is None:
        return default
    try:
        return int(raw)
    except (TypeError, ValueError):
        return default


def _bool_from_env(key: str, default: bool) -> bool:
    env_key = _ENV_KEYS.get(key)
    raw = os.environ.get(env_key) if env_key else None
    if raw is None:
        return default
    s = str(raw).strip().lower()
    return s in ("1", "true", "yes", "on")


def _resolve_int(key: str, min_val: int, max_val: int, default: int) -> int:
    db_val = _get_from_db(key)
    if db_val is not None:
        try:
            v = int(db_val)
            return max(min_val, min(max_val, v))
        except (TypeError, ValueError):
            pass
    v = _int_from_env(key, default)
    return max(min_val, min(max_val, v))


def _resolve_bool(key: str, default: bool) -> bool:
    db_val = _get_from_db(key)
    if db_val is not None:
        s = str(db_val).strip().lower()
        return s in ("1", "true", "yes", "on")
    return _bool_from_env(key, default)


def get_max_active_tickers() -> int:
    """Max active tickers for intraday refresh. Default 50. SSOT: 1-500."""
    _, _, d = _SSOT["max_active_tickers"]
    return _resolve_int("max_active_tickers", 1, 500, d)


def get_intraday_interval_minutes() -> int:
    """Intraday refresh interval (minutes). Default 15. SSOT: 5-240. Used when market open."""
    _, _, d = _SSOT["intraday_interval_minutes"]
    return _resolve_int("intraday_interval_minutes", 5, 240, d)


def get_off_hours_interval_minutes() -> int:
    """Off-hours refresh interval (minutes). Default 60. PHASE_3 Price Reliability."""
    _, _, d = _SSOT["off_hours_interval_minutes"]
    return _resolve_int("off_hours_interval_minutes", 15, 240, d)


def get_current_cadence_minutes() -> int:
    """
    Current cadence (minutes) for intraday job: market-open vs off-hours.
    PHASE_3: When US market is REGULAR use intraday_interval; else off_hours_interval.
    """
    try:
        from api.services.market_status_service import get_market_status_sync
        state = get_market_status_sync()
        if state and (state.upper() == "REGULAR" or "OPEN" in (state or "").upper()):
            return get_intraday_interval_minutes()
    except Exception:
        pass
    return get_off_hours_interval_minutes()


def get_provider_cooldown_minutes() -> int:
    """Cooldown after 429 (minutes). Default 15. SSOT: 5-120."""
    _, _, d = _SSOT["provider_cooldown_minutes"]
    return _resolve_int("provider_cooldown_minutes", 5, 120, d)


def get_max_symbols_per_request() -> int:
    """Max symbols per batch (if provider supports). Default 5. SSOT: 1-50."""
    _, _, d = _SSOT["max_symbols_per_request"]
    return _resolve_int("max_symbols_per_request", 1, 50, d)


def get_delay_between_symbols_seconds() -> int:
    """Delay (seconds) between symbol fetches in sync scripts. Default 0. SSOT: 0-30."""
    _, _, d = _SSOT["delay_between_symbols_seconds"]
    return _resolve_int("delay_between_symbols_seconds", 0, 30, d)


def get_intraday_enabled() -> bool:
    """Whether intraday job should run. Default True. SSOT: boolean."""
    _, _, d = _SSOT["intraday_enabled"]
    return _resolve_bool("intraday_enabled", d)


def get_all_settings() -> dict:
    """Return all settings as dict for API response. DB > env."""
    return {
        "max_active_tickers": get_max_active_tickers(),
        "intraday_interval_minutes": get_intraday_interval_minutes(),
        "off_hours_interval_minutes": get_off_hours_interval_minutes(),
        "provider_cooldown_minutes": get_provider_cooldown_minutes(),
        "max_symbols_per_request": get_max_symbols_per_request(),
        "delay_between_symbols_seconds": get_delay_between_symbols_seconds(),
        "intraday_enabled": get_intraday_enabled(),
    }


def get_ssot_constraints() -> dict:
    """Return min/max/default for validation."""
    return {
        "max_active_tickers": {"min": 1, "max": 500, "default": 50},
        "intraday_interval_minutes": {"min": 5, "max": 240, "default": 15},
        "off_hours_interval_minutes": {"min": 15, "max": 240, "default": 60},
        "provider_cooldown_minutes": {"min": 5, "max": 120, "default": 15},
        "max_symbols_per_request": {"min": 1, "max": 50, "default": 5},
        "delay_between_symbols_seconds": {"min": 0, "max": 30, "default": 0},
        "intraday_enabled": {"default": True},
    }
