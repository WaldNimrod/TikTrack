---
id: TEAM_61_AGENTS_OS_UI_BROWSER_TEST_MATRIX_v1.0.0
from: Team 61 (Cloud Agent / DevOps Automation)
to: Team 51, Nimrod (browser evidence completion)
cc: Team 100, Team 190
date: 2026-03-14
status: TEMPLATE_READY
in_response_to: AOUI-IMP-ACT-02
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| task_id | AGENTS_OS_UI_OPTIMIZATION |
| decision | BROWSER_MATRIX_TEMPLATE |

---

## 1) Purpose

Template for completing browser-only AC verification (AOUI-IMP-ACT-02). Per Team 190 validation result v1.1.0, these items must be closed with evidence before Team 100 final architectural sign-off.

**Test environment:** `python3 -m http.server 8090` from repo root → http://127.0.0.1:8090/agents_os/ui/

---

## 2) Browser Test Matrix

| AC | Criterion | Evidence Type | Status | Screenshot/Notes |
|----|-----------|---------------|--------|------------------|
| AC-01 | Yellow `state-exception` banner when AUTHORIZED_EXCEPTION for S001-P002 | Screenshot | ⬜ PENDING | |
| AC-02 | Red `state-blocking` banner when stage CLOSED, no exception | Screenshot | ⬜ PENDING | |
| AC-03 | Domain switch loads domain-specific state file | Network tab | ⬜ PENDING | pipeline_state_tiktrack.json or pipeline_state_agentsos.json |
| AC-04 | LEGACY_FALLBACK badge when fallback used | Screenshot + manual test | ⬜ PENDING | Rename domain file, verify badge |
| AC-05 | All 3 pages identical header structure | Screenshot bundle | ✅ DONE | (post-remediation) |
| AC-06 | Dashboard + Roadmap: agents-page-layout, 300px sidebar | CSS/DOM | ✅ DONE | (post-remediation) |
| AC-07 | Roadmap: program click → detail in sidebar | Click test + screenshot | ⬜ PENDING | |
| AC-08 | Roadmap: main column structure | DOM inspection | ⬜ PENDING | (see NOTE-01 for clarification) |
| AC-09 | No inline `<style>` | Code review | ✅ DONE | |
| AC-10 | No inline `<script>` | Code review | ✅ DONE | |
| AC-11 | Dashboard: health panel renders | Test + screenshot | ⬜ PENDING | With missing STATE_SNAPSHOT |
| AC-12 | Mandate accordion visibility at GATE_1 vs mandate gate | Test | ⬜ PENDING | |
| AC-13 | Full smoke: all 3 pages, domain switch, core flows | Smoke test | ⬜ PENDING | |

---

## 3) Instructions for Completion

1. Open each page in browser; run tests per AC.
2. Mark status: ✅ PASS / ❌ FAIL.
3. Attach screenshots or paste network tab snippets where required.
4. Update this file and route to Team 51 for QA report update.
5. Team 51 includes evidence in re-submission to Team 190 / Team 100.

---

## 4) Closure Path

- **Owner:** Nimrod (browser verification) + Team 51 (evidence packaging)
- **Trigger:** Before Team 100 final approval
- **Output:** Updated QA report with browser matrix PASS for all items

---

**log_entry | TEAM_61 | BROWSER_MATRIX_TEMPLATE | AOUI_IMP_ACT02 | 2026-03-15**
