// ===== קובץ JavaScript לדף תזרימי מזומנים =====

/**
 * טעינת נתוני תזרימי מזומנים
 * טוען את כל נתוני התזרימים מהשרת
 */
function loadCashFlowsData() {
  try {
    console.log('📊 טוען נתוני תזרימי מזומנים...');
    
    // הצגת אינדיקטור טעינה
    if (typeof window.showNotification === 'function') {
      window.showInfoNotification('טוען נתוני תזרימי מזומנים...');
    }
    
    // שליחה לשרת
    fetch('/api/cash_flows/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('שגיאה בטעינת נתוני תזרימי מזומנים');
      }
      return response.json();
    })
    .then(response => {
      console.log('✅ נתוני תזרימי מזומנים נטענו:', response);
      
      // הנתונים מגיעים במבנה {data: [...]}
      const data = response.data || response;
      
      // עדכון הנתונים הגלובליים
      window.cashFlowsData = data;
      cashFlowsData = data;
      
      // עדכון הסטטיסטיקות
      updatePageSummaryStats();
      
      // עדכון הטבלה
      updateCashFlowsTable(data);
      
      // הודעת הצלחה
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('נתוני תזרימי מזומנים נטענו בהצלחה', '', 4000, 'business');
      } else if (typeof window.showNotification === 'function') {
        window.showSuccessNotification('נתוני תזרימי מזומנים נטענו בהצלחה', '', 4000, 'business');
      }
    })
    .catch(error => {
      console.error('שגיאה בטעינת נתוני תזרימי מזומנים:', error);
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בטעינת נתוני תזרימי מזומנים', error.message, 6000, 'system');
      } else if (typeof window.showNotification === 'function') {
        window.showErrorNotification('שגיאה בטעינת נתוני תזרימי מזומנים', '', 6000, 'system');
      }
    });
    
  } catch (error) {
    console.error('שגיאה בטעינת נתוני תזרימי מזומנים:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בטעינת נתוני תזרימי מזומנים', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה בטעינת נתוני תזרימי מזומנים');
    }
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
        window.showWarningNotification('אין נתוני תזרימי מזומנים', 'לא ניתן לחשב יתרה ללא נתונים', 5000, 'ui');
      } else if (typeof window.showNotification === 'function') {
        window.showWarningNotification('אין נתוני תזרימי מזומנים', '', 5000, 'ui');
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
let tradingAccountsData = [];

/**
 * קבלת שם חשבון לפי ID
 */
function getAccountNameById(accountId) {
  // בדיקה אם יש cache של HeaderSystem
  if (window.HeaderSystem && window.HeaderSystem.accountsCache) {
    const account = window.HeaderSystem.accountsCache.find(acc => acc.id === accountId);
    if (account) return account.name;
  }
  
  // בדיקה אם יש נתונים גלובליים
  if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
    const account = window.trading_accountsData.find(acc => acc.id === accountId);
    if (account) return account.name;
  }
  
  return null;
}

/**
 * טעינת נתוני חשבונות מסחר אם הם לא נטענו
 */
async function ensureTradingAccountsLoaded() {
  // אם יש כבר נתונים, אין צורך לטעון שוב
  if ((window.HeaderSystem && window.HeaderSystem.accountsCache) || 
      (window.trading_accountsData && Array.isArray(window.trading_accountsData))) {
    return;
  }
  
  // טעינת נתונים באמצעות הפונקציה מקובץ השירותים
  if (typeof window.loadTradingAccountsFromServer === 'function') {
    await window.loadTradingAccountsFromServer();
  }
}

// השתמש בפונקציה הכללית מ-translation-utils.js
// הפונקציה colorAmount זמינה גלובלית מ-translation-utils.js

// פונקציות בסיסיות - הוסרו פונקציות לא בשימוש

