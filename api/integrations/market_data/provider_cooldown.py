"""
Provider Cooldown — TEAM_90_RATELIMIT_SCALING_LOCK
When provider returns 429 → cooldown; no further calls during window.
SSOT: MARKET_DATA_PIPE_SPEC §8.1 rule 3
"""

import time
from typing import Dict

_cooldowns: Dict[str, float] = {}  # provider_name -> cooldown_until (epoch)


def set_cooldown(provider_name: str, minutes: int) -> None:
    """Set provider in cooldown for `minutes`."""
    _cooldowns[provider_name] = time.time() + (minutes * 60)


def is_in_cooldown(provider_name: str) -> bool:
    """True if provider is in cooldown window."""
    until = _cooldowns.get(provider_name)
    if not until:
        return False
    if time.time() >= until:
        del _cooldowns[provider_name]
        return False
    return True


def clear_cooldown(provider_name: str) -> None:
    """Clear cooldown (for tests)."""
    _cooldowns.pop(provider_name, None)
