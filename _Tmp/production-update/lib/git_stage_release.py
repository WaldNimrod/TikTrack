#!/usr/bin/env python3
"""
TikTrack Release Staging Helper
===============================

Stages a curated set of paths that typically change during a production update
to minimise manual git operations inside Cursor.

Usage:
    python scripts/release/git_stage_release.py
    python scripts/release/git_stage_release.py --path documentation/production
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path
from typing import Iterable, List

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DEFAULT_PATHS = [
    "documentation/production/UPDATE_PROCESS.md",
    "documentation/03-DEVELOPMENT/",
    "documentation/version-manifest.json",
    "documentation/production/VERSION_HISTORY.md",
    "scripts/release/",
    "scripts/verify_production_isolation.sh",
    "scripts/verify_production.sh",
]


def run_git_command(args: Iterable[str]) -> int:
    result = subprocess.run(["git", *args])
    return result.returncode


def stage_paths(paths: List[str]) -> None:
    print("🪄 Staging paths:")
    for path in paths:
        print(f"  • {path}")
        code = run_git_command(["add", "--", path])
        if code != 0:
            print(f"    ⚠️  git add returned exit code {code} for {path}")


def parse_args(argv: List[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Stage release-related changes.")
    parser.add_argument(
        "--path",
        action="append",
        dest="paths",
        help="Additional path to stage (can be repeated).",
    )
    parser.add_argument(
        "--no-defaults",
        action="store_true",
        help="Skip default staging paths and only use paths provided via --path.",
    )
    return parser.parse_args(argv)


def main(argv: List[str]) -> int:
    args = parse_args(argv)
    paths = []
    if not args.no_defaults:
        paths.extend(DEFAULT_PATHS)
    if args.paths:
        paths.extend(args.paths)

    # Normalise and deduplicate
    uniq_paths = []
    seen = set()
    for path in paths:
        normalized = str(Path(path))
        if normalized not in seen:
            uniq_paths.append(normalized)
            seen.add(normalized)

    print("📋 git status (before):")
    run_git_command(["status", "--short"])
    print()

    stage_paths(uniq_paths)
    print()

    print("📋 git status (after):")
    run_git_command(["status", "--short"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))

