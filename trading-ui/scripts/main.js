// ===== MAIN.JS - קובץ כללי לכל האתר =====
/**
 * קובץ JavaScript ראשי לאתר TikTrack
 * 
 * קובץ זה מכיל את הפונקציונליות הבסיסית של האפליקציה
 * כולל אתחול, ניווט, פונקציות עזר כלליות ומערכת התראות
 * 
 * כללי חשובים:
 * 1. פונקציות שקשורות רק לישות אחת מישויות בסיס הנתונים נכתבת בקובץ ייעודי משלה
 * 2. פונקציות כלליות הקשורות לכל העמודים או הישויות נכתבות בקובץ הזה
 * 3. קובץ זה כולל את כל הפונקציונליות מ-grid-table.js ו-grid-data.js
 * 
 * תכולת הקובץ:
 * - מערכת התראות גלובלית (showNotification, showSuccessNotification, וכו')
 * - פונקציות API כלליות (apiCall)
 * - הגדרות עמודות גריד סטנדרטיות
 * - פונקציות עזר כלליות (formatCurrency, formatDate, וכו')
 * - ניהול מצב האפליקציה
 * - פונקציות אתחול גריד
 * 
 * היררכיה: נטען ראשון, מכיל פונקציות בסיסיות
 */

// ===== GRID CORE FUNCTIONS =====
// קובץ ייעודי ללוגיקת הגריד הבסיסית - משותף לכל הדפים

// משתנים גלובליים
let externalFilterPresent = false;

// ===== מערכת התראות =====
/**
 * מערכת התראות גלובלית לאתר
 * 
 * מערכת זו מספקת הודעות משתמש יפות ומודרניות במקום alert() הסטנדרטי
 * ההתראות מוצגות בפינה הימנית העליונה של המסך ונעלמות אוטומטית
 * 
 * תכונות:
 * - 4 סוגי התראות: הצלחה, שגיאה, אזהרה, מידע
 * - אנימציות חלקות עם כניסה ויציאה
 * - זמן הצגה מותאם לכל סוג התראה
 * - כפתור סגירה ידני
 * - עיצוב מודרני עם blur effect
 * 
 * שימוש:
 * showSuccessNotification('כותרת', 'הודעה');
 * showErrorNotification('כותרת', 'הודעה');
 * showWarningNotification('כותרת', 'הודעה');
 * showInfoNotification('כותרת', 'הודעה');
 */

/**
 * פונקציה להצגת התראה
 * @param {string} title - כותרת ההתראה
 * @param {string} message - תוכן ההתראה
 * @param {string} type - סוג ההתראה (success, error, warning, info)
 * @param {number} duration - משך זמן בהצגה (במילישניות, ברירת מחדל: 4000)
 */
