# מערכת ולידציה - דוקומנטציה מפורטת

## סקירה כללית

מערכת הולידציה הגלובלית של TikTrack מספקת ולידציה בזמן אמת ובזמן שליחה לכל הטופסים במערכת. המערכת תומכת בכל סוגי השדות ומאפשרת הגדרות מותאמות אישית.

## תכונות עיקריות

✅ **ולידציה בזמן אמת** (oninput, onblur, onchange)  
✅ **ולידציה בזמן שליחה** (form submission)  
✅ **סימון ויזואלי** עם אייקונים (✓ ירוק, ✗ אדום)  
✅ **תמיכה בכל סוגי השדות** (text, number, email, date, select, textarea)  
✅ **הגדרות מותאמות לכל שדה**  
✅ **ולידציה מותאמת אישית** עם פונקציות  
✅ **הודעות שגיאה בעברית**  
✅ **לוג מפורט לדיבוג**  

## סוגי ולידציה נתמכים

### 📝 שדות טקסט
- `minLength` - אורך מינימלי
- `maxLength` - אורך מקסימלי
- `pattern` - תבנית regex
- `customValidation` - ולידציה מותאמת אישית

### 🔢 שדות מספר
- `min` - ערך מינימלי
- `max` - ערך מקסימלי
- `step` - צעד מספרי
- `customValidation` - ולידציה מותאמת אישית

### 📧 אימייל
- `pattern` - תבנית regex
- `customValidation` - ולידציה מותאמת אישית

### 📅 תאריכים
- `minDate` - תאריך מינימלי
- `maxDate` - תאריך מקסימלי
- `customValidation` - ולידציה מותאמת אישית

### 📋 סלקט
- `required` - שדה חובה
- `customValidation` - ולידציה מותאמת אישית

### 📄 textarea
- `minLength` - אורך מינימלי
- `maxLength` - אורך מקסימלי
- `customValidation` - ולידציה מותאמת אישית

## שימוש בסיסי

### 1. הגדרת כללי ולידציה

```javascript
const validationRules = {
    'fieldName': {
        required: true,
        type: 'text',
        minLength: 3,
        maxLength: 50,
        customValidation: (value) => {
            if (value.includes('test')) {
                return 'לא יכול להכיל את המילה test';
            }
            return true;
        }
    }
};
```

### 2. קריאה לוולידציה

```javascript
const isValid = window.validateForm('formId', validationRules);
```

### 3. אתחול ולידציה בזמן אמת

```javascript
window.initializeValidation('formId', validationRules);
```

## דוגמאות שימוש

### שדה טקסט חובה עם אורך מינימום

```javascript
'userName': {
    required: true,
    type: 'text',
    minLength: 2,
    maxLength: 30,
    message: 'שם משתמש חייב להיות בין 2 ל-30 תווים'
}
```

### שדה מספר עם גבולות

```javascript
'amount': {
    required: true,
    type: 'number',
    min: 0.01,
    max: 999999999,
    customValidation: (value) => {
        if (parseFloat(value) <= 0) {
            return 'סכום חייב להיות חיובי';
        }
        return true;
    }
}
```

### שדה סלקט עם ולידציה מותאמת

```javascript
'category': {
    required: true,
    type: 'select',
    customValidation: (value) => {
        const validOptions = ['option1', 'option2', 'option3'];
        if (!validOptions.includes(value)) {
            return 'אפשרות לא תקינה';
        }
        return true;
    }
}
```

## פונקציות ייצוא

### Global Functions (window)

- `validateForm(formId, validationRules)` - ולידציה של טופס
- `initializeValidation(formId, validationRules)` - אתחול ולידציה בזמן אמת
- `clearValidation(formId)` - ניקוי ולידציה
- `showFieldError(field, message)` - הצגת שגיאה בשדה
- `clearFieldError(field)` - ניקוי שגיאה משדה

### Utility Functions

- `validateTextField(value, rules)` - ולידציה של שדה טקסט
- `validateNumberField(value, rules)` - ולידציה של שדה מספר
- `validateEmailField(value, rules)` - ולידציה של שדה אימייל
- `validateDateField(value, rules)` - ולידציה של שדה תאריך
- `validateSelectField(value, rules)` - ולידציה של שדה סלקט

## דרישות HTML

1. **שדות חייבים להיות עם `name` attribute**
2. **שדות חובה צריכים `required` attribute**
3. **שדות מספר צריכים `type="number"`
4. **שדות תאריך צריכים `type="date"`
5. **שדות אימייל צריכים `type="email"`

## דוגמה HTML

```html
<form id="myForm">
    <input type="text" name="userName" required>
    <input type="number" name="amount" required>
    <select name="category" required>
        <option value="">בחר קטגוריה</option>
        <option value="option1">אפשרות 1</option>
    </select>
</form>
```

## הודעות שגיאה

המערכת מציגה הודעות שגיאה בעברית:

- **שדה זה הוא חובה** - לשדות חובה ריקים
- **ערך מספרי לא תקין** - לשדות מספר לא תקינים
- **תאריך לא תקין** - לתאריכים לא תקינים
- **כתובת אימייל לא תקינה** - לאימיילים לא תקינים
- **טקסט קצר מדי/ארוך מדי** - לאורך טקסט לא תקין
- **ערך נמוך/גבוה מדי** - לערכים מספריים מחוץ לטווח

