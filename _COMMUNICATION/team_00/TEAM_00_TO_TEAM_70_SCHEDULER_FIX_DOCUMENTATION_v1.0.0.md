---
**project_domain:** TIKTRACK
**id:** TEAM_00_TO_TEAM_70_SCHEDULER_FIX_DOCUMENTATION_v1.0.0
**from:** Team 00 (Chief Architect)
**to:** Team 70 (Documentation)
**cc:** Team 10 (awareness — no action required)
**date:** 2026-03-04
**status:** ACTIVE — ACTION REQUIRED
**work_package_id:** S002-P003-WP002
---

# TEAM 00 → TEAM 70 | Documentation Mandate — Scheduler run_after Fix

---

## §1 CONTEXT

A P1 bug was identified and fixed directly by Team 00 (2026-03-04) in:

```
api/background/scheduler_startup.py
```

**What changed (technical summary):**

The `run_after` dependency mechanism in `scheduler_registry.py` is now actively enforced at runtime. The scheduler startup module was updated to:
1. Read `run_after` declarations from the registry
2. Delay dependent jobs by one interval on startup (instead of firing all jobs simultaneously)
3. Trigger dependent jobs immediately after their parent completes via `_scheduler.modify_job()`

This change affects the documented behavior of the background task system.

---

## §2 YOUR MANDATE

Team 70 must update all documentation that describes background task scheduling behavior where this change is material.

### Documents to locate and update

Search the repository for documents that describe:
- `scheduler_startup.py` behavior
- `scheduler_registry.py` `run_after` field
- Background job execution order
- APScheduler job registration behavior

**Likely candidate locations:**
- `documentation/docs-system/` — any technical architecture or infrastructure docs
- `documentation/docs-governance/` — any system design docs referencing background tasks
- Any ADR or directive referencing `ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION`

### What to document / update

For each document found that references background task scheduling:

1. **Add or update**: description of the `run_after` mechanism — it is now ENFORCED at runtime (not merely declared)

2. **Correct any text** that implies all jobs fire at the same time or with the same `next_run_time` on startup

3. **Add behavioral note** if not already present:

> **run_after enforcement (active since 2026-03-04):**
> Jobs declared with `run_after` in `scheduler_registry.py` are:
> (a) delayed on startup by one full interval — they do not fire simultaneously with their parent
> (b) triggered immediately by the parent's wrapper after successful completion
> (c) NOT triggered if the parent job raises an exception — stale-data protection is preserved

4. **Record the fix** in any changelog or technical history section present in those documents

### If no existing documentation covers scheduler internals

Create a brief technical note at:
```
documentation/docs-system/[appropriate section]/BACKGROUND_TASK_SCHEDULER_BEHAVIOR.md
```

Covering:
- `scheduler_registry.py` as Iron Rule (canonical job registry — all jobs defined here)
- `run_after` field: purpose + runtime enforcement
- Startup behavior: parent jobs = immediate; dependent jobs = delayed by interval
- Runtime chaining: parent wrapper triggers dependents via `modify_job` on success
- Fallback: if parent fails, dependent still runs on its own interval (safety fallback only)

---

## §3 COMPLETION REQUIREMENT

Documentation must be updated/created before GATE_8 of WP002.

No GATE_8 sign-off is complete without accurate documentation of the scheduler's runtime behavior.

Notify Team 10 (via your communication channel) when documentation is complete — Team 10 will include it in the GATE_8 submission.

---

**log_entry | TEAM_00→TEAM_70 | SCHEDULER_RUN_AFTER_DOCUMENTATION_MANDATE | ACTIVE | 2026-03-04**
