date: 2026-03-23
historical_record: true

⛔ **OPERATOR-ONLY — DO NOT TOUCH PIPELINE CLI**

⛔ DO NOT run `./pipeline_run.sh` or any pipeline CLI command.
⛔ DO NOT advance the gate or modify pipeline state.
✅ Save your artifact to the canonical path below.
✅ Notify Nimrod. Nimrod runs all pipeline commands.

---

## Identity Header (mandatory on all deliverables)

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| work_package_id | S003-P014-WP001 |
| gate_id | GATE_4 |
| project_domain | tiktrack |
| process_variant | TRACK_FOCUSED |

# GATE_4 — QA (Cursor Composer + MCP)

**QA owner:** `team_50` (AOS TRACK_FOCUSED → team_51; TikTrack TRACK_FULL → team_50)

**process_variant:** `TRACK_FOCUSED`  |  **work_package_id:** `S003-P014-WP001`

## WP spec brief (LOD200 scope)

SIMULATION S003-P014-WP001 — operator E2E dry-run; no product delivery.

## LOD200 / LLD400 excerpt (acceptance criteria)

# LLD400 (simulation) — S003-P014-WP001

**gate:** GATE_1 | **wp:** S003-P014-WP001 | **stage:** S003 | **domain:** tiktrack | **date:** 2026-03-23

Minimal specification artifact for **operator E2E simulation** only. No production API or schema change.

## Scope

- Dummy feature: no code change required for simulation.
- Acceptance: pipeline advances through GATE_0–GATE_5 with stored state only.

## Contract

- No new endpoints. No DB migrations.

**log_entry | TEAM_101 | SIM_LLD400 | E2E_DRY_RUN | 2026-03-23**

## D-pages (TikTrack UI surface)

| Page | URL |
|---|---|
| D15 | `http://localhost:8080/` |
| D16 | `http://localhost:8080/trading_accounts` |
| D18 | `http://localhost:8080/brokers_fees` |
| D21 | `http://localhost:8080/cash_flows` |
| D22 | `http://localhost:8080/tickers` |
| D23 | `http://localhost:8080/data_dashboard` |
| D24 | `http://localhost:8080/trade_plans` |
| D25 | `http://localhost:8080/ai_analysis` |
| D29 | `http://localhost:8080/trade_plans` |
| D31 | `http://localhost:8080/executions` |
| D33 | `http://localhost:8080/user_tickers` |
| D34 | `http://localhost:8080/alerts` |
| D35 | `http://localhost:8080/notes` |
| D36 | `http://localhost:8080/executions` |
| D39 | `http://localhost:8080/settings` |
| D40 | `http://localhost:8080/system_management` |
| D41 | `http://localhost:8080/system_management` |

## Prior-phase / blocking findings

_(none recorded)_

## HITL — Human-in-the-loop boundary (KB-64)

**Nimrod (Team 00) is NOT available for real-time clarifications during this QA session.**
Do not block on human answers; document assumptions in the QA report. Escalate only via explicit FAIL with `FAIL_CMD` below.

## FAIL_CMD (mandatory one-liner format — KB-56 / WP002 §3)

When recording a pipeline failure, your QA report MUST include this exact field:

```
FAIL_CMD: ./pipeline_run.sh --domain tiktrack fail --finding_type <TYPE> "GATE_3 FAIL: <short reason>"
```

Concrete example:

```
FAIL_CMD: ./pipeline_run.sh --domain tiktrack fail --finding_type code_fix_multi "GATE_3 FAIL: write_wsm_state skips phase_owner_team; ssot_check false-positive exit 0"
```

Valid `--finding_type` values: `PWA` | `doc` | `wording` | `canonical_deviation` | `code_fix_single` | `code_fix_multi` | `architectural` | `scope_change` | `unclear`

Optional (convenience — reason text from file; `--finding_type` still required on CLI):
`./pipeline_run.sh --domain tiktrack fail --finding_type <TYPE> --from-report /path/to/report.md`

## Automated (terminal)
```bash
python3 -m pytest tests/unit/ -v
python3 -m pytest tests/test_external_data_cache_failover_pytest.py -v
cd ui && npx vite build
```

## MCP Browser Tests
Use MCP tools to test the new feature:
1. browser_navigate → login
2. browser_navigate → new page
3. browser_snapshot → verify UI renders
4. Test each CRUD operation via browser_click + browser_type
5. Verify error states (empty form submission)
6. Verify data persistence (create → refresh → verify present)

## Evidence
Produce QA report: `_COMMUNICATION/team_50/TEAM_50_S003_P014_WP001_QA_REPORT_v*.md`
with PASS/FAIL per scenario.
0 SEVERE required for GATE_4 PASS.