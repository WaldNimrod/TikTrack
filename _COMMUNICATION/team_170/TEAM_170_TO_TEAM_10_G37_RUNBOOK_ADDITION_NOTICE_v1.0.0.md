# TEAM_170 → TEAM_10 | G3.7 Runbook Addition Notice v1.0.0

**project_domain:** SHARED (AGENTS_OS + TIKTRACK)  
**id:** TEAM_170_TO_TEAM_10_G37_RUNBOOK_ADDITION_NOTICE_v1.0.0  
**from:** Team 170 (Governance — FAST_4 closure)  
**to:** Team 10 (Gateway)  
**cc:** Team 100  
**date:** 2026-03-12  
**status:** INFORMATIONAL — הודעת מודעות בלבד (per FAST_0 §11 item 3)  
**in_context_of:** S003-P002 WP001 FAST_4 closure (AGENTS_OS); צוות 10 לא מעורב במסלול המהיר  
**authority:** _COMMUNICATION/team_100/TEAM_100_S003_P002_WP001_FAST0_SCOPE_BRIEF_v1.0.0.md §11 item 3 — "Notifies Team 10 of G3.7 addition to their GATE_3 runbook"  

---

## 1) Purpose

This notice fulfills **FAST_0 §11 item 3**: Team 170 notifies Team 10 of the **G3.7 addition to the GATE_3 runbook**. It is an **awareness notice** only — Team 10 is not involved in the AGENTS_OS fast-track execution; when you run GATE_3 (e.g. for TIKTRACK or hybrid flows), the runbook now includes G3.7.

---

## 2) What Was Added to Your Runbook

**File:** `documentation/docs-governance/04-PROCEDURES/TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md`

- **G3.7 (Test Template Generation)** — placement: **after G3.5**, **before G3.6**.
- **AGENTS_OS sequence:** G3.1 → G3.2 → G3.3 → G3.4 → G3.5 → **G3.7** → G3.6 → G3.8 → G3.9.
- **Action:** Run `generate_test_templates` on spec; outputs in `tests/api/` and `tests/ui/`; **TT-00 BLOCK** when required spec section is empty.
- **Source:** `agents_os_v2/orchestrator/gate_router.py` — `run_g3_7_test_template_generation()`.
- **Canonical dependency:** `agents_os_v2/requirements.txt` (Jinja2>=3.1.0,<4.0).

When S003-P003 (System Settings, TIKTRACK) or other WPs reach GATE_3, Team 10 may use G3.7 to generate test scaffolds as part of the pipeline.

---

## 3) Action Required

None. Use the runbook as the single operational source for GATE_3 when orchestrating; G3.7 is now part of the documented sequence where applicable.

---

**log_entry | TEAM_170 | G37_RUNBOOK_ADDITION_NOTICE | TO_TEAM_10_PER_FAST0_S11 | 2026-03-12**
