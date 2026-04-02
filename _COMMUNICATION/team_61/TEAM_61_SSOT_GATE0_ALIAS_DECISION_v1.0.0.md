---
id: TEAM_61_SSOT_GATE0_ALIAS_DECISION_v1.0.0
historical_record: true
from: Team 61
to: Team 100 / Team 170 (informational — WP004 SSOT)
date: 2026-03-23
status: DECISION_RECORDED
mandate_ref: TEAM_101_TO_TEAM_61_CONSTITUTION_AND_CANONICAL_FLOW_ALIGNMENT_MANDATE_v1.0.0.md
topic: CON-003 — gates.yaml legacy `GATE_0` mapping---

# SSOT Decision — `GATE_0` in `legacy_to_canonical` (WP004)

## Problem

- `agents_os_v2/orchestrator/pipeline.py` defines **`GATE_SEQUENCE = [..., "GATE_0", "GATE_1", ...]`** with **`GATE_0`** as the first canonical gate.
- `agents_os_v2/ssot/gates.yaml` contained **`GATE_0: GATE_1`** under `legacy_to_canonical`, which fed **`GATE_ALIASES`** and **`window.__PHOENIX_LEGACY_GATE_MAP`**.
- Effect: **`resolveCanonicalGate("GATE_0")`** in UI resolved to **`GATE_1`**, contradicting the runtime engine and [pipeline-config.js](agents_os/ui/js/pipeline-config.js) comment that **`GATE_0` is canonical**.

## Decision

**Remove** the `GATE_0: GATE_1` entry from `gates.yaml`.

- **Python:** `GATE_ALIASES.get("GATE_0", "GATE_0")` → canonical **`GATE_0`** (identity).
- **JS:** `LEGACY_GATE_TO_CANONICAL["GATE_0"]` absent → **`gateId`** unchanged.
- **Rationale:** Canonical gate id **`GATE_0`** must not alias to **`GATE_1`**. Legacy fail-routing that maps `GATE_0` → `GATE_1` remains a **separate** concern in `pipeline.py` (`_canonical_fail_routing_key`) per Team 170 FINDING-001 comments.

## Downstream updates

- Regenerate [agents_os/ui/js/pipeline-gate-map.generated.js](agents_os/ui/js/pipeline-gate-map.generated.js).
- Update scenario fixture [scenario_03_gate0_alias.yaml](agents_os_v2/tests/fixtures/pipeline_scenarios/scenario_03_gate0_alias.yaml) to expect **`GATE_0` → `GATE_0`** (identity), not `GATE_1`.

## Governance

- Change is **SSOT alignment** with existing `GATE_SEQUENCE`; no new field names.
- If Team 170 requires a **separate** legacy label for an old “pre–GATE_0” token, that should use a **non-`GATE_0`** key in `legacy_to_canonical` (GIN if missing).

---

**log_entry | TEAM_61 | SSOT_GATE0_ALIAS | IDENTITY | 2026-03-23**