function showNotification(title, message, type = 'info', duration = 4000) {
  // יצירת container אם לא קיים
  let container = document.getElementById('notificationContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notificationContainer';
    container.className = 'notification-container';
    document.body.appendChild(container);
  }

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  notification.innerHTML = `
    <div class="notification-icon">${icons[type] || icons.info}</div>
    <div class="notification-content">
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(notification);

  // אנימציית כניסה
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // הסרה אוטומטית
  if (duration > 0) {
    setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }, duration);
  }
}

/**
 * פונקציות עזר להתראות
 * 
 * פונקציות אלו מספקות ממשק נוח להצגת התראות מסוגים שונים
 * כל פונקציה מגדירה זמן הצגה מותאם לסוג ההתראה
 */

/**
 * הצגת התראת הצלחה
 * @param {string} title - כותרת ההתראה
 * @param {string} message - תוכן ההתראה
 * @param {number} duration - משך זמן בהצגה (ברירת מחדל: 4000ms)
 */
function showSuccessNotification(title, message, duration = 4000) {
  showNotification(title, message, 'success', duration);
}

/**
 * הצגת התראת שגיאה
 * @param {string} title - כותרת ההתראה
 * @param {string} message - תוכן ההתראה
 * @param {number} duration - משך זמן בהצגה (ברירת מחדל: 6000ms)
 */
function showErrorNotification(title, message, duration = 6000) {
  showNotification(title, message, 'error', duration);
}

/**
 * הצגת התראת אזהרה
 * @param {string} title - כותרת ההתראה
 * @param {string} message - תוכן ההתראה
 * @param {number} duration - משך זמן בהצגה (ברירת מחדל: 5000ms)
 */
function showWarningNotification(title, message, duration = 5000) {
  showNotification(title, message, 'warning', duration);
}

/**
 * הצגת התראת מידע
 * @param {string} title - כותרת ההתראה
 * @param {string} message - תוכן ההתראה
 * @param {number} duration - משך זמן בהצגה (ברירת מחדל: 4000ms)
 */
function showInfoNotification(title, message, duration = 4000) {
  showNotification(title, message, 'info', duration);
}

/**
 * פונקציית API כללית
 * 
 * פונקציה זו מספקת ממשק אחיד לכל קריאות ה-API לאתר
 * כולל טיפול אוטומטי ב-headers, שגיאות ולוגים
 * 
 * @param {string} endpoint - נקודת הקצה של ה-API (למשל: '/api/v1/alerts/')
 * @param {Object} options - אפשרויות הבקשה (method, body, headers, וכו')
 * @returns {Promise<Object>} תגובת השרת
 * @throws {Error} שגיאה אם הבקשה נכשלה
 */
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

/**
 * הגדרת עמודות הגריד הסטנדרטיות
 * 
 * פונקציה זו מחזירה את הגדרות העמודות הבסיסיות לכל הטבלאות
 * כולל עמודות פעולות, סטטוס, ערכים נוכחיים וכו'
 * 
 * @returns {Array} מערך של הגדרות עמודות
 */
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
    width: 120,
    minWidth: 100,
    maxWidth: 140,
    filter: true,
    filterParams: {
      filterOptions: ['equals', 'notEqual', 'greaterThan', 'lessThan'],
      defaultOption: 'equals'
    }
  },
  {
    headerName: "טיקר",
    field: "ticker",
    width: 100,
    minWidth: 80,
    maxWidth: 120,
    filter: true,
    filterParams: {
      filterOptions: ['equals', 'notEqual', 'contains'],
      defaultOption: 'contains'
    }
  }
];

// ===== GRID DATA MANAGEMENT =====
// קובץ ייעודי לניהול נתונים - משותף לכל הדפים

// נתוני דוגמה סטנדרטיים - ללא חשבונות ספציפיים
const getDefaultRowData = () => [
  { ticker: "AAPL", date: "2025-08-01", type: "סווינג", amount: "$25,000 (#100)", target: "$210 (12.3%)", stop: "$180 (-6.7%)", current: "$184.32 (+1.2%)", status: "פתוח", action: "⬅️", account: "" },
  { ticker: "TSLA", date: "2025-07-30", type: "השקעה", amount: "$20,000 (#100)", target: "$780 (10.1%)", stop: "$690 (-4.8%)", current: "$688.90 (-2.1%)", status: "סגור", action: "⬅️", account: "" },
  { ticker: "NVDA", date: "2025-07-28", type: "השקעה", amount: "$15,000 (#75)", target: "$540 (8.2%)", stop: "$480 (-4.5%)", current: "$503.20 (+0.5%)", status: "פתוח", action: "⬅️", account: "" },
  { ticker: "AMZN", date: "2025-07-27", type: "פאסיבי", amount: "$10,000 (#50)", target: "$140 (6.3%)", stop: "$126 (-3.1%)", current: "$129.00 (-1.0%)", status: "מבוטל", action: "⬅️", account: "" },
  { ticker: "GOOG", date: "2025-07-26", type: "השקעה", amount: "$20,000 (#60)", target: "$148 (9.0%)", stop: "$130 (-3.4%)", current: "$141.00 (+1.6%)", status: "פתוח", action: "⬅️", account: "" },
  { ticker: "MSFT", date: "2025-07-25", type: "סווינג", amount: "$18,000 (#90)", target: "$355 (11.2%)", stop: "$320 (-4.2%)", current: "$342.00 (+2.4%)", status: "סגור", action: "⬅️", account: "" }
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
      totalAmount += extractAmount(record.amount);
    } catch (e) {
      console.log('שגיאה בחישוב סכום לרשומה:', record, e);
    }
  });

  // חישוב סכום ממוצע
  const averageAmount = totalRecords > 0 ? Math.round(totalAmount / totalRecords) : 0;

  console.log('Summary statistics calculated:', {
    totalRecords: totalRecords,
    totalAmount: totalAmount,
    averageAmount: averageAmount
  });

  // עדכון תצוגת הסטטיסטיקות
  updateStatsDisplay({
    totalRecords: totalRecords,
    totalAmount: totalAmount,
    averageAmount: averageAmount
  });
}

// פונקציה לעדכון תצוגת הסטטיסטיקות
function updateStatsDisplay(stats) {
  console.log('=== updateStatsDisplay called ===');
  console.log('Stats to display:', stats);

  // פונקציה לעיצוב מספרים עם פסיקים
  const formatNumber = (num) => {
    return num.toLocaleString('he-IL');
  };

  // פונקציה לעיצוב סכומים בדולרים
  const formatCurrency = (num) => {
    return `$${num.toLocaleString('he-IL')}`;
  };

  // עדכון התצוגה עם המידע החדש
  const summaryDiv = document.querySelector('.info-summary');
  if (summaryDiv) {
    summaryDiv.innerHTML = `
      <div>סה"כ רשומות: <strong>${formatNumber(stats.totalRecords)}</strong></div>
      <div>סה"כ סכום: <strong>${formatCurrency(stats.totalAmount)}</strong></div>
      <div>סכום ממוצע: <strong>${formatCurrency(stats.averageAmount)}</strong></div>
    `;
    console.log('Updated info-summary with:', stats);
  } else {
    console.warn('info-summary element not found');
  }

  console.log('Stats display updated:', stats);
}

// ===== פונקציות כללית לסגירה/פתיחה של סקשנים =====

/**
 * פונקציה כללית לפתיחה/סגירה של סקשנים
 * @param {string} sectionId - מזהה הסקשן
 */
function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  const icon = document.querySelector(`#${sectionId} .filter-icon`);

  if (!section || !icon) {
    console.error(`❌ לא נמצא סקשן או אייקון עבור: ${sectionId}`);
    return;
  }

  // קביעת שם הדף לפי ה-URL הנוכחי
  const currentPath = window.location.pathname;
  let pageName = 'default';

  if (currentPath.includes('/database')) {
    pageName = 'database';
  } else if (currentPath.includes('/accounts')) {
    pageName = 'accounts';
  } else if (currentPath.includes('/tickers')) {
    pageName = 'tickers';
  } else if (currentPath.includes('/trades')) {
    pageName = 'trades';
  } else if (currentPath.includes('/planning')) {
    pageName = 'planning';
  } else if (currentPath.includes('/tracking')) {
    pageName = 'tracking';
  } else if (currentPath.includes('/designs')) {
    pageName = 'designs';
  } else if (currentPath.includes('/notes')) {
    pageName = 'notes';
  } else if (currentPath.includes('/alerts')) {
    pageName = 'alerts';
  }

  // הוספת שם הדף למפתח כדי שכל דף ישמור את הסטטוס שלו בנפרד
  const storageKey = `${pageName}_${sectionId}Collapsed`;

  if (section.classList.contains('collapsed')) {
    section.classList.remove('collapsed');
    icon.textContent = '▲';
    localStorage.setItem(storageKey, 'false');
  } else {
    section.classList.add('collapsed');
    icon.textContent = '▼';
    localStorage.setItem(storageKey, 'true');
  }
}

/**
 * פונקציה לסגירה/פתיחה של כל הסקשנים
 */
