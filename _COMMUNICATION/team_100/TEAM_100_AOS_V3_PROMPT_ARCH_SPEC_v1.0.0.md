---
id: TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 90 (Reviewer), Team 00 (Gate Approver)
date: 2026-03-26
stage: SPEC_STAGE_6
ssot_basis: TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md
ddl_basis: TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md
uc_basis: TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md
routing_basis: TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.1.md
status: SUBMITTED_FOR_REVIEW
reviewer: team_90
gate_approver: team_00
architectural_decisions_integrated: AD-S5-01, AD-S5-02, AD-S5-03, AD-S5-05---

# AOS v3 — Prompt Architecture Spec (Stage 6) — v1.0.0

---

## SSOT Alignment Corrections

The activation prompt's algorithm drafts contained field names that **diverge** from the Entity Dictionary v2.0.2 and DDL v1.0.1. The following corrections were applied per Iron Rule #2 ("Zero deviation from SSOT"):

| Draft Term | SSOT Correction | Source |
|---|---|---|
| `templates.content` | **`body_markdown`** — DDL column name | DDL §2 `templates`; Dict §Template |
| `templates.template_version` | **`version`** — DDL column name is `version INTEGER` | DDL §2 `templates`; Dict §Template |
| `templates.updated_by` | **Does not exist** in DDL or Dict. Removed from all references. | DDL §2 `templates` |
| Template `GET` without `is_active` filter | **Must filter `is_active=1`** — Dict §Template Invariant 1 | Dict §Template |
| `Prompt` as DB entity | **Value Object** — not persisted in normal engine flow; `prompts` table is audit/PFS only | Dict §Prompt; DDL §2 `prompts` comment |

---

## §1 — 4 Layer Definitions

| Layer | Content | Size Budget | Stability | Cache Key | DB Source |
|---|---|---|---|---|---|
| **L1 — Identity** | `team_id`, team label, `gate_id`, `phase_id`, `run_id`, `work_package_id`, `domain_id`, **`process_variant`** | ~40 tokens | per-call (fully dynamic) | none — **NEVER cached** | `runs` + `teams` + `assignments` |
| **L2 — Governance** | Governance markdown: team role, authority, Iron Rules, operating boundaries | ~200 tokens | immutable per team + version | `l2:{team_id}:{governance_version}` | FILE: team constitution markdown + `policies` table (`governance_version_{team_id}`) |
| **L3 — State** | `run_id`, `status`, `correction_cycle_count`, current actor, **`domain_id`**, **`process_variant`**, recent events (last N), **sentinel field if active** | ~100 tokens | per-call (fully dynamic) | none — **NEVER cached** | `runs` + `events` + `assignments` |
| **L4 — Task** | Gate/phase/domain-specific instruction template | ~300 tokens | per gate/phase/domain/version | `l4:{gate_id}:{phase_id}:{domain_id}:{version}` | `templates` table (`body_markdown`, `version`) |

**Total budget:** ~640 tokens (target; ±20%). Advisory — not a hard limit (see EC-04).

**Iron Rule:** L1 + L3 are **NEVER** cached. Any caching of L1 or L3 data is an architectural violation.

### Layer Content Detail

**L1 — Identity** (per-call, ~40 tokens):
- `team_id` — resolved via `assignments.team_id` (or sentinel override via Routing Spec §1.3)
- Team label — from `teams.label`
- `gate_id` — from `runs.current_gate_id`
- `phase_id` — from `runs.current_phase_id`
- `run_id` — from `runs.id`
- `work_package_id` — from `runs.work_package_id`
- `domain_id` — from `runs.domain_id` (AD-S5-01: required for sentinel context)
- `process_variant` — from `runs.process_variant` (AD-S5-01: required for sentinel context)

**L2 — Governance** (cached per team+version, ~200 tokens):
- Team constitution markdown (FILE source: `team_{XX}.md` or equivalent)
- Role description, authority scope, Iron Rules for the team
- Operating boundaries and escalation paths

