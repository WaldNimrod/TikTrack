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
 * - notification-system.js (for notifications)
 * 
 * Table Mapping:
 * - Uses all table types from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 * 
 * File: trading-ui/scripts/database.js
 * Version: 2.3
 * Last Updated: August 28, 2025
 */

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

// פונקציה לבדיקה אם ערך הוא מספרי (משתמש בפונקציה הגלובלית)
function isNumeric(value) {
  // בדיקה ישירה ללא קריאה לפונקציה הגלובלית כדי למנוע לולאה אינסופית
  if (value === null || value === undefined || value === '') {
    return false;
  }
  return !isNaN(parseFloat(value)) && isFinite(value);
}

// פונקציה לעיצוב מספרים (משתמש בפונקציה הגלובלית)
function formatNumber(value) {
  // בדיקה ישירה ללא קריאה לפונקציה הגלובלית כדי למנוע לולאה אינסופית
  if (!isNumeric(value)) {
    return value || '';
  }
  return parseFloat(value).toLocaleString('he-IL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

// פונקציה ליצירת כפתור עריכה
function createEditButton(onClick) {
  return `<button class="btn btn-sm btn-secondary" onclick="${onClick}" title="ערוך">✏️</button>`;
}

// פונקציה ליצירת כפתור מחיקה - משתמשת בפונקציה הגלובלית
function createDeleteButton(onClick) {
  return window.createDeleteButton ? window.createDeleteButton(onClick) : `<button class="btn btn-sm btn-danger" onclick="${onClick}" title="מחק">🗑️</button>`;
}

// ===== מנגנון ניהול סקשנים חדש =====

// פונקציה לפתיחה/סגירה של סקשן עליון (פותח/סוגר את כל הסקשנים)
function toggleTopSection() {
  console.log('🔧 toggleTopSection - פתיחה/סגירה של כל הסקשנים');
  
  const topSection = document.querySelector('.top-section .section-body');
  const contentSections = document.querySelectorAll('.content-section .section-body');
  const topToggleBtn = document.querySelector('.top-section button[onclick="toggleTopSection()"]');
  const topIcon = topToggleBtn ? topToggleBtn.querySelector('.filter-icon') : null;
  
  if (!topSection) {
    console.error('❌ לא נמצא top-section');
    return;
  }
  
  // בדיקה אם כל הסקשנים סגורים
  const isTopCollapsed = topSection.style.display === 'none';
  let allSectionsCollapsed = isTopCollapsed;
  
  contentSections.forEach(section => {
    if (section.style.display !== 'none') {
      allSectionsCollapsed = false;
    }
  });
  
  // אם כל הסקשנים סגורים - פתח את כולם
  // אם יש סקשנים פתוחים - סגור את כולם
  const shouldCollapse = !allSectionsCollapsed;
  
  // סגירה/פתיחה של top-section
  topSection.style.display = shouldCollapse ? 'none' : 'block';
  if (topIcon) {
    topIcon.textContent = shouldCollapse ? '▼' : '▲';
  }
  localStorage.setItem('dbDisplayTopSectionCollapsed', shouldCollapse);
  
  // סגירה/פתיחה של כל content-sections
  contentSections.forEach(section => {
    const sectionToggleBtn = section.parentElement.querySelector('button[onclick="toggleMainSection()"]');
    const sectionIcon = sectionToggleBtn ? sectionToggleBtn.querySelector('.filter-icon') : null;
    const sectionTitle = section.parentElement.querySelector('.table-title').textContent.trim();
    
    section.style.display = shouldCollapse ? 'none' : 'block';
    if (sectionIcon) {
      sectionIcon.textContent = shouldCollapse ? '▼' : '▲';
    }
    localStorage.setItem(`dbDisplaySectionHidden_${sectionTitle}`, shouldCollapse);
  });
  
  console.log('✅ toggleTopSection הושלם - כל הסקשנים:', shouldCollapse ? 'סגורים' : 'פתוחים');
}

// פונקציה לפתיחה/סגירה של סקשן תוכן בודד
function toggleMainSection() {
  console.log('🔧 toggleMainSection - פתיחה/סגירה של סקשן בודד');
  
  const clickedButton = window.event ? window.event.target.closest('button') : null;
  const currentSection = clickedButton ? clickedButton.closest('.content-section') : null;
  
  if (!currentSection) {
    console.error('❌ לא נמצא content-section');
    return;
  }
  
  const sectionBody = currentSection.querySelector('.section-body');
  const toggleBtn = currentSection.querySelector('button[onclick="toggleMainSection()"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;
  const sectionTitle = currentSection.querySelector('.table-title').textContent.trim();
  
  if (!sectionBody) {
    console.error('❌ לא נמצא section-body');
    return;
  }
  
  const isCollapsed = sectionBody.style.display === 'none';
  
  // החלפת מצב
  sectionBody.style.display = isCollapsed ? 'block' : 'none';
  if (icon) {
    icon.textContent = isCollapsed ? '▲' : '▼';
  }
  
  // שמירת מצב
  localStorage.setItem(`dbDisplaySectionHidden_${sectionTitle}`, !isCollapsed);
  
  console.log('✅ toggleMainSection הושלם - סקשן:', sectionTitle, isCollapsed ? 'נפתח' : 'נסגר');
}

// פונקציה לשחזור מצב הסקשנים
function restoreDatabaseSectionState() {
  console.log('🔧 restoreDatabaseSectionState - שחזור מצב הסקשנים');
  
  // שחזור top section
  const topSectionHidden = localStorage.getItem('dbDisplayTopSectionCollapsed') === 'true';
  const topSection = document.querySelector('.top-section .section-body');
  const topToggleBtn = document.querySelector('.top-section button[onclick="toggleTopSection()"]');
  const topIcon = topToggleBtn ? topToggleBtn.querySelector('.filter-icon') : null;
  
  if (topSection && topIcon) {
    topSection.style.display = topSectionHidden ? 'none' : 'block';
    topIcon.textContent = topSectionHidden ? '▼' : '▲';
  }
  
  // שחזור content sections
  const contentSections = document.querySelectorAll('.content-section');
  contentSections.forEach(section => {
    const sectionTitle = section.querySelector('.table-title')?.textContent.trim();
    if (sectionTitle) {
      const isHidden = localStorage.getItem(`dbDisplaySectionHidden_${sectionTitle}`) === 'true';
      const sectionBody = section.querySelector('.section-body');
      const toggleBtn = section.querySelector('button[onclick="toggleMainSection()"]');
      const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;
      
      if (sectionBody && icon) {
        sectionBody.style.display = isHidden ? 'none' : 'block';
        icon.textContent = isHidden ? '▼' : '▲';
      }
    }
  });
  
  console.log('✅ restoreDatabaseSectionState הושלם');
}

// פונקציה לטעינת נתונים מכל הטבלאות
async function loadAllDatabaseData() {
  console.log('🔄 טוען נתונים מכל הטבלאות...');
  
  try {
    // טעינת נתונים מכל הטבלאות במקביל עם טיפול בשגיאות
    const endpoints = [
      { name: 'accounts', url: 'http://localhost:8080/api/v1/accounts/' },
      { name: 'trades', url: 'http://localhost:8080/api/v1/trades/' },
      { name: 'tickers', url: 'http://localhost:8080/api/v1/tickers/' },
      { name: 'trade_plans', url: 'http://localhost:8080/api/v1/trade_plans/' },
      { name: 'executions', url: 'http://localhost:8080/api/v1/executions/' },
      { name: 'alerts', url: 'http://localhost:8080/api/v1/alerts/' },
      { name: 'notes', url: 'http://localhost:8080/api/v1/notes/' }
    ];

    const results = await Promise.allSettled(
      endpoints.map(endpoint => 
        fetch(endpoint.url)
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.json();
          })
          .then(data => ({ name: endpoint.name, data: data.data || data }))
          .catch(error => {
            console.warn(`⚠️ שגיאה בטעינת ${endpoint.name}:`, error);
            return { name: endpoint.name, data: [] };
          })
      )
    );

    // עיבוד התוצאות
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        const { name, data } = result.value;
        switch (name) {
          case 'accounts': allData.accounts = data; break;
          case 'trades': allData.trades = data; break;
          case 'tickers': allData.tickers = data; break;
          case 'trade_plans': allData.trade_plans = data; break;
          case 'executions': allData.executions = data; break;
          case 'alerts': allData.alerts = data; break;
          case 'notes': allData.notes = data; break;
        }
      }
    });

    // עדכון הסטטיסטיקות
    updateSummaryStats();
    
    // עדכון כל הטבלאות
    updateAllTables();
    
    console.log('✅ נתונים נטענו בהצלחה');
    console.log('📊 סיכום נתונים:', {
      accounts: allData.accounts.length,
      trades: allData.trades.length,
      tickers: allData.tickers.length,
      trade_plans: allData.trade_plans.length,
      executions: allData.executions.length,
      alerts: allData.alerts.length,
      notes: allData.notes.length
    });
  } catch (error) {
    console.error('❌ שגיאה בטעינת נתונים:', error);
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בטעינת נתונים', 'לא ניתן לטעון נתונים מהשרת');
    }
  }
}

