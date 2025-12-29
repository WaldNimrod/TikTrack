# תכנית תיקון E2E Tests לכל הישויות

## מטרת המסמך

מסמך זה מגדיר תכנית שיטתית לתיקון כל בדיקות ה-E2E עבור כל הישויות במערכת, בהתבסס על הלקחים מהתיקון המוצלח של ישות הטרייד.

**תאריך יצירה:** 2025-12-23  
**מבוסס על:** `E2E_TRADE_TEST_FIXES_SUMMARY.md`  
**תאריך עדכון אחרון:** 2025-12-23

---

## סיכום תיקונים שבוצעו (2025-12-23)

### תיקונים קריטיים שהושלמו

1. ✅ **trading_account** - הסרת שדה `type` שלא קיים במודל
2. ✅ **alert** - תיקון `status` default מ-'new' ל-'open'
3. ✅ **ticker** - תיקון `status` default מ-'closed' ל-'open' + הוספת validation ל-maxLength
4. ✅ **trade_plan** - הסרת `created_at` מה-field map (מגיע מ-BaseModel)

### שיפורים כלליים

- ✅ הוספת validation ל-maxLength ב-`validateFieldValues` (תמיכה ב-`symbol` ו-`name` של ticker)

---

## סיכום בעיות שזוהו

### בעיות כלליות שזוהו בכל הישויות

1. **שמות שדות לא תואמים** - שדות ב-field map לא תואמים למודל Backend
2. **ערכי ברירת מחדל שגויים** - ערכים לא תואמים ל-Validation ב-Backend
3. **שדות לא קיימים** - שדות ב-field map שלא קיימים במודל
4. **שדות חובה לא מולאים** - שדות חובה שלא מולאים אוטומטית
5. **Case sensitivity** - בעיות עם case sensitivity ב-select elements
6. **Modal closure** - מודלים לא נסגרים אחרי שמירה

---

## רשימת ישויות לבדיקה ותיקון

### ✅ 1. trade - **תוקן בהצלחה**

**סטטוס:** עובר בהצלחה (גם פרטני וגם משותף)

**תיקונים שבוצעו:**

- תיקון שדה `quantity` → `planned_quantity`
- הסרת שדות לא קיימים (`stop_price`, `target_price`, `entry_date`, `tag_ids`)
- תיקון ערכי ברירת מחדל (`side`: 'Long', `investment_type`: 'Swing')
- הוספת case-insensitive matching ל-select elements
- תיקון טיפול ב-`#` prefix ב-IDs
- הוספת שלבי View ו-Edit
- תיקון modal closure

---

### ✅ 2. trade_plan - **תוקן**

**בעיות שזוהו:**

- ✅ `side` default: 'Long' - תוקן
- ✅ `investment_type` default: 'Swing' - תוקן
- ✅ `status` default: 'open' - נכון (תואם Backend)
- ✅ `created_at` - הוסר מה-field map (מגיע מ-BaseModel אוטומטית)

**תיקונים שבוצעו:**

- הסרת `created_at` מה-field map (שורה 139)

**פעולות נדרשות:**

- [ ] בדיקת מילוי אוטומטי של שדות `int` מסוג `select`
- [ ] הרצת בדיקה פרטנית
- [ ] הרצת בדיקה משותפת

---

### ✅ 3. alert - **תוקן**

**בעיות שזוהו:**

- ✅ `status` default: 'new' - תוקן ל-'open' (לפי מודל Backend)
- ⚠️ `alertStatusCombined` - שדה זה לא קיים במודל, צריך לבדוק מה זה (נשאר כ-ID של שדה status)
- ⚠️ שדות condition - צריך לוודא שהם מולאים נכון

**תיקונים שבוצעו:**

- תיקון `status` default מ-'new' ל-'open' (שורה 153)

**פעולות נדרשות:**

- [ ] בדיקת מילוי שדות condition (`condition_attribute`, `condition_operator`, `condition_number`)
- [ ] בדיקת validation של שדות condition ב-Backend
- [ ] הרצת בדיקה פרטנית
- [ ] הרצת בדיקה משותפת

