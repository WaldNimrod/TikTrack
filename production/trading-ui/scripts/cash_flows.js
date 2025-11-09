/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 35
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
 * - loadCashFlows() - * טעינת נתוני חשבונות מסחר אם הם לא נטענו
 * - loadAccountsForCashFlow() - loadAccountsForCashFlow function
 * - loadCurrenciesForCashFlow() - loadCurrenciesForCashFlow function
 * - getCashFlowTypeWithColor() - * Format amount
 * - getCashFlowTypeText() - getCashFlowTypeText function
 * - loadTradesForCashFlow() - * Edit cash flow
 * - loadTradePlansForCashFlow() - loadTradePlansForCashFlow function
 * 
 * DATA MANIPULATION (6)
 * - deleteCashFlow() - deleteCashFlow function
 * - updatePageSummaryStats() - Uses InfoSummarySystem from services/statistics-calculator.js
 * - updateCashFlowsTable() - * Format USD rate
 * - updateCashFlow() - updateCashFlow function
 * - saveCashFlow() - saveCashFlow function
 * - confirmDeleteCashFlow() - confirmDeleteCashFlow function
 * 
 * EVENT HANDLING (1)
 * - performCashFlowDeletion() - performCashFlowDeletion function
 * 
 * UI UPDATES (2)
 * - renderCashFlowsTable() - * טעינת רשימת מטבעות למודולי cash flow
 * - showCashFlowDetails() - * Format USD rate
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
 * - editCashFlow() - editCashFlow function
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
  console.log('🔥🔥🔥 loadCashFlowsData CALLED');
  try {
    // Count records BEFORE refresh
    const beforeTableCount = cashFlowsData ? cashFlowsData.length : 0;
    console.log('📊 BEFORE REFRESH: Table has', beforeTableCount, 'records');
    
    console.log('🔥 loadCashFlowsData: Starting fetch...');
    window.Logger.info('Loading cash flows data (bypass cache)', { page: 'cash_flows' });
    
    // קריאה ישירה לשרת עם timestamp למניעת cache
    const response = await fetch(`/api/cash_flows/?_t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('🔥 loadCashFlowsData: Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
      
    const responseData = await response.json();
    const data = responseData.data || responseData;
    
    console.log('🔥 loadCashFlowsData: Received data length:', data.length);
    console.log('🔥 loadCashFlowsData: First item:', data[0]);
      
    // עדכון הנתונים הגלובליים
    window.cashFlowsData = data;
    cashFlowsData = data;
    
    console.log('🔥 loadCashFlowsData: Calling updateCashFlowsTable...');
    // עדכון הטבלה (ראשוני לפני החלת סידור ברירת מחדל/מצב שמור)
    updateCashFlowsTable(data);
    console.log('🔥 loadCashFlowsData: updateCashFlowsTable completed');
    
    // החלת סידור ברירת מחדל לפי מערכת המיון הכללית (תאריך יורד כברירת מחדל)
    if (typeof window.applyDefaultSort === 'function') {
      try {
        await window.applyDefaultSort('cash_flows', data, updateCashFlowsTable);
        console.log('✅ loadCashFlowsData: applyDefaultSort executed for cash_flows');
      } catch (sortError) {
        console.warn('⚠️ loadCashFlowsData: applyDefaultSort failed, falling back to manual sort', sortError);
        applyFallbackDateSort(data);
      }
    } else {
      console.warn('⚠️ loadCashFlowsData: applyDefaultSort not available, using fallback sort');
      applyFallbackDateSort(data);
    }
    
    // Count records AFTER refresh
    const afterTableCount = data.length;
    console.log('📊 AFTER REFRESH: Table now has', afterTableCount, 'records');
    console.log('📊 CHANGE:', afterTableCount - beforeTableCount > 0 ? '+' : '', afterTableCount - beforeTableCount);
    
    // עדכון הסטטיסטיקות
    updatePageSummaryStats();
    
    console.log('✅ loadCashFlowsData: Loaded', data.length, 'cash flows');
    window.Logger.info(`✅ Loaded ${data.length} cash flows`, { page: 'cash_flows' });
  } catch (error) {
    console.error('❌ loadCashFlowsData: Error:', error);
    window.Logger.error('Error loading cash flows data', error, { page: 'cash_flows' });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בטעינת נתוני תזרימי מזומנים', error.message);
    }
  }
}

/**
 * Fallback sorting by date (newest first) in case the general system is unavailable
 * @function applyFallbackDateSort
 * @param {Array} data - Cash flows array
 */
function applyFallbackDateSort(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return;
  }

  try {
    const sortedData = [...data].sort((a, b) => {
      const aDate = a && a.date ? new Date(a.date) : new Date(0);
      const bDate = b && b.date ? new Date(b.date) : new Date(0);
      return bDate - aDate;
    });

    updateCashFlowsTable(sortedData);
    if (typeof window.saveSortState === 'function') {
      window.saveSortState('cash_flows', 3, 'desc');
    }
  } catch (error) {
    console.error('❌ applyFallbackDateSort: failed to sort data', error);
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

// REMOVED: toggleCashFlowsSection - use window.toggleSection('main') from ui-utils.js instead
// The HTML already uses toggleSection('main') and toggleSection('top')

// REMOVED: restoreCashFlowsSectionState - use window.restoreSectionStates() from ui-utils.js instead
// The global function handles section state restoration for all pages

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

// REMOVED: loadCashFlows - replaced by loadCashFlowsData
/**
 * טעינת תזרימי מזומנים מהשרת
 */
async function _REMOVED_loadCashFlows() {
  try {

    const response = await fetch('/api/cash_flows/');
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
 * Helper validation function for cash flow amount
 * @param {string|number} value - Amount value to validate
 * @returns {string|boolean} Error message or true if valid
 */
function validateCashFlowAmount(value) {
  const amount = parseFloat(value);
  if (isNaN(amount)) return 'יש להזין סכום תקין';
  if (amount === 0) return 'סכום לא יכול להיות 0';
  if (Math.abs(amount) > 10000000) return 'סכום גבוה מדי (מקסימום 10,000,000)';
  return true;
}

/**
 * Helper validation function for cash flow date
 * @param {string} value - Date value to validate
 * @returns {string|boolean} Error message or true if valid
 */
function validateCashFlowDate(value) {
  if (!value) return 'יש להזין תאריך';
  const date = new Date(value);
  const today = new Date();
  const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  const minDate = new Date(2000, 0, 1);
  
  if (date > maxDate) return 'תאריך לא יכול להיות יותר משנה קדימה';
  if (date < minDate) return 'תאריך לא יכול להיות לפני שנת 2000';
  return true;
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
        validation: validateCashFlowAmount
    },
    { 
      id: 'cashFlowDate', 
      name: 'תאריך',
      validation: validateCashFlowDate
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
        validation: validateCashFlowAmount
      },
    { 
      id: 'editCashFlowDate', 
      name: 'תאריך',
      validation: validateCashFlowDate
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
    // בדיקת פריטים מקושרים לפני חלון האישור
    if (typeof window.checkLinkedItemsBeforeAction === 'function') {
      const hasLinkedItems = await window.checkLinkedItemsBeforeAction('cash_flow', id, 'delete');
      if (hasLinkedItems) {
        // יש פריטים מקושרים - המודול כבר הוצג, לא נציג חלון אישור
        return;
      }
    }
    
    // אין פריטים מקושרים - המשך עם חלון האישור
    // Get cash flow details for confirmation message
    let cashFlowDetails = `תזרים מזומנים #${id}`;
    const cashFlow = window.cashFlowsData ? window.cashFlowsData.find(cf => cf.id === id) : null;
    
    if (!cashFlow) {
      window.showErrorNotification('שגיאה', 'תזרים המזומנים לא נמצא', 6000, 'system');
      return;
    }

    // Build detailed cash flow info
    const accountName = getAccountNameById(cashFlow.trading_account_id) || 'לא מוגדר';
    const type = getCashFlowTypeText(cashFlow.type);
    const amount = cashFlow.amount;
    const currency = cashFlow.currency_symbol || '';
    const date = formatDate(cashFlow.date);
    const description = cashFlow.description || 'ללא תיאור';
    
    cashFlowDetails = `${accountName} - ${type}, ${amount}${currency}, תאריך: ${date}, תיאור: ${description}`;

    // Show delete warning with detailed information
    if (window.showDeleteWarning) {
      window.showDeleteWarning('cash_flow', cashFlowDetails, 'תזרים מזומנים',
        async () => await performCashFlowDeletion(id),
        () => {}
      );
    } else {
      // Fallback to simple confirm
      if (!confirm('האם אתה בטוח שברצונך למחוק את תזרים המזומנים?')) {
        return;
      }
      await performCashFlowDeletion(id);
    }
    
  } catch (error) {
    console.error('❌ deleteCashFlow: Error occurred:', error);
    CRUDResponseHandler.handleError(error, 'מחיקת תזרים מזומנים');
  }
}

