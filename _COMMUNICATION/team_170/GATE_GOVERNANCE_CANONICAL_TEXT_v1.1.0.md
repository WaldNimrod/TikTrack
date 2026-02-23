# GATE_GOVERNANCE_CANONICAL_TEXT v1.1.0

**project_domain:** SHARED  
**from:** Team 170  
**to:** Team 190  
**mandate:** TEAM_190_TO_TEAM_170_GATE_GOVERNANCE_REALIGNMENT_WORK_PACKAGE_v1.1.0  
**date:** 2026-02-23  

---

## 1) Canonical gate table (final wording)

| gate_id | gate_label | owner |
|---------|------------|-------|
| GATE_0 | SPEC_ARC (LOD 200) | Team 190 |
| GATE_1 | SPEC_LOCK (LOD 400) | Team 190 |
| GATE_2 | ARCHITECTURAL_SPEC_VALIDATION | Team 190 |
| GATE_3 | IMPLEMENTATION | Team 10 |
| GATE_4 | QA | Team 10 |
| GATE_5 | DEV_VALIDATION | Team 90 |
| GATE_6 | ARCHITECTURAL_DEV_VALIDATION | Team 90 |
| GATE_7 | HUMAN_UX_APPROVAL | Team 90 |
| GATE_8 | DOCUMENTATION_CLOSURE (AS_MADE_LOCK) | Team 90 |

---

## 2) Identity header — gate_id

**Allowed values:** GATE_0, GATE_1, GATE_2, GATE_3, GATE_4, GATE_5, GATE_6, GATE_7, GATE_8 only. **No PRE_GATE_3.** Work-plan validation before implementation is inside GATE_3 (sub-stage G3.5).

---

## 3) WSM ownership (canonical sentence)

Gates 0–2: Team 190 updates WSM. Gates 3–4: Team 10 updates WSM. Gates 5–8: Team 90 updates WSM.

---

## 4) GATE_6 rejection (canonical sentence)

On GATE_6 non-PASS: route DOC_ONLY_LOOP (Team 90 updates docs and resubmits) or CODE_CHANGE_REQUIRED (Team 90 returns remediation to Team 10; flow returns to GATE_3). If route unclear, escalate to Team 00 (Nimrod).

---

**log_entry | TEAM_170 | GATE_GOVERNANCE_CANONICAL_TEXT | v1.1.0 | 2026-02-23**
