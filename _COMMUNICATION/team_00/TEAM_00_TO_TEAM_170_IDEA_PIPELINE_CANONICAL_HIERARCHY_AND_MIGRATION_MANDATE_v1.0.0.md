---
document_id:   TEAM_00_TO_TEAM_170_IDEA_PIPELINE_CANONICAL_HIERARCHY_AND_MIGRATION_MANDATE_v1.0.0
from:          Team 00 — Chief Architect
to:            Team 170 (Spec & Governance)
cc:            Team 190 (audit validation), Team 10 (awareness)
date:          2026-03-15
authority:     Team 00 constitutional authority + Nimrod approval (IDEA-019 fate decision)
subject:       IDEA-019 Option C — Canonical Task Hierarchy ADR + Floating Task File Migration
---

# MANDATE — Canonical Task Hierarchy & Idea Pipeline Migration

## Background

IDEA-019 (Task List Canonicalization) has been decided: **fate = immediate, Option C**.

The problem: informal task lists, "pending items" documents, team working notes, and ad-hoc
checklists exist scattered across `_COMMUNICATION/` team folders. These create phantom work items
that live outside the governance pipeline, are never formally tracked, and either get lost or
create confusion about what is "open." This is the architectural gap IDEA-019 addresses.

**Nimrod's decision (2026-03-15):**
> "An idea cannot pass to closed status without LOD200 being done. Once LOD200 is approved, the
> idea can receive its correct final WP assignment and be updated as closed."

This mandate implements the governance layer that enforces this decision across the full project.

---

## Option C Scope

Option C consists of three deliverables:

1. **Canonical Hierarchy ADR** — defines the single authoritative task hierarchy (this document IS the
   ADR source; Team 170 produces the locked file)
2. **Floating Task File Audit + Migration** — Team 170 audits all team folders and registers any
   floating open-item files into PHOENIX_IDEA_LOG
3. **LOD200_PENDING Usage Guide** — authored and distributed to all teams so the `lod200_pending`
   status is applied correctly going forward

---

## Deliverable 1 — Canonical Task Hierarchy ADR

### Title
`ARCHITECT_DIRECTIVE_TASK_HIERARCHY_CANON_v1.0.0.md`

### Path
`_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_TASK_HIERARCHY_CANON_v1.0.0.md`

### Content Required

Team 170 shall produce a locked ADR with the following content (Team 00 architecture, Team 170 writes):

#### §1 — Canonical Hierarchy (Iron Rule)

All work items in the Phoenix project exist in exactly one of these levels:

| Level | Container | Tool | Owner |
|---|---|---|---|
| **Level 0 — Idea** | PHOENIX_IDEA_LOG.json | `idea_submit.sh` | Team 00 / submitter |
| **Level 1 — Work Package** | PHOENIX_PROGRAM_REGISTRY | Gate pipeline | Team 170 |
| **Level 2 — Stage** | PHOENIX_PORTFOLIO_ROADMAP + WSM | WSM | Team 10 |
| **Level 3 — Portfolio** | PHOENIX_MASTER_SSM | SSM | Team 00 |

**Iron Rule:** There is no Level -1. No floating task file, team inbox checklist, or ad-hoc
"pending items" document constitutes a governed work item. Items not registered at Level 0 or
above DO NOT EXIST in the governance system.

#### §2 — lod200_pending Status (Iron Rule)

An idea with `fate = new_wp` CANNOT reach `status = decided` until:
1. LOD200 has been authored and approved by Team 100
2. The WP has been registered in the Program Registry (Team 170)
3. `delivery_ref` has been set to the LOD200 approval document path

Until these conditions are met, the idea MUST remain at `status = lod200_pending`.

The status sequence for `fate = new_wp` ideas:
```
open → in_execution (Team 00 mandate issued) → lod200_pending (fate=new_wp set)
    → decided (LOD200 approved + WP registered + delivery_ref set)
```

#### §3 — Prohibition on Floating Task Files

**Iron Rule:** No team shall maintain a standing "open items list," "pending tasks document," or
equivalent file outside the canonical hierarchy.

Permitted document types in team folders:
- Activation prompts (point-in-time — not maintained as living lists)
- Mandates and structured responses (formal governance communications)
- Working notes (session-scoped, clearly dated — not maintained standing lists)
- AS_MADE documentation (Team 70)
- QA reports (Teams 50/51)
- Validation verdicts (Teams 90/190)

**Prohibited in team folders:**
- "OPEN_ITEMS.md" or similar
- "TODO_LIST.md" or similar
- "PENDING_TASKS.md" or similar
- Any document whose primary purpose is listing work not-yet-done outside the idea pipeline

Exception: Team 10 WSM update notes (these are WSM-adjacent, not task lists).

#### §4 — What To Do With a New Idea

Any team member who identifies a potential work item that is NOT already in the pipeline:

1. Submit via `./idea_submit.sh` (see help modal in PIPELINE_DASHBOARD.html)
2. Status is automatically `open` — Team 00 reviews and decides fate at next session
3. If it becomes a WP: status transitions through `lod200_pending` → `decided`
4. If it is an immediate action: Team 00 issues a direct mandate; `delivery_ref` set when delivered