**L3 — State** (per-call, ~100 tokens):
- `run_id`, `status` — current run state
- `correction_cycle_count` — retry counter
- Current actor: `team_id` + `role_id` (from Assignment resolution)
- `domain_id` + `process_variant` — runtime context (AD-S5-01)
- Recent events: last N events (configurable via `last_n_events_in_l3` policy; default N=3)
- Sentinel field: if `runs.lod200_author_team IS NOT NULL` → rendered as awareness metadata (AD-S5-05). **Not** an instruction — the team knows an override is active.

**L4 — Task** (cached per gate+phase+domain+version, ~300 tokens):
- Gate/phase/domain-specific instruction template from `templates.body_markdown`
- Contains `{{placeholder}}` markers resolved at assembly time (see §4)
- **L4 = instructions only** — no state data. State lives in L3.

---

## §2 — Assembly Algorithm

### 2.1 Precondition (AD-S5-02)

`assemble_prompt()` is called **only** when `run.status ∈ {'IN_PROGRESS', 'CORRECTION'}`.

When `run.status = 'PAUSED'`: no prompt assembly, no `resolve_actor()` call. Entry point for PAUSED runs is UC-08 (ResumeRun). See §7 for the complete PAUSED boundary.

When `run.status ∈ {'COMPLETE', 'NOT_STARTED'}`: no prompt assembly. `INVALID_RUN_STATUS` error.

### 2.2 Pseudocode

```python
@dataclass
class AssembledPrompt:
    """Value Object (Dict §Prompt) — not persisted in normal engine flow."""
    layer1_identity: str
    layer2_governance: str
    layer3_state: str
    layer4_task: str
    assembled_at: str        # ISO-8601 UTC
    content_hash: str        # SHA-256 hex of concatenated layers
    token_estimate: int | None


def assemble_prompt(
    run_id: str,
    team_id: str,
    gate_id: str,
    phase_id: str | None,
    domain_id: str,
    process_variant: str,
) -> AssembledPrompt:
    """
    Assembles a 4-layer prompt for the specified run + team + gate context.

    Precondition (AD-S5-02):
        run = db.get(runs, id=run_id)
        assert run.status in ('IN_PROGRESS', 'CORRECTION')

    Returns: AssembledPrompt value object
    Raises:
        InvalidRunStatus    if run.status not in ('IN_PROGRESS', 'CORRECTION')
        TemplateNotFound    if no active template for (gate_id, phase_id, domain_id)
        GovernanceNotFound  if no governance file for team_id
        TemplateRenderError if unknown placeholder in template
    """
    run = db.get(runs, id=run_id)

    if run.status not in ('IN_PROGRESS', 'CORRECTION'):
        raise InvalidRunStatus(
            run_id=run_id, status=run.status,
            message="assemble_prompt() requires IN_PROGRESS or CORRECTION"
        )

    # ── Layer 1 — Identity (always fresh — DB: runs + teams) ──────
    team = db.get(teams, id=team_id)
    l1 = build_identity_layer(
        team_id=team_id,
        team_label=team.label,
        gate_id=gate_id,
        phase_id=phase_id,
        run_id=run_id,
        work_package_id=run.work_package_id,
        domain_id=domain_id,
        process_variant=process_variant,
    )

    # ── Layer 2 — Governance (cached per team + governance_version) ─
    gov_version = _get_governance_version(team_id)
    l2_key = f"l2:{team_id}:{gov_version}"
    l2 = cache.get(l2_key)
    if not l2:
        l2 = load_governance_file(team_id)
        if not l2:
            raise GovernanceNotFound(team_id=team_id)
        cache.set(l2_key, l2, ttl=None)  # version-based invalidation only

    # ── Layer 3 — State (always fresh — DB: runs + events) ────────
    last_n = _get_policy_value('last_n_events_in_l3', default=3)
    l3 = build_state_layer(
        run=run,
        domain_id=domain_id,
        process_variant=process_variant,
        last_n_events=last_n,
        sentinel_value=run.lod200_author_team,  # AD-S5-05: awareness only
    )

    # ── Layer 4 — Task (cached per gate+phase+domain+version) ─────
    template = db.query(TEMPLATE_LOOKUP_SQL, {
        'gate_id': gate_id,
        'phase_id': phase_id,
        'domain_id': domain_id,
    })
    if not template:
        raise TemplateNotFound(gate_id=gate_id, phase_id=phase_id, domain_id=domain_id)

    l4_key = f"l4:{gate_id}:{phase_id}:{domain_id}:{template.version}"
    l4 = cache.get(l4_key)
    if not l4:
        l4 = _render_template(template.body_markdown, {
            'team_id': team_id,
            'role_label': _resolve_role_label(team_id, run.work_package_id),
            'gate_id': gate_id,
            'phase_id': phase_id,
            'run_id': run_id,
            'work_package_id': run.work_package_id,
            'domain_id': domain_id,
            'process_variant': process_variant,
            'correction_cycle_count': run.correction_cycle_count,
        })
        cache.set(l4_key, l4, ttl=None)  # version-based invalidation only

    assembled_text = "\n\n---\n\n".join([l1, l2, l3, l4])
    now = utc_now_iso8601()

    return AssembledPrompt(
        layer1_identity=l1,
        layer2_governance=l2,
        layer3_state=l3,
        layer4_task=l4,
        assembled_at=now,
        content_hash=sha256(assembled_text),
        token_estimate=estimate_tokens(assembled_text),
    )
```

