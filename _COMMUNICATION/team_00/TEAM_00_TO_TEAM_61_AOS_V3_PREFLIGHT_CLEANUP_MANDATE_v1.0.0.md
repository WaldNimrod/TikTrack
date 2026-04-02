---
id: TEAM_00_TO_TEAM_61_AOS_V3_PREFLIGHT_CLEANUP_MANDATE_v1.0.0
historical_record: true
from: Team 00 (Principal — Nimrod)
to: Team 61 (AOS DevOps)
cc: Team 11 (AOS Gateway), Team 100 (Chief Architect)
date: 2026-03-29
type: MANDATE — Pre-flight cleanup before first production run
domain: agents_os
priority: BLOCKER — must complete before S003-P005-WP001 run is created---

# Phase 0 — Pre-Flight Cleanup Mandate

## Background

AOS v3 is built and tested. Before the first production TikTrack run (S003-P005 D26 Watch Lists), the system state must be clean. `agents_os_v3/pipeline_state.json` currently contains **9 orphan IN_PROGRESS runs** created during BUILD-phase testing. These must be cancelled and cleared before a real run is created.

---

## §1 — Orphan Run Inventory

The following 9 runs are orphan BUILD-phase test runs (all `actor_team_id: team_10`, all `status: IN_PROGRESS`, created 2026-03-28):

| domain_id | run_id | gate | last_updated |
|---|---|---|---|
| 01JK8AOSV3DOMAIN00000001 | 01KMV0EQ8CN75M4JXNEJJH3AE5 | GATE_0 | 2026-03-28T19:59:05 |
| 01JK8AOSV3DOMAIN00000002 | 01KMV0EPWFE11ANDSP449PB3J0 | GATE_0 | 2026-03-28T19:59:05 |
| 01KMTX5NVW75GB5G4DPR7X7YBB | 01KMTX5NW8N48XYTNHG4P7JGYM | GATE_0 | 2026-03-28T19:01:43 |
| 01KMV00FQSVWCAX7GQX9CMQA03 | 01KMV00FV3KNYV7M8V6670X586 | GATE_0 | 2026-03-28T19:51:19 |
| 01KMV01DF6D0G4GEWYV5V1FX8E | 01KMV01DH3JVBEFCX4R39C2WBF | GATE_2 | 2026-03-28T19:51:50 |
| 01KMV02CGET10HJFTP9QQ7NA9K | 01KMV02CJ14VZT48K40VZ0P9CA | GATE_1 | 2026-03-28T19:52:21 |
| 01KMV0368GT2653FP8ZTM8D1H5 | 01KMV0369EQMPBA5WX6GR91173 | GATE_1 | 2026-03-28T19:52:47 |
| 01KMV06H2XMJRV3W0K6K9FACA7 | 01KMV06H3CDZ99548S7G3W48X9 | GATE_1 | 2026-03-28T19:54:37 |
| 01KMV0ENQXNNN3QPDW75SB0V1W | 01KMV0ENRBWGBN54WN77D6WJWH | GATE_1 | 2026-03-28T19:59:04 |

---

## §2 — Cleanup Tasks (in order)

### Task 1 — Cancel orphan runs in DB

```sql
UPDATE agents_os_v3_db.runs
SET status = 'CANCELLED',
    completed_at = NOW(),
    updated_at = NOW()
WHERE run_id IN (
  '01KMV0EQ8CN75M4JXNEJJH3AE5',
  '01KMV0EPWFE11ANDSP449PB3J0',
  '01KMTX5NW8N48XYTNHG4P7JGYM',
  '01KMV00FV3KNYV7M8V6670X586',
  '01KMV01DH3JVBEFCX4R39C2WBF',
  '01KMV02CJ14VZT48K40VZ0P9CA',
  '01KMV0369EQMPBA5WX6GR91173',
  '01KMV06H3CDZ99548S7G3W48X9',
  '01KMV0ENRBWGBN54WN77D6WJWH'
);
```

> **Note:** Use the correct schema/DB name as configured in your `.env`. Verify the table name is `runs` per DDL v1.0.2.

### Task 2 — Clear pipeline_state.json

After DB cancellation, reset `agents_os_v3/pipeline_state.json` to empty object:

```json
{}
```

Commit to `aos-v3` with message: `chore: clear BUILD-phase test runs from pipeline_state (pre-flight cleanup)`

### Task 3 — Verify API health

```bash
curl http://localhost:8090/api/health
# Expected: 200 {"status": "ok"}
```

If the server is not running, start it:
```bash
cd agents_os_v3
uvicorn modules.management.api:app --host 0.0.0.0 --port 8090
```

### Task 4 — Verify DB schema completeness

Confirm all DDL v1.0.2 tables exist:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('runs', 'gates', 'phases', 'teams', 'events',
                   'work_packages', 'pending_feedbacks', 'ideas',
                   'routing_rules', 'assignments', 'templates', 'policies');
```

Expected: **12 tables** returned.

### Task 5 — Smoke test (create + cancel)

```bash
# Create a smoke-test run
curl -X POST http://localhost:8090/api/runs \
  -H "Content-Type: application/json" \
  -d '{"work_package_id": "SMOKE_TEST_001", "domain_id": "TIKTRACK", "process_variant": "TRACK_FULL"}'

# Note the returned run_id, then cancel it:
curl -X POST http://localhost:8090/api/runs/{RUN_ID}/fail \
  -H "Content-Type: application/json" \
  -d '{"reason": "smoke test — pre-flight verification"}'
```

Expected: POST /runs → 201; POST /fail → 200. `pipeline_state.json` returns to `{}` after.

---

## §3 — Acceptance Criteria

- [ ] All 9 orphan runs: `status = CANCELLED` in DB
- [ ] `pipeline_state.json` = `{}`
- [ ] `GET /api/health` → 200
- [ ] 12 expected tables present in DB
- [ ] Smoke test: create + cancel cycle completes cleanly
- [ ] `GET http://localhost:8090/api/state` → returns without error (even with no active run)

## §4 — Reporting

Upon completion, send confirmation to Team 11 and Team 00:
```
Phase 0 COMPLETE — AOS v3 pre-flight check PASS
- 9 orphan runs cancelled
- pipeline_state.json cleared
- API healthy on port 8090
- DB schema confirmed: 12/12 tables
- Smoke test: PASS
Ready for S003-P005-WP001 run creation.
```

---

**log_entry | TEAM_00 | PHASE_0_PREFLIGHT_MANDATE | AOS_V3_FIRST_FLIGHT | TEAM_61 | 2026-03-29**
