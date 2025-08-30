// ===== קובץ JavaScript לדף נתונים נוספים =====
/*
 * db-extradata.js - Database Extra Data Page Management
 * ===================================================
 * 
 * This file contains all database extra data page functionality for the TikTrack application.
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
 * File: trading-ui/scripts/db-extradata.js
 * Version: 2.4
 * Last Updated: August 28, 2025
 */

// ===== GRID DATA MANAGEMENT =====
// נתוני דוגמה סטנדרטיים
const getDefaultRowData = () => [
  { ticker: "AAPL", date: "2025-08-01", type: "סווינג", amount: "$25,000 (#100)", target: "$210 (12.3%)", stop: "$180 (-6.7%)", current: "$184.32 (+1.2%)", status: "פתוח", action: "⬅️", account: "חשבון ראשי" },
  { ticker: "TSLA", date: "2025-07-30", type: "השקעה", amount: "$20,000 (#100)", target: "$780 (10.1%)", stop: "$690 (-4.8%)", current: "$688.90 (-2.1%)", status: "סגור", action: "⬅️", account: "חשבון משני" },
  { ticker: "NVDA", date: "2025-07-28", type: "השקעה", amount: "$15,000 (#75)", target: "$540 (8.2%)", stop: "$480 (-4.5%)", current: "$503.20 (+0.5%)", status: "פתוח", action: "⬅️", account: "חשבון ראשי" },
  { ticker: "AMZN", date: "2025-07-27", type: "פאסיבי", amount: "$10,000 (#50)", target: "$140 (6.3%)", stop: "$126 (-3.1%)", current: "$129.00 (-1.0%)", status: "מבוטל", action: "⬅️", account: "חשבון משני" },
  { ticker: "GOOG", date: "2025-07-26", type: "השקעה", amount: "$20,000 (#60)", target: "$148 (9.0%)", stop: "$130 (-3.4%)", current: "$141.00 (+1.6%)", status: "פתוח", action: "⬅️", account: "חשבון ראשי" },
  { ticker: "MSFT", date: "2025-07-25", type: "סווינג", amount: "$18,000 (#90)", target: "$355 (11.2%)", stop: "$320 (-4.2%)", current: "$342.00 (+2.4%)", status: "סגור", action: "⬅️", account: "חשבון משני" }
];

// פונקציה לטעינת נתונים מהשרת
async function loadPlansFromServer() {
  try {
    console.log('Loading plans from server...');
    
    // כאן תהיה קריאה לשרת האמיתי
    // const response = await fetch('/api/plans');
    // const data = await response.json();
    
    // כרגע נחזיר נתוני דוגמה
    const data = getDefaultRowData();
    
    console.log('Plans loaded from server:', data.length, 'items');
    return data;
  } catch (error) {
    console.error('Error loading plans from server:', error);
    // במקרה של שגיאה, נחזיר נתוני דוגמה
    return getDefaultRowData();
  }
}

// פונקציה לחילוץ סכום מהשדה amount
function extractAmount(amountString) {
  if (!amountString) return 0;
  
  // מחפש מספר אחרי הסימן $ ולפני הסימן (
  const match = amountString.match(/\$([0-9,]+)/);
  if (match) {
    // מסיר פסיקים וממיר למספר
    return parseFloat(match[1].replace(/,/g, ''));
  }
  
  // אם לא מצאנו $, נחפש מספר רגיל
  const numberMatch = amountString.match(/[\d,]+/);
  if (numberMatch) {
    return parseInt(numberMatch[0].replace(/,/g, ''));
  }
  
  return 0;
}

// פונקציה לעדכון סטטיסטיקות
function updateSummaryStats(data = null) {
  console.log('=== updateSummaryStats called ===');
  console.log('Input data:', data);
  console.log('window.rowData:', window.rowData);
  console.log('window.gridApi exists:', !!window.gridApi);
  
  let statsData;
  
  // אם לא הועברו נתונים, השתמש בנתונים המוצגים בגריד (כמו בדף התכנונים)
  if (!data && window.gridApi) {
    const displayedRows = [];
    window.gridApi.forEachNodeAfterFilter(node => {
      displayedRows.push(node.data);
    });
    statsData = displayedRows;
    console.log('Using displayed rows from grid:', statsData);
  } else if (!data) {
    statsData = window.rowData || [];
    console.log('Using window.rowData:', statsData);
  } else {
    statsData = data;
    console.log('Using provided data:', statsData);
  }
  
  console.log('Stats data to process:', statsData);
  console.log('Stats data length:', statsData.length);
  
  if (statsData.length === 0) {
    console.log('No data to calculate statistics');
    // עדכון תצוגה עם אפסים
    updateStatsDisplay({
      totalRecords: 0,
      totalAmount: 0,
      averageAmount: 0
    });
    return;
  }
  
  // חישוב סטטיסטיקות כלליות
  const totalRecords = statsData.length;
  let totalAmount = 0;
  
  // חישוב סכום כולל
  statsData.forEach(record => {
    try {
      const amount = extractAmount(record.amount);
      totalAmount += amount;
    } catch (error) {
      console.warn('Error extracting amount from record:', record, error);
    }
  });
  
  const averageAmount = totalRecords > 0 ? totalAmount / totalRecords : 0;
  
  // עדכון תצוגה
  updateStatsDisplay({
    totalRecords,
    totalAmount,
    averageAmount
  });
  
  console.log('Statistics calculated:', {
    totalRecords,
    totalAmount,
    averageAmount
  });
}

