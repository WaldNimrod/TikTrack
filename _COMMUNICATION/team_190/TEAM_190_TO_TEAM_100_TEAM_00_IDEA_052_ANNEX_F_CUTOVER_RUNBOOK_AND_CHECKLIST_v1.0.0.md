---
id: TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_F_CUTOVER_RUNBOOK_AND_CHECKLIST_v1.0.0
historical_record: true
from: Team 190
to: Team 100
cc: Team 00, Team 101, Team 170, Team 61, Team 90
date: 2026-03-22
status: ATTACHED_TO_IDEA_052
idea_id: IDEA-052
type: ANNEX
subject: Full-stop cutover runbook and checklist for DB-first migration---

# Annex F — Cutover Runbook and Checklist

## F.1 Runbook stages

1. **Freeze:** stop active plans and block new lifecycle actions.
2. **Backup:** full repo snapshot + data artifact backup + integrity hash list.
3. **Branch isolation:** migration branch only; no direct main updates.
4. **Build:** deploy DB schema + API write path.
5. **Import:** migrate state/registry/event/team/config baseline.
6. **Parity checks:** compare pre/post state and critical projections.
7. **Functional validation:** CLI + Dashboard + browser + validator suites.
8. **Go/No-Go review:** Team 00 + Team 100 decision gate.
9. **Merge:** only on full PASS.

## F.2 Go/No-Go checklist

| Item | Required | Status template |
|---|---|---|
| Backup hashes generated and verified | YES | PASS/FAIL |
| Import completed without data loss in required entities | YES | PASS/FAIL |
| Runtime parity check vs baseline artifacts | YES | PASS/FAIL |
| Event ledger chain verification | YES | PASS/FAIL |
| Dashboard primary workflows pass | YES | PASS/FAIL |
| CLI operational commands pass | YES | PASS/FAIL |
| Constitutional validation signoff (Team 190) | YES | PASS/FAIL |
| Architectural signoff (Team 100 + Team 00) | YES | PASS/FAIL |

## F.3 Rollback criteria

Immediate rollback if any of:
1. Runtime parity mismatch on critical fields.
2. Audit-chain verification failure.
3. Gate transition logic regression.
4. Dashboard operator-critical flow failure.

---

**log_entry | TEAM_190 | IDEA_052_ANNEX_F | CUTOVER_RUNBOOK_COMPLETE | v1.0.0 | 2026-03-22**
