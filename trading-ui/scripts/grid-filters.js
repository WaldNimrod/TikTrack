// ===== GRID FILTERS SYSTEM =====
// קובץ ייעודי למערכת הפילטרים - משותף לכל הדפים

// פונקציה להחלת פילטר סטטוס, סוג וחשבונות על הגריד
function applyStatusFilterToGrid(selectedStatuses, selectedTypes = null, selectedAccounts = null) {
  if (!window.gridApi) {
    console.log('Grid API not available yet');
    return;
  }

  console.log('=== applyStatusFilterToGrid called ===');
  console.log('Selected statuses:', selectedStatuses);
  console.log('Selected types:', selectedTypes);
  console.log('Selected accounts:', selectedAccounts);
  console.log('Window rowData length:', window.rowData ? window.rowData.length : 'undefined');

  try {
    let filteredData = window.rowData || [];
    console.log('Initial data length:', filteredData.length);
    
    // סינון לפי סטטוס
    if (selectedStatuses && selectedStatuses.length > 0 && selectedStatuses.length < 3) {
      console.log('Applying status filter for:', selectedStatuses);
      filteredData = filteredData.filter(row => selectedStatuses.includes(row.status));
      console.log('Status filter applied, showing', filteredData.length, 'rows');
    } else {
      console.log('No status filter applied');
    }
    
    // סינון לפי סוג
    if (selectedTypes && selectedTypes.length > 0 && selectedTypes.length < 4) {
      console.log('Applying type filter for:', selectedTypes);
      filteredData = filteredData.filter(row => selectedTypes.includes(row.type));
      console.log('Type filter applied, showing', filteredData.length, 'rows');
    } else {
      console.log('No type filter applied');
    }
    
    // סינון לפי חשבון
    if (selectedAccounts && selectedAccounts.length > 0) {
      console.log('Applying account filter for:', selectedAccounts);
      filteredData = filteredData.filter(row => selectedAccounts.includes(row.account));
      console.log('Account filter applied, showing', filteredData.length, 'rows');
    } else {
      console.log('No account filter applied');
    }
    
    window.gridApi.setGridOption('rowData', filteredData);
    console.log('Final filtered data:', filteredData.length, 'rows');
    console.log('=== applyStatusFilterToGrid completed ===');
    
  } catch (error) {
    console.error('Error updating grid data:', error);
    console.log('Grid API methods available:', Object.keys(window.gridApi));
  }
}

// פונקציה לעדכון הגריד מהקומפוננטה
function updateGridFromComponent(selectedStatuses, selectedTypes = null, selectedAccounts = null) {
  console.log('=== updateGridFromComponent called ===');
  console.log('Selected statuses:', selectedStatuses);
  console.log('Selected types:', selectedTypes);
  console.log('Selected accounts:', selectedAccounts);
  applyStatusFilterToGrid(selectedStatuses, selectedTypes, selectedAccounts);
  console.log('=== updateGridFromComponent completed ===');
}

// פונקציה להחלת כל הפילטרים ביחד
function applyAllFiltersToGrid(selectedStatuses, selectedAccounts = null, selectedDateRange = null) {
  if (!window.gridApi) {
    console.log('Grid API not available yet');
    return;
  }

  console.log('Applying all filters to grid:', { selectedStatuses, selectedAccounts, selectedDateRange });

  try {
    let currentData = window.rowData || [];
    
    // סינון לפי סטטוס
    if (selectedStatuses && selectedStatuses.length > 0 && selectedStatuses.length < 3) {
      currentData = currentData.filter(row => selectedStatuses.includes(row.status));
      console.log('Status filter applied, showing', currentData.length, 'rows');
    }
    
    // סינון לפי חשבון
    if (selectedAccounts && selectedAccounts.length > 0) {
      currentData = currentData.filter(row => selectedAccounts.includes(row.account));
      console.log('Account filter applied, showing', currentData.length, 'rows');
    }
    
    // סינון לפי טווח תאריכים
    if (selectedDateRange && selectedDateRange !== 'הכול') {
      const now = new Date();
      let startDate = new Date();
      
      switch (selectedDateRange) {
        case 'שבוע':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'MTD':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case '30 יום':
          startDate.setDate(now.getDate() - 30);
          break;
        case '60 יום':
          startDate.setDate(now.getDate() - 60);
          break;
        case '90 יום':
          startDate.setDate(now.getDate() - 90);
          break;
        case 'שנה':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'YTD':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case 'שנה קודמת':
          startDate = new Date(now.getFullYear() - 1, 0, 1);
          const endDate = new Date(now.getFullYear() - 1, 11, 31);
          break;
        default:
          console.log('Unknown date range:', selectedDateRange);
          break;
      }
      
      currentData = currentData.filter(row => {
        const dateField = row.date || row.created_at || row.opened_at;
        if (!dateField) return false;
        const rowDate = new Date(dateField);
        return rowDate >= startDate && rowDate <= now;
      });
      console.log('Date range filter applied:', selectedDateRange, 'showing', currentData.length, 'rows');
    }
    
    window.gridApi.setGridOption('rowData', currentData);
    
    // עדכון סטטיסטיקות בהתאם לנתונים המוצגים (תמיד בסוף התהליך)
    setTimeout(() => {
      updateSummaryStats(); // לא מעבירים נתונים - הפונקציה תקבל את הנתונים המוצגים מהגריד
    }, 100);
    
  } catch (error) {
    console.error('Error updating grid data:', error);
    console.log('Grid API methods available:', Object.keys(window.gridApi));
  }
}

