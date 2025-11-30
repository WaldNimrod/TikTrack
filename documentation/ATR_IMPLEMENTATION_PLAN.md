# תוכנית מימוש ATR (Average True Range) - TikTrack

## מטרת התוכנית

מימוש מלא של ATR במערכת, כולל חישוב מנתונים היסטוריים, תצוגה בממשק, והגדרת העדפה למשתמש.

## שלב 1: בחינת הארכיטקטורה והתאמה לכללים

### 1.1 בחינת מבנה הנתונים הקיים

**מצב נוכחי**:
- **MarketDataQuote**: מכיל `price`, `open_price`, `change_pct_day`, `volume` - **חסרים**: `high_price`, `low_price`, `close_price` יומיים
- **IntradayDataSlot**: מכיל OHLC אבל זה intraday (15 דקות), לא יומי - לא מתאים ל-ATR יומי
- **מסקנה קריטית**: צריך להוסיף שדות יומיים `high_price`, `low_price`, `close_price` ל-MarketDataQuote

**מדיניות שמירה**:
- עד 30 יום: לשמור OHLC מלא (open, high, low, close)
- מעבר ל-30 יום: לשמור רק open/close יומי (לא high/low) - זה הרבה יותר חשוב ממחירים בתוך היום
- **המלצה**: ליצור cleanup script שמסיר high/low מעבר ל-30 יום

### 1.2 בחינת מערכות כלליות רלוונטיות

- **FieldRendererService** (`trading-ui/scripts/services/field-renderer-service.js`) - להצגת ATR
- **EntityDetailsService** (`Backend/services/entity_details_service.py`) - להוספת ATR לנתוני ישויות
- **EntityDetailsRenderer** (`trading-ui/scripts/entity-details-renderer.js`) - להצגת ATR במודול פרטי טיקר
- **PreferencesService** (`Backend/services/preferences_service.py`) - להוספת העדפת ATR period
- **DataNormalizer** (`Backend/services/external_data/data_normalizer.py`) - נורמליזציה בין ספקים

### 1.3 בדיקת כללי המערכת

- ✅ שימוש במערכות כלליות (FieldRendererService, EntityDetailsService)
- ✅ עדיפות לנתונים במערכת על פני נתונים מהספק
- ✅ אינטגרציה עם מערכת העדפות הקיימת
- ✅ תצוגה בממשק לפי תבניות קיימות
- ✅ ארכיטקטורה לספקים נוספים דרך DataNormalizer

## שלב 2: הוספת שדות OHLC יומיים וחישוב ATR

### 2.1 הוספת שדות OHLC יומיים ל-MarketDataQuote

**קובץ**: `Backend/models/external_data.py`

**שינויים**:
- הוספת `high_price = Column(Float, nullable=True)` - מחיר גבוה יומי
- הוספת `low_price = Column(Float, nullable=True)` - מחיר נמוך יומי  
- הוספת `close_price = Column(Float, nullable=True)` - מחיר סגירה יומי (של היום הקודם)
- **הערה**: `open_price` כבר קיים ✅

**Migration**: `Backend/migrations/add_daily_ohlc_fields_to_market_data_quote.py`
- הוספת `high_price` (FLOAT NULL)
- הוספת `low_price` (FLOAT NULL)
- הוספת `close_price` (FLOAT NULL)
- Script idempotent - בודק אם השדות כבר קיימים

### 2.2 יצירת Service לחישוב ATR

**קובץ חדש**: `Backend/services/external_data/atr_calculator.py`

**פונקציות**:

- `calculate_atr_from_database(ticker_id, period, db_session)` - חישוב מנתונים במערכת
  - בודק אם יש מספיק MarketDataQuote היסטוריים עם `open_price`, `high_price`, `low_price`, `close_price`
  - אם יש - משתמש בהם (עדיפות לנתונים שלנו)
  - אם אין מספיק - מחזיר None
  
