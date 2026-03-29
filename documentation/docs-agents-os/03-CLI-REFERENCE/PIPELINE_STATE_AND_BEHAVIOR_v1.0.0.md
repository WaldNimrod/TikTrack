# Pipeline State and Behavior Reference
## documentation/docs-agents-os/03-CLI-REFERENCE/PIPELINE_STATE_AND_BEHAVIOR_v1.0.0.md

**project_domain:** AGENTS_OS  
**owner:** Team 170  
**date:** 2026-03-15  
**source:** TEAM_00_TO_TEAM_170_S002_P005_WP001_DOCS_UPDATE_MANDATE_v1.0.0  
**status:** ACTIVE  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP001 |
| mandate_type | DOCS_UPDATE |
| doc_version | 1.0.0 |

---

## DOC-01 — Domain Resolution: PipelineState.load()

### Component
**Source:** `agents_os_v2/orchestrator/state.py` — `PipelineState.load(domain=None)`

### Behavior
**Added/Changed:** 2026-03-15

`PipelineState.load(domain=None)` implements auto-detect logic with three resolution cases:

| Case | Condition | Behavior |
|------|-----------|----------|
| **Explicit** | `domain` arg or `PIPELINE_DOMAIN` env set | Load directly — no change from prior behavior |
| **Single active** | One domain past GATE_0, no arg/env | Auto-select deterministically — silent, no message |
| **Ambiguous** | Two domains active, no arg/env | **HARD BLOCK** — print clear error to stderr + `sys.exit(1)` |
| **None active** | No domain past GATE_0 | Legacy fallback to `pipeline_state.json` / empty state |

### Active Definition
**Active** = `work_package_id` not empty and not `"REQUIRED"` **and** `current_gate` not in `{"", "GATE_0", "NOT_STARTED"}`.

### Domain Resolution Rules (summary)
```
1. Explicit arg > PIPELINE_DOMAIN env > auto-detect
2. Auto-detect: scans tiktrack + agents_os state files
   - 1 active  → auto-select (deterministic)
   - 0 active  → legacy fallback
   - 2+ active → BLOCK with clear error; add --domain flag

Active = work_package_id set + current_gate not in {GATE_0, NOT_STARTED, ""}
```

### Usage Example
```bash
# Explicit domain — always works
./pipeline_run.sh --domain agents_os pass

# Auto-detect — works when exactly one domain is active
./pipeline_run.sh pass

# When 2+ active — script exits with error; user must add --domain
```

---

## DOC-02 — GATE_1 FAIL Clears lld400_content

### Component
**Source:** `pipeline_run.sh` — `fail` subcommand

### Behavior
**Added/Changed:** 2026-03-15

When `./pipeline_run.sh fail "reason"` is run while the current gate is `GATE_1`:

1. System runs `$CLI --advance GATE_1 FAIL`
2. **Automatically clears** `lld400_content` in the state file
3. Prints: `🔄 GATE_1 FAIL: lld400_content cleared → dashboard shows Phase 1 correction cycle`

### Purpose
Dashboard immediately shows Phase 1 (correction cycle) state after Team 190 BLOCK — not stale Phase 2 state.

### Usage Example
```bash
./pipeline_run.sh fail "reason"
→ advances GATE_1 to FAIL
→ clears lld400_content in state (mandatory reset)
→ dashboard immediately shows Phase 1 correction panel
Team 170 must revise and re-submit LLD400 before Phase 2 can re-start.
```

---

## DOC-03 — AC-10 Auto-Store LLD400

### Component
**Source:** `pipeline_run.sh` — `_auto_store_gate1_artifact()`

### Behavior
**Added/Changed:** 2026-03-15

Before every `pass`, `phase2`, and `next` (generate), the script runs `_auto_store_gate1_artifact()`:

1. Checks if `current_gate == GATE_1`
2. **Tier 1:** Searches for `_COMMUNICATION/team_170/TEAM_170_{WP_ID}_LLD400_v*.md` (latest version by glob)
3. **Tier 2:** If no match, globs `_COMMUNICATION/**/TEAM_170_*{WP_fragment}*LLD400*.md` (recursive)
4. **Tier 3:** If no file found, prints guidance; user runs `./pipeline_run.sh store GATE_1 <path>` manually
5. If file exists and content differs from stored → runs `$CLI --store-artifact GATE_1 <file>` automatically
6. Prints: `🔄 AC-10 auto-store: <file>` + `✅ lld400_content updated`

### Purpose
Eliminates the need for manual `./pipeline_run.sh store GATE_1 <file>` before `pass` when file is at standard or Tier-2 paths.

### Usage Example
```
AC-10 auto-store:
  At GATE_1, pipeline_run.sh auto-detects the latest LLD400 file
  (Tier 1: team_170/; Tier 2: full _COMMUNICATION/ tree).
  Manual `store GATE_1` still works as override for Tier 3 (non-standard path).
```

---

**log_entry | TEAM_170 | PIPELINE_STATE_AND_BEHAVIOR | DOC_01_02_03 | 2026-03-15**
