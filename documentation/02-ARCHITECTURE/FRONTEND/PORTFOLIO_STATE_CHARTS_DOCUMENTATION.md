# Portfolio State Charts - תיעוד מפורט

# גרפי מצב תיק - תיעוד מפורט

**תאריך יצירה:** 8 דצמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ תיעוד מלא  

---

## 📊 סקירה כללית

עמוד Portfolio State מציג 3 גרפים מרכזיים:

1. **Portfolio Performance Chart** (ביצועי תיק)
2. **Portfolio Value Chart** (שווי תיק)
3. **P/L Trend Chart** (מגמת P/L)

---

## 🎯 ההבדל בין ביצועי תיק לערך תיק

### ⚠️ חשוב מאוד - הבנה נכונה

#### 1. **ביצועי תיק (Performance)**

- **מה זה:** שינוי ברווח והפסד בלבד - רק מהטריידים
- **לא כולל:** הפקדות, משיכות, או שינויים אחרים בערך התיק
- **נוסחה:** `Performance % = (Current P/L - Base P/L) / Base Portfolio Value * 100`
- **דוגמה:**
  - התחלתי עם $1000
  - הרווחתי 10% מטרייד = $100 רווח
  - הפקדתי $100 לחשבון
  - **ביצועי תיק:** 10% (רק הרווח מהטרייד)
  - **ערך תיק:** $1200 (עלייה של 20% כולל ההפקדה)

#### 2. **ערך תיק (Value)**

- **מה זה:** ערך כולל - מזומן + פוזיציות + הפקדות + משיכות
- **כולל:** כל השינויים בערך התיק, כולל הפקדות ומשיכות
- **נוסחה:** `Total Value = Cash Balance + Market Value of Positions`
- **דוגמה:**
  - התחלתי עם $1000
  - הרווחתי 10% מטרייד = $100 רווח
  - משכתי $600
  - **ביצועי תיק:** 10% (רק הרווח מהטרייד)
  - **ערך תיק:** $500 (ירידה של 50% כולל המשיכה)

---

## 📈 הגרפים - מה כל אחד מציג

### 1. Portfolio Performance Chart (ביצועי תיק)

**מטרה:** להציג את ביצועי הטריידים בלבד, ללא השפעת הפקדות/משיכות

**נתונים:**

- **קו אחד:** ביצועי תיק באחוזים (%)
- **חישוב:** `(Current P/L - Base P/L) / Base Portfolio Value * 100`
- **ציר Y:** אחוזים בלבד

**דוגמה:**

- יום 1: P/L = $0, Value = $1000 → Performance = 0%
- יום 2: P/L = $100, Value = $1100 → Performance = 10%
- יום 3: P/L = $100, Value = $1200 (הפקדתי $100) → Performance = 10% (לא השתנה!)

### 2. Portfolio Value Chart (שווי תיק)

**מטרה:** להציג את הערך הכולל של התיק, כולל הפקדות/משיכות

**נתונים:**

- **קו 1:** שווי תיק בדולרים ($) - ציר Y שמאלי
- **קו 2:** שווי תיק באחוזים (%) - ציר Y ימני
- **חישוב:** `Total Value = Cash Balance + Market Value of Positions`
- **כולל:** כל השינויים בערך התיק

**דוגמה:**

- יום 1: Value = $1000 → 0%
- יום 2: Value = $1100 → +10%
- יום 3: Value = $1200 (הפקדתי $100) → +20%

### 3. P/L Trend Chart (מגמת P/L)

**מטרה:** להציג את מגמת הרווח והפסד

**נתונים:**

- **קווים בדולרים ($) - ציר Y שמאלי:**
  - P/L ממומש ($)
  - P/L לא ממומש ($)
  - P/L כולל ($)
- **קווים באחוזים (%) - ציר Y ימני:**
  - P/L ממומש (%)
  - P/L לא ממומש (%)
  - P/L כולל (%)

**חישוב:**

- P/L ממומש: `total_realized_pl`
- P/L לא ממומש: `total_unrealized_pl`
- P/L כולל: `total_realized_pl + total_unrealized_pl`

---

## 🔧 מימוש טכני

### Backend

**קובץ:** `Backend/services/business_logic/historical_data_business_service.py`

**פונקציות:**

- `calculate_portfolio_state_at_date()` - מחשב snapshot לתאריך מסוים
- `calculate_portfolio_snapshot_series()` - מחשב סדרת snapshots לתאריכים מרובים

**חישובים:**

```python
total_value = total_cash_balance + total_market_value  # כולל הפקדות/משיכות
total_pl = total_realized_pl + total_unrealized_pl    # רק רווח/הפסד
```

### Frontend

**קובץ:** `trading-ui/scripts/portfolio-state.js`

**פונקציות:**

- `initPortfolioPerformanceChart()` - מאתחל גרף ביצועים
- `initPortfolioValueChart()` - מאתחל גרף שווי
- `initPLTrendChart()` - מאתחל גרף P/L

**חישוב ביצועים:**

```javascript
// Performance = P/L change as % of initial portfolio value
const basePL = baseSnapshot.total_pl || 0;
const currentPL = snapshot.total_pl || 0;
const baseValue = baseSnapshot.total_value || 0;
const plChange = currentPL - basePL;
const percent = baseValue > 0 ? (plChange / baseValue) * 100 : 0;
```

---

## 📝 הערות חשובות

1. **ביצועי תיק ≠ ערך תיק**
   - ביצועי תיק = רק רווח/הפסד מהטריידים
   - ערך תיק = כולל הפקדות/משיכות

2. **חישוב נכון:**
   - Performance: משתמש ב-`total_pl` (לא `total_value`)
   - Value: משתמש ב-`total_value` (כולל הפקדות/משיכות)

3. **Cache:**
   - Snapshots נשמרים ב-cache עם TTL של 10 דקות
   - Cache key: `portfolio-state-series:{accountId}:{startDate}:{endDate}:{interval}`

---

## 🔄 עדכונים עתידיים

1. **אופטימיזציה:** חישוב snapshots מראש עבור תקופות נפוצות
2. **Caching:** שמירת snapshots יומיים ב-DB או IndexedDB
3. **Performance:** חישוב lazy רק עבור התקופה הנבחרת

---

**תאריך עדכון אחרון:** 8 דצמבר 2025  
**גרסה:** 1.0.0




