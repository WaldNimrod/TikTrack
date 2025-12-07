# תוכנית שיפורים לדשבורד טיקר - Ticker Dashboard

**תאריך יצירה:** 30 נובמבר 2025  
**גרסה:** 1.0.0  
**מטרה:** שיפור דשבורד הטיקר לפי דרישות המשתמש

---

## 📋 רשימת תיקונים

### 1. ATR - שימוש במנגנון הקיים

**בעיה נוכחית:**
- יש כפילות קוד לחישוב ATR ב-`ticker-dashboard.js`
- קיים מנגנון מוכן ב-`ATRCalculator` (Backend) ו-`FieldRendererService.renderATR` (Frontend)
- צריך להשתמש במנגנון הקיים במקום כפילות

**פעולות:**

1. **הסרת כפילות ATR ב-`ticker-dashboard.js`:**
   - הסרת חישוב ATR מקומי (שורות 405-420, 690-702)
   - שימוש ב-`tickerData.atr` מהשרת (כבר מחושב ב-`EntityDetailsService`)
   - שימוש ב-`FieldRendererService.renderATR()` להצגה

2. **וידוא ש-ATR מגיע מהשרת:**
   - בדיקה ש-`EntityDetailsService` מחזיר `atr` ו-`atr_period`
   - בדיקה ש-`ATRCalculator` נקרא ב-`EntityDetailsService`
   - וידוא שהעדפות `atr_period` נקראות

3. **תיקון תצוגת ATR:**
   - שימוש ב-`FieldRendererService.renderATR(atr, atrPercent)` במקום חישוב מקומי
   - הסרת כפילות ב-`renderKPICards` ו-`renderTechnicalIndicators`

**קבצים לעדכון:**
- `trading-ui/scripts/ticker-dashboard.js` - הסרת כפילות, שימוש ב-`FieldRendererService.renderATR()`
- `Backend/services/entity_details_service.py` - וידוא ש-ATR נכלל בנתוני ticker

**תיעוד:**
- `documentation/ATR_IMPLEMENTATION_PLAN.md` - תוכנית מימוש ATR
- `documentation/features/ATR_TRAFFIC_LIGHT_SYSTEM.md` - מערכת רמזור ATR

---

### 2. 52W - חישוב מחיר שיא ושפל ל-52 שבועות

**דרישה:**
- לממש חישוב מחיר שיא ושפל ל-52 שבועות אחרונים
- להשתמש באותה לוגיקה כמו ATR (מנגנון כללי)
- להציג ב-KPI Cards

**פעולות:**

1. **יצירת Service לחישוב 52W (Backend):**
   - קובץ חדש: `Backend/services/external_data/week52_calculator.py`
   - פונקציה: `calculate_52w_range(ticker_id, db_session)`
   - לוגיקה:
     - טעינת נתונים היסטוריים מ-52 שבועות אחרונים (365 ימים)
     - חישוב `high_52w` = max(high_price) מ-52 שבועות
     - חישוב `low_52w` = min(low_price) מ-52 שבועות
     - החזרת `Week52Result` עם `high`, `low`, `source`, `data_points_used`

2. **הוספת 52W ל-EntityDetailsService:**
   - קובץ: `Backend/services/entity_details_service.py`
   - הוספת `week52_high` ו-`week52_low` לנתוני ticker
   - קריאה ל-`Week52Calculator.calculate_52w_range()`

3. **הוספת תצוגת 52W ב-Frontend:**
   - קובץ: `trading-ui/scripts/ticker-dashboard.js`
   - עדכון `renderKPICards()` להציג 52W range
   - פורמט: `"52W: {low} - {high}"` או `"52W: {low} / {high}"`
   - שימוש ב-`FieldRendererService.renderAmount()` לעיצוב

4. **הוספת FieldRendererService.renderWeek52Range() (אופציונלי):**
   - קובץ: `trading-ui/scripts/services/field-renderer-service.js`
   - פונקציה להצגת 52W range עם עיצוב אחיד
   - פורמט: `"52W: {low} - {high}"` עם עיצוב נכון

**קבצים חדשים:**
- `Backend/services/external_data/week52_calculator.py` - Service לחישוב 52W

