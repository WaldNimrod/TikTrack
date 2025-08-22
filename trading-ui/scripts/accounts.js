/* ===== מערכת ניהול חשבונות ===== */
/*
 * קובץ זה מכיל את כל הפונקציות הקשורות לניהול חשבונות
 * כולל טעינת נתונים, עדכון טבלאות, מודלים ופעולות CRUD
 * 
 * הערה חשובה: פונקציות פילטר כלליות (updateAccountFilterMenu, updateAccountFilterText)
 * הועברו לקובץ grid-filters.js כדי להיות משותפות לכל הדפים
 * 
 * תכולת הקובץ:
 * - loadAccountsFromServer: טעינת חשבונות מהשרת
 * - updateAccountsTable: עדכון טבלת חשבונות
 * - showAddAccountModal: הצגת מודל הוספת חשבון
 * - createAccount: יצירת חשבון חדש
 * - updateAccountFromModal: עדכון חשבון קיים
 * - deleteAccount: מחיקת חשבון
 * - getAccounts, isAccountsLoaded: פונקציות עזר ספציפיות לחשבונות
 * 
 * שימוש: נטען בדפים שצריכים ניהול חשבונות
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
  console.log('🔄 === Loading currencies from server ===');

  try {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('http://127.0.0.1:8080/api/v1/currencies/', {
      method: 'GET',
      headers: headers
    });

    console.log('🔄 Currencies response status:', response.status);

    if (response.ok) {
      const responseData = await response.json();
      console.log('🔄 Currencies response from server:', responseData);

      const currencies = responseData.data || responseData;
      window.currenciesData = currencies;
      window.currenciesLoaded = true;
      console.log('🔄 Currencies loaded from server:', currencies.length, 'currencies');
      console.log('🔄 Currencies details:', currencies);
    } else {
      console.log('🔄 Error loading currencies from server, status:', response.status);
      const errorText = await response.text();
      console.log('🔄 Error response:', errorText);
      // טעינת מטבעות ברירת מחדל
      window.currenciesData = [
        { id: 1, symbol: 'USD', name: 'US Dollar', usd_rate: '1.000000' }
      ];
      window.currenciesLoaded = true;
    }

  } catch (error) {
    console.log('🔄 Error loading currencies from server:', error);
    // טעינת מטבעות ברירת מחדל
    window.currenciesData = [
      { id: 1, symbol: 'USD', name: 'US Dollar', usd_rate: '1.000000' }
    ];
    window.currenciesLoaded = true;
  }
}

// פונקציה עזר להצגת מטבע
function getCurrencyDisplay(account) {
  if (account.currency && account.currency.symbol) {
    // אם יש פרטי מטבע מלאים
    const symbol = account.currency.symbol;
    switch (symbol) {
      case 'USD': return '$';
      case 'ILS': return '₪';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return symbol;
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
  } else if (account.currency) {
    // fallback למטבע הישן
    switch (account.currency) {
      case 'USD': return '$';
      case 'ILS': return '₪';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return account.currency;
    }
  }
  return '-';
}

// פונקציה ליצירת אפשרויות מטבע בטופס
function generateCurrencyOptions(account = null) {
  if (!window.currenciesData || window.currenciesData.length === 0) {
    // אם אין מטבעות, נחזיר ברירת מחדל
    return `
      <option value="1" ${account && (account.currency_id === 1 || (account.currency && account.currency.symbol === 'USD')) ? 'selected' : ''}>דולר אמריקאי (USD)</option>
    `;
  }

  return window.currenciesData.map(currency => {
    const isSelected = account && (
      account.currency_id === currency.id ||
      (account.currency && account.currency.symbol === currency.symbol) ||
      (account.currency === currency.symbol)
    );

    return `<option value="${currency.id}" ${isSelected ? 'selected' : ''}>${currency.name} (${currency.symbol})</option>`;
  }).join('');
}

// פונקציה לטעינת חשבונות מהשרת
async function loadAccountsFromServer() {
  console.log('🔄 === Loading accounts from server ===');

  try {
    // בדיקה אם יש token שמור
    const token = localStorage.getItem('authToken');
    console.log('🔄 Token found:', !!token);

    if (!token) {
      console.log('🔄 No auth token found, trying without token...');
      // נסיון לטעון ללא token
    }

    console.log('🔄 Fetching accounts from server...');
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('http://127.0.0.1:8080/api/v1/accounts/', {
      method: 'GET',
      headers: headers
    });

    console.log('🔄 Response status:', response.status);

    if (response.ok) {
      const responseData = await response.json();
      console.log('🔄 Raw response from server:', responseData);

      // טיפול במבנה התשובה - יכול להיות ישירות מערך או בתוך data
      const allAccounts = responseData.data || responseData;
      console.log('🔄 All accounts from server:', allAccounts);

      // סינון רק חשבונות בסטטוס open
      const openAccounts = allAccounts.filter(account => account.status === 'open');
      window.accountsData = openAccounts;
      window.accountsLoaded = true;
      console.log('🔄 All accounts loaded from server:', allAccounts.length, 'accounts');
      console.log('🔄 Open accounts filtered:', openAccounts.length, 'accounts');
      console.log('🔄 Open accounts details:', openAccounts);

      // קריאה לעדכון התפריט
      if (typeof window.updateAccountFilterMenu === 'function') {
        window.updateAccountFilterMenu(openAccounts);
      } else {
        console.log('🔄 updateAccountFilterMenu not available yet');
      }
    } else {
      console.log('🔄 Error loading accounts from server, status:', response.status);
      const errorText = await response.text();
      console.log('🔄 Error response:', errorText);
      loadDefaultAccounts();
    }

  } catch (error) {
    console.log('🔄 Error loading accounts from server:', error);
    loadDefaultAccounts();
  }
}

// פונקציה לטעינת כל החשבונות מהשרת (לפילטר)
async function loadAllAccountsFromServer() {
  console.log('🔄 === Loading all accounts from server ===');

  try {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('http://127.0.0.1:8080/api/v1/accounts/', {
      method: 'GET',
      headers: headers
    });

    if (response.ok) {
      const responseData = await response.json();
      const allAccounts = responseData.data || responseData;
      console.log('🔄 All accounts loaded for filter:', allAccounts.length, 'accounts');

      // סינון רק חשבונות בסטטוס open
      const openAccounts = allAccounts.filter(account => account.status === 'open');
      console.log('🔄 Open accounts filtered:', openAccounts.length, 'accounts');

      // שמירת החשבונות הפתוחים במשתנה גלובלי
      window.allAccountsData = openAccounts;

      // עדכון הפילטר עם החשבונות הפתוחים (אם הפונקציה קיימת)
      if (typeof window.updateAccountFilterMenu === 'function') {
        window.updateAccountFilterMenu(openAccounts);
      } else {
        console.log('🔄 updateAccountFilterMenu not available yet, trying direct update...');
        // ניסיון לעדכן ישירות
        if (typeof window.updateAccountFilterMenuDirectly === 'function') {
          window.updateAccountFilterMenuDirectly(openAccounts);
        } else {
          console.log('🔄 updateAccountFilterMenuDirectly not available either');
        }
      }
      return openAccounts;
    } else {
      console.log('🔄 Error loading all accounts from server, status:', response.status);
      return [];
    }

  } catch (error) {
    console.log('🔄 Error loading all accounts from server:', error);
    return [];
  }
}

// פונקציה לטעינת חשבונות ברירת מחדל
function loadDefaultAccounts() {
  console.log('🔄 Loading default accounts - no dummy data');
  window.accountsData = [];
  window.accountsLoaded = true;
  if (typeof window.updateAccountFilterMenu === 'function') {
    window.updateAccountFilterMenu(window.accountsData);
  }
}

// הפונקציות הכלליות לפילטר חשבונות הועברו ל-grid-filters.js

// פונקציה לקבלת חשבונות נטענים
function getAccounts() {
  return window.accountsData || [];
}

// פונקציה לבדיקה אם החשבונות נטענו
function isAccountsLoaded() {
  return window.accountsLoaded || false;
}

// פונקציה לטעינת נתוני חשבונות מהשרת
async function loadAccountsData() {
  try {
    console.log('🔄 טוען נתוני חשבונות מהשרת...');

    // בדיקה אם יש פונקציה apiCall זמינה
    if (typeof window.apiCall === 'function') {
      const response = await window.apiCall('/api/v1/accounts/');
      const accounts = response.data || response;
      console.log('📊 חשבונות שהתקבלו:', accounts);
      return accounts;
    } else {
      // קריאה ישירה ל-API
      const response = await fetch('/api/v1/accounts/');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const accounts = result.data || result;
      console.log('📊 חשבונות שהתקבלו:', accounts);
      return accounts;
    }
  } catch (error) {
    console.error('❌ שגיאה בטעינת נתוני חשבונות:', error);
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
    console.error('❌ Invalid accounts parameter:', accounts);
    return;
  }

  console.log('🔄 מעדכן טבלת חשבונות עם', accounts.length, 'חשבונות');

  // בדיקה שהפונקציות הנדרשות קיימות
  if (!window.convertAccountStatusToHebrew) {
    console.warn('⚠️ convertAccountStatusToHebrew function not found, using fallback');
  }
  if (!window.formatCurrency) {
    console.warn('⚠️ formatCurrency function not found, using fallback');
  }

  const tbody = document.querySelector('#accountsTable tbody');
  if (!tbody) {
    console.error('❌ לא נמצא tbody לטבלת חשבונות');
    throw new Error('טבלת החשבונות לא נמצאה בדף');
  }

  tbody.innerHTML = accounts.map(account => `
    <tr>
      <td>${account.name || '-'}</td>
      <td>${getCurrencyDisplay(account)}</td>
      <td>${window.convertAccountStatusToHebrew ? window.convertAccountStatusToHebrew(account.status) : (account.status || '-')}</td>
      <td>${window.formatCurrency ? window.formatCurrency(account.cash_balance) : (account.cash_balance || '-')}</td>
      <td>${window.formatCurrency ? window.formatCurrency(account.total_value) : (account.total_value || '-')}</td>
      <td>${window.formatCurrency ? window.formatCurrency(account.total_pl) : (account.total_pl || '-')}</td>
      <td>${account.notes || '-'}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="showEditAccountModalLocal(${JSON.stringify(account).replace(/"/g, '&quot;')})" title="ערוך">✏️</button>
        <button class="btn btn-sm btn-secondary" onclick="cancelAccount(${account.id}, '${account.name}')" title="ביטול">X</button>
        <button class="btn btn-sm btn-danger" onclick="deleteAccount(${account.id}, '${account.name}')" title="מחק">🗑️</button>
      </td>
    </tr>
  `).join('');

  // עדכון ספירת רשומות
  const countElement = document.getElementById('accountsCount');
  if (countElement) {
    countElement.textContent = `${accounts.length} חשבונות`;
  }

  // הצגת הטבלה אם היא מוסתרת
  const section = document.getElementById('accountsSection');
  const container = document.getElementById('accountsContainer');
  const footer = document.querySelector('#accountsSection .table-footer');
  const icon = document.querySelector('#accountsSection .filter-icon');

  if (section && section.classList.contains('collapsed')) {
    section.classList.remove('collapsed');
    if (container) container.style.display = 'block';
    if (footer) footer.style.display = 'block';
    if (icon) icon.textContent = '▲';
    localStorage.setItem('accountsSectionOpen', 'true');
  }

  console.log('✅ טבלת חשבונות עודכנה בהצלחה');
}

/**
 * פונקציה לטעינת חשבונות - מתאימה לעבוד עם designs.html
 * הפונקציה טוענת נתונים ומעדכנת את הטבלה
 */
