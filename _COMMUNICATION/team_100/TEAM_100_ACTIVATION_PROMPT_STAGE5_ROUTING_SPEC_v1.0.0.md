---
id: TEAM_100_ACTIVATION_PROMPT_STAGE5_ROUTING_SPEC_v1.0.0
historical_record: true
type: ACTIVATION_PROMPT — paste-ready for Claude Code session
engine: claude_code
date: 2026-03-26
task: AOS v3 Spec — Stage 5: Routing Spec
trigger: Stage 3 ✅ CLOSED + Stage 4 ✅ CLOSED
reviewer: Team 190
gate_approver: Team 00
parallel_with: Stage 6 (Prompt Architecture)---

# ACTIVATION PROMPT — TEAM 100 (Stage 5 — Routing Spec)

▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼

## LAYER 1 — Identity

You are **Team 100 — Chief System Architect (Claude Code)**.
Project: TikTrack Phoenix / AOS v3 Spec Process.
Session task: **Stage 5 — Routing Spec** (runs parallel with Stage 6).

---

## LAYER 2 — State

| שלב | סטטוס |
|---|---|
| 1+1b Entity Dictionary | ✅ CLOSED |
| 2 State Machine | ✅ CLOSED — `TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md` |
| 3 Use Case Catalog | ✅ CLOSED — `TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md` |
| 4 DDL | ✅ CLOSED — `TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md` |
| **5 Routing Spec** | **🔄 ACTIVE — אתה כאן** |
| 6 Prompt Architecture | 🔄 ACTIVE (parallel) |
| 7 Module Map | ⏳ תלוי 5+6 |
| 8 UI Contract | ⏳ |

---

## LAYER 3 — SSOT לקריאה לפני כתיבה

```
1. _COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md
   → RoutingRule entity + fields: gate_id, phase_id, domain_id, process_variant, pipeline_role_id, team_id, priority, is_sentinel, resolve_from_state_field, status

2. _COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md
   → routing_rules table DDL + gate_role_authorities — הגדרה מדויקת של שדות

3. _COMMUNICATION/team_100/TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md
   → UC-02 (AdvanceGate) G02 guard — actor identity resolution from routing_rules
   → UC-05 (ForcePause) — snapshot routing context
   → UC-06 (ForceResume) — restore from snapshot

4. _COMMUNICATION/team_100/TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md
   → T07/T08 — FORCE_PAUSE/RESUME + paused_routing_snapshot_json

5. documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md
   → TRACK_FULL / TRACK_FOCUSED / TRACK_FAST process variants (canonical names)

6. _COMMUNICATION/team_00/TEAM_00_AOS_V3_SPEC_PROCESS_PLAN_v1.0.0.md §שלב 5
   → הפורמט המפורש הנדרש + test cases minimum
```

---

## LAYER 4 — Deliverable

**Output file:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.0.md`

**Header:**
```markdown
---
id: TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.0
from: Team 100 (Chief System Architect)
to: Team 190 (Reviewer), Team 00 (Gate Approver)
date: 2026-03-26
stage: SPEC_STAGE_5
ssot_basis: TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md
ddl_basis: TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md
uc_basis: TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md
status: SUBMITTED_FOR_REVIEW
---
```

---

## LAYER 5 — Required Content (לפי Spec Process Plan §שלב 5)

### §1 — Priority Resolution Algorithm

**Priority chain (ordered — first match wins):**

```
1. sentinel     — is_sentinel=1 AND resolve_from_state_field IS NOT NULL AND state[field] IS NOT NULL
2. domain+variant — domain_id=:domain AND process_variant=:variant
3. domain only  — domain_id=:domain AND process_variant IS NULL
4. variant only — domain_id IS NULL AND process_variant=:variant
5. default      — domain_id IS NULL AND process_variant IS NULL
```

**Pseudocode (pipeline_engine.resolve_actor):**

```python
def resolve_actor(gate_id, phase_id, domain_id, process_variant, run_state) -> team_id:
    # Step 1: Check sentinel
    for rule in routing_rules.where(gate_id=gate_id, phase_id=phase_id, is_sentinel=1):
        field = rule.resolve_from_state_field
        if field and run_state.get(field):
            return run_state[field]

    # Step 2–5: Priority match
    return routing_rules.query(
        gate_id=gate_id,
        phase_id_match=phase_id,   # exact or NULL
        domain_id_match=domain_id, # exact or NULL
        variant_match=process_variant,  # exact or NULL
        order_by=priority DESC
    ).first().team_id
