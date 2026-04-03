# GATE_3 pipeline mock — screenshot matrix (26 cells)

**Canonical spec:** `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_51_GATE3_MATRIX_CLARIFICATION_RESPONSE_v1.1.0.md`

## Cells

| Group | Count | Files |
|--------|------:|--------|
| 12 presets × `phase_3_1` / `phase_3_2` | 24 | `gate3_{preset}_phase_3_1.png`, `gate3_{preset}_phase_3_2.png` |
| `idle`, `complete` (no `aosv3_phase`) | 2 | `gate3_idle.png`, `gate3_complete.png` |

**Presets (with phase):** `active`, `await_feedback`, `feedback_fallback`, `feedback_pass`, `feedback_fail`, `feedback_low`, `correction_blocking`, `paused`, `escalated`, `human_gate`, `sentinel`, `sse_connected`

Full URL table and `next_action` types: **`_COMMUNICATION/team_51/evidence/pipeline_gate3_matrix/gate3_matrix_index.md`**

## Assembled prompt (Q1)

For states that show the prompt block, the line `**Gate:** GATE_3 / phase_3_x` is driven from `current_gate_id` / `current_phase_id` after `applyGate3PhaseOverride` (body remains placeholder).

## Run capture

```bash
python3 -m http.server 8766   # from repo root
cd agents_os_v3/ui/scripts && npm install && npx playwright install chromium
node capture_gate3_matrix.mjs
```

Output: `_COMMUNICATION/team_51/evidence/pipeline_gate3_matrix/`
