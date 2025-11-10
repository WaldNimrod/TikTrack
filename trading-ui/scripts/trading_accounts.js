/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 38
 * 
 * DATA LOADING (6)
 * - loadDefaultTradingAccounts() - loadDefaultTradingAccounts function
 * - loadTradingAccountsData() - * Load default trading accounts
 * - loadTradingAccounts() - * Update trading accounts summary
 * - loadTradingAccountsDataForTradingAccountsPage() - loadTradingAccountsDataForTradingAccountsPage function
 * - getTradingAccountName() - * בדיקת פריטים מקושרים לפני ביטול חשבון מסחר
 * - getTradingAccounts() - * Generate detailed log for trading accounts page
 * 
 * DATA MANIPULATION (14)
 * - updateTradingAccountsTable() - updateTradingAccountsTable function
 * - updateTradingAccountsSummary() - updateTradingAccountsSummary function
 * - updateTradingAccountFilterDisplayText() - updateTradingAccountFilterDisplayText function
 * - deleteTradingAccountFromAPI() - deleteTradingAccountFromAPI function
 * - deleteTradingAccount() - deleteTradingAccount function
 * - confirmDeleteTradingAccount() - * Show success message
 * - updateTradingAccountFilterMenu() - updateTradingAccountFilterMenu function
 * - deleteTradingAccountWithLinkedItemsCheck() - deleteTradingAccountWithLinkedItemsCheck function
 * - checkLinkedItemsAndDeleteTradingAccount() - checkLinkedItemsAndDeleteTradingAccount function
 * - checkLinkedItemsBeforeDeleteTradingAccount() - * בדיקת פריטים מקושרים לפני ביטול חשבון מסחר
 * - updateTradingAccount() - * בדיקת פריטים מקושרים לפני מחיקת חשבון מסחר מסחר
 * - showAddTradingAccountModal() - showAddTradingAccountModal function
 * - saveTradingAccount() - * Show add trading account modal
 * - deleteTradingAccount() - deleteTradingAccount function
 * 
 * EVENT HANDLING (4)
 * - restoreTradingAccountsSectionState() - restoreTradingAccountsSectionState function
 * - performTradingAccountCancellation() - * בדיקת מקושרים וביצוע ביטול חשבון מסחר מסחר
 * - performTradingAccountDeletion() - * בדיקת מקושרים וביצוע מחיקת חשבון מסחר מסחר
 * - performTradingAccountDeletion() - performTradingAccountDeletion function
 * 
 * UI UPDATES (3)
 * - showOpenTradesWarning() - * Show error message
 * - showTradingAccountDetails() - showTradingAccountDetails function
 * - showEditTradingAccountModal() - * Show add trading account modal
 * 
 * VALIDATION (3)
 * - cancelTradingAccountWithLinkedItemsCheck() - cancelTradingAccountWithLinkedItemsCheck function
 * - checkLinkedItemsAndCancelTradingAccount() - checkLinkedItemsAndCancelTradingAccount function
 * - checkLinkedItemsBeforeCancelTradingAccount() - checkLinkedItemsBeforeCancelTradingAccount function
 * 
 * OTHER (6)
 * - cancelTradingAccount() - * הצגת מודל חשבון מסחר מסחר (הוספה או עריכה)
 * - filterTradingAccountsLocally() - filterTradingAccountsLocally function
 * - restoreTradingAccount() - restoreTradingAccount function
 * - sortTable() - sortTable function
 * - generateDetailedLog() - * Sort table
 * 
 * ==========================================
 */
/**
 * Trading Accounts Page - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains all functions for managing trading accounts including:
 * - CRUD operations for trading accounts
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

/* ===== מערכת ניהול חשבונות מסחר ===== */
window.Logger.info('📁 trading_accounts.js נטען - מתחיל אתחול', { page: "trading_accounts" });

// Import getCurrencyDisplay from data-utils.js
if (typeof window.getCurrencyDisplay !== 'function') {
  window.Logger.warn('⚠️ getCurrencyDisplay not available, using fallback', { page: "trading_accounts" });
  window.getCurrencyDisplay = function(account) {
    try {
    if (account.currency_symbol) {
      switch (account.currency_symbol) {
        case 'USD': return '$';
        case 'ILS': return '₪';
        case 'EUR': return '€';
        case 'GBP': return '£';
        default: return account.currency_symbol;
      }
    }
    return '$'; // ברירת מחדל
    } catch (error) {
      console.error('getCurrencyDisplay failed:', error);
      return '$'; // ברירת מחדל במקרה של שגיאה
    }
  };
}

// ייצוא מוקדם של הפונקציה למניעת שגיאות
window.loadTradingAccountsDataForTradingAccountsPage = window.loadTradingAccountsDataForTradingAccountsPage || function() {
  // loadTradingAccountsDataForTradingAccountsPage not yet defined, using placeholder
  window.Logger.info('⚠️ loadTradingAccountsDataForTradingAccountsPage placeholder called', { page: "trading_accounts" });
};

// הגדרת הפונקציה המלאה מיד אחרי ה-placeholder
window.loadTradingAccountsDataForTradingAccountsPage = async function() {
  console.log('🚀🚀🚀 loadTradingAccountsDataForTradingAccountsPage התחיל 🚀🚀🚀');
  window.Logger.info('🚀🚀🚀 loadTradingAccountsDataForTradingAccountsPage התחיל 🚀🚀🚀', { page: "trading_accounts" });
  window.Logger.info('🔍 בדיקת זמינות פונקציות:', { page: "trading_accounts" });
  window.Logger.info('  - apiCall:', typeof window.apiCall, { page: "trading_accounts" });
  window.Logger.info('  - updateTradingAccountsTable:', typeof window.updateTradingAccountsTable, { page: "trading_accounts" });
  try {
    // טעינת נתונים מהשרת
    let trading_accounts;
    if (typeof window.loadTradingAccountsDataFromAPI === 'function') {
      window.Logger.info('📡 משתמש ב-loadTradingAccountsDataFromAPI', { page: "trading_accounts" });
      trading_accounts = await window.loadTradingAccountsDataFromAPI();
    } else {
      window.Logger.info('📡 משתמש ב-loadTradingAccountsData', { page: "trading_accounts" });
      trading_accounts = await loadTradingAccountsData();
    }
    
    window.Logger.info('📊 נתונים שהתקבלו:', trading_accounts ? trading_accounts.length : 0, 'חשבונות מסחר', { page: "trading_accounts" });
    if (trading_accounts && Array.isArray(trading_accounts) && trading_accounts.length > 0) {
      window.Logger.info('📊 דוגמה לנתונים (2 ראשונים):', JSON.stringify(trading_accounts.slice(0, 2)), { page: "trading_accounts" });
    } else if (trading_accounts && Array.isArray(trading_accounts) && trading_accounts.length === 0) {
      window.Logger.warn('⚠️ המערך ריק - אין חשבונות מסחר להצגה', { page: "trading_accounts" });
    }

    // בדיקה שהנתונים תקינים
    if (!trading_accounts || !Array.isArray(trading_accounts)) {
      window.Logger.warn('⚠️ נתונים לא תקינים התקבלו מהשרת:', trading_accounts, { page: "trading_accounts" });
      // במקום לזרוק שגיאה, נשתמש בנתוני דמו
      trading_accounts = [];
    }

    // העשרת הנתונים ביתרות כדי למנוע קריאות חוזרות בזמן סידור
    const accountIds = Array.isArray(trading_accounts) ? trading_accounts.map(account => account.id).filter(Boolean) : [];
    let balancesMap = new Map();
    if (accountIds.length > 0) {
      try {
        balancesMap = await loadAccountBalancesBatch(accountIds);
      } catch (balanceError) {
        window.Logger?.error('❌ שגיאה בטעינת יתרות לחשבונות:', balanceError, { page: "trading_accounts" });
      }
    }

    const accountsWithBalances = enrichAccountsWithBalances(trading_accounts, balancesMap);

    // שמירת הנתונים במשתנים גלובליים
    window.tradingAccountsBalancesMap = balancesMap;
    window.trading_accountsData = accountsWithBalances;
    window.allTradingAccountsData = accountsWithBalances;
    window.Logger.info('💾 נתונים נשמרו ב-window.trading_accountsData:', accountsWithBalances.length, 'חשבונות מסחר', { page: "trading_accounts" });

    // החלת פילטרים על הנתונים
    let filteredTradingAccounts = [...accountsWithBalances];

    // בדיקה אם יש פילטרים פעילים
    const hasActiveFilters = window.selectedStatusesForFilter && window.selectedStatusesForFilter.length > 0 ||
      window.selectedTypesForFilter && window.selectedTypesForFilter.length > 0 ||
      window.selectedDateRangeForFilter && window.selectedDateRangeForFilter !== 'כל זמן' ||
      window.searchTermForFilter && window.searchTermForFilter.trim() !== '';

    if (hasActiveFilters) {
      if (typeof window.filterDataByFilters === 'function') {
        filteredTradingAccounts = window.filterDataByFilters(trading_accounts, 'trading_accounts');
      } else {
        // פונקציה מקומית לפילטור אם הפונקציה הגלובלית לא זמינה
        const statuses = window.selectedStatusesForFilter;
        const types = window.selectedTypesForFilter;
        const dateRange = window.selectedDateRangeForFilter;
        const searchTerm = window.searchTermForFilter;
        filteredTradingAccounts = filterTradingAccountsLocally(trading_accounts, statuses, types, dateRange, searchTerm);
      }
    }

    window.Logger.info('🔍 נתונים מסוננים:', filteredTradingAccounts.length, 'חשבונות מסחר', { page: "trading_accounts" });
    window.filteredTradingAccountsData = filteredTradingAccounts;

    await syncTradingAccountsPagination(filteredTradingAccounts);

    // Initialize account activity system with default account selection
    if (typeof window.initAccountActivity === 'function') {
      window.Logger.info('🔄 מאתחל מערכת תנועות חשבון עם חשבון ברירת מחדל', { page: "trading_accounts" });
      window.initAccountActivity(true); // true = auto-select default account from preferences
    } else {
      window.Logger.warn('⚠️ initAccountActivity לא זמין', { page: "trading_accounts" });
    }

    // עדכון סטטיסטיקות (async)
    console.log('🔍 Checking updateTradingAccountsSummary availability...', typeof window.updateTradingAccountsSummary);
    if (typeof window.updateTradingAccountsSummary === 'function') {
      console.log('📈 Calling updateTradingAccountsSummary with', filteredTradingAccounts.length, 'accounts');
      window.Logger.info('📈 מעדכן את סטטיסטיקות החשבונות המסחר', { page: "trading_accounts" });
      await window.updateTradingAccountsSummary(filteredTradingAccounts);
      console.log('✅ updateTradingAccountsSummary completed');
    } else {
      console.warn('⚠️ updateTradingAccountsSummary לא זמין');
      window.Logger.warn('⚠️ updateTradingAccountsSummary לא זמין', { page: "trading_accounts" });
    }

    // עדכון מונה הטבלה
    const countElement = document.getElementById('accountsCount');
    if (countElement) {
      countElement.textContent = `${filteredTradingAccounts.length} חשבונות מסחר`;
    }

    // Restore page state (filters, sort, sections, entity filters)
    await restorePageState('trading_accounts');

    window.Logger.info('✅ loadTradingAccountsDataForTradingAccountsPage הושלם בהצלחה', { page: "trading_accounts", keepInfo: true });

  } catch (error) {
    window.Logger.error('❌ שגיאה ב-loadTradingAccountsDataForTradingAccountsPage:', error, { page: "trading_accounts" });
    
    // הצגת הודעת שגיאה למשתמש
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בטעינת נתוני חשבונות מסחר', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בטעינת נתוני חשבונות מסחר', 'error');
    } else {
      alert('שגיאה בטעינת נתוני חשבונות מסחר: ' + error.message);
    }
  }
};


/*
 * קובץ זה מכיל את כל הפונקציות הקשורות לניהול חשבונות מסחר
 * כולל טעינת נתונים, עדכון טבלאות, מודלים ופעולות CRUD
 *
 * הערה חשובה:
 * - פונקציות פילטר כלליות (updateTradingAccountFilterMenu, updateTradingAccountFilterText) הועברו לקובץ grid-filters.js
 * - פונקציות שירות (getTradingAccounts, isTradingAccountsLoaded) הועברו לקובץ trading-account-service.js
 * - קובץ זה נועד לשרת רק את עמוד trading_accounts.html
 *
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (global utilities and sorting functions)
 * - translation-utils.js (translation functions)
 * - header-system.js (header and filter functionality)
 *
 * Table Mapping:
 * - Uses 'trading_accounts' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 *
 * תכולת הקובץ:
 * - loadTradingAccountsFromServer: טעינת חשבונות מסחר מהשרת
 * - updateTradingAccountsTable: עדכון טבלת חשבונות מסחר
 * - showAddTradingAccountModal: הצגת מודל הוספת חשבון מסחר מסחר
 * - createTradingAccount: יצירת חשבון מסחר מסחר חדש
 * - updateTradingAccountFromModal: עדכון חשבון מסחר מסחר קיים
 * - deleteTradingAccount: מחיקת חשבון מסחר מסחר
 * - פונקציות ניהול חשבונות מלאות (CRUD, מודלים, מחיקה, ביטול)
 *
 * שימוש: נטען רק בעמוד trading_accounts.html לניהול חשבונות
 * תלויות: Bootstrap (למודלים), fetch API, grid-filters.js (לפונקציות פילטר)
 */

