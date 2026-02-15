# Team 10 — סגירת סבב נתונים חיצוניים: רשימת משימות מרכזית

**id:** `TEAM_10_EXTERNAL_DATA_ROUND_CLOSURE_CHECKLIST`  
**from:** Team 10 (The Gateway)  
**תאריך:** 2026-02-14  
**מטרה:** התכנסות לסגירת הסבב — מה פתוח, מה סגור, וסדר פעולה.

---

## 1. מקורות תוכנית העבודה

| מסמך | תוכן |
|------|--------|
| **מנדט מלא** | `TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE.md` — §6 משימות מיידיות, §8 סטטוס, **§9 פערי ממשק**, §10 בדיקות אוטומטיות |
| **הנחיית מנהלת העבודה** | `TEAM_10_WORK_MANAGER_DIRECTIVE_EXTERNAL_DATA_UI_CLOSURE.md` — סדר: אימות (50) → תיקונים (30,20,60) → אימות חוזר (50) → סגירה (10) |
| **רשימת משימות פתוחות** | `TEAM_10_OPEN_TASKS_MASTER.md` — חלוקה לפי צוות; External Data P3 — רובו CLOSED (Seal) |

---

## 2. מה סגור (לא דורש פעולה בסבב זה)

| פריט | Evidence / הערה |
|------|------------------|
| **Team 20 — מימוש Backend** | Seal (TEAM_20_TO_TEAM_10_EXTERNAL_DATA_SEAL_MESSAGE); P3-008–P3-015; דוח מימוש מלא (TEAM_20_EXTERNAL_DATA_IMPLEMENTATION_SUMMARY_FOR_TEAM_10) |
| **Team 60 — תשתית** | Seal (TEAM_60_TO_TEAM_10_EXTERNAL_DATA_SEAL_MESSAGE); P3-011, P3-016, P3-017; TEAM_60_CRON_SCHEDULE |
| **Dual Provider + Full Scope Evidence** | TEAM_20_DUAL_PROVIDER_FULL_SCOPE_EVIDENCE.md — ACK: TEAM_10_TO_TEAM_20_DUAL_PROVIDER_EVIDENCE_ACK |
| **Rate-Limit & Scaling** | 20, 30, 60 — הושלמו; Evidence ו-ACK במנדט |
| **אינדקס מערכת (Jobs + דוח)** | 00_MASTER_INDEX v3.12 — רשימת Jobs (TEAM_60_CRON_SCHEDULE), דוח מימוש Team 20 |
| **API בקרת תקינות D22** | Team 20 — GET /tickers/{id}/data-integrity מוכן; מפרט: TEAM_20_TO_TEAMS_10_30_TICKER_DATA_INTEGRITY_UI_REQUEST |

---

## 3. משימות פתוחות — לסגירת הסבב

### 3.1 פערי ממשק (§9 במנדט) — תלויים ב-QA

**מקור:** §9 במנדט + `TEAM_10_WORK_MANAGER_DIRECTIVE_EXTERNAL_DATA_UI_CLOSURE.md`.

| # | משימה | צוות | תוצר חובה | סטטוס |
|---|--------|------|------------|--------|
| **1** | **שלב 1 — אימות עובדות** | **Team 50** | דוח **TEAM_50_TO_TEAM_10_EXTERNAL_DATA_UI_VERIFICATION_REPORT** — 1.1 ניווט דשבורד (dev), 1.2 קובץ ב-dist, 1.3 API טיקרים, 1.4 DB ticker_prices/tickers, 1.5 עמודת מחיר בעמוד טיקרים | ⬜ **פתוח** — הדוח לא התקבל |
| **2** | **שלב 2 — תיקונים** | **Team 30, 20, 60** | לפי תוצאות דוח 50: ניווט/ build (30), sync/response (20), הגשת קבצים (60) | ⬜ ממתין ל-50 |
| **3** | **שלב 3 — אימות חוזר** | **Team 50** | דוח **TEAM_50_TO_TEAM_10_EXTERNAL_DATA_UI_REVERIFICATION** — אותה טבלה PASS/FAIL | ⬜ ממתין ל-2 |
| **4** | **שלב 4 — סגירה** | **Team 10** | עדכון §9 במנדט ל"פערי ממשק — נסגרו" + הפניה לדוח אימות | ⬜ ממתין ל-3 |

