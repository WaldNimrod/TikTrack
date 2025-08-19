/**
 * ========================================
 * פונקציות פילטור גלובליות - Grid Filters Global
 * ========================================
 * 
 * קובץ זה מכיל פונקציות משותפות לכל הדפים
 * פונקציות ייעודיות לכל דף נמצאות בקבצים נפרדים:
 * - designs.js - לדף התכנון
 * - trades.js - לדף המעקב
 * - notes.js - לדף ההערות
 * - accounts.js - לדף החשבונות
 * - alerts.js - לדף ההתראות
 * 
 * פונקציות עיקריות:
 * - filterDataByFilters() - פילטור נתונים לפי כל הפילטרים
 * - updateGridFromComponentGlobal() - עדכון גלובלי של הטבלה
 * - loadSavedFiltersForPage() - טעינת פילטרים שמורים
 * - resetAllFiltersForPage() - איפוס כל הפילטרים
 * - initializePageFilters() - אתחול פילטרים לדף
 * 
 * מחבר: Tik.track Development Team
 * תאריך עדכון אחרון: 2025
 * ========================================
 */

/**
 * פונקציה לפילטור נתונים לפי כל הפילטרים
 * פונקציה גלובלית שמשותפת לכל הדפים
 */
function filterDataByFilters(data, pageName) {
  console.log(`🔄 === FILTER DATA BY FILTERS (${pageName}) ===`);
  console.log('🔄 Original data length:', data.length);
  
  if (!data || data.length === 0) {
    console.log('🔄 No data to filter');
    return [];
  }
  
  let filteredData = [...data];
  
  // קבלת פילטרים שמורים
  const selectedStatuses = window.selectedStatusesForFilter || [];
  const selectedTypes = window.selectedTypesForFilter || [];
  const selectedAccounts = window.selectedAccountsForFilter || [];
  const selectedDateRange = window.selectedDateRangeForFilter || null;
  const searchTerm = window.searchTermForFilter || '';
  
  console.log('🔄 Filters to apply:', {
    selectedStatuses,
    selectedTypes,
    selectedAccounts,
    selectedDateRange,
    searchTerm
  });
  
  // פילטר לפי סטטוס (לא חל על הערות)
  if (pageName !== 'notes' && selectedStatuses && selectedStatuses.length > 0 && !selectedStatuses.includes('all')) {
    console.log('🔄 Filtering by status:', selectedStatuses);
    filteredData = filteredData.filter(item => {
      let itemStatus;
      
      if (pageName === 'planning') {
        // מיפוי סטטוסים לדף התכנון
        if (item.status === 'cancelled') {
          itemStatus = 'מבוטל';
        } else if (item.status === 'closed') {
          itemStatus = 'סגור';
        } else {
          itemStatus = 'פתוח';
        }
      } else if (pageName === 'tracking') {
        // מיפוי סטטוסים לדף המעקב
        if (item.status === 'closed') {
          itemStatus = 'סגור';
        } else if (item.status === 'cancelled') {
          itemStatus = 'מבוטל';
        } else {
          itemStatus = 'פתוח';
        }
      } else if (pageName === 'accounts') {
        // מיפוי סטטוסים לדף החשבונות
        if (item.status === 'closed') {
          itemStatus = 'סגור';
        } else if (item.status === 'cancelled') {
          itemStatus = 'מבוטל';
        } else {
          itemStatus = 'פתוח';
        }
      } else {
        itemStatus = item.status;
      }
      
      const isMatch = selectedStatuses.includes(itemStatus);
      console.log(`🔄 Item ${item.id}: status=${item.status}, mapped=${itemStatus}, selected=${selectedStatuses}, match=${isMatch}`);
      return isMatch;
    });
    console.log('🔄 After status filter:', filteredData.length, 'items');
  }
  
  // פילטר לפי סוג (לא חל על הערות)
  if (pageName !== 'notes' && selectedTypes && selectedTypes.length > 0 && !selectedTypes.includes('all')) {
    console.log('🔄 Filtering by type:', selectedTypes);
    filteredData = filteredData.filter(item => {
      let typeDisplay;
      
      if (pageName === 'planning') {
        // מיפוי סוגים לדף התכנון
        switch(item.type || item.investment_type) {
          case 'swing':
            typeDisplay = 'סווינג';
            break;
          case 'investment':
            typeDisplay = 'השקעה';
            break;
          case 'passive':
            typeDisplay = 'פאסיבי';
            break;
          default:
            typeDisplay = item.type || item.investment_type;
        }
      } else if (pageName === 'tracking') {
        // מיפוי סוגים לדף המעקב
        switch(item.type) {
          case 'swing':
            typeDisplay = 'סווינג';
            break;
          case 'investment':
            typeDisplay = 'השקעה';
            break;
          case 'passive':
            typeDisplay = 'פאסיבי';
            break;
          case 'buy':
            typeDisplay = 'קנייה';
            break;
          case 'sell':
            typeDisplay = 'מכירה';
            break;
          default:
            typeDisplay = item.type;
        }
      } else {
        typeDisplay = item.type;
      }
      
      const isMatch = selectedTypes.includes(typeDisplay);
      console.log(`🔄 Item ${item.id}: type=${item.type}, mapped=${typeDisplay}, selected=${selectedTypes}, match=${isMatch}`);
      return isMatch;
    });
    console.log('🔄 After type filter:', filteredData.length, 'items');
  }
  
  // פילטר לפי חשבון
  if (selectedAccounts && selectedAccounts.length > 0 && !selectedAccounts.includes('all')) {
    console.log('🔄 Filtering by account:', selectedAccounts);
    filteredData = filteredData.filter(item => {
      let accountMatch = false;
      
      if (pageName === 'notes') {
        // בדף הערות - רק אם הקשר הוא לחשבון
        if (item.related_type === 'account') {
          const accountName = window.accountsData?.find(acc => acc.id == item.related_id)?.name;
          accountMatch = selectedAccounts.includes(accountName || item.related_id);
        }
      } else {
        // בדפים אחרים - לפי שם החשבון או ID
        const accountName = item.account_name || item.account_id;
        accountMatch = selectedAccounts.includes(accountName);
      }
      
      console.log(`🔄 Item ${item.id}: account=${item.account_name || item.related_id}, selected=${selectedAccounts}, match=${accountMatch}`);
      return accountMatch;
    });
    console.log('🔄 After account filter:', filteredData.length, 'items');
  }
  
  // פילטר לפי תאריכים
  if (selectedDateRange && selectedDateRange !== 'הכול') {
    console.log('🔄 Filtering by date range:', selectedDateRange);
    filteredData = filteredData.filter(item => {
      let itemDate;
      
      if (pageName === 'planning') {
        itemDate = new Date(item.created_at);
      } else if (pageName === 'tracking') {
        itemDate = new Date(item.created_at);
      } else if (pageName === 'notes') {
        itemDate = new Date(item.created_at);
      } else {
        itemDate = new Date(item.created_at || item.date);
      }
      
      const { startDate, endDate } = getDateRange(selectedDateRange);
      const isInRange = itemDate >= startDate && itemDate <= endDate;
      
      console.log(`🔄 Item ${item.id}: date=${itemDate}, range=${startDate}-${endDate}, inRange=${isInRange}`);
      return isInRange;
    });
    console.log('🔄 After date filter:', filteredData.length, 'items');
  }
  
  // פילטר לפי חיפוש
  if (searchTerm && searchTerm.trim() !== '') {
    console.log('🔄 Filtering by search term:', searchTerm);
    const searchLower = searchTerm.toLowerCase();
    filteredData = filteredData.filter(item => {
      let searchFields = [];
      
      if (pageName === 'planning') {
        searchFields = [
          item.ticker,
          item.entry_conditions,
          item.reasons
        ];
      } else if (pageName === 'tracking') {
        searchFields = [
          item.account_name,
          item.ticker_symbol,
          item.notes
        ];
      } else if (pageName === 'notes') {
        searchFields = [
          item.content,
          item.related_type,
          item.related_id
        ];
      } else if (pageName === 'accounts') {
        searchFields = [
          item.name,
          item.currency,
          item.description
        ];
      }
      
      const isMatch = searchFields.some(field => 
        field && field.toString().toLowerCase().includes(searchLower)
      );
      
      console.log(`🔄 Item ${item.id}: searchFields=${searchFields}, searchTerm=${searchTerm}, match=${isMatch}`);
      return isMatch;
    });
    console.log('🔄 After search filter:', filteredData.length, 'items');
  }
  
  console.log(`🔄 Final filtered data: ${filteredData.length} items`);
  return filteredData;
}

