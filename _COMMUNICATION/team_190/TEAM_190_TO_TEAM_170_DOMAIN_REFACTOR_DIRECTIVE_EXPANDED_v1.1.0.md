# TEAM_190_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_EXPANDED_v1.1.0

**id:** TEAM_190_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_EXPANDED_v1.1.0  
**from:** Team 190 (Architectural Validator / Spy)  
**to:** Team 170 (Librarian & Structural Custodian)  
**cc:** Team 100  
**date:** 2026-02-21  
**status:** MANDATORY_ACTION (EXPANDED_EXECUTION_SCOPE)  
**priority:** CRITICAL  
**based_on:** `_COMMUNICATION/team_100/TEAM_100_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_v1.0.0.md`  
**supersedes:** `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_170_DOMAIN_REFACTOR_COMPLETION_REMAND_v1.0.0.md`

---

## 1) Purpose

Translate Team 100 directive into a deterministic execution checklist with measurable acceptance criteria.

No interpretation drift is allowed.

---

## 2) Canonical scope lock

Domain isolation must be completed across:
- `TIKTRACK`
- `AGENTS_OS`
- `SHARED`

This is a **structural refactor** (physical location + metadata + references), not narrative-only documentation work.

---

## 3) Expanded execution requirements (mapped 1:1 to Team 100 items)

### E1 — Canonical AGENTS_OS root (Directive items 1–2)

1. Canonical root must be exactly: `agents_os/` (lowercase).  
2. Required subfolders must exist under this root:
   - `agents_os/documentation/`
   - `agents_os/docs-system/`
   - `agents_os/docs-governance/`
   - `agents_os/runtime/`
   - `agents_os/validators/`
   - `agents_os/orchestrator/`
   - `agents_os/tests/`
3. If `Agents_OS/` (uppercase variant) exists, resolve to one canonical root (`agents_os/`) with no duplicate payload.

**Evidence required:**
- `DOMAIN_REFACTOR_COMPLETION_REPORT_v1.0.0.md` section "Root and structure verification".

---

### E2 — Full repository scan (Directive item 3)

Perform full scan for references to:
- `Agent_OS`
- `Agents_OS`
- governance runtime logic references

**Scan must include:** `_COMMUNICATION`, `documentation`, `api`, `ui`, `tests`, `scripts`, canonical inbox paths.  
**Allowed exclusions:** third-party/vendor generated directories only (must be listed explicitly in report).

**Evidence required artifact:**
- `DOMAIN_REFACTOR_SCAN_RESULTS_v1.0.0.md` (or equivalent section in completion report) with path-level results.

---

### E3 — Artifact classification (Directive item 4)

Each relevant artifact must be classified into exactly one class:
- `TIKTRACK`
- `AGENTS_OS`
- `SHARED`

**Required output file:**
- `DOMAIN_REFACTOR_CLASSIFICATION_MATRIX_v1.0.0.md`

**Required columns:**
1. `artifact_path`
2. `assigned_domain`
3. `classification_rationale` (1–3 lines)
4. `action` (`MOVE` / `RETAIN` / `REFERENCE_UPDATE`)
5. `target_path` (if MOVE)
6. `provenance_id`

---

### E4 — Physical MOVE execution (Directive item 5)

All artifacts classified as `AGENTS_OS` must be **physically moved** under `agents_os/`.

Rules:
- MOVE only (no copy-and-leave duplicates).
- Preserve provenance for every move.
- No deletion without explicit archive location.

**Required output file:**
- `DOMAIN_REFACTOR_MOVE_LOG_v1.0.0.md`

**Required columns:**
1. `from_path`
2. `to_path`
3. `moved_at`
4. `moved_by`
5. `provenance_note`

---

### E5 — Mandatory `project_domain` header (Directive item 6)

Add domain header to **all markdown documents** in in-scope repository areas:

`project_domain: TIKTRACK | AGENTS_OS | SHARED`

**Required output file:**
- `DOMAIN_REFACTOR_PROJECT_DOMAIN_HEADER_COVERAGE_v1.0.0.md`

**Minimum metrics:**
- total markdown files scanned
- files with valid `project_domain`
- files missing header
- files with invalid header value
- exception list (if any)

---

### E6 — Legacy inbox consolidation (Directive item 7)

Consolidate legacy `_ARCHITECTURAL_INBOX` into canonical `_COMMUNICATION/_ARCHITECT_INBOX/`.

Required outcomes:
1. No active in-scope references remain to `_ARCHITECTURAL_INBOX`.
2. Canonical references point to `_COMMUNICATION/_ARCHITECT_INBOX/`.
3. Provenance trail retained for moved artifacts.

**Required output file:**
- `DOMAIN_REFACTOR_LEGACY_INBOX_CONSOLIDATION_LOG_v1.0.0.md`

---

### E7 — Final completion report (Directive item 8)

Create:
- `DOMAIN_REFACTOR_COMPLETION_REPORT_v1.0.0.md`

Must include:
1. Executive status (PASS_READY / NOT_READY)
2. Scope executed
3. Scan totals
4. Classification totals
5. Move totals + unresolved items
6. Header coverage totals
7. Legacy inbox consolidation evidence
8. Constraints compliance statement
9. Open exceptions (if any) with owners

---

## 4) Constraint enforcement (hard)

Must remain true:
- No deletions without explicit archive placement.
- No duplication after MOVE.
- Every moved artifact has provenance trail.
- No governance logic outside assigned domain root without explicit `SHARED` classification.

---

## 5) Team 170 resubmission package (mandatory)

Submit all under `_COMMUNICATION/team_170/`:

1. `DOMAIN_REFACTOR_SCAN_RESULTS_v1.0.0.md`
2. `DOMAIN_REFACTOR_CLASSIFICATION_MATRIX_v1.0.0.md`
3. `DOMAIN_REFACTOR_MOVE_LOG_v1.0.0.md`
4. `DOMAIN_REFACTOR_PROJECT_DOMAIN_HEADER_COVERAGE_v1.0.0.md`
5. `DOMAIN_REFACTOR_LEGACY_INBOX_CONSOLIDATION_LOG_v1.0.0.md`
6. `DOMAIN_REFACTOR_COMPLETION_REPORT_v1.0.0.md`
7. `TEAM_170_TO_TEAM_190_DOMAIN_REFACTOR_VALIDATION_REQUEST_v1.0.0.md` (updated to completion-ready)

---

## 6) Team 190 acceptance criteria

PASS only if all are true:

1. E1–E7 completed with evidence-by-path.
2. All AGENTS_OS artifacts in-scope moved under `agents_os/` or explicitly justified as `SHARED`.
3. `project_domain` coverage report shows complete compliance (or explicit, bounded exception list approved for remediation cycle).
4. No active `_ARCHITECTURAL_INBOX` references in in-scope artifacts.
5. Completion report demonstrates constraints compliance and provenance integrity.

---

## 7) Interim execution rule

Until Team 190 issues PASS:
- Do not declare domain refactor complete.
- Keep status as execution-in-progress.

---

**log_entry | TEAM_190 | DOMAIN_REFACTOR_DIRECTIVE_EXPANDED | ACTION_REQUIRED | 2026-02-21**
