// ===== GRID CORE FUNCTIONS =====
// קובץ ייעודי ללוגיקת הגריד הבסיסית - משותף לכל הדפים

// משתנים גלובליים
window.gridApi = null;
let externalFilterPresent = false;

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
    maxWidth: 180,
    flex: 1
  },
  { 
    headerName: "סוג", 
    field: "type", 
    width: 80,
    minWidth: 70,
    maxWidth: 100, 
    cellClass: params => `badge-type ${params.value}`
  },
  { 
    headerName: "תאריך", 
    field: "date", 
    width: 100,
    minWidth: 90,
    maxWidth: 120
  },
  {
    headerName: "נכס",
    field: "ticker",
    width: 100,
    minWidth: 80,
    maxWidth: 120,
    cellRenderer: params => {
      return `<a href="#" onclick="openPlanDetails('${params.value}'); return false;" style="color: #0077cc; text-decoration: underline;">${params.value}</a>`;
    }
  },
  { 
    headerName: "חשבון", 
    field: "account", 
    width: 120,
    minWidth: 100,
    maxWidth: 150,
    filter: true,
    filterParams: {
      filterOptions: ['equals', 'notEqual'],
      defaultOption: 'equals'
    },
    cellRenderer: params => {
      const value = params.value || 'N/A';
      return `<span style="font-weight: 500; color: #29a6a8;">${value}</span>`;
    }
  }
];

// הגדרות הגריד הסטנדרטיות
const getDefaultGridOptions = (rowData = []) => ({
  columnDefs: getDefaultColumnDefs(),
  rowData: rowData,
  theme: 'legacy',
  defaultColDef: {
    sortable: true,
    filter: false,
    resizable: true,
    wrapText: true,
    autoHeight: true,
    cellStyle: { 
      textAlign: 'center', 
      direction: 'rtl', 
      padding: '4px', 
      fontSize: '0.85rem', 
      lineHeight: '1.4' 
    },
    headerClass: 'ag-header-center',
    floatingFilter: false,
    suppressSizeToFit: false
  },
  isExternalFilterPresent: isExternalFilterPresent,
  doesExternalFilterPass: doesExternalFilterPass,
  onGridReady: onGridReady
});

// פונקציות לפילטר חיצוני
function isExternalFilterPresent() {
  return externalFilterPresent;
}

function doesExternalFilterPass(node) {
  // הפילטר מטופל על ידי applyStatusFilterToGrid
  // פונקציה זו נשארת לתאימות עם AG-Grid
  return true;
}

// פונקציה ליצירת גריד
function createGrid(containerId, rowData = [], customOptions = {}) {
  console.log('Creating grid in container:', containerId);
  
  const gridDiv = document.querySelector(containerId);
  if (!gridDiv) {
    console.error('Grid container not found:', containerId);
    return null;
  }
  
  // בדיקה אם כבר יש גריד באותו container
  if (gridDiv.children.length > 0 && gridDiv.querySelector('.ag-root')) {
    console.log('Grid already exists in container, skipping creation');
    return null;
  }
  
  // בדיקה אם agGrid זמין
  if (typeof agGrid === 'undefined') {
    console.error('agGrid is not loaded!');
    return null;
  }
  
  // בדיקה אם יש הגדרות עמודות מותאמות אישית בדף
  let gridOptions;
  if (window.getPageColumnDefs) {
    // שימוש בהגדרות העמודות של הדף
    console.log('Using page-specific column definitions');
    const pageColumnDefs = window.getPageColumnDefs();
    console.log('Page column definitions:', pageColumnDefs);
    gridOptions = {
      ...getDefaultGridOptions(rowData),
      columnDefs: pageColumnDefs,
      ...customOptions
    };
  } else if (window.getPageGridOptions) {
    // שימוש בהגדרות העמודות של הדף
    console.log('Using page-specific grid options');
    gridOptions = {
      ...window.getPageGridOptions(rowData),
      ...customOptions
    };
  } else {
    // שימוש בהגדרות ברירת המחדל
    console.log('Using default grid options');
    gridOptions = {
      ...getDefaultGridOptions(rowData),
      ...customOptions
    };
  }
  
  try {
    console.log('Creating grid with options:', gridOptions);
    agGrid.createGrid(gridDiv, gridOptions);
    console.log('Grid created successfully');
    return gridOptions;
  } catch (error) {
    console.error('Error creating grid:', error);
    return null;
  }
}

// פונקציה לאתחול הגריד
function onGridReady(params) {
  // בדיקה אם הגריד כבר מאותחל
  if (window.gridApi) {
    console.log('Grid already initialized, skipping onGridReady');
    return;
  }
  
  gridApi = params.api;
  window.gridApi = params.api;
  console.log('Grid API available:', !!gridApi);
  
  // התאמת הגריד לרוחב המסך
  params.api.sizeColumnsToFit();
  
  // עדכון הגריד בעת שינוי גודל החלון
  window.addEventListener('resize', () => {
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 100);
  });
  
  // עדכון סטטוס
  updateGridStatus();
  
  // טעינת טריידים מהשרת אם זה דף בדיקת הגריד
  if (window.location.pathname.includes('grid-test')) {
    console.log('Grid test page detected, loading trades...');
    if (typeof loadDataByType === 'function') {
      loadDataByType('trades').then(data => {
        console.log('Trades loaded for grid test:', data);
        // עדכון הגריד עם הנתונים החדשים
        if (window.gridApi && data) {
          window.gridApi.setGridOption('rowData', data);
          console.log('Grid updated with trades data');
        }
      }).catch(error => {
        console.error('Error loading trades for grid test:', error);
      });
    }
  }
  
  // בדיקה אם יש פילטר ממתין
  if (window.pendingFilter) {
    console.log('Applying pending filter:', window.pendingFilter);
          if (typeof applyStatusFilterToGrid === 'function') {
        applyStatusFilterToGrid(window.pendingFilter, window.pendingAccountFilter);
      } else {
        console.log('applyStatusFilterToGrid not available yet, will apply later');
      }
    delete window.pendingFilter;
  } else {
          // ברירת מחדל - פתוח בלבד
      console.log('No saved filter, applying default filter: פתוח');
      if (typeof applyStatusFilterToGrid === 'function') {
        applyStatusFilterToGrid(['פתוח'], null);
      } else {
        console.log('applyStatusFilterToGrid not available yet, will apply later');
      }
  }
  
  // עדכון סטטיסטיקות בהתאם לנתונים המוצגים
  setTimeout(() => {
    if (window.updateSummaryStats) {
      updateSummaryStats();
    }
    
    // בדיקה אם הפילטר זמין עכשיו
    if (typeof applyStatusFilterToGrid === 'function') {
      console.log('applyStatusFilterToGrid is now available, applying default filter');
      applyStatusFilterToGrid(['פתוח'], null);
    } else {
      console.log('applyStatusFilterToGrid still not available, will try again later');
      // נסיון נוסף אחרי זמן נוסף
      setTimeout(() => {
              if (typeof applyStatusFilterToGrid === 'function') {
        console.log('applyStatusFilterToGrid is now available on second try, applying default filter');
        applyStatusFilterToGrid(['פתוח'], null);
      } else {
        console.log('applyStatusFilterToGrid still not available on second try');
      }
      }, 500);
    }
  }, 200);
  
  console.log('Grid initialized successfully');
}