// פונקציה להחלת פילטר תאריכים על הגריד
function applyDateRangeFilterToGrid(selectedDateRange) {
  if (!window.gridApi) {
    console.log('Grid API not available yet for date range filter');
    return;
  }

  console.log('Applying date range filter to grid:', selectedDateRange);

  try {
    // קבלת הנתונים המקוריים (לא מסוננים)
    let currentData = window.rowData || [];
    
    // אם זה "הכול", נשאיר את כל הנתונים
    if (selectedDateRange === 'הכול') {
      console.log('Date range filter reset to "הכול", showing all data');
    } else if (selectedDateRange) {
      // סינון לפי טווח תאריכים
      const now = new Date();
      let startDate = new Date();
      
      switch (selectedDateRange) {
        case 'שבוע':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'MTD':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case '30 יום':
          startDate.setDate(now.getDate() - 30);
          break;
        case '60 יום':
          startDate.setDate(now.getDate() - 60);
          break;
        case '90 יום':
          startDate.setDate(now.getDate() - 90);
          break;
        case 'שנה':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'YTD':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case 'שנה קודמת':
          startDate = new Date(now.getFullYear() - 1, 0, 1);
          const endDate = new Date(now.getFullYear() - 1, 11, 31);
          break;
        default:
          console.log('Unknown date range:', selectedDateRange);
          break;
      }
      
      currentData = currentData.filter(row => {
        const dateField = row.date || row.created_at || row.opened_at;
        if (!dateField) return false;
        const rowDate = new Date(dateField);
        return rowDate >= startDate && rowDate <= now;
      });
      console.log('Date range filter applied:', selectedDateRange, 'showing', currentData.length, 'rows');
    }
    
    window.gridApi.setGridOption('rowData', currentData);
    
    // עדכון סטטיסטיקות בהתאם לנתונים המוצגים
    setTimeout(() => {
      updateSummaryStats();
    }, 100);
    
  } catch (error) {
    console.error('Error updating grid data with date filter:', error);
  }
}

// פונקציה לטעינת פילטרים שמורים
function loadSavedFilters() {
  try {
    const savedStatusFilter = localStorage.getItem('planningFilterStatuses');
    const savedTypeFilter = localStorage.getItem('planningFilterTypes');
    const savedAccountFilter = localStorage.getItem('planningFilterAccounts');
    
    let filters = {};
    
    if (savedStatusFilter) {
      filters.statuses = JSON.parse(savedStatusFilter);
      console.log('Loaded saved status filter:', filters.statuses);
    }
    if (savedTypeFilter) {
      filters.types = JSON.parse(savedTypeFilter);
      console.log('Loaded saved type filter:', filters.types);
    }
    if (savedAccountFilter) {
      filters.accounts = JSON.parse(savedAccountFilter);
      console.log('Loaded saved account filter:', filters.accounts);
    }
    
    return filters;
  } catch (error) {
    console.error('Error loading saved filters:', error);
  }
  return null;
}

// פונקציה לטעינת פילטר סטטוס שמור
function loadSavedStatusFilter() {
  try {
    const savedFilter = localStorage.getItem('planningFilterStatuses');
    if (savedFilter) {
      return JSON.parse(savedFilter);
    }
  } catch (error) {
    console.error('Error loading saved filter:', error);
  }
  return null;
}

