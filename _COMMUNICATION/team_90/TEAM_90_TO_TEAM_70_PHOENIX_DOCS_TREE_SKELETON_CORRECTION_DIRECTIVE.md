# Team 90 -> Team 70 | PHOENIX_DOCS_TREE_SKELETON Correction Directive
**project_domain:** TIKTRACK

**from:** Team 90 (External Validation Unit)  
**to:** Team 70 (Knowledge Librarian)  
**cc:** Team 10 (Gateway), Architect  
**date:** 2026-02-17  
**status:** ACTION REQUIRED (BLOCK until fixed)  
**subject:** Mandatory structure correction per canonical skeleton

---

## 1) Authoritative Reference

Canonical skeleton (SSOT for structure):  
`/Users/nimrod/Downloads/PHOENIX_DOCS_TREE_SKELETON.md`

---

## 2) Current-State Gaps (validated)

1. Canonical layers are nested under `documentation/` instead of root:
   - `documentation/docs-system/`
   - `documentation/docs-governance/`
   - `documentation/reports/`
2. Root canonical folders are missing:
   - `docs-system/`, `docs-governance/`, `reports/`
3. `reports/` taxonomy mismatch:
   - found `05-REPORTS`, `08-REPORTS` instead of `qa/development/architecture/performance`
4. `_COMMUNICATION` includes non-skeleton top folders that require classification/exception handling.
5. Skeleton-required depth-3 substructure is incomplete in active locations.

---

## 3) Mandatory Corrections

### Phase A — Root Topology Normalization
1. Move canonical documentation layers to root (not under `documentation/`):
   - `documentation/docs-system` -> `docs-system`
   - `documentation/docs-governance` -> `docs-governance`
   - `documentation/reports` -> `reports`
2. Keep `documentation/` as legacy source only until archive snapshot is finalized.

### Phase B — Enforce Skeleton Depth-3
Create and validate mandatory sub-structure exactly as defined in skeleton:

- `docs-system/00-OVERVIEW`
- `docs-system/01-ARCHITECTURE/{system,domain,technical-decisions}`
- `docs-system/02-SERVER/{api,services,business-logic,background-jobs}`
- `docs-system/03-CLIENT/{ui,components,state,routing}`
- `docs-system/04-DATA/{schema,migrations,market-data,snapshots}`
- `docs-system/05-INTEGRATIONS/{ibkr,yahoo,external-services}`
- `docs-system/06-INFRA/{deployment,environments,monitoring}`
- `docs-system/07-DESIGN/{ui-system,icons,branding}`
- `docs-system/08-PRODUCT/{roadmap,features,requirements}`
- `docs-system/09-MARKETING/{positioning,messaging,presentations}`

- `docs-governance/00-FOUNDATIONS`
- `docs-governance/01-POLICIES`
- `docs-governance/02-PROCEDURES`
- `docs-governance/03-WORKFLOW`
- `docs-governance/04-QA`
- `docs-governance/05-ROLE_DEFINITIONS`
- `docs-governance/06-CONTRACTS`
- `docs-governance/07-VERSIONING`
- `docs-governance/08-STANDARDS`
- `docs-governance/09-TEAM_PLAYBOOKS/{team-10,team-20,team-30,team-40,team-50,team-60,team-70,team-90,team-100}`

- `reports/{qa,development,architecture,performance}`

### Phase C — Reports Reclassification
1. Reclassify content from `05-REPORTS` and `08-REPORTS` into `reports/{qa,development,architecture,performance}`.
2. No active `05-REPORTS` / `08-REPORTS` folders may remain under canonical reports root.

### Phase D — Legacy Archive Lock
1. Snapshot full legacy `documentation/` into immutable archive path:
   - `archive/documentation_legacy/snapshots/YYYY-MM-DD_HHMM/`
2. After validation, deprecate/remove active legacy wrapper usage.

### Phase E — Communication Layer Hygiene
1. Map `_COMMUNICATION` non-skeleton folders to:
   - archive, or
   - explicit approved exception list.
2. Decisions remain only under `_COMMUNICATION/_Architects_Decisions/`.
3. Architect submissions remain only under `_COMMUNICATION/_ARCHITECT_INBOX/`.

---

## 4) Required Deliverables

Submit under `_COMMUNICATION/team_70/`:

1. `TEAM_70_DOCS_TREE_SKELETON_ALIGNMENT_REPORT.md`
2. `TEAM_70_DOCS_TREE_PRE_POST_DIFF.md`
3. `TEAM_70_REPORTS_RECLASSIFICATION_MAP.md`
4. `TEAM_70_COMMUNICATION_EXCEPTIONS_REGISTER.md` (if any)
5. `TEAM_70_ARCHIVE_SNAPSHOT_EVIDENCE.md`

---

## 5) Acceptance Criteria (for Team 90 PASS)

- Root contains canonical layers exactly: `docs-system`, `docs-governance`, `reports`, `logs`, `archive`, `_COMMUNICATION`.
- No active `documentation/docs-*` structure remains.
- All mandatory depth-3 skeleton folders exist.
- Reports are only under `reports/{qa,development,architecture,performance}`.
- Legacy snapshot exists in immutable path and is verifiable.
- Authority chain remains:
  - `00_MASTER_INDEX.md` (entry)
  - `_COMMUNICATION/_Architects_Decisions/`

---

## 6) Block Conditions

- Any canonical folder still nested under `documentation/`
- Missing required skeleton subfolders
- Reports taxonomy not converted
- Unapproved `_COMMUNICATION` structural drift
- Missing archive snapshot evidence

---

**log_entry | TEAM_90 | TO_TEAM_70 | PHOENIX_DOCS_TREE_SKELETON_CORRECTION_DIRECTIVE | 2026-02-17**
