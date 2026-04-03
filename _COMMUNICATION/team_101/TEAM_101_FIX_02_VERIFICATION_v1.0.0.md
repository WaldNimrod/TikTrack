---
id: TEAM_101_FIX_02_VERIFICATION_v1.0.0
historical_record: true
team: team_101
title: FIX-101-02 WSM STAGE_PARALLEL_TRACKS — verification
domain: agents_os
date: 2026-03-23
status: DONE
wp: S003-P011-WP002
gate: —
phase_owner: Team 170---

# FIX-101-02 — `STAGE_PARALLEL_TRACKS` sync + `ssot_check`

## Summary

`write_stage_parallel_tracks_row` / `sync_parallel_tracks_from_pipeline` update the domain row in WSM; `_post_advance_ssot` invokes WSM write + parallel tracks + `ssot_check` (fail-closed on drift). `pipeline_run.sh` integrates `_ssot_check_print` and sync on relevant commands.

## Evidence (implementation)

| Item | Location |
|------|----------|
| Parallel tracks + log | `agents_os_v2/orchestrator/wsm_writer.py` |
| `_post_advance_ssot`, advance hooks | `agents_os_v2/orchestrator/pipeline.py` |
| `_ssot_check_print`, `_auto_wsm_sync` | `pipeline_run.sh` |

## Commands

```bash
source api/venv/bin/activate
python3 -m pytest agents_os_v2/tests/ -q --tb=line
# Optional (requires clean WSM vs state):
# python3 -m agents_os_v2.tools.ssot_check --domain tiktrack
```

**log_entry | TEAM_101 | FIX_101_02 | VERIFIED | 2026-03-23**
