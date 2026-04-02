---
id: TEAM_100_AOS_V3_AUTHORITY_MODEL_AMENDMENT_REPORT_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 00 (Principal)
cc: Team 11 (AOS Gateway), Team 21 (AOS Backend), Team 51 (AOS QA)
date: 2026-03-28
type: AMENDMENT_REPORT — full changelog for AUTHORITY_MODEL v1.0.0 cascade
trigger: ARCHITECT_DIRECTIVE_AUTHORITY_MODEL_v1.0.0 + TEAM_00_TO_TEAM_100_AOS_V3_SPEC_AMENDMENT_AUTHORITY_MODEL_v1.0.0
status: COMPLETE---

# Team 100 — Authority Model Amendment Report v1.0.0

## Executive Summary

Per the locked `ARCHITECT_DIRECTIVE_AUTHORITY_MODEL_v1.0.0` and the spec amendment mandate from Team 00, Team 100 has applied all required changes across the canonical SSOT spec corpus. This report documents every change made.

**Scope of changes:**
1. `NOT_PRINCIPAL` error code removed from all 5 active canonical specs — replaced by `INSUFFICIENT_AUTHORITY`
2. Ideas authorization logic updated from "team_00 only" to Tier 1/2 authority model
3. `is_current_actor` field removed from GET /api/teams response schema
4. Automation-first philosophy preamble added to UI Spec

**Total files produced:** 5 new spec versions + 1 errata addendum
**Total NOT_PRINCIPAL occurrences replaced:** 19 across all specs

---

## §1 — New Spec Versions Produced

| # | Document | Old Version | New Version | Changes Applied |
|---|----------|-------------|-------------|-----------------|
| 1 | UI Spec Amendment (Stage 8A) | v1.0.2 | **v1.0.3** | 4 mandated amendments (AM-01..AM-04) |
| 2 | Event Observability Spec (Stage 7) | v1.0.2 | **v1.0.3** | NOT_PRINCIPAL merged into INSUFFICIENT_AUTHORITY; count 39→38 |
| 3 | Module Map Integration Spec (Stage 8) | v1.0.1 | **v1.0.2** | 8× NOT_PRINCIPAL replaced in §3.5, §3.12, §4.4–§4.8 |
| 4 | Use Case Catalog (Stage 3) | v1.0.3 | **v1.0.4** | 4× NOT_PRINCIPAL replaced in UC-06, UC-07, UC-08, UC-12 |
| 5 | UI Spec Amendment (Stage 8B) | v1.1.0 | **v1.1.1** | 3× NOT_PRINCIPAL replaced; total error count 49→48 |

---

## §2 — Detailed Changelog

### 2.1 — UI Spec Amendment v1.0.3

**File:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.3.md`

| Change ID | Section | Description |
|-----------|---------|-------------|
| AM-01 | §4.13 | Removed `is_current_actor` field from TeamResponse JSON schema and field sourcing table. Teams page = static management; pipeline state displayed on other pages. |
| AM-02 | §4.18 | `NOT_PRINCIPAL` → `INSUFFICIENT_AUTHORITY` in errors table. Authorization policy rewritten: Tier 1 (team_00 always) or Tier 2 (delegated via `gate_role_authorities` with `IDEA_STATUS_AUTHORITY` role). Whole-request rejection behavior retained. |
| AM-03 | §12 | AD-S8A-03: supersession note added — Tier 1/2 model replaces team_00-only restriction. AD-S8A-04: error code updated to `INSUFFICIENT_AUTHORITY`; supersession note added. |
| AM-04 | §0 (new) | Automation-first operating philosophy preamble added per mandate verbatim. |
| AM-05 | §9 | Error code `NOT_PRINCIPAL` reclassified: now reuses Stage 7 `INSUFFICIENT_AUTHORITY` instead of declaring new code. Stage 8A net new count corrected: 3→2. Total: 41. |
| META | Header | Version bumped to v1.0.3; correction_cycle: 3; supersedes_ad field added; CC to Team 11, Team 21; AUTHORITY_MODEL added to ssot_basis. |

### 2.2 — Event Observability Spec v1.0.3

**File:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.3.md`

