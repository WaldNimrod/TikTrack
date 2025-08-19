/* ===== מערכת ניהול חשבונות ===== */
/*
 * קובץ זה מכיל את כל הפונקציות הקשורות לניהול חשבונות
 * כולל טעינת נתונים, עדכון טבלאות, מודלים ופעולות CRUD
 * 
 * תכולת הקובץ:
 * - loadAccountsFromServer: טעינת חשבונות מהשרת
 * - updateAccountsTable: עדכון טבלת חשבונות
 * - showAddAccountModal: הצגת מודל הוספת חשבון
 * - createAccount: יצירת חשבון חדש
 * - updateAccountFromModal: עדכון חשבון קיים
 * - deleteAccount: מחיקת חשבון
 * 
 * שימוש: נטען בדפים שצריכים ניהול חשבונות
 * תלויות: Bootstrap (למודלים), fetch API
 */

// קובץ ייעודי לניהול חשבונות - נטען רק בדפים שצריכים חשבונות

// משתנים גלובליים לחשבונות
window.accountsData = [];
window.accountsLoaded = false;

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
      updateAccountFilterMenu(openAccounts);
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
      
      // עדכון הפילטר עם כל החשבונות
      updateAccountFilterMenu(allAccounts);
      return allAccounts;
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
  console.log('🔄 Loading default accounts');
  window.accountsData = [
    { id: 1, name: 'חשבון ראשי', type: 'main', status: 'open' },
    { id: 2, name: 'חשבון משני', type: 'secondary', status: 'open' },
    { id: 3, name: 'חשבון השקעות', type: 'investment', status: 'open' },
    { id: 4, name: 'חשבון מסחר', type: 'trading', status: 'open' }
  ];
  window.accountsLoaded = true;
  updateAccountFilterMenu(window.accountsData);
}

// פונקציה לעדכון תפריט הפילטר של החשבונות
function updateAccountFilterMenu(accounts) {
  console.log('🔄 updateAccountFilterMenu called with:', accounts);
  
  const appHeader = document.querySelector('app-header');
  if (!appHeader) {
    console.log('🔄 App header not found');
    return;
  }
  
  const accountMenu = appHeader.shadowRoot.getElementById('accountFilterMenu');
  if (!accountMenu) {
    console.log('🔄 Account menu not found');
    return;
  }
  
  console.log('🔄 Account menu found, clearing existing content');
  accountMenu.innerHTML = '';
  
  console.log('🔄 Adding account items...');
  accounts.forEach((account, index) => {
    const accountItem = document.createElement('div');
    accountItem.className = 'account-filter-item';
    accountItem.setAttribute('data-account', account.name); // הוספת data-account attribute
    accountItem.innerHTML = `
      <span class="option-text">${account.name}</span>
      <span class="check-mark">✓</span>
    `;
    accountMenu.appendChild(accountItem);
    console.log(`🔄 Added account item ${index + 1}: ${account.name}`);
  });
  
  console.log('🔄 Total account items added:', accounts.length);
  
  // הוספת event listeners לפריטי החשבונות
  const accountItems = accountMenu.querySelectorAll('.account-filter-item');
  accountItems.forEach((item, index) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const accountName = item.getAttribute('data-account'); // שימוש ב-data-account
      console.log('🔄 Account filter item clicked:', accountName);
      
      // קריאה לפונקציה של הקומפוננט
      const appHeader = document.querySelector('app-header');
      if (appHeader && typeof appHeader.selectAccountOption === 'function') {
        appHeader.selectAccountOption(accountName);
      }
    });
  });
  console.log('🔄 Event listeners added to account items');
  
  updateAccountFilterText(accounts.map(a => a.name));
  console.log('🔄 Account filter menu updated successfully');
}