/**
 * Perform cash flow deletion
 * @function performCashFlowDeletion
 * @async
 * @param {number} id - Cash flow ID
 * @returns {Promise<void>}
 */
async function performCashFlowDeletion(id) {
  try {
    // Clear cache before deletion to ensure fresh data after reload
    if (window.unifiedCacheManager) {
      await window.unifiedCacheManager.clearByPattern('cash-flows-data');
      await window.unifiedCacheManager.clearByPattern('account-activity-data');
      await window.unifiedCacheManager.clearByPattern('account-activity-*');
      await window.unifiedCacheManager.clearByPattern('account-balance-*');
    }

    // שליחת בקשת מחיקה
    const response = await fetch(`/api/cash_flows/${id}`, {
      method: 'DELETE',
    });

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    await CRUDResponseHandler.handleDeleteResponse(response, {
      successMessage: 'תזרים המזומנים נמחק בהצלחה!',
      entityName: 'תזרים מזומנים',
      reloadFn: window.loadCashFlowsData,
      requiresHardReload: false
    });
  } catch (error) {
    console.error('❌ performCashFlowDeletion: Error occurred:', error);
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

    // הצגת סמל מטבע עם שימוש במערכת הכללית getCurrencyDisplay
    const currencyDisplay = resolveCurrencySymbolForCashFlow(cashFlow);

    // Check if this is a currency exchange
    const isExchange = isCurrencyExchange(cashFlow);
    const exchangeId = isExchange ? getExchangeIdFromCashFlow(cashFlow) : null;

    // קבלת סוג עם צבע
    let typeDisplay = isExchange ? '🔄 ' + getCashFlowTypeWithColor(cashFlow.type) : getCashFlowTypeWithColor(cashFlow.type);
    
    // Add trade link indicator if trade_id exists
    if (cashFlow.trade_id) {
      const tradeSymbol = cashFlow.trade_ticker_symbol || '';
      typeDisplay += ` <span class="badge bg-info" title="מקושר לטרייד #${cashFlow.trade_id}${tradeSymbol ? ' (' + tradeSymbol + ')' : ''}" style="font-size: 0.75em; margin-inline-start: 4px;">🔗</span>`;
    }

    // עיצוב סכום עם יישור נכון וצביעה
    // For exchanges, we need to show both amounts (from -> to)
    let amountDisplay = formatCashFlowAmount(cashFlow.amount, cashFlow.type, currencyDisplay);
    if (isExchange) {
      // For exchange, we need to fetch the "to" flow to show both amounts
      // For now, show the amount with exchange indicator
      // The full exchange details will be shown in details modal
      amountDisplay = `🔄 ${amountDisplay}`;
    }

    // עיצוב שער עם 2 ספרות אחרי הנקודה
    const rateDisplay = formatUsdRate(cashFlow.usd_rate);

    // Actions menu - different for exchanges
    const actionsMenu = isExchange ? 
      (() => {
        if (!window.createActionsMenu) return '<!-- Actions menu not available -->';
        const result = window.createActionsMenu([
          { type: 'VIEW', onclick: `showEntityDetails('cash_flow', ${cashFlow.id})`, title: 'הצג פרטי המרה' },
          { type: 'LINK', onclick: `window.showLinkedItemsModal && window.showLinkedItemsModal([], 'cash_flow', ${cashFlow.id})`, title: 'צפה בפריטים מקושרים' },
          { type: 'EDIT', onclick: `window.loadCurrencyExchange && window.loadCurrencyExchange('${exchangeId}').then(() => { window.ModalManagerV2 && window.ModalManagerV2.showModal('cashFlowModal', 'edit'); })`, title: 'ערוך המרת מטבע' },
          { type: 'DELETE', onclick: `window.deleteCurrencyExchange && window.deleteCurrencyExchange('${exchangeId}')`, title: 'מחק המרת מטבע' }
        ]);
        return result || '';
      })() :
      (() => {
        if (!window.createActionsMenu) return '<!-- Actions menu not available -->';
        const result = window.createActionsMenu([
          { type: 'VIEW', onclick: `showCashFlowDetails(${cashFlow.id})`, title: 'הצג פרטי תזרים' },
          { type: 'LINK', onclick: `window.showLinkedItemsModal && window.showLinkedItemsModal([], 'cash_flow', ${cashFlow.id})`, title: 'צפה בפריטים מקושרים' },
          { type: 'EDIT', onclick: `window.ModalManagerV2 && window.ModalManagerV2.showEditModal('cashFlowModal', 'cash_flow', ${cashFlow.id})`, title: 'ערוך תזרים' },
          { type: 'DELETE', onclick: `deleteCashFlow(${cashFlow.id})`, title: 'מחק תזרים' }
        ]);
        return result || '';
      })();

    const descriptionDisplay = (window.FieldRendererService && typeof window.FieldRendererService.renderTextPreview === 'function')
      ? window.FieldRendererService.renderTextPreview(cashFlow.description, { maxLength: 20, emptyPlaceholder: '-' })
      : (() => {
          const fallbackPlain = (cashFlow.description || '').replace(/<[^>]*>/g, '').trim();
          if (!fallbackPlain) {
            return '-';
          }
          const truncated = fallbackPlain.length > 20 ? `${fallbackPlain.substring(0, 20).trimEnd()}…` : fallbackPlain;
          const escape = (text) => String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
          return `<span class="text-truncate-preview" title="${escape(fallbackPlain)}">${escape(truncated)}</span>`;
        })();

            row.innerHTML = `
            <td class="col-account ticker-cell" data-account="${cashFlow.trading_account_id || accountName || ''}">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <button class="btn btn-sm" 
                      onclick="showEntityDetails('cash_flow', ${cashFlow.id})" 
                      title="פרטי תזרים" 
                      style="background-color: white; font-size: 0.8em;">
                        🔗
                    </button>
                    <span class="entity-trading_account-badge entity-account-badge" 
                          style="padding: 2px 8px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">
                        ${accountName}
                    </span>
                </div>
            </td>
            <td class="col-type type-cell" data-type="${cashFlow.type || ''}">${typeDisplay}</td>
            <td class="col-amount text-end">
                ${amountDisplay}
            </td>
            <td class="col-date" data-date="${cashFlow.date || ''}" style="text-align: center;">${formatDate(cashFlow.date)}</td>
            <td class="col-description">${descriptionDisplay}</td>
            <td class="col-source">${window.translateCashFlowSource ?
    window.translateCashFlowSource(cashFlow.source) :
    cashFlow.source}</td>
            <td class="col-actions actions-cell actions-4-items">
              ${actionsMenu}
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
 * Uses InfoSummarySystem from services/statistics-calculator.js
 */
function updatePageSummaryStats() {
  try {
    // Use global InfoSummarySystem if available
    if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS && window.INFO_SUMMARY_CONFIGS.cash_flows) {
      const config = window.INFO_SUMMARY_CONFIGS.cash_flows;
      window.InfoSummarySystem.calculateAndRender(cashFlowsData || [], config);
      window.Logger.debug('Page summary stats updated via InfoSummarySystem', { 
        count: cashFlowsData?.length || 0, 
        page: 'cash_flows' 
      });
    } else {
      // Fallback to local implementation if global system not available
      const countElement = document.getElementById('cashFlowsCount');
      if (countElement && cashFlowsData) {
        countElement.textContent = cashFlowsData.length;
      }
      
      const summaryElement = document.getElementById('cashFlowsSummary');
      if (summaryElement && cashFlowsData) {
        const totalAmount = cashFlowsData.reduce((sum, cf) => sum + (cf.amount || 0), 0);
        summaryElement.textContent = `סה"כ: ${cashFlowsData.length} תזרימים, ${totalAmount.toFixed(2)} ₪`;
      }
      
      window.Logger.warn('InfoSummarySystem not available - using fallback', { page: 'cash_flows' });
    }
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
    case 'dividend':
    case 'transfer_in':
    case 'other_positive':
      color = colors.positive;
      break;
    case 'withdrawal':
    case 'transfer_out':
    case 'fee':
    case 'other_negative':
      color = colors.negative;
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
  case 'dividend':
  case 'transfer_in':
  case 'other_positive':
    cssClass = 'numeric-value-positive';
    break;
  case 'withdrawal':
  case 'transfer_out':
  case 'fee':
  case 'other_negative':
    cssClass = 'numeric-value-negative';
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
 * Resolve currency symbol for cash flow rows using general currency display system
 * @function resolveCurrencySymbolForCashFlow
 * @param {Object} cashFlow - Cash flow record
 * @returns {string} Currency symbol (₪, $, € וכו')
 */
function resolveCurrencySymbolForCashFlow(cashFlow) {
  const fallbackSymbol = '$';
  if (!cashFlow || typeof cashFlow !== 'object') {
    return fallbackSymbol;
  }

  // Build minimal structure expected by getCurrencyDisplay (general system)
  const stubAccount = {
    currency_id: cashFlow.currency_id,
    currency: cashFlow.currency && typeof cashFlow.currency === 'object' ? cashFlow.currency : undefined
  };

  if (!stubAccount.currency && cashFlow.currency_symbol) {
    stubAccount.currency = { symbol: cashFlow.currency_symbol };
  }

  if (typeof window.getCurrencyDisplay === 'function') {
    try {
      const displaySymbol = window.getCurrencyDisplay(stubAccount);
      if (displaySymbol && displaySymbol !== '-' && typeof displaySymbol === 'string') {
        return displaySymbol;
      }
    } catch (error) {
      window.Logger && window.Logger.warn && window.Logger.warn('resolveCurrencySymbolForCashFlow failed via getCurrencyDisplay', { error, page: 'cash_flows' });
    }
  }

  const rawSymbol = cashFlow.currency_symbol || (cashFlow.currency && cashFlow.currency.symbol) || '';
  switch (rawSymbol) {
  case '$':
  case '₪':
  case '€':
  case '£':
  case '¥':
    return rawSymbol;
  case 'USD':
    return '$';
  case 'ILS':
    return '₪';
  case 'EUR':
    return '€';
  case 'GBP':
    return '£';
  case 'JPY':
    return '¥';
  default:
    return rawSymbol && rawSymbol.length === 1 ? rawSymbol : fallbackSymbol;
  }
}

/**
 * Format cash flow amount
 * @function formatCashFlowAmount
 * @param {number} amount - Amount to format
 * @param {string|null} type - Cash flow type (deposit/withdrawal/transfer/etc.)
 * @param {string} currencySymbol - Symbol to show
 * @returns {string} Formatted amount
 */
function formatCashFlowAmount(amount, type = null, currencySymbol = '$') {
  if (!amount && amount !== 0) {return '-';}

  const numAmount = Number(amount);
  if (Number.isNaN(numAmount)) {return '-';}

  const typeLower = type ? String(type).toLowerCase() : '';
  const positiveTypes = new Set(['deposit', 'dividend', 'transfer_in', 'other_positive']);
  const negativeTypes = new Set(['withdrawal', 'fee', 'transfer_out', 'other_negative']);

  let effectiveAmount = numAmount;
  if (typeLower) {
    if (positiveTypes.has(typeLower)) {
      effectiveAmount = Math.abs(numAmount);
    } else if (negativeTypes.has(typeLower)) {
      effectiveAmount = -Math.abs(numAmount);
    }
  }

  const baseAmount = window.FieldRendererService && typeof window.FieldRendererService.renderAmount === 'function'
    ? window.FieldRendererService.renderAmount(effectiveAmount, currencySymbol || '$', 0, true)
    : (() => {
        const absValue = Math.abs(effectiveAmount).toLocaleString('en-US', { maximumFractionDigits: 0, minimumFractionDigits: 0 });
        const sign = effectiveAmount < 0 ? '-' : (effectiveAmount > 0 ? '+' : '');
        const colorClass = effectiveAmount > 0 ? 'numeric-value-positive' : (effectiveAmount < 0 ? 'numeric-value-negative' : 'numeric-value-zero');
        const base = `${currencySymbol || '$'}${absValue}`;
        const display = sign ? `${sign}${base}` : base;
        return `<span class="${colorClass}" dir="ltr">${display}</span>`;
      })();

  if (window.getTableColors && typeof window.getTableColors === 'function') {
    const colors = window.getTableColors();
    const color = effectiveAmount >= 0 ? colors.positive : colors.negative;
    return baseAmount.replace('<span', `<span style="color: ${color};"`);
  }

  return baseAmount;
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
async function updateCashFlowsTable(cashFlows) {

  // עדכון הנתונים הגלובליים
  window.cashFlowsData = cashFlows;
  cashFlowsData = cashFlows;

  // רינדור הטבלה
  await renderCashFlowsTable();

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
        
        // החלת צבעי חשבונות מסחר - רק trading_account!
        if (entityColors.trading_account) {
          document.documentElement.style.setProperty('--trading-account-color', entityColors.trading_account);
          document.documentElement.style.setProperty('--trading-account-bg-color', entityColors.trading_account + '20');
        } else if (entityColors.account) {
          // DEPRECATED - should use trading_account!
          const error = new Error(`❌ DEPRECATED: entityColors.account is no longer supported. Use entityColors.trading_account instead!`);
          window.Logger.error('❌ DEPRECATED: entityColors.account used', { entityColors }, { page: "cash_flows" });
          console.error(error);
          throw error;
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
    // Ensure preferences are initialized before loading
    if (window.initializePreferencesWithLazyLoading && typeof window.initializePreferencesWithLazyLoading === 'function') {
      await window.initializePreferencesWithLazyLoading();
    }
    const preferences = await window.getAllPreferences();
    
    // החלת העדפות על העמוד
    if (preferences && typeof applyUserPreferences === 'function') {
    applyUserPreferences(preferences);
    }
    
    // החלת מערכת צבעים דינמית
    await applyDynamicColors();

    // טעינת מטבעות מהשרת
    await window.loadCurrenciesFromServer();

    // טעינת נתונים
    await loadCashFlowsData();

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

// REMOVED: window exports for removed functions
// Use window.toggleSection('main') instead of toggleCashFlowsSection
// Use window.restoreSectionStates() instead of restoreCashFlowsSectionState
// ===== MODAL FUNCTIONS - NEW SYSTEM =====

/**
 * Save cash flow - required by ModalManagerV2
 * @function saveCashFlow
 * @async
 * @returns {Promise<void>}
 */
async function saveCashFlow() {
    console.log('🔵 saveCashFlow CALLED');
    window.Logger.debug('saveCashFlow called', { page: 'cash_flows' });
    
    try {
        const modal = document.getElementById('cashFlowModal');
        const activeTabButton = modal ? modal.querySelector('#cashFlowModalTabs .nav-link.active') : null;
        const activeTabId = activeTabButton ? activeTabButton.getAttribute('data-tab-id') : null;
        if (activeTabId === 'exchange') {
            if (typeof window.saveCurrencyExchange === 'function') {
                return await window.saveCurrencyExchange();
            }
            window.Logger.warn('saveCashFlow invoked from exchange tab but saveCurrencyExchange missing', { page: 'cash_flows' });
            return;
        }

        // Count records BEFORE save
        const initialTableCount = cashFlowsData ? cashFlowsData.length : 0;
        console.log('📊 INITIAL STATE: Table has', initialTableCount, 'records');
        
        // CRUDResponseHandler will handle cache clearing automatically
        // No need to call clearCacheBeforeCRUD here
        
        // Collect form data using DataCollectionService
        const form = document.getElementById('cashFlowModalForm');
        if (!form) {
            throw new Error('Cash flow form not found');
        }
        console.log('🔵 saveCashFlow - Form found');
        
        const cashFlowData = DataCollectionService.collectFormData({
            amount: { id: 'cashFlowAmount', type: 'float' },
            type: { id: 'cashFlowType', type: 'text' },
            currency_id: { id: 'cashFlowCurrency', type: 'int' },
            trading_account_id: { id: 'cashFlowAccount', type: 'int' },  // Backend expects trading_account_id
            date: { id: 'cashFlowDate', type: 'dateOnly' },  // Backend expects Date only, not datetime
            description: { id: 'cashFlowDescription', type: 'rich-text', default: null },
            source: { id: 'cashFlowSource', type: 'text' },
            external_id: { id: 'cashFlowExternalId', type: 'text', default: '0' },
            trade_id: { id: 'trade_id', type: 'int', default: null }  // Optional link to trade
        });
        
        // Prepare data to send (trade_id is optional, can be null)
        const dataToSend = { ...cashFlowData };
        
        // ולידציה מפורטת
        let hasErrors = false;
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

        if (cashFlowData.description && cashFlowData.description.length > 5000) {
            if (window.showValidationWarning) {
                window.showValidationWarning('cashFlowDescription', 'תיאור התזרים חורג מהאורך המותר (5,000 תווים)');
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
            console.log('❌ saveCashFlow - Validation errors, returning');
            return;
        }
        
        console.log('✅ saveCashFlow - Validation passed');
        
        // Determine if this is add or edit
        const isEdit = form.dataset.mode === 'edit';
        const cashFlowId = form.dataset.cashFlowId;
        console.log('🔵 saveCashFlow - isEdit:', isEdit);
        
        // CRUDResponseHandler will handle cache clearing automatically
        // No need to call clearCacheBeforeCRUD here
        
        // Prepare API call
        const url = isEdit ? `/api/cash_flows/${cashFlowId}` : '/api/cash_flows';
        const method = isEdit ? 'PUT' : 'POST';
        console.log('🔵 saveCashFlow - Fetching to:', url, 'method:', method);
        console.log('🔵 saveCashFlow - Data to send:', dataToSend);
        console.log('🔵 saveCashFlow - Data to send (stringified):', JSON.stringify(dataToSend, null, 2));
        
        // Send to API
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend)
        });
        
        console.log('🔵 saveCashFlow - Fetch completed, response ok:', response.ok);
        console.log('🔵 saveCashFlow - Response status:', response.status);
        
        // Log response body for debugging (clone response first so it can be used later)
        let responseToHandle = response;
        if (!response.ok) {
            const responseClone = response.clone();
            const errorText = await responseClone.text();
            console.error('❌ saveCashFlow - Error response:', errorText);
            try {
                const errorJson = JSON.parse(errorText);
                console.error('❌ saveCashFlow - Error JSON:', errorJson);
            } catch (e) {
                console.error('❌ saveCashFlow - Error is not JSON:', errorText);
            }
            // Use original response for CRUDResponseHandler
            responseToHandle = response;
        }
        
        // CRUDResponseHandler handles ALL response processing including errors
        // No need to pre-check or call response.json() here
        if (isEdit) {
            console.log('🔵 saveCashFlow - Calling handleUpdateResponse...');
            await CRUDResponseHandler.handleUpdateResponse(responseToHandle, {
                modalId: 'cashFlowModal',
                successMessage: 'תזרים מזומן עודכן בהצלחה',
                entityName: 'תזרים מזומן',
                reloadFn: window.loadCashFlowsData,
                requiresHardReload: false  // Prevent reload confirmation dialog
            });
        } else {
            console.log('🔵 saveCashFlow - Calling handleSaveResponse...');
            await CRUDResponseHandler.handleSaveResponse(responseToHandle, {
                modalId: 'cashFlowModal',
                successMessage: 'תזרים מזומן נוסף בהצלחה',
                entityName: 'תזרים מזומן',
                reloadFn: window.loadCashFlowsData,
                requiresHardReload: false  // Prevent reload confirmation dialog
            });
        }
        
        console.log('🔵 saveCashFlow - CRUDResponseHandler completed');
        
    } catch (error) {
        console.error('❌ saveCashFlow - Error caught:', error);
        console.error('❌ saveCashFlow - Error message:', error.message);
        CRUDResponseHandler.handleError(error, 'שמירת תזרים מזומן');
    }
}

// ===== Currency Exchange Functions =====

/**
 * Save currency exchange - creates atomic exchange operation
 * @function saveCurrencyExchange
 * @async
 * @returns {Promise<void>}
 */
async function saveCurrencyExchange() {
    console.log('🔵 saveCurrencyExchange CALLED');
    window.Logger.debug('saveCurrencyExchange called', { page: 'cash_flows' });
    
    try {
        const form = document.getElementById('cashFlowModalForm');
        if (!form) {
            throw new Error('Cash flow form not found');
        }
        
        // Collect exchange form data
        const exchangeData = DataCollectionService.collectFormData({
            trading_account_id: { id: 'currencyExchangeAccount', type: 'int' },
            from_currency_id: { id: 'currencyExchangeFromCurrency', type: 'int' },
            to_currency_id: { id: 'currencyExchangeToCurrency', type: 'int' },
            from_amount: { id: 'currencyExchangeFromAmount', type: 'float' },
            exchange_rate: { id: 'currencyExchangeRate', type: 'float' },
            fee_amount: { id: 'currencyExchangeFeeAmount', type: 'float', default: 0 },
            date: { id: 'currencyExchangeDate', type: 'dateOnly' },
            description: { id: 'currencyExchangeDescription', type: 'rich-text', default: '' },
            source: { id: 'currencyExchangeSource', type: 'text', default: 'manual' },
            external_id: { id: 'currencyExchangeExternalId', type: 'text', default: '0' }
        });

        manageExternalIdField(exchangeData.source, 'exchange');
        const exchangeExternalIdField = document.getElementById('currencyExchangeExternalId');
        if (exchangeExternalIdField) {
            exchangeData.external_id = exchangeExternalIdField.value || '0';
        } else {
            exchangeData.external_id = exchangeData.external_id || '0';
        }

        if (typeof window.clearValidation === 'function') {
            window.clearValidation('cashFlowModalForm');
        }

        let validationResult = { isValid: true, errorMessages: [] };
        if (typeof window.validateEntityForm === 'function') {
            validationResult = window.validateEntityForm('cashFlowModalForm', [
                { id: 'currencyExchangeAccount', name: 'חשבון מסחר', rules: { required: true } },
                { id: 'currencyExchangeFromCurrency', name: 'מטבע מקור', rules: { required: true } },
                { id: 'currencyExchangeToCurrency', name: 'מטבע יעד', rules: { required: true } },
                { id: 'currencyExchangeFromAmount', name: 'סכום להמרה', rules: { required: true, min: 0.01 } },
                { id: 'currencyExchangeRate', name: 'שער המרה', rules: { required: true, min: 0.000001 } },
                { id: 'currencyExchangeFeeAmount', name: 'עמלה', rules: { required: false, min: 0 } },
                { id: 'currencyExchangeDate', name: 'תאריך', rules: { required: true } },
                { id: 'currencyExchangeSource', name: 'מקור', rules: { required: true } }
            ]);
        }

        if (!validationResult.isValid) {
            const firstError = validationResult.errorMessages?.[0] || 'נא להשלים את כל השדות הנדרשים';
            if (typeof window.showSimpleErrorNotification === 'function') {
                window.showSimpleErrorNotification('שגיאת ולידציה', firstError);
            } else if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאת ולידציה', firstError, 'error');
            }
            return;
        }

        // Cross-field validation: different currencies
        if (exchangeData.from_currency_id === exchangeData.to_currency_id) {
            if (typeof window.showFieldError === 'function') {
                window.showFieldError('currencyExchangeToCurrency', 'מטבע יעד חייב להיות שונה ממטבע המקור');
            }
            if (typeof window.showSimpleErrorNotification === 'function') {
                window.showSimpleErrorNotification('שגיאת ולידציה', 'מטבע יעד חייב להיות שונה ממטבע המקור');
            } else if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאת ולידציה', 'מטבע יעד חייב להיות שונה ממטבע המקור', 'error');
            }
            return;
        }

        // Ensure calculated to amount is positive
        const toAmountField = document.getElementById('currencyExchangeToAmount');
        let calculatedToAmount = toAmountField ? parseFloat(toAmountField.value) : NaN;
        if (isNaN(calculatedToAmount) || calculatedToAmount <= 0) {
            calculatedToAmount = (exchangeData.from_amount || 0) * (exchangeData.exchange_rate || 0);
            if (toAmountField) {
                toAmountField.value = calculatedToAmount ? calculatedToAmount.toFixed(6) : '';
            }
        }
        if (!calculatedToAmount || calculatedToAmount <= 0) {
            if (typeof window.showFieldError === 'function') {
                window.showFieldError('currencyExchangeToAmount', 'סכום מומר חייב להיות גדול מ-0');
            }
            if (typeof window.showSimpleErrorNotification === 'function') {
                window.showSimpleErrorNotification('שגיאת ולידציה', 'לא ניתן לחשב סכום מומר תקין');
            } else if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאת ולידציה', 'לא ניתן לחשב סכום מומר תקין', 'error');
            }
            return;
        }

        exchangeData.to_amount = calculatedToAmount;
        exchangeData.fee_amount = exchangeData.fee_amount || 0;

        // Normalize external ID for manual source
        if (exchangeData.external_id === null || exchangeData.external_id === undefined || exchangeData.external_id === '') {
            exchangeData.external_id = '0';
        }
        if (exchangeData.source === 'manual') {
            exchangeData.external_id = '0';
        }

        // Additional description length check
        if (exchangeData.description && exchangeData.description.length > 5000) {
            if (typeof window.showFieldError === 'function') {
                window.showFieldError('currencyExchangeDescription', 'תיאור ההמרה חורג מהאורך המותר (5,000 תווים)');
            }
            if (typeof window.showSimpleErrorNotification === 'function') {
                window.showSimpleErrorNotification('שגיאת ולידציה', 'תיאור ההמרה חורג מהאורך המותר (5,000 תווים)');
            }
            return;
        }
        
        // Align fee currency with trading account base currency
        let accountCurrencyId = null;
        if (exchangeData.trading_account_id) {
            try {
                const accountResponse = await fetch(`/api/trading-accounts/${exchangeData.trading_account_id}`);
                if (accountResponse.ok) {
                    const accountData = await accountResponse.json();
                    if (accountData.status === 'success' && accountData.data) {
                        accountCurrencyId = accountData.data.currency_id || null;
                    }
                }
            } catch (error) {
                console.error('❌ saveCurrencyExchange - Failed to load account currency:', error);
            }
        }

        if (exchangeData.trading_account_id && !accountCurrencyId) {
            if (typeof window.showSimpleErrorNotification === 'function') {
                window.showSimpleErrorNotification('שגיאת ולידציה', 'לא ניתן לטעון את מטבע הבסיס של חשבון המסחר');
            } else if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאת ולידציה', 'לא ניתן לטעון את מטבע הבסיס של חשבון המסחר', 'error');
            }
            return;
        }

        exchangeData.fee_currency_id = accountCurrencyId;

        // Check if this is edit mode
        const isEdit = form.dataset.mode === 'edit';
        const exchangeId = form.dataset.exchangeId;
        
        const url = isEdit ? `/api/cash_flows/exchange/${exchangeId}` : '/api/cash_flows/exchange';
        const method = isEdit ? 'PUT' : 'POST';
        
        console.log('🔵 saveCurrencyExchange - Fetching to:', url, 'method:', method);
        console.log('🔵 saveCurrencyExchange - Data to send:', exchangeData);
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(exchangeData)
        });
        
        let responseToHandle = response;
        if (!response.ok) {
            const responseClone = response.clone();
            const errorText = await responseClone.text();
            console.error('❌ saveCurrencyExchange - Error response:', errorText);
            responseToHandle = response;
        }
        
        if (isEdit) {
            await CRUDResponseHandler.handleUpdateResponse(responseToHandle, {
                modalId: 'cashFlowModal',
                successMessage: 'המרת מטבע עודכנה בהצלחה',
                entityName: 'המרת מטבע',
                reloadFn: window.loadCashFlowsData,
                requiresHardReload: false
            });
        } else {
            await CRUDResponseHandler.handleSaveResponse(responseToHandle, {
                modalId: 'cashFlowModal',
                successMessage: 'המרת מטבע נוצרה בהצלחה',
                entityName: 'המרת מטבע',
                reloadFn: window.loadCashFlowsData,
                requiresHardReload: false
            });
        }
        
    } catch (error) {
        console.error('❌ saveCurrencyExchange - Error caught:', error);
        CRUDResponseHandler.handleError(error, 'שמירת המרת מטבע');
    }
}

