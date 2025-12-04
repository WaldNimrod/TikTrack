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
- מינימום 150 quotes עם `close_price`

**תלות:** תלוי בנתונים היסטוריים עם `close_price`.

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

**המלצה:** להוסיף בדיקות ולוגים כדי לזהות איזה טיקרים חסרים להם נתונים ולטפל בהם בהתאם.

