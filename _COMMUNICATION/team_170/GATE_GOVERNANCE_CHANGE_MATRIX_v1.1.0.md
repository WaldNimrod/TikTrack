# GATE_GOVERNANCE_CHANGE_MATRIX v1.1.0

**project_domain:** SHARED  
**from:** Team 170  
**to:** Team 190  
**mandate:** TEAM_190_TO_TEAM_170_GATE_GOVERNANCE_REALIGNMENT_WORK_PACKAGE_v1.1.0  
**date:** 2026-02-23  

---

## 1) File-by-file before/after

| File | Before | After |
|------|--------|-------|
| 04_GATE_MODEL_PROTOCOL_v2.3.0.md | Gate table: GATE_2 KNOWLEDGE_PROMOTION (190+70 executor); GATE_4 QA Team 50; GATE_6/7/8 Team 190 or Nimrod/70. §6.1 PRE_GATE_3 + GATE_5. gate_id schema allowed PRE_GATE_3. | Gate table: GATE_0 SPEC_ARC, GATE_1 SPEC_LOCK, GATE_2 ARCHITECTURAL_SPEC_VALIDATION (190); GATE_3 IMPLEMENTATION (10); GATE_4 QA (10); GATE_5 DEV_VALIDATION (90); GATE_6 ARCHITECTURAL_DEV_VALIDATION (90); GATE_7 HUMAN_UX_APPROVAL (90); GATE_8 DOCUMENTATION_CLOSURE (90). PRE_GATE_3 removed. §6.1 replaced by GATE_3 sub-stages ref (G3.5 = validation with Team 90). gate_id = GATE_0..GATE_8 only. |
| PHOENIX_MASTER_SSM_v1.0.0.md | Gate authority refs as above. | Align to new gate table and owners; no PRE_GATE_3. |
| PHOENIX_MASTER_WSM_v1.0.0.md | GATE_8 Owner Team 190, Executor 70; GATE_6 opening by Architect+Team 100/00. | WSM ownership matrix 0-2/3-4/5-8; GATE_6/7/8 owner Team 90; path 90_Architects_comunication deprecated. |
| TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md | PRE_GATE_3 section; GATE_3 entry "PRE_GATE_3 PASS"; GATE_4 QA "Team 50"; GATE_6/7/8 "Team 190" or "Update on closure". | PRE_GATE_3 section removed. GATE_3 entry = G3.1..G3.9; G3.5 = Team 90 validation. GATE_4 owner Team 10 (QA handover). GATE_6/7/8 owner Team 90; WSM by Team 90. GATE_6 rejection protocol ref. |
| CHANNEL_10_90_CANONICAL_CONFIRMATION_v1.0.0.md | (As-is or minor) | Align to GATE_6/7/8 owner Team 90; submission path _ARCHITECT_INBOX. |
| TEAM_10_S001_P001_WP002_* (WP def, prompts, execution) | Any PRE_GATE_3 or old gate owner refs. | Remove PRE_GATE_3; align to new owners and G3.x where referenced. |
| TEAM_10_TO_TEAM_190_S001_P001_WP002_GATE6_SUBMISSION.md | To: Team 190. | Recipient realignment: GATE_6 owner = Team 90; submission to Team 90 (or to _ARCHITECT_INBOX per process). Path deprecation note. |

---

## 2) Cross-cutting

- **PRE_GATE_3:** Removed from all active artifacts; replaced by GATE_3 sub-stage G3.5.
- **WSM updater:** Single matrix (0-2 Team 190, 3-4 Team 10, 5-8 Team 90) applied in SSM, WSM, runbook.
- **90_Architects_comunication:** Deprecated; active refs → _ARCHITECT_INBOX, _Architects_Decisions.

---

**log_entry | TEAM_170 | GATE_GOVERNANCE_CHANGE_MATRIX | v1.1.0 | 2026-02-23**
