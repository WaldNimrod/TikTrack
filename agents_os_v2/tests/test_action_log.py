"""Tests for agents_os_v2.orchestrator.action_log.

Covers:
  - is_enabled() flag logic (PIPELINE_ACTION_LOG env var)
  - append_action() writes correct JSONL record
  - Record contains all required fields with correct types
  - Timestamp format (ISO-8601 Z-suffix)
  - Multiple records appended correctly (one per line)
  - Disabled flag suppresses all writes
  - Non-blocking: bad path / permission error never raises
  - Empty / None details defaults to {}
"""
import json
import re
from pathlib import Path

import pytest

from agents_os_v2.orchestrator import action_log as al


# ── is_enabled ────────────────────────────────────────────────────────────────

class TestIsEnabled:
    def test_default_enabled_when_env_absent(self, monkeypatch):
        monkeypatch.delenv(al.ACTION_LOG_ENV, raising=False)
        assert al.is_enabled() is True

    def test_disabled_when_env_is_zero(self, monkeypatch):
        monkeypatch.setenv(al.ACTION_LOG_ENV, "0")
        assert al.is_enabled() is False

    def test_enabled_when_env_is_one(self, monkeypatch):
        monkeypatch.setenv(al.ACTION_LOG_ENV, "1")
        assert al.is_enabled() is True

    def test_enabled_for_any_non_zero_value(self, monkeypatch):
        for val in ("true", "yes", "on", "2", "false"):
            monkeypatch.setenv(al.ACTION_LOG_ENV, val)
            assert al.is_enabled() is True, f"Expected enabled for PIPELINE_ACTION_LOG={val!r}"


# ── append_action: record structure ───────────────────────────────────────────

