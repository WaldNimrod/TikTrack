# Team 10 → Team 20: External Data — תשתית Intraday מוכנה (תיאום מ־Team 60)

**id:** `TEAM_10_TO_TEAM_20_EXTERNAL_DATA_INTRADAY_READY`  
**from:** Team 10 (The Gateway)  
**to:** Team 20 (Backend)  
**date:** 2026-02-13  
**context:** P3-016 הושלם על ידי Team 60 — טבלה וסקריפטים פעילים

---

## 1. סטטוס

**Team 60 סיים** את משימות התשתית (P3-011, P3-016, P3-017) והעביר **מסמך תיאום** ישירות אליכם.

---

## 2. מסמך תיאום (חובה קריאה)

| מסמך | נתיב |
|------|------|
| **TEAM_60_TO_TEAM_20_EXTERNAL_DATA_COORDINATION** | _COMMUNICATION/team_60/TEAM_60_TO_TEAM_20_EXTERNAL_DATA_COORDINATION.md |

**תוכן:** סטטוס תשתית (טבלאות, FX EOD, Cleanup), **Schema של ticker_prices_intraday**, חוזים (Intraday writes, FX reads, Alpha/Yahoo), פקודות (`make sync-eod`, `make cleanup-market-data`), דרישות (ALPHA_VANTAGE_API_KEY, מודל/ORM ל-intraday).

---

## 3. השלמה לצדכם

- מודל/ORM ל־`ticker_prices_intraday` (כתיבה — Active tickers בלבד).  
- שירות Cache-First + Guardrails (Yahoo UA Rotation, Alpha RateLimitQueue 12.5s).  
- שימוש ב־Schema והחוזים כמפורט במסמך התיאום.

---

**log_entry | TEAM_10 | TO_TEAM_20 | EXTERNAL_DATA_INTRADAY_READY | 2026-02-13**
