// ===== קובץ JavaScript לדף תזרימי מזומנים =====
/*
 * Cash Flows.js - Cash Flows Page Management
 * ==========================================
 *
 * This file contains all cash flows management functionality for the TikTrack application.
 * It handles cash flows CRUD operations, table updates, and user interactions.
 *
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (global utilities and sorting functions)
 * - translation-utils.js (translation functions)
 *
 * Table Mapping:
 * - Uses 'cash_flows' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 *
 * File: trading-ui/scripts/cash_flows.js
 * Version: 2.2
 * Last Updated: August 23, 2025
 */

// משתנים גלובליים
if (!window.cashFlowsData) {
  window.cashFlowsData = [];
}
let cashFlowsData = window.cashFlowsData;

// השתמש בפונקציה הכללית מ-translation-utils.js
// הפונקציה colorAmount זמינה גלובלית מ-translation-utils.js

// פונקציות בסיסיות - הוסרו פונקציות לא בשימוש

// פונקציות לפתיחה/סגירה של סקשנים - משתמשות בפונקציות הגלובליות
// הפונקציות הבאות זמינות גלובלית:
// - window.toggleTopSection()
// - window.toggleSection('cash_flows')
// - window.restoreSectionStates()

/**
 * פונקציה לפתיחה/סגירה של סקשן עליון (התראות וסיכום)
 */

/**
 * פונקציה לפתיחה/סגירה של סקשן תזרימי מזומנים
 */
function toggleCashFlowsSection() {
  // toggleCashFlowsSection נקראה

  const cashFlowsSection = document.querySelector('.cash-flows-section');
  if (!cashFlowsSection) {
    handleElementNotFound('toggleCashFlowsSection', 'סקשן תזרימי מזומנים לא נמצא');
    return;
  }

  const sectionBody = cashFlowsSection.querySelector('.section-body');
  if (!sectionBody) {
    handleElementNotFound('toggleCashFlowsSection', 'גוף הסקשן לא נמצא');
    return;
  }

  const toggleBtn = cashFlowsSection.querySelector('button[onclick="toggleCashFlowsSection()"]');
  if (!toggleBtn) {
    handleElementNotFound('toggleCashFlowsSection', 'כפתור הפתיחה/סגירה לא נמצא');
    return;
  }

  const isVisible = sectionBody.style.display !== 'none';

  if (isVisible) {
    // סגירת הסקשן
    sectionBody.style.display = 'none';
    toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> הצג תזרימי מזומנים';
    toggleBtn.title = 'הצג תזרימי מזומנים';
    // סקשן תזרימי מזומנים נסגר
  } else {
    // פתיחת הסקשן
    sectionBody.style.display = 'block';
    toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> הסתר תזרימי מזומנים';
    toggleBtn.title = 'הסתר תזרימי מזומנים';
    // סקשן תזרימי מזומנים נפתח
  }

  // שמירת המצב
  localStorage.setItem('cashFlowsSectionState', isVisible ? 'closed' : 'open');
}

// פונקציות לשחזור מצב הסגירה
function restoreCashFlowsSectionState() {
  // restoreCashFlowsSectionState נקראה

  const savedState = localStorage.getItem('cashFlowsSectionState');
  if (!savedState) {
    // אין מצב שמור לסקשן תזרימי מזומנים
    return;
  }

  const cashFlowsSection = document.querySelector('.cash-flows-section');
  if (!cashFlowsSection) {
    handleElementNotFound('restoreCashFlowsSectionState', 'סקשן תזרימי מזומנים לא נמצא');
    return;
  }

  const sectionBody = cashFlowsSection.querySelector('.section-body');
  if (!sectionBody) {
    handleElementNotFound('restoreCashFlowsSectionState', 'גוף הסקשן לא נמצא');
    return;
  }

  const toggleBtn = cashFlowsSection.querySelector('button[onclick="toggleCashFlowsSection()"]');
  if (!toggleBtn) {
    handleElementNotFound('restoreCashFlowsSectionState', 'כפתור הפתיחה/סגירה לא נמצא');
    return;
  }

  if (savedState === 'closed') {
    // שחזור מצב סגור
    sectionBody.style.display = 'none';
    toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> הצג תזרימי מזומנים';
    toggleBtn.title = 'הצג תזרימי מזומנים';
    // שחזור מצב סגור לסקשן תזרימי מזומנים
  } else {
    // שחזור מצב פתוח
    sectionBody.style.display = 'block';
    toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> הסתר תזרימי מזומנים';
    toggleBtn.title = 'הסתר תזרימי מזומנים';
    // שחזור מצב פתוח לסקשן תזרימי מזומנים
  }
}

// פונקציות נוספות
// resetAllFiltersAndReloadData() - לא בשימוש, הוסרה


// פונקציות אלו הוסרו - תזרימי מזומנים לא צריכים בדיקת מקושרים
// הפונקציה showDeleteCashFlowWarning משתמשת ישירות ב-window.showDeleteWarning

// ========================================
// פונקציות מודלים
// ========================================

// פונקציית מחיקה - הוסרה כי לא בשימוש (הוחלפה ב-window.showDeleteWarning)

// ========================================
// פונקציות API
// ========================================

/**
 * טעינת תזרימי מזומנים מהשרת
 */
async function loadCashFlows() {
  try {

    const response = await fetch('http://localhost:8080/api/v1/cash_flows/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'success') {
      cashFlowsData = result.data;
      renderCashFlowsTable();
      updatePageSummaryStats();
    } else {
      handleApiError('שגיאה בטעינת תזרימי מזומנים', result.error);

      // הצגת הודעת שגיאה
      if (window.showInfoNotification) {
        window.showInfoNotification('מידע על הטעינה', 'שגיאה בטעינת תזרימי מזומנים');
      }
    }
  } catch (error) {
    handleDataLoadError(error, 'טעינת תזרימי מזומנים');

    // הצגת הודעת שגיאה
    if (window.showInfoNotification) {
      window.showInfoNotification('מידע על הטעינה', 'שגיאה בטעינת תזרימי מזומנים');
    }
  }
}

/**
 * וולידציה של טופס תזרים מזומנים
 * @param {Object} formData - נתוני הטופס
 * @returns {boolean} true אם הטופס תקין, false אחרת
 */