// קובץ ייעודי לניהול חשבונות - נטען רק בדפים שצריכים חשבונות

// משתנים גלובליים לחשבונות
window.trading_accountsData = [];
window.trading_accountsLoaded = false;
window.currenciesData = [];
window.currenciesLoaded = false;
let tradingAccountsPaginationInstance = null;

// פונקציה לטעינת מטבעות מהשרת
async function loadCurrenciesFromServer() {
  try {
    const token = await window.unifiedCacheManager?.get('authToken') || localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

     // Use relative URL to work with both development (8080) and production (5001)
     const response = await fetch('/api/currencies/', {
      method: 'GET',
      headers,
    });

    if (response.ok) {
      const responseData = await response.json();
      const currencies = responseData.data || responseData;
      window.currenciesData = currencies;
      window.currenciesLoaded = true;
    } else {
      // טעינת מטבעות ברירת מחדל
      window.currenciesData = [
        { id: 1, symbol: 'USD', name: 'US Dollar', usd_rate: '1.000000' },
      ];
      window.currenciesLoaded = true;
    }

  } catch {
    // טעינת מטבעות ברירת מחדל
    window.currenciesData = [
      { id: 1, symbol: 'USD', name: 'US Dollar', usd_rate: '1.000000' },
    ];
    window.currenciesLoaded = true;
  }
}

// פונקציה עזר להצגת מטבע (לא בשימוש כרגע)
// function getCurrencyDisplay(tradingAccount) {
//   if (account.currency_symbol) {
//     // אם יש סמל מטבע מהשרת
//     switch (account.currency_symbol) {
//     case 'USD': return '$';
//     case 'ILS': return '₪';
//     case 'EUR': return '€';
//     case 'GBP': return '£';
//     default: return account.currency_symbol;
//     }
//   } else if (account.currency_id && window.currenciesData.length > 0) {
//     // אם יש רק currency_id, נחפש את המטבע
//     const currency = window.currenciesData.find(c => c.id === account.currency_id);
//     if (currency) {
//       switch (currency.symbol) {
//       case 'USD': return '$';
//       case 'ILS': return '₪';
//       case 'EUR': return '€';
//       case 'GBP': return '£';
//       default: return currency.symbol;
//       }
//     }
//   } else if (account.currency && account.currency.symbol) {
//     // fallback למטבע הישן
//     switch (account.currency.symbol) {
//     case 'USD': return '$';
//     case 'ILS': return '₪';
//     case 'EUR': return '€';
//     case 'GBP': return '£';
//     default: return currency.symbol;
//     }
//   }
//   return '$'; // ברירת מחדל
// }

// פונקציה ליצירת אפשרויות מטבע בטופס
async function generateCurrencyOptions(tradingAccount = null) {
  // שימוש ב-SelectPopulatorService למילוי מטבעות
  const selectId = 'currency_id';
  const options = {
    includeEmpty: false,
    defaultFromPreferences: true
  };
  
  if (tradingAccount) {
    options.defaultText = `${tradingAccount.currency_name || 'דולר אמריקאי'} (${tradingAccount.currency_symbol || 'USD'})`;
  }
  
  await SelectPopulatorService.populateCurrenciesSelect(selectId, options);
}

// פונקציה לטעינת חשבונות מהשרת
async function loadTradingAccountsFromServer() {
  window.Logger.info('🚀🚀🚀 loadTradingAccountsFromServer התחיל 🚀🚀🚀', { page: "trading_accounts" });
  try {
    // בדיקה אם יש token שמור
    const token = await window.unifiedCacheManager?.get('authToken') || localStorage.getItem('authToken');
    window.Logger.info('🔑 Token זמין:', !!token, { page: "trading_accounts" });

    if (!token) {
      window.Logger.info('⚠️ אין token - מנסה לטעון ללא הרשאה', { page: "trading_accounts" });
    }

    // Fetching trading_accounts from server
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    window.Logger.info('📡 שליחת בקשה ל-API:', '/api/trading-accounts/', { page: "trading_accounts" });
    const response = await fetch('/api/trading-accounts/', {
      method: 'GET',
      headers,
    });
    
    window.Logger.info('📡 תגובת שרת:', response.status, response.ok, { page: "trading_accounts" });

    if (response.ok) {
      const responseData = await response.json();
      window.Logger.info('📊 נתונים גולמיים מהשרת:', responseData, { page: "trading_accounts" });

      // טיפול במבנה התשובה - יכול להיות ישירות מערך או בתוך data
      const allTradingAccounts = responseData.data || responseData;
      window.Logger.info('📊 כל החשבונות המסחר:', allTradingAccounts.length, 'חשבונות', { page: "trading_accounts" });

      // סינון רק חשבונות בסטטוס open
      const openTradingAccounts = allTradingAccounts.filter(tradingAccount => tradingAccount.status === 'open');
      window.Logger.info('📊 חשבונות מסחר פתוחים:', openTradingAccounts.length, 'חשבונות', { page: "trading_accounts" });
      
      window.trading_accountsData = openTradingAccounts;
      window.trading_accountsLoaded = true;

      // קריאה לעדכון התפריט
      if (typeof window.updateTradingAccountFilterMenu === 'function') {
        window.updateTradingAccountFilterMenu(openTradingAccounts);
      }

      // החזרת הנתונים לטעינה חוזרת
      return openTradingAccounts;
    } else {
      window.Logger.warn('⚠️ תגובת שרת לא תקינה:', response.status, { page: "trading_accounts" });
      loadDefaultTradingAccounts();
    }

  } catch (error) {
    window.Logger.error('❌ שגיאה בטעינת חשבונות מהשרת:', error, { page: "trading_accounts" });
    loadDefaultTradingAccounts();
  }
}

// פונקציה לטעינת כל החשבונות מהשרת (לפילטר)
async function loadAllTradingAccountsFromServer() {
  try {
    const token = await window.unifiedCacheManager?.get('authToken') || localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/trading-accounts/', {
      method: 'GET',
      headers,
    });

    if (response.ok) {
      const responseData = await response.json();
      const allTradingAccounts = responseData.data || responseData;

      // סינון רק חשבונות בסטטוס open
      const openTradingAccounts = allTradingAccounts.filter(tradingAccount => tradingAccount.status === 'open');

      // שמירת החשבונות הפתוחים במשתנה גלובלי
      window.allTradingAccountsData = openTradingAccounts;
      window.trading_accountsData = openTradingAccounts; // גם עבור הפילטר

      // עדכון הפילטר עם החשבונות הפתוחים (אם הפונקציה קיימת)
      if (typeof window.updateTradingAccountFilterMenu === 'function') {
        window.updateTradingAccountFilterMenu(openTradingAccounts);
      } else {
        // updateTradingAccountFilterMenu not available yet, trying direct update
        // ניסיון לעדכן ישירות
      }

      // החזרת הנתונים לטעינה חוזרת
      return openTradingAccounts;
    } else {
      // Error loading all trading_accounts from server, status
      return [];
    }

  } catch {
    // Error loading all trading_accounts from server
    return [];
  }
}

/**
 * Load default trading accounts
 * @function loadDefaultTradingAccounts
 * @returns {void}
 */
function loadDefaultTradingAccounts() {
  try {
  // Loading default trading_accounts - no dummy data
  window.trading_accountsData = [];
  window.trading_accountsLoaded = true;
  if (typeof window.updateTradingAccountFilterMenu === 'function') {
    window.updateTradingAccountFilterMenu(window.trading_accountsData);
    }
  } catch (error) {
    console.error('loadDefaultTradingAccounts failed:', error);
    window.trading_accountsData = [];
    window.trading_accountsLoaded = true;
  }
}

// הפונקציות הכלליות לפילטר חשבונות הועברו ל-grid-filters.js

// פונקציה לקבלת חשבונות מסחר נטענים - הועברה ל-trading-account-service.js

// פונקציה לבדיקה אם חשבונות המסחר נטענו - הועברה ל-trading-account-service.js
// function isTradingAccountsLoaded() {
//   return window.trading_accountsLoaded || false;
// }