#### §5 — Existing Ideas in lod200_pending (as of 2026-03-15)

These ideas are currently awaiting LOD200:

| ID | Title | Notes |
|---|---|---|
| IDEA-001 | S003-P007 Notifications + Push Alerts | LOD200 not authored; queued for later stage |
| IDEA-007 | S002-P004 Admin Review | Absorbed into D40 (S003-P003); LOD200 = D40 section of S003-P003 LOD200 |
| IDEA-018 | S004 Stage Transitions | Stage-level WP; S4 candidate; LOD200 not yet authored |

---

## Deliverable 2 — Floating Task File Audit + Migration

### Scope

Team 170 shall audit ALL files in `_COMMUNICATION/` (all team subfolders) for documents that
function as floating task lists. For each such file found:

**Step A — Assess:**
- Is the content entirely historical/already-decided? → No action required, leave in place
- Does it contain open/pending items? → Must be registered in PHOENIX_IDEA_LOG

**Step B — Register:**
- For each open item found, submit a new IDEA entry via `./idea_submit.sh`:
  - `--submitted_by "team_170_migration"`
  - `--notes "Migrated from: [source file path]"`
  - `--urgency` based on content (default: low if unclear)
  - `--domain` as appropriate

**Step C — Archive:**
- After all open items from a floating file are registered in the IDEA_LOG, add a header to the
  file: `# ARCHIVED — items migrated to PHOENIX_IDEA_LOG [date]. See IDEA-XXX through IDEA-YYY.`
- Do NOT delete the file — archive it in place

### Known Files to Review (non-exhaustive — Team 170 to add any found)

Team 170 should check at minimum:
- All `team_*/` subdirectories for any `PENDING_*.md`, `TODO_*.md`, `OPEN_*.md` patterns
- Team 10 inbox / WSM notes that may contain open action items not in the pipeline
- Any document with title containing: "backlog", "queue", "open items", "pending", "checklist"

### Output

`_COMMUNICATION/team_170/TEAM_170_FLOATING_TASK_AUDIT_RESULT_v1.0.0.md`

Structure:
```
## Files Reviewed
[list]

## Items Migrated
[IDEA-XXX: title, source file]

## Files Archived
[list]

## Clean Bill — No Floating Task Files Remain
```

---

## Deliverable 3 — LOD200_PENDING Usage Guide

### Title
`TEAM_170_TO_ALL_TEAMS_LOD200_PENDING_USAGE_GUIDE_v1.0.0.md`

### Path
`_COMMUNICATION/team_170/TEAM_170_TO_ALL_TEAMS_LOD200_PENDING_USAGE_GUIDE_v1.0.0.md`

### Content Required

A short (≤ 1 page) guide distributed to all teams:

```
## lod200_pending — When and Why

A `lod200_pending` idea is one where:
- Team 00 has decided fate = new_wp (this idea will become a Work Package)
- But no LOD200 has been authored/approved yet
- The WP does not yet appear in the Program Registry

This is NOT a blocked state — it is the correct state for any new_wp idea that is not yet
ready for LOD400 / GATE_0.

## How it gets resolved
1. Team 00 authors the LOD200 (in a dedicated LOD200 session)
2. Team 100 reviews and approves it
3. Team 170 registers the WP in the Program Registry
4. Team 170 updates the IDEA entry: status → decided, delivery_ref → [LOD200 approval doc path]

## What you should NOT do
- Do NOT create informal documents tracking "what the WP will do" outside the LOD200
- Do NOT start any implementation for a lod200_pending idea
- Do NOT advance the idea to decided until all 3 steps above are complete
```

---

## Execution Sequence

```
Step 1: Write ARCHITECT_DIRECTIVE_TASK_HIERARCHY_CANON_v1.0.0.md
        Path: _COMMUNICATION/_Architects_Decisions/
        Trigger: IMMEDIATE — this mandate

Step 2: Run floating task file audit across all _COMMUNICATION/ subfolders
        Output: TEAM_170_FLOATING_TASK_AUDIT_RESULT_v1.0.0.md
        Trigger: After Step 1

Step 3: Write + distribute LOD200_PENDING usage guide
        Output: TEAM_170_TO_ALL_TEAMS_LOD200_PENDING_USAGE_GUIDE_v1.0.0.md
        Trigger: After Step 1 (may run parallel with Step 2)

Step 4: Notify Team 00 (architect inbox) when all 3 deliverables complete
        Path: _COMMUNICATION/_ARCHITECT_INBOX/
        File: TEAM_170_TO_TEAM_00_IDEA_PIPELINE_HIERARCHY_MANDATE_COMPLETE_v1.0.0.md
```

---

## IDEA-019 Delivery Reference

This mandate is the delivery artifact for IDEA-019.

```
IDEA-019 → fate: immediate → delivery_ref:
  _COMMUNICATION/team_00/TEAM_00_TO_TEAM_170_IDEA_PIPELINE_CANONICAL_HIERARCHY_AND_MIGRATION_MANDATE_v1.0.0.md
```

---

**log_entry | TEAM_00 | MANDATE_ISSUED | IDEA-019 | OPTION_C | CANONICAL_HIERARCHY_AND_MIGRATION | 2026-03-15**
