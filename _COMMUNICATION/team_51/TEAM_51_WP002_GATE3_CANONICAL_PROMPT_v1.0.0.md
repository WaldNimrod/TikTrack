---
id: TEAM_51_WP002_GATE3_CANONICAL_PROMPT_v1.0.0
historical_record: true
from: Team 61
to: Team 51 (AOS QA)
date: 2026-03-10
status: ACTIVATION_PROMPT
work_package: S003-P012-WP002
gate: GATE_3 (implementation / track QA — phase naming)
domain: agents_os---

# Canonical activation — Team 51 | GATE_3 QA | WP002

## Identity header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P012 |
| work_package_id | S003-P012-WP002 |
| gate_id | GATE_3 (phase QA; pipeline may show phase **3.3** / related gate id — follow Team 61 delivery) |
| project_domain | agents_os |

---

## Objective

Execute **QA on WP002 deliverables**: prompt quality, `--from-report` / `FAIL_CMD` behavior, TF-21 operator-text cleanup (no legacy **GATE_6/7/8** in user-visible prompts per Team 00 §2), and 5-gate canonical wording in generated prompts.

---

## What to test

1. **CLI / shell**
   - `./pipeline_run.sh --domain agents_os fail --finding_type <ENUM> "reason"` preflight.
   - `./pipeline_run.sh --domain agents_os fail --finding_type code_fix_multi --from-report <PATH>` reads reason from report (see FAIL_CMD below).
2. **Parser**
   - First line `FAIL_CMD:` wins; else `last_blocking_findings` section; else raw body (see `_parse_fail_report_text`).
3. **Prompts**
   - Generated QA / mandate blocks use canonical gate labels in narrative (no stray GATE_6/7/8 in operator-visible strings).

### Commands (examples)

```bash
cd /path/to/TikTrackAppV2-phoenix
python3 -m pytest agents_os_v2/tests/test_pipeline.py::TestWp002FromReport -v
python3 -m pytest agents_os_v2/tests/ -v --tb=short
```

```bash
./pipeline_run.sh --domain agents_os --generate-prompt GATE_4   # if current phase maps to QA prompt
# or as mandated by current WSM / pipeline state
```

---

## FAIL_CMD (mandatory on FAIL)

Per Team 00 `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_61_WP002_CLARIFICATION_AND_COMPLETION_v1.0.0.md` §3:

```markdown
FAIL_CMD: ./pipeline_run.sh --domain agents_os fail --finding_type <TYPE> "GATE_3 FAIL: <short reason>"
```

**Path B (`--from-report`):** `--finding_type` is **always** set on the CLI; the file supplies the reason string (from `FAIL_CMD:` line when present).

---

## HITL boundary (KB-64)

Nimrod (Team 00) is **not** assumed available for live Q&A during this QA cycle. Document assumptions; use FAIL + `FAIL_CMD` for blockers.

---

## Acceptance (Team 51)

| # | Criterion |
|---|------------|
| A1 | pytest `TestWp002FromReport` behavior matches report |
| A2 | No regression in `agents_os_v2/tests/` |
| A3 | Operator-visible prompts / usage text align with 5-gate naming (TF-21) |
| A4 | On FAIL, QA report contains **FAIL_CMD** line exactly as §3 |

---

## Output

Produce `TEAM_51_*_S003_P012_WP002_GATE3_QA_REPORT_v1.0.0.md` (or current Team 51 naming convention) with **PASS** or **FAIL** and, if FAIL, the **FAIL_CMD** line.

---

**log_entry | TEAM_61 | TO_TEAM_51 | WP002_GATE3_PROMPT | 2026-03-10**
