# Portfolio Snapshots Architecture Proposal

# הצעת ארכיטקטורה לחישוב Snapshots יומיים

**תאריך יצירה:** 8 דצמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** 📋 הצעה לדיון  

---

## 🎯 הבעיה

**הנחה:** בכדי להציג את הגרפים בצורה נכונה, אנחנו צריכים לחשב את אותם ערכים שמוצגים בסיכום המידע המורחב עבור כל יום מאז הרשומה הראשונה ועד היום.

**אתגרים:**

1. **ביצועים:** חישוב snapshot לכל יום יכול להיות יקר מאוד (3 שנים = 1095 snapshots)
2. **זמן תגובה:** חישוב on-demand יכול להיות איטי
3. **עומס על DB:** חישוב חוזר של אותם נתונים
4. **תחזוקה:** שמירת תוצאות חישוב כפולות או מיותרות

---

## 📊 ניתוח דרישות

### מה צריך לחשב עבור כל יום

1. **ערך תיק (Total Value):**
   - Cash balance (כולל הפקדות/משיכות עד התאריך)
   - Market value of positions (במחירי השוק של התאריך)

2. **ביצועי תיק (Performance):**
   - Total P/L (realized + unrealized)
   - P/L percentage

3. **פירוט P/L:**
   - Realized P/L
   - Unrealized P/L

4. **פוזיציות:**
   - מספר פוזיציות
   - פירוט לפי חשבון

### תאריכים רלוונטיים

- **תאריך ראשון:** התאריך של הרשומה הראשונה (execution או cash flow)
- **תאריך אחרון:** היום
- **תדירות:** יומי (או שבועי/חודשי לפי בחירת המשתמש)

---

## 🏗️ הצעות ארכיטקטורה

### אופציה 1: Lazy Calculation (חישוב לפי דרישה)

**עקרון:** לחשב snapshots רק עבור התקופה שנבחרה על ידי המשתמש

**יתרונות:**

- ✅ אין שמירת נתונים מיותרים
- ✅ חישוב רק מה שצריך
- ✅ פשוט לתחזוקה

**חסרונות:**

- ❌ חישוב חוזר עבור תקופות זהות
- ❌ יכול להיות איטי עבור תקופות ארוכות
- ❌ עומס על DB בכל פעם

**מימוש:**

```python
# Backend: calculate_portfolio_snapshot_series()
# מקבל: start_date, end_date, interval
# מחשב: snapshots רק עבור התקופה המבוקשת
# Cache: TTL 10 דקות
```

**המלצה:** ✅ **מומלץ** - פשוט ויעיל עבור רוב המקרים

---

### אופציה 2: Pre-calculated Snapshots (חישוב מראש)

**עקרון:** לחשב snapshots יומיים מראש ולשמור ב-DB או cache

**יתרונות:**

- ✅ תגובה מהירה מאוד
- ✅ אין חישוב חוזר
- ✅ עובד טוב עם cache

**חסרונות:**

- ❌ שמירת נתונים רבים (1095 snapshots ל-3 שנים)
- ❌ צריך לעדכן בכל שינוי (execution, cash flow)
- ❌ מורכב יותר לתחזוקה
- ❌ יכול להיות יקר ב-storage

**מימוש:**

```python
# Backend: Background job
# מחשב: snapshots יומיים עבור כל יום מאז הרשומה הראשונה
# שומר: ב-DB table או IndexedDB
# מעדכן: בכל שינוי (execution, cash flow)
```

**המלצה:** ⚠️ **לא מומלץ** - מורכב מדי ויקר

---

### אופציה 3: Hybrid (היברידי)

**עקרון:** לחשב מראש snapshots רק עבור תקופות נפוצות (למשל 90 יום אחרונים), ולשאר לחשב on-demand

**יתרונות:**

- ✅ תגובה מהירה עבור תקופות נפוצות
- ✅ לא שומר יותר מדי נתונים
- ✅ איזון טוב בין ביצועים לתחזוקה

**חסרונות:**

- ❌ מורכב יותר למימוש
- ❌ צריך להחליט מה "תקופה נפוצה"
- ❌ עדיין צריך לעדכן snapshots קיימים

**מימוש:**

```python
# Backend: Background job + Lazy calculation
# מחשב מראש: snapshots יומיים עבור 90 יום אחרונים
# מחשב on-demand: snapshots עבור תקופות אחרות
# Cache: TTL ארוך יותר עבור snapshots מראש (24 שעות)
```

**המלצה:** ✅ **מומלץ** - איזון טוב בין ביצועים לתחזוקה

---

### אופציה 4: Incremental Calculation (חישוב מצטבר)

