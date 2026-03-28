#!/usr/bin/env python3
"""
AOS v3 pipeline CLI (GATE_0 stub).

Full behavior is validated at GATE_4 per WP D.3. This module provides a stable
``python -m`` target for ``cli/pipeline_run.sh``.
"""
from __future__ import annotations

import argparse
import sys


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(
        prog="aos-v3-pipeline",
        description="Agents OS v3 pipeline runner (BUILD track — stub until GATE_4).",
    )
    p.add_argument("--version", action="version", version="AOS v3 cli 0.1.0 (GATE_0)")
    p.add_argument(
        "remainder",
        nargs=argparse.REMAINDER,
        help="Forwarded args reserved for future orchestration (no-op at GATE_0).",
    )
    p.parse_args(argv)
    print(
        "AOS v3 cli: GATE_0 placeholder — use Team 21 API + modules after GATE_1.\n"
        "See agents_os_v3/cli/pipeline_run.sh and WP v1.0.3 D.3 item 7.",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
