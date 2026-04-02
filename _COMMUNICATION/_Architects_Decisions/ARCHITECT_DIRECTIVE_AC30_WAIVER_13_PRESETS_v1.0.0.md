---
id: ARCHITECT_DIRECTIVE_AC30_WAIVER_13_PRESETS_v1.0.0
historical_record: true
from: Team 00 (Principal — Nimrod)
to: Team 90 (Validation), Team 31 (AOS Frontend), Team 51 (AOS QA), Team 100 (Chief Architect)
date: 2026-03-27
type: ARCHITECTURAL_DIRECTIVE — AC ALIGNMENT (waiver/update)
domain: agents_os
trigger: TEAM_90_AOS_V3_MOCKUP_VALIDATION_VERDICT_v1.0.1 — Finding F-01 (MINOR)
resolves: F-01 (OPEN external dependency → CLOSED)---

# Architect Directive — AC-30 Alignment: 13 Presets Canonical (waiver + AC update)

## Decision

**AC-30 is formally updated from 10 scenarios to 13.**
The implementation (`agents_os_v3/ui/app.js` — 13 presets) is **correct and canonical**.
No presets are to be removed. No mockup changes required.

## Root Cause of Gap

AC-30 was authored during the Stage 8B mandate (A117) using the count:

> "4 existing base states (IN_PROGRESS/IDLE/PAUSED/COMPLETE) + 6 new Stage 8B = **10**"

The implementation correctly retained **all 7 legacy presets** from the prior mockup iteration, not just the 4 base states. The 3 additional legacy presets were present before Stage 8B and represent valid, distinct pipeline states:

| Preset key | Pipeline state | Next action type |
|---|---|---|
| `escalated` | CORRECTION_ESCALATED | CONFIRM_FAIL (correction cycle) |
| `human_gate` | HITL gate active | HUMAN_APPROVE |
| `sentinel` | Sentinel/validation active | AWAIT_FEEDBACK |

These were never excluded — they were simply not enumerated in the Stage 8B AC count because they predated Stage 8B. The correct total was always 13.

## Canonical Preset Count — 13 (locked)

| # | Preset key | State | next_action.type | Stage |
|---|---|---|---|---|
| 1 | `active` | IN_PROGRESS | AWAIT_FEEDBACK | legacy |
| 2 | `idle` | IDLE | IDLE | legacy |
| 3 | `paused` | PAUSED | RESUME | legacy |
| 4 | `complete` | COMPLETE | IDLE | legacy |
| 5 | `escalated` | CORRECTION | CONFIRM_FAIL | legacy |
| 6 | `human_gate` | IN_PROGRESS (HITL) | HUMAN_APPROVE | legacy |
| 7 | `sentinel` | IN_PROGRESS (validation) | AWAIT_FEEDBACK | legacy |
| 8 | `await_feedback` | IN_PROGRESS | AWAIT_FEEDBACK (mode buttons) | Stage 8B |
| 9 | `feedback_fallback` | IN_PROGRESS | AWAIT_FEEDBACK (fallback) | Stage 8B |
| 10 | `feedback_pass` | IN_PROGRESS | CONFIRM_ADVANCE | Stage 8B |
| 11 | `feedback_fail` | IN_PROGRESS | CONFIRM_FAIL | Stage 8B |
| 12 | `feedback_low` | IN_PROGRESS | MANUAL_REVIEW | Stage 8B |
| 13 | `correction_blocking` | CORRECTION | CONFIRM_FAIL (BF list) | Stage 8B |

> **Note:** `sse_connected` is a UI state overlay (SSE connected indicator), not a separate pipeline state preset — it augments other presets and is not counted as a 14th scenario.

## Implications

1. All mandate documents (A117 mandate v2.0.0, activation A119) that reference "10 scenarios in AC-30" are superseded by this directive for the scenario count field only. All other content of those documents remains canonical.
2. Team 90 F-01 is **CLOSED** upon receipt of this directive. No re-validation cycle required for this finding alone.
3. Team 31 evidence document v2.0.0 "Documented deviation" section is resolved — implementation is aligned with canonical count.

## Authority

**Team 00 (Principal — Nimrod)** — gate authority per TEAM_00_CONSTITUTION_v1.0.0 §4.

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE | AC30_WAIVER_13_PRESETS | ISSUED | 2026-03-27**
