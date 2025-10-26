/**
 * Function Index:
 * ==============
 * 
 * DATA LOADING:
 * - loadTradingAccountsData()
 * - updateTradingAccountsTable()
 * - updatePageSummaryStats()
 * 
 * ACCOUNT MANAGEMENT:
 * - addTradingAccount()
 * - editTradingAccount()
 * - deleteTradingAccount()
 * - updateTradingAccount()
 * 
 * VALIDATION:
 * - clearTradingAccountValidation()
 * - validateTradingAccountForm()
 * 
 * UI MANAGEMENT:
 * - showAddTradingAccountModal()
 * - hideAddTradingAccountModal()
 * - showEditTradingAccountModal()
 * - hideEditTradingAccountModal()
 * - updateRadioButtons()
 * - populateSelect()
 * - onRelationTypeChange()
 * - onRelatedObjectChange()
 * - enableConditionFields()
 * - disableConditionFields()
 * - populateRelatedObjects()
 * 
 * DATA FILTERING:
 * - filterTradingAccountsLocally()
 * 
 * UTILITY FUNCTIONS:
 * - getDemoTradingAccountsData()
 * - restoreSortState()
 * - setupModalConfigurations()
 * 
 * ==============
 */

/* ===== מערכת ניהול חשבונות מסחר ===== */
window.Logger.info('📁 trading_accounts.js נטען - מתחיל אתחול', { page: "trading_accounts" });

// Import getCurrencyDisplay from data-utils.js
if (typeof window.getCurrencyDisplay !== 'function') {
  window.Logger.warn('⚠️ getCurrencyDisplay not available, using fallback', { page: "trading_accounts" });
  window.getCurrencyDisplay = function(account) {
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
  };
}

// ייצוא מוקדם של הפונקציה למניעת שגיאות
window.loadTradingAccountsDataForTradingAccountsPage = window.loadTradingAccountsDataForTradingAccountsPage || function() {
  // loadTradingAccountsDataForTradingAccountsPage not yet defined, using placeholder
  window.Logger.info('⚠️ loadTradingAccountsDataForTradingAccountsPage placeholder called', { page: "trading_accounts" });
};

