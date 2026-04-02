---
id: TEAM_11_TO_TEAM_21_AOS_V3_BUILD_ACTIVATION_v1.0.1
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 21 (AOS Backend Implementation)
cc: Team 100 (Chief Architect), Team 51 (AOS QA), Team 61 (AOS DevOps)
date: 2026-03-28
type: BUILD_ACTIVATION — GATE_1 through GATE_3 (backend)
domain: agents_os
branch: aos-v3
authority: _COMMUNICATION/team_00/TEAM_00_TO_TEAM_11_AOS_V3_BUILD_WORK_PACKAGE_v1.0.3.md
team_100_clarifications: governance module explicit (Note 3)
authority_model_sync: 2026-03-28
authority_model_refs: ARCHITECT_DIRECTIVE_AUTHORITY_MODEL_v1.0.0 + TEAM_100_AOS_V3_BUILD_WP_ERRATA_AND_DELTA_v1.0.0 E-03a
e03a_confirmed: true
e03a_confirmed_date: 2026-03-28
supersedes_id: TEAM_11_TO_TEAM_21_AOS_V3_BUILD_ACTIVATION_v1.0.0
supersedes_path: _COMMUNICATION/team_11/TEAM_11_TO_TEAM_21_AOS_V3_BUILD_ACTIVATION_v1.0.0.md
traceability_note: AF-01 closure — immutable baseline after Team 190 POST_GATE_2 review (PASS_WITH_ADVISORIES, 2026-03-28)---

# TEAM 11 → TEAM 21 | AOS v3 BUILD | GATE_1–GATE_3 activation

## Layer 1 — Identity

| Field | Value |
|------|--------|
| Team ID | `team_21` |
| Role | AOS backend — all `agents_os_v3/modules/*` business logic, **all HTTP route definitions** in `modules/management/api.py` (and included routers), integration with DB via repository/state/audit |
| Domain | **agents_os only** |
| Start condition | Begin after **GATE_0 PASS** (Team 61 infra + DDL applied). |

---

## Layer 2 — Iron Rules (subset)

| ID | Rule |
|----|------|
| **IR-2** | `agents_os_v2/` read-only (reference: `json_enforcer.py`, `pipeline.py`, `config.py`). |
| **IR-3** | Update `FILE_INDEX.json` for every new/changed path under `agents_os_v3/`. |
| **IR-6** | `fail_gate` / fail endpoint: non-empty `reason`. |
| **IR-8** | `machine.py` transitions: single DB transaction with rollback. |
| **IR-9** | Full `GET /api/events/stream` + `audit/sse.py` by end of GATE_3 (GATE_0 may expose skeleton only). |

**UC-15:** Defined **only** in Stage 8B §12.4 — **not** in UC Catalog v1.0.4 (UC-01..UC-14 only there).

**Advance payload:** `POST /api/runs/{run_id}/advance` uses field **`summary`** — not `notes` (UC-02 catalog text is superseded on this field name).

---

## Layer 3 — Context

**Canonical tree:** WP v1.0.3 **D.1** (`_COMMUNICATION/team_100/TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.2.md` §1 + Stage 8B §12.3 per `_COMMUNICATION/team_100/TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.1.md`).

**Build order:** `_COMMUNICATION/team_00/TEAM_00_AOS_V3_BUILD_PROCESS_MAP_v1.0.0.md` **§10** — strict layers (definitions → Layer 1 modules → 2A/2B → management). **§4–§8 gate text** is superseded by WP for AC wording; use §10 for sequencing.

**Specs (scope by stage):**

- Entities: `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md`
- State machine: `_COMMUNICATION/team_100/TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md`
- Use cases: `_COMMUNICATION/team_100/TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.4.md` + UC-15 in `_COMMUNICATION/team_100/TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.1.md` §12.4
- UI (Stage 8A portfolio / §4.13–§4.18): `_COMMUNICATION/team_100/TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.3.md`
- Event & observability: `_COMMUNICATION/team_100/TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.3.md`
- Module map (integration): `_COMMUNICATION/team_100/TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.2.md`
- Routing / Prompting: per WP **C.2** + specs named in Module Map v1.0.2

**Port / prefix:** 8090, `/api/`.

---

## Team 100 clarification — Note 3: `governance/` module (MANDATORY)

`modules/governance/artifact_index.py` and `modules/governance/archive.py` are **Team 21 scope**.