### 2.3 Template Lookup SQL

```sql
-- TEMPLATE_LOOKUP_SQL
-- Input: :gate_id, :phase_id, :domain_id
-- Output: id, body_markdown, version (single active template)
-- DB: PostgreSQL 16+ (DDL v1.0.1)

SELECT id, body_markdown, version
FROM templates
WHERE gate_id    = :gate_id
  AND (phase_id  = :phase_id  OR phase_id  IS NULL)
  AND (domain_id = :domain_id OR domain_id IS NULL)
  AND is_active  = 1
ORDER BY
  (phase_id  IS NOT NULL) DESC,
  (domain_id IS NOT NULL) DESC,
  version DESC
LIMIT 1;
```

**Specificity:** Phase-specific + domain-specific template beats phase-only, domain-only, or gate-default template. Latest version wins at equal specificity.

**Invariant (Dict §Template 1):** At most one `is_active=1` template per (`gate_id`, `phase_id`, `domain_id`) context. The `ORDER BY` + `LIMIT 1` provides deterministic selection if the invariant is violated (defense in depth).

### 2.4 Template Rendering

```python
def _render_template(body_markdown: str, context: dict) -> str:
    """
    Replaces {{placeholder}} markers with values from context dict.
    Raises TemplateRenderError if any placeholder is unresolvable.
    """
    import re
    def replacer(match):
        key = match.group(1)
        if key not in context:
            raise TemplateRenderError(
                placeholder=key,
                message=f"Unknown placeholder '{{{{{key}}}}}' — not in context dict"
            )
        return str(context[key])

    return re.sub(r'\{\{(\w+)\}\}', replacer, body_markdown)
```

**Iron Rule:** Unknown placeholder = hard failure (`TemplateRenderError`), not silent substitution. All placeholders listed in §4 must be resolvable at assembly time.

---

## §3 — Caching Policy

| Layer | Cache Key | Content | Invalidation Trigger | TTL |
|---|---|---|---|---|
| L1 | — | Identity fields | **never cached** | per-call |
| L2 | `l2:{team_id}:{governance_version}` | Team governance markdown | Governance file updated → bump `governance_version` via UC-13 | None (immutable per version) |
| L3 | — | Run state + events | **never cached** | per-call |
| L4 | `l4:{gate_id}:{phase_id}:{domain_id}:{version}` | Rendered task template | Template `version` bumped → new cache key | None (immutable per version) |

**Iron Rule: L1 + L3 = NEVER cached.** Any caching of L1/L3 = architectural violation.