function toggleAllSections() {
  const sections = document.querySelectorAll('.content-section');
  const isAnyOpen = Array.from(sections).some(section => !section.classList.contains('collapsed'));
  const pageName = 'database';

  sections.forEach(section => {
    const sectionId = section.id;
    const storageKey = `${pageName}_${sectionId}Collapsed`;

    if (isAnyOpen) {
      section.classList.add('collapsed');
      const icon = section.querySelector('.filter-icon');
      if (icon) icon.textContent = '▼';
      localStorage.setItem(storageKey, 'true');
    } else {
      section.classList.remove('collapsed');
      const icon = section.querySelector('.filter-icon');
      if (icon) icon.textContent = '▲';
      localStorage.setItem(storageKey, 'false');
    }
  });

  // עדכון האייקון בכפתור הראשי
  const mainButton = document.querySelector('button[onclick="toggleAllSections()"]');
  if (mainButton) {
    const icon = isAnyOpen ? '▼' : '▲';
    const buttonIcon = mainButton.querySelector('.filter-icon');
    if (buttonIcon) buttonIcon.textContent = icon;
  }
}

// ===== פונקציות המרה ופורמט =====

/**
 * המרת סטטוס חשבון לעברית
 */
function convertAccountStatusToHebrew(status) {
  const statusMap = {
    'active': 'פעיל',
    'inactive': 'לא פעיל',
    'suspended': 'מושעה',
    'closed': 'סגור'
  };
  return statusMap[status] || status;
}

/**
 * המרת סטטוס טיקר לעברית
 */
function convertTickerStatusToHebrew(status) {
  const statusMap = {
    'active': 'פעיל',
    'inactive': 'לא פעיל',
    'suspended': 'מושעה',
    'delisted': 'הוסר מהמסחר'
  };
  return statusMap[status] || status;
}

/**
 * המרת סטטוס הערה לעברית
 */
function convertNoteStatusToHebrew(status) {
  const statusMap = {
    'active': 'פעיל',
    'archived': 'בארכיון',
    'deleted': 'נמחק'
  };
  return statusMap[status] || status;
}

/**
 * המרת סטטוס התראה לעברית
 */
function convertAlertStatusToHebrew(status) {
  const statusMap = {
    'active': 'פעיל',
    'inactive': 'לא פעיל',
    'triggered': 'הופעל',
    'cancelled': 'מבוטל'
  };
  return statusMap[status] || status;
}

/**
 * המרת מצב הפעלה לעברית
 */
function convertIsTriggeredToHebrew(isTriggered) {
  return isTriggered ? 'כן' : 'לא';
}

/**
 * הצגת מודל עריכת התראה
 */
function showEditAlertModal(alert) {
  console.log('עריכת התראה:', alert);
  alert('פונקציית עריכת התראה תתווסף בקרוב');
}

/**
 * ביטול התראה
 */
function cancelAlert(alertId, alertType) {
  console.log(`ביטול התראה ${alertId} מסוג ${alertType}`);
  if (confirm('האם אתה בטוח שברצונך לבטל התראה זו?')) {
    alert('פונקציית ביטול התראה תתווסף בקרוב');
  }
}

/**
 * סימון התראה כמופעלת
 */
function markAlertAsTriggered(alertId) {
  console.log(`סימון התראה ${alertId} כמופעלת`);
  alert('פונקציית סימון התראה כמופעלת תתווסף בקרוב');
}

/**
 * עיצוב מטבע
 */
function formatCurrency(amount) {
  if (typeof amount === 'number') {
    return `$${amount.toLocaleString('he-IL')}`;
  }
  return amount;
}

/**
 * עיצוב תאריך
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    return dateString;
  }
}

/**
 * עיצוב תאריך ושעה
 */
function formatDateTime(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('he-IL');
  } catch (error) {
    return dateString;
  }
}

// ===== פונקציות פילטור טבלאות =====

/**
 * פילטור טבלה לפי טקסט
 */
function filterTable(tableId, searchTerm) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const tbody = table.querySelector('tbody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  const term = searchTerm.toLowerCase();

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    let found = false;

    cells.forEach(cell => {
      const text = cell.textContent.toLowerCase();
      if (text.includes(term)) {
        found = true;
      }
    });

    if (found || term === '') {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });

  // עדכון ספירה
  updateTableCount(tableId);
}

/**
 * עדכון ספירת שורות בטבלה
 */
function updateTableCount(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const tbody = table.querySelector('tbody');
  if (!tbody) return;

  const visibleRows = Array.from(tbody.querySelectorAll('tr')).filter(row =>
    row.style.display !== 'none'
  ).length;

  // עדכון הספירה בהתאם לטבלה
  const countElement = getCountElementForTable(tableId);
  if (countElement) {
    const tableName = getTableNameForTable(tableId);
    countElement.textContent = `${visibleRows} ${tableName}`;
  }
}

/**
 * קבלת אלמנט הספירה המתאים
 */
function getCountElementForTable(tableId) {
  const countMap = {
    'usersTable': 'usersCount',
    'accountsTable': 'accountsCount',
    'tickersTable': 'tickersCount',
    'tradesTable': 'tradesCount',
    'tradePlansTable': 'tradePlansCount',
    'alertsTable': 'alertsCount',
    'cashFlowsTable': 'cashFlowsCount',
    'notesTable': 'notesCount',
    'executionsTable': 'executionsCount',
    'userRolesTable': 'userRolesCount'
  };

  const countId = countMap[tableId];
  return countId ? document.getElementById(countId) : null;
}

/**
 * קבלת שם הטבלה
 */
function getTableNameForTable(tableId) {
  const nameMap = {
    'usersTable': 'משתמשים',
    'accountsTable': 'חשבונות',
    'tickersTable': 'טיקרים',
    'tradesTable': 'טריידים',
    'tradePlansTable': 'תוכניות טרייד',
    'alertsTable': 'התראות',
    'cashFlowsTable': 'תזרימי מזומנים',
    'notesTable': 'הערות',
    'executionsTable': 'ביצועים',
    'userRolesTable': 'תפקידי משתמשים'
  };

  return nameMap[tableId] || '';
}

