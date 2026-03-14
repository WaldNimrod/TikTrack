# TEAM 170 → Team 10: בקשה לתיקון נתיבי ארטיפקטים (קנון דוחות)
## Document: TEAM_170_TO_TEAM_10_ARTIFACTS_PATH_CANONICAL_REQUEST_v1.0.0.md

**From:** Team 170 (Governance Spec / Documentation)
**To:** Team 10 (Gateway)
**date:** 2026-02-19
**purpose:** בקשה למנדט/תיקון — עדכון נתיבי ארטיפקטים ודוחות בקבצי tests וסקריפטים לנתיב הקנוני היחיד

---

## 1. רקע

כחלק מתוכנית **אופציה C — ספריית תיעוד Agents_OS** (נעילת מבנה תיקיות, ניקוי דוחות כפולים), הנתיב הקנוני היחיד לדוחות וארטיפקטים הוא:

- **`documentation/reports/05-REPORTS`** (ותת־תיקיות: artifacts, artifacts_SESSION_01 וכו')
- **`documentation/reports/08-REPORTS`**

(מקור: 00_MASTER_INDEX.md, TEAM_70_MASTER_INDEX_ALIGNMENT_DRAFT, 00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL.)

כל שימוש ב־`documentation/05-REPORTS` (ללא "reports/") או ב־`05-REPORTS` בשורש ה־repo הוא לא־קנוני ויופסק לאחר ארכיון התוכן הכפול.

---

## 2. קבצים שדורשים עדכון (קוד)

| קובץ | שינוי נדרש |
|------|-------------|
| `tests/gate-b-e2e.test.js` | החלפת `documentation/05-REPORTS` ב־`documentation/reports/05-REPORTS` (במשתנה ARTIFACTS_DIR / path). |
| `tests/phase1-completion-b-validation.test.js` |同上 — עדכון נתיב פלט/ארטיפקטים ל־`documentation/reports/05-REPORTS`. |
| `tests/flow-type-ssot-e2e.test.js` | 同上 — עדכון ARTIFACTS_DIR ל־`documentation/reports/05-REPORTS`. |

בנוסף — אם קיימים **סקריפטים** או **נהלים** שמייצרים/קוראים נתיב `documentation/05-REPORTS` או `05-REPORTS` בשורש, יש לעדכן אותם לנתיב הקנוני.

---

## 3. בקשת פעולה

- **מנדט/הנחיה:** להורות לצוות הרלוונטי (למשל 50/60/90 לפי ownership של tests) לעדכן את הנתיבים בקבצים הרשומים למעלה.
- **מועד:** לאחר אישור Team 190 על תוכנית אופציה C, ובמסגרת שלב 1 (נעילת מבנה וניקוי דוחות כפולים) — כך שהקוד יהיה תואם לקנון לפני או עם ארכיון `documentation/05-REPORTS`.

---

## 4. קישור לתוכנית

תוכנית אופציה C — שלב 0.1 (קוד), שלב 1 (בקשה ל־Team 10). דוח חקירה: `_COMMUNICATION/team_170/TEAM_170_DUPLICATE_05_REPORTS_INVESTIGATION_v1.0.0.md`.

---

**log_entry | TEAM_170 | TEAM_10_ARTIFACTS_PATH_REQUEST | DELIVERED | 2026-02-19**