**Iron Rule: No TTL-based invalidation.** Cache invalidation is version-based only. Old cache entries become orphaned when version changes; garbage-collected at implementation level — no explicit flush required.

### 3.1 L2 Cache Invalidation Sequence

1. `team_00` updates team constitution file (`team_{XX}.md`)
2. `team_00` bumps governance version via UC-13 (UpdatePolicy):
   ```sql
   UPDATE policies
   SET policy_value_json = '{"version": 2}',
       updated_at = NOW()
   WHERE policy_key = 'governance_version_team_10'
     AND scope_type = 'GLOBAL';
   ```
3. Next `assemble_prompt()` call constructs L2 key with new version → cache miss → fresh L2 loaded
4. Old L2 cache entry (`l2:team_10:1`) is orphaned — GC'd at implementation level

### 3.2 L4 Cache Invalidation Sequence (UC-12 UpdateTemplate)

1. `team_00` updates template content:
   ```sql
   UPDATE templates
   SET body_markdown = :new_body_markdown,
       version = version + 1,
       updated_at = NOW()
   WHERE gate_id = :gate_id
     AND phase_id = :phase_id
     AND domain_id = :domain_id
     AND is_active = 1;
   ```
2. Next `assemble_prompt()` call reads updated `version` → new cache key → cache miss → fresh L4 rendered
3. Old L4 cache entry is orphaned — GC'd at implementation level

### 3.3 Governance Version Management

Stored in `policies` table per team:

| `policy_key` | `scope_type` | `policy_value_json` | Consumer |
|---|---|---|---|
| `governance_version_team_10` | `GLOBAL` | `{"version": 1}` | L2 cache key construction |
| `governance_version_team_20` | `GLOBAL` | `{"version": 1}` | L2 cache key construction |

**Governance version retrieval:**

```python
def _get_governance_version(team_id: str) -> int:
    row = db.query("""
        SELECT policy_value_json
        FROM policies
        WHERE policy_key = :key AND scope_type = 'GLOBAL'
        ORDER BY priority DESC LIMIT 1
    """, key=f"governance_version_{team_id}")

    if not row:
        return 1  # default version if no policy row exists

    return json.loads(row.policy_value_json).get('version', 1)
```

---

## §4 — Template Format (DB + Placeholders)

### 4.1 Template DB Record

DDL source: `templates` table (DDL v1.0.1 §2).

| Column | Type | Dict Field | Notes |
|---|---|---|---|
| `id` | TEXT (ULID) | PK | Template identifier |
| `gate_id` | TEXT | FK → `gates.id` | Target gate |
| `phase_id` | TEXT (nullable) | FK → `phases.id` | NULL = gate-default |
| `domain_id` | TEXT (nullable) | FK → `domains.id` | NULL = cross-domain |
| `name` | TEXT | len ≤ 128 | Display label |
| `body_markdown` | TEXT | Template content | Contains `{{placeholder}}` markers |
| `version` | INTEGER (≥1) | Version counter | Bumped on update; used in L4 cache key |
| `is_active` | INTEGER (0/1) | Active flag | Only `is_active=1` templates participate in lookup |
| `updated_at` | TIMESTAMPTZ | Last modification | ISO-8601 UTC |

### 4.2 Example Template INSERT

```sql
INSERT INTO templates (id, gate_id, phase_id, domain_id, name, body_markdown, version, is_active, updated_at)
VALUES (
  '01JTPL00000000000000001',
  'GATE_2',
  '2.1',
  '01JK8AOSV3DOMAIN00000002',  -- dom_tiktrack
  'GATE_2 Phase 2.1 TikTrack',
  '## Task: Gate 2 — Phase 2.1 (TikTrack)

You are operating at Gate 2, Phase 2.1 of the TikTrack pipeline.
Your role: {{role_label}} | Team: {{team_id}} | Variant: {{process_variant}}

### Your Mandate
Review the work package deliverable against the acceptance criteria for this gate/phase.
Evaluate only what is in scope for Gate 2 / Phase 2.1.

### Verdict Options
- PASS: All ACs met
- FAIL: Blockers found (requires reason)
- CONDITIONAL_PASS: Minor issues — note findings

### Current Run Context
Run ID: {{run_id}}
Work Package: {{work_package_id}}
Domain: {{domain_id}} | Variant: {{process_variant}}
Correction Cycle: {{correction_cycle_count}}',
  1,    -- version
  1,    -- is_active
  NOW()
);
```