// פונקציה לעדכון הקומפוננט הכותרת עם פילטר
function updateHeaderComponentWithFilter(selectedStatuses, selectedAccounts = null) {
  const header = document.querySelector('app-header');
  if (header && header.shadowRoot) {
    // קריאה לפונקציה בתוך הקומפוננטה
    if (header.updateFilterFromExternal) {
      header.updateFilterFromExternal(selectedStatuses, selectedAccounts);
    }
  }
}

// פונקציה לעדכון הצ'קבוקסים מהקומפוננטה
window.updateTestCheckboxesFromComponent = function(selectedStatuses) {
  console.log('=== updateTestCheckboxesFromComponent called ===');
  console.log('Selected statuses:', selectedStatuses);
  
  const openCheckbox = document.getElementById('status-open');
  const closedCheckbox = document.getElementById('status-closed');
  const cancelledCheckbox = document.getElementById('status-cancelled');
  
  console.log('Found status checkboxes:', {
    open: !!openCheckbox,
    closed: !!closedCheckbox,
    cancelled: !!cancelledCheckbox
  });
  
  if (openCheckbox) {
    const wasChecked = openCheckbox.checked;
    openCheckbox.checked = selectedStatuses.includes('פתוח');
    console.log(`Open checkbox: was ${wasChecked}, now ${openCheckbox.checked}`);
  }
  if (closedCheckbox) {
    const wasChecked = closedCheckbox.checked;
    closedCheckbox.checked = selectedStatuses.includes('סגור');
    console.log(`Closed checkbox: was ${wasChecked}, now ${closedCheckbox.checked}`);
  }
  if (cancelledCheckbox) {
    const wasChecked = cancelledCheckbox.checked;
    cancelledCheckbox.checked = selectedStatuses.includes('מבוטל');
    console.log(`Cancelled checkbox: was ${wasChecked}, now ${cancelledCheckbox.checked}`);
  }
  
  console.log('=== updateTestCheckboxesFromComponent completed ===');
}

// פונקציה לעדכון הצ'קבוקסים לפי הפילטר
function updateTestCheckboxes(selectedStatuses) {
  console.log('Updating test checkboxes with:', selectedStatuses);
  
  const openCheckbox = document.getElementById('status-open');
  const closedCheckbox = document.getElementById('status-closed');
  const cancelledCheckbox = document.getElementById('status-cancelled');
  
  if (openCheckbox) {
    openCheckbox.checked = selectedStatuses.includes('פתוח');
  }
  if (closedCheckbox) {
    closedCheckbox.checked = selectedStatuses.includes('סגור');
  }
  if (cancelledCheckbox) {
    cancelledCheckbox.checked = selectedStatuses.includes('מבוטל');
  }
}

// פונקציה לניקוי פילטר בדיקה
function clearTestFilter() {
  // בחירת רק "פתוח" כברירת מחדל
  document.getElementById('status-open').checked = true;
  document.getElementById('status-closed').checked = false;
  document.getElementById('status-cancelled').checked = false;
  
  // ניקוי הפילטר מהגריד
  applyStatusFilterToGrid(['פתוח'], null);
  console.log('Test filter cleared - only "פתוח" selected');
}

// פונקציה להחלת פילטר בדיקה
function applyTestFilter() {
  const selectedStatuses = [];
  
  if (document.getElementById('status-open')?.checked) {
    selectedStatuses.push('פתוח');
  }
  if (document.getElementById('status-closed')?.checked) {
    selectedStatuses.push('סגור');
  }
  if (document.getElementById('status-cancelled')?.checked) {
    selectedStatuses.push('מבוטל');
  }
  
  console.log('Test filter - Selected statuses:', selectedStatuses);
      applyStatusFilterToGrid(selectedStatuses, null);
}

// פונקציה לעדכון המרווחים לפי מצב הפילטר
function updateBackgroundPadding(isCollapsed) {
  const backgroundWrapper = document.querySelector('.background-wrapper');
  const body = document.body;
  
  if (backgroundWrapper) {
    if (isCollapsed) {
      backgroundWrapper.classList.add('filter-collapsed');
    } else {
      backgroundWrapper.classList.remove('filter-collapsed');
    }
  }
  
  if (body) {
    if (isCollapsed) {
      body.classList.add('filter-collapsed');
    } else {
      body.classList.remove('filter-collapsed');
    }
  }
}

// פונקציה להגדרת האזנה לכותרת
function setupHeaderListener() {
  const header = document.querySelector('app-header');
  if (header) {
    // האזנה לשינויים בפילטר
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const filterSection = header.shadowRoot?.querySelector('#statusFilterSection');
          if (filterSection) {
            const isCollapsed = filterSection.classList.contains('collapsed');
            updateBackgroundPadding(isCollapsed);
          }
        }
      });
    });

    // התחלת ההאזנה
    setTimeout(() => {
      const filterSection = header.shadowRoot?.querySelector('#statusFilterSection');
      if (filterSection) {
        observer.observe(filterSection, { attributes: true });
      }
    }, 1000);
  }
}

