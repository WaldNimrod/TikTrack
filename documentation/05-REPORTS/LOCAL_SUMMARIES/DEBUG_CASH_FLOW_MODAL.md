# קוד בדיקה - Cash Flow Modal

## פתח את הקונסול בהדפדפן

### קוד בדיקה 1: בדיקת saveCashFlow
העתק את הקוד הזה לקונסול:

```javascript
// בדוק אם הפונקציה קיימת
console.log('=== DEBUG: saveCashFlow ===');
console.log('window.saveCashFlow exists:', typeof window.saveCashFlow === 'function');
console.log('window.saveCashFlow:', window.saveCashFlow);

// בדוק אם יש מודל
const modal = document.getElementById('cashFlowModal');
console.log('Modal element:', modal);

// בדוק אם יש טופס
const form = document.getElementById('cashFlowModalForm');
console.log('Form element:', form);

// בדוק ModalManagerV2
console.log('ModalManagerV2 exists:', !!window.ModalManagerV2);
console.log('ModalManagerV2:', window.ModalManagerV2);
```

### קוד בדיקה 2: בדיקת click handler
העתק את הקוד הזה לקונסול:

```javascript
// מצא את כפתור השמירה
const saveButtons = document.querySelectorAll('button[type="submit"]');
console.log('Save buttons found:', saveButtons.length);
saveButtons.forEach((btn, index) => {
    console.log(`Button ${index}:`, btn);
    console.log(`  - onclick:`, btn.onclick);
    console.log(`  - data-onclick:`, btn.getAttribute('data-onclick'));
    console.log(`  - form:`, btn.form);
});

// מצא כפתורים עם text "שמור"
const allButtons = document.querySelectorAll('button');
allButtons.forEach(btn => {
    const text = btn.textContent.trim();
    if (text.includes('שמור') || text.includes('Save')) {
        console.log('Found save button:', btn);
        console.log('  - Text:', text);
        console.log('  - onclick:', btn.onclick);
        console.log('  - data-onclick:', btn.getAttribute('data-onclick'));
        console.log('  - id:', btn.id);
        console.log('  - class:', btn.className);
    }
});
```

### קוד בדיקה 3: הקלקה ידנית על saveCashFlow
העתק את הקוד הזה לקונסול:

```javascript
// נסה לקרוא ל-saveCashFlow ישירות
if (typeof window.saveCashFlow === 'function') {
    console.log('🟢 Calling saveCashFlow manually...');
    window.saveCashFlow();
} else {
    console.error('🔴 saveCashFlow is not a function!');
}
```

### קוד בדיקה 4: בדיקת event listeners
העתק את הקוד הזה לקונסול:

```javascript
// חפש את כפתור השמירה בתוך המודל
const modal = document.getElementById('cashFlowModal');
if (modal) {
    const saveBtn = modal.querySelector('button[type="submit"], button[id*="save"], button[class*="save"]');
    console.log('Save button in modal:', saveBtn);
    
    if (saveBtn) {
        // בדוק event listeners
        console.log('Button onclick:', saveBtn.onclick);
        console.log('Button form:', saveBtn.form);
        
        // נסה לקרוא ל-onsubmit של הטופס
        const form = saveBtn.form || saveBtn.closest('form');
        if (form) {
            console.log('Form onsubmit:', form.onsubmit);
        }
    }
}
```

## איך להריץ את הבדיקות

1. פתח את עמוד Cash Flows בדפדפן
2. לחץ F12 לפתיחת Developer Tools
3. עבור ל-Console
4. פתח את המודל "הוסף תזרים מזומנים"
5. העתק והדבק כל קוד בדיקה ולחץ Enter
6. שלח את התוצאות

## מה לחפש

### אם saveCashFlow לא קיים:
- הקובץ cash_flows.js לא נטען
- או הפונקציה לא מיוצאת ל-window

### אם הפונקציה קיימת אבל לא נקראת:
- כפתור השמירה לא מחובר
- ModalManagerV2 לא מטפל בלחיצה
- יש שגיאה שמונעת את הקריאה

### אם הפונקציה נקראת אבל יש שגיאות:
- בדוק את השגיאות בקונסול
- בדוק אם יש שם שדות שגויים
- בדוק אם API endpoint תקין
