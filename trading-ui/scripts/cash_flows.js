// ===== קובץ JavaScript לדף תזרימי מזומנים =====

// ===== Global Element Cache =====
let addCashFlowModalElement = null;
let editCashFlowModalElement = null;
let addCashFlowModal = null;
let editCashFlowModal = null;
let addCashFlowForm = null;
let cashFlowDateInput = null;
let cashFlowAccountSelect = null;
let editCashFlowAccountSelect = null;
let cashFlowCurrencySelect = null;
let editCashFlowCurrencySelect = null;

// Initialize element references on DOM ready
// DOMContentLoaded removed - handled by unified system via PAGE_CONFIGS in core-systems.js
// Modal initialization moved to initializeCashFlowsModals

window.initializeCashFlowsModals = function() {
    addCashFlowModalElement = document.getElementById('addCashFlowModal');
    editCashFlowModalElement = document.getElementById('editCashFlowModal');
    addCashFlowForm = document.getElementById('addCashFlowForm');
    cashFlowDateInput = document.getElementById('cashFlowDate');
    cashFlowAccountSelect = document.getElementById('cashFlowAccountId');
    editCashFlowAccountSelect = document.getElementById('editCashFlowAccountId');
    cashFlowCurrencySelect = document.getElementById('cashFlowCurrencyId');
    editCashFlowCurrencySelect = document.getElementById('editCashFlowCurrencyId');
    
    if (addCashFlowModalElement) addCashFlowModal = new bootstrap.Modal(addCashFlowModalElement);
    if (editCashFlowModalElement) editCashFlowModal = new bootstrap.Modal(editCashFlowModalElement);
};

/**
 * טעינת נתוני תזרימי מזומנים מהשרת
 * פונקציה מאוחדת לטעינת נתונים עם טיפול בשגיאות מתקדם
 */
async function loadCashFlows() {
  try {
    console.log('📊 טוען נתוני תזרימי מזומנים...');
    
    // הצגת אינדיקטור טעינה
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('טעינה', 'טוען נתוני תזרימי מזומנים...', 2000, 'ui');
    }
    
    const response = await fetch('http://127.0.0.1:8080/api/cash_flows/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

      if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'success') {
      cashFlowsData = result.data;
      window.cashFlowsData = result.data;
      
      console.log('✅ נטענו תזרימי מזומנים:', result.data.length, 'פריטים');
      
      await renderCashFlowsTable();
      updatePageSummaryStats();
      
      // יישום צבעי ישויות על כותרות
      if (window.applyEntityColorsToHeaders) {
        window.applyEntityColorsToHeaders('cash_flow');
      }
      
      // הודעת הצלחה
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', 'נתוני תזרימי מזומנים נטענו בהצלחה', 3000, 'business');
      }
    } else {
      handleApiError('שגיאה בטעינת תזרימי מזומנים', result.error);
    }
  } catch (error) {
    handleDataLoadError(error, 'טעינת תזרימי מזומנים');
  }
}

/**
 * חישוב יתרה
 * מחשב את היתרה הנוכחית על בסיס תזרימי המזומנים
 */
function calculateBalance() {
  try {
    console.log('🧮 מחשב יתרה...');
    
    if (!window.cashFlowsData || window.cashFlowsData.length === 0) {
      if (typeof window.showWarningNotification === 'function') {
        window.showWarningNotification('אין נתוני תזרימי מזומנים', 'לא ניתן לחשב יתרה ללא נתונים');
      } else if (typeof window.showNotification === 'function') {
        window.showWarningNotification('אין נתוני תזרימי מזומנים');
      }
      return;
    }
    
    // חישוב היתרה
    let totalBalance = 0;
    let incomeTotal = 0;
    let expenseTotal = 0;
    
    window.cashFlowsData.forEach(flow => {
      const amount = parseFloat(flow.amount) || 0;
      if (flow.type === 'income' || flow.type === 'הכנסה') {
        incomeTotal += amount;
        totalBalance += amount;
      } else if (flow.type === 'expense' || flow.type === 'הוצאה') {
        expenseTotal += amount;
        totalBalance -= amount;
      }
    });
    
    // הצגת התוצאות
    const balanceMessage = `\n` +
      `סך הכנסות: ${incomeTotal.toFixed(2)}\n` +
      `סך הוצאות: ${expenseTotal.toFixed(2)}\n` +
      `יתרה נוכחית: ${totalBalance.toFixed(2)}`;
    
    if (typeof window.showModalNotification === 'function') {
      const content = `
        <div class="balance-calculation">
          <h5>חישוב יתרה</h5>
          <div class="row">
            <div class="col-md-4">
              <p><strong>סך הכנסות:</strong> ${incomeTotal.toFixed(2)}</p>
            </div>
            <div class="col-md-4">
              <p><strong>סך הוצאות:</strong> ${expenseTotal.toFixed(2)}</p>
            </div>
            <div class="col-md-4">
              <p><strong>יתרה נוכחית:</strong> ${totalBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>
      `;
      window.showModalNotification('חישוב יתרה', content, 'info');
    } else {
      window.showInfoNotification(`חישוב יתרה:${balanceMessage}`);
    }
    
  } catch (error) {
    console.error('שגיאה בחישוב יתרה:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בחישוב יתרה', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה בחישוב יתרה');
    }
  }
}
/**
 * Cash Flows.js - Cash Flows Page Management
 * ==========================================
 *
 * This file contains all cash flows management functionality for the TikTrack application.
 * It handles cash flows CRUD operations, table updates, and user interactions.
 *
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - translation-utils.js (translation functions)
 * - notification-system.js (notifications)
 * - unified-cache-manager.js (caching)
 *
 * Table Mapping:
 * - Uses 'cash_flows' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 *
 * File: trading-ui/scripts/cash_flows.js
 * Version: 2.3
 * Last Updated: January 26, 2025
 */

// משתנים גלובליים
if (!window.cashFlowsData) {
  window.cashFlowsData = [];
}
let cashFlowsData = window.cashFlowsData;
let tradingAccountsData = [];

/**
 * קבלת שם חשבון לפי ID
 */
function getAccountNameById(accountId) {
  // בדיקה אם יש cache של HeaderSystem
  if (window.HeaderSystem && window.HeaderSystem.accountsCache) {
    const account = window.HeaderSystem.accountsCache.find(acc => acc.id === accountId);
    if (account) {
      console.log(`✅ מצאתי חשבון ${accountId} ב-HeaderSystem:`, account.name);
      return account.name;
    }
  }
  
  // בדיקה אם יש נתונים גלובליים
  if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
    const account = window.trading_accountsData.find(acc => acc.id === accountId);
    if (account) {
      console.log(`✅ מצאתי חשבון ${accountId} ב-trading_accountsData:`, account.name);
      return account.name;
    }
  }
  
  console.warn(`⚠️ לא מצאתי שם לחשבון ${accountId}`);
  return null;
}

/**
 * טעינת נתוני חשבונות מסחר אם הם לא נטענו
 */