function validateCashFlowForm(formData) {
  let isValid = true;

  // ניקוי הודעות שגיאה קודמות
  clearValidationErrors();

  // וולידציה של חשבון
  if (!formData.account_id || isNaN(formData.account_id)) {
    if (window.showValidationWarning) {
      window.showValidationWarning('cashFlowAccountId', 'יש לבחור חשבון');
    }
    isValid = false;
  }

  // וולידציה של סוג
  if (!formData.type) {
    if (window.showValidationWarning) {
      window.showValidationWarning('cashFlowType', 'יש לבחור סוג תזרים');
    }
    isValid = false;
  }

  // וולידציה של סכום
  if (!formData.amount || isNaN(formData.amount)) {
    if (window.showValidationWarning) {
      window.showValidationWarning('cashFlowAmount', 'יש להזין סכום תקין');
    }
    isValid = false;
  } else if (formData.amount === 0) {
    if (window.showValidationWarning) {
      window.showValidationWarning('cashFlowAmount', 'סכום לא יכול להיות 0');
    }
    isValid = false;
  } else if (Math.abs(formData.amount) > 10000000) {
    if (window.showValidationWarning) {
      window.showValidationWarning('cashFlowAmount', 'סכום גבוה מדי (מקסימום 10,000,000)');
    }
    isValid = false;
  }

  // וולידציה של מטבע - מטבע הוא אופציונלי
  if (formData.currency_id && isNaN(formData.currency_id)) {
    if (window.showValidationWarning) {
      window.showValidationWarning('cashFlowCurrencyId', 'יש לבחור מטבע תקין');
    }
    isValid = false;
  }

  // וולידציה של תאריך
  if (!formData.date) {
    if (window.showValidationWarning) {
      window.showValidationWarning('cashFlowDate', 'יש להזין תאריך');
    }
    isValid = false;
  } else {
    const date = new Date(formData.date);
    const today = new Date();
    const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

    if (date > maxDate) {
      if (window.showValidationWarning) {
        window.showValidationWarning('cashFlowDate', 'תאריך לא יכול להיות יותר משנה קדימה');
      }
      isValid = false;
    }

    const minDate = new Date(2000, 0, 1);
    if (date < minDate) {
      if (window.showValidationWarning) {
        window.showValidationWarning('cashFlowDate', 'תאריך לא יכול להיות לפני שנת 2000');
      }
      isValid = false;
    }
  }

  // וולידציה של מקור
  if (!formData.source) {
    if (window.showValidationWarning) {
      window.showValidationWarning('cashFlowSource', 'יש לבחור מקור');
    }
    isValid = false;
  }

  return isValid;
}

/**
 * הצגת שגיאת וולידציה לשדה
 * @param {string} fieldId - מזהה השדה
 * @param {string} message - הודעת השגיאה
 */
// showFieldError() - זמינה גלובלית מ-ui-utils.js כ-showValidationWarning

/**
 * ניקוי הודעות שגיאה
 */
function clearValidationErrors() {
  const fields = ['cashFlowAccountId', 'cashFlowType', 'cashFlowAmount', 'cashFlowCurrencyId', 'cashFlowDate', 'cashFlowSource'];

  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(fieldId + 'Error');

    if (field) {
      field.classList.remove('is-invalid');
    }

    if (errorDiv) {
      errorDiv.textContent = '';
      errorDiv.style.display = 'none';
    }
  });
}

/**
 * וולידציה של טופס עריכת תזרים מזומנים
 * @param {Object} formData - נתוני הטופס
 * @returns {boolean} true אם הטופס תקין, false אחרת
 */
function validateEditCashFlowForm(formData) {
  let isValid = true;

  // ניקוי הודעות שגיאה קודמות
  clearEditValidationErrors();

  // וולידציה של חשבון
  if (!formData.account_id || isNaN(formData.account_id)) {
    showEditFieldError('editCashFlowAccountId', 'יש לבחור חשבון');
    isValid = false;
  }

  // וולידציה של סוג
  if (!formData.type) {
    showEditFieldError('editCashFlowType', 'יש לבחור סוג תזרים');
    isValid = false;
  }

  // וולידציה של סכום
  if (!formData.amount || isNaN(formData.amount)) {
    showEditFieldError('editCashFlowAmount', 'יש להזין סכום תקין');
    isValid = false;
  } else if (formData.amount === 0) {
    showEditFieldError('editCashFlowAmount', 'סכום לא יכול להיות 0');
    isValid = false;
  } else if (Math.abs(formData.amount) > 10000000) {
    showEditFieldError('editCashFlowAmount', 'סכום גבוה מדי (מקסימום 10,000,000)');
    isValid = false;
  }

  // וולידציה של מטבע - מטבע הוא אופציונלי
  if (formData.currency_id && isNaN(formData.currency_id)) {
    showEditFieldError('editCashFlowCurrencyId', 'יש לבחור מטבע תקין');
    isValid = false;
  }

  // וולידציה של תאריך
  if (!formData.date) {
    showEditFieldError('editCashFlowDate', 'יש להזין תאריך');
    isValid = false;
  } else {
    const date = new Date(formData.date);
    const today = new Date();
    const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

    if (date > maxDate) {
      showEditFieldError('editCashFlowDate', 'תאריך לא יכול להיות יותר משנה קדימה');
      isValid = false;
    }

    const minDate = new Date(2000, 0, 1);
    if (date < minDate) {
      showEditFieldError('editCashFlowDate', 'תאריך לא יכול להיות לפני שנת 2000');
      isValid = false;
    }
  }

  // וולידציה של מקור
  if (!formData.source) {
    showEditFieldError('editCashFlowSource', 'יש לבחור מקור');
    isValid = false;
  }

  return isValid;
}

/**
 * הצגת שגיאת וולידציה לשדה עריכה
 * @param {string} fieldId - מזהה השדה
 * @param {string} message - הודעת השגיאה
 */
function showEditFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorDiv = document.getElementById(fieldId + 'Error');

  if (field) {
    field.classList.add('is-invalid');
    field.focus();
  }

  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }

  // שימוש במערכת האזהרות החדשה
  if (window.showValidationWarning) {
    window.showValidationWarning(fieldId, message);
  }
}

/**
 * ניקוי הודעות שגיאה לעריכה
 */
function clearEditValidationErrors() {
  const fields = ['editCashFlowAccountId', 'editCashFlowType', 'editCashFlowAmount', 'editCashFlowCurrencyId', 'editCashFlowDate', 'editCashFlowSource'];

  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(fieldId + 'Error');

    if (field) {
      field.classList.remove('is-invalid');
    }

    if (errorDiv) {
      errorDiv.textContent = '';
      errorDiv.style.display = 'none';
    }
  });
}


