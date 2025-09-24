/* ===== מערכת ניהול חשבונות מסחר ===== */
console.log('📁 trading_accounts.js נטען - מתחיל אתחול');

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
 * - filter-system.js (filter functionality)
 *
 * Table Mapping:
 * - Uses 'trading_accounts' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 *
 * תכולת הקובץ:
 * - loadTradingAccountsFromServer: טעינת חשבונות מהשרת
 * - updateTradingAccountsTable: עדכון טבלת חשבונות
 * - showAddTradingAccountModal: הצגת מודל הוספת חשבון
 * - createAccount: יצירת חשבון חדש
 * - updateAccountFromModal: עדכון חשבון קיים
 * - deleteAccount: מחיקת חשבון
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
    const token = localStorage.getItem('authToken');
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
// function getCurrencyDisplay(account) {
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
function generateCurrencyOptions(account = null) {
  // generateCurrencyOptions STARTED
  // Currencies data
  // Currencies loaded

  if (!window.currenciesData || window.currenciesData.length === 0) {
    // No currencies data, using default
    // אם אין מטבעות, נחזיר ברירת מחדל
    return `
      <option value="1" ${account && account.currency_id === 1 ? 'selected' : ''}>דולר אמריקאי (USD)</option>
    `;
  }

  const options = window.currenciesData.map(currency => {
    const isSelected = account && (
      account.currency_id === currency.id ||
      account.currency_symbol === currency.symbol
    );

    return `<option value="${currency.id}" ${isSelected ? 'selected' : ''}>${currency.name} (${currency.symbol})</option>`;
  }).join('');

  // Generated options
  // generateCurrencyOptions COMPLETED
  return options;
}

// פונקציה לטעינת חשבונות מהשרת
async function loadTradingAccountsFromServer() {
  console.log('🚀🚀🚀 loadTradingAccountsFromServer התחיל 🚀🚀🚀');
  try {
    // בדיקה אם יש token שמור
    const token = localStorage.getItem('authToken');
    console.log('🔑 Token זמין:', !!token);

    if (!token) {
      console.log('⚠️ אין token - מנסה לטעון ללא הרשאה');
    }

    // Fetching trading_accounts from server
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('📡 שליחת בקשה ל-API:', '/api/trading-accounts/');
    const response = await fetch('/api/trading-accounts/', {
      method: 'GET',
      headers,
    });
    
    console.log('📡 תגובת שרת:', response.status, response.ok);

    if (response.ok) {
      const responseData = await response.json();
      console.log('📊 נתונים גולמיים מהשרת:', responseData);

      // טיפול במבנה התשובה - יכול להיות ישירות מערך או בתוך data
      const allTradingAccounts = responseData.data || responseData;
      console.log('📊 כל החשבונות:', allTradingAccounts.length, 'חשבונות');

      // סינון רק חשבונות בסטטוס open
      const openTradingAccounts = allTradingAccounts.filter(account => account.status === 'open');
      console.log('📊 חשבונות פתוחים:', openTradingAccounts.length, 'חשבונות');
      
      window.trading_accountsData = openTradingAccounts;
      window.trading_accountsLoaded = true;

      // קריאה לעדכון התפריט
      if (typeof window.updateAccountFilterMenu === 'function') {
        window.updateAccountFilterMenu(openTradingAccounts);
      }

      // החזרת הנתונים לטעינה חוזרת
      return openTradingAccounts;
    } else {
      console.warn('⚠️ תגובת שרת לא תקינה:', response.status);
      loadDefaultTradingAccounts();
    }

  } catch (error) {
    console.error('❌ שגיאה בטעינת חשבונות מהשרת:', error);
    loadDefaultTradingAccounts();
  }
}

