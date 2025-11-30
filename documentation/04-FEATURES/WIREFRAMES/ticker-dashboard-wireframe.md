# Wireframe - עמוד טיקר מורחב (Ticker Dashboard)

**תאריך יצירה:** 28 בינואר 2025  
**מבוסס על:** `/Users/nimrod/Documents/TikTrack/_Tmp/mockup - gup report/ticker_dashboard.html`  
**סטטוס:** ✅ אושר למימוש

---

## מבנה כללי

```
┌─────────────────────────────────────────────────────────────┐
│ Header System (unified-header)                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ סקירה כללית - [SYMBOL]                                 │ │
│ │                                                         │ │
│ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │ │
│ │ │מחיר │ │שינוי │ │ ATR  │ │נפח  │ │ 52W │         │ │
│ │ │243.22│ │+1.74%│ │ 4.12 │ │ 98M │ │102-299│         │ │
│ │ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ גרף מחיר מרכזי                                          │ │
│ │                                                         │ │
│ │ [TradingView Lightweight Charts - Candlestick/Line]    │ │
│ │ Height: 50vh (50% of viewport height)                  │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ מדדים טכניים                                           │ │
│ │                                                         │ │
│ │ • ATR: 4.12 (with traffic light indicator)            │ │
│ │ • Volatility: 2.1%                                     │ │
│ │ • Volume Profile: [Chart/Visualization]               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ פעילות המשתמש בנכס                                     │ │
│ │                                                         │ │
│ │ תוכניות טרייד:                                        │ │
│ │ • תוכנית 1 – R/R 3.4 – STOP: 220 → TARGET: 290       │ │
│ │                                                         │ │
│ │ טריידים:                                              │ │
│ │ • טרייד פתוח – 8 יח' – רווח: 324$                    │ │
│ │                                                         │ │
│ │ עסקאות:                                               │ │
│ │ • קנייה – 4 יח' במחיר 230                            │ │
│ │                                                         │ │
│ │ התראות:                                               │ │
│ │ • Alert: המחיר מתקרב ל-ATR High                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ תנאים (Conditions) המשויכים לנכס                       │ │
│ │                                                         │ │
│ │ • מחיר > ATR20 → מייצר התראה                          │ │
│ │ • Volatility עולה → שייך לתוכנית טרייד               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## סעיפים מפורטים

### 1. סקירה כללית (KPI Cards)

**מיקום:** בחלק העליון של העמוד  
**גובה:** ~120px  
**טכנולוגיה:** InfoSummarySystem או KPI Cards מותאמים אישית

**KPI נדרשים:**
- **מחיר נוכחי** - `current_price` מ-`MarketDataQuote`
- **שינוי יומי** - `daily_change` ו-`daily_change_percent`
- **ATR** - עם רמזור (FieldRendererService.renderATR)
- **נפח** - `volume` מ-`MarketDataQuote`
- **טווח 52 שבועות** - `52w_high` ו-`52w_low` (אם זמין)

**עיצוב:**
- Grid layout: 5 עמודות (responsive: 2-3-5)
- Cards עם רקע בהיר
- עיצוב עקבי עם InfoSummarySystem

---

### 2. גרף מחיר מרכזי

**מיקום:** מתחת לסקירה כללית  
**גובה:** 50vh (50% מגובה המסך)  
**טכנולוגיה:** TradingViewChartAdapter

**סוג גרף:**
- **ברירת מחדל:** Candlestick Chart
- **אופציות:** Line Chart, Area Chart (toggle)

**תכונות:**
- Time scale בתחתית
- Price scale בצד ימין
- Volume overlay (HistogramSeries) - אופציונלי
- Responsive - מתאים את עצמו לרוחב המסך

**נתונים:**
- IntradayDataSlot (15 דקות) או Daily data
- טווח זמן: 30 יום אחרונים (ברירת מחדל)
- אפשרות לשנות טווח: 1D, 1W, 1M, 3M, 1Y

---

### 3. מדדים טכניים

**מיקום:** מתחת לגרף  
**גובה:** ~200px  
**טכנולוגיה:** Cards עם FieldRendererService

**מדדים:**
1. **ATR** - עם רמזור (FieldRendererService.renderATR)
2. **Volatility** - חישוב מ-ATR או נתונים חיצוניים
3. **Volume Profile** - ויזואליזציה של נפח (אם זמין)

**עיצוב:**
- 3 Cards בשורה (responsive: 1-2-3)
- כל Card עם כותרת וערך
- ATR עם רמזור צבעוני

---

### 4. פעילות המשתמש בנכס

**מיקום:** מתחת למדדים טכניים  
**גובה:** דינמי (לפי כמות נתונים)  
**טכנולוגיה:** LinkedItemsService

**תת-סעיפים:**
1. **תוכניות טרייד (Trade Plans)**
   - רשימה של תוכניות המשויכות לטיקר
   - הצגת R/R, STOP, TARGET
   - קישור ל-EntityDetailsModal

2. **טריידים (Trades)**
   - טריידים פתוחים וסגורים
   - הצגת כמות, רווח/הפסד
   - קישור ל-EntityDetailsModal

3. **עסקאות (Executions)**
   - רשימת עסקאות אחרונות
   - הצגת כמות, מחיר
   - קישור ל-EntityDetailsModal

4. **התראות (Alerts)**
   - התראות פעילות המשויכות לטיקר
   - הצגת תנאי ההתראה
   - קישור ל-EntityDetailsModal

**עיצוב:**
- Accordion או Tabs לכל סוג פעילות
- רשימה עם FieldRendererService
- כפתורי "צפה בפרטים" לכל פריט

---

### 5. תנאים (Conditions)

**מיקום:** בחלק התחתון  
**גובה:** דינמי  
**טכנולוגיה:** Conditions System

**תוכן:**
- רשימת תנאים המשויכים לטיקר
- הצגת תנאי ההתראה/תוכנית
- קישור ל-EntityDetailsModal

**עיצוב:**
- רשימה עם FieldRendererService
- כל תנאי עם כותרת ותיאור

---

## אינטגרציות נדרשות

### מערכות לשימוש:
- ✅ **TradingViewChartAdapter** - לגרף מחיר מרכזי
- ✅ **FieldRendererService** - לרנדור KPI וערכים
- ✅ **InfoSummarySystem** - לסטטיסטיקות מהירות
- ✅ **LinkedItemsService** - לפעילות המשתמש
- ✅ **Conditions System** - לתנאים המשויכים
- ✅ **UnifiedCacheManager** - למטמון נתונים
- ✅ **NotificationSystem** - להודעות שגיאה/הצלחה
- ✅ **Button System** - לכפתורים סטנדרטיים
- ✅ **Icon System** - לאייקונים
- ✅ **Header System** - לתפריט ופילטרים

### API Endpoints נדרשים:
- `/api/tickers/{id}/dashboard` - נתוני דשבורד מלא
- `/api/tickers/{id}/technical-indicators` - מדדים טכניים
- `/api/tickers/{id}/user-activity` - פעילות המשתמש
- `/api/tickers/{id}/conditions` - תנאים משויכים

---

## Responsive Design

**Desktop (> 768px):**
- 5 KPI Cards בשורה
- גרף בגובה 50vh
- 3 Cards למדדים טכניים

**Tablet (768px - 1024px):**
- 3 KPI Cards בשורה
- גרף בגובה 40vh
- 2 Cards למדדים טכניים

**Mobile (< 768px):**
- 2 KPI Cards בשורה
- גרף בגובה 30vh
- 1 Card למדדים טכניים

---

## States & Loading

**Loading State:**
- Skeleton loaders לכל סעיף
- Spinner במרכז הגרף
- showLoadingState/hideLoadingState

**Empty State:**
- הודעת "אין נתונים זמינים" לכל סעיף
- כפתור "רענן" או "טען נתונים"

**Error State:**
- NotificationSystem.showError
- הודעת שגיאה ברורה
- כפתור "נסה שוב"

---

## Navigation & Links

**קישורים נדרשים:**
- מעמוד `tickers.html` → `ticker-dashboard.html?tickerId={id}`
- מ-`EntityDetailsModal` → כפתור "צפה בדשבורד מורחב"
- חזרה ל-`tickers.html` או `EntityDetailsModal`

**URL Structure:**
- `/ticker-dashboard.html?tickerId=123`
- `/ticker-dashboard.html?tickerSymbol=TSLA`

---

## Notes

- שמירה על המודולים הקיימים - לא להחליף `showEntityDetails` או `EntityDetailsModal`
- שימוש במערכות כלליות - לא ליצור מערכות חדשות
- Responsive design - תמיכה בכל הגדלי מסך
- Accessibility - תמיכה ב-ARIA labels ו-keyboard navigation


