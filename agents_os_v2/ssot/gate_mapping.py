"""Load GATE_ALIASES from gates.yaml (WP004 SSOT)."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import yaml

_SSOT_DIR = Path(__file__).resolve().parent
_GATES_YAML = _SSOT_DIR / "gates.yaml"


@lru_cache(maxsize=1)
def _load_legacy_to_canonical() -> dict[str, str]:
    raw = yaml.safe_load(_GATES_YAML.read_text(encoding="utf-8"))
    m = raw.get("legacy_to_canonical") or {}
    out: dict[str, str] = {}
    for k, v in m.items():
        out[str(k).strip()] = str(v).strip()
    return out


# Used by pipeline.py — must match agents_os/ui/js/pipeline-gate-map.generated.js
GATE_ALIASES: dict[str, str] = _load_legacy_to_canonical()
