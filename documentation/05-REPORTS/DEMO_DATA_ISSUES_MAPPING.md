# מיפוי בעיות - נתוני דוגמה

**תאריך יצירה:** 27 בנובמבר 2025  
**גרסה:** 1.0.0  
**מטרה:** תיעוד מפורט של כל הבעיות שנמצאו בתהליך יצירת נתוני הדוגמה

---

## סיכום הבעיות

### בעיות קריטיות
1. **API מחזיר רק 1 תוכנית במקום 120**
   - **מיקום:** `Backend/routes/api/trade_plans.py`
   - **תיאור:** ה-API endpoint `/api/trade-plans/` מחזיר רק רשומה אחת במקום 120
   - **מצב ב-DB:** ✅ 120 תוכניות קיימות
   - **מצב ב-Service:** ✅ Service מחזיר 120 תוכניות
   - **מצב ב-API:** ❌ API מחזיר רק 1 תוכנית

2. **API מחזיר רק 1 טרייד במקום 80**
   - **מיקום:** `Backend/routes/api/trades.py`
   - **תיאור:** ה-API endpoint `/api/trades/` מחזיר רק רשומה אחת במקום 80
   - **מצב ב-DB:** ✅ 80 טריידים קיימים
   - **מצב ב-Service:** ✅ Service מחזיר 80 טריידים
   - **מצב ב-API:** ❌ API מחזיר רק 1 טרייד

3. **2 חשבונות מוצגים במקום 3**
   - **מיקום:** Frontend / API
   - **תיאור:** בדפדפן מוצגים רק 2 חשבונות במקום 3
   - **מצב ב-DB:** ✅ 3 חשבונות קיימים

### בעיות משניות
4. **שם שדה שגוי ב-TradePlanService**
   - **מיקום:** `Backend/services/trade_plan_service.py:36`
   - **תיאור:** שימוש ב-`trading_trading_account_id` במקום `trading_account_id`
   - **השפעה:** יכול לגרום לבעיות בשאילתות לפי חשבון

---

## פירוט בעיות

### בעיה #1: API מחזיר רק 1 תוכנית

#### מיקום
- **API Endpoint:** `Backend/routes/api/trade_plans.py:28-32`
- **Base API:** `Backend/routes/api/base_entity.py:53-99`
- **Service:** `Backend/services/trade_plan_service.py:12-23`

#### בדיקות שבוצעו

**בסיס הנתונים:**
```sql
SELECT COUNT(*) FROM trade_plans; -- 120 תוכניות ✅
```

**Service ישירות:**
```python
plans = TradePlanService.get_all(db)
len(plans)  # 120 תוכניות ✅
```

**Base API ישירות:**
```python
response, status = base_api.get_all(db)
len(response['data'])  # 120 תוכניות ✅
```

**API דרך Flask:**
```bash
curl http://localhost:8080/api/trade-plans/
# מחזיר: 1 תוכנית בלבד ❌
```

#### תיאור הבעיה
- ה-service מחזיר 120 תוכניות
- ה-base API מחזיר 120 תוכניות כשמריץ ישירות
- אבל דרך Flask API, רק 1 תוכנית מוחזרת

#### סיבה משוערת
- בעיית lazy loading - relationships לא נטענים לפני שה-session נסגר
- או exception שקט ב-to_dict() או ב-normalize_output()
- או בעיה ב-middleware ב-`app.py` שעושה normalize_output שוב

#### דוגמאות נתונים
**מה שה-API מחזיר:**
```json
{
  "data": [
    {
      "id": 1,
      "trading_account_id": 1,
      "ticker_id": 3,
      ...
    }
  ],
  "message": "Retrieved 1 trade_plans records"
}
```

**מה שצריך להחזיר:**
- 120 רשומות עם IDs מ-1 עד 120

---

### בעיה #2: API מחזיר רק 1 טרייד

#### מיקום
- **API Endpoint:** `Backend/routes/api/trades.py:126-158`
- **Service:** `Backend/services/trade_service.py:13-41`

#### בדיקות שבוצעו

**בסיס הנתונים:**
```sql
SELECT COUNT(*) FROM trades; -- 80 טריידים ✅
```

**API דרך Flask:**
```bash
curl http://localhost:8080/api/trades/
# מחזיר: 1 טרייד בלבד ❌
```

#### תיאור הבעיה
- ב-DB יש 80 טריידים
- ה-API מחזיר רק 1 טרייד

#### סיבה משוערת
- אותה בעיה כמו בעיה #1
- בעיית lazy loading או exception שקט

---

### בעיה #3: 2 חשבונות מוצגים במקום 3

#### מיקום
- **Frontend:** `trading-ui/scripts/trading_accounts.js`
- **API:** `/api/trading-accounts/` או `/api/trading-accounts/open`

#### בדיקות שבוצעו

**בסיס הנתונים:**
```sql
SELECT COUNT(*) FROM trading_accounts; -- 3 חשבונות ✅
```

**בדפדפן:**
- מוצגים רק 2 חשבונות

#### תיאור הבעיה
- ב-DB יש 3 חשבונות
- בדפדפן מוצגים רק 2

#### סיבה משוערת
- סינון לפי סטטוס (רק "open")
- או בעיה ב-API endpoint

---

### בעיה #4: שם שדה שגוי ב-TradePlanService

#### מיקום
**קובץ:** `Backend/services/trade_plan_service.py`  
**שורה:** 36

#### קוד בעייתי
```python
def get_by_account(db: Session, trading_account_id: int) -> List[TradePlan]:
    """Get trade plans by account"""
    return db.query(TradePlan).filter(TradePlan.trading_trading_account_id == trading_account_id).all()
```

#### הבעיה
- שימוש ב-`trading_trading_account_id` (כפול)
- צריך להיות `trading_account_id`

#### השפעה
- יכול לגרום לשאילתות לפי חשבון להיכשל
- לא משפיע על `get_all()` אבל צריך לתקן

---

## סיכום מצב בדיקות

| # | בעיה | מיקום | סטטוס DB | סטטוס Service | סטטוס API | סטטוס Frontend |
|---|------|-------|-----------|----------------|------------|----------------|
| 1 | תוכניות - רק 1 מוחזר | `/api/trade-plans/` | ✅ 120 | ✅ 120 | ❌ 1 | ❌ 1 |
| 2 | טריידים - רק 1 מוחזר | `/api/trades/` | ✅ 80 | ✅ 80 | ❌ 1 | ❌ 1 |
| 3 | חשבונות - רק 2 מוצגים | Frontend | ✅ 3 | ✅ 3 | ❓ | ❌ 2 |
| 4 | שם שדה שגוי | TradePlanService | - | ❌ | - | - |

---

## שלבים הבאים

1. בדיקה מעמיקה של exception שקט ב-to_dict() או ב-normalize_output()
2. בדיקת lazy loading issues
3. בדיקת middleware ב-app.py
4. תיקון הבעיות שנמצאו
5. בדיקה סופית

---

**עודכן:** 27 בנובמבר 2025

