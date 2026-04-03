---
id: TEAM_101_SIMULATION_REFERENCE_INDEX_v1.0.0
historical_record: true
team: team_101
title: Canary Simulation — reference index
date: 2026-03-23
status: ACTIVE---

# אינדקס רפרנסים — סימולציית קנרי

| Ref | תיאור | נתיב / פקודה |
|-----|--------|----------------|
| R1 | גיבוי מצב לפני סימולציה | `_COMMUNICATION/team_101/_SIMULATION_BACKUP/pipeline_state_tiktrack_PRE_SIM_20260323.json` |
| R2 | אתחול `PipelineState` WP002 | `PipelineState(..., work_package_id='S003-P013-WP002', current_gate='GATE_0', ...)` — `agents_os_v2/orchestrator/state.py` |
| R3 | GATE_0 `--generate-prompt` (stdout) | `PIPELINE_DOMAIN=tiktrack python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt GATE_0` → governance pre-check FAILED (program COMPLETE) |
| R4 | `ssot_check` אחרי מצב סימולציה | `python3 -m agents_os_v2.tools.ssot_check --domain tiktrack` → EXIT=1 (drift vs WSM) |
| R5 | `sync_parallel_tracks_from_pipeline` | לא פתר drift מול `CURRENT_OPERATIONAL_STATE` / `COMPLETE` |
| R6 | Phase B4 — WP שגוי | `./pipeline_run.sh --domain tiktrack --wp S003-P999-WP001 --gate GATE_0 pass` → EXIT=1, הודעת mismatch |
| R7 | שחזור מצב + ssot | העתקה מ-R1 ל-`pipeline_state_tiktrack.json` + `sync_parallel_tracks_from_pipeline` → `ssot_check` EXIT=0 |
| R8 | `getExpectedFiles` עבור WP כללי | [`agents_os/ui/js/pipeline-config.js`](../../agents_os/ui/js/pipeline-config.js) שורות 95–118 — `S003-P013-*` → **paths TBD** |

**log_entry | TEAM_101 | SIMULATION_REFERENCE_INDEX | 2026-03-23**