- `calculate_atr_from_provider(symbol, period, adapter)` - חישוב מנתונים מהספק
  - משתמש ב-`_get_historical_ohlc_data` הקיים
  - בודק התנגשויות עם נתונים במערכת לפני שמירה
  - מחזיר אזהרה אם יש התנגשות
  
- `get_atr_with_fallback(ticker_id, period, db_session, adapter, user_id=None)` - פונקציה ראשית
  - ניסיון ראשון: נתונים במערכת (עדיפות)
  - ניסיון שני: נתונים מהספק (עם אזהרה למשתמש)
  - מחזיר ATR + metadata (מקור הנתונים, אזהרות, התנגשויות)
  - קריאה להעדפת המשתמש אם `user_id` מסופק

### 2.3 שיפור YahooFinanceAdapter - שמירת OHLC יומי

**קובץ**: `Backend/services/external_data/yahoo_finance_adapter.py`

**שינויים**:
- הוספת שמירת `high_price`, `low_price`, `close_price` ב-`_parse_quote_response`
- הסרת חישוב ATR ישיר מ-`_parse_quote_response` (להעביר ל-ATRCalculator)
- הוספת פונקציה `_check_data_conflicts` - בודקת התנגשויות לפני טעינה מהספק
- הוספת לוגיקה להצגת אזהרות למשתמש במקרה של התנגשות
- עדיפות לנתונים במערכת: אם יש MarketDataQuote עם OHLC - לא לטעון מהספק

### 2.4 שיפור DataNormalizer לתמיכה ב-ATR (ארכיטקטורה לספקים נוספים)

**קובץ**: `Backend/services/external_data/data_normalizer.py`

**שינויים**:
- הוספת `atr` ו-`atr_period` ל-`NormalizedQuote` dataclass
- הוספת `high_price`, `low_price`, `close_price` ל-`NormalizedQuote` dataclass
- הוספת `_aggregate_atr` - נורמליזציה של ATR מספקים שונים
- הוספת `_aggregate_ohlc` - נורמליזציה של OHLC מספקים שונים
- **עקרונות ארכיטקטורה**:
  - כל ספק עתידי יעבור דרך `DataNormalizer` - לא ישירות ל-ATRCalculator
  - `NormalizedQuote` יכיל `atr` - כך שכל ספק יכול להחזיר ATR
  - `ATRCalculator` יעבוד עם `NormalizedQuote` - לא עם ספק ספציפי
  - אם ספק עתידי מספק ATR ישירות - הנורמלייזר יאגרג אותו
  - אם ספק לא מספק ATR - `ATRCalculator` יחשב מהנתונים ההיסטוריים

## שלב 3: הוספת העדפת ATR Period

### 3.1 יצירת Migration להוספת העדפה

**קובץ**: `Backend/migrations/add_atr_period_preference.py`

**פרטים**:
- שם העדפה: `atr_period`
- **קבוצה**: `trading_settings` (group_id = 3 - הגדרות מסחר) - **לא external_data**
- סוג: `number`
- ברירת מחדל: `14`
- constraints: `{"min": 3, "max": 90}`
- תיאור: "משך זמן חישוב ATR בימים"

### 3.2 הוספת שדה לסקשן קיים בממשק העדפות

**קובץ**: `trading-ui/preferences.html`

**שינויים**:
- הוספת שדה `atr_period` ל-`section3` (הגדרות מסחר) - **לא סקשן חדש**
- שדה: `atr_period` עם input type="number", min=3, max=90, default=14
- מיקום: בתוך סקשן "הגדרות מסחר" (section3)
- **לא צריך** להוסיף mapping חדש - section3 כבר ממופה ל-`trading_settings`

### 3.3 שילוב העדפה בחישוב ATR

**קובץ**: `Backend/services/external_data/atr_calculator.py`

**שינויים**:
- קריאה להעדפת המשתמש דרך `PreferencesService` או `UserService`
- קבוצת העדפות: `trading_settings` (לא `external_data`)
- שימוש בערך מהעדפות במקום hardcoded 14
- fallback ל-14 אם העדפה לא מוגדרת