// פונקציה לעדכון טקסט הפילטר של החשבונות
function updateAccountFilterText(selectedAccounts) {
  console.log('🔄 updateAccountFilterText called');
  console.log('🔄 Selected account values for text update:', selectedAccounts);
  
  const appHeader = document.querySelector('app-header');
  if (!appHeader) return;
  
  const accountToggle = appHeader.shadowRoot.querySelector('.account-filter-toggle .selected-account-text');
  if (!accountToggle) return;
  
  let displayText = 'כל החשבונות';
  if (selectedAccounts.length === 0) {
    displayText = 'לא נבחרו חשבונות';
  } else if (selectedAccounts.length === 1) {
    displayText = selectedAccounts[0];
  } else if (selectedAccounts.length === window.accountsData?.length) {
    displayText = 'כל החשבונות';
  } else if (selectedAccounts.length < 4) {
    displayText = `${selectedAccounts.length} חשבונות`;
  } else {
    displayText = `${selectedAccounts.length} חשבונות`;
  }
  
  accountToggle.textContent = displayText;
  console.log('🔄 Updated account filter text to:', displayText);
}

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
    const response = await window.apiCall('/api/v1/accounts/');
    const accounts = response.data || response;
    console.log('📊 חשבונות שהתקבלו:', accounts);
    return accounts;
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
  console.log('🔄 מעדכן טבלת חשבונות עם', accounts.length, 'חשבונות');
  
  const tbody = document.querySelector('#accountsTable tbody');
  if (!tbody) {
    console.error('❌ לא נמצא tbody לטבלת חשבונות');
    return;
  }
  
  tbody.innerHTML = accounts.map(account => `
    <tr>
      <td>${account.id}</td>
      <td>${account.name || '-'}</td>
      <td>${account.currency || '-'}</td>
      <td>${window.convertAccountStatusToHebrew(account.status)}</td>
      <td>${window.formatCurrency(account.cash_balance)}</td>
      <td>${window.formatCurrency(account.total_value)}</td>
      <td>${window.formatCurrency(account.total_pl)}</td>
      <td>${account.notes || '-'}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="showEditAccountModal(${JSON.stringify(account).replace(/"/g, '&quot;')})" title="ערוך">✏️</button>
        <button class="btn btn-sm btn-secondary" onclick="cancelAccount(${account.id}, '${account.name}')" title="ביטול">❌</button>
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
    
    const accounts = await window.loadAccountsData();
    updateAccountsTableInDesigns(accounts);
    
  } catch (error) {
    console.error('❌ שגיאה בטעינת חשבונות:', error);
    const tbody = document.querySelector('.content-section:nth-child(2) tbody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">שגיאה בטעינת חשבונות: ${error.message}</td></tr>`;
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
      <td>${account.id}</td>
      <td>${account.name || '-'}</td>
      <td>${account.currency || '-'}</td>
      <td>${window.convertAccountStatusToHebrew ? window.convertAccountStatusToHebrew(account.status) : (account.status || '-')}</td>
      <td>${window.formatCurrency ? window.formatCurrency(account.cash_balance) : (account.cash_balance || '-')}</td>
      <td>${window.formatCurrency ? window.formatCurrency(account.total_value) : (account.total_value || '-')}</td>
      <td>${window.formatCurrency ? window.formatCurrency(account.total_pl) : (account.total_pl || '-')}</td>
      <td>${account.notes || '-'}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="showEditAccountModal(${JSON.stringify(account).replace(/"/g, '&quot;')})" title="ערוך">✏️</button>
        <button class="btn btn-sm btn-secondary" onclick="cancelAccount(${account.id}, '${account.name}')" title="ביטול">❌</button>
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

// ייצוא הפונקציות לשימוש גלובלי
window.loadAccountsFromServer = loadAccountsFromServer;
window.loadAllAccountsFromServer = loadAllAccountsFromServer;
window.loadDefaultAccounts = loadDefaultAccounts;
window.updateAccountFilterMenu = updateAccountFilterMenu;
window.updateAccountFilterText = updateAccountFilterText;
window.getAccounts = getAccounts;
window.isAccountsLoaded = isAccountsLoaded;
window.loadAccountsData = loadAccountsData;
window.updateAccountsTable = updateAccountsTable;
window.loadAccounts = loadAccounts;
window.updateAccountsTableInDesigns = updateAccountsTableInDesigns;

// פונקציה גלובלית לעדכון ידני של תפריט החשבונות
window.refreshAccountFilterMenu = function() {
  console.log('🔄 Manual refresh of account filter menu called');
  if (window.accountsData && window.accountsData.length > 0) {
    console.log('🔄 Using existing accounts data:', window.accountsData);
    updateAccountFilterMenu(window.accountsData);
  } else {
    console.log('🔄 No accounts data, loading from server...');
    loadAccountsFromServer();
  }
};

