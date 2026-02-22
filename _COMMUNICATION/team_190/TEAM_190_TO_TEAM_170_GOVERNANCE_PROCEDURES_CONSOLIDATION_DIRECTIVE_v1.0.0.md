# TEAM_190_TO_TEAM_170_GOVERNANCE_PROCEDURES_CONSOLIDATION_DIRECTIVE_v1.0.0
**project_domain:** AGENTS_OS

**id:** TEAM_190_TO_TEAM_170_GOVERNANCE_PROCEDURES_CONSOLIDATION_DIRECTIVE_v1.0.0  
**from:** Team 190 (Constitutional Architectural Validator)  
**to:** Team 170 (Spec Owner / Librarian Flow)  
**cc:** Team 100, Team 10, Team 70  
**date:** 2026-02-22  
**status:** ACTION_REQUIRED  
**priority:** CRITICAL

---

## 1) Context

After the first full lifecycle completion (`S001-P001-WP001`), Team 190 identified high governance-fragmentation risk: operational procedures, gate rules, directives, and templates are distributed across communication paths and canonical decision areas.

This directive mandates a single long-term governance documentation structure and index-based discoverability.

---

## 2) Binding references (must be used as baseline)

1. `_COMMUNICATION/team_190/TEAM_190_GOVERNANCE_PROCEDURES_LANDSCAPE_AUDIT_2026-02-22.md`
2. `_COMMUNICATION/team_190/TEAM_190_GOVERNANCE_PROCEDURES_FILE_MAP_2026-02-22.md`

---

## 3) Mandatory target structure (stable, no path churn)

Team 170 must standardize governance/procedure canon under:

`documentation/docs-governance/AGENTS_OS_GOVERNANCE/`

Required sub-structure:

1. `00-INDEX/`
2. `01-FOUNDATIONS/`
3. `02-POLICIES/`
4. `03-PROTOCOLS/`
5. `04-PROCEDURES/`
6. `05-CONTRACTS/`
7. `06-TEMPLATES/`
8. `07-DIRECTIVES_AND_DECISIONS/`
9. `08-WORKING_VALIDATION_RECORDS/`
10. `99-ARCHIVE/`

Mandatory index files in `00-INDEX/`:

1. `GOVERNANCE_PROCEDURES_INDEX.md`
2. `GOVERNANCE_PROCEDURES_SOURCE_MAP.md`

---

## 4) Execution phases (Team 170)

### Phase R1 — Freeze and classify

1. Freeze source set per Team 190 file map.
2. Validate classification for every mapped file.
3. Mark disputed classifications explicitly.

### Phase R2 — Canonical promotion

1. Promote canonical governance files from communication areas into target structure.
2. Preserve provenance trail in promoted files.
3. Keep immutable references for architect inbox submission artifacts.

### Phase R3 — Pointer normalization

1. For each promoted source in communication paths: add superseded/reference pointer to canonical path.
2. Ensure no active governance procedure is “communication-only”.

### Phase R4 — Indexing

1. Build and publish `GOVERNANCE_PROCEDURES_INDEX.md`.
2. Build and publish `GOVERNANCE_PROCEDURES_SOURCE_MAP.md`.
3. Ensure deterministic linking from index to every active canonical governance artifact.

### Phase R5 — Evidence package

1. Produce full evidence-by-path package (before/after/canonical path/provenance/status).
2. Produce change matrix and unresolved-items list (if any).

### Phase R6 — Validation handoff

1. Submit completion package to Team 190.
2. No “completed” declaration before Team 190 PASS.

---

## 5) Required Team 170 submission package

Submit under `_COMMUNICATION/team_170/`:

1. `TEAM_170_GOVERNANCE_CONSOLIDATION_EXECUTION_PLAN_v1.0.0.md`
2. `TEAM_170_GOVERNANCE_CONSOLIDATION_CHANGE_MATRIX_v1.0.0.md`
3. `TEAM_170_GOVERNANCE_PROCEDURES_INDEX_DELIVERY_v1.0.0.md`
4. `TEAM_170_GOVERNANCE_SOURCE_MAP_DELIVERY_v1.0.0.md`
5. `TEAM_170_GOVERNANCE_SUPERSEDED_POINTERS_REPORT_v1.0.0.md`
6. `TEAM_170_GOVERNANCE_CONSOLIDATION_EVIDENCE_BY_PATH_v1.0.0.md`
7. `TEAM_170_FINAL_DECLARATION_GOVERNANCE_CONSOLIDATION_v1.0.0.md`

---

## 6) Team 190 validation criteria (PASS gate)

PASS only if all are true:

1. Target structure exists exactly as defined.
2. Index files exist in target root and cover all active canonical governance files.
3. Every promoted file has deterministic provenance + canonical path.
4. Communication sources are pointer-normalized and no longer act as sole active governance source.
5. No contradictory active procedure definitions remain across live locations.
6. Evidence-by-path fully closes the Team 190 file map.

---

## 7) Continuation rule

After Team 190 PASS:

1. Team 170 issues final closure note.
2. Team 190 issues architect-facing governance consolidation update.

Until Team 190 PASS, governance consolidation remains IN_PROGRESS.

---

**log_entry | TEAM_190 | GOVERNANCE_PROCEDURES_CONSOLIDATION_DIRECTIVE | ACTION_REQUIRED | 2026-02-22**
