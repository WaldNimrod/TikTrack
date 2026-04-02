"""Load WP004 pipeline scenario fixtures — validates YAML + gate-alias expectations."""

from __future__ import annotations

import sys
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from agents_os_v2.ssot.gate_mapping import GATE_ALIASES  # noqa: E402

SCENARIOS_DIR = REPO_ROOT / "agents_os_v2" / "tests" / "fixtures" / "pipeline_scenarios"


def run_all() -> tuple[int, list[str]]:
    """Return (failure_count, messages)."""
    errors: list[str] = []
    yamls = sorted(SCENARIOS_DIR.glob("*.yaml"))
    if len(yamls) < 5:
        errors.append(f"expected >=5 scenario YAML files, found {len(yamls)}")
        return len(errors), errors

    for p in yamls:
        data = yaml.safe_load(p.read_text(encoding="utf-8")) or {}
        exp = (data.get("expect") or {}).get("alias_check")
        if exp:
            legacy = exp.get("legacy")
            want = exp.get("canonical")
            got = GATE_ALIASES.get(legacy, legacy)
            if got != want:
                errors.append(f"{p.name}: alias {legacy!r} -> {got!r}, want {want!r}")

    return len(errors), errors


def main() -> int:
    n, msgs = run_all()
    for m in msgs:
        print(m)
    return 1 if n else 0


if __name__ == "__main__":
    raise SystemExit(main())