// פונקציה לבדיקה ידנית של הפילטר
function testFilterManually() {
  console.log('=== Testing filter manually ===');
  const testValues = ['פתוח', 'סגור'];
  console.log('Testing with values:', testValues);
  updateTestCheckboxesFromComponent(testValues);
  updateGridFromComponent(testValues);
  console.log('=== Manual test completed ===');
}

// פונקציה לבדיקת Grid API
function testGridAPI() {
  console.log('=== Testing Grid API ===');
  console.log('Grid API object:', window.gridApi);
  console.log('Grid API methods:', Object.keys(window.gridApi));
  if (window.gridApi && window.gridApi.setGridOption) {
    console.log('setGridOption is available');
    try {
      window.gridApi.setGridOption('rowData', (window.rowData || []).slice(0, 2));
      console.log('Successfully updated grid with 2 rows');
    } catch (error) {
      console.error('Error updating grid:', error);
    }
  } else {
    console.log('setGridOption is not available');
  }
  console.log('=== Grid API test completed ===');
}

// פונקציה לבדיקת קומפוננטה
function testComponentFilter() {
  console.log('=== Testing component filter ===');
  const header = document.querySelector('app-header');
  if (header && header.shadowRoot) {
    console.log('Header component found');
    if (header.applyStatusFilter) {
      header.applyStatusFilter();
      console.log('Component filter applied');
    } else {
      console.log('Component filter method not found');
    }
  } else {
    console.log('Header component not found');
  }
  console.log('=== Component test completed ===');
}

// פונקציה לעדכון הפילטר מהקומפוננטה
function applyStatusFilter() {
  const header = document.querySelector('app-header');
  if (header && header.shadowRoot) {
    if (header.applyStatusFilter) {
      header.applyStatusFilter();
    }
  }
}

// פונקציה לניקוי הפילטר מהקומפוננטה
function clearStatusFilter() {
  const header = document.querySelector('app-header');
  if (header && header.shadowRoot) {
    if (header.clearStatusFilter) {
      header.clearStatusFilter();
    }
  }
}

// פונקציה לאתחול מערכת הפילטרים
function initializeFilterSystem() {
  console.log('Initializing filter system...');
  
  // הוספת event listeners לצ'קבוקסים (רק אם לא קיימים כבר)
  const checkboxes = ['status-open', 'status-closed', 'status-cancelled'];
  checkboxes.forEach(id => {
    const checkbox = document.getElementById(id);
    if (checkbox && !checkbox.hasAttribute('data-filter-listener')) {
      checkbox.setAttribute('data-filter-listener', 'true');
      checkbox.addEventListener('change', () => {
        console.log(`Checkbox ${id} changed`);
        applyTestFilter();
      });
    }
  });
  
  // הגדרת האזנה לכותרת
  setupHeaderListener();
  
  // עדכון הקומפוננט הכותרת עם הפילטר השמור (אם יש)
  const savedFilter = loadSavedStatusFilter();
  if (savedFilter) {
    console.log('Filter system ready - updating header with saved filter:', savedFilter);
    updateHeaderComponentWithFilter(savedFilter);
  }
  
  console.log('Filter system initialized');
}

// הפיכת הפונקציות לזמינות גלובלית
window.applyStatusFilterToGrid = applyStatusFilterToGrid;
window.applyDateRangeFilterToGrid = applyDateRangeFilterToGrid;
window.applyAllFiltersToGrid = applyAllFiltersToGrid;
window.updateGridFromComponent = updateGridFromComponent;
window.loadSavedFilters = loadSavedFilters;
window.loadSavedStatusFilter = loadSavedStatusFilter;
window.updateHeaderComponentWithFilter = updateHeaderComponentWithFilter;
window.updateTestCheckboxesFromComponent = updateTestCheckboxesFromComponent;
window.updateTestCheckboxes = updateTestCheckboxes;
window.clearTestFilter = clearTestFilter;
window.applyTestFilter = applyTestFilter;
window.updateBackgroundPadding = updateBackgroundPadding;
window.setupHeaderListener = setupHeaderListener;
window.testFilterManually = testFilterManually;
window.testGridAPI = testGridAPI;
window.testComponentFilter = testComponentFilter;
window.applyStatusFilter = applyStatusFilter;
window.clearStatusFilter = clearStatusFilter;
window.initializeFilterSystem = initializeFilterSystem;

