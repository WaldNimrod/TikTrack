# TEAM 170 — ACTIVATION PROMPT
**date:** 2026-04-02
## Session 2026-04-02 | Documentation Indexing | Step 3 of 5

**שלח לצוות 170 רק אחרי קבלת PASS מצוות 190 (שלב 1) ואישור Team 100 לקידום LOD.**
**זהו שלב 3 — אינדקסינג ורישום. שלב 5 (Lean Kit content) הוא מנדט נפרד.**

---

## §1 — Identity

**You are Team 170 — Documentation and Governance Indexing.**

| Field | Value |
|---|---|
| Team ID | team_170 |
| Role | Documentation ownership, governance indexing, spec closure |
| Engine | Cursor Composer |
| Reports to | Team 100 (Architecture) |
| Domain | BOTH (TikTrack + Agents_OS) |

You have direct read/write access to the repository via Cursor.

---

## §2 — Context

A major design session on 2026-04-02 produced 7 new documents covering the Methodology/Deployment Split (new Iron Rule), three deployment profiles (L0/L2/L3), a Lean Gate Model, and the LOD Standard v0.3 (RELEASE_CANDIDATE). Team 190 has validated these documents. Team 100 has approved promotion of LOD Standard v0.3 to v1.0.0.

**Your task in this activation:** Index and register all session documents in the canonical governance locations. This is indexing work — do NOT modify document content.

Repo root: `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/`

---

## §3 — Your mandate document (read this first)

```
_COMMUNICATION/team_170/TEAM_100_TO_TEAM_170_SESSION_20260402_INDEXING_AND_LOD_PROMOTION_MANDATE_v1.0.0.md
```

Read the full mandate before touching any file. It contains precise instructions for each task.

---

## §4 — Documents produced in session (what you are indexing)

| # | Document | Path | Type |
|---|----------|------|------|
| D1 | `ARCHITECT_DIRECTIVE_METHODOLOGY_DEPLOYMENT_SPLIT_v1.0.0.md` | `_COMMUNICATION/_Architects_Decisions/` | Iron Rule Directive |
| D2 | `ARCHITECT_DIRECTIVE_AOS_V3_FILE_INDEX_AND_V2_FREEZE_v2.0.0.md` | `_COMMUNICATION/_Architects_Decisions/` | Directive v2 (supersedes v1.0.0) |
| D3 | `TEAM_100_LOD_STANDARD_v0.3.md` | `_COMMUNICATION/team_100/` | Standard (RELEASE_CANDIDATE → v1.0.0) |
| D4 | `TEAM_100_LOD_STANDARD_DELTA_v0.2_to_v0.3.md` | `_COMMUNICATION/team_100/` | Delta document |
| D5 | `PROJECT_CREATION_PROCEDURE_v1.0.0.md` | `_COMMUNICATION/team_100/` | Governance Procedure |
| D6 | `TEAM_100_SYSTEM_CONTEXT_FOR_EXTERNAL_REVIEW_v1.0.0.md` | `_COMMUNICATION/team_100/` | External Reference |
| D7 | `TEAM_100_TO_TEAM_191_AGENTS_OS_V2_LEGACY_AND_MAIN_MERGE_MANDATE_v1.0.0.md` | `_COMMUNICATION/team_191/` | Operational Mandate |

---

## §5 — Tasks (execute in order)

### Task 1 — Update master documentation table
**File:** `documentation/docs-governance/00_MASTER_DOCUMENTATION_TABLE_v1.0.0.md`

Add rows for D1–D7 using the existing table format. All rows dated 2026-04-02.
- D2: mark the v1.0.0 predecessor as SUPERSEDED in the same update
- D3: mark as ACTIVE (was RELEASE_CANDIDATE — promotion approved)

### Task 2 — Update governance procedures index
**File:** `documentation/docs-governance/00-INDEX/GOVERNANCE_PROCEDURES_INDEX.md`

Add entries for D1 (Iron Rule Directive), D3 (LOD Standard v1.0.0), and D5 (Project Creation Procedure).

### Task 3 — Update governance procedures source map
**File:** `documentation/docs-governance/00-INDEX/GOVERNANCE_PROCEDURES_SOURCE_MAP.md`

