---
id: ADR-GOV-TEAM10-70-001
owner: Architect
status: LOCKED
context: Governance / Role Separation / Knowledge Promotion
sv: 1.0.0
last_updated: 2026-02-16
---
**project_domain:** TIKTRACK

# TEAM 10 & TEAM 70 ROLE REALIGNMENT

## Context
Team 10 held dual responsibility (gateway orchestration + documentation aggregation/maintenance). This created operational friction and slowed knowledge promotion.

## Decision
Documentation aggregation and SSOT maintenance responsibilities are transferred from Team 10 to Team 70.

## Updated Role Definitions

### Team 10 - Gateway
Responsible for:
- orchestration
- approval gates
- workflow coordination
- decision routing
- validation authority (gateway decision gate)

Not responsible for:
- documentation aggregation
- documentation editing
- archive execution

### Team 70 - Knowledge Librarian
Responsible for:
- documentation aggregation
- SSOT update execution
- documentation structure maintenance
- archive operations
- system documentation updates
- governance documentation updates

Works with:
- Team 10 (approval gate)
- Team 90 (independent validation)
- development teams
- architect decisions

## Knowledge Promotion Flow (Locked)
1. Teams submit stage reports.
2. Teams propose documentation updates.
3. Team 70 aggregates documentation changes.
4. Team 10 approves updates.
5. Team 90 validates.
6. Team 70 updates SSOT.
7. Team 70 archives communication artifacts.

## Governance Impact
This decision enforces separation between:
- orchestration (Team 10)
- knowledge stewardship (Team 70)
- validation (Team 90)

This model is the official Phoenix governance structure.

**log_entry | [Architect] | TEAM10_TEAM70_ROLE_REALIGNMENT_LOCKED | GREEN | 2026-02-16**
