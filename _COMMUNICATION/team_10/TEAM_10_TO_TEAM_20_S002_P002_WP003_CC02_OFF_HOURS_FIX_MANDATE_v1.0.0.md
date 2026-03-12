

# Team 10 → Team 20 | S002-P002-WP003 CC-02 — מנדט תיקון off-hours (≤2 Yahoo)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_20_S002_P002_WP003_CC02_OFF_HOURS_FIX_MANDATE  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 20 (Backend Implementation)  
**cc:** Team 60, Team 50, Team 90  
**date:** 2026-03-12  
**historical_record:** true
**status:** MANDATE_ACTIVE  
**authority:** TEAM_10_S002_P002_WP003_GATE7_PARTA_PRE_SUBMISSION_ASSESSMENT_v1.0.0  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP003 |
| gate_id | GATE_7 Part A |
| phase_owner | Team 90 |

---

## 1) תפקידכם

**CC-WP003-02:** במצב off-hours — מספר קריאות HTTP ל־Yahoo באותו מחזור sync ≤ **2**.

**מצב נוכחי:** evidence v2.0.4 — 4 קריאות Yahoo ב־off-hours → **FAIL**.

---

## 2) דרישה

ב־**off-hours** (שעות סגירת שוק) — הגבלת קריאות Yahoo ל־**מקסימום 2** במחזור sync אחד.

**אפשרויות יישום (לבחירתכם):**
- דילוג על Yahoo market status ב־off-hours — שימוש ב־Alpha Vantage או cache
- הגבלה מפורשת: אם mode=off_hours ויש כבר 2 Yahoo calls — אין קריאות נוספות
- Batching / coalescing כך ש־2 קריאות מכסות את הצורך

---

## 3) תנאי הצלחה

- הרצת `verify_g7_part_a_runtime.py` עם `G7_PART_A_MODE=off_hours` — `cc_02_yahoo_call_count ≤ 2` → `pass_02=true`

---

## 4) דליברבל

**נתיב:**  
`_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P002_WP003_CC02_OFF_HOURS_FIX_COMPLETION.md`

**תוכן:** תיאור השינוי; קבצים ששונו; אימות מקומי (אם בוצע).

---

## 5) תיאום

לאחר השלמה — Team 60 יריץ evidence חוזר (Run B off-hours); Team 50 corroboration v2.0.5.

---

**log_entry | TEAM_10 | WP003_CC02_OFF_HOURS_FIX_MANDATE | TO_TEAM_20 | MANDATE_ACTIVE | 2026-03-12**
