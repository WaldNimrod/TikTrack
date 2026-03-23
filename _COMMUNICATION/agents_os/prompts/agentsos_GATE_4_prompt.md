**date:** 2026-03-21

## Identity Header (mandatory on all deliverables)

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| work_package_id | S003-P012-WP001 |
| gate_id | GATE_4 |
| project_domain | agents_os |
| process_variant | TRACK_FOCUSED |

# GATE_4 — QA (Cursor Composer + MCP)

**QA owner:** `team_51` (AOS TRACK_FOCUSED → team_51; TikTrack TRACK_FULL → team_50)

**process_variant:** `TRACK_FOCUSED`  |  **work_package_id:** `S003-P012-WP001`

## WP spec brief (LOD200 scope)

SSOT Implementation — WSM auto-generated block, PORTFOLIO_WSM_SYNC_RULES update, governance closure (AC-06, AC-10)

## LOD200 / LLD400 excerpt (acceptance criteria)

(no LLD400 stored — use spec_brief)

## D-pages (TikTrack UI surface)

_N/A — not TikTrack domain._

## Prior-phase / blocking findings

_(none recorded)_

## HITL — Human-in-the-loop boundary (KB-64)

**Nimrod (Team 00) is NOT available for real-time clarifications during this QA session.**
Do not block on human answers; document assumptions in the QA report. Escalate only via explicit FAIL with `FAIL_CMD` below.

## FAIL_CMD (mandatory one-liner format — KB-56 / WP002 §3)

When recording a pipeline failure, your QA report MUST include this exact field:

```
FAIL_CMD: ./pipeline_run.sh --domain agents_os fail --finding_type <TYPE> "GATE_3 FAIL: <short reason>"
```

Concrete example:

```
FAIL_CMD: ./pipeline_run.sh --domain agents_os fail --finding_type code_fix_multi "GATE_3 FAIL: write_wsm_state skips phase_owner_team; ssot_check false-positive exit 0"
```

Valid `--finding_type` values: `PWA` | `doc` | `wording` | `canonical_deviation` | `code_fix_single` | `code_fix_multi` | `architectural` | `scope_change` | `unclear`

Optional (convenience — reason text from file; `--finding_type` still required on CLI):
`./pipeline_run.sh --domain agents_os fail --finding_type <TYPE> --from-report /path/to/report.md`

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
Produce QA report: `_COMMUNICATION/team_51/TEAM_51_S003_P012_WP001_QA_REPORT_v*.md`
with PASS/FAIL per scenario.
0 SEVERE required for GATE_4 PASS.