---
id: TEAM_190_TO_TEAM_100_IDEA_051_AOS_SCHEDULER_RESEARCH_REPORT_v1.0.0
historical_record: true
from: Team 190 (Constitutional Validator / Intelligence)
to: Team 100 (Chief System Architect)
cc: Team 00, Team 101, Team 170, Team 61, Team 90
date: 2026-03-21
status: SUBMITTED — IDEA_PIPELINE_OPEN
idea_id: IDEA-051
program: IDEA_PIPELINE
source_program: S003-P012
source_wp_context: S003-P012-WP001
domain: agents_os
gate: IDEA_INTAKE_RECLASSIFICATION
type: REPORT
subject: Research-backed strategic expansion of Scheduler concept (idea-level)
review_target: _COMMUNICATION/team_101/TEAM_101_S003_P012_WP001_AOS_SCHEDULER_LOD200_v1.0.0.md
supersedes: N/A
reclassification_note: Scheduler topic moved from WP naming to canonical IDEA pipeline to prevent WP identity drift.---

# Team 190 Strategic Intelligence Report — Scheduler Direction (Research Expansion)

## 1) Executive Verdict (for current package)

**Current package verdict remains `BLOCK_FOR_ACTIVATION`.**

This verdict applies to the **current artifact identity and readiness**, not to the product direction itself.

**Direction verdict:**
- **Idea quality:** Strong and aligned with AOS maturity goals.
- **Execution readiness:** Not yet production-safe without contract hardening and governance realignment.

---

## 2) Executive Summary for Architects

### 2.1 What Team 190 recommends in one line
Proceed with Scheduler as a **new, dedicated WP** and promote it as a controlled orchestration capability only after explicit policy contracts are locked.

### 2.2 Why this is important
Scheduler introduces a second-order control loop over the pipeline. Without strict constraints, it can create race conditions, repeated runs, stale-context actions, and governance drift.

### 2.3 What to decide now (architecture board)
1. **Scope identity:** re-register under new WP id (do not reuse WP001).
2. **Control-plane model:** choose one of three architecture options (see §4).
3. **Policy contract:** lock overlap/catchup/idempotency/failure semantics as mandatory schema.
4. **Operational gate:** require simulation + mirror-consistency PASS before enablement.

---

## 3) Current-State Constraints (Internal Intelligence)

