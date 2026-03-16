**date:** 2026-03-15
**historical_record:** true

# Pipeline And Gates Review

## Findings

- `P0` `AGENTS_OS gate ownership and execution model diverge across canon, runtime, and UI.` The canonical procedure says `GATE_4` is owned by Team 10 with Team 51 executing AGENTS_OS QA, and `GATE_8` is owned by Team 90 with Team 170 executing AGENTS_OS documentation closure. The runtime and UI do not match this consistently. `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` assigns Team 51 at `GATE_4` and Team 170 at AGENTS_OS `GATE_8`, but `agents_os_v2/orchestrator/pipeline.py` still describes Team 50 at `GATE_4` and Team 70 at `GATE_8`, while `agents_os/ui/js/pipeline-config.js` and `agents_os/ui/js/pipeline-dashboard.js` present Team 50 and Team 70 directly to the operator.
- `P0` `The implementation lane shown to the operator is still the old Teams 20/30/50 flow, not the AGENTS_OS Team 61/51 lane.` `agents_os_v2/orchestrator/pipeline.py` generates `implementation_mandates.md` for Team 20, Team 30, and Team 50, and `agents_os/ui/js/pipeline-dashboard.js` hard-codes `CURSOR_IMPLEMENTATION` as a Team 20 then Team 30 sequence with Team 50 QA. This conflicts with the active AGENTS_OS operating procedure and with the existence of `team_61.md` and `team_51.md`.
- `P1` `Pipeline state auto-detection is brittle around placeholder values.` `agents_os_v2/orchestrator/state.py` considers a domain “active” when `work_package_id` is not in `{"", "REQUIRED"}` and `current_gate` is not in `{"", "GATE_0", "NOT_STARTED"}`. Placeholder values such as `NONE` are not excluded. During the review, `python3 -m agents_os_v2.orchestrator.pipeline --status` initially blocked on “DOMAIN AMBIGUOUS” because one state file used `NONE/NONE`, which the loader treated as active.
- `P2` `Prompt injection tests no longer match the current injection contract.` `agents_os_v2/context/injection.py` intentionally replaced the old verbose `CONTEXT_RESET` format with a lean identity stamp, but `agents_os_v2/tests/test_injection.py` still asserts `CONTEXT_RESET`, `Layer 1`, `Layer 2`, and `Layer 3` markers. This leaves the core prompt layer only partially regression-protected.
- `P2` `The direct Python CLI and the wrapper present different operator expectations.` The wrapper `pipeline_run.sh` owns domain switching, state snapshot refresh, and operator UX, while `python3 -m agents_os_v2.orchestrator.pipeline` does not accept `--domain`. That separation can work, but the system currently documents and discusses “the pipeline CLI” at multiple levels without always making the wrapper/runtime boundary explicit.

## Evidence

- Canon:
  - `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md`
- Runtime:
  - `agents_os_v2/orchestrator/pipeline.py`
  - `agents_os_v2/orchestrator/state.py`
  - `agents_os_v2/config.py`
  - `agents_os_v2/orchestrator/gate_router.py`
  - `agents_os_v2/context/injection.py`
- UI:
  - `agents_os/ui/js/pipeline-config.js`
  - `agents_os/ui/js/pipeline-dashboard.js`
- Logs:
  - `logs/pipeline_status_agents_os.txt`
  - `logs/pipeline_status_tiktrack.txt`
  - `logs/pytest_agents_os_v2.txt`

## Focus areas

- Gate sequence, owner, and engine alignment
- Fail-routing and rollback correctness
- State-file lifecycle and WSM alignment
- Prompt generation, storage, and operator guidance

## Notes

- The strongest architectural problem in the pipeline is not gate order. Gate order is mostly coherent. The strongest problem is gate-role incoherence across layers.
- `GATE_8` is currently the most conceptually unstable gate in the whole system because it mixes documentation, archive, repository maintenance, and AGENTS_OS canonical ownership.
