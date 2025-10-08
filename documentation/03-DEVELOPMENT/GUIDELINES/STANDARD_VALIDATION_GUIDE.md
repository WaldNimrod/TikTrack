# מדריך ולידציה סטנדרטית - TikTrack

## 📅 תאריך יצירה
8 באוקטובר 2025

## 🎯 מטרת המדריך
הגדרה ברורה של תהליך ולידציה סטנדרטי לכל טפסי ההוספה והעריכה במערכת.

---

## 🎨 התנהגות נדרשת

### **✅ הודעות שגיאה:**
- **הודעה פשוטה** - התראה רגילה (toast) ללא מודל מפורט
- **שימוש ב-`showSimpleErrorNotification`** - ⚠️ חובה! לא `showErrorNotification`
- **רשימת שדות חסרים** - "שדה חובה חסר: X" או "שדות חובה חסרים: X, Y, Z"
- **סימון שדות בעייתיים** - border אדום עם class `is-invalid`
- **משך הצגה:** 6 שניות (ברירת מחדל למערכת ההתראות)

### **⚠️ הבדל חשוב בין סוגי שגיאות:**

#### **📝 שגיאות ולידציה (שימוש ב-`showSimpleErrorNotification`):**
- משתמש לא מילא שדה חובה
- משתמש הזין ערך לא תקין (סכום 0, תאריך שגוי, פורמט שגוי)
- משתמש לא בחר אופציה נדרשת
- **HTTP 400** (Bad Request) - שגיאת ולידציה מהשרת
- שגיאה עם המילים: "validation", "Invalid", "required"
- **תצוגה:** התראה פשוטה (toast) אדומה ✅

#### **🚨 שגיאות מערכת (שימוש ב-`showErrorNotification`):**
- **HTTP 500** (Internal Server Error)
- **HTTP 404** (Not Found)
- **HTTP 403** (Forbidden)
- אלמנט לא נמצא בקוד (JavaScript error)
- שגיאת JavaScript (exception)
- שגיאת חיבור לשרת (Network error)
- **תצוגה:** מודל מפורט עם stack trace ✅

#### **🔍 איך לזהות:**
```javascript
// בדיקה אם זו שגיאת ולידציה
let isValidationError = false;

// לפי status code
if (error.status === 400) isValidationError = true;

// לפי תוכן ההודעה
if (error.message.includes('validation') || 
    error.message.includes('Invalid') || 
    error.message.includes('required')) {
  isValidationError = true;
}

// הצגת ההודעה המתאימה
if (isValidationError) {
  window.showSimpleErrorNotification('שגיאה', error.message);
} else {
  window.showErrorNotification('שגיאת מערכת', error.message);
}
```

### **✅ סימון שדות:**
- **שדה בעייתי:** `is-invalid` class + border אדום + הודעה מתחת לשדה
- **שדה תקין:** `is-valid` class + border ירוק
- **ניקוי סימון:** בפתיחת מודל או ב-reset

---

## 🎨 ברירות מחדל במצב הוספה

### **⚡ עקרונות כלליים:**

#### **1. תאריכי פעולות - תמיד היום**
```javascript
// הגדרת תאריך נוכחי
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const hh = String(today.getHours()).padStart(2, '0');
const min = String(today.getMinutes()).padStart(2, '0');
const todayStr = `${yyyy}-${mm}-${dd}T${hh}:${min}`;

document.getElementById('cashFlowDate').value = todayStr;
```

#### **2. שימוש בהעדפות משתמש**
```javascript
// קבלת העדפת מטבע ברירת מחדל
const defaultCurrency = await window.getPreference('default_currency');
if (defaultCurrency) {
  document.getElementById('cashFlowCurrencyId').value = defaultCurrency;
}

// קבלת חשבון ברירת מחדל
const defaultAccount = await window.getPreference('default_trading_account');
if (defaultAccount) {
  document.getElementById('cashFlowAccountId').value = defaultAccount;
}
```

#### **3. ברירות מחדל לוגיות לפי סוג השדה**
```javascript
// סוג פעולה - ברירת מחדל הגיונית
document.getElementById('cashFlowType').value = 'deposit'; // הפקדה

// מקור - ברירת מחדל
document.getElementById('cashFlowSource').value = 'manual'; // ידני

// שער דולר - 1.0 כברירת מחדל
document.getElementById('cashFlowUsdRate').value = '1.000000';
```