## שלב 4: תצוגת ATR בממשק

### 4.1 הוספת ATR ל-EntityDetailsService

**קובץ**: `Backend/services/entity_details_service.py`

**שינויים**:
- הוספת `atr` ו-`atr_period` לנתוני ticker (בשורה ~495)
- קריאה ל-`ATRCalculator.get_atr_with_fallback` במקום חישוב ישיר
- העברת `user_id` ל-`get_atr_with_fallback` כדי לקרוא העדפות

### 4.2 הוספת ATR ל-EntityDetailsRenderer

**קובץ**: `trading-ui/scripts/entity-details-renderer.js`

**שינויים**:
- הוספת ATR ל-`renderMarketData` (שורה ~339)
- שימוש ב-FieldRendererService אם יש פונקציה מתאימה
- תצוגה בפורמט: "ATR: {value} (period: {period} days)"
- הצגת אזהרה אם יש התנגשות נתונים

### 4.3 הוספת ATR ל-API Response

**קבצים**:
- `Backend/routes/external_data/quotes.py` - כבר מעודכן ✅
- `Backend/routes/api/quotes_v1.py` - כבר מעודכן ✅
- `Backend/services/entity_details_service.py` - להוסיף ATR לנתוני ticker

## שלב 5: אינטגרציה עם מערכות כלליות

### 5.1 שימוש ב-FieldRendererService

**קובץ**: `trading-ui/scripts/services/field-renderer-service.js`

**בדיקה**: האם יש פונקציה להצגת ערכים מספריים טכניים
- אם יש - להשתמש בה
- אם אין - להוסיף פונקציה `renderTechnicalIndicator(value, period, unit)`

### 5.2 שימוש ב-NotificationSystem לאזהרות

**קובץ**: `Backend/services/external_data/atr_calculator.py`

**שינויים**:
- במקרה של התנגשות נתונים - להחזיר metadata עם אזהרה
- Frontend יציג אזהרה דרך `NotificationSystem.showWarning`

### 5.3 תמיכה בעתיד בספקים נוספים דרך הנורמלייזר

**קובץ**: `Backend/services/external_data/data_normalizer.py`

**עקרונות ארכיטקטורה**:
- כל ספק עתידי יעבור דרך `DataNormalizer` - לא ישירות ל-ATRCalculator
- `NormalizedQuote` יכיל `atr` - כך שכל ספק יכול להחזיר ATR
- `ATRCalculator` יעבוד עם `NormalizedQuote` - לא עם ספק ספציפי
- אם ספק עתידי מספק ATR ישירות - הנורמלייזר יאגרג אותו
- אם ספק לא מספק ATR - `ATRCalculator` יחשב מהנתונים ההיסטוריים

## שלב 6: בדיקות ונתוני דוגמה

### 6.1 יצירת סקריפט להוספת נתונים היסטוריים יומיים

**קובץ**: `Backend/scripts/add_historical_daily_ohlc_data_for_atr_test.py`

**פונקציונליות**:
- בוחר ticker דוגמה (למשל AAPL)
- מוסיף MarketDataQuote היסטוריים (15+ ימים) עם:
  - `open_price` - מחיר פתיחה יומי
  - `high_price` - מחיר גבוה יומי
  - `low_price` - מחיר נמוך יומי
  - `close_price` - מחיר סגירה יומי (של היום הקודם)
- מאפשר בדיקה של חישוב ATR מנתונים במערכת
- **מדיניות שמירה**: מעבר ל-30 יום - לשמור רק open/close (לא high/low)

### 6.2 בדיקות

1. **חישוב מנתונים במערכת**: טיקר עם נתונים היסטוריים מספיקים
2. **חישוב מנתונים מהספק**: טיקר ללא נתונים היסטוריים
3. **התנגשות נתונים**: מקרה שבו יש נתונים במערכת אבל שונים מהספק
4. **עדכון העדפות**: שינוי ATR period והשפעה על החישוב
5. **תצוגה בממשק**: בדיקת הצגת ATR במודול פרטי טיקר ובישויות
6. **נורמליזציה**: בדיקת תמיכה בעתיד בספקים נוספים

