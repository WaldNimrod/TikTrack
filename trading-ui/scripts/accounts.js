/* ===== מערכת ניהול חשבונות ===== */
console.log('📁 accounts.js נטען - מתחיל אתחול');

/*
 * קובץ זה מכיל את כל הפונקציות הקשורות לניהול חשבונות
 * כולל טעינת נתונים, עדכון טבלאות, מודלים ופעולות CRUD
 *
 * הערה חשובה:
 * - פונקציות פילטר כלליות (updateAccountFilterMenu, updateAccountFilterText) הועברו לקובץ grid-filters.js
 * - פונקציות שירות (getAccounts, isAccountsLoaded) הועברו לקובץ account-service.js
 * - קובץ זה נועד לשרת רק את עמוד accounts.html
 *
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (global utilities and sorting functions)
 * - translation-utils.js (translation functions)
 * - filter-system.js (filter functionality)
 *
 * Table Mapping:
 * - Uses 'accounts' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 *
 * תכולת הקובץ:
 * - loadAccountsFromServer: טעינת חשבונות מהשרת
 * - updateAccountsTable: עדכון טבלת חשבונות
 * - showAddAccountModal: הצגת מודל הוספת חשבון
 * - createAccount: יצירת חשבון חדש
 * - updateAccountFromModal: עדכון חשבון קיים
 * - deleteAccount: מחיקת חשבון
 * - פונקציות ניהול חשבונות מלאות (CRUD, מודלים, מחיקה, ביטול)
 *
 * שימוש: נטען רק בעמוד accounts.html לניהול חשבונות
 * תלויות: Bootstrap (למודלים), fetch API, grid-filters.js (לפונקציות פילטר)
 */

// קובץ ייעודי לניהול חשבונות - נטען רק בדפים שצריכים חשבונות

// משתנים גלובליים לחשבונות
window.accountsData = [];
window.accountsLoaded = false;
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

    const response = await fetch('http://127.0.0.1:8080/api/v1/currencies/', {
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
async function loadAccountsFromServer() {
  console.log('🚀🚀🚀 loadAccountsFromServer התחיל 🚀🚀🚀');
  try {
    // בדיקה אם יש token שמור
    const token = localStorage.getItem('authToken');
    console.log('🔑 Token זמין:', !!token);

    if (!token) {
      console.log('⚠️ אין token - מנסה לטעון ללא הרשאה');
    }

    // Fetching accounts from server
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('📡 שליחת בקשה ל-API:', '/api/v1/accounts/');
    const response = await fetch('/api/v1/accounts/', {
      method: 'GET',
      headers,
    });
    
    console.log('📡 תגובת שרת:', response.status, response.ok);

    if (response.ok) {
      const responseData = await response.json();
      console.log('📊 נתונים גולמיים מהשרת:', responseData);

      // טיפול במבנה התשובה - יכול להיות ישירות מערך או בתוך data
      const allAccounts = responseData.data || responseData;
      console.log('📊 כל החשבונות:', allAccounts.length, 'חשבונות');

      // סינון רק חשבונות בסטטוס open
      const openAccounts = allAccounts.filter(account => account.status === 'open');
      console.log('📊 חשבונות פתוחים:', openAccounts.length, 'חשבונות');
      
      window.accountsData = openAccounts;
      window.accountsLoaded = true;

      // קריאה לעדכון התפריט
      if (typeof window.updateAccountFilterMenu === 'function') {
        window.updateAccountFilterMenu(openAccounts);
      }

      // החזרת הנתונים לטעינה חוזרת
      return openAccounts;
    } else {
      console.warn('⚠️ תגובת שרת לא תקינה:', response.status);
      loadDefaultAccounts();
    }

  } catch (error) {
    console.error('❌ שגיאה בטעינת חשבונות מהשרת:', error);
    loadDefaultAccounts();
  }
}

// פונקציה לטעינת כל החשבונות מהשרת (לפילטר)
async function loadAllAccountsFromServer() {
  try {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/v1/accounts/', {
      method: 'GET',
      headers,
    });

    if (response.ok) {
      const responseData = await response.json();
      const allAccounts = responseData.data || responseData;

      // סינון רק חשבונות בסטטוס open
      const openAccounts = allAccounts.filter(account => account.status === 'open');

      // שמירת החשבונות הפתוחים במשתנה גלובלי
      window.allAccountsData = openAccounts;
      window.accountsData = openAccounts; // גם עבור הפילטר

      // עדכון הפילטר עם החשבונות הפתוחים (אם הפונקציה קיימת)
      if (typeof window.updateAccountFilterMenu === 'function') {
        window.updateAccountFilterMenu(openAccounts);
      } else {
        // updateAccountFilterMenu not available yet, trying direct update
        // ניסיון לעדכן ישירות
      }

      // החזרת הנתונים לטעינה חוזרת
      return openAccounts;
    } else {
      // Error loading all accounts from server, status
      return [];
    }

  } catch {
    // Error loading all accounts from server
    return [];
  }
}