// הגדרת הפונקציה המלאה מיד אחרי ה-placeholder
window.loadTradingAccountsDataForTradingAccountsPage = async function() {
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

    // בדיקה שהנתונים תקינים
    if (!trading_accounts || !Array.isArray(trading_accounts)) {
      window.Logger.warn('⚠️ נתונים לא תקינים התקבלו מהשרת:', trading_accounts, { page: "trading_accounts" });
      // במקום לזרוק שגיאה, נשתמש בנתוני דמו
      trading_accounts = [];
    }

    // שמירת הנתונים במשתנה גלובלי
    window.trading_accountsData = trading_accounts;
    window.allTradingAccountsData = trading_accounts;
    window.Logger.info('💾 נתונים נשמרו ב-window.trading_accountsData:', trading_accounts.length, 'חשבונות מסחר', { page: "trading_accounts" });

    // החלת פילטרים על הנתונים
    let filteredTradingAccounts = [...trading_accounts];

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

    // עדכון הטבלה
    if (typeof window.updateTradingAccountsTable === 'function') {
      window.Logger.info('📊 מעדכן את טבלת החשבונות המסחר', { page: "trading_accounts" });
      window.updateTradingAccountsTable(filteredTradingAccounts);
    } else {
      window.Logger.warn('⚠️ updateTradingAccountsTable לא זמין', { page: "trading_accounts" });
    }

    // עדכון סטטיסטיקות
    if (typeof window.updateTradingAccountsSummary === 'function') {
      window.Logger.info('📈 מעדכן את סטטיסטיקות החשבונות המסחר', { page: "trading_accounts" });
      window.updateTradingAccountsSummary(filteredTradingAccounts);
    } else {
      window.Logger.warn('⚠️ updateTradingAccountsSummary לא זמין', { page: "trading_accounts" });
    }

    // עדכון מונה הטבלה
    const countElement = document.getElementById('accountsCount');
    if (countElement) {
      countElement.textContent = `${filteredTradingAccounts.length} חשבונות מסחר`;
    }

    window.Logger.info('✅ loadTradingAccountsDataForTradingAccountsPage הושלם בהצלחה', { page: "trading_accounts" });

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
 * - showAddTradingAccountModal: הצגת מודל הוספת חשבון מסחר
 * - createTradingAccount: יצירת חשבון מסחר חדש
 * - updateTradingAccountFromModal: עדכון חשבון מסחר קיים
 * - deleteTradingAccount: מחיקת חשבון מסחר
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

     const response = await fetch('http://127.0.0.1:8080/api/currencies/', {
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

// פונקציה לטעינת חשבונות ברירת מחדל
function loadDefaultTradingAccounts() {
  // Loading default trading_accounts - no dummy data
  window.trading_accountsData = [];
  window.trading_accountsLoaded = true;
  if (typeof window.updateTradingAccountFilterMenu === 'function') {
    window.updateTradingAccountFilterMenu(window.trading_accountsData);
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
  window.Logger.info('🚀🚀🚀 loadTradingAccountsData התחיל 🚀🚀🚀', { page: "trading_accounts" });
  try {
    // טוען נתוני חשבונות מסחר מהשרת

    // בדיקה אם יש פונקציה apiCall זמינה
    if (typeof window.apiCall === 'function') {
      window.Logger.info('📡 משתמש ב-apiCall', { page: "trading_accounts" });
      const response = await window.apiCall('/api/trading-accounts/');
      const trading_accounts = response.data || response;
      window.Logger.info('📊 חשבונות מסחר מ-apiCall:', trading_accounts.length, 'חשבונות', { page: "trading_accounts" });
      // חשבונות שהתקבלו
      return trading_accounts;
    } else {
      window.Logger.info('📡 apiCall לא זמין - משתמש ב-loadTradingAccountsFromServer', { page: "trading_accounts" });
      // קריאה ישירה ל-API
      const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
      const response = await fetch(`${base}/api/trading-accounts/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const trading_accounts = result.data || result;
      // חשבונות שהתקבלו
      return trading_accounts;
    }
  } catch (error) {
    handleApiError(error, 'טעינת נתוני חשבונות');
    throw error;
  }
}

/**
 * עדכון טבלת חשבונות בדף database.html
 * הפונקציה מעדכנת את הטבלה עם נתוני החשבונות
 *
 * @param {Array} trading_accounts - מערך של חשבונות
 *
 * @example
 * updateTradingAccountsTable(trading_accounts);
 */
function updateTradingAccountsTable(trading_accounts) {
  window.Logger.info('🚀🚀🚀 updateTradingAccountsTable התחיל עם', trading_accounts ? trading_accounts.length : 0, 'חשבונות 🚀🚀🚀', { page: "trading_accounts" });
  
  // בדיקה שהפרמטר תקין
  if (!trading_accounts || !Array.isArray(trading_accounts)) {
    window.Logger.error('❌ פרמטר חשבונות לא תקין:', trading_accounts, { page: "trading_accounts" });
    handleValidationError('updateTradingAccountsTable', 'פרמטר חשבונות לא תקין');
    return;
  }

  const tbody = document.querySelector('#accountsTable tbody');
  if (!tbody) {
    window.Logger.warn('⚠️ לא נמצא tbody לטבלת חשבונות - ייתכן שהדף לא נטען עדיין', { page: "trading_accounts" });
    window.Logger.info('🔍 חיפוש אלטרנטיבי...', { page: "trading_accounts" });
    const table = document.querySelector('#accountsTable');
    if (table) {
      window.Logger.info('✅ נמצאה הטבלה:', table, { page: "trading_accounts" });
      const tbodyAlt = table.querySelector('tbody');
      if (tbodyAlt) {
        window.Logger.info('✅ נמצא tbody אלטרנטיבי:', tbodyAlt, { page: "trading_accounts" });
        // המשך עם tbodyAlt
        tbody = tbodyAlt;
      } else {
        window.Logger.error('❌ לא נמצא tbody בטבלה', { page: "trading_accounts" });
        return;
      }
    } else {
      window.Logger.error('❌ לא נמצאה הטבלה #accountsTable', { page: "trading_accounts" });
      return;
    }
  }

  // בניית הטבלה מחדש לפי הכותרות בדיוק
  window.Logger.info('📊 עדכון טבלת חשבונות עם', trading_accounts.length, 'חשבונות', { page: "trading_accounts" });
  window.Logger.info('🔍 tbody נמצא:', tbody, { page: "trading_accounts" });
  window.Logger.info('🔍 tbody.innerHTML לפני עדכון:', tbody.innerHTML.length, 'תווים', { page: "trading_accounts" });
  
  tbody.innerHTML = trading_accounts.map(tradingAccount => {
    // המרת סטטוס לעברית לפילטר
    const statusForFilter = tradingAccount.status === 'open' ? 'פתוח' :
      tradingAccount.status === 'closed' ? 'סגור' :
        tradingAccount.status === 'cancelled' ? 'מבוטל' : tradingAccount.status || '-';

    return `
    <tr data-trading-account-id="${tradingAccount.id}">
      <td class="ticker-cell" data-tradingAccount="${tradingAccount.name || '-'}">
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="btn btn-sm" 
            onclick="showEntityDetails('account', ${tradingAccount.id})" 
            title="פרטי חשבון" 
            style="background-color: white; font-size: 0.8em;">
            🔗
          </button>
          <span class="entity-trading-account-badge" 
                style="padding: 2px 8px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">
            ${tradingAccount.name || '-'}
          </span>
        </div>
      </td>
      <td>${tradingAccount.type || '-'}</td>
      <td>${tradingAccount.currency || '-'}</td>
      <td>
        ${window.renderAmount ? window.renderAmount(tradingAccount.cash_balance || 0, getCurrencyDisplay(tradingAccount)) : 
          `${(tradingAccount.cash_balance || 0).toFixed(2)} ${getCurrencyDisplay(tradingAccount)}`}
      </td>
      <td class="status-cell" data-status="${statusForFilter}">
        ${window.renderStatus ? window.renderStatus(tradingAccount.status, 'account') : 
          `<span class="status-${tradingAccount.status}">${tradingAccount.status}</span>`}
      </td>
      <td>${window.renderDate ? window.renderDate(tradingAccount.created_at) : 
          new Date(tradingAccount.created_at).toLocaleDateString('he-IL')}</td>
      <td class="actions-cell">
        ${window.createActionsMenu ? window.createActionsMenu([
          { type: 'VIEW', onclick: `window.showEntityDetails('trading_account', ${tradingAccount.id}, { mode: 'view' })`, title: 'צפה בפרטי חשבון' },
          { type: 'LINK', onclick: `window.showLinkedItemsModal && window.showLinkedItemsModal(linkedItemsData, 'tradingAccount', ${tradingAccount.id})`, title: 'פריטים מקושרים' },
          { type: 'EDIT', onclick: `showEditTradingAccountModalById(${tradingAccount.id})`, title: 'ערוך' },
          { type: tradingAccount.status === 'cancelled' ? 'REACTIVATE' : 'CANCEL', onclick: `window.${tradingAccount.status === 'cancelled' ? 'reactivate' : 'cancel'}Account && window.${tradingAccount.status === 'cancelled' ? 'reactivate' : 'cancel'}Account(${tradingAccount.id})`, title: tradingAccount.status === 'cancelled' ? 'הפעל מחדש' : 'בטל' }
        ]) : `
        <button data-button-type="VIEW" data-variant="small" data-onclick="window.showEntityDetails('trading_account', ${tradingAccount.id}, { mode: 'view' })" data-text="" title="צפה בפרטי חשבון"></button>
        <button data-button-type="LINK" data-variant="small" data-onclick="window.showLinkedItemsModal && window.showLinkedItemsModal(linkedItemsData, 'tradingAccount', ${tradingAccount.id})" data-text="" title="פריטים מקושרים"></button>
        <button data-button-type="EDIT" data-variant="small" data-onclick="showEditTradingAccountModalById(${tradingAccount.id})" data-text="" title="ערוך"></button>
        <button data-button-type="${tradingAccount.status === 'cancelled' ? 'REACTIVATE' : 'CANCEL'}" data-variant="small" data-onclick="window.${tradingAccount.status === 'cancelled' ? 'reactivate' : 'cancel'}Account && window.${tradingAccount.status === 'cancelled' ? 'reactivate' : 'cancel'}Account(${tradingAccount.id})" data-text="" title="${tradingAccount.status === 'cancelled' ? 'הפעל מחדש' : 'בטל'}"></button>
        `}
      </td>
    </tr>
  `;}).join('');

  // עדכון ספירת רשומות
  const countElement = document.getElementById('accountsCount');
  if (countElement) {
    countElement.textContent = `${trading_accounts.length} חשבונות`;
  }

  // עדכון הסטטיסטיקות
  updateTradingAccountsSummary(trading_accounts);

  window.Logger.info('✅ טבלת חשבונות עודכנה בהצלחה עם', trading_accounts.length, 'חשבונות', { page: "trading_accounts" });
  window.Logger.info('🔍 tbody.innerHTML אחרי עדכון:', tbody.innerHTML.length, 'תווים', { page: "trading_accounts" });
  window.Logger.info('🔍 מספר שורות בטבלה:', tbody.children.length, { page: "trading_accounts" });
  // END UPDATE TRADING ACCOUNTS TABLE
}

/**
 * עדכון סיכום נתונים לחשבונות מסחר
 * @param {Array} trading_accounts - מערך החשבונות
 */
function updateTradingAccountsSummary(trading_accounts) {
  // מערכת מאוחדת לסיכום נתונים
  if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS) {
    const config = window.INFO_SUMMARY_CONFIGS.trading_accounts;
    window.InfoSummarySystem.calculateAndRender(trading_accounts, config);
  } else {
    // מערכת סיכום נתונים לא זמינה
    const summaryStatsElement = document.getElementById('summaryStats');
    if (summaryStatsElement) {
      summaryStatsElement.innerHTML = `
        <div style="color: #dc3545; font-weight: bold;">
          ⚠️ מערכת סיכום נתונים לא זמינה - נא לרענן את הדף
        </div>
      `;
    }
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
      updateTradingAccountsTable(trading_accounts);
    } else {
      const trading_accounts = await loadTradingAccountsData();
      updateTradingAccountsTable(trading_accounts);
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

// פונקציה לעדכון טקסט פילטר החשבונות
function updateTradingAccountFilterDisplayText() {
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
  if (window.trading_accountsData && window.trading_accountsData.length > 0) {
    if (typeof window.updateTradingAccountFilterMenu === 'function') {
      window.updateTradingAccountFilterMenu(window.trading_accountsData);
    }
  } else {
    loadTradingAccountsFromServer();
  }
};

// פונקציה לבדיקת מצב החשבונות
window.checkTradingAccountsStatus = function () {

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
  fetch('http://127.0.0.1:8080/api/trading-accounts/')
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
 * הצגת מודל חשבון מסחר (הוספה או עריכה)
 * @param {string} mode - 'add' או 'edit'
 * @param {Object} [tradingAccount] - אובייקט החשבון המסחר (נדרש רק בעריכה)
 */
function showTradingAccountModal(mode, tradingAccount = null) {
  const isEdit = mode === 'edit';
  
  try {
    if (isEdit) {
      // בדיקה שהפרמטר תקין
      if (!tradingAccount || typeof tradingAccount !== 'object') {
        handleValidationError('showTradingAccountModal', 'פרמטר חשבון לא תקין');
        if (typeof window.showErrorNotification === 'function') {
          window.showErrorNotification('שגיאה', 'שגיאה בפתיחת מודל העריכה');
        } else {
          handleSystemError(new Error('שגיאה בפתיחת מודל העריכה'), 'פתיחת מודל עריכה');
        }
        return;
      }

      // יצירת המודל דינמית
      const modal = createTradingAccountModal('edit', tradingAccount);
      document.body.appendChild(modal);

      // הצגת המודל
      const bootstrapModal = new bootstrap.Modal(modal);
      bootstrapModal.show();

      // אתחול וולידציה בפתיחת המודל
      if (window.initializeValidation) {
        window.initializeValidation('accountForm');
      }
    } else {
      // בדיקה אם יש מודל קיים בדף
      const modalElement = document.getElementById('tradingAccountModal');
      if (modalElement) {
        // איפוס הטופס
        const form = document.getElementById('tradingAccountForm');
        if (form) {
          form.reset();
        }

        // הצגת המודל
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      } else {
        // יצירת המודל דינמית
        const modal = createTradingAccountModal('add');
        document.body.appendChild(modal);

        // הצגת המודל
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();

        // אתחול וולידציה בפתיחת המודל
        if (window.initializeValidation) {
          window.initializeValidation('tradingAccountForm');
        }
      }
    }
    
  } catch (error) {
    const action = isEdit ? 'עריכת' : 'הוספת';
    handleSystemError(error, `הצגת מודל ${action} חשבון מסחר`);
  }
}

/**
 * הצגת מודל הוספת חשבון
 * @deprecated Use showTradingAccountModal('add') instead
 */
function showAddTradingAccountModal() {
  showTradingAccountModal('add');
}

/**
 * יצירת מודל חשבון
 * @param {string} mode - 'add' או 'edit'
 * @param {Object} tradingAccount - אובייקט החשבון המסחר לעריכה (רק במצב edit)
 */
function createTradingAccountModal(mode, tradingAccount = null) {

  const isEdit = mode === 'edit';
  const title = isEdit ? 'עריכת חשבון' : 'הוספת חשבון חדש';
  const buttonText = isEdit ? 'שמור שינויים' : 'הוסף חשבון';

  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'tradingAccountModal';
  modal.setAttribute('tabindex', '-1');
  modal.setAttribute('aria-labelledby', 'tradingAccountModalLabel');
  modal.setAttribute('aria-hidden', 'true');
  modal.setAttribute('data-bs-backdrop', 'true');

  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header linkedItems_modal-header-colored">
          <h5 class="modal-title" id="tradingAccountModalLabel">${title}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form id="tradingAccountForm">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="accountName" class="form-label">שם החשבון *</label>
                  <input type="text" class="form-control" id="accountName" name="name" required 
                         value="${tradingAccount ? tradingAccount.name : ''}" placeholder="הכנס שם חשבון (לפחות 3 תווים)" minlength="3" maxlength="18">
                  <div class="invalid-feedback" id="nameError"></div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="accountCurrency" class="form-label">מטבע *</label>
                  <select class="form-select" id="accountCurrency" name="currency_id" required>
                    <option value="">בחר מטבע</option>
                    ${generateCurrencyOptions(tradingAccount)}
                  </select>
                  <div class="invalid-feedback" id="currencyError"></div>
                </div>
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="accountStatus" class="form-label">סטטוס</label>
                  <select class="form-select" id="accountStatus" name="status">
                    <option value="open" ${tradingAccount && tradingAccount.status === 'open' ? 'selected' : ''}>פתוח</option>
                    <option value="closed" ${tradingAccount && tradingAccount.status === 'closed' ? 'selected' : ''}>סגור</option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="accountCashBalance" class="form-label">יתרת מזומן</label>
                  <input type="number" class="form-control" id="accountCashBalance" name="cash_balance" 
                         value="${tradingAccount ? tradingAccount.cash_balance || 0 : 0}" placeholder="0" step="0.01" min="0">
                  <div class="invalid-feedback" id="cashBalanceError"></div>
                </div>
              </div>
            </div>
            
            <div class="mb-3">
              <label for="accountNotes" class="form-label">הערות</label>
              <textarea class="form-control" id="accountNotes" name="notes" rows="3" 
                        placeholder="הכנס הערות על החשבון">${tradingAccount ? tradingAccount.notes || '' : ''}</textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button data-button-type="CANCEL" data-attributes="data-bs-dismiss='modal' type='button'"></button>
          <button data-button-type="SAVE" data-onclick="saveTradingAccount('${mode}', ${tradingAccount ? tradingAccount.id : 'null'})" data-attributes="type='button'"></button>
        </div>
      </div>
    </div>
  `;

  // הוספת event listeners לבדיקות בזמן אמת
  setTimeout(() => {
    const nameInput = modal.querySelector('#accountName');
    const currencySelect = modal.querySelector('#accountCurrency');
    const cashBalanceInput = modal.querySelector('#accountCashBalance');

    // בדיקת שם החשבון
    nameInput.addEventListener('input', function () {
      const value = this.value.trim();
      const errorElement = modal.querySelector('#nameError');

      if (!errorElement) {return;} // בדיקה שהאלמנט קיים

      if (value === '') {
        this.classList.add('is-invalid');
        errorElement.textContent = 'שם החשבון הוא שדה חובה';
      } else if (value.length < 3) {
        this.classList.add('is-invalid');
        errorElement.textContent = 'שם החשבון חייב להכיל לפחות 3 תווים';
      } else if (value.length > 18) {
        this.classList.add('is-invalid');
        errorElement.textContent = 'שם החשבון לא יכול לעלות על 18 תווים';
      } else {
        this.classList.remove('is-invalid');
        errorElement.textContent = '';
      }
    });

    // בדיקת מטבע
    currencySelect.addEventListener('change', function () {
      const errorElement = modal.querySelector('#currencyError');

      if (!errorElement) {return;} // בדיקה שהאלמנט קיים

      if (!this.value) {
        this.classList.add('is-invalid');
        errorElement.textContent = 'יש לבחור מטבע';
      } else {
        this.classList.remove('is-invalid');
        errorElement.textContent = '';
      }
    });

    // בדיקת יתרת מזומן
    cashBalanceInput.addEventListener('input', function () {
      const value = parseFloat(this.value);
      const errorElement = modal.querySelector('#cashBalanceError');

      if (!errorElement) {return;} // בדיקה שהאלמנט קיים

      if (this.value !== '' && (isNaN(value) || value < 0)) {
        this.classList.add('is-invalid');
        errorElement.textContent = 'יתרת מזומן חייבת להיות מספר חיובי';
      } else {
        this.classList.remove('is-invalid');
        errorElement.textContent = '';
      }
    });

    // הוספת event listeners נוספים
    nameInput.addEventListener('blur', function () {
      this.dispatchEvent(new Event('input'));
    });

    currencySelect.addEventListener('blur', function () {
      this.dispatchEvent(new Event('change'));
    });

    cashBalanceInput.addEventListener('blur', function () {
      this.dispatchEvent(new Event('input'));
    });
  }, 100);

  return modal;
}

/**
 * בדיקת תקינות נתוני חשבון מקיפה
 * @param {Object} tradingAccountData - נתוני החשבון המסחר
 * @returns {Object} - תוצאה עם isValid ו-message
 */
function validateTradingAccountData(tradingAccountData) {
  // בדיקת שם החשבון
  if (!tradingAccountData.name || tradingAccountData.name.trim() === '') {
    return { isValid: false, message: 'שם החשבון הוא שדה חובה' };
  }

  const trimmedName = tradingAccountData.name.trim();

  if (trimmedName.length < 3) {
    return { isValid: false, message: 'שם החשבון חייב להכיל לפחות 3 תווים' };
  }

  if (trimmedName.length > 50) {
    return { isValid: false, message: 'שם החשבון לא יכול לעלות על 50 תווים' };
  }

  // בדיקת תווים לא חוקיים
  const invalidChars = /[<>"'&]/;
  if (invalidChars.test(trimmedName)) {
    return { isValid: false, message: 'שם החשבון מכיל תווים לא חוקיים' };
  }

  // בדיקת מטבע
  if (!tradingAccountData.currency_id || tradingAccountData.currency_id === '') {
    return { isValid: false, message: 'יש לבחור מטבע' };
  }

  // בדיקת סטטוס
  if (tradingAccountData.status && !['open', 'closed'].includes(tradingAccountData.status)) {
    return { isValid: false, message: 'סטטוס חשבון לא תקין - רק פתוח או סגור מותרים' };
  }

  // בדיקת יתרת מזומן
  const cashBalance = tradingAccountData.cash_balance;
  if (cashBalance !== null && cashBalance !== undefined && cashBalance !== '') {
    const numBalance = parseFloat(cashBalance);
    if (isNaN(numBalance)) {
      return { isValid: false, message: 'יתרת מזומן חייבת להיות מספר תקין' };
    }
    if (numBalance < -1000000) {
      return { isValid: false, message: 'יתרת מזומן נמוכה מדי (מינימום -1,000,000)' };
    }
    if (numBalance > 100000000) {
      return { isValid: false, message: 'יתרת מזומן גבוהה מדי (מקסימום 100,000,000)' };
    }
  }

  // בדיקת ערך כולל
  const totalValue = tradingAccountData.total_value;
  if (totalValue !== null && totalValue !== undefined && totalValue !== '') {
    const numValue = parseFloat(totalValue);
    if (isNaN(numValue)) {
      return { isValid: false, message: 'ערך כולל חייב להיות מספר תקין' };
    }
    if (numValue < -1000000) {
      return { isValid: false, message: 'ערך כולל נמוך מדי (מינימום -1,000,000)' };
    }
    if (numValue > 100000000) {
      return { isValid: false, message: 'ערך כולל גבוה מדי (מקסימום 100,000,000)' };
    }
  }

  // בדיקת רווח/הפסד כולל
  const totalPl = tradingAccountData.total_pl;
  if (totalPl !== null && totalPl !== undefined && totalPl !== '') {
    const numPl = parseFloat(totalPl);
    if (isNaN(numPl)) {
      return { isValid: false, message: 'רווח/הפסד כולל חייב להיות מספר תקין' };
    }
    if (numPl < -1000000) {
      return { isValid: false, message: 'רווח/הפסד כולל נמוך מדי (מינימום -1,000,000)' };
    }
    if (numPl > 100000000) {
      return { isValid: false, message: 'רווח/הפסד כולל גבוה מדי (מקסימום 100,000,000)' };
    }
  }

  // בדיקת הערות
  if (tradingAccountData.notes && tradingAccountData.notes.length > 1000) {
    return { isValid: false, message: 'הערות ארוכות מדי (מקסימום 1,000 תווים)' };
  }

  return { isValid: true, message: '' };
}

/**
 * הצגת הודעת שגיאה בטופס
 * @param {string} message - הודעת השגיאה
 */
function showFormError(message) {
  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification('שגיאה', message);
  } else {
    handleSystemError(new Error(message), 'שגיאת טופס');
  }
}

/**
 * פונקציה לשמירת חשבון מסחר
 * @param {string} mode - 'add' או 'edit'
 * @param {number} tradingAccountId - מזהה החשבון המסחר (רק במצב edit)
 */
async function saveTradingAccount(mode, tradingAccountId = null) {
  try {
    // ניקוי מטמון לפני פעולת CRUD - הוספה/עריכה
    if (window.clearCacheBeforeCRUD) {
      window.clearCacheBeforeCRUD('trading_accounts', mode === 'add' ? 'add' : 'edit');
    }
    
    // איסוף נתונים מהטופס באמצעות DataCollectionService
    const tradingAccountData = DataCollectionService.collectFormData({
      name: { id: 'name', type: 'text' },
      currency_id: { id: 'currency_id', type: 'int' },
      status: { id: 'status', type: 'text' },
      cash_balance: { id: 'cash_balance', type: 'number' },
      notes: { id: 'notes', type: 'text' }
    });

    // בדיקת תקינות
    const validation = validateTradingAccountData(tradingAccountData);
    if (!validation.isValid) {
      showFormError(validation.message);
      return; // לא ממשיכים אם יש שגיאה
    }

    // קריאה ל-API עם CRUDResponseHandler
    if (mode === 'add') {
      const response = await fetch('/api/trading-accounts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradingAccountData),
      });
      
      await CRUDResponseHandler.handleSaveResponse(response, {
        modalId: 'tradingAccountModal',
        successMessage: 'חשבון נוסף בהצלחה!',
        apiUrl: '/api/trading-accounts/',
        entityName: 'חשבון מסחר'
      });
    } else {
      const response = await fetch(`/api/trading-accounts/${tradingAccountId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradingAccountData),
      });
      
      await CRUDResponseHandler.handleUpdateResponse(response, {
        modalId: 'tradingAccountModal',
        successMessage: 'חשבון עודכן בהצלחה!',
        apiUrl: '/api/trading-accounts/',
        entityName: 'חשבון מסחר'
      });
    }

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'שמירת חשבון');
  }
}

/**
 * הוספת חשבון ל-API
 * @param {Object} tradingAccountData - נתוני החשבון המסחר
 */
async function addTradingAccountToAPI(tradingAccountData) {
  try {
    const response = await fetch('/api/trading-accounts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tradingAccountData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    handleSaveError(error, 'הוספת חשבון');
    throw error;
  }
}

/**
 * עדכון חשבון מסחר ב-API
 * @param {number} tradingAccountId - מזהה החשבון המסחר
 * @param {Object} tradingAccountData - נתוני החשבון המסחר
 */
async function updateTradingAccountInAPI(tradingAccountId, tradingAccountData) {
  try {
    const response = await fetch(`/api/trading-accounts/${tradingAccountId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tradingAccountData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    handleSaveError(error, 'עדכון חשבון');
    throw error;
  }
}

/**
 * הצגת מודל עריכת חשבון
 * @param {Object} account - אובייקט החשבון לעריכה
 */
/**
 * הצגת מודל עריכת חשבון מסחר לפי ID
 * @param {number} tradingAccountId - מזהה החשבון המסחר
 */
async function showEditTradingAccountModalById(tradingAccountId) {
  // בדיקה שהפרמטר תקין
  if (!tradingAccountId) {
    handleValidationError('showEditTradingAccountModalById', 'מזהה חשבון מסחר לא תקין');
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'מזהה חשבון לא תקין');
    } else {
      handleValidationError('showEditTradingAccountModalById', 'מזהה חשבון מסחר לא תקין');
    }
    return;
  }

  try {
    // טעינת נתוני החשבון מהשרת
    const response = await fetch(`/api/trading-accounts/${tradingAccountId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const tradingAccount = result.data || result;

    if (!tradingAccount) {
      throw new Error('חשבון לא נמצא');
    }

    // הצגת המודל עם הנתונים
    showEditTradingAccountModal(tradingAccount);

  } catch (error) {
    handleApiError(error, 'טעינת נתוני חשבון');
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בטעינת נתוני החשבון: ' + error.message);
    } else {
      handleApiError(error, 'טעינת נתוני החשבון');
    }
  }
}

/**
 * הצגת מודל עריכת חשבון מסחר
 * @param {Object} tradingAccount - אובייקט החשבון המסחר לעריכה
 * @deprecated Use showTradingAccountModal('edit', tradingAccount) instead
 */
function showEditTradingAccountModal(tradingAccount) {
  showTradingAccountModal('edit', tradingAccount);
}


/**
 * עדכון חשבון קיים - הוסר כי לא בשימוש
 */
// async function updateTradingAccountFromModal() { ... }

/**
 * טעינת נתוני חשבונות מ-API
 * @returns {Promise<Array>} מערך של חשבונות
 */
async function loadTradingAccountsDataFromAPI() {
  window.Logger.info('🚀🚀🚀 loadTradingAccountsDataFromAPI התחיל 🚀🚀🚀', { page: "trading_accounts" });
  try {
    window.Logger.info('📡 שליחת בקשה ל-API:', '/api/trading-accounts/', { page: "trading_accounts" });
    const response = await fetch('/api/trading-accounts/');
    window.Logger.info('📡 תגובת שרת:', response.status, response.ok, { page: "trading_accounts" });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    window.Logger.info('📊 תוצאה מ-API:', result, { page: "trading_accounts" });

    // בדיקה אם התוצאה מכילה מערך נתונים
    if (result.data && Array.isArray(result.data)) {
      window.Logger.info('📊 החזרת נתונים מ-result.data:', result.data.length, 'חשבונות', { page: "trading_accounts" });
      return result.data;
    } else if (Array.isArray(result)) {
      window.Logger.info('📊 החזרת נתונים מ-result:', result.length, 'חשבונות', { page: "trading_accounts" });
      return result;
    } else {
      window.Logger.error('❌ פורמט תגובה לא תקין:', result, { page: "trading_accounts" });
      handleSystemError(new Error('מבנה נתונים לא צפוי'), 'מבנה נתונים לא צפוי מה-API');
      throw new Error('מבנה נתונים לא צפוי מה-API');
    }

  } catch (error) {
    window.Logger.error('❌ שגיאה ב-loadTradingAccountsDataFromAPI:', error, { page: "trading_accounts" });
    handleApiError('שגיאה בקריאה ל-API', error.message);
    throw error;
  }
}

/**
 * מחיקת חשבון מסחר מהשרת
 * @param {number} tradingAccountId - מזהה החשבון המסחר
 * @param {string} accountName - שם החשבון
 */
async function deleteTradingAccountFromAPI(tradingAccountId, tradingAccountName) {
  try {
    const response = await fetch(`/api/trading-accounts/${tradingAccountId}`, {
      method: 'DELETE',
    });

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    await CRUDResponseHandler.handleDeleteResponse(response, {
      successMessage: `החשבון "${tradingAccountName}" נמחק בהצלחה!`,
      apiUrl: '/api/trading-accounts/',
      entityName: 'חשבון מסחר'
    });

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'מחיקת חשבון');
  }
}

/**
 * ביטול חשבון מסחר (שינוי סטטוס למבוטל)
 * @param {number} tradingAccountId - מזהה החשבון המסחר
 * @param {string} accountName - שם החשבון
 */
async function cancelTradingAccount(tradingAccountId, tradingAccountName) {

  // בדיקה ראשונה
  if (window.showCancelWarning) {
    await new Promise(resolve => {
      window.showCancelWarning('חשבון', tradingAccountName,
        () => {
          // בדיקה שנייה
          if (window.showCancelWarning) {
            window.showCancelWarning('חשבון', tradingAccountName,
              () => resolve(true),
              () => resolve(false),
            );
          } else {
            if (typeof window.showSecondConfirmationModal === 'function') {
              window.showSecondConfirmationModal(
                'ביטול חשבון',
                `הסטטוס ישתנה ל"מבוטל". האם אתה בטוח שברצונך להמשיך בביטול החשבון "${accountName}"?`,
                () => resolve(true),
                () => resolve(false),
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
        window.showCancelWarning('חשבון', tradingAccountName,
          () => resolve(true),
          () => resolve(false),
        );
      });
      if (!confirmed) {return;}
    } else {
      if (typeof window.showConfirmationDialog === 'function') {
        const confirmed = await new Promise(resolve => {
          window.showConfirmationDialog(
            'ביטול חשבון',
            `האם אתה בטוח שברצונך לבטל את החשבון "${accountName}"?\n\nהסטטוס ישתנה ל"מבוטל".`,
            () => resolve(true),
            () => resolve(false),
          );
        });
        if (!confirmed) {return;}
      } else {
        if (typeof window.showConfirmationDialog === 'function') {
          const confirmed = await new Promise(resolve => {
            window.showConfirmationDialog(
              'ביטול חשבון',
              `האם אתה בטוח שברצונך לבטל את החשבון "${accountName}"?\n\nהסטטוס ישתנה ל"מבוטל".`,
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
                'ביטול חשבון',
                `האם אתה בטוח שברצונך לבטל את החשבון "${accountName}"?`,
                () => resolve(true),
                () => resolve(false)
              );
            });
            if (!confirmed) return;
          } else {
            const confirmed = typeof showConfirmationDialog === 'function' ? 
              await new Promise(resolve => {
                showConfirmationDialog(
                  `האם אתה בטוח שברצונך לבטל את החשבון "${accountName}"?`,
                  () => resolve(true),
                  () => resolve(false),
                  'ביטול חשבון',
                  'בטל',
                  'חזור'
                );
              }) : 
              window.confirm(`האם אתה בטוח שברצונך לבטל את החשבון "${accountName}"?`);
            if (!confirmed) {
            return;
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
      showSuccessMessage('חשבון בוטל בהצלחה!');

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
      showErrorMessage(data.message || 'שגיאה בביטול חשבון');
    }
  } catch (error) {
    handleSystemError(error, 'ביטול חשבון');
    showErrorMessage('שגיאה בביטול חשבון');
  }
}

/**
 * מחיקת חשבון
 * @param {number} tradingAccountId - מזהה החשבון המסחר
 * @param {string} accountName - שם החשבון
 */
async function deleteTradingAccount(tradingAccountId, tradingAccountName) {
  // ניקוי מטמון לפני פעולת CRUD - מחיקה
  if (window.clearCacheBeforeCRUD) {
    window.clearCacheBeforeCRUD('trading_accounts', 'delete');
  }

  // בדיקת פריטים מקושרים לפני מחיקה
  if (typeof window.checkLinkedItemsBeforeDeleteTradingAccount === 'function') {
    const hasLinkedItems = await window.checkLinkedItemsBeforeDeleteTradingAccount(tradingAccountId);
    if (hasLinkedItems) {
      return; // הפונקציה תטפל בהצגת המודול
    }
  }

  // אישור מהמשתמש
  if (typeof window.showDeleteWarning === 'function') {
    const confirmed = await new Promise(resolve => {
      window.showDeleteWarning('tradingAccount', tradingAccountId, 'חשבון',
        () => resolve(true),
        () => resolve(false),
      );
    });
    if (!confirmed) {return;}
  } else {
    // Fallback למערכת הישנה
    if (typeof window.showConfirmationDialog === 'function') {
      const confirmed = await new Promise(resolve => {
        window.showConfirmationDialog(
          'מחיקת חשבון',
          `האם אתה בטוח שברצונך למחוק את החשבון "${accountName}"?\n\nפעולה זו אינה הפיכה.`,
          () => resolve(true),
          () => resolve(false),
        );
      });
      if (!confirmed) {return;}
    } else {
      if (typeof window.showConfirmationDialog === 'function') {
        const confirmed = await new Promise(resolve => {
          window.showConfirmationDialog(
            'מחיקת חשבון',
            `האם אתה בטוח שברצונך למחוק את החשבון "${accountName}"?\n\nפעולה זו אינה הפיכה.`,
            () => resolve(true),
            () => resolve(false),
          );
        });
        if (!confirmed) {return;}
      } else {
        if (window.showConfirmationDialog) {
          const confirmed = await new Promise(resolve => {
            window.showConfirmationDialog(
              'מחיקת חשבון',
              `האם אתה בטוח שברצונך למחוק את החשבון "${accountName}"?\n\nפעולה זו אינה הפיכה.`,
              () => resolve(true),
              () => resolve(false)
            );
          });
          if (!confirmed) return;
        } else if (!window.confirm(`האם אתה בטוח שברצונך למחוק את החשבון "${accountName}"?`)) {
          return;
        }
      }
    }
  }

  try {
    const response = await fetch(`/api/trading-accounts/${tradingAccountId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      // שימוש במערכת הריענון המרכזית
      if (window.centralRefresh) {
        await window.centralRefresh.showSuccessAndRefresh('trading_accounts', 'חשבון נמחק בהצלחה!');
      } else {
        // Fallback למערכת הישנה
        showSuccessMessage('חשבון נמחק בהצלחה!');

        // רענון הטבלה
        if (typeof window.loadTradingAccountsDataForTradingAccountsPage === 'function') {
          await window.loadTradingAccountsDataForTradingAccountsPage();
        } else if (typeof window.loadTradingAccountsData === 'function') {
          const trading_accounts = await window.loadTradingAccountsData();
          if (typeof window.updateTradingAccountsTable === 'function') {
            window.updateTradingAccountsTable(trading_accounts);
          }
        }
      }
    } else {
      const data = await response.json();
      showErrorMessage(data.message || 'שגיאה במחיקת חשבון');
    }
  } catch (error) {
    handleDeleteError(error, 'מחיקת חשבון');
    showErrorMessage('שגיאה במחיקת חשבון');
  }
}

// הפונקציה הועברה למטה - גרסה מפורטת יותר

/**
 * הצגת הודעת הצלחה
 * @param {string} message - הודעת ההצלחה
 */
function showSuccessMessage(message) {
  if (typeof window.showSuccessNotification === 'function') {
    window.showSuccessNotification('הצלחה', message);
  }
}

/**
 * הצגת הודעת שגיאה
 * @param {string} message - הודעת השגיאה
 */
function showErrorMessage(message) {
  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification('שגיאה', message);
  } else {
    handleSystemError(new Error(message), 'שגיאת הודעה');
  }
}

// פונקציות עזר - הועברו ל-ui-utils.js

function confirmDeleteTradingAccount(tradingAccountId, tradingAccountName) {
  deleteTradingAccount(tradingAccountId, tradingAccountName);
}

// function checkLinkedItems(tradingAccountId) { // הוסר - הוחלף ב-checkLinkedItemsBeforeDelete
//   // פונקציה פשוטה לבדיקת פריטים מקושרים
//   return Promise.resolve({ hasLinkedItems: false, items: [] });
// }

function showOpenTradesWarning(tradingAccountId, tradingAccountName) {
  if (typeof window.showWarningNotification === 'function') {
    window.showWarningNotification('אזהרה', `יש עסקאות פתוחות בחשבון "${accountName}". לא ניתן למחוק חשבון עם עסקאות פעילות.`);
  } else {
    // window.Logger.warn(`יש עסקאות פתוחות בחשבון "${accountName}". לא ניתן למחוק חשבון עם עסקאות פעילות.`, { page: "trading_accounts" });
  }
}

// createWarningModal הועברה ל-ui-utils.js

// ייצוא הפונקציות הנוספות
window.showAddTradingAccountModal = showAddTradingAccountModal;
window.showEditTradingAccountModal = showEditTradingAccountModal;
window.showEditTradingAccountModalById = showEditTradingAccountModalById;
window.cancelTradingAccount = cancelTradingAccount;
window.deleteTradingAccount = deleteTradingAccount;
window.showTradingAccountSuccessMessage = showSuccessMessage;
window.showTradingAccountErrorMessage = showErrorMessage;
window.showSecondConfirmationModal = showSecondConfirmationModal;
window.confirmDeleteTradingAccount = confirmDeleteTradingAccount;
// window.checkLinkedItems = checkLinkedItems; // הוסר - הוחלף ב-checkLinkedItemsBeforeDelete
window.showOpenTradesWarning = showOpenTradesWarning;
// window.createWarningModal = createWarningModal; // הועברה ל-ui-utils.js
window.deleteTradingAccountFromAPI = deleteTradingAccountFromAPI;
window.loadTradingAccountsDataFromAPI = loadTradingAccountsDataFromAPI;
window.addTradingAccountToAPI = addTradingAccountToAPI;
window.updateTradingAccountInAPI = updateTradingAccountInAPI;
window.checkLinkedItemsBeforeDeleteTradingAccount = checkLinkedItemsBeforeDeleteTradingAccount;  // בדיקת אובייקטים מקושרים למחיקה
window.createTradingAccountModal = createTradingAccountModal;
window.saveTradingAccount = saveTradingAccount;
window.validateTradingAccountData = validateTradingAccountData;
window.showFormError = showFormError;
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

/**
 * פונקציה לטעינת נתוני חשבונות מסחר ועדכון הטבלה בדף חשבונות המסחר
 * פונקציה זו מיועדת לדף חשבונות המסחר (trading_accounts.html)
 */
async function loadTradingAccountsDataForTradingAccountsPage() {
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

    // בדיקה שהנתונים תקינים
    if (!trading_accounts || !Array.isArray(trading_accounts)) {
      window.Logger.warn('⚠️ נתונים לא תקינים התקבלו מהשרת:', trading_accounts, { page: "trading_accounts" });
      // במקום לזרוק שגיאה, נשתמש בנתוני דמו
      trading_accounts = [];
    }

    // שמירת הנתונים במשתנה גלובלי
    window.trading_accountsData = trading_accounts;
    window.allTradingAccountsData = trading_accounts;
    window.Logger.info('💾 נתונים נשמרו ב-window.trading_accountsData:', trading_accounts.length, 'חשבונות מסחר', { page: "trading_accounts" });

    // החלת פילטרים על הנתונים
    let filteredTradingAccounts = [...trading_accounts];

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

    // שמירת הנתונים המסוננים לגלובלי
    window.filteredTradingAccountsData = filteredTradingAccounts;

    // עדכון הטבלה עם הנתונים המסוננים
    if (typeof window.updateTradingAccountsTable === 'function') {
      window.Logger.info('📊 עדכון טבלה עם', filteredTradingAccounts.length, 'חשבונות מסחר', { page: "trading_accounts" });
      window.Logger.info('🔍 קריאה ל-updateTradingAccountsTable...', { page: "trading_accounts" });
      window.Logger.info('🔍 נתונים לשליחה:', filteredTradingAccounts.slice(0, 2, { page: "trading_accounts" })); // רק 2 ראשונים לדיבוג
      window.Logger.info('🔍 בדיקת tbody לפני עדכון...', { page: "trading_accounts" });
      const tbodyBefore = document.querySelector('#accountsTable tbody');
      if (tbodyBefore) {
        window.Logger.info('✅ tbody נמצא לפני עדכון:', tbodyBefore, { page: "trading_accounts" });
        window.Logger.info('🔍 מספר שורות לפני עדכון:', tbodyBefore.children.length, { page: "trading_accounts" });
      } else {
        window.Logger.error('❌ tbody לא נמצא לפני עדכון', { page: "trading_accounts" });
      }
      window.Logger.info('🔍 קריאה ל-updateTradingAccountsTable עם', filteredTradingAccounts.length, 'חשבונות מסחר...', { page: "trading_accounts" });
      try {
        window.updateTradingAccountsTable(filteredTradingAccounts);
        window.Logger.info('✅ updateTradingAccountsTable הושלמה בהצלחה', { page: "trading_accounts" });
      } catch (error) {
        window.Logger.error('❌ שגיאה ב-updateTradingAccountsTable:', error, { page: "trading_accounts" });
      }

      // בדיקה שהטבלה התעדכנה כראוי
      const tbody = document.querySelector('#accountsTable tbody');
      if (tbody && tbody.children.length === 0 && filteredTradingAccounts.length > 0) {
        window.Logger.warn('⚠️ הטבלה לא התעדכנה כראוי - אין שורות בטבלה', { page: "trading_accounts" });
      } else {
        window.Logger.info('✅ הטבלה התעדכנה בהצלחה', { page: "trading_accounts" });
        window.Logger.info('🔍 מספר שורות אחרי עדכון:', tbody ? tbody.children.length : 'לא נמצא', { page: "trading_accounts" });
        if (tbody && tbody.children.length > 0) {
          window.Logger.info('🔍 תוכן השורה הראשונה:', tbody.children[0].textContent.substring(0, 100, { page: "trading_accounts" }));
        }
      }
      
      // יישום צבעי ישויות על כותרות
      if (window.applyEntityColorsToHeaders) {
        window.applyEntityColorsToHeaders('trading_account');
      }
    } else {
      window.Logger.error('❌ פונקציית עדכון הטבלה לא נמצאה', { page: "trading_accounts" });
    }

  } catch (error) {
    window.Logger.error('❌ שגיאה בטעינת נתוני חשבונות מסחר:', error, { page: "trading_accounts" });

    // הצגת הודעת שגיאה בטבלה
    const tbody = document.querySelector('#accountsTable tbody');
    if (tbody) {
      const errorText = `שגיאה בטעינת נתונים: ${error.message}`;
      const errorHtml = `<tr><td colspan="8" class="text-center text-danger">${errorText}</td></tr>`;
      tbody.innerHTML = errorHtml;
    }

    // עדכון ספירת רשומות
    const countElement = document.getElementById('trading_accountsCount');
    if (countElement) {
      countElement.textContent = 'שגיאה';
    }
  }
}


// פונקציה להגדרת כותרות למיון - הוסרה כי לא בשימוש
// function setupSortableHeaders() { ... }

// פונקציה לפילטור מקומי של חשבונות - ספציפית לחשבונות
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
    window.applyEntityColorsToHeaders('account');
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

    // שחזור מצב הסקשנים
    if (typeof window.restoreAccountsSectionState === 'function') {
      window.Logger.info('🔄 שחזור מצב הסקשנים', { page: "trading_accounts" });
      window.restoreAccountsSectionState();
    } else {
      window.Logger.error('❌ restoreAccountsSectionState לא נמצאה', { page: "trading_accounts" });
      handleFunctionNotFound('restoreAccountsSectionState', 'פונקציית שחזור מצב סקשנים לא נמצאה');
    }
  } else {
    window.Logger.info('📍 לא נמצאים בדף החשבונות - דילוג על טעינת נתונים', { page: "trading_accounts" });
  }
// });

/**
 * ביטול חשבון מסחר עם בדיקת פריטים מקושרים
 * @param {number} tradingAccountId - מזהה החשבון המסחר
 * @param {string} accountName - שם החשבון
 */
async function cancelTradingAccountWithLinkedItemsCheck(tradingAccountId, _accountName) {
  try {
    // קבלת פרטי החשבון לצורך הודעת האישור
    let accountDetails = '';
    try {
      const response = await fetch(`/api/trading-accounts/${tradingAccountId}`);
      if (response.ok) {
        const tradingAccountData = await response.json();
        const tradingAccount = tradingAccountData.data;
        accountDetails = `\n\nפרטי החשבון:\n• שם: ${tradingAccount.name || 'לא מוגדר'}\n• סטטוס: ${tradingAccount.status || 'לא מוגדר'}\n• יתרה: ${tradingAccount.cash_balance || '0'}`;
      }
    } catch {
      // window.Logger.warn('לא ניתן לטעון פרטי חשבון:', error, { page: "trading_accounts" });
    }

    // אישור מהמשתמש באמצעות המערכת הגלובלית
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'ביטול חשבון',
        `האם אתה בטוח שברצונך לבטל חשבון זה?${accountDetails}`,
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
            'ביטול חשבון',
            `האם אתה בטוח שברצונך לבטל חשבון זה?${accountDetails}`,
            () => resolve(true),
            () => resolve(false)
          );
        });
        if (!confirmed) return;
      } else if (!window.window.showConfirmationDialog('אישור', `האם אתה בטוח שברצונך לבטל חשבון זה?${accountDetails}`)) {
        return;
      }
      await checkLinkedItemsAndCancelTradingAccount(tradingAccountId);
    }

  } catch (error) {
    handleSystemError(error, 'ביטול חשבון');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', error.message);
    }
  }
}

