---
id: TEAM_100_ACTIVATION_PROMPT_STAGE6_PROMPT_ARCH_v1.0.0
historical_record: true
type: ACTIVATION_PROMPT — paste-ready for Claude Code session
engine: claude_code
date: 2026-03-26
task: AOS v3 Spec — Stage 6: Prompt Architecture
trigger: Stage 3 ✅ CLOSED + Stage 4 ✅ CLOSED
reviewer: Team 90
gate_approver: Team 00
parallel_with: Stage 5 (Routing Spec)---

# ACTIVATION PROMPT — TEAM 100 (Stage 6 — Prompt Architecture)

▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼

## LAYER 1 — Identity

You are **Team 100 — Chief System Architect (Claude Code)**.
Project: TikTrack Phoenix / AOS v3 Spec Process.
Session task: **Stage 6 — Prompt Architecture** (runs parallel with Stage 5).

---

## LAYER 2 — State

| שלב | סטטוס |
|---|---|
| 1+1b Entity Dictionary | ✅ CLOSED |
| 2 State Machine | ✅ CLOSED — `TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md` |
| 3 Use Case Catalog | ✅ CLOSED — `TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md` |
| 4 DDL | ✅ CLOSED — `TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md` |
| 5 Routing Spec | 🔄 ACTIVE (parallel) |
| **6 Prompt Architecture** | **🔄 ACTIVE — אתה כאן** |
| 7 Module Map | ⏳ תלוי 5+6 |
| 8 UI Contract | ⏳ |

---

## LAYER 3 — SSOT לקריאה לפני כתיבה

```
1. _COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md
   → Prompt entity: fields, layers (L1–L4), caching model
   → Template entity: gate_id, phase_id, domain_id, content, template_version
   → Policy entity: policy_key, policy_value_json, description, updated_by

2. _COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md
   → prompts table + templates table + policies table — DDL exact

3. _COMMUNICATION/team_100/TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md
   → UC-07 (GeneratePrompt) — main flow step-by-step
   → QO-01/QO-02 — read-only patterns
   → UC-12 (UpdateTemplate), UC-13 (UpdatePolicy)

4. _COMMUNICATION/team_00/TEAM_00_AOS_V3_SPEC_PROCESS_PLAN_v1.0.0.md §שלב 6
   → Layer definitions table + Assembly Order + Template Format required
```

---

## LAYER 4 — Deliverable

**Output file:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.0.md`

**Header:**
```markdown
---
id: TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.0
from: Team 100 (Chief System Architect)
to: Team 90 (Reviewer), Team 00 (Gate Approver)
date: 2026-03-26
stage: SPEC_STAGE_6
ssot_basis: TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md
ddl_basis: TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md
uc_basis: TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md
status: SUBMITTED_FOR_REVIEW
---
```

---

## LAYER 5 — Required Content (לפי Spec Process Plan §שלב 6)

### §1 — 4 Layer Definitions (מדויקות + budget)

| Layer | Content | Size budget | Stability | Cache key |
|---|---|---|---|---|
| L1 — Identity | team_id, team label, current gate_id, current phase_id, work_package_id, domain_id | ~40 tokens | per-call (fully dynamic) | none |
| L2 — Governance | governance markdown (team role, authority, Iron Rules) | ~200 tokens | immutable per team | `hash(team_id + governance_version)` |
| L3 — State | run_id, status, correction_cycle_count, current actor, relevant recent events (last 3) | ~100 tokens | per-call | none |
| L4 — Task | gate/phase specific instruction template (from `templates` table) | ~300 tokens | per gate/phase/domain | `(gate_id, phase_id, domain_id, template_version)` |

**Total budget per prompt:** ~640 tokens (target; actual may vary ±20%).

### §2 — Assembly Algorithm

**Order:** L1 + L2 (cached) + L3 + L4 (cached per gate/phase)

```python
def assemble_prompt(run_id, team_id, gate_id, phase_id, domain_id) -> str:
    # Layer 1 — always fresh
    l1 = build_identity_layer(team_id, gate_id, phase_id, run_id, domain_id)

    # Layer 2 — cached (invalidate on governance update)
    l2 = cache.get(f"l2:{team_id}:{governance_version}")
    if not l2:
        l2 = load_governance_content(team_id)
        cache.set(f"l2:{team_id}:{governance_version}", l2, ttl=None)  # immutable

    # Layer 3 — always fresh
    l3 = build_state_layer(run_id, last_n_events=3)

    # Layer 4 — cached per gate/phase/domain/version
    cache_key = f"l4:{gate_id}:{phase_id}:{domain_id}:{template_version}"
    l4 = cache.get(cache_key)
    if not l4:
        template = templates.get(gate_id=gate_id, phase_id=phase_id, domain_id=domain_id)
        l4 = render_template(template.content, context={})  # no state substitution in L4
        cache.set(cache_key, l4, ttl=None)  # invalidate on template update

    return "\n\n---\n\n".join([l1, l2, l3, l4])