async function ensureTradingAccountsLoaded() {
  // אם יש כבר נתונים ב-HeaderSystem, אין צורך לטעון שוב
  if (window.HeaderSystem && window.HeaderSystem.accountsCache && window.HeaderSystem.accountsCache.length > 0) {
    console.log('✅ חשבונות זמינים מ-HeaderSystem:', window.HeaderSystem.accountsCache.length);
    return;
  }
  
  // אם יש נתונים גלובליים
  if (window.trading_accountsData && Array.isArray(window.trading_accountsData) && window.trading_accountsData.length > 0) {
    console.log('✅ חשבונות זמינים מ-trading_accountsData:', window.trading_accountsData.length);
    return;
  }
  
  // אין חשבונות - HeaderSystem כנראה טען אבל עדיין לא זמין
  // פתרון זמני: נשתמש בנתונים מהשרת ישירות
  console.log('⚠️ חשבונות לא נטענו - טוען מהשרת...');
  
  try {
    const response = await fetch('/api/trading-accounts/');
    if (response.ok) {
      const result = await response.json();
      if (result.status === 'success') {
        window.trading_accountsData = result.data;
        console.log('✅ חשבונות נטענו מהשרת:', result.data.length);
      }
    }
  } catch (error) {
    console.error('❌ שגיאה בטעינת חשבונות:', error);
  }
}


// ========================================
// פונקציות ניהול סקשנים
// ========================================
function toggleCashFlowsSection() {
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
    sectionBody.style.display = 'none';
    toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> הצג תזרימי מזומנים';
    toggleBtn.title = 'הצג תזרימי מזומנים';
  } else {
    sectionBody.style.display = 'block';
    toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> הסתר תזרימי מזומנים';
    toggleBtn.title = 'הסתר תזרימי מזומנים';
  }

  localStorage.setItem('cashFlowsSectionState', isVisible ? 'closed' : 'open');
}

function restoreCashFlowsSectionState() {
  const savedState = localStorage.getItem('cashFlowsSectionState');
  if (!savedState) {
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
    sectionBody.style.display = 'none';
    toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> הצג תזרימי מזומנים';
    toggleBtn.title = 'הצג תזרימי מזומנים';
  } else {
    sectionBody.style.display = 'block';
    toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> הסתר תזרימי מזומנים';
    toggleBtn.title = 'הסתר תזרימי מזומנים';
  }
}




// ========================================
// פונקציות מודלים
// ========================================

/**
 * הצגת מודל הוספת תזרים מזומנים
 */
function showAddCashFlowModal() {
  if (!addCashFlowModalElement) {
    handleElementNotFound('showAddCashFlowModal', 'מודל הוספת תזרים מזומנים לא נמצא');
    return;
  }

  // ניקוי הטופס
  if (addCashFlowForm) {
    addCashFlowForm.reset();
    clearValidationErrors();
  }

  // הגדרת ברירות מחדל באמצעות DefaultValueSetter
  window.DefaultValueSetter.setCurrentDateTime('cashFlowDate');
  window.DefaultValueSetter.setLogicalDefault('cashFlowType', 'deposit');

  // טעינת נתונים למודל
  loadAccountsForCashFlow();
  loadCurrenciesForCashFlow();

  // הצגת המודל
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();
}

/**
 * הצגת מודל עריכת תזרים מזומנים
 */
function showEditCashFlowModal(cashFlowId) {
  if (!editCashFlowModalElement) {
    handleElementNotFound('showEditCashFlowModal', 'מודל עריכת תזרים מזומנים לא נמצא');
    return;
  }

  // מציאת התזרים לעריכה
  const cashFlow = cashFlowsData.find(cf => cf.id === cashFlowId);
  if (!cashFlow) {
    handleElementNotFound('showEditCashFlowModal', 'תזרים מזומנים לא נמצא');
    return;
  }

  // ניקוי ולידציה קודמת
  if (typeof window.clearValidation === 'function') {
    window.clearValidation('editCashFlowForm');
  }

  // מילוי השדות - בדיקת קיום כל אלמנט
  const setFieldValue = (fieldId, value) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.value = value || '';
      console.log(`✅ שדה ${fieldId} הוגדר ל: ${value}`);
    } else {
      console.warn(`⚠️ שדה ${fieldId} לא נמצא במודל עריכה`);
    }
  };

  // המרת תאריך לפורמט datetime-local (YYYY-MM-DDTHH:MM)
  let dateTimeValue = cashFlow.date;
  if (dateTimeValue && !dateTimeValue.includes('T')) {
    // אם התאריך הוא רק YYYY-MM-DD, נוסיף שעה ברירת מחדל
    dateTimeValue = `${dateTimeValue}T12:00`;
    console.log(`📅 המרת תאריך: ${cashFlow.date} → ${dateTimeValue}`);
  }

  setFieldValue('editCashFlowId', cashFlow.id);
  setFieldValue('editCashFlowDate', dateTimeValue);
  setFieldValue('editCashFlowAmount', cashFlow.amount);
  setFieldValue('editCashFlowDescription', cashFlow.description);
  setFieldValue('editCashFlowAccountId', cashFlow.trading_account_id); // ✅ שדה נכון
  setFieldValue('editCashFlowCurrencyId', cashFlow.currency_id);
  setFieldValue('editCashFlowType', cashFlow.type);
  setFieldValue('editCashFlowSource', cashFlow.source);
  setFieldValue('editCashFlowExternalId', cashFlow.external_id);
  setFieldValue('editCashFlowUsdRate', cashFlow.usd_rate || 1.000000);

  // טעינת נתונים למודל
  loadAccountsForEditCashFlow();
  loadCurrenciesForEditCashFlow();

  // הצגת המודל
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();
}


// ========================================
// פונקציות API
// ========================================


/**
 * וולידציה של טופס תזרים מזומנים
 * משתמש במערכת הולידציה הכללית הסטנדרטית
 */
