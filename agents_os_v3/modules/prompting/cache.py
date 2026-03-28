"""Version-keyed cache for L2/L4 only (AD-S6-01 — never cache L1/L3)."""

from __future__ import annotations

from typing import Any

# Process-local simple dict; bust via template version + run last_updated in key
_cache: dict[str, Any] = {}


def cache_get(key: str) -> Any | None:
    return _cache.get(key)


def cache_set(key: str, value: Any) -> None:
    _cache[key] = value


def cache_clear_prefix(prefix: str) -> None:
    for k in list(_cache.keys()):
        if k.startswith(prefix):
            del _cache[k]