## לוג ודיבוג

המערכת מספקת לוג מפורט:

```
🔍 === VALIDATE FORM ===
🔍 Form ID: formId
🔍 Validation rules: {...}
✅/❌ תוצאות ולידציה
🔍 Errors: {...}
```

## תאימות

- **תמיכה מלאה ב-Bootstrap 5**
- **תמיכה ב-ES6+**
- **תמיכה בכל הדפדפנים המודרניים**
- **תמיכה ב-RTL (עברית)**

## פונקציות ולידציה מותאמות

### ולידציה של סמל מטבע

```javascript
function validateCurrencySymbol(value) {
    if (!value || value.length === 0) return 'סמל מטבע הוא חובה';
    if (value.length !== 3) return 'סמל מטבע חייב להיות 3 תווים';
    if (!/^[A-Z]{3}$/.test(value)) return 'סמל מטבע חייב להיות 3 אותיות גדולות';
    return true;
}
```

### ולידציה של שער מטבע

```javascript
function validateCurrencyRate(value) {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'שער מטבע חייב להיות מספר';
    if (numValue <= 0) return 'שער מטבע חייב להיות חיובי';
    if (numValue > 1000000) return 'שער מטבע לא יכול להיות יותר מ-1,000,000';
    return true;
}
```

### ולידציה של סמל טיקר

```javascript
function validateTickerSymbol(value) {
    if (!value || value.length === 0) return 'סמל טיקר הוא חובה';
    if (value.length > 10) return 'סמל טיקר לא יכול להיות יותר מ-10 תווים';
    if (!/^[A-Z0-9.]+$/.test(value)) return 'סמל טיקר יכול להכיל רק אותיות גדולות, מספרים ונקודות';
    return true;
}
```

## דוגמאות שימוש בעמודים

### עמוד תוכניות מסחר (Trade Plans)

```javascript
const validationRules = {
    'addTradePlanTickerId': { 
        required: true, 
        type: 'select',
        message: 'יש לבחור טיקר'
    },
    'addTradePlanInvestmentType': { 
        required: true, 
        type: 'select',
        message: 'יש לבחור סוג השקעה',
        customValidation: (value) => {
            const validTypes = ['swing', 'investment', 'passive'];
            if (!validTypes.includes(value)) {
                return 'סוג השקעה לא תקין';
            }
            return true;
        }
    },
    'addTradePlanPlannedAmount': { 
        required: true, 
        type: 'number',
        min: 0.01,
        max: 999999999,
        message: 'יש להזין סכום מתוכנן'
    }
};

// אתחול ולידציה בזמן אמת
window.initializeValidation('addTradePlanForm', validationRules);

// ולידציה בזמן שליחה
const isValid = window.validateForm('addTradePlanForm', validationRules);
```

### עמוד התראות (Alerts)

```javascript
const validationRules = {
    'alertName': {
        required: true,
        type: 'text',
        minLength: 2,
        maxLength: 100,
        message: 'שם התראה חייב להיות בין 2 ל-100 תווים'
    },
    'alertCondition': {
        required: true,
        type: 'text',
        customValidation: (value) => {
            if (!value.includes('price') && !value.includes('volume')) {
                return 'תנאי חייב להכיל מחיר או נפח';
            }
            return true;
        }
    }
};
```

## פתרון בעיות

### ולידציה לא עובדת

1. **בדוק שהקובץ נטען** - וודא ש-`validation-utils.js` נטען לפני השימוש
2. **בדוק שמות שדות** - וודא שה-`name` attributes תואמים לכללי הולידציה
3. **בדוק לוג** - פתח את ה-Developer Tools ובדוק את הלוגים
4. **בדוק event listeners** - וודא שה-`initializeValidation` נקרא

### הודעות שגיאה לא מוצגות

1. **בדוק CSS** - וודא שה-Bootstrap CSS נטען
2. **בדוק DOM** - וודא שהשדות נמצאים בתוך `<form>` עם ID
3. **בדוק parent elements** - וודא שיש אלמנט parent לשדה

### ולידציה מותאמת אישית לא עובדת

1. **בדוק פונקציה** - וודא שהפונקציה מחזירה `true` או מחרוזת שגיאה
2. **בדוק פרמטרים** - וודא שהפונקציה מקבלת את הפרמטרים הנכונים
3. **בדוק לוג** - הוסף `console.log` לפונקציה לדיבוג

## עדכונים ושינויים

### גרסה 2.1 (אוגוסט 27, 2025)
- הוספת ולידציה מיידית בזמן אמת
- שיפור הודעות שגיאה בעברית
- הוספת לוג מפורט לדיבוג
- תמיכה בולידציה מותאמת אישית מתקדמת

### גרסה 2.0 (אוגוסט 26, 2025)
- יצירת מערכת ולידציה גלובלית
- תמיכה בכל סוגי השדות
- אינטגרציה עם Bootstrap 5
- תמיכה ב-RTL

---

**קובץ:** `trading-ui/scripts/validation-utils.js`  
**דוקומנטציה:** `VALIDATION_SYSTEM_DOCUMENTATION.md`  
**צוות פיתוח:** TikTrack Development Team



