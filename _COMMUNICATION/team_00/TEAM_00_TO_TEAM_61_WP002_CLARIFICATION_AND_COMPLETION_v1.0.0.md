---
id: TEAM_00_TO_TEAM_61_WP002_CLARIFICATION_AND_COMPLETION_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect) / Team 00 (System Designer)
to: Team 61 (AOS TRACK_FOCUSED Unified Implementor)
date: 2026-03-21
status: ISSUED
work_package: S003-P012-WP002
subject: WP002 completion directive — TF-21 scope boundary + FAIL_CMD format + remaining tasks---

# Team 100 → Team 61 | WP002 Clarification & Completion Directive

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P012 |
| work_package_id | S003-P012-WP002 |
| from | Team 100 / Team 00 |
| to | Team 61 |
| domain | agents_os |

---

## §1 — Confirmed DONE

The following are accepted as delivered:
- `--from-report` flag: `pipeline.py` + `pipeline_run.sh` — ACCEPTED
- `fail` subcommand parses `shift`, `--finding_type`, `--from-report` — ACCEPTED

Proceed immediately to the remaining items below.

---

## §2 — TF-21 Scope Boundary (LOCKED)

**Question answered:** What exactly counts as "generated prompt / banner text" that must be
cleaned of GATE_6 / GATE_7 / GATE_8 references?

### Rule: the operator test

> **IN SCOPE (must be cleaned):** Any string that an operator or team member would SEE during
> normal `pipeline_run.sh` operation — in stdout, stderr, the gate prompt block (▼▼▼/▲▲▲),
> or any report file written to disk.

> **NOT IN SCOPE (leave untouched):** Internal Python identifiers, dict keys, routing strings,
> function names, comments, test assertions that never surface in operator output.

### Concrete boundary table

| Location | Example | In scope? |
|---|---|---|
| `GATE_META["GATE_N"]["desc"]` string values | `"GATE_8 — lifecycle close"` | **YES** — becomes prompt header |
| `echo` / `print` output in pipeline_run.sh | `echo "⛔ GATE_7 is closed"` | **YES** — operator sees it |
| Gate prompt narrative text | `"## GATE_8 — Documentation Closure\n..."` | **YES** — team prompt |
| Error / warning messages emitted to stderr | `"Error: GATE_6 already passed"` | **YES** |
| FAIL_CMD template strings in prompts | `"./pipeline_run.sh … --finding_type …"` | **YES** — in team output |
| `GATE_ALIASES` dict keys / values | `"GATE_7": "GATE_4"` | **NO** — internal routing |
| `_DOMAIN_PHASE_ROUTING` dict keys | `"GATE_8"` as routing key | **NO** — internal state machine |
| Python variable names | `current_gate = "GATE_8"` | **NO** — internal identifier |
| Function names | `def _close_gate_8()` | **NO** |
| pytest assertion strings | `assert state.current_gate == "GATE_8"` | **NO** — never operator-facing |
| Code comments | `# GATE_7 was the old human approval` | **NO** |
| `pipeline_state_*.json` field values | `"current_gate": "GATE_4"` | **NO** — state data, not prompts |

### Practical instruction for TF-21 scan

Search for `GATE_6`, `GATE_7`, `GATE_8` (and variants: `gate_6`, `gate_7`, `gate_8`,
`GATE6`, `GATE7`, `GATE8`) in:

1. All `_generate_*` / `_build_*` / `_prompt_*` functions in `pipeline.py` → check
   string literals inside, not the function names or dict keys
2. All `echo` and `printf` lines in `pipeline_run.sh` → check the output text
3. Any generated markdown files written to `_COMMUNICATION/` as team prompts

For each hit: replace the old gate label with the canonical 5-gate equivalent per GATE_ALIASES:

| Old label (in prompt text) | Replace with |
|---|---|
| GATE_0 | GATE_1 |
| GATE_1 | GATE_1 |
| GATE_2 | GATE_2 |
| GATE_3, GATE_3.1, GATE_3.2 | GATE_3 |
| GATE_4 (old QA) | GATE_3 |
| GATE_5 (old TF) | GATE_3 |
| GATE_6 (old arch review) | GATE_2 |
| GATE_7 (old human) | GATE_4 |
| GATE_8 (old lifecycle) | GATE_5 |