**קבצים לעדכון:**
- `Backend/services/entity_details_service.py` - הוספת 52W לנתוני ticker
- `trading-ui/scripts/ticker-dashboard.js` - תצוגת 52W ב-KPI Cards
- `trading-ui/scripts/services/field-renderer-service.js` - פונקציה להצגת 52W (אופציונלי)

**תיעוד:**
- `documentation/ATR_IMPLEMENTATION_PLAN.md` - דוגמה ללוגיקה דומה

---

### 3. גרף מחיר - מימוש TradingView Lightweight Charts

**דרישה:**
- לבדוק את עמוד המוקאפ `price-history-page.html`
- ללמוד תעוד TradingView Lightweight Charts
- לממש גרף מחיר בדשבורד לפי התעוד

**פעולות:**

1. **לימוד תעוד TradingView Lightweight Charts:**
   - קובץ: `documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_FEATURES_CHECKLIST.md`
   - קובץ: `trading-ui/mockups/daily-snapshots/price-history-page.html`
   - קובץ: `trading-ui/scripts/price-history-page.js`
   - קובץ: `trading-ui/scripts/tradingview-adapter.js`

2. **שיפור `initPriceChart()` ב-`ticker-dashboard.js`:**
   - שימוש ב-`TradingViewChartAdapter` (כבר קיים)
   - טעינת נתונים היסטוריים מ-`loadHistoricalData()`
   - המרת נתונים לפורמט TradingView: `{ time, open, high, low, close, volume }`
   - הוספת Candlestick Series לגרף
   - הוספת Volume Series (אופציונלי)
   - תמיכה ב-Theme (dark/light) מהעדפות

3. **שיפור `loadHistoricalData()`:**
   - קובץ: `trading-ui/scripts/services/ticker-dashboard-data.js`
   - וידוא שהנתונים בפורמט נכון
   - המרת timestamps לפורמט TradingView (Unix timestamp או YYYY-MM-DD)

4. **הוספת אפשרויות גרף:**
   - Zoom in/out
   - Time range selector (1D, 1W, 1M, 3M, 1Y, All)
   - Chart type selector (Candlestick, Line, Area)
   - Volume overlay toggle

**קבצים לעדכון:**
- `trading-ui/scripts/ticker-dashboard.js` - שיפור `initPriceChart()`
- `trading-ui/scripts/services/ticker-dashboard-data.js` - שיפור `loadHistoricalData()`

**תיעוד:**
- `documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_FEATURES_CHECKLIST.md`
- `trading-ui/mockups/daily-snapshots/price-history-page.html` - דוגמה

---

### 4. מדדים טכניים - איחוד לסקשן העליון

**דרישה:**
- לאחד את כל המדדים הטכניים לסקשן העליון
- להסיר כפילות ATR
- להוסיף מנגנונים כלליים לחישוב נתונים חסרים
- להוסיף הסבר בעברית לכל נתון

**פעולות:**

1. **איחוד מדדים טכניים:**
   - הסרת סקשן `ticker-dashboard-technical` נפרד
   - הוספת מדדים טכניים ל-KPI Cards (סקשן עליון)
   - מדדים לכלול:
     - ATR (כבר קיים, להסיר כפילות)
     - Volatility (אם זמין)
     - 52W Range (חדש)
     - Volume (כבר קיים)
     - RSI (אם זמין)
     - MACD (אם זמין)

2. **הוספת הסברים בעברית:**
   - יצירת קובץ: `trading-ui/scripts/services/technical-indicators-help.js`
   - פונקציה: `getIndicatorHelp(indicatorName)` - מחזיר הסבר בעברית
   - הוספת tooltip או info icon ליד כל מדד
   - הסברים:
     - ATR: "טווח תנודה ממוצע - מדד לתנודתיות השוק"
     - Volatility: "תנודתיות - מידת השינוי במחיר"
     - 52W Range: "טווח מחירים ל-52 שבועות אחרונים"
     - Volume: "נפח מסחר - כמות המניות שנסחרו"
     - RSI: "מדד חוזק יחסי - מצביע על מצב קנייה/מכירה"
     - MACD: "ממוצע נע מתכנס-מתבדר - מדד מומנטום"

