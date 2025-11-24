# Business Logic Edge Cases Testing Report

**תאריך:** 23 נובמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ⏳ **בתהליך - צריך בדיקות בפועל**

---

## סיכום

דוח זה מתעד את בדיקות Edge Cases לכל ה-Business Logic Services במערכת. מטרת הבדיקות היא לוודא שהמערכת מטפלת נכון במקרים קיצוניים ולא צפויים.

---

## קטגוריות Edge Cases

### 1. ערכים שליליים

**מטרה:** וידוא שהמערכת מטפלת נכון בערכים שליליים במקומות שלא צפויים.

**בדיקות:**

#### Trade Business Service:
- [ ] `calculate_stop_price` עם `current_price` שלילי
- [ ] `calculate_stop_price` עם `stop_percentage` שלילי
- [ ] `calculate_target_price` עם `current_price` שלילי
- [ ] `calculate_target_price` עם `target_percentage` שלילי
- [ ] `calculate_percentage_from_price` עם `current_price` שלילי
- [ ] `calculate_percentage_from_price` עם `target_price` שלילי
- [ ] `calculate_pl` עם `entry_price` שלילי
- [ ] `calculate_pl` עם `exit_price` שלילי
- [ ] `calculate_pl` עם `quantity` שלילי

#### Execution Business Service:
- [ ] `calculate_execution_values` עם `quantity` שלילי
- [ ] `calculate_execution_values` עם `price` שלילי
- [ ] `calculate_execution_values` עם `commission` שלילי
- [ ] `calculate_average_price` עם executions עם מחירים שליליים

#### Alert Business Service:
- [ ] `validate_condition_value` עם `condition_number` שלילי עבור `price`
- [ ] `validate_condition_value` עם `condition_number` שלילי עבור `change` (מותר בטווח -100% עד 100%)
- [ ] `validate_condition_value` עם `condition_number` שלילי עבור `volume`

#### Cash Flow Business Service:
- [ ] `calculate_account_balance` עם `initial_balance` שלילי (מותר לחשבונות margin)
- [ ] `calculate_account_balance` עם cash flows שליליים

---

### 2. ערכים אפס (0)

**מטרה:** וידוא שהמערכת מטפלת נכון בערכי אפס.

**בדיקות:**

#### Trade Business Service:
- [ ] `calculate_stop_price` עם `current_price = 0`
- [ ] `calculate_stop_price` עם `stop_percentage = 0`
- [ ] `calculate_target_price` עם `current_price = 0`
- [ ] `calculate_target_price` עם `target_percentage = 0`
- [ ] `calculate_percentage_from_price` עם `current_price = 0`
- [ ] `calculate_percentage_from_price` עם `target_price = 0`
- [ ] `calculate_pl` עם `quantity = 0`
- [ ] `calculate_investment` עם `price = 0`
- [ ] `calculate_investment` עם `quantity = 0`
- [ ] `calculate_investment` עם `amount = 0`

#### Execution Business Service:
- [ ] `calculate_execution_values` עם `quantity = 0`
- [ ] `calculate_execution_values` עם `price = 0`
- [ ] `calculate_execution_values` עם `commission = 0`
- [ ] `calculate_average_price` עם רשימה ריקה

#### Alert Business Service:
- [ ] `validate_condition_value` עם `condition_number = 0` עבור `price`
- [ ] `validate_condition_value` עם `condition_number = 0` עבור `change`
- [ ] `validate_condition_value` עם `condition_number = 0` עבור `volume`

---

### 3. ערכים גדולים מאוד

**מטרה:** וידוא שהמערכת מטפלת נכון במספרים גדולים מאוד.

**בדיקות:**

#### Trade Business Service:
- [ ] `calculate_stop_price` עם `current_price = 1,000,000`
- [ ] `calculate_stop_price` עם `stop_percentage = 10,000`
- [ ] `calculate_target_price` עם `current_price = 1,000,000`
- [ ] `calculate_target_price` עם `target_percentage = 10,000`
- [ ] `calculate_pl` עם `quantity = 1,000,000,000`
- [ ] `calculate_investment` עם `amount = 1,000,000,000`

#### Execution Business Service:
- [ ] `calculate_execution_values` עם `quantity = 1,000,000,000`
- [ ] `calculate_execution_values` עם `price = 1,000,000`
- [ ] `calculate_average_price` עם 10,000 executions

#### Alert Business Service:
- [ ] `validate_condition_value` עם `condition_number = 1,000,000` עבור `price`
- [ ] `validate_condition_value` עם `condition_number = 10,000` עבור `change` (חייב להיות בטווח -100% עד 100%)

