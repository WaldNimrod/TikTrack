# Team 20 → Team 90: סגירת ADR-017/018 — מעבר מלא ל־trading_account_fees

**מאת:** Team 20 (Backend)  
**אל:** Team 90 (Spy)  
**תאריך:** 2026-01-31  
**נושא:** ✅ סגירה מלאה — ORM/Services מפנים ל־trading_account_fees; חסימת סגירה הוסרה

**מקור:** הודעה לצוות 20 — השלמות מחייבות לפני סגירה (חוסם סגירה ADR-017/018)

---

## 1. רקע

- **DB:** Team 60 הריץ מיגרציה — `user_data.trading_account_fees` קיימת עם נתונים (Evidence: TEAM_60_TO_TEAM_90_MIGRATION_EXECUTION_EVIDENCE.md)
- **חסימה:** הקוד עדיין עבד מול `brokers_fees` — `__tablename__ = "brokers_fees"` במודל

---

## 2. ביצוע

### 2.1 עדכון ORM

| קובץ | שינוי |
|------|--------|
| `api/models/brokers_fees.py` | `__tablename__ = "trading_account_fees"`; `trading_account_fees_minimum_check` |
| `api/routers/reference.py` | תיקון docstring — מקור ברוקרים: `trading_accounts.broker` (לא brokers_fees) |

### 2.2 שימור לפי החלטה

- **Endpoint:** `/brokers_fees` נשמר (alias)
- **מודול/שירות:** שמות קבצים `brokers_fees.py` נשמרו — רק טבלת DB השתנתה

### 2.3 אימות

```bash
rg -n "brokers_fees" api/models api/services api/schemas api/routers
# תוצאה: אין שימוש בטבלה brokers_fees — רק endpoint name, imports, שמות פונקציות
```

**בדיקת runtime:**
- `GET /api/v1/brokers_fees` — 200, נתונים מ־trading_account_fees ✅
- `GET /api/v1/brokers_fees/summary` — 200 ✅

---

## 3. קריטריון הצלחה

| # | קריטריון | סטטוס |
|---|----------|--------|
| 1 | ORM מפנה ל־trading_account_fees | ✅ |
| 2 | אין שימוש בטבלה brokers_fees בקוד | ✅ |
| 3 | Endpoint /brokers_fees פעיל | ✅ |
| 4 | OpenAPI/תיעוד — אין שינוי בהתאמה (path נשמר) | ✅ |

---

## 4. Evidence

| פריט | נתיב |
|------|------|
| מודל ORM | `api/models/brokers_fees.py` (__tablename__ = "trading_account_fees") |
| דוח סגירה | `_COMMUNICATION/team_20/TEAM_20_BATCH_2_5_CLOSURE_REPORT.md` (מעודכן) |
| Evidence מיגרציה DB | `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_90_MIGRATION_EXECUTION_EVIDENCE.md` |

---

## 5. הערה — הודעת 2026-01-31

ההודעה `TEAM_20_TO_TEAM_90_BATCH_2_5_QA_FIX_SUMMARY.md` מתוארכת 2026-01-31 ומכסה **רק** תיקון QA (Python 3.9, Backend, Login).  
**מסמך זה** — הודעה נפרדת על **סגירת ADR-017/018** (מעבר ל־trading_account_fees).

---

**Team 20 (Backend)**  
**log_entry | TEAM_20 | TO_TEAM_90 | ADR_017_018_CLOSURE_COMPLETE | 2026-01-31**
