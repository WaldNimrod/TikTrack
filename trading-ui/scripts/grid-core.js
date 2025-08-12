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
