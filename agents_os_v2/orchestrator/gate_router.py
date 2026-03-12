"""
Gate Router — maps gates to engines and team IDs.
S003-P001: Adds data_model validator dispatch for GATE_0, GATE_1, GATE_5.
S003-P002: Adds G3.7 test template generation dispatch.
"""

from pathlib import Path

from ..config import TEAM_ENGINE_MAP, REPO_ROOT
from ..validators.data_model import validate_spec_schema, validate_migration_file


def run_data_model_checks(gate_id: str, spec_content: str = "", spec_path: str = "") -> list:
    """
    Run data_model validator for gates that require schema/migration checks.
    Returns list of Finding. Any BLOCK stops gate progression.
    """
    if gate_id in ("GATE_0", "GATE_1"):
        return validate_spec_schema(spec_content or "", spec_path)
    if gate_id == "GATE_5":
        return validate_migration_file()
    return []


GATE_TEAM_MAP = {
    "GATE_0": "team_190",
    "GATE_1_PRODUCE": "team_170",
    "GATE_1_VALIDATE": "team_190",
    "GATE_2": "team_100",
    "GATE_3_PLAN": "team_10",
    "GATE_3_G35": "team_90",
    "GATE_3_MANDATES": "team_10",
    "GATE_4": "team_10",      # Gate owner=Team 10 per Protocol v2.3.0; Team 50 executes QA
    "GATE_5": "team_90",
    "GATE_6": "team_90",      # Gate owner=Team 90 per Protocol v2.3.0; Team 100 approval authority
    "GATE_7": "team_90",      # Gate owner=Team 90 per Protocol v2.3.0; Team 00 human authority
    "GATE_8_DOCS": "team_70",
    "GATE_8_VALIDATE": "team_90",
}


def get_engine_for_gate(gate_key: str) -> str:
    team_id = GATE_TEAM_MAP.get(gate_key, "team_10")
    return TEAM_ENGINE_MAP.get(team_id, "gemini")


def get_team_for_gate(gate_key: str) -> str:
    return GATE_TEAM_MAP.get(gate_key, "team_10")


def run_g3_7_test_template_generation(state, args, _log):
    """
    G3.7 sub-stage: Test Template Generation.
    LOD400 §5.3 — S003-P002 WP001.
    """
    from ..generators.test_templates import generate_test_templates

    spec_path = Path(state.spec_path) if getattr(state, "spec_path", "") else (
        REPO_ROOT / "agents_os_v2" / "tests" / "fixtures" / "sample_spec_with_contracts.md"
    )
    if not spec_path.exists():
        spec_path = REPO_ROOT / "agents_os_v2" / "tests" / "fixtures" / "sample_spec_with_contracts.md"

    result = generate_test_templates(
        spec_path=spec_path,
        output_base=REPO_ROOT / "tests",
        force=getattr(args, "force_generate", False),
    )
    if result.blocks:
        state.current_gate = "WAITING_FOR_SPEC_REMEDIATION"
        state.save()
        for msg in result.blocks:
            _log(f"⛔ TT-00 BLOCK: {msg}")
        return
    _log(f"G3.7 PASS: {len(result.generated_files)} test scaffold(s) generated.")
    state.advance_gate("G3.6", "PASS")
    state.save()