### 4.3 Canonical Placeholder Inventory

| Placeholder | Source Layer | DB Source | Resolution |
|---|---|---|---|
| `{{team_id}}` | L1 | `teams.id` | Resolved via routing → assignments |
| `{{role_label}}` | L1 | `pipeline_roles.display_name` | Via `assignments.role_id` → `pipeline_roles.display_name` |
| `{{gate_id}}` | L1 | `runs.current_gate_id` | Current gate |
| `{{phase_id}}` | L1 | `runs.current_phase_id` | Current phase |
| `{{run_id}}` | L1/L3 | `runs.id` | Run identifier |
| `{{work_package_id}}` | L1/L3 | `runs.work_package_id` | WP reference |
| `{{domain_id}}` | L1/L3 | `runs.domain_id` | Domain context (AD-S5-01) |
| `{{process_variant}}` | **L1/L3** | `runs.process_variant` | Sentinel context (AD-S5-01) |
| `{{correction_cycle_count}}` | L3 | `runs.correction_cycle_count` | Retry counter |

**Iron Rule:** All placeholders listed above must be resolvable at `assemble_prompt()` call time. Unknown placeholder = `TemplateRenderError` (hard failure, not silent substitution).

**Validation:** At template INSERT/UPDATE time, an optional validation step SHOULD parse `body_markdown` for `{{...}}` markers and verify each exists in the canonical inventory. This is not enforced at DB level — application-layer check.

---

## §5 — Full Assembled Prompt Example

```markdown
---
## LAYER 1 — Identity
Team: team_10 (TikTrack Gateway — Execution Lead)
Gate: GATE_2 | Phase: 2.1
Run: 01HX9K3M2N4P5Q6R7S8T9U0V
Work Package: S002-P003-WP002
Domain: tiktrack | Variant: TRACK_FULL

---
## LAYER 2 — Governance
You are Team 10 — TikTrack Gateway (Execution Lead).
Domain: tiktrack. Engine: Cursor Composer.

Iron Rules:
1. No guessing. Read the file before answering.
2. PASS only when ALL acceptance criteria for this gate/phase are met.
3. Route blocking decisions to Team 00 (Nimrod).
4. Do not modify files outside your designated scope.
[...full team_10 constitution...]

---
## LAYER 3 — State
Run Status: IN_PROGRESS
Correction Cycle: 0
Current Actor: team_10 (you)
Domain: tiktrack | Variant: TRACK_FULL
Sentinel: inactive
Recent Events (last 3):
  1. RUN_INITIATED — team_00 — 2026-03-26T14:00:00Z
  2. PHASE_PASSED (GATE_1 / 1.1) — team_170 — 2026-03-26T14:15:00Z
  3. PHASE_PASSED (GATE_1 / 1.2) — team_90 — 2026-03-26T14:30:00Z

---
## LAYER 4 — Task
## Task: Gate 2 — Phase 2.1 (TikTrack)

You are operating at Gate 2, Phase 2.1 of the TikTrack pipeline.
Your role: Orchestrator | Team: team_10 | Variant: TRACK_FULL

### Your Mandate
Review the work package deliverable against the acceptance criteria for this gate/phase.
Evaluate only what is in scope for Gate 2 / Phase 2.1.

### Verdict Options
- PASS: All ACs met
- FAIL: Blockers found (requires reason)
- CONDITIONAL_PASS: Minor issues — note findings

### Current Run Context
Run ID: 01HX9K3M2N4P5Q6R7S8T9U0V
Work Package: S002-P003-WP002
Domain: tiktrack | Variant: TRACK_FULL
Correction Cycle: 0
```

