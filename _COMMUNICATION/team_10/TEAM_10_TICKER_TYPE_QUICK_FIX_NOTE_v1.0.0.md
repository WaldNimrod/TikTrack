# Team 10 | הערת תיקון זריז — שדה סוג נכס (ticker_type)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TICKER_TYPE_QUICK_FIX_NOTE  
**from:** Team 10 (Execution Orchestrator)  
**date:** 2026-03-12  
**status:** OPEN — לא חוסם הגשה  

---

## 1) תיאור

שדה סוג נכס (ticker_type) מציג "stock" לכול הנכשים בממשק — למרות שלא תמיד מדויק (SPY/QQQ=ETF, BTC-USD=CRYPTO).

---

## 2) נקודות לבחינה (לפי עדיפות)

| # | מיקום | בדיקה |
|---|-------|-------|
| 1 | **DB** | `SELECT symbol, ticker_type FROM market_data.tickers WHERE deleted_at IS NULL` — האם SPY/QQQ=ETF, BTC-USD=CRYPTO? |
| 2 | **API** | `GET /api/v1/tickers` — האם ה־response כולל ticker_type נכון לכל ticker? |
| 3 | **Frontend** | `ui/src/views/management/tickers/tickersTableInit.js` line 202: `t.ticker_type ?? 'STOCK'` — האם t מגיע עם ticker_type או null? |
| 4 | **Seed** | `scripts/seed_market_data_tickers.py` — DEFAULT_TICKERS כולל SPY=ETF, QQQ=ETF, BTC-USD=CRYPTO. האם ה-seed רץ? |

---

## 4) אחריות מוצעת

- **Team 20:** אם ה־API/DB לא מחזיר ticker_type — תיקון ב־tickers_service או ב־seed
- **Team 30:** אם ה־API מחזיר נכון אך UI לא מציג — binding ב־tickersTableInit.js

---

## 5) הערה

לא חוסם הגשת GATE_7 Part A. תיקון זריז לאחר או במקביל לולידציה.

---

**log_entry | TEAM_10 | TICKER_TYPE_QUICK_FIX_NOTE | OPEN | 2026-03-12**