| Change ID | Section | Description |
|-----------|---------|-------------|
| EO-01 | §6.1 | Two rows merged: `INSUFFICIENT_AUTHORITY` (UC-04) + `NOT_PRINCIPAL` (UC-06/07/08/12) → single `INSUFFICIENT_AUTHORITY` (UC-04/06/07/08/12). Description: "Caller lacks required authority tier for this operation — role-based or principal-level." |
| EO-02 | §6 total | Total unique error code count: 39 → 38. Breakdown: 29 (UC Catalog, after merge) + 2 (Routing) + 4 (Prompt Arch) + 3 (Stage 7 own). |
| EO-03 | Remediation | G-01 note updated to reflect v1.0.3 count correction chain. |
| META | Header | Version bumped; supersedes v1.0.2; correction_cycle: 3. |

### 2.3 — Module Map Integration Spec v1.0.2

**File:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.2.md`

| Change ID | Section | Description |
|-----------|---------|-------------|
| MM-01 | §3.5 | `approve_gate()` error comment: `NOT_PRINCIPAL (403)` → `INSUFFICIENT_AUTHORITY (403)` |
| MM-02 | §3.5 | `pause_run()` error comment: same replacement |
| MM-03 | §3.5 | `resume_run()` error comment: same replacement |
| MM-04 | §3.12 | `principal_override()` error comment: same replacement |
| MM-05 | §4.4 | POST /approve errors table: `NOT_PRINCIPAL` → `INSUFFICIENT_AUTHORITY` with Tier 1 note |
| MM-06 | §4.5 | POST /pause errors table: same |
| MM-07 | §4.6 | POST /resume errors table: same |
| MM-08 | §4.8 | POST /override errors table: same |
| META | Header | Version bumped; supersedes v1.0.1; correction_cycle: 2. |

**Logic note:** Authorization guards (`actor_team_id = team_00`) unchanged for UC-06/07/08/12 — these remain Tier 1 locked operations per AUTHORITY_MODEL §3. Only error code name changed.

### 2.4 — Use Case Catalog v1.0.4

**File:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.4.md`

| Change ID | Section | Description |
|-----------|---------|-------------|
| UC-A | UC-06 | Error flow table: `NOT_PRINCIPAL` → `INSUFFICIENT_AUTHORITY` with Tier 1 note |
| UC-B | UC-07 | Same replacement |
| UC-C | UC-08 | Same replacement |
| UC-D | UC-12 | Same replacement |
| META | Header | Version bumped to v1.0.4; date updated. |

### 2.5 — UI Spec Amendment v1.1.1 (Stage 8B)

**File:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.1.md`

| Change ID | Section | Description |
|-----------|---------|-------------|
| S8B-01 | §10.3 | PUT /teams/engine errors: `NOT_PRINCIPAL` → `INSUFFICIENT_AUTHORITY` with Tier 1 note |
| S8B-02 | §11 | Reused codes list: `NOT_PRINCIPAL` replaced by note that `INSUFFICIENT_AUTHORITY` absorbs it |
| S8B-03 | §17 TC-22 | Expected result: `403 NOT_PRINCIPAL` → `403 INSUFFICIENT_AUTHORITY` |
| S8B-04 | §11 total | Error code total: 49 → 48 (one code absorbed by merge) |
| META | Header | Version bumped; amends references updated to v1.0.3/v1.0.2; correction_cycle: 2. |

---

## §3 — Errata Addendum for Team 00/Team 11-Owned Documents

**File:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_BUILD_WP_ERRATA_AND_DELTA_v1.0.0.md`

| Errata ID | Owner | File | Line | Change |
|-----------|-------|------|------|--------|
| E-01a | Team 00 | WP v1.0.3 | ~258 | Authorization note: `NOT_PRINCIPAL` → `INSUFFICIENT_AUTHORITY`; AD-S8A-04 supersession |
| E-01b | Team 00 | WP v1.0.3 | ~330, ~418 | AD-S8A-04 references: add AUTHORITY_MODEL v1.0.0 note |
| E-01c | Team 00 | WP v1.0.3 | ~485 | Activation instruction: add INSUFFICIENT_AUTHORITY note |
| E-02a | Team 00 | Process Map v1.0.0 | ~438 | E2E test assertion: `NOT_PRINCIPAL` → `INSUFFICIENT_AUTHORITY` |
| E-03a | Team 11 | Team 21 Activation v1.0.0 | ~95 | AD-S8A-04 reference: add AUTHORITY_MODEL supersession note |

**Status:** Errata produced and delivered. Team 00 and Team 11 to apply at their discretion.

---

## §4 — Code Impact (Team 31 scope)

**File:** `agents_os_v3/ui/app.js`

The `is_current_actor` field (removed from spec §4.13 by AM-01) currently exists in the UI mockup:

| Location | Description | Action Required |
|----------|-------------|-----------------|
| Lines ~843-854 | `MOCK_TEAMS` objects with `is_current_actor: true/false` | Remove field from mock data |
| Line ~2389 | Ternary using `team.is_current_actor` | Remove conditional |
| Line ~2476 | Filter `!t.is_current_actor` | Remove filter |
| Lines ~2609-2612 | `<dt>is_current_actor</dt>` display | Remove display block |
| Lines ~2745-2747 | Star badge for `t.is_current_actor` | Remove badge logic |

**Note:** This is mockup code. Changes will be applied by Team 31 during GATE_4 frontend production, driven by the updated spec §4.13. Not a blocking item for GATE_2.

---

## §5 — Documents NOT Changed (confirmed unchanged)

| Document | Reason |
|----------|--------|
| State Machine Spec v1.0.2 | No NOT_PRINCIPAL references; guards unchanged |
| Routing Spec v1.0.1 | No NOT_PRINCIPAL references |
| Prompt Architecture Spec v1.0.2 | No NOT_PRINCIPAL references |
| DDL Spec v1.0.1 | No error code content |
| Entity Dictionary v2.0.2 | No error code content |
| GATE2 Arch Consultation Resolution | Already references AUTHORITY_MODEL correctly |
| Team 11 UC Authority Ruling | No error code content |
| All historical spec versions (v1.0.0, v1.0.1) | Superseded — not amended |
| All activation prompts for completed stages | Historical |
| All completion reports | Historical |

---

## §6 — Error Code Count Reconciliation

```
Stage 7 (Event Observability Spec):
  Before: 39 unique codes (INSUFFICIENT_AUTHORITY + NOT_PRINCIPAL counted separately)
  After:  38 unique codes (merged into single INSUFFICIENT_AUTHORITY)

Stage 8A (UI Spec Amendment):
  Before: 3 "new" codes declared (IDEA_TITLE_REQUIRED, IDEA_NOT_FOUND, NOT_PRINCIPAL)
  After:  2 net new codes (IDEA_TITLE_REQUIRED, IDEA_NOT_FOUND); INSUFFICIENT_AUTHORITY reused
  Running total: 38 + 2 = 40

Stage 8B:
  Net new: 8 codes (unchanged)
  Grand total: 40 + 8 = 48

Previous grand total: 49
Difference: -1 (NOT_PRINCIPAL absorbed into INSUFFICIENT_AUTHORITY)
```

---

## §7 — Active SSOT Version Map (post-amendment)

| Spec | Active Version | Previous |
|------|---------------|----------|
| UI Spec Amendment (8A) | **v1.0.3** | v1.0.2 |
| Event Observability Spec (7) | **v1.0.3** | v1.0.2 |
| Module Map Integration Spec (8) | **v1.0.2** | v1.0.1 |
| Use Case Catalog (3) | **v1.0.4** | v1.0.3 |
| UI Spec Amendment (8B) | **v1.1.1** | v1.1.0 |
| State Machine Spec (2) | v1.0.2 | (unchanged) |
| Routing Spec (5) | v1.0.1 | (unchanged) |
| Prompt Architecture Spec (6) | v1.0.2 | (unchanged) |
| DDL Spec (4) | v1.0.1 | (unchanged) |
| Entity Dictionary (1) | v2.0.2 | (unchanged) |

---

## §8 — Impact on Active GATE_2

Team 21 is currently implementing GATE_2 deliverables. Key impacts:

1. **Immediate:** Team 21 must use `INSUFFICIENT_AUTHORITY` (not `NOT_PRINCIPAL`) in all new code. The `GATE2_ARCH_CONSULTATION_RESOLUTION` already instructs this.
2. **Ideas authorization:** `check_authority()` function pattern per AUTHORITY_MODEL §9 — checks team_00 OR gate_role_authorities delegation. This is already communicated to Team 21 via the consultation resolution.
3. **Spec references:** Team 21's GATE_2 evidence package should reference the new spec versions (v1.0.3, v1.0.2, v1.0.4) rather than the superseded versions.
4. **`is_current_actor` removal:** Team 21's GET /api/teams handler should NOT include this field. Already communicated via consultation resolution.

**No new blocking items introduced. All changes align with existing Team 21 guidance.**

---

**log_entry | TEAM_100 | AUTHORITY_MODEL_AMENDMENT_REPORT | v1.0.0 | COMPLETE | 2026-03-28**
