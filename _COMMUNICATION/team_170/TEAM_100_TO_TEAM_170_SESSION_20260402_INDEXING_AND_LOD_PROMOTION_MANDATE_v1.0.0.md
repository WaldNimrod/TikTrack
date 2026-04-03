# Mandate: Session 2026-04-02 — Documentation Indexing + LOD Standard Promotion

**from:** Team 100 (Architecture)
**to:** Team 170 (Documentation & Governance Indexing)
**date:** 2026-04-02
**mandate_id:** MANDATE-T170-20260402-001
**status:** ACTIVE — awaiting execution

---

## Authority Chain

This mandate is issued by Team 100 (Architecture Team) under the standing governance mandate for documentation indexing. All outputs require Team 100 review and approval before being locked. Do NOT modify canonical governance files without producing the specified output artifacts for review first.

---

## Context

The 2026-04-02 session produced 7 new documents across two domains. These documents must be:
1. Registered in the master documentation table
2. Indexed in the governance procedure index
3. Reflected in the root master index where appropriate
4. The LOD Standard promoted from RELEASE_CANDIDATE to canonical governance location

This mandate covers all 7 items. Execute them in order. Each item has a clear deliverable defined.

---

## Documents Produced This Session

| # | Document | Location | Type |
|---|----------|----------|------|
| D1 | `ARCHITECT_DIRECTIVE_METHODOLOGY_DEPLOYMENT_SPLIT_v1.0.0.md` | `_COMMUNICATION/_Architects_Decisions/` | Architectural Directive (Iron Rule) |
| D2 | `ARCHITECT_DIRECTIVE_AOS_V3_FILE_INDEX_AND_V2_FREEZE_v2.0.0.md` | `_COMMUNICATION/_Architects_Decisions/` | Architectural Directive (v2 supersedes v1.0.0) |
| D3 | `TEAM_100_LOD_STANDARD_v0.3.md` | `_COMMUNICATION/team_100/` | Standard (RELEASE_CANDIDATE) |
| D4 | `TEAM_100_LOD_STANDARD_DELTA_v0.2_to_v0.3.md` | `_COMMUNICATION/team_100/` | Standard delta document |
| D5 | `PROJECT_CREATION_PROCEDURE_v1.0.0.md` | `_COMMUNICATION/team_100/` | Governance procedure |
| D6 | `TEAM_100_SYSTEM_CONTEXT_FOR_EXTERNAL_REVIEW_v1.0.0.md` | `_COMMUNICATION/team_100/` | External reference document |
| D7 | `TEAM_100_TO_TEAM_191_AGENTS_OS_V2_LEGACY_AND_MAIN_MERGE_MANDATE_v1.0.0.md` | `_COMMUNICATION/team_191/` | Operational mandate |

---

## Task 1 — Update 00_MASTER_DOCUMENTATION_TABLE_v1.0.0.md

**File:** `documentation/docs-governance/00_MASTER_DOCUMENTATION_TABLE_v1.0.0.md`

**Action:** Add rows for D1–D7 to the table. Use the existing table format.

**Required fields per row:**
- Document ID (assign next available ID if applicable)
- Document name (exact filename without path)
- Location (folder path)
- Type (Directive / Standard / Procedure / Delta / Reference / Mandate)
- Status (ACTIVE / RELEASE_CANDIDATE / SUPERSEDED)
- Date (2026-04-02)
- Supersedes (if applicable — D2 supersedes v1.0.0 of the same directive)
- Brief description (one sentence)

**Special notes:**
- D2 (`v2.0.0`): mark D1 equivalent (v1.0.0 of AOS_V3_FILE_INDEX) as SUPERSEDED in the same update
- D3: mark as RELEASE_CANDIDATE; it will become v1.0.0 after promotion in Task 4
- D4: companion delta to D3; type = Delta

**Deliverable:** Updated `00_MASTER_DOCUMENTATION_TABLE_v1.0.0.md` for Team 100 review.