---

### 4. ערכים קטנים מאוד (מספרים עשרוניים)

**מטרה:** וידוא שהמערכת מטפלת נכון במספרים עשרוניים קטנים מאוד.

**בדיקות:**

#### Trade Business Service:
- [ ] `calculate_stop_price` עם `current_price = 0.0001`
- [ ] `calculate_stop_price` עם `stop_percentage = 0.0001`
- [ ] `calculate_target_price` עם `current_price = 0.0001`
- [ ] `calculate_target_price` עם `target_percentage = 0.0001`
- [ ] `calculate_pl` עם `quantity = 0.0001`
- [ ] `calculate_investment` עם `price = 0.0001`

#### Execution Business Service:
- [ ] `calculate_execution_values` עם `quantity = 0.0001`
- [ ] `calculate_execution_values` עם `price = 0.0001`
- [ ] `calculate_average_price` עם executions עם מחירים קטנים מאוד

#### Alert Business Service:
- [ ] `validate_condition_value` עם `condition_number = 0.0001` עבור `price`
- [ ] `validate_condition_value` עם `condition_number = 0.0001` עבור `change`

---

### 5. ערכים null/undefined

**מטרה:** וידוא שהמערכת מטפלת נכון בערכים null/undefined.

**בדיקות:**

#### Trade Business Service:
- [ ] `calculate_stop_price` עם `current_price = null`
- [ ] `calculate_stop_price` עם `stop_percentage = null`
- [ ] `calculate_stop_price` עם `side = null`
- [ ] `calculate_target_price` עם `current_price = null`
- [ ] `calculate_percentage_from_price` עם `current_price = null`
- [ ] `calculate_percentage_from_price` עם `target_price = null`
- [ ] `validate` עם `data = null`
- [ ] `validate` עם `data = {}`

#### Execution Business Service:
- [ ] `calculate_execution_values` עם `params = null`
- [ ] `calculate_execution_values` עם `params = {}`
- [ ] `calculate_average_price` עם `executions = null`
- [ ] `calculate_average_price` עם `executions = []`
- [ ] `validate` עם `executionData = null`

#### Alert Business Service:
- [ ] `validate_condition_value` עם `conditionAttribute = null`
- [ ] `validate_condition_value` עם `conditionNumber = null`
- [ ] `validate_alert` עם `alertData = null`
- [ ] `validate_alert` עם `alertData = {}`

#### Note Business Service:
- [ ] `validate` עם `data = null`
- [ ] `validate_content` עם `content = null`
- [ ] `validate_relation` עם `related_type_id = null`
- [ ] `validate_relation` עם `related_id = null`

#### TradingAccount Business Service:
- [ ] `validate` עם `data = null`
- [ ] `validate_name` עם `name = null`
- [ ] `validate_currency_id` עם `currency_id = null`
- [ ] `validate_status` עם `status = null`

#### TradePlan Business Service:
- [ ] `validate` עם `data = null`
- [ ] `validate_trading_account_id` עם `account_id = null`
- [ ] `validate_ticker_id` עם `ticker_id = null`
- [ ] `validate_entry_price` עם `price = null`
- [ ] `validate_planned_amount` עם `amount = null`

#### Ticker Business Service:
- [ ] `validate` עם `data = null`
- [ ] `validate_symbol` עם `symbol = null`
- [ ] `validate_currency_id` עם `currency_id = null`

#### Currency Business Service:
- [ ] `validate` עם `data = null`
- [ ] `validate_exchange_rate` עם `rate = null`

#### Tag Business Service:
- [ ] `validate` עם `data = null`
- [ ] `validate_name` עם `name = null`
- [ ] `validate_category` עם `category = null`

---

### 6. מחרוזות במקום מספרים

**מטרה:** וידוא שהמערכת מטפלת נכון כאשר מחרוזות מועברות במקום מספרים.

**בדיקות:**

#### Trade Business Service:
- [ ] `calculate_stop_price` עם `current_price = "100"`
- [ ] `calculate_stop_price` עם `current_price = "abc"`
- [ ] `calculate_stop_price` עם `stop_percentage = "10"`
- [ ] `calculate_target_price` עם `current_price = "100"`
- [ ] `calculate_percentage_from_price` עם `current_price = "100"`
- [ ] `calculate_percentage_from_price` עם `target_price = "110"`

