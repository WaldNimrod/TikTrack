"""
Smart History Engine — TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC (LOCKED)
---------------------------------------------------------------------------
System-level engine for ticker history backfill. NOT in connectors.
Gap-First: Gap analysis → fill only missing dates.
Retry Policy: 1 immediate retry + batch at night.
Provider Priority: Yahoo → Alpha.
"""

import logging
from datetime import date, timedelta
from enum import Enum
from typing import Optional, Set, Tuple

logger = logging.getLogger(__name__)

MIN_HISTORY_DAYS = 250  # Per spec: 250 trading days required
REQUIRED_MIN_AFTER_INSERT = 100  # Accept if we get at least this many new rows (partial success)


class BackfillDecision(str, Enum):
    """Decision from Smart History Engine."""
    NO_OP = "no_op"           # Data complete (250+ rows), no gaps
    GAP_FILL = "gap_fill"     # Has gaps — fill only missing dates
    FULL_RELOAD = "force_reload"  # Admin requested full reload (clear + fetch all)


def _last_n_trading_dates(n: int) -> Set[str]:
    """Last n trading days (weekdays) from today. Returns YYYY-MM-DD set."""
    result: Set[str] = set()
    d = date.today()
    while len(result) < n:
        if d.weekday() < 5:  # Mon=0 .. Fri=4
            result.add(d.isoformat())
        d -= timedelta(days=1)
    return result


def compute_gaps(existing_dates: Set[str], trading_days: int = MIN_HISTORY_DAYS) -> Set[str]:
    """
    Gap Definition (spec): missing 1 day within 250-day window = Gap.
    Returns set of missing dates (YYYY-MM-DD).
    """
    required = _last_n_trading_dates(trading_days)
    return required - existing_dates


def has_gaps(existing_dates: Set[str], trading_days: int = MIN_HISTORY_DAYS) -> bool:
    """True if any day is missing within the 250-day window."""
    return len(compute_gaps(existing_dates, trading_days)) > 0


def decide(
    existing_count: int,
    has_any_gaps: bool,
    mode: str,
    is_admin: bool,
) -> BackfillDecision:
    """
    Decide: GAP_FILL | FULL_RELOAD | NO_OP.
    mode: gap_fill | force_reload (from API query)
    is_admin: user has ADMIN or SUPERADMIN role
    """
    if mode == "force_reload" and is_admin:
        return BackfillDecision.FULL_RELOAD
    if existing_count >= MIN_HISTORY_DAYS and not has_any_gaps:
        return BackfillDecision.NO_OP
    if has_any_gaps or existing_count < MIN_HISTORY_DAYS:
        return BackfillDecision.GAP_FILL
    return BackfillDecision.NO_OP
