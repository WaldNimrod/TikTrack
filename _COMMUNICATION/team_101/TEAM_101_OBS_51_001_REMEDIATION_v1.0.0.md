---
id: TEAM_101_OBS_51_001_REMEDIATION_v1.0.0
historical_record: true
team: team_101
title: OBS-51-001 remediation — COMPLETE prompt / exit code
domain: agents_os
date: 2026-03-23
status: CLOSED
wp: S003-P013-WP001
phase_owner: Team 170
in_response_to: TEAM_51_S003_P013_WP001_CANARY_FIXES_QA_REPORT_v1.0.0.md---

# OBS-51-001 — Remediation (Team 51 observation)

## Root cause

After the final **`pass`**, `NEXT_GATE` becomes **`COMPLETE`**. [`pipeline_run.sh`](pipeline_run.sh) called `_generate_and_show COMPLETE`, which:

1. Ran `python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt COMPLETE` (previously fell through to **Unknown gate** messaging), then
2. Called `_show_prompt COMPLETE`, which looks for `*_COMPLETE_prompt.md`. **File missing → `exit 1`** (see `_show_prompt` in `pipeline_run.sh`).

With **`set -e`**, the script exited non-zero despite a successful gate advance and SSOT.

## Fix (implemented)

| Layer | Change |
|-------|--------|
| Shell | [`_generate_and_show`](pipeline_run.sh): if `gate == COMPLETE`, print lifecycle-complete banner and **`return 0`** — no CLI, no `_show_prompt`. |
| Python | [`generate_prompt`](agents_os_v2/orchestrator/pipeline.py): **`elif gate_id == "COMPLETE"`** — log terminal message and **return** (no Unknown gate, no file save). |

## Verification

**CLI (after fix):**

```text
$ python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt COMPLETE
[…] ✅ current_gate is COMPLETE — work package lifecycle finished; no prompt to generate.
$ echo $?
0
```

**Automated:**

```text
python3 -m pytest agents_os_v2/tests/test_canary_fixes.py -q
# includes test_generate_prompt_complete_is_terminal_no_crash
```

**Full suite (2026-03-23):** `208 passed, 4 skipped`

## Re-test for operators / Team 51 spot-check

1. Bring a test pipeline to final closure (`current_gate=COMPLETE` after last `pass`), or rely on `--generate-prompt COMPLETE` smoke above.
2. Confirm **`./pipeline_run.sh … pass`** at terminal gate exits **0** and prints the COMPLETE banner (no `Unknown gate: COMPLETE`, no missing `*_COMPLETE_prompt.md` error).

---

**log_entry | TEAM_101 | OBS_51_001 | REMEDIATION_CLOSED | 2026-03-23**
