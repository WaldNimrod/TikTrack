date: 2026-03-23
historical_record: true

# Phase B — reference fixtures (documentation + Layer 1 samples)

**Date:** 2026-03-23

| Scenario | Automation | Notes |
|----------|------------|--------|
| **B1** GATE_3 fail + remediation | Layer 1: `B1_TEAM_61_BLOCK_sample.md` contains `VERDICT: BLOCK` + `BF-G3-001`. Layer 2: remediation banner when pipeline is in fail cycle (requires controlled state — not run in default CI). | Full loop needs orchestrator `fail` + regenerated remediation mandate. |
| **B2** GATE_5 doc block | Layer 1: `B2_TEAM_70_DOC_route_sample.md` contains `route_recommendation: doc` + blocking markers. | UI: check `route_recommendation` in JSON verdict panels when state injected. |
| **B3** GATE_4 HRC | **Manual / MCP** — HRC DOM in `pipeline-dashboard.js` is dynamic; bulk PASS/BLOCK requires stable session. | Use Cursor browser MCP per `TEAM_101_SIMULATION_TEST_CATALOG_v1.0.0.md`. |
| **B4** KB-84 | **Automated:** `tests/pipeline-kb84-cli.test.js` | Wrong `--wp` must **BLOCK**. |

**log_entry | TEAM_101 | PHASE_B_FIXTURES | 2026-03-23**
