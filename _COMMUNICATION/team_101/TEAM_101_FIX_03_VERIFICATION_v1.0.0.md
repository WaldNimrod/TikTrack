---
id: TEAM_101_FIX_03_VERIFICATION_v1.0.0
historical_record: true
team: team_101
title: FIX-101-03 HITL prohibition — verification
domain: agents_os
date: 2026-03-23
status: DONE
wp: S003-P011-WP002
gate: —
phase_owner: Team 170---

# FIX-101-03 — HITL prohibition block

## Summary

`_hitl_prohibition_block`, `_maybe_hitl` inject the HITL prohibition into saved prompts via `_save_prompt` and `generate_prompt` paths so generated `*_prompt.md` files include the block.

## Evidence (implementation)

| Item | Location |
|------|----------|
| `_hitl_prohibition_block`, `_maybe_hitl` | `agents_os_v2/orchestrator/pipeline.py` |
| Tests | `agents_os_v2/tests/test_canary_fixes.py` |

## Commands

```bash
rg "_hitl_prohibition_block|_maybe_hitl" agents_os_v2/orchestrator/pipeline.py
source api/venv/bin/activate && python3 -m pytest agents_os_v2/tests/test_canary_fixes.py -q --tb=line
```

**log_entry | TEAM_101 | FIX_101_03 | VERIFIED | 2026-03-23**
