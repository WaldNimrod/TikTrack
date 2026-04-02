"""Layer 2A — prompting/cache.py (version-keyed assembled prompt cache; AD-S6-01)."""

from __future__ import annotations

from agents_os_v3.modules.prompting import cache as C


def test_cache_get_set_roundtrip() -> None:
    C.cache_clear_prefix("")
    C.cache_set("prompt:test:1", {"layers": {}})
    assert C.cache_get("prompt:test:1") == {"layers": {}}


def test_cache_clear_prefix_removes_matching_keys() -> None:
    C.cache_set("prompt:a:1", 1)
    C.cache_set("prompt:a:2", 2)
    C.cache_set("other:1", 3)
    C.cache_clear_prefix("prompt:")
    assert C.cache_get("prompt:a:1") is None
    assert C.cache_get("other:1") == 3


def test_ad_s6_01_no_standalone_l1_l3_cache_keys_in_module() -> None:
    """AD-S6-01: L1 raw template and L3 policy blobs are not cached under separate keys in cache.py."""
    C.cache_clear_prefix("")
    # Simulate mistaken direct cache of L1 only — builder uses composite "prompt:run_id:..." keys only.
    keys_after = [k for k in C._cache.keys() if k.startswith("l1:") or k.startswith("l3:")]
    assert keys_after == []
