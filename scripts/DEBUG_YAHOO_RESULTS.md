# Yahoo — תוצאות דיאגנוסטיקה ותיקון

## תיקון מרכזי (יושם)

**הסרת custom Session** — לפי תעוד yfinance וממצאי GitHub:
- העברת `Session` מותאם ל-`yf.Ticker()` **מפעילה 429** מ-Yahoo
- ההמלצה: "stop setting session, let YF handle"
- yfinance מנהל cookies/crumb בפנימי; Session חיצוני שובר את הזרימה

**שינוי בקוד:** `api/integrations/market_data/providers/yahoo_provider.py`
- כל הקריאות ל-`yf.Ticker()` — **בלי** `session=...`
- `ticker = yf.Ticker(symbol)` בלבד

## תוצאות דיאגנוסטיקה (עם Session vs בלי)

| צעד | שיטה | עם Session | בלי Session |
|-----|------|------------|-------------|
| 1–5 | HTTP ישיר / yfinance עם Session | 429 | — |
| 6–7 | yfinance **בלי** session | — | אין 429, אך "No data" (אולי סוף שבוע) |

## "No data found for this date range"

יכול להופיע:
- סוף שבוע (אין מסחר)
- טווח תאריכים לא רלוונטי
- yfinance ישן (0.2.18) — לעדכן: `pip install --upgrade yfinance`

## הרצה

```bash
python3 scripts/debug_yahoo_one_ticker.py
```

לבדיקה בשעות מסחר — ייתכן שתתקבל החזרה תקינה.
