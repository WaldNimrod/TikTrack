#!/usr/bin/env python3
"""
GATE_7 Part A Runtime Verification — CC-WP003-01, 02, 04
TEAM_90_TO_TEAM_60_TEAM_50_S002_P002_WP003_GATE7_PARTA_RERUN_MANDATE_v2.0.1

Modes (G7_PART_A_MODE):
  market_open — Run during market-open; CC-01 yahoo count (<=5). Merge to artifact.
  off_hours   — Run during off-hours; CC-02 yahoo count (<=2). Merge to artifact.
  four_cycle  — Trigger 4 consecutive cycles; CC-04 429 count (0). Merge to artifact.

G7_PART_A_LOG_PATH is MANDATORY (rerun v2.0.1).

Usage:
  # 1. Start backend with log capture:
  #    uvicorn api.main:app --host 0.0.0.0 --port 8082 2>&1 | tee /tmp/g7_part_a.log

  # 2. Run market-open cycle (during market hours):
  #    G7_PART_A_LOG_PATH=/tmp/g7_part_a.log G7_PART_A_MODE=market_open python3 scripts/verify_g7_part_a_runtime.py

  # 3. Run off-hours cycle (when market closed) — use fresh log or truncate:
  #    G7_PART_A_LOG_PATH=/tmp/g7_part_a.log G7_PART_A_MODE=off_hours python3 scripts/verify_g7_part_a_runtime.py

  # 4. Run 4-cycle (4 consecutive triggers):
  #    G7_PART_A_LOG_PATH=/tmp/g7_part_a.log G7_PART_A_MODE=four_cycle python3 scripts/verify_g7_part_a_runtime.py
"""

import os
import sys
import time
import json
import urllib.request
import urllib.error
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, Tuple

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_URL = os.getenv("BACKEND_URL", os.getenv("PHASE2_BACKEND_URL", "http://127.0.0.1:8082"))
LOG_PATH = os.getenv("G7_PART_A_LOG_PATH", "").strip()
MODE = os.getenv("G7_PART_A_MODE", "single").strip().lower()
JOB_NAME = "sync_ticker_prices_intraday"
ARTIFACT_PATH = PROJECT_ROOT / "documentation" / "05-REPORTS" / "artifacts" / "G7_PART_A_RUNTIME_EVIDENCE.json"