// פונקציה לעדכון סטטוס הגריד
function updateGridStatus() {
  const statusItems = document.querySelectorAll('.status-item');
  if (statusItems.length >= 2) {
    statusItems[0].innerHTML = '<div class="status-dot success"></div><span>גריד מוכן</span>';
    statusItems[1].innerHTML = '<div class="status-dot success"></div><span>נתונים נטענו</span>';
  }
}

// פונקציה לפתיחת פרטי תכנון
function openPlanDetails(ticker) {
  alert(`פתיחת פרטי תכנון עבור ${ticker}`);
}

// פונקציה לעדכון נתוני הגריד
function updateGridData(newData) {
  if (gridApi) {
    gridApi.setGridOption('rowData', newData);
    console.log('Grid data updated with', newData.length, 'rows');
    
    // לא מעדכנים סטטיסטיקות כאן - הפילטר יעדכן אותן
  } else {
    console.warn('Grid API not available');
  }
}

// פונקציה לרענון הגריד
function refreshGrid() {
  if (gridApi) {
    gridApi.refreshCells();
    gridApi.sizeColumnsToFit();
    console.log('Grid refreshed');
  }
}

// פונקציה לניקוי הגריד
function clearGrid() {
  if (gridApi) {
    gridApi.setGridOption('rowData', []);
    console.log('Grid cleared');
  }
}

// פונקציה עזר להגדרת עמודות מותאמות אישית
function setPageColumnDefs(columnDefs) {
  window.getPageColumnDefs = () => columnDefs;
  console.log('Page column definitions set:', columnDefs);
}

// פונקציה עזר להוספת עמודה לעמודות ברירת המחדל
function addColumnToDefaultDefs(newColumn) {
  const defaultDefs = getDefaultColumnDefs();
  defaultDefs.push(newColumn);
  console.log('Column added to default definitions:', newColumn);
}

// הפיכת הפונקציות לזמינות גלובלית
window.createGrid = createGrid;
window.updateGridData = updateGridData;
window.refreshGrid = refreshGrid;
window.clearGrid = clearGrid;
window.openPlanDetails = openPlanDetails;
window.updateGridStatus = updateGridStatus;
window.setPageColumnDefs = setPageColumnDefs;
window.addColumnToDefaultDefs = addColumnToDefaultDefs;

// פונקציה לפורמט כסף
function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// פונקציה לפורמט אחוזים
function formatPercentage(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00%';
  }
  
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

// פונקציות גלובליות לסגירה/פתיחה
function toggleAlertsSection() {
  const alertsSection = document.getElementById('alertsSection');
  const filterBtn = document.querySelector('.filter-toggle-btn');
  const isCollapsed = alertsSection.classList.contains('collapsed');
  
  if (isCollapsed) {
    // פתיחת אזור ההתראות
    alertsSection.classList.remove('collapsed');
    filterBtn.classList.remove('active');
    localStorage.setItem('alertsSectionCollapsed', 'false');
    console.log('פתיחת אזור התראות');
  } else {
    // סגירת אזור ההתראות
    alertsSection.classList.add('collapsed');
    filterBtn.classList.add('active');
    localStorage.setItem('alertsSectionCollapsed', 'true');
    console.log('סגירת אזור התראות');
  }
}

function toggleTopSection() {
  const topSection = document.getElementById('topSection');
  const filterBtn = topSection.querySelector('.top-toggle-btn');
  const isCollapsed = topSection.classList.contains('collapsed');
  
  if (isCollapsed) {
    // פתיחת החלק העליון
    topSection.classList.remove('collapsed');
    filterBtn.classList.remove('active');
    localStorage.setItem('topSectionCollapsed', 'false');
    console.log('פתיחת חלק עליון');
  } else {
    // סגירת החלק העליון
    topSection.classList.add('collapsed');
    filterBtn.classList.add('active');
    localStorage.setItem('topSectionCollapsed', 'true');
    console.log('סגירת חלק עליון');
  }
}

function restoreAlertsSectionState() {
  const alertsSection = document.getElementById('alertsSection');
  const filterBtn = document.querySelector('.filter-toggle-btn');
  const isCollapsed = localStorage.getItem('alertsSectionCollapsed') === 'true';
  
  if (isCollapsed) {
    alertsSection.classList.add('collapsed');
    filterBtn.classList.add('active');
    console.log('שחזור מצב: אזור התראות מקופל');
  } else {
    alertsSection.classList.remove('collapsed');
    filterBtn.classList.remove('active');
    console.log('שחזור מצב: אזור התראות פתוח');
  }
}

function restoreTopSectionState() {
  const topSection = document.getElementById('topSection');
  const filterBtn = topSection.querySelector('.top-toggle-btn');
  const isCollapsed = localStorage.getItem('topSectionCollapsed') === 'true';
  
  if (isCollapsed) {
    topSection.classList.add('collapsed');
    filterBtn.classList.add('active');
    console.log('שחזור מצב: חלק עליון מקופל');
  } else {
    topSection.classList.remove('collapsed');
    filterBtn.classList.remove('active');
    console.log('שחזור מצב: חלק עליון פתוח');
  }
}

// פונקציה לטעינת התראות
function loadAlerts() {
  const alertsContainer = document.getElementById('alertsContainer');
  if (!alertsContainer) return;
  
  // קביעת סוג הדף לפי URL
  const isPlanningPage = window.location.pathname.includes('planning');
  const openDetailsFunction = isPlanningPage ? 'openPlanDetails' : 'openTradeDetails';
  
  // נתוני דמה להתראות
  const alerts = [
    { ticker: 'AAPL', message: 'מחיר חצה את 180$', price: '$184.32 (+1.2%)' },
    { ticker: 'TSLA', message: 'מחיר ירד מתחת ל-700$', price: '$688.90 (-2.1%)' },
    { ticker: 'MSFT', message: 'תזכורת לכניסה ביום שלישי', price: '$342.00 (+2.4%)' }
  ];
  
  const alertsHtml = alerts.map(alert => `
    <div class="alert-card">
      <strong onclick="${openDetailsFunction}('${alert.ticker}')">${alert.ticker}</strong><br />
      ${alert.message}<br />
      <span class="price">נוכחי: ${alert.price}</span>
      <button class="btn btn-secondary" onclick="markAlertAsRead(this, '${alert.ticker}')">סמן כנקרא</button>
    </div>
  `).join('');
  
  alertsContainer.innerHTML = alertsHtml;
  
  // עדכון מונה ההתראות
  const alertsCount = document.getElementById('alertsCount');
  if (alertsCount) {
    alertsCount.textContent = alerts.length;
  }
}

// פונקציה לסמן התראה כנקראה
function markAlertAsRead(button, ticker) {
  const alertCard = button.closest('.alert-card');
  if (alertCard) {
    alertCard.classList.add('read');
    button.textContent = 'נקרא';
    button.disabled = true;
    console.log(`התראה עבור ${ticker} סומנה כנקראה`);
  }
}