// פונקציה לבדיקת מצב החשבונות
window.checkAccountsStatus = function() {
  console.log('🔄 === ACCOUNTS STATUS CHECK ===');
  console.log('🔄 accountsData:', window.accountsData);
  console.log('🔄 accountsLoaded:', window.accountsLoaded);
  console.log('🔄 loadAccountsFromServer function:', typeof window.loadAccountsFromServer);
  console.log('🔄 updateAccountFilterMenu function:', typeof window.updateAccountFilterMenu);
  
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

// פונקציה גלובלית לבדיקה מהירה
window.debugAccountsFilter = function() {
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
    })
    .catch(error => {
      console.log('🔄 Server error:', error);
    });
  
  // ניסיון לטעון חשבונות
  if (typeof window.loadAccountsFromServer === 'function') {
    console.log('🔄 Attempting to load accounts...');
    window.loadAccountsFromServer().then(() => {
      console.log('🔄 Accounts loaded successfully');
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

// ===== פונקציות נוספות לניהול חשבונות =====

/**
 * הצגת מודל הוספת חשבון
 */
function showAddAccountModal() {
  console.log('🔄 הצגת מודל הוספת חשבון');
    
  // בדיקה אם יש מודל קיים בדף
  const modalElement = document.getElementById('addAccountModal');
  if (modalElement) {
    // איפוס הטופס
    const form = document.getElementById('addAccountForm');
    if (form) {
        form.reset();
    }
    
    // הצגת המודל
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  } else {
    // אם אין מודל, הצגת הודעה זמנית
    alert('פונקציית הוספת חשבון תתווסף בקרוב');
  }
}

/**
 * הצגת מודל עריכת חשבון
 * @param {Object} account - אובייקט החשבון לעריכה
 */
function showEditAccountModal(account) {
  console.log('🔄 הצגת מודל עריכת חשבון:', account);
    
  // בדיקה אם יש מודל קיים בדף
  const modalElement = document.getElementById('editAccountModal');
  if (modalElement) {
    // מילוי השדות
    document.getElementById('editAccountId').value = account.id;
    document.getElementById('editAccountName').value = account.name;
    document.getElementById('editAccountCurrency').value = account.currency;
    
    // תיקון סטטוס - המרה מ-active/inactive ל-open/closed
    let statusValue = 'פתוח';
        if (account.status === 'open' || account.status === 'פתוח') {
        statusValue = 'פתוח';
    } else if (account.status === 'closed' || account.status === 'סגור') {
        statusValue = 'סגור';
    } else {
      statusValue = account.status || 'פתוח';
    }
    document.getElementById('editAccountStatus').value = statusValue;
    
    document.getElementById('editAccountCashBalance').value = account.cash_balance || '';
    document.getElementById('editAccountTotalValue').value = account.total_value || '';
    document.getElementById('editAccountTotalPl').value = account.total_pl || '';
    document.getElementById('editAccountNotes').value = account.notes || '';
    
    // הצגת המודל
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  } else {
    // אם אין מודל, הצגת הודעה זמנית
    alert('פונקציית עריכת חשבון תתווסף בקרוב');
  }
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
 * ביטול חשבון
 * @param {number} accountId - מזהה החשבון
 * @param {string} accountName - שם החשבון
 */
async function cancelAccount(accountId, accountName) {
  console.log('🔄 ביטול חשבון:', accountId, accountName);
  
  if (!confirm(`האם אתה בטוח שברצונך לבטל את החשבון "${accountName}"?`)) {
    return;
  }
  
  try {
    const response = await fetch(`/api/v1/accounts/${accountId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'closed'
      })
    });
    
    if (response.ok) {
      showSuccessMessage('חשבון בוטל בהצלחה!');
      
      // רענון הטבלה
      if (typeof loadAccounts === 'function') {
        loadAccounts();
      }
    } else {
      showErrorMessage('שגיאה בביטול חשבון');
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
  
  if (!confirm(`האם אתה בטוח שברצונך למחוק את החשבון "${accountName}"? פעולה זו אינה הפיכה.`)) {
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
      if (typeof loadAccounts === 'function') {
        loadAccounts();
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

// ייצוא הפונקציות הנוספות
window.showAddAccountModal = showAddAccountModal;
window.showEditAccountModal = showEditAccountModal;
window.createAccount = createAccount;
window.updateAccountFromModal = updateAccountFromModal;
window.cancelAccount = cancelAccount;
window.deleteAccount = deleteAccount;
window.showSuccessMessage = showSuccessMessage;
window.showErrorMessage = showErrorMessage;
window.updateAccountFilterMenu = updateAccountFilterMenu;
window.updateAccountFilterText = updateAccountFilterText;

// הגדרת הפונקציה updateGridFromComponent לדף החשבונות
window.updateGridFromComponent = function(selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  console.log('🔄 === UPDATE GRID FROM COMPONENT (accounts) ===');
  console.log('🔄 Parameters:', { selectedStatuses, selectedTypes, selectedDateRange, searchTerm });

  // קריאה לפונקציה הגלובלית
  window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, [], selectedDateRange, searchTerm, 'accounts');
};
