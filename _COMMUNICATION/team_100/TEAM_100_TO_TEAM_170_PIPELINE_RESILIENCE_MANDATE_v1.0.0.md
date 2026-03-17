---
project_domain: AGENTS_OS
id: TEAM_100_TO_TEAM_170_PIPELINE_RESILIENCE_MANDATE_v1.0.0
from: Team 100 (AOS Domain Architects)
to: Team 170 (Documentation & Governance Team)
cc: Team 00 (Chief Architect), Team 101 (IDE Architecture Authority)
date: 2026-03-17
status: ACTIVE — AWAITING_IMPLEMENTATION
authority: LOD400 FINALIZED — Team 00 APPROVED 2026-03-17
lod400_ref: TEAM_100_PIPELINE_RESILIENCE_LOD400_DRAFT_v1.0.0
priority: HIGH
---

# Mandate — Team 170 | Pipeline Resilience Governance Documentation
## Issued by Team 100 (AOS Domain Architects)

---

## Your Role in This Mandate

You are **Team 170 (Documentation & Governance Team)**. Your deliverables are governance documents that accompany Team 61's implementation. These documents encode the architectural decisions as durable protocol — not just implementation notes.

**Four deliverables are required.** All go in your standard output folder `_COMMUNICATION/team_170/`.

---

## Deliverable 1 — WSM Auto-Write Protocol

**Filename:** `TEAM_170_WSM_AUTO_WRITE_PROTOCOL_v1.0.0.md`

This document becomes the canonical reference for all future work on the WSM auto-write system. It must cover:

### Required Sections

**§1 — Overview**
The `wsm_writer.py` module in `agents_os_v2/orchestrator/` auto-updates the `CURRENT_OPERATIONAL_STATE` table in `PHOENIX_MASTER_WSM_v1.0.0.md` on every successful gate advancement. This eliminates the historical drift vector of manual WSM updates.

**§2 — Auto-Managed Fields**
List of exactly which fields in the `CURRENT_OPERATIONAL_STATE` table are managed by `wsm_writer.py`. Use this table:

| Field | Auto-managed | Source |
|-------|-------------|--------|
| `active_flow` | ✅ Yes | Derived from WP ID + gate + result |
| `active_work_package_id` | ✅ Yes | `state.work_package_id` |
| `in_progress_work_package_id` | ✅ Yes | `state.work_package_id` |
| `last_closed_work_package_id` | ✅ Yes (GATE_8 PASS only) | `state.work_package_id` |
| `current_gate` | ✅ Yes | `state.current_gate` after advance |
| `active_program_id` | ✅ Yes | Derived (WP prefix before `-WP`) |
| `phase_owner_team` | ✅ Yes | `GATE_CONFIG[next_gate].owner` |
| `next_required_action` | ✅ Yes | Gate-specific message |
| `next_responsible_team` | ✅ Yes | `GATE_CONFIG[next_gate].owner` |
| All `log_entry` lines | ❌ Append-only | See §3 |

**§3 — Iron Rule: log_entry Lines Are Append-Only**

This is the most critical safety constraint in the system.

`**log_entry | ...**` lines at the bottom of the WSM represent the project's immutable audit trail. The `wsm_writer.py` module ONLY appends new log_entry lines — it NEVER rewrites or deletes existing ones.

Technical guarantee: The `_update_table_field()` function in `wsm_writer.py` uses a regex that targets only `| field | value |` table rows. Log_entry lines contain `**` markers and do not match this pattern. They cannot be modified by the auto-writer.

Manual edits that change or delete existing log_entry lines are a governance violation. If such an edit is discovered, it must be reported to Team 00 immediately.

**§4 — EXPLICIT_WSM_PATCH Tag**

Any manual edit to the `CURRENT_OPERATIONAL_STATE` block that is NOT performed by `wsm_writer.py` MUST:
1. Be accompanied by a new log_entry line appended at the end of the block
2. That log_entry MUST contain the tag `EXPLICIT_WSM_PATCH`

Format:
```
**log_entry | TEAM_XX | EXPLICIT_WSM_PATCH | <reason> | YYYY-MM-DD**
```

This tag makes manual patches visible in the audit trail and distinguishes them from pipeline-automated entries.

**§5 — Idempotency Guarantee**

Running `./pipeline_run.sh` multiple times with no state change produces no WSM diff. The module compares computed values against current values before writing.

**§6 — Non-Blocking Failure Protocol**

If `wsm_writer.py` encounters an error (WSM field not found, file not writable, etc.):
1. A `WARN` severity event is emitted to `pipeline_events.jsonl`
2. The pipeline continues without interruption
3. The error does NOT block gate advancement

Operators should monitor `pipeline_events.jsonl` for `WSM_WRITE_WARN` events and resolve structural WSM issues at the next available opportunity.

**§7 — Guard: PASS_WITH_ACTION Cycle**

The auto-writer does NOT fire when `gate_state = "PASS_WITH_ACTION"`. WSM is written only when the cycle completes (`actions_clear` or `override`).

---

## Deliverable 2 — Team 191 Git Procedures

**Filename:** `TEAM_170_TEAM_191_GIT_PROCEDURES_v1.0.0.md`

Documents the git commit procedures for Team 191 as triggered by the pipeline. Must cover:

### Required Sections

**§1 — Overview**
Team 191 is responsible for all git commits and pushes in the pipeline workflow. Team 191 is triggered by two pipeline events: pre-GATE_4 implementation commit and GATE_8 closure push.

**§2 — Pre-GATE_4 Implementation Commit**

