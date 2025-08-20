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

  // FILTERING ENABLED - processing filters
  console.log('🔄 FILTERING ENABLED - processing filters');

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

  // פילטר לפי סוג (מותאם לדף הערות)
  if (selectedTypes && selectedTypes.length > 0 && !selectedTypes.includes('all')) {
    console.log('🔄 Filtering by type:', selectedTypes);
    filteredData = filteredData.filter(item => {
      let typeMatch = false;

      if (pageName === 'notes') {
        // בדף הערות - פילטר לפי סוג האובייקט המקושר
        if (item.related_type === 'account' && selectedTypes.includes('חשבון')) {
          typeMatch = true;
        } else if (item.related_type === 'trade' && selectedTypes.includes('טרייד')) {
          typeMatch = true;
        } else if (item.related_type === 'trade_plan' && selectedTypes.includes('תכנון')) {
          typeMatch = true;
        } else if (item.related_type === 'ticker' && selectedTypes.includes('טיקר')) {
          typeMatch = true;
        }
      } else if (pageName === 'planning') {
        // מיפוי סוגים לדף התכנון
        let typeDisplay;
        switch (item.type || item.investment_type) {
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
        typeMatch = selectedTypes.includes(typeDisplay);
      } else if (pageName === 'tracking') {
        // מיפוי סוגים לדף המעקב
        let typeDisplay;
        switch (item.type) {
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
        typeMatch = selectedTypes.includes(typeDisplay);
      } else {
        typeMatch = selectedTypes.includes(item.type);
      }

      console.log(`🔄 Item ${item.id}: related_type=${item.related_type}, selected=${selectedTypes}, match=${typeMatch}`);
      return typeMatch;
    });
    console.log('🔄 After type filter:', filteredData.length, 'items');
  } else if (tableType === 'accounts') {
    console.log('🔄 Skipping type filter for accounts - accounts do not have type field');
  }
  console.log('🔄 Filtering by type:', selectedTypes);
  filteredData = filteredData.filter(item => {
    let typeDisplay;

    if (pageName === 'planning') {
      // מיפוי סוגים לדף התכנון
      switch (item.type || item.investment_type) {
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
      switch (item.type) {
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

// פילטר לפי חשבון (מותאם לדף הערות)
if (selectedAccounts && selectedAccounts.length > 0 && !selectedAccounts.includes('all')) {
  console.log('🔄 Filtering by account:', selectedAccounts);
  filteredData = filteredData.filter(item => {
    let accountMatch = false;

    if (pageName === 'notes') {
      // בדף הערות - פילטר לפי חשבון מקושר
      if (item.related_type === 'account') {
        const accountName = window.accountsData?.find(acc => acc.id == item.related_id)?.name;
        accountMatch = selectedAccounts.includes(accountName || item.related_id);
      } else if (item.related_type === 'trade') {
        // אם הקשר הוא לטרייד, בדוק את החשבון של הטרייד
        const trade = window.tradesData?.find(t => t.id == item.related_id);
        if (trade && trade.account_id) {
          const accountName = window.accountsData?.find(acc => acc.id == trade.account_id)?.name;
          accountMatch = selectedAccounts.includes(accountName || trade.account_id);
        }
      }
    } else if (pageName === 'planning') {
      // בדף התכנון - לא חל פילטר חשבון
      accountMatch = true;
    } else if (pageName === 'tracking') {
      // בדף המעקב - לפי שם החשבון
      const accountName = item.account_name || item.account_id;
      accountMatch = selectedAccounts.includes(accountName);
    } else if (pageName === 'accounts') {
      // בדף החשבונות - לא חל פילטר חשבון
      accountMatch = true;
    }

    console.log(`🔄 Item ${item.id}: related_type=${item.related_type}, account=${item.account_name || item.related_id}, selected=${selectedAccounts}, match=${accountMatch}`);
    return accountMatch;
  });
  console.log('🔄 After account filter:', filteredData.length, 'items');


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

    // תרגום מונחי חיפוש דו-כיווני
    const searchTranslations = {
      // תרגום סטטוסים
      'פתוח': 'open',
      'סגור': 'closed',
      'בוטל': 'cancelled',
      'מבוטל': 'cancelled',
      'open': 'open',
      'closed': 'closed',
      'cancelled': 'cancelled',

      // תרגום סוגי השקעות
      'סווינג': 'swing',
      'השקעה': 'investment',
      'פאסיבי': 'passive',
      'swing': 'swing',
      'investment': 'investment',
      'passive': 'passive',

      // תרגום צדדים
      'לונג': 'long',
      'שורט': 'short',
      'long': 'long',
      'short': 'short',

      // תרגום מספרים
      'אפס': '0',
      'אחת': '1',
      'שתיים': '2',
      'שלוש': '3',
      'ארבע': '4',
      'חמש': '5',
      'שש': '6',
      'שבע': '7',
      'שמונה': '8',
      'תשע': '9',
      'עשר': '10'
    };

    // יצירת מערך מונחי חיפוש כולל התרגום
    const searchTerms = [searchLower];

    // הוספת תרגום מדויק
    if (searchTranslations[searchLower]) {
      searchTerms.push(searchTranslations[searchLower]);
    }

    // הוספת חיפוש חלקי - אם המשתמש מחפש חלק ממילה
    Object.keys(searchTranslations).forEach(hebrewTerm => {
      if (hebrewTerm.includes(searchLower) && !searchTerms.includes(searchTranslations[hebrewTerm])) {
        searchTerms.push(searchTranslations[hebrewTerm]);
      }
    });

    filteredData = filteredData.filter(item => {
      let searchFields = [];

      if (pageName === 'planning') {
        searchFields = [
          item.ticker?.symbol,
          item.ticker?.name,
          item.investment_type,
          item.status,
          item.side,
          item.planned_amount,
          item.entry_conditions,
          item.stop_price,
          item.target_price,
          item.reasons,
          item.account?.name
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
        field && searchTerms.some(term => field.toString().toLowerCase().includes(term))
      );

      console.log(`🔄 Item ${item.id}: searchFields=${searchFields}, searchTerms=${searchTerms}, originalSearch=${searchLower}, match=${isMatch}`);
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
    pageLoadFunction = window.loadDesignsData; // בדף התכנונים הפונקציה נקראת loadDesignsData
  } else if (pageName === 'designs') {
    pageLoadFunction = window.loadDesignsData;
  } else if (pageName === 'notes') {
    pageLoadFunction = window.loadNotesData;
  } else if (pageName === 'accounts') {
    pageLoadFunction = window.loadAccountsData;
  } else if (pageName === 'alerts') {
    pageLoadFunction = window.loadAlertsData;
  } else if (pageName === 'database') {
    pageLoadFunction = window.refreshAllTables;
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
    } else if (pageName === 'database') {
      defaultStatuses = ['פתוח', 'סגור', 'מבוטל'];
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
    pageLoadFunction = window.loadPlanningData;
  } else if (pageName === 'designs') {
    pageLoadFunction = window.loadDesignsData;
  } else if (pageName === 'notes') {
    pageLoadFunction = window.loadNotesData;
  } else if (pageName === 'accounts') {
    pageLoadFunction = window.loadAccountsData;
  } else if (pageName === 'alerts') {
    pageLoadFunction = window.loadAlertsData;
  } else if (pageName === 'database') {
    pageLoadFunction = window.refreshAllTables;
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
    pageLoadFunction = window.loadPlanningData;
  } else if (pageName === 'designs') {
    pageLoadFunction = window.loadDesignsData;
  } else if (pageName === 'notes') {
    pageLoadFunction = window.loadNotesData;
  } else if (pageName === 'accounts') {
    pageLoadFunction = window.loadAccountsData;
  } else if (pageName === 'alerts') {
    pageLoadFunction = window.loadAlertsData;
  } else if (pageName === 'database') {
    pageLoadFunction = window.refreshAllTables;
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
 * פונקציה לעדכון תפריט פילטר החשבונות
 */
function updateAccountFilterMenu(accounts) {
  console.log('🔄 === UPDATE ACCOUNT FILTER MENU ===');
  console.log('🔄 Accounts received:', accounts);

  // חיפוש התפריט בתוך האפ-הדר (Shadow DOM)
  const appHeader = document.querySelector('app-header');
  if (!appHeader || !appHeader.shadowRoot) {
    console.log('🔄 App header or shadow root not found, skipping account menu update');
    return;
  }

  const accountMenu = appHeader.shadowRoot.getElementById('accountFilterMenu');
  if (!accountMenu) {
    console.log('🔄 Account filter menu not found in app header shadow root');
    return;
  }

  // ניקוי התפריט הקיים
  accountMenu.innerHTML = '';

  // הוספת אופציית "כל החשבונות"
  const allAccountsItem = document.createElement('div');
  allAccountsItem.className = 'account-filter-item selected';
  allAccountsItem.setAttribute('data-account', 'all');
  allAccountsItem.innerHTML = `
    <span class="option-text">כל החשבונות</span>
    <span class="check-mark">✓</span>
  `;
  accountMenu.appendChild(allAccountsItem);

  // הוספת החשבונות מהשרת
  if (accounts && accounts.length > 0) {
    accounts.forEach(account => {
      const accountItem = document.createElement('div');
      accountItem.className = 'account-filter-item';
      accountItem.setAttribute('data-account', account.id || account.name);
      accountItem.innerHTML = `
        <span class="option-text">${account.name || account.account_name || 'Unknown'}</span>
        <span class="check-mark">✓</span>
      `;
      accountMenu.appendChild(accountItem);
    });
  }

  console.log(`🔄 Account filter menu updated with ${accounts ? accounts.length : 0} accounts`);
}

/**
 * ========================================
 * פונקציות פילטר חשבונות כלליות
 * ========================================
 */



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


// בדיקה שהפונקציות הוגדרו נכון
console.log('🔄 Grid filters loaded. Available functions:', {
  filterDataByFilters: typeof window.filterDataByFilters,
  updateGridFromComponentGlobal: typeof window.updateGridFromComponentGlobal,
  updateAccountFilterMenu: typeof window.updateAccountFilterMenu
});

// בדיקה מיידית של הפונקציות
if (typeof window.updateGridFromComponentGlobal === 'function') {
  console.log('✅ updateGridFromComponentGlobal is available');
} else {
  console.log('❌ updateGridFromComponentGlobal is NOT available');
}

if (typeof window.updateAccountFilterMenu === 'function') {
  console.log('✅ updateAccountFilterMenu is available');
} else {
  console.log('❌ updateAccountFilterMenu is NOT available');
}

// ניקוי הודעות קונסולה אחרי זמן קצר
setTimeout(() => {
  console.log('🧹 Clearing console messages to reduce clutter...');
  if (console.clear) {
    console.clear();
  }
}, 8000);
