# Phoenix Documentation Tree Inventory
**project_domain:** TIKTRACK

**id:** TEAM_70_DOCUMENTATION_INVENTORY  
**owner:** Team 70 (Knowledge Librarian)  
**status:** DRAFT  
**date:** 2026-02-16  
**context:** Documentation Migration Planning — read-only mapping  
**scope:** Structural inventory; no files moved, edited, or archived

---

## 1) documentation/ Directory Tree

```
documentation/
├── 00-MANAGEMENT/
├── 01-ARCHITECTURE/
│   ├── FRONTEND/
│   │   ├── COMPONENTS/
│   │   └── EXAMPLES/
│   └── LOGIC/
├── 02-DEVELOPMENT/
├── 03-PRODUCT_&_BUSINESS/
├── 04-DESIGN_UX_UI/
├── 05-PROCEDURES/
├── 05-REPORTS/
│   ├── artifacts/
│   │   └── external-data-live-ui/
│   └── artifacts_SESSION_01/
│       ├── adr015-gate-a-artifacts/
│       ├── batch-2-5-qa-artifacts/
│       ├── central-status-artifacts/
│       ├── currency-conversion-artifacts/
│       ├── flow-type-ssot-artifacts/
│       ├── gate-a-artifacts/
│       ├── gate-b-artifacts/
│       ├── option-d-responsive-artifacts/
│       └── phase2-e2e-artifacts/
├── 06-ENGINEERING/
│   └── auth_handover/
├── 07-CONTRACTS/
├── 07-POLICIES/
├── 08-REPORTS/
│   ├── 01-WEEKLY/
│   ├── 02-MONTHLY/
│   ├── 03-YEARLY/
│   ├── artifacts/
│   └── artifacts_SESSION_01/
│       └── fidelity_issues/
├── 09-GOVERNANCE/
│   ├── gins/
│   └── standards/
├── 10-POLICIES/
├── 90_ARCHITECTS_DOCUMENTATION/
│   ├── Blueprints/
│   ├── OVERVIEW_PACK/
│   └── סיכום בץ 1/
│       ├── 01_TECHNICAL/
│       ├── 02_PRODUCT/
│       └── 03_MARKETING/
├── 99-ARCHIVE/
│   ├── OLD_LOGIC_ATTEMPTS/
│   └── deprecated_indexes_phase_1.7/
└── logs/
    └── handovers/
```

**Note:** ~492 .md files in documentation/.  
**Gap:** No `docs-system/` at root; target model (GOVERNANCE_SOURCE_MATRIX) expects docs-system and docs-governance separation.

---

## 2) Root-Level Documentation-Related Folders

| Path | Type | Notes |
|------|------|-------|
| `documentation/` | Primary SSOT tree | Mixed system + governance content |
| `docs-governance/` | Target governance model | 00-FOUNDATIONS exists; 01-POLICIES … 09-TEAM_PLAYBOOKS not yet created |
| `05-REPORTS/` | Duplicate? | Root-level; contains `artifacts/` — possible drift from `documentation/05-REPORTS/` |
| `99-ARCHIVE/` | Legacy/archive | UI/tests archive; structure mirrors ui/, tests/ |
| `archive/` | Legacy | `documentation_legacy/`, `market_data/` (daily, fx_history, intraday) |
| `_COMMUNICATION/` | Communication layer | Not SSOT; team folders + 99-ARCHIVE, 90_Architects_comunication, _Architects_Decisions |
| `blueprints/` | Work product | `v1_ready/` — blueprint artifacts |
| `raw_inputs/` | Input artifacts | README, dom_snapshots — input/scratch |

---

## 3) docs-system Candidates

Folders/content that map to **docs-system** (target model: system documentation):

| Current Location | Candidate Content | Target (docs-system) |
|------------------|-------------------|----------------------|
| `documentation/01-ARCHITECTURE/` | Architecture specs, FRONTEND, LOGIC | `docs-system/architecture/` or `01-ARCHITECTURE/` |
| `documentation/02-DEVELOPMENT/` | Development specs, work packages | `docs-system/development/` |
| `documentation/04-DESIGN_UX_UI/` | Design, UX, UI specs | `docs-system/design/` |
| `documentation/06-ENGINEERING/` | DB, auth, engineering | `docs-system/engineering/` |
| `documentation/07-CONTRACTS/` | OpenAPI, contracts | `docs-system/contracts/` |
| `documentation/90_ARCHITECTS_DOCUMENTATION/` | Blueprints, OVERVIEW_PACK, technical | Mixed — some system, some governance |
| `documentation/05-REPORTS/` | QA artifacts, evidence | `docs-system/` or reports taxonomy |
| `documentation/08-REPORTS/` | Weekly, monthly, yearly reports | Reports taxonomy |