// ========================================
// פונקציות מחיקה
// ========================================

/**
 * מחיקת תזרים מזומנים
 */
async function deleteCashFlow(id) {
  try {
    // מציאת התזרים
    const cashFlow = window.cashFlowsData ? window.cashFlowsData.find(cf => cf.id === id) : null;
    if (!cashFlow) {
      window.showErrorNotification('שגיאה', 'תזרים המזומנים לא נמצא');
      return;
    }

    // הצגת חלון אישור מפורט
    const confirmMessage = `האם אתה בטוח שברצונך למחוק את תזרים המזומנים הבא?

חשבון: ${cashFlow.account_name || 'לא מוגדר'}
סוג: ${getCashFlowTypeText(cashFlow.type)}
סכום: ${cashFlow.amount} ${cashFlow.currency_symbol || ''}
תאריך: ${formatDate(cashFlow.date)}
תיאור: ${cashFlow.description || 'ללא תיאור'}

⚠️  פעולה זו אינה הפיכה!`;

    // אישור מהמשתמש
    if (typeof window.showConfirmationDialog === 'function') {
      const confirmed = await new Promise(resolve => {
        window.showConfirmationDialog(
          'מחיקת תזרים מזומנים',
          confirmMessage,
          () => resolve(true),
          () => resolve(false),
        );
      });
      if (!confirmed) {
        return;
      }
    } else {
      // Fallback למקרה שמערכת התראות לא זמינה
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    // שליחת בקשת מחיקה
    const response = await fetch(`http://localhost:8080/api/v1/cash_flows/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'success') {
      // הצגת הודעת הצלחה
      window.showSuccessNotification('הצלחה', 'תזרים המזומנים נמחק בהצלחה');

      // טעינה מחדש של הנתונים
      await loadCashFlows();
    } else {
      throw new Error(result.error || 'שגיאה לא ידועה');
    }
  } catch {
// Console statement removed for no-console compliance
    window.showErrorNotification('שגיאה במחיקה', 'שגיאה במחיקת תזרים המזומנים');
  }
}

// ========================================
// פונקציות פריטים מקושרים
// ========================================

// ========================================
// Validation Rules
// ========================================

// כללי וולידציה למודל הוספה
const addCashFlowValidationRules = {
  cashFlowAccountId: {
    required: true,
    message: 'נדרש לבחור חשבון',
  },
  cashFlowType: {
    required: true,
    message: 'נדרש לבחור סוג תזרים',
  },
  cashFlowAmount: {
    required: true,
    min: 0.01,
    message: 'נדרש להזין סכום חיובי',
  },
  cashFlowCurrencyId: {
    required: true,
    message: 'נדרש לבחור מטבע',
  },
  cashFlowDate: {
    required: true,
    message: 'נדרש לבחור תאריך',
  },
  cashFlowSource: {
    required: true,
    message: 'נדרש לבחור מקור',
  },
  cashFlowExternalId: {
    required: false, // לא חובה - תלוי במקור
    message: 'נדרש להזין מזהה חיצוני',
  },
};

// כללי וולידציה למודל עריכה
const editCashFlowValidationRules = {
  editCashFlowAccountId: {
    required: true,
    message: 'נדרש לבחור חשבון',
  },
  editCashFlowType: {
    required: true,
    message: 'נדרש לבחור סוג תזרים',
  },
  editCashFlowAmount: {
    required: true,
    min: 0.01,
    message: 'נדרש להזין סכום חיובי',
  },
  editCashFlowCurrencyId: {
    required: true,
    message: 'נדרש לבחור מטבע',
  },
  editCashFlowDate: {
    required: true,
    message: 'נדרש לבחור תאריך',
  },
  editCashFlowSource: {
    required: true,
    message: 'נדרש לבחור מקור',
  },
  editCashFlowExternalId: {
    required: false, // לא חובה - תלוי במקור
    message: 'נדרש להזין מזהה חיצוני',
  },
};

// ========================================
// פונקציות עזר
// ========================================

/**
 * טעינת מטבעות מהשרת עם מערכת המטבעות החדשה
 */
async function loadCurrenciesFromServer() {
  try {
    const response = await fetch('http://localhost:8080/api/v1/currencies/dropdown');
    if (response.ok) {
      const result = await response.json();
      if (result.status === 'success') {
        // עדכון המשתנה הגלובלי של מטבעות
        window.currenciesData = result.data;
        return result.data;
      }
    }
  } catch (error) {
    handleDataLoadError(error, 'טעינת מטבעות מהשרת');

    // הצגת הודעת שגיאה
    if (window.showInfoNotification) {
      window.showInfoNotification('מידע על הטעינה', 'שגיאה בטעינת מטבעות מהשרת');
    }
  }
  return [];
}

/**
 * טעינת רשימת חשבונות למודל הוספה
 */
async function loadAccountsForCashFlow() {
  try {
    const response = await fetch('http://localhost:8080/api/v1/accounts/');
    if (response.ok) {
      const result = await response.json();
      if (result.status === 'success') {
        const select = document.getElementById('cashFlowAccountId');
        if (select) {
          select.innerHTML = '<option value="">בחר חשבון...</option>';

          // הצגת רק חשבונות פתוחים
          const activeAccounts = result.data.filter(account => account.status === 'open');
          activeAccounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = account.name;
            select.appendChild(option);
          });

        } else {
          handleElementNotFound('loadAccountsForCashFlow', 'לא נמצא אלמנט select עם ID: cashFlowAccountId');
        }
      } else {
        handleApiError('שגיאה בתגובת API', result.error);
      }
    } else {
      handleApiError('שגיאת HTTP', response.status);
    }
  } catch (error) {
    handleDataLoadError(error, 'טעינת חשבונות');

    // הצגת הודעת שגיאה
    if (window.showInfoNotification) {
      window.showInfoNotification('מידע על הטעינה', 'שגיאה בטעינת חשבונות');
    }
  }
}

/**
 * טעינת רשימת חשבונות למודל עריכה
 */
async function loadAccountsForEditCashFlow() {
  try {
    const response = await fetch('http://localhost:8080/api/v1/accounts/');
    if (response.ok) {
      const result = await response.json();
      if (result.status === 'success') {
        const select = document.getElementById('editCashFlowAccountId');
        select.innerHTML = '<option value="">בחר חשבון...</option>';

        // הצגת רק חשבונות פתוחים
        result.data
          .filter(account => account.status === 'open')
          .forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = account.name;
            select.appendChild(option);
          });
      }
    }
  } catch (error) {
    handleDataLoadError(error, 'טעינת חשבונות');
  }
}

/**
 * טעינת רשימת מטבעות למודל הוספה
 */
async function loadCurrenciesForCashFlow() {
  try {
    // טעינת מטבעות מהשרת עם המערכת החדשה
    const currencies = await loadCurrenciesFromServer();
    const select = document.getElementById('cashFlowCurrencyId');
    if (select) {
      select.innerHTML = '<option value="">בחר מטבע...</option>';

      currencies.forEach(currency => {
        const option = document.createElement('option');
        option.value = currency.id;
        option.textContent = `${currency.symbol} - ${currency.name}`;
        select.appendChild(option);
      });

    } else {
      handleElementNotFound('loadCurrenciesForCashFlow', 'לא נמצא אלמנט select עם ID: cashFlowCurrencyId');
    }
  } catch (error) {
    handleDataLoadError(error, 'טעינת מטבעות');

    // הצגת הודעת שגיאה
    if (window.showInfoNotification) {
      window.showInfoNotification('מידע על הטעינה', 'שגיאה בטעינת מטבעות');
    }
  }
}

/**
 * טעינת רשימת מטבעות למודל עריכה
 */
async function loadCurrenciesForEditCashFlow() {
  try {
    // טעינת מטבעות מהשרת עם המערכת החדשה
    const currencies = await loadCurrenciesFromServer();

    const select = document.getElementById('editCashFlowCurrencyId');
    select.innerHTML = '<option value="">בחר מטבע...</option>';

    currencies.forEach(currency => {
      const option = document.createElement('option');
      option.value = currency.id;
      option.textContent = `${currency.symbol} - ${currency.name}`;
      select.appendChild(option);
    });
  } catch (error) {
    handleDataLoadError(error, 'טעינת מטבעות');
  }
}

/**
 * רינדור טבלת תזרימי מזומנים
 */
function renderCashFlowsTable() {
  const tbody = document.querySelector('#cashFlowsContainer table tbody');
  if (!tbody) {return;}

  tbody.innerHTML = '';

  if (!cashFlowsData || cashFlowsData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" class="text-center">לא נמצאו תזרימי מזומנים</td></tr>';
    return;
  }

  cashFlowsData.forEach(cashFlow => {
    const row = document.createElement('tr');
    const accountName = cashFlow.account_name || `חשבון ${cashFlow.account_id}`;

    // הצגת רק סמל המטבע
    const currencyDisplay = cashFlow.currency_symbol || '$';

    // קבלת סוג עם צבע
    const typeDisplay = getCashFlowTypeWithColor(cashFlow.type);

    // עיצוב סכום עם יישור נכון וצביעה
    const amountDisplay = formatCashFlowAmount(cashFlow.amount);

    // עיצוב שער עם 2 ספרות אחרי הנקודה
    const rateDisplay = formatUsdRate(cashFlow.usd_rate);

    row.innerHTML = `
            <td class="ticker-cell"><strong>${accountName}</strong></td>
            <td class="type-cell">${typeDisplay}</td>
            <td style="text-align: left; direction: ltr;">${amountDisplay}</td>
            <td style="text-align: center;">${currencyDisplay}</td>
            <td style="text-align: center;">${rateDisplay}</td>
            <td style="text-align: center;">${formatDate(cashFlow.date)}</td>
            <td>${cashFlow.description || '-'}</td>
            <td>${window.translateCashFlowSource ?
    window.translateCashFlowSource(cashFlow.source) :
    cashFlow.source}</td>
            <td>${cashFlow.external_id || '0'}</td>
            <td style="text-align: center;">${formatDateOnly(cashFlow.created_at)}</td>
            <td class="actions-cell">
              ${createLinkButton(
    `window.showLinkedItemsModal && window.showLinkedItemsModal([], 'cash_flow', ${cashFlow.id})`,
  )}
              ${createEditButton(`showEditCashFlowModal(${cashFlow.id})`)}
              ${createDeleteButton(`deleteCashFlow(${cashFlow.id})`)}

            </td>
        `;
    tbody.appendChild(row);
  });

  // עדכון מספר הפריטים
  const countElement = document.querySelector('.table-count');
  if (countElement) {
    countElement.textContent = `${cashFlowsData.length} תזרימים`;
  }
}

/**
 * עדכון סטטיסטיקות סיכום
 */
function updatePageSummaryStats() {
  if (!cashFlowsData) {
    cashFlowsData = [];
  }

  const totalCashFlows = cashFlowsData.length;
  const totalDeposits = cashFlowsData
    .filter(cf => cf.type === 'deposit')
    .reduce((sum, cf) => sum + parseFloat(cf.amount || 0), 0);
  const totalWithdrawals = cashFlowsData
    .filter(cf => cf.type === 'withdrawal')
    .reduce((sum, cf) => sum + parseFloat(cf.amount || 0), 0);
  const currentBalance = totalDeposits - totalWithdrawals;

  document.getElementById('totalCashFlows').textContent = totalCashFlows;
  document.getElementById('totalDeposits').textContent = formatAmount(totalDeposits);
  document.getElementById('totalWithdrawals').textContent = formatAmount(totalWithdrawals);
  document.getElementById('currentBalance').textContent = formatAmount(currentBalance);
}

// פונקציות הועברו ל-translation-utils.js:
// getTypeDisplayName -> translateCashFlowType
// getSourceDisplayName -> translateCashFlowSource

/**
 * פורמט סכום
 */
function formatAmount(amount) {
  // שימוש במערכת הפורמט החדשה
  if (window.formatCurrencyWithCommas) {
    return window.formatCurrencyWithCommas(amount, 'USD');
  }

  // גיבוי למערכת הישנה
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * קבלת סוג תזרים עם צבע
 */
function getCashFlowTypeWithColor(type) {
  const typeTranslation = window.translateCashFlowType ? window.translateCashFlowType(type) : type;

  let typeClass = '';
  switch (type) {
  case 'deposit':
    typeClass = 'type-investment'; // ירוק - הפקדה
    break;
  case 'withdrawal':
    typeClass = 'type-swing'; // כחול - משיכה
    break;
  case 'dividend':
    typeClass = 'type-passive'; // צהוב - דיבידנד
    break;
  case 'fee':
    typeClass = 'type-crypto'; // סגול - עמלה
    break;
  default:
    typeClass = 'type-other';
  }

  return `<span class="${typeClass}"><strong>${typeTranslation}</strong></span>`;
}

/**
 * קבלת סוג תזרים כטקסט בלבד (ללא HTML)
 */
function getCashFlowTypeText(type) {
  return window.translateCashFlowType ? window.translateCashFlowType(type) : type;
}

/**
 * עיצוב סכום עם יישור נכון וצביעה
 */
function formatCashFlowAmount(amount) {
  if (!amount && amount !== 0) {return '-';}

  const numAmount = parseFloat(amount);
  const isPositive = numAmount >= 0;
  const absAmount = Math.abs(numAmount);

  // שימוש במערכת הפורמט החדשה
  if (window.formatCurrencyWithCommas) {
    const formattedAmount = window.formatCurrencyWithCommas(absAmount, 'USD');
    const displayAmount = `${isPositive ? '+' : '-'}${formattedAmount}`;

    // שימוש במערכת הצביעה החדשה
    if (window.colorAmountByValue) {
      return window.colorAmountByValue(numAmount, displayAmount);
    }
  }

  // עיצוב הסכום עם סימן בצד הנכון (שמאל)
  const formattedAmount = `${isPositive ? '+' : '-'}$${absAmount.toFixed(2)}`;

  // צביעה לפי סכום
  const colorClass = isPositive ? 'profit-positive' : 'profit-negative';

  return `<span class="${colorClass}">${formattedAmount}</span>`;
}

/**
 * עיצוב שער דולר עם 2 ספרות אחרי הנקודה
 */
function formatUsdRate(rate) {
  if (!rate) {return '1.00';}
  const numRate = parseFloat(rate);
  return numRate.toFixed(2);
}

// ========================================
// פונקציות עדכון טבלה
// ========================================

/**
 * עדכון טבלת תזרימי מזומנים
 * @param {Array} cashFlows - מערך של תזרימי מזומנים
 */
function updateCashFlowsTable(cashFlows) {

  // עדכון הנתונים הגלובליים
  window.cashFlowsData = cashFlows;
  cashFlowsData = cashFlows;

  // רינדור הטבלה
  renderCashFlowsTable();

  // עדכון סטטיסטיקות
  updatePageSummaryStats();
}

// הגדרת הפונקציה כגלובלית
window.updateCashFlowsTable = updateCashFlowsTable;

// פונקציית פילטור מקומי - הוסרה כי לא בשימוש

// ========================================
// אתחול הדף
// ========================================

// הפונקציה loadCashFlows הראשונה נשארת בשורה 241
// הפונקציה הכפולה נמחקה

/**
 * אתחול הדף
 */
async function initializeCashFlowsPage() {

  // טעינת מטבעות מהשרת
  await loadCurrenciesFromServer();

  // טעינת נתונים
  await loadCashFlows();

  // שחזור מצב הסגירה
  window.restoreSectionStates();

  // שחזור מצב סידור
  restoreSortState();

  // הגדרת event listeners לשדות מקור ווולידציה מיידית
  setupSourceFieldListeners();
  setupValidationListeners();

  // אתחול מערכת וולידציה
  if (window.initializeValidation) {
    window.initializeValidation('addCashFlowForm', addCashFlowValidationRules);
    window.initializeValidation('editCashFlowForm', editCashFlowValidationRules);
  }
}

// הפעלת אתחול כשהדף נטען
document.addEventListener('DOMContentLoaded', function () {
  initializeCashFlowsPage();
});

// ייצוא פונקציות גלובליות
// פונקציות לא בשימוש - הוסרו
window.toggleCashFlowsSection = toggleCashFlowsSection;
window.restoreCashFlowsSectionState = restoreCashFlowsSectionState;
window.saveCashFlow = saveCashFlow;
window.updateCashFlow = updateCashFlow;

// יצירת alias לפונקציית המחיקה לשמירה על תאימות
function confirmDeleteCashFlow(id) {
  return deleteCashFlow(id);
}
window.confirmDeleteCashFlow = confirmDeleteCashFlow;

// window.viewLinkedItemsForCashFlow = viewLinkedItemsForCashFlow; // נמחק

// ===== פונקציות סידור =====

/**
 * פונקציה לסידור טבלת תזרימי מזומנים
 * @param {number} columnIndex - אינדקס העמודה לסידור
 *
 * דוגמאות שימוש:
 * sortTable(0); // סידור לפי עמודת חשבון
 * sortTable(2); // סידור לפי עמודת סכום
 * sortTable(4); // סידור לפי עמודת תאריך
 *
 * @requires window.sortTableData - פונקציה גלובלית מ-main.js
 */
function sortTable(columnIndex) {

  if (typeof window.sortTableData === 'function') {
    window.sortTableData(
      columnIndex,
      window.cashFlowsData || [],
      'cash_flows',
      updateCashFlowsTable,
    );
  } else {
    handleFunctionNotFound('sortTableData', 'פונקציית סידור טבלה לא נמצאה');
  }
}

/**
 * שחזור מצב סידור - שימוש בפונקציה גלובלית
 * @deprecated Use window.restoreAnyTableSort from main.js instead
 */
function restoreSortState() {

  if (typeof window.restoreAnyTableSort === 'function') {
    window.restoreAnyTableSort('cash_flows', window.cashFlowsData || [], updateCashFlowsTable);
  } else {
    handleFunctionNotFound('restoreAnyTableSort', 'פונקציית שחזור סידור לא נמצאה');
  }
}

// הגדרת הפונקציה כגלובלית
window.sortTable = sortTable;

// ========================================
// פונקציות לניהול שדה מזהה חיצוני
// ========================================

/**
 * ניהול שדה מזהה חיצוני בהתאם למקור
 * @param {string} source - מקור התזרים
 * @param {string} modalType - סוג המודל ('add' או 'edit')
 */
function manageExternalIdField(source, modalType) {
  const fieldId = modalType === 'edit' ? 'editCashFlowExternalId' : 'cashFlowExternalId';
  const externalIdField = document.getElementById(fieldId);

  if (!externalIdField) {
    handleElementNotFound('manageExternalIdField', `שדה מזהה חיצוני לא נמצא במודל ${modalType} - מחפש ${fieldId}`);
    return;
  }

  // אם המקור הוא ידני, השדה לא פעיל
  if (source === 'manual') {
    externalIdField.disabled = true;
    externalIdField.value = '0'; // ערך ברירת מחדל
    externalIdField.classList.add('form-control-disabled');
  } else {
    // אם המקור אינו ידני, השדה פעיל
    externalIdField.disabled = false;
    externalIdField.classList.remove('form-control-disabled');

    // אם השדה ריק, אפשר למשתמש להזין ערך
    if (externalIdField.value === '0') {
      externalIdField.value = '';
    }
  }
}

/**
 * הוספת event listeners לשדות מקור ווולידציה מיידית
 */
function setupSourceFieldListeners() {
  // למודל הוספה
  const addSourceField = document.getElementById('cashFlowSource');
  if (addSourceField) {
    addSourceField.addEventListener('change', function () {
      manageExternalIdField(this.value, 'add');
      validateField('cashFlowSource', this.value, 'add');
      // בדיקת שדה מזהה חיצוני אחרי שינוי מקור
      const externalIdField = document.getElementById('cashFlowExternalId');
      if (externalIdField) {
        validateField('cashFlowExternalId', externalIdField.value, 'add');
      }
    });
  }

  // למודל עריכה
  const editSourceField = document.getElementById('editCashFlowSource');
  if (editSourceField) {
    editSourceField.addEventListener('change', function () {
      manageExternalIdField(this.value, 'edit');
      validateField('editCashFlowSource', this.value, 'edit');
      // בדיקת שדה מזהה חיצוני אחרי שינוי מקור
      const externalIdField = document.getElementById('editCashFlowExternalId');
      if (externalIdField) {
        validateField('editCashFlowExternalId', externalIdField.value, 'edit');
      }
    });
  }
}

/**
 * הוספת event listeners לוולידציה מיידית
 */
function setupValidationListeners() {
  // שדות למודל הוספה
  const addFields = ['cashFlowAccountId', 'cashFlowType', 'cashFlowAmount', 'cashFlowCurrencyId', 'cashFlowDate', 'cashFlowDescription', 'cashFlowExternalId'];
  addFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('blur', function() {
        validateField(fieldId, this.value, 'add');
      });
      field.addEventListener('input', function() {
        const inputField = document.getElementById(fieldId);
        if (inputField && window.clearFieldValidation) {
          window.clearFieldValidation(inputField);
        }
      });
    }
  });

  // שדות למודל עריכה
  const editFields = ['editCashFlowAccountId', 'editCashFlowType', 'editCashFlowAmount', 'editCashFlowCurrencyId', 'editCashFlowDate', 'editCashFlowDescription', 'editCashFlowExternalId'];
  editFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('blur', function() {
        validateField(fieldId, this.value, 'edit');
      });
      field.addEventListener('input', function() {
        const inputField = document.getElementById(fieldId);
        if (inputField && window.clearFieldValidation) {
          window.clearFieldValidation(inputField);
        }
      });
    }
  });
}

/**
 * וולידציה מיידית של שדה בודד
 */
function validateField(fieldId, value, formType) {
  // הסרת prefix אם יש
  let actualFieldId = fieldId;
  if (formType === 'edit' && fieldId.startsWith('edit')) {
    actualFieldId = fieldId.replace('edit', '');
  }

  // קבלת שם השדה ללא prefix
  let fieldName = actualFieldId;
  if (actualFieldId.startsWith('cashFlow')) {
    fieldName = actualFieldId.replace('cashFlow', '');
  }

  switch (fieldName) {
  case 'AccountId':
    if (!value || isNaN(value)) {
      const field = document.getElementById(fieldId);
      if (field && window.showFieldError) {
        window.showFieldError(field, 'יש לבחור חשבון');
      }
      return false;
    }
    break;
  case 'Type':
    if (!value) {
      const field = document.getElementById(fieldId);
      if (field && window.showFieldError) {
        window.showFieldError(field, 'יש לבחור סוג תזרים');
      }
      return false;
    }
    break;
  case 'Amount':
    if (!value || isNaN(value)) {
      const field = document.getElementById(fieldId);
      if (field && window.showFieldError) {
        window.showFieldError(field, 'יש להזין סכום תקין');
      }
      return false;
    } else if (parseFloat(value) === 0) {
      const field = document.getElementById(fieldId);
      if (field && window.showFieldError) {
        window.showFieldError(field, 'סכום לא יכול להיות 0');
      }
      return false;
    } else if (Math.abs(parseFloat(value)) > 10000000) {
      const field = document.getElementById(fieldId);
      if (field && window.showFieldError) {
        window.showFieldError(field, 'סכום גבוה מדי (מקסימום 10,000,000)');
      }
      return false;
    }
    break;
  case 'CurrencyId':
    if (value && isNaN(value)) {
      const field = document.getElementById(fieldId);
      if (field && window.showFieldError) {
        window.showFieldError(field, 'יש לבחור מטבע תקין');
      }
      return false;
    }
    break;
  case 'Date':
    if (!value) {
      const field = document.getElementById(fieldId);
      if (field && window.showFieldError) {
        window.showFieldError(field, 'יש להזין תאריך');
      }
      return false;
    } else {
      const date = new Date(value);
      const today = new Date();
      const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
      const minDate = new Date(2000, 0, 1);

      if (date > maxDate) {
        const field = document.getElementById(fieldId);
        if (field && window.showFieldError) {
          window.showFieldError(field, 'תאריך לא יכול להיות יותר משנה קדימה');
        }
        return false;
      }
      if (date < minDate) {
        const field = document.getElementById(fieldId);
        if (field && window.showFieldError) {
          window.showFieldError(field, 'תאריך לא יכול להיות לפני שנת 2000');
        }
        return false;
      }
    }
    break;
  case 'Source':
    if (!value) {
      const field = document.getElementById(fieldId);
      if (field && window.showFieldError) {
        window.showFieldError(field, 'יש לבחור מקור');
      }
      return false;
    }
    break;
  case 'Description':
    if (value && value.length > 500) {
      const field = document.getElementById(fieldId);
      if (field && window.showFieldError) {
        window.showFieldError(field, 'תיאור לא יכול להיות יותר מ-500 תווים');
      }
      return false;
    }
    break;
  case 'ExternalId': {
    // וולידציה של מזהה חיצוני תלויה במקור
    const sourceFieldId = fieldId.includes('edit') ? 'editCashFlowSource' : 'cashFlowSource';
    const sourceField = document.getElementById(sourceFieldId);
    const source = sourceField ? sourceField.value : 'manual';

    // אם המקור אינו ידני, המזהה החיצוני נדרש
    if (source !== 'manual' && !value) {
      const field = document.getElementById(fieldId);
      if (field && window.showFieldError) {
        window.showFieldError(field, 'נדרש להזין מזהה חיצוני כשהמקור אינו ידני');
      }
      return false;
    }
    break;
  }
  }

  // הצגת סימון ירוק כשהערך תקין
  const field = document.getElementById(fieldId);
  if (field && window.showFieldSuccess) {
    window.showFieldSuccess(field);
  }
  return true;
}

/**
 * הצגת שגיאה לשדה בודד
 */
// showFieldError() - זמינה גלובלית מ-ui-utils.js כ-showValidationWarning

// Function removed - not used anywhere

/**
 * אתחול שדות מזהה חיצוני במודלים
 */
function initializeExternalIdFields() {
  // אתחול במודל הוספה
  const addSourceField = document.getElementById('cashFlowSource');
  if (addSourceField) {
    manageExternalIdField(addSourceField.value, 'add');
  }

  // אתחול במודל עריכה
  const editSourceField = document.getElementById('editCashFlowSource');
  if (editSourceField) {
    manageExternalIdField(editSourceField.value, 'edit');
  }
}

// עדכון פונקציית showAddCashFlowModal
async function _showAddCashFlowModal() {
  // איפוס הטופס
  document.getElementById('addCashFlowForm').reset();

  // ניקוי וולידציה
  if (window.clearValidation) {
    window.clearValidation('addCashFlowForm');
  }

  // הגדרת תאריך ברירת מחדל להיום
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('cashFlowDate').value = today;

  try {
    // טעינת רשימת החשבונות והמטבעות
    await loadAccountsForCashFlow();
    await loadCurrenciesForCashFlow();
    // אתחול שדה מזהה חיצוני
    initializeExternalIdFields();

    // הוספת event listeners לוולידציה מיידית
    setupValidationListeners();

    // הוספת event listeners לשדות מקור
    setupSourceFieldListeners();

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('addCashFlowModal'));
    modal.show();
  } catch (error) {
    handleDataLoadError(error, 'טעינת נתונים להוספה');
    window.showErrorNotification('שגיאה', 'שגיאה בטעינת נתונים להוספה');
  }
}

// עדכון פונקציית showEditCashFlowModal
async function _showEditCashFlowModal(id) {
  const cashFlow = cashFlowsData.find(cf => cf.id === id);
  if (!cashFlow) {
    handleElementNotFound('showEditCashFlowModal', `תזרים מזומנים לא נמצא: ${id}`);
    return;
  }

  // ניקוי וולידציה
  if (window.clearValidation) {
    window.clearValidation('editCashFlowForm');
  }

  try {
    // טעינת רשימת החשבונות והמטבעות קודם
    await loadAccountsForEditCashFlow();
    await loadCurrenciesForEditCashFlow();
    // מילוי הטופס אחרי שהרשימות נטענו
    const editTypeField = document.getElementById('editCashFlowType');
    document.getElementById('editCashFlowId').value = cashFlow.id;
    document.getElementById('editCashFlowAccountId').value = cashFlow.account_id;

    if (editTypeField) {
      editTypeField.value = cashFlow.type;
    } else {
      handleElementNotFound('showEditCashFlowModal', 'לא נמצא אלמנט editCashFlowType');
    }
    document.getElementById('editCashFlowAmount').value = cashFlow.amount;
    document.getElementById('editCashFlowCurrencyId').value = cashFlow.currency_id || '';
    document.getElementById('editCashFlowDate').value = cashFlow.date;
    document.getElementById('editCashFlowDescription').value = cashFlow.description || '';

    const editSourceField = document.getElementById('editCashFlowSource');
    editSourceField.value = cashFlow.source || 'manual';
    document.getElementById('editCashFlowExternalId').value = cashFlow.external_id || '0';

    // אתחול שדה מזהה חיצוני
    initializeExternalIdFields();

    // הוספת event listeners לוולידציה מיידית
    setupValidationListeners();

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('editCashFlowModal'));
    modal.show();
  } catch (error) {
    handleDataLoadError(error, 'טעינת נתונים לעריכה');
    window.showErrorNotification('שגיאה', 'שגיאה בטעינת נתונים לעריכה');
  }
}

// עדכון פונקציית saveCashFlow
async function saveCashFlow() {
  try {
    // איסוף נתונים מהטופס
    const currencyIdValue = document.getElementById('cashFlowCurrencyId').value;
    const externalIdValue = document.getElementById('cashFlowExternalId').value;
    const formData = {
      account_id: parseInt(document.getElementById('cashFlowAccountId').value),
      type: document.getElementById('cashFlowType').value,
      amount: parseFloat(document.getElementById('cashFlowAmount').value),
      currency_id: currencyIdValue ? parseInt(currencyIdValue) : null,
      usd_rate: 1.000000,
      date: document.getElementById('cashFlowDate').value,
      description: document.getElementById('cashFlowDescription').value,
      source: document.getElementById('cashFlowSource').value,
      external_id: externalIdValue || '0',
    };

    // בדיקת תקינות מקיפה
    if (window.validateForm) {
      if (!window.validateForm('addCashFlowForm')) {
        return;
      }
    } else if (!validateCashFlowForm(formData)) {
      return;
    }

    const response = await fetch('http://localhost:8080/api/v1/cash_flows/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      handleApiError('תגובת שגיאה מהשרת', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.status === 'success') {
      // סגירת המודל
      const modal = bootstrap.Modal.getInstance(document.getElementById('addCashFlowModal'));
      modal.hide();

      // הצגת הודעת הצלחה
      window.showSuccessNotification('הצלחה', 'תזרים המזומנים נשמר בהצלחה');

      // טעינה מחדש של הנתונים
      await loadCashFlows();
    } else {
      handleApiError('שגיאה בשמירת תזרים מזומנים', result.error);

      // טיפול בשגיאות וולידציה מהשרת
      // const errorMessage = 'שגיאה בשמירת תזרים מזומנים';

      if (result.error && result.error.message) {
        const serverMessage = result.error.message;

        // אם זו שגיאת וולידציה, נפרק אותה להודעות ספציפיות
        if (serverMessage.includes('validation failed')) {
          const validationErrors = serverMessage.replace('Cash flow validation failed: ', '').split('; ');

          // הצגת כל שגיאה בנפרד
          validationErrors.forEach(error => {
            let fieldError = error;
            let fieldName = '';

            // תרגום שגיאות ספציפיות
            if (error.includes('Field \'type\' has invalid value')) {
              fieldError = 'סוג תזרים לא תקין - יש לבחור ערך מהרשימה';
              fieldName = 'cashFlowType';
            } else if (error.includes('Field \'source\' has invalid value')) {
              fieldError = 'מקור לא תקין - יש לבחור ערך מהרשימה';
              fieldName = 'cashFlowSource';
            } else if (error.includes('Field \'amount\' is out of range')) {
              fieldError = 'סכום חייב להיות שונה מ-0';
              fieldName = 'cashFlowAmount';
            } else if (error.includes('Field \'usd_rate\' is out of range')) {
              fieldError = 'שער דולר חייב להיות חיובי';
              fieldName = 'cashFlowUsdRate';
            } else if (error.includes('Field \'account_id\' references non-existent record')) {
              fieldError = 'חשבון לא קיים במערכת';
              fieldName = 'cashFlowAccountId';
            }

            // שימוש במערכת ההתראות המובנת
            if (fieldName && window.showValidationWarning) {
              window.showValidationWarning(fieldName, fieldError);
            } else {
              window.showErrorNotification('שגיאת וולידציה', fieldError);
            }
          });
        } else {
          // שגיאה כללית
          window.showErrorNotification('שגיאה בשמירה', serverMessage);
        }
      } else {
        // הצגת הודעת שגיאה כללית
        window.showErrorNotification('שגיאה בשמירה', 'שגיאה בשמירת תזרים מזומנים - בדוק את הנתונים שהוזנו');
      }
    }
  } catch (error) {
    handleSaveError(error, 'שמירת תזרים מזומנים');
  }
}

// עדכון פונקציית updateCashFlow
async function updateCashFlow() {
  try {
    const id = parseInt(document.getElementById('editCashFlowId').value);

    // איסוף נתונים מהטופס
    const currencyIdValue = document.getElementById('editCashFlowCurrencyId').value;
    const externalIdValue = document.getElementById('editCashFlowExternalId').value;
    const formData = {
      account_id: parseInt(document.getElementById('editCashFlowAccountId').value),
      type: document.getElementById('editCashFlowType').value,
      amount: parseFloat(document.getElementById('editCashFlowAmount').value),
      currency_id: currencyIdValue ? parseInt(currencyIdValue) : null,
      usd_rate: 1.000000,
      date: document.getElementById('editCashFlowDate').value,
      description: document.getElementById('editCashFlowDescription').value,
      source: document.getElementById('editCashFlowSource').value,
      external_id: externalIdValue || '0',
    };

    // בדיקת תקינות מקיפה
    if (window.validateForm) {
      if (!window.validateForm('editCashFlowForm')) {
        return;
      }
    } else if (!validateEditCashFlowForm(formData)) {
      return;
    }

    const response = await fetch(`http://localhost:8080/api/v1/cash_flows/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      handleApiError('תגובת שגיאה מהשרת בעדכון', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.status === 'success') {
      // סגירת המודל
      const modal = bootstrap.Modal.getInstance(document.getElementById('editCashFlowModal'));
      modal.hide();

      // הצגת הודעת הצלחה
      window.showSuccessNotification('הצלחה', 'תזרים המזומנים נעדכן בהצלחה');

      // טעינה מחדש של הנתונים
      await loadCashFlows();
    } else {
      handleApiError('שגיאה בעדכון תזרים מזומנים', result.error);

      // טיפול בשגיאות וולידציה מהשרת
      if (result.error && result.error.message) {
        const serverMessage = result.error.message;

        // אם זו שגיאת וולידציה, נפרק אותה להודעות ספציפיות
        if (serverMessage.includes('validation failed')) {
          const validationErrors = serverMessage.replace('Cash flow validation failed: ', '').split('; ');

          // הצגת כל שגיאה בנפרד
          validationErrors.forEach(error => {
            let fieldError = error;
            let fieldName = '';

            // תרגום שגיאות ספציפיות
            if (error.includes('Field \'type\' has invalid value')) {
              fieldError = 'סוג תזרים לא תקין - יש לבחור ערך מהרשימה';
              fieldName = 'editCashFlowType';
            } else if (error.includes('Field \'source\' has invalid value')) {
              fieldError = 'מקור לא תקין - יש לבחור ערך מהרשימה';
              fieldName = 'editCashFlowSource';
            } else if (error.includes('Field \'amount\' is out of range')) {
              fieldError = 'סכום חייב להיות שונה מ-0';
              fieldName = 'editCashFlowAmount';
            } else if (error.includes('Field \'usd_rate\' is out of range')) {
              fieldError = 'שער דולר חייב להיות חיובי';
              fieldName = 'editCashFlowUsdRate';
            } else if (error.includes('Field \'account_id\' references non-existent record')) {
              fieldError = 'חשבון לא קיים במערכת';
              fieldName = 'editCashFlowAccountId';
            }

            // שימוש במערכת ההתראות המובנת
            if (fieldName && window.showValidationWarning) {
              window.showValidationWarning(fieldName, fieldError);
            } else {
              window.showErrorNotification('שגיאת וולידציה', fieldError);
            }
          });
        } else {
          // שגיאה כללית
          window.showErrorNotification('שגיאה בעדכון', serverMessage);
        }
      } else {
        // הצגת הודעת שגיאה כללית
        window.showErrorNotification('שגיאה בעדכון', 'שגיאה בעדכון תזרים מזומנים - בדוק את הנתונים שהוזנו');
      }
    }
  } catch (error) {
    handleSaveError(error, 'עדכון תזרים מזומנים');
  }
}

// הפונקציה הוסרה - קיימת כבר בשורה 909

// ייצוא פונקציות גלובליות נוספות
window.manageExternalIdField = manageExternalIdField;
window.setupSourceFieldListeners = setupSourceFieldListeners;
window.initializeExternalIdFields = initializeExternalIdFields;
window.deleteCashFlow = deleteCashFlow;

// window.showLinkedItemsWarning = showLinkedItemsWarning; // הוסר - הוחלף ב-showLinkedItemsModal
// window.checkLinkedItemsForCashFlow = checkLinkedItemsForCashFlow; // הוסר - לא נחוץ יותר