**Layer separator:** `\n\n---\n\n` between each layer. Consistent with markdown horizontal rule rendering.

---

## §6 — Policy Integration

### 6.1 Policies Table Entries Relevant to Prompt Assembly

All policies stored in `policies` table (DDL v1.0.1). Modified via UC-13 (UpdatePolicy) — `team_00` only.

| `policy_key` | `scope_type` | `policy_value_json` | Consumer | Description |
|---|---|---|---|---|
| `token_budget` | `GLOBAL` | `{"L1":40,"L2":200,"L3":100,"L4":300}` | `assemble_prompt()` | Advisory budget per layer; warning if exceeded |
| `max_correction_cycles` | `GLOBAL` | `{"max":3}` | pipeline_engine (G07/G08) | Gate enforcement — escalation threshold |
| `cache_ttl` | `GLOBAL` | `{"L2":null,"L4":null}` | Cache layer | `null` = version-based only; no TTL expiry |
| `governance_version_{team_id}` | `GLOBAL` | `{"version":1}` | L2 cache key construction | Per-team governance version counter |
| `last_n_events_in_l3` | `GLOBAL` | `{"value":3}` | `build_state_layer()` | Number of recent events in L3 |

### 6.2 Policy Resolution

```python
def _get_policy_value(policy_key: str, default=None):
    """
    Resolves policy value from policies table.
    Uses highest-priority matching row.
    """
    row = db.query("""
        SELECT policy_value_json
        FROM policies
        WHERE policy_key = :key
        ORDER BY priority DESC
        LIMIT 1
    """, key=policy_key)

    if not row:
        return default

    parsed = json.loads(row.policy_value_json)
    return parsed.get('value', parsed.get('max', default))
```

### 6.3 Token Budget Enforcement

```python
def _check_token_budget(prompt: AssembledPrompt):
    """Advisory check — does NOT block assembly."""
    budget = _get_policy_value('token_budget', default={'L1':40,'L2':200,'L3':100,'L4':300})

    warnings = []
    for layer_name, layer_content, budget_key in [
        ('L1', prompt.layer1_identity, 'L1'),
        ('L2', prompt.layer2_governance, 'L2'),
        ('L3', prompt.layer3_state, 'L3'),
        ('L4', prompt.layer4_task, 'L4'),
    ]:
        estimate = estimate_tokens(layer_content)
        layer_budget = budget.get(budget_key, 999)
        if estimate > layer_budget:
            warnings.append(f"{layer_name}: {estimate} tokens (budget: {layer_budget})")

    if warnings:
        log.warn("Token budget exceeded (advisory)", warnings=warnings)
```

**UC-13 (UpdatePolicy):** `team_00` only. No other actor can modify policies. This is an Iron Rule.

---

## §7 — PAUSED Run Boundary (AD-S5-02 / AD-S5-03)

### 7.1 Iron Rule

`assemble_prompt()` is **NOT** called for PAUSED runs.

```
Run Status = PAUSED
    │
    ├── NO prompt assembly
    ├── NO resolve_actor() call
    └── Entry point = UC-08 (ResumeRun)
            │
            ├── Branch A (No TEAM_ASSIGNMENT_CHANGED):
            │     UC-08 reads paused_routing_snapshot_json directly
            │     sets run.status = 'IN_PROGRESS'
            │     clears paused_at + snapshot
            │     → THEN resolve_actor() is called (status is now IN_PROGRESS)
            │     → THEN assemble_prompt() is called (with resolved team_id)
            │
            └── Branch B (TEAM_ASSIGNMENT_CHANGED exists):
                  UC-08 sets run.status = 'IN_PROGRESS'
                  → THEN resolve_actor() uses live assignments
                  → THEN assemble_prompt() is called (with resolved team_id)
```

### 7.2 Prompt Assembly Sequence After RESUME

