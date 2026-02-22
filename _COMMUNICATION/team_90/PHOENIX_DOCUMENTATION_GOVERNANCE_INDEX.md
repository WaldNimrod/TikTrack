# PHOENIX_DOCUMENTATION_GOVERNANCE_INDEX
**project_domain:** TIKTRACK

**id:** `TEAM_90_DOCUMENTATION_GOVERNANCE_RECON_AUDIT`  
**owner:** Team 90 (External Validation Unit)  
**requester:** Team 10 (The Gateway) + Team 100 (Research & Product Engineering)  
**date:** 2026-02-16  
**scope:** Mapping only (no file/code changes)  
**status:** POST-FIX (2026-02-18) — קנון Master Index = `00_MASTER_INDEX.md` (root); SOP-013 קנון = _Architects_Decisions/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md; נתיב 07-POLICIES ל־SOP-013 = ארכיון בלבד.

---

## 0) Audit Snapshot (What was scanned)

| Layer | Path | Files (approx) | Notes |
|---|---|---:|---|
| System documentation | `documentation/` | 544 | Includes architecture, governance, procedures, reports, legacy archive |
| Architect decisions (authoritative channel) | `_COMMUNICATION/_Architects_Decisions/` | 75 | Current architect directives/ADRs/roadmap source |
| Architect communication channel (non-SSOT) | `_COMMUNICATION/90_Architects_comunication/` | 118 | Inbox/outbox + old copies; still widely referenced |
| Team orchestration layer | `_COMMUNICATION/team_10/` | 49 | Task list, work plans, mandates, gate requests |
| Spy governance layer | `_COMMUNICATION/team_90/` | 7 | Validation SOP + enforcement notices |
| Operational scripts | `scripts/` | 104 | Runtime, migration, QA, seed, maintenance scripts |

---

## 1) Governance SSOT Documents

### 1.1 Canonical governance anchors (currently strongest)

| Domain | Canonical document(s) | Path |
|---|---|---|
| Global index (קנון יחיד) | `00_MASTER_INDEX.md` | `00_MASTER_INDEX.md` (שורש הפרויקט) |
| Architect decisions source | Architect decisions set | `_COMMUNICATION/_Architects_Decisions/` |
| Quality gates | `TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md` | `documentation/05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md` |
| Knowledge promotion | `TT2_KNOWLEDGE_PROMOTION_PROTOCOL.md` | `documentation/05-PROCEDURES/TT2_KNOWLEDGE_PROMOTION_PROTOCOL.md` |
| Closure gating (SOP-013) | **קנון יחיד** | `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md`. נתיב `documentation/07-POLICIES/TT2_GOVERNANCE_V2_102_SOP_013_CLOSURE_GATE.md` — **ארכיון להקשר בלבד**, לא בסיס משילות פעיל. |
| Operating standards | `CURSOR_INTERNAL_PLAYBOOK.md`, `PHOENIX_MASTER_BIBLE.md` | `documentation/09-GOVERNANCE/standards/` |

### 1.2 Governance integrity risk already visible

- High volume of active docs still point to `_COMMUNICATION/90_Architects_comunication/` as decision SSOT instead of `_COMMUNICATION/_Architects_Decisions/`.
- Governance source hierarchy exists in Team 90 notices, but is not consistently enforced in system docs.

---

## 2) System Documentation (Technical/Product Structure)

| Area | Primary location | State |
|---|---|---|
| Architecture specs | `documentation/01-ARCHITECTURE/` | Rich and broad; active |
| Engineering/DDL | `documentation/06-ENGINEERING/` | Active addendums + schema evolution |
| API contracts | `documentation/07-CONTRACTS/` | Active but fragmented (main spec + multiple addendums) |
| Governance docs | `documentation/09-GOVERNANCE/` | Active; contains standards and locks |
| Procedures | `documentation/05-PROCEDURES/` | Active and operational |
| Product/business | `documentation/03-PRODUCT_&_BUSINESS/` | **Sparse** (single mapping file) |
| Architect overview pack | `documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/` | Useful executive package; some outdated path references |
| Legacy archive | `documentation/99-ARCHIVE/` | Present and segmented |

**Material gap:** product/business narrative layer is underdeveloped relative to technical layer.