/**
 * Load currency exchange for editing
 * @function loadCurrencyExchange
 * @async
 * @param {string} exchangeId - Exchange UUID
 * @returns {Promise<void>}
 */
async function loadCurrencyExchange(exchangeId) {
    try {
        console.log('🔵 loadCurrencyExchange - Loading exchange:', exchangeId);
        
        const response = await fetch(`/api/cash_flows/exchange/${exchangeId}`);
        if (!response.ok) {
            throw new Error('Failed to load currency exchange');
        }
        
        const result = await response.json();
        if (result.status !== 'success' || !result.data) {
            throw new Error('Invalid response from server');
        }
        
        const exchangeData = result.data;
        const fromFlow = exchangeData.from_flow;
        const toFlow = exchangeData.to_flow;
        const feeAmount = exchangeData.fee_amount ?? (fromFlow ? Math.abs(fromFlow.fee_amount || 0) : 0);
        
        // Populate form fields
        const accountField = document.getElementById('currencyExchangeAccount');
        if (accountField) {
            accountField.value = fromFlow.trading_account_id;
        }
        if (document.getElementById('currencyExchangeFromCurrency')) {
            document.getElementById('currencyExchangeFromCurrency').value = fromFlow.currency_id;
        }
        if (document.getElementById('currencyExchangeToCurrency')) {
            document.getElementById('currencyExchangeToCurrency').value = toFlow.currency_id;
        }
        if (document.getElementById('currencyExchangeFromAmount')) {
            document.getElementById('currencyExchangeFromAmount').value = Math.abs(fromFlow.amount);
        }
        if (document.getElementById('currencyExchangeRate')) {
            document.getElementById('currencyExchangeRate').value = exchangeData.exchange_rate;
        }
        if (document.getElementById('currencyExchangeFeeAmount')) {
            document.getElementById('currencyExchangeFeeAmount').value = feeAmount;
        }
        // Note: fee currency is now a label, not a select field - it's updated automatically based on account
        if (document.getElementById('currencyExchangeSource')) {
            document.getElementById('currencyExchangeSource').value = fromFlow.source || 'manual';
        }
        if (document.getElementById('currencyExchangeExternalId')) {
            const externalField = document.getElementById('currencyExchangeExternalId');
            externalField.value = fromFlow.external_id || '0';
            manageExternalIdField((fromFlow.source || 'manual'), 'exchange');
        }
        if (document.getElementById('currencyExchangeDate')) {
            document.getElementById('currencyExchangeDate').value = fromFlow.date;
        }
        const descriptionContent = fromFlow.description || '';
        if (window.RichTextEditorService && typeof window.RichTextEditorService.setContent === 'function') {
            window.RichTextEditorService.setContent('currencyExchangeDescription', descriptionContent);
        } else {
            const descriptionField = document.getElementById('currencyExchangeDescription');
            if (descriptionField) {
                descriptionField.value = descriptionContent;
            }
        }
        
        // Set exchange ID in form
        const form = document.getElementById('cashFlowModalForm');
        if (form) {
            form.dataset.exchangeId = exchangeId;
            form.dataset.mode = 'edit';
        }
        
        // Trigger toAmount calculation and update fee currency label
        if (window.calculateCurrencyExchangeToAmount) {
            window.calculateCurrencyExchangeToAmount();
        }
        
        // Update fee currency label based on account
        if (accountField) {
            accountField.dispatchEvent(new Event('change'));
        }

        if (window.updateCurrencyExchangeDescription) {
            window.updateCurrencyExchangeDescription();
        }
        
        console.log('✅ loadCurrencyExchange - Exchange loaded successfully');
        
    } catch (error) {
        console.error('❌ loadCurrencyExchange - Error:', error);
        if (window.showNotification) {
            window.showNotification('שגיאה', 'שגיאה בטעינת פרטי המרת מטבע', 'error');
        }
    }
}

