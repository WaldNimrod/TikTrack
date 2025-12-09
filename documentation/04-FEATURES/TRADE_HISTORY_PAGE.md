# עמוד היסטוריית טרייד - Trade History Page

**תאריך יצירה:** 2025-12-07  
**גרסה:** 2.0.5  
**סטטוס:** ✅ מוכן לשימוש

---

## סקירה כללית

עמוד היסטוריית טרייד מספק ניתוח מקיף של טרייד בודד, כולל:

- ציר זמן מפורט של כל האירועים
- גרף אינטראקטיבי עם כל הנתונים
- סטטיסטיקות מפורטות
- השוואת תכנון vs ביצוע
- פריטים מקושרים

---

## קבצים מרכזיים

### Frontend

- `trading-ui/trade-history.html` - מבנה HTML וגרף
- `trading-ui/scripts/trade-history-page.js` - לוגיקת העמוד
- `trading-ui/scripts/services/trade-history-data.js` - שירות טעינת נתונים

### Backend

- `Backend/routes/api/trade_history.py` - API endpoints
- `Backend/services/business_logic/historical_data_business_service.py` - לוגיקת עסקים

---

## פיצ'רים עיקריים

### 1. בחירת טרייד

**כפתורים:**

- **"בחר טרייד"** - פותח מודל בחירת טרייד
  - חיפוש לפי טיקר
  - בחירת טרייד מהרשימה
- **"נקה בחירה"** - מנקה את הבחירה הנוכחית

**פונקציות:**

- `openTradeSelectorModal()` - פתיחת מודל בחירה
- `clearSelectedTrade()` - ניקוי בחירה

---

### 2. סקשן פרטי הטרייד

**כפתורים:**

- **"פרטים"** - פותח מודול פרטים מלא של הטרייד

**נתונים מוצגים:**

- **מידע בסיסי:**
  - טיקר, צד, סוג השקעה, סטטוס, חשבון מסחר
- **תאריכים:**
  - תאריך תכנון, פתיחה, כניסה, יציאה
- **כמויות:**
  - כמות מתוכננת, מקסימאלית, סה"כ קניות
- **תנאים וסיבות:**
  - כל התנאים והסיבות
- **רווח והפסד:**
  - ממומש, לא ממומש, סה"כ

---

### 3. סקשן סטטיסטיקות

**נתונים מוצגים:**

- משך זמן (ימים)
- P/L כולל (מספר ואחוז)
- אחוז תשואה
- מספר ביצועים

---

### 4. טבלת פירוט צעדים

**מבנה הטבלה:**

- עמודות: איקון, סוג, פרטים, פעולות
- שורות: כל האירועים בטרייד
- שורות משך זמן: בין כל שתי רשומות

**סוגי אובייקטים נתמכים:**

- Trade
- Trade Plan
- Execution
- Note
- Alert
- Cash Flow
- Alert Activation

**פונקציות:**

- `renderTimelineTable(timelineData)` - רינדור הטבלה
- כפתור "פרטים" בכל שורה - פותח מודול פרטים

---

### 5. גרף טיימליין

**סדרות בגרף:**

1. **מחיר נכס** (Candlestick/Line) - מחירי סגירה יומיים
2. **גודל פוזיציה** (Line - Stepped) - גודל פוזיציה מצטבר
3. **שווי פוזיציה** (Area) - שווי פוזיציה (גודל × מחיר נוכחי)
4. **מחיר ממוצע** (Line - Dashed) - מחיר ממוצע משוקלל
5. **P/L ממומש** (Line) - רווח/הפסד מוכר מצטבר
6. **P/L לא ממומש** (Line) - רווח/הפסד לא מוכר
7. **P/L כולל** (Line) - סה"כ רווח/הפסד

**כפתורי בקרה:**

- **זום פנימה** - הגדלת זום
- **זום החוצה** - הקטנת זום
- **איפוס זום** - חזרה לתצוגה מלאה
- **תזוזה ימינה** - תזוזה לעבר העתיד
- **תזוזה שמאלה** - תזוזה לעבר העבר

**Tooltips:**