// ===== פונקציות לטעינת נתונים מבסיס הנתונים =====

// משתנים גלובליים לנתונים
let currentDataSource = null;
let currentDataConfig = null;

// הגדרות ברירת מחדל לנתונים - הוסרו הגדרות ספציפיות לתכנונים
const DEFAULT_DATA_CONFIG = {
  apiEndpoint: 'http://127.0.0.1:8080/api/data',
  dataMapping: {},
  statusMapping: {},
  typeMapping: {},
  defaultFilters: {}
};

// פונקציה לטעינת נתונים מבסיס הנתונים
async function loadDataFromDatabase(config = {}) {
  try {
    console.log('Loading data from database with config:', config);

    // מיזוג הגדרות מותאמות אישית עם ברירת המחדל
    const dataConfig = { ...DEFAULT_DATA_CONFIG, ...config };
    currentDataConfig = dataConfig;

    // קריאה לשרת
    const response = await fetch(dataConfig.apiEndpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.json();
    console.log('Raw data from server:', rawData);

    // המרת הנתונים לפורמט הנדרש לגריד
    const processedData = processDataForGrid(rawData, dataConfig);
    console.log('Processed data for grid:', processedData);

    // שמירת הנתונים הגלובליים
    window.rowData = processedData;
    currentDataSource = processedData;

    // עדכון הגריד אם הוא קיים
    if (window.gridApi) {
      updateGridData(processedData);
      // הסטטיסטיקות יתעדכנו על ידי הפילטר
    } else {
      // אם הגריד לא קיים, עדכן רק את הסטטיסטיקות
      updateSummaryStats(processedData);
    }

    console.log('Data loaded successfully:', processedData.length, 'items');
    return processedData;

  } catch (error) {
    console.error('Error loading data from database:', error);

    // במקרה של שגיאה, נחזיר נתוני דוגמה
    const fallbackData = getDefaultRowData();
    window.rowData = fallbackData;
    currentDataSource = fallbackData;

    if (window.gridApi) {
      updateGridData(fallbackData);
    }

    return fallbackData;
  }
}

// פונקציה להמרת נתונים לפורמט הגריד
function processDataForGrid(rawData, config) {
  console.log('=== processDataForGrid called ===');
  console.log('Raw data:', rawData);
  console.log('Config:', config);

  const mapping = config.dataMapping;
  const statusMapping = config.statusMapping;
  const typeMapping = config.typeMapping;

  const processedData = rawData.map(item => {
    // המרת תאריך
    const date = item[mapping.date] ? formatDate(item[mapping.date]) : 'N/A';

    // המרת סטטוס
    const rawStatus = item[mapping.status] || 'open';
    const status = statusMapping[rawStatus] || rawStatus;

    // המרת סוג
    const rawType = item[mapping.type] || 'long';
    const type = typeMapping[rawType] || rawType;

    // המרת סכום
    const amount = item[mapping.amount] ? formatAmount(item[mapping.amount]) : 'N/A';

    // המרת מחירים
    const target = item[mapping.target] ? formatPrice(item[mapping.target]) : 'N/A';
    const stop = item[mapping.stop] ? formatPrice(item[mapping.stop]) : 'N/A';
    const current = item[mapping.current] ? formatPrice(item[mapping.current]) : 'N/A';

    const processedItem = {
      ticker: item[mapping.ticker] || 'N/A',
      date: date,
      type: type,
      amount: amount,
      target: target,
      stop: stop,
      current: current,
      status: status,
      action: '⬅️',
      account: item[mapping.account] || 'N/A'
    };

    console.log('Processed item:', processedItem);
    return processedItem;
  });

  console.log('Final processed data:', processedData);
  return processedData;
}

// פונקציה לעיצוב סכום
function formatAmount(amount) {
  if (typeof amount === 'number') {
    return `$${amount.toLocaleString()}`;
  }
  return amount;
}

// פונקציה לעיצוב מחיר
function formatPrice(price) {
  if (typeof price === 'number') {
    return `$${price.toFixed(2)}`;
  }
  return price;
}

// פונקציה לקבלת נתונים לפי סוג
async function loadDataByType(dataType, customConfig = {}) {
  console.log('=== loadDataByType called ===');
  console.log('Data type:', dataType);
  console.log('Custom config:', customConfig);

  const dataTypes = {
    'tradeplans': {
      apiEndpoint: 'http://127.0.0.1:8080/api/tradeplans',
      dataMapping: {
        ticker: 'ticker',
        date: 'created_at',
        type: 'investment_type',
        amount: 'planned_amount',
        target: 'target_price',
        stop: 'stop_price',
        current: 'current_price',
        status: 'status',
        action: 'action',
        account: 'account_name'
      }
    },
    'trades': {
      apiEndpoint: 'http://127.0.0.1:8080/api/trades',
      dataMapping: {
        ticker: 'ticker',
        date: 'opened_at',
        type: 'type',
        amount: 'total_pl',
        target: 'target_price',
        stop: 'stop_price',
        current: 'current_price',
        status: 'status',
        action: 'action',
        account: 'account_name'
      }
    },
    'alerts': {
      apiEndpoint: 'http://127.0.0.1:8080/api/alerts',
      dataMapping: {
        ticker: 'ticker',
        date: 'created_at',
        type: 'alert_type',
        amount: 'condition',
        target: 'target_price',
        stop: 'stop_price',
        current: 'current_price',
        status: 'status',
        action: 'action',
        account: 'account_name'
      }
    }
  };

  const config = dataTypes[dataType];
  if (!config) {
    console.error('Unknown data type:', dataType);
    return null;
  }

  // מיזוג עם הגדרות מותאמות אישית
  const finalConfig = { ...config, ...customConfig };
  console.log('Final config:', finalConfig);

  const result = await loadDataFromDatabase(finalConfig);
  console.log('loadDataByType result:', result);

  return result;
}

// פונקציה לקבלת מידע על מקור הנתונים הנוכחי
function getCurrentDataSourceInfo() {
  return {
    dataSource: currentDataSource,
    config: currentDataConfig,
    count: currentDataSource ? currentDataSource.length : 0
  };
}

// פונקציה לבדיקת זמינות השרת
async function checkServerAvailability() {
  try {
    const response = await fetch('http://127.0.0.1:8080/api/tradeplans');
    return response.ok;
  } catch (error) {
    console.error('Server not available:', error);
    return false;
  }
}

// ===== פונקציות אתחול גריד =====

/**
 * פונקציה לאתחול מלא של מערכת הגריד
 */
async function initializeGridSystem(containerId = '#agGridFloating', customOptions = {}) {
  console.log('=== Initializing Grid System ===');

  try {
    // 1. אתחול נתונים
    console.log('1. Initializing data...');
    const data = await initializeData();

    // 2. יצירת הגריד
    console.log('2. Creating grid...');
    const gridOptions = createGrid(containerId, data, customOptions);

    if (!gridOptions) {
      console.error('Failed to create grid');
      return false;
    }

    // 3. אתחול מערכת הפילטרים
    console.log('3. Initializing filter system...');
    initializeFilterSystem();

    // 4. טעינת פילטרים שמורים
    console.log('4. Loading saved filters...');
    const savedFilters = loadSavedFilters();
    if (savedFilters && savedFilters.statuses) {
      console.log('Found saved filters, will apply after grid creation:', savedFilters);
      window.pendingFilter = savedFilters.statuses;
    }

    // 5. עדכון סטטיסטיקות
    console.log('5. Updating statistics...');
    updateSummaryStats(data);

    console.log('=== Grid System Initialized Successfully ===');
    return true;

  } catch (error) {
    console.error('Error initializing grid system:', error);
    return false;
  }
}

/**
 * פונקציה לאתחול מהיר של גריד בסיסי
 */
function initializeBasicGrid(containerId = '#agGridFloating') {
  console.log('=== Initializing Basic Grid ===');

  try {
    // שימוש בנתוני דוגמה
    const data = getDefaultRowData();
    window.rowData = data;

    // יצירת גריד בסיסי
    const gridOptions = createGrid(containerId, data);

    if (gridOptions) {
      console.log('Basic grid initialized successfully');
      return true;
    } else {
      console.error('Failed to initialize basic grid');
      return false;
    }

  } catch (error) {
    console.error('Error initializing basic grid:', error);
    return false;
  }
}

/**
 * פונקציה ליצירת גריד עם פילטרים מותאמים אישית
 */
function initializeGridWithFilters(containerId = '#agGridFloating', filters = {}) {
  console.log('=== Initializing Grid with Custom Filters ===');

  try {
    // טעינת נתונים עם פילטרים
    const data = getDefaultRowData();
    window.rowData = data;

    // יצירת הגריד
    const gridOptions = createGrid(containerId, data);

    if (gridOptions) {
      // החלת פילטרים מותאמים אישית
      if (filters.statuses) {
        applyStatusFilterToGrid(filters.statuses, filters.accounts);
      }

      console.log('Grid with custom filters initialized successfully');
      return true;
    } else {
      console.error('Failed to initialize grid with filters');
      return false;
    }

  } catch (error) {
    console.error('Error initializing grid with filters:', error);
    return false;
  }
}

/**
 * פונקציה לבדיקת זמינות המערכת
 */
function checkSystemAvailability() {
  console.log('=== Checking System Availability ===');

  const checks = {
    agGrid: typeof agGrid !== 'undefined',
    gridApi: !!window.gridApi,
    rowData: !!window.rowData,
    filterSystem: typeof applyStatusFilterToGrid === 'function',
    dataSystem: typeof getDefaultRowData === 'function'
  };

  console.log('System availability:', checks);

  const allAvailable = Object.values(checks).every(check => check);
  console.log('All systems available:', allAvailable);

  return allAvailable;
}

/**
 * פונקציה לרענון מלא של המערכת
 */
async function refreshGridSystem() {
  console.log('=== Refreshing Grid System ===');

  try {
    // רענון נתונים
    const newData = await refreshData();

    // רענון הגריד
    if (window.gridApi) {
      refreshGrid();
    }

    // רענון סטטיסטיקות
    updateSummaryStats(newData);

    console.log('Grid system refreshed successfully');
    return true;

  } catch (error) {
    console.error('Error refreshing grid system:', error);
    return false;
  }
}

/**
 * פונקציה לניקוי המערכת
 */
function clearGridSystem() {
  console.log('=== Clearing Grid System ===');

  try {
    // ניקוי הגריד
    clearGrid();

    // ניקוי נתונים
    clearDataFromLocalStorage();

    // ניקוי פילטרים
    clearTestFilter();

    console.log('Grid system cleared successfully');
    return true;

  } catch (error) {
    console.error('Error clearing grid system:', error);
    return false;
  }
}

// ===== פונקציות מקוריות מ-main.js =====

document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector("#agGrid");
  if (!gridDiv) return;

  const columnDefs = [
    {
      headerName: "נכס",
      field: "ticker",
      cellRenderer: params => `<a href="#" onclick="openPlanDetails('${params.value}'); return false;">${params.value}</a>`
    },
    { headerName: "תאריך", field: "date" },
    { headerName: "סוג השקעה", field: "type" },
    { headerName: "סכום/כמות", field: "amount" },
    { headerName: "יעד", field: "target" },
    { headerName: "סטופ", field: "stop" },
    { headerName: "נוכחי", field: "current" },
    { headerName: "סטטוס", field: "status" },
    { headerName: "המרה לטרייד", field: "action", cellRenderer: () => '⬅️' }
  ];

  const rowData = [
    { ticker: "AAPL", date: "2025-08-01", type: "סווינג", amount: "$25,000 (#100)", target: "$210 (12.3%)", stop: "$180 (-6.7%)", current: "$184.32 (+1.2%)", status: "פתוח", action: "" },
    { ticker: "TSLA", date: "2025-07-30", type: "השקעה", amount: "$20,000 (#100)", target: "$780 (10.1%)", stop: "$690 (-4.8%)", current: "$688.90 (-2.1%)", status: "סגור", action: "" },
    { ticker: "NVDA", date: "2025-07-28", type: "השקעה", amount: "$15,000 (#75)", target: "$540 (8.2%)", stop: "$480 (-4.5%)", current: "$503.20 (+0.5%)", status: "פתוח", action: "" },
    { ticker: "AMZN", date: "2025-07-27", type: "פאסיבי", amount: "$10,000 (#50)", target: "$140 (6.3%)", stop: "$126 (-3.1%)", current: "$129.00 (-1.0%)", status: "מבוטל", action: "" },
    { ticker: "GOOG", date: "2025-07-26", type: "השקעה", amount: "$20,000 (#60)", target: "$148 (9.0%)", stop: "$130 (-3.4%)", current: "$141.00 (+1.6%)", status: "פתוח", action: "" },
    { ticker: "MSFT", date: "2025-07-25", type: "סווינג", amount: "$18,000 (#90)", target: "$355 (11.2%)", stop: "$320 (-4.2%)", current: "$342.00 (+2.4%)", status: "סגור", action: "" }
  ];

  const gridOptions = {
    columnDefs,
    rowData,
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true
    }
  };

  agGrid.createGrid(gridDiv, gridOptions);
});

