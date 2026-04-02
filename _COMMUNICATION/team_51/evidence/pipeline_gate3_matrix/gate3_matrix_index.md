date: 2026-03-27
historical_record: true

# GATE_3 visual matrix — index

**Date:** 2026-03-27  
**Basis:** `TEAM_00_TO_TEAM_51_GATE3_MATRIX_CLARIFICATION_RESPONSE_v1.1.0.md`  
**Evidence PNGs + `manifest.json`:** same directory as this file.  
**HTML gallery:** `gate3_matrix_gallery.html`

## `next_action.type` — implementation truth (`agents_os_v3/ui/app.js`)

Values below reflect the mock after `applyGate3PhaseOverride` (GATE_3 + phase).  
Note: Team 00 §4.1 rows 7 and 9 name `CONFIRM_FAIL` for `correction_blocking` and `escalated`; the **current mock** uses **`AWAIT_FEEDBACK`** for those presets (correction re-ingest + escalated banner). File a spec/mock alignment ticket if the table must show `CONFIRM_FAIL` instead.

| # | Preset | Phase | PNG file | `next_action.type` (mock) |
|---|--------|-------|----------|---------------------------|
| 1 | active | phase_3_1 | `gate3_active_phase_3_1.png` | AWAIT_FEEDBACK |
| 2 | active | phase_3_2 | `gate3_active_phase_3_2.png` | AWAIT_FEEDBACK |
| 3 | await_feedback | phase_3_1 | `gate3_await_feedback_phase_3_1.png` | AWAIT_FEEDBACK |
| 4 | await_feedback | phase_3_2 | `gate3_await_feedback_phase_3_2.png` | AWAIT_FEEDBACK |
| 5 | feedback_fallback | phase_3_1 | `gate3_feedback_fallback_phase_3_1.png` | AWAIT_FEEDBACK |
| 6 | feedback_fallback | phase_3_2 | `gate3_feedback_fallback_phase_3_2.png` | AWAIT_FEEDBACK |
| 7 | feedback_pass | phase_3_1 | `gate3_feedback_pass_phase_3_1.png` | CONFIRM_ADVANCE |
| 8 | feedback_pass | phase_3_2 | `gate3_feedback_pass_phase_3_2.png` | CONFIRM_ADVANCE |
| 9 | feedback_fail | phase_3_1 | `gate3_feedback_fail_phase_3_1.png` | CONFIRM_FAIL |
| 10 | feedback_fail | phase_3_2 | `gate3_feedback_fail_phase_3_2.png` | CONFIRM_FAIL |
| 11 | feedback_low | phase_3_1 | `gate3_feedback_low_phase_3_1.png` | MANUAL_REVIEW |
| 12 | feedback_low | phase_3_2 | `gate3_feedback_low_phase_3_2.png` | MANUAL_REVIEW |
| 13 | correction_blocking | phase_3_1 | `gate3_correction_blocking_phase_3_1.png` | AWAIT_FEEDBACK |
| 14 | correction_blocking | phase_3_2 | `gate3_correction_blocking_phase_3_2.png` | AWAIT_FEEDBACK |
| 15 | paused | phase_3_1 | `gate3_paused_phase_3_1.png` | RESUME |
| 16 | paused | phase_3_2 | `gate3_paused_phase_3_2.png` | RESUME |
| 17 | escalated | phase_3_1 | `gate3_escalated_phase_3_1.png` | AWAIT_FEEDBACK |
| 18 | escalated | phase_3_2 | `gate3_escalated_phase_3_2.png` | AWAIT_FEEDBACK |
| 19 | human_gate | phase_3_1 | `gate3_human_gate_phase_3_1.png` | HUMAN_APPROVE |
| 20 | human_gate | phase_3_2 | `gate3_human_gate_phase_3_2.png` | HUMAN_APPROVE |
| 21 | sentinel | phase_3_1 | `gate3_sentinel_phase_3_1.png` | AWAIT_FEEDBACK |
| 22 | sentinel | phase_3_2 | `gate3_sentinel_phase_3_2.png` | AWAIT_FEEDBACK |
| 23 | sse_connected | phase_3_1 | `gate3_sse_connected_phase_3_1.png` | AWAIT_FEEDBACK |
| 24 | sse_connected | phase_3_2 | `gate3_sse_connected_phase_3_2.png` | AWAIT_FEEDBACK |
| 25 | idle | — | `gate3_idle.png` | — (no handoff) |
| 26 | complete | — | `gate3_complete.png` | — (no handoff) |

## URLs (`http://127.0.0.1:8766` — adjust host/port if needed)

Base path: `/agents_os_v3/ui/index.html`

### Rows 1–24 (with phase)

| Preset | `phase_3_1` | `phase_3_2` |
|--------|-------------|-------------|
| active | `?aosv3_preset=active&aosv3_phase=phase_3_1` | `?aosv3_preset=active&aosv3_phase=phase_3_2` |
| await_feedback | `?aosv3_preset=await_feedback&aosv3_phase=phase_3_1` | `?aosv3_preset=await_feedback&aosv3_phase=phase_3_2` |
| feedback_fallback | `?aosv3_preset=feedback_fallback&aosv3_phase=phase_3_1` | `?aosv3_preset=feedback_fallback&aosv3_phase=phase_3_2` |
| feedback_pass | `?aosv3_preset=feedback_pass&aosv3_phase=phase_3_1` | `?aosv3_preset=feedback_pass&aosv3_phase=phase_3_2` |
| feedback_fail | `?aosv3_preset=feedback_fail&aosv3_phase=phase_3_1` | `?aosv3_preset=feedback_fail&aosv3_phase=phase_3_2` |
| feedback_low | `?aosv3_preset=feedback_low&aosv3_phase=phase_3_1` | `?aosv3_preset=feedback_low&aosv3_phase=phase_3_2` |
| correction_blocking | `?aosv3_preset=correction_blocking&aosv3_phase=phase_3_1` | `?aosv3_preset=correction_blocking&aosv3_phase=phase_3_2` |
| paused | `?aosv3_preset=paused&aosv3_phase=phase_3_1` | `?aosv3_preset=paused&aosv3_phase=phase_3_2` |
| escalated | `?aosv3_preset=escalated&aosv3_phase=phase_3_1` | `?aosv3_preset=escalated&aosv3_phase=phase_3_2` |
| human_gate | `?aosv3_preset=human_gate&aosv3_phase=phase_3_1` | `?aosv3_preset=human_gate&aosv3_phase=phase_3_2` |
| sentinel | `?aosv3_preset=sentinel&aosv3_phase=phase_3_1` | `?aosv3_preset=sentinel&aosv3_phase=phase_3_2` |
| sse_connected | `?aosv3_preset=sse_connected&aosv3_phase=phase_3_1` | `?aosv3_preset=sse_connected&aosv3_phase=phase_3_2` |

### Rows 25–26 (no phase)

| Preset | Query |
|--------|--------|
| idle | `?aosv3_preset=idle` |
| complete | `?aosv3_preset=complete` |

---

**log_entry | TEAM_51 | GATE3_MATRIX | INDEX_v1.1.0 | 2026-03-27**
