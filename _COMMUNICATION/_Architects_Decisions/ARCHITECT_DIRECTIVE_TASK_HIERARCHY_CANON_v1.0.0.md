---
project_domain: SHARED (TIKTRACK + AGENTS_OS)
id: ARCHITECT_DIRECTIVE_TASK_HIERARCHY_CANON_v1.0.0
from: Team 00 (Chief Architect)
authority: Team 00 constitutional authority + Nimrod approval (IDEA-019)
date: 2026-03-15
status: LOCKED
source_mandate: TEAM_00_TO_TEAM_170_IDEA_PIPELINE_CANONICAL_HIERARCHY_AND_MIGRATION_MANDATE_v1.0.0
---

# ARCHITECT_DIRECTIVE — Canonical Task Hierarchy

## §1 — Canonical Hierarchy (Iron Rule)

All work items in the Phoenix project exist in exactly one of these levels:

| Level | Container | Tool | Owner |
|-------|-----------|------|-------|
| **Level 0 — Idea** | PHOENIX_IDEA_LOG.json | `idea_submit.sh` | Team 00 / submitter |
| **Level 1 — Work Package** | PHOENIX_PROGRAM_REGISTRY | Gate pipeline | Team 170 |
| **Level 2 — Stage** | PHOENIX_PORTFOLIO_ROADMAP + WSM | WSM | Team 10 |
| **Level 3 — Portfolio** | PHOENIX_MASTER_SSM | SSM | Team 00 |

**Iron Rule:** There is no Level -1. No floating task file, team inbox checklist, or ad-hoc "pending items" document constitutes a governed work item. Items not registered at Level 0 or above DO NOT EXIST in the governance system.

---

## §2 — lod200_pending Status (Iron Rule)

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

---

## §3 — Prohibition on Floating Task Files

**Iron Rule:** No team shall maintain a standing "open items list," "pending tasks document," or equivalent file outside the canonical hierarchy.

**Permitted** document types in team folders:
- Activation prompts (point-in-time — not maintained as living lists)
- Mandates and structured responses (formal governance communications)
- Working notes (session-scoped, clearly dated — not maintained standing lists)
- AS_MADE documentation (Team 70)
- QA reports (Teams 50/51)
- Validation verdicts (Teams 90/190)

**Prohibited** in team folders:
- "OPEN_ITEMS.md" or similar
- "TODO_LIST.md" or similar
- "PENDING_TASKS.md" or similar
- Any document whose primary purpose is listing work not-yet-done outside the idea pipeline

Exception: Team 10 WSM update notes (these are WSM-adjacent, not task lists).

---

## §4 — What To Do With a New Idea

Any team member who identifies a potential work item that is NOT already in the pipeline:

1. Submit via `./idea_submit.sh` (see help modal in PIPELINE_DASHBOARD.html)
2. Status is automatically `open` — Team 00 reviews and decides fate at next session
3. If it becomes a WP: status transitions through `lod200_pending` → `decided`
4. If it is an immediate action: Team 00 issues a direct mandate; `delivery_ref` set when delivered

---

## §5 — Existing Ideas in lod200_pending (as of 2026-03-15)

These ideas are currently awaiting LOD200:

| ID | Title | Notes |
|----|-------|------|
| IDEA-001 | S003-P007 Notifications + Push Alerts | LOD200 not authored; queued for later stage |
| IDEA-007 | S002-P004 Admin Review | Absorbed into D40 (S003-P003); LOD200 = D40 section of S003-P003 LOD200 |
| IDEA-018 | S004 Stage Transitions | Stage-level WP; S4 candidate; LOD200 not yet authored |

---

**log_entry | TEAM_170 | ARCHITECT_DIRECTIVE_TASK_HIERARCHY_CANON | v1.0.0_AUTHORED_PER_MANDATE | 2026-03-15**