### **📋 טבלת ברירות מחדל לפי ישות:**

| ישות | שדה | ברירת מחדל | מקור |
|------|-----|-----------|------|
| **Cash Flows** | תאריך | היום | קוד |
| | סוג | deposit | קוד |
| | מטבע | מהעדפות משתמש | העדפות |
| | חשבון | מהעדפות משתמש | העדפות |
| | מקור | manual | קוד |
| | שער USD | 1.000000 | קוד |
| **Trades** | תאריך פתיחה | היום | קוד |
| | סטטוס | Open | קוד |
| | חשבון | מהעדפות משתמש | העדפות |
| **Executions** | תאריך | היום | קוד |
| | מקור | manual | קוד |
| **Trade Plans** | תאריך יצירה | היום | קוד |
| | סטטוס | Active | קוד |
| | חשבון | מהעדפות משתמש | העדפות |
| **Alerts** | תאריך יצירה | היום | קוד |
| | סטטוס | Active | קוד |
| **Notes** | תאריך יצירה | היום | קוד |

### **⚠️ חשוב:**
- **תאריכים:** 
  - ✅ ברירת מחדל: תמיד היום (לא מהעדפות)
  - ✅ **פורמט לשרת:** `YYYY-MM-DD` (רק תאריך, ללא שעה!)
  - ✅ **פורמט ב-HTML:** `<input type="datetime-local">` מאפשר בחירת שעה
  - ✅ **המרה לפני שליחה:** `dateValue.split('T')[0]` להסרת השעה
- **סטטוס:** ברירת מחדל הגיונית (Open, Active)
- **חשבון/מטבע:** מהעדפות משתמש אם קיים
- **אם העדפה לא קיימת:** בחירה ראשונה ברשימה או ערך קבוע

---

## 📦 טעינה אוטומטית במערכת המאוחדת

### **✅ מערכת הולידציה נטענת אוטומטית:**

**מיקום:** `trading-ui/scripts/modules/ui-basic.js`

**טעינה:**
- ✅ נטענת אוטומטית עם המודול `ui-basic`
- ✅ זמינה בכל עמוד שטוען את המודולים המאוחדים
- ✅ אין צורך בטעינה נפרדת

**במערכת המאוחדת:**
```html
<!-- המודולים נטענים אוטומטית -->
<script src="scripts/modules/core-systems.js?v=20251006"></script>
<script src="scripts/modules/ui-basic.js?v=20251006"></script> <!-- ולידציה כאן! -->
<script src="scripts/modules/data-basic.js?v=20251006"></script>
```

### **⚠️ אין צורך להוסיף:**
```html
<!-- ❌ לא נדרש יותר -->
<script src="scripts/validation-utils.js"></script>
```

---

## 🔧 שימוש בפונקציה הכללית

### **1. הפונקציה הסטנדרטית: `window.validateEntityForm()`**

```javascript
/**
 * ולידציה סטנדרטית לטופס
 * @param {string} formId - מזהה הטופס
 * @param {Array} requiredFields - מערך של שדות חובה
 * @returns {boolean} true אם תקין, false אם לא
 */
window.validateEntityForm(formId, requiredFields)
```

### **2. מבנה requiredFields:**

```javascript
[
  { 
    id: 'fieldElementId',        // ID של האלמנט ב-HTML
    name: 'שם השדה בעברית',      // שם לתצוגה בהודעת שגיאה
    validation: (value, field) => {  // אופציונלי - ולידציה מותאמת
      // return true אם תקין
      // return 'הודעת שגיאה' אם לא תקין
    }
  }
]
```

---

## 📖 דוגמה מלאה - Cash Flows (תזרימי מזומנים)

### **🎯 תהליך מלא מתחילת הטופס ועד השמירה:**