1. UC-08 sets `run.status = 'IN_PROGRESS'`, clears `paused_at` + `paused_routing_snapshot_json`
2. `resolve_actor()` is called (now valid — precondition `status ∈ {IN_PROGRESS, CORRECTION}` is met)
3. `assemble_prompt()` is called with the resolved `team_id` from step 2
4. Assembled prompt delivered to resumed actor

**Sequence invariant:** At no point during RESUME does `assemble_prompt()` see a PAUSED run. The status transition (step 1) happens before prompt assembly (step 3).

### 7.3 Error Codes for Invalid Run Status

| Run Status | Calling `assemble_prompt()` | Error Code | HTTP | Description |
|---|---|---|---|---|
| `PAUSED` | Blocked | `INVALID_RUN_STATUS` | 500 | Internal system error — should never reach application layer |
| `COMPLETE` | Blocked | `INVALID_RUN_STATUS` | 500 | Terminal state — no further prompts |
| `NOT_STARTED` | Blocked | `INVALID_RUN_STATUS` | 500 | Run not yet initiated |
| `IN_PROGRESS` | Allowed | — | — | Normal operation |
| `CORRECTION` | Allowed | — | — | Correction cycle prompt |

---

## §8 — Edge Cases

| # | Scenario | Expected Behavior | Error Code | HTTP | Justification |
|---|---|---|---|---|---|
| **EC-01** | Template not found for (`gate_id`, `phase_id`, `domain_id`) | `TemplateNotFound` error. Run does NOT advance. Alert `team_00` — missing template is a configuration error. | `TEMPLATE_NOT_FOUND` | 500 | §2.3 TEMPLATE_LOOKUP_SQL returns empty; prompt cannot be assembled without L4. |
| **EC-02** | Governance file missing for `team_id` | `GovernanceNotFound` error. Run does NOT advance. Alert `team_00` — team constitution must exist. | `GOVERNANCE_NOT_FOUND` | 500 | §2.2 L2 construction fails; prompt cannot be assembled without governance layer. |
| **EC-03** | `process_variant` is NOT NULL on `runs` (DDL: `NOT NULL`) but value is unknown | L1/L3 render the value as-is. Routing Spec handles variant matching (NULL-variant routing rules serve as fallback). No error in prompt assembly. | — | — | `runs.process_variant TEXT NOT NULL` (DDL); value always present per UC-01 T01 A01. |
| **EC-04** | L4 template exceeds token budget | Warning logged (`log.warn`). Prompt assembled anyway. Token budget is advisory (§6.3), not a hard limit. | — | — | Policy `token_budget` = advisory per §6.1. |
| **EC-05** | Sentinel active in L3 | Rendered as: `"Sentinel: ACTIVE (override_team: team_30)"`. Awareness only — the team knows an override is active but does not act on this field. L3 metadata, not instruction. | — | — | AD-S5-05: sentinel column persists; L3 exposes for awareness. |
| **EC-06** | `correction_cycle_count` = `max_correction_cycles` | L3 renders warning: `"⚠ Final correction cycle"`. `team_00` notified. Next FAIL triggers UC-10 (CorrectionEscalate) — handled by pipeline engine, not prompt assembler. | — | — | UC-09 G07 / UC-10 G08 enforce max cycles. L3 surfaces awareness to actor. |
| **EC-07** | `assemble_prompt()` called for `COMPLETE` / `NOT_STARTED` / `PAUSED` run | `INVALID_RUN_STATUS` (500). Same boundary as §7. Prompt assembly is a post-routing operation — only valid for active runs. | `INVALID_RUN_STATUS` | 500 | §2.1 precondition; AD-S5-02. |
| **EC-08** | Two active templates for same (`gate_id`, `phase_id`, `domain_id`) | Should not occur per Dict §Template Invariant 1 (at most one `is_active=1` per context). If violated: `TEMPLATE_LOOKUP_SQL` selects deterministically via `ORDER BY ... version DESC LIMIT 1` (latest version wins). WARN logged for configuration issue. | — | — | Defense in depth; DDL does not enforce unique partial index on `is_active=1` templates — application layer responsibility. |

---

## §9 — OQ-S3-01 Closure (GeneratePrompt Use Case)