async function loadAccounts() {
  try {
    console.log('🔄 טוען חשבונות...');

    // קריאה לפונקציה מ-accounts.js
    if (typeof window.loadAccountsDataFromAPI === 'function') {
      const accounts = await window.loadAccountsDataFromAPI();
      updateAccountsTableInDesigns(accounts);
    } else {
      const accounts = await loadAccountsData();
      updateAccountsTableInDesigns(accounts);
    }

  } catch (error) {
    console.error('❌ שגיאה בטעינת חשבונות:', error);
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
function updateAccountsTableInDesigns(accounts) {
  console.log('🔄 מעדכן טבלת חשבונות ב-designs.html עם', accounts.length, 'חשבונות');

  // מציאת הטבלה השנייה (חשבונות) בדף designs.html
  const contentSections = document.querySelectorAll('.content-section');
  const accountsSection = contentSections[1]; // הטבלה השנייה

  if (!accountsSection) {
    console.error('❌ לא נמצאה טבלת חשבונות בדף designs.html');
    return;
  }

  const tbody = accountsSection.querySelector('tbody');
  if (!tbody) {
    console.error('❌ לא נמצא tbody לטבלת חשבונות');
    return;
  }

  tbody.innerHTML = accounts.map(account => `
    <tr>
      <td>${account.name || '-'}</td>
      <td>${getCurrencyDisplay(account)}</td>
      <td>${window.convertAccountStatusToHebrew ? window.convertAccountStatusToHebrew(account.status) : (account.status || '-')}</td>
      <td>${window.formatCurrency ? window.formatCurrency(account.cash_balance) : (account.cash_balance || '-')}</td>
      <td>${window.formatCurrency ? window.formatCurrency(account.total_value) : (account.total_value || '-')}</td>
      <td>${window.formatCurrency ? window.formatCurrency(account.total_pl) : (account.total_pl || '-')}</td>
      <td>${account.notes || '-'}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="showEditAccountModal(${JSON.stringify(account).replace(/"/g, '&quot;')})" title="ערוך">✏️</button>
        <button class="btn btn-sm btn-secondary" onclick="cancelAccount(${account.id}, '${account.name}')" title="ביטול">X</button>
        <button class="btn btn-sm btn-danger" onclick="deleteAccount(${account.id}, '${account.name}')" title="מחק">🗑️</button>
      </td>
    </tr>
  `).join('');

  // עדכון ספירת רשומות
  const countElement = accountsSection.querySelector('.table-count');
  if (countElement) {
    countElement.textContent = `${accounts.length} חשבונות`;
  }

  console.log('✅ טבלת חשבונות ב-designs.html עודכנה בהצלחה');
}

// פונקציה לעדכון טקסט פילטר החשבונות
function updateAccountFilterText() {
  console.log('🔄 updateAccountFilterText called');

  const appHeader = document.querySelector('app-header');
  if (!appHeader || !appHeader.shadowRoot) {
    console.log('🔄 App header or shadow root not found in updateAccountFilterText');
    return;
  }

  const accountMenu = appHeader.shadowRoot.getElementById('accountFilterMenu');
  if (!accountMenu) {
    console.log('🔄 Account menu not found in updateAccountFilterText');
    return;
  }

  const accountToggle = appHeader.shadowRoot.getElementById('accountFilterToggle');
  if (!accountToggle) {
    console.log('🔄 Account toggle not found in updateAccountFilterText');
    return;
  }

  const selectedText = accountToggle.querySelector('.selected-account-text');
  if (!selectedText) {
    console.log('🔄 Selected account text element not found in updateAccountFilterText');
    return;
  }

  // קבלת החשבונות הנבחרים
  const selectedAccounts = window.selectedAccountsForFilter || [];
  console.log('🔄 Selected account values for text update:', selectedAccounts);

  if (selectedAccounts.length === 0) {
    selectedText.textContent = 'כל החשבונות';
  } else if (selectedAccounts.length === 1) {
    selectedText.textContent = selectedAccounts[0];
  } else {
    selectedText.textContent = `${selectedAccounts.length} נבחרו`;
  }

  console.log('🔄 Updated account filter text to:', selectedText.textContent);
}

// ייצוא הפונקציות לשימוש גלובלי
window.loadAccountsFromServer = loadAccountsFromServer;
window.loadAllAccountsFromServer = loadAllAccountsFromServer;
window.loadDefaultAccounts = loadDefaultAccounts;
// הערה: updateAccountFilterMenu מיוצאת מ-grid-filters.js
window.updateAccountFilterText = updateAccountFilterText;
window.getAccounts = getAccounts;
window.isAccountsLoaded = isAccountsLoaded;
window.loadAccountsData = loadAccountsData;
window.updateAccountsTable = updateAccountsTable;
window.loadAccounts = loadAccounts;
window.updateAccountsTableInDesigns = updateAccountsTableInDesigns;

// פונקציה גלובלית לעדכון ידני של תפריט החשבונות
window.refreshAccountFilterMenu = function () {
  console.log('🔄 Manual refresh of account filter menu called');
  if (window.accountsData && window.accountsData.length > 0) {
    console.log('🔄 Using existing accounts data:', window.accountsData);
    if (typeof window.updateAccountFilterMenu === 'function') {
      window.updateAccountFilterMenu(window.accountsData);
    } else {
      console.log('🔄 updateAccountFilterMenu not available yet');
    }
  } else {
    console.log('🔄 No accounts data, loading from server...');
    loadAccountsFromServer();
  }
};

// פונקציה לבדיקת מצב החשבונות
window.checkAccountsStatus = function () {
  console.log('🔄 === ACCOUNTS STATUS CHECK ===');
  console.log('🔄 accountsData:', window.accountsData);
  console.log('🔄 accountsLoaded:', window.accountsLoaded);
  console.log('🔄 loadAccountsFromServer function:', typeof window.loadAccountsFromServer);
  console.log('🔄 updateAccountFilterMenu function moved to grid-filters.js');

  const appHeader = document.querySelector('app-header');
  if (appHeader) {
    const accountMenu = appHeader.shadowRoot.getElementById('accountFilterMenu');
    if (accountMenu) {
      const items = accountMenu.querySelectorAll('.account-filter-item');
      console.log('🔄 Account menu items count:', items.length);
      items.forEach((item, index) => {
        const accountName = item.getAttribute('data-account');
        console.log(`🔄 Item ${index + 1}: ${accountName}`);
      });
    } else {
      console.log('🔄 Account menu not found in shadow DOM');
    }
  } else {
    console.log('🔄 App header not found');
  }
  console.log('🔄 === END ACCOUNTS STATUS CHECK ===');
};

// פונקציה זמנית לעדכון תפריט החשבונות
window.updateAccountFilterMenuDirectly = function (accounts) {
  console.log('🔄 === UPDATE ACCOUNT FILTER MENU DIRECTLY ===');
  console.log('🔄 Accounts received:', accounts);

  // חיפוש התפריט בתוך האפ-הדר (Shadow DOM)
  const appHeader = document.querySelector('app-header');
  if (!appHeader || !appHeader.shadowRoot) {
    console.log('🔄 App header or shadow root not found, skipping account menu update');
    return;
  }

  const accountMenu = appHeader.shadowRoot.getElementById('accountFilterMenu');
  if (!accountMenu) {
    console.log('🔄 Account filter menu not found in app header shadow root');
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

  console.log(`🔄 Account filter menu updated with ${accounts ? accounts.length : 0} accounts`);
};

// פונקציה גלובלית לבדיקה מהירה
window.debugAccountsFilter = function () {
  console.log('🔄 === DEBUG ACCOUNTS FILTER ===');

  // בדיקת מצב החשבונות
  window.checkAccountsStatus();

  // בדיקה מהירה של השרת
  fetch('http://127.0.0.1:8080/api/v1/accounts/')
    .then(response => {
      console.log('🔄 Server response status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('🔄 Server data:', data);
      const accounts = data.data || data;
      const openAccounts = accounts.filter(acc => acc.status === 'open');
      console.log('🔄 Open accounts from server:', openAccounts);

      // ניסיון לעדכן תפריט ישירות
      if (typeof window.updateAccountFilterMenu === 'function') {
        console.log('🔄 Direct menu update with open accounts');
        window.updateAccountFilterMenu(openAccounts);
      } else {
        console.log('🔄 updateAccountFilterMenu not available');
      }
    })
    .catch(error => {
      console.log('🔄 Server error:', error);
    });

  // ניסיון לטעון חשבונות
  if (typeof window.loadAllAccountsFromServer === 'function') {
    console.log('🔄 Attempting to load all accounts...');
    window.loadAllAccountsFromServer().then((accounts) => {
      console.log('🔄 All accounts loaded successfully:', accounts);
      window.checkAccountsStatus();
    }).catch((error) => {
      console.log('🔄 Error loading accounts:', error);
    });
  }

  // ניסיון לעדכן תפריט
  setTimeout(() => {
    if (typeof window.refreshAccountFilterMenu === 'function') {
      console.log('🔄 Attempting to refresh menu...');
      window.refreshAccountFilterMenu();
      setTimeout(() => {
        window.checkAccountsStatus();
      }, 500);
    }
  }, 1000);

  console.log('🔄 === END DEBUG ACCOUNTS FILTER ===');
};

console.log('✅ קובץ accounts.js נטען בהצלחה - פונקציות זמינות גלובלית');

// טעינת מטבעות בתחילת הטעינה
if (typeof loadCurrenciesFromServer === 'function') {
  loadCurrenciesFromServer();
}

// בדיקה שהפונקציות מיוצאות כראוי
console.log('🔄 בדיקת ייצוא פונקציות:');
console.log('- showEditAccountModalById:', typeof window.showEditAccountModalById);
console.log('- showEditAccountModal:', typeof window.showEditAccountModal);
console.log('- showAddAccountModal:', typeof window.showAddAccountModal);

// ===== פונקציות נוספות לניהול חשבונות =====

/**
 * הצגת מודל הוספת חשבון
 */
function showAddAccountModal() {
  console.log('🔄 הצגת מודל הוספת חשבון');

  // בדיקה אם יש מודל קיים בדף
  const modalElement = document.getElementById('accountModal');
  if (modalElement) {
    // איפוס הטופס
    const form = document.getElementById('accountForm');
    if (form) {
      form.reset();
    }

    // הצגת המודל
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  } else {
    // יצירת המודל דינמית
    const modal = createAccountModal('add');
    document.body.appendChild(modal);

    // הצגת המודל
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
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

  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
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
                         value="${account ? account.name : ''}" placeholder="הכנס שם חשבון" maxlength="18">
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
                    <option value="cancelled" ${account && account.status === 'cancelled' ? 'selected' : ''}>מבוטל</option>
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

      if (value.length > 18) {
        this.classList.add('is-invalid');
        errorElement.textContent = 'שם החשבון לא יכול לעלות על 18 תווים';
      } else if (value === '') {
        this.classList.add('is-invalid');
        errorElement.textContent = 'שם החשבון הוא שדה חובה';
      } else {
        this.classList.remove('is-invalid');
        errorElement.textContent = '';
      }
    });

    // בדיקת מטבע
    currencySelect.addEventListener('change', function () {
      const errorElement = modal.querySelector('#currencyError');

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

      if (this.value !== '' && (isNaN(value) || value < 0)) {
        this.classList.add('is-invalid');
        errorElement.textContent = 'יתרת מזומן חייבת להיות מספר חיובי';
      } else {
        this.classList.remove('is-invalid');
        errorElement.textContent = '';
      }
    });
  }, 100);

  return modal;
}

/**
 * בדיקת תקינות נתוני חשבון
 * @param {Object} accountData - נתוני החשבון
 * @returns {Object} - תוצאה עם isValid ו-message
 */
function validateAccountData(accountData) {
  // בדיקת שם החשבון
  if (!accountData.name || accountData.name.trim() === '') {
    return { isValid: false, message: 'שם החשבון הוא שדה חובה' };
  }

  if (accountData.name.length > 18) {
    return { isValid: false, message: 'שם החשבון לא יכול לעלות על 18 תווים' };
  }

  // בדיקת מטבע
  if (!accountData.currency_id || accountData.currency_id === '') {
    return { isValid: false, message: 'יש לבחור מטבע' };
  }

  // בדיקת יתרת מזומן
  const cashBalance = accountData.cash_balance;
  if (cashBalance !== null && cashBalance !== undefined && cashBalance !== '') {
    if (isNaN(cashBalance) || cashBalance < 0) {
      return { isValid: false, message: 'יתרת מזומן חייבת להיות מספר חיובי' };
    }
  }

  return { isValid: true, message: '' };
}

/**
 * הצגת הודעת שגיאה בטופס
 * @param {string} message - הודעת השגיאה
 */
function showFormError(message) {
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, 'error');
  } else {
    alert(message);
  }
}