// פונקציה לעדכון סטטיסטיקות
function updateSummaryStats() {
  // עדכון סטטיסטיקות ספציפיות לעמוד זה
  const elements = {
    'accountsStats': allData.accounts.length,
    'tradesStats': allData.trades.length,
    'tickersStats': allData.tickers.length,
    'alertsStats': allData.alerts.length
  };
  
  Object.entries(elements).forEach(([id, count]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = count;
    }
  });
}

// פונקציה לעדכון כל הטבלאות
function updateAllTables() {
  updateTable('accounts', allData.accounts);
  updateTable('trades', allData.trades);
  updateTable('tickers', allData.tickers);
  updateTable('trade_plans', allData.trade_plans);
  updateTable('executions', allData.executions);
  updateTable('alerts', allData.alerts);
  updateTable('notes', allData.notes);
}

// פונקציה לעדכון טבלה ספציפית
function updateTable(tableType, data) {
  const table = document.querySelector(`[data-table-type="${tableType}"]`);
  if (!table) {
    console.warn(`⚠️ לא נמצאה טבלה מסוג: ${tableType}`);
    return;
  }

  const tbody = table.querySelector('tbody');
  if (!tbody) {
    console.warn(`⚠️ לא נמצא tbody לטבלה: ${tableType}`);
    return;
  }

  // ניקוי הטבלה
  tbody.innerHTML = '';

  // בדיקה שהנתונים תקינים
  if (!data || !Array.isArray(data)) {
    console.warn(`⚠️ נתונים לא תקינים לטבלה ${tableType}:`, data);
    const row = document.createElement('tr');
    const columnCount = table.querySelectorAll('thead th').length;
    row.innerHTML = `<td colspan="${columnCount}" class="text-center">שגיאה בטעינת נתונים</td>`;
    tbody.appendChild(row);
    return;
  }

  if (data.length === 0) {
    const row = document.createElement('tr');
    const columnCount = table.querySelectorAll('thead th').length;
    row.innerHTML = `<td colspan="${columnCount}" class="text-center">לא נמצאו נתונים</td>`;
    tbody.appendChild(row);
    return;
  }

  // הוספת שורות נתונים
  data.forEach(item => {
    const row = document.createElement('tr');
    const columnMappings = TABLE_COLUMN_MAPPINGS[tableType] || [];
    
    columnMappings.forEach(field => {
      const cell = document.createElement('td');
      const value = item[field];
      
      // עיצוב ערכים מיוחדים
      if (isNumeric(value)) {
        cell.textContent = formatNumber(value);
      } else if (field === 'created_at' || field === 'updated_at' || field === 'date') {
        cell.textContent = value ? new Date(value).toLocaleDateString('he-IL') : '';
      } else {
        cell.textContent = value || '';
      }
      
      row.appendChild(cell);
    });

    // הוספת עמודת פעולות
    const actionsCell = document.createElement('td');
    let actionsHtml = `
      ${createEditButton(`editRecord('${tableType}', ${item.id})`)}
      ${createDeleteButton(`deleteRecord('${tableType}', ${item.id})`)}
    `;
    
    // הוספת כפתור ביטול לטבלאות עם שדה סטטוס
    if (item.status && item.status !== 'cancelled' && item.status !== 'canceled') {
      actionsHtml += `<button class="btn btn-sm btn-warning" onclick="cancelRecord('${tableType}', ${item.id})" title="בטל"><span class="cancel-icon">X</span></button>`;
    }
    
    actionsCell.innerHTML = actionsHtml;
    row.appendChild(actionsCell);

    tbody.appendChild(row);
  });

  // עדכון מונה הרשומות
  const countElement = document.getElementById(`${tableType.replace('_', '')}Count`);
  if (countElement) {
    countElement.textContent = `${data.length} רשומות`;
  }
}

