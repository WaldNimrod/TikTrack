# מערכת ולידציה - TikTrack

## 📅 תאריך עדכון
12 בינואר 2025

## 🎯 מטרת הדוקומנטציה
תיעוד מדויק של מערכת הולידציה, כולל פונקציות זמינות, קריטריונים לבדיקה, ודרך הקריאה הנכונה לכל פונקציה.

## 📁 קבצים מרכזיים
- `trading-ui/scripts/validation-utils.js` - מערכת הולידציה הראשית
- `trading-ui/scripts/notification-system.js` - פונקציות התראה לוולידציה
- `trading-ui/styles/styles.css` - עיצוב הולידציה

## 🔧 פונקציות זמינות

### **1. פונקציות ולידציה בסיסיות**

#### **`window.showValidationWarning(fieldId, message, duration)`**
**תיאור**: התראה אדומה עם סימון שדה ספציפי
**פרמטרים**:
- `fieldId` (string) - מזהה השדה הבעייתי
- `message` (string) - הודעת השגיאה
- `duration` (number) - משך הצגה (ברירת מחדל: 6000)

**תכונות**:
- מציג התראה אדומה
- מסמן את השדה הבעייתי באדום
- מגליל לשדה הבעייתי
- מסיר את הסימון אחרי 3 שניות

**דוגמה**:
```javascript
window.showValidationWarning('currencyName', 'שם המטבע הוא שדה חובה');
```

#### **`window.showFieldError(fieldId, message)`**
**תיאור**: סימון שדה ספציפי בשגיאה
**פרמטרים**:
- `fieldId` (string) - מזהה השדה הבעייתי
- `message` (string) - הודעת השגיאה

**תכונות**:
- מסמן את השדה באדום
- מציג הודעת שגיאה מתחת לשדה
- לא מגליל אוטומטית

**דוגמה**:
```javascript
window.showFieldError('currencyCode', 'קוד המטבע חייב להיות 3 תווים');
```

#### **`window.showFieldSuccess(fieldId)`**
**תיאור**: סימון שדה כמוצלח
**פרמטרים**:
- `fieldId` (string) - מזהה השדה

**תכונות**:
- מסמן את השדה בירוק
- מסיר הודעות שגיאה קודמות

**דוגמה**:
```javascript
window.showFieldSuccess('currencyName');
```

#### **`window.clearFieldValidation(fieldId)`**
**תיאור**: ניקוי ולידציה של שדה ספציפי
**פרמטרים**:
- `fieldId` (string) - מזהה השדה

**תכונות**:
- מסיר סימון אדום/ירוק
- מסיר הודעות שגיאה
- מחזיר לשדה למצב רגיל

**דוגמה**:
```javascript
window.clearFieldValidation('currencyName');
```

### **2. פונקציות ולידציה מתקדמות**

#### **`window.initializeValidation(formId)`**
**תיאור**: אתחול מערכת ולידציה לטופס
**פרמטרים**:
- `formId` (string) - מזהה הטופס

**תכונות**:
- מוסיף מאזיני אירועים לכל השדות
- מגדיר ולידציה בזמן אמת
- מגדיר ניקוי ולידציה בטעינת המודל

**דוגמה**:
```javascript
window.initializeValidation('addCurrencyForm');
```

#### **`window.clearValidation(formId)`**
**תיאור**: ניקוי ולידציה של כל השדות בטופס
**פרמטרים**:
- `formId` (string) - מזהה הטופס

**תכונות**:
- מנקה את כל השדות בטופס
- מסיר כל הודעות שגיאה
- מחזיר את הטופס למצב נקי

**דוגמה**:
```javascript
window.clearValidation('addCurrencyForm');
```

#### **`window.validateField(fieldId, value, rules)`**
**תיאור**: ולידציה של שדה ספציפי
**פרמטרים**:
- `fieldId` (string) - מזהה השדה
- `value` (any) - ערך השדה
- `rules` (object) - כללי הולידציה

**תכונות**:
- בודק את הערך לפי הכללים
- מחזיר true/false
- מציג הודעות שגיאה אוטומטית

**דוגמה**:
```javascript
const isValid = window.validateField('currencyCode', value, {
    required: true,
    minLength: 3,
    maxLength: 3,
    pattern: /^[A-Z]{3}$/
});
```

### **3. פונקציות ולידציה מתקדמות (גרסה 3.0)**

