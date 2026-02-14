"""
Market Status Service — WP_20_03 (ENTITY_TIME_MARKET)
----------------------------------------------------
Fetches US market state (open/closed, pre/post).
Primary: Yahoo v7/quote. Fallback: Alpha Vantage → local time heuristic.
"""

import asyncio
import logging
import os
from datetime import datetime
from typing import Optional, Tuple

from ..integrations.market_data.providers.yahoo_provider import _fetch_market_status_sync

logger = logging.getLogger(__name__)

_STATE_LABELS = {
    "REGULAR": "שוק פתוח",
    "PRE": "פרהמרקט",
    "PREPRE": "פרהמרקט",
    "POST": "אפטר מרקט",
    "POSTPOST": "אפטר מרקט",
    "CLOSED": "שוק סגור",
}


def _state_to_label(state: Optional[str]) -> str:
    """Map Yahoo/Alpha marketState to Hebrew label."""
    if not state:
        return "—"
    return _STATE_LABELS.get((state or "").upper(), "—")


def _fetch_alpha_market_status_sync() -> Optional[str]:
    """
    Fallback: Alpha Vantage MARKET_STATUS_CURRENT.
    Returns REGULAR | CLOSED | None. Requires ALPHA_VANTAGE_API_KEY.
    """
    api_key = os.environ.get("ALPHA_VANTAGE_API_KEY", "").strip()
    if not api_key:
        return None
    try:
        import httpx
        url = "https://www.alphavantage.co/query"
        params = {
            "function": "MARKET_STATUS_CURRENT",
            "apikey": api_key,
        }
        with httpx.Client(timeout=8.0) as client:
            r = client.get(url, params=params)
            r.raise_for_status()
        data = r.json()
        if "Information" in data or "Error Message" in data:
            return None
        markets = data.get("markets") or data.get("market_status") or []
        if isinstance(markets, dict):
            markets = markets.get("markets", []) if isinstance(markets.get("markets"), list) else []
        for m in markets:
            region = (m.get("region") or m.get("Region") or "").lower()
            if "united states" in region or "us" in region:
                status = m.get("current_status") or m.get("market_state") or m.get("status") or ""
                if "open" in str(status).lower():
                    return "REGULAR"
                if "closed" in str(status).lower():
                    return "CLOSED"
        return None
    except Exception as e:
        logger.debug("Alpha market status fallback failed: %s", e)
        return None


def _us_market_status_from_local_time() -> Tuple[str, str]:
    """
    Final fallback: compute from America/New_York time.
    Mon–Fri 9:30–16:00 = open; else closed.
    """
    try:
        from zoneinfo import ZoneInfo
    except ImportError:
        try:
            import pytz
            tz = pytz.timezone("America/New_York")
        except ImportError:
            return "CLOSED", "שוק סגור"
    else:
        tz = ZoneInfo("America/New_York")

    now = datetime.now(tz)
    wd = now.weekday()
    if wd >= 5:
        return "CLOSED", "שוק סגור"
    hour, minute = now.hour, now.minute
    mins = hour * 60 + minute
    open_mins = 9 * 60 + 30
    close_mins = 16 * 60
    if open_mins <= mins < close_mins:
        return "REGULAR", "שוק פתוח"
    return "CLOSED", "שוק סגור"


async def get_market_status() -> Tuple[Optional[str], str]:
    """
    Get US market status.
    Primary: Yahoo → Fallback: Alpha Vantage → Fallback: local time heuristic.
    Returns (market_state, display_label). Never returns "—" when fallback succeeds.
    """
    # 1. Yahoo (primary)
    try:
        state = await asyncio.wait_for(
            asyncio.to_thread(_fetch_market_status_sync),
            timeout=5.0,
        )
        if state:
            return state, _state_to_label(state)
    except (asyncio.TimeoutError, Exception) as e:
        logger.debug("Yahoo market status failed, trying fallback: %s", e)

    # 2. Alpha Vantage (fallback)
    try:
        state = await asyncio.wait_for(
            asyncio.to_thread(_fetch_alpha_market_status_sync),
            timeout=6.0,
        )
        if state:
            return state, _state_to_label(state)
    except (asyncio.TimeoutError, Exception) as e:
        logger.debug("Alpha market status fallback failed: %s", e)

    # 3. Local time heuristic (final fallback)
    state, label = _us_market_status_from_local_time()
    logger.debug("Market status: using local time heuristic -> %s", label)
    return state, label


def get_market_status_sync() -> Optional[str]:
    """
    Sync market status — for scripts (e.g. history backfill).
    Returns REGULAR | PRE | POST | CLOSED | None. Skips Yahoo when closed.
    """
    try:
        state = _fetch_market_status_sync()
        if state:
            return state
    except Exception:
        pass
    try:
        state = _fetch_alpha_market_status_sync()
        if state:
            return state
    except Exception:
        pass
    state, _ = _us_market_status_from_local_time()
    return state
