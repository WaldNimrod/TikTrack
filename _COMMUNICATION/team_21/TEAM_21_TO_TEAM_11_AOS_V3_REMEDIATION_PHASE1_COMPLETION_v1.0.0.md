---
id: TEAM_21_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE1_COMPLETION_v1.0.0
historical_record: true
from: Team 21 (AOS Backend Implementation)
to: Team 11 (AOS Gateway / Execution Lead)
cc: Team 00, Team 51, Team 31, Team 100
date: 2026-03-28
type: REMEDIATION_COMPLETION
domain: agents_os
branch: aos-v3
responds_to: TEAM_11_TO_TEAM_21_AOS_V3_REMEDIATION_PHASE1_API_GAPS_MANDATE_v1.0.1---

# Team 21 → Team 11 | AOS v3 Remediation Phase 1 — completion

## Summary

Implemented **four** D.6 / gap-plan handlers under `agents_os_v3/` per mandate v1.0.1 (Option B paths, no `/api/admin/*` migration). Non–`team_00` administrative mutations return **`INSUFFICIENT_AUTHORITY` (403)**; UC-12 uses **`INSUFFICIENT_AUTHORITY`** for non-Principal actors (not `NOT_PRINCIPAL`). Override requests require **`body.actor_team_id` == `X-Actor-Team-Id`**; mismatch → **`ACTOR_MISMATCH` (400)**.

## Deliverables

| # | Endpoint / change | Status |
|---|-------------------|--------|
| 1 | `POST /api/runs/{run_id}/override` (UC-12) | Done — `principal_override_run` + `uc_12_principal_override` + `PrincipalOverrideBody`; ledger emits **`PRINCIPAL_OVERRIDE`** only with payload `{action, from_state, to_state}` and `reason` on the event row |
| 2 | `GET /api/teams/{team_id}` | Done — `get_team_detail` in `portfolio.py` |
| 3 | `DELETE /api/routing-rules/{rule_id}` | Done — `team_00` only |
| 4 | `PUT /api/policies/{policy_id}` | Done — `update_policy_by_id` in `policy/settings.py` + `PolicyUpdateBody` |

## Normative note (spec drift)

- **Module Map §4.8** requires `SNAPSHOT_REQUIRED` when **`FORCE_PAUSE`** has no `snapshot`.
- **Event Observability Spec v1.0.1** §6.1 row for `SNAPSHOT_REQUIRED` / UC-12 mentions **FORCE_RESUME** — implementation follows **Module Map §4.8** for this build.

## `FORCE_RESUME` implementation

- Clears `paused_at` and `paused_routing_snapshot_json` with an explicit `UPDATE` (avoids `update_run_position` treating `None` as “skip column” for nullable pause fields).

## Files modified / added

| Path | Change |
|------|--------|
| `agents_os_v3/modules/definitions/models.py` | `PrincipalOverrideBody`, `PolicyUpdateBody` |
| `agents_os_v3/modules/state/machine.py` | `principal_override_run` |
| `agents_os_v3/modules/management/use_cases.py` | `uc_12_principal_override` |
| `agents_os_v3/modules/management/api.py` | Routes + docstring |
| `agents_os_v3/modules/management/portfolio.py` | `get_team_detail` |
| `agents_os_v3/modules/policy/settings.py` | `update_policy_by_id` |
| `agents_os_v3/tests/test_remediation_phase1_api.py` | **NEW** — smoke tests |
| `agents_os_v3/FILE_INDEX.json` | v1.1.9 + new test entry + notes |

## Verification (executed)

```bash
PYTHONPATH=. python3 -m pytest agents_os_v3/tests/ -q
# 77 passed (2026-03-28)

bash scripts/check_aos_v3_build_governance.sh
# PASS
```

## Handover

- **Team 51:** Phase 2 can add full contract tests for override matrix, policy update success paths, and routing-rule delete side effects.
- **Team 31:** Update `api-client.js` / UI if consumers need the new paths (mandate: separate coordination).

---

**log_entry | TEAM_21 | AOS_V3 | REMEDIATION | PHASE1_COMPLETE_v1.0.0 | 2026-03-28**
