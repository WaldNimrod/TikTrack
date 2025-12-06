# דרישות נתונים לדשבורד טיקר

**תאריך:** 2025-12-02  
**מטרה:** תיעוד הנתונים החיוניים להרצת כל חישוב בדשבורד הטיקר

---

## 📊 נתונים חיוניים לכל חישוב

### 1. נתוני מחיר בסיסיים (Price Data)

**מקור:** `MarketDataQuote` - השדה `latest_quote`

**שדות נדרשים:**
- `price` / `current_price` - מחיר נוכחי (חיוני)
- `change_pct_day` / `daily_change_percent` - שינוי יומי באחוזים
- `change_amount_day` / `daily_change` - שינוי יומי בכסף
- `volume` - נפח מסחר
- `open_price` - מחיר פתיחה
- `fetched_at` - תאריך עדכון אחרון

**תלות:** אם אין `latest_quote`, כל הנתונים הבסיסיים לא יהיו זמינים.

---

### 2. ATR (Average True Range)

**מקור:** 
1. `MarketDataQuote.atr` (אם קיים)
2. `ATRCalculator.get_atr_with_fallback()` (אם לא קיים)

**דרישות:**
- Quotes עם `high_price`, `low_price`, `close_price`
- מינימום 14 quotes (לחישוב ATR 14)
- אם אין מספיק נתונים, ATR יהיה `null`

**תלות:** תלוי ב-`latest_quote` ובנתונים היסטוריים.

---

### 3. 52W High/Low

**מקור:** `Week52Calculator.calculate_52w_range()`

**דרישות:**
- Quotes עם `high_price`, `low_price` (לא null)
- מינימום 10 quotes (לחישוב אמין)
- נתונים מ-52 השבועות האחרונים (365 ימים)

**תלות:** תלוי בנתונים היסטוריים מ-`MarketDataQuote`.

---

### 4. Volatility (תנודתיות)

**מקור:** `TechnicalIndicatorsCalculator.calculate_volatility()`

**דרישות:**
- Quotes עם `close_price` (לא null)
- מינימום 30 quotes (לחישוב תנודתיות 30 יום)
- נתונים מ-30 הימים האחרונים

**תלות:** תלוי בנתונים היסטוריים עם `close_price`.

---

### 5. MA 20 (Moving Average 20)

**מקור:** `TechnicalIndicatorsCalculator.calculate_sma(period=20)`

**דרישות:**
- Quotes עם `close_price` (לא null)
- מינימום 20 quotes עם `close_price`

**תלות:** תלוי בנתונים היסטוריים עם `close_price`.

---

### 6. MA 150 (Moving Average 150)

**מקור:** `TechnicalIndicatorsCalculator.calculate_sma(period=150)`

**דרישות:**
- Quotes עם `close_price` (לא null)
- מינימום 120 quotes עם `close_price` (80% מ-150) - **עודכן דצמבר 2025**
- המערכת מחשבת MA 150 גם עם 120-149 quotes כדי להתחשב בסופי שבוע וחגים

**תלות:** תלוי בנתונים היסטוריים עם `close_price`.

**הערה:** המערכת מאפשרת חישוב MA 150 גם עם פחות מ-150 quotes (מינימום 120) כדי להתחשב בסופי שבוע וחגים שבהם השוק סגור. זה מבטיח שהחישוב יעבוד גם עם נתונים חלקיים.

---

## 🔍 מהיכן ticker 7 (QQQ) שואב את המידע?

**Ticker 7 (QQQ) - Invesco QQQ Trust:**
- ✅ **469 quotes** במערכת
- ✅ **312 quotes עם close_price**
- ✅ **Date range:** 2025-11-21 עד 2025-12-02 (11 ימים)
- ✅ **Status:** open

**נתונים זמינים:**
- ✅ Price data - יש `latest_quote`
- ✅ ATR - יש מספיק quotes עם high/low/close
- ✅ 52W - יש מספיק quotes (10+)
- ✅ Volatility - יש מספיק quotes עם close_price (30+)
- ✅ MA 20 - יש מספיק quotes עם close_price (20+)
- ✅ MA 150 - **אולי לא** - צריך 150 quotes עם close_price (יש 312, אז זה אמור לעבוד)

---

## ⚠️ האם המידע זמין לכל שאר הטיקרים?

### טיקרים עם נתונים מלאים (כמו QQQ):
- Ticker 82 (AMD): 470 quotes, 314 עם close_price ✅
- Ticker 18 (AVGO): 468 quotes, 312 עם close_price ✅
- Ticker 67 (INTC): 467 quotes, 312 עם close_price ✅
- Ticker 87 (WMT): 467 quotes, 312 עם close_price ✅

### טיקרים שעלולים להיות בעייתיים:

1. **טיקרים ללא quotes כלל:**
   - לא יהיו להם נתוני מחיר בסיסיים
   - לא יהיו להם ATR, 52W, Volatility, MA