#### **`window.validateDateRange(startFieldId, endFieldId, errorMessage)`**
**תיאור**: ולידציה בין שדות תאריך
**פרמטרים**:
- `startFieldId` (string) - מזהה שדה התאריך הראשון
- `endFieldId` (string) - מזהה שדה התאריך השני
- `errorMessage` (string) - הודעת שגיאה מותאמת אישית

**תכונות**:
- בודק שהתאריך השני לא לפני הראשון
- מציג הודעת שגיאה מותאמת
- מחזיר true/false

**דוגמה**:
```javascript
const isValid = window.validateDateRange('openedAt', 'closedAt', 'תאריך סגירה חייב להיות אחרי תאריך פתיחה');
```

#### **`window.validateEntityForm(formId, fieldConfigs)`**
**תיאור**: ולידציה מקיפה לטפסי CRUD נפוצים
**פרמטרים**:
- `formId` (string) - מזהה הטופס
- `fieldConfigs` (array) - מערך של קונפיגורציות שדות

**תכונות**:
- ולידציה מקיפה של כל השדות בטופס
- מחזיר אובייקט עם תוצאות מפורטות
- מציג הודעות שגיאה מפורטות

**דוגמה**:
```javascript
const fieldConfigs = [
  {id: 'name', name: 'שם', rules: {required: true, minLength: 2}},
  {id: 'email', name: 'אימייל', rules: {required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/}},
  {id: 'age', name: 'גיל', rules: {required: false, min: 0, max: 120}}
];

const result = window.validateEntityForm('userForm', fieldConfigs);
if (!result.isValid) {
  console.log('שגיאות:', result.errorMessages);
}
```

#### **`window.validateWithConfirmation(title, message, validationFn)`**
**תיאור**: ולידציה עם אישור משתמש
**פרמטרים**:
- `title` (string) - כותרת האישור
- `message` (string) - הודעת האישור
- `validationFn` (function) - פונקציית ולידציה

**תכונות**:
- מציג דיאלוג אישור למשתמש
- מבצע ולידציה רק אחרי אישור
- מחזיר תוצאות הולידציה

**דוגמה**:
```javascript
const result = await window.validateWithConfirmation(
  'אישור מחיקה',
  'האם אתה בטוח שברצונך למחוק את הפריט?',
  () => window.validateEntityForm('deleteForm', fieldConfigs)
);
```

## 📋 מתי להשתמש בכל פונקציה

| פונקציה | מתי להשתמש | דוגמה |
|---------|------------|-------|
| `window.validateField()` | ולידציה של שדה בודד | בדיקת שם, אימייל, מספר |
| `window.validateDateRange()` | ולידציה בין שדות תאריך | תאריך פתיחה ≤ תאריך סגירה |
| `window.validateEntityForm()` | ולידציה מקיפה של טופס | טפסי CRUD עם מספר שדות |
| `window.validateWithConfirmation()` | ולידציה עם אישור משתמש | מחיקה, פעולות הרסניות |
| `window.showValidationWarning()` | התראה מהירה | שגיאות בזמן אמת |
| `window.showFieldError()` | סימון שדה ספציפי | שגיאות ולידציה |
| `window.showFieldSuccess()` | סימון שדה מוצלח | אישור תקינות |
| `window.clearFieldValidation()` | ניקוי שדה בודד | איפוס שדה |
| `window.clearValidation()` | ניקוי כל הטופס | פתיחת מודל חדש |

## 🎨 עיצוב ולידציה

### **סגנונות CSS**
```css
/* שדה עם שגיאה */
.field-error {
    border: 2px solid #dc3545 !important;
    background-color: rgba(220, 53, 69, 0.1);
}

/* שדה מוצלח */
.field-success {
    border: 2px solid #28a745 !important;
    background-color: rgba(40, 167, 69, 0.1);
}

/* הודעת שגיאה */
.validation-error {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    display: block;
}

/* איקון שגיאה */
.field-error-icon {
    color: #dc3545;
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
}
```

## 🔧 שימוש נכון במערכת

### **1. טעינת מערכת ולידציה**
**חובה** לכלול `validation-utils.js` לפני קובץ העמוד:
```html
<script src="scripts/validation-utils.js"></script>
<script src="scripts/[PAGE].js"></script>
```

