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
 * פונקציה לקבלת סוג הטבלה לפי מזהה הדף
 * @param {string} pageName - שם הדף
 * @returns {string} - סוג הטבלה
 */
function getTableType(pageName) {
  // מיפוי דפים לסוגי טבלאות
  const tableTypeMap = {
    'designs': 'designs',
    'planning': 'designs',
    'tracking': 'trades',
    'trades': 'trades',
    'accounts': 'accounts',
    'notes': 'notes',
    'alerts': 'alerts'
  };
  
  return tableTypeMap[pageName] || pageName;
}

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
  
  // קבלת סוג הטבלה
  const tableType = getTableType(pageName);
  
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
  if (tableType !== 'notes' && selectedStatuses && selectedStatuses.length > 0 && !selectedStatuses.includes('all')) {
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
  
  // פילטר לפי סוג (לא חל על הערות וחשבונות)
  if (tableType !== 'notes' && tableType !== 'accounts' && selectedTypes && selectedTypes.length > 0 && !selectedTypes.includes('all')) {
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
  } else if (tableType === 'accounts') {
    console.log('🔄 Skipping type filter for accounts - accounts do not have type field');
  }
  
  // פילטר לפי חשבון (לא חל על תכנונים וחשבונות)
  if (tableType !== 'designs' && tableType !== 'accounts' && selectedAccounts && selectedAccounts.length > 0 && !selectedAccounts.includes('all')) {
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
  } else if (tableType === 'designs') {
    console.log('🔄 Skipping account filter for designs table - plans are not linked to accounts');
  } else if (tableType === 'accounts') {
    console.log('🔄 Skipping account filter for accounts table - showing all accounts regardless of filter');
  }
  
  // פילטר לפי תאריכים (לא חל על חשבונות)
  if (tableType !== 'accounts' && selectedDateRange && selectedDateRange !== 'כל זמן') {
    console.log('🔄 Filtering by date range:', selectedDateRange);
    filteredData = filteredData.filter(item => {
      let itemDate;
      
      if (pageName === 'planning' || pageName === 'designs') {
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
  } else if (tableType === 'accounts') {
    console.log('🔄 Skipping date filter for accounts - showing all accounts regardless of date range');
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
          item.notes
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
  
  // עדכון חלון בדיקת פילטר תאריכים אם קיים
  if (typeof window.updateDateDebugInfo === 'function') {
    setTimeout(() => window.updateDateDebugInfo(), 100);
  }
  
  // עדכון נוסף אחרי זמן קצר יותר
  if (typeof window.updateDateDebugInfo === 'function') {
    setTimeout(() => window.updateDateDebugInfo(), 500);
  }
  
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
      // השבוע - מיום ראשון האחרון ועד היום כולל
      const dayOfWeek = now.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek; // 0 = ראשון, 1 = שני, וכו'
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToSubtract);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'שבוע':
      // שבוע - מלפני 7 ימים ועד היום
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'החודש':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'MTD':
      // MTD - מתחילת החודש הקלנדרי ועד היום
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case '30 יום':
      // 30 יום - מלפני 30 יום ועד היום
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case '60 יום':
      // 60 יום - מלפני 60 יום ועד היום
      startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case '90 יום':
      // 90 יום - מלפני 90 יום ועד היום
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'שנה':
    case 'השנה':
      // שנה - מלפני 365 ימים ועד היום
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'YTD':
      // YTD - מתחילת השנה הקלנדרית ועד היום
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'שנה קודמת':
      // שנה קודמת - מתחילת השנה הקלנדרית הקודמת ועד סופה
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
  
  // שמירה ב-localStorage (גלובלי לכל הדפים)
  try {
    localStorage.setItem('globalFilterStatuses', JSON.stringify(selectedStatuses || []));
    localStorage.setItem('globalFilterTypes', JSON.stringify(selectedTypes || []));
    localStorage.setItem('globalFilterAccounts', JSON.stringify(selectedAccounts || []));
    localStorage.setItem('globalFilterDateRange', selectedDateRange || 'כל זמן');
    
    if (searchTerm && searchTerm.trim() !== '') {
      localStorage.setItem('globalFilterSearch', searchTerm);
    } else {
      localStorage.removeItem('globalFilterSearch');
    }
    
    console.log('🔄 Global filters saved to localStorage');
  } catch (error) {
    console.error('❌ Error saving global filters to localStorage:', error);
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
    // טעינת פילטרים גלובליים מ-localStorage
    const savedStatuses = JSON.parse(localStorage.getItem('globalFilterStatuses') || '[]');
    const savedTypes = JSON.parse(localStorage.getItem('globalFilterTypes') || '[]');
    const savedAccounts = JSON.parse(localStorage.getItem('globalFilterAccounts') || '[]');
    const savedDateRange = localStorage.getItem('globalFilterDateRange') || 'כל זמן';
    const savedSearch = localStorage.getItem('globalFilterSearch') || '';
    
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
 * פונקציה לאיפוס כל הפילטרים הגלובליים
 */
function resetAllFiltersForPage(pageName) {
  console.log(`🔄 === RESET ALL GLOBAL FILTERS ===`);
  
  // איפוס המשתנים הגלובליים
  window.selectedStatusesForFilter = [];
  window.selectedTypesForFilter = [];
  window.selectedAccountsForFilter = [];
  window.selectedDateRangeForFilter = 'כל זמן';
  window.searchTermForFilter = '';
  
  // מחיקה מ-localStorage (גלובלי)
  try {
  localStorage.removeItem('globalFilterStatuses');
  localStorage.removeItem('globalFilterTypes');
  localStorage.removeItem('globalFilterAccounts');
    localStorage.removeItem('globalFilterDateRange');
  localStorage.removeItem('globalFilterSearch');
  
    console.log('🔄 Global filters removed from localStorage');
  } catch (error) {
    console.error('❌ Error removing global filters from localStorage:', error);
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

/**
 * ========================================
 * פונקציות פילטר חשבונות כלליות
 * ========================================
 */

/**
 * פונקציה לעדכון תפריט הפילטר של החשבונות
 * פונקציה כללית שמשותפת לכל הדפים
 */
function updateAccountFilterMenu(accounts) {
  console.log('🔄 updateAccountFilterMenu called with:', accounts);
  
  const appHeader = document.querySelector('app-header');
  if (!appHeader) {
    console.log('🔄 App header not found');
    return;
  }
  
  const accountMenu = appHeader.shadowRoot.getElementById('accountFilterMenu');
  if (!accountMenu) {
    console.log('🔄 Account menu not found');
    return;
  }
  
  console.log('🔄 Account menu found, clearing existing content');
  accountMenu.innerHTML = '';
  
  console.log('🔄 Adding account items...');
  accounts.forEach((account, index) => {
    const accountItem = document.createElement('div');
    accountItem.className = 'account-filter-item';
    accountItem.setAttribute('data-account', account.name); // הוספת data-account attribute
    accountItem.innerHTML = `
      <span class="option-text">${account.name}</span>
      <span class="check-mark">✓</span>
    `;
    accountMenu.appendChild(accountItem);
    console.log(`🔄 Added account item ${index + 1}: ${account.name}`);
  });
  
  console.log('🔄 Total account items added:', accounts.length);
  
  // הוספת event listeners לפריטי החשבונות
  const accountItems = accountMenu.querySelectorAll('.account-filter-item');
  accountItems.forEach((item, index) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const accountName = item.getAttribute('data-account'); // שימוש ב-data-account
      console.log('🔄 Account filter item clicked:', accountName);
      
      // קריאה לפונקציה של הקומפוננט
      const appHeader = document.querySelector('app-header');
      if (appHeader && typeof appHeader.selectAccountOption === 'function') {
        appHeader.selectAccountOption(accountName);
      }
    });
  });
  console.log('🔄 Event listeners added to account items');
  
  updateAccountFilterText(accounts.map(a => a.name));
  console.log('🔄 Account filter menu updated successfully');
}

/**
 * פונקציה לעדכון טקסט הפילטר של החשבונות
 * פונקציה כללית שמשותפת לכל הדפים
 */
function updateAccountFilterText(selectedAccounts) {
  console.log('🔄 updateAccountFilterText called');
  console.log('🔄 Selected account values for text update:', selectedAccounts);
  
  const appHeader = document.querySelector('app-header');
  if (!appHeader) return;
  
  const accountToggle = appHeader.shadowRoot.querySelector('.account-filter-toggle .selected-account-text');
  if (!accountToggle) return;
  
  let displayText = 'כל החשבונות';
  if (selectedAccounts.length === 0) {
    displayText = 'לא נבחרו חשבונות';
  } else if (selectedAccounts.length === 1) {
    displayText = selectedAccounts[0];
  } else if (selectedAccounts.length === window.accountsData?.length || selectedAccounts.length === window.allAccountsData?.length) {
    displayText = 'כל החשבונות';
  } else if (selectedAccounts.length < 4) {
    displayText = `${selectedAccounts.length} חשבונות`;
  } else {
    displayText = `${selectedAccounts.length} חשבונות`;
  }
  
  accountToggle.textContent = displayText;
  console.log('🔄 Updated account filter text to:', displayText);
}

// הוספת הפונקציות לגלובל
window.filterDataByFilters = filterDataByFilters;
window.getTableType = getTableType;
window.getDateRange = getDateRange;
window.updateGridFromComponentGlobal = updateGridFromComponentGlobal;
window.loadSavedFiltersForPage = loadSavedFiltersForPage;
window.resetAllFiltersForPage = resetAllFiltersForPage;
window.initializePageFilters = initializePageFilters;
window.showNotification = showNotification;
window.updateTableStats = updateTableStats;
window.updateAccountFilterMenu = updateAccountFilterMenu;
window.updateAccountFilterText = updateAccountFilterText;