---

## 4) governance Candidates

Folders/content that map to **docs-governance** (target model):

| Current Location | Candidate Content | Target (docs-governance) |
|------------------|-------------------|--------------------------|
| `docs-governance/00-FOUNDATIONS/` | ADR template, standards index | Exists |
| `documentation/05-PROCEDURES/` | Procedures | `docs-governance/02-PROCEDURES/` |
| `documentation/07-POLICIES/` | Policies | `docs-governance/01-POLICIES/` |
| `documentation/09-GOVERNANCE/` | Governance, standards, gins | `docs-governance/08-STANDARDS/`, `03-WORKFLOW/`, `04-QA/` |
| `documentation/10-POLICIES/` | Policies | `docs-governance/01-POLICIES/` |
| `documentation/00-MANAGEMENT/` | Master index, management | Governance or cross-cutting |
| `_COMMUNICATION/_Architects_Decisions/` | Architect decisions | Authority anchor — not moved; referenced |
| `documentation/90_ARCHITECTS_DOCUMENTATION/` | OVERVIEW_PACK, governance decisions | Mixed — needs taxonomy lock |

---

## 5) Legacy / Archive Candidates

| Path | Content | Archive Candidate |
|------|---------|-------------------|
| `documentation/99-ARCHIVE/` | OLD_LOGIC_ATTEMPTS, deprecated_indexes_phase_1.7 | Already archive |
| `documentation/logs/` | handovers | Archive or purge |
| `documentation/05-REPORTS/artifacts_SESSION_01/` | Session-specific QA artifacts | Archive after consolidation |
| `documentation/08-REPORTS/artifacts_SESSION_01/` | Session artifacts | Archive after consolidation |
| `99-ARCHIVE/` (root) | tests, ui (legacy/duplicate) | Already archive |
| `archive/` | documentation_legacy, market_data | Already archive |
| `_COMMUNICATION/99-ARCHIVE/` | Dated folders (2026-02-12, 13, 15), _Cursor_full_design_V1, staging | Archive per KP rules |
| `docs-governance/99-archive/` | history | Already archive |
| `_COMMUNICATION/Legace_html_for_blueprint` | Legacy HTML | Archive candidate |

---

## 6) Suspected Misplacements

| Item | Current Location | Issue |
|------|------------------|-------|
| **05-REPORTS (root)** | `/05-REPORTS/artifacts/` | Duplicate or drift — `documentation/05-REPORTS/artifacts/` also exists |
| **07-POLICIES vs 10-POLICIES** | `documentation/07-POLICIES/`, `documentation/10-POLICIES/` | Two policy folders; unclear split |
| **05-REPORTS vs 08-REPORTS** | Both under documentation/ | Overlap in artifacts; 08 has 01-WEEKLY, 02-MONTHLY, 03-YEARLY |
| **90_ARCHITECTS_DOCUMENTATION** | Under documentation/ | Mix of governance, system, and product; may need split |
| **logs/** | `documentation/logs/` | Logs inside documentation tree |
| **Legace_html_for_blueprint** | `_COMMUNICATION/` | Typo "Legace"; HTML blueprints in communication |
| **raw_inputs** | Root | Input/scratch at root; may belong in staging or archive |
| **blueprints** | Root | Blueprint work product at root; relationship to documentation/01-ARCHITECTURE, 90_ARCHITECTS_DOCUMENTATION/Blueprints unclear |

---

## 7) Summary Counts

| Category | Folders | Notes |
|----------|---------|-------|
| documentation/ top-level | 16 | 00–10, 90, 99, logs |
| docs-governance/ | 3 | 00-FOUNDATIONS, 99-archive |
| Root doc-related | 6 | documentation, docs-governance, 05-REPORTS, 99-ARCHIVE, archive, blueprints, raw_inputs |
| _COMMUNICATION teams | 18 | team_01–91, 90_Architects, 99-ARCHIVE, _Architects_Decisions, etc. |

---

## 8) References

- `_COMMUNICATION/team_90/GOVERNANCE_SOURCE_MATRIX.md` (target model)
- `documentation/00-MANAGEMENT/00_MASTER_INDEX.md` (master index)

---

**log_entry | TEAM_70 | DOCUMENTATION_TREE_INVENTORY_CREATED | 2026-02-16**