### **2. אתחול ולידציה בטופס**
```javascript
// אתחול ולידציה בטעינת המודל
document.addEventListener('DOMContentLoaded', function() {
    window.initializeValidation('addCurrencyForm');
});

// ניקוי ולידציה בפתיחת מודל
$('#addCurrencyModal').on('show.bs.modal', function() {
    window.clearValidation('addCurrencyForm');
});
```

### **3. ולידציה בזמן אמת**
```javascript
// הוספת מאזיני אירועים
document.getElementById('currencyName').addEventListener('input', function() {
    const value = this.value;
    window.validateField('currencyName', value, {
        required: true,
        minLength: 2
    });
});

document.getElementById('currencyName').addEventListener('blur', function() {
    const value = this.value;
    if (value && window.validateField('currencyName', value, {required: true})) {
        window.showFieldSuccess('currencyName');
    }
});
```

### **4. טיפול בשגיאות מהשרת**
```javascript
const result = await response.json();

if (response.ok && result.status === 'success') {
    window.showSuccessNotification('הצלחה', 'הפריט נשמר בהצלחה!');
} else {
    // טיפול בשגיאות וולידציה מהשרת
    if (result.error && result.error.validation) {
        Object.keys(result.error.validation).forEach(fieldId => {
            window.showFieldError(fieldId, result.error.validation[fieldId]);
        });
    } else if (result.error && result.error.message) {
        window.showErrorNotification('שגיאה', result.error.message);
    }
}
```

## 🚨 בעיות נפוצות ופתרונות

### **1. מערכת ולידציה לא זמינה**
**בעיה**: `window.showValidationWarning is not a function`
**פתרון**: וידוא ש-`validation-utils.js` נטען לפני קבצי העמוד

### **2. שדות לא מסומנים**
**בעיה**: שדות לא מסומנים באדום/ירוק
**פתרון**: וידוא שהשדות имеют את ה-ID הנכון

### **3. הודעות שגיאה לא מופיעות**
**בעיה**: הודעות שגיאה לא מוצגות
**פתרון**: בדיקת זמינות פונקציות וטעינת קבצים

## 📋 קריטריונים לבדיקה

### **✅ הוספה:**
> 📋 **כל הבדיקות הועברו ל**: [../../CENTRAL_TASKS_TODO.md](../../CENTRAL_TASKS_TODO.md)

### **✅ עריכה:**
> 📋 **כל הבדיקות הועברו ל**: [../../CENTRAL_TASKS_TODO.md](../../CENTRAL_TASKS_TODO.md)

### **✅ וולידציה:**
> 📋 **כל הבדיקות הועברו ל**: [../../CENTRAL_TASKS_TODO.md](../../CENTRAL_TASKS_TODO.md)

### **✅ ולידציה בזמן אמת:**
> 📋 **כל הבדיקות הועברו ל**: [../../CENTRAL_TASKS_TODO.md](../../CENTRAL_TASKS_TODO.md)

## 🔧 תהליכי בדיקה

### **📋 שלב 1: בדיקת מערכת ולידציה**
1. **בדיקת טעינת מערכת ולידציה:**
   ```bash
   # בדיקה שקובץ validation-utils.js נטען
   grep -r "validation-utils.js" trading-ui/[PAGE].html
   ```

2. **בדיקת זמינות פונקציות:**
   ```javascript
   console.log('showValidationWarning:', typeof window.showValidationWarning);
   console.log('showFieldError:', typeof window.showFieldError);
   console.log('validateField:', typeof window.validateField);
   ```

3. **בדיקת ולידציה בזמן אמת:**
   ```javascript
   // בדיקה שמוצגות הודעות ולידציה ספציפיות
   document.getElementById('fieldId').addEventListener('input', function() {
       console.log('ולידציה בזמן אמת:', this.value);
   });
   ```

### **📋 שלב 2: בדיקת הודעות ולידציה מהשרת**
1. **בדיקת הודעות ולידציה מהשרת:**
   - וידוא שמוצגות הודעות ולידציה ספציפיות מהשרת
   - וידוא ששדות מסומנים נכון
   - וידוא שניקוי ולידציה עובד

### **📋 שלב 3: בדיקת ניקוי ולידציה**
1. **בדיקת ניקוי ולידציה:**
   - וידוא שניקוי ולידציה עובד בפתיחת מודלים
   - וידוא שניקוי ולידציה עובד בביטול
   - וידוא שניקוי ולידציה עובד בשמירה מוצלחת
