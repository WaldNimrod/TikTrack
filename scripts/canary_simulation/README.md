# Canary simulation tooling (Team 100 mandate)

## WSM / pipeline state safety (read first)

- **`generate_mocks.py` / `verify_layer1.py` / `ssot_check`** do **not** modify `pipeline_state_*.json` or WSM.
- **Writes to WSM** happen when someone runs **`./pipeline_run.sh pass|fail|approve`** while `pipeline_state` reflects that WP — including simulation IDs such as **WP099**. That is unrelated to Layer 1 mocks.
- **Recommended default:** `bash scripts/canary_simulation/run_canary_safe.sh` (Layer 1 + ssot; no `pipeline_run`).  
  If `ssot_check` fails due to **existing** COS drift: `CANARY_SKIP_SSOT=1 bash scripts/canary_simulation/run_canary_safe.sh` for mock/file checks only, then fix WSM (`./pipeline_run.sh wsm-reset` per Gateway) and re-run without skip.
- Full policy: `_COMMUNICATION/team_101/TEAM_101_PIPELINE_TEST_ISOLATION_AND_WSM_DRIFT_REMEDIATION_v1.0.0.md`
- E2E scripts that chain `pipeline_run` (e.g. under `_COMMUNICATION/team_101/_E2E_SIM_*`) are **operator-only**; use a **git worktree** or restore state / run `./pipeline_run.sh --domain <d> wsm-reset` per Gateway procedure after simulation.

## Commands

```bash
# From repo root — PYTHONPATH required for ssot_check / imports
export PYTHONPATH=.

# 1) Generate mock PASS artifacts (mirror under team_101/simulation_mocks/<WP>/mirror)
python3 scripts/canary_simulation/generate_mocks.py --wp S003-P013-WP002

# 2) Layer 1 — ssot + mirror content checks (+ optional Phase B fixtures)
python3 scripts/canary_simulation/verify_layer1.py --wp S003-P013-WP002 --phase-b

# 3) Optional — copy mocks into canonical _COMMUNICATION/team_* paths (operator)
python3 scripts/canary_simulation/generate_mocks.py --wp S003-P013-WP002 --deploy
```

## UI tests (Layer 2)

```bash
./agents_os/scripts/start_ui_server.sh
cd tests && HEADLESS=true npm run test:pipeline-dashboard-smoke
cd tests && HEADLESS=true npm run test:pipeline-dashboard-phase-a
```

See `_COMMUNICATION/team_101/TEAM_101_SIMULATION_TEST_CATALOG_v1.0.0.md`.

## Research export (gap list + WP tasks JSON)

```bash
python3 scripts/canary_simulation/export_research_artifacts.py
```

Writes: `_COMMUNICATION/team_101/research/COVERAGE_AND_GAPS_EXPORT_v1.0.0.json`
