/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 36
 * 
 * PAGE INITIALIZATION (3)
 * - initializeCashFlowsPage() - initializeCashFlowsPage function
 * - setupSourceFieldListeners() - setupSourceFieldListeners function
 * - initializeExternalIdFields() - * Setup source field listeners
 * 
 * DATA LOADING (10)
 * - loadCashFlowsData() - loadCashFlowsData function
 * - getAccountNameById() - getAccountNameById function
 * - ensureTradingAccountsLoaded() - ensureTradingAccountsLoaded function
 * - loadCashFlows() - loadCashFlows function
 * - loadAccountsForCashFlow() - loadAccountsForCashFlow function
 * - loadCurrenciesForCashFlow() - loadCurrenciesForCashFlow function
 * - getCashFlowTypeWithColor() - * Format amount
 * - getCashFlowTypeText() - getCashFlowTypeText function
 * - loadTradesForCashFlow() - * Show edit cash flow modal
 * - loadTradePlansForCashFlow() - loadTradePlansForCashFlow function
 * 
 * DATA MANIPULATION (5)
 * - deleteCashFlow() - deleteCashFlow function
 * - updatePageSummaryStats() - updatePageSummaryStats function
 * - updateCashFlowsTable() - * Format USD rate
 * - confirmDeleteCashFlow() - confirmDeleteCashFlow function
 * - showAddCashFlowModal() - * הצגת שגיאה לשדה בודד
 * 
 * EVENT HANDLING (2)
 * - toggleCashFlowsSection() - * טעינת נתוני חשבונות מסחר אם הם לא נטענו
 * - restoreCashFlowsSectionState() - restoreCashFlowsSectionState function
 * 
 * UI UPDATES (3)
 * - renderCashFlowsTable() - * טעינת רשימת מטבעות למודולי cash flow
 * - showCashFlowDetails() - * Format USD rate
 * - showEditCashFlowModal() - * Initialize external ID fields
 * 
 * VALIDATION (2)
 * - validateCashFlowForm() - validateCashFlowForm function
 * - validateEditCashFlowForm() - validateEditCashFlowForm function
 * 
 * UTILITIES (3)
 * - formatAmount() - formatAmount function
 * - formatCashFlowAmount() - * Get cash flow type text
 * - formatUsdRate() - formatUsdRate function
 * 
 * OTHER (8)
 * - calculateBalance() - calculateBalance function
 * - startAutoRefresh() - * Update cash flows table
 * - applyDynamicColors() - * Start auto refresh
 * - applyUserPreferences() - applyUserPreferences function
 * - manageExternalIdField() - * Confirm delete cash flow
 * - editCashFlow() - * Show add cash flow modal
 * - generateDetailedLog() - generateDetailedLog function
 * - generateDetailedLogForCashFlows() - generateDetailedLogForCashFlows function
 * 
 * ==========================================
 */
/**
 * Cash Flows Page - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains all functions for managing cash flows including:
 * - CRUD operations for cash flows
 * - Data loading and table management
 * - Form validation and UI interactions
 * - Modal handling and state management
 * - Filtering and sorting functionality
 * - Related objects integration
 * 
 * Author: TikTrack Development Team
 * Version: 2.0
 * Last Updated: 2025-01-27
 */

// ===== קובץ JavaScript לדף תזרימי מזומנים =====

/**
 * Load cash flows data from server
 * @function loadCashFlowsData
 * @async
 * @returns {Promise<void>}
 */
