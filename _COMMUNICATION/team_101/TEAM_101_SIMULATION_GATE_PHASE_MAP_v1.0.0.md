---
id: TEAM_101_SIMULATION_GATE_PHASE_MAP_v1.0.0
historical_record: true
from: Team 101
date: 2026-03-23
status: ACTIVE---

# Gate × phase × artifact × command — TikTrack (5-gate)

**Code sources:** `agents_os_v2/orchestrator/pipeline.py` (`_DOMAIN_PHASE_ROUTING`, `GATE_SEQUENCE`), `pipeline_run.sh`, `agents_os/ui/js/pipeline-dashboard.js` (`getVerdictCandidates`, `checkExpectedFiles`).

**Domain:** `tiktrack` unless noted.

| Gate | Phase | Phase owner (pipeline) | Dashboard verdict / expected files (primary) | Typical CLI (after mocks) |
|------|-------|------------------------|----------------------------------|---------------------------|
| GATE_0 | — | team_190 | `TEAM_190_{WPU}_GATE_0_REVALIDATION` / `…_VALIDATION` / `…_VERDICT` | `./pipeline_run.sh --domain tiktrack pass` |
| GATE_1 | 1.1 | team_170 | `TEAM_170_{WPU}_LLD400_v1.0.0.md` | `pass` |
| GATE_1 | 1.2 | team_190 | `TEAM_190_{WPU}_GATE_1_REVALIDATION` / `…_VERDICT` | `pass` |
| GATE_2 | 2.2 | team_10 (tiktrack+TRACK_FOCUSED) | **No verdict file** — work plan stored in `pipeline_state` (`work_plan` / G3 plan) | `phase2` / `pass` per orchestrator |
| GATE_2 | 2.2v | team_90 | `TEAM_90_{WPU}_G3_5_VERDICT_v1.0.0.md` | `pass` |
| GATE_2 | 2.3 | team_102 (TT lod200) | `TEAM_102_{WPU}_GATE_2_VERDICT_v1.0.0.md` | `pass` |
| GATE_3 | 3.1 | team_10 | Mandates (orchestrator) | `pass` |
| GATE_3 | 3.2 | teams_20_30 (TT FOCUSED) | **Expected files (banner):** `TEAM_20_*_IMPLEMENTATION_v1.0.0.md`, `TEAM_30_*_IMPLEMENTATION_v1.0.0.md` — ראו `getExpectedFiles` ב־`pipeline-config.js`. **מנדטה בדשבורד (sub-steps):** עדיין מציגים גם `API_VERIFY` — פער תיעודי/מוצרי (**GAP-003** בדוח המחקר). | `pass` |
| GATE_3 | 3.3 | team_50 | `TEAM_50_{WPU}_QA_REPORT_v1.0.0.md` (`GATE_3_QA` key) | `pass` |
| GATE_4 | 4.1 | team_90 | `TEAM_90_{WPU}_GATE_4_*VERDICT*` | `pass` |
| GATE_4 | 4.2 | team_102 | `TEAM_102_{WPU}_GATE_4_ARCH_REVIEW_v1.0.0.md` | `pass` |
| GATE_4 | 4.3 | team_00 | `TEAM_00_{WPU}_GATE_4_APPROVAL_v1.0.0.md` + HRC JSON `agents_os/hrc/GATE_4_HRC_{WPU}_v1.0.0.json` | **Human:** `approve` / `pass` per orchestrator |
| GATE_5 | 5.1 | team_70 | `TEAM_70_{WPU}_GATE5_PHASE51_DOCUMENTATION_CLOSURE_REPORT_v1.0.0.md` | `pass` |
| GATE_5 | 5.2 | team_90 | `TEAM_90_{WPU}_GATE_5_VALIDATION_v1.0.0.md` | `pass` → COMPLETE |

**Mandate table delta:** `TEAM_100_TO_TEAM_101_CANARY_SIMULATION_MANDATE_v1.0.0.md` Step 4 lists **Team 61** for GATE_3 and **Team 51** for GATE_4.1 — that matches **Agents_OS** routing; **TikTrack** uses **teams_20_30** + **team_50** (GATE_3) and **team_90** / **team_102** / **team_00** (GATE_4) per `pipeline.py` and `pipeline-dashboard.js`. **Use this table + dashboard code as SSOT for mocks.**

**Precision pass (KB-84):** `./pipeline_run.sh --domain tiktrack --wp <WP> --gate <GATE> --phase <p> pass`

**log_entry | TEAM_101 | GATE_PHASE_MAP | 2026-03-23**
