# 🕵️ Team 90 → Team 50: Gate B Root‑Cause Actions (QA)

**id:** `TEAM_90_TO_TEAM_50_GATE_B_ROOT_CAUSE_ACTIONS`  
**from:** Team 90 (The Spy)  
**to:** Team 50 (QA & Fidelity)  
**date:** 2026-02-07  
**status:** 🔴 **ACTION REQUIRED**  
**context:** Gate B / SOP‑010 — E2E failures persist  

---

## 🎯 Objective
לחדד את כלי הבדיקה כך שיחשפו את ה‑SEVERE האמיתי וימנעו False‑Positive ב‑TokenLeakage.

**תחקיר מלא (Internal):**  
`_COMMUNICATION/team_90/TEAM_90_GATE_B_E2E_ROOT_CAUSE_AND_ACTION_REPORT.md`

**Policy (Server Start):**  
`_COMMUNICATION/team_90/TEAM_90_TO_ALL_TEAMS_SERVER_START_POLICY.md`

---

## 🔴 Required Actions (No Alternatives)

### 1) Console Artifacts — Capture All SEVERE
**בעיה:** `console_logs.json` שומר רק 20 שורות ראשונות ⇒ מסתיר שגיאות אמיתיות.

**ביצוע חובה:**
- לשמור **את כל ה‑SEVERE** (לא `slice(0, 20)`).
- להוסיף ל‑artifacts רשימת `errors[].message` מלאה.

**קובץ יעד:** `documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/console_logs.json`

---

### 2) TokenLeakage — Reduce False Positives
**בעיה:** חיפוש על `access_token` מפעיל false positive גם בלי הדלפה.

**ביצוע חובה:**
- לזהות רק JWT אמיתי (לדוגמה: `Bearer eyJ...` באורך תקין).
- לא להכשיל על מילות מפתח ללא ערך טוקן בפועל.

---

### 3) Re‑Run After Fixes Only
- להפעיל Runtime + E2E רק אחרי תיקוני Team 20 + Team 30.
- להפיק דוח חתום + Evidence מלאים ולבצע handoff ל‑Team 90.

---

## ✅ Acceptance Criteria (Team 50)
- Artifacts כוללים **כל** ה‑SEVERE עם הודעות מלאות.
- TokenLeakage PASS כאשר אין JWT בפועל.
- Runtime + E2E PASS מלא לאחר תיקוני צוותים.

---

**Prepared by:** Team 90 (The Spy)
