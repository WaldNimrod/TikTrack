# 🧭 Documentation Structure Review — Findings & Recommendations

**Team:** 90 (The Spy Team)  
**Date:** 2026-02-05  
**Status:** 🟡 **RECOMMENDATIONS — ARCHITECT DECISION REQUIRED**

---

## 1) Observed Structural Risks (Why contradictions happen)

### 1.1 Multiple competing “indexes”
Active indexes exist in **both** `documentation/` and `_COMMUNICATION/`:
- `documentation/D15_SYSTEM_INDEX.md`
- `documentation/10-POLICIES/TT2_MASTER_DOCUMENTATION_INDEX.md`
- `documentation/00-MANAGEMENT/00_MASTER_INDEX.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/PHOENIX_ARCHITECT_MASTER_INDEX.md`
- `_COMMUNICATION/team_10/UI_COMPLETE_FILE_INDEX.md`
- `_COMMUNICATION/user_profile_versions/UI_COMPLETE_PAGES_INDEX.md`
- plus several staging/index artifacts in `_COMMUNICATION/team_31/*` and `_COMMUNICATION/team_01/*`

**Risk:** Multiple “sources of truth” = built‑in contradiction.

---

### 1.2 SSOT vs Staging not enforced
Reports and drafts inside `_COMMUNICATION/` often duplicate or conflict with `documentation/` standards. Some reports are written as if they are the source of truth.

**Risk:** Rules are effectively forked into multiple locations.

---

### 1.3 Decisions mixed with implementation guides
Architectural decisions, standards, and implementation walkthroughs are interleaved. Example: “mandates” live in governance, but implementation reports in `_COMMUNICATION` restate or override them.

**Risk:** Teams follow the wrong version because it is closer or newer.

---

### 1.4 Inconsistent naming / location policy
Files named as “master/index” exist in several folders. Some are declared “locked” while other “indexes” still point elsewhere.

**Risk:** Index conflict persists even with good file content.

---

### 1.5 Missing or broken references
At least one referenced doc (e.g., `TT2_INFRASTRUCTURE_GUIDE.md`) is missing in the path declared by the main index.

**Risk:** Index becomes unreliable and teams create their own shortcuts.

---

## 2) Recommended Target Structure (Best‑Practice Tree)

### 2.1 Single canonical root index
**One** canonical index only (proposed path):
- `documentation/00-MANAGEMENT/00_MASTER_INDEX.md`

This index should point to **all** official documents and mark their role.

---

### 2.2 Clear doc taxonomy (enforced by folders)
```
documentation/
├── 00-MANAGEMENT/        # governance of docs, roles, org structure
├── 01-ARCHITECTURE/      # architecture, boundaries, blueprints, mandates
├── 02-DEVELOPMENT/       # dev guides, workflows
├── 03-PRODUCT_&_BUSINESS/# product definitions, mappings
├── 04-DESIGN_UX_UI/      # UI standards, tokens, CSS rules
├── 05-PROCEDURES/        # operational procedures, QA workflow
├── 06-ENGINEERING/       # DB schemas, system engineering
├── 07-CONTRACTS/         # OpenAPI, interface contracts
├── 08-REPORTS/           # official reports only (not drafts)
├── 09-GOVERNANCE/        # governance rules, mandatory protocols
├── 10-POLICIES/          # cross‑system policies
├── 90_ARCHITECTS_DOCUMENTATION/  # locked architect-only docs
└── 99-ARCHIVE/           # retired docs with metadata
```

**Rule:** `_COMMUNICATION/` contains **staging / drafts / coordination** only.

---

### 2.3 Decision records separation
Create an **ADR** folder for decision records only (immutable):
- `documentation/01-ARCHITECTURE/ADR/`  
Each ADR: “Decision”, “Context”, “Status”, “Supersedes/Deprecated”.

---

## 3) Required Metadata (Enforceable Schema)

Add a required front‑matter block in every SSOT doc:
```
---
id: DOC-ARCH-001
owner: Chief Architect
status: LOCKED | ACTIVE | DRAFT | DEPRECATED
last_updated: 2026-02-05
supersedes: DOC-ARCH-000
superseded_by: null
source_of_truth: true
---
```

**Benefit:** allows automated consistency checks.

---

## 4) Indexing Strategy (Prevent contradictions by design)

### 4.1 Single “registry file”
Create `documentation/00-MANAGEMENT/DOC_REGISTRY.json` or `.yaml` containing:
- path, id, status, owner, tags, supersedes, SSOT flag
- automatic validation can flag duplicates

### 4.2 Auto‑generated index
Generate the public index from the registry (no manual edits). Use a script to pull headings (like Team 90 did in `SPY_DOCS_INDEX_EXPANDED.md`).

---

## 5) Enforcement Rules (Hard)

1. **No new “index” documents** outside `documentation/00-MANAGEMENT/00_MASTER_INDEX.md`.
2. **Any doc in `_COMMUNICATION` is non‑SSOT**. It must link to SSOT, not replace it.
3. **No duplication of mandates**: if a mandate exists in governance, any report must cite it, not rewrite it.
4. **Deprecation policy**: when replaced, move old doc to `99-ARCHIVE/` and set `superseded_by`.

---

## 6) Suggested Clean‑Up Plan

### Phase 1 — Immediate
- Pick **one** master index (recommend `00_MASTER_INDEX.md`).
- Mark all other index files as `DEPRECATED` with link to master.

### Phase 2 — Consolidation
- Move or merge duplicated rules into their canonical category.
- Update all `_COMMUNICATION` references to point to SSOT.

### Phase 3 — Automation
- Add a script to validate registry + detect duplicates + broken links.

---

## 7) Deliverables Produced (Team 90)

1) **Expanded index with per‑file outlines**  
   - `_COMMUNICATION/team_90/SPY_DOCS_INDEX_EXPANDED.md`

2) **This recommendations report**  
   - `_COMMUNICATION/team_90/SPY_DOCS_STRUCTURE_RECOMMENDATIONS.md`

---

**log_entry | [Team 90] | DOCS_STRUCTURE | RECOMMENDATIONS | YELLOW | 2026-02-05**
