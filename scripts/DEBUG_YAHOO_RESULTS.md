# Yahoo — תוצאות דיאגנוסטיקה (טיקר אחד: AAPL)

## סיכום

| צעד | שיטה | תוצאה |
|-----|------|--------|
| 1 | HTTP ישיר → query1.finance.yahoo.com/v7/finance/quote | **429 Too Many Requests** |
| 2 | yfinance history(period='5d') | **ריק** — "No data found for this date range" |
| 3 | yfinance ticker.info | **429** — query2.finance.yahoo.com/v10/finance/quoteSummary |
| 4 | yfinance fast_info | **429** — אותו endpoint |
| 5 | HTTP ישיר → query2.finance.yahoo.com | **429 Too Many Requests** |

## מסקנה

**כל נקודות הכניסה ל־Yahoo מחזירות 429** — query1, query2, chart, quoteSummary.

זה מרמז על **הגבלת קצב (rate limit) או חסימת IP** מצד Yahoo בסביבה הנוכחית, ולא על באג בקוד.

## צעדים מומלצים

1. **רשת אחרת** — מחשב נייד דרך נקודת גישה סלולרית / VPN / רשת אחרת
2. **המתנה** — לפעמים ה-rate limit מתאפס אחרי זמן
3. **Header מלא** — הוספת Referer וכו' כדי להדמות דפדפן מלא (ניסוי)

## הרצה

```bash
python3 scripts/debug_yahoo_one_ticker.py
```
