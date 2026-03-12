# Team 10 → Team 30 | D40 Background Jobs History — מנדט תיקון ReferenceError

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_30_D40_BACKGROUND_JOBS_HISTORY_REFERENCEERROR_FIX_MANDATE_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 30 (Frontend Implementation)  
**cc:** Team 50, Team 90, Team 190  
**date:** 2026-03-12  
**historical_record:** true  
**status:** ACTION_REQUIRED  
**gate_id:** GATE_7_REMEDIATION_LANE  
**program_id:** S002-P002  
**work_package_id:** S002-P002-WP003  
**scope:** URGENT_BUGFIX_CYCLE_2026-03-12_D40_HISTORY_TOGGLE  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| bug_id | KB-2026-03-12-24 |
| cycle_id | URGENT_BUGFIX_CYCLE_2026-03-12_D40_HISTORY_TOGGLE |
| severity | BLOCKING |
| remediation_mode | IMMEDIATE |

---

## 1) הקשר

חבילת WP003 עברה ולידציה. סריקת קוד יומית זיהתה באג חוסם — מועבר למסלול תיקון מהיר.

**מקור:** TEAM_190_TO_TEAM_10_HANDOFF_PROMPT_KB_2026_03_12_24_v1.0.0

---

## 2) פרטי הבאג (locked)

| פריט | ערך |
|------|-----|
| **bug_id** | KB-2026-03-12-24 |
| **file** | `ui/src/views/management/systemManagement/systemManagementBackgroundJobsInit.js` |
| **defect** | runtime ReferenceError — `items is not defined` ב־history toggle |
| **root_cause** | `items` מוצהר בתוך `try` ומופנה מחוץ ל־`catch` |

---

## 3) תיקון נדרש (מינימלי ובטוח)

1. **Hoist:** `let items = [];` לפני `try`
2. **Assign:** `items = res?.items ?? [];` בתוך `try`
3. **התנהגות:** שמור success/failure rendering ללא שינוי
4. **אין refactors** מחוץ להיקף הבאג

---

## 4) אימות מקומי חובה

1. `node --check ui/src/views/management/systemManagement/systemManagementBackgroundJobsInit.js`
2. **Path A:** history נפתח עם API success; כפתור מתעדכן
3. **Path B:** API failure מציג הודעת שגיאה ללא JS exception

---

## 5) דליברבל נדרש

**נתיב:**  
`_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_S002_P002_WP003_KB_2026_03_12_24_FIX_COMPLETION_v1.0.0.md`

**תוכן חובה:** שורות ששונו; פקודות אימות; הצהרת PASS/FAIL סופית.

---

**log_entry | TEAM_10 | TO_TEAM_30 | D40_REFERENCEERROR_FIX_MANDATE | KB_2026_03_12_24 | ACTION_REQUIRED | 2026-03-12**