2. **טיקרים עם quotes ישנים (>1 יום):**
   - הנתונים לא מעודכנים
   - עלולים להציג מחירים לא רלוונטיים

3. **טיקרים עם quotes אבל ללא close_price:**
   - לא יוכלו לחשב Volatility
   - לא יוכלו לחשב MA 20/150
   - ATR ו-52W עדיין יכולים לעבוד (אם יש high/low)

4. **טיקרים עם פחות מ-150 quotes עם close_price:**
   - לא יוכלו לחשב MA 150
   - MA 20 עדיין יכול לעבוד (אם יש 20+)

---

## 🎯 המלצות

### 1. בדיקת זמינות נתונים לפני תצוגה:
```javascript
// Check if ticker has required data
const hasRequiredData = tickerData.current_price !== undefined || tickerData.price !== undefined;
if (!hasRequiredData) {
    // Show error or fallback UI
}
```

### 2. טיפול בנתונים חסרים:
- ATR: הצג "N/A" אם `atr === null`
- 52W: הצג "N/A" אם `week52_high === null` או `week52_low === null`
- Volatility: הצג "N/A" אם `volatility === null`
- MA 20: הצג "N/A" אם `ma_20 === null`
- MA 150: הצג "N/A" אם `ma_150 === null`

### 3. הודעות שגיאה ברורות:
- אם אין `latest_quote`: "אין נתוני מחיר זמינים לטיקר זה"
- אם אין מספיק נתונים ל-MA 150: "נדרשים 150 quotes עם close_price לחישוב MA 150"

### 4. בדיקת זמינות לפני חישוב:
- בדוק אם יש `latest_quote` לפני כל חישוב
- בדוק אם יש מספיק quotes לפני חישוב MA/Volatility
- בדוק אם יש high/low לפני חישוב 52W

---

## 🔄 Pre-calculation של חישובים טכניים

**תאריך עדכון:** דצמבר 2025

**מנגנון חדש:**
לאחר טעינת נתונים היסטוריים, המערכת מבצעת **pre-calculation** של כל החישובים הטכניים:

1. **Volatility** - מחושב מיד אם יש 30+ quotes
2. **MA 20** - מחושב מיד אם יש 20+ quotes
3. **MA 150** - מחושב מיד אם יש 120+ quotes (80% מ-150)
4. **52W Range** - מחושב מיד אם יש 10+ quotes

**יתרונות:**
- החישובים זמינים מיד בקריאה הבאה ל-`get_entity_details`
- שיפור ביצועים - חישובים מתבצעים פעם אחת ונשמרים ב-cache
- חישובים מתבצעים גם אם cache disabled (אבל לא נשמרים)

**מיקום בקוד:**
- `Backend/routes/external_data/quotes.py` - פונקציה `refresh_ticker_quote()`
- `Backend/services/external_data/technical_indicators_calculator.py` - חישוב MA עם 80% מהנתונים

---

## 📊 Progress Overlay

**תאריך עדכון:** דצמבר 2025

**מנגנון חדש:**
המערכת מציגה **progress overlay** עם 4 שלבים בעת טעינת נתונים:

1. **שלב 1:** טוען מחיר נוכחי
2. **שלב 2:** טוען נתונים היסטוריים
3. **שלב 3:** מעבד ומאמת נתונים
4. **שלב 4:** מסיים טעינה

**תכונות:**
- הצגת אחוז התקדמות דינמי
- הודעות עדכון לכל שלב
- סגירה אוטומטית בסיום

**מיקום בקוד:**
- `trading-ui/scripts/services/unified-progress-manager.js` - שירות Progress Manager
- `trading-ui/scripts/ticker-dashboard.js` - שימוש ב-`UnifiedProgressManager`

---

## 🔄 Retry Mechanism

**תאריך עדכון:** דצמבר 2025

**מנגנון חדש:**
המערכת מבצעת **retry mechanism** עם עד 10 ניסיונות (עם השהיה של 5 שניות בין ניסיונות) כדי להבטיח שכל הנתונים נטענו:

1. טעינת נתונים היסטוריים
2. בדיקת נתונים חסרים
3. אם יש נתונים חסרים - המתנה וניסיון חוזר
4. חזרה על התהליך עד שכל הנתונים זמינים או עד 10 ניסיונות

**תכונות:**
- בדיקה אוטומטית של נתונים חסרים
- ניסיונות חוזרים אוטומטיים
- הודעות עדכון למשתמש

**מיקום בקוד:**
- `trading-ui/scripts/ticker-dashboard.js` - פונקציה `fetchDataFromProvider()`

---

## 📝 סיכום

**הנתונים החיוניים:**
1. ✅ `latest_quote` מ-`MarketDataQuote` - **קריטי לכל הנתונים**
2. ✅ Quotes היסטוריים עם `close_price` - **קריטי ל-MA ו-Volatility**
3. ✅ Quotes היסטוריים עם `high_price`, `low_price` - **קריטי ל-52W ו-ATR**