function validateCashFlowForm() {
  // שימוש בפונקציה הכללית validateEntityForm
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

  // וולידציה של חשבון מסחר
  if (!formData.trading_account_id || isNaN(formData.trading_account_id)) {
    showEditFieldError('editCashFlowAccountId', 'יש לבחור חשבון מסחר');
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

חשבון: ${getAccountNameById(cashFlow.trading_account_id) || 'לא מוגדר'}
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
    const response = await fetch(`http://127.0.0.1:8080/api/cash_flows/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'success') {
      // ניקוי מטמון cash_flows
      if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
        await window.UnifiedCacheManager.remove('cash_flows');
        console.log('✅ מטמון cash_flows נוקה אחרי מחיקה');
      }

      // ניקוי global data
      if (window.cashFlowsData) {
        window.cashFlowsData = null;
        console.log('✅ Global cashFlowsData נוקה');
      }

      // המתנה קצרה לוידוא ניקוי מטמון
      await new Promise(resolve => setTimeout(resolve, 100));

      // טעינה מחדש של הנתונים
      await loadCashFlows();

      // הצגת הודעת הצלחה אחרי הטעינה
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', 'תזרים המזומנים נמחק בהצלחה', 4000, 'business');
      }
    } else {
      throw new Error(result.error || 'שגיאה לא ידועה');
    }
  } catch (error) {
    console.error('❌ Delete error:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה במחיקה', error.message || 'שגיאה במחיקת תזרים המזומנים');
    }
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
    const response = await fetch('http://127.0.0.1:8080/api/currencies/dropdown');
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
    await window.SelectPopulatorService.populateAccountsSelect('cashFlowAccountId', {
        includeEmpty: true,
        emptyText: 'בחר חשבון...',
        filterFn: account => account.status === 'open', // רק חשבונות פתוחים
        defaultFromPreferences: true // שימוש בחשבון ברירת מחדל מהעדפות
    });
}

/**
 * טעינת רשימת חשבונות למודל עריכה
 */
async function loadAccountsForEditCashFlow() {
    await window.SelectPopulatorService.populateAccountsSelect('editCashFlowAccountId', {
        includeEmpty: true,
        emptyText: 'בחר חשבון...',
        filterFn: account => account.status === 'open' // רק חשבונות פתוחים
    });
}

/**
 * טעינת רשימת מטבעות למודל הוספה
 */
async function loadCurrenciesForCashFlow() {
    await window.SelectPopulatorService.populateCurrenciesSelect('cashFlowCurrencyId', {
        includeEmpty: true,
        emptyText: 'בחר מטבע...',
        setDefault: true, // USD (id=1) או מהעדפות
        format: 'symbol-name' // "USD - US Dollar"
    });
}

/**
 * טעינת רשימת מטבעות למודל עריכה
 */
async function loadCurrenciesForEditCashFlow() {
    await window.SelectPopulatorService.populateCurrenciesSelect('editCashFlowCurrencyId', {
        includeEmpty: true,
        emptyText: 'בחר מטבע...',
        format: 'symbol-name' // "USD - US Dollar"
    });
}

/**
 * רינדור טבלת תזרימי מזומנים
 */
async function renderCashFlowsTable() {
  const tbody = document.querySelector('#cashFlowsContainer table tbody');
  if (!tbody) {
    console.error('❌ טבלת תזרימי מזומנים לא נמצאה');
    return;
  }

  tbody.innerHTML = '';

  if (!cashFlowsData || cashFlowsData.length === 0) {
    console.log('ℹ️ אין תזרימי מזומנים להצגה');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">לא נמצאו תזרימי מזומנים</td></tr>';
    return;
  }

  console.log('📊 מרנדר טבלת תזרימי מזומנים:', cashFlowsData.length, 'פריטים');

  // וידוא שנתוני חשבונות מסחר נטענו
  await ensureTradingAccountsLoaded();

  cashFlowsData.forEach((cashFlow, index) => {
    console.log(`  ${index + 1}. תזרים ID ${cashFlow.id}: ${cashFlow.type} - ${cashFlow.amount}`);
    const row = document.createElement('tr');
    // קבלת שם החשבון מ-trading_account_id
    const accountName = getAccountNameById(cashFlow.trading_account_id) || `חשבון ${cashFlow.trading_account_id}`;

    // הצגת רק סמל המטבע
    const currencyDisplay = cashFlow.currency_symbol || '$';

    // קבלת סוג עם צבע
    const typeDisplay = getCashFlowTypeWithColor(cashFlow.type);

    // עיצוב סכום עם יישור נכון וצביעה
    // שימוש ב-FieldRendererService לעיצוב שדות
    const typeBadge = window.FieldRendererService ? 
      window.FieldRendererService.renderType(cashFlow.type, 'cash_flow_type') : 
      `<span class="cash-flow-${cashFlow.type.toLowerCase()}">${typeDisplay}</span>`;

    const amountBadge = window.FieldRendererService ? 
      window.FieldRendererService.renderNumericValue(cashFlow.amount, ' $', true) : 
      `<span class="${cashFlow.amount >= 0 ? 'numeric-value-positive' : 'numeric-value-negative'}" style="padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">${formatCashFlowAmount(cashFlow.amount)}</span>`;

    const dateBadge = window.FieldRendererService ? 
      window.FieldRendererService.renderDate(cashFlow.date) : 
      formatDate(cashFlow.date);

    // עיצוב שער עם 2 ספרות אחרי הנקודה
    const rateDisplay = formatUsdRate(cashFlow.usd_rate);

            row.innerHTML = `
            <td class="col-account ticker-cell">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <button class="btn btn-sm btn-outline-info" 
                      onclick="showEntityDetails('cash_flow', ${cashFlow.id})" 
                      title="פרטי תזרים" 
                      style="background-color: white; font-size: 0.8em;">
                        🔗
                    </button>
                    <span class="entity-account-badge" 
                          style="padding: 2px 8px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">
                        ${accountName}
                    </span>
                </div>
            </td>
            <td class="col-type type-cell">${typeBadge}</td>
            <td class="col-amount" style="text-align: left; direction: ltr;">${amountBadge}</td>
            <td class="col-date" style="text-align: center;">${dateBadge}</td>
            <td class="col-description">${cashFlow.description || '-'}</td>
            <td class="col-source">${window.translateCashFlowSource ?
    window.translateCashFlowSource(cashFlow.source) :
    cashFlow.source}</td>
            <td class="col-actions actions-cell actions-3-btn">
                <button class="btn btn-sm btn-outline-info" onclick="window.showLinkedItemsModal && window.showLinkedItemsModal([], 'cash_flow', ${cashFlow.id})" title="פריטים מקושרים">
                    <i class="bi bi-link-45deg"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary" onclick="editCashFlow(${cashFlow.id})" title="עריכה">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-info" onclick="showCashFlowDetails(${cashFlow.id})" title="פרטים">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteCashFlow(${cashFlow.id})" title="מחיקה">
                    <i class="bi bi-trash"></i>
                </button>
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

  window.DataCollectionService.setValue('totalCashFlows', totalCashFlows, 'text');
  window.DataCollectionService.setValue('totalDeposits', formatAmount(totalDeposits), 'text');
  window.DataCollectionService.setValue('totalWithdrawals', formatAmount(totalWithdrawals), 'text');
  window.DataCollectionService.setValue('currentBalance', formatAmount(currentBalance), 'text');
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

  let cssClass = '';
  switch (type) {
  case 'deposit':
    cssClass = 'numeric-value-positive'; // הפקדה - ירוק
    break;
  case 'withdrawal':
    cssClass = 'numeric-value-negative'; // משיכה - אדום
    break;
  case 'dividend':
    cssClass = 'entity-account-badge'; // דיבידנד - צבע חשבון
    break;
  case 'fee':
    cssClass = 'numeric-value-zero'; // עמלה - אפור
    break;
  default:
    cssClass = 'numeric-value-zero';
  }

  return `<span class="${cssClass}" style="padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: 500;"><strong>${typeTranslation}</strong></span>`;
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


// ========================================
// אתחול הדף
// ========================================


/**
 * עדכון אוטומטי של נתוני תזרימי מזומנים
 */
function startAutoRefresh() {
  console.log('🔄 מתחיל עדכון אוטומטי של תזרימי מזומנים...');
  
  // עדכון נתונים כל 30 שניות
  setInterval(async () => {
    try {
      console.log('🔄 עדכון אוטומטי של נתוני תזרימי מזומנים...');
      await loadCashFlows();
      
      // עדכון סטטיסטיקות
      if (typeof updatePageSummaryStats === 'function') {
        updatePageSummaryStats();
      }
      
      console.log('✅ עדכון אוטומטי הושלם בהצלחה');
    } catch (error) {
      console.error('❌ שגיאה בעדכון אוטומטי:', error);
    }
  }, 30000); // 30 שניות
  
  console.log('✅ עדכון אוטומטי הופעל - רענון כל 30 שניות');
}

/**
 * טעינת העדפות משתמש
 */
async function loadUserPreferences() {
  try {
    console.log('🔧 טוען העדפות משתמש...');
    
    // טעינת העדפות רלוונטיות לתזרימי מזומנים
    const preferences = await window.getPreferencesByNames([
      'pagination_size_cash_flows',
      'auto_refresh_interval',
      'default_currency',
      'show_currency_conversion',
      'date_format',
      'number_format',
      'cash_flows_display_mode'
    ]);
    
    // שמירת העדפות בגלובל scope
    window.cashFlowsPreferences = preferences;
    
    console.log('✅ העדפות משתמש נטענו בהצלחה:', preferences);
    return preferences;
  } catch (error) {
    console.warn('⚠️ שגיאה בטעינת העדפות, משתמש בברירות מחדל:', error);
    return null;
  }
}

/**
 * החלת מערכת צבעים דינמית
 */
async function applyDynamicColors() {
  try {
    console.log('🎨 מחיל מערכת צבעים דינמית...');
    
    // טעינת צבעי ישויות מהמערכת הגלובלית
    if (typeof window.loadEntityColors === 'function') {
      const entityColors = await window.loadEntityColors();
      if (entityColors) {
        console.log('✅ צבעי ישויות נטענו:', entityColors);
        
        // החלת צבעי תזרימי מזומנים
        if (entityColors.cash_flow) {
          document.documentElement.style.setProperty('--cash-flow-color', entityColors.cash_flow);
          document.documentElement.style.setProperty('--cash-flow-bg-color', entityColors.cash_flow + '20');
        }
        
        // החלת צבעי חשבונות
        if (entityColors.account) {
          document.documentElement.style.setProperty('--account-color', entityColors.account);
          document.documentElement.style.setProperty('--account-bg-color', entityColors.account + '20');
        }
        
        // החלת צבעי מטבעות
        if (entityColors.currency) {
          document.documentElement.style.setProperty('--currency-color', entityColors.currency);
          document.documentElement.style.setProperty('--currency-bg-color', entityColors.currency + '20');
        }
      }
    }
    
    // טעינת צבעי סטטוס
    if (typeof window.loadStatusColors === 'function') {
      const statusColors = await window.loadStatusColors();
      if (statusColors) {
        console.log('✅ צבעי סטטוס נטענו:', statusColors);
        
        // החלת צבעי סטטוס לתזרימי מזומנים
        if (statusColors.income) {
          document.documentElement.style.setProperty('--income-color', statusColors.income);
          document.documentElement.style.setProperty('--income-bg-color', statusColors.income + '20');
        }
        
        if (statusColors.expense) {
          document.documentElement.style.setProperty('--expense-color', statusColors.expense);
          document.documentElement.style.setProperty('--expense-bg-color', statusColors.expense + '20');
        }
        
        if (statusColors.transfer) {
          document.documentElement.style.setProperty('--transfer-color', statusColors.transfer);
          document.documentElement.style.setProperty('--transfer-bg-color', statusColors.transfer + '20');
        }
      }
    }
    
    // החלת ערכת צבעים כללית
    if (typeof window.applyColorScheme === 'function') {
      await window.applyColorScheme();
    }
    
    console.log('✅ מערכת צבעים דינמית הוחלה בהצלחה');
  } catch (error) {
    console.error('❌ שגיאה בהחלת מערכת צבעים דינמית:', error);
  }
}

/**
 * החלת העדפות משתמש על העמוד
 */
function applyUserPreferences(preferences) {
  try {
    if (!preferences) return;
    
    console.log('🎨 מחיל העדפות משתמש על העמוד...');
    
    // החלת העדפת גודל עמוד (רק תצוגה, לא שמירה)
    const paginationSize = preferences.pagination_size_cash_flows || 25;
    // עדכון תצוגת הטבלה לפי העדפת המשתמש
    if (window.cashFlowsTable && typeof window.cashFlowsTable.pageSize === 'function') {
      window.cashFlowsTable.pageSize(paginationSize);
    }
    
    // החלת העדפת מטבע ברירת מחדל
    const defaultCurrency = preferences.default_currency || 'USD';
    if (document.getElementById('currency')) {
      document.getElementById('currency').value = defaultCurrency;
    }
    
    // החלת העדפת תצוגת המרת מטבע
    const showConversion = preferences.show_currency_conversion !== false;
    const conversionElements = document.querySelectorAll('.currency-conversion');
    conversionElements.forEach(el => {
      el.style.display = showConversion ? 'block' : 'none';
    });
    
    // החלת העדפת פורמט תאריך
    const dateFormat = preferences.date_format || 'DD/MM/YYYY';
    window.cashFlowsDateFormat = dateFormat;
    
    // החלת העדפת פורמט מספרים
    const numberFormat = preferences.number_format || 'en-US';
    window.cashFlowsNumberFormat = numberFormat;
    
    // החלת העדפת מצב תצוגה
    const displayMode = preferences.cash_flows_display_mode || 'table';
    if (displayMode === 'cards') {
      // הוספת קלאס לתצוגת כרטיסים
      document.body.classList.add('cash-flows-cards-mode');
    }
    
    console.log('✅ העדפות משתמש הוחלו בהצלחה');
  } catch (error) {
    console.error('❌ שגיאה בהחלת העדפות משתמש:', error);
  }
}

/**
 * אתחול הדף
 */
async function initializeCashFlowsPage() {
  console.log('🚀 מאתחל עמוד תזרימי מזומנים...');

  try {
    // טעינת העדפות משתמש
    const preferences = await loadUserPreferences();
    
    // החלת העדפות על העמוד
    applyUserPreferences(preferences);
    
    // החלת מערכת צבעים דינמית
    await applyDynamicColors();

    // טעינת מטבעות מהשרת
    await loadCurrenciesFromServer();

    // טעינת נתונים
    await loadCashFlows();

    // שחזור מצב הסגירה
    if (typeof window.restoreSectionStates === 'function') {
      window.restoreSectionStates();
    }

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
    
    // ❌ ביטול רענון אוטומטי - לא עובד כך בשאר עמודי המערכת
    // startAutoRefresh();
    
    console.log('✅ עמוד תזרימי מזומנים אותחל בהצלחה');
  } catch (error) {
    console.error('❌ שגיאה באתחול עמוד תזרימי מזומנים:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה באתחול העמוד', error.message);
    }
  }
}

// הפעלת אתחול כשהדף נטען - המערכת החדשה תטפל בזה
// document.addEventListener('DOMContentLoaded', function () {
//   initializeCashFlowsPage();
// });

// ייצוא פונקציות גלובליות
window.initializeCashFlowsPage = initializeCashFlowsPage;

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
// window.sortTable export removed - using global version from tables.js

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
  if (addCashFlowForm) {
    addCashFlowForm.reset();
  }

  // ניקוי וולידציה
  if (window.clearValidation) {
    window.clearValidation('addCashFlowForm');
  }

  // הגדרת תאריך ברירת מחדל להיום
  const today = new Date().toISOString().split('T')[0];
  if (cashFlowDateInput) {
    cashFlowDateInput.value = today;
  }

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
    if (addCashFlowModal) {
      addCashFlowModal.show();
    }
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
    // מילוי הטופס אחרי שהרשימות נטענו - באמצעות DataCollectionService
    window.DataCollectionService.setFormData({
      id: { id: 'editCashFlowId', type: 'int' },
      account_id: { id: 'editCashFlowAccountId', type: 'int' },
      type: { id: 'editCashFlowType', type: 'text' },
      amount: { id: 'editCashFlowAmount', type: 'number' },
      currency_id: { id: 'editCashFlowCurrencyId', type: 'int' },
      date: { id: 'editCashFlowDate', type: 'dateOnly' },
      description: { id: 'editCashFlowDescription', type: 'text' },
      source: { id: 'editCashFlowSource', type: 'text' },
      external_id: { id: 'editCashFlowExternalId', type: 'text' }
    }, {
      id: cashFlow.id,
      account_id: cashFlow.account_id,
      type: cashFlow.type,
      amount: cashFlow.amount,
      currency_id: cashFlow.currency_id || '',
      date: cashFlow.date,
      description: cashFlow.description || '',
      source: cashFlow.source || 'manual',
      external_id: cashFlow.external_id || '0'
    });

    // אתחול שדה מזהה חיצוני
    initializeExternalIdFields();

    // הוספת event listeners לוולידציה מיידית
    setupValidationListeners();

    // הצגת המודל
    if (editCashFlowModal) {
      editCashFlowModal.show();
    }
  } catch (error) {
    handleDataLoadError(error, 'טעינת נתונים לעריכה');
    window.showErrorNotification('שגיאה', 'שגיאה בטעינת נתונים לעריכה');
  }
}