---

## Task 2 — Update GOVERNANCE_PROCEDURES_INDEX.md

**File:** `documentation/docs-governance/00-INDEX/GOVERNANCE_PROCEDURES_INDEX.md`

**Action:** Add entries for D1, D3, and D5 to the procedures index.

**Entries to add:**

**D1 — Methodology/Deployment Split:**
```
| ARCHITECT_DIRECTIVE_METHODOLOGY_DEPLOYMENT_SPLIT_v1.0.0.md | Architectural Iron Rule | Defines L0/L2/L3 deployment profiles; eliminates L1; Lean Kit snapshot model; cross-engine validation in all profiles | _COMMUNICATION/_Architects_Decisions/ | 2026-04-02 |
```

**D3 — LOD Standard v0.3 (RELEASE_CANDIDATE):**
```
| TEAM_100_LOD_STANDARD_v0.3.md | Standard (RELEASE_CANDIDATE) | Full LOD100-500 normative standard with Lean Gate Model, deployment overlays, team structure, and Lean Kit architecture | _COMMUNICATION/team_100/ | 2026-04-02 |
```

**D5 — Project Creation Procedure:**
```
| PROJECT_CREATION_PROCEDURE_v1.0.0.md | Governance Procedure | Manual project creation procedure for L0 (Lean, ~15 min) and L2 (AOS v3/Dashboard, ~30-60 min); includes L0→L2 upgrade path | _COMMUNICATION/team_100/ | 2026-04-02 |
```

**Deliverable:** Updated `GOVERNANCE_PROCEDURES_INDEX.md` for Team 100 review.

---

## Task 3 — Update GOVERNANCE_PROCEDURES_SOURCE_MAP.md

**File:** `documentation/docs-governance/00-INDEX/GOVERNANCE_PROCEDURES_SOURCE_MAP.md`

**Action:** Add source map entries for D1 and D5. These are new entries to the source map.

**D1 source map entry:**
- Category: Iron Rules / Architectural Directives
- Path: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_METHODOLOGY_DEPLOYMENT_SPLIT_v1.0.0.md`
- Authority: Team 00 (locked)
- Scope: ALL projects, ALL profiles (L0/L2/L3)

**D5 source map entry:**
- Category: Project Operations / Setup Procedures
- Path: `_COMMUNICATION/team_100/PROJECT_CREATION_PROCEDURE_v1.0.0.md`
- Authority: Team 100
- Scope: New project creation (both domains, both profiles)

**Deliverable:** Updated `GOVERNANCE_PROCEDURES_SOURCE_MAP.md` for Team 100 review.

---

## Task 4 — Promote LOD Standard v0.3 to canonical governance location

**PRE-CONDITION:** This task MUST NOT be executed until Team 100 confirms promotion approval in writing. Wait for Team 100 explicit approval before proceeding.

**When approved, the execution steps are:**

**Step 4a — Copy the document:**
Copy `_COMMUNICATION/team_100/TEAM_100_LOD_STANDARD_v0.3.md` to:
`documentation/docs-governance/LOD_STANDARD_v1.0.0.md`

**Step 4b — Update the document header:**
In the copied document at the canonical location, update:
- `version: v0.3 (RELEASE_CANDIDATE)` → `version: v1.0.0`
- `status: RELEASE_CANDIDATE` → `status: ACTIVE`
- `date_approved: [add the approval date]`
- `approved_by: Team 00`
- Add a note: "Promoted from `_COMMUNICATION/team_100/TEAM_100_LOD_STANDARD_v0.3.md` on [date]"

**Step 4c — Update references:**
In `GOVERNANCE_PROCEDURES_INDEX.md`, update the D3 entry:
- Status: ACTIVE (was RELEASE_CANDIDATE)
- Location: `documentation/docs-governance/LOD_STANDARD_v1.0.0.md`

In `00_MASTER_DOCUMENTATION_TABLE_v1.0.0.md`, update the D3 entry:
- Status: ACTIVE
- Location: `documentation/docs-governance/`
- Add canonical path

**Step 4d — Add cross-reference to root master index:**
In `00_MASTER_INDEX.md` → Governance section → add:
```
| LOD Standard v1.0.0 | documentation/docs-governance/LOD_STANDARD_v1.0.0.md | Normative LOD100-500 standard with Lean Gate Model and deployment overlays | ACTIVE |
```

**Deliverable:** Full promotion execution + verification that all cross-references point to canonical location.

---

## Task 5 — Register LEAN-KIT-WPs in program registries

**Context:** 4 Lean Kit WPs were registered in `agents_os_v3/definition.yaml` on 2026-04-02. These must also appear in the portfolio roadmap and program registry documents so human-readable indexes are consistent with the machine-readable YAML.

**Files to check and update if applicable:**
1. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md` — add LEAN-KIT program or section if not already present
2. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` — register LEAN-KIT as a future program with 4 WPs

**Required registry entries (use existing format):**
```
Program: LEAN-KIT (future)
Status: PLANNED
Stage: TBD (pending stage assignment by Team 00)
Work Packages:
  - LEAN-KIT-WP001: BUILD_LEAN_KIT_REPO (PLANNED)
  - LEAN-KIT-WP002: BUILD_LEAN_KIT_GENERATOR (PLANNED)
  - LEAN-KIT-WP003: BUILD_LEAN_TO_AOS_UPGRADE (PLANNED — depends on WP001+WP002)
  - LEAN-KIT-WP004: BUILD_PROJECT_SCAFFOLDING_CLI (PLANNED — depends on WP001+WP002)
