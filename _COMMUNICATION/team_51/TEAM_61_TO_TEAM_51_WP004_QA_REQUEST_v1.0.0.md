---
id: TEAM_61_TO_TEAM_51_WP004_QA_REQUEST_v1.0.0
from: Team 61 (AOS Local Cursor Implementation)
to: Team 51 (AOS QA & Functional Acceptance)
cc: Team 10, Team 00
date: 2026-03-17
status: QA_REQUEST_PENDING
work_package_id: S002-P005-WP004
gate_id: GATE_4
mandate: TEAM_00_TO_TEAM_61_WP004_PIPELINE_GOVERNANCE_MANDATE_v1.0.0
---

# S002-P005-WP004 — QA Request
## Pipeline Governance Code Integrity

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP004 |
| gate_id | GATE_4 |
| date | 2026-03-17 |

---

## §1 Implementation Reference

| Document | Path |
|----------|------|
| Implementation Complete | `_COMMUNICATION/team_61/TEAM_61_S002_P005_WP004_IMPLEMENTATION_COMPLETE_v1.0.0.md` |
| Mandate | `_COMMUNICATION/team_61/TEAM_00_TO_TEAM_61_WP004_PIPELINE_GOVERNANCE_MANDATE_v1.0.0.md` |

---

## §2 QA Checklist

### C.1 — G5_DOC_FIX Removal

| Check | Expected | Command / Location |
|-------|----------|-------------------|
| GATE_SEQUENCE | No "G5_DOC_FIX" | `grep -n G5_DOC_FIX agents_os_v2/orchestrator/pipeline.py` → no matches in GATE_SEQUENCE |
| GATE_CONFIG | No G5_DOC_FIX entry | `grep G5_DOC_FIX agents_os/ui/js/pipeline-config.js` → no matches |
| pipeline_run.sh | Route doc comment updated | `grep -A1 "route doc" pipeline_run.sh` → references "doc fix → impl team" not G5_DOC_FIX |
| GATE_5 doc routing | Points to CURSOR_IMPLEMENTATION | pipeline.py FAIL_ROUTING GATE_5 "doc" → CURSOR_IMPLEMENTATION |

### C.2 — Team 10 Label Drift

| Check | Expected |
|-------|----------|
| pipeline.py docstring | "Team 10 is the Work Plan Generator. The Python pipeline is the sole orchestrator." |
| pipeline.py prompts | "Team 10 — Work Plan Generator" (not "Execution Orchestrator") |
| pipeline-config.js | team_10 name: "Work Plan Generator" |
| WSM text | "WSM updates are managed by the pipeline system. Team 10 does not modify WSM directly." |

### C.3 — PASS_WITH_ACTION Button

| Check | Expected |
|-------|----------|
| data-testid | `data-testid="pass-with-action-btn"` on PWA button |
| Visibility | Only on validation gates: GATE_0, GATE_1, G3_5, GATE_4, GATE_5 (owner team_90/190/50/51) |
| On click | Textarea appears for pipe-separated actions |
| Generate | Produces `./pipeline_run.sh --domain X pass_with_actions "ACTION-1|ACTION-2"` |
| pending-actions-panel | `data-testid="pending-actions-panel"` on PWA banner (when gate_state=PASS_WITH_ACTION) |

### C.4 — GATE_CONFIG Rename Comment

| Check | Expected |
|-------|----------|
| pipeline.py | Comment above CURSOR_IMPLEMENTATION: "canonical display name: GATE_3_IMPL (rename pending — separate WP in S003)" |

### C.5 — WAITING_GATE2_APPROVAL Engine

| Check | Expected |
|-------|----------|
| engine | "codex" (not "human") |
| Option applied | A (state retained) |

---

## §3 Regression

- Dashboard loads at http://localhost:8090/static/PIPELINE_DASHBOARD.html
- Roadmap loads; no JS errors
- Teams page loads; dual-domain rows

---

## §4 Output Report

**Path:** `_COMMUNICATION/team_51/TEAM_51_S002_P005_WP004_QA_REPORT_v1.0.0.md`

---

**log_entry | TEAM_61 | WP004_QA_REQUEST | SUBMITTED | 2026-03-17**
