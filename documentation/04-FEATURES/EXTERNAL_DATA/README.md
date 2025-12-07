# External Data System - מערכת נתונים חיצוניים

**תאריך עדכון אחרון:** 2025-12-07  
**גרסה:** 3.0.0

---

## סקירה כללית

מערכת הנתונים החיצוניים מספקת אינטגרציה מלאה עם ספקי נתונים חיצוניים (Yahoo Finance, וכו') לטעינת נתוני שוק, נתונים היסטוריים, וחישובים טכניים.

---

## תיעוד זמין

### מדריכים למפתחים

1. **[External Data Optimization Developer Guide](../../03-DEVELOPMENT/GUIDES/EXTERNAL_DATA_OPTIMIZATION_DEVELOPER_GUIDE.md)** ⭐ **חדש**
   - מדריך מקיף למפתחים עתידיים
   - ארכיטקטורה, שימוש, Best Practices
   - Troubleshooting

### מערכות מרכזיות

2. **[Data Refresh Policy](./DATA_REFRESH_POLICY.md)** ⭐ **חדש**
   - מדיניות רענון נתונים
   - תדירויות רענון שונות לסוגי נתונים
   - API Reference מלא

3. **[Missing Data Checker](./MISSING_DATA_CHECKER.md)** ⭐ **חדש**
   - זיהוי נתונים חסרים
   - בדיקת עדכניות נתונים
   - המלצות עם עדיפויות

### ארכיטקטורה

4. **[External Data Service System](../../02-ARCHITECTURE/FRONTEND/EXTERNAL_DATA_SERVICE_SYSTEM.md)**
   - מערכת Frontend
   - API Reference
   - שימוש בדשבורד טיקרים

### דוחות

5. **[External Data Optimization Test Results](../../05-REPORTS/EXTERNAL_DATA_OPTIMIZATION_TEST_RESULTS.md)** ⭐ **חדש**
   - תוצאות בדיקות מקיפות
   - סטטוס מימוש
   - בעיות שזוהו

6. **[External Data System Analysis Report](../../05-REPORTS/EXTERNAL_DATA_SYSTEM_ANALYSIS_REPORT.md)**
   - ניתוח מקיף של המערכת
   - סטטוס מימוש
   - תכונות שהושלמו

7. **[External Data System Final Status](../../05-REPORTS/EXTERNAL_DATA_SYSTEM_FINAL_STATUS.md)**
   - דוח סטטוס סופי
   - תוצאות בדיקות
   - נתונים במערכת

---

## תכונות עיקריות

### ✅ אופטימיזציה (2025-12-07)

- **טעינה רק של נתונים חסרים** - לא את כל הנתונים
- **גודל קבוצות אופטימלי** - 25 טיקרים
- **לוגיקה דינמית** - הקטנת גודל קבוצה במקרה של שגיאות
- **טעינת נתונים היסטוריים פעם ביום** - אחרי סגירת השוק
- **חישוב אינדיקטורים אוטומטי** - אחרי טעינת נתונים היסטוריים

### ✅ תכונות קיימות

- **Yahoo Finance Integration** - אינטגרציה מלאה
- **Real-time Data Fetching** - נתונים בזמן אמת
- **Historical Data** - 150 ימים של נתונים היסטוריים
- **Technical Indicators** - ATR, MA 20, MA 150, Volatility, 52W Range
- **Scheduler** - רענון אוטומטי ברקע
- **Missing Data Detection** - זיהוי נתונים חסרים
- **Cache System** - מטמון עם TTL

---

## קבצים מרכזיים

### Backend

- `Backend/services/external_data/data_refresh_policy.py` - מדיניות רענון
- `Backend/services/external_data/missing_data_checker.py` - בודק נתונים חסרים
- `Backend/services/data_refresh_scheduler.py` - Scheduler אוטומטי
- `Backend/services/external_data/yahoo_finance_adapter.py` - Adapter ל-Yahoo Finance
- `Backend/routes/external_data/quotes.py` - API endpoints
- `Backend/routes/external_data/status.py` - Status endpoints

### Frontend

- `trading-ui/scripts/external-data-service.js` - Frontend service
- `trading-ui/scripts/external-data-dashboard.js` - Dashboard logic
- `trading-ui/scripts/ticker-dashboard.js` - Ticker dashboard
- `trading-ui/scripts/tickers.js` - Tickers page

---

## Quick Start

### למפתח חדש

1. קרא את [External Data Optimization Developer Guide](../../03-DEVELOPMENT/GUIDES/EXTERNAL_DATA_OPTIMIZATION_DEVELOPER_GUIDE.md)
2. הבן את [Data Refresh Policy](./DATA_REFRESH_POLICY.md)
3. למד על [Missing Data Checker](./MISSING_DATA_CHECKER.md)
4. עיין ב-[External Data Service System](../../02-ARCHITECTURE/FRONTEND/EXTERNAL_DATA_SERVICE_SYSTEM.md)

### לשימוש במערכת

```javascript
// Check missing data first
const missingData = await fetch('/api/external-data/status/tickers/missing-data');

// Refresh only missing data
await window.ExternalDataService.refreshTickerData(tickerId, {
    forceRefresh: false  // Let backend decide what to load
});
```

---

## Support

לשאלות או בעיות, פנה לצוות הפיתוח או פתח issue ב-repository.