/**
 * מחיקת חשבון מסחר עם בדיקת פריטים מקושרים
 * @param {number} tradingAccountId - מזהה החשבון המסחר
 * @param {string} accountName - שם החשבון
 */
async function deleteTradingAccountWithLinkedItemsCheck(tradingAccountId, _accountName) {
  try {
    // קבלת פרטי החשבון לצורך הודעת האישור
    let accountDetails = '';
    try {
      const response = await fetch(`/api/trading-accounts/${tradingAccountId}`);
      if (response.ok) {
        const tradingAccountData = await response.json();
        const tradingAccount = tradingAccountData.data;
        accountDetails = `\n\nפרטי החשבון:\n• שם: ${tradingAccount.name || 'לא מוגדר'}\n• סטטוס: ${tradingAccount.status || 'לא מוגדר'}\n• יתרה: ${tradingAccount.cash_balance || '0'}`;
      }
    } catch {
      // window.Logger.warn('לא ניתן לטעון פרטי חשבון:', error, { page: "trading_accounts" });
    }

    // אישור מהמשתמש באמצעות המערכת הגלובלית
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'מחיקת חשבון',
        `האם אתה בטוח שברצונך למחוק חשבון זה?${accountDetails}`,
        async () => {
          // המשתמש אישר - בדיקת מקושרים ואז ביצוע המחיקה
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
            'מחיקת חשבון',
            `האם אתה בטוח שברצונך למחוק חשבון זה?${accountDetails}`,
            () => resolve(true),
            () => resolve(false)
          );
        });
        if (!confirmed) return;
      } else if (!window.window.showConfirmationDialog('אישור', `האם אתה בטוח שברצונך למחוק חשבון זה?${accountDetails}`)) {
        return;
      }
      await checkLinkedItemsAndDeleteTradingAccount(tradingAccountId);
    }

  } catch (error) {
    handleSystemError(error, 'מחיקת חשבון');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', error.message);
    }
  }
}