function openPlanDetails(ticker = null) {
  const modal = document.getElementById("planModal");
  const content = document.getElementById("planDetailsContent");

  // קבלת תאריך נוכחי
  const today = new Date().toISOString().split('T')[0];

  if (ticker) {
    // עריכת תכנון קיים
    content.innerHTML = `<h2>עריכת תכנון - ${ticker}</h2>
      <form id="planForm">
        <div class="form-group">
          <label>נכס:</label>
          <input type="text" value="${ticker}" readonly>
        </div>
        <div class="form-group">
          <label>תאריך:</label>
          <input type="date" value="${today}">
        </div>
        <div class="form-group">
          <label>סוג השקעה:</label>
          <select>
            <option value="סווינג">סווינג</option>
            <option value="השקעה">השקעה</option>
            <option value="פאסיבי">פאסיבי</option>
          </select>
        </div>
        <div class="form-group">
          <label>סכום השקעה:</label>
          <input type="number" placeholder="הכנס סכום">
        </div>
        <div class="form-group">
          <label>כמות מניות:</label>
          <input type="number" placeholder="הכנס כמות">
        </div>
        <div class="form-group">
          <label>מחיר יעד:</label>
          <input type="number" step="0.01" placeholder="הכנס מחיר יעד">
        </div>
        <div class="form-group">
          <label>מחיר סטופ:</label>
          <input type="number" step="0.01" placeholder="הכנס מחיר סטופ">
        </div>
        <div class="form-actions">
          <button type="submit">שמור</button>
          <button type="button" onclick="closePlanDetails()">ביטול</button>
        </div>
      </form>`;
  } else {
    // הוספת תכנון חדש
    content.innerHTML = `<h2>הוספת תכנון חדש</h2>
      <form id="planForm">
        <div class="form-group">
          <label>נכס:</label>
          <input type="text" placeholder="הכנס סימול הנכס">
        </div>
        <div class="form-group">
          <label>תאריך:</label>
          <input type="date" value="${today}">
        </div>
        <div class="form-group">
          <label>סוג השקעה:</label>
          <select>
            <option value="סווינג">סווינג</option>
            <option value="השקעה">השקעה</option>
            <option value="פאסיבי">פאסיבי</option>
          </select>
        </div>
        <div class="form-group">
          <label>סכום השקעה:</label>
          <input type="number" placeholder="הכנס סכום">
        </div>
        <div class="form-group">
          <label>כמות מניות:</label>
          <input type="number" placeholder="הכנס כמות">
        </div>
        <div class="form-group">
          <label>מחיר יעד:</label>
          <input type="number" step="0.01" placeholder="הכנס מחיר יעד">
        </div>
        <div class="form-group">
          <label>מחיר סטופ:</label>
          <input type="number" step="0.01" placeholder="הכנס מחיר סטופ">
        </div>
        <div class="form-actions">
          <button type="submit">שמור</button>
          <button type="button" onclick="closePlanDetails()">ביטול</button>
        </div>
      </form>`;
  }

  modal.style.display = "block";
}