// פונקציה לטעינת חשבונות ברירת מחדל
function loadDefaultAccounts() {
  // Loading default accounts - no dummy data
  window.accountsData = [];
  window.accountsLoaded = true;
  if (typeof window.updateAccountFilterMenu === 'function') {
    window.updateAccountFilterMenu(window.accountsData);
  }
}

// הפונקציות הכלליות לפילטר חשבונות הועברו ל-grid-filters.js

// פונקציה לקבלת חשבונות נטענים - הועברה ל-account-service.js
// function getAccounts() {
//   return window.accountsData || [];
// }

// פונקציה לבדיקה אם החשבונות נטענו - הועברה ל-account-service.js
// function isAccountsLoaded() {
//   return window.accountsLoaded || false;
// }

// פונקציה לטעינת נתוני חשבונות מהשרת
async function loadAccountsData() {
  console.log('🚀🚀🚀 loadAccountsData התחיל 🚀🚀🚀');
  try {
    // טוען נתוני חשבונות מהשרת

    // בדיקה אם יש פונקציה apiCall זמינה
    if (typeof window.apiCall === 'function') {
      console.log('📡 משתמש ב-apiCall');
      const response = await window.apiCall('/api/v1/accounts/');
      const accounts = response.data || response;
      console.log('📊 חשבונות מ-apiCall:', accounts.length, 'חשבונות');
      // חשבונות שהתקבלו
      return accounts;
    } else {
      console.log('📡 apiCall לא זמין - משתמש ב-loadAccountsFromServer');
      // קריאה ישירה ל-API
      const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
      const response = await fetch(`${base}/api/v1/accounts/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const accounts = result.data || result;
      // חשבונות שהתקבלו
      return accounts;
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
 * @param {Array} accounts - מערך של חשבונות
 *
 * @example
 * updateAccountsTable(accounts);
 */
function updateAccountsTable(accounts) {
  console.log('🚀🚀🚀 updateAccountsTable התחיל עם', accounts ? accounts.length : 0, 'חשבונות 🚀🚀🚀');
  
  // בדיקה שהפרמטר תקין
  if (!accounts || !Array.isArray(accounts)) {
    console.error('❌ פרמטר חשבונות לא תקין:', accounts);
    handleValidationError('updateAccountsTable', 'פרמטר חשבונות לא תקין');
    return;
  }

  const tbody = document.querySelector('#accountsTable tbody');
  if (!tbody) {
    console.warn('⚠️ לא נמצא tbody לטבלת חשבונות - ייתכן שהדף לא נטען עדיין');
    return;
  }

  // בניית הטבלה מחדש לפי הכותרות בדיוק
  console.log('📊 עדכון טבלת חשבונות עם', accounts.length, 'חשבונות');
  tbody.innerHTML = accounts.map(account => {
    // המרת סטטוס לעברית לפילטר
    const statusForFilter = account.status === 'open' ? 'פתוח' :
      account.status === 'closed' ? 'סגור' :
        account.status === 'cancelled' ? 'מבוטל' : account.status || '-';

    return `
    <tr data-account-id="${account.id}">
      <td class="ticker-cell" data-account="${account.name || '-'}">
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="btn btn-sm btn-outline-info" 
            onclick="showEntityDetails('account', ${account.id})" 
            title="פרטי חשבון" 
            style="background-color: white; font-size: 0.8em;">
            🔗
          </button>
          <span class="entity-account-badge" 
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
  const countElement = document.getElementById('accountsCount');
  if (countElement) {
    countElement.textContent = `${accounts.length} חשבונות`;
  }

  console.log('✅ טבלת חשבונות עודכנה בהצלחה עם', accounts.length, 'חשבונות');
  // END UPDATE ACCOUNTS TABLE
}

/**
 * פונקציה לטעינת חשבונות - מתאימה לעבוד עם designs.html
 * הפונקציה טוענת נתונים ומעדכנת את הטבלה
 */
async function loadAccounts() {
  try {
    // טוען חשבונות

    // קריאה לפונקציה מ-accounts.js
    if (typeof window.loadAccountsDataFromAPI === 'function') {
      const accounts = await window.loadAccountsDataFromAPI();
      updateAccountsTable(accounts);
    } else {
      const accounts = await loadAccountsData();
      updateAccountsTable(accounts);
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
 * @param {Array} accounts - מערך של חשבונות
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

  const selectedText = accountToggle.querySelector('.selected-account-text');
  if (!selectedText) {
    return;
  }

  // קבלת החשבונות הנבחרים
  const selectedAccounts = window.selectedAccountsForFilter || [];

  if (selectedAccounts.length === 0) {
    selectedText.textContent = 'כל החשבונות';
  } else if (selectedAccounts.length === 1) {
    selectedText.textContent = selectedAccounts[0];
  } else {
    selectedText.textContent = `${selectedAccounts.length} נבחרו`;
  }
}

// ייצוא הפונקציות לשימוש גלובלי
window.loadAccountsFromServer = loadAccountsFromServer;
window.loadAllAccountsFromServer = loadAllAccountsFromServer;
window.loadDefaultAccounts = loadDefaultAccounts;
// הערה: updateAccountFilterMenu מיוצאת מ-grid-filters.js
window.updateAccountFilterDisplayText = updateAccountFilterDisplayText;
// window.getAccounts = getAccounts; // הועבר ל-account-service.js
// window.isAccountsLoaded = isAccountsLoaded; // הועבר ל-account-service.js
window.loadAccountsData = loadAccountsData;
window.updateAccountsTable = updateAccountsTable;
window.loadAccounts = loadAccounts;

// פונקציה גלובלית לעדכון ידני של תפריט החשבונות
window.refreshAccountFilterMenu = function () {
  if (window.accountsData && window.accountsData.length > 0) {
    if (typeof window.updateAccountFilterMenu === 'function') {
      window.updateAccountFilterMenu(window.accountsData);
    }
  } else {
    loadAccountsFromServer();
  }
};

// פונקציה לבדיקת מצב החשבונות
window.checkAccountsStatus = function () {

  const appHeader = document.querySelector('app-header');
  if (appHeader) {
    const accountMenu = appHeader.shadowRoot.getElementById('accountFilterMenu');
    if (accountMenu) {
      const items = accountMenu.querySelectorAll('.account-filter-item');
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
window.updateAccountFilterMenuDirectly = function (accounts) {
  // UPDATE ACCOUNT FILTER MENU DIRECTLY
  // Accounts received

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
  const allAccountsItem = document.createElement('div');
  allAccountsItem.className = 'account-filter-item selected';
  allAccountsItem.setAttribute('data-account', 'all');
  allAccountsItem.innerHTML = `
    <span class="option-text">כל החשבונות</span>
    <span class="check-mark">✓</span>
  `;
  accountMenu.appendChild(allAccountsItem);

  // הוספת החשבונות מהשרת
  if (accounts && accounts.length > 0) {
    accounts.forEach(account => {
      const accountItem = document.createElement('div');
      accountItem.className = 'account-filter-item';
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
window.debugAccountsFilter = function () {
  // בדיקת מצב החשבונות
  window.checkAccountsStatus();

  // בדיקה מהירה של השרת
  fetch('http://127.0.0.1:8080/api/v1/accounts/')
    .then(response => response.json())
    .then(data => {
      const accounts = data.data || data;
      const openAccounts = accounts.filter(acc => acc.status === 'open');

      // ניסיון לעדכן תפריט ישירות
      if (typeof window.updateAccountFilterMenu === 'function') {
        window.updateAccountFilterMenu(openAccounts);
      }
    })
    .catch(() => {
      // Server error handled silently
    });

  // ניסיון לטעון חשבונות
  if (typeof window.loadAllAccountsFromServer === 'function') {
    window.loadAllAccountsFromServer().then(() => {
      window.checkAccountsStatus();
    }).catch(() => {
      // Error loading accounts handled silently
    });
  }

  // ניסיון לעדכן תפריט
  setTimeout(() => {
    if (typeof window.refreshAccountFilterMenu === 'function') {
      window.refreshAccountFilterMenu();
      setTimeout(() => {
        window.checkAccountsStatus();
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
function showAddAccountModal() {
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
      window.clearCacheBeforeCRUD('accounts', mode === 'add' ? 'add' : 'edit');
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
        await window.centralRefresh.showSuccessAndRefresh('accounts', message);
      } else {
        // Fallback למערכת הישנה
        if (typeof window.loadAccountsDataForAccountsPage === 'function') {
          await window.loadAccountsDataForAccountsPage();
        } else if (typeof window.loadAccountsData === 'function') {
          const accounts = await window.loadAccountsData();
          if (typeof window.updateAccountsTable === 'function') {
            window.updateAccountsTable(accounts);
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
    const response = await fetch('/api/v1/accounts/', {
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
    const response = await fetch(`/api/v1/accounts/${accountId}`, {
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
    const response = await fetch(`/api/v1/accounts/${accountId}`);

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
async function loadAccountsDataFromAPI() {
  console.log('🚀🚀🚀 loadAccountsDataFromAPI התחיל 🚀🚀🚀');
  try {
    console.log('📡 שליחת בקשה ל-API:', '/api/v1/accounts/');
    const response = await fetch('/api/v1/accounts/');
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
    console.error('❌ שגיאה ב-loadAccountsDataFromAPI:', error);
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
    const response = await fetch(`/api/v1/accounts/${accountId}`, {
      method: 'DELETE',
    });

    if (response.ok) {

      // רענון הנתונים
      if (typeof loadAccounts === 'function') {
        loadAccounts();
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
    const tradesResponse = await fetch(`/api/v1/trades/?account_id=${accountId}&status=open`);
    if (tradesResponse.ok) {
      const tradesData = await tradesResponse.json();
      const openTrades = tradesData.data || tradesData || [];

      if (openTrades.length > 0) {
        await showOpenTradesWarning(accountName, openTrades, 'cancel');
        return;
      }
    }

    const response = await fetch(`/api/v1/accounts/${accountId}`, {
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
      if (typeof window.loadAccountsDataForAccountsPage === 'function') {
        await window.loadAccountsDataForAccountsPage();
      } else if (typeof window.loadAccountsData === 'function') {
        const accounts = await window.loadAccountsData();
        if (typeof window.updateAccountsTable === 'function') {
          window.updateAccountsTable(accounts);
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
    window.clearCacheBeforeCRUD('accounts', 'delete');
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
    const response = await fetch(`/api/v1/accounts/${accountId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      // שימוש במערכת הריענון המרכזית
      if (window.centralRefresh) {
        await window.centralRefresh.showSuccessAndRefresh('accounts', 'חשבון נמחק בהצלחה!');
      } else {
        // Fallback למערכת הישנה
        showSuccessMessage('חשבון נמחק בהצלחה!');

        // רענון הטבלה
        if (typeof window.loadAccountsDataForAccountsPage === 'function') {
          await window.loadAccountsDataForAccountsPage();
        } else if (typeof window.loadAccountsData === 'function') {
          const accounts = await window.loadAccountsData();
          if (typeof window.updateAccountsTable === 'function') {
            window.updateAccountsTable(accounts);
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
    const response = await fetch(`/api/v1/linked-items/account/${accountId}`);

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
          window.showNotification('אזהרה', 'יש פריטים מקושרים לחשבון זה', 'warning');
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
window.showAddAccountModal = showAddAccountModal;
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
window.loadAccountsDataFromAPI = loadAccountsDataFromAPI;
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
if (window.location.pathname.includes('/accounts')) {
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
    if (typeof window.loadAccountsDataForAccountsPage === 'function') {
      window.loadAccountsDataForAccountsPage();
    } else {
      handleFunctionNotFound('loadAccountsDataForAccountsPage', 'פונקציית טעינת נתוני חשבונות לא נמצאה');
    }
  };
}

/**
 * פונקציה לטעינת נתוני חשבונות ועדכון הטבלה בדף החשבונות
 * פונקציה זו מיועדת לדף החשבונות (accounts.html)
 */
async function loadAccountsDataForAccountsPage() {
  console.log('🚀🚀🚀 loadAccountsDataForAccountsPage התחיל 🚀🚀🚀');
  try {
    // טעינת נתונים מהשרת
    let accounts;
    if (typeof window.loadAccountsDataFromAPI === 'function') {
      console.log('📡 משתמש ב-loadAccountsDataFromAPI');
      accounts = await window.loadAccountsDataFromAPI();
    } else {
      console.log('📡 משתמש ב-loadAccountsData');
      accounts = await loadAccountsData();
    }
    
    console.log('📊 נתונים שהתקבלו:', accounts ? accounts.length : 0, 'חשבונות');

    // בדיקה שהנתונים תקינים
    if (!accounts || !Array.isArray(accounts)) {
      console.warn('⚠️ נתונים לא תקינים התקבלו מהשרת:', accounts);
      // במקום לזרוק שגיאה, נשתמש בנתוני דמו
      accounts = [];
    }

    // שמירת הנתונים במשתנה גלובלי
    window.accountsData = accounts;
    window.allAccountsData = accounts;
    console.log('💾 נתונים נשמרו ב-window.accountsData:', accounts.length, 'חשבונות');

    // החלת פילטרים על הנתונים
    let filteredAccounts = [...accounts];

    // בדיקה אם יש פילטרים פעילים
    const hasActiveFilters = window.selectedStatusesForFilter && window.selectedStatusesForFilter.length > 0 ||
      window.selectedTypesForFilter && window.selectedTypesForFilter.length > 0 ||
      window.selectedDateRangeForFilter && window.selectedDateRangeForFilter !== 'כל זמן' ||
      window.searchTermForFilter && window.searchTermForFilter.trim() !== '';

    if (hasActiveFilters) {
      if (typeof window.filterDataByFilters === 'function') {
        filteredAccounts = window.filterDataByFilters(accounts, 'accounts');
      } else {
        // פונקציה מקומית לפילטור אם הפונקציה הגלובלית לא זמינה
        const statuses = window.selectedStatusesForFilter;
        const types = window.selectedTypesForFilter;
        const dateRange = window.selectedDateRangeForFilter;
        const searchTerm = window.searchTermForFilter;
        filteredAccounts = filterAccountsLocally(accounts, statuses, types, dateRange, searchTerm);
      }
    }

    // שמירת הנתונים המסוננים לגלובלי
    window.filteredAccountsData = filteredAccounts;

    // עדכון הטבלה עם הנתונים המסוננים
    if (typeof window.updateAccountsTable === 'function') {
      console.log('📊 עדכון טבלה עם', filteredAccounts.length, 'חשבונות');
      window.updateAccountsTable(filteredAccounts);

      // בדיקה שהטבלה התעדכנה כראוי
      const tbody = document.querySelector('#accountsTable tbody');
      if (tbody && tbody.children.length === 0 && filteredAccounts.length > 0) {
        console.warn('⚠️ הטבלה לא התעדכנה כראוי - אין שורות בטבלה');
      } else {
        console.log('✅ הטבלה התעדכנה בהצלחה');
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
    const tbody = document.querySelector('#accountsTable tbody');
    if (tbody) {
      const errorText = `שגיאה בטעינת נתונים: ${error.message}`;
      const errorHtml = `<tr><td colspan="8" class="text-center text-danger">${errorText}</td></tr>`;
      tbody.innerHTML = errorHtml;
    }

    // עדכון ספירת רשומות
    const countElement = document.getElementById('accountsCount');
    if (countElement) {
      countElement.textContent = 'שגיאה';
    }
  }
}


// פונקציה להגדרת כותרות למיון - הוסרה כי לא בשימוש
// function setupSortableHeaders() { ... }

// פונקציה לפילטור מקומי של חשבונות - ספציפית לחשבונות
function filterAccountsLocally(accounts, selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  let filteredAccounts = [...accounts];

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
    filteredAccounts = filteredAccounts.filter(account => {
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
    filteredAccounts = filteredAccounts.filter(account => {
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
    filteredAccounts = filteredAccounts.filter(account => {
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

    filteredAccounts = filteredAccounts.filter(account => {
      const nameMatch = (account.name || '').toLowerCase().includes(searchLower);
      const typeMatch = (account.type || account.account_type || '').toLowerCase().includes(searchLower);
      const statusMatch = (account.status || '').toLowerCase().includes(searchLower);

      const isMatch = nameMatch || typeMatch || statusMatch;
      return isMatch;
    });
  }

  return filteredAccounts;
}

// פונקציה גלובלית לעדכון הטבלה - הועברה ל-header-system.js

// פונקציה לעדכון תפריט פילטר החשבונות
function updateAccountFilterMenu(accounts) {
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
  const allAccountsItem = document.createElement('div');
  allAccountsItem.className = 'account-filter-item selected';
  allAccountsItem.setAttribute('data-account', 'all');
  allAccountsItem.innerHTML = `
    <span class="option-text">כל החשבונות</span>
    <span class="check-mark">✓</span>
  `;
  accountMenu.appendChild(allAccountsItem);

  // הוספת החשבונות מהשרת
  if (accounts && accounts.length > 0) {
    accounts.forEach(account => {
      const accountItem = document.createElement('div');
      accountItem.className = 'account-filter-item';
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
window.filterAccountsLocally = filterAccountsLocally;
window.updateAccountsTable = updateAccountsTable;
window.deleteAccount = deleteAccount;
window.loadAccountsDataForAccountsPage = loadAccountsDataForAccountsPage;

/**
 * שחזור מצב סקשן החשבונות
 */
function restoreAccountsSectionState() {
  const savedState = localStorage.getItem('accountsSectionCollapsed');
  if (savedState === 'true') {
    const accountsSection = document.querySelector('.accounts-section');
    if (accountsSection) {
      const sectionBody = accountsSection.querySelector('.section-body');
      const toggleBtn = accountsSection.querySelector('button[onclick="toggleAccountsSection()"]');

      if (sectionBody && toggleBtn) {
        sectionBody.style.display = 'none';
        toggleBtn.textContent = 'הצג חשבונות';
      }
    }
  }
}

window.restoreAccountsSectionState = restoreAccountsSectionState;


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
  if (window.location.pathname.includes('/accounts')) {
    console.log('🎯 נמצאים בדף החשבונות - מתחיל טעינת נתונים');
    // טעינת נתוני חשבונות
    if (typeof window.loadAccountsDataForAccountsPage === 'function') {
      console.log('📡 קורא ל-loadAccountsDataForAccountsPage');
      window.loadAccountsDataForAccountsPage();
    } else {
      console.error('❌ loadAccountsDataForAccountsPage לא נמצאה');
      handleFunctionNotFound('loadAccountsDataForAccountsPage', 'פונקציית טעינת נתוני חשבונות לא נמצאה');
    }

    // שחזור מצב הסקשנים
    if (typeof window.restoreAccountsSectionState === 'function') {
      console.log('🔄 שחזור מצב הסקשנים');
      window.restoreAccountsSectionState();
    } else {
      console.error('❌ restoreAccountsSectionState לא נמצאה');
      handleFunctionNotFound('restoreAccountsSectionState', 'פונקציית שחזור מצב סקשנים לא נמצאה');
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
      const response = await fetch(`/api/v1/accounts/${accountId}`);
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
      const response = await fetch(`/api/v1/accounts/${accountId}`);
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
    window.clearCacheBeforeCRUD('accounts', 'edit');
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
    const response = await fetch(`/api/v1/accounts/${accountId}`, {
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
        await window.centralRefresh.showSuccessAndRefresh('accounts', 'חשבון הוחזר בהצלחה לסטטוס סגור!');
      } else {
        // Fallback למערכת הישנה
        showSuccessMessage('חשבון הוחזר בהצלחה לסטטוס סגור!');

        // רענון הטבלה
        if (typeof window.loadAccountsDataForAccountsPage === 'function') {
          await window.loadAccountsDataForAccountsPage();
        } else if (typeof window.loadAccountsData === 'function') {
          const accounts = await window.loadAccountsData();
          if (typeof window.updateAccountsTable === 'function') {
            window.updateAccountsTable(accounts);
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
      window.clearCacheBeforeCRUD('accounts', 'cancel');
    }
    
    // שליחה לשרת
    const response = await fetch(`/api/v1/accounts/${accountId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });

    if (response.ok) {
      await response.json(); // result not used

      // שימוש במערכת הריענון המרכזית
      if (window.centralRefresh) {
        await window.centralRefresh.showSuccessAndRefresh('accounts', 'החשבון בוטל בהצלחה');
      } else {
        // Fallback למערכת הישנה
        // הצגת הודעת הצלחה
        if (window.showSuccessNotification) {
          window.showSuccessNotification('הצלחה', 'החשבון בוטל בהצלחה');
        }

        // רענון הנתונים
        if (typeof loadAccountsDataForAccountsPage === 'function') {
          await loadAccountsDataForAccountsPage();
        } else if (typeof window.loadAccountsData === 'function') {
          const accounts = await window.loadAccountsData();
          if (typeof window.updateAccountsTable === 'function') {
            window.updateAccountsTable(accounts);
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
      window.clearCacheBeforeCRUD('accounts', 'delete');
    }
    
    // שליחה לשרת
    const response = await fetch(`/api/v1/accounts/${accountId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      await response.json(); // result not used

      // שימוש במערכת הריענון המרכזית
      if (window.centralRefresh) {
        await window.centralRefresh.showSuccessAndRefresh('accounts', 'החשבון נמחק בהצלחה');
      } else {
        // Fallback למערכת הישנה
        // הצגת הודעת הצלחה
        if (window.showSuccessNotification) {
          window.showSuccessNotification('הצלחה', 'החשבון נמחק בהצלחה');
        }

        // רענון הנתונים
        if (typeof loadAccountsDataForAccountsPage === 'function') {
          await loadAccountsDataForAccountsPage();
        } else if (typeof window.loadAccountsData === 'function') {
          const accounts = await window.loadAccountsData();
          if (typeof window.updateAccountsTable === 'function') {
            window.updateAccountsTable(accounts);
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
    const tradesResponse = await fetch(`/api/v1/trades/?account_id=${accountId}&status=open`);
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
    const response = await fetch(`/api/v1/linked-items/account/${accountId}`);

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
          window.showNotification('אזהרה', 'יש פריטים מקושרים לחשבון זה', 'warning');
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
    const tradesResponse = await fetch(`/api/v1/trades/?account_id=${accountId}&status=open`);
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
    const response = await fetch(`/api/v1/linked-items/account/${accountId}`);

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
          window.showNotification('אזהרה', 'יש פריטים מקושרים לחשבון זה', 'warning');
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
  if (window.accountsData) {
    const account = window.accountsData.find(a => a.id === accountId);
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
    fetch('/api/accounts/' + accountId, {
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
      loadAccountsFromServer();
      
      // הודעת הצלחה
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('חשבון עודכן בהצלחה');
      } else if (typeof window.showNotification === 'function') {
        window.showNotification('חשבון עודכן בהצלחה', 'success');
      }
    })
    .catch(error => {
      console.error('שגיאה בעדכון חשבון:', error);
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בעדכון חשבון', error.message);
      } else if (typeof window.showNotification === 'function') {
        window.showNotification('שגיאה בעדכון חשבון', 'error');
      }
    });
    
  } catch (error) {
    console.error('שגיאה בעדכון חשבון:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון חשבון', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בעדכון חשבון', 'error');
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
    const account = window.accountsData.find(a => a.id === accountId);
    if (!account) {
      throw new Error('חשבון לא נמצא');
    }
    
    // יצירת תוכן פרטי החשבון
    const detailsContent = `
      <div class="account-details">
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
      window.showNotification('שגיאה בהצגת פרטי חשבון', 'error');
    }
  }
}

// ייצוא הפונקציה לגלובל
window.showAccountDetails = showAccountDetails;

// סיום הקובץ
console.log('✅ accounts.js נטען בהצלחה');