async function loadCashFlowsData() {
  console.log('🔥🔥🔥 loadCashFlowsData CALLED 🔥🔥🔥');
  try {
    window.Logger.info('Loading cash flows data (bypass cache)', { page: 'cash_flows' });
    console.log('🔥 loadCashFlowsData - Step 1: Starting fetch');
    
    // קריאה ישירה לשרת עם timestamp למניעת cache
    const response = await fetch(`/api/cash_flows/?_t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('🔥 loadCashFlowsData - Step 2: Response received', response.status, response.ok);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    const data = responseData.data || responseData;
    
    console.log('🔥 loadCashFlowsData - Step 3: Data received', data.length, 'items');
    
    // עדכון הנתונים הגלובליים
    window.cashFlowsData = data;
    cashFlowsData = data;
    
    console.log('🔥 loadCashFlowsData - Step 4: Updating table');
    // עדכון הטבלה
    updateCashFlowsTable(data);
    
    console.log('🔥 loadCashFlowsData - Step 5: Updating stats');
    // עדכון הסטטיסטיקות
    updatePageSummaryStats();
    
    console.log('🔥🔥🔥 loadCashFlowsData COMPLETED SUCCESSFULLY 🔥🔥🔥');
    window.Logger.info(`✅ Loaded ${data.length} cash flows`, { page: 'cash_flows' });
  } catch (error) {
    console.error('🔥🔥🔥 loadCashFlowsData ERROR:', error);
    window.Logger.error('Error loading cash flows data', error, { page: 'cash_flows' });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בטעינת נתוני תזרימי מזומנים', error.message);
    }
  }
}

/**
 * Calculate balance
 * @function calculateBalance
 * @returns {void}
 */
function calculateBalance() {
  try {
    window.Logger.info('Calculating balance', { page: 'cash_flows' });
    
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
    window.Logger.error('Error calculating balance', error, { page: 'cash_flows' });
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
 * Get account name by ID
 * @function getAccountNameById
 * @param {string} accountId - Account ID
 * @returns {string} Account name
 */
function getAccountNameById(accountId) {
  try {
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
  } catch (error) {
    window.Logger.error('שגיאה בקבלת שם חשבון מסחר לפי מזהה:', error, { page: "cash_flows" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בקבלת שם חשבון מסחר לפי מזהה', error.message);
    }
    return null;
  }
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
 * Toggle cash flows section
 * @function toggleCashFlowsSection
 * @returns {void}
 */
function toggleCashFlowsSection() {
  try {
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
  window.unifiedCacheManager?.save('cashFlowsSectionState', isVisible ? 'closed' : 'open');
  localStorage.setItem('cashFlowsSectionState', isVisible ? 'closed' : 'open');
  
  } catch (error) {
    window.Logger.error('שגיאה בהחלפת סקציית תזרימי מזומנים:', error, { page: "cash_flows" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהחלפת סקציית תזרימי מזומנים', error.message);
    }
  }
}

// פונקציות לשחזור מצב הסגירה
async function restoreCashFlowsSectionState() {
  // restoreCashFlowsSectionState נקראה

  const savedState = await window.unifiedCacheManager?.get('cashFlowsSectionState') || localStorage.getItem('cashFlowsSectionState');
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
 * Validate cash flow form
 * @function validateCashFlowForm
 * @returns {boolean} Is valid
 */
function validateCashFlowForm() {
  try {
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
    { id: 'cashFlowAccount', name: 'חשבון מסחר מסחר' },
    { id: 'cashFlowCurrency', name: 'מטבע' },
    { id: 'cashFlowSource', name: 'מקור' }
  ]);
  
  } catch (error) {
    window.Logger.error('שגיאה בוולידציה של טופס תזרים מזומנים:', error, { page: "cash_flows" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בוולידציה של טופס תזרים מזומנים', error.message);
    }
    return false;
  }
}

/**
 * הצגת שגיאת וולידציה לשדה
 * @param {string} fieldId - מזהה השדה
 * @param {string} message - הודעת השגיאה
 */
// ולידציה - משתמש במערכת הכללית window.validateEntityForm

/**
 * Validate edit cash flow form
 * @function validateEditCashFlowForm
 * @returns {boolean} Is valid
 */
function validateEditCashFlowForm() {
  try {
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
    { id: 'editCashFlowAccount', name: 'חשבון מסחר מסחר' },
    { id: 'editCashFlowCurrency', name: 'מטבע' },
    { id: 'editCashFlowSource', name: 'מקור' }
  ]);
  
  } catch (error) {
    window.Logger.error('שגיאה בוולידציה של טופס עריכת תזרים מזומנים:', error, { page: "cash_flows" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בוולידציה של טופס עריכת תזרים מזומנים', error.message);
    }
    return false;
  }
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
    // CRUDResponseHandler will handle cache clearing automatically
    // No need to call clearCacheBeforeCRUD here
    
    // מציאת התזרים
    const cashFlow = window.cashFlowsData ? window.cashFlowsData.find(cf => cf.id === id) : null;
    if (!cashFlow) {
      window.showErrorNotification('שגיאה', 'תזרים המזומנים לא נמצא', 6000, 'system');
      return;
    }

    // הצגת חלון אישור מפורט
    const confirmMessage = `האם אתה בטוח שברצונך למחוק את תזרים המזומנים הבא?

חשבון מסחר: ${getAccountNameById(cashFlow.trading_account_id) || 'לא מוגדר'}
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
    message: 'נדרש לבחור חשבון מסחר',
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
    message: 'נדרש לבחור חשבון מסחר',
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
      emptyText: 'בחר חשבון מסחר...',
      defaultFromPreferences: useDefaultFromPreferences,
      filterFn: (account) => account.status === 'open'
    });
    
    // לוגים רק למודול הוספה
    if (useDefaultFromPreferences) {
      const select = document.getElementById(selectId);
      window.Logger.debug('After loading - selected value', { value: select?.value, page: 'cash_flows' });
      window.Logger.debug('After loading - selected text', { text: select?.options[select?.selectedIndex]?.text, page: 'cash_flows' });
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
    // קבלת שם החשבון מסחר - קודם ננסה מהשרת, אחר כך fallback
    const accountName = cashFlow.account_name || getAccountNameById(cashFlow.trading_account_id) || `חשבון מסחר ${cashFlow.trading_account_id}`;

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
 * Update page summary statistics
 * @function updatePageSummaryStats
 * @returns {void}
 */
function updatePageSummaryStats() {
  // Simple local implementation - no dependency on global function
  try {
    // Update record count if element exists
    const countElement = document.getElementById('cashFlowsCount');
    if (countElement && cashFlowsData) {
      countElement.textContent = cashFlowsData.length;
    }
    
    // Update summary stats if element exists
    const summaryElement = document.getElementById('cashFlowsSummary');
    if (summaryElement && cashFlowsData) {
      const totalAmount = cashFlowsData.reduce((sum, cf) => sum + (cf.amount || 0), 0);
      summaryElement.textContent = `סה"כ: ${cashFlowsData.length} תזרימים, ${totalAmount.toFixed(2)} ₪`;
    }
    
    window.Logger.debug('Page summary stats updated locally', { 
      count: cashFlowsData?.length || 0, 
      page: 'cash_flows' 
    });
  } catch (error) {
    window.Logger.warn('Error updating page summary stats', { 
      error: error.message, 
      page: 'cash_flows' 
    });
  }
}

// פונקציות הועברו ל-translation-utils.js:
// getTypeDisplayName -> translateCashFlowType
// getSourceDisplayName -> translateCashFlowSource

/**
 * Format amount
 * @function formatAmount
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount
 */
function formatAmount(amount) {
  try {
    // שימוש במערכת הפורמט החדשה
    if (window.formatCurrencyWithCommas) {
      return window.formatCurrencyWithCommas(amount, 'USD');
    }

    // גיבוי למערכת הישנה
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  } catch (error) {
    window.Logger.error('שגיאה בעיצוב סכום:', error, { page: "cash_flows" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעיצוב סכום', error.message);
    }
    return amount.toString();
  }
}

/**
 * Get cash flow type with color
 * @function getCashFlowTypeWithColor
 * @param {string} type - Cash flow type
 * @returns {string} HTML with color
 */
function getCashFlowTypeWithColor(type) {
  try {
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
    cssClass = 'entity-account-badge'; // דיבידנד - צבע חשבון מסחר
    break;
  case 'fee':
    cssClass = 'numeric-value-zero'; // עמלה - אפור
    break;
  default:
    cssClass = 'numeric-value-zero';
  }

  return `<span class="${cssClass}" style="padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: 500;"><strong>${typeTranslation}</strong></span>`;
  
  } catch (error) {
    window.Logger.error('שגיאה בקבלת סוג תזרים עם צבע:', error, { page: "cash_flows" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בקבלת סוג תזרים עם צבע', error.message);
    }
    return type;
  }
}

/**
 * Get cash flow type text
 * @function getCashFlowTypeText
 * @param {string} type - Cash flow type
 * @returns {string} Type text
 */
function getCashFlowTypeText(type) {
  return window.translateCashFlowType ? window.translateCashFlowType(type) : type;
}

/**
 * Format cash flow amount
 * @function formatCashFlowAmount
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount
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
 * Format USD rate
 * @function formatUsdRate
 * @param {number} rate - Rate to format
 * @returns {string} Formatted rate
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
 * Show cash flow details
 * @function showCashFlowDetails
 * @param {string} cashFlowId - Cash flow ID
 * @returns {void}
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
 * Update cash flows table
 * @function updateCashFlowsTable
 * @param {Array} cashFlows - Cash flows array
 * @returns {void}
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
 * Start auto refresh
 * @function startAutoRefresh
 * @returns {void}
 */
function startAutoRefresh() {
  window.Logger.info('Starting automatic cash flows update', { page: 'cash_flows' });
  
  // עדכון נתונים כל 30 שניות - הושבת זמנית למניעת לופים
  // setInterval(async () => {
  //   try {
  //     window.Logger.info('Automatic cash flows data update', { page: 'cash_flows' });
  //     await loadCashFlows();
  //     
  //     // עדכון סטטיסטיקות
  //     if (typeof updatePageSummaryStats === 'function') {
  //       updatePageSummaryStats();
  //     }
  //     
  //     window.Logger.info('Automatic update completed successfully', { page: 'cash_flows' });
  //   } catch (error) {
  //     window.Logger.error('Error in automatic update', error, { page: 'cash_flows' });
  //   }
  // }, 30000); // 30 שניות
  
  window.Logger.info('Automatic update activated - refresh every 30 seconds', { page: 'cash_flows' });
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
    window.Logger.info('Applying dynamic color system', { page: 'cash_flows' });
    
    // טעינת צבעי ישויות מהמערכת הגלובלית
    if (typeof window.loadEntityColors === 'function') {
      const entityColors = await window.loadEntityColors();
      if (entityColors) {
        window.Logger.debug('Entity colors loaded', { entityColors, page: 'cash_flows' });
        
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
        window.Logger.debug('Status colors loaded', { statusColors, page: 'cash_flows' });
        
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
    
    window.Logger.info('Dynamic color system applied successfully', { page: 'cash_flows' });
  } catch (error) {
    window.Logger.error('Error applying dynamic color system', error, { page: 'cash_flows' });
  }
}

/**
 * Apply user preferences
 * @function applyUserPreferences
 * @param {Object} preferences - User preferences
 * @returns {void}
 */
function applyUserPreferences(preferences) {
  try {
    if (!preferences) return;
    
    window.Logger.info('Applying user preferences to page', { page: 'cash_flows' });
    
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
    
    window.Logger.info('User preferences applied successfully', { page: 'cash_flows' });
  } catch (error) {
    window.Logger.error('Error applying user preferences', error, { page: 'cash_flows' });
  }
}

/**
 * אתחול הדף
 */
async function initializeCashFlowsPage() {
  window.Logger.info('Initializing cash flows page', { page: 'cash_flows' });

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
    
    window.Logger.info('Cash flows page initialized successfully', { page: 'cash_flows' });
  } catch (error) {
    window.Logger.error('Error initializing cash flows page', error, { page: 'cash_flows' });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה באתחול העמוד', error.message);
    }
  }
}

// הפעלת אתחול כשהדף נטען
// document.addEventListener('DOMContentLoaded', function () {
//   initializeCashFlowsPage();
// });

// ===== CRUD FUNCTIONS =====

// REMOVED: saveCashFlow function - using ModalManagerV2 automatic CRUD handling
// The ModalManagerV2 system automatically handles save operations based on modal configuration

/**
 * עדכון תזרים מזומנים
 * @function updateCashFlow
 * @param {string} id - Cash flow ID
 * @returns {Promise<void>}
 */
async function updateCashFlow(id) {
    window.Logger.debug('updateCashFlow called', { id, page: 'cash_flows' });
    
    try {
        // Find cash flow data
        const cashFlow = cashFlowsData.find(cf => cf.id === id);
        if (!cashFlow) {
            throw new Error('Cash flow not found');
        }
        
        // Show edit modal with data
        if (window.ModalManagerV2) {
            window.ModalManagerV2.showEditModal('cashFlowModal', cashFlow);
        } else {
            throw new Error('ModalManagerV2 not available');
        }
        
    } catch (error) {
        window.Logger.error('Error updating cash flow', { error: error.message, page: 'cash_flows' });
        
        if (window.showNotification) {
            window.showNotification('שגיאה בעדכון תזרים המזומנים', 'error', 'system');
        }
    }
}

// ייצוא פונקציות גלובליות
window.toggleCashFlowsSection = toggleCashFlowsSection;
window.restoreCashFlowsSectionState = restoreCashFlowsSectionState;
// ===== MODAL FUNCTIONS - NEW SYSTEM =====

/**
 * Save cash flow - required by ModalManagerV2
 * @function saveCashFlow
 * @async
 * @returns {Promise<void>}
 */
async function saveCashFlow() {
    console.log('🔥 saveCashFlow CALLED - Starting execution');
    window.Logger.debug('saveCashFlow called', { page: 'cash_flows' });
    
    try {
        console.log('🔥 saveCashFlow - Step 1: Starting execution');
        // CRUDResponseHandler will handle cache clearing automatically
        // No need to call clearCacheBeforeCRUD here
        
        // Collect form data using DataCollectionService
        const form = document.getElementById('cashFlowModalForm');
        console.log('🔥 saveCashFlow - Step 2: Form element:', form);
        if (!form) {
            console.error('🔥 saveCashFlow - ERROR: Form not found!');
            throw new Error('Cash flow form not found');
        }
        
        console.log('🔥 saveCashFlow - Step 3: Collecting form data');
        const cashFlowData = DataCollectionService.collectFormData({
            amount: { id: 'cashFlowAmount', type: 'float' },
            type: { id: 'cashFlowType', type: 'text' },
            currency_id: { id: 'cashFlowCurrency', type: 'int' },
            trading_account_id: { id: 'cashFlowAccount', type: 'int' },  // Backend expects trading_account_id
            date: { id: 'cashFlowDate', type: 'dateOnly' },  // Backend expects Date only, not datetime
            description: { id: 'cashFlowDescription', type: 'text', default: null },
            source: { id: 'cashFlowSource', type: 'text' },
            external_id: { id: 'cashFlowExternalId', type: 'text', default: '0' }
        });
        
        console.log('🔥 saveCashFlow - Step 4: Form data collected:', cashFlowData);
        
        // ולידציה מפורטת
        let hasErrors = false;
        console.log('🔥 saveCashFlow - Step 5: Starting validation');
        if (!cashFlowData.amount || cashFlowData.amount <= 0) {
            if (window.showValidationWarning) {
                window.showValidationWarning('cashFlowAmount', 'סכום חייב להיות גדול מ-0');
            }
            hasErrors = true;
        }
        
        if (!cashFlowData.type) {
            if (window.showValidationWarning) {
                window.showValidationWarning('cashFlowType', 'סוג תזרים הוא שדה חובה');
            }
            hasErrors = true;
        }
        
        if (!cashFlowData.currency_id) {
            if (window.showValidationWarning) {
                window.showValidationWarning('cashFlowCurrency', 'מטבע הוא שדה חובה');
            }
            hasErrors = true;
        }
        
        if (!cashFlowData.trading_account_id) {
            if (window.showValidationWarning) {
                window.showValidationWarning('cashFlowAccount', 'חשבון מסחר הוא שדה חובה');
            }
            hasErrors = true;
        }
        
        if (!cashFlowData.date) {
            if (window.showValidationWarning) {
                window.showValidationWarning('cashFlowDate', 'תאריך הוא שדה חובה');
            }
            hasErrors = true;
        }
        
        if (!cashFlowData.source) {
            if (window.showValidationWarning) {
                window.showValidationWarning('cashFlowSource', 'מקור הוא שדה חובה');
            }
            hasErrors = true;
        }
        
        if (hasErrors) {
            console.error('🔥 saveCashFlow - VALIDATION FAILED - hasErrors = true');
            return;
        }
        
        console.log('🔥 saveCashFlow - Step 6: Validation passed, preparing API call');
        
        // Determine if this is add or edit
        const isEdit = form.dataset.mode === 'edit';
        const cashFlowId = form.dataset.cashFlowId;
        
        // CRUDResponseHandler will handle cache clearing automatically
        // No need to call clearCacheBeforeCRUD here
        
        // Prepare API call
        const url = isEdit ? `/api/cash_flows/${cashFlowId}` : '/api/cash_flows';
        const method = isEdit ? 'PUT' : 'POST';
        
        // Send to API
        console.log('🔥 saveCashFlow - Full data being sent:', JSON.stringify(cashFlowData, null, 2));
        console.log('🔥 saveCashFlow - Sending to API:', { url, method, data: cashFlowData });
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cashFlowData)
        });
        
        console.log('🔥 saveCashFlow - API Response:', { status: response.status, ok: response.ok });
        
        // Check if there's an error BEFORE calling CRUDResponseHandler
        if (!response.ok) {
            const errorData = await response.json();
            console.error('🔥 saveCashFlow - API ERROR:', errorData);
            
            // Show error notification
            if (window.showErrorNotification) {
                const errorMessage = errorData.error?.message || errorData.message || 'שגיאה בשמירת תזרים מזומן';
                window.showErrorNotification('שגיאה בשמירה', errorMessage);
            }
            
            // Show validation errors if they exist
            if (errorData.errors && Array.isArray(errorData.errors)) {
                errorData.errors.forEach(err => {
                    if (window.showValidationWarning) {
                        window.showValidationWarning(err.field || 'general', err.message || 'שגיאה בשדה');
                    }
                });
            }
            
            return;
        }
        
        // Response is OK - use CRUDResponseHandler for consistent handling
        console.log('🔥 saveCashFlow - Step 7: Handling response, isEdit =', isEdit);
        if (isEdit) {
            await CRUDResponseHandler.handleUpdateResponse(response, {
                modalId: 'cashFlowModal',
                successMessage: 'תזרים מזומן עודכן בהצלחה',
                entityName: 'תזרים מזומן',
                reloadFn: window.loadCashFlowsData,
                requiresHardReload: false  // Prevent reload confirmation dialog
            });
            console.log('🔥 saveCashFlow - UPDATE SUCCESS');
        } else {
            await CRUDResponseHandler.handleSaveResponse(response, {
                modalId: 'cashFlowModal',
                successMessage: 'תזרים מזומן נוסף בהצלחה',
                entityName: 'תזרים מזומן',
                reloadFn: window.loadCashFlowsData,
                requiresHardReload: false  // Prevent reload confirmation dialog
            });
            console.log('🔥 saveCashFlow - SAVE SUCCESS');
        }
        
    } catch (error) {
        console.error('🔥 saveCashFlow - ERROR CAUGHT:', error);
        CRUDResponseHandler.handleError(error, 'שמירת תזרים מזומן');
    }
}