**האם זמין לכל הטיקרים?**
- ❌ **לא** - תלוי בנתונים שנאספו מ-Yahoo Finance
- ✅ טיקרים עם נתונים מלאים (כמו QQQ) - יעבדו מצוין
- ⚠️ טיקרים עם נתונים חלקיים - יציגו "N/A" בשדות חסרים
- ❌ טיקרים ללא quotes - לא יציגו נתונים כלל

**שיפורים חדשים (דצמבר 2025):**
- ✅ Pre-calculation של חישובים טכניים
- ✅ MA 150 מחושב גם עם 80% מהנתונים (120 quotes במקום 150)
- ✅ Progress overlay עם 4 שלבים
- ✅ Retry mechanism עם עד 10 ניסיונות
- ✅ שיפור חוויית משתמש עם הודעות עדכון

**המלצה:** להוסיף בדיקות ולוגים כדי לזהות איזה טיקרים חסרים להם נתונים ולטפל בהם בהתאם.

---

## 🔄 אינטגרציה עם דשבורד טיקרים

**תאריך עדכון:** דצמבר 2025

**מימוש חדש:**
דשבורד טיקרים (`tickers.html`) עכשיו כולל אינטגרציה מלאה עם מערכת הנתונים החיצוניים:

### תכונות חדשות:

1. **בדיקה אוטומטית של נתונים חסרים:**
   - `checkTickerDataCompleteness(ticker)` - בודקת את שלמות הנתונים לכל טיקר
   - `checkTickersDataCompleteness(tickers)` - בודקת את שלמות הנתונים לכל הטיקרים
   - מחזירה מידע על נתונים חסרים, חישובים חסרים, ואחוז שלמות

2. **טעינה אוטומטית של נתונים היסטוריים:**
   - `ensureHistoricalDataForTickers(tickers, options)` - טוענת נתונים היסטוריים לטיקרים שחסרים להם
   - משתמשת ב-`ExternalDataService.refreshTickerData()` לטעינת נתונים
   - מציגה progress overlay עם עדכונים בזמן אמת

3. **העשרת נתונים מלאים:**
   - `enrichTickersWithFullData(tickers, options)` - מעשירה טיקרים עם נתונים מלאים מ-`EntityDetailsAPI`
   - כוללת חישובים טכניים (ATR, Volatility, MA 20/150, 52W)
   - משתמשת ב-cache לשיפור ביצועים

4. **רענון נתונים חסרים:**
   - `loadAndRefreshMissingData(tickers, options)` - מזהה ומרעננת נתונים חסרים
   - משתמשת ב-`/api/external-data/status/tickers/missing-data` לזיהוי
   - מרעננת אוטומטית טיקרים עם נתונים חסרים

5. **אינדיקטור סטטוס נתונים:**
   - `getDataStatusBadge(ticker)` - מחזירה badge HTML עם סטטוס נתונים
   - מציגה: ✅ מלא (ירוק), ⚠️ חלקי (צהוב), ❌ חסר (אדום)
   - מוצגת בעמודת הסטטוס בטבלת הטיקרים

### שימוש:

```javascript
// טעינת נתונים עם העשרה אוטומטית
await loadTickersDataInternal({
  enrichWithFullData: true,  // העשרת נתונים מלאים
  autoRefreshMissing: true,   // בדיקת נתונים חסרים
  showProgress: true          // הצגת progress overlay
});
```

### שמירת נתונים:

- נתונים בסיסיים נשמרים ב-`CacheTTLGuard` עם TTL של 5 דקות
- נתונים מלאים (עם חישובים טכניים) נשמרים ב-`UnifiedCacheManager` עם TTL של שעה
- נתונים היסטוריים נשמרים ב-cache עם TTL של שעה

### מיקום בקוד:

- `trading-ui/scripts/tickers.js` - כל הפונקציות החדשות
- `trading-ui/tickers.html` - דשבורד טיקרים

---

## 📝 סיכום עדכון

**תאריך:** דצמבר 2025

**שיפורים חדשים:**
- ✅ אינטגרציה מלאה עם מערכת הנתונים החיצוניים
- ✅ בדיקה אוטומטית של נתונים חסרים
- ✅ טעינה אוטומטית של נתונים היסטוריים
- ✅ העשרת נתונים מלאים עם חישובים טכניים
- ✅ אינדיקטור סטטוס נתונים ויזואלי
- ✅ שמירת נתונים נטענים ב-cache

**יתרונות:**
- נתונים מלאים זמינים מיד בטעינת הדף
- זיהוי אוטומטי של טיקרים עם נתונים חסרים
- טעינה אוטומטית של נתונים חסרים
- שיפור ביצועים עם caching

---