---

## 3) Team Contracts & Role Definitions

### 3.1 Found contracts

| Contract type | Path |
|---|---|
| Team operations charter | `documentation/10-POLICIES/TT2_TEAM_OPERATIONS_CHARTER.md` |
| Architect role definition | `documentation/10-POLICIES/TT2_ARCHITECT_ROLE_DEFINITION.md` |
| Workspace map | `documentation/10-POLICIES/TT2_MASTER_WORKSPACE_MAP.md` |
| Team 60 definition | `documentation/10-POLICIES/TT2_TEAM_60_DEFINITION.md` |
| Team-level execution governance | `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST_PROTOCOL.md` |
| Spy role enforcement | `_COMMUNICATION/team_90/TEAM_90_GOVERNANCE_ROLE_RESET_AND_ENFORCEMENT.md` |

### 3.2 Contract drift findings

1. **Path model drift** in active policy docs:
   - `TT2_TEAM_OPERATIONS_CHARTER.md` still mandates `/communication/...` (lowercase + old structure), not `_COMMUNICATION/...`.
2. **Team scope drift**:
   - Same charter refers to teams `(1-20)` only, while live org includes 30/40/50/60/70/90/91.
3. **Workspace taxonomy drift**:
   - `TT2_MASTER_WORKSPACE_MAP.md` lists documentation buckets that do not match current real folder taxonomy.

---

## 4) Procedures

### 4.1 Strong active procedure layer

- `TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md`
- `TT2_KNOWLEDGE_PROMOTION_PROTOCOL.md`
- `TT2_ACTION_AUDIT_PROTOCOL.md`
- `TT2_VERSIONING_PROCEDURE.md`
- `TT2_SLA_TEAMS_30_40.md`
- `TT2_BLUEPRINT_INTEGRATION_WORKFLOW.md`
- `TT2_BLUEPRINT_HANDOFF_REQUIREMENTS.md`

### 4.2 Procedure consistency risk

- Procedure layer is strong, but references inside other active docs do not consistently align with new architect decisions channel and closure model.

---

## 5) Communication-layer Governance

### 5.1 Current layers in practice

| Layer | Role |
|---|---|
| `_COMMUNICATION/_Architects_Decisions/` | Architect authoritative decision source |
| `_COMMUNICATION/90_Architects_comunication/` | Communication channel (inbox/outbox) |
| `_COMMUNICATION/team_10/` | Orchestration mandates, L2/L3 planning, gate requests |
| `_COMMUNICATION/team_90/` | Validation/enforcement notices and spy SOP |
| `_COMMUNICATION/99-ARCHIVE/` | Historical comm artifacts |

### 5.2 Governance drift detected

- Dual-channel model exists but is not fully propagated to active documentation references.
- Team 10 active task files still include old-path references in multiple places.

---

## 6) Duplications / Conflicts

## 6.1 High-priority duplications

1. **Master index (POST-FIX 2026-02-18):** קנון יחיד = `00_MASTER_INDEX.md` (שורש הפרויקט). הנתיבים הבאים — deprecated/ארכיון להקשר בלבד:
   - ~~documentation/00-MANAGEMENT/00_MASTER_INDEX.md~~
   - `documentation/90_ARCHITECTS_DOCUMENTATION/00_MASTER_INDEX.md`
   - `_COMMUNICATION/_Architects_Decisions/00_MASTER_INDEX.md` (אינדקס אדריכלות; לא גלובלי)
2. **Version policy/matrix duplicated in two policy tracks**:
   - `documentation/10-POLICIES/TT2_VERSIONING_POLICY.md` vs `documentation/90_ARCHITECTS_DOCUMENTATION/TT2_VERSIONING_POLICY.md`
   - `documentation/10-POLICIES/TT2_VERSION_MATRIX.md` vs `documentation/90_ARCHITECTS_DOCUMENTATION/TT2_VERSION_MATRIX.md`

### 6.2 High-priority conflicts (with evidence)

1. **Decision source conflict — RESOLVED (POST-FIX):** קנון גלובלי = `00_MASTER_INDEX.md` (root). לא documentation/00-MANAGEMENT. הפניות פעילות תוקנו ל־root; 90_Architects_comunication לא כסמכות.