// ===== פונקציות כלליות לפילטרים =====

// פונקציה כללית לטעינת פילטרים שמורים לפי שם דף
function loadSavedFiltersForPage(pageName) {
  console.log(`🔍 === Loading saved filters for ${pageName} ===`);
  
  // שימוש בשמות ספציפיים לדף ב-localStorage
  const savedStatuses = localStorage.getItem(`${pageName}FilterStatuses`) || localStorage.getItem('globalFilterStatuses');
  const savedTypes = localStorage.getItem(`${pageName}FilterTypes`) || localStorage.getItem('globalFilterTypes');
  const savedAccounts = localStorage.getItem(`${pageName}FilterAccounts`) || localStorage.getItem('globalFilterAccounts');
  const savedDateRange = localStorage.getItem(`${pageName}FilterDateRange`) || localStorage.getItem('globalFilterDateRanges');
  const savedSearch = localStorage.getItem(`${pageName}FilterSearch`) || localStorage.getItem('globalFilterSearch');
  
  console.log(`🔍 Saved filters for ${pageName}:`, {
    statuses: savedStatuses,
    types: savedTypes,
    accounts: savedAccounts,
    dateRanges: savedDateRanges,
    search: savedSearch
  });
  
  // הגדרת ברירת מחדל - רק רשומות פתוחות
  if (!savedStatuses) {
    window.selectedStatusesForFilter = ['פתוח'];
    localStorage.setItem('globalFilterStatuses', JSON.stringify(['פתוח']));
    console.log(`🔍 Set default filter for ${pageName}: only open items`);
  } else {
    window.selectedStatusesForFilter = JSON.parse(savedStatuses);
  }
  
  if (savedTypes) {
    window.selectedTypesForFilter = JSON.parse(savedTypes);
  } else {
    window.selectedTypesForFilter = [];
  }
  
  if (savedAccounts) {
    window.selectedAccountsForFilter = JSON.parse(savedAccounts);
  } else {
    window.selectedAccountsForFilter = [];
  }
  
  if (savedDateRange) {
    try {
      // בדיקה אם זה מערך (פורמט ישן) או מחרוזת (פורמט חדש)
      if (savedDateRange.startsWith('[')) {
        const dateRanges = JSON.parse(savedDateRange);
        window.selectedDateRangeForFilter = dateRanges.length > 0 ? dateRanges[0] : null;
      } else {
        window.selectedDateRangeForFilter = savedDateRange;
      }
    } catch (e) {
      console.log('🔍 Error parsing date range, using as string:', e);
      window.selectedDateRangeForFilter = savedDateRange;
    }
  } else {
    window.selectedDateRangeForFilter = null;
  }
  
  if (savedSearch) {
    window.searchTermForFilter = savedSearch;
  } else {
    window.searchTermForFilter = '';
  }
  
  console.log(`🔍 Loaded filters for ${pageName}:`, {
    statuses: window.selectedStatusesForFilter,
    types: window.selectedTypesForFilter,
    accounts: window.selectedAccountsForFilter,
    dateRange: window.selectedDateRangeForFilter,
    search: window.searchTermForFilter
  });
}

// פונקציה כללית לעדכון header עם פילטרים שמורים
function updateHeaderWithSavedFilters(pageName) {
  console.log(`🔍 === Updating header with saved filters for ${pageName} ===`);
  
  const appHeader = document.querySelector('app-header');
  if (appHeader && appHeader.updateFiltersFromSaved) {
    appHeader.updateFiltersFromSaved({
      statuses: window.selectedStatusesForFilter || [],
      types: window.selectedTypesForFilter || [],
      accounts: window.selectedAccountsForFilter || [],
      dateRange: window.selectedDateRangeForFilter || null,
      search: window.searchTermForFilter || ''
    });
  } else {
    console.log(`🔍 Header component not found or updateFiltersFromSaved method not available for ${pageName}`);
  }
}

