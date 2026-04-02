"""WP004 — CI Quality Foundation (KB-65..69, Team 50 R1..R5)."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path
from unittest.mock import patch

import pytest
import yaml

try:
    import jsonschema
except ImportError:  # pragma: no cover
    jsonschema = None

REPO_ROOT = Path(__file__).resolve().parents[2]
SCHEMA_DIR = REPO_ROOT / "agents_os_v2" / "schemas"
STATE_SCHEMA = SCHEMA_DIR / "pipeline_state_ui_contract.json"
EVENT_SCHEMA = SCHEMA_DIR / "event_contract.json"
GATES_YAML = REPO_ROOT / "agents_os_v2" / "ssot" / "gates.yaml"
GEN_JS = REPO_ROOT / "agents_os" / "ui" / "js" / "pipeline-gate-map.generated.js"
PIPELINE_STATE_AGENTS = (
    REPO_ROOT / "_COMMUNICATION" / "agents_os" / "pipeline_state_agentsos.json"
)
PIPELINE_STATE_TT = REPO_ROOT / "_COMMUNICATION" / "agents_os" / "pipeline_state_tiktrack.json"
EVENTS_LOG = REPO_ROOT / "_COMMUNICATION" / "agents_os" / "logs" / "pipeline_events.jsonl"


@pytest.mark.skipif(jsonschema is None, reason="jsonschema required for WP004 schema tests")
class TestWp004Schemas:
    def test_pipeline_state_agents_os_validates(self):
        schema = json.loads(STATE_SCHEMA.read_text(encoding="utf-8"))
        data = json.loads(PIPELINE_STATE_AGENTS.read_text(encoding="utf-8"))
        jsonschema.validate(instance=data, schema=schema)

    def test_pipeline_state_tiktrack_validates(self):
        schema = json.loads(STATE_SCHEMA.read_text(encoding="utf-8"))
        data = json.loads(PIPELINE_STATE_TT.read_text(encoding="utf-8"))
        jsonschema.validate(instance=data, schema=schema)

    def test_pipeline_state_rejects_missing_required(self):
        schema = json.loads(STATE_SCHEMA.read_text(encoding="utf-8"))
        bad = {"project_domain": "x"}
        with pytest.raises(jsonschema.ValidationError):
            jsonschema.validate(instance=bad, schema=schema)

    def test_event_line_from_jsonl_validates(self):
        schema = json.loads(EVENT_SCHEMA.read_text(encoding="utf-8"))
        line = EVENTS_LOG.read_text(encoding="utf-8").strip().splitlines()[0]
        obj = json.loads(line)
        jsonschema.validate(instance=obj, schema=schema)


class TestWp004GatesYaml:
    def test_yaml_matches_gate_mapping_module(self):
        from agents_os_v2.ssot.gate_mapping import GATE_ALIASES

        raw = yaml.safe_load(GATES_YAML.read_text(encoding="utf-8"))
        expect = {str(k): str(v) for k, v in (raw["legacy_to_canonical"] or {}).items()}
        assert GATE_ALIASES == expect

    def test_generated_js_matches_gate_aliases(self):
        from agents_os_v2.ssot.gate_mapping import GATE_ALIASES

        text = GEN_JS.read_text(encoding="utf-8")
        m = re.search(r"window\.__PHOENIX_LEGACY_GATE_MAP\s*=\s*(\{[^;]+\});", text, re.S)
        assert m, "generated JS missing map"
        js_obj = json.loads(m.group(1))
        assert js_obj == GATE_ALIASES


class TestWp004SsotCheck:
    def test_ssot_check_exits_1_on_drift(self):
        from agents_os_v2.tools import ssot_check

        with patch.object(ssot_check, "run_check", return_value=(False, ["forced drift"])):
            rc = ssot_check.main(["--domain", "tiktrack"])
        assert rc == 1

    def test_ssot_check_exits_0_when_consistent(self):
        from agents_os_v2.tools import ssot_check

        with patch.object(ssot_check, "run_check", return_value=(True, [])):
            rc = ssot_check.main(["--domain", "tiktrack"])
        assert rc == 0


class TestWp004ScenarioHarness:
    def test_harness_zero_failures(self):
        from agents_os_v2.tools.pipeline_scenario_harness import run_all

        n, msgs = run_all()
        assert n == 0, msgs


class TestWp004LegacyStateReader:
    def test_legacy_import_emits_deprecation(self):
        r = subprocess.run(
            [
                sys.executable,
                "-W",
                "default",
                "-c",
                "import agents_os.observers.state_reader",
            ],
            cwd=str(REPO_ROOT),
            capture_output=True,
            text=True,
        )
        combined = (r.stderr or "") + (r.stdout or "")
        assert "deprecated" in combined.lower() or "DeprecationWarning" in combined


class TestWp004CodegenScript:
    def test_generate_gate_map_assets_script_runs(self):
        script = REPO_ROOT / "agents_os_v2" / "tools" / "generate_gate_map_assets.py"
        r = subprocess.run(
            [sys.executable, str(script)],
            cwd=str(REPO_ROOT),
            capture_output=True,
            text=True,
        )
        assert r.returncode == 0, r.stderr + r.stdout


class TestWp004ResolvePhaseOwner:
    def test_kb42_tiktrack_track_full_gate_3_2(self):
        from agents_os_v2.orchestrator.pipeline import _resolve_phase_owner

        result = _resolve_phase_owner("tiktrack", "TRACK_FULL", "GATE_3", "3.2")
        assert "team_60" in result.lower()