2. **Operations charter conflict**
   - `documentation/10-POLICIES/TT2_TEAM_OPERATIONS_CHARTER.md:13-17`
   - Uses old team range and old `/communication/team_XX_staging/` path model.

3. **Workspace map conflict**
   - `documentation/10-POLICIES/TT2_MASTER_WORKSPACE_MAP.md:16-18`
   - Declares outdated documentation structure + old communication path.

4. **MB3A process readiness conflict**
   - Work plan requires Gate-0 scope lock files:
     - `_COMMUNICATION/team_10/TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md:26,39`
   - Required files missing at scan time:
     - `_COMMUNICATION/team_10/TEAM_10_MB3A_NOTES_SCOPE_LOCK.md`
     - `_COMMUNICATION/team_10/TEAM_10_MB3A_ALERTS_SCOPE_LOCK.md`
   - Related SSOT tracker drift:
     - `documentation/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md:74-75` still marks D34/D35 as "נדרש אפיון".

---

## 7) Legacy / Suspected Obsolete Documents

### 7.1 Confirmed legacy containers

- `documentation/99-ARCHIVE/`
- `_COMMUNICATION/99-ARCHIVE/`
- `documentation/99-ARCHIVE/deprecated_indexes_phase_1.7/`

### 7.2 Suspected obsolete or needs deprecation tag

1. `documentation/90_ARCHITECTS_DOCUMENTATION/PHOENIX_ARCHITECT_MASTER_INDEX.md`
   - Still points to old architect communication index authority.
2. Any active doc that references old architect decision path as SSOT.
3. Historical EXTERNAL_AUDIT bundles under `_COMMUNICATION/90_Architects_comunication/EXTERNAL_AUDIT_*` where same files exist in `_Architects_Decisions`.

---

## 8) Missing Governance Elements

1. **No single machine-readable governance map** (authoritative source matrix by document class).
2. **No deprecation ledger** with enforced replacement pointers for active docs that still use old channels.
3. **No automated governance lint** for detecting:
   - old-path references,
   - conflicting "authority" statements,
   - missing mandatory metadata (`id/owner/status/last_updated`).
4. **No formal Team 100 role contract** in governance/policies layer (currently appears in command context but not codified in SSOT policy set).
5. **No explicit policy for OpenAPI addendum consolidation cadence** (main spec vs side addendums).
6. **Scope expectation mismatch:** command mentions `infrastructure/`, but no such folder exists; ownership is split across `scripts/`, `documentation/06-ENGINEERING/`, and team communication.

---

## 9) Structural Recommendations (for Team 10 execution plan)

### 9.1 Immediate (P0)

1. **Lock canonical authority chain** in one place and propagate:
   - Architect decisions SSOT = `_COMMUNICATION/_Architects_Decisions/`
   - Communication channel = `_COMMUNICATION/90_Architects_comunication/`
2. **Fix active contradictory governance docs:** (Master Index: תוקן — קנון = 00_MASTER_INDEX.md ב-root.)
   - `TT2_TEAM_OPERATIONS_CHARTER.md`
   - `TT2_MASTER_WORKSPACE_MAP.md`
3. **Close MB3A Gate-0 documentation gap** before any further gate promotion.

### 9.2 Near-term (P1)

1. Create **Governance Source Matrix SSOT** (document class → authoritative location → owner).
2. Create **Deprecation Ledger** with explicit migration map per obsolete doc.
3. Add **reference hygiene script** (CI check): fail when active docs point to deprecated authority paths.

### 9.3 Mid-term (P2)

1. Merge duplicated policy tracks (`10-POLICIES` vs `90_ARCHITECTS_DOCUMENTATION`) into one authoritative policy hierarchy.
2. Define and lock **Team 100 role contract** and reporting boundaries.
3. Define infrastructure governance map (where infra truth lives, since no `/infrastructure` root exists).

---

## Final Assessment

- Governance framework exists and is strong in principle.
- The main risk is **authority drift** (old vs new architect source), not lack of documents.
- Team 10 can use this index directly as the baseline for documentation reorganization planning and execution.

---

**log_entry | TEAM_90 | DOCUMENTATION_GOVERNANCE_RECON_AUDIT | INDEX_READY | 2026-02-16**
