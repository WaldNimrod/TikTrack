---
id: TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_H_CONTEXT_FORMAT_AND_CACHE_POLICY_v1.0.0
historical_record: true
from: Team 190
to: Team 100
cc: Team 00, Team 101, Team 170, Team 61, Team 90
date: 2026-03-23
status: ATTACHED_TO_IDEA_052
idea_id: IDEA-052
type: ANNEX
subject: 4-layer context format lock and configurable cache policy for token-efficiency---

# Annex H — Context Format and Cache Policy (No New Model)

## H.1 Policy objective

Lock a deterministic, low-ambiguity policy for:
1. Context format governance.
2. Cache governance and token-efficiency controls.

This annex is explicitly aligned with Team 00 guidance:
- Improve existing model.
- Do not introduce a new context model.

## H.2 Canonical context model lock

The canonical model is the existing V2 **4-layer** model only:
1. `Identity`
2. `Governance`
3. `State`
4. `Task`

Canonical sources:
- `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md`
- `agents_os_v2/context/injection.py`

### Rule

No fifth layer, no model replacement, no parallel model.
Allowed changes are optimization-only inside the same 4-layer structure.

## H.3 Allowed optimization surface (bounded)

For each layer, allow configurable controls:
- `enabled` (bool)
- `max_tokens` (int)
- `compression_mode` (`none` / `summary` / `schema_only`)
- `freshness_policy` (`event_driven` / `ttl_based` / `hybrid`)
- `include_full_content` (bool; drilldown support)

These controls tune cost and latency without changing semantics.

## H.4 Cache policy (configurable, UI-managed)

### H.4.1 Default policy at launch

| Layer | Default cache mode | Suggested default |
|---|---|---|
| Identity | Long-lived, version invalidation | `ttl=24h`, invalidate on team profile/version change |
| Governance | Long-lived, version invalidation | `ttl=24h`, invalidate on rule/convention version change |
| State | Short-lived, event invalidation first | `ttl=60s`, invalidate on state/event/version bump |
| Task | Request-scoped by default | no persistent cache unless explicitly enabled |

### H.4.2 Mandatory invalidation triggers

1. Gate/phase transition.
2. `process_variant` or `project_domain` change.
3. Team-role assignment change.
4. Management config update affecting orchestration/context.
5. Manual operator action (clear/refresh/invalidate).

## H.5 Management UI requirements

The management UI must expose:
1. Per-layer cache defaults editor.
2. Global actions:
   - `Clear Cache`
   - `Refresh Now`
   - `Invalidate by Scope` (layer/team/program/wp/domain)
3. Safe rollback to known defaults.
4. Clear visibility: last refresh time, source version/hash, hit/miss counters.

## H.6 Ownership and write channels

1. **Normal mode:** user controls cache and defaults through management UI.
2. **Architecture-level structural changes:** only architectural teams under explicit Team 00 instruction.
3. External agents and chat teams do not mutate control-plane cache policy directly.

This aligns with Annex G classification:
- behavioral control data -> `DB`
- team work artifacts -> `FILE`

## H.7 Guardrails and acceptance checks

1. Context build must include source-version stamp per layer.
2. Stale-cache protection: reject cache entries when version/hash mismatch.
3. Audit event required for every policy mutation and manual cache operation.
4. Token SLO tracking:
   - max prompt size per gate
   - median tokens per run
   - cache hit-rate target
   - regression alarms on overhead growth.

## H.8 Mapping example (policy object)

```json
{
  "context_policy": {
    "model": "AOS_V2_4_LAYER_LOCKED",
    "layers": {
      "identity": {"enabled": true, "max_tokens": 350, "compression_mode": "summary", "freshness_policy": "event_driven"},
      "governance": {"enabled": true, "max_tokens": 550, "compression_mode": "summary", "freshness_policy": "event_driven"},
      "state": {"enabled": true, "max_tokens": 400, "compression_mode": "none", "freshness_policy": "hybrid"},
      "task": {"enabled": true, "max_tokens": 800, "compression_mode": "none", "freshness_policy": "ttl_based"}
    }
  },
  "cache_policy": {
    "defaults": {
      "identity_ttl_sec": 86400,
      "governance_ttl_sec": 86400,
      "state_ttl_sec": 60,
      "task_ttl_sec": 0
    },
    "manual_ops_enabled": true
  }
}
```

## H.9 Decision impact

If adopted:
1. Prevents model drift in context architecture.
2. Makes token overhead controllable by configuration and UI operations.
3. Preserves deterministic behavior while enabling safe optimization.

---

**log_entry | TEAM_190 | IDEA_052_ANNEX_H | CONTEXT_FORMAT_LOCK_AND_CACHE_POLICY_DEFINED | v1.0.0 | 2026-03-23**
