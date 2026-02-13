# Team 20 → Team 60: תיאום External Data — תוצרים והנחיות

**id:** `TEAM_20_TO_TEAM_60_EXTERNAL_DATA_COORDINATION`  
**from:** Team 20 (Backend)  
**to:** Team 60 (DevOps & Platform)  
**date:** 2026-02-13  
**מקור:** TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE; TEAM_10_TO_TEAM_20_GATE_B_GAPS_AND_SYNC_MANDATE

---

## 1. הקשר

בהתאם לריענון מלא מודול External Data ולתיקון פערי Gate B — Team 20 מספקת תוצרים הדורשים תאום עם Team 60.

---

## 2. נושאי תאום

### 2.1 סקריפט EOD למחירי טיקר (מיידי)

| פריט | פרטים |
|------|--------|
| **סקריפט** | `scripts/sync_ticker_prices_eod.py` |
| **Make target** | `make sync-ticker-prices` |
| **פעולה** | טעינה מ־Yahoo/Alpha ושמירה ל־`market_data.ticker_prices` |
| **דרישה** | הוספת ל-cron (דוגמה: `0 22 * * 1-5` UTC — יחד עם FX או בסמוך) |

**תלות:** `market_data.tickers` עם רשומות; `ALPHA_VANTAGE_API_KEY` אופציונלי (Yahoo בלבד עובד).

---

### 2.2 פרטיציות ticker_prices (אם טבלה מפורטסת)

| פריט | פרטים |
|------|--------|
| **Migration** | `scripts/migrations/ensure_ticker_prices_partitions.sql` |
| **תוכן** | יצירת פרטיציות 2026 (ינואר–דצמבר) |
| **דרישה** | הרצה אם `ticker_prices` מפורטסת ואין פרטיציה לחדש הנוכחי |

---

### 2.3 exchange_rates_history (לאחר אישור אדריכל)

| פריט | פרטים |
|------|--------|
| **DDL draft** | `scripts/migrations/draft_exchange_rates_history.sql` |
| **מקור** | Option A — Spy/Team 90; SSOT: Retention 250d → archive |
| **סטטוס** | **ממתין לאישור אדריכל** — אין להריץ עד אישור |
| **דרישה** | לאחר אישור — migration + הרשאות; עדכון Job EOD: INSERT history + UPSERT ל־exchange_rates |

---

## 3. סיכום פעולות Team 60

| סדר | פעולה | תנאי |
|-----|--------|------|
| 1 | הוספת `make sync-ticker-prices` ל-cron | מיידי |
| 2 | הרצת `ensure_ticker_prices_partitions.sql` | אם ticker_prices מפורטסת וחסרה פרטיציה |
| 3 | הרצת `draft_exchange_rates_history.sql` | רק לאחר אישור אדריכל/Team 10 |
| 4 | עדכון Job EOD — INSERT history | לאחר סעיף 3 |

---

## 4. חוזים

- **FX EOD:** נשאר כרגיל — `sync_exchange_rates_eod.py`
- **Ticker EOD:** `sync_ticker_prices_eod.py` — נוסף
- **Ticker Intraday:** `sync_ticker_prices_intraday.py` — נוסף (TEAM_20_TO_TEAM_60_ENV_AND_INTRADAY_COORDINATION_REQUEST)
- **ALPHA_VANTAGE_API_KEY:** `api/.env` — נדרש ל-FX; אופציונלי ל-Ticker (fallback Yahoo)

---

## 5. בקשת תאום נוספת

**מסמך מלא:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_60_ENV_AND_INTRADAY_COORDINATION_REQUEST.md`

מפרט: ENV (ALPHA_VANTAGE_API_KEY ב-cron), Intraday Job, רשימת אימות.

---

**log_entry | TEAM_20 | TO_TEAM_60 | EXTERNAL_DATA_COORDINATION | 2026-02-13**