// פונקציה לטעינת נתוני חשבונות מסחר מהשרת
async function loadTradingAccountsData() {
  window.Logger.info('Loading trading accounts data (bypass cache)', { page: "trading_accounts" });
  try {
    // קריאה ישירה לשרת עם timestamp למניעת cache
    const response = await fetch(`/api/trading-accounts/?_t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    const trading_accounts = result.data || result;
    
    // Note: Don't call updateTradingAccountsTable here - that's the responsibility
    // of loadTradingAccountsDataForTradingAccountsPage to avoid infinite loops
    
    window.Logger.info(`✅ Loaded ${trading_accounts.length} trading accounts`, { page: "trading_accounts" });
    return trading_accounts;
  } catch (error) {
    window.Logger.error('Error loading trading accounts data', error, { page: "trading_accounts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בטעינת נתוני חשבונות מסחר', error.message);
    }
    throw error;
  }
}

/**
 * Load account balance from API
 * @param {number} accountId - Trading account ID
 * @returns {Promise<Object|null>} Balance data including base_currency_total and balances_by_currency, or null on error
 */
async function loadAccountBalance(accountId) {
  try {
    const response = await fetch(`/api/account-activity/${accountId}/balances`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.status === 'success') {
      return result.data;
    } else {
      throw new Error(result.error?.message || 'Failed to load balance');
    }
  } catch (error) {
    if (window.Logger) {
      window.Logger.error(`❌ שגיאה בטעינת יתרה לחשבון ${accountId}:`, error, { page: "trading_accounts" });
    } else {
      console.error(`❌ שגיאה בטעינת יתרה לחשבון ${accountId}:`, error);
    }
    return null;
  }
}

/**
 * Load balances for multiple accounts in batch
 * @param {Array<number>} accountIds - Array of trading account IDs
 * @returns {Promise<Map<number, Object>>} Map of accountId -> balance data
 */
async function loadAccountBalancesBatch(accountIds) {
  const balanceMap = new Map();
  if (!accountIds || accountIds.length === 0) {
    return balanceMap;
  }
  // Load balances in parallel using Promise.all
  const promises = accountIds.map(async (accountId) => {
    const balance = await loadAccountBalance(accountId);
    if (balance) {
      balanceMap.set(accountId, balance);
    }
  });
  await Promise.all(promises);
  return balanceMap;
}

function getCurrencySymbol(currencyValue) {
  if (!currencyValue) {
    return '$';
  }

  const valueUpper = typeof currencyValue === 'string' ? currencyValue.toUpperCase() : currencyValue;

  switch (valueUpper) {
    case '$':
    case '₪':
    case '€':
    case '£':
    case '¥':
      return currencyValue;
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
      return currencyValue;
  }
}

function enrichAccountsWithBalances(accounts, balancesMap) {
  return accounts.map(account => {
    const balanceData = balancesMap?.get(account.id);
    const baseCurrency = balanceData?.base_currency || account.base_currency_symbol || account.currency_symbol || account.currency;
    const baseCurrencySymbol = getCurrencySymbol(baseCurrency);

    return {
      ...account,
      cash_balance: balanceData?.base_currency_total ?? account.cash_balance ?? 0,
      base_currency_symbol: baseCurrencySymbol,
      balance_details: balanceData || null,
    };
  });
}

async function syncTradingAccountsPagination(accountsData) {
  const safeAccounts = Array.isArray(accountsData) ? accountsData : [];

  if (typeof window.updateTableWithPagination === 'function') {
    try {
      tradingAccountsPaginationInstance = await window.updateTableWithPagination({
        tableId: 'accountsTable',
        tableType: 'trading_accounts',
        data: safeAccounts,
        render: async (pageData, context) => {
          updateTradingAccountsTable(pageData);
          if (window.setPageTableData) {
            window.setPageTableData('trading_accounts', pageData, {
              tableId: 'accountsTable',
              pageInfo: context?.pageInfo,
            });
          }
        },
        onFilteredDataChange: ({ filteredData }) => {
          if (typeof window.updateTradingAccountsSummary === 'function') {
            window.updateTradingAccountsSummary(Array.isArray(filteredData) ? filteredData : []);
          }
          const countElement = document.getElementById('accountsCount');
          if (countElement) {
            const count = Array.isArray(filteredData) ? filteredData.length : 0;
            countElement.textContent = `${count} חשבונות מסחר`;
          }
        },
      });
      return;
    } catch (error) {
      window.Logger?.warn('syncTradingAccountsPagination: falling back to direct render', { error, page: 'trading_accounts' });
    }
  }

  if (window.setTableData) {
    window.setTableData('trading_accounts', safeAccounts, { tableId: 'accountsTable' });
    window.setFilteredTableData?.('trading_accounts', safeAccounts, { tableId: 'accountsTable', skipPageReset: true });
  }

  updateTradingAccountsTable(safeAccounts);
}

/**
 * Update trading accounts table
 * @function updateTradingAccountsTable
 * @param {Array} trading_accounts - Trading accounts array
 * @returns {void}
 */
// משתנה למניעת עדכונים כפולים
let isUpdatingTradingAccountsTable = false;

function updateTradingAccountsTable(trading_accounts) {
  if (isUpdatingTradingAccountsTable) {
    window.Logger.warn('⚠️ updateTradingAccountsTable כבר רץ - דילוג על עדכון', { page: "trading_accounts" });
    return;
  }

  isUpdatingTradingAccountsTable = true;

  try {
    window.Logger.info('🚀🚀🚀 updateTradingAccountsTable התחיל עם', trading_accounts ? trading_accounts.length : 0, 'חשבונות 🚀🚀🚀', { page: "trading_accounts" });

    if (!Array.isArray(trading_accounts)) {
      window.Logger.error('❌ פרמטר חשבונות לא תקין:', trading_accounts, { page: "trading_accounts" });
      handleValidationError('updateTradingAccountsTable', 'פרמטר חשבונות לא תקין');
      return;
    }

    const tbody = document.querySelector('#accountsTable tbody');
    if (!tbody) {
      window.Logger.warn('⚠️ לא נמצא tbody לטבלת חשבונות - ייתכן שהדף לא נטען עדיין', { page: "trading_accounts" });
      return;
    }

    if (trading_accounts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">אין חשבונות מסחר להצגה</td></tr>';
      const countElement = document.getElementById('accountsCount');
      if (countElement) {
        countElement.textContent = '0 חשבונות';
      }
      if (typeof window.hideLoadingState === 'function') {
        window.hideLoadingState();
      }
      return;
    }

    tbody.innerHTML = trading_accounts.map(tradingAccount => {
      const balanceValue = typeof tradingAccount.cash_balance === 'number' ? tradingAccount.cash_balance : 0;
      const currencySymbol = getCurrencySymbol(tradingAccount.base_currency_symbol || tradingAccount.currency_symbol || tradingAccount.currency || '$');

      return `
      <tr data-trading-account-id="${tradingAccount.id}">
        <td class="ticker-cell" data-tradingAccount="${tradingAccount.name || '-'}">
          <div class="table-cell-flex">
            <button class="btn actions-menu-item"
                    data-button-type="VIEW"
                    data-variant="small"
                    data-onclick="window.showEntityDetails('trading_account', ${tradingAccount.id}, { mode: 'view' })"
                    title="פרטי חשבון מסחר"
                    aria-label="פרטי חשבון מסחר"></button>
            <span class="entity-trading-account-badge entity-badge-base">
              ${tradingAccount.name || '-'}
            </span>
          </div>
        </td>
        <td>${tradingAccount.currency_symbol || tradingAccount.currency || '-'}</td>
        <td>
          ${window.renderAmount ? window.renderAmount(balanceValue, currencySymbol, 0, true) : `${balanceValue.toLocaleString('en-US', { maximumFractionDigits: 0, minimumFractionDigits: 0 })} ${currencySymbol}`}
        </td>
        <td><span class="text-muted fst-italic">בפיתוח</span></td>
        <td><span class="text-muted fst-italic">בפיתוח</span></td>
        <td class="status-cell" data-status="${tradingAccount.status || ''}">
          ${window.renderStatus ? window.renderStatus(tradingAccount.status, 'trading_account') : `<span class="status-${tradingAccount.status}">${tradingAccount.status}</span>`}
        </td>
        <td class="actions-cell">
          ${window.createActionsMenu ? window.createActionsMenu([
            { type: 'VIEW', onclick: `window.showEntityDetails('trading_account', ${tradingAccount.id}, { mode: 'view' })`, title: 'צפה בפרטי חשבון מסחר' },
            { type: 'EDIT', onclick: `window.showEditTradingAccountModalById(${tradingAccount.id})`, title: 'ערוך' },
            { type: tradingAccount.status === 'cancelled' ? 'REACTIVATE' : 'CANCEL', onclick: `window.${tradingAccount.status === 'cancelled' ? 'reactivate' : 'cancel'}Account && window.${tradingAccount.status === 'cancelled' ? 'reactivate' : 'cancel'}Account(${tradingAccount.id})`, title: tradingAccount.status === 'cancelled' ? 'הפעל מחדש' : 'בטל' },
            { type: 'DELETE', onclick: `window.deleteTradingAccountWithLinkedItemsCheck && window.deleteTradingAccountWithLinkedItemsCheck(${tradingAccount.id})`, title: 'מחק' }
          ]) : `
          <button data-button-type="VIEW" data-variant="small" data-onclick="window.showEntityDetails('trading_account', ${tradingAccount.id}, { mode: 'view' })" title="צפה בפרטי חשבון מסחר"></button>
          <button data-button-type="EDIT" data-variant="small" data-onclick="window.showEditTradingAccountModalById(${tradingAccount.id})" title="ערוך"></button>
          <button data-button-type="${tradingAccount.status === 'cancelled' ? 'REACTIVATE' : 'CANCEL'}" data-variant="small" data-onclick="window.${tradingAccount.status === 'cancelled' ? 'reactivate' : 'cancel'}Account && window.${tradingAccount.status === 'cancelled' ? 'reactivate' : 'cancel'}Account(${tradingAccount.id})" title="${tradingAccount.status === 'cancelled' ? 'הפעל מחדש' : 'בטל'}"></button>
          <button data-button-type="DELETE" data-variant="small" data-onclick="window.deleteTradingAccountWithLinkedItemsCheck && window.deleteTradingAccountWithLinkedItemsCheck(${tradingAccount.id})" title="מחק"></button>
          `}
        </td>
      </tr>
      `;
    }).join('');

    const countElement = document.getElementById('accountsCount');
    if (countElement) {
      countElement.textContent = `${trading_accounts.length} חשבונות`;
    }

    if (typeof window.hideLoadingState === 'function') {
      window.hideLoadingState();
    }

    window.Logger.info('✅ טבלת חשבונות עודכנה בהצלחה עם', trading_accounts.length, 'חשבונות', { page: "trading_accounts", keepInfo: true });
    window.Logger.info('🔍 tbody.innerHTML אחרי עדכון:', tbody.innerHTML.length, 'תווים', { page: "trading_accounts" });
    window.Logger.info('🔍 מספר שורות בטבלה:', tbody.children.length, { page: "trading_accounts" });
  } catch (error) {
    window.Logger.error('❌ שגיאה ב-updateTradingAccountsTable:', error, { page: "trading_accounts" });
    if (typeof window.hideLoadingState === 'function') {
      window.hideLoadingState();
    }
    const tbody = document.querySelector('#accountsTable tbody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="color: #dc3545;">⚠️ שגיאה בעדכון הטבלה: ${error.message}</td></tr>`;
    }
  } finally {
    isUpdatingTradingAccountsTable = false;
  }
}

/**
 * Update trading accounts summary
 * @function updateTradingAccountsSummary
 * @param {Array} trading_accounts - Trading accounts array
 * @returns {void}
 */
async function updateTradingAccountsSummary(trading_accounts) {
  const accountsArray = Array.isArray(trading_accounts)
    ? trading_accounts
    : (window.TableDataRegistry ? window.TableDataRegistry.getFilteredData('trading_accounts') : window.trading_accountsData || []);

  console.log('🔍 updateTradingAccountsSummary called with:', { count: accountsArray?.length, hasSystem: !!window.InfoSummarySystem, hasConfigs: !!window.INFO_SUMMARY_CONFIGS });
  try {
    // מערכת מאוחדת לסיכום נתונים
    if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS) {
      const config = window.INFO_SUMMARY_CONFIGS.trading_accounts;
      console.log('✅ Using InfoSummarySystem with config:', config);
      await window.InfoSummarySystem.calculateAndRender(accountsArray, config);
    } else {
      console.warn('⚠️ InfoSummarySystem not available, using fallback');
      // מערכת סיכום נתונים לא זמינה - חישוב ידני
      const summaryStatsElement = document.getElementById('summaryStats');
      if (summaryStatsElement && accountsArray) {
        // חישוב סטטיסטיקות בסיסיות
        const totalAccounts = accountsArray.length;
        const activeAccounts = accountsArray.filter(acc => acc.status === 'open').length;
        const openAccounts = accountsArray.filter(acc => acc.status === 'open').length;
        
        // טעינת יתרות מכל החשבונות (עם טיפול בשגיאות)
        let balancesMap = window.tradingAccountsBalancesMap instanceof Map ? window.tradingAccountsBalancesMap : new Map();
        if (!(balancesMap instanceof Map)) {
          balancesMap = new Map();
        }

        if (balancesMap.size === 0 && accountsArray.length > 0) {
          const accountIds = accountsArray.map(acc => acc.id);
          try {
            if (typeof window.loadAccountBalancesBatch === 'function') {
              balancesMap = await window.loadAccountBalancesBatch(accountIds);
            } else if (typeof loadAccountBalancesBatch === 'function') {
              balancesMap = await loadAccountBalancesBatch(accountIds);
            } else {
              window.Logger?.warn('⚠️ loadAccountBalancesBatch לא זמינה, משתמש בערכי ברירת מחדל', { page: "trading_accounts" });
            }
          } catch (balanceError) {
            window.Logger?.error('❌ שגיאה בטעינת יתרות לסיכום:', balanceError, { page: "trading_accounts" });
            balancesMap = new Map();
          }
        }
        
        // חישוב סה"כ יתרה במטבע בסיס
        let totalBaseCurrencyBalance = 0;
        let baseCurrencySymbol = '$';
        
        // Helper function to convert currency code to symbol
        const getCurrencySymbol = (currencyCode) => {
          if (!currencyCode || currencyCode.length <= 1) return currencyCode || '$';
          switch (currencyCode.toUpperCase()) {
            case 'USD': return '$';
            case 'ILS': return '₪';
            case 'EUR': return '€';
            case 'GBP': return '£';
            case 'JPY': return '¥';
            default: return currencyCode; // If already a symbol, return as is
          }
        };
        
        accountsArray.forEach(account => {
          const balanceData = balancesMap.get(account.id);
          if (balanceData) {
            totalBaseCurrencyBalance += balanceData.base_currency_total || 0;
            // נשתמש במטבע הבסיס של החשבון הראשון (או USD כברירת מחדל)
            if (balanceData.base_currency) {
              baseCurrencySymbol = getCurrencySymbol(balanceData.base_currency);
            }
          }
        });
        
        // עדכון התצוגה
        summaryStatsElement.innerHTML = `
          <div>סה"כ חשבונות: <strong id="totalAccounts">${totalAccounts}</strong></div>
          <div>חשבונות פעילים: <strong id="activeAccounts">${activeAccounts}</strong></div>
          <div>חשבונות פתוחים: <strong id="openAccounts">${openAccounts}</strong></div>
          <div>סה"כ יתרה: <strong id="totalBalance">${window.renderAmount ? window.renderAmount(totalBaseCurrencyBalance, baseCurrencySymbol, 0, false) : `${totalBaseCurrencyBalance.toLocaleString('en-US', { maximumFractionDigits: 0, minimumFractionDigits: 0 })} ${baseCurrencySymbol}`}</strong></div>
        `;
      } else if (summaryStatsElement) {
        summaryStatsElement.innerHTML = `
          <div class="error-message">
            ⚠️ מערכת סיכום נתונים לא זמינה - נא לרענן את הדף
          </div>
        `;
      }
    }
  } catch (error) {
    window.Logger?.error('❌ שגיאה ב-updateTradingAccountsSummary:', error, { page: "trading_accounts" });
    // לא נזרוק את השגיאה - פשוט נראה שהסיכום לא עודכן
  }
}

/**
 * פונקציה לטעינת חשבונות - מתאימה לעבוד עם designs.html
 * הפונקציה טוענת נתונים ומעדכנת את הטבלה
 */
async function loadTradingAccounts() {
  try {
    // טוען חשבונות

    // קריאה לפונקציה מ-trading_accounts.js
    if (typeof window.loadTradingAccountsDataFromAPI === 'function') {
      const trading_accounts = await window.loadTradingAccountsDataFromAPI();
      await updateTradingAccountsTable(trading_accounts);
    } else {
      const trading_accounts = await loadTradingAccountsData();
      await updateTradingAccountsTable(trading_accounts);
    }

  } catch (error) {
    handleApiError(error, 'טעינת חשבונות');
    const tbody = document.querySelector('.content-section:nth-child(2) tbody');
    if (tbody) {
      const errorText = `שגיאה בטעינת חשבונות: ${error.message}`;
      const errorHtml = `<tr><td colspan="8" class="text-center text-danger">${errorText}</td></tr>`;
      tbody.innerHTML = errorHtml;
    }

    const countElement = document.querySelector('.content-section:nth-child(2) .table-count');
    if (countElement) {
      countElement.textContent = 'שגיאה';
    }
  }
}

/**
 * עדכון טבלת חשבונות בדף designs.html
 * הפונקציה מעדכנת את הטבלה השנייה (חשבונות) בדף designs.html
 *
 * @param {Array} trading_accounts - מערך של חשבונות
 */

/**
 * Update trading account filter display text
 * @function updateTradingAccountFilterDisplayText
 * @returns {void}
 */
function updateTradingAccountFilterDisplayText() {
  try {
  const appHeader = document.querySelector('app-header');
  if (!appHeader || !appHeader.shadowRoot) {
    return;
  }

  const tradingAccountMenu = appHeader.shadowRoot.getElementById('tradingAccountFilterMenu');
  if (!tradingAccountMenu) {
    return;
  }

  const tradingAccountToggle = appHeader.shadowRoot.getElementById('tradingAccountFilterToggle');
  if (!tradingAccountToggle) {
    return;
  }

  const selectedText = tradingAccountToggle.querySelector('.selected-trading-account-text');
  if (!selectedText) {
    return;
  }

  // קבלת החשבונות הנבחרים
  const selectedTradingAccounts = window.selectedTradingAccountsForFilter || [];

  if (selectedTradingAccounts.length === 0) {
    selectedText.textContent = 'כל החשבונות';
  } else if (selectedTradingAccounts.length === 1) {
    selectedText.textContent = selectedTradingAccounts[0];
  } else {
    selectedText.textContent = `${selectedTradingAccounts.length} נבחרו`;
    }
  } catch (error) {
    console.error('updateTradingAccountFilterDisplayText failed:', error);
  }
}