class TestAppendActionStructure:
    def test_writes_one_jsonl_line(self, tmp_path, monkeypatch):
        monkeypatch.delenv(al.ACTION_LOG_ENV, raising=False)
        log = tmp_path / "actions.jsonl"
        al.append_action("GATE_PASS", log_path=log)
        lines = log.read_text().strip().splitlines()
        assert len(lines) == 1

    def test_record_is_valid_json(self, tmp_path, monkeypatch):
        monkeypatch.delenv(al.ACTION_LOG_ENV, raising=False)
        log = tmp_path / "actions.jsonl"
        al.append_action("WSM_RESET", log_path=log)
        json.loads(log.read_text().strip())  # must not raise

    def test_all_required_fields_present(self, tmp_path, monkeypatch):
        monkeypatch.delenv(al.ACTION_LOG_ENV, raising=False)
        log = tmp_path / "actions.jsonl"
        al.append_action("GATE_FAIL", log_path=log)
        record = json.loads(log.read_text().strip())
        required = {"ts", "action_type", "domain", "wp", "gate", "phase", "actor", "details"}
        assert required.issubset(record.keys())

    def test_ts_is_iso8601_z_format(self, tmp_path, monkeypatch):
        monkeypatch.delenv(al.ACTION_LOG_ENV, raising=False)
        log = tmp_path / "actions.jsonl"
        al.append_action("GATE_PASS", log_path=log)
        record = json.loads(log.read_text().strip())
        assert re.match(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$", record["ts"])

    def test_fields_match_arguments(self, tmp_path, monkeypatch):
        monkeypatch.delenv(al.ACTION_LOG_ENV, raising=False)
        log = tmp_path / "actions.jsonl"
        al.append_action(
            "GATE_PASS",
            domain="tiktrack",
            wp="S003-P004-WP001",
            gate="GATE_2",
            phase="2.3",
            actor="pipeline_run.sh",
            details={"finding_type": "doc"},
            log_path=log,
        )
        r = json.loads(log.read_text().strip())
        assert r["action_type"] == "GATE_PASS"
        assert r["domain"] == "tiktrack"
        assert r["wp"] == "S003-P004-WP001"
        assert r["gate"] == "GATE_2"
        assert r["phase"] == "2.3"
        assert r["actor"] == "pipeline_run.sh"
        assert r["details"] == {"finding_type": "doc"}

    def test_details_defaults_to_empty_dict(self, tmp_path, monkeypatch):
        monkeypatch.delenv(al.ACTION_LOG_ENV, raising=False)
        log = tmp_path / "actions.jsonl"
        al.append_action("WSM_RESET", log_path=log)
        r = json.loads(log.read_text().strip())
        assert r["details"] == {}

    def test_none_details_stored_as_empty_dict(self, tmp_path, monkeypatch):
        monkeypatch.delenv(al.ACTION_LOG_ENV, raising=False)
        log = tmp_path / "actions.jsonl"
        al.append_action("WSM_RESET", details=None, log_path=log)
        r = json.loads(log.read_text().strip())
        assert r["details"] == {}


# ── append_action: multiple records ───────────────────────────────────────────

class TestAppendMultipleRecords:
    def test_three_records_produce_three_lines(self, tmp_path, monkeypatch):
        monkeypatch.delenv(al.ACTION_LOG_ENV, raising=False)
        log = tmp_path / "actions.jsonl"
        al.append_action("GATE_PASS", gate="GATE_1", log_path=log)
        al.append_action("GATE_PASS", gate="GATE_2", log_path=log)
        al.append_action("WSM_RESET", log_path=log)
        lines = log.read_text().strip().splitlines()
        assert len(lines) == 3

    def test_records_appear_in_insertion_order(self, tmp_path, monkeypatch):
        monkeypatch.delenv(al.ACTION_LOG_ENV, raising=False)
        log = tmp_path / "actions.jsonl"
        al.append_action("GATE_PASS",  gate="GATE_1", log_path=log)
        al.append_action("GATE_FAIL",  gate="GATE_2", log_path=log)
        al.append_action("WSM_RESET",               log_path=log)
        lines = log.read_text().strip().splitlines()
        assert json.loads(lines[0])["gate"] == "GATE_1"
        assert json.loads(lines[1])["action_type"] == "GATE_FAIL"
        assert json.loads(lines[2])["action_type"] == "WSM_RESET"

    def test_each_line_is_independent_valid_json(self, tmp_path, monkeypatch):
        monkeypatch.delenv(al.ACTION_LOG_ENV, raising=False)
        log = tmp_path / "actions.jsonl"
        for i in range(5):
            al.append_action("GATE_PASS", gate=f"GATE_{i}", log_path=log)
        for line in log.read_text().strip().splitlines():
            json.loads(line)  # must not raise


# ── disabled flag ─────────────────────────────────────────────────────────────

class TestDisabledFlag:
    def test_no_file_created_when_disabled(self, tmp_path, monkeypatch):
        monkeypatch.setenv(al.ACTION_LOG_ENV, "0")
        log = tmp_path / "actions.jsonl"
        al.append_action("GATE_PASS", gate="GATE_1", log_path=log)
        assert not log.exists()

    def test_no_write_to_existing_file_when_disabled(self, tmp_path, monkeypatch):
        monkeypatch.setenv(al.ACTION_LOG_ENV, "0")
        log = tmp_path / "actions.jsonl"
        log.write_text("")  # pre-create empty file
        al.append_action("GATE_PASS", log_path=log)
        assert log.read_text() == ""

    def test_disabled_does_not_raise(self, tmp_path, monkeypatch):
        monkeypatch.setenv(al.ACTION_LOG_ENV, "0")
        log = tmp_path / "actions.jsonl"
        al.append_action("GATE_PASS", log_path=log)  # must not raise


# ── non-blocking guarantee ────────────────────────────────────────────────────

class TestNonBlocking:
    def test_bad_path_does_not_raise(self, monkeypatch):
        monkeypatch.delenv(al.ACTION_LOG_ENV, raising=False)
        bad = Path("/root/__totally_nonexistent_dir_xyz_abc/actions.jsonl")
        al.append_action("GATE_PASS", log_path=bad)  # must not raise

    def test_returns_none_always(self, tmp_path, monkeypatch):
        monkeypatch.delenv(al.ACTION_LOG_ENV, raising=False)
        log = tmp_path / "actions.jsonl"
        result = al.append_action("GATE_PASS", log_path=log)
        assert result is None

    def test_empty_action_type_does_not_raise(self, tmp_path, monkeypatch):
        monkeypatch.delenv(al.ACTION_LOG_ENV, raising=False)
        log = tmp_path / "actions.jsonl"
        al.append_action("", log_path=log)  # must not raise; empty string is valid
        r = json.loads(log.read_text().strip())
        assert r["action_type"] == ""
