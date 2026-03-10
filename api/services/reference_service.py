"""
Reference Data Service
Task: GET /api/v1/reference/brokers (ADR-013, ADR-015)
Status: COMPLETED

Returns broker list for D16 (account creation) and D18 (fee prefill).
ADR-015: display_name, is_supported, default_fees. Primary: trading_accounts.broker.
"""

import uuid
import json
import logging
from pathlib import Path
from typing import List, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, cast, String
from sqlalchemy.sql import and_

from ..models.trading_accounts import TradingAccount
from ..models.market_reference import Exchange
from ..schemas.reference import BrokerReferenceItem, DefaultFeeItem
from ..utils.identity import uuid_to_ulid

logger = logging.getLogger(__name__)

_DEFAULTS_PATH = Path(__file__).resolve().parent.parent / "data" / "defaults_brokers.json"


def is_broker_supported(broker: Optional[str]) -> bool:
    """
    ADR-018: Check if broker supports API/import.
    Returns False for 'other', 'אחר', or custom brokers not in defaults with is_supported=True.
    """
    if not broker or not str(broker).strip():
        return False
    b = str(broker).strip().lower()
    if b in ("other", "אחר"):
        return False
    defaults = _load_defaults()
    for item in defaults:
        if item.value.lower() == b:
            return item.is_supported
    # Custom broker (not in defaults) = not supported
    return False


def _load_defaults() -> List[BrokerReferenceItem]:
    """Load default broker list from JSON (ADR-015 format)."""
    try:
        with open(_DEFAULTS_PATH, "r", encoding="utf-8") as f:
            raw = json.load(f)
        items: List[BrokerReferenceItem] = []
        for item in raw:
            df = [DefaultFeeItem(**x) for x in item.get("default_fees", [])]
            dname = item.get("display_name", item["value"])
            items.append(BrokerReferenceItem(
                value=item["value"],
                display_name=dname,
                label=dname,
                is_supported=item.get("is_supported", True),
                default_fees=df,
            ))
        return items
    except Exception as e:
        logger.error(f"Failed to load defaults_brokers.json: {e}")
        return []


async def get_reference_brokers(user_id: uuid.UUID, db: AsyncSession) -> List[BrokerReferenceItem]:
    """
    Get broker list for D16 (select broker when creating account).
    
    ADR-015:
    - Primary: distinct broker from user_data.trading_accounts (user's accounts)
    - Fallback/enrichment: defaults_brokers.json (display_name, is_supported, default_fees)
    - Always include "other" with is_supported=False (last)
    """
    defaults = _load_defaults()
    by_value: Dict[str, BrokerReferenceItem] = {it.value: it for it in defaults}

    # User's brokers from trading_accounts (broker field)
    stmt = (
        select(TradingAccount.broker)
        .where(and_(
            TradingAccount.user_id == user_id,
            TradingAccount.deleted_at.is_(None),
            TradingAccount.broker.isnot(None),
        ))
        .distinct()
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()

    seen_values: set = set()
    custom_items: List[BrokerReferenceItem] = []
    for name in rows:
        n = (name or "").strip()
        if not n or n in seen_values:
            continue
        seen_values.add(n)
        n_lower = n.lower()
        if any(k.lower() == n_lower for k in by_value):
            continue  # already in defaults
        if n_lower in ("other", "אחר"):
            continue  # "other" always from defaults - prevent duplicate "אחר"
        custom_items.append(BrokerReferenceItem(
            value=n,
            display_name=n,
            label=n,
            is_supported=False,
            default_fees=[],
        ))

    # Build final list: known brokers from defaults (excluding "other") + custom + "other"
    others = [it for it in defaults if it.value.lower() == "other"]
    known = [it for it in defaults if it.value.lower() != "other"]
    return known + custom_items + others


async def get_reference_exchanges(db: AsyncSession) -> List[dict]:
    """R2 1.7: Get exchanges for add-ticker form (symbol + exchange dropdown)."""
    # DB uses market_data.exchange_status enum; cast to string for comparison (fixes 500)
    stmt = (
        select(Exchange)
        .where(cast(Exchange.status, String) == "ACTIVE")
        .order_by(Exchange.exchange_code.asc())
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()
    return [
        {
            "id": uuid_to_ulid(r.id),
            "exchange_code": r.exchange_code,
            "exchange_name": r.exchange_name,
            "country": r.country,
        }
        for r in rows
    ]