Triggered when: Team 61 has completed CURSOR_IMPLEMENTATION and runs `./pipeline_run.sh pass`. If uncommitted tracked changes exist, the pipeline BLOCKS with a file list and displays commit instructions.

Procedure:
1. Read the file list displayed by `pipeline_run.sh`
2. Stage ONLY the listed files: `git add <file1> <file2> ...`
3. Commit: `git commit -m "impl: [WP_ID] implementation complete"`
   - Replace `[WP_ID]` with the actual work package ID (e.g., `S003-P002-WP001`)
4. Retry advance: `./pipeline_run.sh --domain agents_os pass`

**§3 — GATE_8 Closure Push**

Triggered when: `./pipeline_run.sh pass` advances GATE_8 successfully. The pipeline displays a closure push checklist.

Procedure:
1. Identify closure packet files from Team 70 AS_MADE_REPORT and Team 90 GATE_8 verdict
2. Stage only those files: `git add <as_made_file.md> <gate8_verdict.md> ...`
3. Commit: `git commit -m "closure: [WP_ID] GATE_8 DOCUMENTATION_CLOSED"`
4. Push: `git push origin HEAD`

**§4 — Iron Rule: `git add .` is PROHIBITED**

`git add .` is permanently prohibited in the pipeline context. Reasons:

1. **Credential exposure risk:** An `.env` file or API key written during agent execution would be committed and pushed, creating a live security incident.
2. **State file contamination:** `pipeline_state_*.json` files in `_COMMUNICATION/agents_os/` would be committed, potentially overwriting a manually corrected state.
3. **Communication artifact noise:** `_COMMUNICATION/` contains hundreds of markdown governance files. Committing them creates enormous, unreadable commit diffs.
4. **Unintended large files:** Generated assets, logs, or DB dumps accidentally written to the workspace would be committed.

All `git add` commands MUST specify explicit file paths. This rule has no exceptions.

**§5 — Prohibited Operations**

Team 191 MUST NEVER perform:
- `git add .` or `git add -A`
- `git push --force` to `main` or `master`
- `git reset --hard` without explicit Team 00 authorization
- `git commit --amend` on pushed commits

---

## Deliverable 3 — Route Alias Map Documentation

**Filename:** `TEAM_170_PIPELINE_ROUTE_ALIAS_MAP_v1.0.0.md`

Documents all accepted `route_recommendation` values for gate verdict documents. This eliminates team confusion about accepted values.

### Required Content

**§1 — Context**
When a gate FAIL occurs, the verdict document MUST contain a `route_recommendation` field that tells the pipeline where to route. The pipeline's `_extract_route_recommendation()` function in `pipeline.py` reads this field and normalizes it via an alias map.

**§2 — Canonical Values**
The two canonical route types are:
- `doc` — Documentation/governance artifacts only. No code changes needed.
- `full` — Substantial issues requiring a full development cycle (return to G3_PLAN).

**§3 — Full Alias Map**
All values accepted by the pipeline, normalized to their canonical form:

| Input Value | Normalized To | Notes |
|-------------|--------------|-------|
| `doc` | `doc` | Canonical |
| `full` | `full` | Canonical |
| `doc_only` | `doc` | Variant |
| `doc_only_loop` | `doc` | Variant |
| `doconly` | `doc` | Variant |
| `loop` | `doc` | GATE_0/1 self-loop (returns to same gate) |
| `reject` | `full` | Equivalent to full cycle |
| `revision` | `full` | Equivalent to full cycle |
| `artifacts_only` | `doc` | Team 101 preferred terminology |
| `full_cycle` | `full` | Team 101 preferred terminology |

**§4 — Format in Verdict Documents**
The field can appear in any of these formats (all parsed correctly):
```
route_recommendation: doc
route_recommendation: full
route_recommendation - doc
route_recommendation = full_cycle
```
The field can appear anywhere in the document body — not just at the top. The parser searches the entire document content.

**§5 — What Happens When Missing**
If no `route_recommendation` field is found in the verdict file:
- Pipeline displays: "MANUAL ROUTING REQUIRED"
- Operator uses: `./pipeline_run.sh route doc "reason"` or `./pipeline_run.sh route full "reason"`

Teams should always include `route_recommendation` in verdict documents to enable automatic routing.

---

## Deliverable 4 — Team 101 Hotfix Acknowledgment

**Filename:** Update `TEAM_170_PIPELINE_GOVERNANCE_LOG_v1.0.0.md` (create if it does not exist)

Add a log section acknowledging the Team 101 architectural hotfix:

```markdown
## Hotfix Log

### HOTFIX-001 — Parser Hardening (2026-03-17)
**Applied by:** Team 101 (IDE Architecture Authority)
**Scope:** `agents_os_v2/orchestrator/pipeline.py` — `_extract_route_recommendation()`
**Change:** Removed `re.MULTILINE` flag from route_recommendation regex. Parser now
            searches entire document content regardless of line position or indentation.
**Verified by:** Team 100 direct code read (2026-03-17)
**Status:** ✅ CONFIRMED IN CODEBASE
**ADR reference:** TEAM_100_PIPELINE_RESILIENCE_LOD400_DRAFT_v1.0.0 §5.2
```

---

## Delivery Contract

Upon completion, Team 170 submits to `_COMMUNICATION/team_170/`:

```
TEAM_170_PIPELINE_RESILIENCE_GOVERNANCE_REPORT_v1.0.0.md
```

Must contain:
1. Confirmation that all 4 deliverables are created/updated
2. File paths for each deliverable
3. Note of any edge cases encountered during documentation

---

**log_entry | TEAM_100 | TO_TEAM_170 | PIPELINE_RESILIENCE_MANDATE | v1.0.0 | ISSUED | 2026-03-17**