/**
 * פונקציה לשמירת חשבון
 * @param {string} mode - 'add' או 'edit'
 * @param {number} accountId - מזהה החשבון (רק במצב edit)
 */
async function saveAccount(mode, accountId = null) {
  try {
    console.log('🔄 שמירת חשבון:', mode, accountId);

    // איסוף נתונים מהטופס
    const form = document.getElementById('accountForm');
    const formData = new FormData(form);

    const accountData = {
      name: formData.get('name'),
      currency_id: parseInt(formData.get('currency_id')),
      status: formData.get('status'),
      cash_balance: parseFloat(formData.get('cash_balance')) || 0,
      notes: formData.get('notes')
    };

    console.log('🔄 נתוני חשבון:', accountData);

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
      if (typeof window.showNotification === 'function') {
        window.showNotification(message, 'success');
      } else {
        alert(message);
      }

    } catch (refreshError) {
      console.error('❌ שגיאה ברענון הטבלה:', refreshError);
      // אם יש שגיאה ברענון, לא סוגרים את המודל ומציגים הודעת שגיאה
      if (typeof window.showNotification === 'function') {
        window.showNotification('החשבון נשמר אך יש בעיה בעדכון הטבלה. אנא רענן את הדף.', 'warning');
      } else {
        alert('החשבון נשמר אך יש בעיה בעדכון הטבלה. אנא רענן את הדף.');
      }
    }

  } catch (error) {
    console.error('❌ שגיאה בשמירת חשבון:', error);
    if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בשמירת החשבון', 'error');
    } else {
      alert('שגיאה בשמירת החשבון');
    }
  }
}