/**
 * Delete currency exchange
 * @function deleteCurrencyExchange
 * @async
 * @param {string} exchangeId - Exchange UUID
 * @returns {Promise<void>}
 */
async function deleteCurrencyExchange(exchangeId) {
    try {
        if (!confirm('האם אתה בטוח שברצונך למחוק את המרת המטבע? פעולה זו תמחק את כל הרשומות המקושרות.')) {
            return;
        }
        
        console.log('🔵 deleteCurrencyExchange - Deleting exchange:', exchangeId);
        
        const response = await fetch(`/api/cash_flows/exchange/${exchangeId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete currency exchange');
        }
        
        const result = await response.json();
        if (result.status === 'success') {
            if (window.showNotification) {
                window.showNotification('הצלחה', 'המרת מטבע נמחקה בהצלחה', 'success');
            }
            // Reload cash flows
            if (window.loadCashFlowsData) {
                await window.loadCashFlowsData();
            }
        } else {
            throw new Error(result.error?.message || 'Failed to delete currency exchange');
        }
        
    } catch (error) {
        console.error('❌ deleteCurrencyExchange - Error:', error);
        if (window.showNotification) {
            window.showNotification('שגיאה', `שגיאה במחיקת המרת מטבע: ${error.message}`, 'error');
        }
    }
}

/**
 * Check if cash flow is part of currency exchange
 * @function isCurrencyExchange
 * @param {Object} cashFlow - Cash flow object
 * @returns {boolean}
 */
function isCurrencyExchange(cashFlow) {
    if (!cashFlow || !cashFlow.external_id) {
        return false;
    }
    return cashFlow.external_id.startsWith('exchange_');
}

/**
 * Get exchange UUID from cash flow
 * @function getExchangeIdFromCashFlow
 * @param {Object} cashFlow - Cash flow object
 * @returns {string|null}
 */
function getExchangeIdFromCashFlow(cashFlow) {
    if (!isCurrencyExchange(cashFlow)) {
        return null;
    }
    return cashFlow.external_id.replace('exchange_', '');
}

// Export save function for ModalManagerV2
window.saveCashFlow = saveCashFlow;
window.saveCurrencyExchange = saveCurrencyExchange;
window.updateCashFlow = updateCashFlow;
window.loadCurrencyExchange = loadCurrencyExchange;
window.deleteCurrencyExchange = deleteCurrencyExchange;
window.isCurrencyExchange = isCurrencyExchange;
window.getExchangeIdFromCashFlow = getExchangeIdFromCashFlow;

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
  let fieldId = 'cashFlowExternalId';
  switch (modalType) {
  case 'edit':
    fieldId = 'editCashFlowExternalId';
    break;
  case 'exchange':
  case 'exchange-edit':
    fieldId = 'currencyExchangeExternalId';
    break;
  default:
    fieldId = 'cashFlowExternalId';
  }
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

  const exchangeSourceField = document.getElementById('currencyExchangeSource');
  if (exchangeSourceField) {
    exchangeSourceField.addEventListener('change', function () {
      manageExternalIdField(this.value, 'exchange');
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

  const exchangeSourceField = document.getElementById('currencyExchangeSource');
  if (exchangeSourceField) {
    manageExternalIdField(exchangeSourceField.value, 'exchange');
  }
}

// פונקציות מודל חדשות - מערכת ModalManagerV2
// REMOVED: showAddCashFlowModal - use window.ModalManagerV2.showModal('cashFlowModal', 'add') directly
// Wrapper function removed - call ModalManagerV2 directly from HTML or code

// REMOVED: showEditCashFlowModal - use window.ModalManagerV2.showEditModal('cashFlowModal', 'cash_flow', cashFlowId) directly
// Wrapper function removed - call ModalManagerV2 directly from HTML or code

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
    // Use ModalManagerV2 directly
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.showEditModal === 'function') {
        window.ModalManagerV2.showEditModal('cashFlowModal', 'cash_flow', id);
    } else {
        window.Logger?.error('ModalManagerV2 לא זמין', { page: "cash_flows" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'מערכת המודלים לא זמינה. אנא רענן את הדף.');
        }
    }
}


// ===== TRADE AND TRADE PLAN LOADING FUNCTIONS =====

// REMOVED: loadTradesForCashFlow - not used, ModalManagerV2 uses SelectPopulatorService
/**
 * Load trades for cash flow modals
 * @param {string} selectId - ID של ה-select element
 */
async function _REMOVED_loadTradesForCashFlow(selectId) {
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

// REMOVED: loadTradePlansForCashFlow - not used, ModalManagerV2 uses SelectPopulatorService
/**
 * Load trade plans for cash flow modals
 * @param {string} selectId - ID של ה-select element
 */
async function _REMOVED_loadTradePlansForCashFlow(selectId) {
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
window.performCashFlowDeletion = performCashFlowDeletion;
// REMOVED: window exports for removed modal wrapper functions
// Use window.ModalManagerV2.showModal('cashFlowModal', 'add') directly
// Use window.ModalManagerV2.showEditModal('cashFlowModal', 'cash_flow', cashFlowId) directly
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

// REMOVED: generateDetailedLogForCashFlows - not used, use global generateDetailedLog from logger-service.js
// Local  function for cash_flows page
async function _REMOVED_generateDetailedLogForCashFlows() {
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
// REMOVED: window.toggleCashFlowsSection - use window.toggleSection('main') instead
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
// REMOVED: window exports for removed modal wrapper functions
// Use window.ModalManagerV2.showModal('cashFlowModal', 'add') directly
// Use window.ModalManagerV2.showEditModal('cashFlowModal', 'cash_flow', cashFlowId) directly
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
// REMOVED: window exports for removed modal wrapper functions
// Use window.ModalManagerV2.showModal('cashFlowModal', 'add') directly
// Use window.ModalManagerV2.showEditModal('cashFlowModal', 'cash_flow', cashFlowId) directly
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
