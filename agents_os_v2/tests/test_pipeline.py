"""Tests for Pipeline Orchestrator — state management and routing."""

import io
import os
import sys
import json
import subprocess
import tempfile
from pathlib import Path
from unittest.mock import patch

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from agents_os_v2.orchestrator.state import PipelineState
from agents_os_v2.orchestrator.gate_router import get_engine_for_gate, get_team_for_gate
from agents_os_v2.conversations.base import GateResult


class TestPipelineState:
    def test_create_default(self):
        state = PipelineState()
        assert state.current_gate == "NOT_STARTED"
        assert state.gates_completed == []

    def test_advance_gate_pass(self, tmp_path, monkeypatch):
        import agents_os_v2.orchestrator.state as state_mod
        monkeypatch.setattr(state_mod, "STATE_FILE", tmp_path / "legacy_state.json")
        monkeypatch.setattr(state_mod, "get_state_file", lambda d: tmp_path / f"pipeline_state_{d}.json")
        state = PipelineState(work_package_id="TEST-WP-001", project_domain="agents_os")
        state.advance_gate("GATE_0", "PASS")
        assert "GATE_0" in state.gates_completed
        assert state.current_gate == "GATE_0"

    def test_advance_gate_fail(self, tmp_path, monkeypatch):
        import agents_os_v2.orchestrator.state as state_mod
        monkeypatch.setattr(state_mod, "STATE_FILE", tmp_path / "legacy_state.json")
        monkeypatch.setattr(state_mod, "get_state_file", lambda d: tmp_path / f"pipeline_state_{d}.json")
        state = PipelineState(work_package_id="TEST-WP-001", project_domain="agents_os")
        state.advance_gate("GATE_0", "FAIL")
        assert "GATE_0" in state.gates_failed
        assert state.gates_completed == []

    def test_save_and_load(self, tmp_path, monkeypatch):
        import agents_os_v2.orchestrator.state as state_mod

        monkeypatch.setattr(state_mod, "STATE_FILE", tmp_path / "legacy_state.json")
        monkeypatch.setattr(state_mod, "get_state_file",
                            lambda domain: tmp_path / f"pipeline_state_{domain}.json")
        monkeypatch.setenv("PIPELINE_DOMAIN", "agents_os")

        state = PipelineState(
            work_package_id="S002-P001-WP001",
            current_gate="GATE_3",
            project_domain="agents_os",
        )
        state.save()
        loaded = PipelineState.load()
        assert loaded.work_package_id == "S002-P001-WP001"
        assert loaded.current_gate == "GATE_3"


class TestGateRouter:
    def test_gate_0_uses_openai(self):
        assert get_engine_for_gate("GATE_0") == "openai"

    def test_gate_2_uses_gemini(self):
        assert get_engine_for_gate("GATE_2") == "gemini"

    def test_gate_4_owner_is_team_10(self):
        assert get_team_for_gate("GATE_4") == "team_10"

    def test_gate_7_owner_is_team_90(self):
        assert get_team_for_gate("GATE_7") == "team_90"

    def test_gate_3_plan_uses_gemini(self):
        assert get_engine_for_gate("GATE_3_PLAN") == "gemini"

    def test_gate_5_uses_openai(self):
        assert get_engine_for_gate("GATE_5") == "openai"

    def test_gate_6_owner_is_team_90(self):
        assert get_team_for_gate("GATE_6") == "team_90"


class TestGateResult:
    def test_pass_result(self):
        r = GateResult(gate_id="GATE_0", status="PASS", next_gate="GATE_1")
        assert r.status == "PASS"
        assert r.next_gate == "GATE_1"

    def test_fail_result(self):
        r = GateResult(gate_id="GATE_5", status="FAIL", findings=[{"check": "SC-01", "message": "missing"}])
        assert r.status == "FAIL"
        assert len(r.findings) == 1


def test_store_artifact_missing_file_exits_nonzero():
    """AO2-STORE-001: --store-artifact with missing file must exit non-zero."""
    result = subprocess.run(
        [
            sys.executable, "-m", "agents_os_v2.orchestrator.pipeline",
            "--store-artifact", "GATE_1", "/tmp/definitely_does_not_exist_ao2_store.md",
        ],
        capture_output=True,
        env={**os.environ, "PIPELINE_DOMAIN": "agents_os"},
    )
    assert result.returncode != 0, (
        f"Expected non-zero exit on missing file, got {result.returncode}. "
        f"stderr: {result.stderr.decode()}"
    )