**Stop condition:** When `grep -rn "GATE_[678]" agents_os_v2/orchestrator/pipeline.py pipeline_run.sh`
returns zero hits inside string literals that feed operator output. Dict keys and routing tables
are excluded from this check.

---

## §3 — FAIL_CMD Format (Canonical, with --from-report edge cases)

### How --from-report works (exact code behavior)

`_parse_fail_report_text()` reads the report file and extracts the reason in this priority order:

1. **FAIL_CMD: line (preferred)** — finds first line starting with `FAIL_CMD:` (case-insensitive),
   returns everything after the colon. This entire string becomes the `reason` stored in
   `last_blocking_findings`.

2. **`last_blocking_findings:` section (fallback)** — regex match on the section header,
   captures everything after it (up to 8000 chars).

3. **Raw file text (last resort)** — first 8000 chars of the file.

### Canonical FAIL_CMD format in a QA report

Every Team 51 / Team 90 QA report that results in a FAIL MUST include this exact line
(anywhere in the file):

```
FAIL_CMD: ./pipeline_run.sh --domain agents_os fail --finding_type <TYPE> "<short reason>"
```

**Full concrete example (Team 51 GATE_3 FAIL report):**

```markdown
## Verdict

**Result: FAIL**

| Finding | Type | Severity |
|---|---|---|
| F-01: `write_wsm_state()` skips `phase_owner_team` field when gate_state ≠ None | code_fix_multi | BLOCKING |
| F-02: ssot_check exits 0 even when `active_flow` drifts | code_fix_multi | BLOCKING |

FAIL_CMD: ./pipeline_run.sh --domain agents_os fail --finding_type code_fix_multi "GATE_3 FAIL: write_wsm_state skips phase_owner_team; ssot_check false-positive exit 0"
```

### Operator usage (two equivalent paths)

**Path A — Copy-paste (primary):**
Operator reads the FAIL_CMD line from the report and runs it directly:
```bash
./pipeline_run.sh --domain agents_os fail --finding_type code_fix_multi "GATE_3 FAIL: write_wsm_state skips phase_owner_team; ssot_check false-positive exit 0"
```

**Path B — --from-report (convenience):**
```bash
./pipeline_run.sh --domain agents_os fail --finding_type code_fix_multi \
  --from-report _COMMUNICATION/team_51/TEAM_51_WP002_GATE3_REPORT_v1.0.0.md
```
Pipeline reads the FAIL_CMD line from the file; extracts the full command string as the reason.

### Edge cases — locked answers

| Edge case | Behavior |
|---|---|
| Report has FAIL_CMD: line AND --finding_type on CLI | CLI `--finding_type` wins. FAIL_CMD content becomes reason string. |
| Report has no FAIL_CMD: line | Falls back to `last_blocking_findings:` section, then raw file. |
| --from-report file does not exist | Error logged; advance aborted. |
| `--finding_type` not provided even with --from-report | Preflight fails: "FAIL PREFLIGHT — finding_type is required" |
| FAIL_CMD: line contains the full pipeline command as text | Normal — that command string is stored as the reason. It is informational for audit trail, not re-executed. |

---

## §4 — Remaining Tasks for WP002 (complete in order)

### Task 1 — TF-21 Cleanup (per §2 scope)

Scan all string literals in `_generate_*` functions + `echo`/`printf` in `pipeline_run.sh`.
Replace GATE_6 / GATE_7 / GATE_8 references in operator-facing text with canonical equivalents.
**Do NOT touch dict keys, variable names, routing tables, test files.**

Completion check:
```bash
grep -n "GATE_[678]" agents_os_v2/orchestrator/pipeline.py | grep -v "^\s*#\|ALIASES\|ROUTING\|assert\|'GATE_\|\"GATE_"
```
Zero hits in string literals inside `_generate_*` functions = done.

### Task 2 — pytest (regression guard)