---

### ✅ 4. ticker - **תוקן**

**בעיות שזוהו:**

- ✅ `status` default: 'closed' - תוקן ל-'open' (לפי מודל Backend)
- ✅ `symbol` - הוסף validation לאורך מקסימלי 10 תווים
- ✅ `name` - הוסף validation לאורך מקסימלי 100 תווים

**תיקונים שבוצעו:**

- תיקון `status` default מ-'closed' ל-'open' (שורה 168)
- הוספת `maxLength: 10` ל-`symbol` (שורה 164)
- הוספת `maxLength: 100` ל-`name` (שורה 165)
- הוספת validation ל-maxLength ב-`validateFieldValues` (שורות 2919-2923)

**פעולות נדרשות:**

- [ ] בדיקת מילוי אוטומטי של `currency_id` (שדה `int` מסוג `select`)
- [ ] הרצת בדיקה פרטנית
- [ ] הרצת בדיקה משותפת

---

### ✅ 5. trading_account - **תוקן**

**בעיות שזוהו:**

- ✅ `type` - הוסר מה-field map (לא קיים במודל TradingAccount)

**תיקונים שבוצעו:**

- הסרת `type` מה-field map (שורה 179)

**פעולות נדרשות:**

- [ ] בדיקת מילוי אוטומטי של `currency_id` (שדה `int` מסוג `select`)
- [ ] הרצת בדיקה פרטנית
- [ ] הרצת בדיקה משותפת

---

### ⏳ 6. cash_flow - **דורש בדיקה**

**בעיות שזוהו:**

- ⚠️ `date` - שדה חובה, צריך לוודא שהוא מולא
- ✅ `date` type: 'date' - נכון (תואם למודל Backend שהוא `Date`, לא `DateTime`)

**הערות:**

- הקוד כבר מטפל במילוי אוטומטי של שדות `date` (שורות 2190-2192)
- הקוד כבר מטפל במילוי אוטומטי של שדות `int` מסוג `select` (שורות 2205-2218)

**פעולות נדרשות:**

- [ ] בדיקת מילוי אוטומטי של `trading_account_id` ו-`currency_id` (שדות `int` מסוג `select`)
- [ ] בדיקת מילוי `date` field
- [ ] הרצת בדיקה פרטנית
- [ ] הרצת בדיקה משותפת

---

### ⏳ 7. note - **דורש בדיקה**

**בעיות שזוהו:**

- ⚠️ `related_id` - שדה חובה, צריך לוודא שהוא מולא (תלוי ב-`related_type_id`)
- ⚠️ `content` - שדה חובה (rich-text), צריך לוודא שהוא מולא
- ⚠️ `related_type_id` - שדה חובה, צריך לוודא שהוא מולא

**הערות:**

- הקוד כבר מטפל במילוי אוטומטי של שדות `int` מסוג `select` (שורות 2205-2218)
- `related_id` תלוי ב-`related_type_id` - צריך לוודא שהקוד ממלא את `related_id` אחרי בחירת `related_type_id`

**פעולות נדרשות:**

- [ ] בדיקת מילוי אוטומטי של `related_type_id` (שדה `int` מסוג `select`)
- [ ] בדיקת מילוי אוטומטי של `related_id` אחרי בחירת `related_type_id`
- [ ] בדיקת מילוי `content` (rich-text editor)
- [ ] הרצת בדיקה פרטנית
- [ ] הרצת בדיקה משותפת

---

### ⏳ 8. execution - **דורש בדיקה**

**בעיות שזוהו:**

- ✅ `tag_ids` - הוסר מה-field map
- ⚠️ צריך לבדוק את כל השדות החובה

**פעולות נדרשות:**

- [ ] בדיקת מילוי אוטומטי של שדות `int` מסוג `select` (`ticker_id`, `trading_account_id`)
- [ ] בדיקת מילוי `date` (datetime-local)
- [ ] הרצת בדיקה פרטנית
- [ ] הרצת בדיקה משותפת