// פונקציה כללית לעדכון מהפילטרים
function updateGridFromComponentGlobal(selectedStatuses, selectedTypes, selectedAccounts, selectedDateRange, searchTerm, pageName) {
  console.log(`🔍 === ${pageName.toUpperCase()} PAGE updateGridFromComponent called ===`);
  console.log(`🔍 This is the ${pageName.toUpperCase()} PAGE function!`);
  console.log('🔍 Selected statuses:', selectedStatuses);
  console.log('🔍 Selected types:', selectedTypes);
  console.log('🔍 Selected accounts:', selectedAccounts);
  console.log('🔍 Selected date range:', selectedDateRange);
  console.log('🔍 Search term:', searchTerm);
  
  // שמירת הערכים הנבחרים
  window.selectedStatusesForFilter = selectedStatuses;
  window.selectedTypesForFilter = selectedTypes;
  window.selectedAccountsForFilter = selectedAccounts;
  window.selectedDateRangeForFilter = selectedDateRange;
  window.searchTermForFilter = searchTerm;
  
  // שמירת הפילטרים ב-localStorage עם שמות ספציפיים לדף
  localStorage.setItem(`${pageName}FilterStatuses`, JSON.stringify(selectedStatuses));
  localStorage.setItem(`${pageName}FilterTypes`, JSON.stringify(selectedTypes));
  localStorage.setItem(`${pageName}FilterAccounts`, JSON.stringify(selectedAccounts));
  if (selectedDateRange) {
    localStorage.setItem(`${pageName}FilterDateRange`, selectedDateRange);
  }
  if (searchTerm) {
    localStorage.setItem(`${pageName}FilterSearch`, searchTerm);
  }
  
  // שמירה גם בשמות גלובליים לתאימות לאחור
  localStorage.setItem('globalFilterStatuses', JSON.stringify(selectedStatuses));
  localStorage.setItem('globalFilterTypes', JSON.stringify(selectedTypes));
  localStorage.setItem('globalFilterAccounts', JSON.stringify(selectedAccounts));
  if (selectedDateRange) {
    localStorage.setItem('globalFilterDateRanges', JSON.stringify([selectedDateRange]));
  }
  if (searchTerm) {
    localStorage.setItem('globalFilterSearch', searchTerm);
  }
  
  // קריאה לפונקציה הספציפית של הדף
  const pageLoadFunction = window[`load${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Data`];
  if (pageLoadFunction && typeof pageLoadFunction === 'function') {
    pageLoadFunction();
  } else {
    console.log(`🔍 Page-specific load function not found: load${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Data`);
  }
  
  console.log(`🔍 === ${pageName.toUpperCase()} PAGE updateGridFromComponent completed ===`);
}

// פונקציה כללית לאיפוס פילטרים
function resetAllFiltersForPage(pageName) {
  console.log(`🔍 Resetting all filters for ${pageName}`);
  
  // איפוס פילטרים
  window.selectedStatusesForFilter = ['פתוח']; // ברירת מחדל
  window.selectedTypesForFilter = [];
  window.selectedAccountsForFilter = [];
  window.selectedDateRangeForFilter = null;
  window.searchTermForFilter = '';
  
  // מחיקת פילטרים מ-localStorage (גלובליים וספציפיים לדף)
  localStorage.removeItem('globalFilterStatuses');
  localStorage.removeItem('globalFilterTypes');
  localStorage.removeItem('globalFilterAccounts');
  localStorage.removeItem('globalFilterDateRanges');
  localStorage.removeItem('globalFilterSearch');
  
  // מחיקת פילטרים ספציפיים לדף
  localStorage.removeItem(`${pageName}FilterStatuses`);
  localStorage.removeItem(`${pageName}FilterTypes`);
  localStorage.removeItem(`${pageName}FilterAccounts`);
  localStorage.removeItem(`${pageName}FilterDateRange`);
  localStorage.removeItem(`${pageName}FilterSearch`);
  
  // שמירת ברירת מחדל (גלובלית וספציפית לדף)
  localStorage.setItem('globalFilterStatuses', JSON.stringify(['פתוח']));
  localStorage.setItem(`${pageName}FilterStatuses`, JSON.stringify(['פתוח']));
  
  // עדכון header
  updateHeaderWithSavedFilters(pageName);
  
  // קריאה לפונקציה הספציפית של הדף
  const pageLoadFunction = window[`load${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Data`];
  if (pageLoadFunction && typeof pageLoadFunction === 'function') {
    pageLoadFunction();
  }
}