// Export save function for ModalManagerV2
window.saveCashFlow = saveCashFlow;
window.updateCashFlow = updateCashFlow;

// יצירת alias לפונקציית המחיקה לשמירה על תאימות
/**
 * Confirm delete cash flow
 * @function confirmDeleteCashFlow
 * @param {string} id - Cash flow ID
 * @returns {void}
 */
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
 * sortTable(0); // סידור לפי עמודת חשבון מסחר
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
 * Manage external ID field
 * @function manageExternalIdField
 * @param {string} source - Source type
 * @param {string} modalType - Modal type
 * @returns {void}
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
 * Setup source field listeners
 * @function setupSourceFieldListeners
 * @returns {void}
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
 * Initialize external ID fields
 * @function initializeExternalIdFields
 * @returns {void}
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

// פונקציות מודל חדשות - מערכת ModalManagerV2
/**
 * Show add cash flow modal
 * @function showAddCashFlowModal
 * @returns {void}
 */
function showAddCashFlowModal() {
    window.Logger.debug('showAddCashFlowModal called', { page: 'cash_flows' });
    
    if (window.ModalManagerV2) {
        window.ModalManagerV2.showModal('cashFlowModal', 'add');
    } else {
        console.error('ModalManagerV2 not available');
    }
}

/**
 * Show edit cash flow modal
 * @function showEditCashFlowModal
 * @param {string} cashFlowId - Cash flow ID
 * @returns {void}
 */