## שלב 7: Migrations Database

### 7.1 Migration להוספת שדות ATR
**קובץ**: `Backend/migrations/add_atr_fields_to_market_data_quote.py` - כבר קיים ✅

**פעולה**: להריץ את ה-migration אם עדיין לא הורץ

### 7.2 Migration להוספת שדות OHLC יומיים
**קובץ חדש**: `Backend/migrations/add_daily_ohlc_fields_to_market_data_quote.py`

**שינויים**:
- הוספת `high_price` (FLOAT NULL)
- הוספת `low_price` (FLOAT NULL)
- הוספת `close_price` (FLOAT NULL)
- Script idempotent

### 7.3 Migration להוספת העדפת ATR Period
**קובץ**: `Backend/migrations/add_atr_period_preference.py`

**פעולה**: להריץ את ה-migration

## סיכום קבצים לשינוי

### קבצים חדשים:

1. `Backend/services/external_data/atr_calculator.py` - Service לחישוב ATR עם fallback
2. `Backend/migrations/add_daily_ohlc_fields_to_market_data_quote.py` - Migration להוספת high/low/close יומיים
3. `Backend/migrations/add_atr_period_preference.py` - Migration להעדפת ATR period
4. `Backend/scripts/add_historical_daily_ohlc_data_for_atr_test.py` - סקריפט לנתוני דוגמה

### קבצים לעדכון:

1. `Backend/models/external_data.py` - הוספת `high_price`, `low_price`, `close_price` ל-MarketDataQuote
2. `Backend/services/external_data/yahoo_finance_adapter.py` - שמירת OHLC יומי, הסרת חישוב ATR ישיר, הוספת בדיקת התנגשויות
3. `Backend/services/external_data/data_normalizer.py` - הוספת תמיכה ב-ATR ו-OHLC ב-NormalizedQuote
4. `Backend/services/entity_details_service.py` - הוספת ATR לנתוני ticker
5. `trading-ui/scripts/entity-details-renderer.js` - הוספת תצוגת ATR
6. `trading-ui/preferences.html` - הוספת שדה `atr_period` ל-section3 (הגדרות מסחר) - **לא סקשן חדש**
7. `trading-ui/scripts/services/field-renderer-service.js` - הוספת פונקציה להצגת אינדיקטורים טכניים (אם נדרש)

### קבצים שכבר מעודכנים (לא צריך לשנות):

1. `Backend/models/external_data.py` - ATR fields ✅
2. `Backend/routes/external_data/quotes.py` - ATR in API ✅
3. `Backend/routes/api/quotes_v1.py` - ATR in API ✅

## סדר ביצוע מומלץ

1. **שלב 1**: בחינת הארכיטקטורה (אין שינויים בקוד)
2. **שלב 2.1**: הוספת שדות OHLC יומיים ל-MarketDataQuote (model + migration)
3. **שלב 2.2**: יצירת ATRCalculator service עם fallback
4. **שלב 2.3**: שיפור YahooFinanceAdapter - שמירת OHLC יומי
5. **שלב 2.4**: שיפור DataNormalizer לתמיכה ב-ATR (ארכיטקטורה לספקים נוספים)
6. **שלב 3**: הוספת העדפת ATR period (קבוצת trading_settings)
7. **שלב 4**: תצוגת ATR בממשק
8. **שלב 5**: אינטגרציה עם מערכות כלליות
9. **שלב 6**: בדיקות ונתוני דוגמה
10. **שלב 7**: הרצת migrations

## מסקנות והמלצות להמשך

### מסקנות מבדיקת הארכיטקטורה:

1. **מחיר פתיחה וסגירה יומי**:
   - ✅ `open_price` כבר קיים ב-MarketDataQuote
   - ❌ חסרים: `high_price`, `low_price`, `close_price` יומיים
   - **המלצה**: להוסיף שדות אלה כחלק מהתוכנית

