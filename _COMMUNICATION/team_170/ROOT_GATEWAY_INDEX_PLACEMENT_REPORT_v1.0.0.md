# ROOT_GATEWAY_INDEX_PLACEMENT_REPORT_v1.0.0

**project_domain:** SHARED  
**from:** Team 170  
**to:** Team 190  
**mandate:** TEAM_190_TO_TEAM_170_CROSS_DOMAIN_STRUCTURE_IMPLEMENTATION_MANDATE_v1.0.0  
**date:** 2026-02-22

---

## 1. Governance root (single active hierarchy)

**Root path:** `documentation/docs-governance/`

**Active buckets (deterministic):**

| Path | Purpose |
|------|---------|
| `documentation/docs-governance/00-INDEX/` | **Gateway:** procedures index, source map (root-discoverable) |
| `documentation/docs-governance/01-FOUNDATIONS/` | SSM, WSM, Gate Model, Iron Rules, Artifact Taxonomy, Team 190 Constitution |
| `documentation/docs-governance/02-POLICIES/` | Policies |
| `documentation/docs-governance/03-PROTOCOLS/` | Retry, Knowledge Promotion, etc. |
| `documentation/docs-governance/04-PROCEDURES/` | Governance procedures |
| `documentation/docs-governance/05-CONTRACTS/` | Design contracts |
| `documentation/docs-governance/06-TEMPLATES/` | Decision/verdict templates |
| `documentation/docs-governance/07-DIRECTIVES_AND_DECISIONS/` | Architect directives |
| `documentation/docs-governance/08-WORKING_VALIDATION_RECORDS/` | Working validation records |
| `documentation/docs-governance/99-archive/` | Legacy hold, phoenix_canonical_archive, deprecated AGENTS_OS_GOVERNANCE |

**Root-level files (unchanged):**
- `00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL_v1.0.0.md`
- `00_MASTER_DOCUMENTATION_TABLE_v1.0.0.md`

---

## 2. Gateway / index (deterministic and accessible)

- **Primary gateway path:** `documentation/docs-governance/00-INDEX/`
- **Index artifacts:** `GOVERNANCE_PROCEDURES_INDEX.md`, `GOVERNANCE_PROCEDURES_SOURCE_MAP.md`
- **Discoverability:** From repo root: `documentation/docs-governance/00-INDEX/` is the single governance gateway path. No parallel active governance root.

---

## 3. AGENTS_OS domain gateways (structure only, move-only)

- **Governance gateway (domain):** `agents_os/docs-governance/00-INDEX/` — created empty; content standardization is Stage 3.
- **Documentation gateway (domain):** `agents_os/documentation/00-INDEX/` — created empty; content standardization is Stage 3.

---

## 4. PASS criteria check

| Criterion | Status |
|----------|--------|
| Single active governance topology under `documentation/docs-governance` | Met |
| Gateway/index root-discoverable and deterministic | Met (`00-INDEX/` at governance root) |

---

**log_entry | TEAM_170 | ROOT_GATEWAY_INDEX_PLACEMENT_REPORT | v1.0.0 | 2026-02-22**