/**
 * פונקציה לקבלת טווח תאריכים לפי בחירה
 */
function getDateRange(dateRange) {
  const now = new Date();
  let startDate, endDate;
  
  switch (dateRange) {
    case 'היום':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'אתמול':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
      break;
    case 'השבוע':
      const dayOfWeek = now.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToSubtract);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'החודש':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'השנה':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'שנה קודמת':
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
      break;
    default:
      startDate = new Date(0);
      endDate = new Date();
  }
  
  return { startDate, endDate };
}

/**
 * פונקציה לעדכון גלובלי של הטבלה
 */
function updateGridFromComponentGlobal(selectedStatuses, selectedTypes, selectedAccounts, selectedDateRange, searchTerm, pageName) {
  console.log(`🔄 === UPDATE GRID FROM COMPONENT GLOBAL (${pageName}) ===`);
  console.log('🔄 Parameters:', { selectedStatuses, selectedTypes, selectedAccounts, selectedDateRange, searchTerm, pageName });
  
  // שמירת הפילטרים במשתנים גלובליים
  window.selectedStatusesForFilter = selectedStatuses || [];
  window.selectedTypesForFilter = selectedTypes || [];
  window.selectedAccountsForFilter = selectedAccounts || [];
  window.selectedDateRangeForFilter = selectedDateRange || null;
  window.searchTermForFilter = searchTerm || '';
  
  // שמירה ב-localStorage
  try {
    localStorage.setItem(`${pageName}FilterStatuses`, JSON.stringify(selectedStatuses || []));
    localStorage.setItem(`${pageName}FilterTypes`, JSON.stringify(selectedTypes || []));
    localStorage.setItem(`${pageName}FilterAccounts`, JSON.stringify(selectedAccounts || []));
    localStorage.setItem(`${pageName}FilterDateRange`, selectedDateRange || 'הכול');
    
    if (searchTerm && searchTerm.trim() !== '') {
      localStorage.setItem(`${pageName}FilterSearch`, searchTerm);
    } else {
      localStorage.removeItem(`${pageName}FilterSearch`);
    }
    
    if (searchTerm && searchTerm.trim() !== '') {
      localStorage.setItem('globalFilterSearch', searchTerm);
    } else {
      localStorage.removeItem('globalFilterSearch');
    }
    
    console.log('🔄 Filters saved to localStorage');
  } catch (error) {
    console.error('❌ Error saving filters to localStorage:', error);
  }
  
  // קריאה לפונקציה הספציפית לדף
  let pageLoadFunction;
  if (pageName === 'tracking') {
    pageLoadFunction = window.loadTradesData;
  } else if (pageName === 'planning') {
    pageLoadFunction = window.loadDesignsData;
  } else if (pageName === 'notes') {
    pageLoadFunction = window.loadNotesData;
  } else if (pageName === 'accounts') {
    pageLoadFunction = window.loadAccountsData;
  } else if (pageName === 'alerts') {
    pageLoadFunction = window.loadAlertsData;
  } else {
    pageLoadFunction = window[`load${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Data`];
  }
  
  if (pageLoadFunction && typeof pageLoadFunction === 'function') {
    console.log(`🔄 Calling page-specific load function: ${pageLoadFunction.name}`);
    pageLoadFunction();
  } else {
    console.log(`🔍 Page-specific load function not found for ${pageName}`);
  }
}

