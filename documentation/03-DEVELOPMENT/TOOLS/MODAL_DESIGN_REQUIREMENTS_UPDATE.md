# עדכון דרישות מערכת המודלים - TikTrack Modal System
## דרישות עיצוב ועיצוב מעודכנות

**תאריך עדכון**: 12 בינואר 2025  
**מטרה**: עדכון המסמכים עם הדרישות החדשות לעיצוב המודלים

---

## 🎨 דרישות עיצוב מעודכנות

### 1. רקע כותרת המודל
- **צבע**: צבע הישות של העמוד בריאנט בהיר
- **יישום**: `background: linear-gradient(135deg, var(--entity-color-light), var(--entity-color-dark))`
- **משתנה CSS**: `--entity-color-light` (רקע כותרת)

### 2. כפתור סגור
- **עיצוב**: רק איקון (ללא טקסט)
- **מאפיין**: `data-variant="icon-only"`
- **צבע**: צבע הישות בריאנט כהה
- **משתנה CSS**: `--entity-color-dark`

### 3. כותרת המודל
- **צבע**: צבע הישות בריאנט כהה
- **משתנה CSS**: `--entity-color-dark`
- **יישום**: `color: var(--entity-color-dark)`

### 4. כפתור שמור
- **צבע**: צבע הישות בריאנט כהה
- **משתנה CSS**: `--entity-color-dark`
- **יישום**: `color: var(--entity-color-dark)` ו-`border-color: var(--entity-color-dark)`

### 5. כפתור ביטול
- **צבע**: צבע אזהרה
- **משתנה CSS**: `--warning-color` (ברירת מחדל: `#fc5a06`)
- **יישום**: `color: var(--warning-color)` ו-`border-color: var(--warning-color)`

---

## 🔧 ברירות מחדל מעודכנות

### 1. מטבע
- **מקור**: העדפות המשתמש
- **משתנה**: `preferences.defaultCurrency`
- **יישום**: מילוי אוטומטי של שדה מטבע

### 2. תאריך
- **ברירת מחדל**: היום
- **יישום**: `new Date().toISOString().slice(0, 10)` (תאריך) או `slice(0, 16)` (תאריך+שעה)

### 3. חשבון מסחר
- **מקור**: העדפות המשתמש
- **משתנה**: `preferences.defaultTradingAccount`
- **יישום**: מילוי אוטומטי של שדה חשבון מסחר

---

## 📝 מבנה HTML מעודכן

```html
<div class="modal fade" id="{modalId}" tabindex="-1" 
     aria-labelledby="{modalId}Label" aria-hidden="true"
     data-bs-backdrop="true" data-bs-keyboard="true">
  <div class="modal-dialog modal-{size}">
    <div class="modal-content">
      <!-- Header -->
      <div class="modal-header modal-header-dynamic" 
           style="background: linear-gradient(135deg, var(--entity-color-light), var(--entity-color-dark))">
        <h5 class="modal-title" id="{modalId}Label" style="color: var(--entity-color-dark)">{title}</h5>
        <button data-button-type="CLOSE" data-variant="icon-only" 
                data-color="entity-dark" data-bs-dismiss="modal" 
                aria-label="סגור"></button>
      </div>
      
      <!-- Body -->
      <div class="modal-body">
        <form id="{formId}">
          {dynamic-fields}
        </form>
      </div>
      
      <!-- Footer -->
      <div class="modal-footer">
        <button data-button-type="CANCEL" data-color="warning" 
                data-bs-dismiss="modal" data-text="ביטול"></button>
        <button data-button-type="SAVE" data-color="entity-dark" 
                data-onclick="{saveFunction}" data-text="שמור"></button>
      </div>
    </div>
  </div>
</div>
```

---

## 🔧 פונקציות מעודכנות

### 1. applyUserColors - יישום צבעי משתמש

