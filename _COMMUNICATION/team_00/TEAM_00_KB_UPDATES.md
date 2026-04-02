date: 2026-03-23
historical_record: true


---

## KB-84 — Precision Pass Lock (locked 2026-03-23)

**Iron Rule**: Every `pass` command on the pipeline MUST include WP+gate+phase identifiers.

**Full locked format:**
```bash
./pipeline_run.sh --domain <domain> --wp <WP_ID> --gate <GATE_N> --phase <N.N> pass
# Example:
./pipeline_run.sh --domain tiktrack --wp S003-P013-WP001 --gate GATE_3 --phase 3.3 pass
```

**Validation behavior:**
- If ANY identifier mismatches active state → BLOCKED + shows active state + correct command
- All three checked: WP ID, gate, phase
- WP mismatch = stale clipboard / wrong work package → hard block
- Gate mismatch = wrong pipeline position → hard block
- Phase mismatch = wrong sub-phase → hard block

**Dashboard**: All QAB pass buttons generate precision commands via `_precisionPassCmd(gate, phase)` in pipeline-state.js (reads WP from pipelineState at render time).

**Bypass** (emergency only, not recommended): omit --wp/--gate/--phase flags.

