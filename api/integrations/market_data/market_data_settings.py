"""
Market Data System Settings — TEAM_90_RATELIMIT_SCALING_LOCK
SSOT: MARKET_DATA_PIPE_SPEC §8.3, MARKET_DATA_COVERAGE_MATRIX Rule #8
Required controls: max_active_tickers, intraday_interval_minutes,
                   provider_cooldown_minutes, max_symbols_per_request
"""

import os
from typing import Optional


def _int(key: str, default: int) -> int:
    try:
        v = os.environ.get(key)
        return int(v) if v else default
    except (TypeError, ValueError):
        return default


def get_max_active_tickers() -> int:
    """Max active tickers for intraday refresh. Default 50."""
    return _int("MAX_ACTIVE_TICKERS", 50)


def get_intraday_interval_minutes() -> int:
    """Intraday refresh interval (minutes). Default 15."""
    return _int("INTRADAY_INTERVAL_MINUTES", 15)


def get_provider_cooldown_minutes() -> int:
    """Cooldown after 429 (minutes). Default 15."""
    return _int("PROVIDER_COOLDOWN_MINUTES", 15)


def get_max_symbols_per_request() -> int:
    """Max symbols per batch (if provider supports). Default 5."""
    return _int("MAX_SYMBOLS_PER_REQUEST", 5)