// פונקציות לפתיחה/סגירה של סקשנים - משתמשות בפונקציות הגלובליות
// הפונקציות הבאות זמינות גלובלית:
// - window.toggleSection()
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

    const response = await fetch('http://127.0.0.1:8080/api/cash_flows/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'success') {
      cashFlowsData = result.data;
      await renderCashFlowsTable();
      updatePageSummaryStats();
      
      // יישום צבעי ישויות על כותרות
      if (window.applyEntityColorsToHeaders) {
        window.applyEntityColorsToHeaders('cash_flow');
      }
    } else {
      handleApiError('שגיאה בטעינת תזרימי מזומנים', result.error);

      // הצגת הודעת שגיאה
      if (window.showInfoNotification) {
        window.showInfoNotification('מידע על הטעינה', 'שגיאה בטעינת תזרימי מזומנים');
      }
    }
  } catch (error) {
    handleApiError(error, 'טעינת תזרימי מזומנים');

    // הצגת הודעת שגיאה
    if (window.showInfoNotification) {
      window.showInfoNotification('מידע על הטעינה', 'שגיאה בטעינת תזרימי מזומנים');
    }
  }
}

/**
 * ולידציה של טופס תזרים מזומנים
 */
function validateCashFlowForm() {
  return window.validateEntityForm('addCashFlowForm', [
    { id: 'cashFlowType', name: 'סוג תזרים' },
    { 
      id: 'cashFlowAmount', 
      name: 'סכום',
      validation: (value) => {
        const amount = parseFloat(value);
        if (isNaN(amount)) return 'יש להזין סכום תקין';
        if (amount === 0) return 'סכום לא יכול להיות 0';
        if (Math.abs(amount) > 10000000) return 'סכום גבוה מדי (מקסימום 10,000,000)';
        return true;
      }
    },
    { 
      id: 'cashFlowDate', 
      name: 'תאריך',
      validation: (value) => {
        if (!value) return 'יש להזין תאריך';
        const date = new Date(value);
        const today = new Date();
        const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
        const minDate = new Date(2000, 0, 1);
        
        if (date > maxDate) return 'תאריך לא יכול להיות יותר משנה קדימה';
        if (date < minDate) return 'תאריך לא יכול להיות לפני שנת 2000';
        return true;
      }
    },
    { id: 'cashFlowAccount', name: 'חשבון מסחר' },
    { id: 'cashFlowCurrency', name: 'מטבע' },
    { id: 'cashFlowSource', name: 'מקור' }
  ]);
}

/**
 * הצגת שגיאת וולידציה לשדה
 * @param {string} fieldId - מזהה השדה
 * @param {string} message - הודעת השגיאה
 */
// ולידציה - משתמש במערכת הכללית window.validateEntityForm

/**
 * ולידציה של טופס עריכת תזרים מזומנים
 */
function validateEditCashFlowForm() {
  return window.validateEntityForm('editCashFlowForm', [
    { id: 'editCashFlowType', name: 'סוג תזרים' },
    { 
      id: 'editCashFlowAmount', 
      name: 'סכום',
      validation: (value) => {
        const amount = parseFloat(value);
        if (isNaN(amount)) return 'יש להזין סכום תקין';
        if (amount === 0) return 'סכום לא יכול להיות 0';
        if (Math.abs(amount) > 10000000) return 'סכום גבוה מדי (מקסימום 10,000,000)';
        return true;
      }
    },
    { 
      id: 'editCashFlowDate', 
      name: 'תאריך',
      validation: (value) => {
        if (!value) return 'יש להזין תאריך';
        const date = new Date(value);
        const today = new Date();
        const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
        const minDate = new Date(2000, 0, 1);
        
        if (date > maxDate) return 'תאריך לא יכול להיות יותר משנה קדימה';
        if (date < minDate) return 'תאריך לא יכול להיות לפני שנת 2000';
        return true;
      }
    },
    { id: 'editCashFlowAccount', name: 'חשבון מסחר' },
    { id: 'editCashFlowCurrency', name: 'מטבע' },
    { id: 'editCashFlowSource', name: 'מקור' }
  ]);
}

