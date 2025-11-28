# תיקון מטבע החשבון הראשי - USD בלבד

**תאריך:** 29 בנובמבר 2025  
**מטרה:** הבטחת שהחשבון הראשי תמיד נוצר במטבע USD

---

## בעיה שזוהתה

החשבון הראשי במערכת נוצר בטעות במטבע EUR במקום USD כפי שנדרש.

## תיקונים שבוצעו

### 1. תיקון הסקריפט `generate_demo_data.py`

#### שינויים בקוד:

**א. הוספת הערה מפורשת:**
```python
# Account 1: Primary (70% activity, all swing)
# CRITICAL: Primary account MUST be in USD currency
account1 = TradingAccount(
    name="חשבון מסחר ראשי",
    currency_id=usd_currency.id,  # MUST be USD - never use other_currency here!
    ...
)
```

**ב. הוספת בדיקות אימות:**
- בדיקה ראשונה: וידוא ש-`account1.currency_id == usd_currency.id` לפני המשך
- בדיקה שנייה: שאילתה לבסיס הנתונים לוודא שהמטבע הוא USD
- הסקריפט יכשל עם שגיאה ברורה אם החשבון הראשי לא ב-USD

**ג. הודעת אישור:**
```python
print(f"   ✅ החשבון הראשי במטבע USD (ID: {usd_currency.id})")
```

### 2. יצירת סקריפט תיקון `fix_primary_account_currency.py`

סקריפט חדש לתיקון חשבונות קיימים:

- **תכונות:**
  - מזהה את החשבון הראשי (לפי שם או חשבון ראשון)
  - בודק את המטבע הנוכחי
  - מתקן ל-USD אם צריך
  - תומך ב-`--dry-run` לבדיקה

- **שימוש:**
  ```bash
  python3 Backend/scripts/fix_primary_account_currency.py [--dry-run]
  ```

### 3. בדיקת בסיסי נתונים קיימים

נבדקו שני בסיסי נתונים:

1. **`TikTrack-db-development`**:
   - חשבון ראשי: "חשבון בדיקות" - USD ✅

2. **`TikTrack-db-cleanup-test`**:
   - חשבון ראשי: "חשבון מסחר ראשי" - USD ✅

כל החשבונות הראשיים כבר במטבע USD.

---

## הגנות שהוספו

### 1. בדיקות בזמן יצירה

הסקריפט `generate_demo_data.py` כולל כעת שתי בדיקות:

```python
# בדיקה ראשונה - לפני המשך
if account1.currency_id != usd_currency.id:
    raise DataGenerationError(...)

# בדיקה שנייה - וידוא מהבסיס נתונים
account1_currency = self.db.execute(text('''
    SELECT c.symbol FROM currencies c 
    WHERE c.id = :currency_id
'''), {'currency_id': account1.currency_id}).scalar()

if account1_currency != 'USD':
    raise DataGenerationError(...)
```

### 2. הערות מפורשות בקוד

הקוד כולל הערות ברורות שמבהירות שהחשבון הראשי חייב להיות ב-USD.

### 3. סקריפט תיקון לנתונים קיימים

סקריפט נפרד לתיקון חשבונות קיימים אם נוצרו בטעות.

---

## בדיקות שבוצעו

### ✅ בדיקת בסיס נתונים פיתוח
- חשבון ראשי במטבע USD

### ✅ בדיקת בסיס נתונים cleanup-test
- חשבון ראשי במטבע USD

### ✅ בדיקת הסקריפט
- כל הבדיקות עוברות
- אין שגיאות linter

---

## תוצאה

**התיקון הושלם בהצלחה!**

1. ✅ הסקריפט `generate_demo_data.py` מתוקן ומונע יצירת חשבון ראשי במטבע לא נכון
2. ✅ הוספו בדיקות אימות קפדניות
3. ✅ נוצר סקריפט תיקון לנתונים קיימים
4. ✅ כל החשבונות הראשיים הקיימים במטבע USD

---

**הערות:**
- הסקריפט יכשל בבירור אם ינסה ליצור חשבון ראשי במטבע לא נכון
- מומלץ להריץ את `fix_primary_account_currency.py` לפני כל הרצת `generate_demo_data.py` על נתונים קיימים

---

**תאריך יצירה:** 29 בנובמבר 2025