// ייצוא הפונקציות לשימוש גלובלי
window.loadTradingAccountsFromServer = loadTradingAccountsFromServer;
window.loadAllTradingAccountsFromServer = loadAllTradingAccountsFromServer;
window.loadDefaultTradingAccounts = loadDefaultTradingAccounts;
// הערה: updateTradingAccountFilterMenu מיוצאת מ-grid-filters.js
window.updateTradingAccountFilterDisplayText = updateTradingAccountFilterDisplayText;
// window.getTradingAccounts = getTradingAccounts; // הועבר ל-trading-account-service.js
// window.isTradingAccountsLoaded = isTradingAccountsLoaded; // הועבר ל-trading-account-service.js
window.loadTradingAccountsData = loadTradingAccountsData;
window.updateTradingAccountsTable = updateTradingAccountsTable;
window.updateTradingAccountsSummary = updateTradingAccountsSummary;
window.loadTradingAccounts = loadTradingAccounts;

// פונקציה גלובלית לעדכון ידני של תפריט החשבונות
window.refreshTradingAccountFilterMenu = function () {
  try {
    if (window.trading_accountsData && window.trading_accountsData.length > 0) {
      if (typeof window.updateTradingAccountFilterMenu === 'function') {
        window.updateTradingAccountFilterMenu(window.trading_accountsData);
      }
    } else {
      loadTradingAccountsFromServer();
    }
  } catch (error) {
    console.error('refreshTradingAccountFilterMenu failed:', error);
  }
};

// פונקציה לבדיקת מצב החשבונות
window.checkTradingAccountsStatus = function () {
  try {
    const appHeader = document.querySelector('app-header');
    if (appHeader) {
      const tradingAccountMenu = appHeader.shadowRoot.getElementById('tradingAccountFilterMenu');
      if (tradingAccountMenu) {
        const items = tradingAccountMenu.querySelectorAll('.trading-account-filter-item');
        // TradingAccount menu items count
        items.forEach(() => {
          // const accountName = item.getAttribute('data-account'); // Not used
          // Item details
        });
      } else {
        // TradingAccount menu not found in shadow DOM
      }
    } else {
      // App header not found
    }
    // END TRADING ACCOUNTS STATUS CHECK
  } catch (error) {
    console.error('checkTradingAccountsStatus failed:', error);
  }
};

// פונקציה זמנית לעדכון תפריט החשבונות
window.updateTradingAccountFilterMenuDirectly = function (trading_accounts) {
  // UPDATE TRADING ACCOUNT FILTER MENU DIRECTLY
  // TradingAccounts received

  // חיפוש התפריט בתוך האפ-הדר (Shadow DOM)
  const appHeader = document.querySelector('app-header');
  if (!appHeader || !appHeader.shadowRoot) {
    return;
  }

  const tradingAccountMenu = appHeader.shadowRoot.getElementById('tradingAccountFilterMenu');
  if (!tradingAccountMenu) {
    return;
  }

  // ניקוי התפריט הקיים
  tradingAccountMenu.innerHTML = '';

  // הוספת אופציית "כל החשבונות"
  const allTradingAccountsItem = document.createElement('div');
  allTradingAccountsItem.className = 'trading-account-filter-item selected';
  allTradingAccountsItem.setAttribute('data-account', 'all');
  allTradingAccountsItem.innerHTML = `
    <span class="option-text">כל החשבונות</span>
    <span class="check-mark">✓</span>
  `;
  tradingAccountMenu.appendChild(allTradingAccountsItem);

  // הוספת החשבונות מהשרת
  if (trading_accounts && trading_accounts.length > 0) {
    trading_accounts.forEach(tradingAccount => {
      const tradingAccountItem = document.createElement('div');
      tradingAccountItem.className = 'trading-account-filter-item';
      tradingAccountItem.setAttribute('data-account', tradingAccount.id || tradingAccount.name);
      tradingAccountItem.innerHTML = `
        <span class="option-text">${tradingAccount.name || tradingAccount.account_name || 'Unknown'}</span>
        <span class="check-mark">✓</span>
      `;
      tradingAccountMenu.appendChild(tradingAccountItem);
    });
  }

};

// פונקציה גלובלית לבדיקה מהירה
window.debugTradingAccountsFilter = function () {
  // בדיקת מצב החשבונות
  window.checkTradingAccountsStatus();

  // בדיקה מהירה של השרת
  fetch('/api/trading-accounts/')
    .then(response => response.json())
    .then(data => {
      const trading_accounts = data.data || data;
      const openTradingAccounts = trading_accounts.filter(acc => acc.status === 'open');

      // ניסיון לעדכן תפריט ישירות
      if (typeof window.updateTradingAccountFilterMenu === 'function') {
        window.updateTradingAccountFilterMenu(openTradingAccounts);
      }
    })
    .catch(() => {
      // Server error handled silently
    });

  // ניסיון לטעון חשבונות
  if (typeof window.loadAllTradingAccountsFromServer === 'function') {
    window.loadAllTradingAccountsFromServer().then(() => {
      window.checkTradingAccountsStatus();
    }).catch(() => {
      // Error loading trading_accounts handled silently
    });
  }

  // ניסיון לעדכן תפריט
  setTimeout(() => {
    if (typeof window.refreshTradingAccountFilterMenu === 'function') {
      window.refreshTradingAccountFilterMenu();
      setTimeout(() => {
        window.checkTradingAccountsStatus();
      }, 500);
    }
  }, 1000);
};

// טעינת מטבעות בתחילת הטעינה
if (typeof loadCurrenciesFromServer === 'function') {
  loadCurrenciesFromServer();
}

// ===== פונקציות נוספות לניהול חשבונות =====

/**
 * הצגת מודל חשבון מסחר מסחר (הוספה או עריכה)
 * @param {string} mode - 'add' או 'edit'
 * @param {Object} [tradingAccount] - אובייקט החשבון מסחר המסחר (נדרש רק בעריכה)
 */

/**
 * מחיקת חשבון מסחר מסחר מהשרת
 * @param {number} tradingAccountId - מזהה החשבון מסחר המסחר
 * @param {string} accountName - שם החשבון מסחר
 */
async function deleteTradingAccountFromAPI(tradingAccountId, tradingAccountName) {
  try {
    const response = await fetch(`/api/trading-accounts/${tradingAccountId}`, {
      method: 'DELETE',
    });

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    await CRUDResponseHandler.handleDeleteResponse(response, {
      successMessage: `החשבון מסחר "${tradingAccountName}" נמחק בהצלחה!`,
      apiUrl: '/api/trading-accounts/',
      entityName: 'חשבון מסחר מסחר',
      reloadFn: window.loadTradingAccountsData,
      requiresHardReload: false
    });

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'מחיקת חשבון מסחר');
  }
}

/**
 * ביטול חשבון מסחר מסחר (שינוי סטטוס למבוטל)
 * @param {number} tradingAccountId - מזהה החשבון מסחר המסחר
 * @param {string} accountName - שם החשבון מסחר
 */