---

### ⏳ 9. watch_list - **דורש בדיקה**

**בעיות שזוהו:**

- ⚠️ נראה בסדר, אבל צריך לבדוק

**פעולות נדרשות:**

- [ ] בדיקת מילוי `name` (שדה חובה)
- [ ] הרצת בדיקה פרטנית
- [ ] הרצת בדיקה משותפת

---

### ⏳ 10. tag_category - **דורש בדיקה**

**בעיות שזוהו:**

- ⚠️ נראה בסדר, אבל צריך לבדוק

**פעולות נדרשות:**

- [ ] בדיקת מילוי `name` (שדה חובה)
- [ ] הרצת בדיקה פרטנית
- [ ] הרצת בדיקה משותפת

---

### ⏳ 11. tag - **דורש בדיקה**

**בעיות שזוהו:**

- ⚠️ נראה בסדר, אבל צריך לבדוק

**פעולות נדרשות:**

- [ ] בדיקת מילוי `name` (שדה חובה)
- [ ] בדיקת מילוי אוטומטי של `category_id` (אם קיים)
- [ ] הרצת בדיקה פרטנית
- [ ] הרצת בדיקה משותפת

---

### ⏳ 12. trading_journal - **דורש בדיקה**

**בעיות שזוהו:**

- ⚠️ נראה בסדר, אבל צריך לבדוק

**פעולות נדרשות:**

- [ ] בדיקת מילוי אוטומטי של `trade_id` (שדה `int` מסוג `select`)
- [ ] בדיקת מילוי `entry_date` (datetime-local)
- [ ] הרצת בדיקה פרטנית
- [ ] הרצת בדיקה משותפת

---

### ⏳ 13. preference_profile - **דורש בדיקה**

**בעיות שזוהו:**

- ⚠️ נראה בסדר, אבל צריך לבדוק

**פעולות נדרשות:**

- [ ] בדיקת מילוי `name` (שדה חובה)
- [ ] הרצת בדיקה פרטנית
- [ ] הרצת בדיקה משותפת

---

### ⏳ 14. user_profile - **דורש בדיקה**

**בעיות שזוהו:**

- ⚠️ עמוד לא נטען בהרצה משותפת (`Element table tbody, .table tbody, main, [data-section="main"] not found`)
- ⚠️ `modalId: null` - לא משתמש במודל, צריך לבדוק איך זה עובד

**פעולות נדרשות:**

- [ ] בדיקת טעינת העמוד (למה הוא לא נטען?)
- [ ] בדיקת טיפול ב-`modalId: null` ב-`runGenericCRUDTest`
- [ ] בדיקת מילוי שדות (`first_name`, `last_name`, `email`)
- [ ] הרצת בדיקה פרטנית
- [ ] הרצת בדיקה משותפת

---

## תהליך עבודה שיטתי

### שלב 1: ניתוח וזיהוי בעיות

לכל ישות:

1. **בדיקת מודל Backend** - קריאת המודל וזיהוי שדות אמיתיים
2. **השוואה ל-field map** - זיהוי חוסר התאמות
3. **זיהוי בעיות validation** - בדיקת ערכי ברירת מחדל ו-validation rules
4. **תיעוד בעיות** - רישום כל הבעיות במסמך זה

### שלב 2: תיקון Field Maps

לכל ישות:

1. **תיקון שמות שדות** - התאמה למודל Backend
2. **הסרת שדות לא קיימים** - הסרת שדות שלא קיימים במודל
3. **תיקון ערכי ברירת מחדל** - התאמה ל-Validation ב-Backend
4. **הוספת שדות חסרים** - הוספת שדות שחסרים ב-field map

### שלב 3: תיקון Data Collection

1. **בדיקת טיפול ב-select elements** - וידוא ש-`setFormData` מטפל נכון
2. **בדיקת case-insensitive matching** - וידוא שזה עובד לכל ה-select elements
3. **בדיקת טיפול ב-`#` prefix** - וידוא ש-IDs מטופלים נכון