function closePlanDetails() {
  document.getElementById("planModal").style.display = "none";
}

// ===== פונקציות עריכה ומחיקה =====

// פונקציה לעריכת רשומה
function editRecord(tableType, recordId) {
  console.log(`עריכת ${tableType} עם מזהה ${recordId}`);
  alert(`פונקציית עריכה עבור ${tableType} עם מזהה ${recordId} תתווסף בקרוב`);
}

// פונקציה למחיקת רשומה
function deleteRecord(tableType, recordId) {
  console.log(`מחיקת ${tableType} עם מזהה ${recordId}`);
  if (confirm('האם אתה בטוח שברצונך למחוק רשומה זו?')) {
    alert(`פונקציית מחיקה עבור ${tableType} עם מזהה ${recordId} תתווסף בקרוב`);
  }
}

// פונקציה לשמירת רשומה
function saveRecord(tableType) {
  console.log(`שמירת ${tableType}`);
  alert(`פונקציית שמירה עבור ${tableType} תתווסף בקרוב`);
}

// פונקציה לביטול רשומה
function cancelRecord(tableType, recordId) {
  console.log(`ביטול ${tableType} עם מזהה ${recordId}`);

  if (tableType === 'trades') {
    // ביטול טרייד - שינוי סטטוס לבוטל
    if (confirm('האם אתה בטוח שברצונך לבטל טרייד זה?')) {
      // קריאה לפונקציה הספציפית לדף
      if (typeof window.cancelTrade === 'function') {
        window.cancelTrade(recordId);
      } else {
        alert('פונקציית ביטול טרייד לא זמינה');
      }
    }
  } else if (tableType === 'trade_plans') {
    // ביטול תוכנית טרייד - העברה לפונקציה הספציפית
    if (typeof window.cancelTradePlan === 'function') {
      window.cancelTradePlan(recordId);
    } else {
      alert('פונקציית ביטול תוכנית טרייד לא זמינה');
    }
  } else {
    alert('ביטול לא נתמך עבור סוג זה של רשומה');
  }
}