async function cancelTradingAccount(tradingAccountId, tradingAccountName) {

  // בדיקה ראשונה
  if (window.showCancelWarning) {
    await new Promise(resolve => {
      window.showCancelWarning('חשבון מסחר', tradingAccountName,
        () => {
          // בדיקה שנייה
          if (window.showCancelWarning) {
            window.showCancelWarning('חשבון מסחר', tradingAccountName,
              () => resolve(true),
              () => resolve(false),
            );
          } else {
            if (typeof window.showConfirmationDialog === 'function') {
              window.showConfirmationDialog('אישור',
                `הסטטוס ישתנה ל"מבוטל". האם אתה בטוח שברצונך להמשיך בביטול החשבון מסחר "${accountName}"?`,
                () => resolve(true),
                () => resolve(false)
              );
            } else {
              resolve(false);
            }
          }
        },
        () => resolve(false),
      );
    }).then(confirmed => {
      if (!confirmed) {return;}
    });
  } else {
    // גיבוי למערכת הישנה
    if (typeof window.showCancelWarning === 'function') {
      const confirmed = await new Promise(resolve => {
        window.showCancelWarning('חשבון מסחר', tradingAccountName,
          () => resolve(true),
          () => resolve(false),
        );
      });
      if (!confirmed) {return;}
    } else {
      if (typeof window.showConfirmationDialog === 'function') {
        const confirmed = await new Promise(resolve => {
          window.showConfirmationDialog(
            'ביטול חשבון מסחר',
            `האם אתה בטוח שברצונך לבטל את החשבון מסחר "${accountName}"?\n\nהסטטוס ישתנה ל"מבוטל".`,
            () => resolve(true),
            () => resolve(false),
          );
        });
        if (!confirmed) {return;}
      } else {
        if (typeof window.showConfirmationDialog === 'function') {
          const confirmed = await new Promise(resolve => {
            window.showConfirmationDialog(
              'ביטול חשבון מסחר',
              `האם אתה בטוח שברצונך לבטל את החשבון מסחר "${accountName}"?\n\nהסטטוס ישתנה ל"מבוטל".`,
              () => resolve(true),
              () => resolve(false),
            );
          });
          if (!confirmed) {return;}
        } else {
          // Fallback למקרה שמערכת התראות לא זמינה
          if (window.showConfirmationDialog) {
            const confirmed = await new Promise(resolve => {
              window.showConfirmationDialog(
                'ביטול חשבון מסחר',
                `האם אתה בטוח שברצונך לבטל את החשבון מסחר "${accountName}"?`,
                () => resolve(true),
                () => resolve(false)
              );
            });
            if (!confirmed) return;
          } else {
            const confirmed = typeof showConfirmationDialog === 'function' ? 
              await new Promise(resolve => {
                showConfirmationDialog(
                  `האם אתה בטוח שברצונך לבטל את החשבון מסחר "${accountName}"?`,
                  () => resolve(true),
                  () => resolve(false),
                  'ביטול חשבון מסחר',
                  'בטל',
                  'חזור'
                );
              }) : 
              window.confirm(`האם אתה בטוח שברצונך לבטל את החשבון מסחר "${accountName}"?`);
            if (!confirmed) {
              return;
            }
          }
        }
      }
    }
  }

  try {
    // בדיקה אם יש טריידים פתוחים
    const tradesResponse = await fetch(`/api/trades/?trading_account_id=${tradingAccountId}&status=open`);
    if (tradesResponse.ok) {
      const tradesData = await tradesResponse.json();
      const openTrades = tradesData.data || tradesData || [];

      if (openTrades.length > 0) {
        await showOpenTradesWarning(tradingAccountName, openTrades, 'cancel');
        return;
      }
    }

    const response = await fetch(`/api/trading-accounts/${tradingAccountId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'cancelled',
      }),
    });

    if (response.ok) {
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('חשבון מסחר בוטל בהצלחה!');
      }

      // רענון הטבלה
      if (typeof window.loadTradingAccountsDataForTradingAccountsPage === 'function') {
        await window.loadTradingAccountsDataForTradingAccountsPage();
      } else if (typeof window.loadTradingAccountsData === 'function') {
        const trading_accounts = await window.loadTradingAccountsData();
        if (typeof window.updateTradingAccountsTable === 'function') {
          window.updateTradingAccountsTable(trading_accounts);
        }
      }
    } else {
      const data = await response.json();
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification(data.message || 'שגיאה בביטול חשבון מסחר');
      }
    }
  } catch (error) {
    handleSystemError(error, 'ביטול חשבון מסחר');
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בביטול חשבון מסחר');
    }
  }
}

// REMOVED: Old deleteTradingAccount implementation (lines 1052-1150)
// Replaced by newer implementation at line 2359 with CRUDResponseHandler

// REMOVED: showSuccessMessage - use window.showSuccessNotification from notification-system.js directly

// REMOVED: showErrorMessage - use window.showErrorNotification from notification-system.js directly

// פונקציות עזר - הועברו ל-ui-utils.js

/**
 * Confirm delete trading account
 * @function confirmDeleteTradingAccount
 * @param {string} tradingAccountId - Trading account ID
 * @param {string} tradingAccountName - Trading account name (optional, for backward compatibility)
 * @returns {void}
 */
function confirmDeleteTradingAccount(tradingAccountId, tradingAccountName) {
  // Use the newer implementation that fetches account details itself
  deleteTradingAccount(tradingAccountId);
}

// function checkLinkedItems(tradingAccountId) { // הוסר - הוחלף ב-checkLinkedItemsBeforeDelete
//   // פונקציה פשוטה לבדיקת פריטים מקושרים
//   return Promise.resolve({ hasLinkedItems: false, items: [] });
// }

/**
 * Show open trades warning
 * @function showOpenTradesWarning
 * @param {string} tradingAccountId - Trading account ID
 * @param {string} tradingAccountName - Trading account name
 * @returns {void}
 */
function showOpenTradesWarning(tradingAccountId, tradingAccountName) {
  if (typeof window.showWarningNotification === 'function') {
    window.showWarningNotification('אזהרה', `יש עסקאות פתוחות בחשבון מסחר "${accountName}". לא ניתן למחוק חשבון מסחר עם עסקאות פעילות.`);
  } else {
    // window.Logger.warn(`יש עסקאות פתוחות בחשבון מסחר "${accountName}". לא ניתן למחוק חשבון מסחר עם עסקאות פעילות.`, { page: "trading_accounts" });
  }
}

// createWarningModal הועברה ל-ui-utils.js

/**
 * Show edit trading account modal by ID
 * @function showEditTradingAccountModalById
 * @param {number|string} accountId - Trading account ID
 * @returns {void}
 */
function showEditTradingAccountModalById(accountId) {
  if (window.Logger) {
    window.Logger.info(`🔧 showEditTradingAccountModalById called with accountId: ${accountId}`, { accountId, page: "trading_accounts" });
  }
  
  if (!accountId) {
    if (window.Logger) {
      window.Logger.error('❌ showEditTradingAccountModalById called without accountId', { page: "trading_accounts" });
    }
    return;
  }
  
  if (window.ModalManagerV2 && typeof window.ModalManagerV2.showEditModal === 'function') {
    if (window.Logger) {
      window.Logger.info(`✅ Opening edit modal for account ${accountId}`, { accountId, page: "trading_accounts" });
    }
    window.ModalManagerV2.showEditModal('tradingAccountsModal', 'trading_account', accountId);
  } else {
    if (window.Logger) {
      window.Logger.error('❌ ModalManagerV2 לא זמין במערכת הכללית', { page: "trading_accounts" });
    } else {
      console.error('ModalManagerV2 not available');
    }
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'מערכת המודלים לא זמינה. אנא רענן את הדף.');
    }
  }
}

// ייצוא מיידי ל-window - חיוני לפעולת הכפתורים
// Export immediately to window - critical for button functionality
window.showEditTradingAccountModalById = showEditTradingAccountModalById;

// Debug logging
console.log('✅ [trading_accounts.js] showEditTradingAccountModalById exported to window');
if (window.Logger) {
  window.Logger.info('✅ showEditTradingAccountModalById exported to window', { page: "trading_accounts" });
}

// Verify export
if (typeof window.showEditTradingAccountModalById !== 'function') {
  console.error('❌ [trading_accounts.js] CRITICAL: Export failed - window.showEditTradingAccountModalById is not a function!');
  if (window.Logger) {
    window.Logger.error('❌ CRITICAL: Export failed', { page: "trading_accounts" });
  }
} else {
  console.log('✅ [trading_accounts.js] Verification: window.showEditTradingAccountModalById is a function');
}
window.cancelTradingAccount = cancelTradingAccount;
window.deleteTradingAccount = deleteTradingAccount;
// REMOVED: window.showTradingAccountSuccessMessage - use window.showSuccessNotification from notification-system.js directly
// REMOVED: window.showTradingAccountErrorMessage - use window.showErrorNotification from notification-system.js directly
// REMOVED: window.showSecondConfirmationModal - use window.showSecondConfirmationModal from ui-utils.js or window.showConfirmationDialog directly
window.confirmDeleteTradingAccount = confirmDeleteTradingAccount;
// window.checkLinkedItems = checkLinkedItems; // הוסר - הוחלף ב-checkLinkedItemsBeforeDelete
window.showOpenTradesWarning = showOpenTradesWarning;
// window.createWarningModal = createWarningModal; // הועברה ל-ui-utils.js
window.deleteTradingAccountFromAPI = deleteTradingAccountFromAPI;
// REMOVED: window.loadTradingAccountsDataFromAPI - use loadTradingAccountsData instead
// REMOVED: window.addTradingAccountToAPI - function not defined
// REMOVED: window.updateTradingAccountInAPI - function not defined
window.checkLinkedItemsBeforeDeleteTradingAccount = checkLinkedItemsBeforeDeleteTradingAccount;  // בדיקת אובייקטים מקושרים למחיקה
// REMOVED: window.createTradingAccountModal - handled by ModalManagerV2 via trading-accounts-config.js
window.saveTradingAccount = saveTradingAccount;
// REMOVED: window.validateTradingAccountData - validation handled by ModalManagerV2
// REMOVED: window.showFormError - error handling handled by ModalManagerV2 and CRUDResponseHandler
window.loadCurrenciesFromServer = loadCurrenciesFromServer;
window.generateCurrencyOptions = generateCurrencyOptions;
window.cancelTradingAccountWithLinkedItemsCheck = cancelTradingAccountWithLinkedItemsCheck;
window.deleteTradingAccountWithLinkedItemsCheck = deleteTradingAccountWithLinkedItemsCheck;
window.restoreTradingAccount = restoreTradingAccount;

// Export functions for linked items management
window.checkLinkedItemsAndCancelTradingAccount = checkLinkedItemsAndCancelTradingAccount;
window.checkLinkedItemsAndDeleteTradingAccount = checkLinkedItemsAndDeleteTradingAccount;
window.performTradingAccountCancellation = performTradingAccountCancellation;
window.performTradingAccountDeletion = performTradingAccountDeletion;
window.checkLinkedItemsBeforeCancelTradingAccount = checkLinkedItemsBeforeCancelTradingAccount;
window.checkLinkedItemsBeforeDeleteTradingAccount = checkLinkedItemsBeforeDeleteTradingAccount;
window.getTradingAccountName = getTradingAccountName;

// הגדרת הפונקציה updateGridFromComponent לדף חשבונות המסחר
// וידוא שהפונקציה מוגדרת רק בדף חשבונות המסחר
if (window.location.pathname.includes('/trading_accounts')) {
  window.updateGridFromComponent = function (selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {

    // שמירת הפילטרים במשתנים גלובליים
    window.selectedStatusesForFilter = selectedStatuses || [];
    window.selectedTypesForFilter = selectedTypes || [];
    window.selectedDateRangeForFilter = selectedDateRange || null;
    window.searchTermForFilter = searchTerm || '';

    // חילוץ תאריכי התחלה וסיום מטווח התאריכים
    let startDate = 'לא נבחר';
    let endDate = 'לא נבחר';

    if (selectedDateRange && selectedDateRange !== 'כל זמן') {
      // תרגום טווח התאריכים לתאריכים אמיתיים
      const dateRange = window.translateDateRangeToDates(selectedDateRange);
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    }

    window.selectedStartDateForFilter = startDate;
    window.selectedEndDateForFilter = endDate;

    // קריאה ישירה לפונקציה המקומית
    if (typeof window.loadTradingAccountsDataForTradingAccountsPage === 'function') {
      window.loadTradingAccountsDataForTradingAccountsPage();
    } else {
      handleFunctionNotFound('loadTradingAccountsDataForTradingAccountsPage', 'פונקציית טעינת נתוני חשבונות מסחר לא נמצאה');
    }
  };
}

// REMOVED: Duplicate definition of loadTradingAccountsDataForTradingAccountsPage
// The function is already defined at line 111 as window.loadTradingAccountsDataForTradingAccountsPage


// פונקציה להגדרת כותרות למיון - הוסרה כי לא בשימוש
// function setupSortableHeaders() { ... }

// פונקציה לפילטור מקומי של חשבונות - ספציפית לחשבונות
/**
 * Filter trading accounts locally
 * @function filterTradingAccountsLocally
 * @param {Array} trading_accounts - Trading accounts array
 * @param {Array} selectedStatuses - Selected statuses
 * @param {Array} selectedTypes - Selected types
 * @param {Object} selectedDateRange - Selected date range
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered trading accounts
 */
function filterTradingAccountsLocally(trading_accounts, selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  let filteredAccounts = [...trading_accounts];

  // חילוץ תאריכי התחלה וסיום
  let startDate = null;
  let endDate = null;

  if (selectedDateRange && selectedDateRange !== 'כל זמן') {
    const dateRange = window.translateDateRangeToDates(selectedDateRange);
    startDate = dateRange.startDate;
    endDate = dateRange.endDate;
  }

  // פילטר לפי סטטוס
  if (selectedStatuses && selectedStatuses.length > 0 && !selectedStatuses.includes('all')) {
    filteredAccounts = filteredAccounts.filter(tradingAccount => {
      let itemStatus;
      if (tradingAccount.status === 'closed') {
        itemStatus = 'סגור';
      } else {
        itemStatus = 'פתוח';
      }
      const isMatch = selectedStatuses.includes(itemStatus);
      return isMatch;
    });
  }

  // פילטר לפי סוג
  if (selectedTypes && selectedTypes.length > 0 && !selectedTypes.includes('all')) {
    filteredAccounts = filteredAccounts.filter(tradingAccount => {
      let typeDisplay;
      switch (tradingAccount.type || tradingAccount.account_type) {
      case 'swing':
        typeDisplay = 'סווינג';
        break;
      case 'investment':
        typeDisplay = 'השקעה';
        break;
      case 'passive':
        typeDisplay = 'פאסיבי';
        break;
      default:
        typeDisplay = tradingAccount.type || tradingAccount.account_type;
      }
      const isMatch = selectedTypes.includes(typeDisplay);
      return isMatch;
    });
  }

  // פילטר לפי תאריכים
  if (startDate && endDate) {
    filteredAccounts = filteredAccounts.filter(tradingAccount => {
      if (!tradingAccount.created_at) {return false;}

      const accountDate = new Date(tradingAccount.created_at);
      const start = new Date(startDate);
      const end = new Date(endDate);

      // הגדרת זמן לתחילת היום לתאריך התחלה ולסוף היום לתאריך סיום
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const isInRange = accountDate >= start && accountDate <= end;
      return isInRange;
    });
  }

  // פילטר לפי חיפוש
  if (searchTerm && searchTerm.trim() !== '') {
    const searchLower = searchTerm.toLowerCase();

    filteredAccounts = filteredAccounts.filter(tradingAccount => {
      const nameMatch = (tradingAccount.name || '').toLowerCase().includes(searchLower);
      const typeMatch = (tradingAccount.type || tradingAccount.account_type || '').toLowerCase().includes(searchLower);
      const statusMatch = (tradingAccount.status || '').toLowerCase().includes(searchLower);

      const isMatch = nameMatch || typeMatch || statusMatch;
      return isMatch;
    });
  }

  return filteredAccounts;
}

// פונקציה גלובלית לעדכון הטבלה - הועברה ל-header-system.js

// פונקציה לעדכון תפריט פילטר החשבונות
/**
 * Update trading account filter menu
 * @function updateTradingAccountFilterMenu
 * @param {Array} trading_accounts - Trading accounts array
 * @returns {void}
 */
function updateTradingAccountFilterMenu(trading_accounts) {
  // חיפוש התפריט בתוך האפ-הדר (Shadow DOM)
  const appHeader = document.querySelector('app-header');
  if (!appHeader || !appHeader.shadowRoot) {
    return;
  }

  const tradingAccountMenu = appHeader.shadowRoot.getElementById('tradingAccountFilterMenu');
  if (!tradingAccountMenu) {
    return;
  }

  // ניקוי התפריט הקיים
  tradingAccountMenu.innerHTML = '';

  // הוספת אופציית "כל החשבונות"
  const allTradingAccountsItem = document.createElement('div');
  allTradingAccountsItem.className = 'trading-account-filter-item selected';
  allTradingAccountsItem.setAttribute('data-account', 'all');
  allTradingAccountsItem.innerHTML = `
    <span class="option-text">כל החשבונות</span>
    <span class="check-mark">✓</span>
  `;
  tradingAccountMenu.appendChild(allTradingAccountsItem);

  // הוספת החשבונות מהשרת
  if (trading_accounts && trading_accounts.length > 0) {
    trading_accounts.forEach(tradingAccount => {
      const tradingAccountItem = document.createElement('div');
      tradingAccountItem.className = 'trading-account-filter-item';
      tradingAccountItem.setAttribute('data-account', tradingAccount.id || tradingAccount.name);
      tradingAccountItem.innerHTML = `
        <span class="option-text">${tradingAccount.name || tradingAccount.account_name || 'Unknown'}</span>
        <span class="check-mark">✓</span>
      `;
      tradingAccountMenu.appendChild(tradingAccountItem);
    });
  }
}

// פונקציות לפתיחה/סגירה של סקשנים
// updateGridFromComponentGlobal הועבר ל-header-system.js
window.updateTradingAccountFilterMenu = updateTradingAccountFilterMenu;
window.filterTradingAccountsLocally = filterTradingAccountsLocally;
window.updateTradingAccountsTable = updateTradingAccountsTable;
window.deleteTradingAccount = deleteTradingAccount;
// window.loadTradingAccountsDataForTradingAccountsPage כבר מוגדר בתחילת הקובץ

/**
 * שחזור מצב סקשן החשבונות
 */
async function restoreTradingAccountsSectionState() {
  const savedState = await window.unifiedCacheManager?.get('trading_accountsSectionCollapsed') || localStorage.getItem('trading_accountsSectionCollapsed');
  if (savedState === 'true') {
    const trading_accountsSection = document.querySelector('.trading_accounts-section');
    if (trading_accountsSection) {
      const sectionBody = trading_accountsSection.querySelector('.section-body');
      const toggleBtn = trading_accountsSection.querySelector('button[onclick="toggleAccountsSection()"]');

      if (sectionBody && toggleBtn) {
        sectionBody.style.display = 'none';
        toggleBtn.textContent = 'הצג חשבונות';
      }
    }
  }
}

window.restoreTradingAccountsSectionState = restoreTradingAccountsSectionState;


// פונקציות נוספות לטבלת החשבונות - הוסרו כדי למנוע התנגשות

// הוסר - המערכת המאוחדת מטפלת באתחול
// אתחול הדף
// document.addEventListener('DOMContentLoaded', function () {
//   window.Logger.info('🚀🚀🚀 DOMContentLoaded התחיל 🚀🚀🚀', { page: "trading_accounts" });
//   window.Logger.info('📍 נתיב הדף:', window.location.pathname, { page: "trading_accounts" });
  
  // טעינת מטבעות
  window.Logger.info('💰 טעינת מטבעות...', { page: "trading_accounts" });
  loadCurrenciesFromServer();

  // יישום צבעי ישות על כותרות
  if (window.applyEntityColorsToHeaders) {
    window.Logger.info('🎨 יישום צבעי ישות על כותרות', { page: "trading_accounts" });
    window.applyEntityColorsToHeaders('trading_account');
  }

  // בדיקה אם אנחנו בדף החשבונות
  if (window.location.pathname.includes('/trading_accounts')) {
    window.Logger.info('🎯 נמצאים בדף החשבונות - מתחיל טעינת נתונים', { page: "trading_accounts" });
    // טעינת נתוני חשבונות
    if (typeof window.loadTradingAccountsDataForTradingAccountsPage === 'function') {
      window.Logger.info('📡 קורא ל-loadTradingAccountsDataForTradingAccountsPage', { page: "trading_accounts" });
      window.loadTradingAccountsDataForTradingAccountsPage();
    } else {
      window.Logger.error('❌ loadTradingAccountsDataForTradingAccountsPage לא נמצאה', { page: "trading_accounts" });
      handleFunctionNotFound('loadTradingAccountsDataForTradingAccountsPage', 'פונקציית טעינת נתוני חשבונות מסחר לא נמצאה');
    }

    // שחזור מצב הסקשנים - משתמש בפונקציה הכללית מ-ui-utils.js
    if (typeof window.restoreAllSectionStates === 'function') {
      window.Logger.info('🔄 שחזור מצב הסקשנים', { page: "trading_accounts" });
      window.restoreAllSectionStates();
    } else if (typeof window.restoreTradingAccountsSectionState === 'function') {
      // Fallback לפונקציה הספציפית של העמוד (אם קיימת)
      window.Logger.info('🔄 שחזור מצב הסקשנים (פונקציה ספציפית)', { page: "trading_accounts" });
      window.restoreTradingAccountsSectionState();
    } else {
      window.Logger.warn('⚠️ restoreAllSectionStates לא נמצאה - שחזור מצב סקשנים לא בוצע', { page: "trading_accounts" });
    }
  } else {
    window.Logger.info('📍 לא נמצאים בדף החשבונות - דילוג על טעינת נתונים', { page: "trading_accounts" });
  }
// });

/**
 * ביטול חשבון מסחר מסחר עם בדיקת פריטים מקושרים
 * @param {number} tradingAccountId - מזהה החשבון מסחר המסחר
 * @param {string} accountName - שם החשבון מסחר
 */
async function cancelTradingAccountWithLinkedItemsCheck(tradingAccountId, _accountName) {
  try {
    // קבלת פרטי החשבון מסחר לצורך הודעת האישור
    let accountDetails = '';
    try {
      const response = await fetch(`/api/trading-accounts/${tradingAccountId}`);
      if (response.ok) {
        const tradingAccountData = await response.json();
        const tradingAccount = tradingAccountData.data;
        // יתרה מחושבת בזמן אמת - לא מוצגת כאן
        accountDetails = `\n\nפרטי החשבון מסחר:\n• שם: ${tradingAccount.name || 'לא מוגדר'}\n• סטטוס: ${tradingAccount.status || 'לא מוגדר'}`;
      }
    } catch {
      // window.Logger.warn('לא ניתן לטעון פרטי חשבון מסחר:', error, { page: "trading_accounts" });
    }

    // אישור מהמשתמש באמצעות המערכת הגלובלית
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'ביטול חשבון מסחר',
        `האם אתה בטוח שברצונך לבטל חשבון מסחר זה?${accountDetails}`,
        async () => {
          // המשתמש אישר - בדיקת מקושרים ואז ביצוע הביטול
          await checkLinkedItemsAndCancelTradingAccount(tradingAccountId);
        },
        () => {
          // המשתמש ביטל - לא עושים כלום
        },
        'danger', // צבע אדום לחלון האישור
      );
    } else {
      // Fallback למקרה שהמערכת הגלובלית לא זמינה
      if (window.showConfirmationDialog) {
        const confirmed = await new Promise(resolve => {
          window.showConfirmationDialog(
            'ביטול חשבון מסחר',
            `האם אתה בטוח שברצונך לבטל חשבון מסחר זה?${accountDetails}`,
            () => resolve(true),
            () => resolve(false)
          );
        });
        if (!confirmed) return;
      } else if (!window.window.showConfirmationDialog('אישור', `האם אתה בטוח שברצונך לבטל חשבון מסחר זה?${accountDetails}`)) {
        return;
      }
      await checkLinkedItemsAndCancelTradingAccount(tradingAccountId);
    }

  } catch (error) {
    handleSystemError(error, 'ביטול חשבון מסחר');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', error.message);
    }
  }
}

/**
 * מחיקת חשבון מסחר מסחר עם בדיקת פריטים מקושרים
 * @param {number} tradingAccountId - מזהה החשבון מסחר המסחר
 * @param {string} accountName - שם החשבון מסחר
 */
async function deleteTradingAccountWithLinkedItemsCheck(tradingAccountId, _accountName) {
  try {
    // בדיקת פריטים מקושרים לפני חלון האישור
    if (typeof window.checkLinkedItemsBeforeAction === 'function') {
      const hasLinkedItems = await window.checkLinkedItemsBeforeAction('trading_account', tradingAccountId, 'delete');
      if (hasLinkedItems) {
        // יש פריטים מקושרים - המודול כבר הוצג, לא נציג חלון אישור
        return;
      }
    }
    
    // אין פריטים מקושרים - המשך עם חלון האישור
    // קבלת פרטי החשבון מסחר לצורך הודעת האישור
    let accountDetails = '';
    try {
      const response = await fetch(`/api/trading-accounts/${tradingAccountId}`);
      if (response.ok) {
        const tradingAccountData = await response.json();
        const tradingAccount = tradingAccountData.data;
        // יתרה מחושבת בזמן אמת - לא מוצגת כאן
        accountDetails = `\n\nפרטי החשבון מסחר:\n• שם: ${tradingAccount.name || 'לא מוגדר'}\n• סטטוס: ${tradingAccount.status || 'לא מוגדר'}`;
      }
    } catch {
      // window.Logger.warn('לא ניתן לטעון פרטי חשבון מסחר:', error, { page: "trading_accounts" });
    }

    // אישור מהמשתמש באמצעות המערכת הגלובלית
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'מחיקת חשבון מסחר',
        `האם אתה בטוח שברצונך למחוק חשבון מסחר זה?${accountDetails}`,
        async () => {
          // המשתמש אישר - ביצוע המחיקה (ללא בדיקה נוספת - כבר בדקנו)
          await checkLinkedItemsAndDeleteTradingAccount(tradingAccountId);
        },
        () => {
          // המשתמש ביטל - לא עושים כלום
        },
        'danger', // צבע אדום לחלון האישור
      );
    } else {
      // Fallback למקרה שהמערכת הגלובלית לא זמינה
      if (window.showConfirmationDialog) {
        const confirmed = await new Promise(resolve => {
          window.showConfirmationDialog(
            'מחיקת חשבון מסחר',
            `האם אתה בטוח שברצונך למחוק חשבון מסחר זה?${accountDetails}`,
            () => resolve(true),
            () => resolve(false)
          );
        });
        if (!confirmed) return;
      } else if (!window.window.showConfirmationDialog('אישור', `האם אתה בטוח שברצונך למחוק חשבון מסחר זה?${accountDetails}`)) {
        return;
      }
      await checkLinkedItemsAndDeleteTradingAccount(tradingAccountId);
    }

  } catch (error) {
    handleSystemError(error, 'מחיקת חשבון מסחר');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', error.message);
    }
  }
}

/**
 * החזרת חשבון מסחר מסחר מבוטל לסטטוס סגור
 * @param {number} tradingAccountId - מזהה החשבון מסחר המסחר
 * @param {string} accountName - שם החשבון מסחר
 */
async function restoreTradingAccount(tradingAccountId, tradingAccountName) {
  // ניקוי מטמון לפני פעולת CRUD - עריכה  // אישור מהמשתמש
  if (typeof window.showConfirmationDialog === 'function') {
    const confirmed = await new Promise(resolve => {
      window.showConfirmationDialog(
        'החזרת חשבון מסחר',
        `האם אתה בטוח שברצונך להחזיר את החשבון מסחר "${accountName}" לסטטוס סגור?`,
        () => resolve(true),
        () => resolve(false),
      );
    });
    if (!confirmed) {return;}
  } else {
    if (window.showConfirmationDialog) {
      const confirmed = await new Promise(resolve => {
        window.showConfirmationDialog(
          'החזרת חשבון מסחר',
          `האם אתה בטוח שברצונך להחזיר את החשבון מסחר "${accountName}" לסטטוס סגור?`,
          () => resolve(true),
          () => resolve(false)
        );
      });
      if (!confirmed) return;
    } else if (!window.confirm(`האם אתה בטוח שברצונך להחזיר את החשבון מסחר "${accountName}" לסטטוס סגור?`)) {
      return;
    }
  }

  try {
    const response = await fetch(`/api/trading-accounts/${tradingAccountId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'closed',
      }),
    });

    if (response.ok) {
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('חשבון מסחר הוחזר בהצלחה לסטטוס סגור!');
      }

      // רענון הטבלה
      if (typeof window.loadTradingAccountsDataForTradingAccountsPage === 'function') {
        await window.loadTradingAccountsDataForTradingAccountsPage();
      } else if (typeof window.loadTradingAccountsData === 'function') {
        const trading_accounts = await window.loadTradingAccountsData();
        if (typeof window.updateTradingAccountsTable === 'function') {
          window.updateTradingAccountsTable(trading_accounts);
        }
      }
    } else {
      const data = await response.json();
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification(data.message || 'שגיאה בהחזרת חשבון מסחר');
      }
    }
  } catch (error) {
    handleSystemError(error, 'החזרת חשבון מסחר');
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהחזרת חשבון מסחר');
    }
  }
}

