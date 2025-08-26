// ===== קובץ JavaScript לדף בסיס נתונים =====
/*
 * Database.js - Database Page Management
 * =====================================
 * 
 * This file contains all database page functionality for the TikTrack application.
 * It handles displaying all tables in one unified view with sorting and filtering.
 * 
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (global utilities and sorting functions)
 * - translation-utils.js (translation functions)
 * - All page-specific scripts for individual table functionality
 * 
 * Table Mapping:
 * - Uses all table types from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 * 
 * File: trading-ui/scripts/database.js
 * Version: 2.2
 * Last Updated: August 23, 2025
 */

console.log('🔄 database.js נטען!');

// פונקציה לטעינת אילוצים דינמית
async function loadConstraints() {
  try {
    console.log('🔄 טעינת אילוצים מהשרת');
    const response = await fetch('/api/v1/constraints/');
    if (response.ok) {
      const data = await response.json();
      allData.constraints = data.data || data;
      console.log('✅ נטענו', allData.constraints.length, 'אילוצים');
      updateConstraintsDisplay();
    } else {
      console.error('❌ שגיאה בטעינת אילוצים');
    }
  } catch (error) {
    console.error('❌ שגיאה בטעינת אילוצים:', error);
  }
}

// פונקציה לעדכון תצוגת האילוצים
function updateConstraintsDisplay() {
  // קבלת כל הטבלאות עם האילוצים שלהן
  const tableConstraints = {};

  // קיבוץ אילוצים לפי טבלה
  allData.constraints.forEach(constraint => {
    if (!tableConstraints[constraint.table_name]) {
      tableConstraints[constraint.table_name] = [];
    }
    tableConstraints[constraint.table_name].push(constraint);
  });

  // עדכון כל טבלה
  Object.keys(tableConstraints).forEach(tableName => {
    updateTableConstraints(tableName, tableConstraints[tableName]);
  });
}

// פונקציה למציאת אלמנט האילוצים של טבלה
function findTableRulesContainer(tableName) {
  // מיפוי שמות טבלאות לכותרות ב-HTML
  const tableHeaders = {
    'trade_plans': '📋 תוכניות מסחר',
    'trades': '💼 טריידים',
    'accounts': '👤 חשבונות',
    'tickers': '📊 טיקרים',
    'executions': '⚡ ביצועים',
    'cash_flows': '💰 תזרימי מזומנים',
    'alerts': '🔔 התראות',
    'notes': '📝 הערות'
  };

  const headerText = tableHeaders[tableName];
  if (!headerText) return null;

  // חיפוש הכותרת ומשם האלמנט של האילוצים
  const headers = document.querySelectorAll('.table-title');
  for (const header of headers) {
    if (header.textContent.trim() === headerText) {
      // מחפשים את ה-content-section שמכיל את הכותרת הזו
      const contentSection = header.closest('.content-section');
      if (contentSection) {
        return contentSection.querySelector('.table-rules-list');
      }
    }
  }

  return null;
}

// פונקציה לעדכון אילוצים של טבלה ספציפית
function updateTableConstraints(tableName, constraints) {
  // מיפוי שמות טבלאות לאלמנטים ב-HTML
  const tableMapping = {
    'trade_plans': 'tradePlans',
    'trades': 'trades',
    'accounts': 'accounts',
    'tickers': 'tickers',
    'executions': 'executions',
    'cash_flows': 'cashFlows',
    'alerts': 'alerts',
    'notes': 'notes'
  };

  const elementId = tableMapping[tableName];
  if (!elementId) return;

  // חיפוש האלמנט של רשימת האילוצים
  const rulesContainer = document.querySelector(`#${elementId}Section .table-rules-list`);
  if (!rulesContainer) {
    console.warn(`לא נמצא אלמנט אילוצים עבור טבלה ${tableName} (מחפש #${elementId}Section)`);
    return;
  }

  // יצירת HTML לאילוצים
  const constraintsHtml = constraints.map(constraint => {
    const typeClass = getConstraintTypeClass(constraint.constraint_type);
    const description = getConstraintDescription(constraint);
    return `<li class="${typeClass}">${description}</li>`;
  }).join('');

  // עדכון התוכן
  rulesContainer.innerHTML = constraintsHtml;
  console.log(`✅ עודכנו אילוצים עבור טבלה ${tableName}: ${constraints.length} אילוצים`);
}

// פונקציה לקבלת CSS class לפי סוג אילוץ
function getConstraintTypeClass(constraintType) {
  switch (constraintType) {
    case 'NOT_NULL': return 'constraint';
    case 'UNIQUE': return 'unique';
    case 'FOREIGN_KEY': return 'foreign-key';
    case 'CHECK': return 'check';
    case 'ENUM': return 'enum';
    case 'RANGE': return 'range';
    case 'COMPUTED': return 'computed';
    default: return 'constraint';
  }
}

// פונקציה לקבלת תיאור האילוץ
function getConstraintDescription(constraint) {
  const columnName = constraint.column_name;
  const constraintType = constraint.constraint_type;

  switch (constraintType) {
    case 'NOT_NULL':
      return `${columnName} is required (NOT NULL)`;
    case 'UNIQUE':
      return `${columnName} must be unique`;
    case 'FOREIGN_KEY':
      return `Foreign key: ${constraint.constraint_definition}`;
    case 'CHECK':
      return `Check constraint: ${constraint.constraint_definition}`;
    case 'ENUM':
      const enumValues = constraint.enum_values ?
        constraint.enum_values.map(ev => ev.value).join(', ') : '';
      return `${columnName} must be one of: ${enumValues}`;
    case 'RANGE':
      return `Range constraint: ${constraint.constraint_definition}`;
    case 'COMPUTED':
      return `Computed field: ${constraint.constraint_definition}`;
    default:
      return constraint.constraint_definition || `${constraintType} constraint on ${columnName}`;
  }
}

