# דוח שיפורים - יצירת נתוני דוגמה

**תאריך:** 28 בנובמבר 2025  
**גרסה:** 1.1.0  
**מטרה:** דוח על שיפורים שבוצעו בתהליך יצירת נתוני הדוגמה

---

## סיכום

בוצעו שיפורים מקיפים בסקריפט `generate_demo_data.py` כדי להבטיח פיזור מדויק יותר של נתונים בהתאם לדרישות:
- 90% Long בטריידים
- 70% מהתוכניות לחשבון הראשי
- פיזור תאריכים מדויק: 40% בחצי שנה, 70% מתוכם בשלושה חודשים

---

## תיקונים שבוצעו

### 1. תיקון פיזור Long/Short בטריידים

**בעיה:** טריידים עצמאיים היו 50% Long במקום 90%.

**פתרון:**
- שימוש ב-shuffled indices עבור טריידים עצמאיים
- שימוש באותה לוגיקה כמו בתוכניות

**קוד:**
```python
# Create shuffled indices for side distribution
independent_indices = list(range(independent_count))
random.shuffle(independent_indices)

# Use shuffled indices to assign side
side_index = independent_indices[i]
side = 'Long' if side_index < independent_long_count else 'Short'
```

**תוצאה:** 93.8% Long בטריידים (צפוי ~90%) ✅

---

### 2. תיקון פיזור תוכניות לחשבון הראשי

**בעיה:** רק 50% מהתוכניות היו לחשבון הראשי במקום 70%.

**פתרון:**
- יצירת shuffled indices עבור פיזור חשבון
- שימוש ב-shuffled indices כדי להבטיח 70% לחשבון הראשי

**קוד:**
```python
# Create shuffled indices for account distribution
primary_plan_indices = list(range(count))
random.shuffle(primary_plan_indices)
primary_plan_indices_set = set(primary_plan_indices[:primary_account_count])

# Check if this plan should go to primary account
is_primary_plan = (i in primary_plan_indices_set)
```

**תוצאה:** 70.0% מהתוכניות לחשבון הראשי (צפוי ~70%) ✅

---

### 3. תיקון פיזור תאריכים

**בעיה:** 66.7% מהתוכניות היו בחצי שנה האחרונה במקום 40%, ו-63.7% בשלושה חודשים מתוך ששת החודשים במקום 70%.

**פתרון:**
- שימוש ב-`generate_date_in_range` במקום `generate_date('random')` לתאריכים בשלושה חודשים
- שימוש ב-`generate_date_in_range` עם טווח מדויק (180-730 ימים) לתאריכים לפני חצי שנה

**קוד:**
```python
# For last 3 months - use precise range
if date_index < last_3m_count:
    plan_date = self.date_gen.generate_date_in_range(
        self.date_gen.three_months_ago,
        self.date_gen.now
    )
# For months 3-6 - use precise range
elif date_index < last_6m_count:
    plan_date = self.date_gen.generate_date_in_range(
        self.date_gen.six_months_ago,
        self.date_gen.three_months_ago
    )
# For before 6 months - use precise range (180-730 days)
else:
    one_and_half_years_ago = self.date_gen.now - timedelta(days=730)
    plan_date = self.date_gen.generate_date_in_range(
        one_and_half_years_ago,
        self.date_gen.six_months_ago
    )
```

**תוצאה:**
- 40.0% בחצי שנה האחרונה (צפוי ~40%) ✅
- 27.5% בשלושה חודשים (צפוי ~28%) ✅
- 60.0% לפני חצי שנה (צפוי ~60%) ✅
- 68.8% שלושה חודשים מתוך ששה (צפוי ~70%) ✅

---

### 4. תיקון סדר מחיקה בניקוי

**בעיה:** ניקוי נכשל עם שגיאת Foreign Key כאשר ניסה למחוק `trade_plans` לפני `trades`.

**פתרון:**
- שינוי סדר המחיקה: מחיקת `trades` לפני `trade_plans`

**קוד:**
```python
# IMPORTANT: Delete trades FIRST before trade plans (due to FK constraints)
result = self.db.execute(text("DELETE FROM trades"))
deleted_trades = result.rowcount

# Now delete trade plans (after trades are deleted)
result = self.db.execute(text("DELETE FROM trade_plans"))
deleted_trade_plans = result.rowcount
```

**תוצאה:** ניקוי עובד כעת ללא שגיאות ✅

---

## תוצאות סופיות

### פיזור Long/Short בטריידים
- **Long:** 75/80 (93.8%) - צפוי ~90% ✅
- **Short:** 5/80 (6.2%)

### פיזור תוכניות לחשבון הראשי
- **לחשבון הראשי:** 84/120 (70.0%) - צפוי ~70% ✅
- **לחשבונות אחרים:** 36/120 (30.0%)

### פיזור תאריכים בתוכניות
- **בשלושה חודשים האחרונים:** 33/120 (27.5%) - צפוי ~28% ✅
- **בחצי שנה האחרונה:** 48/120 (40.0%) - צפוי ~40% ✅
- **לפני חצי שנה:** 72/120 (60.0%) - צפוי ~60% ✅
- **שלושה חודשים מתוך ששה:** 33/48 (68.8%) - צפוי ~70% ✅

---

## קבצים שעודכנו

1. `Backend/scripts/generate_demo_data.py`
   - שיפור פיזור Long/Short בטריידים
   - שיפור פיזור תוכניות לחשבון הראשי
   - שיפור פיזור תאריכים

2. `Backend/scripts/cleanup_user_data.py`
   - תיקון סדר מחיקה (trades לפני trade_plans)

---

## הערות

- הבדלים קטנים של 1-2% בפיזור הם סבירים בגלל הטבע האקראי של הנתונים
- הפיזור עכשיו מדויק הרבה יותר מהגרסה הקודמת
- כל התיקונים נבדקו והם עובדים כצפוי

---

## הצעדים הבאים

1. ✅ שיפור הפיזור - הושלם
2. ✅ אימות התיקונים - הושלם
3. 🔄 בדיקה בדפדפן - מוכן לבדיקה
4. 🔄 תיעוד התהליך המלא - מוכן לתיעוד

---

**מסקנה:** התהליך כעת מדויק ומוכן לשימוש יומיומי לרענון נתוני הדוגמה.

