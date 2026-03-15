# Agents OS Review Method

Use this workflow when executing a deep review with `$agents-os-review`.

## 1. Frame the Review

- Identify the reviewing team and date.
- Read the active canon:
  - `.cursorrules`
  - `00_MASTER_INDEX.md`
  - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
  - `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`
  - `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md`
- State the review objective in one sentence:
  - What part of Agents OS is being evaluated
  - Whether the review is full-system or scoped
  - Which outputs are required

## 2. Create the Dated Review Pack

Run:

```bash
python3 skills/agents-os-review/scripts/init_review_bundle.py \
  --team-id 61 \
  --review-slug pipeline-governance
```

Use `--date YYYY-MM-DD` only when backfilling or reproducing an older scan.

## 3. Build the Layered Model

Inspect the system through this ladder:

- `L0 Concept`: Does the system reduce coordination cost for one human while preserving governance?
- `L1 Capability`: Are pipeline, governance, evidence, and UI surfaces complete and coherent?
- `L2 Process`: Are gate transitions, ownership, fail routes, and promotion paths deterministic?
- `L3 Interface`: Do dashboard, roadmap, and teams pages expose the real system state and valid commands?
- `L4 Architecture`: Do orchestrator, validators, state readers, and scripts match the documented model?
- `L5 Module`: Are responsibilities clearly split across `agents_os_v2/`, `agents_os/`, `_COMMUNICATION/`, and documentation?
- `L6 Function`: Are individual functions, commands, and field names correct, safe, and internally consistent?

Record observations in `notes/` before converting them into findings.

## 4. Execute the Three Main Review Tracks

### Track A: Pipeline and Gate Flow

Inspect at minimum:

- `agents_os_v2/orchestrator/pipeline.py`
- `agents_os_v2/orchestrator/state.py`
- `agents_os_v2/orchestrator/gate_router.py`
- `agents_os_v2/context/injection.py`
- `agents_os_v2/context/governance/gate_rules.md`
- `pipeline_run.sh`
- `_COMMUNICATION/agents_os/pipeline_state*.json`

Focus on:

- Gate order and fail-routing correctness
- Domain-aware owner overrides
- Prompt generation and storage paths
- Alignment between WSM operational truth and runtime state files
- Legacy fallbacks and whether they are surfaced honestly

Useful commands:

```bash
python3 -m agents_os_v2.orchestrator.pipeline --status
python3 -m agents_os_v2.orchestrator.pipeline --next
python3 -m pytest agents_os_v2/tests/ -v -k "not OpenAI and not Gemini"
```

### Track B: Server, Governance, and Documentation

Inspect at minimum:

- `agents_os_v2/validators/`
- `agents_os_v2/mcp/evidence_validator.py`
- `agents_os_v2/mcp/test_scenarios.py`
- `agents_os/scripts/`
- `documentation/docs-governance/`
- `agents_os/docs-governance/`
- `agents_os_v2/PHASE_6_LOCAL_SETUP_GUIDE.md`

Focus on:

- Canonical-vs-operational path discipline
- State and evidence contracts
- Future-plan documents that have become stale
- Documentation claims that no longer match code
- Legacy `agents_os/` behavior that still influences operators

Useful commands:

```bash
python3 -m pytest agents_os/tests/ -v
python3 -m pytest agents_os_v2/tests/test_mcp.py -v
rg -n "PASS_WITH_ACTION|LEGACY_FALLBACK|GATE_8|Team 51|Team 70|Team 90" agents_os agents_os_v2 documentation _COMMUNICATION
```

### Track C: UI Surfaces

Inspect at minimum:

- `agents_os/ui/PIPELINE_DASHBOARD.html`
- `agents_os/ui/PIPELINE_ROADMAP.html`
- `agents_os/ui/PIPELINE_TEAMS.html`
- `agents_os/ui/js/pipeline-dashboard.js`
- `agents_os/ui/js/pipeline-roadmap.js`
- `agents_os/ui/js/pipeline-teams.js`
- `agents_os/ui/js/pipeline-config.js`
- `agents_os/ui/docs/PIPELINE_DASHBOARD_UI_REGISTRY_v1.0.0.md`

Focus on:

- Whether the UI exposes true runtime state
- Whether copied commands are valid now, scaffold-only, or stale
- Whether documentation registry entries match actual UI behavior
- Whether the UI distinguishes active capability from future capability

Useful commands:

```bash
./agents_os/scripts/start_ui_server.sh 8090
curl -s http://localhost:8090/agents_os/ui/PIPELINE_DASHBOARD.html
curl -s http://localhost:8090/agents_os/ui/js/pipeline-dashboard.js
```

If browser or MCP tooling is available, also exercise the dashboard, roadmap, and teams page visually.

## 5. Run E2E and Operational Checks

When the environment allows it, start the stack and perform browser-level checks.

Backend and frontend helpers:

```bash
bash scripts/start-backend.sh
bash scripts/start-frontend.sh
```

Verify:

- Backend health on `http://localhost:8082/health`
- Frontend on `http://localhost:8080`
- Agents OS UI pages on the local UI server
- MCP scenarios align with actual routes, labels, and workflows

If a service cannot be started, document the limitation in the summary and continue with static analysis.

## 6. Perform Documentation-to-Code Gap Analysis

For every major behavior, ask:

- Which document claims this behavior?
- Which code path implements it?
- Which UI or runtime artifact exposes it?
- Which test, scenario, or state file validates it?

Escalate mismatches when:

- The docs describe a feature that is scaffold-only
- The code implements behavior that the governance model forbids
- Runtime paths differ from canonical paths
- UI copy suggests commands or flows that do not exist

## 7. Write the Report Pack

Follow `references/report-pack.md`.

Writing rules:

- Put findings before narrative summary.
- Order findings by severity.
- Use concrete file paths and command evidence.
- Separate observed fact from inferred conclusion.
- End with architectural conclusions and immediate actions.

## 8. Minimum Closure Standard

Do not call the review complete until the bundle contains:

- An executive summary
- Three main review documents
- A doc-code gap analysis
- Architectural and conceptual conclusions
- A critical immediate action list
- Raw evidence folders, even if some are empty and explicitly marked as such