**עקרון:** לחשב snapshots רק עבור ימים חדשים (מאז הפעם האחרונה), ולשמור cache של snapshots קיימים

**יתרונות:**

- ✅ חישוב רק מה שחדש
- ✅ תגובה מהירה עבור תקופות קיימות
- ✅ יעיל ב-storage

**חסרונות:**

- ❌ צריך לטפל בעדכונים של snapshots קיימים (אם יש שינוי בנתונים היסטוריים)
- ❌ מורכב יותר למימוש
- ❌ צריך לטפל ב-invalidation

**מימוש:**

```python
# Backend: Cache + Incremental calculation
# שומר: snapshots ב-cache (IndexedDB או Backend cache)
# מחשב: רק snapshots חדשים (מאז הפעם האחרונה)
# מעדכן: snapshots קיימים רק אם יש שינוי בנתונים
```

**המלצה:** ⚠️ **מורכב** - דורש תחזוקה קפדנית

---

## 💡 המלצה סופית

### **אופציה 1 + שיפורים (Lazy Calculation עם Cache משופר)**

**עקרון:**

1. **Lazy Calculation:** לחשב snapshots רק עבור התקופה שנבחרה
2. **Cache משופר:** TTL ארוך יותר (24 שעות במקום 10 דקות)
3. **Cache ב-IndexedDB:** שמירת snapshots ב-IndexedDB עם TTL ארוך
4. **Invalidation חכם:** ביטול cache רק כאשר יש שינוי רלוונטי

**יתרונות:**

- ✅ פשוט למימוש
- ✅ יעיל עם cache משופר
- ✅ לא שומר נתונים מיותרים
- ✅ תגובה מהירה עבור תקופות שכבר חושבו

**מימוש מוצע:**

```javascript
// Frontend: portfolio-state-data.js
async loadSeries(accountId, startDate, endDate, options) {
    // 1. בדוק cache (IndexedDB עם TTL 24 שעות)
    const cacheKey = `portfolio-state-series:${accountId}:${startDate}:${endDate}`;
    const cached = await UnifiedCacheManager.get(cacheKey, 'indexeddb');
    if (cached) return cached;
    
    // 2. טען מ-Backend
    const data = await fetch(`/api/portfolio-state/series?...`);
    
    // 3. שמור ב-cache (IndexedDB, TTL 24 שעות)
    await UnifiedCacheManager.set(cacheKey, data, 'indexeddb', { ttl: 24 * 60 * 60 * 1000 });
    
    return data;
}
```

```python
# Backend: portfolio_state.py
@cache_with_deps(ttl=86400, dependencies=['executions', 'market_data_quotes', 'trades', 'cash_flows'])
def get_portfolio_series():
    # TTL ארוך יותר (24 שעות)
    # Dependencies כוללים cash_flows (לעדכון אוטומטי)
    ...
```

---

## 🔄 תהליך חישוב Snapshot

### שלבים

1. **מציאת תאריך ראשון:**

   ```python
   first_execution = db.query(func.min(Execution.date)).filter(...).scalar()
   first_cash_flow = db.query(func.min(CashFlow.date)).filter(...).scalar()
   first_date = min(first_execution, first_cash_flow)
   ```

2. **חישוב Snapshot לכל יום:**

   ```python
   for date in date_range:
       snapshot = calculate_portfolio_state_at_date(
           user_id=user_id,
           account_id=account_id,
           target_date=date
       )
   ```

3. **שמירה ב-Cache:**
   - Memory cache: TTL קצר (10 דקות)
   - IndexedDB: TTL ארוך (24 שעות)
   - Backend cache: TTL ארוך (24 שעות)

---

## 📊 השוואת אופציות

| אופציה | ביצועים | תחזוקה | Storage | מורכבות |
|--------|---------|--------|---------|---------|
| 1. Lazy | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 2. Pre-calculated | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ |
| 3. Hybrid | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| 4. Incremental | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |

---

## 🎯 המלצה סופית

**אופציה 1 + שיפורים (Lazy Calculation עם Cache משופר)**

**סיבות:**

1. פשוט למימוש ותחזוקה
2. יעיל עם cache משופר (IndexedDB + Backend cache)
3. לא שומר נתונים מיותרים
4. תגובה מהירה עבור תקופות שכבר חושבו

**שיפורים מוצעים:**

1. TTL ארוך יותר (24 שעות במקום 10 דקות)
2. Cache ב-IndexedDB עם TTL ארוך
3. Invalidation חכם (רק כאשר יש שינוי רלוונטי)
4. Background refresh (רענון cache ברקע עבור תקופות נפוצות)

---

**תאריך עדכון אחרון:** 8 דצמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** 📋 הצעה לדיון