def test_store_artifact_unsupported_gate_exits_nonzero():
    """AO2-STORE-001: --store-artifact with unsupported gate must exit non-zero."""
    with tempfile.NamedTemporaryFile(suffix=".md", delete=False, mode="w") as f:
        f.write("# test content\n")
        tmp_path = f.name
    try:
        result = subprocess.run(
            [
                sys.executable, "-m", "agents_os_v2.orchestrator.pipeline",
                "--store-artifact", "GATE_999_UNSUPPORTED", tmp_path,
            ],
            capture_output=True,
            env={**os.environ, "PIPELINE_DOMAIN": "agents_os"},
        )
        assert result.returncode != 0, (
            f"Expected non-zero exit on unsupported gate, got {result.returncode}. "
            f"stderr: {result.stderr.decode()}"
        )
    finally:
        os.unlink(tmp_path)


# ── A2: Registry premature activation advisory tests ──────────────────────────


_PROG_REG_TEMPLATE = """\
| Stage | Program ID | Name | Domain | Status | Notes |
|---|---|---|---|---|---|
| S002 | S002-P005 | Test Program | AGENTS_OS | ACTIVE | {notes} |
"""

_WP_REG_EMPTY = """\
| Stage | WP ID | Status | Current Gate |
|---|---|---|---|
"""


def _make_registry_dir(tmp_path: Path, prog_notes: str) -> Path:
    """Create a minimal governance registry dir under tmp_path."""
    reg_dir = tmp_path / "documentation" / "docs-governance" / "01-FOUNDATIONS"
    reg_dir.mkdir(parents=True)
    (reg_dir / "PHOENIX_PROGRAM_REGISTRY_v1.0.0.md").write_text(
        _PROG_REG_TEMPLATE.format(notes=prog_notes), encoding="utf-8"
    )
    (reg_dir / "PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md").write_text(
        _WP_REG_EMPTY, encoding="utf-8"
    )
    return tmp_path


class TestGovernancePrecheck:
    """A2: verify _check_governance_precheck emits premature-activation advisory."""

    def _run_check(self, tmp_path: Path, prog_notes: str, wp_id: str = "S002-P005-WP003") -> tuple[list[str], str]:
        """Run precheck, return (warnings, captured_stdout)."""
        _make_registry_dir(tmp_path, prog_notes)
        state = PipelineState(
            work_package_id=wp_id,
            project_domain="agents_os",
            current_gate="GATE_0",
        )
        import agents_os_v2.orchestrator.pipeline as _pipe
        captured = io.StringIO()
        with patch.object(_pipe, "REPO_ROOT", tmp_path), \
             patch("sys.stdout", captured):
            warnings = _pipe._check_governance_precheck(state)
        return warnings, captured.getvalue()

    def test_a2_premature_activation_triggers_advisory(self, tmp_path):
        """A2: notes saying 'WP003 activated' emit advisory (no hard block)."""
        _warnings, stdout = self._run_check(
            tmp_path,
            prog_notes="WP003 (Governance) — activated 2026-03-16"
        )
        assert "advisory A2" in stdout, (
            "Expected A2 advisory in log output when notes say 'activated'. "
            f"Got stdout: {stdout!r}"
        )

    def test_a2_no_advisory_when_notes_say_pending(self, tmp_path):
        """A2: notes saying 'pending GATE_0 validation' must NOT trigger advisory."""
        _warnings, stdout = self._run_check(
            tmp_path,
            prog_notes="WP003 (Governance) — pending GATE_0 validation; WP002 closed GATE_8 PASS"
        )
        assert "advisory A2" not in stdout, (
            "A2 advisory must NOT fire when notes say 'pending'. "
            f"Got stdout: {stdout!r}"
        )

    def test_a2_no_advisory_when_wp_not_mentioned(self, tmp_path):
        """A2: no advisory when current WP is not referenced in notes at all."""
        _warnings, stdout = self._run_check(
            tmp_path,
            prog_notes="WP002 closed GATE_8 PASS 2026-03-15; activated earlier",
            wp_id="S002-P005-WP003"
        )
        # WP003 not mentioned in notes → no advisory
        assert "advisory A2" not in stdout, (
            "A2 advisory must NOT fire when WP ID is absent from notes. "
            f"Got stdout: {stdout!r}"
        )

    def test_a2_no_hard_block_returned(self, tmp_path):
        """A2 advisory must never add to the warnings list (no hard block)."""
        warnings, _stdout = self._run_check(
            tmp_path,
            prog_notes="WP003 (Governance) — activated 2026-03-16"
        )
        # GOVERNANCE-01 check: S002-P005 found with status=ACTIVE → no block
        assert warnings == [], (
            f"A2 must not add a hard block to warnings. Got: {warnings}"
        )


