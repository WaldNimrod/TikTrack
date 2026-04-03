---
id: TEAM_101_FIX_01_VERIFICATION_v1.0.0
historical_record: true
team: team_101
title: FIX-101-01 GATE_2 mandates — verification
domain: agents_os
date: 2026-03-23
status: DONE
wp: S003-P011-WP002
gate: GATE_2
phase_owner: Team 170---

# FIX-101-01 — GATE_2 unified `GATE_2_mandates.md`

## Summary

Unified five-phase GATE_2 mandate document generation (`_generate_gate_2_mandates`), dashboard routing (`GATE_MANDATE_FILES_BASE["GATE_2"]`), multi-phase tab logic (`isTwoPhaseGate`, `gate2PhaseMap`), and `pipeline_run.sh` **phase\*** mandate path for GATE_2 → `GATE_2_mandates.md`.

## Evidence (implementation)

| Item | Location |
|------|----------|
| `_generate_gate_2_mandates`, `GATE_MANDATE_FILES` | `agents_os_v2/orchestrator/pipeline.py` (search `_generate_gate_2_mandates`, `GATE_2_mandates`) |
| `GATE_MANDATE_FILES_BASE["GATE_2"]` | `agents_os/ui/js/pipeline-config.js` |
| `isTwoPhaseGate`, `gate2PhaseMap`, mandate load | `agents_os/ui/js/pipeline-dashboard.js` |
| `phase*`, `GATE_2`, `GATE_2_mandates.md` | `pipeline_run.sh` (grep `GATE_2_mandates`) |

## Commands (smoke)

```bash
cd /path/to/repo && source api/venv/bin/activate
python3 -c "
from agents_os_v2.orchestrator.pipeline import PipelineState, _generate_gate_2_mandates
from pathlib import Path
s = PipelineState(); s.project_domain='tiktrack'; s.current_gate='GATE_2'; s.current_phase='2.1'
s.work_package_id='S003-P011-WP002'; s.stage_id='S003'
out = _generate_gate_2_mandates(s)
assert 'GATE_2' in out and 'Phase' in out
print('ok', len(out))
"
```

**log_entry | TEAM_101 | FIX_101_01 | VERIFIED | 2026-03-23**