// פונקציה לטעינת כל החשבונות מהשרת (לפילטר)
async function loadAllTradingAccountsFromServer() {
  try {
    const token = localStorage.getItem('authToken');
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
      const openTradingAccounts = allTradingAccounts.filter(account => account.status === 'open');

      // שמירת החשבונות הפתוחים במשתנה גלובלי
      window.allTradingAccountsData = openTradingAccounts;
      window.trading_accountsData = openTradingAccounts; // גם עבור הפילטר

      // עדכון הפילטר עם החשבונות הפתוחים (אם הפונקציה קיימת)
      if (typeof window.updateAccountFilterMenu === 'function') {
        window.updateAccountFilterMenu(openTradingAccounts);
      } else {
        // updateAccountFilterMenu not available yet, trying direct update
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
  if (typeof window.updateAccountFilterMenu === 'function') {
    window.updateAccountFilterMenu(window.trading_accountsData);
  }
}

// הפונקציות הכלליות לפילטר חשבונות הועברו ל-grid-filters.js

// פונקציה לקבלת חשבונות נטענים - הועברה ל-trading-account-service.js
// function getTradingAccounts() {
//   return window.trading_accountsData || [];
// }

// פונקציה לבדיקה אם החשבונות נטענו - הועברה ל-trading-account-service.js
// function isTradingAccountsLoaded() {
//   return window.trading_accountsLoaded || false;
// }

// פונקציה לטעינת נתוני חשבונות מהשרת
async function loadTradingAccountsData() {
  console.log('🚀🚀🚀 loadTradingAccountsData התחיל 🚀🚀🚀');
  try {
    // טוען נתוני חשבונות מהשרת

    // בדיקה אם יש פונקציה apiCall זמינה
    if (typeof window.apiCall === 'function') {
      console.log('📡 משתמש ב-apiCall');
      const response = await window.apiCall('/api/trading-accounts/');
      const trading_accounts = response.data || response;
      console.log('📊 חשבונות מ-apiCall:', trading_accounts.length, 'חשבונות');
      // חשבונות שהתקבלו
      return trading_accounts;
    } else {
      console.log('📡 apiCall לא זמין - משתמש ב-loadTradingAccountsFromServer');
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
    handleDataLoadError(error, 'טעינת נתוני חשבונות');
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
  console.log('🚀🚀🚀 updateTradingAccountsTable התחיל עם', trading_accounts ? trading_accounts.length : 0, 'חשבונות 🚀🚀🚀');
  
  // בדיקה שהפרמטר תקין
  if (!trading_accounts || !Array.isArray(trading_accounts)) {
    console.error('❌ פרמטר חשבונות לא תקין:', trading_accounts);
    handleValidationError('updateTradingAccountsTable', 'פרמטר חשבונות לא תקין');
    return;
  }

  const tbody = document.querySelector('#trading_accountsTable tbody');
  if (!tbody) {
    console.warn('⚠️ לא נמצא tbody לטבלת חשבונות - ייתכן שהדף לא נטען עדיין');
    console.log('🔍 חיפוש אלטרנטיבי...');
    const table = document.querySelector('#trading_accountsTable');
    if (table) {
      console.log('✅ נמצאה הטבלה:', table);
      const tbodyAlt = table.querySelector('tbody');
      if (tbodyAlt) {
        console.log('✅ נמצא tbody אלטרנטיבי:', tbodyAlt);
        // המשך עם tbodyAlt
        tbody = tbodyAlt;
      } else {
        console.error('❌ לא נמצא tbody בטבלה');
        return;
      }
    } else {
      console.error('❌ לא נמצאה הטבלה #trading_accountsTable');
      return;
    }
  }

  // בניית הטבלה מחדש לפי הכותרות בדיוק
  console.log('📊 עדכון טבלת חשבונות עם', trading_accounts.length, 'חשבונות');
  console.log('🔍 tbody נמצא:', tbody);
  console.log('🔍 tbody.innerHTML לפני עדכון:', tbody.innerHTML.length, 'תווים');
  
  tbody.innerHTML = trading_accounts.map(account => {
    // המרת סטטוס לעברית לפילטר
    const statusForFilter = account.status === 'open' ? 'פתוח' :
      account.status === 'closed' ? 'סגור' :
        account.status === 'cancelled' ? 'מבוטל' : account.status || '-';

    return `
    <tr data-trading-account-id="${account.id}">
      <td class="ticker-cell" data-account="${account.name || '-'}">
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="btn btn-sm btn-outline-info" 
            onclick="showEntityDetails('account', ${account.id})" 
            title="פרטי חשבון" 
            style="background-color: white; font-size: 0.8em;">
            🔗
          </button>
          <span class="entity-trading-account-badge" 
                style="padding: 2px 8px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">
            ${account.name || '-'}
          </span>
        </div>
      </td>
      <td>${account.currency || '-'}</td>
      <td class="status-cell" data-status="${statusForFilter}">
        <span class="status-${account.status}-badge" 
              style="padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">
          ${statusForFilter}
        </span>
      </td>
      <td>
        <span class="numeric-value-positive" 
              style="padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">
          $${account.cash_balance ? account.cash_balance.toLocaleString() : '0'}
        </span>
      </td>
      <td>
        <span class="numeric-value-positive" 
              style="padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">
          $${account.total_value ? account.total_value.toLocaleString() : '0'}
        </span>
      </td>
      <td>
        <span class="${account.total_pl >= 0 ? 'numeric-value-positive' : 'numeric-value-negative'}" 
              style="padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">
          ${account.total_pl ? `$${account.total_pl.toLocaleString()}` : '$0'}
        </span>
      </td>
      <td>${account.notes || '-'}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-info" 
          onclick="window.showLinkedItemsModal && window.showLinkedItemsModal([], 'account', ${account.id})" 
          title="צפה באלמנטים מקושרים">
          🔗
        </button>
        <button class="btn btn-sm btn-secondary" onclick="showEditAccountModalById(${account.id})" title="ערוך חשבון">
          ✏️
        </button>
        ${account.status === 'cancelled' ?
    `<button class="btn btn-sm btn-outline-success" onclick="restoreAccount(${account.id}, '${account.name || 'Unknown'}')" title="החזר חשבון"><span class="reactivate-icon">✓</span></button>` :
    `<button class="btn btn-sm btn-warning" onclick="cancelAccountWithLinkedItemsCheck(${account.id}, '${account.name || 'Unknown'}')" title="בטל חשבון">❌</button>`
}
        <button class="btn btn-sm btn-danger" onclick="deleteAccountWithLinkedItemsCheck(${account.id}, '${account.name || 'Unknown'}')" title="מחק חשבון">
          🗑️
        </button>
      </td>
    </tr>
  `;}).join('');

  // עדכון ספירת רשומות
  const countElement = document.getElementById('trading_accountsCount');
  if (countElement) {
    countElement.textContent = `${trading_accounts.length} חשבונות`;
  }

  console.log('✅ טבלת חשבונות עודכנה בהצלחה עם', trading_accounts.length, 'חשבונות');
  console.log('🔍 tbody.innerHTML אחרי עדכון:', tbody.innerHTML.length, 'תווים');
  console.log('🔍 מספר שורות בטבלה:', tbody.children.length);
  // END UPDATE ACCOUNTS TABLE
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
    handleDataLoadError(error, 'טעינת חשבונות');
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
function updateAccountFilterDisplayText() {
  const appHeader = document.querySelector('app-header');
  if (!appHeader || !appHeader.shadowRoot) {
    return;
  }

  const accountMenu = appHeader.shadowRoot.getElementById('accountFilterMenu');
  if (!accountMenu) {
    return;
  }

  const accountToggle = appHeader.shadowRoot.getElementById('accountFilterToggle');
  if (!accountToggle) {
    return;
  }

  const selectedText = accountToggle.querySelector('.selected-trading-account-text');
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
// הערה: updateAccountFilterMenu מיוצאת מ-grid-filters.js
window.updateAccountFilterDisplayText = updateAccountFilterDisplayText;
// window.getTradingAccounts = getTradingAccounts; // הועבר ל-trading-account-service.js
// window.isTradingAccountsLoaded = isTradingAccountsLoaded; // הועבר ל-trading-account-service.js
window.loadTradingAccountsData = loadTradingAccountsData;
window.updateTradingAccountsTable = updateTradingAccountsTable;
window.loadTradingAccounts = loadTradingAccounts;

// פונקציה גלובלית לעדכון ידני של תפריט החשבונות
window.refreshAccountFilterMenu = function () {
  if (window.trading_accountsData && window.trading_accountsData.length > 0) {
    if (typeof window.updateAccountFilterMenu === 'function') {
      window.updateAccountFilterMenu(window.trading_accountsData);
    }
  } else {
    loadTradingAccountsFromServer();
  }
};

// פונקציה לבדיקת מצב החשבונות
window.checkTradingAccountsStatus = function () {

  const appHeader = document.querySelector('app-header');
  if (appHeader) {
    const accountMenu = appHeader.shadowRoot.getElementById('accountFilterMenu');
    if (accountMenu) {
      const items = accountMenu.querySelectorAll('.trading-account-filter-item');
      // Account menu items count
      items.forEach(() => {
        // const accountName = item.getAttribute('data-account'); // Not used
        // Item details
      });
    } else {
      // Account menu not found in shadow DOM
    }
  } else {
    // App header not found
  }
  // END ACCOUNTS STATUS CHECK
};

// פונקציה זמנית לעדכון תפריט החשבונות
window.updateAccountFilterMenuDirectly = function (trading_accounts) {
  // UPDATE ACCOUNT FILTER MENU DIRECTLY
  // TradingAccounts received

  // חיפוש התפריט בתוך האפ-הדר (Shadow DOM)
  const appHeader = document.querySelector('app-header');
  if (!appHeader || !appHeader.shadowRoot) {
    return;
  }

  const accountMenu = appHeader.shadowRoot.getElementById('accountFilterMenu');
  if (!accountMenu) {
    return;
  }

  // ניקוי התפריט הקיים
  accountMenu.innerHTML = '';

  // הוספת אופציית "כל החשבונות"
  const allTradingAccountsItem = document.createElement('div');
  allTradingAccountsItem.className = 'trading-account-filter-item selected';
  allTradingAccountsItem.setAttribute('data-account', 'all');
  allTradingAccountsItem.innerHTML = `
    <span class="option-text">כל החשבונות</span>
    <span class="check-mark">✓</span>
  `;
  accountMenu.appendChild(allTradingAccountsItem);

  // הוספת החשבונות מהשרת
  if (trading_accounts && trading_accounts.length > 0) {
    trading_accounts.forEach(account => {
      const accountItem = document.createElement('div');
      accountItem.className = 'trading-account-filter-item';
      accountItem.setAttribute('data-account', account.id || account.name);
      accountItem.innerHTML = `
        <span class="option-text">${account.name || account.account_name || 'Unknown'}</span>
        <span class="check-mark">✓</span>
      `;
      accountMenu.appendChild(accountItem);
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
      if (typeof window.updateAccountFilterMenu === 'function') {
        window.updateAccountFilterMenu(openTradingAccounts);
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
    if (typeof window.refreshAccountFilterMenu === 'function') {
      window.refreshAccountFilterMenu();
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
 * הצגת מודל הוספת חשבון
 */
function showAddTradingAccountModal() {
  // בדיקה אם יש מודל קיים בדף
  const modalElement = document.getElementById('accountModal');
  if (modalElement) {
    // איפוס הטופס
    const form = document.getElementById('accountForm');
    if (form) {
      form.reset();
    }

    // הצגת המודל
    try {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    } catch (error) {
      handleSystemError(error, 'הצגת מודל קיים');
    }
  } else {
    // יצירת המודל דינמית
    try {
      const modal = createAccountModal('add');
      document.body.appendChild(modal);

      // הצגת המודל
      const bootstrapModal = new bootstrap.Modal(modal);
      bootstrapModal.show();

      // אתחול וולידציה בפתיחת המודל
      if (window.initializeValidation) {
        window.initializeValidation('accountForm');
      }
    } catch (error) {
      handleSystemError(error, 'יצירת/הצגת מודל חדש');
    }
  }
}

/**
 * יצירת מודל חשבון
 * @param {string} mode - 'add' או 'edit'
 * @param {Object} account - אובייקט החשבון לעריכה (רק במצב edit)
 */
function createAccountModal(mode, account = null) {

  const isEdit = mode === 'edit';
  const title = isEdit ? 'עריכת חשבון' : 'הוספת חשבון חדש';
  const buttonText = isEdit ? 'שמור שינויים' : 'הוסף חשבון';

  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'accountModal';
  modal.setAttribute('tabindex', '-1');
  modal.setAttribute('aria-labelledby', 'accountModalLabel');
  modal.setAttribute('aria-hidden', 'true');
  modal.setAttribute('data-bs-backdrop', 'true');

  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header linkedItems_modal-header-colored">
          <h5 class="modal-title" id="accountModalLabel">${title}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form id="accountForm">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="accountName" class="form-label">שם החשבון *</label>
                  <input type="text" class="form-control" id="accountName" name="name" required 
                         value="${account ? account.name : ''}" placeholder="הכנס שם חשבון (לפחות 3 תווים)" minlength="3" maxlength="18">
                  <div class="invalid-feedback" id="nameError"></div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="accountCurrency" class="form-label">מטבע *</label>
                  <select class="form-select" id="accountCurrency" name="currency_id" required>
                    <option value="">בחר מטבע</option>
                    ${generateCurrencyOptions(account)}
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
                    <option value="open" ${account && account.status === 'open' ? 'selected' : ''}>פתוח</option>
                    <option value="closed" ${account && account.status === 'closed' ? 'selected' : ''}>סגור</option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="accountCashBalance" class="form-label">יתרת מזומן</label>
                  <input type="number" class="form-control" id="accountCashBalance" name="cash_balance" 
                         value="${account ? account.cash_balance || 0 : 0}" placeholder="0" step="0.01" min="0">
                  <div class="invalid-feedback" id="cashBalanceError"></div>
                </div>
              </div>
            </div>
            
            <div class="mb-3">
              <label for="accountNotes" class="form-label">הערות</label>
              <textarea class="form-control" id="accountNotes" name="notes" rows="3" 
                        placeholder="הכנס הערות על החשבון">${account ? account.notes || '' : ''}</textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
          <button type="button" class="btn btn-primary" onclick="saveAccount('${mode}', ${account ? account.id : 'null'})">
            ${buttonText}
          </button>
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
 * @param {Object} accountData - נתוני החשבון
 * @returns {Object} - תוצאה עם isValid ו-message
 */
function validateAccountData(accountData) {
  // בדיקת שם החשבון
  if (!accountData.name || accountData.name.trim() === '') {
    return { isValid: false, message: 'שם החשבון הוא שדה חובה' };
  }

  const trimmedName = accountData.name.trim();

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
  if (!accountData.currency_id || accountData.currency_id === '') {
    return { isValid: false, message: 'יש לבחור מטבע' };
  }

  // בדיקת סטטוס
  if (accountData.status && !['open', 'closed'].includes(accountData.status)) {
    return { isValid: false, message: 'סטטוס חשבון לא תקין - רק פתוח או סגור מותרים' };
  }

  // בדיקת יתרת מזומן
  const cashBalance = accountData.cash_balance;
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
  const totalValue = accountData.total_value;
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
  const totalPl = accountData.total_pl;
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
  if (accountData.notes && accountData.notes.length > 1000) {
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
 * פונקציה לשמירת חשבון
 * @param {string} mode - 'add' או 'edit'
 * @param {number} accountId - מזהה החשבון (רק במצב edit)
 */
async function saveAccount(mode, accountId = null) {
  try {
    // ניקוי מטמון לפני פעולת CRUD - הוספה/עריכה
    if (window.clearCacheBeforeCRUD) {
      window.clearCacheBeforeCRUD('trading_accounts', mode === 'add' ? 'add' : 'edit');
    }
    
    // איסוף נתונים מהטופס
    const form = document.getElementById('accountForm');
    const formData = new FormData(form);

    const accountData = {
      name: formData.get('name'),
      currency_id: parseInt(formData.get('currency_id')),
      status: formData.get('status'),
      cash_balance: parseFloat(formData.get('cash_balance')) || 0,
      notes: formData.get('notes'),
    };

    // בדיקת תקינות
    const validation = validateAccountData(accountData);
    if (!validation.isValid) {
      showFormError(validation.message);
      return; // לא ממשיכים אם יש שגיאה
    }

    // קריאה ל-API
    if (mode === 'add') {
      await addAccountToAPI(accountData);
    } else {
      await updateAccountInAPI(accountId, accountData);
    }

    // רענון הנתונים לפני סגירת המודל
    try {
      // שימוש במערכת הריענון המרכזית
      if (window.centralRefresh) {
        const message = mode === 'add' ? 'חשבון נוסף בהצלחה' : 'חשבון עודכן בהצלחה';
        await window.centralRefresh.showSuccessAndRefresh('trading_accounts', message);
      } else {
        // Fallback למערכת הישנה
        if (typeof window.loadTradingAccountsDataForTradingAccountsPage === 'function') {
          await window.loadTradingAccountsDataForTradingAccountsPage();
        } else if (typeof window.loadTradingAccountsData === 'function') {
          const trading_accounts = await window.loadTradingAccountsData();
          if (typeof window.updateTradingAccountsTable === 'function') {
            window.updateTradingAccountsTable(trading_accounts);
          }
        }

        // הצגת הודעה
        const message = mode === 'add' ? 'חשבון נוסף בהצלחה' : 'חשבון עודכן בהצלחה';
        if (typeof window.showSuccessNotification === 'function') {
          window.showSuccessNotification('הצלחה', message);
        }
      }

      // רק אם הרענון הצליח, נסגור את המודל
      const modal = document.getElementById('accountModal');
      if (modal) {
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        if (bootstrapModal) {
          bootstrapModal.hide();
        }
        // הסרת המודל מה-DOM
        modal.remove();
      }

    } catch (refreshError) {
      handleSystemError(refreshError, 'רענון הטבלה');
      // אם יש שגיאה ברענון, לא סוגרים את המודל ומציגים הודעת שגיאה
      if (typeof window.showWarningNotification === 'function') {
        window.showWarningNotification('אזהרה', 'החשבון נשמר אך יש בעיה בעדכון הטבלה. אנא רענן את הדף.');
      } else {
        // console.warn('החשבון נשמר אך יש בעיה בעדכון הטבלה. אנא רענן את הדף.');
      }
    }

  } catch (error) {
    handleSaveError(error, 'שמירת חשבון');
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בשמירת החשבון');
    } else {
      handleSystemError(new Error('שגיאה בשמירת החשבון'), 'שמירת חשבון');
    }
  }
}

/**
 * הוספת חשבון ל-API
 * @param {Object} accountData - נתוני החשבון
 */
async function addAccountToAPI(accountData) {
  try {
    const response = await fetch('/api/trading-accounts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
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
 * עדכון חשבון ב-API
 * @param {number} accountId - מזהה החשבון
 * @param {Object} accountData - נתוני החשבון
 */
async function updateAccountInAPI(accountId, accountData) {
  try {
    const response = await fetch(`/api/trading-accounts/${accountId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
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
 * הצגת מודל עריכת חשבון לפי ID
 * @param {number} accountId - מזהה החשבון
 */
async function showEditAccountModalById(accountId) {
  // בדיקה שהפרמטר תקין
  if (!accountId) {
    handleValidationError('showEditAccountModalById', 'מזהה חשבון לא תקין');
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'מזהה חשבון לא תקין');
    } else {
      handleValidationError('showEditAccountModalById', 'מזהה חשבון לא תקין');
    }
    return;
  }

  try {
    // טעינת נתוני החשבון מהשרת
    const response = await fetch(`/api/trading-accounts/${accountId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const account = result.data || result;

    if (!account) {
      throw new Error('חשבון לא נמצא');
    }

    // הצגת המודל עם הנתונים
    showEditAccountModal(account);

  } catch (error) {
    handleDataLoadError(error, 'טעינת נתוני חשבון');
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בטעינת נתוני החשבון: ' + error.message);
    } else {
      handleDataLoadError(error, 'טעינת נתוני החשבון');
    }
  }
}

function showEditAccountModal(account) {
  // בדיקה שהפרמטר תקין
  if (!account || typeof account !== 'object') {
    handleValidationError('showEditAccountModal', 'פרמטר חשבון לא תקין');
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בפתיחת מודל העריכה');
    } else {
      handleSystemError(new Error('שגיאה בפתיחת מודל העריכה'), 'פתיחת מודל עריכה');
    }
    return;
  }

  // יצירת המודל דינמית
  const modal = createAccountModal('edit', account);
  document.body.appendChild(modal);

  // הצגת המודל
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();

  // אתחול וולידציה בפתיחת המודל
  if (window.initializeValidation) {
    window.initializeValidation('accountForm');
  }

}


/**
 * עדכון חשבון קיים - הוסר כי לא בשימוש
 */
// async function updateAccountFromModal() { ... }

/**
 * טעינת נתוני חשבונות מ-API
 * @returns {Promise<Array>} מערך של חשבונות
 */
async function loadTradingAccountsDataFromAPI() {
  console.log('🚀🚀🚀 loadTradingAccountsDataFromAPI התחיל 🚀🚀🚀');
  try {
    console.log('📡 שליחת בקשה ל-API:', '/api/trading-accounts/');
    const response = await fetch('/api/trading-accounts/');
    console.log('📡 תגובת שרת:', response.status, response.ok);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('📊 תוצאה מ-API:', result);

    // בדיקה אם התוצאה מכילה מערך נתונים
    if (result.data && Array.isArray(result.data)) {
      console.log('📊 החזרת נתונים מ-result.data:', result.data.length, 'חשבונות');
      return result.data;
    } else if (Array.isArray(result)) {
      console.log('📊 החזרת נתונים מ-result:', result.length, 'חשבונות');
      return result;
    } else {
      console.error('❌ פורמט תגובה לא תקין:', result);
      handleSystemError(new Error('מבנה נתונים לא צפוי'), 'מבנה נתונים לא צפוי מה-API');
      throw new Error('מבנה נתונים לא צפוי מה-API');
    }

  } catch (error) {
    console.error('❌ שגיאה ב-loadTradingAccountsDataFromAPI:', error);
    handleApiError('שגיאה בקריאה ל-API', error.message);
    throw error;
  }
}

/**
 * מחיקת חשבון מהשרת
 * @param {number} accountId - מזהה החשבון
 * @param {string} accountName - שם החשבון
 */
async function deleteAccountFromAPI(accountId, accountName) {
  try {
    const response = await fetch(`/api/trading-accounts/${accountId}`, {
      method: 'DELETE',
    });

    if (response.ok) {

      // רענון הנתונים
      if (typeof loadTradingAccounts === 'function') {
        loadTradingAccounts();
      }

      // הצגת הודעה
      showSuccessMessage(`החשבון "${accountName}" נמחק בהצלחה`);
    } else {
      const data = await response.json();
      showErrorMessage(data.message || 'שגיאה במחיקת חשבון');
    }
  } catch (error) {
    handleDeleteError(error, 'מחיקת חשבון');
    showErrorMessage('שגיאה במחיקת החשבון');
  }
}

/**
 * ביטול חשבון (שינוי סטטוס למבוטל)
 * @param {number} accountId - מזהה החשבון
 * @param {string} accountName - שם החשבון
 */
async function cancelAccount(accountId, accountName) {

  // בדיקה ראשונה
  if (window.showCancelWarning) {
    await new Promise(resolve => {
      window.showCancelWarning('חשבון', accountName,
        () => {
          // בדיקה שנייה
          if (window.showCancelWarning) {
            window.showCancelWarning('חשבון', accountName,
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
        window.showCancelWarning('חשבון', accountName,
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
    const tradesResponse = await fetch(`/api/trades/?trading_account_id=${accountId}&status=open`);
    if (tradesResponse.ok) {
      const tradesData = await tradesResponse.json();
      const openTrades = tradesData.data || tradesData || [];

      if (openTrades.length > 0) {
        await showOpenTradesWarning(accountName, openTrades, 'cancel');
        return;
      }
    }

    const response = await fetch(`/api/trading-accounts/${accountId}`, {
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
 * @param {number} accountId - מזהה החשבון
 * @param {string} accountName - שם החשבון
 */
async function deleteAccount(accountId, accountName) {
  // ניקוי מטמון לפני פעולת CRUD - מחיקה
  if (window.clearCacheBeforeCRUD) {
    window.clearCacheBeforeCRUD('trading_accounts', 'delete');
  }

  // בדיקת פריטים מקושרים לפני מחיקה
  if (typeof window.checkLinkedItemsBeforeDelete === 'function') {
    const hasLinkedItems = await window.checkLinkedItemsBeforeDelete(accountId);
    if (hasLinkedItems) {
      return; // הפונקציה תטפל בהצגת המודול
    }
  }

  // אישור מהמשתמש
  if (typeof window.showDeleteWarning === 'function') {
    const confirmed = await new Promise(resolve => {
      window.showDeleteWarning('account', accountId, 'חשבון',
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
    const response = await fetch(`/api/trading-accounts/${accountId}`, {
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

/**
 * בדיקת פריטים מקושרים לפני מחיקה
 */
async function checkLinkedItemsBeforeDelete(accountId) {
  try {
    const response = await fetch(`/api/linked-items/account/${accountId}`);

    if (!response.ok) {
      // אם לא ניתן לבדוק פריטים מקושרים, ממשיכים עם המחיקה
      return false;
    }

    const linkedItemsData = await response.json();
    const childEntities = linkedItemsData.child_entities || [];
    // const parentEntities = linkedItemsData.parent_entities || []; // לא בשימוש

    // בדיקה רק אם יש פריטים שמקושרים אל החשבון (child entities)
    // parent entities הם פריטים שהחשבון מקושר אליהם (מטבע) - לא רלוונטי למחיקה
    if (childEntities.length > 0) {
      // יש פריטים מקושרים - הצגת חלון מקושרים
      if (typeof window.showLinkedItemsModal === 'function') {
        window.showLinkedItemsModal(linkedItemsData, 'account', accountId);
        return true;
      } else {
        if (typeof window.showNotification === 'function') {
          window.showNotification('יש פריטים מקושרים לחשבון זה', 'warning', 'אזהרה', 5000, 'business');
        }
        return true;
      }
    }

    return false;
  } catch (error) {
    handleSystemError(error, 'בדיקת פריטים מקושרים');
    return false;
  }
}

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

function confirmDeleteAccount(accountId, accountName) {
  deleteAccount(accountId, accountName);
}

// function checkLinkedItems(accountId) { // הוסר - הוחלף ב-checkLinkedItemsBeforeDelete
//   // פונקציה פשוטה לבדיקת פריטים מקושרים
//   return Promise.resolve({ hasLinkedItems: false, items: [] });
// }

function showOpenTradesWarning(accountId, accountName) {
  if (typeof window.showWarningNotification === 'function') {
    window.showWarningNotification('אזהרה', `יש עסקאות פתוחות בחשבון "${accountName}". לא ניתן למחוק חשבון עם עסקאות פעילות.`);
  } else {
    // console.warn(`יש עסקאות פתוחות בחשבון "${accountName}". לא ניתן למחוק חשבון עם עסקאות פעילות.`);
  }
}

// createWarningModal הועברה ל-ui-utils.js

// ייצוא הפונקציות הנוספות
window.showAddTradingAccountModal = showAddTradingAccountModal;
window.showEditAccountModal = showEditAccountModal;
window.showEditAccountModalById = showEditAccountModalById;
window.cancelAccount = cancelAccount;
window.deleteAccount = deleteAccount;
window.showSuccessMessage = showSuccessMessage;
window.showErrorMessage = showErrorMessage;
window.showSecondConfirmationModal = showSecondConfirmationModal;
window.confirmDeleteAccount = confirmDeleteAccount;
// window.checkLinkedItems = checkLinkedItems; // הוסר - הוחלף ב-checkLinkedItemsBeforeDelete
window.showOpenTradesWarning = showOpenTradesWarning;
// window.createWarningModal = createWarningModal; // הועברה ל-ui-utils.js
window.deleteAccountFromAPI = deleteAccountFromAPI;
window.loadTradingAccountsDataFromAPI = loadTradingAccountsDataFromAPI;
window.addAccountToAPI = addAccountToAPI;
window.updateAccountInAPI = updateAccountInAPI;
window.checkLinkedItemsBeforeDelete = checkLinkedItemsBeforeDelete;  // בדיקת אובייקטים מקושרים למחיקה
window.createAccountModal = createAccountModal;
window.saveAccount = saveAccount;
window.validateAccountData = validateAccountData;
window.showFormError = showFormError;
window.loadCurrenciesFromServer = loadCurrenciesFromServer;
window.generateCurrencyOptions = generateCurrencyOptions;
window.cancelAccountWithLinkedItemsCheck = cancelAccountWithLinkedItemsCheck;
window.deleteAccountWithLinkedItemsCheck = deleteAccountWithLinkedItemsCheck;
window.restoreAccount = restoreAccount;

// Export functions for linked items management
window.checkLinkedItemsAndCancelAccount = checkLinkedItemsAndCancelAccount;
window.checkLinkedItemsAndDeleteAccount = checkLinkedItemsAndDeleteAccount;
window.performAccountCancellation = performAccountCancellation;
window.performAccountDeletion = performAccountDeletion;
window.checkLinkedItemsBeforeCancelAccount = checkLinkedItemsBeforeCancelAccount;
window.checkLinkedItemsBeforeDeleteAccount = checkLinkedItemsBeforeDeleteAccount;
window.getAccountName = getAccountName;

// הגדרת הפונקציה updateGridFromComponent לדף החשבונות
// וידוא שהפונקציה מוגדרת רק בדף החשבונות
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
      handleFunctionNotFound('loadTradingAccountsDataForTradingAccountsPage', 'פונקציית טעינת נתוני חשבונות לא נמצאה');
    }
  };
}

/**
 * פונקציה לטעינת נתוני חשבונות ועדכון הטבלה בדף החשבונות
 * פונקציה זו מיועדת לדף החשבונות (trading_accounts.html)
 */
async function loadTradingAccountsDataForTradingAccountsPage() {
  console.log('🚀🚀🚀 loadTradingAccountsDataForTradingAccountsPage התחיל 🚀🚀🚀');
  console.log('🔍 בדיקת זמינות פונקציות:');
  console.log('  - apiCall:', typeof window.apiCall);
  console.log('  - updateTradingAccountsTable:', typeof window.updateTradingAccountsTable);
  try {
    // טעינת נתונים מהשרת
    let trading_accounts;
    if (typeof window.loadTradingAccountsDataFromAPI === 'function') {
      console.log('📡 משתמש ב-loadTradingAccountsDataFromAPI');
      trading_accounts = await window.loadTradingAccountsDataFromAPI();
    } else {
      console.log('📡 משתמש ב-loadTradingAccountsData');
      trading_accounts = await loadTradingAccountsData();
    }
    
    console.log('📊 נתונים שהתקבלו:', trading_accounts ? trading_accounts.length : 0, 'חשבונות');

    // בדיקה שהנתונים תקינים
    if (!trading_accounts || !Array.isArray(trading_accounts)) {
      console.warn('⚠️ נתונים לא תקינים התקבלו מהשרת:', trading_accounts);
      // במקום לזרוק שגיאה, נשתמש בנתוני דמו
      trading_accounts = [];
    }

    // שמירת הנתונים במשתנה גלובלי
    window.trading_accountsData = trading_accounts;
    window.allTradingAccountsData = trading_accounts;
    console.log('💾 נתונים נשמרו ב-window.trading_accountsData:', trading_accounts.length, 'חשבונות');

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
      console.log('📊 עדכון טבלה עם', filteredTradingAccounts.length, 'חשבונות');
      console.log('🔍 קריאה ל-updateTradingAccountsTable...');
      console.log('🔍 נתונים לשליחה:', filteredTradingAccounts.slice(0, 2)); // רק 2 ראשונים לדיבוג
      console.log('🔍 בדיקת tbody לפני עדכון...');
      const tbodyBefore = document.querySelector('#trading_accountsTable tbody');
      if (tbodyBefore) {
        console.log('✅ tbody נמצא לפני עדכון:', tbodyBefore);
        console.log('🔍 מספר שורות לפני עדכון:', tbodyBefore.children.length);
      } else {
        console.error('❌ tbody לא נמצא לפני עדכון');
      }
      console.log('🔍 קריאה ל-updateTradingAccountsTable עם', filteredTradingAccounts.length, 'חשבונות...');
      try {
        window.updateTradingAccountsTable(filteredTradingAccounts);
        console.log('✅ updateTradingAccountsTable הושלמה בהצלחה');
      } catch (error) {
        console.error('❌ שגיאה ב-updateTradingAccountsTable:', error);
      }

      // בדיקה שהטבלה התעדכנה כראוי
      const tbody = document.querySelector('#trading_accountsTable tbody');
      if (tbody && tbody.children.length === 0 && filteredTradingAccounts.length > 0) {
        console.warn('⚠️ הטבלה לא התעדכנה כראוי - אין שורות בטבלה');
      } else {
        console.log('✅ הטבלה התעדכנה בהצלחה');
        console.log('🔍 מספר שורות אחרי עדכון:', tbody ? tbody.children.length : 'לא נמצא');
        if (tbody && tbody.children.length > 0) {
          console.log('🔍 תוכן השורה הראשונה:', tbody.children[0].textContent.substring(0, 100));
        }
      }
      
      // יישום צבעי ישויות על כותרות
      if (window.applyEntityColorsToHeaders) {
        window.applyEntityColorsToHeaders('account');
      }
    } else {
      console.error('❌ פונקציית עדכון הטבלה לא נמצאה');
    }

  } catch (error) {
    console.error('❌ שגיאה בטעינת נתוני חשבונות:', error);

    // הצגת הודעת שגיאה בטבלה
    const tbody = document.querySelector('#trading_accountsTable tbody');
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
  let filteredTradingAccounts = [...trading_accounts];

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
    filteredTradingAccounts = filteredTradingAccounts.filter(account => {
      let itemStatus;
      if (account.status === 'closed') {
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
    filteredTradingAccounts = filteredTradingAccounts.filter(account => {
      let typeDisplay;
      switch (account.type || account.account_type) {
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
        typeDisplay = account.type || account.account_type;
      }
      const isMatch = selectedTypes.includes(typeDisplay);
      return isMatch;
    });
  }

  // פילטר לפי תאריכים
  if (startDate && endDate) {
    filteredTradingAccounts = filteredTradingAccounts.filter(account => {
      if (!account.created_at) {return false;}

      const accountDate = new Date(account.created_at);
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

    filteredTradingAccounts = filteredTradingAccounts.filter(account => {
      const nameMatch = (account.name || '').toLowerCase().includes(searchLower);
      const typeMatch = (account.type || account.account_type || '').toLowerCase().includes(searchLower);
      const statusMatch = (account.status || '').toLowerCase().includes(searchLower);

      const isMatch = nameMatch || typeMatch || statusMatch;
      return isMatch;
    });
  }

  return filteredTradingAccounts;
}

// פונקציה גלובלית לעדכון הטבלה - הועברה ל-header-system.js

// פונקציה לעדכון תפריט פילטר החשבונות
function updateAccountFilterMenu(trading_accounts) {
  // חיפוש התפריט בתוך האפ-הדר (Shadow DOM)
  const appHeader = document.querySelector('app-header');
  if (!appHeader || !appHeader.shadowRoot) {
    return;
  }

  const accountMenu = appHeader.shadowRoot.getElementById('accountFilterMenu');
  if (!accountMenu) {
    return;
  }

  // ניקוי התפריט הקיים
  accountMenu.innerHTML = '';

  // הוספת אופציית "כל החשבונות"
  const allTradingAccountsItem = document.createElement('div');
  allTradingAccountsItem.className = 'trading-account-filter-item selected';
  allTradingAccountsItem.setAttribute('data-account', 'all');
  allTradingAccountsItem.innerHTML = `
    <span class="option-text">כל החשבונות</span>
    <span class="check-mark">✓</span>
  `;
  accountMenu.appendChild(allTradingAccountsItem);

  // הוספת החשבונות מהשרת
  if (trading_accounts && trading_accounts.length > 0) {
    trading_accounts.forEach(account => {
      const accountItem = document.createElement('div');
      accountItem.className = 'trading-account-filter-item';
      accountItem.setAttribute('data-account', account.id || account.name);
      accountItem.innerHTML = `
        <span class="option-text">${account.name || account.account_name || 'Unknown'}</span>
        <span class="check-mark">✓</span>
      `;
      accountMenu.appendChild(accountItem);
    });
  }
}

// פונקציות לפתיחה/סגירה של סקשנים
// updateGridFromComponentGlobal הועבר ל-header-system.js
window.updateAccountFilterMenu = updateAccountFilterMenu;
window.filterTradingAccountsLocally = filterTradingAccountsLocally;
window.updateTradingAccountsTable = updateTradingAccountsTable;
window.deleteAccount = deleteAccount;
window.loadTradingAccountsDataForTradingAccountsPage = loadTradingAccountsDataForTradingAccountsPage;

/**
 * שחזור מצב סקשן החשבונות
 */
function restoreTradingAccountsSectionState() {
  const savedState = localStorage.getItem('trading_accountsSectionCollapsed');
  if (savedState === 'true') {
    const trading_accountsSection = document.querySelector('.trading_accounts-section');
    if (trading_accountsSection) {
      const sectionBody = trading_accountsSection.querySelector('.section-body');
      const toggleBtn = trading_accountsSection.querySelector('button[onclick="toggleTradingAccountsSection()"]');

      if (sectionBody && toggleBtn) {
        sectionBody.style.display = 'none';
        toggleBtn.textContent = 'הצג חשבונות';
      }
    }
  }
}

window.restoreTradingAccountsSectionState = restoreTradingAccountsSectionState;


// פונקציות נוספות לטבלת החשבונות - הוסרו כדי למנוע התנגשות

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
  console.log('🚀🚀🚀 DOMContentLoaded התחיל 🚀🚀🚀');
  console.log('📍 נתיב הדף:', window.location.pathname);
  
  // טעינת מטבעות
  console.log('💰 טעינת מטבעות...');
  loadCurrenciesFromServer();

  // יישום צבעי ישות על כותרות
  if (window.applyEntityColorsToHeaders) {
    console.log('🎨 יישום צבעי ישות על כותרות');
    window.applyEntityColorsToHeaders('account');
  }

  // בדיקה אם אנחנו בדף החשבונות
  if (window.location.pathname.includes('/trading_accounts')) {
    console.log('🎯 נמצאים בדף החשבונות - מתחיל טעינת נתונים');
    // טעינת נתוני חשבונות
    if (typeof window.loadTradingAccountsDataForTradingAccountsPage === 'function') {
      console.log('📡 קורא ל-loadTradingAccountsDataForTradingAccountsPage');
      window.loadTradingAccountsDataForTradingAccountsPage();
    } else {
      console.error('❌ loadTradingAccountsDataForTradingAccountsPage לא נמצאה');
      handleFunctionNotFound('loadTradingAccountsDataForTradingAccountsPage', 'פונקציית טעינת נתוני חשבונות לא נמצאה');
    }

    // שחזור מצב הסקשנים
    if (typeof window.restoreTradingAccountsSectionState === 'function') {
      console.log('🔄 שחזור מצב הסקשנים');
      window.restoreTradingAccountsSectionState();
    } else {
      console.error('❌ restoreTradingAccountsSectionState לא נמצאה');
      handleFunctionNotFound('restoreTradingAccountsSectionState', 'פונקציית שחזור מצב סקשנים לא נמצאה');
    }
  } else {
    console.log('📍 לא נמצאים בדף החשבונות - דילוג על טעינת נתונים');
  }
});

/**
 * ביטול חשבון עם בדיקת פריטים מקושרים
 * @param {number} accountId - מזהה החשבון
 * @param {string} accountName - שם החשבון
 */
async function cancelAccountWithLinkedItemsCheck(accountId, _accountName) {
  try {
    // קבלת פרטי החשבון לצורך הודעת האישור
    let accountDetails = '';
    try {
      const response = await fetch(`/api/trading-accounts/${accountId}`);
      if (response.ok) {
        const accountData = await response.json();
        const account = accountData.data;
        accountDetails = `\n\nפרטי החשבון:\n• שם: ${account.name || 'לא מוגדר'}\n• סטטוס: ${account.status || 'לא מוגדר'}\n• יתרה: ${account.cash_balance || '0'}`;
      }
    } catch {
      // console.warn('לא ניתן לטעון פרטי חשבון:', error);
    }

    // אישור מהמשתמש באמצעות המערכת הגלובלית
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'ביטול חשבון',
        `האם אתה בטוח שברצונך לבטל חשבון זה?${accountDetails}`,
        async () => {
          // המשתמש אישר - בדיקת מקושרים ואז ביצוע הביטול
          await checkLinkedItemsAndCancelAccount(accountId);
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
      } else if (!window.confirm(`האם אתה בטוח שברצונך לבטל חשבון זה?${accountDetails}`)) {
        return;
      }
      await checkLinkedItemsAndCancelAccount(accountId);
    }

  } catch (error) {
    handleSystemError(error, 'ביטול חשבון');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', error.message);
    }
  }
}

/**
 * מחיקת חשבון עם בדיקת פריטים מקושרים
 * @param {number} accountId - מזהה החשבון
 * @param {string} accountName - שם החשבון
 */
async function deleteAccountWithLinkedItemsCheck(accountId, _accountName) {
  try {
    // קבלת פרטי החשבון לצורך הודעת האישור
    let accountDetails = '';
    try {
      const response = await fetch(`/api/trading-accounts/${accountId}`);
      if (response.ok) {
        const accountData = await response.json();
        const account = accountData.data;
        accountDetails = `\n\nפרטי החשבון:\n• שם: ${account.name || 'לא מוגדר'}\n• סטטוס: ${account.status || 'לא מוגדר'}\n• יתרה: ${account.cash_balance || '0'}`;
      }
    } catch {
      // console.warn('לא ניתן לטעון פרטי חשבון:', error);
    }

    // אישור מהמשתמש באמצעות המערכת הגלובלית
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'מחיקת חשבון',
        `האם אתה בטוח שברצונך למחוק חשבון זה?${accountDetails}`,
        async () => {
          // המשתמש אישר - בדיקת מקושרים ואז ביצוע המחיקה
          await checkLinkedItemsAndDeleteAccount(accountId);
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
      } else if (!window.confirm(`האם אתה בטוח שברצונך למחוק חשבון זה?${accountDetails}`)) {
        return;
      }
      await checkLinkedItemsAndDeleteAccount(accountId);
    }

  } catch (error) {
    handleSystemError(error, 'מחיקת חשבון');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', error.message);
    }
  }
}

/**
 * החזרת חשבון מבוטל לסטטוס סגור
 * @param {number} accountId - מזהה החשבון
 * @param {string} accountName - שם החשבון
 */
async function restoreAccount(accountId, accountName) {
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
    const response = await fetch(`/api/trading-accounts/${accountId}`, {
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
 * בדיקת מקושרים וביצוע ביטול חשבון
 */
async function checkLinkedItemsAndCancelAccount(accountId) {
  try {
    // בדיקה אם יש פריטים מקושרים לפני ביטול
    const hasLinkedItems = await checkLinkedItemsBeforeCancelAccount(accountId);
    if (hasLinkedItems) {
      return; // הפונקציה תטפל בהצגת המודול
    }

    // אין מקושרים - ביצוע הביטול
    await performAccountCancellation(accountId);

  } catch (error) {
    handleSystemError(error, 'בדיקת מקושרים');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', error.message);
    }
  }
}

/**
 * ביצוע הביטול בפועל
 */
async function performAccountCancellation(accountId) {
  try {
    // ניקוי מטמון לפני פעולת CRUD - ביטול
    if (window.clearCacheBeforeCRUD) {
      window.clearCacheBeforeCRUD('trading_accounts', 'cancel');
    }
    
    // שליחה לשרת
    const response = await fetch(`/api/trading-accounts/${accountId}`, {
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
 * בדיקת מקושרים וביצוע מחיקת חשבון
 */
async function checkLinkedItemsAndDeleteAccount(accountId) {
  try {
    // בדיקה אם יש פריטים מקושרים לפני מחיקה
    const hasLinkedItems = await checkLinkedItemsBeforeDeleteAccount(accountId);
    if (hasLinkedItems) {
      return; // הפונקציה תטפל בהצגת המודול
    }

    // אין מקושרים - ביצוע המחיקה
    await performAccountDeletion(accountId);

  } catch (error) {
    handleSystemError(error, 'בדיקת מקושרים');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', error.message);
    }
  }
}

/**
 * ביצוע המחיקה בפועל
 */
async function performAccountDeletion(accountId) {
  try {
    // ניקוי מטמון לפני פעולת CRUD - מחיקה
    if (window.clearCacheBeforeCRUD) {
      window.clearCacheBeforeCRUD('trading_accounts', 'delete');
    }
    
    // שליחה לשרת
    const response = await fetch(`/api/trading-accounts/${accountId}`, {
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
            window.showLinkedItemsWarning('account', accountId);
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
 */
async function checkLinkedItemsBeforeCancelAccount(accountId) {
  try {
    // console.log('🔍 בדיקת פריטים מקושרים לחשבון:', accountId);

    // בדיקה ישירה של טריידים פעילים (סטטוס 'open')
    const tradesResponse = await fetch(`/api/trades/?trading_account_id=${accountId}&status=open`);
    if (tradesResponse.ok) {
      const tradesData = await tradesResponse.json();
      const openTrades = tradesData.data || tradesData || [];

      // console.log('📊 טריידים פעילים:', openTrades.length);

      if (openTrades.length > 0) {
        // console.log('⚠️ יש טריידים פעילים - הצגת מודול מקושרים במצב אזהרה');

        // יש טריידים פעילים - הצגת מודול מקושרים במצב אזהרה
        if (typeof window.showLinkedItemsModal === 'function') {
          // יצירת נתונים למודול המקושרים
          const linkedItemsData = {
            child_entities: openTrades.map(trade => ({
              id: trade.id,
              type: 'trade',
              title: `טרייד ${trade.symbol || trade.id}`,
              description: `טרייד פעיל - ${trade.side || 'לא מוגדר'} על ${trade.symbol || 'לא מוגדר'}`,
              created_at: trade.created_at,
              status: trade.status,
            })),
            parent_entities: [],
            entity_id: accountId,
            entity_type: 'account',
            accountName: getAccountName(accountId),
          };

          window.showLinkedItemsModal(linkedItemsData, 'account', accountId, 'warningBlock');
        } else {
          // console.log('❌ showLinkedItemsModal לא זמינה - הצגת אזהרה פשוטה');
          if (typeof window.showWarningNotification === 'function') {
            window.showWarningNotification(
              'לא ניתן לבטל חשבון',
              `יש ${openTrades.length} טריידים פעילים בחשבון זה. יש לסגור את כל הטריידים לפני ביטול החשבון.`,
            );
          }
        }
        return true; // יש פריטים פעילים - לא לבטל
      }
    }

    // בדיקה של פריטים מקושרים אחרים (לא טריידים פעילים)
    const response = await fetch(`/api/linked-items/account/${accountId}`);

    if (!response.ok) {
      // console.log('❌ לא ניתן לבדוק פריטים מקושרים, ממשיכים עם הביטול');
      return false;
    }

    const linkedItemsData = await response.json();
    // console.log('📊 נתוני מקושרים:', linkedItemsData);

    const childEntities = linkedItemsData.child_entities || [];
    // const parentEntities = linkedItemsData.parent_entities || []; // לא בשימוש

    // console.log('👶 פריטים מקושרים (child):', childEntities.length);
    // console.log('👨‍👩‍👧‍👦 פריטים מקושרים (parent):', parentEntities.length);

    // בדיקה אם יש פריטים שמקושרים אל החשבון (child entities)
    if (childEntities.length > 0) {
      // console.log('⚠️ יש פריטים מקושרים - הצגת חלון מקושרים');
      // יש פריטים מקושרים - הצגת חלון מקושרים
      if (typeof window.showLinkedItemsModal === 'function') {
        // הוספת פרטי החשבון לנתונים
        linkedItemsData.accountName = getAccountName(accountId);
        window.showLinkedItemsModal(linkedItemsData, 'account', accountId, 'warningBlock');
        return true;
      } else {
        // console.log('❌ showLinkedItemsModal לא זמינה');
        if (typeof window.showNotification === 'function') {
          window.showNotification('יש פריטים מקושרים לחשבון זה', 'warning', 'אזהרה', 5000, 'business');
        }
        return true;
      }
    }

    // console.log('✅ אין פריטים מקושרים - אפשר לבטל');
    return false;
  } catch (error) {
    // console.error('❌ שגיאה בבדיקת פריטים מקושרים:', error);
    handleSystemError(error, 'בדיקת פריטים מקושרים');
    return false;
  }
}

/**
 * בדיקת פריטים מקושרים לפני מחיקת חשבון
 */
async function checkLinkedItemsBeforeDeleteAccount(accountId) {
  try {
    // בדיקה ישירה של טריידים פעילים (סטטוס 'open')
    const tradesResponse = await fetch(`/api/trades/?trading_account_id=${accountId}&status=open`);
    if (tradesResponse.ok) {
      const tradesData = await tradesResponse.json();
      const openTrades = tradesData.data || tradesData || [];

      if (openTrades.length > 0) {
        // יש טריידים פעילים - הצגת מודול מקושרים במצב אזהרה
        if (typeof window.showLinkedItemsModal === 'function') {
          // יצירת נתונים למודול המקושרים
          const linkedItemsData = {
            child_entities: openTrades.map(trade => ({
              id: trade.id,
              type: 'trade',
              title: `טרייד ${trade.symbol || trade.id}`,
              description: `טרייד פעיל - ${trade.side || 'לא מוגדר'} על ${trade.symbol || 'לא מוגדר'}`,
              created_at: trade.created_at,
              status: trade.status,
            })),
            parent_entities: [],
            entity_id: accountId,
            entity_type: 'account',
            accountName: getAccountName(accountId),
          };

          window.showLinkedItemsModal(linkedItemsData, 'account', accountId, 'warningBlock');
        } else {
          if (typeof window.showWarningNotification === 'function') {
            window.showWarningNotification(
              'לא ניתן למחוק חשבון',
              `יש ${openTrades.length} טריידים פעילים בחשבון זה. יש לסגור את כל הטריידים לפני מחיקת החשבון.`,
            );
          }
        }
        return true; // יש פריטים פעילים - לא למחוק
      }
    }

    // בדיקה של פריטים מקושרים אחרים (לא טריידים פעילים)
    const response = await fetch(`/api/linked-items/account/${accountId}`);

    if (!response.ok) {
      // אם לא ניתן לבדוק פריטים מקושרים, ממשיכים עם המחיקה
      return false;
    }

    const linkedItemsData = await response.json();
    const childEntities = linkedItemsData.child_entities || [];

    // בדיקה רק אם יש פריטים שמקושרים אל החשבון (child entities)
    if (childEntities.length > 0) {
      // יש פריטים מקושרים - הצגת חלון מקושרים
      if (typeof window.showLinkedItemsModal === 'function') {
        // הוספת פרטי החשבון לנתונים
        linkedItemsData.accountName = getAccountName(accountId);
        window.showLinkedItemsModal(linkedItemsData, 'account', accountId, 'warningBlock');
        return true;
      } else {
        if (typeof window.showNotification === 'function') {
          window.showNotification('יש פריטים מקושרים לחשבון זה', 'warning', 'אזהרה', 5000, 'business');
        }
        return true;
      }
    }

    return false;
  } catch (error) {
    handleSystemError(error, 'בדיקת פריטים מקושרים');
    return false;
  }
}

/**
 * קבלת שם החשבון לפי ID
 */
function getAccountName(accountId) {
  // נסה למצוא בחשבונות שכבר נטענו
  if (window.trading_accountsData) {
    const account = window.trading_accountsData.find(a => a.id === accountId);
    if (account) {
      return account.name;
    }
  }
  return `חשבון ${accountId}`;
}

/**
 * עדכון חשבון קיים
 * @param {number} accountId - מזהה החשבון
 * @param {Object} accountData - נתוני החשבון החדשים
 */
function updateAccount(accountId, accountData) {
  try {
    console.log('📝 מעדכן חשבון:', accountId, accountData);
    
    // ולידציה בסיסית
    if (!accountId || !accountData) {
      throw new Error('נתונים חסרים לעדכון חשבון');
    }
    
    // שליחה לשרת
    fetch('/api/trading_accounts/' + accountId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('שגיאה בעדכון חשבון');
      }
      return response.json();
    })
    .then(data => {
      console.log('✅ חשבון עודכן בהצלחה:', data);
      
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
      console.error('שגיאה בעדכון חשבון:', error);
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בעדכון חשבון', error.message);
      } else if (typeof window.showNotification === 'function') {
        window.showNotification('שגיאה בעדכון חשבון', 'error', 'שגיאה', 6000, 'system');
      }
    });
    
  } catch (error) {
    console.error('שגיאה בעדכון חשבון:', error);
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
 * @param {number} accountId - מזהה החשבון
 */
function viewAccountDetails(accountId) {
  try {
    console.log('👁️ מציג פרטי חשבון:', accountId);
    
    // חיפוש החשבון בנתונים
    const account = window.trading_accountsData.find(a => a.id === accountId);
    if (!account) {
      throw new Error('חשבון לא נמצא');
    }
    
    // יצירת תוכן פרטי החשבון
    const detailsContent = `
      <div class="trading-account-details">
        <h5>פרטי חשבון</h5>
        <div class="row">
          <div class="col-md-6">
            <p><strong>שם החשבון:</strong> ${account.name || 'לא ידוע'}</p>
            <p><strong>סוג:</strong> ${account.type || 'לא ידוע'}</p>
            <p><strong>מטבע:</strong> ${account.currency || 'לא ידוע'}</p>
          </div>
          <div class="col-md-6">
            <p><strong>יתרה:</strong> ${account.balance || '0'}</p>
            <p><strong>סטטוס:</strong> ${account.status || 'פעיל'}</p>
            <p><strong>תאריך יצירה:</strong> ${account.created_at || 'לא ידוע'}</p>
          </div>
        </div>
        ${account.description ? `<p><strong>תיאור:</strong> ${account.description}</p>` : ''}
      </div>
    `;
    
    // הצגת מודל עם הפרטים
    if (typeof window.showModalNotification === 'function') {
      window.showModalNotification('פרטי חשבון', detailsContent, 'info');
    } else {
      // fallback - הצגה בחלון alert
      alert(`פרטי חשבון:\n\n` +
        `שם: ${account.name || 'לא ידוע'}\n` +
        `סוג: ${account.type || 'לא ידוע'}\n` +
        `מטבע: ${account.currency || 'לא ידוע'}\n` +
        `יתרה: ${account.balance || '0'}\n` +
        `סטטוס: ${account.status || 'פעיל'}\n` +
        `תאריך יצירה: ${account.created_at || 'לא ידוע'}` +
        (account.description ? `\nתיאור: ${account.description}` : ''));
    }
    
  } catch (error) {
    console.error('שגיאה בהצגת פרטי חשבון:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהצגת פרטי חשבון', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בהצגת פרטי חשבון', 'error', 'שגיאה', 6000, 'system');
    }
  }
}

/**
 * הצגת פרטי חשבון באמצעות מודול פרטי ישות
 * @param {number} accountId - מזהה החשבון
 */
function showAccountDetails(accountId) {
  try {
    console.log('👁️ מציג פרטי חשבון:', accountId);
    
    // שימוש במודול פרטי ישות
    if (typeof window.showEntityDetails === 'function') {
      window.showEntityDetails('account', accountId, { mode: 'view' });
    } else {
      console.error('❌ showEntityDetails לא זמינה');
      // fallback לפונקציה הקיימת
      viewAccountDetails(accountId);
    }
    
  } catch (error) {
    console.error('❌ שגיאה בהצגת פרטי חשבון:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהצגת פרטי חשבון', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בהצגת פרטי חשבון', 'error', 'שגיאה', 6000, 'system');
    }
  }
}

// ייצוא הפונקציה לגלובל
window.showAccountDetails = showAccountDetails;

// הוספת timeout לאתחול - אחרי שהפונקציות מיוצאות
setTimeout(() => {
  console.log('⏰ Timeout 2 שניות - מתחיל אתחול');
  if (window.location.pathname.includes('/trading_accounts')) {
    console.log('🎯 נמצאים בדף החשבונות - מתחיל טעינת נתונים');
    console.log('🔍 בדיקת זמינות פונקציות:');
    console.log('  - loadTradingAccountsDataForTradingAccountsPage:', typeof window.loadTradingAccountsDataForTradingAccountsPage);
    console.log('  - apiCall:', typeof window.apiCall);
    console.log('  - updateTradingAccountsTable:', typeof window.updateTradingAccountsTable);
    
    if (typeof window.loadTradingAccountsDataForTradingAccountsPage === 'function') {
      console.log('📡 קורא ל-loadTradingAccountsDataForTradingAccountsPage');
      window.loadTradingAccountsDataForTradingAccountsPage();
    } else {
      console.error('❌ loadTradingAccountsDataForTradingAccountsPage לא נמצאה');
      console.log('🔍 ניסיון לטעון נתונים ישירות...');
      
      // ניסיון לטעון נתונים ישירות
      if (typeof window.apiCall === 'function') {
        console.log('📡 משתמש ב-apiCall ישירות');
        window.apiCall('/api/trading-accounts/', 'GET')
          .then(data => {
            console.log('✅ נתונים נטענו ישירות:', data);
            if (data && data.length > 0) {
              console.log('📊 עדכון טבלה עם', data.length, 'רשומות');
              if (typeof window.updateTradingAccountsTable === 'function') {
                window.updateTradingAccountsTable(data);
              } else {
                console.error('❌ updateTradingAccountsTable לא נמצאה');
              }
            }
          })
          .catch(error => {
            console.error('❌ שגיאה בטעינת נתונים ישירה:', error);
          });
      } else {
        console.error('❌ apiCall לא נמצאה');
      }
    }
  }
}, 2000);

console.log('✅ trading_accounts.js נטען בהצלחה');

// ===== Sorting system - adapted for trading_accounts =====

// Global variables for sorting
let trading_accountsCurrentSortColumn = null;
let trading_accountsCurrentSortDirection = 'asc';

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
  console.log(`🔄 מיון טבלת חשבונות לפי עמודה ${columnIndex}`);

  // Use global function
  if (typeof window.sortTableData === 'function') {
    const sortedData = window.sortTableData(
      columnIndex,
      window.filteredTradingAccountsData || trading_accountsData,
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

// Detailed Log Functions for TradingAccounts Page
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
                totalTradingAccounts: document.getElementById('totalTradingAccounts')?.textContent || 'לא נמצא',
                activeTradingAccounts: document.getElementById('activeTradingAccounts')?.textContent || 'לא נמצא',
                totalValue: document.getElementById('totalValue')?.textContent || 'לא נמצא',
                totalProfit: document.getElementById('totalProfit')?.textContent || 'לא נמצא',
                newAlertsCount: document.getElementById('newAlertsCount')?.textContent || 'לא נמצא'
            },
            sections: {
                topSection: {
                    title: 'חשבונות מסחר',
                    visible: !document.querySelector('.top-section')?.classList.contains('d-none'),
                    alertsCount: document.querySelectorAll('.alert-card').length,
                    summaryStats: document.getElementById('summaryStats')?.textContent || 'לא נמצא',
                    colorDemoVisible: !document.getElementById('trading_accountsColorDemo')?.classList.contains('d-none')
                },
                contentSection: {
                    title: 'חשבונות המסחר שלי',
                    visible: !document.querySelector('.content-section')?.classList.contains('d-none'),
                    tableRows: document.querySelectorAll('#trading_accountsTable tbody tr').length,
                    tableData: document.querySelector('#trading_accountsContainer')?.textContent?.substring(0, 300) || 'לא נמצא'
                }
            },
            tableData: {
                totalRows: document.querySelectorAll('#trading_accountsTable tbody tr').length,
                headers: Array.from(document.querySelectorAll('#trading_accountsTable thead th')).map(th => th.textContent?.trim()),
                sortableColumns: document.querySelectorAll('.sortable-header').length,
                hasData: document.querySelectorAll('#trading_accountsTable tbody tr').length > 0
            },
            modals: {
                addModal: document.getElementById('addTradingAccountModal') ? 'זמין' : 'לא זמין',
                editModal: document.getElementById('editTradingAccountModal') ? 'זמין' : 'לא זמין',
                deleteModal: document.getElementById('deleteTradingAccountModal') ? 'זמין' : 'לא זמין'
            },
            functions: {
                showAddTradingAccountModal: typeof window.showAddTradingAccountModal === 'function' ? 'זמין' : 'לא זמין',
                showEditAccountModalById: typeof window.showEditAccountModalById === 'function' ? 'זמין' : 'לא זמין',
                deleteAccountWithLinkedItemsCheck: typeof window.deleteAccountWithLinkedItemsCheck === 'function' ? 'זמין' : 'לא זמין',
                cancelAccountWithLinkedItemsCheck: typeof window.cancelAccountWithLinkedItemsCheck === 'function' ? 'זמין' : 'לא זמין',
                restoreAccount: typeof window.restoreAccount === 'function' ? 'זמין' : 'לא זמין',
                saveNewAccount: typeof window.saveNewAccount === 'function' ? 'זמין' : 'לא זמין',
                saveEditAccount: typeof window.saveEditAccount === 'function' ? 'זמין' : 'לא זמין',
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

function copyDetailedLog() {
    try {
        const logContent = generateDetailedLog();
        navigator.clipboard.writeText(logContent).then(() => {
            if (window.showNotification) {
                window.showNotification('לוג מפורט הועתק ללוח', 'success', 'הצלחה', 4000, 'development');
            } else {
                alert('לוג מפורט הועתק ללוח');
            }
        }).catch(err => {
            console.error('Failed to copy log:', err);
            // Fallback: show in console
            console.log('Detailed Log:', logContent);
            if (window.showNotification) {
                window.showNotification('לוג מפורט הוצג בקונסול', 'info', 'מידע', 4000, 'development');
            } else {
                alert('לוג מפורט הוצג בקונסול');
            }
        });
    } catch (error) {
        console.error('Error copying log:', error);
        if (window.showNotification) {
            window.showNotification('שגיאה בהעתקת הלוג', 'error', 'שגיאה', 6000, 'development');
        } else {
            alert('שגיאה בהעתקת הלוג');
        }
    }
}

// פונקציה לטעינת חשבונות לפילטר (נדרשת על ידי header-system.js)
function getAccounts() {
    return new Promise((resolve, reject) => {
        if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
            // החזרת רק חשבונות פעילים
            const activeAccounts = window.trading_accountsData.filter(account => account.status === 'open');
            resolve(activeAccounts);
        } else {
            // אם אין נתונים, נטען אותם
            loadTradingAccountsFromServer().then(() => {
                const activeAccounts = window.trading_accountsData ? 
                    window.trading_accountsData.filter(account => account.status === 'open') : [];
                resolve(activeAccounts);
            }).catch(reject);
        }
    });
}

// Define function as global
window.sortTable = sortTable;
window.copyDetailedLog = copyDetailedLog;
window.generateDetailedLog = generateDetailedLog;
window.getAccounts = getAccounts;

// סיום הקובץ
console.log('✅ trading_accounts.js נטען בהצלחה');