// עדכון פונקציית saveCashFlow
async function saveCashFlow() {
  try {
    // ולידציה של הטופס
    if (!validateCashFlowForm()) {
      return;
    }

    // איסוף נתונים מהטופס באמצעות DataCollectionService
    const formData = window.DataCollectionService.collectFormData({
      trading_account_id: { id: 'cashFlowAccountId', type: 'int' },
      type: { id: 'cashFlowType', type: 'text' },
      amount: { id: 'cashFlowAmount', type: 'number' },
      currency_id: { id: 'cashFlowCurrencyId', type: 'int', default: 1 },
      usd_rate: { id: 'cashFlowUsdRate', type: 'number', default: 1.000000 },
      date: { id: 'cashFlowDate', type: 'dateOnly' },
      description: { id: 'cashFlowDescription', type: 'text', default: '' },
      source: { id: 'cashFlowSource', type: 'text', default: 'manual' },
      external_id: { id: 'cashFlowExternalId', type: 'text', default: '0' }
    });

    const response = await fetch('http://127.0.0.1:8080/api/cash_flows/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    // טיפול בתגובה באמצעות CRUDResponseHandler עם customValidationParser
    await window.CRUDResponseHandler.handleSaveResponse(response, {
      modalId: 'addCashFlowModal',
      successMessage: 'תזרים המזומנים נשמר בהצלחה',
      customValidationParser: (errorMessage) => {
        if (!errorMessage.includes('validation failed')) return null;
        
        const validationErrors = errorMessage.replace('Cash flow validation failed: ', '').split('; ');
        return validationErrors.map(error => {
          if (error.includes("Field 'type' has invalid value")) {
            return { fieldId: 'cashFlowType', message: 'סוג תזרים לא תקין - יש לבחור ערך מהרשימה' };
          } else if (error.includes("Field 'source' has invalid value")) {
            return { fieldId: 'cashFlowSource', message: 'מקור לא תקין - יש לבחור ערך מהרשימה' };
          } else if (error.includes("Field 'amount' is out of range")) {
            return { fieldId: 'cashFlowAmount', message: 'סכום חייב להיות שונה מ-0' };
          } else if (error.includes("Field 'usd_rate' is out of range")) {
            return { fieldId: 'cashFlowUsdRate', message: 'שער דולר חייב להיות חיובי' };
          } else if (error.includes("Field 'account_id' references non-existent record")) {
            return { fieldId: 'cashFlowAccountId', message: 'חשבון לא קיים במערכת' };
          }
          return null;
        }).filter(Boolean);
      },
      reloadFn: async () => {
        // ניקוי מטמון
        if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
          await window.UnifiedCacheManager.remove('cash_flows');
          console.log('✅ מטמון cash_flows נוקה אחרי הוספה');
        }
        // ניקוי global data
        if (window.cashFlowsData) {
          window.cashFlowsData = null;
          console.log('✅ Global cashFlowsData נוקה');
        }
        // המתנה קצרה לוידוא ניקוי מטמון
        await new Promise(resolve => setTimeout(resolve, 100));
        // טעינה מחדש
        await loadCashFlows();
      },
      entityName: 'תזרים מזומנים'
    });

  } catch (error) {
    console.error('Error saving cash flow:', error);
    
    // שגיאת JavaScript או Network - זו שגיאת מערכת אמיתית
    // השתמש ב-showErrorNotification עם מודל מפורט
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בשמירת תזרים מזומנים', error.message || 'שגיאה לא ידועה');
    }
  }
}