- תאריך ושעה
- מחיר נכס (Open, High, Low, Close)
- גודל פוזיציה, שווי, מחיר ממוצע
- רווח/הפסד (ממומש, לא ממומש, סה"כ)
- צבעים לפי חיובי/שלילי

**Legend:**

- רשימת כל הסדרות עם צבעים
- אפשרות להסתיר/להציג סדרות
- עדכון אוטומטי לפי בחירת המשתמש

**פונקציות:**

- `initTimelineChart()` - אתחול הגרף
- `setupChartTooltips()` - הגדרת Tooltips
- `setupChartLegend()` - הגדרת Legend

---

### 6. סקשן Plan vs Execution

**תוכן:**

- טבלה המשווה תכנון vs ביצוע
- חישובי הבדלים
- כל הנתונים הרלוונטיים

---

### 7. סקשן פריטים מקושרים

**תוכן:**

- כל הפריטים המקושרים לטרייד
- כפתורי פעולה: פרטים, עריכה, מחיקה

---

### 8. כפתור ייצוא

**פונקציונליות:**

- ייצוא נתונים ל-Excel/CSV
- כל הנתונים מיוצאים

**פונקציה:**

- `exportData()` - ייצוא נתונים

---

### 9. טעינת נתונים חיצוניים

**תהליך:**

1. בדיקת נתונים חסרים (מחירי שוק היסטוריים)
2. הודעת אישור מפורטת למשתמש
3. טעינת נתונים חיצוניים דרך ExternalDataService
4. Progress indicator
5. הודעת הצלחה

**פונקציות:**

- `checkAndFetchMissingHistoricalPrices()` - בדיקה וטעינה
- `showMissingHistoricalDataConfirmation()` - הודעת אישור
- `fetchHistoricalPrices()` - טעינת נתונים

---

## Cache Management

### מדיניות מטמון

**IndexedDB (2 ימים):**

- Timeline data
- Chart data
- Position data
- P/L data
- Full analysis

**Backend Cache (5-10 דקות):**

- Statistics

**כל המטמון דרך UnifiedCacheManager בלבד**

---

## API Endpoints

### כללי (נפרד - רלוונטי לממשקים אחרים)

1. **`GET /api/trade-history/{trade_id}/timeline`**
   - ציר זמן של טרייד
   - Query params: `include_durations` (boolean, default: true)
   - Cache: IndexedDB, 2 ימים

2. **`GET /api/trade-history/{trade_id}/chart-data`**
   - נתוני גרף
   - Query params: `days_before` (int, default: 7), `days_after` (int, default: 7)
   - Cache: IndexedDB, 2 ימים

3. **`GET /api/trade-history/{trade_id}/statistics`**
   - סטטיסטיקות מפורטות
   - Cache: Backend, 5-10 דקות

### מאוחד (ספציפי - רק לעמוד trade-history)

4. **`GET /api/trade-history/{trade_id}/full-analysis`**
   - ניתוח מלא (timeline + chart + statistics)
   - Query params: `days_before`, `days_after`, `include_durations`
   - Cache: IndexedDB, 2 ימים

---

## Backend Business Logic

כל החישובים ב-`HistoricalDataBusinessService`:

1. **`calculate_trade_timeline()`**
   - חישוב ציר זמן מלא
   - כולל: פוזיציה, מחיר ממוצע, P/L מוכר ולא מוכר

2. **`calculate_trade_chart_data()`**
   - חישוב נתוני גרף
   - כולל: מחירי שוק, נתוני פוזיציה, נתוני P/L

3. **`calculate_trade_statistics_detailed()`**
   - חישוב סטטיסטיקות מפורטות

4. **`calculate_trade_full_analysis()`**
   - חישוב ניתוח מלא (קורא לכל הפונקציות לעיל)

---

## אינטגרציה עם מערכות אחרות

### מערכות בשימוש

- **UnifiedCacheManager** - מטמון
- **NotificationSystem** - הודעות
- **Logger Service** - לוגים
- **IconSystem** - איקונים
- **FieldRendererService** - רינדור שדות
- **EntityDetailsModal** - מודול פרטים
- **ExternalDataService** - נתונים חיצוניים
- **UnifiedProgressManager** - Progress indicators
- **TradingViewChartAdapter** - גרפים

---

## דוגמאות שימוש

### טעינת ניתוח מלא

```javascript
const fullAnalysis = await window.TradeHistoryData.loadTradeFullAnalysis(tradeId, {
    days_before: 7,
    days_after: 7,
    include_durations: true
});
```

### טעינת ציר זמן

```javascript
const timeline = await window.TradeHistoryData.loadTradeTimeline(tradeId, {
    include_durations: true
});
```

### טעינת נתוני גרף

```javascript
const chartData = await window.TradeHistoryData.loadTradeChartData(tradeId, {
    days_before: 7,
    days_after: 7
});
```

---

## הערות חשובות

1. **כל החישובים ב-Backend** - Frontend רק להצגה
2. **מטמון דרך UnifiedCacheManager בלבד** - אין יוצא מהכלל
3. **אין mock data** - אם נתונים חסרים, מציגים הודעת שגיאה
4. **תמיכה ב-DateEnvelope** - כל התאריכים מנורמלים
5. **Responsive Design** - העמוד responsive לכל הגדלי מסך

---

## בדיקות

ראה: `documentation/03-DEVELOPMENT/TESTING/TRADE_HISTORY_PAGE_TEST_RESULTS.md`

---

## תעוד נוסף

- `documentation/03-DEVELOPMENT/PLANS/TRADE_HISTORY_PAGE_FINAL_IMPLEMENTATION_PLAN.md`
- `documentation/02-ARCHITECTURE/FRONTEND/HISTORICAL_DATA_SERVICES.md`





