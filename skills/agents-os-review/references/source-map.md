# Agents OS Source Map

Use this file to find the real review surfaces quickly. Prefer these paths over ad-hoc discovery.

## Canon and Governance

- `.cursorrules`
- `00_MASTER_INDEX.md`
- `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
- `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`
- `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md`

## Active V2 Runtime

- `agents_os_v2/orchestrator/pipeline.py`
- `agents_os_v2/orchestrator/state.py`
- `agents_os_v2/orchestrator/gate_router.py`
- `agents_os_v2/config.py`
- `agents_os_v2/context/injection.py`
- `agents_os_v2/context/governance/gate_rules.md`
- `agents_os_v2/context/identity/team_*.md`
- `agents_os_v2/validators/`
- `agents_os_v2/mcp/test_scenarios.py`
- `agents_os_v2/mcp/evidence_validator.py`
- `agents_os_v2/tests/`

## Legacy and Transitional Agents OS Surfaces

- `agents_os/README.md`
- `agents_os/orchestrator/validation_runner.py`
- `agents_os/validators/`
- `agents_os/llm_gate/quality_judge.py`
- `agents_os/docs-governance/`
- `agents_os/tests/`

Use these paths to detect drift between the current V2 model and older operator-facing artifacts.

## UI Surfaces

- `agents_os/ui/PIPELINE_DASHBOARD.html`
- `agents_os/ui/PIPELINE_ROADMAP.html`
- `agents_os/ui/PIPELINE_TEAMS.html`
- `agents_os/ui/js/pipeline-dashboard.js`
- `agents_os/ui/js/pipeline-roadmap.js`
- `agents_os/ui/js/pipeline-teams.js`
- `agents_os/ui/js/pipeline-state.js`
- `agents_os/ui/js/pipeline-commands.js`
- `agents_os/ui/js/pipeline-config.js`
- `agents_os/ui/css/pipeline-dashboard.css`
- `agents_os/ui/css/pipeline-roadmap.css`
- `agents_os/ui/css/pipeline-teams.css`
- `agents_os/ui/docs/PIPELINE_DASHBOARD_UI_REGISTRY_v1.0.0.md`

## Operational Shell Helpers

- `pipeline_run.sh`
- `agents_os/scripts/start_ui_server.sh`
- `agents_os/scripts/stop_ui_server.sh`
- `agents_os/scripts/init_pipeline.sh`
- `scripts/start-backend.sh`
- `scripts/stop-backend.sh`
- `scripts/start-frontend.sh`
- `scripts/stop-frontend.sh`
- `scripts/init-servers-for-qa.sh`

## Runtime State and Generated Artifacts

- `_COMMUNICATION/agents_os/pipeline_state.json`
- `_COMMUNICATION/agents_os/pipeline_state_agentsos.json`
- `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json`
- `_COMMUNICATION/agents_os/STATE_SNAPSHOT.json`
- `_COMMUNICATION/agents_os/prompts/`

## Review Output Location

Create review artifacts under:

- `_COMMUNICATION/team_<reviewer_team>/agents_os_review/<YYYY-MM-DD>_<slug>/`

Do not write directly into canonical `documentation/` as part of a review run unless the active team is authorized to promote canon.

## High-Yield Search Patterns

Use these patterns with `rg` to find drift fast:

```bash
rg -n "GATE_0|GATE_1|GATE_2|GATE_8|WAITING_GATE6_APPROVAL" agents_os agents_os_v2 documentation _COMMUNICATION
rg -n "PASS_WITH_ACTION|LEGACY_FALLBACK|pending_actions|phase8_content|lld400_content" agents_os agents_os_v2 _COMMUNICATION
rg -n "Team 51|Team 61|Team 70|Team 90|Team 100|Team 170|Team 190" agents_os agents_os_v2 documentation _COMMUNICATION
rg -n "pipeline_state|STATE_SNAPSHOT|prompts/" agents_os agents_os_v2 _COMMUNICATION
```