// ולידציה - משתמש במערכת הכללית window.validateEntityForm


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
      window.showErrorNotification('שגיאה', 'תזרים המזומנים לא נמצא', 6000, 'system');
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
    const response = await fetch(`/api/cash_flows/${id}`, {
      method: 'DELETE',
    });

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    await CRUDResponseHandler.handleDeleteResponse(response, {
      successMessage: 'תזרים המזומנים נמחק בהצלחה!',
      apiUrl: '/api/cash_flows/',
      entityName: 'תזרים מזומנים'
    });
  } catch (error) {
    CRUDResponseHandler.handleError(error, 'מחיקת תזרים מזומנים');
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
  cashFlowAccount: {
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
  cashFlowCurrency: {
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
  editCashFlowAccount: {
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
  editCashFlowCurrency: {
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
// loadCurrenciesFromServer - using global function from data-utils.js

/**
 * טעינת רשימת חשבונות למודולי cash flow
 * @param {string} selectId - ID של ה-select element
 * @param {boolean} useDefaultFromPreferences - האם להשתמש בברירת מחדל מהעדפות
 */
async function loadAccountsForCashFlow(selectId, useDefaultFromPreferences = false) {
  try {
    // שימוש ב-SelectPopulatorService
    await SelectPopulatorService.populateAccountsSelect(selectId, {
      includeEmpty: true,
      emptyText: 'בחר חשבון...',
      defaultFromPreferences: useDefaultFromPreferences,
      filterFn: (account) => account.status === 'open'
    });
    
    // לוגים רק למודול הוספה
    if (useDefaultFromPreferences) {
      const select = document.getElementById(selectId);
      console.log('✅ אחרי טעינה - ערך נבחר:', select?.value);
      console.log('✅ אחרי טעינה - טקסט נבחר:', select?.options[select?.selectedIndex]?.text);
    }
    
  } catch (error) {
    handleApiError(error, 'טעינת חשבונות');

    // הצגת הודעת שגיאה
    if (window.showInfoNotification) {
      window.showInfoNotification('מידע על הטעינה', 'שגיאה בטעינת חשבונות');
    }
  }
}

/**
 * טעינת רשימת מטבעות למודולי cash flow
 * @param {string} selectId - ID של ה-select element
 * @param {boolean} useDefaultFromPreferences - האם להשתמש בברירת מחדל מהעדפות
 */
async function loadCurrenciesForCashFlow(selectId, useDefaultFromPreferences = false) {
  try {
    // שימוש ב-SelectPopulatorService
    await SelectPopulatorService.populateCurrenciesSelect(selectId, {
      includeEmpty: true,
      emptyText: 'בחר מטבע...',
      defaultFromPreferences: useDefaultFromPreferences
    });
  } catch (error) {
    handleApiError(error, 'טעינת מטבעות');

    // הצגת הודעת שגיאה
    if (window.showInfoNotification) {
      window.showInfoNotification('מידע על הטעינה', 'שגיאה בטעינת מטבעות');
    }
  }
}

/**
 * רינדור טבלת תזרימי מזומנים
 */
async function renderCashFlowsTable() {
  const tbody = document.querySelector('#cashFlowsContainer table tbody');
  if (!tbody) {return;}

  tbody.innerHTML = '';

  if (!cashFlowsData || cashFlowsData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" class="text-center">לא נמצאו תזרימי מזומנים</td></tr>';
    return;
  }

  // וידוא שנתוני חשבונות מסחר נטענו
  await ensureTradingAccountsLoaded();

  cashFlowsData.forEach(cashFlow => {
    const row = document.createElement('tr');
    // קבלת שם החשבון - קודם ננסה מהשרת, אחר כך fallback
    const accountName = cashFlow.account_name || getAccountNameById(cashFlow.trading_account_id) || `חשבון ${cashFlow.trading_account_id}`;

    // הצגת רק סמל המטבע
    const currencyDisplay = cashFlow.currency_symbol || '$';

    // קבלת סוג עם צבע
    const typeDisplay = getCashFlowTypeWithColor(cashFlow.type);

    // עיצוב סכום עם יישור נכון וצביעה
    const amountDisplay = formatCashFlowAmount(cashFlow.amount);

    // עיצוב שער עם 2 ספרות אחרי הנקודה
    const rateDisplay = formatUsdRate(cashFlow.usd_rate);

            row.innerHTML = `
            <td class="col-account ticker-cell">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <button class="btn btn-sm" 
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
            <td class="col-type type-cell">${typeDisplay}</td>
            <td class="col-amount" style="text-align: left; direction: ltr;">
                ${amountDisplay}
            </td>
            <td class="col-date" style="text-align: center;">${formatDate(cashFlow.date)}</td>
            <td class="col-description">${cashFlow.description || '-'}</td>
            <td class="col-source">${window.translateCashFlowSource ?
    window.translateCashFlowSource(cashFlow.source) :
    cashFlow.source}</td>
            <td class="col-actions actions-cell actions-4-items">
              ${window.createActionsMenu ? window.createActionsMenu([
                { type: 'VIEW', onclick: `showCashFlowDetails(${cashFlow.id})`, text: 'פרטים', title: 'הצג פרטי תזרים' },
                { type: 'LINK', onclick: `window.showLinkedItemsModal && window.showLinkedItemsModal([], 'cash_flow', ${cashFlow.id})`, text: 'פריטים מקושרים', title: 'צפה בפריטים מקושרים' },
                { type: 'EDIT', onclick: `showEditCashFlowModal(${cashFlow.id})`, text: 'ערוך', title: 'ערוך תזרים' },
                { type: 'DELETE', onclick: `deleteCashFlow(${cashFlow.id})`, text: 'מחק', title: 'מחק תזרים' }
              ]) : `
              <div class="actions-menu-wrapper">
                <button class="btn actions-trigger" title="פעולות">⚙️</button>
                <div class="actions-menu-popup">
                  <button class="btn" data-variant="small" data-button-type="VIEW" data-onclick="showCashFlowDetails(${cashFlow.id})" title="הצג פרטי תזרים">👁️</button>
                  <button class="btn" data-variant="small" data-button-type="LINK" data-onclick="window.showLinkedItemsModal && window.showLinkedItemsModal([], 'cash_flow', ${cashFlow.id})" title="צפה בפריטים מקושרים">🔗</button>
                  <button class="btn" data-variant="small" data-button-type="EDIT" data-onclick="showEditCashFlowModal(${cashFlow.id})" title="ערוך תזרים">✏️</button>
                  <button class="btn" data-variant="small" data-button-type="DELETE" data-onclick="deleteCashFlow(${cashFlow.id})" title="מחק תזרים">🗑️</button>
                </div>
              </div>
              `}
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

  // שימוש במערכת הצבעים הדינמית - רק צבע טקסט ללא רקע
  if (window.getTableColors) {
    const colors = window.getTableColors();
    let color = colors.secondary; // ברירת מחדל
    
    switch (type) {
    case 'deposit':
      color = colors.positive; // הפקדה - ירוק
      break;
    case 'withdrawal':
      color = colors.negative; // משיכה - אדום
      break;
    case 'dividend':
      color = colors.success; // דיבידנד - צבע הצלחה
      break;
    case 'fee':
      color = colors.warning; // עמלה - צבע אזהרה
      break;
    default:
      color = colors.secondary;
    }
    
    return `<span style="color: ${color}; font-weight: 600;">${typeTranslation}</span>`;
  }

  // fallback למערכת הצביעה הישנה
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

  // עיצוב הסכום עם סימן בצד הנכון (שמאל)
  const formattedAmount = `${isPositive ? '+' : '-'}$${absAmount.toFixed(2)}`;

  // שימוש במערכת הצבעים הדינמית - רק צבע טקסט ללא רקע
  if (window.getTableColors) {
    const colors = window.getTableColors();
    const color = isPositive ? colors.positive : colors.negative;
    return `<span style="color: ${color}; font-weight: 600;">${formattedAmount}</span>`;
  }

  // fallback למערכת הצביעה הישנה
  const colorClass = isPositive ? 'numeric-value-positive' : 'numeric-value-negative';
  return `<span class="${colorClass}" style="padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">${formattedAmount}</span>`;
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
 * הצגת פרטי תזרים מזומנים
 * @param {number} cashFlowId - מזהה התזרים
 */
function showCashFlowDetails(cashFlowId) {
  // שימוש במערכת הפרטים הגלובלית
  if (window.showEntityDetails) {
    window.showEntityDetails('cash_flow', cashFlowId, { mode: 'view' });
  } else {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'מערכת פרטי ישויות לא זמינה');
    }
  }
}

/**
 * הצגת פריטים מקושרים לתזרים מזומנים
 * @param {string} entityType - סוג הישות
 * @param {number} entityId - מזהה הישות
 */
// showLinkedItemsModal - using global function from linked-items.js

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

// הגדרת הפונקציות כגלובליות
window.showCashFlowDetails = showCashFlowDetails;
// window.showLinkedItemsModal = showLinkedItemsModal; // הוסר - הפונקציה לא מוגדרת כאן
window.updateCashFlowsTable = updateCashFlowsTable;

// פונקציית פילטור מקומי - הוסרה כי לא בשימוש

// ========================================
// אתחול הדף
// ========================================

// הפונקציה loadCashFlows הראשונה נשארת בשורה 241
// הפונקציה הכפולה נמחקה

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
// loadUserPreferences - using global function from preferences-core.js

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
    const preferences = await window.loadUserPreferences();
    
    // החלת העדפות על העמוד
    applyUserPreferences(preferences);
    
    // החלת מערכת צבעים דינמית
    await applyDynamicColors();

    // טעינת מטבעות מהשרת
    await window.loadCurrenciesFromServer();

    // טעינת נתונים
    await loadCashFlows();

    // שחזור מצב הסגירה
    if (typeof window.restoreSectionStates === 'function') {
      window.restoreSectionStates();
    }

    // שחזור מצב סידור
    restoreSortState();

    // הגדרת event listeners לשדות מקור
    setupSourceFieldListeners();

    // אתחול מערכת וולידציה
    if (window.initializeValidation) {
      window.initializeValidation('addCashFlowForm', addCashFlowValidationRules);
      window.initializeValidation('editCashFlowForm', editCashFlowValidationRules);
    }
    
    // הפעלת עדכון אוטומטי
    startAutoRefresh();
    
    console.log('✅ עמוד תזרימי מזומנים אותחל בהצלחה');
  } catch (error) {
    console.error('❌ שגיאה באתחול עמוד תזרימי מזומנים:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה באתחול העמוד', error.message);
    }
  }
}

// הפעלת אתחול כשהדף נטען
// document.addEventListener('DOMContentLoaded', function () {
//   initializeCashFlowsPage();
// });

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

/**
 * שחזור מצב סידור - שימוש בפונקציה גלובלית
 * @deprecated Use window.restoreAnyTableSort from main.js instead
 */
// restoreSortState - using global function from page-utils.js

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
    });
  }

  // למודל עריכה
  const editSourceField = document.getElementById('editCashFlowSource');
  if (editSourceField) {
    editSourceField.addEventListener('change', function () {
      manageExternalIdField(this.value, 'edit');
    });
  }
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

  // הגדרת מקור ברירת מחדל ל"ידני"
  document.getElementById('cashFlowSource').value = 'manual';

  try {
    // טעינת רשימת החשבונות והמטבעות
    await loadAccountsForCashFlow('cashFlowAccount', true);
    await loadCurrenciesForCashFlow('cashFlowCurrency', true);
    // טעינת רשימת הטריידים והתוכניות
    await loadTradesForCashFlow('cashFlowTrade');
    await loadTradePlansForCashFlow('cashFlowTradePlan');
    // אתחול שדה מזהה חיצוני
    initializeExternalIdFields();

    // הוספת event listeners לשדות מקור
    setupSourceFieldListeners();

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('addCashFlowModal'));
    modal.show();
  } catch (error) {
    handleApiError(error, 'טעינת נתונים להוספה');
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
    await loadAccountsForCashFlow('editCashFlowAccount', false);
    await loadCurrenciesForCashFlow('editCashFlowCurrency', false);
    // טעינת רשימת הטריידים והתוכניות
    await loadTradesForCashFlow('editCashFlowTrade');
    await loadTradePlansForCashFlow('editCashFlowTradePlan');
    // מילוי הטופס אחרי שהרשימות נטענו
    const editTypeField = document.getElementById('editCashFlowType');
    document.getElementById('editCashFlowId').value = cashFlow.id;
    document.getElementById('editCashFlowAccount').value = cashFlow.trading_account_id;

    if (editTypeField) {
      editTypeField.value = cashFlow.type;
    } else {
      handleElementNotFound('showEditCashFlowModal', 'לא נמצא אלמנט editCashFlowType');
    }
    document.getElementById('editCashFlowAmount').value = cashFlow.amount;
    document.getElementById('editCashFlowCurrency').value = cashFlow.currency_id || '';
    // המרת תאריך לפורמט datetime-local
    const dateValue = cashFlow.date ? new Date(cashFlow.date).toISOString().slice(0, 16) : '';
    document.getElementById('editCashFlowDate').value = dateValue;
    document.getElementById('editCashFlowDescription').value = cashFlow.description || '';

    const editSourceField = document.getElementById('editCashFlowSource');
    editSourceField.value = cashFlow.source || 'manual';
    document.getElementById('editCashFlowExternalId').value = cashFlow.external_id || '0';

    // מילוי שדות הקישור
    document.getElementById('editCashFlowTrade').value = cashFlow.trade_id || '';
    document.getElementById('editCashFlowTradePlan').value = cashFlow.trade_plan_id || '';

    // אתחול שדה מזהה חיצוני
    initializeExternalIdFields();

    // הוספת event listeners לשדות מקור
    setupSourceFieldListeners();

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('editCashFlowModal'));
    modal.show();
  } catch (error) {
    handleApiError(error, 'טעינת נתונים לעריכה');
  }
}

// עדכון פונקציית saveCashFlow
async function saveCashFlow() {
  try {
    // שימוש ב-DataCollectionService לאיסוף נתונים
    const cashFlowData = DataCollectionService.collectFormData({
      account_id: { id: 'cashFlowAccount', type: 'int' },
      type: { id: 'cashFlowType', type: 'text' },
      amount: { id: 'cashFlowAmount', type: 'number' },
      currency_id: { id: 'cashFlowCurrency', type: 'int' },
      date: { id: 'cashFlowDate', type: 'date' },
      description: { id: 'cashFlowDescription', type: 'text' },
      source: { id: 'cashFlowSource', type: 'text' },
      external_id: { id: 'cashFlowExternalId', type: 'text', default: '0' },
      trade_id: { id: 'cashFlowTrade', type: 'int', default: null },
      trade_plan_id: { id: 'cashFlowTradePlan', type: 'int', default: null }
    });

    const formData = {
      ...cashFlowData,
      usd_rate: 1.000000
    };

    // בדיקת תקינות מקיפה
    if (!validateCashFlowForm()) {
      return;
    }

    const response = await fetch('/api/cash_flows/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    await CRUDResponseHandler.handleSaveResponse(response, {
      modalId: 'addCashFlowModal',
      successMessage: 'תזרים המזומנים נשמר בהצלחה!',
      apiUrl: '/api/cash_flows/',
      entityName: 'תזרים מזומנים'
    });

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'שמירת תזרים מזומנים');
  }
}

// עדכון פונקציית updateCashFlow
async function updateCashFlow() {
  try {
    // שימוש ב-DataCollectionService לאיסוף נתונים
    const cashFlowData = DataCollectionService.collectFormData({
      id: { id: 'editCashFlowId', type: 'int' },
      account_id: { id: 'editCashFlowAccount', type: 'int' },
      type: { id: 'editCashFlowType', type: 'text' },
      amount: { id: 'editCashFlowAmount', type: 'number' },
      currency_id: { id: 'editCashFlowCurrency', type: 'int' },
      date: { id: 'editCashFlowDate', type: 'date' },
      description: { id: 'editCashFlowDescription', type: 'text' },
      source: { id: 'editCashFlowSource', type: 'text' },
      external_id: { id: 'editCashFlowExternalId', type: 'text', default: '0' },
      trade_id: { id: 'editCashFlowTrade', type: 'int', default: null },
      trade_plan_id: { id: 'editCashFlowTradePlan', type: 'int', default: null }
    });

    const formData = {
      ...cashFlowData,
      usd_rate: 1.000000
    };

    // בדיקת תקינות מקיפה
    if (!validateEditCashFlowForm()) {
      return;
    }

    const response = await fetch(`/api/cash_flows/${formData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    await CRUDResponseHandler.handleUpdateResponse(response, {
      modalId: 'editCashFlowModal',
      successMessage: 'תזרים המזומנים נעדכן בהצלחה!',
      apiUrl: '/api/cash_flows/',
      entityName: 'תזרים מזומנים'
    });

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'עדכון תזרים מזומנים');
  }
}

// הפונקציה הוסרה - קיימת כבר בשורה 909

// פונקציות מודל חסרות
function showAddCashFlowModal() {
    console.log('showAddCashFlowModal called');
    // קריאה לפונקציה האמיתית
    _showAddCashFlowModal();
}

function showEditCashFlowModal(cashFlowId) {
    console.log('showEditCashFlowModal called with ID:', cashFlowId);
    // קריאה לפונקציה האמיתית
    _showEditCashFlowModal(cashFlowId);
}

// ===== MISSING FUNCTIONS FOR ONCLICK ATTRIBUTES =====

// Toggle functions

// Cash Flow CRUD functions
function editCashFlow(id) {
    if (typeof window.editCashFlow === 'function') {
        window.editCashFlow(id);
    } else {
        console.warn('editCashFlow function not found');
    }
}


// ===== TRADE AND TRADE PLAN LOADING FUNCTIONS =====

/**
 * Load trades for cash flow modals
 * @param {string} selectId - ID של ה-select element
 */
async function loadTradesForCashFlow(selectId) {
  try {
    const response = await fetch('/api/trades/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const trades = data.data || [];
    
    // Sort trades by ticker symbol alphabetically
    trades.sort((a, b) => {
      const symbolA = a.ticker_symbol || '';
      const symbolB = b.ticker_symbol || '';
      return symbolA.localeCompare(symbolB, 'he');
    });
    
    const tradeSelect = document.getElementById(selectId);
    if (tradeSelect) {
      // Clear existing options except the first one
      tradeSelect.innerHTML = '<option value="">בחר טרייד (אופציונלי)</option>';
      
      // Add trade options
      trades.forEach(trade => {
        const option = document.createElement('option');
        option.value = trade.id;
        const tradeDate = trade.opened_at ? new Date(trade.opened_at).toLocaleDateString('he-IL') : 'לא מוגדר';
        const sideText = trade.side === 'buy' ? 'קנייה' : trade.side === 'sell' ? 'מכירה' : trade.side || 'לא מוגדר';
        option.textContent = `${trade.ticker_symbol || 'לא מוגדר'} | ${tradeDate} | ${sideText}`;
        tradeSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading trades for cash flow modal:', error);
  }
}

/**
 * Load trade plans for cash flow modals
 * @param {string} selectId - ID של ה-select element
 */
async function loadTradePlansForCashFlow(selectId) {
  try {
    const response = await fetch('/api/trade_plans/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const tradePlans = data.data || [];
    
    // Sort trade plans by ticker symbol alphabetically
    tradePlans.sort((a, b) => {
      const symbolA = a.ticker && a.ticker.symbol ? a.ticker.symbol : '';
      const symbolB = b.ticker && b.ticker.symbol ? b.ticker.symbol : '';
      return symbolA.localeCompare(symbolB, 'he');
    });
    
    const tradePlanSelect = document.getElementById(selectId);
    if (tradePlanSelect) {
      // Clear existing options except the first one
      tradePlanSelect.innerHTML = '<option value="">בחר תוכנית השקעה (אופציונלי)</option>';
      
      // Add trade plan options
      tradePlans.forEach(plan => {
        const option = document.createElement('option');
        option.value = plan.id;
        const planDate = plan.created_at ? new Date(plan.created_at).toLocaleDateString('he-IL') : 'לא מוגדר';
        const sideText = plan.side === 'buy' ? 'קנייה' : plan.side === 'sell' ? 'מכירה' : plan.side || 'לא מוגדר';
        const symbol = plan.ticker && plan.ticker.symbol ? plan.ticker.symbol : 'לא מוגדר';
        option.textContent = `${symbol} | ${planDate} | ${sideText}`;
        tradePlanSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading trade plans for cash flow modal:', error);
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
window.loadCashFlowsData = loadCashFlowsData;
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

// ===== מערכת טיפול בשגיאות =====
// השתמש במערכת הכללית error-handlers.js

// ===== ייצוא פונקציות לגלובל scope =====
// הוספת פונקציות חשובות ל-window object כדי שיהיו זמינות גלובלית

// פונקציות עיקריות
window.loadCashFlowsData = loadCashFlowsData;
window.calculateBalance = calculateBalance;
window.toggleCashFlowsSection = toggleCashFlowsSection;
window.restoreCashFlowsSectionState = restoreCashFlowsSectionState;

window.loadCashFlows = loadCashFlows;

// פונקציות טופס
window.validateCashFlowForm = validateCashFlowForm;
window.validateEditCashFlowForm = validateEditCashFlowForm;

// פונקציות CRUD
window.deleteCashFlow = deleteCashFlow;
window.saveCashFlow = saveCashFlow;
window.updateCashFlow = updateCashFlow;
window.editCashFlow = editCashFlow;

// פונקציות טעינה
// window.loadCurrenciesFromServer export removed - using global function from data-utils.js
window.loadAccountsForCashFlow = loadAccountsForCashFlow;
window.loadCurrenciesForCashFlow = loadCurrenciesForCashFlow;

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
// window.copyDetailedLog export removed - using local function only

// פונקציות טיפול בשגיאות - משתמש במערכת הכללית error-handlers.js

// פונקציות אתחול
window.initializeCashFlowsPage = initializeCashFlowsPage;
window.restoreSortState = restoreSortState;
window.startAutoRefresh = startAutoRefresh;
// window.loadUserPreferences export removed - using global function from preferences-core.js
window.applyUserPreferences = applyUserPreferences;
window.applyDynamicColors = applyDynamicColors;

// פונקציות אימות
window.setupSourceFieldListeners = setupSourceFieldListeners;
window.initializeExternalIdFields = initializeExternalIdFields;
window.manageExternalIdField = manageExternalIdField;

console.log('✅ Cash Flows: All functions exported to global scope');