def _post(url: str, data: dict = None, headers: dict = None) -> Tuple[int, dict]:
    req = urllib.request.Request(
        url,
        data=json.dumps(data or {}).encode() if data else None,
        headers={**(headers or {}), "Content-Type": "application/json"},
        method="POST" if data else "GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read().decode()) if r.headers.get("Content-Type", "").startswith("application/json") else {}
    except urllib.error.HTTPError as e:
        return e.code, {"error": str(e)}
    except Exception as e:
        return 0, {"error": str(e)}


def login() -> Optional[str]:
    """Login as TikTrackAdmin, return access_token or None."""
    status, body = _post(
        f"{BACKEND_URL}/api/v1/auth/login",
        {"username_or_email": "TikTrackAdmin", "password": os.getenv("PHASE2_TEST_PASSWORD", "4181")},
    )
    if status == 200 and body.get("access_token"):
        return body["access_token"]
    return None


def trigger_job(token: str) -> bool:
    """Trigger sync_ticker_prices_intraday via API."""
    req = urllib.request.Request(
        f"{BACKEND_URL}/api/v1/admin/background-jobs/{JOB_NAME}/trigger",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            body = r.read().decode()
            data = json.loads(body) if body else {}
            return data.get("triggered") is True
    except Exception:
        return False


def get_last_run(token: str) -> Optional[dict]:
    """Get last job run from /admin/background-jobs/{job_name}."""
    req = urllib.request.Request(
        f"{BACKEND_URL}/api/v1/admin/background-jobs/{JOB_NAME}",
        headers={"Authorization": f"Bearer {token}"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            body = json.loads(r.read().decode())
            hist = body.get("history") or []
            return hist[0] if hist else None
    except Exception:
        return None


def wait_for_completion(token: str, max_wait_sec: int = 120, poll_sec: float = 2.0) -> Optional[dict]:
    """Poll until last run is completed/skipped/failed or timeout."""
    start = time.time()
    while time.time() - start < max_wait_sec:
        r = get_last_run(token)
        if r:
            status = r.get("status", "")
            if status in ("completed", "skipped_concurrent", "failed", "timeout"):
                return r
        time.sleep(poll_sec)
    return None


def parse_log_for_evidence(log_path: str, from_position: Optional[int] = None) -> dict:
    """Parse log file for Yahoo call count and 429 occurrences. Optionally from byte offset."""
    out = {"yahoo_call_count": 0, "yahoo_429_count": 0, "lines_with_yahoo": [], "lines_with_429": []}
    if not log_path or not Path(log_path).exists():
        return out
    try:
        with open(log_path, "r", encoding="utf-8", errors="replace") as f:
            if from_position is not None and from_position > 0:
                f.seek(from_position)
            for line in f:
                if "query1.finance.yahoo.com" in line or ("yahoo" in line.lower() and "finance" in line.lower()):
                    out["yahoo_call_count"] += 1
                    out["lines_with_yahoo"].append(line.strip()[:200])
                if "429" in line and ("yahoo" in line.lower() or "quote" in line or "chart" in line):
                    out["yahoo_429_count"] += 1
                    out["lines_with_429"].append(line.strip()[:200])
    except Exception as e:
        out["parse_error"] = str(e)
    return out


def get_log_position(log_path: str) -> int:
    """Return current byte position (end of file) for later incremental parse."""
    if not log_path or not Path(log_path).exists():
        return 0
    try:
        with open(log_path, "rb") as f:
            f.seek(0, 2)
            return f.tell()
    except Exception:
        return 0


def load_artifact() -> dict:
    """Load existing artifact for merge."""
    if not ARTIFACT_PATH.exists():
        return {}
    try:
        with open(ARTIFACT_PATH) as f:
            return json.load(f)
    except Exception:
        return {}


def save_artifact(artifact: dict) -> None:
    """Save artifact."""
    ARTIFACT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(ARTIFACT_PATH, "w") as f:
        json.dump(artifact, f, indent=2)


def main():
    ts_utc = datetime.now(timezone.utc).isoformat()
    print("GATE_7 Part A Runtime Verification (Rerun v2.0.1)")
    print("=" * 60)
    print(f"Backend: {BACKEND_URL}")
    print(f"Mode: {MODE}")
    print(f"Timestamp (UTC): {ts_utc}")
    print(f"Log path: {LOG_PATH or '(MANDATORY)'}")
    print()

    # Rerun v2.0.1: log_path mandatory
    if not LOG_PATH:
        print("FAIL: G7_PART_A_LOG_PATH is mandatory (rerun v2.0.1).")
        print("Start backend with: uvicorn api.main:app --host 0.0.0.0 --port 8082 2>&1 | tee /tmp/g7_part_a.log")
        sys.exit(1)
    if not Path(LOG_PATH).exists():
        print(f"FAIL: Log file not found: {LOG_PATH}")
        sys.exit(1)

    # 1. Login
    token = login()
    if not token:
        print("FAIL: Login failed. Ensure backend is running and TikTrackAdmin/4181 exists.")
        sys.exit(1)
    print("PASS: Login OK")

    # Record log position before our triggers (for incremental parse)
    log_start = get_log_position(LOG_PATH)
    print(f"Log position before triggers: {log_start} bytes")

    # 2. Trigger job (1x or 4x for four_cycle)
    num_triggers = 4 if MODE == "four_cycle" else 1
    for i in range(num_triggers):
        if not trigger_job(token):
            print(f"FAIL: Trigger {i+1}/{num_triggers} failed")
            sys.exit(1)
        print(f"PASS: Job triggered ({i+1}/{num_triggers})")
        result = wait_for_completion(token)
        if not result:
            print("WARN: Job did not complete within 120s")
        if i < num_triggers - 1 and num_triggers > 1:
            time.sleep(5)  # Buffer between cycles

    status = (result or get_last_run(token) or {}).get("status", "unknown")
    started = (result or {}).get("started_at", "")
    duration = (result or {}).get("duration_ms")
    records = (result or {}).get("records_processed")

    # 3. Parse log (from our start position to avoid prior run noise)
    evidence = parse_log_for_evidence(LOG_PATH, from_position=log_start)
    print()
    print("--- Yahoo call count (this run window) ---")
    print(f"Yahoo HTTP calls: {evidence['yahoo_call_count']}")
    print()
    print("--- Yahoo 429 occurrences ---")
    print(f"Yahoo 429 count: {evidence['yahoo_429_count']}")
    if evidence.get("lines_with_429"):
        for ln in evidence["lines_with_429"][:5]:
            print(f"  {ln[:120]}")
    print()

    # 4. Build/merge artifact with explicit pass_01, pass_02, pass_04
    prev = load_artifact()
    cc01_count = evidence["yahoo_call_count"] if MODE == "market_open" else prev.get("cc_01_yahoo_call_count", 0)
    cc02_count = evidence["yahoo_call_count"] if MODE == "off_hours" else prev.get("cc_02_yahoo_call_count", 0)
    cc04_count = evidence["yahoo_429_count"] if MODE == "four_cycle" else prev.get("cc_04_yahoo_429_count", 0)

    if MODE == "market_open":
        prev["pass_01"] = cc01_count <= 5
        prev["cc_01_yahoo_call_count"] = cc01_count
    elif MODE == "off_hours":
        prev["pass_02"] = cc02_count <= 2
        prev["cc_02_yahoo_call_count"] = cc02_count
    elif MODE == "four_cycle":
        prev["pass_04"] = cc04_count == 0
        prev["cc_04_yahoo_429_count"] = cc04_count
    else:
        # Legacy single run: set all from this run
        prev["pass_01"] = evidence["yahoo_call_count"] <= 5
        prev["pass_02"] = evidence["yahoo_call_count"] <= 2
        prev["pass_04"] = evidence["yahoo_429_count"] == 0
        prev["cc_01_yahoo_call_count"] = evidence["yahoo_call_count"]
        prev["cc_02_yahoo_call_count"] = evidence["yahoo_call_count"]
        prev["cc_04_yahoo_429_count"] = evidence["yahoo_429_count"]

    artifact = {
        "timestamp_utc": ts_utc,
        "backend_url": BACKEND_URL,
        "job_name": JOB_NAME,
        "log_path": LOG_PATH,
        "mode": MODE,
        "job_status": status,
        "job_started_at": started,
        "job_duration_ms": duration,
        "job_records_processed": records,
        "cc_01_yahoo_call_count": prev.get("cc_01_yahoo_call_count"),
        "cc_02_yahoo_call_count": prev.get("cc_02_yahoo_call_count"),
        "cc_04_yahoo_429_count": prev.get("cc_04_yahoo_429_count"),
        "pass_01": prev.get("pass_01"),
        "pass_02": prev.get("pass_02"),
        "pass_04": prev.get("pass_04"),
    }
    save_artifact(artifact)
    print(f"Artifact: {ARTIFACT_PATH}")
    print(f"pass_01: {artifact['pass_01']} | pass_02: {artifact['pass_02']} | pass_04: {artifact['pass_04']}")

    key = {"market_open": "pass_01", "off_hours": "pass_02", "four_cycle": "pass_04"}.get(MODE)
    if key and artifact.get(key) is False:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