#### **שלב 1: HTML - מבנה הטופס**
```html
<form id="addCashFlowForm">
    <!-- שדות חובה מסומנים ב-required -->
    <select class="form-select" id="cashFlowAccountId" required>...</select>
    <select class="form-select" id="cashFlowType" required>...</select>
    <input type="number" id="cashFlowAmount" required>
    <input type="datetime-local" id="cashFlowDate" required>
</form>

<!-- כפתור שמירה -->
<button onclick="saveCashFlow()">הוסף תזרים</button>
```

#### **שלב 2: JavaScript - פונקציית ולידציה**
```javascript
/**
 * ולידציה של טופס תזרים מזומנים
 */
function validateCashFlowForm() {
  return window.validateEntityForm('addCashFlowForm', [
    { id: 'cashFlowAccountId', name: 'חשבון מסחר' },
    { id: 'cashFlowType', name: 'סוג תזרים' },
    { 
      id: 'cashFlowAmount', 
      name: 'סכום',
      validation: (value) => {
        const amount = parseFloat(value);
        if (isNaN(amount)) return 'יש להזין סכום תקין';
        if (amount === 0) return 'סכום לא יכול להיות 0';
        return true;
      }
    },
    { id: 'cashFlowDate', name: 'תאריך' }
  ]);
}
```

#### **שלב 3: JavaScript - פונקציית שמירה**
```javascript
async function saveCashFlow() {
  try {
    // 1. איסוף נתונים מהטופס
    const accountIdElement = document.getElementById('cashFlowAccountId');
    const typeElement = document.getElementById('cashFlowType');
    const amountElement = document.getElementById('cashFlowAmount');
    const dateElement = document.getElementById('cashFlowDate');
    
    // 2. בדיקת קיום אלמנטים (למניעת קריסה)
    if (!accountIdElement || !typeElement || !amountElement || !dateElement) {
      if (typeof window.showSimpleErrorNotification === 'function') {
        window.showSimpleErrorNotification('שגיאה', 'שדות חובה חסרים בטופס');
      }
      return;
    }
    
    // 3. בניית אובייקט formData
    // ⚠️ חשוב: המרת תאריך לפורמט YYYY-MM-DD (השרת דורש רק תאריך)
    const dateValue = dateElement.value;
    const dateOnly = dateValue ? dateValue.split('T')[0] : null;
    
    const formData = {
      trading_account_id: parseInt(accountIdElement.value),
      type: typeElement.value,
      amount: parseFloat(amountElement.value),
      date: dateOnly, // YYYY-MM-DD בלבד
      currency_id: currencyIdElement ? parseInt(currencyIdElement.value) : 1,
      usd_rate: usdRateElement ? parseFloat(usdRateElement.value) : 1.000000,
      description: descriptionElement ? descriptionElement.value : '',
      source: sourceElement ? sourceElement.value : 'manual'
    };

    // 4. ולידציה של הטופס
    if (!validateCashFlowForm()) {
      return; // עצירה אם הולידציה נכשלה
    }

    // 5. שליחה לשרת
    const response = await fetch('/api/cash_flows/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // 6. הצגת הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('הצלחה', 'תזרים המזומנים נשמר בהצלחה');
    }

    // 7. סגירת המודל
    const modal = bootstrap.Modal.getInstance(document.getElementById('addCashFlowModal'));
    if (modal) {
      modal.hide();
    }

    // 8. רענון הטבלה
    await loadCashFlows();

  } catch (error) {
    console.error('Error saving cash flow:', error);
    
    // שגיאת JavaScript או Network - זו שגיאת מערכת אמיתית
    // רק כאן משתמשים ב-showErrorNotification עם מודל מפורט
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בשמירת תזרים מזומנים', error.message);
    }
  }
}

// טיפול בשגיאות ולידציה מהשרת
async function handleServerValidationErrors(result) {
  if (result.error && result.error.message) {
    const serverMessage = result.error.message;

    // אם זו שגיאת ולידציה מהשרת
    if (serverMessage.includes('validation failed')) {
      const validationErrors = serverMessage.replace('Cash flow validation failed: ', '').split('; ');

      // סימון כל השדות הבעייתיים
      validationErrors.forEach(error => {
        let fieldName = '';
        let fieldError = error;

        // זיהוי השדה הבעייתי
        if (error.includes('Field \'type\'')) {
          fieldName = 'cashFlowType';
          fieldError = 'סוג תזרים לא תקין';
        } else if (error.includes('Field \'amount\'')) {
          fieldName = 'cashFlowAmount';
          fieldError = 'סכום חייב להיות שונה מ-0';
        }
        // ... (שדות נוספים)

        // סימון השדה
        if (fieldName && typeof window.showFieldError === 'function') {
          window.showFieldError(fieldName, fieldError);
        }
      });

      // הצגת התראה פשוטה אחת
      if (typeof window.showSimpleErrorNotification === 'function') {
        window.showSimpleErrorNotification('שגיאת ולידציה', 'נא לתקן את השדות המסומנים');
      }
    } else {
      // שגיאה כללית מהשרת (לא ולידציה)
      if (typeof window.showSimpleErrorNotification === 'function') {
        window.showSimpleErrorNotification('שגיאה', serverMessage);
      }
    }
  }
}
}
```

