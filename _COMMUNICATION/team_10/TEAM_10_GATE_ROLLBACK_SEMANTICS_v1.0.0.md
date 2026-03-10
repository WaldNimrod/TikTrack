# Team 10 | Gate Rollback Semantics — Governance Clarification

**project_domain:** SHARED  
**id:** TEAM_10_GATE_ROLLBACK_SEMANTICS_v1.0.0  
**from:** Team 10 (Gateway Orchestration)  
**date:** 2026-03-10  
**status:** LOCKED  
**authority:** GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.0.0 §4  

---

## 1) Rule (חובה)

**כאשר בדיקת QA בשער מסוים (למשל GATE_7) נפסלת (BLOCK) — השער חוזר אוטומטית לתהליך הפיתוח.**

- Team 50 מקבל חבילה **במסגרת** GATE_7 (לצורכי QA לפני הגשה לאדם).
- אם Team 50 מחזיר **BLOCK** — החבילה **אינה** נשארת "בשער 7".
- החבילה **חוזרת** ל־**GATE_3 (REMEDIATION)** — flow returns to development.

**מקור:** `GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.0.0` §4:  
> `CODE_CHANGE_REQUIRED`: Team 90 returns remediation package to Team 10; **flow returns to GATE_3**.

---

## 2) מסמכים ומיתוג

| מצב | תיאור נכון | תיאור שגוי |
|-----|-------------|------------|
| חבילה נכשלה ב-QA | **GATE_3 REMEDIATION**; BLOCK @ GATE_7 | "נמצאים בשער 7" |
| מסמכי תיקון | "remediation for GATE_7" / "GATE_7_REMEDIATION" | "GATE_7" כמצב נוכחי |
| WSM active_flow | GATE_3 REMEDIATION; BLOCK @ GATE_7 → returned to dev | GATE_7 R2 / GATE_7 פעיל |
| current_gate | GATE_3 | GATE_7 |

**עקרון:** מסמכי תיקון יכולים להתייחס ל-**מטרה** (לעבור GATE_7), אך **המצב המבצעי** הוא תמיד GATE_3 עד ש־re-submit ו־GATE_7 PASS.

---

## 3) Flow

```
GATE_3 (remediation) → Team 60/20/30 fix → Team 50 QA → PASS?
  → re-submit to GATE_7 (Team 90) → human approval
  → BLOCK? → חזרה ל־GATE_3
```

---

**log_entry | TEAM_10 | GATE_ROLLBACK_SEMANTICS | LOCKED | 2026-03-11**
