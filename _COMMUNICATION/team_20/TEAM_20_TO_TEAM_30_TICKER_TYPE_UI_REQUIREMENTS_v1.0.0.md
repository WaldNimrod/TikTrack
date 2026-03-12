# Team 20 → Team 30 | דרישות UI לשדה ticker_type

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_30_TICKER_TYPE_UI_REQUIREMENTS  
**from:** Team 20 (Backend)  
**to:** Team 30 (UI/Frontend)  
**ref:** TEAM_10_TICKER_TYPE_QUICK_FIX_NOTE_v1.0.0, TEAM_20_TICKER_TYPE_OWNERSHIP_ANALYSIS_v1.0.0  
**date:** 2026-03-12  
**status:** ACTION_REQUIRED  

---

## 1) סטטוס Team 20 — הושלם

| משימה | סטטוס |
|-------|--------|
| Seed: UPDATE ticker_type לטיקרים קיימים | ✅ הוסף `_backfill_ticker_type_for_existing()` ב־`scripts/seed_market_data_tickers.py` |
| API: החזרת ticker_type | ✅ כבר מחזיר — ללא שינוי |
| DB: ערכים נכונים | ✅ SPY=ETF, QQQ=ETF, BTC-USD=CRYPTO |

---

## 2) דרישה מ־Team 30

**בעיה:** ייתכן שהעמוד מציג "stock" לכולם למרות שה־API מחזיר ticker_type נכון.

**נקודה לבדיקה:** `ui/src/views/management/tickers/tickersTableInit.js` — שורה 202.

**קוד נוכחי:**
```javascript
typeBadge.textContent = t.ticker_type ?? 'STOCK';
```

**תיקון מומלץ:** תמיכה גם ב־camelCase (למקרה שהמידע מגיע כ־tickerType):
```javascript
typeBadge.textContent = t.ticker_type ?? t.tickerType ?? 'STOCK';
```

**מיקומים נוספים לבדיקה:**
- `ui/src/views/management/userTicker/userTickerTableInit.js` — שורה 183 (כבר יש `tickerType` fallback ✓)
- `ui/src/views/management/tickers/tickersForm.js` — שורה 26 (כבר יש fallback ✓)
- `tickersTableInit.js` — שורה 454 (במודל פרטים) — כבר יש `t.tickerType` ✓

---

## 3) אימות

אחרי התיקון:
1. פתח `/tickers.html` או `/management/tickers`
2. ודא ש־SPY, QQQ מציגים "ETF" וכי BTC-USD מציג "CRYPTO"
3. ודא ששאר הטיקרים מציגים "STOCK"

---

## 4) API Response לדוגמה

ה־API מחזיר:
```json
{
  "data": [
    { "symbol": "SPY", "ticker_type": "ETF", ... },
    { "symbol": "QQQ", "ticker_type": "ETF", ... },
    { "symbol": "BTC-USD", "ticker_type": "CRYPTO", ... }
  ]
}
```

אם ה־binding תקין — התצוגה תהיה נכונה.

---

**log_entry | TEAM_20 | TO_TEAM_30 | TICKER_TYPE_UI_REQUIREMENTS | ACTION_REQUIRED | 2026-03-12**