#### **שלב 4: JavaScript - פונקציית פתיחת מודל עם ברירות מחדל**
```javascript
function showAddCashFlowModal() {
  // 1. ניקוי הטופס
  const form = document.getElementById('addCashFlowForm');
  if (form) {
    form.reset();
  }

  // 2. ניקוי ולידציה
  if (window.clearValidation) {
    window.clearValidation('addCashFlowForm');
  }

  // 3. הגדרת ברירות מחדל - תאריך תמיד היום
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const hh = String(today.getHours()).padStart(2, '0');
  const min = String(today.getMinutes()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  
  const dateInput = document.getElementById('cashFlowDate');
  if (dateInput) {
    dateInput.value = todayStr;
  }

  // 4. ברירות מחדל לוגיות
  const typeSelect = document.getElementById('cashFlowType');
  if (typeSelect) {
    typeSelect.value = 'deposit'; // הפקדה כברירת מחדל
  }

  // 5. טעינת נתונים למודל (יטען גם ברירות מחדל מהעדפות)
  loadAccountsForCashFlow();
  loadCurrenciesForCashFlow();

  // 6. הצגת המודל
  const modalElement = document.getElementById('addCashFlowModal');
  if (modalElement) {
    const bootstrapModal = new bootstrap.Modal(modalElement);
    bootstrapModal.show();
  }
}
```

#### **שלב 5: JavaScript - טעינת נתונים עם ברירות מחדל מהעדפות**
```javascript
async function loadAccountsForCashFlow() {
  try {
    const response = await fetch('/api/trading-accounts/');
    if (response.ok) {
      const result = await response.json();
      const select = document.getElementById('cashFlowAccountId');
      
      if (select) {
        select.innerHTML = '<option value="">בחר חשבון...</option>';
        
        // סינון חשבונות פעילים בלבד
        const activeAccounts = result.data.filter(account => account.status === 'open');
        
        // קבלת חשבון ברירת מחדל מהעדפות
        const defaultAccount = await window.getPreference('default_trading_account');
        
        activeAccounts.forEach((account, index) => {
          const option = document.createElement('option');
          option.value = account.id;
          option.textContent = account.name;
          
          // הגדרת ברירת מחדל:
          // 1. אם יש העדפה מוגדרת - השתמש בה
          // 2. אם אין העדפה - החשבון הראשון ברשימה
          if (defaultAccount && account.id === parseInt(defaultAccount)) {
            option.selected = true;
          } else if (!defaultAccount && index === 0) {
            option.selected = true;
          }
          
          select.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error('Error loading accounts:', error);
  }
}

async function loadCurrenciesForCashFlow() {
  try {
    const currencies = await loadCurrenciesFromServer();
    const select = document.getElementById('cashFlowCurrencyId');
    
    if (select) {
      select.innerHTML = '<option value="">בחר מטבע...</option>';
      
      // קבלת מטבע ברירת מחדל מהעדפות
      const defaultCurrency = await window.getPreference('default_currency');
      
      currencies.forEach((currency, index) => {
        const option = document.createElement('option');
        option.value = currency.id;
        option.textContent = `${currency.symbol} - ${currency.name}`;
        
        // הגדרת ברירת מחדל:
        // 1. אם יש העדפה מוגדרת - השתמש בה
        // 2. אם אין העדפה - USD (id=1) או המטבע הראשון
        if (defaultCurrency && currency.id === parseInt(defaultCurrency)) {
          option.selected = true;
        } else if (!defaultCurrency && (currency.id === 1 || index === 0)) {
          option.selected = true;
        }
        
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading currencies:', error);
  }
}
```

