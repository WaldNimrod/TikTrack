# Field Patterns Catalog - TikTrack Modal System
## קטלוג דפוסי שדות לשימוש חוזר במערכת המודלים

**תאריך יצירה**: 12 בינואר 2025  
**מטרה**: זיהוי וקטלוג של כל דפוסי השדות הקיימים לצורך יצירת רכיבי שדות לשימוש חוזר

---

## 📊 סיכום כללי

**סוגי שדות זוהו**: 12 סוגים עיקריים  
**דפוסי עיצוב**: 4 דפוסים עיקריים  
**רכיבים נדרשים**: 15+ רכיבי שדות  
**אינטגרציה**: מלאה עם כל המערכות הקיימות

---

## 🔤 1. שדות טקסט בסיסיים

### TextField - שדה טקסט רגיל
**שימוש**: שמות, תיאורים, הערות קצרות
**תכונות**:
- `type="text"`
- `placeholder` - טקסט הדרכה
- `maxlength` - הגבלת אורך
- `minlength` - אורך מינימלי
- `required` - שדה חובה

**דוגמה**:
```html
<input type="text" class="form-control" id="entityName" 
       placeholder="הכנס שם" maxlength="50" minlength="3" required>
```

**ולידציה**:
```javascript
{required: true, minLength: 3, maxLength: 50}
```

### EmailField - שדה אימייל
**שימוש**: כתובות אימייל
**תכונות**:
- `type="email"`
- ולידציה אוטומטית של פורמט אימייל

**דוגמה**:
```html
<input type="email" class="form-control" id="userEmail" 
       placeholder="example@domain.com" required>
```

**ולידציה**:
```javascript
{required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/}
```

### PasswordField - שדה סיסמה
**שימוש**: סיסמאות, אימותים
**תכונות**:
- `type="password"`
- `autocomplete="new-password"`

**דוגמה**:
```html
<input type="password" class="form-control" id="userPassword" 
       placeholder="הכנס סיסמה" required>
```

---

## 🔢 2. שדות מספריים

### NumberField - שדה מספר בסיסי
**שימוש**: כמויות, מחירים, אחוזים
**תכונות**:
- `type="number"`
- `step` - צעד העלאה/הורדה
- `min` - ערך מינימלי
- `max` - ערך מקסימלי

**דוגמה**:
```html
<input type="number" class="form-control" id="entityPrice" 
       step="0.01" min="0" max="1000000" placeholder="0.00" required>
```

**ולידציה**:
```javascript
{required: true, min: 0, max: 1000000, step: 0.01}
```

### IntegerField - שדה מספר שלם
**שימוש**: כמויות, מספרים שלמים
**תכונות**:
- `type="number"`
- `step="1"`
- ללא נקודה עשרונית

**דוגמה**:
```html
<input type="number" class="form-control" id="entityQuantity" 
       step="1" min="1" max="10000" placeholder="1000" required>
```

**ולידציה**:
```javascript
{required: true, min: 1, max: 10000, step: 1}
```

### PercentageField - שדה אחוז
**שימוש**: אחוזי רווח/הפסד, אחוזי סיכון
**תכונות**:
- `type="number"`
- `step="0.01"`
- `min="0"` `max="100"`
- עם סימן % בסוף

**דוגמה**:
```html
<div class="input-group">
    <input type="number" class="form-control" id="riskPercentage" 
           step="0.01" min="0" max="100" placeholder="2.50">
    <span class="input-group-text">%</span>
</div>
```

**ולידציה**:
```javascript
{required: false, min: 0, max: 100, step: 0.01}
```

---

## 📅 3. שדות תאריך

### DateField - שדה תאריך
**שימוש**: תאריכים ללא שעה
**תכונות**:
- `type="date"`
- פורמט YYYY-MM-DD

**דוגמה**:
```html
<input type="date" class="form-control" id="entityDate" required>
```

**ולידציה**:
```javascript
{required: true, type: 'date'}
```

### DateTimeField - שדה תאריך ושעה
**שימוש**: תאריכים עם שעה מדויקת
**תכונות**:
- `type="datetime-local"`
- פורמט YYYY-MM-DDTHH:MM

**דוגמה**:
```html
<input type="datetime-local" class="form-control" id="entityDateTime" required>
```

**ולידציה**:
```javascript
{required: true, type: 'datetime-local'}
```