Reference: ARCHITECT_DIRECTIVE_METHODOLOGY_DEPLOYMENT_SPLIT_v1.0.0.md §3; LOD_STANDARD_v1.0.0.md §10
```

**Deliverable:** Updated program registry entries for Team 100 review. If the portfolio roadmap already has a section for future programs, add LEAN-KIT there. If not, create a "Future Programs" section.

---

## Quality Requirements

**All outputs from Team 170 must meet:**

1. **Exact format match** — Use existing table/entry formats exactly. Do not invent new columns or change column order.
2. **No content beyond scope** — Do not add commentary, restructure sections, or modify content outside what this mandate explicitly specifies.
3. **One document per task** — Produce one updated version of each target file. Do not split changes across multiple files.
4. **No speculative additions** — If the source document does not provide enough information to fill a field (e.g., a document ID), use a placeholder and flag it explicitly for Team 100 resolution.
5. **Preserve all existing content** — Updating a file means adding to it. Never remove or rewrite existing entries unless this mandate explicitly says "mark as SUPERSEDED."
6. **Date accuracy** — All new entries dated 2026-04-02.

---

## Output Submission

Submit all outputs to: `_COMMUNICATION/_ARCHITECT_INBOX/`

Filename format: `TEAM_170_TO_TEAM_100_MANDATE_T170_20260402_001_[TASK_N]_OUTPUT_v1.0.0.md`

Where TASK_N is TASK1, TASK2, etc. Submit all completed tasks together as a single batch, not one at a time.

In the submission header, include:
- Task completion status (each task: COMPLETE / BLOCKED / PARTIAL)
- Any flags or unresolved fields per task
- Confirmation that quality requirements were met

Tasks 1–3 and 5 may be executed in parallel. Task 4 is blocked until Team 100 approval notice is received.

---

## Activation

This mandate is ACTIVE. Execute Tasks 1–3 and 5 immediately. Await confirmation before executing Task 4.

Team 100 will review all outputs before any file is committed.

---

*log_entry | TEAM_100 → TEAM_170 | MANDATE-T170-20260402-001 | 2026-04-02*

historical_record: true
