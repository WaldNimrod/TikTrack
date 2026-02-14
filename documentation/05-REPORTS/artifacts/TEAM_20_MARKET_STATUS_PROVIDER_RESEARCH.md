# מסמך מחקר: מצב פתיחת שוק (Market Status) מספקי נתונים חיצוניים

**Team 20 — Backend / External Data**  
**תאריך:** 2025-01-31  
**נושא:** האם Yahoo ו-Alpha Vantage מספקים "מצב פתיחת שוק" בכל רגע (פתוח/סגור, pre/post, overnight, סופש״ש)?

---

## תשובה קצרה

**כן.** שני הספקים שלנו יכולים לספק מידע על מצב השוק:

| ספק | יכולת | הערות |
|-----|--------|-------|
| **Yahoo Finance** | ✅ כן | שדה `marketState` ב־API v7/finance/quote — **כבר בשימוש** אצלנו ב־`_fetch_price_via_quote_api` |
| **Alpha Vantage** | ✅ כן | `MARKET_STATUS_CURRENT` — סטטוס גלובלי לכל בורסה |

---

## 1. Yahoo Finance — marketState

### מקור
- **Endpoint:** `https://query1.finance.yahoo.com/v7/finance/quote`
- **מימוש קיים:** `api/integrations/market_data/providers/yahoo_provider.py` → `_fetch_price_via_quote_api()`
- אנו כבר קוראים ל־API הזה ומחלצים `regularMarketPrice`, `regularMarketOpen`, `marketCap`, וכו׳ — **לא מחלצים עדיין את `marketState`**

### שדות רלוונטיים בתשובה
| שדה | תיאור |
|-----|--------|
| `marketState` | ערכי מצב: `REGULAR` (שוק רגיל), `PRE`/`PREPRE` (פרהמרקט), `POST`/`POSTPOST` (אפטר מרקט), `CLOSED` (סגור) |
| `exchangeTimezoneName` | אזור זמן הבורסה (למשל `America/New_York`) |
| `exchangeTimezoneShortName` | קיצור (למשל `EST`, `EDT`) |
| `gmtOffSetMilliseconds` | היסט מ־UTC במילישניות |

### יתרונות
- ללא תלות ב־API key
- נתון **לפי טיקר** (מתאים לבורסה של הטיקר)
- מחובר לנתוני מחיר — קריאה אחת יכולה להחזיר גם מחיר וגם `marketState`

### חסרונות
- Yahoo אינם מספקים תיעוד רשמי — יש להסתמך על התנהגות בפועל
- עשוי להיות מושפע משינויים בצד Yahoo (כמו התנהגות סופ״ש שהוזכרה בעבר)

---

## 2. Alpha Vantage — MARKET_STATUS_CURRENT

### מקור
- **Endpoint:** `https://www.alphavantage.co/query?function=MARKET_STATUS_CURRENT&apikey=YOUR_KEY`
- **תיעוד:** [Alpha Vantage API — Market Status](https://www.alphavantage.co/documentation/#market-status)
- מופיע כ־"utility function" ב־Time Series Stock Data APIs

### התנהגות
- **מפתח demo:** מחזיר הודעת "Information" בלבד — אין נתוני סטטוס
- **מפתח אמיתי:** מחזיר סטטוס לכל הבורסות (US, EU, Asia וכו׳)

### יתרונות
- API רשמי ותיעוד
- סטטוס **גלובלי** לכל בורסה — נוח ל־multi‑exchange
- אינו תלוי בטיקר ספציפי

### חסרונות
- דורש מפתח API (כבר קיים אצלנו)
- אין וידוא בפועל עם המפתח שלנו — מומלץ לבדוק עם `ALPHA_VANTAGE_API_KEY`

---

## 3. המלצות יישום

### אופציה A: Yahoo — הרחבה מיידית (מומלץ לשלב 1)
- להוסיף חילוץ של `marketState` מ־`q` בתוך `_fetch_price_via_quote_api`
- להחזיר `market_state` בתוך `PriceResult` או במבנה נפרד
- אין צורך בקריאות נוספות — משתמשים במה שכבר מתקבל

### אופציה B: Alpha Vantage — סטטוס גלובלי
- ליצור קריאה ל־`MARKET_STATUS_CURRENT` ב־Alpha provider
- טוב לסטטוס ברמת מערכת (למשל "שוק ארה״ב פתוח/סגור") ללא קשר לטיקר ספציפי

### אופציה C: שילוב (Primary / Fallback)
- Yahoo כ־Primary לסטטוס לפי טיקר (כבר מגיע יחד עם quote)
- Alpha כ־Fallback או למסכים ברמת מערכת

---

## 4. שלבים להמשך

1. **בדיקה עם Yahoo:** הרצת `debug_yahoo_one_ticker.py` עם הדפסה של `q.get("marketState")` — לוודא שהערך מגיע
2. **בדיקה עם Alpha:** קריאה ל־`MARKET_STATUS_CURRENT` עם `ALPHA_VANTAGE_API_KEY` — לוודא מבנה התשובה
3. **אישור GIN:** אם נשתמש בשדה `market_state` או `market_status` — לאשר מול Team 10 / GIN
4. **מימוש:** לפי WP_20_03_ENTITY_TIME_MARKET — `GET /api/v1/system/market-status`

---

## 5. קישורים

- [Alpha Vantage — Market Status](https://www.alphavantage.co/documentation/#market-status)
- `documentation/99-ARCHIVE/OLD_LOGIC_ATTEMPTS/WP_20_03_ENTITY_TIME_MARKET.md`
- `api/integrations/market_data/providers/yahoo_provider.py` (שורות 52–96)
