# Team 170 vs Team 190 — Authority Separation
**project_domain:** TIKTRACK

**from:** Team 10 (The Gateway)  
**date:** 2026-02-18  
**purpose:** Clarify separation between Team 170 and Team 190 authority for Team 170 intake.

---

## 1. Team 170 (Librarian / SSOT Authority)

| Item | Value |
|------|--------|
| **Department** | Architecture Department |
| **Role** | Librarian / SSOT Authority |
| **Responsibilities** | Maintain canonical documentation integrity; eliminate duplicate authority anchors; ensure index consistency; manage archive transitions; execute governance-aligned file restructuring; validate alignment between repository and canonical spec. |
| **Does NOT** | Write production code; approve architecture (Team 190); orchestrate development (Team 10). |
| **Gateway protocol** | Team 10 routes SSOT/index/librarian tasks to Team 170. Team 170 receives correction directives (e.g. from Team 190 Gate 5 report) and executes repository-level fixes. Team 170 does not issue Gate 5 or Gate 4 decisions. |

---

## 2. Team 190 (Constitutional Architectural Validator)

| Item | Value |
|------|--------|
| **Department** | Architecture Department |
| **Role** | Constitutional Architectural Validator (Gate 5) |
| **Authority** | Spec completeness, ADR consistency, state/selector integrity. Validates architecture/spec *before* code; does not perform development validation (Gate 4). |
| **Does NOT** | Replace Team 90 development/gate validation; perform day-to-day SSOT promotion (Team 70/170). |

---

## 3. Separation rule

- **Team 170:** SSOT/documentation/repository integrity and corrections. **Does NOT approve architecture.**
- **Team 190:** Architectural/constitutional validation (Gate 5). **Does NOT own SSOT promotion or index updates** — those remain with Team 70 / Team 170 and Team 10 approval.
- **Team 90:** Gate 4 development validation. Team 90 does not perform Team 190 sign-off; Team 190 does not perform Team 90 validation.

---

**log_entry | TEAM_10 | TEAM_170_190_AUTHORITY_SEPARATION | INTAKE_PACKAGE | 2026-02-18**
