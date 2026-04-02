---
id: TEAM_00_STAGE8A_GATE_DECISION_v1.0.0
historical_record: true
from: Team 00 (System Designer)
to: Team 100 (Chief System Architect)
cc: Team 31 (AOS Frontend — waiting), Team 51 (AOS QA — waiting)
date: 2026-03-27
type: GATE_DECISION
stage: SPEC_STAGE_8A
artifact_reviewed: TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.1.md
team_190_verdict: PASS (CC1)
team_00_verdict: CONDITIONAL_PASS — 2 mandatory corrections before Team 31 activates---

# Stage 8A Gate Decision — Team 00 Review

## Summary

Team 190 CC1 PASS is accepted and the 6-finding correction cycle (F-01..F-06) is confirmed closed. The spec is architecturally sound: 7 API contracts are complete, DDL is clean, ADs are locked, SSOT anchoring is explicit.

**However, 2 findings escaped Team 190's review scope** — both are spec-vs-spec internal inconsistencies, not API contract issues. They are targeted and easy to correct.

**Verdict: CONDITIONAL_PASS**
Team 31 is BLOCKED until corrections are applied and Team 00 confirms closure.
No Team 190 re-cycle required — these are direct corrections verified by Team 00.

---

## Team 190 Review Assessment

CC0 findings (F-01..F-06) were all legitimate. Team 190 correctly:
- Caught the future-date BLOCKER (F-01)
- Required the authorization contract gap fix (F-02)
- Enforced error code semantic integrity (F-03)
- Demanded SSOT anchoring for new entities (F-04)
- Aligned DDL constraint style (F-05)
- Completed pagination error coverage (F-06)

CC1 remediation was executed correctly. All 6 closures are confirmed with evidence.

---

## Team 00 Findings — 2 Required Corrections

### GATE-F-01 (MAJOR) — `notes` field in New Idea modal has no API or DDL backing

**Location:** §6.5.5 New Idea modal field table

**Current spec (§6.5.5):**
```
| title       | <input type="text"> | YES |
| description | <textarea>          | NO  |
| priority    | <select>            | YES |
| notes       | <textarea>          | NO  |   ← ORPHANED FIELD
```

**POST /api/ideas request body (§4.17):**
```json
{ "title": "string", "description": "string | null", "priority": "string" }
```
→ No `notes` parameter.

**`ideas` DDL table (§10.1):**
→ No `notes` column. The decision-related field is `decision_notes`, which is an editorial field for post-evaluation use, not creation input.

**Problem:** Team 31 would render a `notes` textarea that maps to nothing. Any input in that field is silently dropped. This is a contractual dead-end.

**Required correction:**
Remove `notes` from the New Idea modal. The creation form MUST contain only:
- `title` (required)
- `description` (optional)
- `priority` (required, default MEDIUM)

**Rationale:** `decision_notes` is an editorial decision field — populated AFTER evaluation, by team_00 only (consistent with AD-S8A-03). A submitter creating a new idea has no decision notes to provide. The `description` field already captures the submission narrative.

The `notes` / `decision_notes` distinction is critical: submitters write `description`, approvers write `decision_notes`. The New Idea modal should not blur this separation.

---

### GATE-F-02 (MAJOR) — `run_id` column absent from §6.5.2 and §6.5.3 table specs

**Location:** §6.5.2 (Active Runs tab) and §6.5.3 (Completed Runs tab) column tables

**Current §6.5.2 columns (spec):**
`domain_id | work_package_id | status | current_gate/phase | correction_cycle_count | started_at | current_actor | Actions`
→ No `run_id`.

**QA mandate (A106) TC-M17-1 checks for:**
`RUN_ID | DOMAIN | WORK_PACKAGE | STATUS | GATE / PHASE | CORRECTION CYCLES | STARTED | CURRENT ACTOR | ACTIONS`

**QA mandate (A106) TC-M18-1 checks for:**
`RUN_ID | DOMAIN | WORK_PACKAGE | STATUS | STARTED | COMPLETED | CORRECTION CYCLES | ACTIONS`

**Problem:** The spec is the SSOT for Team 31. Without `run_id` in the column spec, Team 31 will not render it. Team 51 will then FAIL TC-M17-1 and TC-M18-1. This creates a guaranteed QA failure that traces back to a spec gap, not an implementation error.

**Operational need:** Team 00 must be able to identify runs. Domain + WP is not unique across time (the same WP can run multiple times). `run_id` is the primary key of the run — it MUST be visible in any run listing.

**Required correction:**
Add `run_id` as the **first column** in both §6.5.2 (Active Runs) and §6.5.3 (Completed Runs) column tables.

**Display spec for `run_id` column:**
```
| run_id | runs | ULID — display last 8 chars (e.g. `…BCDE1234`), full ULID on hover tooltip |
```

Note: The full ULID is 26 chars. Truncating to last 8 with `…` prefix is standard practice for ID columns in dense tables. The full value remains accessible via tooltip.

---

## Observations (No Correction Required Before CC)

