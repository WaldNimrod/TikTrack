"""
Reference Data Service
Task: GET /api/v1/reference/brokers (ADR-013, DATA_MAP_FINAL)
Status: COMPLETED

Returns broker names for select dropdowns.
Primary: user's brokers from brokers_fees. Fallback: defaults_brokers.json.
"""

import uuid
import json
import logging
from pathlib import Path
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.sql import and_

from ..models.brokers_fees import BrokerFee
from ..schemas.reference import BrokerReferenceItem

logger = logging.getLogger(__name__)

# Path to defaults file (relative to api package)
_DEFAULTS_PATH = Path(__file__).resolve().parent.parent / "data" / "defaults_brokers.json"


def _load_defaults() -> List[BrokerReferenceItem]:
    """Load default broker list from JSON."""
    try:
        with open(_DEFAULTS_PATH, "r", encoding="utf-8") as f:
            raw = json.load(f)
        return [BrokerReferenceItem(**item) for item in raw]
    except Exception as e:
        logger.error(f"Failed to load defaults_brokers.json: {e}")
        return []


async def get_reference_brokers(user_id: uuid.UUID, db: AsyncSession) -> List[BrokerReferenceItem]:
    """
    Get broker list for select dropdowns.
    
    - Primary: DISTINCT broker from user_data.brokers_fees where user_id and deleted_at IS NULL
    - Fallback: defaults_brokers.json when user has no broker-specific data
    """
    stmt = (
        select(BrokerFee.broker)
        .where(and_(BrokerFee.user_id == user_id, BrokerFee.deleted_at.is_(None)))
        .distinct()
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()
    
    if rows:
        # User has brokers - return unique names as value/label
        seen = set()
        items: List[BrokerReferenceItem] = []
        for name in rows:
            n = (name or "").strip()
            if n and n not in seen:
                seen.add(n)
                items.append(BrokerReferenceItem(value=n, label=n))
        items.sort(key=lambda x: x.label)
        return items
    
    # Fallback to defaults
    return _load_defaults()
