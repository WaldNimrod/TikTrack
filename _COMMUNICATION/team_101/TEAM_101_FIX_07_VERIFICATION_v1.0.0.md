---
id: TEAM_101_FIX_07_VERIFICATION_v1.0.0
historical_record: true
team: team_101
title: FIX-101-07 phase* order — verification
domain: agents_os
date: 2026-03-23
status: DONE
wp: S003-P011-WP002
gate: GATE_5
phase_owner: Team 170---

# FIX-101-07 — `phase*`: state → generate-prompt → display

## Summary

For two-phase gates (e.g. GATE_5 `phase2`, GATE_8 `phase2`), `pipeline_run.sh` applies state mutations (e.g. `current_phase`, phase content) **before** invoking `$CLI --generate-prompt`, then extracts phase text for display—avoiding stale prompts.

## Evidence (implementation)

| Item | Location |
|------|----------|
| `phase*`, GATE_5, GATE_8 ordering | `pipeline_run.sh` (search `phase2`, `--generate-prompt`) |

## Commands

```bash
rg -n "phase2|--generate-prompt" pipeline_run.sh | head -40
```

**log_entry | TEAM_101 | FIX_101_07 | VERIFIED | 2026-03-23**