// פונקציה לתרגום סטטוס חשבון
function translateAccountStatus(status) {
  switch (status) {
    case 'active': return 'פעיל';
    case 'inactive': return 'לא פעיל';
    case 'suspended': return 'מושעה';
    case 'closed': return 'סגור';
    default: return status || '';
  }
}

// פונקציה לעיגול מספרים עד 4 תווים אחרי הנקודה
function formatNumber(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const num = parseFloat(value);
  if (isNaN(num)) {
    return value;
  }

  // אם המספר שלם, החזר אותו
  if (Number.isInteger(num)) {
    return num.toString();
  }

  // עיגול עד 4 תווים אחרי הנקודה
  return num.toFixed(4);
}

// פונקציה לזיהוי אם ערך הוא מספר
function isNumeric(value) {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  return !isNaN(parseFloat(value)) && isFinite(value);
}

// משתנים גלובליים
let allData = {
  accounts: [],
  trades: [],
  tickers: [],
  tradePlans: [],
  executions: [],
  cashFlows: [],
  alerts: [],
  notes: [],
  constraints: []
};

// טקסטי כפתורים - ניתן לשינוי בקלות


// פונקציה לפתיחה/סגירה של סקשנים
function toggleTopSection() {
  console.log('🔄 toggleTopSection נקראה - סגירה/פתיחה של כל הסקשנים');

  const topSection = document.querySelector('.top-section');
  const contentSections = document.querySelectorAll('.content-section');
  const toggleBtn = topSection ? topSection.querySelector('button[onclick="toggleTopSection()"]') : null;
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (!topSection) {
    console.error('❌ לא נמצא top-section');
    return;
  }

  // בדיקה אם כל הסקשנים סגורים
  const topSectionBody = topSection.querySelector('.section-body');
  const isTopCollapsed = topSectionBody ? topSectionBody.style.display === 'none' : false;

  let allSectionsCollapsed = isTopCollapsed;
  contentSections.forEach(section => {
    const sectionBody = section.querySelector('.section-body');
    if (sectionBody && sectionBody.style.display !== 'none') {
      allSectionsCollapsed = false;
    }
  });

  // אם כל הסקשנים סגורים - פתח את כולם
  // אם יש סקשנים פתוחים - סגור את כולם
  const shouldCollapse = !allSectionsCollapsed;

  // סגירה/פתיחה של top-section
  if (topSectionBody) {
    topSectionBody.style.display = shouldCollapse ? 'none' : 'block';
    localStorage.setItem('databaseTopSectionHidden', shouldCollapse);
  }

  // סגירה/פתיחה של כל content-sections
  contentSections.forEach(section => {
    const sectionBody = section.querySelector('.section-body');
    const sectionToggleBtn = section.querySelector('button[onclick="toggleMainSection()"]');
    const sectionIcon = sectionToggleBtn ? sectionToggleBtn.querySelector('.filter-icon') : null;
    const sectionTitle = section.querySelector('.table-title').textContent.trim();

    if (sectionBody) {
      sectionBody.style.display = shouldCollapse ? 'none' : 'block';
      localStorage.setItem(`databaseSectionHidden_${sectionTitle}`, shouldCollapse);

      // עדכון האייקון של הסקשן
      if (sectionIcon) {
        sectionIcon.textContent = shouldCollapse ? '▼' : '▲';
      }
    }
  });

  // עדכון האייקון של הכפתור הראשי
  if (icon) {
    icon.textContent = shouldCollapse ? '▼' : '▲';
  }

  console.log(`✅ ${shouldCollapse ? 'סגירת' : 'פתיחת'} כל הסקשנים הושלמה`);
}

function toggleMainSection() {
  console.log('🔄 toggleMainSection נקראה');
  const contentSections = document.querySelectorAll('.content-section');
  console.log('📋 מספר content-sections נמצא:', contentSections.length);

  // מציאת הסקשן הנוכחי (הכי קרוב לכפתור שנלחץ)
  const clickedButton = window.event ? window.event.target.closest('button') : null;
  const currentSection = clickedButton ? clickedButton.closest('.content-section') : contentSections[0];

  if (!currentSection) {
    console.error('❌ לא נמצא סקשן');
    return;
  }
  console.log('✅ סקשן נמצא:', currentSection);

  const sectionBody = currentSection.querySelector('.section-body');
  const toggleBtn = currentSection.querySelector('button[onclick="toggleMainSection()"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (sectionBody) {
    const isCollapsed = sectionBody.style.display === 'none';

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
    const sectionId = currentSection.querySelector('.table-title').textContent.trim();
    localStorage.setItem(`databaseSectionHidden_${sectionId}`, !isCollapsed);
  }
}

// פונקציה לשחזור מצב הסגירה
function restoreDatabaseSectionState() {
  // שחזור מצב top-section
  const topCollapsed = localStorage.getItem('databaseTopSectionHidden') === 'true';
  const topSection = document.querySelector('.top-section');

  if (topSection) {
    const sectionBody = topSection.querySelector('.section-body');
    const toggleBtn = topSection.querySelector('button[onclick="toggleTopSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody && topCollapsed) {
      sectionBody.style.display = 'none';
      if (icon) {
        icon.textContent = '▼';
      }
    }
  }

  // שחזור מצב content-sections
  const contentSections = document.querySelectorAll('.content-section');
  contentSections.forEach(section => {
    const sectionTitle = section.querySelector('.table-title').textContent.trim();
    const sectionCollapsed = localStorage.getItem(`databaseSectionHidden_${sectionTitle}`) === 'true';
    const sectionBody = section.querySelector('.section-body');
    const toggleBtn = section.querySelector('button[onclick="toggleMainSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody && sectionCollapsed) {
      sectionBody.style.display = 'none';
      if (icon) {
        icon.textContent = '▼';
      }
    }
  });
}

