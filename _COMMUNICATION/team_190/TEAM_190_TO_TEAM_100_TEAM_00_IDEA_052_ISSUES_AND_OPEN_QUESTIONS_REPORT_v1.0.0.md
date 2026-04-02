---
id: TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ISSUES_AND_OPEN_QUESTIONS_REPORT_v1.0.0
historical_record: true
from: Team 190
to: Team 100
cc: Team 00, Team 101, Team 170, Team 61, Team 90
date: 2026-03-22
status: ATTACHED_TO_IDEA_052
idea_id: IDEA-052
type: ISSUES_REPORT
subject: Consolidated issues and open questions for architectural decision---

# IDEA-052 — Issues and Open Questions Report

## 1) Consolidated Issues (ordered by severity)

| ID | Severity | Issue | Required decision owner |
|---|---|---|---|
| Q-01 | HIGH | Canonical boundary unresolved for WSM/registries (DB vs Markdown per field class). | Team 00 + Team 100 |
| Q-02 | HIGH | Audit model depth unresolved (hash-chain only vs signed critical events). | Team 00 + Team 100 |
| Q-03 | HIGH | Global mutation authority model unresolved (assignment/routing changes approval path). | Team 00 |
| Q-04 | MEDIUM | Idea log migration wave unresolved (wave 1 or later). | Team 100 + Team 170 |
| Q-05 | MEDIUM | Target MVP schema scope unresolved for first production cutover. | Team 101 + Team 61 + Team 100 |
| Q-06 | MEDIUM | Break-glass policy and operational incident workflow not yet locked. | Team 00 + Team 90 + Team 190 |

## 2) Questions for architecture board

1. Which exact WSM/registry fields remain Markdown-canonical permanently?
2. Is signature enforcement mandatory at first DB launch or second wave?
3. Should team assignment changes require two-party approval by default?
4. Is idea lifecycle data included in first migration wave?
5. What is the minimal accepted control-plane schema for go-live?
6. Which validations are hard blockers for merge vs post-merge backlog?

## 3) Information gaps to close before implementation mandate

1. Formal API contract draft (OpenAPI) for control-plane writes.
2. Final event enum dictionary with lifecycle semantics.
3. Final cutover rehearsal report template and ownership.
4. Explicit mapping of legacy script behaviors to new API operations.

## 4) Recommended next meeting output

Architecture board should produce a one-page lock decision with:
1. Canonicality lock
2. Audit lock
3. RBAC lock
4. Wave plan lock
5. Go/No-Go lock

---

**log_entry | TEAM_190 | IDEA_052_ISSUES_REPORT | OPEN_DECISION_SET_CONSOLIDATED | v1.0.0 | 2026-03-22**
