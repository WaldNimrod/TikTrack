---
project_domain: AGENTS_OS
id: TEAM_100_TO_TEAM_170_PIPELINE_RESILIENCE_MANDATE_v1.0.0
from: Team 100 (AOS Domain Architects)
to: Team 170 (Governance & Registry Documentation)
cc: Team 00 (Chief Architect), Team 101 (IDE Architecture Authority)
date: 2026-03-17
status: ACTIVE — AWAITING_IMPLEMENTATION
authority: LOD400 FINALIZED — TEAM_100_PIPELINE_RESILIENCE_LOD400_DRAFT_v1.0.0
priority: P1
program: S003-PXX (pending registry assignment)
---

# Mandate: Pipeline Resilience — Governance Documentation
## Team 100 → Team 170

---

## §0 — Dependency Note

Your deliverables in this mandate are **parallel to Team 61's implementation work** and should proceed concurrently. None of your documents depend on Team 61's code being complete. However, all your documents must be ready by the time Team 50 begins QA (GATE_4), as they are part of the governance packet.

---

## §1 — Scope

You are producing **four governance documents** for the Pipeline Resilience Package:

| # | Document | Purpose |
|---|----------|---------|
| D-01 | WSM Auto-Write Protocol | Documents the auto-write rules, constraints, and exception procedure |
| D-02 | Route Alias Map | Documents all accepted `route_recommendation` values (full alias table) |
| D-03 | Team 191 Git Procedures | Documents authorized git commit patterns and prohibitions |
| D-04 | Hotfix Acknowledgment | Logs Team 101's Item 4b regex hotfix in pipeline governance |

---

## §2 — Document D-01: WSM Auto-Write Protocol

**File:** `_COMMUNICATION/team_170/TEAM_170_WSM_AUTO_WRITE_PROTOCOL_v1.0.0.md`

**Required Sections:**

### Section 1 — Overview
Explain that as of the Pipeline Resilience Package, the WSM `CURRENT_OPERATIONAL_STATE` table is maintained automatically by `wsm_writer.py` on every pipeline gate advancement. Manual updates are no longer the primary mechanism.

### Section 2 — What is Auto-Written
List the exact fields that the pipeline auto-writes (from LOD400 §3.3):
- `active_flow`
- `active_work_package_id`
- `in_progress_work_package_id`
- `current_gate`
- `active_program_id`
- `last_closed_work_package_id` (on GATE_8 PASS only)
- `last_closed_program_id` (on GATE_8 PASS only)

### Section 3 — What is NEVER Auto-Written
State the append-only invariant for `log_entry` lines:
> **IRON RULE:** `log_entry` lines in the WSM are NEVER overwritten or deleted by any automated process. The pipeline ONLY appends new log_entry lines. This rule cannot be overridden by any team, gate, or tool.

### Section 4 — `EXPLICIT_WSM_PATCH` Tag
Document the exception procedure for manual WSM edits made outside the pipeline:

> Any team performing a manual WSM edit (outside of the pipeline auto-writer) MUST:
> 1. Add `EXPLICIT_WSM_PATCH` to the `log_entry` that records the change
> 2. Include the reason for the manual patch in the log_entry
>
> Format: `**log_entry | TEAM_XX | EXPLICIT_WSM_PATCH | reason | YYYY-MM-DD**`
>
> Failure to tag a manual patch makes the change invisible to audit tools and is a governance violation.

### Section 5 — When Auto-Write Is Suppressed
Document that the auto-write fires only when `gate_state == null`. When `gate_state == "PASS_WITH_ACTION"` or `"OVERRIDE"`, the WSM is NOT written — the pipeline remains in a holding state until the actions are cleared.

### Section 6 — Failure Handling
Document that WSM write failures are non-blocking:
> If `wsm_writer.py` encounters an error (e.g., a WSM field is missing or the file is locked), a WARN event is written to `pipeline_events.jsonl` and pipeline advancement continues. The pipeline MUST NOT be blocked by WSM write failures.

---

## §3 — Document D-02: Route Alias Map

**File:** `_COMMUNICATION/team_170/TEAM_170_ROUTE_ALIAS_MAP_v1.0.0.md`

**Required Content:**

Produce a complete table of all accepted `route_recommendation` values that teams may include in their verdict files. Source: `_ROUTE_ALIAS` dict in `pipeline.py` lines ~709–720.

The table must include:

| Value (as written by team) | Normalized to | Meaning |
|---------------------------|---------------|---------|
| `doc` | `doc` | Documentation / governance issues only. No code changes. |
| `full` | `full` | Substantial issues. Full development cycle restart. |
| `doc_only` | `doc` | Alias for `doc` |
| `doc_only_loop` | `doc` | Alias for `doc` (self-loop variant) |
| `doconly` | `doc` | Alias for `doc` (no-underscore variant) |
| `loop` | `doc` | GATE_0/1 self-loop = doc route |
| `reject` | `full` | Alias for `full` |
| `revision` | `full` | Alias for `full` |
| `artifacts_only` | `doc` | Team 101 preferred term — accepted |
| `full_cycle` | `full` | Team 101 preferred term — accepted |

**Also include a clarifying note:**
> `"doc"` in this context means documentation/governance artifacts — NOT Word (.doc) files. The terms `doc` and `full` are internal pipeline routing identifiers.

