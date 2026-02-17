# PHOENIX NOTICE
**TO:** All Teams (10, 20, 30, 40, 50, 60, 70, 90, 100)  
**FROM:** Team 10 (Gateway)  
**CC:** Architect, Team 70 (Knowledge Librarian), Team 90 (External Validation Unit)  
**DATE:** 2026-02-17  
**SUBJECT:** Phoenix Documentation Architecture and Governance Adoption (Model B)  
**STATUS:** LOCKED - MANDATORY

---

## 1) Purpose
This notice activates the updated Phoenix documentation governance model and defines the binding SSOT structure for all teams.

All teams must align documentation work, references, and delivery flow to this notice immediately.

---

## 2) Authority Anchors (Binding)
Only the following anchors are authoritative:

1. `00_MASTER_INDEX.md` (repository root) — canonical navigation entry point.
2. `_COMMUNICATION/_Architects_Decisions/` — architect decisions authority.

`_COMMUNICATION/90_Architects_comunication/` is a communication channel only and is not an authority source.

---

## 3) Canonical Documentation Topology (Model B)
Canonical structure is under `documentation/`:

- `documentation/docs-system/`
- `documentation/docs-governance/`
- `documentation/reports/`

Operational communication remains under `_COMMUNICATION/`.
Legacy documentation snapshot is preserved under:

- `archive/documentation_legacy/snapshots/2026-02-17_0000/`

---

## 4) Layer Rules
### 4.1 `documentation/docs-system/`
System documentation only (architecture, backend, client, data, integrations, infra, design, product).

### 4.2 `documentation/docs-governance/`
Governance documentation only (policies, procedures, workflows, role definitions, contracts, standards, playbooks).

### 4.3 `documentation/reports/`
Execution/QA reports only (stage-scoped; archival by policy).

### 4.4 `_COMMUNICATION/`
Operational artifacts only:
- task activation
- status reports
- gate requests
- drafts and coordination

No `_COMMUNICATION` document is SSOT unless explicitly promoted and indexed.

---

## 5) ADR / Directive Template Rule
For governance decision documents (ADR / DIRECTIVE / MANDATE / POLICY), teams must use the canonical template:

- `documentation/docs-governance/00-FOUNDATIONS/ADR_TEMPLATE_CANONICAL.md`

Metadata semantics are locked:
- `id` = decision identity
- `sv` = system version applicability
- `doc_schema_version` = template/schema revision
- `last_updated` = document revision date

---

## 6) Roles and Responsibilities (Updated)
### Team 10 (Gateway)
- Orchestration, gate management, approvals routing, publication control.
- Does not perform broad documentation aggregation/editing as an execution role.

### Team 70 (Knowledge Librarian)
- Documentation aggregation and maintenance.
- SSOT update execution after approvals.
- archive/cutover documentation operations.

### Team 90 (External Validation)
- Independent governance and integrity validation.
- Gate PASS/BLOCK authority on documentation governance checks.

### Development Teams (20/30/40/50/60)
- Produce implementation outputs and proposed SSOT updates.
- Submit through communication flow; no direct authority changes.

---

## 7) Knowledge Promotion Flow (Binding)
At the end of each stage:
1. Teams submit closure reports + proposed SSOT updates.
2. Team 70 consolidates updates.
3. Team 10 validates routing and readiness.
4. Team 90 validates integrity/compliance.
5. Team 10 approves publication.
6. Team 70 executes SSOT updates.
7. Team 70 archives stage communication artifacts by policy.

No stage is considered closed without this flow.

---

## 8) Migration Status
- Model B cutover is complete and active.
- Legacy content is preserved in immutable snapshot path above.
- Old legacy paths must not be used as active references.

---

## 9) Immediate Team Actions
All teams must complete the following before next gate:

1. Replace outdated references to legacy master-index paths with `00_MASTER_INDEX.md` (root).
2. Ensure all authority references point only to the two authority anchors.
3. Stop treating communication drafts as SSOT.
4. Submit missing corrections through Team 10 + Team 70 workflow.

---

## 10) Enforcement
Team 90 will continue periodic documentation integrity checks.

Violations (authority drift, wrong paths, governance files outside governance layer, unpromoted SSOT claims) may trigger gate BLOCK until corrected.

---

## 11) Effective Immediately
This notice is active and mandatory as of publication.

All teams are required to comply.

---

**log_entry | TEAM_10 | TO_ALL_TEAMS | PHOENIX_DOCUMENTATION_GOVERNANCE_ADOPTION_NOTICE | 2026-02-17**
