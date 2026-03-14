# Architect Directive — Roadmap Validator Mandate
## ARCHITECT_DIRECTIVE_ROADMAP_VALIDATOR_MANDATE_v1.0.0

**from:** Team 00 (Chief Architect)
**date:** 2026-03-14
**status:** LOCKED — MANDATE TO TEAM 190 + TEAM 170
**trigger:** Post-mortem of S001-P002-WP001 GATE_0 BLOCK (G0-BF-02 + G0-BF-03) — systemic gap identified

---

## 1. Architectural Finding

During GATE_0 for S001-P002-WP001, Team 190 correctly blocked the intake citing:
- G0-BF-02: Program S001-P002 was DEFERRED (not ACTIVE) in Program Registry
- G0-BF-03: WP S001-P002-WP001 was not registered in Work Package Registry

**Root cause of the gap:** The PIPELINE_ROADMAP.html page was designed to be a full validator of roadmap integrity, but currently provides NO structural validation of the registry layer. The system had the data to catch these issues proactively but did not surface them.

**Impact:** Nimrod (Team 00) only discovered the governance issue when Team 190 blocked GATE_0 — AFTER the pipeline was already configured and GATE_0 was attempted. The issue should have been visible and alerted BEFORE any gate attempt.

**Original design intent (stated by Team 00):** "כל המטרה הראשונית של עמוד המפה הוא להוות ולידטור לתקינות מלאה של מבנה מפת הדרכים וכל התוכניות עבודה היושבות מתחתיה במבנה היררכי." — The whole original purpose of the roadmap page is to be a validator of the full integrity of the roadmap structure and all work packages beneath it in hierarchical structure.

---

## 2. Governance Pre-Check — Partial Fix (Applied 2026-03-14)

As an immediate mitigation, `pipeline.py` now implements `_check_governance_precheck()`:
- Blocks GATE_0 prompt generation if Program is not ACTIVE/PIPELINE in registry
- Blocks GATE_0 prompt generation if WP is not in WP Registry
- Displays clear, actionable error with fix instructions

**Status:** IMPLEMENTED — in `agents_os_v2/orchestrator/pipeline.py`

This catches the issue at pipeline invocation time. But it does NOT provide proactive visibility — you have to attempt to generate a GATE_0 prompt to discover the issue.

---

## 3. Mandate — PIPELINE_ROADMAP.html Integrity Validator

### M1 — Registry Compliance Panel (Team 170)

Add a **"Registry Health"** section to `PIPELINE_ROADMAP.html` that reads:
- `PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`
- `PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md`

And displays for each program in the portfolio:

| Check | Pass | Fail |
|---|---|---|
| Program in Program Registry | ✅ ACTIVE | ❌ DEFERRED / NOT FOUND |
| WP registered in WP Registry | ✅ IN_PROGRESS | ❌ MISSING |
| Program/WP status consistent | ✅ | ❌ |

**Visual indicator:** Red badge count "N issues" on the Roadmap nav link if any violations found.

### M2 — Pre-GATE_0 Alert (Team 190 validation)

Before Team 190 receives any GATE_0 package, validate:
1. Source program is ACTIVE in registry → alert if not
2. Source WP is registered → alert if not
3. Flag count shown clearly in GATE_0 prompt header

**Already partially done** in `pipeline.py`. Team 190 mandate: include registry status check in own validation checklist.

### M3 — WSM Drift Detection (Team 190)

Cross-reference `pipeline_state_tiktrack.json` stage_id vs WSM `active_stage_id`. If mismatch, check for activation directive. If no directive found, flag as potential governance issue.

**Already partially done** via `wsm_stage_watch` in S002-P005 R2.

---

## 4. Assignment

| Team | Task | Priority |
|---|---|---|
| **Team 170** | Implement M1 Registry Health panel in `PIPELINE_ROADMAP.html` | P1 (S003 era) |
| **Team 190** | Add registry compliance check to GATE_0 validation checklist per M2 | P0 (immediate — update checklist) |
| **Team 190** | Include M3 WSM drift detection in GATE_0 output | P1 (part of S002-P005) |

---

## 5. Iron Rule (Established)

> **GATE_0 may not be issued or accepted without confirmed Program Registry ACTIVE status AND confirmed WP Registration.** No exceptions. Team 190 GATE_0 checklist must include both checks as mandatory line items.

This rule is enforced at two levels:
1. `pipeline.py` `_check_governance_precheck()` — blocks prompt generation
2. Team 190 constitutional validation — blocks GATE_0 PASS

---

**log_entry | TEAM_00 | ROADMAP_VALIDATOR_MANDATE | ISSUED | G0_BF_02_G0_BF_03_POST_MORTEM | PIPELINE_PRECHECK_APPLIED | 2026-03-14**