function showEditCashFlowModal(cashFlowId) {
    window.Logger.debug('showEditCashFlowModal called', { cashFlowId, page: 'cash_flows' });
    
    if (window.ModalManagerV2) {
        window.ModalManagerV2.showEditModal('cashFlowModal', 'cash_flow', cashFlowId);
    } else {
        console.error('ModalManagerV2 not available');
    }
}

// ===== MISSING FUNCTIONS FOR ONCLICK ATTRIBUTES =====

// Toggle functions

// Cash Flow CRUD functions
/**
 * Edit cash flow
 * @function editCashFlow
 * @param {string} id - Cash flow ID
 * @returns {void}
 */
function editCashFlow(id) {
    if (typeof window.editCashFlow === 'function') {
        window.editCashFlow(id);
    } else {
        window.Logger.warn('editCashFlow function not found', { page: 'cash_flows' });
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
    window.Logger.error('Error loading trades for cash flow modal', error, { page: 'cash_flows' });
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
    window.Logger.error('Error loading trade plans for cash flow modal', error, { page: 'cash_flows' });
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
window.updateCashFlow = updateCashFlow;

// window.showLinkedItemsWarning = showLinkedItemsWarning; // הוסר - הוחלף ב-showLinkedItemsModal
// window.checkLinkedItemsForCashFlow = checkLinkedItemsForCashFlow; // הוסר - לא נחוץ יותר

/**
 * Generate detailed log
 * @function generateDetailedLog
 * @returns {void}
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

// Local  function for cash_flows page
async function generateDetailedLogForCashFlows() {
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
        window.Logger.error('Error copying detailed log', error, { page: 'cash_flows' });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בהעתקת הלוג', error.message);
        } else {
            alert('שגיאה בהעתקת הלוג: ' + error.message);
        }
    }
}

// ===== מערכת טיפול בשגיאות =====
// השתמש במערכת הכללית error-handlers.js

// ===== GLOBAL EXPORTS =====
window.loadCashFlowsData = loadCashFlowsData;
window.calculateBalance = calculateBalance;
window.getAccountNameById = getAccountNameById;
window.toggleCashFlowsSection = toggleCashFlowsSection;
window.validateCashFlowForm = validateCashFlowForm;
window.validateEditCashFlowForm = validateEditCashFlowForm;
window.updatePageSummaryStats = updatePageSummaryStats;
window.formatAmount = formatAmount;
window.getCashFlowTypeWithColor = getCashFlowTypeWithColor;
window.getCashFlowTypeText = getCashFlowTypeText;
window.formatCashFlowAmount = formatCashFlowAmount;
window.formatUsdRate = formatUsdRate;
window.showCashFlowDetails = showCashFlowDetails;
window.updateCashFlowsTable = updateCashFlowsTable;
window.startAutoRefresh = startAutoRefresh;
window.applyUserPreferences = applyUserPreferences;
window.confirmDeleteCashFlow = confirmDeleteCashFlow;
window.manageExternalIdField = manageExternalIdField;
window.setupSourceFieldListeners = setupSourceFieldListeners;
window.initializeExternalIdFields = initializeExternalIdFields;
window.showAddCashFlowModal = showAddCashFlowModal;
window.showEditCashFlowModal = showEditCashFlowModal;
window.editCashFlow = editCashFlow;
window.generateDetailedLog = generateDetailedLog;
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
// window. export removed - using local function only

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

window.Logger.info('Cash Flows: All functions exported to global scope', { page: 'cash_flows' });
