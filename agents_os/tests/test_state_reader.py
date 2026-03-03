"""Tests for POC-1 Observer (State Reader)."""

import json
import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from agents_os.observers.state_reader import build_state_snapshot


def test_snapshot_schema_version():
    snap = build_state_snapshot()
    assert snap["schema_version"] == "2.0.0"


def test_snapshot_agent_role():
    snap = build_state_snapshot()
    assert snap["agent_role"] == "POC-1-OBSERVER"


def test_snapshot_read_only():
    snap = build_state_snapshot()
    assert snap["read_only"] is True
    assert snap["no_ssot_writes"] is True


def test_snapshot_has_governance():
    snap = build_state_snapshot()
    gov = snap["governance"]
    assert "master_index_path" in gov
    assert gov["master_index_path"] == "00_MASTER_INDEX.md"


def test_snapshot_has_codebase():
    snap = build_state_snapshot()
    cb = snap["codebase"]
    assert "backend" in cb
    assert "frontend" in cb
    assert "database" in cb
    assert len(cb["backend"]["models"]) > 10
    assert len(cb["backend"]["routers"]) > 10
    assert len(cb["backend"]["services"]) > 10


def test_snapshot_has_quality():
    snap = build_state_snapshot()
    q = snap["quality"]
    assert "unit_test_files" in q
    assert "has_ci_pipeline" in q


def test_snapshot_artifact_checks():
    snap = build_state_snapshot()
    checks = snap["artifact_checks"]
    assert len(checks) > 0
    for check in checks:
        assert "path" in check
        assert "exists" in check
        assert "source" in check


def test_snapshot_produced_at_iso():
    snap = build_state_snapshot()
    assert "produced_at_iso" in snap
    assert "T" in snap["produced_at_iso"]


def test_snapshot_is_json_serializable():
    snap = build_state_snapshot()
    json_str = json.dumps(snap)
    reparsed = json.loads(json_str)
    assert reparsed["schema_version"] == "2.0.0"