// פונקציה לטעינת כל הנתונים
async function loadAllData() {
  console.log('🔄 === loadAllData נקראה! ===');
  console.log('🔄 === טוען את כל הנתונים ===');
  console.log('📊 allData לפני טעינה:', allData);

  try {
    console.log('🌐 מתחיל קשות API...');

    // שימוש בפונקציה החדשה לטעינה מקבילה עם התקדמות
    await loadDataWithProgress();

    console.log('✅ עדכון טבלאות הושלם');

  } catch (error) {
    console.error('❌ שגיאה בטעינת נתונים:', error);
    console.error('❌ Stack trace:', error.stack);
    showError('שגיאה בטעינת נתונים מהשרת: ' + error.message);
  }
}

// פונקציה לאופטימיזציית ביצועים - טעינה מקבילה
async function loadDataWithProgress() {
  console.log('🚀 מתחיל טעינה מקבילה עם התקדמות...');

  const startTime = performance.now();

  // יצירת אינדיקטורים להתקדמות
  const progressIndicators = {
    accounts: document.getElementById('accountsCount'),
    trades: document.getElementById('tradesCount'),
    tickers: document.getElementById('tickersCount'),
    tradePlans: document.getElementById('tradePlansCount'),
    executions: document.getElementById('executionsCount'),
    cashFlows: document.getElementById('cashFlowsCount'),
    alerts: document.getElementById('alertsCount'),
    notes: document.getElementById('notesCount')
  };

  // עדכון כל האינדיקטורים למצב טעינה
  Object.values(progressIndicators).forEach(indicator => {
    if (indicator) indicator.textContent = 'טוען...';
  });

  try {
    // טעינה מקבילה של כל הנתונים
    const [
      accountsResponse,
      tradesResponse,
      tickersResponse,
      tradePlansResponse,
      executionsResponse,
      cashFlowsResponse,
      alertsResponse,
      notesResponse,
      constraintsResponse
    ] = await Promise.all([
      fetch('/api/v1/accounts/').then(r => r.json()).then(data => {
        if (progressIndicators.accounts) progressIndicators.accounts.textContent = `${data.data?.length || 0} רשומות`;
        return data;
      }),
      fetch('/api/v1/trades/').then(r => r.json()).then(data => {
        if (progressIndicators.trades) progressIndicators.trades.textContent = `${data.data?.length || 0} רשומות`;
        return data;
      }),
      fetch('/api/v1/tickers/').then(r => r.json()).then(data => {
        if (progressIndicators.tickers) progressIndicators.tickers.textContent = `${data.data?.length || 0} רשומות`;
        return data;
      }),
      fetch('/api/v1/trade_plans/').then(r => r.json()).then(data => {
        if (progressIndicators.tradePlans) progressIndicators.tradePlans.textContent = `${data.data?.length || 0} רשומות`;
        return data;
      }),
      fetch('/api/v1/executions/').then(r => r.json()).then(data => {
        if (progressIndicators.executions) progressIndicators.executions.textContent = `${data.data?.length || 0} רשומות`;
        return data;
      }),
      fetch('/api/v1/cash_flows/').then(r => r.json()).then(data => {
        if (progressIndicators.cashFlows) progressIndicators.cashFlows.textContent = `${data.data?.length || 0} רשומות`;
        return data;
      }),
      fetch('/api/v1/alerts/').then(r => r.json()).then(data => {
        if (progressIndicators.alerts) progressIndicators.alerts.textContent = `${data.data?.length || 0} רשומות`;
        return data;
      }),
      fetch('/api/v1/notes/').then(r => r.json()).then(data => {
        if (progressIndicators.notes) progressIndicators.notes.textContent = `${data.data?.length || 0} רשומות`;
        return data;
      }),
      fetch('/api/v1/constraints/').then(r => r.json())
    ]);

    // שמירת הנתונים
    allData.accounts = accountsResponse.data || accountsResponse || [];
    allData.trades = tradesResponse.data || tradesResponse || [];
    allData.tickers = tickersResponse.data || tickersResponse || [];
    allData.tradePlans = tradePlansResponse.data || tradePlansResponse || [];
    allData.executions = executionsResponse.data || executionsResponse || [];
    allData.cashFlows = cashFlowsResponse.data || cashFlowsResponse || [];
    allData.alerts = alertsResponse.data || alertsResponse || [];
    allData.notes = notesResponse.data || notesResponse || [];
    allData.constraints = constraintsResponse.data || constraintsResponse || [];

    const endTime = performance.now();
    const loadTime = endTime - startTime;

    console.log(`✅ טעינה מקבילה הושלמה ב-${loadTime.toFixed(2)}ms`);
    console.log('📊 נתונים נטענו:', {
      accounts: allData.accounts.length,
      trades: allData.trades.length,
      tickers: allData.tickers.length,
      tradePlans: allData.tradePlans.length,
      executions: allData.executions.length,
      cashFlows: allData.cashFlows.length,
      alerts: allData.alerts.length,
      notes: allData.notes.length,
      constraints: allData.constraints.length,
    });

    // עדכון הטבלאות
    updateAllTables();
    updateConstraintsDisplay();
    updateStatistics();

  } catch (error) {
    console.error('❌ שגיאה בטעינה מקבילה:', error);
    showError('שגיאה בטעינת נתונים מהשרת: ' + error.message);
  }
}