```javascript
applyUserColors(modalElement, entityType) {
    if (!entityType || !window.getEntityColor) return;
    
    const header = modalElement.querySelector('.modal-header');
    if (!header) return;
    
    // עדכון צבע כותרת - רקע בהיר
    const entityColorLight = window.getEntityColor(entityType);
    const entityColorDark = window.getEntityDarkColor(entityType);
    
    header.style.background = `linear-gradient(135deg, ${entityColorLight}, ${entityColorDark})`;
    
    // עדכון צבע כותרת הטקסט - כהה
    const title = header.querySelector('.modal-title');
    if (title) {
        title.style.color = entityColorDark;
    }
    
    // עדכון צבעי כפתורים
    const closeButton = modalElement.querySelector('[data-button-type="CLOSE"]');
    if (closeButton) {
        closeButton.style.color = entityColorDark;
        closeButton.style.borderColor = entityColorDark;
    }
    
    const saveButton = modalElement.querySelector('[data-button-type="SAVE"]');
    if (saveButton) {
        saveButton.style.color = entityColorDark;
        saveButton.style.borderColor = entityColorDark;
    }
    
    const cancelButton = modalElement.querySelector('[data-button-type="CANCEL"]');
    if (cancelButton) {
        // כפתור ביטול - צבע אזהרה
        cancelButton.style.color = 'var(--warning-color, #fc5a06)';
        cancelButton.style.borderColor = 'var(--warning-color, #fc5a06)';
    }
}
```

### 2. applyDefaultValues - יישום ברירות מחדל

```javascript
applyDefaultValues(form) {
    if (!window.PreferencesSystem) return;
    
    const preferences = window.PreferencesSystem.manager?.currentPreferences || {};
    
    // ברירת מחדל לחשבון המסחר
    const accountField = form.querySelector('[id*="Account"], [name*="account"]');
    if (accountField && preferences.defaultTradingAccount) {
        accountField.value = preferences.defaultTradingAccount;
    }
    
    // ברירת מחדל למטבע
    const currencyField = form.querySelector('[id*="Currency"], [name*="currency"]');
    if (currencyField && preferences.defaultCurrency) {
        currencyField.value = preferences.defaultCurrency;
    }
    
    // ברירת מחדל לתאריך - היום
    const dateField = form.querySelector('input[type="date"], input[type="datetime-local"]');
    if (dateField && !dateField.value) {
        const today = new Date();
        const dateValue = dateField.type === 'datetime-local' 
            ? today.toISOString().slice(0, 16) 
            : today.toISOString().slice(0, 10);
        dateField.value = dateValue;
    }
}
```

---

## 📋 דוגמת קונפיגורציה מעודכנת

```javascript
const cashFlowModalConfig = {
    id: 'cashFlowModal',
    entityType: 'cash_flow',
    title: {
        add: 'הוספת תזרים מזומנים',
        edit: 'עריכת תזרים מזומנים'
    },
    size: 'lg',
    headerType: 'dynamic', // צבעים דינמיים לפי ישות
    fields: [
        {
            type: 'account-select',
            id: 'cashFlowAccount',
            label: 'חשבון מסחר',
            required: true,
            defaultFromPreferences: true // ברירת מחדל מהעדפות
        },
        {
            type: 'select',
            id: 'cashFlowType',
            label: 'סוג',
            required: true,
            options: [
                { value: 'deposit', label: 'הפקדה' },
                { value: 'withdrawal', label: 'משיכה' }
            ]
        },
        {
            type: 'number',
            id: 'cashFlowAmount',
            label: 'סכום',
            required: true,
            min: 0.01,
            step: 0.01
        },
        {
            type: 'date',
            id: 'cashFlowDate',
            label: 'תאריך',
            required: true,
            defaultValue: 'today' // ברירת מחדל היום
        },
        {
            type: 'currency-select',
            id: 'cashFlowCurrency',
            label: 'מטבע',
            required: true,
            defaultFromPreferences: true // ברירת מחדל מהעדפות
        }
    ],
    validation: {
        cashFlowAmount: { required: true, min: 0.01 }
    },
    onSave: 'saveCashFlow'
};
```

---

## 🎯 המלצות ליישום

### עקרונות עיצוב:
1. **צבעים דינמיים** - כל המודלים יקבלו צבעים לפי הישות שלהם
2. **ברירות מחדל חכמות** - מטבע, חשבון מסחר ותאריך ימולאו אוטומטית
3. **כפתורים עקביים** - סגור ושמור בצבע הישות, ביטול בצבע אזהרה
4. **כפתור סגור מינימלי** - רק איקון ללא טקסט

### דרישות טכניות:
1. **משתני CSS** - שימוש ב-`--entity-color-light` ו-`--entity-color-dark`
2. **מערכת הכפתורים** - שימוש ב-`data-variant="icon-only"` ו-`data-color`
3. **העדפות משתמש** - שימוש ב-`PreferencesSystem` לברירות מחדל
4. **תאימות לאחור** - שמירה על כל הפונקציונליות הקיימת

---

**המסמך מעודכן עם כל הדרישות החדשות לעיצוב המודלים.**
