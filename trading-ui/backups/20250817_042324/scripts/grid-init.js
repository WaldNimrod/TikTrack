// ===== GRID INITIALIZATION SYSTEM =====
// קובץ אתחול מרכזי למערכת הגריד - משותף לכל הדפים

// פונקציה לאתחול מלא של מערכת הגריד
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

// פונקציה לאתחול מהיר של גריד בסיסי
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

// פונקציה ליצירת גריד עם פילטרים מותאמים אישית
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

// פונקציה ליצירת גריד בדיקה
function initializeTestGrid(containerId = '#agGridFloating') {
  console.log('=== Initializing Test Grid ===');
  
  // בדיקה אם הגריד כבר קיים
  if (window.gridApi) {
    console.log('Grid already exists, skipping initialization');
    return true;
  }
  
  try {
    // יצירת נתוני בדיקה
    const testData = createSampleData(15);
    window.rowData = testData;
    
    // יצירת הגריד עם הגדרות מותאמות אישית אם קיימות
    const gridOptions = createGrid(containerId, testData);
    
    if (gridOptions) {
      // הוספת פונקציונליות בדיקה
      setupTestFunctionality();
      
      // הסטטיסטיקות יתעדכנו על ידי הפילטר
      console.log('Test grid initialized successfully');
      return true;
    } else {
      console.error('Failed to initialize test grid');
      return false;
    }
    
  } catch (error) {
    console.error('Error initializing test grid:', error);
    return false;
  }
}

// פונקציה להגדרת פונקציונליות בדיקה
function setupTestFunctionality() {
  console.log('Setting up test functionality...');
  
  // הוספת event listeners לצ'קבוקסים (רק אם לא קיימים כבר)
  const checkboxes = ['status-open', 'status-closed', 'status-cancelled'];
  checkboxes.forEach(id => {
    const checkbox = document.getElementById(id);
    if (checkbox && !checkbox.hasAttribute('data-test-listener')) {
      checkbox.setAttribute('data-test-listener', 'true');
      checkbox.addEventListener('change', () => {
        console.log(`Checkbox ${id} changed`);
        applyTestFilter();
      });
    }
  });
  
  // הוספת event listeners לכפתורי בדיקה (רק אם לא קיימים כבר)
  const testButtons = document.querySelectorAll('.test-button');
  testButtons.forEach(button => {
    if (!button.hasAttribute('data-test-listener')) {
      button.setAttribute('data-test-listener', 'true');
      button.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-action');
        if (action === 'test-filter') {
          testFilterManually();
        } else if (action === 'test-component') {
          testComponentFilter();
        } else if (action === 'test-api') {
          testGridAPI();
        }
      });
    }
  });
  
  console.log('Test functionality setup completed');
}

// פונקציה להוספת כפתורי בדיקה
function addTestButtons() {
  console.log('Adding test buttons...');
  
  // בדיקה אם כפתורי בדיקה כבר קיימים
  const existingButtons = document.querySelector('.filter-test-section .test-button');
  if (!existingButtons) {
    // יצירת כפתורי בדיקה
    const testButtons = document.createElement('div');
    testButtons.style.marginTop = '15px';
    testButtons.innerHTML = `
      <button class="test-button primary" data-action="test-filter">בדוק פילטר ידנית</button>
      <button class="test-button secondary" data-action="test-component">בדוק קומפוננטה</button>
      <button class="test-button danger" data-action="test-api">בדוק Grid API</button>
    `;
    
    // הוספה לאלמנט הקיים
    const container = document.querySelector('.filter-test-section');
    if (container) {
      container.appendChild(testButtons);
      console.log('Test buttons added to container');
    } else {
      console.warn('Filter test section not found, cannot add test buttons');
    }
  } else {
    console.log('Test buttons already exist, skipping');
  }
  
  console.log('Test buttons process completed');
}



// פונקציה ליצירת דף בדיקה מלא
function createTestPage() {
  console.log('Creating complete test page...');
  
  // הוספת כפתורי בדיקה לאלמנט הקיים
  addTestButtons();
  
  // אתחול הגריד - רק אם הוא לא קיים כבר
  if (!window.gridApi) {
    initializeTestGrid();
  } else {
    console.log('Grid already exists, skipping initialization');
  }
  
  // בדיקת זמינות השרת
  setTimeout(async () => {
    const isServerAvailable = await checkServerAvailability();
    console.log('Server availability check:', isServerAvailable);
    if (isServerAvailable) {
      console.log('Server is available, ready for database testing');
    } else {
      console.warn('Server is not available, database functions will use fallback data');
    }
  }, 1000);
  
  console.log('Test page created successfully');
}

// פונקציה לבדיקת זמינות המערכת
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

// פונקציה לרענון מלא של המערכת
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

// פונקציה לניקוי המערכת
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

// אתחול אוטומטי כשהדף נטען
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, checking for grid initialization...');
  
  // בדיקה אם יש אלמנט גריד בדף
  const gridDiv = document.querySelector('#agGridFloating');
  if (gridDiv) {
    console.log('Grid container found, initializing system...');
    
    // בדיקה אם זה דף בדיקה
    const isTestPage = window.location.pathname.includes('grid-test');
    
    if (isTestPage) {
      // אתחול דף בדיקה מלא
      createTestPage();
    } else {
      // אתחול גריד רגיל
      initializeGridSystem();
    }
  } else {
    console.log('No grid container found, skipping initialization');
  }
});

// הפיכת הפונקציות לזמינות גלובלית
window.initializeGridSystem = initializeGridSystem;
window.initializeBasicGrid = initializeBasicGrid;
window.initializeGridWithFilters = initializeGridWithFilters;
window.initializeTestGrid = initializeTestGrid;
window.setupTestFunctionality = setupTestFunctionality;
window.addTestButtons = addTestButtons;
window.createTestPage = createTestPage;
window.checkSystemAvailability = checkSystemAvailability;
window.refreshGridSystem = refreshGridSystem;
window.clearGridSystem = clearGridSystem;