/**
 * החזרת חשבון מסחר מבוטל לסטטוס סגור
 * @param {number} tradingAccountId - מזהה החשבון המסחר
 * @param {string} accountName - שם החשבון
 */
async function restoreTradingAccount(tradingAccountId, tradingAccountName) {
  // ניקוי מטמון לפני פעולת CRUD - עריכה
  if (window.clearCacheBeforeCRUD) {
    window.clearCacheBeforeCRUD('trading_accounts', 'edit');
  }
  
  // אישור מהמשתמש
  if (typeof window.showConfirmationDialog === 'function') {
    const confirmed = await new Promise(resolve => {
      window.showConfirmationDialog(
        'החזרת חשבון',
        `האם אתה בטוח שברצונך להחזיר את החשבון "${accountName}" לסטטוס סגור?`,
        () => resolve(true),
        () => resolve(false),
      );
    });
    if (!confirmed) {return;}
  } else {
    if (window.showConfirmationDialog) {
      const confirmed = await new Promise(resolve => {
        window.showConfirmationDialog(
          'החזרת חשבון',
          `האם אתה בטוח שברצונך להחזיר את החשבון "${accountName}" לסטטוס סגור?`,
          () => resolve(true),
          () => resolve(false)
        );
      });
      if (!confirmed) return;
    } else if (!window.confirm(`האם אתה בטוח שברצונך להחזיר את החשבון "${accountName}" לסטטוס סגור?`)) {
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
      // שימוש במערכת הריענון המרכזית
      if (window.centralRefresh) {
        await window.centralRefresh.showSuccessAndRefresh('trading_accounts', 'חשבון הוחזר בהצלחה לסטטוס סגור!');
      } else {
        // Fallback למערכת הישנה
        showSuccessMessage('חשבון הוחזר בהצלחה לסטטוס סגור!');

        // רענון הטבלה
        if (typeof window.loadTradingAccountsDataForTradingAccountsPage === 'function') {
          await window.loadTradingAccountsDataForTradingAccountsPage();
        } else if (typeof window.loadTradingAccountsData === 'function') {
          const trading_accounts = await window.loadTradingAccountsData();
          if (typeof window.updateTradingAccountsTable === 'function') {
            window.updateTradingAccountsTable(trading_accounts);
          }
        }
      }
    } else {
      const data = await response.json();
      showErrorMessage(data.message || 'שגיאה בהחזרת חשבון');
    }
  } catch (error) {
    handleSystemError(error, 'החזרת חשבון');
    showErrorMessage('שגיאה בהחזרת חשבון');
  }
}