/**
 * הוספת חשבון ל-API
 * @param {Object} accountData - נתוני החשבון
 */
async function addAccountToAPI(accountData) {
  try {
    console.log('🔄 הוספת חשבון ל-API:', accountData);

    const response = await fetch('/api/v1/accounts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(accountData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('🔄 חשבון נוסף בהצלחה:', result);
    return result;

  } catch (error) {
    console.error('❌ שגיאה בהוספת חשבון:', error);
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
    console.log('🔄 עדכון חשבון ב-API:', accountId, accountData);

    const response = await fetch(`/api/v1/accounts/${accountId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(accountData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('🔄 חשבון עודכן בהצלחה:', result);
    return result;

  } catch (error) {
    console.error('❌ שגיאה בעדכון חשבון:', error);
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
  console.log('🔄 הצגת מודל עריכת חשבון לפי ID:', accountId);

  // בדיקה שהפרמטר תקין
  if (!accountId) {
    console.error('❌ Invalid account ID:', accountId);
    alert('מזהה חשבון לא תקין');
    return;
  }

  try {
    console.log('🔄 טוען נתוני חשבון מהשרת...');
    // טעינת נתוני החשבון מהשרת
    const response = await fetch(`/api/v1/accounts/${accountId}`);
    console.log('🔄 תגובת השרת:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('🔄 נתונים שהתקבלו:', result);
    const account = result.data || result;

    if (!account) {
      throw new Error('חשבון לא נמצא');
    }

    console.log('🔄 חשבון שנטען:', account);

    // הצגת המודל עם הנתונים
    showEditAccountModal(account);

  } catch (error) {
    console.error('❌ Error loading account data:', error);
    if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בטעינת נתוני החשבון: ' + error.message, 'error');
    } else {
      alert('שגיאה בטעינת נתוני החשבון: ' + error.message);
    }
  }
}

function showEditAccountModal(account) {
  console.log('🔄 הצגת מודל עריכת חשבון:', account);

  // בדיקה שהפרמטר תקין
  if (!account || typeof account !== 'object') {
    console.error('❌ Invalid account parameter:', account);
    if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בפתיחת מודל העריכה', 'error');
    } else {
      alert('שגיאה בפתיחת מודל העריכה');
    }
    return;
  }

  // יצירת המודל דינמית
  console.log('🔄 יוצר מודל דינמית...');
  const modal = createAccountModal('edit', account);
  document.body.appendChild(modal);

  // הצגת המודל
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();
  console.log('✅ מודל דינמי הוצג בהצלחה');
}

/**
 * יצירת חשבון חדש
 */
async function createAccount() {
  console.log('🔄 יצירת חשבון חדש');

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
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        currency: currency,
        status: status,
        cash_balance: cashBalance,
        total_value: totalValue,
        total_pl: totalPl,
        notes: notes
      })
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
    console.error('שגיאה ביצירת חשבון:', error);
    showErrorMessage('שגיאה ביצירת חשבון');
  }
}

/**
 * עדכון חשבון קיים
 */
async function updateAccountFromModal() {
  console.log('🔄 עדכון חשבון');

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
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        currency: currency,
        status: status,
        cash_balance: cashBalance,
        total_value: totalValue,
        total_pl: totalPl,
        notes: notes
      })
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
    console.error('שגיאה בעדכון חשבון:', error);
    showErrorMessage('שגיאה בעדכון חשבון');
  }
}

/**
 * טעינת נתוני חשבונות מ-API
 * @returns {Promise<Array>} מערך של חשבונות
 */
async function loadAccountsDataFromAPI() {
  try {
    console.log('🔄 קורא נתוני חשבונות מ-API...');
    const response = await fetch('/api/v1/accounts/');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('🔄 נתונים נטענו מ-API:', result);

    // בדיקה אם התוצאה מכילה מערך נתונים
    if (result.data && Array.isArray(result.data)) {
      console.log('🔄 מערך נתונים נמצא:', result.data.length, 'חשבונות');
      return result.data;
    } else if (Array.isArray(result)) {
      console.log('🔄 מערך ישיר נמצא:', result.length, 'חשבונות');
      return result;
    } else {
      console.error('❌ מבנה נתונים לא צפוי:', result);
      throw new Error('מבנה נתונים לא צפוי מה-API');
    }

  } catch (error) {
    console.error('❌ שגיאה בקריאה ל-API:', error);
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
    console.log('🔄 מוחק חשבון מ-API:', accountId, accountName);

    const response = await fetch(`/api/v1/accounts/${accountId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      console.log('🔄 חשבון נמחק בהצלחה');

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
    console.error('❌ שגיאה במחיקת חשבון:', error);
    showErrorMessage('שגיאה במחיקת החשבון');
  }
}

/**
 * ביטול חשבון (שינוי סטטוס למבוטל)
 * @param {number} accountId - מזהה החשבון
 * @param {string} accountName - שם החשבון
 */
async function cancelAccount(accountId, accountName) {
  console.log('🔄 ביטול חשבון:', accountId, accountName);

  // בדיקה ראשונה
  if (!confirm(`האם אתה בטוח שברצונך לבטל את החשבון "${accountName}"?`)) {
    return;
  }

  // בדיקה שנייה
  if (!confirm(`הסטטוס ישתנה ל"מבוטל". האם אתה בטוח שברצונך להמשיך בביטול החשבון "${accountName}"?`)) {
    return;
  }

  try {
    // בדיקה אם יש טריידים פתוחים
    const tradesResponse = await fetch(`/api/v1/trades/?account_id=${accountId}&status=open`);
    if (tradesResponse.ok) {
      const tradesData = await tradesResponse.json();
      const openTrades = tradesData.data || tradesData || [];

      if (openTrades.length > 0) {
        console.log(`⚠️ נמצאו ${openTrades.length} טריידים פתוחים לחשבון ${accountName}`);
        await showOpenTradesWarning(accountName, openTrades, 'cancel');
        return;
      }
    }

    const response = await fetch(`/api/v1/accounts/${accountId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'cancelled'
      })
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
    console.error('שגיאה בביטול חשבון:', error);
    showErrorMessage('שגיאה בביטול חשבון');
  }
}

/**
 * מחיקת חשבון
 * @param {number} accountId - מזהה החשבון
 * @param {string} accountName - שם החשבון
 */
async function deleteAccount(accountId, accountName) {
  console.log('🔄 מחיקת חשבון:', accountId, accountName);

  // בדיקה ראשונה
  if (!confirm(`האם אתה בטוח שברצונך למחוק את החשבון "${accountName}"?`)) {
    return;
  }

  // בדיקה שנייה
  if (!confirm(`פעולה זו אינה הפיכה. האם אתה בטוח שברצונך להמשיך במחיקת החשבון "${accountName}"?`)) {
    return;
  }

  try {
    const response = await fetch(`/api/v1/accounts/${accountId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
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
    console.error('שגיאה במחיקת חשבון:', error);
    showErrorMessage('שגיאה במחיקת חשבון');
  }
}

/**
 * הצגת הודעת הצלחה
 * @param {string} message - הודעת ההצלחה
 */
function showSuccessMessage(message) {
  console.log('✅ הצלחה:', message);
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, 'success');
  } else {
    alert(message);
  }
}

/**
 * הצגת הודעת שגיאה
 * @param {string} message - הודעת השגיאה
 */
function showErrorMessage(message) {
  console.log('❌ שגיאה:', message);
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, 'error');
  } else {
    alert(message);
  }
}

// פונקציות עזר חסרות
function showSecondConfirmationModal(message, onConfirm) {
  if (confirm(message)) {
    onConfirm();
  }
}

function confirmDeleteAccount(accountId, accountName) {
  deleteAccount(accountId, accountName);
}

function checkLinkedItems(accountId) {
  // פונקציה פשוטה לבדיקת פריטים מקושרים
  return Promise.resolve({ hasLinkedItems: false, items: [] });
}

function showOpenTradesWarning(accountId, accountName) {
  alert(`יש עסקאות פתוחות בחשבון "${accountName}". לא ניתן למחוק חשבון עם עסקאות פעילות.`);
}

function createWarningModal(message) {
  alert(message);
}

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
window.checkLinkedItems = checkLinkedItems;
window.showOpenTradesWarning = showOpenTradesWarning;
window.createWarningModal = createWarningModal;
window.deleteAccountFromAPI = deleteAccountFromAPI;
window.loadAccountsDataFromAPI = loadAccountsDataFromAPI;
window.addAccountToAPI = addAccountToAPI;
window.updateAccountInAPI = updateAccountInAPI;
window.createAccountModal = createAccountModal;
window.saveAccount = saveAccount;
window.validateAccountData = validateAccountData;
window.showFormError = showFormError;

// הגדרת הפונקציה updateGridFromComponent לדף החשבונות
// וידוא שהפונקציה מוגדרת רק בדף החשבונות
if (window.location.pathname.includes('/accounts')) {
  window.updateGridFromComponent = function (selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
    console.log('🔄 === UPDATE GRID FROM COMPONENT (accounts) ===');
    console.log('🔄 Parameters:', { selectedStatuses, selectedTypes, selectedDateRange, searchTerm });

    // שמירת הפילטרים במשתנים גלובליים
    window.selectedStatusesForFilter = selectedStatuses || [];
    window.selectedTypesForFilter = selectedTypes || [];
    window.selectedDateRangeForFilter = selectedDateRange || null;
    window.searchTermForFilter = searchTerm || '';

    // חילוץ תאריכי התחלה וסיום מטווח התאריכים
    let startDate = 'לא נבחר';
    let endDate = 'לא נבחר';

    if (selectedDateRange && selectedDateRange !== 'כל זמן') {
      console.log('🔄 Translating date range:', selectedDateRange);
      // תרגום טווח התאריכים לתאריכים אמיתיים
      const dateRange = window.translateDateRangeToDates(selectedDateRange);
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
      console.log('🔄 Translation result:', { startDate, endDate });
    }

    window.selectedStartDateForFilter = startDate;
    window.selectedEndDateForFilter = endDate;

    console.log('🔄 Filters saved for accounts page:', {
      selectedStatusesForFilter: window.selectedStatusesForFilter,
      selectedTypesForFilter: window.selectedTypesForFilter,
      selectedDateRangeForFilter: window.selectedDateRangeForFilter,
      selectedStartDateForFilter: window.selectedStartDateForFilter,
      selectedEndDateForFilter: window.selectedEndDateForFilter,
      searchTermForFilter: window.searchTermForFilter
    });

    // קריאה ישירה לפונקציה המקומית
    console.log('🔄 Calling loadAccountsDataForAccountsPage directly for accounts page');
    if (typeof window.loadAccountsDataForAccountsPage === 'function') {
      window.loadAccountsDataForAccountsPage();
    } else {
      console.error('❌ loadAccountsDataForAccountsPage function not found');
    }
  };
}

/**
 * פונקציה לטעינת נתוני חשבונות ועדכון הטבלה בדף החשבונות
 * פונקציה זו מיועדת לדף החשבונות (accounts.html)
 */
async function loadAccountsDataForAccountsPage() {
  try {
    console.log('🔄 === LOADING ACCOUNTS DATA FOR ACCOUNTS PAGE ===');

    // טעינת נתונים מהשרת
    let accounts;
    if (typeof window.loadAccountsDataFromAPI === 'function') {
      accounts = await window.loadAccountsDataFromAPI();
    } else {
      accounts = await loadAccountsData();
    }

    // בדיקה שהנתונים תקינים
    if (!accounts || !Array.isArray(accounts)) {
      console.error('❌ Invalid accounts data received:', accounts);
      throw new Error('נתונים לא תקינים התקבלו מהשרת');
    }

    console.log('🔄 Accounts loaded:', accounts.length, 'accounts');

    // שמירת הנתונים במשתנה גלובלי
    window.accountsData = accounts;
    window.allAccountsData = accounts;

    // החלת פילטרים על הנתונים
    let filteredAccounts = [...accounts];

    // בדיקה אם יש פילטרים פעילים
    const hasActiveFilters = (window.selectedStatusesForFilter && window.selectedStatusesForFilter.length > 0) ||
      (window.selectedTypesForFilter && window.selectedTypesForFilter.length > 0) ||
      (window.selectedDateRangeForFilter && window.selectedDateRangeForFilter !== 'כל זמן') ||
      (window.searchTermForFilter && window.searchTermForFilter.trim() !== '');

    console.log('🔄 Checking filters for accounts page:', {
      hasActiveFilters,
      selectedStatusesForFilter: window.selectedStatusesForFilter,
      selectedTypesForFilter: window.selectedTypesForFilter,
      selectedDateRangeForFilter: window.selectedDateRangeForFilter,
      searchTermForFilter: window.searchTermForFilter
    });

    if (hasActiveFilters) {
      console.log('🔄 Applying filters to accounts data...');
      if (typeof window.filterDataByFilters === 'function') {
        filteredAccounts = window.filterDataByFilters(accounts, 'accounts');
      } else {
        // פונקציה מקומית לפילטור אם הפונקציה הגלובלית לא זמינה
        filteredAccounts = filterAccountsLocally(accounts, window.selectedStatusesForFilter, window.selectedTypesForFilter, window.selectedDateRangeForFilter, window.searchTermForFilter);
      }
      console.log('🔄 After filtering:', filteredAccounts.length, 'accounts');
    } else {
      console.log('🔄 No active filters, showing all accounts');
    }

    // שמירת הנתונים המסוננים לגלובלי
    window.filteredAccountsData = filteredAccounts;

    // עדכון הטבלה עם הנתונים המסוננים
    if (typeof window.updateAccountsTable === 'function') {
      window.updateAccountsTable(filteredAccounts);

      // בדיקה שהטבלה התעדכנה כראוי
      const tbody = document.querySelector('#accountsTable tbody');
      if (tbody && tbody.children.length === 0) {
        console.error('❌ Table was not updated properly - no rows found');
        throw new Error('הטבלה לא התעדכנה כראוי');
      }

      console.log('✅ Table updated successfully with', tbody ? tbody.children.length : 0, 'rows');
    } else {
      console.error('❌ updateAccountsTable function not found');
      throw new Error('פונקציית עדכון הטבלה לא נמצאה');
    }

    console.log('✅ Accounts page data loaded and table updated successfully');

  } catch (error) {
    console.error('❌ Error loading accounts data for accounts page:', error);

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

// פונקציות לפתיחה/סגירה של סקשנים
function toggleMainSection() {
  console.log('🔄 toggleMainSection נקראה');
  const contentSections = document.querySelectorAll('.content-section');
  console.log('📋 מספר content-sections נמצא:', contentSections.length);
  const accountsSection = contentSections[0]; // הסקשן הראשון - חשבונות

  if (!accountsSection) {
    console.error('❌ לא נמצא סקשן חשבונות');
    return;
  }
  console.log('✅ סקשן חשבונות נמצא:', accountsSection);

  const sectionBody = accountsSection.querySelector('.section-body');
  const toggleBtn = accountsSection.querySelector('button[onclick="toggleMainSection()"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  console.log('🎯 sectionBody נמצא:', !!sectionBody);
  console.log('🔘 toggleBtn נמצא:', !!toggleBtn);
  console.log('🎨 icon נמצא:', !!icon);

  if (sectionBody) {
    const isCollapsed = sectionBody.style.display === 'none';
    console.log('📊 מצב נוכחי - isCollapsed:', isCollapsed);

    if (isCollapsed) {
      sectionBody.style.display = 'block';
    } else {
      sectionBody.style.display = 'none';
    }

    // עדכון האייקון
    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }

    // שמירת המצב ב-localStorage
    localStorage.setItem('accountsSectionCollapsed', !isCollapsed);
  }
}

// פונקציה להגדרת כותרות למיון
function setupSortableHeaders() {
  console.log('🔄 Setting up sortable headers for accounts table...');

  const headers = document.querySelectorAll('#accountsTable th.sortable-header');
  console.log('📋 Found sortable headers:', headers.length);

  headers.forEach((header, index) => {
    header.addEventListener('click', function () {
      console.log(`🔄 Header ${index} clicked for sorting`);

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
        window.updateSortIcons(window.currentSortColumn, 'accounts');
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

  console.log('✅ Sortable headers setup completed');
}

// פונקציה לפילטור מקומי של חשבונות
function filterAccountsLocally(accounts, selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  console.log('🔄 === FILTER ACCOUNTS LOCALLY ===');
  console.log('🔄 Original accounts:', accounts.length);
  console.log('🔄 Filters:', { selectedStatuses, selectedTypes, selectedDateRange, searchTerm });

  let filteredAccounts = [...accounts];

  // חילוץ תאריכי התחלה וסיום
  let startDate = null;
  let endDate = null;

  if (selectedDateRange && selectedDateRange !== 'כל זמן') {
    console.log('🔄 Filter: Translating date range:', selectedDateRange);
    const dateRange = window.translateDateRangeToDates(selectedDateRange);
    startDate = dateRange.startDate;
    endDate = dateRange.endDate;
    console.log('🔄 Filter: Translation result:', { startDate, endDate });
  }

  console.log('🔄 Extracted dates:', { startDate, endDate });

  // פילטר לפי סטטוס
  if (selectedStatuses && selectedStatuses.length > 0 && !selectedStatuses.includes('all')) {
    console.log('🔄 Filtering by status:', selectedStatuses);
    filteredAccounts = filteredAccounts.filter(account => {
      let itemStatus;
      if (account.status === 'cancelled') {
        itemStatus = 'מבוטל';
      } else if (account.status === 'closed') {
        itemStatus = 'סגור';
      } else {
        itemStatus = 'פתוח';
      }
      const isMatch = selectedStatuses.includes(itemStatus);
      console.log(`🔄 Account ${account.id}: status=${account.status}, mapped=${itemStatus}, selected=${selectedStatuses}, match=${isMatch}`);
      return isMatch;
    });
    console.log('🔄 After status filter:', filteredAccounts.length, 'accounts');
  }

  // פילטר לפי סוג
  if (selectedTypes && selectedTypes.length > 0 && !selectedTypes.includes('all')) {
    console.log('🔄 Filtering by type:', selectedTypes);
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
      console.log(`🔄 Account ${account.id}: type=${account.type}, mapped=${typeDisplay}, selected=${selectedTypes}, match=${isMatch}`);
      return isMatch;
    });
    console.log('🔄 After type filter:', filteredAccounts.length, 'accounts');
  }

  // פילטר לפי תאריכים
  if (startDate && endDate) {
    console.log('🔄 Filtering by date range:', { startDate, endDate });
    filteredAccounts = filteredAccounts.filter(account => {
      if (!account.created_at) return false;

      const accountDate = new Date(account.created_at);
      const start = new Date(startDate);
      const end = new Date(endDate);

      // הגדרת זמן לתחילת היום לתאריך התחלה ולסוף היום לתאריך סיום
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const isInRange = accountDate >= start && accountDate <= end;
      console.log(`🔄 Account ${account.id}: date=${account.created_at}, inRange=${isInRange}`);
      return isInRange;
    });
    console.log('🔄 After date filter:', filteredAccounts.length, 'accounts');
  }

  // פילטר לפי חיפוש
  if (searchTerm && searchTerm.trim() !== '') {
    console.log('🔄 Filtering by search term:', searchTerm);
    const searchLower = searchTerm.toLowerCase();

    filteredAccounts = filteredAccounts.filter(account => {
      const nameMatch = (account.name || '').toLowerCase().includes(searchLower);
      const typeMatch = (account.type || account.account_type || '').toLowerCase().includes(searchLower);
      const statusMatch = (account.status || '').toLowerCase().includes(searchLower);

      const isMatch = nameMatch || typeMatch || statusMatch;
      console.log(`🔄 Account ${account.id}: name=${account.name}, type=${account.type}, status=${account.status}, search=${searchTerm}, match=${isMatch}`);
      return isMatch;
    });
    console.log('🔄 After search filter:', filteredAccounts.length, 'accounts');
  }

  console.log('🔄 Final filtered accounts:', filteredAccounts.length);
  return filteredAccounts;
}

// פונקציה גלובלית לעדכון הטבלה - הועברה ל-app-header.js

// פונקציה לעדכון תפריט פילטר החשבונות
function updateAccountFilterMenu(accounts) {
  console.log('🔄 === UPDATE ACCOUNT FILTER MENU DIRECTLY ===');
  console.log('🔄 Accounts received:', accounts);

  // חיפוש התפריט בתוך האפ-הדר (Shadow DOM)
  const appHeader = document.querySelector('app-header');
  if (!appHeader || !appHeader.shadowRoot) {
    console.log('🔄 App header or shadow root not found, skipping account menu update');
    return;
  }

  const accountMenu = appHeader.shadowRoot.getElementById('accountFilterMenu');
  if (!accountMenu) {
    console.log('🔄 Account filter menu not found in app header shadow root');
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

  console.log(`🔄 Account filter menu updated with ${accounts ? accounts.length : 0} accounts`);
}

// ייצוא הפונקציות
window.loadAccountsDataForAccountsPage = loadAccountsDataForAccountsPage;
window.toggleMainSection = toggleMainSection;
window.setupSortableHeaders = setupSortableHeaders;
// updateGridFromComponentGlobal הועבר ל-app-header.js
window.updateAccountFilterMenu = updateAccountFilterMenu;
window.filterAccountsLocally = filterAccountsLocally;

// בדיקה סופית שהפונקציות מיוצאות
console.log('🔄 === בדיקה סופית של ייצוא פונקציות ===');
console.log('- showEditAccountModalById:', typeof window.showEditAccountModalById);
console.log('- showEditAccountModal:', typeof window.showEditAccountModal);
console.log('- showAddAccountModal:', typeof window.showAddAccountModal);
console.log('- toggleMainSection:', typeof window.toggleMainSection);
console.log('✅ === סיום בדיקת ייצוא ===');

// ניקוי הודעות קונסולה אחרי זמן קצר
setTimeout(() => {
  console.log('🧹 Clearing console messages to reduce clutter...');
  if (console.clear) {
    console.clear();
  }
}, 15000);
