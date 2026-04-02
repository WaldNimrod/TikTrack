#!/usr/bin/env python3
"""
Layer 1 — check-only: ssot_check + mock file presence + minimal PASS/JSON content.

Run after: python3 scripts/canary_simulation/generate_mocks.py --wp S003-P013-WP002
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
_SIM_DIR = Path(__file__).resolve().parent
if str(_SIM_DIR) not in sys.path:
    sys.path.insert(0, str(_SIM_DIR))

from generate_mocks import manifest as mock_manifest  # noqa: E402


def _read(p: Path) -> str:
    return p.read_text(encoding="utf-8", errors="replace")


def _check_md(path: Path) -> tuple[bool, str]:
    if not path.is_file():
        return False, "missing file"
    text = _read(path)
    if "VERDICT: PASS" not in text and '"decision":"PASS"' not in text.replace(" ", ""):
        if '"decision": "PASS"' in text:
            return True, "ok"
        return False, "no VERDICT: PASS / JSON decision PASS"
    return True, "ok"


def _check_json(path: Path) -> tuple[bool, str]:
    if not path.is_file():
        return False, "missing file"
    try:
        data = json.loads(_read(path))
    except json.JSONDecodeError as e:
        return False, f"invalid json: {e}"
    items = data.get("items")
    if not isinstance(items, list) or not items:
        return False, "items[] required for HRC"
    return True, "ok"


def run_ssot(domain: str) -> None:
    env = dict(**__import__("os").environ)
    env.setdefault("PYTHONPATH", str(REPO_ROOT))
    r = subprocess.run(
        [sys.executable, "-m", "agents_os_v2.tools.ssot_check", "--domain", domain],
        cwd=REPO_ROOT,
        env=env,
    )
    if r.returncode != 0:
        sys.exit(r.returncode)


def _phase_b_checks() -> list[str]:
    errors: list[str] = []
    base = REPO_ROOT / "_COMMUNICATION/team_101/simulation_mocks/phase_b"
    b1 = base / "B1_TEAM_61_BLOCK_sample.md"
    b2 = base / "B2_TEAM_70_DOC_route_sample.md"
    t1 = b1.read_text(encoding="utf-8", errors="replace") if b1.is_file() else ""
    t2 = b2.read_text(encoding="utf-8", errors="replace") if b2.is_file() else ""
    if "BF-G3-001" not in t1 or "BLOCK" not in t1:
        errors.append("phase_b B1 sample missing BF-G3-001 / BLOCK")
    if "route_recommendation" not in t2 or "doc" not in t2:
        errors.append("phase_b B2 sample missing route_recommendation doc markers")
    return errors


def main() -> int:
    ap = argparse.ArgumentParser(description="Canary simulation Layer 1 verification.")
    ap.add_argument("--wp", default="S003-P013-WP002")
    ap.add_argument("--skip-ssot", action="store_true")
    ap.add_argument(
        "--phase-b",
        action="store_true",
        help="Also verify Phase B reference fixtures under team_101/simulation_mocks/phase_b/",
    )
    ap.add_argument(
        "--mode",
        choices=("mirror", "canonical"),
        default="mirror",
        help="mirror=team_101/simulation_mocks/<wp>/mirror; canonical=_COMMUNICATION paths",
    )
    args = ap.parse_args()
    wp = args.wp.strip()

    if not args.skip_ssot:
        run_ssot("tiktrack")

    root: Path
    if args.mode == "mirror":
        root = REPO_ROOT / "_COMMUNICATION" / "team_101" / "simulation_mocks" / wp / "mirror"
    else:
        root = REPO_ROOT

    errors: list[str] = []
    for rel, _, kind in mock_manifest(wp):
        rel_path = rel
        if args.mode == "mirror":
            path = root / rel_path
        else:
            path = REPO_ROOT / rel_path

        if kind == "json":
            ok, msg = _check_json(path)
        else:
            ok, msg = _check_md(path)
        if not ok:
            errors.append(f"{path.relative_to(REPO_ROOT)}: {msg}")

    if args.phase_b:
        errors.extend(_phase_b_checks())

    if errors:
        print("LAYER1_VERIFY: FAIL", file=sys.stderr)
        for e in errors:
            print(f"  · {e}", file=sys.stderr)
        return 1

    extra = " +phase_b" if args.phase_b else ""
    print(f"LAYER1_VERIFY: PASS (mode={args.mode}, wp={wp}, files={len(list(mock_manifest(wp)))}{extra})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
