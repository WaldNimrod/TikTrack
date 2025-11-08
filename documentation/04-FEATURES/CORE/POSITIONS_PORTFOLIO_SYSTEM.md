# Positions & Portfolio System - TikTrack
# מערכת פוזיציות ופורטפוליו

**תאריך:** ינואר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ Backend מוכן, Frontend בפיתוח

---

## 📋 סקירה כללית

מערכת לניהול פוזיציות ופורטפוליו המאפשרת:
- חישוב פוזיציות לפי טיקר+חשבון
- תמיכה בפוזיציות ספונטניות (ללא trade_id)
- תמיכה בפוזיציות מרובות טריידים
- חישובי שווי שוק, רווח/הפסד, ואחוזים
- ממשקים לטבלאות פוזיציות ופורטפוליו

---

## 🎯 דרישות

### מבנה פוזיציה
- **מזהה**: מזהה ייחודי (חישובי)
- **חשבון מסחר**: חובה (trading_account_id)
- **טיקר**: חובה (ticker_id)
- **כמות נוכחית**: מחושבת על בסיס ביצועים
- **מחיר ממוצע**: מחושב כולל עמלות (ברוטו ונטו)
- **קישור לטרייד**: אופציונאלי בלבד (אין קישור לתוכנית)

### מצבי פוזיציה
- **פתוח לונג**: כמות > 0
- **פתוח שורט**: כמות < 0
- **סגור**: כמות = 0

### נתונים מחושבים
כל פוזיציה כוללת 14 נתונים מחושבים:
1. סה"כ קניה (סכום וכמות)
2. סה"כ מכירה (סכום וכמות)
3. שווי שוק (כמות × מחיר שוק)
4. עלות הפוזיציה הנוכחית
5. רווח/הפסד מוכר (סכום ואחוז)
6. רווח/הפסד לא מוכר (סכום ואחוז)
7. סה"כ עמלות
8. מחיר ממוצע כולל עמלות
9. אחוז משווי החשבון
10. אחוז משווי כלל האחזקות
11. אחוז משווי כלל האחזקות מאותו סוג השקעה

---

## 🏗️ ארכיטקטורה

### גישה שנבחרה: היברידית (Hybrid Cache)

**נימוקים:**
- עקביות עם UnifiedCacheSystem הקיים
- ביצועים מעולים (cache hits מהירים)
- דיוק נתונים (invalidation אוטומטי)
- גמישות (TTL ניתן להתאמה)

### רכיבי המערכת

#### Backend
- `PositionPortfolioService` - שירות חישוב פוזיציות
- `positions.py` - API endpoints
- אינטגרציה עם `MarketDataQuote` למחירי שוק
- Cache עם dependencies

#### Frontend (בפיתוח)
- טבלת פוזיציות לפי חשבון
- טבלת פורטפוליו מלא
- וויזארד סיכום (מינימאלי ומלא)

---

## 📊 ממשקים

### 1. טבלת פוזיציות לפי חשבון
- Dropdown בחירת חשבון (ברירת מחדל מהעדפות)
- טבלה עם כל הנתונים המחושבים
- לחיצה על פוזיציה → מודול פרטים מלא

### 2. טבלת פורטפוליו מלא
- פילטר לפי צד (לונג, שורט, הכול)
- צ'קבוקס "הצג פוזיציות סגורות"
- צ'קבוקס "אחד פוזיציות בין חשבונות"

### 3. וויזארד סיכום
- שני גדלים: מינימאלי ומלא
- אינטגרציה עם InfoSummarySystem

---

## 🔄 תזרימי נתונים

### חישוב פוזיציה
```
User Request
    ↓
API Endpoint (/api/positions/account/<id>)
    ↓
Check Cache (60s TTL)
    ↓
[Cache Hit] → Return cached data
[Cache Miss] → PositionPortfolioService.calculate_all_account_positions()
    ↓
Query Executions (by ticker_id + trading_account_id)
    ↓
Calculate Position Metrics
    ↓
Get Market Price (MarketDataQuote)
    ↓
Calculate Market Value, P/L, Percentages
    ↓
Return JSON + Cache
```

### עדכון אחרי ביצוע חדש
```
Execution Created/Updated/Deleted
    ↓
Cache Invalidation (positions, portfolio)
    ↓
Next Request → Fresh Calculation
```