// פונקציה לאיפוס פילטרים ורענון נתונים
async function resetAllFiltersAndReloadData() {
  console.log('=== resetAllFiltersAndReloadData called ===');
  
  // קביעת סוג הדף לפי URL
  const isPlanningPage = window.location.pathname.includes('planning');
  const isDatabasePage = window.location.pathname.includes('database');
  
  // איפוס הפילטרים בקומפוננטת התפריט
  const header = document.querySelector('app-header');
  if (header && typeof header.clearAllFilters === 'function') {
    console.log('Calling clearAllFilters from component');
    header.clearAllFilters();
  }
  
  // איפוס המשתנים הגלובליים
  window.selectedStatusesForFilter = [];
  window.selectedTypesForFilter = [];
  window.selectedAccountsForFilter = [];
  window.selectedDateRangeForFilter = null;
  window.selectedSearchTermForFilter = null;
  
  // ניקוי localStorage
  const filterPrefix = isPlanningPage ? 'planningFilter' : isDatabasePage ? 'databaseFilter' : 'trackingFilter';
  localStorage.removeItem(`${filterPrefix}Statuses`);
  localStorage.removeItem(`${filterPrefix}Types`);
  localStorage.removeItem(`${filterPrefix}Accounts`);
  localStorage.removeItem(`${filterPrefix}DateRange`);
  localStorage.removeItem(`${filterPrefix}Search`);
  
  // רענון נתונים לפי סוג הדף
  if (isPlanningPage && typeof loadPlansData === 'function') {
    await loadPlansData();
  } else if (isDatabasePage && typeof loadDatabaseStats === 'function') {
    await loadDatabaseStats();
  } else if (typeof loadTradesDataDirect === 'function') {
    await loadTradesDataDirect();
  }
  
  console.log('=== resetAllFiltersAndReloadData completed ===');
}

// פונקציה לסגירת כל הפילטרים
function closeAllFilters() {
  console.log('=== closeAllFilters called ===');
  
  // קביעת סוג הדף לפי URL
  const isPlanningPage = window.location.pathname.includes('planning');
  const isDatabasePage = window.location.pathname.includes('database');
  
  // איפוס הפילטרים בקומפוננטת התפריט
  if (typeof window.resetComponentFilters === 'function') {
    window.resetComponentFilters();
  }
  
  // איפוס המשתנים הגלובליים
  window.selectedStatusesForFilter = [];
  window.selectedTypesForFilter = [];
  window.selectedAccountsForFilter = [];
  window.selectedDateRangeForFilter = null;
  window.selectedSearchTermForFilter = null;
  
  // ניקוי localStorage
  const filterPrefix = isPlanningPage ? 'planningFilter' : isDatabasePage ? 'databaseFilter' : 'trackingFilter';
  localStorage.removeItem(`${filterPrefix}Statuses`);
  localStorage.removeItem(`${filterPrefix}Types`);
  localStorage.removeItem(`${filterPrefix}Accounts`);
  localStorage.removeItem(`${filterPrefix}DateRange`);
  localStorage.removeItem(`${filterPrefix}Search`);
  
  console.log('All filters cleared');
}

// פונקציות לאישור מותאם אישית
let customActionCallback = null;

function confirmCustomAction() {
  if (customActionCallback) {
    customActionCallback();
  }
  document.getElementById("customConfirmModal").style.display = "none";
}

function cancelCustomAction() {
  customActionCallback = null;
  document.getElementById("customConfirmModal").style.display = "none";
}

function showCustomConfirm(message, callback) {
  customActionCallback = callback;
  document.getElementById("customConfirmMessage").textContent = message;
  document.getElementById("customConfirmModal").style.display = "block";
}

// ===== פונקציות לסגירה ופתיחה של סקשנים =====

// פונקציה לסגירה/פתיחה של אזור התכנונים
window.togglePlansSection = function() {
  const plansSection = document.getElementById('plansSection');
  const toggleBtn = document.querySelector('button[onclick="togglePlansSection()"]');
  const icon = toggleBtn.querySelector('.filter-icon');
  
  if (plansSection.classList.contains('collapsed')) {
    plansSection.classList.remove('collapsed');
    icon.textContent = '▲';
    toggleBtn.title = 'הצג/הסתר אזור תכנונים';
    localStorage.setItem('plansSectionCollapsed', 'false');
  } else {
    plansSection.classList.add('collapsed');
    icon.textContent = '▼';
    toggleBtn.title = 'הצג/הסתר אזור תכנונים';
    localStorage.setItem('plansSectionCollapsed', 'true');
  }
}

// פונקציה לשחזור מצב אזור התכנונים
function restorePlansSectionState() {
  const plansSection = document.getElementById('plansSection');
  const toggleBtn = document.querySelector('button[onclick="togglePlansSection()"]');
  const icon = toggleBtn.querySelector('.filter-icon');
  
  const isCollapsed = localStorage.getItem('plansSectionCollapsed') === 'true';
  
  if (isCollapsed) {
    plansSection.classList.add('collapsed');
    icon.textContent = '▼';
    toggleBtn.title = 'הצג/הסתר אזור תכנונים';
  } else {
    plansSection.classList.remove('collapsed');
    icon.textContent = '▲';
    toggleBtn.title = 'הצג/הסתר אזור תכנונים';
  }
}

// פונקציה לסגירה/פתיחה של אזור ההתראות
window.toggleAlertsSection = function() {
  const alertsSection = document.getElementById('alertsSection');
  const toggleBtn = document.querySelector('button[onclick="toggleAlertsSection()"]');
  const icon = toggleBtn.querySelector('.filter-icon');
  
  if (alertsSection.classList.contains('collapsed')) {
    alertsSection.classList.remove('collapsed');
    icon.textContent = '▲';
    toggleBtn.title = 'הצג/הסתר אזור התראות';
    localStorage.setItem('alertsSectionCollapsed', 'false');
  } else {
    alertsSection.classList.add('collapsed');
    icon.textContent = '▼';
    toggleBtn.title = 'הצג/הסתר אזור התראות';
    localStorage.setItem('alertsSectionCollapsed', 'true');
  }
}

// פונקציה לשחזור מצב אזור ההתראות
function restoreAlertsSectionState() {
  const alertsSection = document.getElementById('alertsSection');
  const toggleBtn = document.querySelector('button[onclick="toggleAlertsSection()"]');
  const icon = toggleBtn.querySelector('.filter-icon');
  
  const isCollapsed = localStorage.getItem('alertsSectionCollapsed') === 'true';
  
  if (isCollapsed) {
    alertsSection.classList.add('collapsed');
    icon.textContent = '▼';
    toggleBtn.title = 'הצג/הסתר אזור התראות';
  } else {
    alertsSection.classList.remove('collapsed');
    icon.textContent = '▲';
    toggleBtn.title = 'הצג/הסתר אזור התראות';
  }
}

// פונקציה לסגירה/פתיחה של החלק העליון
window.toggleTopSection = function() {
  const topSection = document.getElementById('topSection');
  const toggleBtn = document.querySelector('button[onclick="toggleTopSection()"]');
  const icon = toggleBtn.querySelector('.filter-icon');
  
  if (topSection.classList.contains('collapsed')) {
    topSection.classList.remove('collapsed');
    icon.textContent = '▲';
    toggleBtn.title = 'הצג/הסתר חלק עליון';
    localStorage.setItem('topSectionCollapsed', 'false');
  } else {
    topSection.classList.add('collapsed');
    icon.textContent = '▼';
    toggleBtn.title = 'הצג/הסתר חלק עליון';
    localStorage.setItem('topSectionCollapsed', 'true');
  }
}

// פונקציה לשחזור מצב החלק העליון
function restoreTopSectionState() {
  const topSection = document.getElementById('topSection');
  const toggleBtn = document.querySelector('button[onclick="toggleTopSection()"]');
  const icon = toggleBtn.querySelector('.filter-icon');
  
  const isCollapsed = localStorage.getItem('topSectionCollapsed') === 'true';
  
  if (isCollapsed) {
    topSection.classList.add('collapsed');
    icon.textContent = '▼';
    toggleBtn.title = 'הצג/הסתר חלק עליון';
  } else {
    topSection.classList.remove('collapsed');
    icon.textContent = '▲';
    toggleBtn.title = 'הצג/הסתר חלק עליון';
  }
}

