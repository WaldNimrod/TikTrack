# Team 20 → Team 50 | תיקון שורש הבעיה POST /tickers 500 — FAV 7/7 (S002-P003-WP002)

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_50_S002_P003_D22_POST_500_ROOT_CAUSE_FIXED  
**from:** Team 20 (Backend Implementation)  
**to:** Team 50 (QA / FAV)  
**cc:** Team 10, Team 60  
**date:** 2026-02-26  
**historical_record:** true  
**status:** FIXED — 12/12 בדיקות עברו  
**gate_id:** GATE_3  
**work_package_id:** S002-P003-WP002  

---

## 1) סיכום

לאחר סריקה מעמיקה זוהו **שתי בעיות שורש** שגרמו ל־POST /tickers 500:

| # | שגיאה | סיבה | תיקון |
|---|-------|------|-------|
| 1 | `NoReferencedTableError: Foreign key ... could not find table 'market_data.exchanges'` | הטבלאות קיימות ב-DB אך **לא ב-metadata** של SQLAlchemy — חסרו מודלים ל־exchanges, sectors, industries, market_cap_groups | הוספת `api/models/market_reference.py` (Exchange, Sector, Industry, MarketCapGroup); import לפני Ticker ב־`models/__init__.py` |
| 2 | `DatatypeMismatchError: column "ticker_type" is of type market_data.ticker_type but expression is of type character varying` | המודל השתמש ב־String(20) בעוד ה-DB משתמש ב־PostgreSQL ENUM | הוספת `ticker_type_enum` ב־`api/models/enums.py`; עדכון עמודת `ticker_type` ב־Ticker model |

---

## 2) קבצים ששונו

| קובץ | שינוי |
|------|-------|
| `api/models/market_reference.py` | **חדש** — Exchange, Sector, Industry, MarketCapGroup (FK metadata) |
| `api/models/__init__.py` | Import של market_reference לפני Ticker |
| `api/models/enums.py` | הוספת TickerType + ticker_type_enum |
| `api/models/tickers.py` | שימוש ב־ticker_type_enum במקום String(20) |

---

## 3) אימות

```bash
bash scripts/run-tickers-d22-qa-api.sh
```

**תוצאה:** 12/12 עברו (כולל POST → 201, GET/PUT/DELETE :id, data-integrity, GET after delete → 404).

---

## 4) רפרנסים

- `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_20_S002_P003_D22_FAV_REVALIDATION_RESPONSE.md`
- `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_20_S002_P003_D22_P3_021_MIGRATION_RESPONSE_v1.0.0.md`
- `scripts/migrations/p3_021_market_data_reference_tables.sql`

---

**log_entry | TEAM_20 | TO_TEAM_50 | D22_POST_500_ROOT_CAUSE_FIXED | FIXED | 2026-02-26**

---

## 5) תוצאות אימות (ריצה בפועל)

**תאריך:** 2026-01-31  
**סקריפט:** `scripts/run-tickers-d22-qa-api.sh`  
**Backend:** http://127.0.0.1:8082  

| # | בדיקה | תוצאה |
|---|------|------|
| 1 | Admin Login | ✅ 200 |
| 2 | GET /tickers/summary | ✅ 200 |
| 3 | GET /tickers | ✅ 200 |
| 4 | GET /tickers?ticker_type=STOCK | ✅ 200 |
| 5 | GET /tickers?is_active=true | ✅ 200 |
| 6 | GET /tickers?search=A | ✅ 200 |
| 7 | POST /tickers | ✅ 201 (id=…) |
| 8 | GET /tickers/:id | ✅ 200 |
| 9 | GET /tickers/:id/data-integrity | ✅ 200 |
| 10 | PUT /tickers/:id | ✅ 200 |
| 11 | DELETE /tickers/:id | ✅ 204 |
| 12 | GET /tickers/:id after delete | ✅ 404 |

**סיכום:** לאחר הרצת המיגרציה המלאה (P3-020 + P3-021) — **12/12 עברו**. **Exit code:** 0.

---

## 7) החלטה (Decision)

**PASS** — 0 SEVERE, 12/12 בדיקות עברו. Team 10 רשאי לעדכן WSM ולהעביר ל־GATE_5.

---

## 6) דרישות צוות 50 (תהליך חלק)

- **אין לערוך** מסמכים בתיקיות של צוותים אחרים — לכל צוות תיקייה משלו תחת `_COMMUNICATION/team_XX/`.
- **לייצר מסמכים** בפורמט הקנוני (Identity headers, Response required, Evidence-by-path) כפי נהלי הארגון.
- **בסיום** — דוח מלא ל־Team 10 עם החלטה PASS (0 SEVERE), רפרנס ל־SOP-013 במידת הצורך, ואישור מעבר ל־GATE_5.

1. **להריץ תמיד** את הבדיקות המלאות (`scripts/run-tickers-d22-qa-api.sh`) — לא להסתמך על "תוקן" בלי אימות.
2. **לספק מידע מפורט** לצוותי פיתוח בכשל (לפי TEAM_50_QA_FAILURE_REPORTING_SOP) — request, response, סביבה, repro, צעדים להשגת מידע ל־5xx.
3. **בסיום** — דוח מלא ל־Team 10 (PASS, 0 SEVERE) עם חותמת SOP-013 במידת הצורך, ואישור מעבר ל־GATE_5.
