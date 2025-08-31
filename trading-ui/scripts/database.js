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
    handleDataLoadError(error, 'plans');
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
  
  let statsData;
  
  // אם לא הועברו נתונים, השתמש בנתונים הגלובליים
  if (!data) {
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
// externalFilterPresent מוגדר ב-tables.js - לא מגדירים כאן

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
            handleApiError(new Error(`HTTP ${response.status}: ${data.error?.message || data.message}`), 'API_RESPONSE', `שגיאה בתגובה: ${response.status}`);
            throw new Error(data.error?.message || data.message || `HTTP ${response.status}`);
        }
        
        console.log('✅ תגובה מוצלחת:', data);
        return data;
    } catch (error) {
        handleApiError(error, 'API_CALL', `שגיאה ב-${endpoint}`);
        throw error;
    }
}

// הגדרת עמודות הגריד הסטנדרטיות
// getDefaultColumnDefs מוגדר ב-tables.js - לא מגדירים כאן

// פונקציה ליצירת גריד - לא בשימוש (ag-grid לא נטען)
function createGrid(containerId, columnDefs = null, rowData = null) {
  console.log('⚠️ createGrid לא נתמך - ag-grid לא נטען');
  return null;
}

// פונקציה לעדכון נתונים בגריד - לא בשימוש (ag-grid לא נטען)
function updateGridData(newData) {
  console.log('⚠️ updateGridData לא נתמך - ag-grid לא נטען');
}

