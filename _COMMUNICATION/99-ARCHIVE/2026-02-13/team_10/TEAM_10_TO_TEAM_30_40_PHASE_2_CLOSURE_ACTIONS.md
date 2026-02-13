# 📋 Team 10 → Team 30 & Team 40: הכנות וביצוע מיידי — סגירת Phase 2

**אל:** Team 30 (Frontend), Team 40 (UI Assets & Design)  
**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-09  
**נושא:** ביצוע מיידי — שלב 1 (Debt Closure) תחת SLA 30/40 + איסוף מידע נדרש  
**מקור:** ADR-010, תוכנית סגירה `documentation/00-MANAGEMENT/TT2_PHASE_2_CLOSURE_WORK_PLAN.md`, `documentation/05-PROCEDURES/TT2_SLA_TEAMS_30_40.md`

---

## 🎯 המשימות שלכם (שלב 1 — יחידה אחת תחת SLA 30/40)

| # | משימה | תוצר מצופה |
|---|--------|-------------|
| **1.3.1** | Retrofit רספונסיביות (Option D): Sticky Start/End + Fluid Weights (clamp) — לכל עמודי Phase 2 (D16, D18, D21) | CSS/מבנה טבלאות מעודכן |
| **1.3.2** | ניקוי מוחלט של `console.log` ומעבר ל-audit/maskedLog (לפי ההחלטה שתתקבל) | אין console.log חשוף; לוגים לפי מפרט |
| **1.3.3** | הקשחת טרנספורמרים: מניעת NaN ו-Undefined בטבלאות | transformers.js + null-safety |

---

## 📤 נדרש מכם — איסוף מידע להשלמת מפרט (ללא ניחושים)

החזירו את המידע הבא **בתיקיית הצוות שלכם** (`_COMMUNICATION/team_30/` או `_COMMUNICATION/team_40/`), או עדכון SSOT אם קיים. חלק מהנקודות תלויות בהחלטת אדריכלית — עד אז תעדכנו לפי מה שכן ברור.

### 1.3.1 — Option D (רספונסיביות)

- **מיפוי נוכחי:** אילו קבצי CSS/מבנה אחראים לכל טבלה ב-D16, D18, D21 (נתיב קובץ + class/קומפוננט).
- **עמודות:** איזו עמודה היום "מזהה" (Sticky Start) ואיזו "פעולות" (Sticky End) — לפי עמוד ו-id טבלה, אם כבר מוגדר בקוד.
- **חסרים:** מה חסר לכם כדי ליישם clamp() ו-Sticky במדויק (טווחים? דוגמאות?) — לרישום ולשאילתה לאדריכלית אם יידרש.

### 1.3.2 — לוגים (console.log → audit/maskedLog)

- **מצב נוכחי:** באילו תיקיות/קבצים יש עדיין `console.log` (רשימת נתיבים או globs). איפה כבר משתמשים ב-`maskedLog` או ב-`audit` (מ-`maskedLog.js` / `audit.js`).
- **חסר החלטה:** בפרויקט קיימים `maskedLog.js` ו-`audit.js`. נדרשת החלטת אדריכלית: חובה על `audit.maskedLog` או על `maskedLog`/`maskedLogWithTimestamp` מ-`maskedLog.js`? Scope (רק `ui/src`? tests? config?). עד לקבלת ההחלטה — לא לשנות לוגים בצורה סותרת.

### 1.3.3 — טרנספורמרים

- **מיפוי נוכחי:** אילו פונקציות ב-`transformers.js` (או קובץ רלוונטי אחר) מטפלות באילו שדות — לכל עמוד D16, D18, D21 (שם פונקציה ↔ שדות/response).
- **שדות כספיים/מספריים:** רשימת שדות שאסור שיופיעו כ-NaN או undefined ב-DOM (לפי העמודים הנ"ל).
- **התנהגות רצויה:** כשערך חסר — null או 0? פורמט מספר (עיגול, precision) אם כבר מוגדר ב-SSOT.

---

## ⏱️ ביצוע

- התחילו במשימות 1.3.1 ו-1.3.3 לפי המפרט הקיים; אספו את המידע למעלה והחזירו בתיקיית הצוות.
- לגבי 1.3.2 — לאחר שתתקבל החלטת אדריכלית (תועבר אליכם דרך צוות 10), בצעו את הניקוי והמעבר בהתאם.

---

**תוכנית מלאה:** `documentation/00-MANAGEMENT/TT2_PHASE_2_CLOSURE_WORK_PLAN.md`  
**SLA 30/40:** `documentation/05-PROCEDURES/TT2_SLA_TEAMS_30_40.md`  
**רשימת השלמות מידע:** `documentation/00-MANAGEMENT/TT2_PHASE_2_CLOSURE_TASK_SPEC_SUPPLEMENT_REQUEST.md`