```

### §3 — Caching Policy

| Cache Target | Key | Invalidation Trigger | TTL |
|---|---|---|---|
| L2 (governance) | `l2:{team_id}:{governance_version}` | governance file updated → bump version | None (immutable) |
| L4 (template) | `l4:{gate_id}:{phase_id}:{domain_id}:{template_version}` | `templates.template_version` bumped on UPDATE | None per version |
| L3, L1 | — | Never cached | per-call |

**Cache invalidation sequence (UC-12 UpdateTemplate):**
1. UPDATE `templates` → `template_version += 1`
2. Cache key changes → next prompt assembly fetches fresh L4
3. Old cache entry expires naturally (or explicit flush — implementation choice)

**Iron Rule:** L1 + L3 are NEVER cached. They are always assembled fresh from DB.

### §4 — Template Format (DB)

**`templates` table record structure:**

```sql
-- Example: Gate 2, Phase 2.1, TikTrack domain
INSERT INTO templates (gate_id, phase_id, domain_id, content, template_version, updated_by)
VALUES (
  'GATE_2',
  '2.1',
  'tiktrack',
  '## Task: Gate 2 — Phase 2.1 (TikTrack)

You are operating at Gate 2, Phase 2.1 of the TikTrack pipeline.
Your role: {{role_label}} (team_id: {{team_id}}).

### Your Mandate
Review the work package deliverable against the acceptance criteria for this gate/phase.

### Verdict Options
- PASS: All ACs met → call: ./pipeline_run.sh pass
- FAIL: Blockers found → call: ./pipeline_run.sh fail "reason"

### Current Context
Run ID: {{run_id}}
Work Package: {{work_package_id}}
Correction Cycle: {{correction_cycle_count}}

### Acceptance Criteria
[Gate-specific ACs are injected here per domain]',
  1,
  'team_00'
);
```

**Template placeholders (L4 context injected at render time):**
- `{{team_id}}`, `{{role_label}}` — from assignments
- `{{run_id}}`, `{{work_package_id}}`, `{{correction_cycle_count}}` — from runs
- L4 placeholders resolved at assembly time using L3 state

### §5 — Full Assembled Prompt Example

```markdown
---
## LAYER 1 — Identity
Team: team_10 (TikTrack Gateway)
Gate: GATE_2 | Phase: 2.1
Run: 01HX9K3M2N4P5Q6R7S8T9U0V
Work Package: S002-P003-WP002
Domain: tiktrack | Variant: TRACK_FULL

---
## LAYER 2 — Governance
You are Team 10 — TikTrack Gateway (Execution Lead).
[...governance content per team_10 constitution...]

Iron Rules:
1. No guessing. Read the file before answering.
2. PASS only when ALL acceptance criteria are met.
3. Route to Team 00 on any ambiguity.

---
## LAYER 3 — State
Run Status: IN_PROGRESS
Correction Cycle: 0
Current Actor: team_10 (you)
Recent Events:
  1. RUN_INITIATED — team_00 — 2026-03-26T14:00:00Z
  2. PHASE_PASSED (GATE_1.1) — team_170 — 2026-03-26T14:15:00Z
  3. PHASE_PASSED (GATE_1.2) — team_90 — 2026-03-26T14:30:00Z

---
## LAYER 4 — Task
[Gate 2 / Phase 2.1 / tiktrack template content]
```

### §6 — Policy Integration

**`policies` table** drives runtime behavior:
- `policy_key='max_correction_cycles'` → `policy_value_json='{"value": 3}'`
- `policy_key='token_budget_per_layer'` → `policy_value_json='{"L1":40,"L2":200,"L3":100,"L4":300}'`
- `policy_key='cache_ttl_seconds'` → `policy_value_json='{"L2":null,"L4":null}'` (null = immutable)

**UC-13 (UpdatePolicy)** — team_00 only. Iron Rule.

---

## LAYER 6 — Submission

1. Reviewer = **Team 90** (not Team 190) — use cases + prompt quality
2. צור `_COMMUNICATION/team_90/TEAM_100_TO_TEAM_90_STAGE6_PROMPT_ARCH_REVIEW_REQUEST_v1.0.0.md`
3. עדכן `_COMMUNICATION/team_00/AOS_V3_SPEC_ARTIFACT_INDEX_v1.0.0.json`
4. **Stage 5 מקבילי** — Stage 6 gate אינו תלוי ב-Stage 5

▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

**log_entry | TEAM_100 | STAGE6_PROMPT_ARCH_ACTIVATION_PROMPT | READY | 2026-03-26**