// עדכון פונקציית updateCashFlow
async function updateCashFlow() {
  try {
    // בדיקת תקינות מקיפה
    if (window.validateForm) {
      if (!window.validateForm('editCashFlowForm')) {
        return;
      }
    }

    // איסוף נתונים מהטופס באמצעות DataCollectionService
    const id = window.DataCollectionService.getValue('editCashFlowId', 'int');
    const formData = window.DataCollectionService.collectFormData({
      trading_account_id: { id: 'editCashFlowAccountId', type: 'int' },
      type: { id: 'editCashFlowType', type: 'text' },
      amount: { id: 'editCashFlowAmount', type: 'number' },
      currency_id: { id: 'editCashFlowCurrencyId', type: 'int', default: 1 },
      usd_rate: { id: 'editCashFlowUsdRate', type: 'number', default: 1.000000 },
      date: { id: 'editCashFlowDate', type: 'dateOnly' },
      description: { id: 'editCashFlowDescription', type: 'text', default: '' },
      source: { id: 'editCashFlowSource', type: 'text', default: 'manual' },
      external_id: { id: 'editCashFlowExternalId', type: 'text', default: '0' }
    });

    const response = await fetch(`http://127.0.0.1:8080/api/cash_flows/${id}`, {
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
      if (editCashFlowModal) {
        editCashFlowModal.hide();
      }

      // ניקוי מטמון cash_flows
      if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
        await window.UnifiedCacheManager.remove('cash_flows');
        console.log('✅ מטמון cash_flows נוקה אחרי עדכון');
      }

      // ניקוי global data
      if (window.cashFlowsData) {
        window.cashFlowsData = null;
        console.log('✅ Global cashFlowsData נוקה');
      }

      // המתנה קצרה לוידוא ניקוי מטמון
      await new Promise(resolve => setTimeout(resolve, 100));

      // טעינה מחדש של הנתונים
      await loadCashFlows();

      // הצגת הודעת הצלחה אחרי הטעינה
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', 'תזרים המזומנים נעדכן בהצלחה', 4000, 'business');
      }
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

            // סימון השדה הבעייתי
            if (fieldName && typeof window.showFieldError === 'function') {
              window.showFieldError(fieldName, fieldError);
            }
          });
          
          // הצגת התראה פשוטה לכל השגיאות
          if (typeof window.showSimpleErrorNotification === 'function') {
            window.showSimpleErrorNotification('שגיאת ולידציה', 'נא לתקן את השדות המסומנים');
          }
        } else {
          // שגיאה כללית מהשרת
          if (typeof window.showSimpleErrorNotification === 'function') {
            window.showSimpleErrorNotification('שגיאה בעדכון', serverMessage);
          }
        }
      } else {
        // הצגת הודעת שגיאה כללית
        if (typeof window.showSimpleErrorNotification === 'function') {
          window.showSimpleErrorNotification('שגיאה בעדכון', 'שגיאה בעדכון תזרים מזומנים - בדוק את הנתונים שהוזנו');
        }
      }
    }
  } catch (error) {
    handleSaveError(error, 'עדכון תזרים מזומנים');
  }
}


// ===== MISSING FUNCTIONS FOR ONCLICK ATTRIBUTES =====

// Toggle functions

// Cash Flow CRUD functions
// פונקציית עריכה - קוראת ל-showEditCashFlowModal
function editCashFlow(id) {
    if (typeof showEditCashFlowModal === 'function') {
        showEditCashFlowModal(id);
    } else {
        console.warn('showEditCashFlowModal function not found');
    }
}

