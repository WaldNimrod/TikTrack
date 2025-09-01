/* ===== מערכת ניהול חשבונות ===== */
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
      const errorText = await response.text();
      // טעינת מטבעות ברירת מחדל
      window.currenciesData = [
        { id: 1, symbol: 'USD', name: 'US Dollar', usd_rate: '1.000000' },
      ];
      window.currenciesLoaded = true;
    }

  } catch (error) {
    // טעינת מטבעות ברירת מחדל
    window.currenciesData = [
      { id: 1, symbol: 'USD', name: 'US Dollar', usd_rate: '1.000000' },
    ];
    window.currenciesLoaded = true;
  }
}

// פונקציה עזר להצגת מטבע
function getCurrencyDisplay(account) {
  if (account.currency_symbol) {
    // אם יש סמל מטבע מהשרת
    switch (account.currency_symbol) {
    case 'USD': return '$';
    case 'ILS': return '₪';
    case 'EUR': return '€';
    case 'GBP': return '£';
    default: return account.currency_symbol;
    }
  } else if (account.currency_id && window.currenciesData.length > 0) {
    // אם יש רק currency_id, נחפש את המטבע
    const currency = window.currenciesData.find(c => c.id === account.currency_id);
    if (currency) {
      switch (currency.symbol) {
      case 'USD': return '$';
      case 'ILS': return '₪';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return currency.symbol;
      }
    }
  } else if (account.currency && account.currency.symbol) {
    // fallback למטבע הישן
    switch (account.currency.symbol) {
    case 'USD': return '$';
    case 'ILS': return '₪';
    case 'EUR': return '€';
    case 'GBP': return '£';
    default: return account.currency.symbol;
    }
  }
  return '$'; // ברירת מחדל
}

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
  try {
    // בדיקה אם יש token שמור
    const token = localStorage.getItem('authToken');

    if (!token) {
      // נסיון לטעון ללא token
    }

    // Fetching accounts from server
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('http://127.0.0.1:8080/api/v1/accounts/', {
      method: 'GET',
      headers,
    });

    if (response.ok) {
      const responseData = await response.json();

      // טיפול במבנה התשובה - יכול להיות ישירות מערך או בתוך data
      const allAccounts = responseData.data || responseData;

      // סינון רק חשבונות בסטטוס open
      const openAccounts = allAccounts.filter(account => account.status === 'open');
      window.accountsData = openAccounts;
      window.accountsLoaded = true;

      // קריאה לעדכון התפריט
      if (typeof window.updateAccountFilterMenu === 'function') {
        window.updateAccountFilterMenu(openAccounts);
      }

      // החזרת הנתונים לטעינה חוזרת
      return openAccounts;
    } else {
      const errorText = await response.text();
      loadDefaultAccounts();
    }

  } catch (error) {
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

    const response = await fetch('http://127.0.0.1:8080/api/v1/accounts/', {
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

  } catch (error) {
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
  try {
    // טוען נתוני חשבונות מהשרת

    // בדיקה אם יש פונקציה apiCall זמינה
    if (typeof window.apiCall === 'function') {
      const response = await window.apiCall('/api/v1/accounts/');
      const accounts = response.data || response;
      // חשבונות שהתקבלו
      return accounts;
    } else {
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
  // בדיקה שהפרמטר תקין
  if (!accounts || !Array.isArray(accounts)) {
    handleValidationError('updateAccountsTable', 'פרמטר חשבונות לא תקין');
    return;
  }

  const tbody = document.querySelector('#accountsTable tbody');
  if (!tbody) {
    handleElementNotFound('updateAccountsTable', 'לא נמצא tbody לטבלת חשבונות');
    throw new Error('טבלת החשבונות לא נמצאה בדף');
  }

  // בניית הטבלה מחדש לפי הכותרות בדיוק
  tbody.innerHTML = accounts.map(account => {
    // המרת סטטוס לעברית לפילטר
    const statusForFilter = account.status === 'open' ? 'פתוח' :
      account.status === 'closed' ? 'סגור' :
        account.status === 'cancelled' ? 'מבוטל' : account.status || '-';

    return `
    <tr data-account-id="${account.id}">
      <td class="ticker-cell" data-account="${account.name || '-'}"><strong>${account.name || '-'}</strong></td>
      <td>${account.currency || '-'}</td>
      <td class="status-cell" data-status="${statusForFilter}">
        <span class="status-badge status-${account.status}">
          ${statusForFilter}
        </span>
      </td>
      <td>$${account.cash_balance ? account.cash_balance.toLocaleString() : '0'}</td>
      <td>$${account.total_value ? account.total_value.toLocaleString() : '0'}</td>
      <td>${account.total_pl ? `$${account.total_pl.toLocaleString()}` : '$0'}</td>
      <td>${account.notes || '-'}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-info" onclick="window.showLinkedItemsModal && window.showLinkedItemsModal([], 'account', ${account.id})" title="צפה באלמנטים מקושרים">
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

  // טבלת חשבונות עודכנה בהצלחה עם
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
      tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">שגיאה בטעינת חשבונות: ${error.message}</td></tr>`;
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
      items.forEach((item, index) => {
        const accountName = item.getAttribute('data-account');
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
    .catch(error => {
      // Server error handled silently
    });

  // ניסיון לטעון חשבונות
  if (typeof window.loadAllAccountsFromServer === 'function') {
    window.loadAllAccountsFromServer().then(accounts => {
      window.checkAccountsStatus();
    }).catch(error => {
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
  const invalidChars = /[<>\"'&]/;
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
    let result;
    if (mode === 'add') {
      result = await addAccountToAPI(accountData);
    } else {
      result = await updateAccountInAPI(accountId, accountData);
    }

    // רענון הנתונים לפני סגירת המודל
    try {
      if (typeof window.loadAccountsDataForAccountsPage === 'function') {
        await window.loadAccountsDataForAccountsPage();
      } else if (typeof window.loadAccountsData === 'function') {
        const accounts = await window.loadAccountsData();
        if (typeof window.updateAccountsTable === 'function') {
          window.updateAccountsTable(accounts);
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

      // הצגת הודעה
      const message = mode === 'add' ? 'חשבון נוסף בהצלחה' : 'חשבון עודכן בהצלחה';
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', message);
      } else {
        // Success message handled by notification system
      }

    } catch (refreshError) {
      handleSystemError(refreshError, 'רענון הטבלה');
      // אם יש שגיאה ברענון, לא סוגרים את המודל ומציגים הודעת שגיאה
      if (typeof window.showWarningNotification === 'function') {
        window.showWarningNotification('אזהרה', 'החשבון נשמר אך יש בעיה בעדכון הטבלה. אנא רענן את הדף.');
      } else {
        console.warn('החשבון נשמר אך יש בעיה בעדכון הטבלה. אנא רענן את הדף.');
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
 * יצירת חשבון חדש
 */
async function createAccount() {

  const name = document.getElementById('accountName').value.trim();
  const currency = document.getElementById('accountCurrency').value;

  // המרת סטטוס מ-פתוח/סגור ל-open/closed
  const statusDisplay = document.getElementById('accountStatus').value || 'פתוח';
  let status = 'open';
  if (statusDisplay === 'סגור') {
    status = 'closed';
  }

  const cashBalance = parseFloat(document.getElementById('accountCashBalance').value) || 0;
  const totalValue = parseFloat(document.getElementById('accountTotalValue').value) || 0;
  const totalPl = parseFloat(document.getElementById('accountTotalPl').value) || 0;
  const notes = document.getElementById('accountNotes').value.trim();

  if (!name || !currency) {
    showErrorMessage('שם החשבון ומטבע הם שדות חובה');
    return;
  }

  try {
    const response = await fetch('/api/v1/accounts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        currency_id: parseInt(currency),
        status,
        cash_balance: cashBalance,
        total_value: totalValue,
        total_pl: totalPl,
        notes,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showSuccessMessage('חשבון נוצר בהצלחה!');
      const modal = bootstrap.Modal.getInstance(document.getElementById('addAccountModal'));
      modal.hide();

      // רענון הטבלה
      if (typeof loadAccounts === 'function') {
        loadAccounts();
      }
    } else {
      showErrorMessage(data.message || 'שגיאה ביצירת חשבון');
    }
  } catch (error) {
    handleSaveError(error, 'יצירת חשבון');
    showErrorMessage('שגיאה ביצירת חשבון');
  }
}

/**
 * עדכון חשבון קיים
 */
async function updateAccountFromModal() {

  const id = document.getElementById('editAccountId').value;
  const name = document.getElementById('editAccountName').value.trim();
  const currency = document.getElementById('editAccountCurrency').value;

  // המרת סטטוס מ-פתוח/סגור ל-open/closed
  const statusDisplay = document.getElementById('editAccountStatus').value || 'פתוח';
  let status = 'open';
  if (statusDisplay === 'סגור') {
    status = 'closed';
  }

  const cashBalance = parseFloat(document.getElementById('editAccountCashBalance').value) || 0;
  const totalValue = parseFloat(document.getElementById('editAccountTotalValue').value) || 0;
  const totalPl = parseFloat(document.getElementById('editAccountTotalPl').value) || 0;
  const notes = document.getElementById('editAccountNotes').value.trim();

  if (!name || !currency) {
    showErrorMessage('שם החשבון ומטבע הם שדות חובה');
    return;
  }

  try {
    const response = await fetch(`/api/v1/accounts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        currency_id: parseInt(currency),
        status,
        cash_balance: cashBalance,
        total_value: totalValue,
        total_pl: totalPl,
        notes,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showSuccessMessage('חשבון עודכן בהצלחה!');
      const modal = bootstrap.Modal.getInstance(document.getElementById('editAccountModal'));
      modal.hide();

      // רענון הטבלה
      if (typeof loadAccounts === 'function') {
        loadAccounts();
      }
    } else {
      showErrorMessage(data.message || 'שגיאה בעדכון חשבון');
    }
  } catch (error) {
    handleSaveError(error, 'עדכון חשבון');
    showErrorMessage('שגיאה בעדכון חשבון');
  }
}

/**
 * טעינת נתוני חשבונות מ-API
 * @returns {Promise<Array>} מערך של חשבונות
 */
async function loadAccountsDataFromAPI() {
  try {
    const response = await fetch('/api/v1/accounts/');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // בדיקה אם התוצאה מכילה מערך נתונים
    if (result.data && Array.isArray(result.data)) {
      return result.data;
    } else if (Array.isArray(result)) {
      return result;
    } else {
      handleSystemError(new Error('מבנה נתונים לא צפוי'), 'מבנה נתונים לא צפוי מה-API');
      throw new Error('מבנה נתונים לא צפוי מה-API');
    }

  } catch (error) {
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
          if (!confirm(`האם אתה בטוח שברצונך לבטל את החשבון "${accountName}"?`)) {
            return;
          }
          if (!confirm(`הסטטוס ישתנה ל"מבוטל". האם אתה בטוח שברצונך להמשיך בביטול החשבון "${accountName}"?`)) {
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
        if (!confirm(`האם אתה בטוח שברצונך למחוק את החשבון "${accountName}"?`)) {
          return;
        }
        if (!confirm(`פעולה זו אינה הפיכה. האם אתה בטוח שברצונך להמשיך במחיקת החשבון "${accountName}"?`)) {
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
    const parentEntities = linkedItemsData.parent_entities || [];

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
    console.warn(`יש עסקאות פתוחות בחשבון "${accountName}". לא ניתן למחוק חשבון עם עסקאות פעילות.`);
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
window.createWarningModal = createWarningModal;
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
  try {
    // טעינת נתונים מהשרת
    let accounts;
    if (typeof window.loadAccountsDataFromAPI === 'function') {
      accounts = await window.loadAccountsDataFromAPI();
    } else {
      accounts = await loadAccountsData();
    }

    // בדיקה שהנתונים תקינים
    if (!accounts || !Array.isArray(accounts)) {
      handleValidationError('loadAccountsDataForAccountsPage', 'נתונים לא תקינים התקבלו מהשרת');
      throw new Error('נתונים לא תקינים התקבלו מהשרת');
    }

    // שמירת הנתונים במשתנה גלובלי
    window.accountsData = accounts;
    window.allAccountsData = accounts;

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
        filteredAccounts = filterAccountsLocally(accounts, window.selectedStatusesForFilter, window.selectedTypesForFilter, window.selectedDateRangeForFilter, window.searchTermForFilter);
      }
    }

    // שמירת הנתונים המסוננים לגלובלי
    window.filteredAccountsData = filteredAccounts;

    // עדכון הטבלה עם הנתונים המסוננים
    if (typeof window.updateAccountsTable === 'function') {
      window.updateAccountsTable(filteredAccounts);

      // בדיקה שהטבלה התעדכנה כראוי
      const tbody = document.querySelector('#accountsTable tbody');
      if (tbody && tbody.children.length === 0) {
        handleSystemError(new Error('הטבלה לא התעדכנה כראוי'), 'עדכון טבלה');
        throw new Error('הטבלה לא התעדכנה כראוי');
      }
    } else {
      handleFunctionNotFound('updateAccountsTable', 'פונקציית עדכון הטבלה לא נמצאה');
      throw new Error('פונקציית עדכון הטבלה לא נמצאה');
    }

  } catch (error) {
    handleDataLoadError(error, 'טעינת נתוני חשבונות לדף החשבונות');

    // הצגת הודעת שגיאה בטבלה
    const tbody = document.querySelector('#accountsTable tbody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">שגיאה בטעינת נתונים: ${error.message}</td></tr>`;
    }

    // עדכון ספירת רשומות
    const countElement = document.getElementById('accountsCount');
    if (countElement) {
      countElement.textContent = 'שגיאה';
    }
  }
}


// פונקציה להגדרת כותרות למיון
function setupSortableHeaders() {
  const headers = document.querySelectorAll('#accountsTable th.sortable-header');

  headers.forEach((header, index) => {
    header.addEventListener('click', function () {

      // קביעת כיוון המיון
      if (window.currentSortColumn === index) {
        window.currentSortDirection = window.currentSortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        window.currentSortColumn = index;
        window.currentSortDirection = 'asc';
      }

      // שמירת מצב המיון
      localStorage.setItem('accountsSortColumn', window.currentSortColumn);
      localStorage.setItem('accountsSortDirection', window.currentSortDirection);

      // עדכון אייקונים
      if (typeof window.updateSortIcons === 'function') {
        window.updateTableSortIcons(window.currentSortColumn, 'accounts');
      }

      // מיון הנתונים
      if (typeof window.sortTableData === 'function' && window.accountsData) {
        const sortedData = window.sortTableData(window.accountsData, window.currentSortColumn, window.currentSortDirection);
        if (typeof window.updateAccountsTable === 'function') {
          window.updateAccountsTable(sortedData);
        }
      }
    });
  });

}

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
  // טעינת מטבעות
  loadCurrenciesFromServer();

  // בדיקה אם אנחנו בדף החשבונות
  if (window.location.pathname.includes('/accounts')) {
    // טעינת נתוני חשבונות
    if (typeof window.loadAccountsDataForAccountsPage === 'function') {
      window.loadAccountsDataForAccountsPage();
    } else {
      handleFunctionNotFound('loadAccountsDataForAccountsPage', 'פונקציית טעינת נתוני חשבונות לא נמצאה');
    }

    // שחזור מצב הסקשנים
    if (typeof window.restoreAccountsSectionState === 'function') {
      window.restoreAccountsSectionState();
    } else {
      handleFunctionNotFound('restoreAccountsSectionState', 'פונקציית שחזור מצב סקשנים לא נמצאה');
    }
  }
});

/**
 * ביטול חשבון עם בדיקת פריטים מקושרים
 * @param {number} accountId - מזהה החשבון
 * @param {string} accountName - שם החשבון
 */
async function cancelAccountWithLinkedItemsCheck(accountId, accountName) {
  try {
    // בדיקת פריטים מקושרים
    const linkedItemsResponse = await fetch(`/api/v1/linked-items/account/${accountId}`);
    if (linkedItemsResponse.ok) {
      const linkedItemsData = await linkedItemsResponse.json();
      const linkedItems = linkedItemsData.data || linkedItemsData || [];

      if (linkedItems.length > 0) {
        // הצגת מודול פריטים מקושרים
        if (typeof window.showLinkedItemsModal === 'function') {
          window.showLinkedItemsModal(linkedItems, 'account', accountId);
        } else {
          showErrorMessage('לא ניתן להציג פריטים מקושרים - פונקציה לא זמינה');
        }
        return;
      }
    }

    // אם אין פריטים מקושרים, המשך לביטול
    await cancelAccount(accountId, accountName);
  } catch (error) {
    handleSystemError(error, 'בדיקת פריטים מקושרים לביטול חשבון');
    showErrorMessage('שגיאה בבדיקת פריטים מקושרים');
  }
}

/**
 * מחיקת חשבון עם בדיקת פריטים מקושרים
 * @param {number} accountId - מזהה החשבון
 * @param {string} accountName - שם החשבון
 */
async function deleteAccountWithLinkedItemsCheck(accountId, accountName) {
  try {
    // בדיקת פריטים מקושרים
    const linkedItemsResponse = await fetch(`/api/v1/linked-items/account/${accountId}`);
    if (linkedItemsResponse.ok) {
      const linkedItemsData = await linkedItemsResponse.json();
      const linkedItems = linkedItemsData.data || linkedItemsData || [];

      if (linkedItems.length > 0) {
        // הצגת מודול פריטים מקושרים
        if (typeof window.showLinkedItemsModal === 'function') {
          window.showLinkedItemsModal(linkedItems, 'account', accountId);
        } else {
          showErrorMessage('לא ניתן להציג פריטים מקושרים - פונקציה לא זמינה');
        }
        return;
      }
    }

    // אם אין פריטים מקושרים, המשך למחיקה
    await deleteAccount(accountId, accountName);
  } catch (error) {
    handleSystemError(error, 'בדיקת פריטים מקושרים למחיקת חשבון');
    showErrorMessage('שגיאה בבדיקת פריטים מקושרים');
  }
}

/**
 * החזרת חשבון מבוטל לסטטוס סגור
 * @param {number} accountId - מזהה החשבון
 * @param {string} accountName - שם החשבון
 */
async function restoreAccount(accountId, accountName) {
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
    if (!confirm(`האם אתה בטוח שברצונך להחזיר את החשבון "${accountName}" לסטטוס סגור?`)) {
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
    } else {
      const data = await response.json();
      showErrorMessage(data.message || 'שגיאה בהחזרת חשבון');
    }
  } catch (error) {
    handleSystemError(error, 'החזרת חשבון');
    showErrorMessage('שגיאה בהחזרת חשבון');
  }
}

