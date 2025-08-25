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

// פונקציות לפתיחה/סגירה של סקשנים
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
    console.log('🌐 מתחיל בקשות API...');

    // טעינת כל הנתונים במקביל
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
      fetch('/api/v1/accounts/').then(r => {
        console.log('📡 Accounts API response status:', r.status);
        return r.json();
      }).catch(e => {
        console.error('❌ Accounts API error:', e);
        return { data: [] };
      }),
      fetch('/api/v1/trades/').then(r => {
        console.log('📡 Trades API response status:', r.status);
        return r.json();
      }).catch(e => {
        console.error('❌ Trades API error:', e);
        return { data: [] };
      }),
      fetch('/api/v1/tickers/').then(r => {
        console.log('📡 Tickers API response status:', r.status);
        return r.json();
      }).catch(e => {
        console.error('❌ Tickers API error:', e);
        return { data: [] };
      }),
      fetch('/api/v1/trade_plans/').then(r => {
        console.log('📡 Trade Plans API response status:', r.status);
        return r.json();
      }).catch(e => {
        console.error('❌ Trade Plans API error:', e);
        return { data: [] };
      }),
      fetch('/api/v1/executions/').then(r => {
        console.log('📡 Executions API response status:', r.status);
        return r.json();
      }).catch(e => {
        console.error('❌ Executions API error:', e);
        return { data: [] };
      }),
      fetch('/api/v1/cash_flows/').then(r => {
        console.log('📡 Cash Flows API response status:', r.status);
        return r.json();
      }).catch(e => {
        console.error('❌ Cash Flows API error:', e);
        return { data: [] };
      }),
      fetch('/api/v1/alerts/').then(r => {
        console.log('📡 Alerts API response status:', r.status);
        return r.json();
      }).catch(e => {
        console.error('❌ Alerts API error:', e);
        return { data: [] };
      }),
      fetch('/api/v1/notes/').then(r => {
        console.log('📡 Notes API response status:', r.status);
        return r.json();
      }).catch(e => {
        console.error('❌ Notes API error:', e);
        return { data: [] };
      }),
      fetch('/api/v1/constraints/').then(r => {
        console.log('📡 Constraints API response status:', r.status);
        return r.json();
      }).catch(e => {
        console.error('❌ Constraints API error:', e);
        return { data: [] };
      })
    ]);

    console.log('📥 תגובות API גולמיות:', {
      accounts: accountsResponse,
      trades: tradesResponse,
      tickers: tickersResponse,
      tradePlans: tradePlansResponse,
      executions: executionsResponse,
      cashFlows: cashFlowsResponse,
      alerts: alertsResponse,
      notes: notesResponse,
      constraints: constraintsResponse
    });

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

    console.log('✅ נטענו נתונים:', {
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

    console.log('🔄 מתחיל עדכון טבלאות...');
    // עדכון כל הטבלאות
    updateAllTables();
    
    // עדכון אילוצים
    updateConstraintsDisplay();
    updateStatistics();
    console.log('✅ עדכון טבלאות הושלם');

  } catch (error) {
    console.error('❌ שגיאה בטעינת נתונים:', error);
    console.error('❌ Stack trace:', error.stack);
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
  document.getElementById('accountsStats').textContent = allData.accounts.length;
  document.getElementById('tradesStats').textContent = allData.trades.length;
  document.getElementById('tickersStats').textContent = allData.tickers.length;
  document.getElementById('tradePlansStats').textContent = allData.tradePlans.length;
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
function updateAccountsTable() {
  const tbody = document.querySelector('#accountsTable tbody');
  if (!tbody) return;

  if (allData.accounts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">אין נתונים</td></tr>';
    return;
  }

  const rows = allData.accounts.map(account => {
    // המרת סטטוס לעברית לפילטר
    const statusForFilter = account.status === 'open' ? 'פתוח' :
      account.status === 'closed' ? 'סגור' :
        account.status === 'cancelled' ? 'מבוטל' : (account.status || '');

    return `
    <tr>
      <td>${account.name || ''}</td>
      <td>${account.currency || ''}</td>
      <td data-status="${statusForFilter}">${translateAccountStatus(account.status) || ''}</td>
      <td>${account.cash_balance || 0}</td>
      <td>${account.total_value || 0}</td>
      <td>${account.total_pl || 0}</td>
      <td>${account.notes || ''}</td>
      <td>${account.id || ''}</td>
      <td data-date="${account.created_at}">${account.created_at || ''}</td>
      <td class="actions-cell">
        <table class="table table-sm table-borderless mb-0">
          <tbody>
            <tr>
              <td class="p-0 pe-1">
                <button class="btn btn-sm btn-secondary" onclick="editAccount(${account.id})" title="ערוך">✏️</button>
              </td>
              <td class="p-0 pe-1">
                <button class="btn btn-sm btn-danger" onclick="deleteAccount(${account.id})" title="מחק">🗑️</button>
              </td>
              ${account.status && account.status !== 'cancelled' ?
              `<td class="p-0">
                <button class="btn btn-sm btn-warning" onclick="cancelAccount(${account.id})" title="ביטול">❌</button>
              </td>` :
              ''}
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  `}).join('');

  tbody.innerHTML = rows;
  document.getElementById('accountsCount').textContent = `${allData.accounts.length} רשומות`;
}

function updateTradesTable() {
  const tbody = document.querySelector('#tradesTable tbody');
  if (!tbody) return;

  if (allData.trades.length === 0) {
    tbody.innerHTML = '<tr><td colspan="14" class="text-center">אין נתונים</td></tr>';
    return;
  }

  const rows = allData.trades.map(trade => {
    // המרת סוגים לעברית לפילטר
    const typeForFilter = trade.investment_type === 'swing' ? 'סווינג' :
      trade.investment_type === 'investment' ? 'השקעה' :
        trade.investment_type === 'passive' ? 'פסיבי' : (trade.investment_type || '');

    // המרת סטטוס לעברית לפילטר
    const statusForFilter = trade.status === 'open' ? 'פתוח' :
      trade.status === 'closed' ? 'סגור' :
        trade.status === 'cancelled' ? 'מבוטל' : (trade.status || '');

    return `
    <tr>
      <td>${trade.account_id || ''}</td>
      <td>${trade.ticker_id || ''}</td>
      <td>${trade.trade_plan_id || ''}</td>
      <td data-status="${statusForFilter}">${trade.status || ''}</td>
      <td data-type="${typeForFilter}">${trade.investment_type || ''}</td>
      <td data-date="${trade.opened_at}">${trade.opened_at || ''}</td>
      <td data-date="${trade.closed_at}">${trade.closed_at || ''}</td>
      <td data-date="${trade.cancelled_at}">${trade.cancelled_at || ''}</td>
      <td>${trade.cancel_reason || ''}</td>
      <td>${trade.total_pl || 0}</td>
      <td>${trade.notes || ''}</td>
      <td>${trade.id || ''}</td>
      <td data-date="${trade.created_at}">${trade.created_at || ''}</td>
      <td>${trade.side || ''}</td>
      <td class="actions-cell">
        <table class="table table-sm table-borderless mb-0">
          <tbody>
            <tr>
              <td class="p-0 pe-1">
                <button class="btn btn-sm btn-secondary" onclick="editTrade(${trade.id})" title="ערוך">✏️</button>
              </td>
              <td class="p-0 pe-1">
                <button class="btn btn-sm btn-danger" onclick="deleteTrade(${trade.id})" title="מחק">🗑️</button>
              </td>
              ${trade.status && trade.status !== 'cancelled' ?
              `<td class="p-0">
                <button class="btn btn-sm btn-warning" onclick="cancelTrade(${trade.id})" title="ביטול">❌</button>
              </td>` :
              ''}
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  `}).join('');

  tbody.innerHTML = rows;
  document.getElementById('tradesCount').textContent = `${allData.trades.length} רשומות`;
}

function updateTickersTable() {
  const tbody = document.querySelector('#tickersTable tbody');
  if (!tbody) return;

  if (allData.tickers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">אין נתונים</td></tr>';
    return;
  }

  const rows = allData.tickers.map(ticker => {
    // המרת סוגים לעברית לפילטר
    const typeForFilter = ticker.type === 'stock' ? 'מניה' :
      ticker.type === 'etf' ? 'ETF' :
        ticker.type === 'bond' ? 'אג"ח' :
          ticker.type === 'crypto' ? 'קריפטו' : (ticker.type || '');

    // המרת סטטוס לפילטר
    const statusForFilter = ticker.active_trades ? 'פעיל' : 'לא פעיל';

    return `
    <tr>
      <td>${ticker.symbol || ''}</td>
      <td>${ticker.name || ''}</td>
      <td data-type="${typeForFilter}">${ticker.type || ''}</td>
      <td>${ticker.remarks || ''}</td>
      <td>${ticker.currency || ''}</td>
      <td data-status="${statusForFilter}">${ticker.active_trades ? 'כן' : 'לא'}</td>
      <td>${ticker.id || ''}</td>
      <td data-date="${ticker.created_at}">${ticker.created_at || ''}</td>
      <td data-date="${ticker.updated_at}">${ticker.updated_at || ''}</td>
      <td class="actions-cell">
        <table class="table table-sm table-borderless mb-0">
          <tbody>
            <tr>
              <td class="p-0 pe-1">
                <button class="btn btn-sm btn-secondary" onclick="editTicker(${ticker.id})" title="ערוך">✏️</button>
              </td>
              <td class="p-0">
                <button class="btn btn-sm btn-danger" onclick="deleteTicker(${ticker.id})" title="מחק">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  `}).join('');

  tbody.innerHTML = rows;
  document.getElementById('tickersCount').textContent = `${allData.tickers.length} רשומות`;
}

function updateTradePlansTable() {
  const tbody = document.querySelector('#tradePlansTable tbody');
  if (!tbody) return;

  if (allData.tradePlans.length === 0) {
    tbody.innerHTML = '<tr><td colspan="14" class="text-center">אין נתונים</td></tr>';
    return;
  }

  const rows = allData.tradePlans.map(plan => {
    // המרת סוגים לעברית לפילטר
    const typeForFilter = plan.investment_type === 'swing' ? 'סווינג' :
      plan.investment_type === 'investment' ? 'השקעה' :
        plan.investment_type === 'passive' ? 'פסיבי' : (plan.investment_type || '');

    // המרת סטטוס לעברית לפילטר
    const statusForFilter = plan.status === 'open' ? 'פתוח' :
      plan.status === 'closed' ? 'סגור' :
        plan.status === 'cancelled' ? 'מבוטל' : (plan.status || '');

    return `
    <tr>
      <td>${plan.id || ''}</td>
      <td data-account="${plan.account_id || ''}">${plan.account_id || ''}</td>
      <td>${plan.ticker_id || ''}</td>
      <td data-type="${typeForFilter}">${plan.investment_type || ''}</td>
      <td>${plan.planned_amount || 0}</td>
      <td>${plan.entry_conditions || ''}</td>
      <td>${plan.stop_price || 0}</td>
      <td>${plan.target_price || 0}</td>
      <td>${plan.reasons || ''}</td>
      <td data-date="${plan.cancelled_at}">${plan.cancelled_at || ''}</td>
      <td>${plan.cancel_reason || ''}</td>
      <td data-date="${plan.created_at}">${plan.created_at || ''}</td>
      <td>${plan.side || ''}</td>
      <td data-status="${statusForFilter}">${plan.status || ''}</td>
      <td class="actions-cell">
        <table class="table table-sm table-borderless mb-0">
          <tbody>
            <tr>
              <td class="p-0 pe-1">
                <button class="btn btn-sm btn-secondary" onclick="editTradePlan(${plan.id})" title="ערוך">✏️</button>
              </td>
              <td class="p-0 pe-1">
                <button class="btn btn-sm btn-danger" onclick="deleteTradePlan(${plan.id})" title="מחק">🗑️</button>
              </td>
              ${plan.status && plan.status !== 'cancelled' ?
              `<td class="p-0">
                <button class="btn btn-sm btn-warning" onclick="cancelTradePlan(${plan.id})" title="ביטול">❌</button>
              </td>` :
              ''}
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  `}).join('');

  tbody.innerHTML = rows;
  document.getElementById('tradePlansCount').textContent = `${allData.tradePlans.length} רשומות`;
}

function updateExecutionsTable() {
  const tbody = document.querySelector('#executionsTable tbody');
  if (!tbody) return;

  if (allData.executions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">אין נתונים</td></tr>';
    return;
  }

  const rows = allData.executions.map(execution => {
    // המרת סוגים לעברית לפילטר
    const typeForFilter = execution.action === 'buy' ? 'קנייה' :
      execution.action === 'sell' ? 'מכירה' : (execution.action || '');

    return `
    <tr>
      <td>${execution.trade_id || ''}</td>
      <td data-type="${typeForFilter}">${execution.action || ''}</td>
      <td data-date="${execution.date}">${execution.date || ''}</td>
      <td>${execution.quantity || 0}</td>
      <td>${execution.price || 0}</td>
      <td>${execution.fee || 0}</td>
      <td>${execution.source || ''}</td>
      <td>${execution.id || ''}</td>
      <td data-date="${execution.created_at}">${execution.created_at || ''}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-secondary" onclick="editExecution(${execution.id})" title="ערוך">
          <span class="btn-icon">✏️</span>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteExecution(${execution.id})" title="מחק">🗑️</button>
      </td>
    </tr>
  `}).join('');

  tbody.innerHTML = rows;
  document.getElementById('executionsCount').textContent = `${allData.executions.length} רשומות`;
}

function updateCashFlowsTable() {
  const tbody = document.querySelector('#cashFlowsTable tbody');
  if (!tbody) return;

  if (allData.cashFlows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="12" class="text-center">אין נתונים</td></tr>';
    return;
  }

  const rows = allData.cashFlows.map(cashFlow => {
    // המרת סוגים לעברית לפילטר
    const typeForFilter = cashFlow.type === 'deposit' ? 'הפקדה' :
      cashFlow.type === 'withdrawal' ? 'משיכה' :
        cashFlow.type === 'dividend' ? 'דיבידנד' :
          cashFlow.type === 'fee' ? 'עמלה' :
            cashFlow.type === 'interest' ? 'ריבית' : (cashFlow.type || '');

    return `
    <tr>
      <td data-account="${cashFlow.account_id || ''}">${cashFlow.account_id || ''}</td>
      <td data-type="${typeForFilter}">${cashFlow.type || ''}</td>
      <td>${cashFlow.amount || 0}</td>
      <td data-date="${cashFlow.date}">${cashFlow.date || ''}</td>
      <td>${cashFlow.description || ''}</td>
      <td>${cashFlow.id || ''}</td>
      <td data-date="${cashFlow.created_at}">${cashFlow.created_at || ''}</td>
      <td>${cashFlow.currency || ''}</td>
      <td>${cashFlow.currency_id || ''}</td>
      <td>${cashFlow.usd_rate || 0}</td>
      <td>${cashFlow.source || ''}</td>
      <td>${cashFlow.external_id || ''}</td>
      <td class="actions-cell">
        <table class="table table-sm table-borderless mb-0">
          <tbody>
            <tr>
              <td class="p-0 pe-1">
                <button class="btn btn-sm btn-secondary" onclick="editCashFlow(${cashFlow.id})" title="ערוך">✏️</button>
              </td>
              <td class="p-0">
                <button class="btn btn-sm btn-danger" onclick="deleteCashFlow(${cashFlow.id})" title="מחק">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  `}).join('');

  tbody.innerHTML = rows;
  document.getElementById('cashFlowsCount').textContent = `${allData.cashFlows.length} רשומות`;
}

function updateAlertsTable() {
  const tbody = document.querySelector('#alertsTable tbody');
  if (!tbody) return;

  if (allData.alerts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="13" class="text-center">אין נתונים</td></tr>';
    return;
  }

  const rows = allData.alerts.map(alert => {
    // המרת סוגים לעברית לפילטר
    const typeForFilter = alert.type === 'price_alert' ? 'התראה על מחיר' :
      alert.type === 'stop_loss' ? 'סטופ לוס' :
        alert.type === 'volume_alert' ? 'התראה על נפח' :
          alert.type === 'custom_alert' ? 'התראה מותאמת' : (alert.type || '');

    // המרת סטטוס לעברית לפילטר
    const statusForFilter = alert.status === 'open' ? 'פתוח' :
      alert.status === 'closed' ? 'סגור' :
        alert.status === 'cancelled' ? 'מבוטל' : (alert.status || '');

    return `
    <tr>
      <td data-account="${alert.account_id || ''}">${alert.account_id || ''}</td>
      <td>${alert.ticker_id || ''}</td>
      <td data-type="${typeForFilter}">${alert.type || ''}</td>
      <td>${alert.condition || ''}</td>
      <td>${alert.message || ''}</td>
      <td data-status="${alert.is_active ? 'פעיל' : 'לא פעיל'}">${alert.is_active ? 'כן' : 'לא'}</td>
      <td data-date="${alert.triggered_at}">${alert.triggered_at || ''}</td>
      <td>${alert.id || ''}</td>
      <td data-date="${alert.created_at}">${alert.created_at || ''}</td>
      <td data-status="${statusForFilter}">${alert.status || ''}</td>
      <td>${alert.is_triggered || ''}</td>
      <td>${alert.related_type_id || ''}</td>
      <td>${alert.related_id || ''}</td>
      <td class="actions-cell">
        <table class="table table-sm table-borderless mb-0">
          <tbody>
            <tr>
              <td class="p-0 pe-1">
                <button class="btn btn-sm btn-secondary" onclick="editAlert(${alert.id})" title="ערוך">✏️</button>
              </td>
              <td class="p-0 pe-1">
                <button class="btn btn-sm btn-danger" onclick="deleteAlert(${alert.id})" title="מחק">🗑️</button>
              </td>
              <td class="p-0">
                ${alert.status === 'open' ? `
                <button class="btn btn-sm btn-secondary" onclick="cancelAlert(${alert.id})" title="ביטול">❌</button>
                ` : `
                <button class="btn btn-sm btn-cancel-disabled" disabled title="לא ניתן לבטל התראה סגורה">X</button>
                `}
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  `}).join('');

  tbody.innerHTML = rows;
  document.getElementById('alertsCount').textContent = `${allData.alerts.length} רשומות`;
}

function updateNotesTable() {
  const tbody = document.querySelector('#notesTable tbody');
  if (!tbody) return;

  if (allData.notes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">אין נתונים</td></tr>';
    return;
  }

  const rows = allData.notes.map(note => `
    <tr>
      <td>${note.id || ''}</td>
      <td>${note.content || ''}</td>
      <td>${note.attachment || ''}</td>
      <td data-date="${note.created_at}">${note.created_at || ''}</td>
      <td>${note.related_type_id || ''}</td>
      <td>${note.related_id || ''}</td>
      <td class="actions-cell">
        <table class="table table-sm table-borderless mb-0">
          <tbody>
            <tr>
              <td class="p-0 pe-1">
                <button class="btn btn-sm btn-secondary" onclick="editNote(${note.id})" title="ערוך">✏️</button>
              </td>
              <td class="p-0">
                <button class="btn btn-sm btn-danger" onclick="deleteNote(${note.id})" title="מחק">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  `).join('');

  tbody.innerHTML = rows;
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
  // TODO: לזהות איזה טבלה ולפתוח מודל הוספה מתאים
  alert('פונקציית הוספת רשומה תתווסף בקרוב');
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
function viewAccount(id) { console.log('צפייה בחשבון:', id); }
function editAccount(id) { console.log('עריכת חשבון:', id); }
function deleteAccount(id) { console.log('מחיקת חשבון:', id); }

function viewTrade(id) { console.log('צפייה בטרייד:', id); }
function editTrade(id) { console.log('עריכת טרייד:', id); }
function deleteTrade(id) { console.log('מחיקת טרייד:', id); }

function viewTicker(id) { console.log('צפייה בטיקר:', id); }
function editTicker(id) { console.log('עריכת טיקר:', id); }
function deleteTicker(id) { console.log('מחיקת טיקר:', id); }

function viewTradePlan(id) { console.log('צפייה בתוכנית:', id); }
function editTradePlan(id) { console.log('עריכת תוכנית:', id); }
function deleteTradePlan(id) { console.log('מחיקת תוכנית:', id); }

function viewExecution(id) { console.log('צפייה בביצוע:', id); }
function editExecution(id) { console.log('עריכת ביצוע:', id); }
function deleteExecution(id) { console.log('מחיקת ביצוע:', id); }

function viewCashFlow(id) { console.log('צפייה בתזרים:', id); }
function editCashFlow(id) { console.log('עריכת תזרים:', id); }
function deleteCashFlow(id) { console.log('מחיקת תזרים:', id); }

function viewAlert(id) { console.log('צפייה בהתראה:', id); }
function editAlert(id) { console.log('עריכת התראה:', id); }
function deleteAlert(id) { console.log('מחיקת התראה:', id); }

function viewNote(id) { console.log('צפייה בהערה:', id); }
function editNote(id) { console.log('עריכת הערה:', id); }
function deleteNote(id) { console.log('מחיקת הערה:', id); }

function viewCurrency(id) { console.log('צפייה במטבע:', id); }
function editCurrency(id) { console.log('עריכת מטבע:', id); }
function deleteCurrency(id) { console.log('מחיקת מטבע:', id); }

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
window.viewCurrency = viewCurrency;
window.editCurrency = editCurrency;
window.deleteCurrency = deleteCurrency;

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
