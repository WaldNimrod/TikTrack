# Team 10 → Team 20 / Team 170: דרישת תיקון — GATE_4 (S002-P001-WP001)

**project_domain:** AGENTS_OS  
**id:** TEAM_10_TO_TEAM_20_170_S002_P001_WP001_GATE4_REMEDIATION_REQUIRED  
**from:** Team 10 (The Gateway)  
**to:** Team 20 (Backend), Team 170 (Spec Owner)  
**date:** 2026-02-25  
**status:** ACTION_REQUIRED  
**gate_id:** GATE_4  
**work_package_id:** S002-P001-WP001  
**trigger:** TEAM_50_TO_TEAM_10_S002_P001_WP001_QA_REPORT — validation_runner: 42 passed, 2 failed על LLD400  

---

## 1) מדיניות (דרישת Visionary)

**אין מעבר לשלב ולידציה (GATE_5) בלי שכל הבדיקות של צוות 50 עוברות ירוק ב־100%.** זו הדרישה בכל תוצאת בדיקה. דוח QA הנוכחי מציין 2 בדיקות נכשלות — יש לתקן עד 44/44 ירוק.

---

## 2) מה נדרש

- **תיקון:** כך ש־`python3 -m agents_os.orchestrator.validation_runner _COMMUNICATION/team_170/AGENTS_OS_CORE_VALIDATION_ENGINE_LLD400_v1.0.0.md` יניב **44/44 passed** (0 failed).
- **אחריות:** ייתכן שהכשלון בקריטריונים של ה־validator (למשל שדות/מבנה ב־LLD400) או בתצורת ה־validator עצמו — Team 20 (קוד) ו/או Team 170 (מסמך LLD400) לפי שורש הכשל.
- **לאחר תיקון:** הרצת QA מחדש (Team 50); רק כאשר כל הבדיקות 100% ירוק — Team 10 יעדכן WSM ויעביר ל־GATE_5.

---

## 3) רפרנסים

- דוח QA: _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S002_P001_WP001_QA_REPORT.md (§5.2 — תרחיש 2)
- מפרט: _COMMUNICATION/team_170/AGENTS_OS_CORE_VALIDATION_ENGINE_LLD400_v1.0.0.md (§2.5, §2.6, §7)
- דוח השלמה קוד: _COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P001_WP001_COMPLETION_REPORT.md

---

**log_entry | TEAM_10 | TO_TEAM_20_170 | S002_P001_WP001_GATE4_REMEDIATION_REQUIRED | 2026-02-25**
