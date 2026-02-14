"""
Market Status Service — WP_20_03 (ENTITY_TIME_MARKET)
----------------------------------------------------
Fetches US market state (open/closed, pre/post) from Yahoo Finance.
Source: v7/finance/quote → marketState for SPY.
"""

import asyncio
import logging
from typing import Optional, Tuple

from ..integrations.market_data.providers.yahoo_provider import _fetch_market_status_sync

logger = logging.getLogger(__name__)


async def get_market_status() -> Tuple[Optional[str], str]:
    """
    Get US market status. Runs Yahoo fetch in thread to avoid blocking.
    Returns (market_state, display_label).
    market_state: REGULAR | PRE | POST | CLOSED | None
    display_label: Hebrew label for UI
    """
    try:
        state = await asyncio.wait_for(
            asyncio.to_thread(_fetch_market_status_sync),
            timeout=5.0
        )
        label = _state_to_label(state)
        return state, label
    except asyncio.TimeoutError:
        logger.warning("Market status fetch timeout")
        return None, "—"
    except Exception as e:
        logger.debug("Market status error: %s", e)
        return None, "—"


def _state_to_label(state: Optional[str]) -> str:
    """Map Yahoo marketState to Hebrew label."""
    if not state:
        return "—"
    labels = {
        "REGULAR": "שוק פתוח",
        "PRE": "פרהמרקט",
        "PREPRE": "פרהמרקט",
        "POST": "אפטר מרקט",
        "POSTPOST": "אפטר מרקט",
        "CLOSED": "שוק סגור",
    }
    return labels.get(state.upper() if isinstance(state, str) else "", "—")
