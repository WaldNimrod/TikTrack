---
id: TEAM_101_FIX_05_VERIFICATION_v1.0.0
historical_record: true
team: team_101
title: FIX-101-05 MandateStep writes_to — verification
domain: agents_os
date: 2026-03-23
status: DONE
wp: S003-P011-WP002
gate: —
phase_owner: Team 170---

# FIX-101-05 — `writes_to` on `MandateStep`

## Summary

G3_PLAN Team 00 step uses `writes_to` derived from `get_state_file(domain).relative_to(REPO_ROOT)`. Implementation mandates Team 30 step includes `writes_to` (`t30_out`) and acceptance line referencing the path.

## Evidence (implementation)

| Item | Location |
|------|----------|
| Team 00 `writes_to` + `get_state_file` import | `agents_os_v2/orchestrator/pipeline.py` — `_generate_g3_plan_mandates` |
| Team 30 `writes_to` | `agents_os_v2/orchestrator/pipeline.py` — `_generate_mandates` |

## Commands

```bash
rg "writes_to.*get_state_file|t30_out" agents_os_v2/orchestrator/pipeline.py
source api/venv/bin/activate && python3 -m pytest agents_os_v2/tests/ -q --tb=line
```

**log_entry | TEAM_101 | FIX_101_05 | VERIFIED | 2026-03-23**