// פונקציה לעדכון כל הטבלאות
function updateAllTables() {
  console.log('🔄 === עדכון כל הטבלאות ===');
  console.log('📊 נתונים לעדכון:', allData);

  try {
    console.log('🔄 מעדכן טבלת חשבונות...');
    updateAccountsTable();

    console.log('🔄 מעדכן טבלת טריידים...');
    updateTradesTable();

    console.log('🔄 מעדכן טבלת טיקרים...');
    updateTickersTable();

    console.log('🔄 מעדכן טבלת תוכניות...');
    updateTradePlansTable();

    console.log('🔄 מעדכן טבלת ביצועים...');
    updateExecutionsTable();

    console.log('🔄 מעדכן טבלת תזרימי מזומנים...');
    updateCashFlowsTable();

    console.log('🔄 מעדכן טבלת התראות...');
    updateAlertsTable();

    console.log('🔄 מעדכן טבלת הערות...');
    updateNotesTable();

    console.log('✅ עדכון כל הטבלאות הושלם');
  } catch (error) {
    console.error('❌ שגיאה בעדכון טבלאות:', error);
    console.error('❌ Stack trace:', error.stack);
  }
}

// פונקציה לעדכון סטטיסטיקות
function updateStatistics() {
  document.getElementById('accountsStats').textContent = allData.accounts?.length || 0;
  document.getElementById('tradesStats').textContent = allData.trades?.length || 0;
  document.getElementById('tickersStats').textContent = allData.tickers?.length || 0;
  document.getElementById('tradePlansStats').textContent = allData.tradePlans?.length || 0;
}