---

## 📖 דוגמאות נוספות לישויות אחרות

### **2. Trades (טריידים)**

```javascript
function validateTradeForm() {
  return window.validateEntityForm('addTradeForm', [
    { id: 'addTicker', name: 'טיקר' },
    { id: 'addAccount', name: 'חשבון מסחר' },
    { id: 'addType', name: 'סוג השקעה' },
    { id: 'addSide', name: 'צד' },
    { 
      id: 'addQuantity', 
      name: 'כמות',
      validation: (value) => {
        const qty = parseInt(value);
        if (isNaN(qty)) return 'יש להזין כמות תקינה';
        if (qty <= 0) return 'כמות חייבת להיות חיובית';
        return true;
      }
    }
  ]);
}
```

### **3. Trading Accounts (חשבונות מסחר)**

```javascript
function validateTradingAccountForm() {
  return window.validateEntityForm('addAccountForm', [
    { id: 'accountName', name: 'שם חשבון' },
    { id: 'accountStatus', name: 'סטטוס' },
    { id: 'accountCurrency', name: 'מטבע' },
    { 
      id: 'accountBalance', 
      name: 'יתרה',
      validation: (value) => {
        const balance = parseFloat(value);
        if (isNaN(balance)) return 'יש להזין יתרה תקינה';
        return true;
      }
    }
  ]);
}
```

### **4. Alerts (התראות)**

```javascript
function validateAlertForm() {
  return window.validateEntityForm('addAlertForm', [
    { id: 'alertTicker', name: 'טיקר' },
    { id: 'conditionAttribute', name: 'תנאי התראה' },
    { id: 'alertTradingAccount', name: 'חשבון מסחר' }
  ]);
}
```

### **5. Executions (עסקאות)**

```javascript
function validateExecutionForm() {
  return window.validateEntityForm('addExecutionForm', [
    { id: 'executionTicker', name: 'טיקר' },
    { id: 'executionType', name: 'סוג עסקה' },
    { id: 'executionAccount', name: 'טרייד' },
    { 
      id: 'executionQuantity', 
      name: 'כמות',
      validation: (value) => {
        const qty = parseInt(value);
        if (isNaN(qty)) return 'יש להזין כמות תקינה';
        if (qty <= 0) return 'כמות חייבת להיות חיובית';
        return true;
      }
    },
    { 
      id: 'executionPrice', 
      name: 'מחיר',
      validation: (value) => {
        const price = parseFloat(value);
        if (isNaN(price)) return 'יש להזין מחיר תקין';
        if (price <= 0) return 'מחיר חייב להיות חיובי';
        return true;
      }
    },
    { id: 'executionDate', name: 'תאריך' }
  ]);
}
```

### **6. Notes (הערות)**

```javascript
function validateNoteForm() {
  return window.validateEntityForm('addNoteForm', [
    { id: 'noteRelationType', name: 'סוג קשר' },
    { id: 'noteRelationId', name: 'פריט מקושר' },
    { id: 'noteContent', name: 'תוכן ההערה' }
  ]);
}
```

### **7. Tickers (טיקרים)**

```javascript
function validateTickerForm() {
  return window.validateEntityForm('addTickerForm', [
    { 
      id: 'addTickerSymbol', 
      name: 'סימול',
      validation: (value) => {
        if (!/^[A-Z0-9.]+$/.test(value)) return 'סימול יכול להכיל רק אותיות גדולות, מספרים ונקודות';
        if (value.length > 10) return 'סימול לא יכול להיות יותר מ-10 תווים';
        return true;
      }
    },
    { id: 'addTickerName', name: 'שם' },
    { id: 'addTickerType', name: 'סוג' },
    { id: 'addTickerCurrency', name: 'מטבע' }
  ]);
}
```

### **8. Trade Plans (תכנוני טרייד)**

