---
id: TEAM_101_FIX_04_VERIFICATION_v1.0.0
historical_record: true
team: team_101
title: FIX-101-04 KB-84 guard — verification
domain: agents_os
date: 2026-03-23
status: DONE
wp: S003-P011-WP002
gate: —
phase_owner: Team 170---

# FIX-101-04 — `_kb84_guard` (identifiers required)

## Summary

Unless `PIPELINE_RELAXED_KB84=1`, commands that advance or mutate pipeline state require `--wp` and `--gate`, and `--phase` when `current_phase` is set in state. UI copy helper injects these flags when state is loaded (`pipeline-state.js`).

## Evidence (implementation)

| Item | Location |
|------|----------|
| `_kb84_guard` | `pipeline_run.sh` |
| Default command args | `agents_os/ui/js/pipeline-state.js` (`_dfCmd`) |

## Command output (example)

```text
$ ./pipeline_run.sh pass
...
❌  ADVANCE BLOCKED — identifiers required (pass)
  Provide --wp and --gate matching active pipeline state.
...
  Example:
    ./pipeline_run.sh --domain agents_os --wp S002-P002-WP001 --gate GATE_3 pass
  Relaxed mode (not recommended): PIPELINE_RELAXED_KB84=1 ./pipeline_run.sh ...
```

**log_entry | TEAM_101 | FIX_101_04 | VERIFIED | 2026-03-23**
