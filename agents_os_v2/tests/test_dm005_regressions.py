"""DM-005 regression tests — G-11 / G-12 / G-13.

G-11: run_canary_safe.sh must complete without bash set-u crash (empty SKIP_ARGS array).
G-12: write_wsm_idle_reset() must clear all 7 COS ghost fields (no WP099 residue).
G-13: start_pipeline() must write to the domain-specific state file when
      PIPELINE_DOMAIN env var is set (agents_os → pipeline_state_agentsos.json).

These are regression guards — failure means a stabilization fix regressed.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path
from unittest.mock import patch

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
WSM_PATH = (
    REPO_ROOT
    / "documentation"
    / "docs-governance"
    / "01-FOUNDATIONS"
    / "PHOENIX_MASTER_WSM_v1.0.0.md"
)
CANARY_SCRIPT = REPO_ROOT / "scripts" / "canary_simulation" / "run_canary_safe.sh"
STATE_AGENTSOS = REPO_ROOT / "_COMMUNICATION" / "agents_os" / "pipeline_state_agentsos.json"
STATE_TIKTRACK = REPO_ROOT / "_COMMUNICATION" / "agents_os" / "pipeline_state_tiktrack.json"


# ─────────────────────────────────────────────────────────────────────────────
# G-11 — run_canary_safe.sh set-u crash regression
# ─────────────────────────────────────────────────────────────────────────────

class TestG11CanarySafeScript:
    """G-11: run_canary_safe.sh must not crash with bash set-u on empty SKIP_ARGS.

    The canary script is allowed to exit 1 when ssot_check detects WSM drift
    (that is CORRECT behavior).  The G-11 regression is specifically about bash
    crashing with "unbound variable" when SKIP_ARGS is an empty array under
    `set -u`.  Tests here verify that specific failure mode is absent.
    """

    def _run_canary(self) -> subprocess.CompletedProcess:
        return subprocess.run(
            ["bash", str(CANARY_SCRIPT)],
            cwd=str(REPO_ROOT),
            capture_output=True,
            text=True,
            timeout=120,
        )

    @pytest.mark.skipif(not CANARY_SCRIPT.exists(), reason="run_canary_safe.sh not found")
    def test_no_unbound_variable_error(self):
        """Root-cause check: bash set -u must not fire on SKIP_ARGS (G-11 root cause)."""
        result = self._run_canary()
        assert "unbound variable" not in result.stderr.lower(), (
            "bash set -u fired: unbound variable in run_canary_safe.sh\n"
            f"stderr: {result.stderr[-500:]}"
        )

    @pytest.mark.skipif(not CANARY_SCRIPT.exists(), reason="run_canary_safe.sh not found")
    def test_no_bash_crash(self):
        """Script must not crash (exit 127 = command-not-found; exit 1 = expected for drift)."""
        result = self._run_canary()
        assert result.returncode != 127, "run_canary_safe.sh crashed with command-not-found"
        # returncode 1 is acceptable — means ssot_check found drift (correct behavior)
        # returncode 0 or 1 are both valid; anything else signals a script crash
        assert result.returncode in (0, 1), (
            f"run_canary_safe.sh exited with unexpected code {result.returncode}.\n"
            f"stderr: {result.stderr[-500:]}"
        )

    @pytest.mark.skipif(not CANARY_SCRIPT.exists(), reason="run_canary_safe.sh not found")
    def test_canary_header_printed(self):
        """Script must print its header — confirms it started and ran (not bash parse error)."""
        result = self._run_canary()
        assert "Canary safe" in result.stdout or "canary" in result.stdout.lower(), (
            "run_canary_safe.sh did not print its header line — possible parse failure.\n"
            f"stdout: {result.stdout[:300]}"
        )

    @pytest.mark.skipif(not CANARY_SCRIPT.exists(), reason="run_canary_safe.sh not found")
    def test_pipeline_run_not_executed_as_subprocess(self):
        """pipeline_run.sh must NOT be executed (only mentioned in advisory text is allowed)."""
        result = self._run_canary()
        # If pipeline_run.sh was actually *executed* by the canary, it would produce
        # one of these markers in stdout.  Advisory messages from ssot_check only
        # contain "pipeline_run.sh wsm-reset" as a suggestion (not an execution).
        execution_markers = [
            "[pipeline_run]",     # prefix emitted when pipeline_run.sh actually runs
            "gate advance",
            "WSM idle-reset",     # only printed when wsm-reset subcommand executes
        ]
        stdout = result.stdout
        for marker in execution_markers:
            assert marker not in stdout, (
                f"run_canary_safe.sh appears to have executed pipeline_run.sh "
                f"(found marker: {marker!r}).\n"
                f"stdout: {stdout[:500]}"
            )


# ─────────────────────────────────────────────────────────────────────────────
# G-12 — write_wsm_idle_reset (S003-P016: function is now a no-op)
# ─────────────────────────────────────────────────────────────────────────────
# The COS section was removed from WSM in S003-P016 (Pipeline Git Isolation).
# write_wsm_idle_reset() is retained as a no-op for import compatibility.
# The original 5 field-clearing assertions are replaced by a single no-op contract test.

class TestG12WsmIdleReset:
    """G-12 (S003-P016): write_wsm_idle_reset is a no-op — COS removed from WSM."""

    def test_noop_does_not_modify_file(self):
        """write_wsm_idle_reset must not write anything to the WSM (it is a no-op)."""
        import agents_os_v2.orchestrator.wsm_writer as wsm_mod

        original_content = "## some WSM content\n\nno COS section here\n"
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".md", delete=False, encoding="utf-8"
        ) as f:
            f.write(original_content)
            tmp = Path(f.name)

        try:
            with patch.object(wsm_mod, "WSM_PATH", tmp):
                wsm_mod.write_wsm_idle_reset(
                    tt_wp="S003-P013-WP001",
                    tt_gate="COMPLETE",
                    aos_wp="S003-P015-WP001",
                    aos_gate="COMPLETE",
                )
            result = tmp.read_text(encoding="utf-8")
        finally:
            tmp.unlink(missing_ok=True)

        assert result == original_content, (
            "write_wsm_idle_reset should be a no-op (S003-P016); file must be unchanged"
        )


# ─────────────────────────────────────────────────────────────────────────────
# G-13 — start_pipeline respects PIPELINE_DOMAIN env var
# ─────────────────────────────────────────────────────────────────────────────

class TestG13StartPipelineDomain:
    """G-13: start_pipeline must write to domain-specific state file, not always tiktrack."""

    def _run_start(self, domain_env: str, wp_id: str, state_file: Path) -> dict:
        """Patch state save target and PIPELINE_DOMAIN, call start_pipeline, return saved state."""
        import agents_os_v2.orchestrator.pipeline as pipeline_mod
        from agents_os_v2.orchestrator.state import PipelineState

        captured: list[dict] = []

        original_save = PipelineState.save

        def mock_save(self_state: PipelineState) -> None:
            captured.append({
                "work_package_id": self_state.work_package_id,
                "project_domain": self_state.project_domain,
                "current_gate": self_state.current_gate,
                "stage_id": self_state.stage_id,
            })

        with (
            patch.dict(os.environ, {"PIPELINE_DOMAIN": domain_env}),
            patch.object(PipelineState, "save", mock_save),
            patch.object(pipeline_mod, "show_next", lambda s: None),
            patch(
                "agents_os_v2.observers.state_reader.main", return_value=None
            ),
        ):
            pipeline_mod.start_pipeline(
                spec=f"Test spec for domain isolation — {domain_env}",
                stage="S003",
                wp_id=wp_id,
            )

        assert captured, "start_pipeline did not call state.save()"
        return captured[0]

    def test_agents_os_domain_written(self):
        saved = self._run_start("agents_os", "S003-P015-WP001", STATE_AGENTSOS)
        assert saved["project_domain"] == "agents_os", (
            f"Expected project_domain='agents_os', got {saved['project_domain']!r}. "
            "start_pipeline is not reading PIPELINE_DOMAIN correctly."
        )

    def test_tiktrack_domain_written(self):
        saved = self._run_start("tiktrack", "S003-P004-WP001", STATE_TIKTRACK)
        assert saved["project_domain"] == "tiktrack", (
            f"Expected project_domain='tiktrack', got {saved['project_domain']!r}."
        )

    def test_gate_initialized_to_gate_0(self):
        saved = self._run_start("agents_os", "S003-P015-WP001", STATE_AGENTSOS)
        assert saved["current_gate"] == "GATE_0", (
            f"start_pipeline must initialize to GATE_0, got {saved['current_gate']!r}"
        )

    def test_wp_id_preserved(self):
        saved = self._run_start("agents_os", "S003-P015-WP001", STATE_AGENTSOS)
        assert saved["work_package_id"] == "S003-P015-WP001"

    def test_invalid_wp_format_does_not_save(self):
        """start_pipeline must reject malformed WP IDs."""
        import agents_os_v2.orchestrator.pipeline as pipeline_mod
        from agents_os_v2.orchestrator.state import PipelineState

        saved_calls: list = []

        with (
            patch.dict(os.environ, {"PIPELINE_DOMAIN": "agents_os"}),
            patch.object(PipelineState, "save", lambda s: saved_calls.append(1)),
            patch("agents_os_v2.observers.state_reader.main", return_value=None),
        ):
            pipeline_mod.start_pipeline(spec="bad wp test", stage="S003", wp_id="INVALID")

        assert saved_calls == [], "start_pipeline saved state with an invalid WP ID format"
