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
| work_package_id | S003-P015-WP001 |
| gate_id | GATE_4 |
| project_domain | agents_os |
| process_variant | TRACK_FOCUSED |

# GATE_4 — QA (Cursor Composer + MCP)

**QA owner:** `team_51` (AOS TRACK_FOCUSED → team_51; TikTrack TRACK_FULL → team_50)

**process_variant:** `TRACK_FOCUSED`  |  **work_package_id:** `S003-P015-WP001`

## WP spec brief (LOD200 scope)

S003-P015-WP001 — AOS DM-005 SC Verification Run. Documentation-only pipeline run (GATE_0→GATE_5, TRACK_FOCUSED) to verify AOS pipeline engine readiness for DM-005 closure. No code changes. Authority: DM-005 v1.2.0.

## LOD200 / LLD400 excerpt (acceptance criteria)

---
id: TEAM_170_S003_P015_WP001_LLD400_v1.0.0
date: 2026-03-24
from: Team 170 (Spec & Governance)
to: Team 190 · Team 101 · Gateway
status: AS_MADE_VERIFICATION
work_package_id: S003-P015-WP001
---

# LLD400 — S003-P015-WP001 — DM-005 documentation-only verification

## 1. Identity Header

`gate: GATE_1 | wp: S003-P015-WP001 | stage: S003 | domain: agents_os | date: 2026-03-24`

| Field | Value |
|-------|-------|
| roadmap_program | S003-P015 |
| work_package_id | S003-P015-WP001 |
| architectural_approval_type | SPEC (LLD400 — verification WP) |
| phase_owner | Team 170 |

## 2. Endpoint Contract

**Normative:** This WP introduces **no new HTTP API** on TikTrack or AOS product surfaces.

| Method | Path | Purpose |
|--------|------|---------|
| N/A | N/A | No new routes. Existing `GET /health` on TikTrack backend (port 8082) may be used **only** as an optional environment sanity probe by QA; not a deliverable of this WP. |

**Request/response:** Not applicable beyond optional health check `200 {"status":"ok"}` if used.

## 3. DB Contract

**No database reads or writes** are introduced by this WP. **No migrations.** **No new tables or columns.**

## 4. UI Structural Contract

**Primary surface:** Agents OS **pipeline dashboard** (static UI served per `scripts/start_ui_server.sh`, port **8080**).

| Area | Requirement |
|------|-------------|
| WHO / WHAT NOW | Visible for each gate during the run |
| GATE_2 | Two-phase display; active phase visually indicated |
| Mandates | Load without blocking errors when artifacts exist |
| Console | **Zero** `404` fetch failures attributable to dashboard JS; **zero** `SEVERE` logs from dashboard scripts |

**DOM:** No new `data-testid` required for product pages; dashboard already carries its own test hooks per existing implementation.

**State shape:** Dashboard reads `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` (and related `STATE_VIEW.json`) — unchanged contract.

## 5. MCP Test Scenarios

| ID | Precondition | Action | Expected |
|----|--------------|--------|----------|
| M-01 | Repo checkout; venv optional | `python3 -m agents_os_v2.tools.ssot_check --domain agents_os` | Exit **0**; `SSOT CHECK: ✓ CONSISTENT` |
| M-02 | Same | `python3 -m agents_os_v2.tools.ssot_check --domain tiktrack` | Exit **0**; consistent |
| M-03 | Same | `python3 -m pytest agents_os_v2/tests/ -q` | **208+** passed (skipped allowed) |
| M-04 | After GATE_5 COMPLETE | `./pipeline_run.sh --domain agents_os wsm-reset` | Completes; WSM idle fields coherent |
| M-05 | Same | `bash scripts/canary_simulation/run_canary_safe.sh` | Final line contains **no** unintended `pipeline_run.sh` execution (per script contract) |

## 6. Acceptance Criteria

1. Full **G0→G5** progression completes on **`agents_os`** domain for **S003-P015-WP001** without blocking CLI errors.
2. After **every** gate advance in the run log: `ssot_check --domain agents_os` → **CONSISTENT**.
3. After **every** gate where code changed: `pytest agents_os_v2/tests/` → **208+** pass (this WP expects **no** code changes).
4. After **COMPLETE**: `wsm-reset` run once; then **both** domain `ssot_check` commands **CONSISTENT**.
5. Canary safe script passes per DM-005 ITEM-3.
6. Dashboard console: **zero 404** and **zero SEVERE** from dashboard JS during the run (ITEM-3).

## 7. Gate 4.3 — Human Review Checklist (HRC)

| ID | Scenario (HE) | URL / Environment | Success Criteria | Failure Indicators |
|----|---------------|-------------------|------------------|--------------------|
| HRC-01 | מי עובד עכשיו | `http://localhost:8080` — Agents OS dashboard | שדה WHO מציג צוות נוכחי ברור | ריק / שגיאת טעינה |
| HRC-02 | מה לעשות עכשיו | אותו דף | WHAT NOW תואם שער פעיל | הודעה סותרת או חסרה |
| HRC-03 | שער דו-שלבי GATE_2 | אותו דף במהלך GATE_2 | שתי פאזות מוצגות; פעילה מודגשת | פאזה אחת בלבד / שגיאה |
| HRC-04 | קונסול נקי | DevTools → Console | אין 404 מ-fetch של הדשבורד; אין SEVERE מ-JS פנימי | 404 או SEVERE מקוד הדשבורד |
| HRC-05 | מצב שער אחרי COMPLETE | אחרי סיום + wsm-reset | אין הודעת חסימה שגויה; מצב תואם IDLE/COMPLETE | טקסט חוסם אדום קבוע |

---

**Handover — Team 190:** validate externally; operator advances pipeline per `pipeline_run.sh`.

**log_entry | TEAM_170 | LLD400_AS_MADE | S003-P015-WP001 | 2026-03-24**

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
Produce QA report: `_COMMUNICATION/team_51/TEAM_51_S003_P015_WP001_QA_REPORT_v*.md`
with PASS/FAIL per scenario.
0 SEVERE required for GATE_4 PASS.

historical_record: true