| ID | Severity | Constraint | Evidence-by-path |
|---|---|---|---|
| C-01 | HIGH | WP identity collision (`S003-P012-WP001` used by SSOT lane and scheduler proposal) | `_COMMUNICATION/team_101/TEAM_101_S003_P012_WP001_AOS_SCHEDULER_LOD200_v1.0.0.md`; `_COMMUNICATION/team_61/TEAM_61_SSOT_IMPLEMENTATION_DELIVERY_v1.0.0.md`; `_COMMUNICATION/_Architects_Decisions/ARCHITECT_REVIEW_S003_P012_WP001_SSOT_PASS_v1.0.0.md` |
| C-02 | HIGH | `--trigger` command path proposed but not implemented in pipeline entrypoints | `_COMMUNICATION/team_101/TEAM_101_S003_P012_WP001_AOS_SCHEDULER_LOD200_v1.0.0.md`; `pipeline_run.sh` |
| C-03 | HIGH | scheduled mandate storage path and seed artifact absent | `_COMMUNICATION/team_101/TEAM_101_S003_P012_WP001_AOS_SCHEDULER_LOD200_v1.0.0.md`; `_COMMUNICATION/agents_os/scheduled_mandates/` missing |
| C-04 | MEDIUM | WSM / registry / runtime pipeline-state mirrors diverge in S003-P012 tracking | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`; `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md`; `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` |

---

## 4) Architecture Options (Decision Matrix)

## Option A — In-Pipeline Native Scheduler
Scheduler embedded in `pipeline.py` and invoked via `pipeline_run.sh trigger <schedule_id>`.

Pros:
1. Single toolchain for operators.
2. Shared governance/event model.
3. Easy alignment with existing SSOT context refresh flow.

Cons:
1. Tighter coupling between orchestration and scheduling logic.
2. Higher blast-radius for pipeline regressions.
3. Harder independent scaling.

Best for:
- Teams prioritizing simplicity and one operational entrypoint.

---

## Option B — External Scheduler + Pipeline Trigger API (Recommended)
Use external scheduler (e.g., GitHub Actions/Cron/Argo) as clock; pipeline handles validated trigger execution only.

Pros:
1. Clear separation of concerns (clock vs orchestration).
2. Better operational portability and failover patterns.
3. Reduced coupling to pipeline command parser changes.

Cons:
1. Requires strict trigger-auth and dedup contracts.
2. Requires robust run ledger for cross-system traceability.

Best for:
- AOS roadmap with future multi-runner / multi-domain automation.

---

## Option C — Hybrid (Policy in Pipeline, Execution via Workers)
Policy and schedule registry inside AOS; execution delegated to worker queue.

Pros:
1. Strong policy governance + scalable execution.
2. Better long-term extensibility for complex workloads.

Cons:
1. Highest initial complexity.
2. Requires queue semantics and stronger observability stack.

Best for:
- Later phase after WP-level stabilization.

---

## Team 190 Recommendation
Adopt **Option B** now (external clock + internal validated trigger) as the best risk/benefit balance.

---

## 5) Mandatory Policy Contract (Non-Negotiable)

Any approved scheduler design must include explicit policies:

1. **Overlap Policy**
- Enum: `ALLOW | FORBID | REPLACE | BUFFER_ONE | BUFFER_ALL`

2. **Catchup / Missed Runs**
- `catchup_window_seconds`
- `max_missed_runs`
- `backfill_mode: NONE | SAFE | FULL`

3. **Idempotency / Dedup**
- Required `idempotency_key`
- Dedup TTL + duplicate behavior (`DROP | MERGE | REPLAY_BLOCKED`)

4. **Failure Semantics**
- Retry attempts + backoff profile
- `pause_on_failure` behavior
- Escalation route after threshold

5. **Time Policy**
- Default UTC
- Optional IANA timezone
- Explicit DST skip/duplicate rule

6. **Security / Authorization**
- Who can create/pause/resume schedules
- Allowed target teams and command scopes
- Path validation for schedule artifacts

7. **Observability / Audit**
- Mandatory run ledger fields:
  - `schedule_id`, `run_id`, `scheduled_time`, `started_time`, `finished_time`
  - `result`, `skip_reason`, `dedup_reason`, `trigger_source`, `pipeline_state_hash`

---

## 6) Research Alignment (External Systems Lessons)

### 6.1 Temporal
- Schedules are first-class entities with identity and overlap/failure controls.
- Lesson: Separate schedule identity from individual execution instances.

### 6.2 Airflow
- Logical date/catchup semantics are explicit.
- Lesson: Backfill/catchup must be a policy choice, not implicit behavior.

### 6.3 Kubernetes CronJob / Argo CronWorkflow
- Concurrency policy and missed-start handling are first-class fields.
- Lesson: Scheduler contracts must encode missed-run and concurrency decisions.

### 6.4 GitHub Actions schedule
- Schedules can delay/drop under load; scheduler is not strict real-time.
- Lesson: Design for eventual trigger reliability with dedup and reconciliation.

### 6.5 Celery / APScheduler
- Misfire/coalescing/max_instances are explicit controls.
- Lesson: Without these controls, production periodic jobs quickly become unstable.

---

## 7) Core Contradictions to Resolve Before Design Approval

1. **Identity contradiction:** WP001 cannot concurrently represent SSOT closure and new scheduler scope.
2. **Runtime contradiction:** Proposed trigger exists in docs but not in command/runtime contracts.
3. **Governance contradiction:** state mirrors are not converged across WSM/registry/runtime state.
4. **Chronology contradiction:** Some artifacts show date ordering anomalies that weaken audit confidence.

---

## 8) Proposed Discussion Agenda for Architects (Deep-Dive)

1. **What problem are we solving first?**
- Daily drift detection only, or generic job scheduler platform?

2. **What reliability class is required?**
- Best-effort vs guaranteed-at-least-once vs controlled-at-most-once semantics.

3. **What is the blast-radius policy?**
- What scheduler actions are allowed to mutate state directly?

4. **What is the governance boundary?**
- Which teams own schedule registry, runtime controls, and emergency pause?

5. **What is the migration strategy?**
- How to migrate existing manual recurring tasks into controlled scheduler artifacts?

---

## 9) Decision Package (for Team 100/00 approval thread)

Required explicit decisions:
1. `DEC-SCH-01`: New WP registration for Scheduler (recommended `S003-P012-WP006` after Team 00 registry confirmation, or next free id).
2. `DEC-SCH-02`: Option B selected as baseline architecture.
3. `DEC-SCH-03`: Policy contract in §5 becomes mandatory schema.
4. `DEC-SCH-04`: Pre-activation gate includes simulation suite PASS + mirror consistency PASS.
5. `DEC-SCH-05`: No direct auto-advance actions from scheduler until post-pilot approval.

---

## 10) Phased Rollout Recommendation

### Phase 0 — Governance Prep
1. Re-register WP
2. Lock schema and authority boundaries

### Phase 1 — Pilot (Read/Analyze only)
1. Trigger generates reports only (no pipeline mutation)
2. Observe false positives / drift quality

### Phase 2 — Controlled Action
1. Allow limited automated actions with strong guardrails
2. Require approval checkpoints for high-impact transitions

### Phase 3 — Scale
1. Expand schedule catalog
2. Add dashboard controls (pause/resume/history)

---

## 11) References

### Internal
1. `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/_COMMUNICATION/team_101/TEAM_101_S003_P012_WP001_AOS_SCHEDULER_LOD200_v1.0.0.md`
2. `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/_COMMUNICATION/team_61/TEAM_61_SSOT_IMPLEMENTATION_DELIVERY_v1.0.0.md`
3. `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/_COMMUNICATION/_Architects_Decisions/ARCHITECT_REVIEW_S003_P012_WP001_SSOT_PASS_v1.0.0.md`
4. `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/pipeline_run.sh`
5. `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
6. `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md`

### External
1. https://docs.temporal.io/schedule
2. https://airflow.apache.org/docs/apache-airflow/stable/administration-and-deployment/scheduler.html
3. https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dag-run.html
4. https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/
5. https://argo-workflows.readthedocs.io/en/latest/cron-workflows/
6. https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
7. https://docs.celeryq.dev/en/v5.3.5/userguide/periodic-tasks.html
8. https://apscheduler.readthedocs.io/en/master/userguide.html

---

**log_entry | TEAM_190 | STRATEGIC_INTELLIGENCE_EXPANSION | IDEA_051_SCHEDULER_DIRECTION | BLOCK_FOR_ACTIVATION_CURRENT_PACKAGE | v1.0.0 | 2026-03-21**
