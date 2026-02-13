# 📋 Team 10 → Team 20 & Team 60: הכנות וביצוע מיידי — סגירת Phase 2

**אל:** Team 20 (Backend), Team 60 (DevOps & Infra)  
**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-09  
**נושא:** ביצוע מיידי — שלב 1 (Debt Closure) + איסוף מידע נדרש  
**מקור:** ADR-010, תוכנית סגירה `documentation/00-MANAGEMENT/TT2_PHASE_2_CLOSURE_WORK_PLAN.md`

---

## 🎯 המשימות שלכם (שלב 1)

| # | משימה | תוצר מצופה |
|---|--------|-------------|
| **1.2.1** | מימוש Endpoints ל-Summary ו-Conversions ב-Backend (Option A) | API פעילים; תיעוד ב-SSOT |
| **1.2.2** | נעילת פורטים 8080/8082 והקשחת Precision ל-20,6 | CORS/Config מאומת; NUMERIC(20,6) מאומת |
| **1.2.3** | בניית Python Seeders עם הפלאג `is_test_data = true`; `make db-test-clean` מחזיר DB סטרילי | סקריפטים + Makefile |

---

## 📤 נדרש מכם — איסוף מידע להשלמת מפרט (ללא ניחושים)

כדי שכל משימה תהיה סגורה ב-100%, נדרש להחזיר את המידע הבא **בתיקיית הצוות שלכם** (קובץ אחד או יותר ב-`_COMMUNICATION/team_20/` או `_COMMUNICATION/team_60/`), או לעדכן את ה-SSOT אם כבר קיים.

### 1.2.1 — Endpoints (Team 20)

- **רשימת Endpoints סגורה:** רשימה מדויקת (מסלול, method, תיאור קצר). לדוגמה: `GET /api/v1/brokers_fees/summary`, `GET /api/v1/cash_flows/currency_conversions`.
- **חוזה:** קישור או העתק רלוונטי מ-OpenAPI/SSOT: request/response schema, query params, status codes.
- **קריטריון מעבר:** איך מאשרים ש"API פעיל" (בדיקה ידנית? אוטומטית? רשימת צ'קים).

### 1.2.2 — פורטים + Precision (Team 20 / Team 60)

- **פורטים:** רשימת קבצי config שבהם מאומתים 8080 (FE) ו-8082 (BE) — נתיב מלא לכל קובץ.
- **Precision 20,6:** רשימה ממוספרת: טבלה, עמודה, טיפוס (NUMERIC(20,6)). אם קיים מסמך SSOT — לציין את הנתיב.

### 1.2.3 — Seeders + make db-test-clean (Team 60 + תיאום Team 20)

- **הגדרה מדויקת של `make db-test-clean`:** מה הפקודה עושה (אילו טבלאות/שורות נמחקות). **מיקום:** נתיב מלא ל-Makefile ולתת (target).
- **קריטריון הצלחה:** פלט מצופה (exit code 0? הודעת "DB sterile"?) + איך אתם מוכיחים שזה עובד.
- **רשימת ישויות לזריעה:** אילו מודלים/טבלאות נזרעים (trading_accounts, brokers_fees, cash_flows, users, וכו').
- **מבנה הפלאג:** שם השדה המדויק (`is_test_data`?), טיפוס (boolean?), באילו טבלאות מופיע.
- **הגדרת "DB סטרילי":** אחרי `make db-test-clean` — אילו טבלאות ריקות / אילו שורות נמחקות (רק שורות עם is_test_data=true?).
- **נתיב:** תיקיית הסקריפטים (Python Seeders) ומיקום ה-Makefile.

---

## ⏱️ ביצוע

- התחילו בביצוע המשימות 1.2.1–1.2.3 לפי המפרט הקיים.
- החזירו את המידע המבוקש למעלה **בהקדם** (בתיקיית הצוות שלכם), כדי שצוות 10 יוכל לסגור את המפרט ולוודא חוסר חסימות (כולל וידוא ש-`make db-test-clean` פועל ב-100%).

---

**תוכנית מלאה:** `documentation/00-MANAGEMENT/TT2_PHASE_2_CLOSURE_WORK_PLAN.md`  
**רשימת השלמות מידע:** `documentation/00-MANAGEMENT/TT2_PHASE_2_CLOSURE_TASK_SPEC_SUPPLEMENT_REQUEST.md`
