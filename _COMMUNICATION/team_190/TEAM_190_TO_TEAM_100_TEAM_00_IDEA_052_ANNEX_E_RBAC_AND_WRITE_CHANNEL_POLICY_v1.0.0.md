---
id: TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_E_RBAC_AND_WRITE_CHANNEL_POLICY_v1.0.0
historical_record: true
from: Team 190
to: Team 100
cc: Team 00, Team 101, Team 170, Team 61, Team 90
date: 2026-03-22
status: ATTACHED_TO_IDEA_052
idea_id: IDEA-052
type: ANNEX
subject: RBAC and write-channel policy for DB-first control plane---

# Annex E — RBAC and Write-Channel Policy

## E.1 Channel policy (mandatory)

| Channel | Read | Write |
|---|---|---|
| Dashboard UI | Allowed | Allowed via API only |
| CLI (`pipeline_run.sh` and successors) | Allowed | Allowed via API only |
| IDE/LLM agents | Allowed | Allowed via API only |
| Direct file edits to operational state | Not canonical | Forbidden in normal runtime |
| Direct DB writes (manual) | Restricted | Forbidden except break-glass |

## E.2 Role/permission baseline

| Role | Allowed mutations | Approval required |
|---|---|---|
| Team 00 | constitutional overrides, high-impact control changes | none (constitutional authority) |
| Team 100 | architectural workflow/routing approvals | Team 00 for constitutional-scope changes |
| Team 10/11 | execution workflow operations in approved scope | per gate policy |
| Team 61 | implementation/runtime ops changes in assigned WP scope | yes for global settings |
| Team 90/190 | validation verdict and policy recommendation records | cannot directly mutate assignment policy |
| Team 170 | governance publication and canonical doc operations | per governance process |

## E.3 Break-glass policy

1. Emergency write requires dual approval (Team 00 + Team 100).
2. Every break-glass mutation emits signed audit event.
3. Post-incident reconciliation report mandatory.

---

**log_entry | TEAM_190 | IDEA_052_ANNEX_E | RBAC_POLICY_COMPLETE | v1.0.0 | 2026-03-22**