// פונקציה להצגת הודעות
function showNotification(message, type = 'success') {
  try {
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d4edda';
    const textColor = type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#155724';
    const borderColor = type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : '#c3e6cb';

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      padding: 12px 20px;
      border-radius: 8px;
      background-color: ${bgColor};
      color: ${textColor};
      border: 1px solid ${borderColor};
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: opacity 0.3s ease;
      opacity: 0;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    // הצגת ההודעה
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 100);

    // הסתרת ההודעה אחרי 3 שניות
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);

  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

// ===== הוספת הפונקציות החדשות לגלובל =====

// הוספת הפונקציות החדשות לגלובל
window.apiCall = apiCall;
window.editRecord = editRecord;
window.deleteRecord = deleteRecord;
window.saveRecord = saveRecord;
window.cancelRecord = cancelRecord;
window.convertAccountStatusToHebrew = convertAccountStatusToHebrew;
window.convertTickerStatusToHebrew = convertTickerStatusToHebrew;
window.convertNoteStatusToHebrew = convertNoteStatusToHebrew;
window.convertAlertStatusToHebrew = convertAlertStatusToHebrew;
window.convertIsTriggeredToHebrew = convertIsTriggeredToHebrew;
window.showEditAlertModal = showEditAlertModal;
window.cancelAlert = cancelAlert;
window.markAlertAsTriggered = markAlertAsTriggered;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.filterTable = filterTable;
window.updateTableCount = updateTableCount;
window.getCountElementForTable = getCountElementForTable;
window.getTableNameForTable = getTableNameForTable;
window.toggleSection = toggleSection;
window.toggleAllSections = toggleAllSections;
window.showNotification = showNotification;
window.showSuccessNotification = showSuccessNotification;
window.showErrorNotification = showErrorNotification;
window.showWarningNotification = showWarningNotification;
window.showInfoNotification = showInfoNotification;

// פונקציות נתונים
window.getDefaultRowData = getDefaultRowData;
window.loadPlansFromServer = loadPlansFromServer;
window.updateSummaryStats = updateSummaryStats;
window.updateStatsDisplay = updateStatsDisplay;
window.loadDataFromDatabase = loadDataFromDatabase;
window.processDataForGrid = processDataForGrid;
window.loadDataByType = loadDataByType;
window.getCurrentDataSourceInfo = getCurrentDataSourceInfo;
window.checkServerAvailability = checkServerAvailability;

// פונקציות אתחול גריד
window.initializeGridSystem = initializeGridSystem;
window.initializeBasicGrid = initializeBasicGrid;
window.initializeGridWithFilters = initializeGridWithFilters;
window.checkSystemAvailability = checkSystemAvailability;
window.refreshGridSystem = refreshGridSystem;
window.clearGridSystem = clearGridSystem;

// פונקציה לטעינת מצב הסקשנים לפי הדף הנוכחי
function loadSectionStates() {
  const currentPath = window.location.pathname;
  let pageName = 'default';

  if (currentPath.includes('/database')) {
    pageName = 'database';
  } else if (currentPath.includes('/accounts')) {
    pageName = 'accounts';
  } else if (currentPath.includes('/tickers')) {
    pageName = 'tickers';
  } else if (currentPath.includes('/trades')) {
    pageName = 'trades';
  } else if (currentPath.includes('/planning')) {
    pageName = 'planning';
  } else if (currentPath.includes('/tracking')) {
    pageName = 'tracking';
  } else if (currentPath.includes('/designs')) {
    pageName = 'designs';
  } else if (currentPath.includes('/notes')) {
    pageName = 'notes';
  } else if (currentPath.includes('/alerts')) {
    pageName = 'alerts';
  }

  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
    const sectionId = section.id;
    const icon = section.querySelector('.filter-icon');

    if (icon) {
      const storageKey = `${pageName}_${sectionId}Collapsed`;
      const isCollapsed = localStorage.getItem(storageKey) === 'true';

      if (isCollapsed) {
        section.classList.add('collapsed');
        icon.textContent = '▼';
      } else {
        section.classList.remove('collapsed');
        icon.textContent = '▲';
      }
    }
  });
}

window.loadSectionStates = loadSectionStates;

// ===== פונקציות גלובליות לסגירת סקשנים =====

/**
 * פונקציה גלובלית לפתיחה/סגירה של סקשן עליון
 * עובדת עם כל הדפים באופן אחיד
 */
function toggleTopSection() {
  const currentPath = window.location.pathname;

  // טיפול מיוחד לדף הערות
  if (currentPath.includes('/notes')) {
    const section = document.getElementById('notesTopSection');
    const button = document.querySelector('[onclick*="toggleTopSection"]');

    if (section && button) {
      const isHidden = section.style.display === 'none';
      section.style.display = isHidden ? 'block' : 'none';
      button.innerHTML = isHidden ? '▼ הסתר' : '▶ הצג';

      // שמירת המצב
      localStorage.setItem('notesTopSectionHidden', !isHidden);
    }
    return;
  }

  // טיפול רגיל לשאר הדפים
  const section = document.querySelector('.top-section .section-body');
  const toggleBtn = document.querySelector('.top-section button[onclick*="toggleTopSection"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (section) {
    const isCollapsed = section.classList.contains('collapsed') || section.style.display === 'none';

    if (isCollapsed) {
      section.classList.remove('collapsed');
      section.style.display = 'block';
    } else {
      section.classList.add('collapsed');
      section.style.display = 'none';
    }

    // עדכון האייקון
    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }

    // קביעת מפתח localStorage לפי הדף הנוכחי
    let storageKey = 'topSectionCollapsed';

    if (currentPath.includes('/alerts')) {
      storageKey = 'alertsTopSectionCollapsed';
    } else if (currentPath.includes('/planning')) {
      storageKey = 'planningTopSectionCollapsed';
    } else if (currentPath.includes('/designs')) {
      storageKey = 'topSectionCollapsed';
    }

    // שמירת המצב ב-localStorage
    localStorage.setItem(storageKey, !isCollapsed);
  }
}

