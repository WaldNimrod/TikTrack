---
id: TEAM_170_TO_TEAM_11_S003_P011_WP002_GATE_5_KB_FIXES_MANDATE_v1.0.0
historical_record: true
from: Team 170 (AOS Spec Owner, GATE_5 Phase 5.1)
to: Team 11 (AOS Gateway)
cc: Team 61, Team 51, Team 100
date: 2026-03-21
gate: GATE_5
phase: "5.1"
wp: S003-P011-WP002
domain: agents_os
type: KB_FIX_MANDATE
authority: TEAM_100_TO_TEAM_170_S003_P011_WP002_GATE_5_PHASE_5.1_ACTIVATION_v1.0.0 §3
status: ACTIVE---

# S003-P011-WP002 — GATE_5 Phase 5.1 | KB Fix Mandate to Team 61

Team 11: Route this mandate to Team 61. Team 61 must produce the fix deliverable and Team 51 must re-verify.

---

## Mandatory Fix List for Team 61

| bug_id | severity | description | code location | validation |
|--------|----------|-------------|---------------|------------|
| **KB-2026-03-20-32** | HIGH | `FAIL_ROUTING` dict targets old gate IDs (`CURSOR_IMPLEMENTATION`, `G3_PLAN`, `GATE_8`, etc.) — must be rewritten to GATE_1..GATE_5 keys only | `agents_os_v2/orchestrator/pipeline.py` — FAIL_ROUTING dict | Team 51 CERT rerun: add CERT_16 or extend CERT_15 to cover fail routing targets |
| **KB-2026-03-20-33** | HIGH | Verify `PipelineState.load()` triggers migration. State uses `model_validate` + `_run_migration` validator. Confirm TikTrack domain load auto-migrates legacy `G3_6_MANDATES` → GATE_3/3.1 | `agents_os_v2/orchestrator/state.py` | Team 51: CERT_13/14 must pass; add test: TikTrack domain load auto-migrates |
| **KB-2026-03-20-34** | HIGH | GATE_5 prompt generator title shows "Dev Validation" — must produce documentation closure content for Team 170/70 per domain. Replace title with "GATE_5 — Documentation Closure" and content for Team 170 (AOS) / Team 70 (TikTrack) | `agents_os_v2/orchestrator/pipeline.py` — `_generate_gate_5_prompt()` | CERT_08 (AOS GATE_5 → team_170), CERT_09 (TikTrack GATE_5 → team_70) |
| **KB-2026-03-20-38** | MEDIUM | D-03 deliverable gap — DRY_RUN_01..15 test suite missing. End-to-end pipeline routing scenarios not covered | `agents_os_v2/tests/` | New test file covering domain×variant×gate routing matrix; Team 51 runs and confirms |

### Phase 5.2+ Remediation (lower priority — after KB-32/33/34/38)

| bug_id | severity | description | code location |
|--------|----------|-------------|---------------|
| **KB-2026-03-20-36** | MEDIUM | `pass` command has no gate identifier — `./pipeline_run.sh pass GATE_N` per IDEA-050; abort if current_gate ≠ GATE_N | `pipeline_run.sh` — pass subcommand |
| **KB-2026-03-20-37** | MEDIUM | `flags.waiting_human_approval` checks `state.current_gate in ("WAITING_GATE2_APPROVAL", "GATE_7")` — must use `gate_state=="HUMAN_PENDING"` only | `agents_os_v2/orchestrator/pipeline.py` — `_write_state_view()` ~line 340 |
| **KB-2026-03-20-39** | LOW | `GATE_ALIASES` identity map — should map old IDs → canonical GATE_1..GATE_5 per GATE_SEQUENCE_CANON §8 | `agents_os_v2/orchestrator/pipeline.py` — GATE_ALIASES dict |

---

## Team 61 Deliverable

Produce:
```
_COMMUNICATION/team_61/TEAM_61_S003_P011_WP002_GATE_5_KB_FIXES_v1.0.0.md
```

Contents: code changes, new/updated test names, pytest output (all 19+ tests PASS including new ones).

---

## Team 51 Re-verification

After Team 61 delivers:
```bash
python3 -m pytest agents_os_v2/tests/test_certification.py -q
python3 -m pytest agents_os_v2/tests/ -q -k "not OpenAI and not Gemini"
```

Expected: all CERT pass + new dry-run tests pass + regression clean. Team 51 produces brief confirmation artifact.

---

**log_entry | TEAM_170 | S003_P011_WP002 | GATE_5_KB_MANDATE | ROUTED_TO_TEAM_11 | 2026-03-21**