// ❌ הוסר - גרם ללולאה אינסופית
// הפונקציה האמיתית נמצאת בשורה 568

/**
 * הצגת פרטי תזרים מזומנים
 */
function showCashFlowDetails(cashFlowId) {
    // חיפוש התזרים בנתונים
    const cashFlow = window.cashFlowsData ? window.cashFlowsData.find(cf => cf.id === cashFlowId) : null;
    
    if (!cashFlow) {
        console.error(`❌ Cash Flow with ID ${cashFlowId} not found`);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', `תזרים מזומנים עם ID ${cashFlowId} לא נמצא`);
        }
        return;
    }

    // שימוש במערכת הצגת פרטים כללית אם זמינה
    if (typeof window.showEntityDetails === 'function') {
        window.showEntityDetails('cash_flow', cashFlowId, { mode: 'view' });
    } else {
        // הצגה פשוטה
        const details = `פרטי תזרים מזומנים:
ID: ${cashFlow.id}
חשבון: ${cashFlow.trading_account_id}
סוג: ${cashFlow.type}
סכום: ${cashFlow.amount}
תאריך: ${cashFlow.date}
תיאור: ${cashFlow.description || 'אין תיאור'}
מקור: ${cashFlow.source || 'לא מוגדר'}
מטבע: ${cashFlow.currency_id}
שער USD: ${cashFlow.usd_rate || 'לא מוגדר'}`;
        alert(details);
    }
}

// ===== GLOBAL EXPORTS =====
// Export functions to global scope for onclick attributes
window.manageExternalIdField = manageExternalIdField;
window.setupSourceFieldListeners = setupSourceFieldListeners;
window.initializeExternalIdFields = initializeExternalIdFields;
window.deleteCashFlow = deleteCashFlow;
window.showAddCashFlowModal = showAddCashFlowModal;
window.showEditCashFlowModal = showEditCashFlowModal;
// window.toggleSection removed - using global version from ui-utils.js
window.editCashFlow = editCashFlow;
window.updateCashFlowsTable = updateCashFlowsTable;
window.saveCashFlow = saveCashFlow;
window.updateCashFlow = updateCashFlow;

// window.showLinkedItemsWarning = showLinkedItemsWarning; // הוסר - הוחלף ב-showLinkedItemsModal
// window.checkLinkedItemsForCashFlow = checkLinkedItemsForCashFlow; // הוסר - לא נחוץ יותר

/**
 * Generate detailed log for Cash Flows
 */