/**
 * בדיקת מקושרים וביצוע ביטול חשבון מסחר מסחר
 * @deprecated Use window.checkLinkedItemsAndPerformAction('account', tradingAccountId, 'cancel', performTradingAccountCancellation) instead
 */
async function checkLinkedItemsAndCancelTradingAccount(tradingAccountId) {
  await window.checkLinkedItemsAndPerformAction('account', tradingAccountId, 'cancel', performTradingAccountCancellation);
}

/**
 * ביצוע הביטול בפועל
 */
async function performTradingAccountCancellation(tradingAccountId) {
  try {
    // ניקוי מטמון לפני פעולת CRUD - ביטול    // שליחה לשרת
    const response = await fetch(`/api/trading-accounts/${tradingAccountId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });

    if (response.ok) {
      await response.json(); // result not used

      // הצגת הודעת הצלחה
      if (window.showSuccessNotification) {
        window.showSuccessNotification('הצלחה', 'החשבון מסחר בוטל בהצלחה', 4000, 'business');
      }

      // רענון הנתונים
      if (typeof loadTradingAccountsDataForTradingAccountsPage === 'function') {
        await loadTradingAccountsDataForTradingAccountsPage();
      } else if (typeof window.loadTradingAccountsData === 'function') {
        const trading_accounts = await window.loadTradingAccountsData();
        if (typeof window.updateTradingAccountsTable === 'function') {
          window.updateTradingAccountsTable(trading_accounts);
        }
      }
    } else {
      const errorResponse = await response.text();
      handleApiError('שגיאה בביטול חשבון מסחר', errorResponse);
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה בביטול', 'שגיאה בביטול החשבון מסחר');
      }
    }

  } catch (error) {
    handleSystemError(error, 'ביצוע ביטול חשבון מסחר');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בביטול', 'שגיאה בביטול החשבון מסחר');
    }
  }
}

/**
 * בדיקת מקושרים וביצוע מחיקת חשבון מסחר מסחר
 * @deprecated Use window.checkLinkedItemsAndPerformAction('account', tradingAccountId, 'delete', performTradingAccountDeletion) instead
 */
async function checkLinkedItemsAndDeleteTradingAccount(tradingAccountId) {
  await window.checkLinkedItemsAndPerformAction('account', tradingAccountId, 'delete', performTradingAccountDeletion);
}

// REMOVED: Old performTradingAccountDeletion implementation (lines 1857-1927)
// Replaced by newer implementation at line 2414 with CRUDResponseHandler

/**
 * בדיקת פריטים מקושרים לפני ביטול חשבון מסחר
 * @deprecated Use window.checkLinkedItemsBeforeAction('account', tradingAccountId, 'cancel') instead
 */
async function checkLinkedItemsBeforeCancelTradingAccount(tradingAccountId) {
  return await window.checkLinkedItemsBeforeAction('trading_account', tradingAccountId, 'cancel');
}

/**
 * בדיקת פריטים מקושרים לפני מחיקת חשבון מסחר מסחר
 * @deprecated Use window.checkLinkedItemsBeforeAction('account', tradingAccountId, 'delete') instead
 */
async function checkLinkedItemsBeforeDeleteTradingAccount(tradingAccountId) {
  return await window.checkLinkedItemsBeforeAction('trading_account', tradingAccountId, 'delete');
}

/**
 * Get trading account name
 * @function getTradingAccountName
 * @param {string} tradingAccountId - Trading account ID
 * @returns {string} Trading account name
 */
function getTradingAccountName(tradingAccountId) {
  // נסה למצוא בחשבונות שכבר נטענו
  if (window.trading_accountsData) {
    const tradingAccount = window.trading_accountsData.find(a => a.id === tradingAccountId);
    if (tradingAccount) {
      return tradingAccount.name;
    }
  }
  return `חשבון מסחר ${tradingAccountId}`;
}

/**
 * Update trading account
 * @function updateTradingAccount
 * @param {string} tradingAccountId - Trading account ID
 * @param {Object} tradingAccountData - Trading account data
 * @returns {void}
 */
function updateTradingAccount(tradingAccountId, tradingAccountData) {
  try {
    window.Logger.info('📝 מעדכן חשבון מסחר:', tradingAccountId, tradingAccountData, { page: "trading_accounts" });
    
    // ולידציה בסיסית
    if (!tradingAccountId || !tradingAccountData) {
      throw new Error('נתונים חסרים לעדכון חשבון מסחר');
    }
    
    // שליחה לשרת
    fetch('/api/trading-accounts/' + tradingAccountId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tradingAccountData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('שגיאה בעדכון חשבון מסחר');
      }
      return response.json();
    })
    .then(data => {
      window.Logger.info('✅ חשבון מסחר עודכן בהצלחה:', data, { page: "trading_accounts", keepInfo: true });
      
      // רענון הטבלה
      loadTradingAccountsFromServer();
      
      // הודעת הצלחה
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('חשבון מסחר עודכן בהצלחה');
      } else if (typeof window.showNotification === 'function') {
        window.showNotification('חשבון מסחר עודכן בהצלחה', 'success', 'הצלחה', 4000, 'business');
      }
    })
    .catch(error => {
      window.Logger.error('שגיאה בעדכון חשבון מסחר:', error, { page: "trading_accounts" });
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בעדכון חשבון מסחר', error.message);
      } else if (typeof window.showNotification === 'function') {
        window.showNotification('שגיאה בעדכון חשבון מסחר', 'error', 'שגיאה', 6000, 'system');
      }
    });
    
  } catch (error) {
    window.Logger.error('שגיאה בעדכון חשבון מסחר:', error, { page: "trading_accounts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון חשבון מסחר', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בעדכון חשבון מסחר', 'error', 'שגיאה', 6000, 'system');
    }
  }
}

/**
 * Show trading account details - uses global entity details system
 * @function showTradingAccountDetails
 * @param {string|number} tradingAccountId - Trading account ID
 * @returns {void}
 */
function showTradingAccountDetails(tradingAccountId) {
  try {
    window.Logger.info('👁️ מציג פרטי חשבון מסחר:', tradingAccountId, { page: "trading_accounts" });
    
    // שימוש במערכת הכללית של פרטי ישויות (entity-details-modal)
    if (typeof window.showEntityDetails === 'function') {
      window.showEntityDetails('trading_account', tradingAccountId, { mode: 'view' });
    } else {
      window.Logger.error('❌ showEntityDetails לא זמינה - המערכת הכללית לא נטענה', { page: "trading_accounts" });
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', 'מערכת הצגת פרטי ישויות לא זמינה. אנא רענן את הדף.');
      }
    }
    
  } catch (error) {
    window.Logger.error('❌ שגיאה בהצגת פרטי חשבון מסחר:', error, { page: "trading_accounts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהצגת פרטי חשבון מסחר', error.message);
    }
  }
}

// ייצוא הפונקציה לגלובל
window.showTradingAccountDetails = showTradingAccountDetails;

// הוספת timeout לאתחול - אחרי שהפונקציות מיוצאות
setTimeout(() => {
  window.Logger.info('⏰ Timeout 2 שניות - מתחיל אתחול', { page: "trading_accounts" });
  if (window.location.pathname.includes('/trading_accounts')) {
    window.Logger.info('🎯 נמצאים בדף החשבונות - מתחיל טעינת נתונים', { page: "trading_accounts" });
    window.Logger.info('🔍 בדיקת זמינות פונקציות:', { page: "trading_accounts" });
    window.Logger.info('  - loadTradingAccountsDataForTradingAccountsPage:', typeof window.loadTradingAccountsDataForTradingAccountsPage, { page: "trading_accounts" });
    window.Logger.info('  - apiCall:', typeof window.apiCall, { page: "trading_accounts" });
    window.Logger.info('  - updateTradingAccountsTable:', typeof window.updateTradingAccountsTable, { page: "trading_accounts" });
    
    if (typeof window.loadTradingAccountsDataForTradingAccountsPage === 'function') {
      window.Logger.info('📡 קורא ל-loadTradingAccountsDataForTradingAccountsPage', { page: "trading_accounts" });
      window.loadTradingAccountsDataForTradingAccountsPage();
    } else {
      window.Logger.error('❌ loadTradingAccountsDataForTradingAccountsPage לא נמצאה', { page: "trading_accounts" });
      window.Logger.info('🔍 ניסיון לטעון נתונים ישירות...', { page: "trading_accounts" });
      
      // ניסיון לטעון נתונים ישירות
      if (typeof window.apiCall === 'function') {
        window.Logger.info('📡 משתמש ב-apiCall ישירות', { page: "trading_accounts" });
        window.apiCall('/api/trading-accounts/', 'GET')
          .then(async data => {
            window.Logger.info('✅ נתונים נטענו ישירות:', data, { page: "trading_accounts" });
            if (data && data.length > 0) {
              window.Logger.info('📊 עדכון טבלה עם', data.length, 'רשומות', { page: "trading_accounts" });
              if (typeof window.updateTradingAccountsTable === 'function') {
                window.updateTradingAccountsTable(data);
              } else {
                window.Logger.error('❌ updateTradingAccountsTable לא נמצאה', { page: "trading_accounts" });
              }
            }
          })
          .catch(error => {
            window.Logger.error('❌ שגיאה בטעינת נתונים ישירה:', error, { page: "trading_accounts" });
          });
      } else {
        window.Logger.error('❌ apiCall לא נמצאה', { page: "trading_accounts" });
      }
    }
  }
}, 2000);

window.Logger.info('✅ trading_accounts.js נטען בהצלחה', { page: "trading_accounts", keepInfo: true });

// ===== Sorting system - adapted for trading_accounts =====

// Global variables for sorting
let tradingAccountsCurrentSortColumn = null;
let tradingAccountsCurrentSortDirection = 'asc';

/**
 * Function for sorting the table
 * 
 * This function uses the global sorting system from main.js
 * to sort the trading_accounts table by the selected column.
 * 
 * @param {number} columnIndex - column index for sorting (0-6)
 * 
 * @requires window.sortTableData - global function from main.js
 * @requires window.filteredTradingAccountsData - filtered data
 * @requires trading_accountsData - original data
 * @requires updateTradingAccountsTable - function to update table
 * 
 * @since 2.0
 */
/**
 * Sort table
 * @function sortTable
 * @param {number} columnIndex - Column index
 * @returns {void}
 */
// REMOVED: sortTable - use window.sortTableData directly from tables.js
// Usage: window.sortTableData(columnIndex, data, 'trading_accounts', updateTradingAccountsTable)

// Detailed Log Functions for Accounts Page
/**
 * Generate detailed log for trading accounts page
 * @function generateDetailedLog
 * @returns {string} JSON string of log data
 */
function generateDetailedLog() {
    const tradingAccountsStats = {
                totalAccounts: document.getElementById('totalAccounts')?.textContent || 'לא נמצא',
                activeAccounts: document.getElementById('activeAccounts')?.textContent || 'לא נמצא',
                totalValue: document.getElementById('totalValue')?.textContent || 'לא נמצא',
                totalProfit: document.getElementById('totalProfit')?.textContent || 'לא נמצא',
                newAlertsCount: document.getElementById('newAlertsCount')?.textContent || 'לא נמצא'
    };
    
    // Use unified function from logger-service.js
    return window.generateDetailedLog('trading_accounts', tradingAccountsStats);
}

//  function removed - no longer needed

// פונקציה לטעינת חשבונות לפילטר (נדרשת על ידי header-system.js)
/**
 * Get trading accounts
 * @function getTradingAccounts
 * @returns {Array} Trading accounts array
 */
function getTradingAccounts() {
    return new Promise((resolve, reject) => {
        if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
            // החזרת רק חשבונות פעילים
            const activeAccounts = window.trading_accountsData.filter(tradingAccount => tradingAccount.status === 'open');
            resolve(activeAccounts);
        } else {
            // אם אין נתונים, נטען אותם
            if (typeof window.loadTradingAccountsFromServer === 'function') {
                window.loadTradingAccountsFromServer().then(() => {
                    const activeAccounts = window.trading_accountsData ? 
                        window.trading_accountsData.filter(tradingAccount => tradingAccount.status === 'open') : [];
                    resolve(activeAccounts);
                }).catch(reject);
            } else {
                resolve([]);
            }
        }
    });
}

// REMOVED: window.sortTable - use window.sortTableData from tables.js directly
//  removed - no longer needed
// window.generateDetailedLog = generateDetailedLog; // REMOVED: Local function only
window.getTradingAccounts = getTradingAccounts;

// ===== MODAL FUNCTIONS - NEW SYSTEM =====

// REMOVED: showAddTradingAccountModal - use window.ModalManagerV2.showModal('tradingAccountsModal', 'add') directly

// REMOVED: showEditTradingAccountModal - use window.ModalManagerV2.showEditModal('tradingAccountsModal', 'account', accountId) directly

/**
 * שמירת חשבון מסחר מסחר
 * Handles both add and edit modes
 */
async function saveTradingAccount() {
    window.Logger.debug('saveTradingAccount called', { page: 'trading_accounts' });
    
    try {
        // ניקוי מטמון לפני פעולת CRUD        // Collect form data using DataCollectionService
        const form = document.getElementById('tradingAccountsModalForm');
        if (!form) {
            throw new Error('Trading Account form not found');
        }
        
        // Collect form data including hidden ID field (added in edit mode)
        const accountData = DataCollectionService.collectFormData({
            id: { id: 'tradingAccountId', type: 'text' }, // Hidden ID field added in edit mode
            name: { id: 'accountName', type: 'text' },
            currency_id: { id: 'accountCurrency', type: 'int' }, // currency_id הוא integer - ID של מטבע
            opening_balance: { id: 'accountOpeningBalance', type: 'float', default: 0 },
            status: { id: 'accountStatus', type: 'text' },
            notes: { id: 'accountNotes', type: 'rich-text', default: null }
        });
        
        const accountId = accountData.id ? parseInt(accountData.id) : null;
        const isEdit = !!accountId;
        
        // ולידציה מפורטת
        let hasErrors = false;
        if (!accountData.name || accountData.name.trim() === '') {
            if (window.showValidationWarning) {
                window.showValidationWarning('accountName', 'שם החשבון הוא שדה חובה');
            }
            hasErrors = true;
        }
        
        if (!accountData.currency_id || accountData.currency_id <= 0) {
            if (window.showValidationWarning) {
                window.showValidationWarning('accountCurrency', 'מטבע החשבון הוא שדה חובה');
            }
            hasErrors = true;
        }
        
        if (!accountData.status) {
            if (window.showValidationWarning) {
                window.showValidationWarning('accountStatus', 'סטטוס החשבון הוא שדה חובה');
            }
            hasErrors = true;
        }

        if (accountData.notes && accountData.notes.length > 5000) {
            if (window.showValidationWarning) {
                window.showValidationWarning('accountNotes', 'הערות החשבון חורגות מהאורך המותר (5,000 תווים)');
            }
            hasErrors = true;
        }
        
        // ולידציה של ערכי status - רק open, closed, cancelled מותרים
        const allowedStatuses = ['open', 'closed', 'cancelled'];
        if (accountData.status && !allowedStatuses.includes(accountData.status)) {
            if (window.showValidationWarning) {
                window.showValidationWarning('accountStatus', 'סטטוס לא תקין. אפשרויות: פתוח, סגור, מבוטל');
            }
            hasErrors = true;
        }
        
        if (hasErrors) {
            return;
        }
        
        // In edit mode, preserve the original currency_id (cannot be changed)
        if (isEdit) {
            // Get original account data to preserve currency_id
            const originalAccount = (window.trading_accountsData || []).find(acc => acc.id === accountId);
            if (originalAccount && originalAccount.currency_id) {
                accountData.currency_id = parseInt(originalAccount.currency_id, 10);
                console.log(`✅ Preserving original currency_id: ${accountData.currency_id} for account ${accountId}`);
            } else if (typeof accountData.currency_id !== 'undefined' && accountData.currency_id !== null) {
                accountData.currency_id = parseInt(accountData.currency_id, 10);
            }
        }
        
        // Prepare API call
        const url = isEdit ? `/api/trading-accounts/${accountId}` : '/api/trading-accounts';
        const method = isEdit ? 'PUT' : 'POST';
        
        // Remove id from payload (not needed in API request body)
        const { id, ...payload } = accountData;
        
        // Send to API
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        // Use CRUDResponseHandler for consistent response handling
        if (isEdit) {
            await CRUDResponseHandler.handleUpdateResponse(response, {
                modalId: 'tradingAccountsModal',
                successMessage: 'חשבון מסחר עודכן בהצלחה',
                entityName: 'חשבון מסחר',
                reloadFn: window.loadTradingAccountsDataForTradingAccountsPage,
                requiresHardReload: false
            });
        } else {
            await CRUDResponseHandler.handleSaveResponse(response, {
                modalId: 'tradingAccountsModal',
                successMessage: 'חשבון מסחר נוסף בהצלחה',
                entityName: 'חשבון מסחר',
                reloadFn: window.loadTradingAccountsDataForTradingAccountsPage,
                requiresHardReload: false
            });
        }
        
    } catch (error) {
        CRUDResponseHandler.handleError(error, 'שמירת חשבון מסחר');
    }
}

/**
 * מחיקת חשבון מסחר מסחר
 * Includes linked items check
 */
async function deleteTradingAccount(accountId) {
    window.Logger.info(`🗑️ deleteTradingAccount called for account ${accountId}`, { accountId, page: 'trading_accounts' });
    
    try {
        // Get account details for confirmation message
        let accountDetails = `חשבון מסחר #${accountId}`;
        const account = window.tradingAccountsData?.find(acc => acc.id === accountId || acc.id === parseInt(accountId));
        
        if (account) {
            const name = account.name || 'לא מוגדר';
            const statusText = account.status === 'open' ? 'פתוח' :
                             account.status === 'closed' ? 'סגור' :
                             account.status === 'cancelled' ? 'מבוטל' : account.status || 'לא מוגדר';
            // יתרה מחושבת בזמן אמת - לא מוצגת כאן
            accountDetails = `${name} - סטטוס: ${statusText}`;
        }
        
        // Check linked items first (Trades, Cash Flows, Notes)
        window.Logger.info('🔍 Checking for linked items before deletion', { accountId, page: 'trading_accounts' });
        if (typeof window.checkLinkedItemsBeforeAction === 'function') {
            window.Logger.info('✅ checkLinkedItemsBeforeAction function exists', { accountId, page: 'trading_accounts' });
            const hasLinkedItems = await window.checkLinkedItemsBeforeAction('trading_account', accountId, 'delete');
            window.Logger.info(`🔍 Linked items check result: hasLinkedItems=${hasLinkedItems}`, { accountId, page: 'trading_accounts' });
            if (hasLinkedItems) {
                window.Logger.info('🚫 Trading Account has linked items, deletion cancelled', { accountId, page: 'trading_accounts' });
                return;
            }
        } else {
            window.Logger.warn('⚠️ checkLinkedItemsBeforeAction function not available', { accountId, page: 'trading_accounts' });
        }
        
        // Use warning system for confirmation with detailed information
        if (window.showDeleteWarning) {
            window.showDeleteWarning('account', accountDetails, 'חשבון מסחר',
                async () => await performTradingAccountDeletion(accountId),
                () => {}
            );
        } else {
            // Fallback to simple confirm
            if (!confirm('האם אתה בטוח שברצונך למחוק את חשבון מסחר המסחר?')) {
                return;
            }
            await performTradingAccountDeletion(accountId);
        }
        
    } catch (error) {
        window.Logger.error('Error deleting trading account:', error, { accountId, page: 'trading_accounts' });
        CRUDResponseHandler.handleError(error, 'מחיקת חשבון מסחר');
    }
}

async function performTradingAccountDeletion(accountId) {
    try {
        // Clear cache before deletion to ensure fresh data after reload
        if (window.unifiedCacheManager) {
            await window.unifiedCacheManager.clearByPattern('trading-accounts-data');
            await window.unifiedCacheManager.clearByPattern('account-balance-*');
            await window.unifiedCacheManager.clearByPattern('account-activity-*');
        }
        
        // Send delete request
        const response = await fetch(`/api/trading-accounts/${accountId}`, {
            method: 'DELETE'
        });
        
        // Use CRUDResponseHandler for consistent response handling
        await CRUDResponseHandler.handleDeleteResponse(response, {
            successMessage: 'חשבון מסחר נמחק בהצלחה',
            entityName: 'חשבון מסחר',
            reloadFn: window.loadTradingAccountsDataForTradingAccountsPage,
            requiresHardReload: false
        });
        
    } catch (error) {
        CRUDResponseHandler.handleError(error, 'מחיקת חשבון מסחר');
    }
}

// ===== GLOBAL EXPORTS =====
// Debug: בדיקה שהפונקציה קיימת לפני הייצוא (בדיקה נוספת)
// Note: Already exported above, but ensure it's still available here
if (typeof window.showEditTradingAccountModalById !== 'function') {
  if (typeof showEditTradingAccountModalById === 'function') {
    window.showEditTradingAccountModalById = showEditTradingAccountModalById;
    console.log('✅ [trading_accounts.js] showEditTradingAccountModalById exported to window (from global exports section)');
    if (window.Logger) {
      window.Logger.info('✅ showEditTradingAccountModalById exported to window (from global exports)', { page: "trading_accounts" });
    }
  } else {
    console.error('❌ [trading_accounts.js] showEditTradingAccountModalById not found in global exports!');
    if (window.Logger) {
      window.Logger.error('❌ showEditTradingAccountModalById not found in global exports!', { page: "trading_accounts" });
    }
  }
} else {
  console.log('✅ [trading_accounts.js] showEditTradingAccountModalById already exists in window');
}

window.loadDefaultTradingAccounts = loadDefaultTradingAccounts;
window.updateTradingAccountsTable = updateTradingAccountsTable;
window.updateTradingAccountsSummary = updateTradingAccountsSummary;
window.updateTradingAccountFilterDisplayText = updateTradingAccountFilterDisplayText;
// REMOVED: window.showSuccessMessage - use window.showErrorNotification from notification-system.js
// REMOVED: window.showErrorMessage - use window.showErrorNotification from notification-system.js
window.confirmDeleteTradingAccount = confirmDeleteTradingAccount;
window.showOpenTradesWarning = showOpenTradesWarning;

// ===== UNIFIED TABLE SYSTEM REGISTRATION =====
/**
 * Restore page state (filters, sort, sections, entity filters)
 * @param {string} pageName - Page name
 * @returns {Promise<void>}
 */
async function restorePageState(pageName) {
  try {
    // אתחול PageStateManager אם לא מאותחל
    if (window.PageStateManager && !window.PageStateManager.initialized) {
      await window.PageStateManager.initialize();
    }

    if (!window.PageStateManager || !window.PageStateManager.initialized) {
      if (window.Logger) {
        window.Logger.warn('⚠️ PageStateManager not available, skipping state restoration', { page: pageName });
      }
      return;
    }

    // מיגרציה של נתונים קיימים אם יש
    await window.PageStateManager.migrateLegacyData(pageName);

    // טעינת מצב מלא
    const pageState = await window.PageStateManager.loadPageState(pageName);
    if (!pageState) {
      return; // אין מצב שמור
    }

    // שחזור פילטרים ראשיים
    if (pageState.filters && window.filterSystem) {
      window.filterSystem.currentFilters = { ...window.filterSystem.currentFilters, ...pageState.filters };
      if (window.filterSystem.applyAllFilters) {
        window.filterSystem.applyAllFilters();
      }
    }

    // שחזור סידור
    if (pageState.sort && window.UnifiedTableSystem && window.UnifiedTableSystem.sorter) {
      const { columnIndex, direction } = pageState.sort;
      if (typeof columnIndex === 'number' && columnIndex >= 0) {
        await window.UnifiedTableSystem.sorter.sort('trading_accounts', columnIndex);
      }
    } else if (window.UnifiedTableSystem && window.UnifiedTableSystem.sorter) {
      // אם אין מצב שמור, נסה להחיל סידור ברירת מחדל
      await window.UnifiedTableSystem.sorter.applyDefaultSort('trading_accounts');
    }

    // שחזור סקשנים
    if (pageState.sections && typeof window.restoreAllSectionStates === 'function') {
      await window.restoreAllSectionStates();
    }

    // שחזור פילטרים פנימיים (entity filters) - מתבצע אוטומטית ב-entity-details-renderer

    if (window.Logger) {
      window.Logger.debug(`✅ Page state restored for "${pageName}"`, { page: pageName });
    }
  } catch (error) {
    if (window.Logger) {
      window.Logger.error(`❌ Error restoring page state for "${pageName}":`, error, { page: pageName });
    }
  }
}

/**
 * Register trading_accounts page tables with UnifiedTableSystem
 * This should be called after all scripts are loaded
 */
window.registerTradingAccountsTables = function() {
    if (!window.UnifiedTableSystem) {
        window.Logger?.warn('⚠️ UnifiedTableSystem not available for registration', { page: "trading_accounts" });
        return;
    }

    // Get column mappings from table-mappings.js
    const getColumns = (tableType) => {
        return window.TABLE_COLUMN_MAPPINGS?.[tableType] || [];
    };

    // Register trading_accounts table
    window.UnifiedTableSystem.registry.register('trading_accounts', {
        dataGetter: () => {
            return window.trading_accountsData || [];
        },
        updateFunction: (data) => {
            if (typeof window.updateTradingAccountsTable === 'function') {
                window.updateTradingAccountsTable(data);
            }
        },
        tableSelector: '#accountsTable',
        columns: getColumns('trading_accounts'),
        sortable: true,
        filterable: true
    });

    // Register positions table
    window.UnifiedTableSystem.registry.register('positions', {
        dataGetter: () => {
            return window.positionsPortfolioState?.positionsData || [];
        },
        updateFunction: (data) => {
            if (typeof window.updatePositionsTable === 'function') {
                window.updatePositionsTable(data);
            }
        },
        tableSelector: '#positionsTable',
        columns: getColumns('positions'),
        sortable: true,
        filterable: false
    });

    // Register portfolio table
    window.UnifiedTableSystem.registry.register('portfolio', {
        dataGetter: () => {
            return window.positionsPortfolioState?.portfolioData?.positions || [];
        },
        updateFunction: (data) => {
            if (typeof window.updatePortfolioTable === 'function') {
                window.updatePortfolioTable(data);
            }
        },
        tableSelector: '#portfolioTable',
        columns: getColumns('portfolio'),
        sortable: true,
        filterable: false
    });

    // Register account_activity table
    // Note: This table uses a special data structure with currencies array
    // We need to extract movements from all currencies for sorting
    window.UnifiedTableSystem.registry.register('account_activity', {
        dataGetter: () => {
            // Extract movements from accountActivityState
            if (window.accountActivityState && window.accountActivityState.activityData) {
                const allMovements = [];
                const data = window.accountActivityState.activityData;
                if (data.currencies && Array.isArray(data.currencies)) {
                    data.currencies.forEach(currency => {
                        if (currency.movements && Array.isArray(currency.movements)) {
                            currency.movements.forEach(movement => {
                                allMovements.push({
                                    ...movement,
                                    currency_id: currency.currency_id,
                                    currency_symbol: currency.currency_symbol
                                });
                            });
                        }
                    });
                }
                return allMovements;
            }
            return [];
        },
        updateFunction: (data) => {
            // For account_activity, we need to reconstruct the currencies structure
            // from sorted movements back to the original format
            if (window.accountActivityState && window.accountActivityState.activityData) {
                // Reconstruct the data structure from sorted movements
                const activityData = { ...window.accountActivityState.activityData };
                // Group movements back by currency
                const currenciesMap = {};
                data.forEach(movement => {
                    const currencyId = movement.currency_id;
                    if (!currenciesMap[currencyId]) {
                        currenciesMap[currencyId] = {
                            currency_id: currencyId,
                            currency_symbol: movement.currency_symbol,
                            movements: []
                        };
                    }
                    currenciesMap[currencyId].movements.push(movement);
                });
                activityData.currencies = Object.values(currenciesMap);
                // Call populateAccountActivityTable - now exported globally
                if (typeof window.populateAccountActivityTable === 'function') {
                    window.populateAccountActivityTable(activityData);
                }
            }
        },
        tableSelector: '#accountActivityTable',
        columns: getColumns('account_activity'),
        sortable: true,
        filterable: false
    });

    window.Logger?.info('✅ Trading accounts tables registered with UnifiedTableSystem', { 
        page: "trading_accounts",
        tables: ['trading_accounts', 'account_activity', 'positions', 'portfolio']
    });
};

// Auto-register when DOM is ready and UnifiedTableSystem is available
async function waitAndRegisterTables() {
    // Wait for UnifiedAppInitializer to finish
    if (window.unifiedAppInit && !window.unifiedAppInit.initialized) {
        // Wait up to 10 seconds for initialization
        for (let i = 0; i < 100; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (window.unifiedAppInit.initialized && window.UnifiedTableSystem) {
                break;
            }
        }
    }
    
    // Wait for UnifiedTableSystem specifically (it's loaded in crud package)
    if (!window.UnifiedTableSystem) {
        // Wait up to 5 seconds for UnifiedTableSystem
        for (let i = 0; i < 50; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (window.UnifiedTableSystem) {
                break;
            }
        }
    }
    
    // Now try to register
    if (window.UnifiedTableSystem) {
        window.registerTradingAccountsTables();
    } else {
        window.Logger?.error('❌ UnifiedTableSystem not available after waiting', { page: "trading_accounts" });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        waitAndRegisterTables();
    });
} else {
    waitAndRegisterTables();
}
window.filterTradingAccountsLocally = filterTradingAccountsLocally;
window.updateTradingAccountFilterMenu = updateTradingAccountFilterMenu;
window.getTradingAccountName = getTradingAccountName;
window.updateTradingAccount = updateTradingAccount;
window.showTradingAccountDetails = showTradingAccountDetails;
// REMOVED: window.sortTable - use window.sortTableData from tables.js directly
window.generateDetailedLog = generateDetailedLog;
window.getTradingAccounts = getTradingAccounts;
window.loadAccountBalance = loadAccountBalance;
window.loadAccountBalancesBatch = loadAccountBalancesBatch;
// Note: saveTradingAccount already exported above

// סיום הקובץ
if (window.Logger) {
  window.Logger.info('✅ trading_accounts.js נטען בהצלחה', { page: "trading_accounts" });
} else {
  console.log('✅ trading_accounts.js loaded successfully');
}