// פונקציות עריכה ומחיקה
function editRecord(tableType, id) {
  console.log(`✏️ עריכת רשומה: ${tableType} - ${id}`);
  if (window.showSuccessNotification) {
    window.showSuccessNotification('עריכה', `עריכת רשומה ${tableType} מספר ${id}`);
  }
}

function deleteRecord(tableType, id) {
  console.log(`🗑️ מחיקת רשומה: ${tableType} - ${id}`);
  if (window.showDeleteWarning) {
    window.showDeleteWarning(
      'רשומה',
      `האם אתה בטוח שברצונך למחוק רשומה זו?`,
      'מחיקה',
      () => {
        console.log(`✅ מחיקה אושרה: ${tableType} - ${id}`);
        if (window.showSuccessNotification) {
          window.showSuccessNotification('מחיקה', 'הרשומה נמחקה בהצלחה');
        }
      }
    );
  }
}

// פונקציה לביטול רשומה
function cancelRecord(tableType, id) {
  console.log(`❌ ביטול רשומה: ${tableType} - ${id}`);
  if (window.showConfirmationDialog) {
    window.showConfirmationDialog(
      'ביטול רשומה',
      `האם אתה בטוח שברצונך לבטל רשומה זו?`,
      'ביטול',
      'חזור',
      () => {
        console.log(`✅ ביטול אושר: ${tableType} - ${id}`);
        if (window.showSuccessNotification) {
          window.showSuccessNotification('ביטול', 'הרשומה בוטלה בהצלחה');
        }
        // כאן תהיה קריאה ל-API לביטול הרשומה
      }
    );
  }
}

// פונקציה להוספת רשומה
function addRecord() {
  console.log('➕ הוספת רשומה חדשה');
  if (window.showSuccessNotification) {
    window.showSuccessNotification('הוספה', 'פתיחת טופס הוספת רשומה חדשה');
  }
}

// אתחול העמוד
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔄 אתחול עמוד בסיס נתונים...');
  
  // בדיקת זמינות פונקציות גלובליות
  console.log('🔍 בדיקת זמינות פונקציות:');
  console.log('- toggleTopSectionGlobal:', typeof window.toggleTopSectionGlobal);
  console.log('- toggleMainSection:', typeof window.toggleMainSection);
  console.log('- restoreAllSectionStates:', typeof window.restoreAllSectionStates);
  console.log('- showSuccessNotification:', typeof window.showSuccessNotification);
  console.log('- showErrorNotification:', typeof window.showErrorNotification);
  console.log('- showDeleteWarning:', typeof window.showDeleteWarning);
  
  // שחזור מצב הסקשנים
  restoreDatabaseSectionState();
  
  // טעינת נתונים
  loadAllDatabaseData();
});