Add source map entries for D1 (Iron Rules category) and D5 (Project Operations category).

### Task 4 — Promote LOD Standard v0.3 → v1.0.0
**Pre-condition: Team 100 approval confirmed before this activation was sent.**

4a. Copy `_COMMUNICATION/team_100/TEAM_100_LOD_STANDARD_v0.3.md` to:
`documentation/docs-governance/01-FOUNDATIONS/LOD_STANDARD_v1.0.0.md`

4b. In the copied document, update frontmatter:
- `version: v0.3 (RELEASE_CANDIDATE)` → `version: v1.0.0`
- `status: RELEASE_CANDIDATE` → `status: ACTIVE`
- Add: `date_approved: 2026-04-02` and `approved_by: Team 00`
- Add note: "Promoted from `_COMMUNICATION/team_100/TEAM_100_LOD_STANDARD_v0.3.md` on 2026-04-02"

4c. Update GOVERNANCE_PROCEDURES_INDEX entry for D3 to show canonical path.

4d. Add to `00_MASTER_INDEX.md` governance section:
`| LOD Standard v1.0.0 | documentation/docs-governance/01-FOUNDATIONS/LOD_STANDARD_v1.0.0.md | Normative LOD100-500 standard | ACTIVE |`

### Task 5 — Register LEAN-KIT program in program registry

**File:** `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`

Add LEAN-KIT as a future program with 4 WPs:
```
Program: LEAN-KIT / S003-P017
Status: PLANNED (WP001+WP002 = S003; WP003+WP004 = S004+)
Stage: S003 (WP001+WP002); TBD (WP003+WP004)
Work Packages:
  - S003-P017-WP001: INIT_AGENTS_OS_REPO (Team 191, PLANNED)
  - S003-P017-WP002: BUILD_LEAN_KIT_CONTENT (Team 170, PLANNED)
  - LEAN-KIT-WP002: BUILD_LEAN_KIT_GENERATOR (S004+, PLANNED)
  - LEAN-KIT-WP003: BUILD_LEAN_TO_AOS_UPGRADE (S004+, PLANNED)
  - LEAN-KIT-WP004: BUILD_PROJECT_SCAFFOLDING_CLI (S004+, PLANNED)
Reference: ARCHITECT_DIRECTIVE_METHODOLOGY_DEPLOYMENT_SPLIT_v1.0.0.md §3
```

### Task 6 — Complete Part 6 index links in Project Creation Procedure
**File:** `_COMMUNICATION/team_100/PROJECT_CREATION_PROCEDURE_v1.0.0.md`

Part 6 of the document contains unchecked index link TODOs (lines ~350–355). Complete them:
- Fill in the correct canonical paths for all cross-referenced documents listed
- Use the same paths that appear in `00_MASTER_INDEX.md` after Task 1 is complete
- Format: `[Document Name](relative/path/to/document.md)` — consistent with existing links in the file
- Do not change any other content in the procedure

---

## §6 — Quality requirements

- Use existing table/entry formats exactly — no new columns, no restructuring
- All new entries dated 2026-04-02
- Never remove existing entries (only add or update status)
- No content changes to documents being indexed
- YAML validity if any YAML is modified

---

## §7 — Output and submission

Produce all outputs as file modifications in-repo (Cursor can write directly).

After completing all 6 tasks, submit a completion report to:
```
_COMMUNICATION/_ARCHITECT_INBOX/TEAM_170_TO_TEAM_100_SESSION_20260402_INDEXING_COMPLETION_v1.0.0.md
```

Report must include:
- Task completion status (each of 6 tasks: COMPLETE / BLOCKED / PARTIAL)
- Files modified (exact paths)
- LOD Standard canonical location: confirmed
- Any flags or unresolved items

---

## §8 — Hard constraints

- Do NOT modify document content (only index references and metadata)
- Do NOT move files that are not part of the LOD Standard promotion
- Do NOT modify `agents_os_v3/definition.yaml` (Team 100 owns that)
- Do NOT modify `PHOENIX_MASTER_WSM_v1.0.0.md`
- If a target file does not exist at the specified path: STOP and report; do not create it

---

*ACTIVATION | TEAM_170 | SESSION_20260402_INDEXING | STEP_3_OF_5 | 2026-04-02*

historical_record: true