Stage 6 closes OQ-S3-01 from UC Catalog v1.0.3. The GeneratePrompt behavior is defined by this spec:

| Aspect | Definition |
|---|---|
| **Use Case** | `GeneratePrompt` (UC-07 / OQ-S3-01) |
| **Actor** | `pipeline_engine` (system — called after routing resolution) |
| **Precondition** | `run.status ∈ {IN_PROGRESS, CORRECTION}` |
| **Entry point** | `assemble_prompt()` (§2.2) |
| **Layers** | L1 Identity + L2 Governance + L3 State + L4 Task (§1) |
| **Caching** | L1/L3 never cached; L2/L4 version-keyed (§3) |
| **Error codes** | `INVALID_RUN_STATUS`, `TEMPLATE_NOT_FOUND`, `GOVERNANCE_NOT_FOUND`, `TEMPLATE_RENDER_ERROR` |
| **Output** | `AssembledPrompt` value object (§2.2) |
| **Persistence** | Optional — audit snapshot to `prompts` table (DDL §2). Normal engine path may skip INSERT. |

**Optional audit persistence:**

```sql
INSERT INTO prompts (
  id, run_id, sequence_no,
  layer1_identity, layer2_governance, layer3_state, layer4_task,
  assembled_at, content_hash, token_estimate
) VALUES (
  :ulid, :run_id, :next_seq,
  :l1, :l2, :l3, :l4,
  :assembled_at, :content_hash, :token_estimate
);
```

This INSERT is **optional** — for PFS (Pipeline Fidelity Suite) replay and audit. The runtime engine may assemble prompts without persisting them.

---

## Pre-submission Checklist

**Architecture:**
- [x] L1 includes `process_variant` (AD-S5-01)
- [x] L3 includes `domain_id` + `process_variant` + sentinel field (AD-S5-01 / AD-S5-05)
- [x] `assemble_prompt()` has `run.status` precondition (AD-S5-02)
- [x] PAUSED run boundary documented in §7 (AD-S5-02 / AD-S5-03)
- [x] RESUME→prompt sequence documented (AD-S5-03) — §7.2
- [x] L1 + L3 marked NEVER cached (Iron Rule)

**Field alignment:**
- [x] All placeholders match UC Catalog v1.0.3 field names
- [x] All column names match DDL v1.0.1 exactly (`body_markdown`, `version`, `is_active`)
- [x] `process_variant` listed in placeholder inventory (L1/L3 source)
- [x] Template lookup includes `is_active=1` filter (Dict §Template Invariant 1)

**Caching:**
- [x] L2 key includes `governance_version`
- [x] L4 key includes `version` (DDL column name, not `template_version`)
- [x] Cache invalidation sequence for template update documented (§3.2)
- [x] Governance version management documented (§3.3 — policies table)

**Policy:**
- [x] All policies listed map to `policies` table rows
- [x] UC-13 (UpdatePolicy) = `team_00` only stated
- [x] `max_correction_cycles` policy referenced (EC-06)
- [x] `last_n_events_in_l3` policy referenced (§2.2)

**Edge cases + errors:**
- [x] All 8 ECs documented with error code + behavior
- [x] `TemplateNotFound` + `GovernanceNotFound` error codes defined
- [x] `INVALID_RUN_STATUS` code defined
- [x] UNIQUE constraint on templates referenced (EC-08 — Dict invariant, not DDL index)

**Template:**
- [x] Full template INSERT example included (§4.2)
- [x] All placeholders in example match placeholder inventory (§4.3)
- [x] Full assembled prompt example included (§5)
- [x] Template rendering with hard failure on unknown placeholders (§2.4)

**OQ closure:**
- [x] OQ-S3-01 (GeneratePrompt) closed with full definition (§9)
- [x] Optional audit persistence to `prompts` table documented (§9)

---

**log_entry | TEAM_100 | AOS_V3_PROMPT_ARCH_SPEC | v1.0.0 | SUBMITTED_FOR_REVIEW | 2026-03-26**