# ── GATE_0 correction cycle tests ─────────────────────────────────────────────


class TestGate0CorrectionCycle:
    """Verify GATE_0 prompt includes correction notice on repeated failures."""

    def _make_state_with_fails(self, fail_count: int) -> PipelineState:
        return PipelineState(
            work_package_id="S002-P005-WP003",
            project_domain="agents_os",
            current_gate="GATE_0",
            spec_brief="AOS State Alignment & Governance Integrity",
            spec_path="_COMMUNICATION/team_100/TEAM_100_AGENTS_OS_STATE_ALIGNMENT_WP003_LOD200_v1.0.0.md",
            gates_failed=["GATE_0"] * fail_count,
        )

    def test_correction_notice_absent_on_first_run(self, tmp_path, monkeypatch):
        """No correction notice when GATE_0 has not yet failed."""
        import agents_os_v2.orchestrator.pipeline as _pipe
        state = self._make_state_with_fails(0)
        monkeypatch.setattr(_pipe, "REPO_ROOT", tmp_path)
        monkeypatch.setattr(_pipe, "build_state_summary", lambda: "*(mock state summary)*")
        prompt = _pipe._generate_gate_0_prompt(state)
        assert "CORRECTION CYCLE" not in prompt, (
            "Correction notice must NOT appear on first run (fail_count=0)"
        )

    def test_correction_notice_present_after_one_fail(self, tmp_path, monkeypatch):
        """Correction notice appears when GATE_0 has failed once."""
        import agents_os_v2.orchestrator.pipeline as _pipe
        state = self._make_state_with_fails(1)
        monkeypatch.setattr(_pipe, "REPO_ROOT", tmp_path)
        monkeypatch.setattr(_pipe, "build_state_summary", lambda: "*(mock state summary)*")
        prompt = _pipe._generate_gate_0_prompt(state)
        assert "CORRECTION CYCLE #1" in prompt, (
            "Expected 'CORRECTION CYCLE #1' in prompt after one GATE_0 fail"
        )

    def test_correction_notice_embeds_bf_findings_from_verdict_file(self, tmp_path, monkeypatch):
        """BF-NN findings from Team 190 verdict file are injected into correction prompt."""
        import agents_os_v2.orchestrator.pipeline as _pipe
        # Create a fake Team 190 verdict file with BF findings
        team190_dir = tmp_path / "_COMMUNICATION" / "team_190"
        team190_dir.mkdir(parents=True)
        verdict = team190_dir / "TEAM_190_S002_P005_WP003_GATE_0_VALIDATION_v1.0.0.md"
        verdict.write_text(
            "gate_id: GATE_0\n"
            "decision: BLOCK_FOR_FIX\n"
            "blocking_findings:\n"
            "  - BF-01: Test finding one | evidence: some/file.md:10\n"
            "  - BF-02: Test finding two | evidence: other/file.md:20\n",
            encoding="utf-8"
        )
        state = self._make_state_with_fails(1)
        monkeypatch.setattr(_pipe, "REPO_ROOT", tmp_path)
        monkeypatch.setattr(_pipe, "build_state_summary", lambda: "*(mock state summary)*")
        prompt = _pipe._generate_gate_0_prompt(state)
        assert "BF-01" in prompt, "BF-01 finding must be injected into correction prompt"
        assert "BF-02" in prompt, "BF-02 finding must be injected into correction prompt"

    def test_wsm_guidance_present_in_gate0_prompt(self, tmp_path, monkeypatch):
        """GATE_0 prompt always includes WSM pre-GATE_0 guidance for Team 190."""
        import agents_os_v2.orchestrator.pipeline as _pipe
        state = self._make_state_with_fails(0)
        monkeypatch.setattr(_pipe, "REPO_ROOT", tmp_path)
        monkeypatch.setattr(_pipe, "build_state_summary", lambda: "*(mock state summary)*")
        prompt = _pipe._generate_gate_0_prompt(state)
        assert "NOT updated until GATE_3" in prompt, (
            "WSM pre-activation guidance must always be present in GATE_0 prompt"
        )
        assert "absent WP Registry entry is NOT a blocking finding" in prompt, (
            "WP Registry absence guidance must always be present in GATE_0 prompt"
        )
