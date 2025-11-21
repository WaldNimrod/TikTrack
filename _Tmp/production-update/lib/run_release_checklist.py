#!/usr/bin/env python3
"""
TikTrack Release Checklist Runner
=================================

Automates the critical pre-release steps so the developer can run a single
command instead of executing multiple scripts manually.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path
from typing import Iterable, List, Tuple

PROJECT_ROOT = Path(__file__).resolve().parents[2]
PYTHON = sys.executable


Step = Tuple[str, Iterable[str]]


def build_steps(label: str, skip_schema: bool) -> List[Step]:
    steps: List[Step] = [
        (
            "Create pre-update database backup",
            [
                PYTHON,
                str(PROJECT_ROOT / "scripts" / "release" / "create_db_backup.py"),
                "--label",
                label,
            ],
        ),
    ]
    if not skip_schema:
        steps.append(
            (
                "Validate schema against baseline",
                [
                    PYTHON,
                    str(PROJECT_ROOT / "scripts" / "release" / "verify_schema.py"),
                ],
            )
        )
    steps.extend(
        [
            (
                "Verify production isolation",
                [str(PROJECT_ROOT / "scripts" / "verify_production_isolation.sh")],
            ),
            (
                "Verify production structure",
                [str(PROJECT_ROOT / "scripts" / "verify_production.sh")],
            ),
        ]
    )
    return steps


def run_step(name: str, command: Iterable[str]) -> bool:
    print(f"▶️  {name}")
    print(f"    {' '.join(command)}")
    result = subprocess.run(command, cwd=PROJECT_ROOT)
    if result.returncode == 0:
        print(f"    ✅ Completed: {name}\n")
        return True
    print(f"    ❌ Failed ({result.returncode}): {name}\n")
    return False


def parse_args(argv: List[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the standard release checklist.")
    parser.add_argument(
        "--label",
        default="pre-update",
        help="Backup label to pass to create_db_backup.py (default: pre-update).",
    )
    parser.add_argument(
        "--skip-schema",
        action="store_true",
        help="Skip schema validation (useful during iterative development).",
    )
    return parser.parse_args(argv)


def main(argv: List[str]) -> int:
    args = parse_args(argv)

    print("🧾 TikTrack Release Checklist")
    print("=============================\n")
    steps = build_steps(args.label, args.skip_schema)

    for name, command in steps:
        if not run_step(name, command):
            print("⚠️  Checklist halted due to failure.")
            return 1

    print("🎉 Release checklist completed successfully!")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))