- They are **Layer 1** per Process Map **§10** (depend on `definitions/` only).
- Required for **GATE_5** archive operations and Team 191 cleanup flows — not optional.
- Schedule them with other Layer 1 work so they are not left implicit.

---

## Layer 4 — Tasks by gate

### GATE_1 (WP D.4) — State machine + core

- [ ] `modules/definitions/` — models, constants, queries
- [ ] **`modules/governance/`** — `artifact_index.py`, `archive.py` (Note 3) alongside Layer 1 cadence
- [ ] `modules/state/machine.py` — T01–T12 + A01–A10E (IR-8)
- [ ] `modules/state/repository.py` — CRUD + `pipeline_state.json` projection
- [ ] **Register all routes** for GATE_1 endpoints: `POST /api/runs`, `POST .../advance` (**summary**), `.../fail` (**reason**), `.../approve`, `.../pause`, `.../resume`, `GET /api/runs/{run_id}` as per WP D.6
- [ ] FILE_INDEX updated

### GATE_2 (WP v1.0.3 D.4) — Routing + Prompting + Events + Stage 8A management

- [ ] `modules/routing/resolver.py`
- [ ] `modules/prompting/` — builder.py, cache.py, templates.py
- [ ] `GET /api/runs/{run_id}/prompt`
- [ ] `modules/audit/ledger.py`
- [ ] `modules/policy/settings.py`
- [ ] `modules/management/use_cases.py` — **UC-01..UC-14**
- [ ] Config admin: `GET/POST/PUT /api/routing-rules`, `GET/PUT /api/templates/{id}`, `GET /api/policies`
- [ ] **WP v1.0.3 — Stage 8A portfolio endpoints (explicit):**
  - [ ] `GET /api/runs` — list runs (paginated; `status`, `domain_id`, `limit`, `offset` filters) — UI spec §4.14
  - [ ] `GET /api/work-packages` — work-packages registry list — UI spec §4.15
  - [ ] `GET /api/ideas` — list ideas (paginated) — §4.16
  - [ ] `POST /api/ideas` — create idea — §4.17
  - [ ] `PUT /api/ideas/{idea_id}` — update idea (AD-S8A-04 / AUTHORITY_MODEL v1.0.0 — INSUFFICIENT_AUTHORITY) — §4.18
  - [ ] `GET /api/work-packages/{wp_id}` — WP detail + `linked_run_id`
  - [ ] `GET /api/teams` — team list with hierarchy — §4.13
- [ ] FILE_INDEX updated  
- **Submission (GATE_2):** **הושלם (2026-03-28)** — חבילה ל-Team 100 + verdict APPROVED; ראו `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_100_AOS_V3_GATE_2_REVIEW_PACKAGE_v1.0.0.md` + `_COMMUNICATION/team_100/TEAM_100_AOS_V3_GATE_2_ARCHITECTURAL_VERDICT_v1.0.0.md`.

### GATE_3 (WP D.4) — FIP + SSE + state extensions

- [ ] `modules/audit/ingestion.py` — FeedbackIngestor (IL-1/IL-2/IL-3)
- [ ] `modules/audit/sse.py` — SSEBroadcaster (operational)
- [ ] UC-15 `ingest_feedback` in `use_cases.py` (§12.4)
- [ ] `POST /api/runs/{run_id}/feedback` (unified detection modes)
- [ ] `POST /api/runs/{run_id}/feedback/clear`
- [ ] `GET /api/state` — `previous_event`, `pending_feedback`, `next_action` (seven types + `cli_command`)
- [ ] `GET /api/history?run_id=`
- [ ] `GET /api/events/stream` — four event types (full implementation)
- [ ] TC-15..TC-18 green (Team 51)
- [ ] FILE_INDEX updated  
- **Submission:** Team 11 packages to **Team 190** for GATE_3.

### WP D.3 stage table (reference)

Implement stages 1→2→5→6→7→6(policy)→3(UC-01..14)→8→8B per WP **D.3** rows 1–15; HTTP in `management/api.py` §4.x as specified.

---

## Team 51 coordination

- Unit tests: parallel from **GATE_1** onward (Layer 0/1/2 per Process Map §11).
- Integration / TC-01..TC-26: per WP **D.4** and Team 51 activation when issued.

Escalation: architecture / contract ambiguity → **Team 100**.

---

**log_entry | TEAM_11 | AOS_V3_BUILD | TEAM_21_ACTIVATION | v1.0.1_BASELINE_T190_AF01 | 2026-03-28**