/**
 * פונקציה לטעינת פילטרים שמורים לדף
 */
function loadSavedFiltersForPage(pageName) {
  console.log(`🔄 === LOAD SAVED FILTERS FOR PAGE (${pageName}) ===`);
  
  try {
    // טעינת פילטרים מ-localStorage
    const savedStatuses = JSON.parse(localStorage.getItem(`${pageName}FilterStatuses`) || '[]');
    const savedTypes = JSON.parse(localStorage.getItem(`${pageName}FilterTypes`) || '[]');
    const savedAccounts = JSON.parse(localStorage.getItem(`${pageName}FilterAccounts`) || '[]');
    const savedDateRange = localStorage.getItem(`${pageName}FilterDateRange`) || 'הכול';
    const savedSearch = localStorage.getItem(`${pageName}FilterSearch`) || '';
    
    console.log('🔄 Saved filters:', { savedStatuses, savedTypes, savedAccounts, savedDateRange, savedSearch });
    
    // הגדרת ברירות מחדל לפי דף
    let defaultStatuses = ['פתוח'];
    if (pageName === 'accounts') {
      defaultStatuses = ['פתוח', 'סגור', 'מבוטל'];
    } else if (pageName === 'notes') {
      defaultStatuses = ['פתוח'];
    }
    
    // עדכון המשתנים הגלובליים
    window.selectedStatusesForFilter = savedStatuses.length > 0 ? savedStatuses : defaultStatuses;
    window.selectedTypesForFilter = savedTypes.length > 0 ? savedTypes : [];
    window.selectedAccountsForFilter = savedAccounts.length > 0 ? savedAccounts : [];
    window.selectedDateRangeForFilter = savedDateRange;
    window.searchTermForFilter = savedSearch;
    
    console.log('🔄 Updated global filter variables:', {
      selectedStatusesForFilter: window.selectedStatusesForFilter,
      selectedTypesForFilter: window.selectedTypesForFilter,
      selectedAccountsForFilter: window.selectedAccountsForFilter,
      selectedDateRangeForFilter: window.selectedDateRangeForFilter,
      searchTermForFilter: window.searchTermForFilter
    });
    
  } catch (error) {
    console.error('❌ Error loading saved filters:', error);
  }
}