### DateRangeField - שדה טווח תאריכים
**שימוש**: תאריך התחלה וסיום
**תכונות**:
- שני שדות תאריך
- ולידציה בין השדות

**דוגמה**:
```html
<div class="row">
    <div class="col-md-6">
        <input type="date" class="form-control" id="startDate" required>
    </div>
    <div class="col-md-6">
        <input type="date" class="form-control" id="endDate" required>
    </div>
</div>
```

**ולידציה**:
```javascript
window.validateDateRange('startDate', 'endDate', 'תאריך סיום חייב להיות אחרי תאריך התחלה')
```

---

## 📝 4. שדות טקסט ארוך

### TextareaField - שדה טקסט רב-שורות
**שימוש**: הערות, תיאורים ארוכים, ניתוחים
**תכונות**:
- `<textarea>`
- `rows` - מספר שורות
- `maxlength` - הגבלת אורך

**דוגמה**:
```html
<textarea class="form-control" id="entityNotes" rows="4" 
          placeholder="הכנס הערות..." maxlength="1000"></textarea>
```

**ולידציה**:
```javascript
{required: false, maxLength: 1000}
```

### RichTextField - שדה טקסט עשיר
**שימוש**: תוכן מורכב עם עיצוב
**תכונות**:
- עורך טקסט עשיר (WYSIWYG)
- תמיכה בעיצוב בסיסי

**דוגמה**:
```html
<div class="rich-text-editor" id="entityContent">
    <div class="editor-toolbar">
        <button type="button" data-action="bold">B</button>
        <button type="button" data-action="italic">I</button>
    </div>
    <div class="editor-content" contenteditable="true"></div>
</div>
```

---

## 📋 5. שדות בחירה

### SelectField - רשימת בחירה בסיסית
**שימוש**: בחירה מתוך רשימה קבועה
**תכונות**:
- `<select>` עם `<option>`
- `required` - שדה חובה
- אופציה ריקה ("בחר...")

**דוגמה**:
```html
<select class="form-select" id="entityStatus" required>
    <option value="">בחר סטטוס</option>
    <option value="active">פעיל</option>
    <option value="inactive">לא פעיל</option>
    <option value="pending">ממתין</option>
</select>
```

**ולידציה**:
```javascript
{required: true, enum: ['active', 'inactive', 'pending']}
```

### MultiSelectField - בחירה מרובה
**שימוש**: בחירה של מספר ערכים
**תכונות**:
- בחירה מרובה
- תצוגה של הערכים הנבחרים

**דוגמה**:
```html
<select class="form-select" id="entityTags" multiple>
    <option value="urgent">דחוף</option>
    <option value="important">חשוב</option>
    <option value="review">לבדיקה</option>
</select>
```

---

## 🔗 6. שדות מיוחדים

### AccountSelectField - בחירת חשבון מסחר
**שימוש**: בחירת חשבון מסחר מתוך רשימה
**תכונות**:
- טעינה מ-API
- ברירת מחדל מהעדפות משתמש
- אינטגרציה עם SelectPopulatorService

**דוגמה**:
```html
<select class="form-select" id="entityAccount" required>
    <option value="">בחר חשבון</option>
</select>
```

**אינטגרציה**:
```javascript
await SelectPopulatorService.populateAccountsSelect('entityAccount', {
    defaultFromPreferences: true
});
```

### TickerSelectField - בחירת טיקר
**שימוש**: בחירת טיקר מתוך רשימה
**תכונות**:
- טעינה מ-API
- חיפוש וסינון
- הצגת מידע נוסף (מחיר, שינוי)

**דוגמה**:
```html
<select class="form-select" id="entityTicker" required>
    <option value="">בחר טיקר</option>
</select>
<div id="tickerInfo" class="mt-2 d-none">
    <div class="row">
        <div class="col-4">
            <small class="text-muted">מחיר:</small>
            <div id="tickerPrice" class="fw-bold">-</div>
        </div>
        <div class="col-4">
            <small class="text-muted">שינוי יומי:</small>
            <div id="tickerChange" class="fw-bold">-</div>
        </div>
        <div class="col-4">
            <small class="text-muted">ווליום:</small>
            <div id="tickerVolume" class="fw-bold">-</div>
        </div>
    </div>
</div>
```

### CurrencySelectField - בחירת מטבע
**שימוש**: בחירת מטבע מתוך רשימה
**תכונות**:
- רשימת מטבעות קבועה
- ברירת מחדל מהעדפות משתמש

