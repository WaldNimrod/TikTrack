# Team 20 → Team 10: Yahoo Engine — עדכון תיעוד

**תאריך:** 2026-02-14  
**משימה:** תיקון תיעוד SSOT — Yahoo 250d מלא, ברירות מחדל, מפרט מדויק  
**מקור:** מימוש עדכני ב־`api/integrations/market_data/providers/yahoo_provider.py`

---

## 1. סיכום שינויים (לעדכון תיעוד)

מנוע Yahoo הושלם למימוש מלא של 250 ימי מסחר לפי האפיון. יש לעדכן את מסמכי Team 10 בהתאם.

---

## 2. זרימת Yahoo — `get_ticker_history` (מלא)

| שלב | מימוש | מפרט |
|-----|-------|------|
| **Primary** | v8/chart (HTTP ישיר, httpx) | `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}` |
| **Full 250d** | `range=2y` | ~504 ימי לוח → ~252 ימי מסחר → 250 אחרונים |
| **Gap-fill** | `period1` + `period2` בלבד (ללא range) | `period2` = תחילת יום לאחר date_to (כולל date_to) |
| **Deduplication** | הסרת תאריכים כפולים | שמירה על כרונולוגיה |
| **Retry** | 3×5 שניות | SPEC-PROV-YF-HIST |
| **Fallback** | yfinance + Session + User-Agent | אם v8 מחזיר ריק/429 |

**הערה:** v7/finance/quote מחזיר 401 — לא בשימוש להיסטוריה. v8/chart עובד.

---

## 3. ברירות מחדל וערכים

| פרמטר | ברירת מחדל | מקור |
|--------|------------|------|
| MIN_HISTORY_DAYS | 250 | smart_history_engine.py |
| Backfill: טיקרים עם פחות מ־ | 250 שורות | sync_ticker_prices_history_backfill.py |
| Yahoo range (full) | 2y | trading_days > 252 |
| Yahoo range (פחות) | 1y | trading_days ≤ 252 |
| Gap-fill min_rows | 1 | לקבל גם שורה בודדת |

---

## 4. סקריפטים לאימות

| Make target | סקריפט | מטרה |
|-------------|--------|------|
| `make yahoo-heartbeat` | scripts/yahoo_heartbeat.py | אות חיים — יום אחד מהספק |
| `make verify-yahoo-250d` | scripts/verify_yahoo_250d.py | אימות מלא — 250 שורות, דיוק, השלמות |
| `make sync-history-backfill` | scripts/sync_ticker_prices_history_backfill.py | Backfill לטיקרים < 250 שורות |
| `make ensure-qa-ticker-250d` | scripts/ensure_qa_ticker_250d.py | QA — לפחות טיקר אחד 250+ |

---

## 5. תיקוני תיעוד נדרשים

| מסמך | תיקון |
|------|-------|
| **YAHOO_FINANCE_DATA_AND_REQUEST_LOGIC.md** | §3.3 — להחליף "history(period)" ב־v8/chart (range / period1+period2) |
| **TEAM_60_CRON_SCHEDULE.md** | "&lt; 200 שורות" → "&lt; 250 שורות" (התאמה ל־MIN_HISTORY_DAYS) |
| **TEAM_10_SMART_HISTORY_FILL_SSOT_EVIDENCE_LOG.md** | log_entry — Yahoo Engine מלא (v8/chart, gap-fill, dedup, verify) |
| **EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC** | Method: yfinance + **Query V8 chart API** (HTTP ישיר ל־v8/chart) |

---

## 6. SPEC-PROV-YF-HIST (סיכום)

- **EOD history:** זמין 24/7 — לא לדלג על Yahoo כשהשוק סגור
- **Retry:** 3 ניסיונות, 5 שניות בין ניסיונות
- **User-Agent:** חובה (Rotation)
- **v7/quote:** 401 — לא להיסטוריה
- **v8/chart:** Primary להיסטוריה

---

**log_entry | TEAM_20 | DOCUMENTATION_UPDATE | YAHOO_ENGINE_FULL | 2026-02-14** — מימוש מלא 250d; v8/chart Primary; gap-fill period1/period2; dedup; verify-yahoo-250d; תיקון תיעוד Team 10.