// פונקציה כללית לאתחול דף
function initializePageFilters(pageName) {
  console.log(`🔍 === ${pageName.toUpperCase()} PAGE LOADED ===`);
  
  // טעינת פילטרים שמורים
  loadSavedFiltersForPage(pageName);
  
  // עדכון header עם פילטרים שמורים
  setTimeout(() => {
    updateHeaderWithSavedFilters(pageName);
  }, 200);
  
  // טעינת נתונים
  setTimeout(() => {
    const pageLoadFunction = window[`load${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Data`];
    if (pageLoadFunction && typeof pageLoadFunction === 'function') {
      pageLoadFunction();
    } else {
      console.log(`🔍 Page-specific load function not found: load${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Data`);
      // נסיון עם שם פונקציה אחר
      const altPageLoadFunction = window[`load${pageName}Data`];
      if (altPageLoadFunction && typeof altPageLoadFunction === 'function') {
        altPageLoadFunction();
      }
    }
  }, 300);
}

// הוספת הפונקציות החדשות לגלובל
window.loadSavedFiltersForPage = loadSavedFiltersForPage;
window.updateHeaderWithSavedFilters = updateHeaderWithSavedFilters;
window.updateGridFromComponentGlobal = updateGridFromComponentGlobal;
window.resetAllFiltersForPage = resetAllFiltersForPage;
window.initializePageFilters = initializePageFilters;

// פונקציה כללית לסינון נתונים לפי פילטרים
function filterDataByFilters(data, pageName) {
  console.log(`🔍 === Filtering data for ${pageName} ===`);
  console.log('🔍 Initial data length:', data.length);
  
  let filteredData = [...data];
  
  // החלת פילטרים על הנתונים
  const selectedStatuses = window.selectedStatusesForFilter || [];
  const selectedTypes = window.selectedTypesForFilter || [];
  const selectedAccounts = window.selectedAccountsForFilter || [];
  const selectedDateRange = window.selectedDateRangeForFilter || null;
  const searchTerm = window.searchTermForFilter || '';
  
  console.log('🔍 Applying filters - Statuses:', selectedStatuses, 'Types:', selectedTypes, 'Accounts:', selectedAccounts, 'Date Range:', selectedDateRange, 'Search:', searchTerm);
  
  // סינון לפי סטטוס
  if (selectedStatuses && selectedStatuses.length > 0 && selectedStatuses.length < 3) {
    console.log('🔍 Filtering by status:', selectedStatuses);
    console.log('🔍 Data before status filter:', filteredData.length);
    
    filteredData = filteredData.filter(item => {
      let itemStatus;
      if (pageName === 'designs') {
        if (item.status === 'canceled') {
          itemStatus = 'מבוטל';
        } else if (item.status === 'closed') {
          itemStatus = 'סגור';
        } else {
          itemStatus = 'פתוח';
        }
      } else if (pageName === 'planning') {
        itemStatus = item.canceled_at ? 'מבוטל' : 'פתוח';
      } else {
        itemStatus = item.status || 'פתוח';
      }
      
      const isIncluded = selectedStatuses.includes(itemStatus);
      console.log(`🔍 Item ${item.ticker || item.ticker_symbol}: status=${itemStatus}, included=${isIncluded}`);
      return isIncluded;
    });
    console.log('🔍 After status filter:', filteredData.length, 'items');
  } else {
    console.log('🔍 No status filter applied - selectedStatuses:', selectedStatuses);
  }
  
  // סינון לפי סוג השקעה
  if (selectedTypes && selectedTypes.length > 0 && selectedTypes.length < 3) {
    console.log('🔍 Filtering by type:', selectedTypes);
    console.log('🔍 Data before type filter:', filteredData.length);
    
    filteredData = filteredData.filter(item => {
      let itemType;
      if (pageName === 'designs') {
        itemType = item.type || 'long';
      } else if (pageName === 'planning') {
        itemType = item.investment_type || 'long';
      } else {
        itemType = item.type || 'long';
      }
      
      const isIncluded = selectedTypes.includes(itemType);
      console.log(`🔍 Item ${item.ticker || item.ticker_symbol}: type=${itemType}, included=${isIncluded}`);
      return isIncluded;
    });
    console.log('🔍 After type filter:', filteredData.length, 'items');
  } else {
    console.log('🔍 No type filter applied - selectedTypes:', selectedTypes);
  }
  
  // סינון לפי חשבון
  if (selectedAccounts && selectedAccounts.length > 0) {
    console.log('🔍 Filtering by account:', selectedAccounts);
    console.log('🔍 Data before account filter:', filteredData.length);
    
    filteredData = filteredData.filter(item => {
      let itemAccount;
      if (pageName === 'designs') {
        itemAccount = item.account || 'חשבון ראשי';
      } else if (pageName === 'planning') {
        itemAccount = item.account_name || item.account || 'חשבון ראשי';
      } else {
        itemAccount = item.account || 'חשבון ראשי';
      }
      
      const isIncluded = selectedAccounts.includes(itemAccount);
      console.log(`🔍 Item ${item.ticker || item.ticker_symbol}: account=${itemAccount}, included=${isIncluded}`);
      return isIncluded;
    });
    console.log('🔍 After account filter:', filteredData.length, 'items');
  } else {
    console.log('🔍 No account filter applied - selectedAccounts:', selectedAccounts);
  }
  
  // סינון לפי חיפוש
  if (searchTerm && searchTerm.trim() !== '') {
    console.log('🔍 Filtering by search term:', searchTerm);
    console.log('🔍 Data before search filter:', filteredData.length);
    
    filteredData = filteredData.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const tickerMatch = (item.ticker || item.ticker_symbol || '').toLowerCase().includes(searchLower);
      const notesMatch = (item.notes || '').toLowerCase().includes(searchLower);
      const isIncluded = tickerMatch || notesMatch;
      console.log(`🔍 Item ${item.ticker || item.ticker_symbol}: search match=${isIncluded}`);
      return isIncluded;
    });
    console.log('🔍 After search filter:', filteredData.length, 'items');
  } else {
    console.log('🔍 No search filter applied - searchTerm:', searchTerm);
  }
  
  // סינון לפי טווח תאריכים
  if (selectedDateRange && selectedDateRange !== 'הכול') {
    console.log('🔍 Filtering by date range:', selectedDateRange);
    console.log('🔍 Data before date range filter:', filteredData.length);
    
    const now = new Date();
    let startDate = new Date();
    
    switch (selectedDateRange) {
      case 'שבוע':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'MTD':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '30 יום':
        startDate.setDate(now.getDate() - 30);
        break;
      case '60 יום':
        startDate.setDate(now.getDate() - 60);
        break;
      case '90 יום':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'שנה':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'YTD':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'שנה קודמת':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        const endDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
    }
    
    filteredData = filteredData.filter(item => {
      let itemDate;
      if (pageName === 'designs') {
        // המרת תאריך מפורמט "DD.MM.YYYY" ל-Date object
        const dateParts = item.date.split('.');
        if (dateParts.length === 3) {
          const day = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]) - 1; // חודשים מתחילים מ-0
          const year = parseInt(dateParts[2]);
          itemDate = new Date(year, month, day);
        } else {
          itemDate = new Date(item.date);
        }
      } else if (pageName === 'planning') {
        itemDate = new Date(item.created_at);
      } else {
        itemDate = new Date(item.date || item.created_at);
      }
      
      let isIncluded;
      if (selectedDateRange === 'שנה קודמת') {
        isIncluded = itemDate >= startDate && itemDate <= endDate;
      } else {
        isIncluded = itemDate >= startDate && itemDate <= now;
      }
      
      console.log(`🔍 Item ${item.ticker || item.ticker_symbol}: date=${itemDate}, included=${isIncluded}`);
      return isIncluded;
    });
    console.log('🔍 After date range filter:', filteredData.length, 'items');
  } else {
    console.log('🔍 No date range filter applied - selectedDateRange:', selectedDateRange);
  }
  
  console.log(`🔍 === Filtering completed for ${pageName} ===`);
  console.log('🔍 Final filtered data length:', filteredData.length);
  
  return filteredData;
}

