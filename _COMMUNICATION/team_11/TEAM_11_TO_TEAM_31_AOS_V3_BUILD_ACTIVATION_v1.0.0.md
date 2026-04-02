---
id: TEAM_11_TO_TEAM_31_AOS_V3_BUILD_ACTIVATION_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 31 (AOS Frontend Implementation)
cc: Team 100 (Chief Architect), Team 51 (AOS QA), Team 61 (AOS DevOps)
date: 2026-03-28
type: BUILD_ACTIVATION — GATE_4 (production UI)
domain: agents_os
branch: aos-v3
authority: TEAM_00_TO_TEAM_11_AOS_V3_BUILD_WORK_PACKAGE_v1.0.3.md
start_gate: GATE_3_PASS_AND_TEAM_100_ARCH_APPROVED
gate_3_verdict: TEAM_100_AOS_V3_GATE_3_ARCHITECTURAL_VERDICT_v1.0.0.md
authority_model_sync: 2026-03-28---

# TEAM 11 → TEAM 31 | AOS v3 BUILD | GATE_4 activation

## Layer 1 — Identity

| Field | Value |
|------|--------|
| Team ID | `team_31` |
| Role | AOS frontend — mockup → production in `agents_os_v3/ui/`; wire all five pages to **live** API |
| Start | **GATE_3 closed** — backend APIs + SSE + FIP per mandate; **Team 100** `TEAM_100_AOS_V3_GATE_3_ARCHITECTURAL_VERDICT_v1.0.0.md` (**APPROVED**); Gateway **GO** — `TEAM_11_TO_TEAM_31_AOS_V3_GATE_4_GO_v1.0.0.md`. |

---

## Layer 2 — Iron Rules

**IR-3:** FILE_INDEX for any new/changed UI assets. **IR-4:** UI is consumer-only; no client-side `next_action` computation.

**Advance:** use **`summary`** in `POST /api/runs/{run_id}/advance`.

**SSE:** status chip on each page — connected vs polling fallback **15s** (`TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.1.md`).

---

## Layer 3 — Context

**Pages & APIs:** WP **D.3 Team 31** table (index, history, config, teams, portfolio).

**Config page (F-10):** six live admin endpoints — `GET/POST/PUT /api/routing-rules`, `GET/PUT /api/templates/{id}`, `GET /api/policies`; read-only for non–team_00 where spec requires.

**Specs:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.3.md`, `_COMMUNICATION/team_100/TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.1.md`, `_COMMUNICATION/team_100/TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.2.md` §6.3.

---

## Layer 4 — Task (GATE_4 AC — WP v1.0.3 D.4)

- Pipeline: Operator Handoff from live `GET /api/state`; SSE + fallback polling; feedback modes B/C/D; CORRECTION blocking UI.
- History: run selector via `GET /api/runs` (paginated), timeline, `?run_id=` deep link.
- Config: full admin wiring (six endpoints).
- Teams: list + `PUT /api/teams/{team_id}/engine` (team_00 only).
- Portfolio: Active Runs + Completed Runs tabs (`GET /api/runs`); WP tab (`GET /api/work-packages`, `GET /api/work-packages/{wp_id}`); Ideas tab (`GET /api/ideas`, `POST /api/ideas`, `PUT /api/ideas/{idea_id}`).
- FILE_INDEX updated.
- Support Team 51 for TC-19..TC-26.

**GATE_4 submission:** Team 11 → **Team 00** (UX) with E2E evidence from Team 51.

---

**log_entry | TEAM_11 | AOS_V3_BUILD | TEAM_31_GATE_4_ACTIVATION | T100_GATE_3_APPROVED_SYNC | 2026-03-28**