// פונקציה לשחזור כל מצבי הסקשנים
function restoreAllSectionStates() {
  restorePlansSectionState();
  restoreAlertsSectionState();
  restoreTopSectionState();
  restoreDesignsSectionState();
}

// פונקציה לסגירה/פתיחה של אזור העיצובים
window.toggleDesignsSection = function() {
  const designsSection = document.getElementById('designsSection');
  const toggleBtn = document.querySelector('button[onclick="toggleDesignsSection()"]');
  const icon = toggleBtn.querySelector('.filter-icon');
  
  if (designsSection.classList.contains('collapsed')) {
    designsSection.classList.remove('collapsed');
    icon.textContent = '▲';
    toggleBtn.title = 'הצג/הסתר אזור עיצובים';
    localStorage.setItem('designsSectionCollapsed', 'false');
  } else {
    designsSection.classList.add('collapsed');
    icon.textContent = '▼';
    toggleBtn.title = 'הצג/הסתר אזור עיצובים';
    localStorage.setItem('designsSectionCollapsed', 'true');
  }
}

// פונקציה לשחזור מצב אזור העיצובים
function restoreDesignsSectionState() {
  const designsSection = document.getElementById('designsSection');
  const toggleBtn = document.querySelector('button[onclick="toggleDesignsSection()"]');
  const icon = toggleBtn.querySelector('.filter-icon');
  
  if (!designsSection || !toggleBtn || !icon) return;
  
  const isCollapsed = localStorage.getItem('designsSectionCollapsed') === 'true';
  
  if (isCollapsed) {
    designsSection.classList.add('collapsed');
    icon.textContent = '▼';
    toggleBtn.title = 'הצג/הסתר אזור עיצובים';
  } else {
    designsSection.classList.remove('collapsed');
    icon.textContent = '▲';
    toggleBtn.title = 'הצג/הסתר אזור עיצובים';
  }
}

// ===== פונקציונליות סידור לטבלאות =====

// משתנים גלובליים לסידור
let currentSortColumn = null;
let currentSortDirection = 'asc'; // 'asc' או 'desc'

// פונקציה להוספת פונקציונליות סידור לטבלה
function initializeTableSorting(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;
  
  const headers = table.querySelectorAll('thead th');
  
  headers.forEach((header, index) => {
    // דלג על עמודת הפעולות
    if (header.textContent.includes('פעולות') || header.textContent.includes('Actions')) {
      return;
    }
    
    // בדוק אם כבר יש אייקון סידור
    if (header.querySelector('.sort-icon')) {
      return; // כבר מאותחל
    }
    
    // הוסף סגנון cursor pointer
    header.style.cursor = 'pointer';
    header.classList.add('sortable-header');
    
    // הוסף אייקון סידור
    const sortIcon = document.createElement('span');
    sortIcon.className = 'sort-icon';
    sortIcon.innerHTML = '↕';
    header.insertBefore(sortIcon, header.firstChild);
    
    // הוסף event listener
    header.addEventListener('click', () => {
      sortTable(tableId, index);
    });
  });
}

// פונקציה לסידור הטבלה
function sortTable(tableId, columnIndex) {
  const table = document.getElementById(tableId);
  if (!table) return;
  
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  // בדוק אם זה אותו עמודה - שנה כיוון
  if (currentSortColumn === columnIndex) {
    currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    currentSortColumn = columnIndex;
    currentSortDirection = 'asc';
  }
  
  // עדכן אייקונים
  updateSortIcons(tableId, columnIndex);
  
  // מיין את השורות
  rows.sort((a, b) => {
    const aValue = getCellValue(a, columnIndex);
    const bValue = getCellValue(b, columnIndex);
    
    let comparison = 0;
    
    // טיפול בסוגים שונים של נתונים
    if (isNumeric(aValue) && isNumeric(bValue)) {
      comparison = parseFloat(aValue) - parseFloat(bValue);
    } else if (isDate(aValue) && isDate(bValue)) {
      comparison = new Date(aValue) - new Date(bValue);
    } else {
      comparison = String(aValue).localeCompare(String(bValue), 'he');
    }
    
    return currentSortDirection === 'asc' ? comparison : -comparison;
  });
  
  // הסר את השורות הישנות והוסף את הממוינות
  rows.forEach(row => tbody.appendChild(row));
}

// פונקציה לקבלת ערך תא
function getCellValue(row, columnIndex) {
  const cell = row.cells[columnIndex];
  if (!cell) return '';
  
  // הסר תגיות HTML וקבל רק טקסט
  let value = cell.textContent || cell.innerText || '';
  
  // הסר רווחים מיותרים
  value = value.trim();
  
  // טיפול בערכים מיוחדים
  if (value.includes('$')) {
    // הסר סימן דולר ופסיקים
    value = value.replace(/[$,]/g, '');
  }
  
  if (value.includes('%')) {
    // הסר סימן אחוז
    value = value.replace(/%/g, '');
  }
  
  return value;
}

// פונקציה לבדיקה אם ערך הוא מספרי
function isNumeric(value) {
  return !isNaN(value) && !isNaN(parseFloat(value));
}

// פונקציה לבדיקה אם ערך הוא תאריך
function isDate(value) {
  const date = new Date(value);
  return date instanceof Date && !isNaN(date);
}

// פונקציה לעדכון אייקוני הסידור
function updateSortIcons(tableId, activeColumnIndex) {
  const table = document.getElementById(tableId);
  if (!table) return;
  
  const headers = table.querySelectorAll('thead th');
  
  headers.forEach((header, index) => {
    const sortIcon = header.querySelector('.sort-icon');
    if (!sortIcon) return;
    
    // הסר קלאס sorted מכל הכותרות
    header.classList.remove('sorted');
    
    if (index === activeColumnIndex) {
      // עמודה פעילה
      header.classList.add('sorted');
      sortIcon.innerHTML = currentSortDirection === 'asc' ? '↑' : '↓';
    } else {
      // עמודה לא פעילה
      sortIcon.innerHTML = '↕';
    }
  });
}

// פונקציה לאתחול סידור לכל הטבלאות בדף
function initializeAllTableSorting() {
  // אתחול לטבלת תכנונים
  initializeTableSorting('plansTable');
  
  // אתחול לטבלת עיצובים
  initializeTableSorting('designsTable');
  
  // אתחול לטבלאות אחרות לפי הצורך
  const tables = ['accountsTable', 'tickersTable', 'tradesTable', 'tradePlansTable', 'alertsTable', 'cashFlowsTable', 'notesTable', 'executionsTable'];
  tables.forEach(tableId => {
    if (document.getElementById(tableId)) {
      initializeTableSorting(tableId);
    }
  });
}

// ===== CRUD FUNCTIONS =====
// מערכת כללית לעריכה ומחיקה - משותפת לכל הטבלאות במערכת
// המערכת מאפשרת עריכה ומחיקה של רשומות מכל טבלה באמצעות פונקציות כלליות
// במקום ליצור פונקציות ספציפיות לכל טבלה, המערכת משתמשת בפונקציות כלליות
// שמקבלות את סוג הטבלה כפרמטר ומטפלות בכל הלוגיקה הנדרשת