// פונקציה להצגת שגיאה
function showError(message) {
  console.error('❌ שגיאה:', message);
  // הצגת הודעת שגיאה בכל הטבלאות
  const tables = ['accountsTable', 'tradesTable', 'tickersTable', 'tradePlansTable',
    'executionsTable', 'cashFlowsTable', 'alertsTable', 'notesTable'];

  tables.forEach(tableId => {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="100" class="text-center text-danger">
            <div style="padding: 20px;">
              <h5>❌ שגיאה בטעינת נתונים</h5>
              <p>${message}</p>
              <button class="btn btn-sm btn-primary" onclick="loadAllData()">נסה שוב</button>
            </div>
          </td>
        </tr>
      `;
    }
  });
}

// פונקציות לעדכון טבלאות ספציפיות
// פונקציה לעדכון טבלת תכנונים
function updateTradePlansTable() {
  const tbody = document.querySelector('#tradePlansTable tbody');
  if (!tbody) return;

  // בדיקה אם tradePlans קיים ומערך
  if (!allData.tradePlans || !Array.isArray(allData.tradePlans) || allData.tradePlans.length === 0) {
    tbody.innerHTML = '<tr><td colspan="14" class="text-center">אין נתונים</td></tr>';
    document.getElementById('tradePlansCount').textContent = '0 רשומות';
    return;
  }

  tbody.innerHTML = '';

  allData.tradePlans.forEach(plan => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${plan.id || ''}</td>
      <td>${plan.account_id || ''}</td>
      <td>${plan.ticker_id || ''}</td>
      <td>${plan.investment_type || ''}</td>
      <td>${plan.side || ''}</td>
      <td>${plan.status || ''}</td>
      <td class="number-cell">${formatNumber(plan.planned_amount)}</td>
      <td>${plan.entry_conditions || ''}</td>
      <td class="number-cell">${formatNumber(plan.stop_price)}</td>
      <td class="number-cell">${formatNumber(plan.target_price)}</td>
      <td>${plan.reasons || ''}</td>
      <td>${plan.cancelled_at || ''}</td>
      <td>${plan.cancel_reason || ''}</td>
      <td>${plan.created_at || ''}</td>
      <td>
        ${createEditButton(`editRecord('trade_plans', ${plan.id})`)}
        ${createDeleteButton(`deleteRecord('trade_plans', ${plan.id})`)}
      </td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('tradePlansCount').textContent = `${allData.tradePlans.length} רשומות`;
}

// פונקציה לעדכון טבלת טריידים
function updateTradesTable() {
  const tbody = document.querySelector('#tradesTable tbody');
  if (!tbody) return;

  // בדיקה אם trades קיים ומערך
  if (!allData.trades || !Array.isArray(allData.trades) || allData.trades.length === 0) {
    tbody.innerHTML = '<tr><td colspan="13" class="text-center">אין נתונים</td></tr>';
    document.getElementById('tradesCount').textContent = '0 רשומות';
    return;
  }

  tbody.innerHTML = '';

  allData.trades.forEach(trade => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${trade.id || ''}</td>
      <td>${trade.account_id || ''}</td>
      <td>${trade.ticker_id || ''}</td>
      <td>${trade.trade_plan_id || ''}</td>
      <td>${trade.status || ''}</td>
      <td>${trade.investment_type || ''}</td>
      <td>${trade.side || ''}</td>
      <td>${trade.closed_at || ''}</td>
      <td>${trade.cancelled_at || ''}</td>
      <td>${trade.cancel_reason || ''}</td>
      <td class="number-cell">${formatNumber(trade.total_pl)}</td>
      <td>${trade.notes || ''}</td>
      <td>${trade.created_at || ''}</td>
      <td>
        ${createEditButton(`editRecord('trades', ${trade.id})`)}
        ${createDeleteButton(`deleteRecord('trades', ${trade.id})`)}
      </td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('tradesCount').textContent = `${allData.trades.length} רשומות`;
}

// פונקציה לעדכון טבלת חשבונות
function updateAccountsTable() {
  const tbody = document.querySelector('#accountsTable tbody');
  if (!tbody) return;

  // בדיקה אם accounts קיים ומערך
  if (!allData.accounts || !Array.isArray(allData.accounts) || allData.accounts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">אין נתונים</td></tr>';
    document.getElementById('accountsCount').textContent = '0 רשומות';
    return;
  }

  tbody.innerHTML = '';

  allData.accounts.forEach(account => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${account.id || ''}</td>
      <td>${account.name || ''}</td>
      <td>${account.currency || ''}</td>
      <td>${account.status || ''}</td>
      <td class="number-cell">${formatNumber(account.cash_balance)}</td>
      <td class="number-cell">${formatNumber(account.total_value)}</td>
      <td class="number-cell">${formatNumber(account.total_pl)}</td>
      <td>${account.notes || ''}</td>
      <td>${account.created_at || ''}</td>
      <td>
        ${createEditButton(`editRecord('accounts', ${account.id})`)}
        ${createDeleteButton(`deleteRecord('accounts', ${account.id})`)}
      </td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('accountsCount').textContent = `${allData.accounts.length} רשומות`;
}

// פונקציה לעדכון טבלת טיקרים
function updateTickersTable() {
  const tbody = document.querySelector('#tickersTable tbody');
  if (!tbody) return;

  // בדיקה אם tickers קיים ומערך
  if (!allData.tickers || !Array.isArray(allData.tickers) || allData.tickers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">אין נתונים</td></tr>';
    document.getElementById('tickersCount').textContent = '0 רשומות';
    return;
  }

  tbody.innerHTML = '';

  allData.tickers.forEach(ticker => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${ticker.id || ''}</td>
      <td>${ticker.symbol || ''}</td>
      <td>${ticker.name || ''}</td>
      <td>${ticker.type || ''}</td>
      <td>${ticker.remarks || ''}</td>
      <td>${ticker.currency_id || ''}</td>
      <td>${ticker.active_trades ? 'כן' : 'לא'}</td>
      <td>${ticker.created_at || ''}</td>
      <td>${ticker.updated_at || ''}</td>
      <td>
        ${createEditButton(`editRecord('tickers', ${ticker.id})`)}
        ${createDeleteButton(`deleteRecord('tickers', ${ticker.id})`)}
      </td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('tickersCount').textContent = `${allData.tickers.length} רשומות`;
}

// פונקציה לעדכון טבלת ביצועים
function updateExecutionsTable() {
  const tbody = document.querySelector('#executionsTable tbody');
  if (!tbody) return;

  // בדיקה אם executions קיים ומערך
  if (!allData.executions || !Array.isArray(allData.executions) || allData.executions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" class="text-center">אין נתונים</td></tr>';
    document.getElementById('executionsCount').textContent = '0 רשומות';
    return;
  }

  tbody.innerHTML = '';

  allData.executions.forEach(execution => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${execution.id || ''}</td>
      <td>${execution.trade_id || ''}</td>
      <td>${execution.action || ''}</td>
      <td>${execution.date || ''}</td>
      <td class="number-cell">${formatNumber(execution.quantity)}</td>
      <td class="number-cell">${formatNumber(execution.price)}</td>
      <td class="number-cell">${formatNumber(execution.fee)}</td>
      <td>${execution.source || ''}</td>
      <td>${execution.external_id || ''}</td>
      <td>${execution.notes || ''}</td>
      <td>${execution.created_at || ''}</td>
      <td>
        ${createEditButton(`editRecord('executions', ${execution.id})`)}
        ${createDeleteButton(`deleteRecord('executions', ${execution.id})`)}
      </td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('executionsCount').textContent = `${allData.executions.length} רשומות`;
}

// פונקציה לעדכון טבלת תזרימי מזומנים
function updateCashFlowsTable() {
  const tbody = document.querySelector('#cashFlowsTable tbody');
  if (!tbody) return;

  // בדיקה אם cashFlows קיים ומערך
  if (!allData.cashFlows || !Array.isArray(allData.cashFlows) || allData.cashFlows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" class="text-center">אין נתונים</td></tr>';
    document.getElementById('cashFlowsCount').textContent = '0 רשומות';
    return;
  }

  tbody.innerHTML = '';

  allData.cashFlows.forEach(cashFlow => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${cashFlow.id || ''}</td>
      <td>${cashFlow.account_id || ''}</td>
      <td>${cashFlow.type || ''}</td>
      <td class="number-cell">${formatNumber(cashFlow.amount)}</td>
      <td>${cashFlow.date || ''}</td>
      <td>${cashFlow.description || ''}</td>
      <td>${cashFlow.currency_id || ''}</td>
      <td class="number-cell">${formatNumber(cashFlow.usd_rate)}</td>
      <td>${cashFlow.source || ''}</td>
      <td>${cashFlow.external_id || ''}</td>
      <td>${cashFlow.created_at || ''}</td>
      <td>
        ${createEditButton(`editRecord('cash_flows', ${cashFlow.id})`)}
        ${createDeleteButton(`deleteRecord('cash_flows', ${cashFlow.id})`)}
      </td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('cashFlowsCount').textContent = `${allData.cashFlows.length} רשומות`;
}

// פונקציה לעדכון טבלת התראות
function updateAlertsTable() {
  const tbody = document.querySelector('#alertsTable tbody');
  if (!tbody) return;

  // בדיקה אם alerts קיים ומערך
  if (!allData.alerts || !Array.isArray(allData.alerts) || allData.alerts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="13" class="text-center">אין נתונים</td></tr>';
    document.getElementById('alertsCount').textContent = '0 רשומות';
    return;
  }

  tbody.innerHTML = '';

  allData.alerts.forEach(alert => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${alert.id || ''}</td>
      <td>${alert.account_id || ''}</td>
      <td>${alert.ticker_id || ''}</td>
      <td>${alert.message || ''}</td>
      <td>${alert.triggered_at || ''}</td>
      <td>${alert.status || ''}</td>
      <td>${alert.is_triggered || ''}</td>
      <td>${alert.related_type_id || ''}</td>
      <td>${alert.related_id || ''}</td>
      <td>${alert.condition_attribute || ''}</td>
      <td>${alert.condition_operator || ''}</td>
      <td class="number-cell">${formatNumber(alert.condition_number)}</td>
      <td>${alert.created_at || ''}</td>
      <td>
        ${createEditButton(`editRecord('alerts', ${alert.id})`)}
        ${createDeleteButton(`deleteRecord('alerts', ${alert.id})`)}
      </td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('alertsCount').textContent = `${allData.alerts.length} רשומות`;
}

// פונקציה לעדכון טבלת הערות
function updateNotesTable() {
  const tbody = document.querySelector('#notesTable tbody');
  if (!tbody) return;

  // בדיקה אם notes קיים ומערך
  if (!allData.notes || !Array.isArray(allData.notes) || allData.notes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">אין נתונים</td></tr>';
    document.getElementById('notesCount').textContent = '0 רשומות';
    return;
  }

  tbody.innerHTML = '';

  allData.notes.forEach(note => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${note.id || ''}</td>
      <td>${note.content || ''}</td>
      <td>${note.attachment || ''}</td>
      <td>${note.related_type_id || ''}</td>
      <td>${note.related_id || ''}</td>
      <td>${note.created_at || ''}</td>
      <td>
        ${createEditButton(`editRecord('notes', ${note.id})`)}
        ${createDeleteButton(`deleteRecord('notes', ${note.id})`)}
      </td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('notesCount').textContent = `${allData.notes.length} רשומות`;
}



// פונקציות פעולות
function refreshAllData() {
  console.log('🔄 רענון כל הנתונים');
  loadAllData();
}

function exportAllData() {
  console.log('📤 ייצוא נתונים');
  const dataStr = JSON.stringify(allData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `database_export_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// פונקציה להוספת רשומה חדשה
function addRecord() {
  console.log('➕ הוספת רשומה חדשה...');

  // זיהוי הטבלה הנוכחית לפי הכפתור שנלחץ
  const activeElement = document.activeElement;
  const button = activeElement.closest('button');

  if (button) {
    const section = button.closest('.content-section');
    if (section) {
      const tableTitle = section.querySelector('.table-title');
      if (tableTitle) {
        const title = tableTitle.textContent.trim();

        // מיפוי כותרות לפונקציות הוספה
        const addFunctions = {
          'חשבונות': () => {
            if (typeof window.showAddAccountModal === 'function') {
              window.showAddAccountModal();
            } else {
              alert('פונקציית הוספת חשבון לא זמינה');
            }
          },
          'טריידים': () => {
            if (typeof window.showAddTradeModal === 'function') {
              window.showAddTradeModal();
            } else {
              alert('פונקציית הוספת טרייד לא זמינה');
            }
          },
          'טיקרים': () => {
            if (typeof window.showAddTickerModal === 'function') {
              window.showAddTickerModal();
            } else {
              alert('פונקציית הוספת טיקר לא זמינה');
            }
          },
          'תוכניות מסחר': () => {
            if (typeof window.showAddTradePlanModal === 'function') {
              window.showAddTradePlanModal();
            } else {
              alert('פונקציית הוספת תוכנית מסחר לא זמינה');
            }
          },
          'ביצועים': () => {
            if (typeof window.showAddExecutionModal === 'function') {
              window.showAddExecutionModal();
            } else {
              alert('פונקציית הוספת ביצוע לא זמינה');
            }
          },
          'תזרימי מזומנים': () => {
            if (typeof window.showAddCashFlowModal === 'function') {
              window.showAddCashFlowModal();
            } else {
              alert('פונקציית הוספת תזרים מזומנים לא זמינה');
            }
          },
          'התראות': () => {
            if (typeof window.showAddAlertModal === 'function') {
              window.showAddAlertModal();
            } else {
              alert('פונקציית הוספת התראה לא זמינה');
            }
          },
          'הערות': () => {
            if (typeof window.showAddNoteModal === 'function') {
              window.showAddNoteModal();
            } else {
              alert('פונקציית הוספת הערה לא זמינה');
            }
          },

        };

        const addFunction = addFunctions[title];
        if (addFunction) {
          addFunction();
        } else {
          alert(`פונקציית הוספה לטבלה "${title}" לא מוגדרת`);
        }
      } else {
        alert('לא ניתן לזהות את הטבלה');
      }
    } else {
      alert('לא ניתן לזהות את הטבלה');
    }
  } else {
    alert('לא ניתן לזהות את הטבלה');
  }
}

// פונקציות ביטול
function cancelAccount(id) {
  console.log('❌ ביטול חשבון:', id);
  if (confirm('האם אתה בטוח שברצונך לבטל חשבון זה?')) {
    // TODO: קריאה ל-API לביטול החשבון
    alert('פונקציית ביטול חשבון תתווסף בקרוב');
  }
}

function cancelTrade(id) {
  console.log('❌ ביטול טרייד:', id);
  if (confirm('האם אתה בטוח שברצונך לבטל טרייד זה?')) {
    // TODO: קריאה ל-API לביטול הטרייד
    alert('פונקציית ביטול טרייד תתווסף בקרוב');
  }
}

function cancelTradePlan(id) {
  console.log('❌ ביטול תוכנית מסחר:', id);
  if (confirm('האם אתה בטוח שברצונך לבטל תוכנית מסחר זו?')) {
    // TODO: קריאה ל-API לביטול התוכנית
    alert('פונקציית ביטול תוכנית מסחר תתווסף בקרוב');
  }
}

function cancelAlert(id) {
  console.log('❌ ביטול התראה:', id);
  if (confirm('האם אתה בטוח שברצונך לבטל התראה זו?')) {
    // TODO: קריאה ל-API לביטול ההתראה
    alert('פונקציית ביטול התראה תתווסף בקרוב');
  }
}

function showDatabaseInfo() {
  console.log('ℹ️ מידע בסיס נתונים');
  alert('מידע על בסיס הנתונים:\n\n' +
    'מספר טבלאות: 9\n' +
    'חשבונות: ' + allData.accounts.length + '\n' +
    'טריידים: ' + allData.trades.length + '\n' +
    'טיקרים: ' + allData.tickers.length + '\n' +
    'תוכניות: ' + allData.tradePlans.length + '\n' +
    'ביצועים: ' + allData.executions.length + '\n' +
    'תזרימי מזומנים: ' + allData.cashFlows.length + '\n' +
    'התראות: ' + allData.alerts.length + '\n' +
    'הערות: ' + allData.notes.length + '\n'
  );
}

function showBackupOptions() {
  console.log('💾 אפשרויות גיבוי');
  alert('אפשרויות גיבוי:\n\n' +
    '1. ייצוא JSON - ייצא את כל הנתונים לקובץ JSON\n' +
    '2. גיבוי SQL - ייצא את מבנה הטבלאות והנתונים\n' +
    '3. גיבוי אוטומטי - גיבוי יומי אוטומטי');
}

// פונקציות צפייה/עריכה/מחיקה (placeholder)
function viewAccount(id) {
  if (typeof window.showEditAccountModalById === 'function') {
    window.showEditAccountModalById(id);
  } else {
    console.log('צפייה בחשבון:', id);
  }
}
function editAccount(id) {
  if (typeof window.showEditAccountModalById === 'function') {
    window.showEditAccountModalById(id);
  } else {
    console.log('עריכת חשבון:', id);
  }
}
function deleteAccount(id) {
  if (typeof window.deleteAccount === 'function') {
    window.deleteAccount(id);
  } else {
    console.log('מחיקת חשבון:', id);
  }
}

function viewTrade(id) {
  if (typeof window.editTradeRecord === 'function') {
    window.editTradeRecord(id);
  } else {
    console.log('צפייה בטרייד:', id);
  }
}
function editTrade(id) {
  if (typeof window.editTradeRecord === 'function') {
    window.editTradeRecord(id);
  } else {
    console.log('עריכת טרייד:', id);
  }
}
function deleteTrade(id) {
  if (typeof window.deleteTradeRecord === 'function') {
    window.deleteTradeRecord(id);
  } else {
    console.log('מחיקת טרייד:', id);
  }
}

function viewTicker(id) {
  if (typeof window.showEditTickerModal === 'function') {
    window.showEditTickerModal(id);
  } else {
    console.log('צפייה בטיקר:', id);
  }
}
function editTicker(id) {
  if (typeof window.showEditTickerModal === 'function') {
    window.showEditTickerModal(id);
  } else {
    console.log('עריכת טיקר:', id);
  }
}
function deleteTicker(id) {
  if (typeof window.showDeleteTickerModal === 'function') {
    window.showDeleteTickerModal(id);
  } else {
    console.log('מחיקת טיקר:', id);
  }
}

function viewTradePlan(id) {
  if (typeof window.openEditTradePlanModal === 'function') {
    window.openEditTradePlanModal(id);
  } else {
    console.log('צפייה בתוכנית:', id);
  }
}
function editTradePlan(id) {
  if (typeof window.openEditTradePlanModal === 'function') {
    window.openEditTradePlanModal(id);
  } else {
    console.log('עריכת תוכנית:', id);
  }
}
function deleteTradePlan(id) {
  if (typeof window.openDeleteTradePlanModal === 'function') {
    window.openDeleteTradePlanModal(id);
  } else {
    console.log('מחיקת תוכנית:', id);
  }
}

function viewExecution(id) {
  if (typeof window.showEditExecutionModal === 'function') {
    window.showEditExecutionModal(id);
  } else {
    console.log('צפייה בביצוע:', id);
  }
}
function editExecution(id) {
  if (typeof window.showEditExecutionModal === 'function') {
    window.showEditExecutionModal(id);
  } else {
    console.log('עריכת ביצוע:', id);
  }
}
function deleteExecution(id) {
  if (typeof window.showDeleteExecutionModal === 'function') {
    window.showDeleteExecutionModal(id);
  } else {
    console.log('מחיקת ביצוע:', id);
  }
}

function viewCashFlow(id) {
  if (typeof window.showEditCashFlowModal === 'function') {
    window.showEditCashFlowModal(id);
  } else {
    console.log('צפייה בתזרים:', id);
  }
}
function editCashFlow(id) {
  if (typeof window.showEditCashFlowModal === 'function') {
    window.showEditCashFlowModal(id);
  } else {
    console.log('עריכת תזרים:', id);
  }
}
function deleteCashFlow(id) {
  if (typeof window.showDeleteCashFlowModal === 'function') {
    window.showDeleteCashFlowModal(id);
  } else {
    console.log('מחיקת תזרים:', id);
  }
}

function viewAlert(id) {
  if (typeof window.editAlert === 'function') {
    window.editAlert(id);
  } else {
    console.log('צפייה בהתראה:', id);
  }
}
function editAlert(id) {
  if (typeof window.editAlert === 'function') {
    window.editAlert(id);
  } else {
    console.log('עריכת התראה:', id);
  }
}
function deleteAlert(id) {
  if (typeof window.deleteAlert === 'function') {
    window.deleteAlert(id);
  } else {
    console.log('מחיקת התראה:', id);
  }
}

function viewNote(id) {
  if (typeof window.showEditNoteModal === 'function') {
    window.showEditNoteModal(id);
  } else {
    console.log('צפייה בהערה:', id);
  }
}
function editNote(id) {
  if (typeof window.showEditNoteModal === 'function') {
    window.showEditNoteModal(id);
  } else {
    console.log('עריכת הערה:', id);
  }
}
function deleteNote(id) {
  if (typeof window.showDeleteNoteModal === 'function') {
    window.showDeleteNoteModal(id);
  } else {
    console.log('מחיקת הערה:', id);
  }
}



// פונקציה למיון טבלאות בעמוד בסיס הנתונים
function sortTable(columnIndex, tableId) {
  console.log('🔄 === SORT DATABASE TABLE ===');
  console.log('🔄 Column clicked:', columnIndex);
  console.log('🔄 Table ID:', tableId);

  // קבלת סוג הטבלה מה-data-table-type
  const table = document.getElementById(tableId);
  if (!table) {
    console.error('❌ Table not found:', tableId);
    return;
  }

  const tableType = table.getAttribute('data-table-type');
  if (!tableType) {
    console.error('❌ Table type not found for table:', tableId);
    return;
  }

  console.log('🔄 Table type:', tableType);

  // קבלת הנתונים המתאימים לפי סוג הטבלה
  let data = [];
  let updateFunction = null;

  switch (tableType) {
    case 'trade_plans':
      data = allData.tradePlans || [];
      updateFunction = updateTradePlansTable;
      break;
    case 'trades':
      data = allData.trades || [];
      updateFunction = updateTradesTable;
      break;
    case 'accounts':
      data = allData.accounts || [];
      updateFunction = updateAccountsTable;
      break;
    case 'tickers':
      data = allData.tickers || [];
      updateFunction = updateTickersTable;
      break;
    case 'executions':
      data = allData.executions || [];
      updateFunction = updateExecutionsTable;
      break;
    case 'cash_flows':
      data = allData.cashFlows || [];
      updateFunction = updateCashFlowsTable;
      break;
    case 'alerts':
      data = allData.alerts || [];
      updateFunction = updateAlertsTable;
      break;
    case 'notes':
      data = allData.notes || [];
      updateFunction = updateNotesTable;
      break;

    default:
      console.error('❌ Unknown table type:', tableType);
      return;
  }

  console.log('🔄 Data length:', data.length);
  console.log('🔄 Update function:', updateFunction ? 'found' : 'not found');

  // קריאה לפונקציה הגלובלית למיון
  if (typeof window.sortTableData === 'function') {
    window.sortTableData(columnIndex, data, tableType, updateFunction);
  } else {
    console.error('❌ sortTableData function not found in tables.js');
  }
}

// הגדרת הפונקציות כגלובליות
window.toggleTopSection = toggleTopSection;
window.toggleMainSection = toggleMainSection;
window.restoreDatabaseSectionState = restoreDatabaseSectionState;
window.addRecord = addRecord;
window.cancelAccount = cancelAccount;
window.cancelTrade = cancelTrade;
window.cancelTradePlan = cancelTradePlan;
window.cancelAlert = cancelAlert;
window.exportAllData = exportAllData;
window.showDatabaseInfo = showDatabaseInfo;
window.showBackupOptions = showBackupOptions;
window.translateAccountStatus = translateAccountStatus;
window.loadDataWithProgress = loadDataWithProgress;
window.sortTable = sortTable;

// פונקציות פעולות
window.viewAccount = viewAccount;
window.editAccount = editAccount;
window.deleteAccount = deleteAccount;
window.viewTrade = viewTrade;
window.editTrade = editTrade;
window.deleteTrade = deleteTrade;
window.viewTicker = viewTicker;
window.editTicker = editTicker;
window.deleteTicker = deleteTicker;
window.viewTradePlan = viewTradePlan;
window.editTradePlan = editTradePlan;
window.deleteTradePlan = deleteTradePlan;
window.viewExecution = viewExecution;
window.editExecution = editExecution;
window.deleteExecution = deleteExecution;
window.viewCashFlow = viewCashFlow;
window.editCashFlow = editCashFlow;
window.deleteCashFlow = deleteCashFlow;
window.viewAlert = viewAlert;
window.editAlert = editAlert;
window.deleteAlert = deleteAlert;
window.viewNote = viewNote;
window.editNote = editNote;
window.deleteNote = deleteNote;


// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
  console.log('🔄 === DOM CONTENT LOADED (DATABASE) ===');
  console.log('📄 Current page:', window.location.pathname);
  console.log('🔍 Document ready state:', document.readyState);

  try {
    console.log('🔄 שחזור מצב הסגירה...');
    // שחזור מצב הסגירה
    restoreDatabaseSectionState();
    console.log('✅ מצב הסגירה שוחזר');

    console.log('🔄 מתחיל טעינת נתונים...');
    // טעינת נתונים
    loadAllData();
    console.log('✅ טעינת נתונים הוזמנה');

    console.log('✅ דף בסיס נתונים נטען בהצלחה');
  } catch (error) {
    console.error('❌ שגיאה באתחול דף בסיס נתונים:', error);
    console.error('❌ Stack trace:', error.stack);
  }
});

// פונקציה לעדכון טקסט פילטר חשבונות (נדרשת למערכת הפילטרים)
function updateAccountFilterDisplayText() {
  console.log('🔄 updateAccountFilterDisplayText called');

  // עדכון טקסט פילטר חשבונות ב-header
  const accountFilterButton = document.getElementById('accountFilterButton');
  if (accountFilterButton) {
    const selectedAccounts = window.simpleFilter?.currentFilters?.account || [];
    if (selectedAccounts && selectedAccounts.length > 0) {
      accountFilterButton.textContent = `${selectedAccounts.length} חשבונות נבחרו`;
    } else {
      accountFilterButton.textContent = 'כל החשבונות';
    }
  }
  console.log('✅ updateAccountFilterDisplayText completed');
}

// הגדרת הפונקציה כגלובלית
window.updateAccountFilterDisplayText = updateAccountFilterDisplayText;