**הערה:** בלי דוח אימות Team 50 (שלב 1) — לא מפעילים תיקונים; בלי אימות חוזר — לא סוגרים §9.

---

### 3.2 ממשק בקרת תקינות נתוני טיקר (D22)

**מקור:** `TEAM_20_TO_TEAMS_10_30_TICKER_DATA_INTEGRITY_UI_REQUEST.md`; מסירה ל-30: `TEAM_10_TO_TEAM_30_TICKER_DATA_INTEGRITY_UI_HANDOFF.md`.

| # | משימה | צוות | תוצר | סטטוס |
|---|--------|------|------|--------|
| **1** | מימוש UI בעמוד ניהול טיקרים (D22): דרופדאון טיקרים, כפתור "בדוק", קריאה ל־GET /tickers/{id}/data-integrity, הצגת פירוט (eod_prices, intraday_prices, history_250d, gaps_summary, last_updates) | **Team 30** | קוד + וידוא בעמוד; דוח השלמה ל-Team 10 | ⬜ **פתוח** |
| **2** | עדכון Page Tracker / מנדט — D22 widget "בקרת תקינות" הושלם | **Team 10** | אחרי השלמת 30 | ⬜ ממתין |

---

### 3.3 בדיקות אוטומטיות (§10 במנדט) — סטטוס

**מקור:** TEAM_90 directive; Evidence: `documentation/05-REPORTS/artifacts/TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_EVIDENCE_LOG.md`.

| פריט | סטטוס |
|------|--------|
| מנדטים ל-20, 30, 50, 60 | הופצו; ACK התקבלו |
| Evidence 20, 30, 50, 60 | רשומים ב-Evidence Log |
| חסימות (Suite E כפול, Evidence intraday וכו') | טופלו ב-ACK ופעולות (TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_VALIDATION_BLOCKERS_ACK_AND_ACTIONS) |
| **החלטה:** | סבב אוטומציה **תועד**; ריצת Nightly/Smoke מלאה — לפי לוח CI ותזמון צוות 90. לסגירת "סבב נתונים חיצוניים" לא חוסם — אלא אם הוגדר חובת Gate על Suite E. |

---

## 4. סדר מומלץ לסגירה

1. **Team 50:** הרצת שלב 1 (אימות עובדות) והגשת **TEAM_50_TO_TEAM_10_EXTERNAL_DATA_UI_VERIFICATION_REPORT**.
2. **Team 30 (במקביל אם רוצים):** מימוש widget בקרת תקינות D22 (לא תלוי בדוח 50).
3. **Teams 30, 20, 60:** תיקונים לפי דוח 50 (ניווט, build, sync, הגשה).
4. **Team 50:** שלב 3 — אימות חוזר; הגשת **TEAM_50_TO_TEAM_10_EXTERNAL_DATA_UI_REVERIFICATION**.
5. **Team 10:** עדכון §9 ל"נסגר" + עדכון Page Tracker ל-D22 (בקרת תקינות הושלמה) + פרסום "סגירת סבב נתונים חיצוניים" (אופציונלי — מסמך closure).

---

## 5. הפניות

| מסמך | נתיב |
|------|------|
| מנדט מלא + §9 | _COMMUNICATION/team_10/TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE.md |
| הנחיית מנהלת העבודה | _COMMUNICATION/team_10/TEAM_10_WORK_MANAGER_DIRECTIVE_EXTERNAL_DATA_UI_CLOSURE.md |
| פערים מפורטים | documentation/05-REPORTS/artifacts/TEAM_10_EXTERNAL_DATA_UI_GAPS_AND_QA.md |
| בקשת UI בקרת תקינות | _COMMUNICATION/team_20/TEAM_20_TO_TEAMS_10_30_TICKER_DATA_INTEGRITY_UI_REQUEST.md |
| מסירה ל-30 (D22) | _COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_TICKER_DATA_INTEGRITY_UI_HANDOFF.md |
| רשימת משימות פתוחות | _COMMUNICATION/team_10/TEAM_10_OPEN_TASKS_MASTER.md |
| תוכנית סגירת Phase 2 | documentation/00-MANAGEMENT/TT2_PHASE_2_CLOSURE_WORK_PLAN.md |

---

**log_entry | TEAM_10 | EXTERNAL_DATA_ROUND_CLOSURE_CHECKLIST | CREATED | 2026-02-14**