/**
 * פונקציה כללית לעריכת רשומה מכל טבלה במערכת
 * הפונקציה טוענת את הנתונים מהשרת ומציגה מודל עריכה מתאים
 * 
 * @param {string} tableType - סוג הטבלה (למשל: 'accounts', 'tickers', 'trades')
 * @param {number} recordId - מזהה הרשומה לעריכה
 * 
 * @example
 * // עריכת חשבון עם מזהה 123
 * editRecord('accounts', 123);
 * 
 * // עריכת טיקר עם מזהה 456
 * editRecord('tickers', 456);
 */
async function editRecord(tableType, recordId) {
    try {
        // קריאה לשרת לקבלת נתוני הרשומה
        const response = await apiCall(`/api/v1/${tableType}/${recordId}`);
        
        if (response.status === 'success') {
            // הצגת מודל עריכה עם הנתונים שנטענו
            showEditModal(tableType, response.data);
        } else {
            // הצגת הודעת שגיאה אם הטעינה נכשלה
            alert(`שגיאה בטעינת נתוני ${getTableDisplayName(tableType)}`);
        }
    } catch (error) {
        // לוג שגיאה לקונסול והודעת שגיאה למשתמש
        console.error(`Error loading ${tableType}:`, error);
        alert(`שגיאה בטעינת נתוני ${getTableDisplayName(tableType)}`);
    }
}

/**
 * פונקציה כללית למחיקת רשומה מכל טבלה במערכת
 * הפונקציה מציגה אישור מחיקה ואז מוחקת את הרשומה מהשרת
 * 
 * @param {string} tableType - סוג הטבלה (למשל: 'accounts', 'tickers', 'trades')
 * @param {number} recordId - מזהה הרשומה למחיקה
 * 
 * @example
 * // מחיקת חשבון עם מזהה 123
 * deleteRecord('accounts', 123);
 * 
 * // מחיקת טיקר עם מזהה 456
 * deleteRecord('tickers', 456);
 */
async function deleteRecord(tableType, recordId) {
    // קבלת שם התצוגה של הטבלה להודעות למשתמש
    const displayName = getTableDisplayName(tableType);
    
    // הצגת אישור מחיקה למשתמש
    if (confirm(`האם אתה בטוח שברצונך למחוק ${displayName} זה?`)) {
        try {
            // קריאה לשרת למחיקת הרשומה
            const response = await apiCall(`/api/v1/${tableType}/${recordId}`, {
                method: 'DELETE'
            });
            
            if (response.status === 'success') {
                // הצגת הודעת הצלחה ורענון הטבלה
                alert(`${displayName} נמחק בהצלחה`);
                refreshTable(tableType);
            } else {
                // הצגת הודעת שגיאה אם המחיקה נכשלה
                alert(`שגיאה במחיקת ${displayName}`);
            }
        } catch (error) {
            // לוג שגיאה לקונסול והודעת שגיאה למשתמש
            console.error(`Error deleting ${tableType}:`, error);
            alert(`שגיאה במחיקת ${displayName}`);
        }
    }
}

/**
 * פונקציה להצגת מודל עריכה מתאים לסוג הטבלה
 * הפונקציה מוצאת את המודל המתאים, ממלאת אותו בנתונים ומציגה אותו
 * 
 * @param {string} tableType - סוג הטבלה (למשל: 'accounts', 'tickers', 'trades')
 * @param {Object} data - נתוני הרשומה לעריכה
 * 
 * @example
 * // הצגת מודל עריכת חשבון
 * showEditModal('accounts', accountData);
 */