```javascript
function validateTradePlanForm() {
  return window.validateEntityForm('addTradePlanForm', [
    { id: 'addTradePlanTickerId', name: 'טיקר' },
    { id: 'addTradePlanInvestmentType', name: 'סוג השקעה' },
    { id: 'addTradePlanSide', name: 'צד' },
    { id: 'addTradePlanStatus', name: 'סטטוס' },
    { 
      id: 'addTradePlanPlannedAmount', 
      name: 'סכום מתוכנן',
      validation: (value) => {
        const amount = parseFloat(value);
        if (isNaN(amount)) return 'יש להזין סכום תקין';
        if (amount <= 0) return 'סכום חייב להיות חיובי';
        return true;
      }
    }
  ]);
}
```

---

## 🔄 תהליך עבודה סטנדרטי

### **שלב 1: הגדרת פונקציית ולידציה**
```javascript
// בקובץ [entity].js
function validate[Entity]Form() {
  return window.validateEntityForm('[formId]', [
    // רשימת שדות חובה...
  ]);
}
```

### **שלב 2: שימוש בולידציה בפונקציית שמירה**
```javascript
async function save[Entity]() {
  try {
    // איסוף נתונים...
    
    // ולידציה
    if (!validate[Entity]Form()) {
      return; // עצירה אם הולידציה נכשלה
    }
    
    // שליחה לשרת...
    
  } catch (error) {
    console.error('Error saving [entity]:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בשמירת [entity]', error.message);
    }
  }
}
```

### **שלב 3: ניקוי ולידציה בפתיחת מודל**
```javascript
function showAdd[Entity]Modal() {
  // ניקוי הטופס
  const form = document.getElementById('add[Entity]Form');
  if (form) {
    form.reset();
  }

  // ניקוי ולידציה
  if (window.clearValidation) {
    window.clearValidation('add[Entity]Form');
  }
  
  // הגדרת ברירות מחדל...
  
  // טעינת נתונים...
  
  // הצגת המודל...
}
```

---

## 📋 רשימת תיקונים נדרשת

### ✅ **תוקן:**
1. **cash_flows.js** - משתמש בפונקציה הכללית `validateEntityForm`

### 🔄 **נדרש תיקון:**
2. **trades.js** - להוסיף ולידציה סטנדרטית
3. **trading_accounts.js** - להוסיף ולידציה סטנדרטית
4. **alerts.js** - להוסיף ולידציה סטנדרטית
5. **executions.js** - לעדכן לולידציה סטנדרטית
6. **notes.js** - להוסיף ולידציה סטנדרטית
7. **tickers.js** - לעדכן לולידציה סטנדרטית
8. **trade_plans.js** - לעדכן לולידציה סטנדרטית

---

## 🎯 יתרונות הגישה הסטנדרטית

### **1. עקביות**
- כל הטפסים מתנהגים אותו דבר
- הודעות שגיאה אחידות
- סימון שדות אחיד

### **2. תחזוקה**
- תיקון באג אחד מתקן את כל הטפסים
- הוספת תכונה חדשה זמינה מיד לכולם
- קוד פשוט יותר לתחזוקה

### **3. חווית משתמש**
- הודעות ברורות ועקביות
- סימון ויזואלי אחיד
- תגובה מהירה לשגיאות

---

## 📝 הערות חשובות

### **⚠️ חובה להשתמש:**
- `window.validateEntityForm()` - לולידציה
- `window.showFieldError()` - לסימון שדה בעייתי
- **`window.showSimpleErrorNotification()`** - להודעת שגיאה פשוטה ✅
- `window.clearValidation()` - לניקוי ולידציה

### **❌ אסור להשתמש:**
- `window.showErrorNotification()` - מציג מודל קריטי מפורט ❌
- ולידציה מותאמת אישית שלא דרך המערכת הכללית
- `alert()` להודעות שגיאה
- סימון שדות ידני ללא המערכת הכללית
- הודעות שגיאה ארוכות או מודלים מפורטים

---

## 🚀 סיכום

### **כל טופס במערכת צריך:**

#### **📁 בקובץ HTML:**
1. ✅ טעינת `validation-utils.js` לפני סקריפט העמוד
2. ✅ שדות חובה מסומנים ב-`required`
3. ✅ ID אלמנטים ברורים ועקביים