Run:
```bash
python3 -m pytest agents_os_v2/tests/ -v --tb=short 2>&1 | tail -20
```

All pre-existing passing tests must continue to pass. The one known pre-existing failure
(`test_gate_2_uses_gemini`) is excluded from AC. If new failures appear → fix before delivery.

**Minimum 3 new tests for WP002 scope:**
- Test: `--from-report` flag reads FAIL_CMD: line from report file correctly
- Test: `--from-report` falls back to raw text when no FAIL_CMD: line present
- Test: `--from-report` file-not-found produces correct error (no crash)

### Task 3 — Delivery Artifact

Write: `_COMMUNICATION/team_61/TEAM_61_WP002_DELIVERY_v1.0.0.md`

Required sections:
- Mandatory identity header
- §1 Tasks executed (--from-report, TF-21 cleanup, pytest)
- §2 Acceptance criteria evidence (per WP002 mandate)
- §3 Files modified (list)
- §4 SOP-013 Seal

### Task 4 — Canonical Trigger Prompt: Team 51

Write: `_COMMUNICATION/team_51/TEAM_51_WP002_GATE3_CANONICAL_PROMPT_v1.0.0.md`

This is the activation document for Team 51 to run GATE_3 QA on WP002. Must include:
- Identity header (domain: agents_os, WP: S003-P012-WP002, gate: GATE_3)
- What to test: `--from-report` flag behavior, TF-21 cleanup verification, 5-gate canonical text in prompts
- Test commands to run
- Acceptance criteria (from WP002 mandate)
- FAIL_CMD format (per §3 above)
- HITL boundary note (KB-64)

### Task 5 — Canonical Trigger Prompt: Team 90

Write: `_COMMUNICATION/team_90/TEAM_90_WP002_GATE4_CANONICAL_PROMPT_v1.0.0.md`

Team 90 receives GATE_4 (architectural review / spec compliance) for WP002. Must include:
- Identity header (domain: agents_os, WP: S003-P012-WP002, gate: GATE_4)
- Review scope: --from-report implementation correctness + TF-21 cleanup completeness
- Evidence locations (Team 61 delivery + Team 51 GATE_3 report)
- Pass / FAIL criteria

### Task 6 — Canonical Trigger Prompt: Team 100

Write: `_COMMUNICATION/team_100/TEAM_100_WP002_GATE5_CLOSE_PROMPT_v1.0.0.md`

Team 100 receives the final GATE_5 (lifecycle closure) for WP002. Must include:
- Identity header (domain: agents_os, WP: S003-P012-WP002, gate: GATE_5)
- Evidence chain (Team 61 delivery → Team 51 GATE_3 PASS → Team 90 GATE_4 PASS)
- Pipeline command to close: `./pipeline_run.sh --domain agents_os pass`
- Next action: unlock WP003

---

## §5 — Execution Order

```
Task 1 (TF-21) → Task 2 (pytest) → Task 3 (delivery artifact)
                                 → Task 4 (Team 51 prompt)
                                 → Task 5 (Team 90 prompt)
                                 → Task 6 (Team 100 prompt)
```

Tasks 3–6 can be written in parallel after Tasks 1–2 pass.

**Do not submit delivery until:**
1. TF-21 scan returns 0 operator-facing hits in pipeline.py / pipeline_run.sh
2. All pre-existing pytest tests pass + ≥3 new WP002 tests pass
3. All 4 artifacts written

---

## §6 — SOP-013 Handover Note

Upon delivery, Team 61 MUST include this seal in the delivery artifact:

```
--- PHOENIX TASK SEAL (SOP-013) ---
TASK_ID:       S003-P012-WP002
STATUS:        COMPLETED
HANDOVER_PROMPT:
  Team 51: run GATE_3 QA per _COMMUNICATION/team_51/TEAM_51_WP002_GATE3_CANONICAL_PROMPT_v1.0.0.md
--- END SEAL ---
```

---

**log_entry | TEAM_100 | WP002_CLARIFICATION | TF21_SCOPE_LOCKED | FAIL_CMD_CANONICAL | TO_TEAM_61 | 2026-03-21**
