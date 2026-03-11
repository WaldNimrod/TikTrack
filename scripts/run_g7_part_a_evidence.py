#!/usr/bin/env python3
"""
GATE_7 Part A runtime evidence — 4 cycles in one process.
H4 fix: in-process cycles so cooldown persists between runs (no subprocess).
Writes log to documentation/05-REPORTS/artifacts/G7_PART_A_RUNTIME_EVIDENCE_<date>.log
and prints counts for JSON.
"""
import io
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

_project = Path(__file__).parent.parent
sys.path.insert(0, str(_project))
log_dir = _project / "documentation" / "05-REPORTS" / "artifacts"
log_dir.mkdir(parents=True, exist_ok=True)
log_path = log_dir / f"G7_PART_A_RUNTIME_EVIDENCE_{datetime.now(timezone.utc).strftime('%Y-%m-%d_%H%M%S')}.log"


def run_sync_in_process():
    """Run one EOD cycle in-process (cooldown persists). Returns captured output."""
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "sync_ticker_prices_eod",
        _project / "scripts" / "sync_ticker_prices_eod.py",
    )
    mod = importlib.util.module_from_spec(spec)
    buf = io.StringIO()
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    try:
        sys.stdout = buf
        sys.stderr = buf
        spec.loader.exec_module(mod)
        mod.run_one_cycle()
    finally:
        sys.stdout = old_stdout
        sys.stderr = old_stderr
    return buf.getvalue()


def main():
    import time
    with open(log_path, "w", encoding="utf-8") as f:
        f.write(f"--- G7 Part A evidence run started {datetime.now(timezone.utc).isoformat()} ---\n")
    for i in range(4):
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(f"\n=== CYCLE {i+1}/4 ===\n")
        out = run_sync_in_process()
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(out)
        if i < 3:
            # CC-WP003-04: 60s between cycles to avoid Yahoo rate limit (429)
            time.sleep(60)
        with open(log_path, "a", encoding="utf-8") as f:
            f.write("\n")
    # Count 429
    text = log_path.read_text(encoding="utf-8")
    count_429 = text.count("429")
    print(f"log_path={log_path}")
    print(f"cc_wp003_04_yahoo_429_count={count_429}")
    print(f"pass_04={count_429 == 0}")


if __name__ == "__main__":
    main()
