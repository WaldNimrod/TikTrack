# KNOWN_BUGS_REMEDIATION_GOVERNANCE_PROCEDURE_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** KNOWN_BUGS_REMEDIATION_GOVERNANCE_PROCEDURE  
**version:** 1.0.0  
**owner:** Team 170 (canonical governance maintenance)  
**date:** 2026-03-03  
**status:** ACTIVE  
**scope:** Central governance procedure for validated bug intake, routing, remediation cadence, and closure evidence.

---

## 1) Canonical Entry Point

All validated known bugs are tracked in one canonical register only:

`documentation/docs-governance/01-FOUNDATIONS/KNOWN_BUGS_REGISTER_v1.0.0.md`

No parallel bug ledgers are allowed once a defect is validated and accepted.

---

## 2) Mandatory Bug Record Contract

Every known-bug record must include:

1. canonical bug ID (`bug_id`),
2. owner team (`owner_team`),
3. evidence path (`evidence_path`),
4. severity (`BLOCKING | HIGH | MEDIUM | LOW`),
5. remediation mode (`IMMEDIATE | BATCHED`).

Register schema and field names are authoritative in `KNOWN_BUGS_REGISTER_v1.0.0.md`.

---

## 3) Intake and Routing Rules

### 3.1 Intake

A defect enters the canonical register only after validation by Team 190 or relevant validation authority.

### 3.2 Immediate vs Batched

- `BLOCKING` severity: enters active remediation cycle immediately.
- `NON_BLOCKING` (HIGH/MEDIUM/LOW not currently blocking release): remains in register and is grouped into periodic batched remediation rounds every few days.

### 3.3 Cross-team routing

- Team 10: orchestration owner for active remediation cycle and batched rounds.
- Teams 20/30/40/50/60: implementation/QA evidence uses canonical `bug_id`.
- Team 90 / Team 190: validation follow-up references canonical `bug_id`.
- Team 170: maintains procedure and register integrity as governance SSOT artifacts.

---

## 4) Closure Rule (Mandatory)

A known bug may be marked `CLOSED` only when all conditions are met:

1. implementation fix completed by owner team,
2. integration confirmed in the active orchestration flow (Team 10 or authorized orchestrator),
3. relevant validation confirms closure (Team 90 / Team 190 / architectural authority as applicable).

Closure without all three conditions is invalid.

---

## 5) Operational and Roadmap References

- Runtime operational truth remains in WSM `CURRENT_OPERATIONAL_STATE`:
  - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
- Program/WP ownership context remains in registries:
  - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`
  - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md`
- Stage and planned scope references remain in roadmap:
  - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md`

Known-bugs tracking does not override gate authority or gate decisions.

---

## 6) Governance Change Rule

Changes to this procedure or to the canonical known-bugs register format must be routed through constitutional governance flow (Team 190/Team 00 authority path) and reflected in the central governance indexes.

---

log_entry | TEAM_170 | KNOWN_BUGS_REMEDIATION_GOVERNANCE_PROCEDURE | v1.0.0_CREATED | 2026-03-03