/**
 * פונקציה גלובלית לפתיחה/סגירה של סקשן ראשי
 * עובדת עם כל הדפים באופן אחיד
 */
function toggleMainSection() {
  const currentPath = window.location.pathname;

  // טיפול מיוחד לדף הערות
  if (currentPath.includes('/notes')) {
    const section = document.getElementById('notesMainSection');
    const button = document.querySelector('[onclick*="toggleMainSection"]');

    if (section && button) {
      const isHidden = section.style.display === 'none';
      section.style.display = isHidden ? 'block' : 'none';
      button.innerHTML = isHidden ? '▼ הסתר' : '▶ הצג';

      // שמירת המצב
      localStorage.setItem('notesMainSectionHidden', !isHidden);
    }
    return;
  }

  // טיפול רגיל לשאר הדפים
  const section = document.querySelector('.content-section .section-body');
  const toggleBtn = document.querySelector('.content-section button[onclick*="toggleMainSection"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (section) {
    const isCollapsed = section.classList.contains('collapsed') || section.style.display === 'none';

    if (isCollapsed) {
      section.classList.remove('collapsed');
      section.style.display = 'block';
    } else {
      section.classList.add('collapsed');
      section.style.display = 'none';
    }

    // עדכון האייקון
    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }

    // קביעת מפתח localStorage לפי הדף הנוכחי
    let storageKey = 'mainSectionCollapsed';

    if (currentPath.includes('/alerts')) {
      storageKey = 'alertsMainSectionCollapsed';
    } else if (currentPath.includes('/planning')) {
      storageKey = 'planningMainSectionCollapsed';
    } else if (currentPath.includes('/designs')) {
      storageKey = 'mainSectionCollapsed';
    }

    // שמירת המצב ב-localStorage
    localStorage.setItem(storageKey, !isCollapsed);
  }
}

/**
 * פונקציה גלובלית לשחזור מצב הסקשנים
 * טוענת את המצב השמור לכל הדפים
 */
function restoreAllSectionStates() {
  const currentPath = window.location.pathname;

  // טיפול מיוחד לדף הערות
  if (currentPath.includes('/notes')) {
    // שחזור סקשן עליון
    const topSectionHidden = localStorage.getItem('notesTopSectionHidden') === 'true';
    const topSection = document.getElementById('notesTopSection');
    const topButton = document.querySelector('[onclick*="toggleTopSection"]');

    if (topSection && topButton) {
      topSection.style.display = topSectionHidden ? 'none' : 'block';
      topButton.innerHTML = topSectionHidden ? '▶ הצג' : '▼ הסתר';
    }

    // שחזור סקשן ראשי
    const mainSectionHidden = localStorage.getItem('notesMainSectionHidden') === 'true';
    const mainSection = document.getElementById('notesMainSection');
    const mainButton = document.querySelector('[onclick*="toggleMainSection"]');

    if (mainSection && mainButton) {
      mainSection.style.display = mainSectionHidden ? 'none' : 'block';
      mainButton.innerHTML = mainSectionHidden ? '▶ הצג' : '▼ הסתר';
    }
    return;
  }

  // טיפול רגיל לשאר הדפים
  // שחזור מצב top section
  const topSection = document.querySelector('.top-section .section-body');
  const topToggleBtn = document.querySelector('.top-section button[onclick*="toggleTopSection"]');
  const topIcon = topToggleBtn ? topToggleBtn.querySelector('.filter-icon') : null;

  if (topSection && topToggleBtn && topIcon) {
    let storageKey = 'topSectionCollapsed';

    if (currentPath.includes('/alerts')) {
      storageKey = 'alertsTopSectionCollapsed';
    } else if (currentPath.includes('/planning')) {
      storageKey = 'planningTopSectionCollapsed';
    } else if (currentPath.includes('/designs')) {
      storageKey = 'topSectionCollapsed';
    }

    const isCollapsed = localStorage.getItem(storageKey) === 'true';

    if (isCollapsed) {
      topSection.classList.add('collapsed');
      topSection.style.display = 'none';
      topIcon.textContent = '▼';
    } else {
      topSection.classList.remove('collapsed');
      topSection.style.display = 'block';
      topIcon.textContent = '▲';
    }
  }

  // שחזור מצב main section
  const mainSection = document.querySelector('.content-section .section-body');
  const mainToggleBtn = document.querySelector('.content-section button[onclick*="toggleMainSection"]');
  const mainIcon = mainToggleBtn ? mainToggleBtn.querySelector('.filter-icon') : null;

  if (mainSection && mainToggleBtn && mainIcon) {
    let storageKey = 'mainSectionCollapsed';

    if (currentPath.includes('/alerts')) {
      storageKey = 'alertsMainSectionCollapsed';
    } else if (currentPath.includes('/planning')) {
      storageKey = 'planningMainSectionCollapsed';
    } else if (currentPath.includes('/designs')) {
      storageKey = 'mainSectionCollapsed';
    }

    const isCollapsed = localStorage.getItem(storageKey) === 'true';

    if (isCollapsed) {
      mainSection.classList.add('collapsed');
      mainSection.style.display = 'none';
      mainIcon.textContent = '▼';
    } else {
      mainSection.classList.remove('collapsed');
      mainSection.style.display = 'block';
      mainIcon.textContent = '▲';
    }
  }
}

// ייצוא הפונקציות החדשות לגלובל
window.toggleTopSection = toggleTopSection;
window.toggleMainSection = toggleMainSection;
window.restoreAllSectionStates = restoreAllSectionStates;
