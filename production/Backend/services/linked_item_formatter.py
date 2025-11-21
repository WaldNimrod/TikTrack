"""
Linked Item Formatter
=====================

Centralized helpers for shaping linked-item payloads into the canonical schema
that is documented in `documentation/features/entity-details-system/LINKED_ITEMS_CANONICAL_SCHEMA.md`.

The formatter keeps backwards compatibility with the historical flat structure
(`title`, `description`, `status`, etc.) while exposing the richer canonical
representation under the same dictionary, so the existing UI can continue to
function during the migration period.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, Iterable, Mapping, Optional

# ---------------------------------------------------------------------------
# Static label definitions
# ---------------------------------------------------------------------------

HEBREW_LABELS: Dict[str, str] = {
    "trading_account": "חשבון מסחר",
    "trade": "טרייד",
    "trade_plan": "תוכנית",
    "execution": "ביצוע",
    "cash_flow": "תזרים מזומנים",
    "alert": "התראה",
    "ticker": "טיקר",
    "note": "הערה",
    "position": "פוזיציה",
}

ENGLISH_LABELS: Dict[str, str] = {
    "trading_account": "Trading Account",
    "trade": "Trade",
    "trade_plan": "Trade Plan",
    "execution": "Execution",
    "cash_flow": "Cash Flow",
    "alert": "Alert",
    "ticker": "Ticker",
    "note": "Note",
    "position": "Position",
}

# ---------------------------------------------------------------------------
# Helper dataclass
# ---------------------------------------------------------------------------


@dataclass
class CanonicalSections:
    """Helper structure that stores the canonical sections for an item."""

    display: Dict[str, Any]
    status: Dict[str, Any]
    metrics: Dict[str, Any]
    conditions: Dict[str, Any]
    relations: Dict[str, Any]
    timestamps: Dict[str, Any]
    source: Dict[str, Any]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def canonicalize_linked_items(
    items: Optional[Iterable[Mapping[str, Any]]],
    link_direction: str,
    *,
    enrichment_provider: Optional[Any] = None,
    source_context: Optional[Mapping[str, Any]] = None,
) -> Iterable[Dict[str, Any]]:
    """Canonicalize every item in an iterable according to the schema."""

    if not items:
        return []

    canonical_items = []
    for raw_item in items:
        canonical_items.append(
            canonicalize_linked_item(
                raw_item,
                link_direction,
                enrichment_provider=enrichment_provider,
                source_context=source_context,
            )
        )
    return canonical_items


def canonicalize_linked_item(
    raw_item: Mapping[str, Any],
    link_direction: str,
    *,
    enrichment_provider: Optional[Any] = None,
    source_context: Optional[Mapping[str, Any]] = None,
) -> Dict[str, Any]:
    """Canonicalize a single raw linked item."""

    item = dict(raw_item or {})
    item_type = str(item.get("type") or "").strip().lower() or "unknown"

    display = _build_display_section(item_type, item)
    status = _build_status_section(item)
    metrics = _build_metrics_section(item)
    conditions = _build_conditions_section(item)
    relations = _build_relations_section(item)
    timestamps = _build_timestamps_section(item)
    source = _build_source_section(item_type, item, link_direction, source_context)

    if callable(enrichment_provider):
        try:
            enrichment = enrichment_provider(item) or {}
        except Exception:
            enrichment = {}

        display.update(enrichment.get("display", {}) or {})
        status.update(enrichment.get("status", {}) or {})
        metrics.update(enrichment.get("metrics", {}) or {})
        conditions.update(enrichment.get("conditions", {}) or {})
        relations.update(enrichment.get("relations", {}) or {})
        timestamps.update(enrichment.get("timestamps", {}) or {})
        source.update(enrichment.get("source", {}) or {})

    label_he = HEBREW_LABELS.get(item_type, display.get("title", ""))
    label_en = ENGLISH_LABELS.get(item_type, display.get("title", "").title())

    canonical_sections = CanonicalSections(
        display=display,
        status=status,
        metrics=metrics,
        conditions=conditions,
        relations=relations,
        timestamps=timestamps,
        source=source,
    )

    return _merge_legacy_and_canonical(
        item,
        item_type=item_type,
        link_direction=link_direction,
        label_he=label_he,
        label_en=label_en,
        sections=canonical_sections,
    )


# ---------------------------------------------------------------------------
# Section builders
# ---------------------------------------------------------------------------


def _build_display_section(item_type: str, item: Mapping[str, Any]) -> Dict[str, Any]:
    title = item.get("title") or HEBREW_LABELS.get(item_type, item_type.title())
    name = item.get("name") or item.get("symbol") or title
    description = item.get("description") or item.get("notes") or ""

    return {
        "title": title,
        "name": name,
        "description": str(description),
        "icon": item.get("icon") or item_type,
        "color": item.get("color"),
    }


def _build_status_section(item: Mapping[str, Any]) -> Dict[str, Any]:
    value = item.get("status") or item.get("state") or "unknown"
    category = item.get("status_category") or value
    badge_variant = item.get("badge_variant") or item.get("status_variant")

    return {
        "value": value,
        "category": category,
        "badge_variant": badge_variant,
    }


def _build_metrics_section(item: Mapping[str, Any]) -> Dict[str, Any]:
    return {
        "side": item.get("side") or item.get("action"),
        "investment_type": item.get("investment_type"),
        "quantity": item.get("quantity") or item.get("shares"),
        "price": item.get("price"),
        "amount": item.get("amount") or item.get("value"),
        "pl": item.get("pl") or item.get("profit_loss"),
    }


def _build_conditions_section(item: Mapping[str, Any]) -> Dict[str, Any]:
    return {
        "trigger_type": item.get("trigger_type") or item.get("condition_attribute"),
        "trigger_operator": item.get("trigger_operator") or item.get("condition_operator"),
        "target_value": item.get("target_value") or item.get("condition_number"),
    }


def _build_relations_section(item: Mapping[str, Any]) -> Dict[str, Any]:
    relation_keys = (
        "trade_id",
        "trade_plan_id",
        "ticker_id",
        "trading_account_id",
        "cash_flow_id",
        "execution_id",
        "alert_id",
        "note_id",
        "related_id",
        "related_type_id",
    )

    relations = {key: item.get(key) for key in relation_keys if item.get(key) is not None}

    if "ticker_id" not in relations and item.get("ticker") is not None:
        relations["ticker_id"] = item.get("ticker")
    if "trading_account_id" not in relations and item.get("account_id") is not None:
        relations["trading_account_id"] = item.get("account_id")

    return relations


def _build_timestamps_section(item: Mapping[str, Any]) -> Dict[str, Any]:
    return {
        "created_at": item.get("created_at"),
        "updated_at": item.get("updated_at") or item.get("modified_at"),
        "closed_at": item.get("closed_at"),
        "triggered_at": item.get("triggered_at"),
    }


def _build_source_section(
    item_type: str,
    item: Mapping[str, Any],
    link_direction: str,
    source_context: Optional[Mapping[str, Any]],
) -> Dict[str, Any]:
    base = {
        "entity_type": item_type,
        "entity_id": item.get("id"),
        "origin": item.get("origin"),
        "link_direction": link_direction,
    }
    if source_context:
        base.update(dict(source_context))
    return base


# ---------------------------------------------------------------------------
# Legacy compatibility merger
# ---------------------------------------------------------------------------


def _merge_legacy_and_canonical(
    raw_item: Mapping[str, Any],
    *,
    item_type: str,
    link_direction: str,
    label_he: str,
    label_en: str,
    sections: CanonicalSections,
) -> Dict[str, Any]:
    """Merge canonical data while preserving the legacy fields."""

    payload = dict(raw_item)

    payload["id"] = payload.get("id")
    payload["type"] = item_type
    payload["link_direction"] = link_direction
    payload["label"] = {"he": label_he, "en": label_en}

    payload.setdefault("title", sections.display.get("title"))
    payload.setdefault("name", sections.display.get("name"))
    payload["description"] = sections.display.get("description")
    payload["status"] = sections.status.get("value")
    payload["status_category"] = sections.status.get("category")
    payload["status_badge_variant"] = sections.status.get("badge_variant")

    payload["display"] = sections.display
    payload["metrics"] = sections.metrics
    payload["conditions"] = sections.conditions
    payload["relations"] = sections.relations
    payload["timestamps"] = sections.timestamps
    payload["source"] = sections.source

    for key in ("created_at", "updated_at", "closed_at"):
        value = payload["timestamps"].get(key)
        if isinstance(value, datetime):
            payload["timestamps"][key] = value.isoformat()

    return payload


__all__ = ["canonicalize_linked_item", "canonicalize_linked_items"]
