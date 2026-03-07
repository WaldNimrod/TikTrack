---
project_domain: SHARED (TIKTRACK + AGENTS_OS)
id: TEAM_170_TO_TEAM_10_CLOUD_AGENT_KB_CANONICAL_INTAKE_ACTIVATION
from: Team 170 (Spec & Governance)
to: Team 10 (Execution Orchestrator)
cc: Team 190, Team 00, Team 100, Team 20, Team 30, Team 50, Team 60, Team 90
date: 2026-03-03
status: READY_FOR_ORCHESTRATION
scope: KB-001..KB-021_CANONICAL_INTAKE_CORRECTED
supersedes: TEAM_170_TO_TEAM_10_CLOUD_AGENT_KB_CANONICAL_INTAKE_ACTIVATION_v1.0.0.md
source_correction: TEAM_00_TO_TEAM_170_KB_ROUTING_CORRECTION_v1.0.0.md
---

# Cloud Agent KB Canonical Intake Activation (v1.0.1 — corrected)

## Critical Notice

Team 10 must treat v1.0.0 routing as superseded. Execute orchestration only from this v1.0.1 table.

## Corrected Intake Table

| source_kb | canonical_id | owner_team | severity | status | remediation_mode | target_cycle |
| --- | --- | --- | --- | --- | --- | --- |
| KB-001 | KB-2026-03-03-03 | Team 170 | HIGH | IN_REMEDIATION | IMMEDIATE | S002-P003-WP002 Cloud-Agent Immediate Lane (CA-IMM-01) |
| KB-002 | KB-2026-03-03-04 | Team 170 | HIGH | IN_REMEDIATION | IMMEDIATE | S002-P003-WP002 Cloud-Agent Immediate Lane (CA-IMM-01) |
| KB-003 | KB-2026-03-03-05 | Team 170 | MEDIUM | IN_REMEDIATION | IMMEDIATE | S002-P003-WP002 Cloud-Agent Immediate Lane (CA-IMM-01) |
| KB-004 | KB-2026-03-03-06 | Team 20 | MEDIUM | CLOSED | BATCHED | Closed in Batch-1 remediation |
| KB-005 | KB-2026-03-03-07 | Team 20 | MEDIUM | CLOSED | BATCHED | Closed in Batch-1 remediation |
| KB-006 | KB-2026-03-03-08 | Team 20 | MEDIUM | OPEN | BATCHED | Cloud-Agent Batched Remediation Round (CA-BAT-01) |
| KB-007 | KB-2026-03-03-09 | Team 20 | HIGH | CLOSED | IMMEDIATE | Closed in Batch-1 remediation |
| KB-008 | KB-2026-03-03-10 | Team 30 | LOW | CLOSED | BATCHED | Closed in Batch-1 remediation |
| KB-009 | KB-2026-03-03-11 | Team 30 | MEDIUM | CLOSED | BATCHED | Closed in Batch-1 remediation |
| KB-010 | KB-2026-03-03-12 | Team 20 | HIGH | MITIGATED_NO_FIX_EXISTS | IMMEDIATE | Mitigated now; structural fix deferred to S003 |
| KB-011 | KB-2026-03-03-13 | Team 20 | MEDIUM | CLOSED | BATCHED | Closed in Batch-1 remediation |
| KB-012 | KB-2026-03-03-14 | Team 30 | HIGH | CLOSED | IMMEDIATE | Closed in Batch-1 remediation |
| KB-013 | KB-2026-03-03-15 | Team 30 | HIGH | CLOSED | IMMEDIATE | Closed in Batch-1 remediation |
| KB-014 | KB-2026-03-03-16 | Team 30 | HIGH | CLOSED | BATCHED | Closed in Batch-1 remediation |
| KB-015 | KB-2026-03-03-17 | Team 60 | CRITICAL | OPEN | IMMEDIATE | S002-P003-WP002 Cloud-Agent Immediate Lane (CA-IMM-01) |
| KB-016 | KB-2026-03-03-18 | Team 60 | HIGH | OPEN | IMMEDIATE | S002-P003-WP002 Cloud-Agent Immediate Lane (CA-IMM-01) |
| KB-017 | KB-2026-03-03-19 | Team 60 | MEDIUM | OPEN | BATCHED | Cloud-Agent Batched Remediation Round (CA-BAT-01) |
| KB-018 | KB-2026-03-03-20 | Team 20 | LOW | OPEN | BATCHED | Cloud-Agent Batched Remediation Round (CA-BAT-01) |
| KB-019 | KB-2026-03-03-21 | Team 20 | MEDIUM | OPEN | BATCHED | Cloud-Agent Batched Remediation Round (CA-BAT-01) |
| KB-020 | KB-2026-03-03-22 | Team 20 | HIGH | OPEN | IMMEDIATE | S002-P003-WP002 Cloud-Agent Immediate Lane (CA-IMM-01) |
| KB-021 | KB-2026-03-03-23 | Team 20 | MEDIUM | OPEN | BATCHED | Cloud-Agent Batched Remediation Round (CA-BAT-01) |

## exchange_rates Directive Note

For KB-004 lineage and DDL reconciliation:

- canonical production DB column is `conversion_rate` (`NUMERIC(20,8)`),
- DDL V2.6 must use `conversion_rate` (not `rate`),
- no production migration required (documentation reconciliation scope).

---

log_entry | TEAM_170 | CLOUD_AGENT_KB_CANONICAL_INTAKE_ACTIVATION | v1.0.1_ROUTING_AND_STATUS_CORRECTION_APPLIED | 2026-03-03
