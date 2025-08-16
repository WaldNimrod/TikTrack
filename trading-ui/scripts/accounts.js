/* ===== מערכת ניהול חשבונות ===== */
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
      console.log('🔄 No auth token found, using default accounts');
      loadDefaultAccounts();
      return;
    }
    
    console.log('🔄 Fetching accounts from server...');
    const response = await fetch('http://127.0.0.1:8080/api/v1/accounts/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🔄 Response status:', response.status);
    
    if (response.ok) {
      const accounts = await response.json();
      window.accountsData = accounts;
      window.accountsLoaded = true;
      console.log('🔄 Accounts loaded from server:', accounts.length, 'accounts');
      updateAccountFilterMenu(accounts);
    } else {
      console.log('🔄 Error loading accounts from server');
      loadDefaultAccounts();
    }
    
  } catch (error) {
    console.log('🔄 Error loading accounts from server:', error);
    loadDefaultAccounts();
  }
}

// פונקציה לטעינת חשבונות ברירת מחדל
function loadDefaultAccounts() {
  console.log('🔄 Loading default accounts');
  window.accountsData = [
    { id: 1, name: 'חשבון ראשי', type: 'main' },
    { id: 2, name: 'חשבון משני', type: 'secondary' },
    { id: 3, name: 'חשבון השקעות', type: 'investment' },
    { id: 4, name: 'חשבון מסחר', type: 'trading' }
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
    console.log('🔄 Account menu found, clearing existing content');
    return;
  }
  
  console.log('🔄 Account menu found, clearing existing content');
  accountMenu.innerHTML = '';
  
  console.log('🔄 Adding account items...');
  accounts.forEach((account, index) => {
    const accountItem = document.createElement('div');
    accountItem.className = 'filter-item';
    accountItem.dataset.value = account.name;
    accountItem.innerHTML = `
      <input type="checkbox" id="account-${account.id}" value="${account.name}" checked>
      <label for="account-${account.id}">${account.name}</label>
    `;
    accountMenu.appendChild(accountItem);
    console.log(`🔄 Added account item ${index + 1}: ${account.name}`);
  });
  
  console.log('🔄 Total account items added:', accounts.length);
  
  // הוספת event delegation
  accountMenu.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
      const selectedAccounts = Array.from(accountMenu.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.value);
      console.log('🔄 Account selection changed:', selectedAccounts);
      updateAccountFilterText(selectedAccounts);
    }
  });
  console.log('🔄 Event delegation listener added to account menu');
  
  // סימון כל החשבונות כברירת מחדל
  const checkboxes = accountMenu.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = true);
  console.log('🔄 All account items marked as selected');
  
  updateAccountFilterText(accounts.map(a => a.name));
  console.log('🔄 Account filter menu updated successfully');
}

// פונקציה לעדכון טקסט הפילטר של החשבונות
function updateAccountFilterText(selectedAccounts) {
  console.log('🔄 updateAccountFilterText called');
  console.log('🔄 Selected account values for text update:', selectedAccounts);
  
  const appHeader = document.querySelector('app-header');
  if (!appHeader) return;
  
  const accountToggle = appHeader.shadowRoot.querySelector('.account-filter-toggle');
  if (!accountToggle) return;
  
  let displayText = 'כל החשבונות';
  if (selectedAccounts.length === 0) {
    displayText = 'לא נבחרו חשבונות';
  } else if (selectedAccounts.length === 1) {
    displayText = selectedAccounts[0];
  } else if (selectedAccounts.length < 4) {
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
        <button class="btn btn-sm btn-primary" onclick="showEditAccountModal(${JSON.stringify(account).replace(/"/g, '&quot;')})" title="ערוך חשבון">ערוך</button>
        <button class="btn btn-sm btn-warning" onclick="cancelAccount(${account.id}, '${account.name}')" title="בטל חשבון">ביטול</button>
        <button class="btn btn-sm btn-danger" onclick="deleteAccount(${account.id}, '${account.name}')" title="מחק חשבון">מחק</button>
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

// ייצוא הפונקציות לשימוש גלובלי
window.loadAccountsFromServer = loadAccountsFromServer;
window.loadDefaultAccounts = loadDefaultAccounts;
window.updateAccountFilterMenu = updateAccountFilterMenu;
window.updateAccountFilterText = updateAccountFilterText;
window.getAccounts = getAccounts;
window.isAccountsLoaded = isAccountsLoaded;
window.loadAccountsData = loadAccountsData;
window.updateAccountsTable = updateAccountsTable;

console.log('✅ קובץ accounts.js נטען בהצלחה - פונקציות זמינות גלובלית');