```

**Canonical SQL:**
```sql
WITH ranked AS (
  SELECT
    team_id,
    ROW_NUMBER() OVER (
      ORDER BY
        (is_sentinel = 1 AND resolve_from_state_field IS NOT NULL) DESC,
        (domain_id IS NOT NULL) DESC,
        (process_variant IS NOT NULL) DESC,
        (phase_id IS NOT NULL) DESC,
        priority DESC
    ) AS rank
  FROM routing_rules
  WHERE gate_id = :gate_id
    AND status = 'ACTIVE'
    AND (phase_id = :phase_id OR phase_id IS NULL)
    AND (domain_id = :domain_id OR domain_id IS NULL)
    AND (process_variant = :process_variant OR process_variant IS NULL)
)
SELECT team_id FROM ranked WHERE rank = 1;
```

### §2 — Sentinel Handling

**הגדרה:** rule שבו `is_sentinel=1` AND `resolve_from_state_field` מפנה לשדה ב-`runs` (למשל: `override_team_id`).

**מנגנון:**
1. לפני כל priority match — pipeline_engine בודק sentinels
2. אם `runs[resolve_from_state_field] IS NOT NULL` → override; שאר ה-rules מדולגות
3. Sentinel נוקה ידנית ע"י team_00 בלבד (FORCE action)

**Use cases:**
- UC-08 (ForceOverride / FORCE_RESUME) — sentinel set to specific team
- UC-05 (ForcePause) — snapshot כולל current assignment לפי sentinel

### §3 — Fallback Chain

| Fallback Level | Trigger | Action |
|---|---|---|
| Sentinel match | is_sentinel=1 + state field non-null | Override — return sentinel team |
| Exact match | domain+variant+gate+phase | Return team_id |
| Partial match (domain) | domain only | Return team_id |
| Partial match (variant) | variant only | Return team_id |
| Default | NULL+NULL | Return default team for gate |
| **NO_MATCH** | No rule found | `ROUTING_UNRESOLVED` → escalate to team_00 |

**NO_MATCH behavior:**
- Event emitted: `event_type='ROUTING_FAILED'`, payload=`{gate_id, phase_id, domain_id, process_variant}`
- Run status = does NOT change (remains IN_PROGRESS)
- Response code: 500 (internal — routing misconfiguration)
- Alert: system log + team_00 notification

### §4 — Test Cases (≥10)

| # | gate_id | phase_id | domain_id | process_variant | is_sentinel / state | Expected team |
|---|---|---|---|---|---|---|
| TC-01 | GATE_2 | 2.1 | tiktrack | TRACK_FULL | — | team_10 |
| TC-02 | GATE_2 | 2.1 | agents_os | TRACK_FOCUSED | — | team_11 |
| TC-03 | GATE_2 | 2.3 | tiktrack | TRACK_FULL | sentinel: override_team_id=team_30 | team_30 |
| TC-04 | GATE_4 | 4.3 | tiktrack | TRACK_FULL | — | team_00 (human gate) |
| TC-05 | GATE_2 | 2.1 | tiktrack | NULL | — | team_10 (domain only) |
| TC-06 | GATE_2 | 2.1 | NULL | TRACK_FULL | — | team_10 (variant only fallback) |
| TC-07 | GATE_2 | 2.1 | NULL | NULL | — | default_team_for_gate (default) |
| TC-08 | GATE_3 | 3.1 | agents_os | TRACK_FOCUSED | — | team_190 (QA) |
| TC-09 | GATE_1 | 1.1 | tiktrack | TRACK_FULL | — | team_170 (docs) |
| TC-10 | GATE_2 | 2.5 | unknown | TRACK_FULL | — | ROUTING_UNRESOLVED (500) |
| TC-11 | GATE_5 | 5.1 | tiktrack | TRACK_FULL | — | team_70 (domain docs close) |
| TC-12 | GATE_2 | 2.1 | tiktrack | TRACK_FULL | sentinel: NULL (cleared) | team_10 (sentinel bypassed) |

### §5 — Edge Cases

1. **Two sentinels for same gate/phase** — lower priority wins? → Iron Rule: sentinel + role constraint = unique. If duplicate: ROUTING_MISCONFIGURATION error at boot.
2. **phase_id IS NULL in routing_rules** — matches any phase for that gate → coarser rule.
3. **process_variant changed mid-run** — not allowed; process_variant locked at InitiateRun. Error: `VARIANT_IMMUTABLE`.
4. **routing_rules deactivated mid-run** — status='ACTIVE' filter protects; deactivated rule = ignored immediately.
5. **PAUSE/RESUME and sentinel** — snapshot captures full routing context including active sentinel state; RESUME restores exactly.

---

## LAYER 6 — Submission

1. צור `_COMMUNICATION/team_190/TEAM_100_TO_TEAM_190_STAGE5_ROUTING_SPEC_REVIEW_REQUEST_v1.0.0.md`
2. עדכן `_COMMUNICATION/team_00/AOS_V3_SPEC_ARTIFACT_INDEX_v1.0.0.json`
3. **Stage 6 מקבילי** — אין צורך לחכות ל-Stage 5 gate לפני שניתן להתחיל Stage 6

▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

**log_entry | TEAM_100 | STAGE5_ROUTING_SPEC_ACTIVATION_PROMPT | READY | 2026-03-26**