function generateDetailedLog() {
    const timestamp = new Date().toLocaleString('he-IL');
    const log = [];

    log.push('=== לוג מפורט - תזרימי מזומנים ===');
    log.push(`זמן יצירה: ${timestamp}`);
    log.push(`עמוד: ${window.location.href}`);
    log.push('');

    // 1. מצב כללי של העמוד
    log.push('--- מצב כללי של העמוד ---');
    const sections = document.querySelectorAll('.content-section, .section');
    sections.forEach((section, index) => {
        const header = section.querySelector('.section-header, h2, h3');
        const body = section.querySelector('.section-body, .card-body');
        const isOpen = body && body.style.display !== 'none' && !section.classList.contains('collapsed');
        const title = header ? header.textContent.trim() : `סקשן ${index + 1}`;
        log.push(`  ${index + 1}. "${title}": ${isOpen ? 'פתוח' : 'סגור'}`);
    });

    // 2. סטטיסטיקות תזרימי מזומנים
    log.push('');
    log.push('--- סטטיסטיקות תזרימי מזומנים ---');
    const cashFlowStats = [
        'totalCashFlows', 'totalDeposits', 'totalWithdrawals', 
        'newAlerts', 'currentBalance'
    ];
    
    cashFlowStats.forEach(statId => {
        const element = document.getElementById(statId);
        if (element) {
            const value = element.textContent.trim();
            const visible = element.offsetParent !== null ? 'נראה' : 'לא נראה';
            log.push(`${statId}: ${value} (${visible})`);
        }
    });

    // 3. טבלת תזרימי מזומנים
    log.push('');
    log.push('--- טבלת תזרימי מזומנים ---');
    const table = document.querySelector('#cashFlowsTable, .table, table');
    if (table) {
        const rows = table.querySelectorAll('tbody tr');
        log.push(`מספר שורות: ${rows.length}`);
        rows.forEach((row, index) => {
            const cells = row.querySelectorAll('td');
            const rowData = Array.from(cells).map(cell => cell.textContent.trim()).join(' | ');
            log.push(`  ${index + 1}. ${rowData}`);
        });
    } else {
        log.push('טבלה לא נמצאה');
    }

    // 4. כפתורים וקונטרולים
    log.push('');
    log.push('--- כפתורים וקונטרולים ---');
    const buttonIds = [
        'addCashFlowBtn', 'editCashFlowBtn', 'deleteCashFlowBtn', 'filterBtn',
        'exportBtn', 'refreshBtn', 'searchBtn'
    ];
    
    buttonIds.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            const visible = btn.offsetParent !== null ? 'נראה' : 'לא נראה';
            const disabled = btn.disabled ? 'מבוטל' : 'פעיל';
            const text = btn.textContent.trim() || btn.value || 'ללא טקסט';
            log.push(`${btnId}: ${visible} - ${disabled} - "${text}"`);
        }
    });

    // 5. פילטרים וחיפוש
    log.push('');
    log.push('--- פילטרים וחיפוש ---');
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="חיפוש"], input[placeholder*="search"]');
    if (searchInput) {
        const value = searchInput.value || 'ריק';
        const visible = searchInput.offsetParent !== null ? 'נראה' : 'לא נראה';
        log.push(`חיפוש: "${value}" (${visible})`);
    }

    const filters = document.querySelectorAll('.filter, .form-select, select');
    filters.forEach((filter, index) => {
        const value = filter.value || 'לא נבחר';
        const visible = filter.offsetParent !== null ? 'נראה' : 'לא נראה';
        log.push(`פילטר ${index + 1}: "${value}" (${visible})`);
    });

    // 6. סטטיסטיקות תזרימים
    log.push('');
    log.push('--- סטטיסטיקות תזרימים ---');
    const stats = ['totalInflow', 'totalOutflow', 'netFlow', 'balance'];
    stats.forEach(statId => {
        const element = document.getElementById(statId);
        if (element) {
            const value = element.textContent.trim();
            const visible = element.offsetParent !== null ? 'נראה' : 'לא נראה';
            log.push(`${statId}: ${value} (${visible})`);
        }
    });

    // 7. מידע טכני
    log.push('');
    log.push('--- מידע טכני ---');
    log.push(`זמן יצירת הלוג: ${timestamp}`);
    log.push(`גרסת דפדפן: ${navigator.userAgent}`);
    log.push(`רזולוציה מסך: ${screen.width}x${screen.height}`);
    log.push(`גודל חלון: ${window.innerWidth}x${window.innerHeight}`);
    
    if (performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        log.push(`זמן טעינת עמוד: ${loadTime}ms`);
    }
    
    if (navigator.deviceMemory) {
        log.push(`זיכרון זמין: ${navigator.deviceMemory}GB`);
    }
    
    log.push(`שפת דפדפן: ${navigator.language}`);
    log.push(`פלטפורמה: ${navigator.platform}`);

    // 8. מצב נתונים מפורט
    log.push('');
    log.push('--- מצב נתונים מפורט ---');
    if (window.cashFlowsData && window.cashFlowsData.length > 0) {
        log.push(`מספר תזרימי מזומנים: ${window.cashFlowsData.length}`);
        
        // ניתוח לפי סוג
        const incomeFlows = window.cashFlowsData.filter(cf => cf.type === 'income');
        const expenseFlows = window.cashFlowsData.filter(cf => cf.type === 'expense');
        const transferFlows = window.cashFlowsData.filter(cf => cf.type === 'transfer');
        
        log.push(`הכנסות: ${incomeFlows.length} תזרימים`);
        log.push(`הוצאות: ${expenseFlows.length} תזרימים`);
        log.push(`העברות: ${transferFlows.length} תזרימים`);
        
        // חישוב סכומים מפורט
        const totalIncome = incomeFlows.reduce((sum, cf) => sum + (cf.amount || 0), 0);
        const totalExpense = expenseFlows.reduce((sum, cf) => sum + (cf.amount || 0), 0);
        const totalTransfer = transferFlows.reduce((sum, cf) => sum + (cf.amount || 0), 0);
        
        log.push(`סה"כ הכנסות: ${totalIncome.toLocaleString()}`);
        log.push(`סה"כ הוצאות: ${totalExpense.toLocaleString()}`);
        log.push(`סה"כ העברות: ${totalTransfer.toLocaleString()}`);
        log.push(`יתרה כוללת: ${(totalIncome - totalExpense).toLocaleString()}`);
        
        // תזרים אחרון
        const lastFlow = window.cashFlowsData[0];
        if (lastFlow) {
            log.push(`תזרים אחרון: ${lastFlow.date} - ${lastFlow.type} - ${lastFlow.amount}`);
        }
    } else {
        log.push('❌ אין נתוני תזרימי מזומנים');
    }

    // 9. מצב מערכות גלובליות
    log.push('');
    log.push('--- מצב מערכות גלובליות ---');
    const globalSystems = [
        'showSuccessNotification',
        'showErrorNotification',
        'restoreSectionStates',
        'UnifiedCacheManager',
        'getPreference',
        'loadEntityColors',
        'applyColorScheme'
    ];
    
    globalSystems.forEach(systemName => {
        const exists = typeof window[systemName] === 'function' || typeof window[systemName] === 'object';
        log.push(`${systemName}: ${exists ? '✅ זמין' : '❌ לא זמין'}`);
    });

    // 10. מצב העדפות
    log.push('');
    log.push('--- מצב העדפות ---');
    if (window.cashFlowsPreferences) {
        log.push('העדפות נטענו: ✅');
        Object.keys(window.cashFlowsPreferences).forEach(key => {
            const value = window.cashFlowsPreferences[key];
            log.push(`  ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
        });
    } else {
        log.push('❌ העדפות לא נטענו');
    }

    // 11. מצב צבעים דינמיים
    log.push('');
    log.push('--- מצב צבעים דינמיים ---');
    const colorVars = [
        '--cash-flow-color',
        '--cash-flow-bg-color',
        '--account-color',
        '--income-color',
        '--expense-color'
    ];
    
    colorVars.forEach(colorVar => {
        const value = getComputedStyle(document.documentElement).getPropertyValue(colorVar);
        log.push(`${colorVar}: ${value || 'לא מוגדר'}`);
    });

    // 12. שגיאות והערות מהקונסולה
    log.push('');
    log.push('--- שגיאות והערות מהקונסולה ---');
    log.push('⚠️ חשוב: הלוג המפורט חייב לכלול שגיאות קונסולה לאבחון בעיות');
    log.push('📋 הוראות: פתח את Developer Tools (F12) > Console');
    log.push('📋 העתק את כל השגיאות וההערות מהקונסולה');
    log.push('📋 הוסף אותן ללוג המפורט לפני שליחה');
    log.push('');
    log.push('📋 מידע נוסף נדרש:');
    log.push('- תיאור הבעיה המדויק');
    log.push('- צעדים לשחזור הבעיה');
    log.push('- ציפיות vs מציאות');
    log.push('- צילום מסך אם רלוונטי');

    log.push('');
    log.push('=== סוף לוג מפורט ===');
    return log.join('\n');
}

// Local copyDetailedLog function for cash_flows page
async function copyDetailedLog() {
    try {
        const detailedLog = await generateDetailedLog();
        if (detailedLog) {
            await navigator.clipboard.writeText(detailedLog);
            
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('לוג מפורט הועתק ללוח', 'הלוג מכיל את כל מה שרואה המשתמש בעמוד');
            } else if (typeof window.showNotification === 'function') {
                window.showNotification('לוג מפורט הועתק ללוח', 'success');
            } else {
                alert('לוג מפורט הועתק ללוח!');
            }
        }
    } catch (error) {
        console.error('שגיאה בהעתקת הלוג המפורט:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בהעתקת הלוג', error.message);
        } else {
            alert('שגיאה בהעתקת הלוג: ' + error.message);
        }
    }
}

// ===== מערכת טיפול בשגיאות מתקדמת =====

/**
 * טיפול מתקדם בשגיאות API
 */
function handleApiError(context, error, fallbackData = null) {
  console.error(`❌ API Error in ${context}:`, error);
  
  // בדיקה אם זו שגיאת ולידציה (400) או שגיאת מערכת אחרת
  let isValidationError = false;
  let errorMessage = `שגיאה ב-${context}`;
  let errorDetails = '';
  
  if (typeof error === 'string') {
    errorDetails = error;
    // בדיקה אם זו שגיאת ולידציה
    if (error.includes('validation') || error.includes('Invalid') || error.includes('required')) {
      isValidationError = true;
    }
  } else if (error && error.message) {
    errorDetails = error.message;
    // בדיקה אם זו שגיאת ולידציה
    if (error.message.includes('validation') || error.message.includes('Invalid') || error.message.includes('required')) {
      isValidationError = true;
    }
  } else if (error && error.status) {
    errorDetails = `HTTP ${error.status}`;
    // HTTP 400 = Bad Request (בדר"כ שגיאת ולידציה)
    if (error.status === 400) {
      isValidationError = true;
    }
  } else {
    errorDetails = 'שגיאה לא ידועה';
  }
  
  // הצגת הודעת שגיאה למשתמש לפי הסוג
  if (isValidationError) {
    // שגיאת ולידציה - התראה פשוטה
    if (typeof window.showSimpleErrorNotification === 'function') {
      window.showSimpleErrorNotification(errorMessage, errorDetails);
    }
  } else {
    // שגיאת מערכת - מודל מפורט
  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification(errorMessage, errorDetails);
    }
  }
  
  // שימוש בנתוני fallback אם קיימים
  if (fallbackData) {
    console.log(`🔄 משתמש בנתוני fallback עבור ${context}`);
    return fallbackData;
  }
  
  return null;
}

/**
 * טיפול מתקדם בשגיאות טעינת נתונים
 */
function handleDataLoadError(error, context, retryCount = 0) {
  console.error(`❌ Data Load Error in ${context}:`, error);
  
  // הודעת שגיאה מותאמת לפי הקשר
  let errorMessage = `שגיאה בטעינת ${context}`;
  let errorDetails = '';
  
  if (error && error.message) {
    errorDetails = error.message;
  } else if (typeof error === 'string') {
    errorDetails = error;
  } else {
    errorDetails = 'שגיאה לא ידועה';
  }
  
  // הצגת הודעת שגיאה למשתמש
  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification(errorMessage, errorDetails);
  } else if (typeof window.showNotification === 'function') {
    window.showNotification(errorMessage, 'error');
  } else {
    alert(`${errorMessage}: ${errorDetails}`);
  }
  
  // ניסיון חוזר אוטומטי (עד 3 פעמים)
  if (retryCount < 3) {
    console.log(`🔄 מנסה שוב (${retryCount + 1}/3) עבור ${context}`);
    setTimeout(() => {
      // קריאה חוזרת לפונקציה המקורית
      if (context.includes('תזרימי מזומנים')) {
        loadCashFlows();
      } else if (context.includes('מטבעות')) {
        loadCurrenciesFromServer();
      } else if (context.includes('חשבונות')) {
        loadAccountsForCashFlow();
      }
    }, 2000 * (retryCount + 1)); // השהיה הולכת וגדלה
  }
}

/**
 * טיפול מתקדם בשגיאות אלמנטים לא נמצאו
 */
function handleElementNotFound(context, elementId) {
  console.error(`❌ Element Not Found in ${context}:`, elementId);
  
  // הודעת שגיאה מפורטת
  const errorMessage = `אלמנט לא נמצא`;
  const errorDetails = `האלמנט ${elementId} לא נמצא ב-${context}`;
  
  // הצגת הודעת שגיאה למשתמש
  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification(errorMessage, errorDetails);
  } else if (typeof window.showNotification === 'function') {
    window.showNotification(errorMessage, 'error');
  } else {
    alert(`${errorMessage}: ${errorDetails}`);
  }
}

/**
 * טיפול מתקדם בשגיאות validation
 */
function handleValidationError(fieldId, message, context = '') {
  console.error(`❌ Validation Error in ${context}:`, fieldId, message);
  
  // הצגת שגיאה בשדה
  if (typeof window.showValidationWarning === 'function') {
    window.showValidationWarning(fieldId, message);
  } else if (typeof window.showFieldError === 'function') {
    window.showFieldError(fieldId, message);
  } else {
    // fallback פשוט
    const field = document.getElementById(fieldId);
    if (field) {
      field.style.borderColor = '#dc3545';
      field.title = message;
    }
  }
}

/**
 * טיפול מתקדם בשגיאות רשת
 */
function handleNetworkError(error, context) {
  console.error(`❌ Network Error in ${context}:`, error);
  
  // זיהוי סוג השגיאה
  let errorMessage = 'שגיאת רשת';
  let errorDetails = '';
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    errorMessage = 'שגיאת חיבור לשרת';
    errorDetails = 'לא ניתן להתחבר לשרת. אנא בדוק את החיבור לאינטרנט.';
  } else if (error.name === 'AbortError') {
    errorMessage = 'בקשה בוטלה';
    errorDetails = 'הבקשה בוטלה על ידי המשתמש או השרת.';
  } else if (error.status === 500) {
    errorMessage = 'שגיאת שרת';
    errorDetails = 'השרת חווה שגיאה פנימית. אנא נסה שוב מאוחר יותר.';
  } else if (error.status === 404) {
    errorMessage = 'משאב לא נמצא';
    errorDetails = 'המשאב המבוקש לא נמצא בשרת.';
  } else if (error.status === 403) {
    errorMessage = 'אין הרשאה';
    errorDetails = 'אין לך הרשאה לגשת למשאב זה.';
  } else {
    errorDetails = error.message || 'שגיאה לא ידועה';
  }
  
  // הצגת הודעת שגיאה למשתמש
  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification(errorMessage, errorDetails);
  } else if (typeof window.showNotification === 'function') {
    window.showNotification(errorMessage, 'error');
  } else {
    alert(`${errorMessage}: ${errorDetails}`);
  }
}

/**
 * טיפול מתקדם בשגיאות כללי
 */
function handleGeneralError(error, context, fallbackAction = null) {
  console.error(`❌ General Error in ${context}:`, error);
  
  // הודעת שגיאה כללית
  const errorMessage = `שגיאה ב-${context}`;
  const errorDetails = error.message || error.toString() || 'שגיאה לא ידועה';
  
  // הצגת הודעת שגיאה למשתמש
  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification(errorMessage, errorDetails);
  } else if (typeof window.showNotification === 'function') {
    window.showNotification(errorMessage, 'error');
  } else {
    alert(`${errorMessage}: ${errorDetails}`);
  }
  
  // ביצוע פעולת fallback אם קיימת
  if (fallbackAction && typeof fallbackAction === 'function') {
    try {
      fallbackAction();
    } catch (fallbackError) {
      console.error('❌ Fallback action failed:', fallbackError);
    }
  }
}

// ===== ייצוא פונקציות לגלובל scope =====
// הוספת פונקציות חשובות ל-window object כדי שיהיו זמינות גלובלית

// פונקציות עיקריות
window.loadCashFlowsData = loadCashFlows;
window.calculateBalance = calculateBalance;
window.toggleCashFlowsSection = toggleCashFlowsSection;
window.restoreCashFlowsSectionState = restoreCashFlowsSectionState;
window.loadCashFlows = loadCashFlows;

// פונקציות טופס
window.validateCashFlowForm = validateCashFlowForm;
window.clearValidationErrors = clearValidationErrors;
window.validateEditCashFlowForm = validateEditCashFlowForm;
window.showEditFieldError = showEditFieldError;
window.clearEditValidationErrors = clearEditValidationErrors;

// פונקציות CRUD - כבר יוצאו למעלה

// פונקציות טעינה
window.loadCurrenciesFromServer = loadCurrenciesFromServer;
window.loadAccountsForCashFlow = loadAccountsForCashFlow;
window.loadAccountsForEditCashFlow = loadAccountsForEditCashFlow;
window.loadCurrenciesForCashFlow = loadCurrenciesForCashFlow;
window.loadCurrenciesForEditCashFlow = loadCurrenciesForEditCashFlow;

// פונקציות תצוגה
window.renderCashFlowsTable = renderCashFlowsTable;
window.updatePageSummaryStats = updatePageSummaryStats;
window.updateCashFlowsTable = updateCashFlowsTable;

// פונקציות עזר
window.formatAmount = formatAmount;
window.getCashFlowTypeWithColor = getCashFlowTypeWithColor;
window.getCashFlowTypeText = getCashFlowTypeText;
window.formatCashFlowAmount = formatCashFlowAmount;
window.formatUsdRate = formatUsdRate;

// פונקציות מודלים
window.showAddCashFlowModal = showAddCashFlowModal;
window.showEditCashFlowModal = showEditCashFlowModal;
window.confirmDeleteCashFlow = confirmDeleteCashFlow;

// פונקציות לוג וניפוי שגיאות
window.generateDetailedLog = generateDetailedLog;
window.copyDetailedLog = copyDetailedLog;

// פונקציות טיפול בשגיאות מתקדמות
window.handleApiError = handleApiError;
window.handleDataLoadError = handleDataLoadError;
window.handleElementNotFound = handleElementNotFound;
window.handleValidationError = handleValidationError;
window.handleNetworkError = handleNetworkError;
window.handleGeneralError = handleGeneralError;

// פונקציות אתחול
window.initializeCashFlowsPage = initializeCashFlowsPage;
window.restoreSortState = restoreSortState;
window.startAutoRefresh = startAutoRefresh;
window.loadUserPreferences = loadUserPreferences;
window.applyUserPreferences = applyUserPreferences;
window.applyDynamicColors = applyDynamicColors;

// פונקציות אימות
window.validateField = validateField;
window.setupValidationListeners = setupValidationListeners;
window.setupSourceFieldListeners = setupSourceFieldListeners;
window.initializeExternalIdFields = initializeExternalIdFields;
window.manageExternalIdField = manageExternalIdField;

console.log('✅ Cash Flows: All functions exported to global scope');