// פונקציה לייצוא נתונים - לא בשימוש (ag-grid לא נטען)
function exportGridData(format = 'csv') {
  console.log('⚠️ exportGridData לא נתמך - ag-grid לא נטען');
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

// פונקציה ליצירת כפתור מחיקה
function createDeleteButton(onClick) {
  return `<button class="btn btn-sm btn-danger" onclick="${onClick}" title="מחק">🗑️</button>`;
}

// פונקציה להפעלה מחדש של רשומה מבוטלת
async function reactivateRecord(tableType, recordId) {
  try {
    console.log(`🔄 הפעלה מחדש של רשומה: ${tableType} ID: ${recordId}`);
    
    // שימוש בפונקציה הכללית להפעלה מחדש
    if (window.uiUtils && window.uiUtils.performItemReactivation) {
      await window.uiUtils.performItemReactivation(tableType, recordId, `רשומה ${recordId}`);
    } else {
      // fallback אם הפונקציה הכללית לא זמינה
      const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
      let response;
      
      switch (tableType) {
        case 'trades':
          response = await fetch(`${base}/api/v1/trades/${recordId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'open' })
          });
          break;
        case 'trade_plans':
          response = await fetch(`${base}/api/v1/trade_plans/${recordId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'open' })
          });
          break;
        case 'accounts':
          response = await fetch(`${base}/api/v1/accounts/${recordId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'active' })
          });
          break;
        case 'tickers':
          response = await fetch(`${base}/api/v1/tickers/${recordId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'active' })
          });
          break;
        case 'alerts':
          response = await fetch(`${base}/api/v1/alerts/${recordId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'active' })
          });
          break;
        default:
          throw new Error(`לא נתמך הפעלה מחדש עבור ${tableType}`);
      }
      
      if (response.ok) {
        console.log(`✅ רשומה הופעלה מחדש בהצלחה: ${tableType} ID: ${recordId}`);
        // רענון הנתונים
        loadAllDatabaseData();
        // הצגת הודעת הצלחה
        if (window.showSuccessNotification) {
          window.showSuccessNotification(`${tableType} הופעל מחדש בהצלחה!`);
        }
      } else {
        throw new Error(`שגיאה בהפעלה מחדש: ${response.status}`);
      }
    }
  } catch (error) {
    handleSystemError(error, 'RECORD_REACTIVATION');
    if (window.showErrorNotification) {
      window.showErrorNotification(`שגיאה בהפעלה מחדש: ${error.message}`);
    }
  }
}

// פונקציה לביטול רשומה - משתמשת בפונקציות הכלליות
async function cancelRecord(tableType, recordId) {
  try {
    console.log(`🔄 ביטול רשומה: ${tableType} ID: ${recordId}`);
    
    // שימוש בפונקציה הכללית לביטול
    if (window.uiUtils && window.uiUtils.performItemCancellation) {
      await window.uiUtils.performItemCancellation(tableType, recordId, `רשומה ${recordId}`);
    } else {
      // fallback אם הפונקציה הכללית לא זמינה
      const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
      let response;
      
      switch (tableType) {
        case 'trades':
          response = await fetch(`${base}/api/v1/trades/${recordId}/cancel`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cancel_reason: 'בוטל על ידי המשתמש' })
          });
          break;
        case 'trade_plans':
          response = await fetch(`${base}/api/v1/trade_plans/${recordId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'cancelled' })
          });
          break;
        case 'accounts':
          response = await fetch(`${base}/api/v1/accounts/${recordId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'cancelled' })
          });
          break;
        case 'tickers':
          response = await fetch(`${base}/api/v1/tickers/${recordId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'canceled' })
          });
          break;
        case 'alerts':
          response = await fetch(`${base}/api/v1/alerts/${recordId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'cancelled' })
          });
          break;
        default:
          throw new Error(`לא נתמך ביטול עבור ${tableType}`);
      }
      
      if (response.ok) {
        console.log(`✅ רשומה בוטלה בהצלחה: ${tableType} ID: ${recordId}`);
        // רענון הנתונים
        loadAllDatabaseData();
        // הצגת הודעת הצלחה
        if (window.showSuccessNotification) {
          window.showSuccessNotification(`${tableType} בוטל בהצלחה!`);
        }
      } else {
        throw new Error(`שגיאה בביטול: ${response.status}`);
      }
    }
  } catch (error) {
    handleSystemError(error, 'RECORD_CANCELLATION');
    if (window.showErrorNotification) {
      window.showErrorNotification(`שגיאה בביטול: ${error.message}`);
    }
  }
}

// פונקציה לעדכון סטטיסטיקות הטבלאות
function updateTableStats() {
  console.log('🔄 updateTableStats נקראה');
  
  // עדכון ספירת תוכניות מסחר
  const tradePlansCount = document.getElementById('tradePlansCount');
  if (tradePlansCount && window.tradePlansData) {
    tradePlansCount.textContent = `${window.tradePlansData.length} תוכניות מסחר`;
  }
  
  // עדכון ספירת עסקאות
  const tradesCount = document.getElementById('tradesCount');
  if (tradesCount && window.tradesData) {
    tradesCount.textContent = `${window.tradesData.length} עסקאות`;
  }
  
  // עדכון ספירת חשבונות
  const accountsCount = document.getElementById('accountsCount');
  if (accountsCount && window.accountsData) {
    accountsCount.textContent = `${window.accountsData.length} חשבונות`;
  }
  
  // עדכון ספירת טיקרים
  const tickersCount = document.getElementById('tickersCount');
  if (tickersCount && window.tickersData) {
    tickersCount.textContent = `${window.tickersData.length} טיקרים`;
  }
  
  // עדכון ספירת ביצועים
  const executionsCount = document.getElementById('executionsCount');
  if (executionsCount && window.executionsData) {
    executionsCount.textContent = `${window.executionsData.length} ביצועים`;
  }
  
  // עדכון ספירת התראות
  const alertsCount = document.getElementById('alertsCount');
  if (alertsCount && window.alertsData) {
    alertsCount.textContent = `${window.alertsData.length} התראות`;
  }
  
  // עדכון ספירת הערות
  const notesCount = document.getElementById('notesCount');
  if (notesCount && window.notesData) {
    notesCount.textContent = `${window.notesData.length} הערות`;
  }
  
  console.log('✅ updateTableStats הושלם');
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
    handleElementNotFound('top-section');
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
    handleElementNotFound('content-section');
    return;
  }
  
  const sectionBody = currentSection.querySelector('.section-body');
  const toggleBtn = currentSection.querySelector('button[onclick="toggleMainSection()"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;
  const sectionTitle = currentSection.querySelector('.table-title').textContent.trim();
  
  if (!sectionBody) {
    handleElementNotFound('section-body');
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
  console.log('🔄 loadAllDatabaseData נקראה');
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
    
    // עדכון סטטיסטיקות הטבלאות
    updateTableStats();
    
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
    handleDataLoadError(error, 'database');
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
  console.log(`🔄 updateTable נקראה עבור ${tableType} עם ${data?.length || 0} רשומות`);
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
    
    // הגדרת מיפוי עמודות לפי סוג הטבלה
    let columnMappings = [];
    switch (tableType) {
      case 'trades':
        columnMappings = ['id', 'account_id', 'ticker_id', 'trade_plan_id', 'status', 'investment_type', 'side', 'opened_at', 'closed_at', 'cancelled_at', 'cancel_reason', 'total_pl', 'notes', 'created_at'];
        break;
      case 'accounts':
        columnMappings = ['id', 'name', 'currency_id', 'status', 'cash_balance', 'total_value', 'total_pl', 'notes', 'created_at'];
        break;
      case 'trade_plans':
        columnMappings = ['id', 'account_id', 'ticker_id', 'investment_type', 'side', 'status', 'planned_amount', 'entry_conditions', 'stop_price', 'target_price', 'reasons', 'cancelled_at', 'cancel_reason', 'created_at'];
        break;
      case 'tickers':
        columnMappings = ['id', 'symbol', 'name', 'type', 'remarks', 'currency_id', 'active_trades', 'status', 'created_at', 'updated_at'];
        break;
      case 'executions':
        columnMappings = ['id', 'trade_id', 'action', 'date', 'quantity', 'price', 'fee', 'source', 'created_at', 'external_id', 'notes'];
        break;
      case 'alerts':
        columnMappings = ['id', 'condition', 'condition_display_text', 'status', 'related_type', 'related_id', 'trade_id', 'trade_plan_id', 'account_id', 'ticker_id', 'is_triggered', 'created_at'];
        break;
      case 'notes':
        columnMappings = ['id', 'content', 'related_type', 'related_id', 'related_type_id', 'attachment', 'created_at'];
        break;
      default:
        console.warn(`⚠️ לא מוגדר מיפוי עמודות עבור ${tableType}`);
        return;
    }
    
    columnMappings.forEach(field => {
      const cell = document.createElement('td');
      let value = item[field];
      
      // עיצוב ערכים מיוחדים
      if (isNumeric(value)) {
        cell.textContent = formatNumber(value);
      } else if (field === 'created_at' || field === 'updated_at' || field === 'opened_at' || field === 'closed_at' || field === 'cancelled_at' || field === 'executed_at') {
        cell.textContent = value ? new Date(value).toLocaleDateString('he-IL') : '';
      } else {
        cell.textContent = value || '';
      }
      
      row.appendChild(cell);
    });

    // הוספת עמודת פעולות
    const actionsCell = document.createElement('td');
    actionsCell.className = 'actions-cell';
    let actionsHtml = `
      ${createEditButton(`editRecord('${tableType}', ${item.id})`)}
      ${createDeleteButton(`deleteRecord('${tableType}', ${item.id})`)}
    `;
    
    // הוספת כפתור ביטול/הפעלה מחדש לטבלאות עם שדה סטטוס
    if (item.status) {
      // שימוש בפונקציה הכללית ליצירת כפתור ביטול/הפעלה מחדש
      if (window.uiUtils && window.uiUtils.createCancelButton) {
        actionsHtml += window.uiUtils.createCancelButton(tableType, item.id, item.status, 'sm');
      } else {
        // fallback אם הפונקציה הכללית לא זמינה
        const isCancelled = item.status === 'cancelled' || item.status === 'canceled';
        const buttonClass = isCancelled ? 'btn-success' : 'btn-danger';
        const title = isCancelled ? 'הפעל מחדש' : 'בטל';
        const onclick = isCancelled ? `reactivateRecord('${tableType}', ${item.id})` : `cancelRecord('${tableType}', ${item.id})`;
        
        actionsHtml += `<button class="btn btn-sm ${buttonClass}" onclick="${onclick}" title="${title}"><span class="cancel-icon">${isCancelled ? '↻' : 'X'}</span></button>`;
      }
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
// getDefaultColumnDefs מוגדר ב-tables.js - לא מייצאים כאן
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