### O-01 — Engine badge value: `codex` vs `openai`

§6.4.2 lists engine badge values as `cursor / claude_code / codex / human`.
MEMORY.md states "Team 90, 101, 102, 190, 191: OpenAI / Codex API."

The canonical engine enum values are defined in TEAMS_ROSTER_v1.0.0.json. If the canonical value is `openai` (not `codex`), this is a drift that Team 31 must align with.

**Action:** Team 31, when building the Teams page mockup, MUST read TEAMS_ROSTER_v1.0.0.json and use the exact engine values from there. The spec's `codex` label is advisory only — the roster is authoritative.

### O-02 — INVALID_HISTORY_PARAMS reuse for non-history endpoints

`§4.14` and `§4.16` use `INVALID_HISTORY_PARAMS` for `offset < 0` validation. This code was introduced in Stage 7 for `GET /api/history`. Its name implies history-endpoint scope.

Team 190 explicitly passed this pattern in F-06 closure. Team 00 accepts Team 190's judgment. This is logged as a technical debt observation — future spec revisions may introduce a generic `INVALID_PAGINATION_PARAMS` code to replace the domain-specific one.

**No correction required now.** The semantic imprecision is tolerable for the BUILD phase.

### O-03 — FAILED terminal state not in Portfolio Tab 2

`GET /api/runs?status=COMPLETE` (§6.5.3) returns only COMPLETE runs. Runs that end with `GATE_FAILED_BLOCKING` after cycle exhaustion reach a FAILED terminal state — these are not addressed in the Portfolio.

This is a **mandate gap** (Team 00 did not scope it in A104), not a spec error. Team 100 correctly implemented the mandate.

**Advisory:** For BUILD, extend `GET /api/runs` query in §6.5.3 to also fetch `status=FAILED`. Add a `FAILED` badge (red/danger) to the Completed Runs tab column display. This does not require a spec amendment CC — Team 31 should implement this directly. Team 51 should ADD a check for FAILED badge to TC-M18 during the QA cycle.

---

## Correction Instructions for Team 100

Make exactly 2 targeted edits to `TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.1.md`:

**Edit 1 — §6.5.5 New Idea modal:** Remove the `notes` row from the field table.

Before:
```
| title       | <input type="text">                   | YES              |
| description | <textarea>                            | NO               |
| priority    | <select> (LOW/MEDIUM/HIGH/CRITICAL)   | YES (default: MEDIUM) |
| notes       | <textarea>                            | NO               |
```

After:
```
| title       | <input type="text">                   | YES              |
| description | <textarea>                            | NO               |
| priority    | <select> (LOW/MEDIUM/HIGH/CRITICAL)   | YES (default: MEDIUM) |
```

**Edit 2 — §6.5.2 and §6.5.3:** Add `run_id` as first column.

§6.5.2 — insert before `domain_id` row:
```
| run_id | runs | ULID — last 8 chars displayed (e.g. `…BCDE1234`), full on hover |
```

§6.5.3 — insert before `domain_id` row:
```
| run_id | runs | ULID — last 8 chars displayed (e.g. `…BCDE1234`), full on hover |
```

**Version bump:** v1.0.1 → **v1.0.2**. Add CC2 entry to remediation_summary header noting GATE-F-01 and GATE-F-02 closed.

**No Team 190 re-cycle required.** Deliver corrected spec directly to Team 00. Notify when v1.0.2 is committed.

---

## Gate Authorization

Upon Team 100 delivering v1.0.2 with both corrections:

1. **Team 31 is UNBLOCKED** — proceed with A105 mockup mandate
2. **Team 51** remains on standby until Team 31 completes mockup

**Blocking state as of this document:** Team 31 = BLOCKED pending v1.0.2.

---

## Artifact Index Updates

The following artifacts registered by Team 100 in the completion report are recorded in the Artifact Index (v1.34.0):

| ID | Artifact | Type | Status |
|---|---|---|---|
| A107 | TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.1.md | SPEC_AMENDMENT | ACTIVE (awaiting CC2) |
| A108 | TEAM_100_TO_TEAM_190_STAGE8A_UI_SPEC_AMENDMENT_REVIEW_REQUEST_v1.0.1.md | REVIEW_REQUEST | LOCKED |
| A109 | TEAM_190_AOS_V3_UI_SPEC_AMENDMENT_REVIEW_v1.0.0.md | REVIEW | LOCKED (CC0 FAIL) |
| A110 | TEAM_190_TO_TEAM_100_STAGE8A_REVIEW_NOTIFICATION_v1.0.0.md | NOTIFICATION | LOCKED |
| A111 | TEAM_190_AOS_V3_UI_SPEC_AMENDMENT_REVIEW_v1.0.1.md | REVIEW | LOCKED (CC1 PASS) |
| A114 | This gate decision | GATE_DECISION | ACTIVE |

---

**log_entry | TEAM_00 | STAGE8A_GATE_DECISION | CONDITIONAL_PASS | GATE-F-01_GATE-F-02_CORRECTION_REQUIRED | 2026-03-27**