/**
 * פונקציה לאיפוס כל הפילטרים לדף
 */
function resetAllFiltersForPage(pageName) {
  console.log(`🔄 === RESET ALL FILTERS FOR PAGE (${pageName}) ===`);
  
  // איפוס המשתנים הגלובליים
  if (pageName === 'accounts') {
    window.selectedStatusesForFilter = ['פתוח', 'סגור', 'מבוטל'];
  } else {
    window.selectedStatusesForFilter = ['פתוח'];
  }
  window.selectedTypesForFilter = [];
  window.selectedAccountsForFilter = [];
  window.selectedDateRangeForFilter = 'הכול';
  window.searchTermForFilter = '';
  
  // מחיקה מ-localStorage
  try {
    localStorage.removeItem(`${pageName}FilterStatuses`);
    localStorage.removeItem(`${pageName}FilterTypes`);
    localStorage.removeItem(`${pageName}FilterAccounts`);
    localStorage.removeItem(`${pageName}FilterDateRange`);
    localStorage.removeItem(`${pageName}FilterSearch`);
    localStorage.removeItem('globalFilterSearch');
    
    console.log('🔄 Filters removed from localStorage');
  } catch (error) {
    console.error('❌ Error removing filters from localStorage:', error);
  }
  
  // קריאה לפונקציה הספציפית לדף
  let pageLoadFunction;
  if (pageName === 'tracking') {
    pageLoadFunction = window.loadTradesData;
  } else if (pageName === 'planning') {
    pageLoadFunction = window.loadDesignsData;
  } else if (pageName === 'notes') {
    pageLoadFunction = window.loadNotesData;
  } else if (pageName === 'accounts') {
    pageLoadFunction = window.loadAccountsData;
  } else if (pageName === 'alerts') {
    pageLoadFunction = window.loadAlertsData;
  } else {
    pageLoadFunction = window[`load${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Data`];
  }
  
  if (pageLoadFunction && typeof pageLoadFunction === 'function') {
    console.log(`🔄 Calling page-specific load function: ${pageLoadFunction.name}`);
    pageLoadFunction();
  } else {
    console.log(`🔍 Page-specific load function not found for ${pageName}`);
  }
}

/**
 * פונקציה לאתחול פילטרים לדף
 */
function initializePageFilters(pageName) {
  console.log(`🔄 === INITIALIZE PAGE FILTERS (${pageName}) ===`);
  
  // טעינת פילטרים שמורים
  loadSavedFiltersForPage(pageName);
  
  // קריאה לפונקציה הספציפית לדף
  let pageLoadFunction;
  if (pageName === 'tracking') {
    pageLoadFunction = window.loadTradesData;
  } else if (pageName === 'planning') {
    pageLoadFunction = window.loadDesignsData;
  } else if (pageName === 'notes') {
    pageLoadFunction = window.loadNotesData;
  } else if (pageName === 'accounts') {
    pageLoadFunction = window.loadAccountsData;
  } else if (pageName === 'alerts') {
    pageLoadFunction = window.loadAlertsData;
  } else {
    pageLoadFunction = window[`load${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Data`];
  }
  
  if (pageLoadFunction && typeof pageLoadFunction === 'function') {
    console.log(`🔄 Calling page-specific load function: ${pageLoadFunction.name}`);
    pageLoadFunction();
  } else {
    console.log(`🔍 Page-specific load function not found for ${pageName}`);
  }
}

/**
 * פונקציה להצגת הודעות
 */
function showNotification(message, type = 'info') {
  console.log(`${type.toUpperCase()}: ${message}`);
  
  // יצירת אלמנט הודעה
  const notification = document.createElement('div');
  notification.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} alert-dismissible fade show`;
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.zIndex = '9999';
  notification.style.minWidth = '300px';
  
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(notification);
  
  // הסרה אוטומטית אחרי 5 שניות
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

/**
 * פונקציה לעדכון סטטיסטיקות הטבלה
 */
function updateTableStats(pageName) {
  console.log(`🔄 === UPDATE TABLE STATS (${pageName}) ===`);
  
  // פונקציה זו יכולה להיות מורחבת בעתיד לסטטיסטיקות מורכבות יותר
  // כרגע היא רק לוג לצורך מעקב
}

// הוספת הפונקציות לגלובל
window.filterDataByFilters = filterDataByFilters;
window.updateGridFromComponentGlobal = updateGridFromComponentGlobal;
window.loadSavedFiltersForPage = loadSavedFiltersForPage;
window.resetAllFiltersForPage = resetAllFiltersForPage;
window.initializePageFilters = initializePageFilters;
window.showNotification = showNotification;
window.updateTableStats = updateTableStats;
