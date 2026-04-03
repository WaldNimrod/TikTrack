---
id: TEAM_101_SIMULATION_TEST_CATALOG_v1.0.0
historical_record: true
owner: Team 101
date: 2026-03-23
status: ACTIVE---

# Canary simulation — test catalog

Single index for Layer 1 (check-only), Layer 2 (Selenium), Phase B, and CLI guards.

**מסמך אימות מלא (תוצאות ריצה + MCP + פערים):** [`TEAM_101_CANARY_SIMULATION_IMPLEMENTATION_AND_VERIFICATION_REPORT_v1.0.0.md`](TEAM_101_CANARY_SIMULATION_IMPLEMENTATION_AND_VERIFICATION_REPORT_v1.0.0.md)

**מחקר פערים + חבילת עבודה (P0–P2):** [`TEAM_101_PIPELINE_SIMULATION_RESEARCH_GAP_ANALYSIS_v1.0.0.md`](TEAM_101_PIPELINE_SIMULATION_RESEARCH_GAP_ANALYSIS_v1.0.0.md) · נתונים: [`research/COVERAGE_AND_GAPS_EXPORT_v1.0.0.json`](research/COVERAGE_AND_GAPS_EXPORT_v1.0.0.json)

## Layer 1 — fast gate (CI / pre-Selenium)

| ID | What | Command | PASS criterion |
|----|------|---------|------------------|
| L1-SSOT | TikTrack pipeline vs WSM parallel row | `PYTHONPATH=. python3 -m agents_os_v2.tools.ssot_check --domain tiktrack` | Exit 0 |
| L1-MOCKS | Mock mirror + minimal PASS/JSON | `PYTHONPATH=. python3 scripts/canary_simulation/verify_layer1.py --wp S003-P013-WP002` | Exit 0 |
| L1-MOCKS-B | Phase B fixture markers | `PYTHONPATH=. python3 scripts/canary_simulation/verify_layer1.py --wp S003-P013-WP002 --phase-b` | Exit 0 |

**Generator (before L1-MOCKS):** `python3 scripts/canary_simulation/generate_mocks.py --wp S003-P013-WP002`  
The mirror output lives under `simulation_mocks/<WP>/mirror/` (gitignored); CI regenerates it each run.

**Optional deploy to canonical paths (operator):** `python3 scripts/canary_simulation/generate_mocks.py --wp S003-P013-WP002 --deploy`

## Layer 2 — dashboard (8090 + Selenium)

| ID | What | Command | PASS criterion |
|----|------|---------|------------------|
| L2-SMOKE | Baseline dashboard load | `cd tests && HEADLESS=true npm run test:pipeline-dashboard-smoke` | `PIPELINE_DASHBOARD_SMOKE: PASS` |
| L2-PHASE-A | WP strip, gate pill, file list rows | `cd tests && HEADLESS=true npm run test:pipeline-dashboard-phase-a` | `PIPELINE_PHASE_A: PASS` |

**Prerequisite:** `./agents_os/scripts/start_ui_server.sh` (port **8090** locked).

**Evidence (optional):** `SAVE_PIPELINE_EVIDENCE=1` with `tests/pipeline-dashboard-phase-a.e2e.test.js` → `_COMMUNICATION/team_101/TEAM_101_SIMULATION_EVIDENCE_S003-P013-WP002/`.

## Layer 3 — MCP browser (spot / HRC)

| ID | What | When | Notes |
|----|------|------|--------|
| L3-MCP-SMOKE | Snapshot דשבורד 8090 | אחרי Selenium או לפי demand | אימות DOM/accessibility; ראו דוח האימות §5 |

## Phase B scenarios

| ID | Scenario | Layer | Command / method |
|----|----------|-------|-------------------|
| PB-B1 | GATE_3 BLOCK + remediation | 1 (fixtures) + manual/2 | Fixtures: `simulation_mocks/phase_b/B1_*`; full loop: `pipeline_run.sh fail …` (operator, not default CI) |
| PB-B2 | GATE_5 doc route | 1 (fixtures) | `B2_TEAM_70_DOC_route_sample.md` |
| PB-B3 | HRC 4.3 bulk / mixed verdicts | 3 (MCP / manual) | Cursor browser MCP; see mandate §4 Phase B |
| PB-B4 | KB-84 wrong `--wp` | CLI | `cd tests && node pipeline-kb84-cli.test.js` |

## Reference docs

- Gate map: `TEAM_101_SIMULATION_GATE_PHASE_MAP_v1.0.0.md`
- WP alignment: `TEAM_101_SIMULATION_WP_REGISTRY_ALIGNMENT_v1.0.0.md`
- Mandate: `TEAM_100_TO_TEAM_101_CANARY_SIMULATION_MANDATE_v1.0.0.md`
- Gateway handoff (Constitution + simulation re-verify): `TEAM_101_TO_TEAM_100_CONSTITUTION_AND_SIMULATION_CLOSURE_PACKAGE_v1.0.0.md`

**log_entry | TEAM_101 | SIMULATION_TEST_CATALOG | 2026-03-23**