**דוגמה**:
```html
<select class="form-select" id="entityCurrency" required>
    <option value="">בחר מטבע</option>
    <option value="USD">דולר אמריקאי (USD)</option>
    <option value="EUR">אירו (EUR)</option>
    <option value="GBP">לירה שטרלינג (GBP)</option>
    <option value="ILS">שקל ישראלי (ILS)</option>
</select>
```

### TradePlanSelectField - בחירת תוכנית מסחר
**שימוש**: בחירת תוכנית מסחר מתוך רשימה
**תכונות**:
- טעינה מ-API
- סינון לפי סטטוס
- הצגת פרטים נוספים

**דוגמה**:
```html
<select class="form-select" id="entityTradePlan" required>
    <option value="">בחר תוכנית מסחר</option>
</select>
```

---

## 📁 7. שדות קבצים

### FileUploadField - העלאת קובץ
**שימוש**: העלאת קבצים (לוגו, מסמכים)
**תכונות**:
- `type="file"`
- `accept` - סוגי קבצים מותרים
- הצגת שם הקובץ

**דוגמה**:
```html
<input type="file" class="form-control" id="entityLogo" 
       accept=".jpg,.jpeg,.png,.gif" onchange="handleFileUpload(this)">
<div id="filePreview" class="mt-2 d-none">
    <img id="previewImage" src="" alt="תצוגה מקדימה" class="img-thumbnail">
</div>
```

**ולידציה**:
```javascript
{required: false, accept: ['.jpg', '.jpeg', '.png', '.gif'], maxSize: '5MB'}
```

---

## 🧮 8. שדות מחושבים

### CalculatedField - שדה מחושב
**שימוש**: שדות read-only עם חישובים
**תכונות**:
- `readonly`
- עדכון אוטומטי
- עיצוב מיוחד

**דוגמה**:
```html
<input type="text" class="form-control" id="calculatedTotal" 
       readonly value="0.00">
<div class="form-text">סכום מחושב: <span id="amountDisplay" class="fw-bold">$0.00</span></div>
```

**לוגיקה**:
```javascript
function updateCalculatedField() {
    const quantity = parseFloat(document.getElementById('quantity').value) || 0;
    const price = parseFloat(document.getElementById('price').value) || 0;
    const total = quantity * price;
    
    document.getElementById('calculatedTotal').value = total.toFixed(2);
    document.getElementById('amountDisplay').textContent = `$${total.toFixed(2)}`;
}
```

---

## ✅ 9. שדות בוליאניים

### CheckboxField - תיבת סימון
**שימוש**: בחירה בוליאנית
**תכונות**:
- `type="checkbox"`
- `checked` - מצב ברירת מחדל

**דוגמה**:
```html
<div class="form-check">
    <input type="checkbox" class="form-check-input" id="entityActive" checked>
    <label class="form-check-label" for="entityActive">
        ישות פעילה
    </label>
</div>
```

### RadioField - כפתורי רדיו
**שימוש**: בחירה יחידה מתוך מספר אפשרויות
**תכונות**:
- `type="radio"`
- `name` זהה לכל הכפתורים
- `value` שונה לכל כפתור

**דוגמה**:
```html
<div class="form-check">
    <input type="radio" class="form-check-input" name="entityType" id="type1" value="type1" checked>
    <label class="form-check-label" for="type1">סוג 1</label>
</div>
<div class="form-check">
    <input type="radio" class="form-check-input" name="entityType" id="type2" value="type2">
    <label class="form-check-label" for="type2">סוג 2</label>
</div>
```

---

## 🎨 10. דפוסי עיצוב

### פריסה ב-2 עמודות
**שימוש**: רוב המודלים
**תכונות**:
- `col-md-6` לכל שדה
- שדות קשורים באותה שורה

**דוגמה**:
```html
<div class="row">
    <div class="col-md-6">
        <div class="mb-3">
            <label for="field1" class="form-label">שדה 1</label>
            <input type="text" class="form-control" id="field1">
        </div>
    </div>
    <div class="col-md-6">
        <div class="mb-3">
            <label for="field2" class="form-label">שדה 2</label>
            <input type="text" class="form-control" id="field2">
        </div>
    </div>
</div>
```

### פריסה ב-3 עמודות
**שימוש**: מודלים מורכבים
**תכונות**:
- `col-md-4` לכל שדה
- שדות קשורים באותה שורה

