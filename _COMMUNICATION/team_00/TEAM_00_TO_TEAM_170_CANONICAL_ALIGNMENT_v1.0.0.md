# TEAM_00 → TEAM_170 — Canonical Registry Alignment Instructions
## Program Registry + WP Registry — 2026-03-02 Corrections

```
from:     Team 00 — Chief Architect
to:       Team 170 (Spec/Governance)
date:     2026-03-02
status:   ACTIVE — action required before next gate closure
priority: HIGH
relates_to:
  - ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v1.0.0.md   (roadmap updates, separate routing)
  - S002-P003-WP002 G7 remediation execution
```

---

## CONTEXT

Following a full legacy-gap review session (2026-03-02), three canonical documents require correction before the next gate closure event. These are precision corrections — no architectural change, only accuracy alignment.

**Do NOT modify WSM.** WSM is updated by Team 10 per gate-closure rules.

---

## CORRECTION 1 — Program Registry: S002-P003 Program Name

**File:** `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`

| Field | Current (wrong) | Correct |
|---|---|---|
| program_name | TikTrack Alignment (D22+D34+D35) | TikTrack Alignment (D22+D33+D34+D35) |

**Reason:** D33 (user_tickers) was always part of this program's scope. The WSM CURRENT_OPERATIONAL_STATE already says "D22 + D33 + D34 + D35 boundary." The program name was never updated to include D33.

**Scope:** Single field value change in the programs table. No structural change.

---

## CORRECTION 2 — Program Registry: S003-P005 Program Scope

**File:** `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`

| Field | Current | Correct |
|---|---|---|
| program_id | S003-P005 | S003-P005 |
| program_name | Tags & Watch Lists (D38+D26) | Watch Lists (D26) |
| notes | — | D38 (tag_management) relocated to S005. See ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v1.0.0.md §A1. |

**Reason:** D38 has been approved by Nimrod (2026-03-02) to move from S003 to S005. Tags are a UX enhancement, not a foundational S003 dependency. Full rationale in roadmap amendment directive.

**Downstream effect:** S003-P005 now covers D26 only. No WP IDs change (they don't exist yet). Roadmap page list for S003 updates accordingly (handled by roadmap amendment directive separately).

---

## CORRECTION 3 — Program Registry: Add tag assignment note to S005

**File:** `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`

For the S005 stage section or notes column (whichever applicable):

Add this note to S005 stage context:
```
- D38 (tag_management): added to S005 from S003 per architectural decision 2026-03-02
- D26-Phase2 (watch_list enhancement): new WP in S005 after D29 GATE_8 PASS
  (scope: ATR, Position, P&L%, P&L columns; flag_color filter enhancement)
- Tag assignment: built inline per entity page as each page is built (S003 onward per entity)
```

---

## CORRECTION 4 — WP Registry: S002-P003-WP002 Scope Extension Note

**File:** `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md`

Update the `active_marker_reason` for S002-P003-WP002:

| Field | Current | Add |
|---|---|---|
| active_marker_reason | "S002-P003; GATE_7 REJECT on WP002 (CODE_CHANGE_REQUIRED); canonical remediation directives approved and converted to Team 10 execution package" | Append: "; scope extended 2026-03-02: +background_task_orchestration (APScheduler migration) +display_name on user_tickers; ref: ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION_v1.0.0.md + G7_ADDENDUM_v1.0.0.md" |

---

## ALSO DUE FROM TEAM 170 (from roadmap amendment directive)

Per `ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v1.0.0.md` (already routed to you):
- Update `PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md` — amendments A1 through A5
- Produce LOD400 contract for: scheduler_registry.py, job_runner.py, extended job_run_log DDL, Background Jobs UI section

**Priority order for Team 170 today:**
1. Program Registry corrections (this document) — URGENT: needed before next gate event
2. WP Registry scope note (this document) — URGENT: needed before GATE_4 submission
3. Roadmap updates (roadmap amendment directive) — HIGH: before S003 GATE_0
4. LOD400 background tasks contract — NORMAL: before Team 20 submits Phase B evidence

---

*log_entry | TEAM_00 | CANONICAL_ALIGNMENT_INSTRUCTIONS | ACTIVE | 2026-03-02*