#### **📝 בקובץ JavaScript:**
1. ✅ פונקציית `validate[Entity]Form()` שמשתמשת ב-`validateEntityForm()`
2. ✅ קריאה לולידציה לפני שליחה לשרת
3. ✅ ניקוי ולידציה בפתיחת מודל (`clearValidation`)
4. ✅ הגדרת ברירות מחדל (תאריך, סוג, וכו')
5. ✅ טעינת נתונים למודל (dropdowns)
6. ✅ שימוש ב-`showSimpleErrorNotification` לשגיאות ולידציה
7. ✅ שימוש ב-`showErrorNotification` לשגיאות מערכת בלבד

### **🎯 תוצאה צפויה:**

#### **כאשר ולידציה נכשלת:**
- ✅ התראה אדומה פשוטה (toast) בפינה השמאלית העליונה
- ✅ הודעה קצרה: "שדות חובה חסרים: X, Y, Z"
- ✅ שדות בעייתיים מסומנים באדום
- ✅ הטופס נשאר פתוח לתיקון
- ✅ משך הצגה: 6 שניות

#### **כאשר שגיאת מערכת:**
- ✅ מודל מפורט עם כל הפרטים (stack trace, browser info, וכו')
- ✅ אפשרות להעתיק דוח מפורט
- ✅ מיועד למפתחים ולמשתמשים טכניים

### **📊 יתרונות:**
- ✅ חווית משתמש עקבית בכל המערכת
- ✅ קוד נקי וקל לתחזוקה
- ✅ תמיכה מלאה במערכות כלליות
- ✅ הפרדה ברורה בין שגיאות משתמש לשגיאות מערכת

---

## ✅ Checklist לבדיקת תקינות ולידציה

### **📋 בדיקות HTML:**
- [ ] המודולים המאוחדים נטענים (core-systems, ui-basic, data-basic)
- [ ] ⚠️ **אין** טעינה של `validation-utils.js` כקובץ נפרד (נכלל ב-ui-basic)
- [ ] כל השדות החובה מסומנים ב-`required`
- [ ] כל השדות יש להם `id` ייחודי וברור
- [ ] הכפתור קורא לפונקציית השמירה הנכונה

### **📋 בדיקות JavaScript:**
- [ ] קיימת פונקציית `validate[Entity]Form()`
- [ ] הפונקציה משתמשת ב-`window.validateEntityForm()`
- [ ] כל השדות החובה מוגדרים ברשימת requiredFields
- [ ] שדות עם ולידציה מיוחדת (כמו סכום ≠ 0) כוללים `validation` callback
- [ ] פונקציית השמירה קוראת ל-`validate[Entity]Form()` לפני שליחה לשרת
- [ ] שגיאות ולידציה משתמשות ב-`showSimpleErrorNotification`
- [ ] שגיאות מערכת משתמשות ב-`showErrorNotification`
- [ ] פונקציית פתיחת מודל קוראת ל-`clearValidation()`
- [ ] ברירות מחדל מוגדרות:
  - [ ] תאריך - תמיד היום
  - [ ] סוג/סטטוס - ערך לוגי (deposit, Open, Active)
  - [ ] חשבון - מהעדפות או ראשון ברשימה
  - [ ] מטבע - מהעדפות או USD

### **📋 בדיקות פונקציונליות:**
- [ ] ניסיון לשמור טופס ריק מציג התראה פשוטה (לא מודל)
- [ ] שדות ריקים מסומנים באדום
- [ ] הודעה מציינת בדיוק אילו שדות חסרים
- [ ] ניתן לתקן ולשמור שוב ללא רענון
- [ ] אחרי תיקון ושמירה מוצלחת - שדות מנוקים והמודל נסגר

### **📋 בדיקות חווית משתמש:**
- [ ] הודעת השגיאה קצרה וברורה
- [ ] אין מודל מפורט לשגיאות ולידציה רגילות
- [ ] שדות מסומנים מיד בעת הולידציה
- [ ] ניתן לראות בבירור איזה שדה בעייתי
- [ ] התראה נעלמת אחרי 6 שניות

