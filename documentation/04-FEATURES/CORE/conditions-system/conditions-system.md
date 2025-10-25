# Conditions System - מדריך משתמש מקיף
**תאריך יצירה:** 19 אוקטובר 2025  
**גרסה:** 1.0.0  
**סטטוס:** מוכן לשימוש  

---

## 📋 **תוכן עניינים**

1. [סקירה כללית וארכיטקטורה](#1-סקירה-כללית-וארכיטקטורה)
2. [שיטות מסחר (6 שיטות)](#2-שיטות-מסחר-6-שיטות)
3. [יצירת תנאים](#3-יצירת-תנאים)
4. [הערכת תנאים](#4-הערכת-תנאים)
5. [אוטומציית התראות](#5-אוטומציית-התראות)
6. [תכונות מתקדמות](#6-תכונות-מתקדמות)
7. [שיטות עבודה מומלצות](#7-שיטות-עבודה-מומלצות)
8. [מקור API](#8-מקור-api)

---

## 1. **סקירה כללית וארכיטקטורה**

### מהי מערכת התנאים?
מערכת התנאים של TikTrack מאפשרת לך להגדיר תנאים אוטומטיים לזיהוי הזדמנויות מסחר. המערכת מעריכה תנאים בזמן אמת מול נתוני שוק אמיתיים ויוצרת התראות אוטומטיות כאשר התנאים מתקיימים.

### ארכיטקטורה
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend      │    │    Database     │
│                 │    │                  │    │                 │
│ • Condition UI  │◄──►│ • Evaluator      │◄──►│ • Conditions    │
│ • Test Page     │    │ • Background     │    │ • Market Data   │
│ • Alerts Page   │    │ • API Endpoints  │    │ • Alerts        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### רכיבי המערכת
- **ConditionEvaluator**: מעריך תנאים בזמן אמת
- **ConditionEvaluationTask**: משימת רקע אוטומטית (כל 20 דקות)
- **API Endpoints**: 6 endpoints להערכת תנאים
- **Alert Integration**: יצירת התראות אוטומטית

---

## 2. **שיטות מסחר (6 שיטות)**

### 2.1 **Moving Averages (ממוצעים נעים)**
**תיאור**: זיהוי מגמות באמצעות ממוצעים נעים

**פרמטרים**:
- `ma_period`: תקופת הממוצע (20, 50, 100, 200)
- `ma_type`: סוג הממוצע (SMA, EMA)
- `comparison_type`: סוג ההשוואה (above, below, crossover)

**דוגמה**:
```json
{
  "ma_period": 50,
  "ma_type": "SMA",
  "comparison_type": "above",
  "threshold": 0.02
}
```

### 2.2 **Volume Analysis (ניתוח נפח)**
**תיאור**: זיהוי פעילות מסחר חריגה

**פרמטרים**:
- `volume_period`: תקופת הנפח (20, 50)
- `volume_multiplier`: מכפיל הנפח (1.5, 2.0, 3.0)
- `comparison_type`: סוג ההשוואה (above, below)

**דוגמה**:
```json
{
  "volume_period": 20,
  "volume_multiplier": 1.5,
  "comparison_type": "above"
}
```

### 2.3 **Support/Resistance (תמיכה/התנגדות)**
**תיאור**: זיהוי רמות תמיכה והתנגדות

**פרמטרים**:
- `lookback_period`: תקופת חיפוש (20, 50, 100)
- `tolerance_percent`: סובלנות באחוזים (1%, 2%, 5%)
- `level_type`: סוג הרמה (support, resistance, both)

**דוגמה**:
```json
{
  "lookback_period": 50,
  "tolerance_percent": 2.0,
  "level_type": "both"
}
```

### 2.4 **Trend Lines (קווי מגמה)**
**תיאור**: זיהוי קווי מגמה עולים ויורדים

**פרמטרים**:
- `trend_period`: תקופת המגמה (20, 50, 100)
- `trend_type`: סוג המגמה (uptrend, downtrend, both)
- `breakout_threshold`: סף פריצה (1%, 2%, 5%)

**דוגמה**:
```json
{
  "trend_period": 50,
  "trend_type": "uptrend",
  "breakout_threshold": 2.0
}
```

### 2.5 **Technical Patterns (דפוסים טכניים)**
**תיאור**: זיהוי דפוסים טכניים קלאסיים

**פרמטרים**:
- `pattern_type`: סוג הדפוס (head_shoulders, double_top, triangle)
- `confidence_threshold`: סף ביטחון (70%, 80%, 90%)
- `timeframe`: מסגרת זמן (daily, weekly)

**דוגמה**:
```json
{
  "pattern_type": "head_shoulders",
  "confidence_threshold": 80,
  "timeframe": "daily"
}
```

### 2.6 **Fibonacci Levels (רמות פיבונאצ'י)**
**תיאור**: זיהוי רמות פיבונאצ'י לחזרה

**פרמטרים**:
- `fib_levels`: רמות פיבונאצ'י (23.6%, 38.2%, 61.8%)
- `swing_period`: תקופת התנודה (20, 50, 100)
- `retracement_threshold`: סף חזרה (1%, 2%, 5%)

**דוגמה**:
```json
{
  "fib_levels": [23.6, 38.2, 61.8],
  "swing_period": 50,
  "retracement_threshold": 2.0
}
```

---

## 3. **יצירת תנאים**

### 3.1 **יצירת תנאי לתכנית מסחר**
1. **גש לעמוד Trade Plans**
2. **לחץ על "Edit" ליד תכנית המסחר**
3. **בחר "Conditions" מהתפריט**
4. **לחץ על "Add Condition"**
5. **בחר שיטת מסחר**
6. **הגדר פרמטרים**
7. **שמור את התנאי**

### 3.2 **יצירת תנאי לטרייד**
1. **גש לעמוד Trades**
2. **לחץ על "Edit" ליד הטרייד**
3. **בחר "Conditions" מהתפריט**
4. **לחץ על "Add Condition"**
5. **בחר שיטת מסחר**
6. **הגדר פרמטרים**
7. **שמור את התנאי**

### 3.3 **הגדרות מתקדמות**
- **Auto-generate Alerts**: הפעל/כבה יצירת התראות אוטומטית
- **Condition Group**: קבוצת תנאים (AND/OR)
- **Logical Operator**: אופרטור לוגי (AND, OR, NOT)

---

## 4. **הערכת תנאים**

### 4.1 **הערכה אוטומטית**
- **תדירות**: כל 20 דקות
- **נתוני שוק**: נתונים אמיתיים מ-MarketDataQuote
- **תוצאות**: נשמרות בהתראות

### 4.2 **הערכה ידנית**
1. **גש לעמוד Conditions Test**
2. **לחץ על "Evaluate All"**
3. **צפה בתוצאות בזמן אמת**
4. **בדוק סטטוס כל תנאי**

### 4.3 **הערכת תנאי יחיד**
1. **גש לעמוד Conditions Test**
2. **לחץ על "Evaluate Single"**
3. **בחר תנאי להערכה**
4. **צפה בתוצאה מפורטת**

### 4.4 **היסטוריית הערכות**
- **גש לעמוד Alerts**
2. **לחץ על "Evaluation History"**
3. **צפה בהיסטוריה מלאה**
4. **סנן לפי תאריך/תנאי**

---

## 5. **אוטומציית התראות**

### 5.1 **הפעלת התראות אוטומטיות**
1. **בעת יצירת תנאי**: סמן "Auto-generate Alerts"
2. **בתנאי קיים**: לחץ על "Edit" ושנה הגדרה
3. **בדוק סטטוס**: וודא שהתנאי פעיל

### 5.2 **סוגי התראות**
- **Condition Met**: תנאי התקיים
- **Condition Not Met**: תנאי לא התקיים
- **Evaluation Error**: שגיאה בהערכה

### 5.3 **ניהול התראות**
- **צפייה**: עמוד Alerts
- **עריכה**: לחץ על "Edit"
- **מחיקה**: לחץ על "Delete"
- **סינון**: לפי סוג/תאריך/סטטוס

---

## 6. **תכונות מתקדמות**

### 6.1 **ממשק מתקדם לבניית תנאים**
- **Condition Builder**: ממשק גרפי לבניית תנאים
- **תרגום אוטומטי**: תרגום פרמטרים לעברית
- **ולידציה**: בדיקת תקינות תנאים
- **תצוגה מקדימה**: תצוגה מקדימה של התנאי

### 6.2 **אינטגרציה עם מערכות אחרות**
- **Trade Plans**: תנאים יורשים לתכניות מסחר
- **Trades**: תנאים עצמאיים לטריידים
- **Alerts**: התראות מקושרות לתנאים
- **Market Data**: נתוני שוק אמיתיים

### 6.3 **ניטור וביצועים**
- **Background Task**: רץ כל 20 דקות
- **Performance**: <30 שניות ל-100+ תנאים
- **Memory**: <100MB צריכת זיכרון
- **Error Rate**: <1% שיעור שגיאות

---

## 7. **שיטות עבודה מומלצות**

### 7.1 **יצירת תנאים יעילים**
- **התחל פשוט**: תנאי אחד לכל תכנית
- **בדוק היסטוריה**: בדוק ביצועים בעבר
- **עדכן באופן קבוע**: עדכן פרמטרים לפי השוק
- **מעקב**: עקוב אחר ביצועי התנאים

### 7.2 **ניהול סיכונים**
- **גיוון**: השתמש במספר שיטות מסחר
- **בדיקות**: בדוק תנאים לפני הפעלה
- **גבולות**: הגדר גבולות ברורים
- **ניטור**: עקוב אחר ביצועים

### 7.3 **אופטימיזציה**
- **ביצועים**: בדוק ביצועי תנאים
- **עדכונים**: עדכן פרמטרים לפי השוק
- **ניקוי**: הסר תנאים לא יעילים
- **תיעוד**: תיעד החלטות ושינויים

---

## 8. **מקור API**

### 8.1 **Plan Conditions API**

#### **POST /api/plan-conditions/{id}/evaluate**
הערכת תנאי יחיד מול נתוני שוק נוכחיים.

**פרמטרים**:
- `id` (path, integer): ID של התנאי להערכה

**תגובה**:
```json
{
  "status": "success",
  "data": {
    "condition_id": 1,
    "condition_type": "plan",
    "met": true,
    "evaluation_time": "2025-10-19T22:04:06.611167+00:00",
    "method_id": 1,
    "method_name": "Moving Averages",
    "ticker_id": 4,
    "current_price": 439.31,
    "details": {
      "comparison_type": "above",
      "current_price": 439.31,
      "ma_period": 50,
      "ma_type": "SMA",
      "ma_value": 439.31000000000023,
      "price_vs_ma": -2.2737367544323206e-13,
      "price_vs_ma_pct": -5.175699971392227e-14
    }
  },
  "message": "Condition evaluated successfully"
}
```

#### **POST /api/plan-conditions/evaluate-all**
הערכת כל התנאים הפעילים במערכת.

**תגובה**:
```json
{
  "status": "success",
  "data": [
    {
      "condition_id": 2,
      "condition_type": "plan",
      "met": false,
      "evaluation_time": "2025-10-19T19:04:06.611167+00:00",
      "method_id": 2,
      "method_name": "Volume Analysis",
      "ticker_id": 4,
      "current_price": 439.31,
      "details": {
        "avg_volume": 88293380.0,
        "comparison_type": "above",
        "current_volume": 89331578,
        "threshold_volume": 132440070.0,
        "volume_multiplier": 1.5,
        "volume_period": 20,
        "volume_vs_avg": 1038198.0,
        "volume_vs_avg_pct": 1.175850329888832
      }
    }
  ],
  "count": 14,
  "message": "14 plan conditions evaluated"
}
```

#### **GET /api/plan-conditions/{id}/evaluation-history**
קבלת היסטוריית הערכות של תנאי ספציפי (מתוך התראות שנוצרו).

**פרמטרים**:
- `id` (path, integer): ID של התנאי
- `limit` (optional, integer): מספר התוצאות המקסימלי (ברירת מחדל: 50)

**תגובה**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 42,
      "alert_type": "condition_met",
      "message": "Condition met: Moving Averages - Price above SMA(50)",
      "related_id": 1,
      "related_type_id": 1,
      "triggered_at": "2025-10-19T22:04:06.611167+00:00",
      "is_read": false,
      "created_at": "2025-10-19T22:04:06.611167+00:00"
    }
  ],
  "count": 1,
  "message": "Evaluation history retrieved successfully"
}
```

### 8.2 **Trade Conditions API**

#### **POST /api/trade-conditions/{id}/evaluate**
הערכת תנאי טרייד יחיד מול נתוני שוק נוכחיים.

**פרמטרים**:
- `id` (path, integer): ID של התנאי להערכה

**תגובה**:
```json
{
  "status": "success",
  "data": {
    "condition_id": 1,
    "condition_type": "trade",
    "met": true,
    "evaluation_time": "2025-10-19T22:04:06.611167+00:00",
    "method_id": 1,
    "method_name": "Moving Averages",
    "ticker_id": 4,
    "current_price": 439.31,
    "details": {
      "comparison_type": "above",
      "current_price": 439.31,
      "ma_period": 50,
      "ma_type": "SMA",
      "ma_value": 439.31000000000023,
      "price_vs_ma": -2.2737367544323206e-13,
      "price_vs_ma_pct": -5.175699971392227e-14
    }
  },
  "message": "Condition evaluated successfully"
}
```

#### **POST /api/trade-conditions/evaluate-all**
הערכת כל התנאים הפעילים של טריידים במערכת.

**תגובה**:
```json
{
  "status": "success",
  "data": [
    {
      "condition_id": 1,
      "condition_type": "trade",
      "met": false,
      "evaluation_time": "2025-10-19T19:04:06.611167+00:00",
      "method_id": 1,
      "method_name": "Moving Averages",
      "ticker_id": 4,
      "current_price": 439.31,
      "details": {
        "comparison_type": "above",
        "current_price": 439.31,
        "ma_period": 50,
        "ma_type": "SMA",
        "ma_value": 439.31000000000023,
        "price_vs_ma": -2.2737367544323206e-13,
        "price_vs_ma_pct": -5.175699971392227e-14
      }
    }
  ],
  "count": 5,
  "message": "5 trade conditions evaluated"
}
```

#### **GET /api/trade-conditions/{id}/evaluation-history**
קבלת היסטוריית הערכות של תנאי טרייד ספציפי (מתוך התראות שנוצרו).

**פרמטרים**:
- `id` (path, integer): ID של התנאי
- `limit` (optional, integer): מספר התוצאות המקסימלי (ברירת מחדל: 50)

**תגובה**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 43,
      "alert_type": "condition_met",
      "message": "Trade condition met: Moving Averages - Price above SMA(50)",
      "related_id": 1,
      "related_type_id": 2,
      "triggered_at": "2025-10-19T22:04:06.611167+00:00",
      "is_read": false,
      "created_at": "2025-10-19T22:04:06.611167+00:00"
    }
  ],
  "count": 1,
  "message": "Evaluation history retrieved successfully"
}
```

---

## 🎯 **סיכום**

מערכת התנאים של TikTrack מספקת כלים מתקדמים לזיהוי הזדמנויות מסחר אוטומטיות. המערכת כוללת:

- **6 שיטות מסחר** מתקדמות
- **הערכה בזמן אמת** מול נתוני שוק אמיתיים
- **אוטומציית התראות** חכמה
- **ממשק משתמש** מתקדם ואינטואיטיבי
- **API מקיף** לפיתוח נוסף

**המערכת מוכנה לשימוש מלא ומומלץ להתחיל עם תנאים פשוטים ולהתקדם לתנאים מורכבים יותר.**

---

**תאריך עדכון**: 19 באוקטובר 2025  
**גרסה**: 1.0.0  
**סטטוס**: ✅ מוכן לשימוש מלא