---

## 💾 Cache Strategy

### Backend Cache
- **TTL**: 60 שניות
- **Dependencies**: `executions`, `market_data_quotes`
- **Invalidation**: אוטומטי על execution changes

### Frontend Cache (עתידי)
- **UnifiedCacheManager**: TTL 5 דקות
- **Layer**: backend
- **Dependencies**: `executions`, `market_data_quotes`

---

## 🧪 בדיקות

### בדיקות שבוצעו
- ✅ בדיקות בסיסיות (10/10)
- ✅ בדיקות edge cases (6/6)
- ✅ בדיקות דיוק מתמטי (6/6)
- ✅ בדיקות ביצועים (5/5)

**Success Rate:** 100%

### תוצאות ביצועים
- חישוב פוזיציה בודדת: 26ms
- חישוב חשבון מלא: 400ms
- חישוב פורטפוליו: 600ms

---

## 📁 קבצים

### Backend
- `Backend/services/position_portfolio_service.py`
- `Backend/routes/api/positions.py`
- `Backend/routes/api/__init__.py` (עודכן)
- `Backend/app.py` (עודכן)
- `Backend/routes/api/executions.py` (עודכן - cache invalidation)

### Tests
- `Backend/tests/test_position_portfolio_service.py`
- `Backend/tests/test_position_edge_cases.py`
- `Backend/tests/test_position_calculations_accuracy.py`
- `Backend/tests/test_position_performance.py`
- `Backend/tests/test_positions_api.py`

### Documentation
- `documentation/02-ARCHITECTURE/BACKEND/POSITION_PORTFOLIO_SERVICE.md`
- `documentation/04-FEATURES/CORE/POSITIONS_PORTFOLIO_SYSTEM.md`
- `POSITION_PORTFOLIO_SYSTEM_TESTING_REPORT.md`

---

## 🚀 שימוש

### API Endpoints

#### GET /api/positions/account/<account_id>
```json
{
  "status": "success",
  "data": {
    "account_id": 1,
    "positions": [...],
    "count": 16
  }
}
```

#### GET /api/positions/portfolio
```json
{
  "status": "success",
  "data": {
    "positions": [...],
    "summary": {
      "total_positions": 44,
      "total_market_value": 4610707.80,
      "total_cost": 2037021.87,
      "total_pl": -502299.38
    }
  }
}
```

#### Query Parameters
- `include_closed`: true/false (default: false)
- `unify_accounts`: true/false (default: false)
- `side`: 'long'/'short' (default: all)

---

## ⚠️ הערות חשובות

### פוזיציות ספונטניות
- ביצועים עם `ticker_id` + `trading_account_id` ללא `trade_id`
- לכלול בחישובים רגילים
- להציג "לא משויך" בטבלה
- לאפשר שיוך לטרייד דרך ממשק

### פוזיציות מרובות טריידים
- לאפשר מספר `trade_id` לפוזיציה אחת
- להציג רשימת טריידים מקושרים
- באפשרות איחוד: לסכם כמות, לחשב ממוצע משוקלל

### מחירי שוק
- קריאה מ-`MarketDataQuote` עם `is_stale=False`
- סדר לפי `fetched_at DESC`
- אם אין מחיר: להציג "לא זמין" (לא mock data!)
- התראה דרך notification system

### אחוזים
- אחוז משווי החשבון: `position_value / account_total_value`
- אחוז משווי כלל האחזקות: `position_value / all_positions_total`
- אחוז מאותו סוג: רק עם `trade_plan_id` (אם אין - לא כולל בחישוב)

---

## 📈 Roadmap

### שלב 1: Backend ✅ הושלם
- [x] PositionPortfolioService
- [x] API Endpoints
- [x] Cache Integration
- [x] בדיקות מקיפות

### שלב 2: Frontend (בפיתוח)
- [ ] טבלת פוזיציות לפי חשבון
- [ ] טבלת פורטפוליו מלא
- [ ] וויזארד סיכום
- [ ] אינטגרציה עם UnifiedCacheManager

### שלב 3: שיפורים עתידיים
- [ ] Corporate Actions
- [ ] Historical Positions
- [ ] Position Alerts
- [ ] Advanced Analytics

---

**מפתח אחראי:** TikTrack Development Team  
**תאריך עדכון אחרון:** ינואר 2025