#### Execution Business Service:
- [ ] `calculate_execution_values` עם `quantity = "10"`
- [ ] `calculate_execution_values` עם `price = "100"`
- [ ] `calculate_execution_values` עם `commission = "1"`

#### Alert Business Service:
- [ ] `validate_condition_value` עם `conditionNumber = "100"`
- [ ] `validate_condition_value` עם `conditionNumber = "abc"`

#### TradingAccount Business Service:
- [ ] `validate_opening_balance` עם `opening_balance = "1000"`
- [ ] `validate_opening_balance` עם `opening_balance = "abc"`

#### TradePlan Business Service:
- [ ] `validate_entry_price` עם `price = "100"`
- [ ] `validate_entry_price` עם `price = "abc"`
- [ ] `validate_planned_amount` עם `amount = "10000"`
- [ ] `validate_planned_amount` עם `amount = "abc"`

---

### 7. תאריכים לא תקינים

**מטרה:** וידוא שהמערכת מטפלת נכון בתאריכים לא תקינים.

**בדיקות:**

#### Statistics Business Service:
- [ ] `calculate_time_weighted_return` עם `start_date` בעתיד
- [ ] `calculate_time_weighted_return` עם `end_date` בעבר לפני `start_date`
- [ ] `calculate_time_weighted_return` עם `start_date = null`
- [ ] `calculate_time_weighted_return` עם `end_date = null`
- [ ] `calculate_time_weighted_return` עם `start_date = "invalid"`
- [ ] `calculate_time_weighted_return` עם `end_date = "invalid"`

---

## תוצאות צפויות

### התנהגות נכונה:

1. **ערכים שליליים:**
   - חישובי מחירים: שגיאה או ערך שלילי (תלוי בלוגיקה)
   - ולידציות: שגיאת ולידציה ברוב המקרים

2. **ערכים אפס:**
   - חישובי מחירים: שגיאה (מחיר לא יכול להיות 0)
   - ולידציות: שגיאת ולידציה ברוב המקרים

3. **ערכים גדולים מאוד:**
   - חישובי מחירים: תוצאה תקינה (אם בטווח המותר)
   - ולידציות: שגיאת ולידציה אם חורג מהטווח המותר

4. **ערכים קטנים מאוד:**
   - חישובי מחירים: תוצאה תקינה (אם בטווח המותר)
   - ולידציות: שגיאת ולידציה אם קטן מהמינימום

5. **ערכים null/undefined:**
   - כל הפונקציות: שגיאת ולידציה או ערך ברירת מחדל

6. **מחרוזות במקום מספרים:**
   - חישובי מחירים: שגיאה או ניסיון המרה (תלוי ב-implementation)
   - ולידציות: שגיאת ולידציה

7. **תאריכים לא תקינים:**
   - שגיאת ולידציה או שגיאת חישוב

---

## תוכנית בדיקות

### שלב 1: בדיקות אוטומטיות (Unit Tests)
- [ ] יצירת test files לכל Business Service
- [ ] בדיקת כל Edge Case עם unit tests
- [ ] וידוא שכל test עובר

### שלב 2: בדיקות ידניות (Browser Tests)
- [ ] בדיקת Edge Cases דרך UI
- [ ] וידוא שהודעות שגיאה מוצגות נכון
- [ ] וידוא שהמערכת לא קורסת

### שלב 3: בדיקות אינטגרציה
- [ ] בדיקת Edge Cases עם cache system
- [ ] בדיקת Edge Cases עם error handling
- [ ] בדיקת Edge Cases עם logging

---

## הערות טכניות

### Error Handling:

כל Business Service צריך:
1. לבדוק null/undefined לפני שימוש
2. לבדוק טיפוסים לפני המרות
3. לבדוק טווחים לפני חישובים
4. להחזיר שגיאות ברורות ומפורטות

### Validation Strategy:

1. **Early Validation:** בדיקת ערכים לא תקינים מוקדם ככל האפשר
2. **Clear Errors:** הודעות שגיאה ברורות ומפורטות
3. **Graceful Degradation:** המערכת לא צריכה לקרוס, רק להחזיר שגיאה

---

## צעדים הבאים

1. ⏳ **יצירת Unit Tests** - לכל Business Service
2. ⏳ **בדיקות ידניות** - דרך UI
3. ⏳ **תיקון באגים** - אם נמצאו
4. ⏳ **עדכון דוח** - עם תוצאות בפועל

---

**תאריך עדכון אחרון:** 23 נובמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ⏳ **בתהליך - צריך בדיקות בפועל**

