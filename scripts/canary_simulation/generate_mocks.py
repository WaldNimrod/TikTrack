#!/usr/bin/env python3
"""
Generate minimal PASS mock artifacts for Canary simulation (Team 100 mandate).

Default output: _COMMUNICATION/team_101/simulation_mocks/<WP>/{team_xx}/...
Use --deploy to copy the same files into canonical _COMMUNICATION/team_* paths.

Does not modify pipeline_state or WSM.
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]


def _wp_underscore(wp: str) -> str:
    return wp.replace("-", "_")


def _md_pass(
    title: str,
    wp: str,
    gate: str,
    extra: str = "",
) -> str:
    return f"""---
simulation_mock: true
work_package_id: {wp}
gate: {gate}
date: 2026-03-23
---

# {title}

{{"decision":"PASS"}}

VERDICT: PASS

{extra}
"""


def _hrc_json(wp_u: str) -> dict:
    return {
        "meta": {"wp": wp_u, "simulation": True},
        "environment": {"note": "Canary simulation mock"},
        "items": [
            {"id": "HRC-01", "title": "Smoke: dashboard loads"},
            {"id": "HRC-02", "title": "Smoke: file list renders"},
        ],
    }


def manifest(wp: str) -> list[tuple[str, Path, str]]:
    """Paths under _COMMUNICATION/ (relative string), full path, kind: md|json."""
    wpu = _wp_underscore(wp)
    comm = REPO_ROOT / "_COMMUNICATION"
    out: list[tuple[str, Path, str]] = []

    def add(rel_under_comm: str, kind: str) -> None:
        rel = f"_COMMUNICATION/{rel_under_comm}"
        out.append((rel, comm / rel_under_comm, kind))

    add(f"team_190/TEAM_190_{wpu}_GATE_0_VALIDATION_v1.0.0.md", "md")
    add(f"team_170/TEAM_170_{wpu}_LLD400_v1.0.0.md", "md")
    add(f"team_190/TEAM_190_{wpu}_GATE_1_VERDICT_v1.0.0.md", "md")
    add(f"team_10/TEAM_10_{wpu}_G3_PLAN_WORK_PLAN_v1.0.0.md", "md")
    add(f"team_90/TEAM_90_{wpu}_G3_5_VERDICT_v1.0.0.md", "md")
    add(f"team_102/TEAM_102_{wpu}_GATE_2_VERDICT_v1.0.0.md", "md")
    # Align with pipeline-config.js getExpectedFiles — GATE_3 / 3.2 TikTrack uses *_IMPLEMENTATION (not API_VERIFY).
    add(f"team_20/TEAM_20_{wpu}_IMPLEMENTATION_v1.0.0.md", "md")
    add(f"team_30/TEAM_30_{wpu}_IMPLEMENTATION_v1.0.0.md", "md")
    add(f"team_50/TEAM_50_{wpu}_QA_REPORT_v1.0.0.md", "md")
    add(f"team_90/TEAM_90_{wpu}_GATE_4_VERDICT_v1.0.0.md", "md")
    add(f"team_102/TEAM_102_{wpu}_GATE_4_ARCH_REVIEW_v1.0.0.md", "md")
    add(f"team_00/TEAM_00_{wpu}_GATE_4_APPROVAL_v1.0.0.md", "md")
    add(f"team_70/TEAM_70_{wpu}_GATE5_PHASE51_DOCUMENTATION_CLOSURE_REPORT_v1.0.0.md", "md")
    add(f"team_90/TEAM_90_{wpu}_GATE_5_VALIDATION_v1.0.0.md", "md")
    add(f"agents_os/hrc/GATE_4_HRC_{wpu}_v1.0.0.json", "json")
    return out


def write_files(wp: str, dest_root: Path) -> int:
    wpu = _wp_underscore(wp)
    count = 0
    for rel, _, kind in manifest(wp):
        target = dest_root / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        if kind == "json":
            target.write_text(json.dumps(_hrc_json(wpu), indent=2) + "\n", encoding="utf-8")
        else:
            title = target.stem.replace("_", " ")
            gate = "GATE_0"
            if "GATE_1" in rel:
                gate = "GATE_1"
            elif "G3_PLAN" in rel:
                gate = "GATE_2"
            elif "G3_5" in rel:
                gate = "GATE_2"
            elif "GATE_2" in rel:
                gate = "GATE_2"
            elif "IMPLEMENTATION" in rel and ("team_20" in rel or "team_30" in rel):
                gate = "GATE_3"
            elif "team_50" in rel:
                gate = "GATE_3"
            elif "GATE_4" in rel and "ARCH" in rel:
                gate = "GATE_4"
            elif "GATE_4" in rel:
                gate = "GATE_4"
            elif "GATE5_PHASE51" in rel or "CLOSURE" in rel:
                gate = "GATE_5"
            elif "GATE_5" in rel:
                gate = "GATE_5"
            target.write_text(_md_pass(title, wp, gate), encoding="utf-8")
        count += 1
    return count


def main() -> int:
    ap = argparse.ArgumentParser(description="Generate Canary simulation mock artifacts.")
    ap.add_argument("--wp", default="S003-P013-WP002", help="Work package id")
    ap.add_argument(
        "--mirror-only",
        action="store_true",
        help="Write only under team_101/simulation_mocks/<WP>/mirror/ (default if not --deploy)",
    )
    ap.add_argument(
        "--deploy",
        action="store_true",
        help="Copy mocks into canonical _COMMUNICATION paths (same layout as verify_layer1 --check canonical)",
    )
    args = ap.parse_args()
    wp = args.wp.strip()

    mirror = REPO_ROOT / "_COMMUNICATION" / "team_101" / "simulation_mocks" / wp / "mirror"
    mirror.mkdir(parents=True, exist_ok=True)

    n = write_files(wp, mirror)
    print(f"Wrote {n} mock files under {mirror.relative_to(REPO_ROOT)}")

    if args.deploy:
        canon = REPO_ROOT / "_COMMUNICATION"
        for rel, _, _ in manifest(wp):
            src = mirror / rel
            dst = canon / rel
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
            print(f"deploy: {rel}")
    elif not args.mirror_only:
        # default already mirror-only; --mirror-only is explicit alias
        pass

    print(f"Done. HRC path: _COMMUNICATION/agents_os/hrc/GATE_4_HRC_{_wp_underscore(wp)}_v1.0.0.json (under mirror until --deploy)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
