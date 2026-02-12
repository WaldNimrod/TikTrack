# Team 10 → Team 20: משימות פתוחות — הפניה ממסמך מרכזי

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend & DB)  
**תאריך:** 2026-02-12  
**מסמך מרכזי:** `_COMMUNICATION/team_10/TEAM_10_OPEN_TASKS_MASTER.md`

---

## 1. מטרה

מסמך זה מפנה ל**מסמך המרכזי** של כל המשימות הפתוחות. להלן חיתוך המשימות המוקצות ל־Team 20 לפי סדר ביצוע.

---

## 2. משימות Team 20 (לפי סדר)

| # | מזהה | משימה | תוצר מצופה | סטטוס |
|---|------|--------|-------------|--------|
| 1 | 1.2.1 | מימוש Endpoints ל־Summary ו־Conversions (Option A) | API פעילים; תיעוד ב־SSOT | 🟡 **חלקי** — /cash_flows/currency_conversions פעיל; Summary endpoints — יש לבדוק |
| 2 | 1.2.2 | נעילת פורטים 8080/8082 והקשחת Precision ל־20,6 | CORS/Config + NUMERIC(20,6) מאומת (תיאום עם Team 60) | ✅ **הושלם** — מאומת Team 60; סגור רשמית |
| 3 | 1.2.3 | בניית Python Seeders עם `is_test_data = true`; `make db-test-clean` מחזיר DB סטרילי | סקריפטים + Makefile | ✅ **הושלם** — seed_test_data.py, db_test_clean.py, seed_base_test_user.py, reduce_admin_base_to_minimal.py, db_remove_superfluous_users.py; Makefile: db-test-clean, db-test-fill, db-backup, db-base-seed, db-admin-minimal, db-test-report, db-remove-superfluous-users |
| 4 | PDSC | PDSC Boundary Contract — JSON Error Schema, Response Contract, Error Codes | מסמך חוזה משותף | ✅ **החלטה התקבלה** — 3 רכיבים מלאים; ביצוע לפי מנדט; אפשרות שלד מ-Team 90 |
| 5 | Auth | חוזה Auth אחיד + עדכון SSOT/OpenAPI (אם טרם הושלם) | תיעוד + OpenAPI | ממתין |

**תלות:** השלמת 1.2.1–1.2.3 פותחת את 1.1.3 ל־Team 10 ואת אינטגרציה מלאה ל־Team 30/40.

---

## 3. מקורות מפורטים

- **תוכנית Phase 2:** `documentation/00-MANAGEMENT/TT2_PHASE_2_CLOSURE_WORK_PLAN.md` — שלב 1, משימות 1.2
- **PDSC:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_PDSC_BOUNDARY_CONTRACT_MANDATE.md`
- **Auth:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_AUTH_CONTRACT_AND_SSOT_MANDATE.md`

---

**log_entry | TEAM_10 | OPEN_TASKS_ASSIGNMENT | TO_TEAM_20 | 2026-02-12**