2. **מדיניות שמירה**:
   - מעבר ל-30 יום: לשמור רק open/close יומי (לא high/low)
   - עד 30 יום: לשמור OHLC מלא
   - **המלצה**: ליצור cleanup script שמסיר high/low מעבר ל-30 יום

3. **ארכיטקטורה לספקים נוספים**:
   - ✅ DataNormalizer כבר קיים ומטפל בנורמליזציה
   - **המלצה**: ATRCalculator יעבוד עם NormalizedQuote - לא עם ספק ספציפי
   - **המלצה**: אם ספק עתידי מספק ATR ישירות - הנורמלייזר יאגרג אותו

4. **העדפות**:
   - ✅ קבוצת `trading_settings` קיימת (section3)
   - **המלצה**: להוסיף `atr_period` ל-section3 - לא סקשן חדש

## שלב 8: מערכת רמזור ATR

### 8.1 הוספת העדפות רמזור

**העדפות חדשות**:
- **atr_high_threshold**: גבול ATR גבוה (ברירת מחדל 3%)
- **atr_danger_threshold**: גבול ATR מסוכן (ברירת מחדל 5%)

**לוגיקת רמזור**:
- **ירוק**: ATR < גבול גבוה (3%) - נמוך
- **צהוב**: גבול גבוה (3%) ≤ ATR < גבול מסוכן (5%) - בינוני
- **אדום**: ATR ≥ גבול מסוכן (5%) - גבוה

### 8.2 הרחבת מערכת הרינדור

**קובץ**: `trading-ui/scripts/services/field-renderer-service.js`

**פונקציה חדשה**: `FieldRendererService.renderATR(atrValue, atrPercent, options = {})`

**פרמטרים**:
- `atrValue`: ערך ATR מוחלט (מספר)
- `atrPercent`: ערך ATR באחוזים (מספר)
- `options`: אובייקט אופציונלי
  - `highThreshold`: גבול גבוה (default: מהעדפות)
  - `dangerThreshold`: גבול מסוכן (default: מהעדפות)
  - `showValue`: להציג את הערך (default: true)
  - `showBadge`: להציג badge רמזור (default: true)

**לוגיקה**:
1. טעינת העדפות `atr_high_threshold` ו-`atr_danger_threshold`
2. חישוב רמת רמזור לפי `atrPercent`
3. יצירת HTML עם ערך ATR ו-badge רמזור

### 8.3 עדכון מקומות תצוגה

**מקומות לעדכון**:
- מודול פרטי טיקר (`entity-details-renderer.js`)
- טופס הוספת ביצוע (`executions.js`)
- טופס הוספת תכנון מסחר (`trade_plans.js`)
- רשימות עסקאות ותכנונים (`trades.js`, `trade_plans.js`)
- כל מקום אחר שמציג ATR

**שימוש**:
- החלפת תצוגה ידנית של ATR ב-`FieldRendererService.renderATR()`
- העברת `atrPercent` מחושב (ATR / מחיר נוכחי * 100)

## הערות חשובות

1. **עדיפות לנתונים במערכת**: תמיד לנסות קודם נתונים במערכת, רק אם אין מספיק - לטעון מהספק
2. **התנגשויות נתונים**: לבדוק התנגשויות לפני שמירה מהספק ולהציג אזהרה למשתמש
3. **ארכיטקטורה עתידית**: כל הקוד צריך לעבוד דרך DataNormalizer כדי לתמוך בספקים נוספים
4. **מדיניות שמירה**: מעבר ל-30 יום - לשמור רק open/close (לא high/low) - זה הרבה יותר חשוב ממחירים בתוך היום
5. **יחידות רמזור**: ATR באחוזים מחושב כ-`(ATR / מחיר_נוכחי) * 100`
6. **גבולות רמזור**: העדפות באחוזים (3.0 = 3%, 5.0 = 5%)
7. **תאימות אחור**: אם העדפות לא נטענו, להשתמש בברירות מחדל (3% ו-5%)

