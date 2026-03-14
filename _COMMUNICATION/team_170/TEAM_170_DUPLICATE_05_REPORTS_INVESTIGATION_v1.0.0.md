# TEAM 170 — חקירת תיקיות דוחות כפולות (05-REPORTS)
## Document: TEAM_170_DUPLICATE_05_REPORTS_INVESTIGATION_v1.0.0.md

**From:** Team 170 (Governance Spec / Documentation)
**To:** Team 10 (Gateway); Team 190 (Constitutional Validator)
**date:** 2026-02-19
**historical_record:** true
**purpose:** תיעוד חקירה — מי יצר תיקיות דוחות כפולות, מדוע, ומניעת recurrence כחלק מתוכנית אופציה C

---

## 1. מצב נתיבים (ממצאים)

| מיקום | סטטוס | הערה |
|--------|--------|------|
| `documentation/reports/05-REPORTS` | **קנוני** | מופיע ב־00_MASTER_INDEX.md; Model B (Team 70 draft). |
| `documentation/05-REPORTS` | **כפול** | בשורש documentation; כ־25 קבצים (artifacts, logs). |
| `05-REPORTS` (שורש repo) | **כפול** | בתיקיית שורש; artifacts, SESSION_WP003 וכו'. |

**מסקנה:** הנתיב הקנוני היחיד המחייב הוא `documentation/reports/` עם תת־תיקיות `05-REPORTS`, `08-REPORTS`. שני המיקומים הנוספים הם סטייה מהקנון.

---

## 2. סיבת היווצרות (חקירה)

- **00_MASTER_INDEX.md:** מגדיר במפורש `documentation/reports/` | 05-REPORTS, 08-REPORTS. לא מפנה ל־`documentation/05-REPORTS`.
- **TEAM_70_MASTER_INDEX_ALIGNMENT_DRAFT:** מאשר Model B — `documentation/reports/` | 05-REPORTS, 08-REPORTS.
- **הפניות בפרויקט:** קיימות הפניות **לשני** הנתיבים:
  - נהלים והודעות צוותים (ארכיון ו־פעיל) מפנים ל־`documentation/05-REPORTS/artifacts...` (ללא "reports/").
  - קבצי **tests/** (gate-b-e2e.test.js, phase1-completion-b-validation.test.js, flow-type-ssot-e2e.test.js) משתמשים בנתיב `documentation/05-REPORTS`.
- **השערה:** ייתכן שנהלים או פרומפטים ישנים (לפני Lock של Model B) ציוו על כתיבה ל־`documentation/05-REPORTS` או ל־`05-REPORTS` בשורש; או שצוותים השתמשו בנתיב מקוצר. אין מסמך יחיד שמזהה "צוות X יצר את התיקייה" — מדובר בהצטברות הפניות לא־קנוניות.
- **תיקיית שורש 05-REPORTS:** ככל הנראה נוצרה כתוצאה מריצות אוטומטיות/סקריפטים או הוראות שציינו נתיב יחסי מהשורש.

---

## 3. מניעת recurrence

- **תיעוד מחייב:** לעדכן את `00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL_v1.0.0.md` (ובהתאם 00_MASTER_INDEX) כך שיופיע במפורש:
  - **נתיב קבוע לארטיפקטים ודוחות:** רק `documentation/reports/05-REPORTS`, `documentation/reports/08-REPORTS`.
  - **איסור:** אסור ליצור או להשתמש ב־`documentation/05-REPORTS`, `documentation/08-REPORTS` (בשורש documentation), או ב־`05-REPORTS`/`08-REPORTS` בשורש ה־repo.
- **נהלים ופרומפטים:** לוודא שכל נהלי כתיבת דוחות/ארטיפקטים (כולל ב־_COMMUNICATION/agents_os, נהלי צוותים) מפנים לנתיב הקנוני בלבד.
- **קוד:** עדכון קבצי tests וסקריפטים לנתיב הקנוני — באמצעות **בקשה ל־Team 10** (מנדט תיקון).

---

## 4. פעולות המשך (מתוך תוכנית אופציה C)

- ארכיון תוכן `documentation/05-REPORTS/` ל־`archive/documentation_legacy/duplicate_05_REPORTS_<date>/` + MANIFEST.
- ארכיון תוכן `05-REPORTS/` (שורש) ל־`archive/documentation_legacy/root_05_REPORTS_<date>/` + MANIFEST (או לאיחוד עם duplicate_05_REPORTS לפי החלטת Team 10).
- עדכון כל ההפניות הידועות בתיעוד וב־_COMMUNICATION לנתיב הקנוני.
- בקשה ל־Team 10: תיקון נתיבים ב־tests/ וסקריפטים.

---

**log_entry | TEAM_170 | DUPLICATE_05_REPORTS_INVESTIGATION | DELIVERED | 2026-02-19**