**Also document the `MANUAL_ROUTING_REQUIRED` fallback:**
If no `route_recommendation` field is found in the verdict file, the operator sees a manual routing prompt with `./pipeline_run.sh route doc|full "reason"`. Teams should always include `route_recommendation` to avoid this.

---

## §4 — Document D-03: Team 191 Git Procedures

**File:** `_COMMUNICATION/team_170/TEAM_170_TEAM_191_GIT_PROCEDURES_v1.0.0.md`

**Required Sections:**

### Section 1 — Role of Team 191
Team 191 is the Git Operations agent. It executes all git commits and pushes in the pipeline. It NEVER makes implementation decisions — it receives an explicit file list and executes.

### Section 2 — The `git add .` Prohibition (IRON RULE)
> **`git add .` is ARCHITECTURALLY PROHIBITED in all pipeline-triggered git operations.**
>
> Reasons:
> 1. **Credential risk:** Agent workspaces may contain `.env` files, API keys, or secrets written during execution. `git add .` would commit these.
> 2. **Noise commits:** `_COMMUNICATION/` contains hundreds of markdown governance files. Including them creates enormous, unreadable commits.
> 3. **State file corruption:** `pipeline_state_*.json` files would be committed indiscriminately, overwriting intentional manual corrections.
> 4. **Large file risk:** Logs, database dumps, or generated assets could be accidentally committed.
>
> **All pipeline commits must specify files explicitly.**

### Section 3 — Pre-GATE_4 Commit (Implementation Closure)
Triggered when `./pipeline_run.sh pass` at `CURSOR_IMPLEMENTATION` detects uncommitted tracked changes.

**Team 191 procedure:**
1. Read the file list from the pipeline block output
2. Execute: `git add <file1> <file2> ...` (explicit list only)
3. Execute: `git commit -m "impl: [WP_ID] implementation complete"`
4. Return to operator: confirm commit hash

**Commit message format:** `impl: [WP_ID] implementation complete`
Example: `impl: S003-P001-WP001 implementation complete`

### Section 4 — GATE_8 Closure Push
Triggered after `./pipeline_run.sh pass` at `GATE_8` displays the closure checklist.

**Team 191 procedure:**
1. Obtain the closure packet file list from Team 70's AS_MADE_REPORT
2. Execute: `git add <as_made_report.md> <gate8_verdict.md> <other_closure_files>` (explicit list)
3. Execute: `git commit -m "closure: [WP_ID] GATE_8 DOCUMENTATION_CLOSED"`
4. Execute: `git push origin HEAD`
5. Return to operator: confirm push result and commit hash

**Commit message format:** `closure: [WP_ID] GATE_8 DOCUMENTATION_CLOSED`

### Section 5 — What Team 191 NEVER Does
- Never stages untracked files from `_COMMUNICATION/`
- Never stages `pipeline_state_*.json` or `STATE_SNAPSHOT.json`
- Never stages `.env` or any file in `.gitignore`
- Never amends previous commits
- Never force-pushes

---

## §5 — Document D-04: Hotfix Acknowledgment

**File:** `_COMMUNICATION/team_170/TEAM_170_PIPELINE_HOTFIX_LOG_v1.0.0.md`

**Required Content:**

A governance log for pipeline hotfixes applied outside the standard gate cycle.

Produce an initial entry for Team 101's Item 4b fix:

```
## Hotfix Log

| ID | Date | Team | Item | Change | Verified By |
|----|------|------|------|--------|-------------|
| HF-001 | 2026-03-17 | Team 101 | Item 4b — Parser hardening | `_extract_route_recommendation()` in `pipeline.py`: removed `re.MULTILINE` flag from route_recommendation regex. Regex now searches anywhere in text content regardless of indentation. | Team 100 (code read verified — 2026-03-17) |
```

Add an explanatory note:
> Hotfixes are applied when a confirmed defect would block active pipeline operations and the standard gate cycle overhead exceeds the risk of the change. All hotfixes require:
> 1. Team 101 or Team 100 identification of the defect
> 2. Code-level verification by the other architectural team
> 3. Entry in this log
> 4. No hotfix may touch pipeline state files, WSM, or governance registries

---

## §6 — Deliverable Checklist

| # | File | Section dependency |
|---|------|--------------------|
| D-01 | `TEAM_170_WSM_AUTO_WRITE_PROTOCOL_v1.0.0.md` | LOD400 §3 |
| D-02 | `TEAM_170_ROUTE_ALIAS_MAP_v1.0.0.md` | LOD400 §5.1 |
| D-03 | `TEAM_170_TEAM_191_GIT_PROCEDURES_v1.0.0.md` | LOD400 §4 |
| D-04 | `TEAM_170_PIPELINE_HOTFIX_LOG_v1.0.0.md` | LOD400 §5.2 |

All four files are required before GATE_4.

---

## §7 — Return Contract

Submit:
```
id: TEAM_170_PIPELINE_RESILIENCE_DOCS_REPORT_v1.0.0
project_domain: AGENTS_OS
gate: GATE_4 (parallel to Team 61)
verdict: PASS | FAIL
documents_completed: [list]
documents_failed: [list with reason]
```

File: `_COMMUNICATION/team_170/TEAM_170_PIPELINE_RESILIENCE_DOCS_REPORT_v1.0.0.md`

---

**log_entry | TEAM_100 | MANDATE_ISSUED | TO_TEAM_170 | PIPELINE_RESILIENCE | v1.0.0 | 2026-03-17**