**דוגמה**:
```html
<div class="row">
    <div class="col-md-4">
        <div class="mb-3">
            <label for="field1" class="form-label">שדה 1</label>
            <input type="text" class="form-control" id="field1">
        </div>
    </div>
    <div class="col-md-4">
        <div class="mb-3">
            <label for="field2" class="form-label">שדה 2</label>
            <input type="text" class="form-control" id="field2">
        </div>
    </div>
    <div class="col-md-4">
        <div class="mb-3">
            <label for="field3" class="form-label">שדה 3</label>
            <input type="text" class="form-control" id="field3">
        </div>
    </div>
</div>
```

### פריסה בעמודה אחת
**שימוש**: שדות ארוכים (textarea, rich text)
**תכונות**:
- `col-md-12` לשדה
- שדה תופס את כל הרוחב

**דוגמה**:
```html
<div class="row">
    <div class="col-md-12">
        <div class="mb-3">
            <label for="longField" class="form-label">שדה ארוך</label>
            <textarea class="form-control" id="longField" rows="4"></textarea>
        </div>
    </div>
</div>
```

### פריסה עם Input Groups
**שימוש**: שדות עם תוספות (אחוזים, מטבעות)
**תכונות**:
- `input-group` עם `input-group-text`
- תוספות משמאל או מימין

**דוגמה**:
```html
<div class="input-group">
    <input type="number" class="form-control" id="percentage" step="0.01" min="0" max="100">
    <span class="input-group-text">%</span>
</div>
```

---

## 🔧 11. רכיבי שדות נדרשים

### רשימת רכיבים לפתח:

1. **TextFieldComponent** - שדה טקסט בסיסי
2. **EmailFieldComponent** - שדה אימייל
3. **NumberFieldComponent** - שדה מספרי
4. **IntegerFieldComponent** - שדה מספר שלם
5. **PercentageFieldComponent** - שדה אחוז
6. **DateFieldComponent** - שדה תאריך
7. **DateTimeFieldComponent** - שדה תאריך ושעה
8. **DateRangeFieldComponent** - שדה טווח תאריכים
9. **TextareaFieldComponent** - שדה טקסט רב-שורות
10. **SelectFieldComponent** - רשימת בחירה
11. **MultiSelectFieldComponent** - בחירה מרובה
12. **AccountSelectComponent** - בחירת חשבון
13. **TickerSelectComponent** - בחירת טיקר
14. **CurrencySelectComponent** - בחירת מטבע
15. **TradePlanSelectComponent** - בחירת תוכנית מסחר
16. **FileUploadComponent** - העלאת קובץ
17. **CalculatedFieldComponent** - שדה מחושב
18. **CheckboxFieldComponent** - תיבת סימון
19. **RadioFieldComponent** - כפתורי רדיו

### מבנה כל רכיב:
```javascript
class FieldComponent {
    constructor(config) {
        this.config = config;
        this.element = null;
    }
    
    render() {
        // יצירת HTML
    }
    
    validate() {
        // ולידציה
    }
    
    getValue() {
        // קבלת ערך
    }
    
    setValue(value) {
        // הגדרת ערך
    }
    
    clear() {
        // ניקוי שדה
    }
    
    enable() {
        // הפעלת שדה
    }
    
    disable() {
        // השבתת שדה
    }
}
```

---

## 🎯 המלצות לארכיטקטורה

### עקרונות עיצוב:
1. **רכיבים נפרדים** - כל סוג שדה הוא רכיב נפרד
2. **אינטגרציה מלאה** - כל רכיב משתמש בכל המערכות הקיימות
3. **ולידציה מובנית** - כל רכיב כולל ולידציה
4. **עיצוב אחיד** - כל הרכיבים נראים זהה
5. **ביצועים טובים** - רכיבים קלים ומהירים

### דוגמת שימוש:
```javascript
// יצירת שדה טקסט
const textField = new TextFieldComponent({
    id: 'entityName',
    label: 'שם ישות',
    placeholder: 'הכנס שם',
    required: true,
    maxLength: 50,
    validation: {required: true, minLength: 3, maxLength: 50}
});

// הצגת השדה
const fieldHTML = textField.render();
document.getElementById('formContainer').innerHTML += fieldHTML;

// ולידציה
const isValid = textField.validate();

// קבלת ערך
const value = textField.getValue();
```

---

**המסמך מוכן לשימוש בתכנון רכיבי השדות החדשים.**
