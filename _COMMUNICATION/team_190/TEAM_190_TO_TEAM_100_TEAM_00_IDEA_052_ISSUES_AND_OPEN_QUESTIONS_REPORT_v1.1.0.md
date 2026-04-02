---
id: TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ISSUES_AND_OPEN_QUESTIONS_REPORT_v1.1.0
historical_record: true
from: Team 190
to: Team 100
cc: Team 00, Team 101, Team 170, Team 61, Team 90
date: 2026-03-22
status: ATTACHED_TO_IDEA_052_SUPERSEDES_v1.0.0
idea_id: IDEA-052
type: ISSUES_REPORT
subject: Expanded decision matrix for architectural board (context, implications, options, recommendations)
supersedes: TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ISSUES_AND_OPEN_QUESTIONS_REPORT_v1.0.0.md---

# IDEA-052 — Expanded Issues and Open Questions Report (v1.1.0)

## 1) Executive purpose

This document converts open issues into an architecture-board decision matrix with operational implications, solution options, and recommended defaults.

## 2) Consolidated decision matrix

| ID | Severity | Decision topic | Context | Implications if unresolved | Pros | Cons | Workload | Required infrastructure | Options | Recommendation | Decision owner |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Q-01 | HIGH | WSM/Registry canonical boundary | Current governance state is split between JSON runtime and Markdown registries. | Drift risk, operator confusion, and inconsistent automation behavior. | Clear ownership if locked; easier audits. | Requires migration discipline and publishing pipeline. | Medium | DB schema + markdown generator pipeline | A) DB canonical + generated Markdown B) Markdown canonical + DB mirror C) Hybrid by field class | Choose C immediately with explicit field-class contract, then move to A in wave 2 if stable. | Team 00 + Team 100 |
| Q-02 | HIGH | Audit depth at launch | Current JSONL ledger is append-only but not cryptographically protected. | Tamper-detection gaps and weak forensic confidence. | Strong trust and post-incident traceability once hash/signature model is locked. | Signature management adds ops complexity. | Medium | Immutable event table, hash chain, optional signing key management | A) Append-only only B) Hash-chain C) Hash-chain + signatures on critical events | Launch with B as mandatory baseline, define phased rollout to C for critical events. | Team 00 + Team 100 |
| Q-03 | HIGH | Global mutation authority model | Team/routing/config writes will move from file edits to controlled API mutations. | Unauthorized mutation risk and unclear ownership boundaries. | Consistent governance and safer runtime changes. | Can slow emergency operations if over-restrictive. | Medium | RBAC, approval workflow, break-glass path | A) Single approver B) Dual approval for high-impact C) Full manual oversight | Adopt B: dual approval for high-impact global changes; single-owner for scoped WP operations. | Team 00 |
| Q-04 | MEDIUM | Idea pipeline migration wave | Idea log exists in JSON now; can migrate in first wave or defer. | Scope creep risk if included too early; future integration debt if deferred. | Deferring reduces initial cutover risk. | Temporary dual-management overhead. | Low-Medium | Optional idea tables + API endpoints | A) Include ideas in wave 1 B) Defer to wave 2 C) Keep JSON permanently | Choose B: defer to wave 2, keep stable JSON bridge in wave 1. | Team 100 + Team 170 |
| Q-05 | MEDIUM | MVP schema scope | Full schema could be broad; cutover requires minimal safe subset. | Over-scoping delays migration and increases failure surface. | Minimal scope speeds delivery and testing. | Some desired features deferred. | Medium | Core tables only for runtime state/events/config/assignments | A) Minimal core schema B) Broad schema C) Iterative per module | Choose A with explicit backlog list; expand only after stable cutover PASS. | Team 101 + Team 61 + Team 100 |
| Q-06 | MEDIUM | Break-glass workflow | Emergency direct writes must be controlled but possible. | No policy => either paralysis in incidents or unsafe ad hoc writes. | Predictable incident handling and full accountability. | Requires policy + tooling + training. | Low-Medium | Break-glass API path, signed audit event, reconciliation template | A) No break-glass B) Unrestricted DBA writes C) Policy-gated break-glass with dual approval | Choose C with mandatory reconciliation report and signed audit event. | Team 00 + Team 90 + Team 190 |

## 3) Questions requiring explicit board answers

1. Which exact registry/WSM fields are permanently Markdown-canonical and non-operational?
2. Is event signature enforcement required at first production cutover or only in wave 2?
3. Which mutation classes require dual approval by policy?
4. Does IDEA lifecycle data enter migration wave 1 or remain JSON until wave 2?
5. What is the exact MVP schema acceptance list for go-live?
6. Which validation failures are hard merge blockers versus deferred backlog?

## 4) Pre-implementation information gaps

1. OpenAPI contract for control-plane write/read endpoints.
2. Final event enum dictionary with lifecycle semantics.
3. Final cutover rehearsal template + named owners.
4. Legacy script to API-equivalent command mapping.
5. Approval matrix document (mutation class -> owner -> approval rule).

## 5) Recommended meeting output (one-page lock sheet)

1. Canonicality lock
2. Audit lock
3. RBAC and approval lock
4. Migration waves lock
5. MVP schema lock
6. Go/No-Go blocker policy lock

---

**log_entry | TEAM_190 | IDEA_052_ISSUES_REPORT | EXPANDED_DECISION_MATRIX | v1.1.0 | 2026-03-22**
