"""
Alert Condition Builder — Canonical 7 Fields × 7 Operators
ARCHITECT_DIRECTIVE_G7_REMEDIATION §1.6, TEAM_10_PHASE_C

Contract for Team 30: condition_field, condition_operator, condition_value.
"""

from typing import Optional

CONDITION_FIELDS = frozenset((
    "price",
    "open_price",
    "high_price",
    "low_price",
    "close_price",
    "volume",
    "market_cap",
))

CONDITION_OPERATORS = frozenset((
    ">",
    "<",
    ">=",
    "<=",
    "=",
    "crosses_above",
    "crosses_below",
))


def validate_condition_field(value: Optional[str]) -> bool:
    """True if value is in CONDITION_FIELDS or None (optional)."""
    return value is None or value in CONDITION_FIELDS


def validate_condition_operator(value: Optional[str]) -> bool:
    """True if value is in CONDITION_OPERATORS or None (optional)."""
    return value is None or value in CONDITION_OPERATORS