3. **מנגנונים כלליים לחישוב נתונים חסרים:**
   - יצירת קובץ: `Backend/services/external_data/technical_indicators_calculator.py`
   - פונקציות:
     - `calculate_volatility(historical_data, period=20)` - חישוב תנודתיות
     - `calculate_rsi(historical_data, period=14)` - חישוב RSI
     - `calculate_macd(historical_data)` - חישוב MACD
   - אינטגרציה עם `EntityDetailsService` - הוספת מדדים לנתוני ticker

4. **עדכון HTML:**
   - הסרת `<section id="ticker-dashboard-technical">` מ-`ticker-dashboard.html`
   - הוספת מדדים טכניים ל-KPI Cards
   - הוספת info icons ליד כל מדד

**קבצים חדשים:**
- `trading-ui/scripts/services/technical-indicators-help.js` - הסברים בעברית
- `Backend/services/external_data/technical_indicators_calculator.py` - חישוב מדדים

**קבצים לעדכון:**
- `trading-ui/ticker-dashboard.html` - הסרת סקשן נפרד, הוספת info icons
- `trading-ui/scripts/ticker-dashboard.js` - הסרת `renderTechnicalIndicators()`, איחוד ל-`renderKPICards()`
- `Backend/services/entity_details_service.py` - הוספת מדדים טכניים

---

### 5. תנאי דוגמה לטיקר QQQ

**דרישה:**
- לייצר תנאי דוגמה לטיקר QQQ (ticker_id=7) לצורך בדיקה

**פעולות:**

1. **יצירת סקריפט להוספת תנאי דוגמה:**
   - קובץ חדש: `Backend/scripts/create_sample_condition_for_qqq.py`
   - פונקציונליות:
     - יצירת Trade Plan עם תנאי דוגמה לטיקר QQQ
     - תנאי דוגמה:
       - "מחיר מעל 52W High"
       - "ATR נמוך מ-3%"
       - "Volume מעל ממוצע 20 יום"
     - שמירה ב-Database

2. **או יצירת תנאי דרך API:**
   - שימוש ב-API `/api/trade-plans` ליצירת Trade Plan
   - הוספת תנאים דרך `/api/trade-plans/{id}/conditions`

**קבצים חדשים:**
- `Backend/scripts/create_sample_condition_for_qqq.py` - סקריפט ליצירת תנאי דוגמה

**קבצים לבדיקה:**
- `Backend/routes/api/trade_plans.py` - API ליצירת Trade Plans
- `Backend/models/trade_plan.py` - מודל Trade Plan

---

## סדר ביצוע מומלץ

1. **שלב 1: ATR** - הסרת כפילות ושימוש במנגנון הקיים
2. **שלב 2: 52W** - מימוש חישוב 52W range
3. **שלב 3: גרף מחיר** - שיפור גרף TradingView
4. **שלב 4: מדדים טכניים** - איחוד והסבר בעברית
5. **שלב 5: תנאי דוגמה** - יצירת תנאי דוגמה ל-QQQ

---

## קריטריוני הצלחה

1. ✅ ATR מוצג באמצעות `FieldRendererService.renderATR()` ללא כפילות
2. ✅ 52W range מחושב ומוצג ב-KPI Cards
3. ✅ גרף מחיר עובד עם נתונים היסטוריים
4. ✅ כל המדדים הטכניים מאוחדים בסקשן העליון עם הסברים בעברית
5. ✅ תנאי דוגמה קיים לטיקר QQQ

---

## קבצים מרכזיים

### Frontend:
- `trading-ui/scripts/ticker-dashboard.js` - לוגיקה ראשית
- `trading-ui/scripts/services/ticker-dashboard-data.js` - שירותי נתונים
- `trading-ui/scripts/services/field-renderer-service.js` - רינדור שדות
- `trading-ui/ticker-dashboard.html` - HTML

### Backend:
- `Backend/services/entity_details_service.py` - שירות פרטי ישויות
- `Backend/services/external_data/atr_calculator.py` - חישוב ATR
- `Backend/services/external_data/week52_calculator.py` - חישוב 52W (חדש)
- `Backend/services/external_data/technical_indicators_calculator.py` - חישוב מדדים (חדש)

### תיעוד:
- `documentation/ATR_IMPLEMENTATION_PLAN.md` - תוכנית ATR
- `documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_FEATURES_CHECKLIST.md` - תעוד TradingView