// פונקציה לעדכון תצוגת הסטטיסטיקות
function updateStatsDisplay(stats) {
  const elements = {
    'totalRecords': stats.totalRecords,
    'totalAmount': formatCurrency(stats.totalAmount),
    'averageAmount': formatCurrency(stats.averageAmount)
  };
  
  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });
}

// פונקציה לעיצוב מטבע
function formatCurrency(amount) {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// ===== GRID CORE FUNCTIONS =====
// משתנים גלובליים
let externalFilterPresent = false;

// פונקציית API כללית
async function apiCall(endpoint, options = {}) {
    const baseUrl = 'http://127.0.0.1:8080';
    const url = `${baseUrl}${endpoint}`;
    
    // הגדרת headers
    let headers = {};
    
    // אם יש FormData, לא שולח Content-Type
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    
    // הוספת headers נוספים אם יש
    if (options.headers) {
        headers = { ...headers, ...options.headers };
    }

    const finalOptions = { 
        ...options,
        headers
    };

    try {
        console.log('📡 שולח בקשה ל:', url);
        console.log('📋 סוג body:', options.body instanceof FormData ? 'FormData' : 'JSON');
        
        const response = await fetch(url, finalOptions);
        const data = await response.json();
        
        if (!response.ok) {
            console.error('❌ שגיאה בתגובה:', response.status, data);
            throw new Error(data.error?.message || data.message || `HTTP ${response.status}`);
        }
        
        console.log('✅ תגובה מוצלחת:', data);
        return data;
    } catch (error) {
        console.error(`❌ שגיאת API (${endpoint}):`, error);
        throw error;
    }
}

// הגדרת עמודות הגריד הסטנדרטיות
const getDefaultColumnDefs = () => [
  { 
    headerName: "המרה", 
    field: "action", 
    width: 60,
    minWidth: 50,
    maxWidth: 80,
    cellRenderer: params => `<span style="cursor: pointer; font-size: 1.2rem;">${params.value}</span>`
  },
  { 
    headerName: "סטטוס", 
    field: "status", 
    width: 80,
    minWidth: 70,
    maxWidth: 100, 
    cellClass: params => `badge-status ${params.value}`,
    filter: true,
    filterParams: {
      filterOptions: ['equals', 'notEqual'],
      defaultOption: 'equals'
    }
  },
  { 
    headerName: "נוכחי", 
    field: "current", 
    width: 120,
    minWidth: 100,
    maxWidth: 150, 
    cellClass: params => params.value.includes("(+") ? 'positive' : params.value.includes("(-") ? 'negative' : '' 
  },
  { 
    headerName: "סטופ", 
    field: "stop", 
    width: 120,
    minWidth: 100,
    maxWidth: 150, 
    cellClass: params => params.value.includes("(+") ? 'positive' : params.value.includes("(-") ? 'negative' : '' 
  },
  { 
    headerName: "יעד", 
    field: "target", 
    width: 120,
    minWidth: 100,
    maxWidth: 150, 
    cellClass: params => params.value.includes("(+") ? 'positive' : params.value.includes("(-") ? 'negative' : '' 
  },
  { 
    headerName: "סכום/כמות", 
    field: "amount", 
    width: 140,
    minWidth: 120,
    maxWidth: 160
  },
  { 
    headerName: "סוג", 
    field: "type", 
    width: 100,
    minWidth: 80,
    maxWidth: 120,
    filter: true,
    filterParams: {
      filterOptions: ['equals', 'notEqual'],
      defaultOption: 'equals'
    }
  },
  { 
    headerName: "תאריך", 
    field: "date", 
    width: 100,
    minWidth: 80,
    maxWidth: 120,
    filter: true,
    filterParams: {
      filterOptions: ['equals', 'notEqual', 'greaterThan', 'lessThan'],
      defaultOption: 'equals'
    }
  },
  { 
    headerName: "טיקר", 
    field: "ticker", 
    width: 80,
    minWidth: 60,
    maxWidth: 100,
    filter: true,
    filterParams: {
      filterOptions: ['equals', 'notEqual', 'contains'],
      defaultOption: 'equals'
    }
  },
  { 
    headerName: "חשבון", 
    field: "account", 
    width: 120,
    minWidth: 100,
    maxWidth: 140,
    filter: true,
    filterParams: {
      filterOptions: ['equals', 'notEqual'],
      defaultOption: 'equals'
    }
  }
];

// פונקציה ליצירת גריד
function createGrid(containerId, columnDefs = null, rowData = null) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return null;
  }

  const gridOptions = {
    columnDefs: columnDefs || getDefaultColumnDefs(),
    rowData: rowData || getDefaultRowData(),
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 50
    },
    pagination: true,
    paginationPageSize: 20,
    domLayout: 'autoHeight',
    suppressRowClickSelection: true,
    enableRangeSelection: true,
    enableFillHandle: true,
    animateRows: true,
    onGridReady: (params) => {
      console.log('Grid ready:', containerId);
      window.gridApi = params.api;
      window.columnApi = params.columnApi;
      
      // עדכון סטטיסטיקות
      updateSummaryStats();
    },
    onFilterChanged: (params) => {
      console.log('Filter changed');
      updateSummaryStats();
    },
    onSortChanged: (params) => {
      console.log('Sort changed');
    }
  };

  new agGrid.Grid(container, gridOptions);
  return gridOptions;
}