### שלב 4: תיקון Validation

1. **בדיקת validation של select elements** - וידוא ש-`validateRequiredFields` מטפל נכון
2. **בדיקת validation של rich-text editors** - וידוא ש-`RichTextEditorService.getContent` עובד
3. **הוספת validation rules** - הוספת rules ספציפיים לישות (אורך מקסימלי, enums, וכו')

### שלב 5: בדיקות

1. **הרצת בדיקה פרטנית** - בדיקת ישות אחת בלבד
2. **תיקון בעיות** - תיקון כל הבעיות שזוהו
3. **הרצת בדיקה משותפת** - בדיקת כל הישויות יחד
4. **תיקון בעיות state management** - תיקון בעיות שמופיעות רק בהרצה משותפת

---

## דפוסי תיקון נפוצים

### דפוס 1: תיקון ערכי ברירת מחדל

```javascript
// לפני:
status: { id: '#alertStatus', type: 'text', required: true, default: 'new' }

// אחרי:
status: { id: '#alertStatus', type: 'text', required: true, default: 'open' }
```

### דפוס 2: הסרת שדות לא קיימים

```javascript
// לפני:
fields: {
    type: { id: '#accountType', type: 'text', default: null },
    // ... other fields
}

// אחרי:
fields: {
    // type removed - not in TradingAccount model
    // ... other fields
}
```

### דפוס 3: תיקון validation rules

```javascript
// הוספת validation לאורך מקסימלי:
validateFieldValues(doc, fieldMap) {
    // ... existing code ...
    
    // Check string length limits
    if (fieldName === 'symbol' && value.length > 10) {
        errors.push(`Field ${fieldName} exceeds maximum length of 10 characters`);
    }
    
    // ... rest of function
}
```

---

## סדר עדיפויות

### עדיפות קריטית (Critical)

1. **trading_account** - הסרת `type` (שגיאה ב-API)
2. **alert** - תיקון `status` default
3. **ticker** - תיקון `status` default ו-validation של `symbol`

### עדיפות גבוהה (High)

4. **cash_flow** - תיקון טיפול ב-`date`
5. **note** - תיקון מילוי שדות חובה
6. **trade_plan** - בדיקת `created_at`

### עדיפות בינונית (Medium)

7. **execution** - בדיקת כל השדות
8. **watch_list** - בדיקה כללית
9. **tag_category** - בדיקה כללית
10. **tag** - בדיקה כללית

### עדיפות נמוכה (Low)

11. **trading_journal** - בדיקה כללית
12. **preference_profile** - בדיקה כללית
13. **user_profile** - תיקון טעינת עמוד

---

## כללי עבודה

### לפני כל תיקון

1. ✅ קריאת מודל Backend
2. ✅ השוואה ל-field map הקיים
3. ✅ זיהוי כל הבעיות
4. ✅ תיעוד במסמך זה

### במהלך תיקון

1. ✅ תיקון field map
2. ✅ בדיקת validation
3. ✅ הרצת בדיקה פרטנית
4. ✅ תיקון בעיות שזוהו

### אחרי תיקון

1. ✅ הרצת בדיקה משותפת
2. ✅ תיקון בעיות state management
3. ✅ עדכון מסמך זה
4. ✅ הסרת instrumentation זמני

---

## הערות חשובות

1. **לא לשנות קוד של ישויות שכבר עובדות** - רק לתקן ישויות שלא עובדות
2. **לשמור על עקביות** - להשתמש באותם דפוסי תיקון לכל הישויות
3. **לתעד הכל** - כל תיקון צריך להיות מתועד במסמך זה
4. **לבדוק לפני ואחרי** - תמיד להריץ בדיקה לפני ואחרי תיקון

---

**תאריך עדכון אחרון:** 2025-12-23  
**מחבר:** TikTrack Development Team  
**גרסה:** 1.0.0