function showEditModal(tableType, data) {
    // יצירת מזהה המודל לפי סוג הטבלה
    let modalId;
    
    // מיפוי מיוחד לטבלאות עם שמות מודלים שונים
    const modalIdMap = {
        'user_roles': 'editUserRolesModal',
        'cash_flows': 'editCashFlowsModal',
        'trade_plans': 'editTradePlanModal',
        'users': 'editUsersModal'
    };
    
    if (modalIdMap[tableType]) {
        modalId = modalIdMap[tableType];
    } else {
        modalId = `edit${capitalizeFirstLetter(tableType)}Modal`;
    }
    
    const modal = document.getElementById(modalId);
    
    // בדיקה שהמודל קיים בדף
    if (!modal) {
        console.error(`Modal ${modalId} not found`);
        alert('מודל עריכה לא נמצא');
        return;
    }
    
    // מילוי הנתונים במודל באמצעות הפונקציה המתאימה
    fillEditModalData(tableType, data);
    
    // הצגת המודל באמצעות Bootstrap
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

/**
 * פונקציה למילוי נתונים במודל עריכה לפי סוג הטבלה
 * הפונקציה קוראת לפונקציה הספציפית המתאימה לכל סוג טבלה
 * 
 * @param {string} tableType - סוג הטבלה (למשל: 'accounts', 'tickers', 'trades')
 * @param {Object} data - נתוני הרשומה לעריכה
 * 
 * @example
 * // מילוי נתונים במודל עריכת חשבון
 * fillEditModalData('accounts', accountData);
 */
function fillEditModalData(tableType, data) {
    // יצירת מזהה המודל לפי סוג הטבלה
    const modalId = `edit${capitalizeFirstLetter(tableType)}Modal`;
    const modal = document.getElementById(modalId);
    
    // בדיקה שהמודל קיים בדף
    if (!modal) return;
    
    // מילוי שדות לפי סוג הטבלה - כל טבלה מקבלת פונקציה ספציפית
    switch (tableType) {
        case 'accounts':
            fillAccountModalData(data);
            break;
        case 'tickers':
            fillTickerModalData(data);
            break;
        case 'trades':
            fillTradeModalData(data);
            break;
        case 'trade_plans':
            fillTradePlanModalData(data);
            break;
        case 'alerts':
            fillAlertModalData(data);
            break;
        case 'cash_flows':
            fillCashFlowModalData(data);
            break;
        case 'notes':
            fillNoteModalData(data);
            break;
        case 'executions':
            fillExecutionModalData(data);
            break;
        case 'alerts':
            fillAlertModalData(data);
            break;
        case 'cash_flows':
            fillCashFlowModalData(data);
            break;
        case 'notes':
            fillNoteModalData(data);
            break;
        case 'users':
            fillUserModalData(data);
            break;
        case 'user_roles':
            fillUserRoleModalData(data);
            break;
        default:
            console.error(`Unknown table type: ${tableType}`);
    }
}

/**
 * פונקציות מילוי נתונים ספציפיות לכל טבלה
 * כל פונקציה ממלאת את השדות המתאימים במודל העריכה של הטבלה הספציפית
 */

/**
 * מילוי נתונים במודל עריכת חשבון
 * ממלא את כל השדות הרלוונטיים לחשבון במודל העריכה
 * 
 * @param {Object} data - נתוני החשבון לעריכה
 * @param {number} data.id - מזהה החשבון
 * @param {string} data.name - שם החשבון
 * @param {string} data.currency - מטבע החשבון
 * @param {string} data.status - סטטוס החשבון
 * @param {number} data.cash_balance - יתרת מזומן
 * @param {string} data.notes - הערות
 */
function fillAccountModalData(data) {
    // מילוי שדות המודל עם הנתונים או ערכי ברירת מחדל
    document.getElementById('editAccountId').value = data.id;
    document.getElementById('editAccountName').value = data.name || '';
    document.getElementById('editAccountCurrency').value = data.currency || 'USD';
    document.getElementById('editAccountStatus').value = data.status || 'active';
    document.getElementById('editAccountCashBalance').value = data.cash_balance || 0;
    document.getElementById('editAccountNotes').value = data.notes || '';
}

/**
 * מילוי נתונים במודל עריכת טיקר
 * ממלא את כל השדות הרלוונטיים לטיקר במודל העריכה
 * 
 * @param {Object} data - נתוני הטיקר לעריכה
 * @param {number} data.id - מזהה הטיקר
 * @param {string} data.symbol - סמל הטיקר
 * @param {string} data.name - שם הטיקר
 * @param {string} data.type - סוג הטיקר (stock, etf, crypto, forex)
 * @param {string} data.currency - מטבע הטיקר
 * @param {string} data.remarks - הערות
 */
function fillTickerModalData(data) {
    // מילוי שדות המודל עם הנתונים או ערכי ברירת מחדל
    document.getElementById('editTickerId').value = data.id;
    document.getElementById('editTickerSymbol').value = data.symbol || '';
    document.getElementById('editTickerName').value = data.name || '';
    document.getElementById('editTickerType').value = data.type || 'stock';
    document.getElementById('editTickerCurrency').value = data.currency || 'USD';
    document.getElementById('editTickerRemarks').value = data.remarks || '';
}

/**
 * מילוי נתונים במודל עריכת טרייד
 * ממלא את כל השדות הרלוונטיים לטרייד במודל העריכה
 * 
 * @param {Object} data - נתוני הטרייד לעריכה
 * @param {number} data.id - מזהה הטרייד
 * @param {number} data.account_id - מזהה החשבון
 * @param {number} data.ticker_id - מזהה הטיקר
 * @param {string} data.status - סטטוס הטרייד (open, closed, cancelled)
 * @param {string} data.type - סוג הטרייד (buy, sell)
 * @param {string} data.notes - הערות
 */
function fillTradeModalData(data) {
    // מילוי שדות המודל עם הנתונים או ערכי ברירת מחדל
    document.getElementById('editTradeId').value = data.id;
    document.getElementById('editTradeAccountId').value = data.account_id || '';
    document.getElementById('editTradeTickerId').value = data.ticker_id || '';
    document.getElementById('editTradeStatus').value = data.status || 'open';
    document.getElementById('editTradeType').value = data.type || 'buy';
    document.getElementById('editTradeNotes').value = data.notes || '';
}

/**
 * מילוי נתונים במודל עריכת תוכנית טרייד
 * ממלא את כל השדות הרלוונטיים לתוכנית טרייד במודל העריכה
 * 
 * @param {Object} data - נתוני תוכנית הטרייד לעריכה
 * @param {number} data.id - מזהה תוכנית הטרייד
 * @param {number} data.account_id - מזהה החשבון
 * @param {number} data.ticker_id - מזהה הטיקר
 * @param {string} data.investment_type - סוג השקעה (swing, investment, passive)
 * @param {number} data.planned_amount - סכום מתוכנן
 * @param {number} data.stop_price - מחיר עצירה
 * @param {number} data.target_price - מחיר יעד
 * @param {string} data.entry_conditions - תנאי כניסה
 * @param {string} data.reasons - סיבות
 */
function fillTradePlanModalData(data) {
    // מילוי שדות המודל עם הנתונים או ערכי ברירת מחדל
    document.getElementById('editTradePlanId').value = data.id;
    document.getElementById('editTradePlanAccountId').value = data.account_id || '';
    document.getElementById('editTradePlanTickerId').value = data.ticker_id || '';
    document.getElementById('editTradePlanInvestmentType').value = data.investment_type || 'swing';
    document.getElementById('editTradePlanPlannedAmount').value = data.planned_amount || 0;
    document.getElementById('editTradePlanStopPrice').value = data.stop_price || '';
    document.getElementById('editTradePlanTargetPrice').value = data.target_price || '';
    document.getElementById('editTradePlanEntryConditions').value = data.entry_conditions || '';
    document.getElementById('editTradePlanReasons').value = data.reasons || '';
}

function fillAlertModalData(data) {
    document.getElementById('editAlertId').value = data.id;
    document.getElementById('editAlertAccountId').value = data.account_id || '';
    document.getElementById('editAlertTickerId').value = data.ticker_id || '';
    document.getElementById('editAlertType').value = data.type || '';
    document.getElementById('editAlertCondition').value = data.condition || '';
    document.getElementById('editAlertMessage').value = data.message || '';
    document.getElementById('editAlertStatus').checked = data.is_active || false;
}

function fillCashFlowModalData(data) {
    document.getElementById('editCashFlowId').value = data.id;
    document.getElementById('editCashFlowAccountId').value = data.account_id || '';
    document.getElementById('editCashFlowType').value = data.type || '';
    document.getElementById('editCashFlowAmount').value = data.amount || 0;
    document.getElementById('editCashFlowDate').value = data.date || '';
    document.getElementById('editCashFlowDescription').value = data.description || '';
}

function fillNoteModalData(data) {
    document.getElementById('editNoteId').value = data.id;
    document.getElementById('editNoteAccountId').value = data.account_id || '';
    document.getElementById('editNoteTradeId').value = data.trade_id || '';
    document.getElementById('editNoteTradePlanId').value = data.trade_plan_id || '';
    document.getElementById('editNoteContent').value = data.content || '';
    document.getElementById('editNoteAttachment').value = data.attachment || '';
}

function fillExecutionModalData(data) {
    document.getElementById('editExecutionId').value = data.id;
    document.getElementById('editExecutionTradeId').value = data.trade_id || '';
    document.getElementById('editExecutionAction').value = data.action || '';
    document.getElementById('editExecutionDate').value = data.date || '';
    document.getElementById('editExecutionQuantity').value = data.quantity || '';
    document.getElementById('editExecutionPrice').value = data.price || 0;
    document.getElementById('editExecutionFee').value = data.fee || 0;
    document.getElementById('editExecutionSource').value = data.source || '';
}

/**
 * מילוי נתונים במודל עריכת התראה
 * ממלא את כל השדות הרלוונטיים להתראה במודל העריכה
 * 
 * @param {Object} data - נתוני ההתראה לעריכה
 * @param {number} data.id - מזהה ההתראה
 * @param {number} data.account_id - מזהה החשבון
 * @param {number} data.ticker_id - מזהה הטיקר
 * @param {string} data.type - סוג ההתראה
 * @param {string} data.condition - תנאי ההתראה
 * @param {string} data.message - הודעת ההתראה
 * @param {boolean} data.is_active - האם ההתראה פעילה
 */
function fillAlertModalData(data) {
    document.getElementById('editAlertId').value = data.id;
    document.getElementById('editAlertAccountId').value = data.account_id || '';
    document.getElementById('editAlertTickerId').value = data.ticker_id || '';
    document.getElementById('editAlertType').value = data.type || '';
    document.getElementById('editAlertCondition').value = data.condition || '';
    document.getElementById('editAlertMessage').value = data.message || '';
    document.getElementById('editAlertIsActive').value = data.is_active ? 'true' : 'false';
}

/**
 * מילוי נתונים במודל עריכת תזרים מזומנים
 * ממלא את כל השדות הרלוונטיים לתזרים מזומנים במודל העריכה
 * 
 * @param {Object} data - נתוני תזרים המזומנים לעריכה
 * @param {number} data.id - מזהה תזרים המזומנים
 * @param {number} data.account_id - מזהה החשבון
 * @param {string} data.type - סוג התזרים
 * @param {number} data.amount - סכום התזרים
 * @param {string} data.date - תאריך התזרים
 * @param {string} data.description - תיאור התזרים
 */
function fillCashFlowModalData(data) {
    document.getElementById('editCashFlowId').value = data.id;
    document.getElementById('editCashFlowAccountId').value = data.account_id || '';
    document.getElementById('editCashFlowType').value = data.type || '';
    document.getElementById('editCashFlowAmount').value = data.amount || 0;
    document.getElementById('editCashFlowDate').value = data.date || '';
    document.getElementById('editCashFlowDescription').value = data.description || '';
}

/**
 * מילוי נתונים במודל עריכת הערה
 * ממלא את כל השדות הרלוונטיים להערה במודל העריכה
 * 
 * @param {Object} data - נתוני ההערה לעריכה
 * @param {number} data.id - מזהה ההערה
 * @param {number} data.account_id - מזהה החשבון
 * @param {number} data.trade_id - מזהה הטרייד
 * @param {number} data.trade_plan_id - מזהה תוכנית הטרייד
 * @param {string} data.content - תוכן ההערה
 * @param {string} data.attachment - קובץ מצורף
 */
function fillNoteModalData(data) {
    document.getElementById('editNoteId').value = data.id;
    document.getElementById('editNoteAccountId').value = data.account_id || '';
    document.getElementById('editNoteTradeId').value = data.trade_id || '';
    document.getElementById('editNoteTradePlanId').value = data.trade_plan_id || '';
    document.getElementById('editNoteContent').value = data.content || '';
    document.getElementById('editNoteAttachment').value = data.attachment || '';
}

/**
 * מילוי נתונים במודל עריכת משתמש
 * ממלא את כל השדות הרלוונטיים למשתמש במודל העריכה
 * 
 * @param {Object} data - נתוני המשתמש לעריכה
 * @param {number} data.id - מזהה המשתמש
 * @param {string} data.username - שם משתמש
 * @param {string} data.email - כתובת אימייל
 * @param {boolean} data.is_active - האם המשתמש פעיל
 * @param {Array} data.roles - תפקידי המשתמש
 */
function fillUserModalData(data) {
    document.getElementById('editUserId').value = data.id;
    document.getElementById('editUserUsername').value = data.username || '';
    document.getElementById('editUserEmail').value = data.email || '';
    document.getElementById('editUserIsActive').value = data.is_active ? 'true' : 'false';
    document.getElementById('editUserRoles').value = data.roles ? data.roles.join(', ') : '';
}

/**
 * מילוי נתונים במודל עריכת תפקיד משתמש
 * ממלא את כל השדות הרלוונטיים לתפקיד משתמש במודל העריכה
 * 
 * @param {Object} data - נתוני תפקיד המשתמש לעריכה
 * @param {number} data.id - מזהה תפקיד המשתמש
 * @param {number} data.user_id - מזהה המשתמש
 * @param {string} data.user_username - שם המשתמש
 * @param {number} data.role_id - מזהה התפקיד
 * @param {string} data.role_name - שם התפקיד
 * @param {string} data.assigned_at - תאריך הקצאה
 */
function fillUserRoleModalData(data) {
    document.getElementById('editUserRoleId').value = data.id;
    document.getElementById('editUserRoleUserId').value = data.user_id || '';
    document.getElementById('editUserRoleUsername').value = data.user_username || '';
    document.getElementById('editUserRoleRoleId').value = data.role_id || '';
    document.getElementById('editUserRoleRoleName').value = data.role_name || '';
    document.getElementById('editUserRoleAssignedAt').value = data.assigned_at || '';
}

/**
 * פונקציה כללית לשמירת נתונים ממודל עריכה
 * הפונקציה אוספת את הנתונים מהמודל, שולחת אותם לשרת ומרעננת את הטבלה
 * 
 * @param {string} tableType - סוג הטבלה (למשל: 'accounts', 'tickers', 'trades')
 * 
 * @example
 * // שמירת נתוני חשבון
 * saveRecord('accounts');
 * 
 * // שמירת נתוני טיקר
 * saveRecord('tickers');
 */
async function saveRecord(tableType) {
    // קבלת מזהה הרשומה מהמודל
    let recordId;
    let modalId;
    
    // מיפוי מיוחד לטבלאות עם שמות שדות ומודלים שונים
    const recordIdMap = {
        'user_roles': 'editUserRoleId',
        'cash_flows': 'editCashFlowId',
        'trade_plans': 'editTradePlanId',
        'users': 'editUserId'
    };
    
    const modalIdMap = {
        'user_roles': 'editUserRolesModal',
        'cash_flows': 'editCashFlowsModal',
        'trade_plans': 'editTradePlanModal',
        'users': 'editUsersModal'
    };
    
    if (recordIdMap[tableType]) {
        recordId = document.getElementById(recordIdMap[tableType]).value;
        modalId = modalIdMap[tableType];
    } else {
        recordId = document.getElementById(`edit${capitalizeFirstLetter(tableType)}Id`).value;
        modalId = `edit${capitalizeFirstLetter(tableType)}Modal`;
    }
    
    // איסוף הנתונים מהמודל באמצעות הפונקציה המתאימה
    const recordData = collectModalData(tableType);
    
    try {
        // שליחת הנתונים לשרת לעדכון
        const response = await apiCall(`/api/v1/${tableType}/${recordId}`, {
            method: 'PUT',
            body: JSON.stringify(recordData)
        });
        
        if (response.status === 'success') {
            // הצגת הודעת הצלחה, סגירת המודל ורענון הטבלה
            alert(`${getTableDisplayName(tableType)} נשמר בהצלחה`);
            bootstrap.Modal.getInstance(document.getElementById(modalId)).hide();
            refreshTable(tableType);
        } else {
            // הצגת הודעת שגיאה אם השמירה נכשלה
            alert(`שגיאה בשמירת ${getTableDisplayName(tableType)}`);
        }
    } catch (error) {
        // לוג שגיאה לקונסול והודעת שגיאה למשתמש
        console.error(`Error saving ${tableType}:`, error);
        alert(`שגיאה בשמירת ${getTableDisplayName(tableType)}`);
    }
}

/**
 * פונקציה לאיסוף נתונים ממודל עריכה לפי סוג הטבלה
 * הפונקציה אוספת את הנתונים מהשדות המתאימים במודל ומחזירה אובייקט עם הנתונים
 * 
 * @param {string} tableType - סוג הטבלה (למשל: 'accounts', 'tickers', 'trades')
 * @returns {Object} אובייקט עם הנתונים שנאספו מהמודל
 * 
 * @example
 * // איסוף נתוני חשבון
 * const accountData = collectModalData('accounts');
 * // returns { name: "...", currency: "...", status: "...", ... }
 */
function collectModalData(tableType) {
    // איסוף נתונים לפי סוג הטבלה - כל טבלה מקבלת טיפול ספציפי
    switch (tableType) {
        case 'accounts':
            // איסוף נתוני חשבון
            return {
                name: document.getElementById('editAccountName').value,
                currency: document.getElementById('editAccountCurrency').value,
                status: document.getElementById('editAccountStatus').value,
                cash_balance: parseFloat(document.getElementById('editAccountCashBalance').value),
                notes: document.getElementById('editAccountNotes').value
            };
        case 'tickers':
            // איסוף נתוני טיקר
            return {
                symbol: document.getElementById('editTickerSymbol').value,
                name: document.getElementById('editTickerName').value,
                type: document.getElementById('editTickerType').value,
                currency: document.getElementById('editTickerCurrency').value,
                remarks: document.getElementById('editTickerRemarks').value
            };
        case 'trades':
            // איסוף נתוני טרייד
            return {
                account_id: parseInt(document.getElementById('editTradeAccountId').value),
                ticker_id: parseInt(document.getElementById('editTradeTickerId').value),
                status: document.getElementById('editTradeStatus').value,
                type: document.getElementById('editTradeType').value,
                notes: document.getElementById('editTradeNotes').value
            };
        case 'trade_plans':
            // איסוף נתוני תוכנית טרייד
            return {
                account_id: parseInt(document.getElementById('editTradePlanAccountId').value),
                ticker_id: parseInt(document.getElementById('editTradePlanTickerId').value),
                investment_type: document.getElementById('editTradePlanInvestmentType').value,
                planned_amount: parseFloat(document.getElementById('editTradePlanPlannedAmount').value),
                stop_price: parseFloat(document.getElementById('editTradePlanStopPrice').value) || null,
                target_price: parseFloat(document.getElementById('editTradePlanTargetPrice').value) || null,
                entry_conditions: document.getElementById('editTradePlanEntryConditions').value,
                reasons: document.getElementById('editTradePlanReasons').value
            };
        case 'alerts':
            // איסוף נתוני התראה
            return {
                account_id: parseInt(document.getElementById('editAlertAccountId').value) || null,
                ticker_id: parseInt(document.getElementById('editAlertTickerId').value) || null,
                type: document.getElementById('editAlertType').value,
                condition: document.getElementById('editAlertCondition').value,
                message: document.getElementById('editAlertMessage').value,
                is_active: document.getElementById('editAlertIsActive').value === 'true'
            };
        case 'cash_flows':
            // איסוף נתוני תזרים מזומנים
            return {
                account_id: parseInt(document.getElementById('editCashFlowAccountId').value),
                type: document.getElementById('editCashFlowType').value,
                amount: parseFloat(document.getElementById('editCashFlowAmount').value),
                date: document.getElementById('editCashFlowDate').value,
                description: document.getElementById('editCashFlowDescription').value
            };
        case 'notes':
            // איסוף נתוני הערה
            return {
                account_id: parseInt(document.getElementById('editNoteAccountId').value) || null,
                trade_id: parseInt(document.getElementById('editNoteTradeId').value) || null,
                trade_plan_id: parseInt(document.getElementById('editNoteTradePlanId').value) || null,
                content: document.getElementById('editNoteContent').value,
                attachment: document.getElementById('editNoteAttachment').value
            };
        case 'executions':
            // איסוף נתוני ביצוע
            return {
                trade_id: parseInt(document.getElementById('editExecutionTradeId').value),
                action: document.getElementById('editExecutionAction').value,
                date: document.getElementById('editExecutionDate').value,
                quantity: parseInt(document.getElementById('editExecutionQuantity').value) || null,
                price: parseFloat(document.getElementById('editExecutionPrice').value),
                fee: parseFloat(document.getElementById('editExecutionFee').value) || 0,
                source: document.getElementById('editExecutionSource').value
            };
        case 'users':
            // איסוף נתוני משתמש
            return {
                username: document.getElementById('editUserUsername').value,
                email: document.getElementById('editUserEmail').value,
                is_active: document.getElementById('editUserIsActive').value === 'true',
                roles: document.getElementById('editUserRoles').value.split(',').map(role => role.trim()).filter(role => role)
            };
        case 'user_roles':
            // איסוף נתוני תפקיד משתמש
            return {
                user_id: parseInt(document.getElementById('editUserRoleUserId').value),
                role_id: parseInt(document.getElementById('editUserRoleRoleId').value),
                assigned_at: document.getElementById('editUserRoleAssignedAt').value
            };
        default:
            // החזרת אובייקט ריק אם סוג הטבלה לא מוכר
            return {};
    }
}

/**
 * פונקציה לרענון טבלה לאחר עריכה או מחיקה
 * הפונקציה מוצאת את פונקציית הטעינה המתאימה וקוראת לה
 * 
 * @param {string} tableType - סוג הטבלה (למשל: 'accounts', 'tickers', 'trades')
 * 
 * @example
 * // רענון טבלת חשבונות
 * refreshTable('accounts');
 * 
 * // רענון טבלת טיקרים
 * refreshTable('tickers');
 */
function refreshTable(tableType) {
    // יצירת שם פונקציית הטעינה לפי סוג הטבלה
    // לדוגמה: 'accounts' -> 'loadAccounts', 'trade_plans' -> 'loadTradePlans'
    let loadFunction;
    
    // מיפוי מיוחד לטבלאות עם שמות שונים
    const loadFunctionMap = {
        'user_roles': 'loadUserRoles',
        'cash_flows': 'loadCashFlows',
        'trade_plans': 'loadTradePlans',
        'users': 'loadUsers'
    };
    
    if (loadFunctionMap[tableType]) {
        loadFunction = loadFunctionMap[tableType];
    } else {
        loadFunction = `load${capitalizeFirstLetter(tableType.replace('_', ''))}`;
    }
    
    // בדיקה שהפונקציה קיימת וקריאה אליה
    if (typeof window[loadFunction] === 'function') {
        window[loadFunction]();
    } else {
        console.error(`Load function ${loadFunction} not found for table type ${tableType}`);
    }
}

/**
 * פונקציות עזר למערכת העריכה והמחיקה
 * פונקציות אלו מספקות שירותים בסיסיים למערכת
 */

/**
 * הפיכת האות הראשונה של מחרוזת לאות גדולה
 * משמש ליצירת שמות מודלים ופונקציות
 * 
 * @param {string} string - המחרוזת להפיכה
 * @returns {string} המחרוזת עם אות ראשונה גדולה
 * 
 * @example
 * capitalizeFirstLetter('accounts') // returns 'Accounts'
 * capitalizeFirstLetter('trade_plans') // returns 'Trade_plans'
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * קבלת שם התצוגה של טבלה בעברית
 * מחזיר את השם בעברית של הטבלה להודעות למשתמש
 * 
 * @param {string} tableType - סוג הטבלה באנגלית
 * @returns {string} שם הטבלה בעברית
 * 
 * @example
 * getTableDisplayName('accounts') // returns 'חשבון'
 * getTableDisplayName('tickers') // returns 'טיקר'
 * getTableDisplayName('unknown') // returns 'unknown'
 */
function getTableDisplayName(tableType) {
    // מיפוי שמות הטבלאות באנגלית לשמות בעברית
    const displayNames = {
        'accounts': 'חשבון',
        'tickers': 'טיקר',
        'trades': 'טרייד',
        'trade_plans': 'תוכנית טרייד',
        'alerts': 'התראה',
        'cash_flows': 'תזרים מזומנים',
        'notes': 'הערה',
        'executions': 'ביצוע',
        'users': 'משתמש',
        'user_roles': 'תפקיד משתמש'
    };
    
    // החזרת השם בעברית או את השם המקורי אם לא נמצא
    return displayNames[tableType] || tableType;
}

/**
 * הפיכת הפונקציות לזמינות גלובלית
 * הפונקציות הללו זמינות לשימוש בכל הדפים במערכת
 * 
 * @global
 */
window.editRecord = editRecord;
window.deleteRecord = deleteRecord;
window.saveRecord = saveRecord;

// קריאה לשחזור מצבי הסקשנים בטעינת הדף
document.addEventListener('DOMContentLoaded', function() {
  // המתנה קצרה כדי לוודא שכל האלמנטים נטענו
  setTimeout(() => {
    if (typeof restoreAllSectionStates === 'function') {
      restoreAllSectionStates();
    }
    
    // אתחול סידור לטבלאות
    initializeAllTableSorting();
  }, 100);
});
