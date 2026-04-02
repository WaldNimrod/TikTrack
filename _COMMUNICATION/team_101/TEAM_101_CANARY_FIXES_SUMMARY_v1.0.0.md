---
id: TEAM_101_CANARY_FIXES_SUMMARY_v1.0.0
historical_record: true
team: team_101
title: Canary Fixes (FIX-101-01 … 07) — summary
domain: agents_os
date: 2026-03-23
status: LOCKED
architect_verdict: APPROVED_WITH_NOTES
wp: S003-P013-WP001
gate: —
phase_owner: Team 170
binding_note_bn1: RESOLVED — Iron Rule §4 in AOS_PIPELINE_ARCHITECTURE_REFERENCE_v1.0.2---

# TEAM_101 — Canary Fixes Summary

Mandate: Team 100 Canary Findings → Team 101 implementation (FIX-101-01 … FIX-101-07).

## Status table

| FIX | Title | Status | Verification artifact |
|-----|--------|--------|-------------------------|
| FIX-101-01 | GATE_2 `GATE_2_mandates.md`, dashboard, `pipeline_run` | **DONE** | `TEAM_101_FIX_01_VERIFICATION_v1.0.0.md` |
| FIX-101-02 | WSM `STAGE_PARALLEL_TRACKS`, `ssot_check` | **DONE** | `TEAM_101_FIX_02_VERIFICATION_v1.0.0.md` |
| FIX-101-03 | HITL prohibition in prompts | **DONE** | `TEAM_101_FIX_03_VERIFICATION_v1.0.0.md` |
| FIX-101-04 | KB-84 guard + UI flags | **DONE** | `TEAM_101_FIX_04_VERIFICATION_v1.0.0.md` |
| FIX-101-05 | `writes_to` on mandates | **DONE** | `TEAM_101_FIX_05_VERIFICATION_v1.0.0.md` |
| FIX-101-06 | Dashboard Last updated + REFRESH | **DONE** | `TEAM_101_FIX_06_VERIFICATION_v1.0.0.md` |
| FIX-101-07 | `phase*` ordering | **DONE** | `TEAM_101_FIX_07_VERIFICATION_v1.0.0.md` |

## Test sweep (Team 100 sign-off, 2026-03-23)

```text
208 passed, 4 skipped
```

Command: `python3 -m pytest agents_os_v2/tests/ -q --tb=line`

## Team 100 — APPROVED WITH NOTES (BN-1)

**BN-1:** `PIPELINE_RELAXED_KB84=1` (FIX-101-04) must appear in documentation as a **limited Iron Rule** (Team 170 → §4 patch).

**Resolved:** [`documentation/docs-system/02-PIPELINE/AOS_PIPELINE_ARCHITECTURE_REFERENCE_v1.0.0.md`](../../documentation/docs-system/02-PIPELINE/AOS_PIPELINE_ARCHITECTURE_REFERENCE_v1.0.0.md) **§4 — Iron Rules** includes:

- KB-84 precision identifiers (mandatory default).
- **`PIPELINE_RELAXED_KB84=1`** — PERMITTED ONLY for CI / legacy migration scripts where full precision context is unavailable; **FORBIDDEN** for human operators and agent prompts.

Confirmation: [`TEAM_170_TO_TEAM_100_BN1_PIPELINE_RELAXED_KB84_PATCH_CONFIRMATION_v1.0.0.md`](../team_170/TEAM_170_TO_TEAM_100_BN1_PIPELINE_RELAXED_KB84_PATCH_CONFIRMATION_v1.0.0.md).

**Sprint closure seal:** [`TEAM_101_CANARY_FIX_SPRINT_APPROVED_WITH_NOTES_SEAL_v1.0.0.md`](TEAM_101_CANARY_FIX_SPRINT_APPROVED_WITH_NOTES_SEAL_v1.0.0.md)

## Notes (operational)

- **`ssot_check --domain agents_os`**: may still report drift if the active WSM domain does not match the last pipeline write; use consistent `--domain` and allow sync paths to run.
- **KB-84 default:** use full `--wp` / `--gate` / `--phase`. Relaxed mode — see §4 Iron Rule above (not a casual shortcut).

**log_entry | TEAM_101 | CANARY_FIXES_SUMMARY | LOCKED | APPROVED_WITH_NOTES | BN1_RESOLVED | 2026-03-23**