// פונקציה לעדכון נתונים בגריד
function updateGridData(newData) {
  if (window.gridApi) {
    window.gridApi.setRowData(newData);
    updateSummaryStats(newData);
  }
}

// פונקציה לייצוא נתונים
function exportGridData(format = 'csv') {
  if (!window.gridApi) {
    console.error('Grid API not available');
    return;
  }

  try {
    let result;
    switch (format.toLowerCase()) {
      case 'csv':
        result = window.gridApi.getDataAsCsv();
        break;
      case 'excel':
        result = window.gridApi.getDataAsExcel();
        break;
      default:
        console.error('Unsupported export format:', format);
        return;
    }

    // יצירת קובץ להורדה
    const blob = new Blob([result], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grid_data_${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);

    console.log(`Data exported as ${format}`);
  } catch (error) {
    console.error('Export error:', error);
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
  localStorage.setItem('dbExtradataTopSectionCollapsed', shouldCollapse);
  
  // סגירה/פתיחה של כל content-sections
  contentSections.forEach(section => {
    const sectionToggleBtn = section.parentElement.querySelector('button[onclick="toggleMainSection()"]');
    const sectionIcon = sectionToggleBtn ? sectionToggleBtn.querySelector('.filter-icon') : null;
    const sectionTitle = section.parentElement.querySelector('.table-title').textContent.trim();
    
    section.style.display = shouldCollapse ? 'none' : 'block';
    if (sectionIcon) {
      sectionIcon.textContent = shouldCollapse ? '▼' : '▲';
    }
    localStorage.setItem(`dbExtradataSectionHidden_${sectionTitle}`, shouldCollapse);
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
  localStorage.setItem(`dbExtradataSectionHidden_${sectionTitle}`, !isCollapsed);
  
  console.log('✅ toggleMainSection הושלם - סקשן:', sectionTitle, isCollapsed ? 'נפתח' : 'נסגר');
}

// פונקציה לשחזור מצב הסקשנים
function restoreDatabaseSectionState() {
  console.log('🔧 restoreDatabaseSectionState - שחזור מצב הסקשנים');
  
  // שחזור top section
  const topSectionHidden = localStorage.getItem('dbExtradataTopSectionCollapsed') === 'true';
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
      const isHidden = localStorage.getItem(`dbExtradataSectionHidden_${sectionTitle}`) === 'true';
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
  console.log('🔄 אתחול עמוד נתונים נוספים...');
  
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

// ייצוא פונקציות גלובליות
window.loadPlansFromServer = loadPlansFromServer;
window.extractAmount = extractAmount;
window.updateSummaryStats = updateSummaryStats;
window.updateStatsDisplay = updateStatsDisplay;
window.formatCurrency = formatCurrency;
window.apiCall = apiCall;
window.getDefaultColumnDefs = getDefaultColumnDefs;
window.createGrid = createGrid;
window.updateGridData = updateGridData;
window.exportGridData = exportGridData;
window.toggleTopSection = toggleTopSection;
window.toggleMainSection = toggleMainSection;
window.restoreDatabaseSectionState = restoreDatabaseSectionState;
window.loadAllDatabaseData = loadAllDatabaseData;
window.updateSummaryStats = updateSummaryStats;
window.updateAllTables = updateAllTables;
window.updateTable = updateTable;
window.editRecord = editRecord;
window.deleteRecord = deleteRecord;
window.cancelRecord = cancelRecord;
window.addRecord = addRecord;

