#!/usr/bin/env python3
"""Seed pipeline_events.jsonl with initial test data for Event Log UI verification.
   Usage: python3 agents_os/scripts/seed_event_log.py
   Appends to existing log; safe to run multiple times."""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent
LOG_FILE = REPO / "_COMMUNICATION" / "agents_os" / "logs" / "pipeline_events.jsonl"

SEED_EVENTS = [
    {"pipe_run_id": "seed", "event_type": "SERVER_START", "domain": "global", "stage_id": "", "work_package_id": "", "gate": "", "agent_team": "team_61", "severity": "INFO", "description": "AOS Pipeline Server started (seed)", "metadata": {}},
    {"pipe_run_id": "seed", "event_type": "INIT_PIPELINE", "domain": "agents_os", "stage_id": "S002", "work_package_id": "S002-P005-WP003", "gate": "GATE_0", "agent_team": "team_61", "severity": "INFO", "description": "Pipeline initialized: S002-P005-WP003 at GATE_0", "metadata": {"initialized_by": "seed_event_log", "source": "SEED"}},
    {"pipe_run_id": "seed", "event_type": "GATE_PASS", "domain": "agents_os", "stage_id": "S002", "work_package_id": "S002-P005-WP003", "gate": "GATE_0", "agent_team": "team_61", "severity": "INFO", "description": "GATE_0 validation PASS — WP003 scope approved", "metadata": {"findings_count": 0}},
    {"pipe_run_id": "seed", "event_type": "GATE_PASS", "domain": "agents_os", "stage_id": "S002", "work_package_id": "S002-P005-WP003", "gate": "GATE_1", "agent_team": "team_61", "severity": "INFO", "description": "GATE_1 LLD400 validated — advance to GATE_2", "metadata": {}},
    {"pipe_run_id": "seed", "event_type": "SNAPSHOT_GENERATED", "domain": "agents_os", "stage_id": "S002", "work_package_id": "S002-P005-WP003", "gate": "GATE_1", "agent_team": "team_61", "severity": "INFO", "description": "State snapshot written for agents_os", "metadata": {}},
    # TikTrack domain events (so Event Log shows data when domain=tiktrack)
    {"pipe_run_id": "seed", "event_type": "INIT_PIPELINE", "domain": "tiktrack", "stage_id": "S001", "work_package_id": "S001-P001-WP001", "gate": "GATE_0", "agent_team": "team_20", "severity": "INFO", "description": "Pipeline initialized: S001-P001-WP001 (TikTrack core)", "metadata": {"initialized_by": "seed_event_log", "source": "SEED"}},
    {"pipe_run_id": "seed", "event_type": "GATE_PASS", "domain": "tiktrack", "stage_id": "S001", "work_package_id": "S001-P001-WP001", "gate": "GATE_0", "agent_team": "team_20", "severity": "INFO", "description": "GATE_0 scope approved — TikTrack Core Features", "metadata": {"findings_count": 0}},
    {"pipe_run_id": "seed", "event_type": "GATE_PASS", "domain": "tiktrack", "stage_id": "S001", "work_package_id": "S001-P001-WP001", "gate": "GATE_1", "agent_team": "team_30", "severity": "INFO", "description": "GATE_1 LLD validated — advance to GATE_2", "metadata": {}},
]


def main():
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    base = datetime.now(timezone.utc)
    written = 0
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        for i, evt in enumerate(SEED_EVENTS):
            ts = (base + timedelta(seconds=i * 2)).strftime("%Y-%m-%dT%H:%M:%SZ")
            evt = dict(evt)
            evt["timestamp"] = ts
            f.write(json.dumps(evt, ensure_ascii=False) + "\n")
            written += 1
    print(f"[seed_event_log] Appended {written} events to {LOG_FILE}")


if __name__ == "__main__":
    main()
