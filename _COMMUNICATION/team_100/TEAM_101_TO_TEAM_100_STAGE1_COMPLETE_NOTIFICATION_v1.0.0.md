---
id: TEAM_101_TO_TEAM_100_STAGE1_COMPLETE_NOTIFICATION_v1.0.0
historical_record: true
from: Team 101
to: Team 100
date: 2026-03-25
status: SUBMITTED---

# Stage 1 Complete — Entity Dictionary (handoff to Team 100)

## Deliverable

- **File:** `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v1.0.0.md`
- **Path (absolute):** `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v1.0.0.md`

## Summary (5 lines)

1. **Canonical name for pipeline execution:** `Run` (not `Execution`); aggregate root `runs` with denormalized `current_phase_id` synced in the same transaction as append-only `events`.
2. **Counters:** `correction_cycle_count` stored on `runs`; events remain the audit trail for verification.
3. **Routing:** explicit integer `priority` on `routing_rules`; policies use `scope_type` + nullable FKs with `priority` for most-specific wins.
4. **Templates:** optional `domain_id` for domain-specific overrides; global when NULL.
5. **Events:** `actor_type` ∈ `human` | `agent` | `scheduler` | `system`; events immutable append-only with optional hash chain per Annex D.

## OPEN_QUESTIONs & Team 00 gate

- **Remaining OPEN_QUESTIONs:** (1) shape of `pipeline_state.json` projection (per-domain object vs array of active runs); (2) whether terminal `Run.status` values `ABORTED` / `SUSPENDED` ship in v3.0 or v3.1.
- **Team 00 approval recommended before Team 190 locks file-contract review:** **Yes** — especially **OPEN_QUESTION (1)** on `pipeline_state.json` root shape (affects `state/` module and UX parity with current dual-domain file).

---

**log_entry | TEAM_101 | STAGE1_COMPLETE_NOTIFICATION | TEAM_100 | 2026-03-25**