/**
 * בדיקת מקושרים וביצוע ביטול חשבון מסחר
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
    // ניקוי מטמון לפני פעולת CRUD - ביטול
    if (window.clearCacheBeforeCRUD) {
      window.clearCacheBeforeCRUD('trading_accounts', 'cancel');
    }
    
    // שליחה לשרת
    const response = await fetch(`/api/trading-accounts/${tradingAccountId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });

    if (response.ok) {
      await response.json(); // result not used

      // שימוש במערכת הריענון המרכזית
      if (window.centralRefresh) {
        await window.centralRefresh.showSuccessAndRefresh('trading_accounts', 'החשבון בוטל בהצלחה');
      } else {
        // Fallback למערכת הישנה
        // הצגת הודעת הצלחה
        if (window.showSuccessNotification) {
          window.showSuccessNotification('הצלחה', 'החשבון בוטל בהצלחה', 4000, 'business');
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
      }

    } else {
      const errorResponse = await response.text();
      handleApiError('שגיאה בביטול חשבון', errorResponse);
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה בביטול', 'שגיאה בביטול החשבון');
      }
    }

  } catch (error) {
    handleSystemError(error, 'ביצוע ביטול חשבון');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בביטול', 'שגיאה בביטול החשבון');
    }
  }
}

/**
 * בדיקת מקושרים וביצוע מחיקת חשבון מסחר
 * @deprecated Use window.checkLinkedItemsAndPerformAction('account', tradingAccountId, 'delete', performTradingAccountDeletion) instead
 */
