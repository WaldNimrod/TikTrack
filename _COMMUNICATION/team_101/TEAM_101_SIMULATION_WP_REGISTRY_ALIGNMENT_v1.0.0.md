---
id: TEAM_101_SIMULATION_WP_REGISTRY_ALIGNMENT_v1.0.0
historical_record: true
from: Team 101
to: Team 100 · Team 170
date: 2026-03-23
status: ACTIVE
classification: OPERATIONAL_NOTE---

# Simulation WP — Registry alignment (Team 100 Canary mandate)

## Canonical mandate reference

- **Mandate:** `_COMMUNICATION/team_101/TEAM_100_TO_TEAM_101_CANARY_SIMULATION_MANDATE_v1.0.0.md`
- **Dummy WP ID (mandate text):** `S003-P013-WP002` (program **S003-P013**, domain tiktrack).
- **Mandate status:** DEFERRED until Nimrod activation — registry rows here are **structural only** (HOLD / documentation), not an execution go-ahead.

## What is registered in canonical registries

| Item | Resolution |
|------|------------|
| Program row for simulation | **No separate “SIMULATION” program ID** is added. Simulation uses the existing **S003-P013** program family; **WP002** is the reserved dummy slot. |
| `S003-P013-WP002` | **HOLD** at `GATE_0`, `is_active=false` — see `PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md`. |
| Completed operator dry-run (2026-03-23) | Used dedicated simulation program **`S003-P014`** / **`S003-P014-WP001`** (CLOSED, SIMULATION CLOSED) so the real product WP (`S003-P013-WP001`) stayed untouched. |

## Operator rule

- **Automation / fixtures:** Use **`S003-P013-WP002`** for mock artifact paths and Layer 1 checks under `_COMMUNICATION/team_101/simulation_mocks/` (see `scripts/canary_simulation/`).
- **Historical evidence:** First full CLI + dashboard walk is recorded against **`S003-P014-WP001`** (registry + WSM logs).

**log_entry | TEAM_101 | SIMULATION_WP_REGISTRY_ALIGNMENT | 2026-03-23**
