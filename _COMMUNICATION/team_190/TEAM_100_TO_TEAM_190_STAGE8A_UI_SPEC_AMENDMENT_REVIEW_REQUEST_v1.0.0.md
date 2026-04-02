---
id: TEAM_100_TO_TEAM_190_STAGE8A_UI_SPEC_AMENDMENT_REVIEW_REQUEST_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 190 (Constitutional Architectural Validator)
date: 2026-03-26
type: REVIEW_REQUEST
priority: BLOCKING
subject: AOS v3 UI Spec Amendment (Stage 8A) — Validation Request---

# Review Request: AOS v3 UI Spec Amendment (Stage 8A)

## Artifact Under Review

**File:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.0.md`
**Type:** SPEC_AMENDMENT to Stage 8 Module Map + Integration Spec v1.0.1
**Basis:** `TEAM_00_TO_TEAM_100_UI_SPEC_AMENDMENT_MANDATE_v1.0.0.md` (A104)

## Amendment Scope

This amendment extends the Module Map v1.0.1 (Stage 8) with UI page contracts and supporting API endpoints. The base spec remains unchanged.

### Additions

| Section | Content | New |
|---|---|---|
| §6.1.A | Assembled Prompt section (visibility, data source, copy/regenerate) | Yes |
| §6.1.B | Start Run form for IDLE state (4 fields, POST mapping) | Yes |
| §6.1.C | `paused_at` display in PAUSED state | Yes |
| §6.4 | Teams page — two-panel layout, team roster, 4-layer context generator | Yes |
| §6.5 | Portfolio page — 4 tabs (Active Runs, Completed Runs, WPs, Ideas Pipeline) | Yes |
| §4.12 | `GET /api/runs/{run_id}/prompt` — full contract | Yes |
| §4.13 | `GET /api/teams` — full contract | Yes |
| §4.14 | `GET /api/runs` (list, paginated) — full contract | Yes |
| §4.15 | `GET /api/work-packages` — full contract | Yes |
| §4.16 | `GET /api/ideas` — full contract | Yes |
| §4.17 | `POST /api/ideas` — full contract | Yes |
| §4.18 | `PUT /api/ideas/{idea_id}` — full contract | Yes |
| §10 | DDL: `ideas` table (10 cols), `work_packages` table (7 cols) | Yes |
| §11 | Navigation update: 3 → 5 pages | Yes |
| §12 | AD-S8A-01, AD-S8A-02, AD-S8A-03 | Yes |

### SSOT References

All contracts align with:
- Entity Dictionary v2.0.2 (ULID identifiers, REFERENCES constraints)
- State Machine Spec v1.0.2 (status values, PAUSED state semantics)
- Use Case Catalog v1.0.3 (UC-13/14 data sourcing for Teams/History)
- DDL Spec v1.0.1 (no conflicts; additive tables)
- Routing Spec v1.0.1 (actor resolution for Teams page)
- Prompt Arch Spec v1.0.2 (assembly pipeline for §4.12, AD-S6-07 token budget advisory)
- Event & Observability Spec v1.0.2 (event types for history filters)
- Module Map v1.0.1 (delegates to established module functions)

### Review Focus Areas

1. **API contract consistency:** Do §4.12–§4.18 response schemas align with SSOT entities?
2. **DDL alignment:** Do `ideas` and `work_packages` table schemas follow DDL v1.0.1 conventions (ULID PKs, TIMESTAMPTZ, REFERENCES)?
3. **Error code reuse:** All error codes are from the Stage 7 registry (39 total) or explicitly justified
4. **AD decisions:** Are AD-S8A-01/02/03 properly scoped and non-contradictory?
5. **No regressions:** Does amendment introduce any contradiction with base spec v1.0.1?

---

**log_entry | TEAM_100 | STAGE8A_REVIEW_REQUEST | SUBMITTED | team_190 | 2026-03-27**