async function checkLinkedItemsAndDeleteTradingAccount(tradingAccountId) {
  await window.checkLinkedItemsAndPerformAction('account', tradingAccountId, 'delete', performTradingAccountDeletion);
}

/**
 * ביצוע המחיקה בפועל
 */
async function performTradingAccountDeletion(tradingAccountId) {
  try {
    // ניקוי מטמון לפני פעולת CRUD - מחיקה
    if (window.clearCacheBeforeCRUD) {
      window.clearCacheBeforeCRUD('trading_accounts', 'delete');
    }
    
    // שליחה לשרת
    const response = await fetch(`/api/trading-accounts/${tradingAccountId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      await response.json(); // result not used

      // שימוש במערכת הריענון המרכזית
      if (window.centralRefresh) {
        await window.centralRefresh.showSuccessAndRefresh('trading_accounts', 'החשבון נמחק בהצלחה');
      } else {
        // Fallback למערכת הישנה
        // הצגת הודעת הצלחה
        if (window.showSuccessNotification) {
          window.showSuccessNotification('הצלחה', 'החשבון נמחק בהצלחה', 4000, 'business');
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
      }

    } else {
      const errorResponse = await response.text();

      try {
        const errorData = JSON.parse(errorResponse);

        // בדיקה אם השגיאה קשורה לפריטים מקושרים
        if (errorData.error && errorData.error.message &&
                    (errorData.error.message.includes('linked items') ||
                        errorData.error.message.includes('Cannot delete account with linked items'))) {

          // הצגת אזהרת פריטים מקושרים
          if (window.showLinkedItemsWarning) {
            window.showLinkedItemsWarning('tradingAccount', tradingAccountId);
          } else {
            if (window.showErrorNotification) {
              window.showErrorNotification('שגיאה במחיקה', 'לא ניתן למחוק חשבון זה - יש פריטים מקושרים אליו');
            }
          }
          return;
        }

        // שגיאה אחרת
        handleApiError('שגיאה במחיקת חשבון', errorResponse);
        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה במחיקה', 'שגיאה במחיקת החשבון: ' + errorData.error.message);
        }

      } catch {
        handleApiError('שגיאה במחיקת חשבון', errorResponse);
        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה במחיקה', 'שגיאה במחיקת החשבון');
        }
      }
    }

  } catch (error) {
    handleSystemError(error, 'ביצוע מחיקת חשבון');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה במחיקה', 'שגיאה במחיקת החשבון');
    }
  }
}

/**
 * בדיקת פריטים מקושרים לפני ביטול חשבון
 * @deprecated Use window.checkLinkedItemsBeforeAction('account', tradingAccountId, 'cancel') instead
 */
async function checkLinkedItemsBeforeCancelTradingAccount(tradingAccountId) {
  return await window.checkLinkedItemsBeforeAction('account', tradingAccountId, 'cancel');
}

/**
 * בדיקת פריטים מקושרים לפני מחיקת חשבון מסחר
 * @deprecated Use window.checkLinkedItemsBeforeAction('account', tradingAccountId, 'delete') instead
 */
async function checkLinkedItemsBeforeDeleteTradingAccount(tradingAccountId) {
  return await window.checkLinkedItemsBeforeAction('account', tradingAccountId, 'delete');
}

/**
 * קבלת שם החשבון לפי ID
 */
function getTradingAccountName(tradingAccountId) {
  // נסה למצוא בחשבונות שכבר נטענו
  if (window.trading_accountsData) {
    const tradingAccount = window.trading_accountsData.find(a => a.id === tradingAccountId);
    if (tradingAccount) {
      return tradingAccount.name;
    }
  }
  return `חשבון ${tradingAccountId}`;
}

/**
 * עדכון חשבון קיים
 * @param {number} tradingAccountId - מזהה החשבון המסחר
 * @param {Object} tradingAccountData - נתוני החשבון המסחר החדשים
 */
function updateTradingAccount(tradingAccountId, tradingAccountData) {
  try {
    window.Logger.info('📝 מעדכן חשבון:', tradingAccountId, tradingAccountData, { page: "trading_accounts" });
    
    // ולידציה בסיסית
    if (!tradingAccountId || !tradingAccountData) {
      throw new Error('נתונים חסרים לעדכון חשבון');
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
        throw new Error('שגיאה בעדכון חשבון');
      }
      return response.json();
    })
    .then(data => {
      window.Logger.info('✅ חשבון עודכן בהצלחה:', data, { page: "trading_accounts" });
      
      // רענון הטבלה
      loadTradingAccountsFromServer();
      
      // הודעת הצלחה
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('חשבון עודכן בהצלחה');
      } else if (typeof window.showNotification === 'function') {
        window.showNotification('חשבון עודכן בהצלחה', 'success', 'הצלחה', 4000, 'business');
      }
    })
    .catch(error => {
      window.Logger.error('שגיאה בעדכון חשבון:', error, { page: "trading_accounts" });
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בעדכון חשבון', error.message);
      } else if (typeof window.showNotification === 'function') {
        window.showNotification('שגיאה בעדכון חשבון', 'error', 'שגיאה', 6000, 'system');
      }
    });
    
  } catch (error) {
    window.Logger.error('שגיאה בעדכון חשבון:', error, { page: "trading_accounts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון חשבון', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בעדכון חשבון', 'error', 'שגיאה', 6000, 'system');
    }
  }
}

/**
 * צפייה בפרטי חשבון
 * מציג חלון עם פרטים מפורטים של החשבון
 * @param {number} tradingAccountId - מזהה החשבון המסחר
 */
function viewTradingAccountDetails(tradingAccountId) {
  try {
    window.Logger.info('👁️ מציג פרטי חשבון:', tradingAccountId, { page: "trading_accounts" });
    
    // חיפוש החשבון בנתונים
    const tradingAccount = window.trading_accountsData.find(a => a.id === tradingAccountId);
    if (!tradingAccount) {
      throw new Error('חשבון לא נמצא');
    }
    
    // יצירת תוכן פרטי החשבון
    const detailsContent = `
      <div class="trading-account-details">
        <h5>פרטי חשבון</h5>
        <div class="row">
          <div class="col-md-6">
            <p><strong>שם החשבון:</strong> ${tradingAccount.name || 'לא ידוע'}</p>
            <p><strong>סוג:</strong> ${tradingAccount.type || 'לא ידוע'}</p>
            <p><strong>מטבע:</strong> ${tradingAccount.currency || 'לא ידוע'}</p>
          </div>
          <div class="col-md-6">
            <p><strong>יתרה:</strong> ${tradingAccount.balance || '0'}</p>
            <p><strong>סטטוס:</strong> ${tradingAccount.status || 'פעיל'}</p>
            <p><strong>תאריך יצירה:</strong> ${tradingAccount.created_at || 'לא ידוע'}</p>
          </div>
        </div>
        ${tradingAccount.description ? `<p><strong>תיאור:</strong> ${tradingAccount.description}</p>` : ''}
      </div>
    `;
    
    // הצגת מודל עם הפרטים
    if (typeof window.showModalNotification === 'function') {
      window.showModalNotification('פרטי חשבון', detailsContent, 'info');
    } else {
      // fallback - הצגה בחלון alert
      alert(`פרטי חשבון:\n\n` +
        `שם: ${tradingAccount.name || 'לא ידוע'}\n` +
        `סוג: ${tradingAccount.type || 'לא ידוע'}\n` +
        `מטבע: ${tradingAccount.currency || 'לא ידוע'}\n` +
        `יתרה: ${tradingAccount.balance || '0'}\n` +
        `סטטוס: ${tradingAccount.status || 'פעיל'}\n` +
        `תאריך יצירה: ${tradingAccount.created_at || 'לא ידוע'}` +
        (tradingAccount.description ? `\nתיאור: ${tradingAccount.description}` : ''));
    }
    
  } catch (error) {
    window.Logger.error('שגיאה בהצגת פרטי חשבון:', error, { page: "trading_accounts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהצגת פרטי חשבון', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בהצגת פרטי חשבון', 'error', 'שגיאה', 6000, 'system');
    }
  }
}

/**
 * הצגת פרטי חשבון באמצעות מודול פרטי ישות
 * @param {number} tradingAccountId - מזהה החשבון המסחר
 */
function showTradingAccountDetails(tradingAccountId) {
  try {
    window.Logger.info('👁️ מציג פרטי חשבון:', tradingAccountId, { page: "trading_accounts" });
    
    // שימוש במודול פרטי ישות
    if (typeof window.showEntityDetails === 'function') {
      window.showEntityDetails('account', tradingAccountId, { mode: 'view' });
    } else {
      window.Logger.error('❌ showEntityDetails לא זמינה', { page: "trading_accounts" });
      // fallback לפונקציה הקיימת
      viewTradingAccountDetails(tradingAccountId);
    }
    
  } catch (error) {
    window.Logger.error('❌ שגיאה בהצגת פרטי חשבון:', error, { page: "trading_accounts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהצגת פרטי חשבון', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בהצגת פרטי חשבון', 'error', 'שגיאה', 6000, 'system');
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
          .then(data => {
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

window.Logger.info('✅ trading_accounts.js נטען בהצלחה', { page: "trading_accounts" });

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
function sortTable(columnIndex) {
  window.Logger.info(`🔄 מיון טבלת חשבונות לפי עמודה ${columnIndex}`, { page: "trading_accounts" });

  // Use global function
  if (typeof window.sortTableData === 'function') {
    const sortedData = window.sortTableData(
      columnIndex,
      window.filteredTradingAccountsData || window.trading_accountsData,
      'trading_accounts',
      updateTradingAccountsTable
    );

    // Update filtered data
    window.filteredTradingAccountsData = sortedData;
  } else {
    if (typeof handleFunctionNotFound === 'function') {
      handleFunctionNotFound('sortTableData', 'פונקציית מיון טבלה לא נמצאה');
    }
  }
}

// Detailed Log Functions for Accounts Page
function generateDetailedLog() {
    try {
        const logData = {
            timestamp: new Date().toISOString(),
            page: 'trading_accounts',
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            performance: {
                loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
            },
            memory: window.performance.memory ? {
                used: window.performance.memory.usedJSHeapSize,
                total: window.performance.memory.totalJSHeapSize,
                limit: window.performance.memory.jsHeapSizeLimit
            } : null,
            trading_accountsStats: {
                totalAccounts: document.getElementById('totalAccounts')?.textContent || 'לא נמצא',
                activeAccounts: document.getElementById('activeAccounts')?.textContent || 'לא נמצא',
                totalValue: document.getElementById('totalValue')?.textContent || 'לא נמצא',
                totalProfit: document.getElementById('totalProfit')?.textContent || 'לא נמצא',
                newAlertsCount: document.getElementById('newAlertsCount')?.textContent || 'לא נמצא'
            },
            sections: {
                topSection: {
                    title: 'חשבונות',
                    visible: !document.querySelector('.top-section')?.classList.contains('d-none'),
                    alertsCount: document.querySelectorAll('.alert-card').length,
                    summaryStats: document.getElementById('summaryStats')?.textContent || 'לא נמצא',
                    colorDemoVisible: !document.getElementById('trading_accountsColorDemo')?.classList.contains('d-none')
                },
                contentSection: {
                    title: 'החשבונות שלי',
                    visible: !document.querySelector('.content-section')?.classList.contains('d-none'),
                    tableRows: document.querySelectorAll('#accountsTable tbody tr').length,
                    tableData: document.querySelector('#trading_accountsContainer')?.textContent?.substring(0, 300) || 'לא נמצא'
                }
            },
            tableData: {
                totalRows: document.querySelectorAll('#accountsTable tbody tr').length,
                headers: Array.from(document.querySelectorAll('#accountsTable thead th')).map(th => th.textContent?.trim()),
                sortableColumns: document.querySelectorAll('.sortable-header').length,
                hasData: document.querySelectorAll('#accountsTable tbody tr').length > 0
            },
            modals: {
                addModal: document.getElementById('addTradingAccountModal') ? 'זמין' : 'לא זמין',
                editModal: document.getElementById('editTradingAccountModal') ? 'זמין' : 'לא זמין',
                deleteModal: document.getElementById('deleteTradingAccountModal') ? 'זמין' : 'לא זמין'
            },
            functions: {
                showAddTradingAccountModal: typeof window.showAddTradingAccountModal === 'function' ? 'זמין' : 'לא זמין',
                deleteTradingAccount: typeof window.deleteTradingAccount === 'function' ? 'זמין' : 'לא זמין',
                toggleTopSection: typeof window.toggleTopSection === 'function' ? 'זמין' : 'לא זמין',
                loadTradingAccountsFromServer: typeof window.loadTradingAccountsFromServer === 'function' ? 'זמין' : 'לא זמין',
                updateTradingAccountsTable: typeof window.updateTradingAccountsTable === 'function' ? 'זמין' : 'לא זמין',
                sortTable: typeof window.sortTable === 'function' ? 'זמין' : 'לא זמין'
            },
            dataStatus: {
                trading_accountsLoaded: window.trading_accountsLoaded || false,
                currenciesLoaded: window.currenciesLoaded || false,
                trading_accountsDataLength: window.trading_accountsData ? window.trading_accountsData.length : 0,
                currenciesDataLength: window.currenciesData ? window.currenciesData.length : 0
            },
            console: {
                errors: [],
                warnings: [],
                logs: []
            }
        };

        // Capture console messages
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalLog = console.log;

        console.error = function(...args) {
            logData.console.errors.push(args.join(' '));
            originalError.apply(console, args);
        };

        console.warn = function(...args) {
            logData.console.warnings.push(args.join(' '));
            originalWarn.apply(console, args);
        };

        console.log = function(...args) {
            logData.console.logs.push(args.join(' '));
            originalLog.apply(console, args);
        };

        return JSON.stringify(logData, null, 2);
    } catch (error) {
        return `Error generating log: ${error.message}`;
    }
}

//  function removed - no longer needed

// פונקציה לטעינת חשבונות לפילטר (נדרשת על ידי header-system.js)
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

// Define function as global
window.sortTable = sortTable;
//  removed - no longer needed
// window.generateDetailedLog = generateDetailedLog; // REMOVED: Local function only
window.getTradingAccounts = getTradingAccounts;

// סיום הקובץ
window.Logger.info('✅ trading_accounts.js נטען בהצלחה', { page: "trading_accounts" });
}