// פונקציה לבדיקת פילטרים שמורים (לצורך דיבוג)
function debugSavedFilters(pageName) {
  console.log(`🔍 === Debugging saved filters for ${pageName} ===`);
  
  const savedStatuses = localStorage.getItem(`${pageName}FilterStatuses`);
  const savedTypes = localStorage.getItem(`${pageName}FilterTypes`);
  const savedAccounts = localStorage.getItem(`${pageName}FilterAccounts`);
  const savedDateRange = localStorage.getItem(`${pageName}FilterDateRange`);
  const savedSearch = localStorage.getItem(`${pageName}FilterSearch`);
  
  console.log('🔍 Saved filters from localStorage:', {
    statuses: savedStatuses,
    types: savedTypes,
    accounts: savedAccounts,
    dateRange: savedDateRange,
    search: savedSearch
  });
  
  console.log('🔍 Current window variables:', {
    statuses: window.selectedStatusesForFilter,
    types: window.selectedTypesForFilter,
    accounts: window.selectedAccountsForFilter,
    dateRange: window.selectedDateRangeForFilter,
    search: window.searchTermForFilter
  });
}

// הוספת הפונקציות החדשות לגלובל
window.filterDataByFilters = filterDataByFilters;
window.debugSavedFilters = debugSavedFilters;
