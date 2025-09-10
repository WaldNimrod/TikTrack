/**
 * ========================================
 * מערכת פילטרים חכמה גלובלית
 * ========================================
 *
 * מערכת פילטרים מאוחדת שמתאימה את עצמה לכל טבלה
 * 🚀 תומך במערכת העדפות V2 החדשה!
 *
 * Dependencies:
 * - table-mappings.js (for column mappings)
 * - main.js (global utilities)
 * - translation-utils.js (translation functions)
 * - preferences-v2-compatibility.js (V2 support)
 *
 * Table Mapping:
 * - Uses table types from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 *
 * תכונות:
 * - פילטר אחד עובד על כל הטבלאות
 * - שמירת מצב בין עמודים
 * - התאמה אוטומטית לכל טבלה
 * - תרגום תאריכים חכם
 *
 * File: trading-ui/scripts/filter-system.js
 * Version: 2.2
 * Last Updated: August 23, 2025
 *
 * מחבר: TikTrack Development Team
 * תאריך: 2025
 * ========================================
 */

class FilterSystem {
  constructor() {
    this.tables = new Map(); // מפה של טבלאות לפי מזהה
    this.filters = new Map(); // מפה של פילטרים לפי שם
    this.currentFilters = {
      search: '',
      dateRange: 'כל זמן',
      status: [],
      type: [],
      account: [],
    };

    this.initialized = false;
  }

  initialize() {
    if (this.initialized) {return;}

    // המתן לטעינת DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    this.loadSavedFilters();
    this.setupGlobalEventListeners();
    this.initialized = true;
  }

  // רישום טבלה חדשה במערכת
  registerTable(tableId, config) {
    const table = {
      id: tableId,
      element: document.getElementById(tableId),
      data: [],
      filteredData: [],
      fields: config.fields || [],
      renderFunction: config.renderFunction,
      ...config,
    };

    this.tables.set(tableId, table);
    // טעינת נתונים מהטבלה
    this.loadTableData(tableId);

    // הפעלת פילטרים נוכחיים על הטבלה החדשה
    this.applyFiltersToTable(tableId);
  }

  // טעינת נתונים מטבלה HTML
  loadTableData(tableId) {
    const table = this.tables.get(tableId);
    if (!table || !table.element) {return;}

    const rows = table.element.querySelectorAll('tbody tr');
    const data = [];

    rows.forEach((row, _rowIndex) => {
      const cells = row.querySelectorAll('td');
      const rowData = {};

      table.fields.forEach((field, index) => {
        if (cells[index]) {
          const value = cells[index].textContent.trim();
          rowData[field] = value;
        }
      });

      data.push(rowData);
    });

    table.data = data;
    table.filteredData = [...data];
  }

  // רישום פילטר חדש
  registerFilter(filterName, filterConfig) {
    this.filters.set(filterName, filterConfig);
  }

  // עדכון פילטר
  updateFilter(filterName, value) {
    this.currentFilters[filterName] = value;
    this.saveFilters();
    this.applyAllFilters();
  }

  // הפעלת כל הפילטרים על כל הטבלאות
  applyAllFilters() {
    this.tables.forEach((table, tableId) => {
      this.applyFiltersToTable(tableId);
    });
  }

  // הפעלת פילטרים על טבלה ספציפית
  applyFiltersToTable(tableId) {
    const table = this.tables.get(tableId);
    if (!table) {return;}

    let filteredData = [...table.data];
    // פילטר חיפוש (סטטי)
    if (this.currentFilters.search && table.fields.some(field =>
      ['name', 'description', 'title', 'symbol', 'account_name'].includes(field))) {
      filteredData = this.applySearchFilter(filteredData, this.currentFilters.search);
    }

    // פילטר תאריכים (סטטי)
    if (this.currentFilters.dateRange && this.currentFilters.dateRange !== 'כל זמן' &&
      table.fields.includes('date')) {
      const dateRange = this.getDateRangeFromText(this.currentFilters.dateRange);
      filteredData = this.applyDateFilter(filteredData, dateRange);
    }

    // פילטר סטטוס (דינמי)
    if (this.currentFilters.status.length > 0 && table.fields.includes('status')) {
      filteredData = FilterSystem.applyStatusFilter(filteredData, this.currentFilters.status);
    }

    // פילטר סוג (דינמי)
    if (this.currentFilters.type.length > 0 && table.fields.includes('type')) {
      filteredData = FilterSystem.applyTypeFilter(filteredData, this.currentFilters.type);
    }

    // פילטר חשבון (דינמי)
    if (this.currentFilters.account.length > 0 && table.fields.includes('account_id')) {
      filteredData = FilterSystem.applyAccountFilter(filteredData, this.currentFilters.account);
    }

    table.filteredData = filteredData;

    // עדכון הטבלה ה-HTML
    this.updateTableDisplay(tableId, filteredData);
  }

  // עדכון תצוגת הטבלה
  updateTableDisplay(tableId, filteredData) {
    const table = this.tables.get(tableId);
    if (!table || !table.element) {return;}

    const tbody = table.element.querySelector('tbody');
    if (!tbody) {return;}

    // הסתרת כל השורות
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
      row.style.display = 'none';
    });

    // הצגת רק השורות המסוננות
    filteredData.forEach((rowData, index) => {
      if (rows[index]) {
        rows[index].style.display = '';
      }
    });

  }

  // פילטר חיפוש
  static applySearchFilter(data, searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {return data;}

    const searchLower = searchTerm.toLowerCase().trim();

    return data.filter(item => {
      // חיפוש בשדות ספציפיים
      const searchableFields = [
        item.symbol || '',
        item.type || '',
        item.status || '',
        item.account_name || '',
        item.notes || '',
      ];

      return searchableFields.some(field =>
        field.toString().toLowerCase().includes(searchLower),
      );
    });
  }

  // פילטר תאריכים
  static applyDateFilter(data, dateRange) {
    if (!dateRange || !dateRange.start || !dateRange.end) {return data;}

    return data.filter(item => {
      if (!item.date) {return false;}
      const itemDate = new Date(item.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  // פונקציה לתרגום סטטוס מעברית לאנגלית
  static translateStatusToEnglish(hebrewStatus) {
    const statusMap = {
      'פתוח': 'open',
      'סגור': 'closed',
      'מבוטל': 'cancelled',
    };
    return statusMap[hebrewStatus] || hebrewStatus;
  }

  // פונקציה לתרגום סטטוס מאנגלית לעברית
  static translateStatusToHebrew(englishStatus) {
    const statusMap = {
      'open': 'פתוח',
      'closed': 'סגור',
      'cancelled': 'מבוטל',
    };
    return statusMap[englishStatus] || englishStatus;
  }

  // פילטר סטטוס
  applyStatusFilter(data, selectedStatuses) {
    if (selectedStatuses.length === 0) {return data;}

    // תרגום הסטטוסים הנבחרים לאנגלית
    const translatedStatuses = selectedStatuses.map(status => this.translateStatusToEnglish(status));
    return data.filter(item => {
      const itemStatus = item.status;
      // בדיקה - אם הסטטוס של הפריט נמצא ברשימת הסטטוסים המתורגמים
      const isMatch = translatedStatuses.includes(itemStatus);
      return isMatch;
    });
  }

  // פילטר סוג
  static applyTypeFilter(data, selectedTypes) {
    if (selectedTypes.length === 0) {return data;}

    return data.filter(item => selectedTypes.includes(item.type));
  }

  static applyStatusFilter(data, selectedStatuses) {
    if (selectedStatuses.length === 0) {return data;}

    return data.filter(item => selectedStatuses.includes(item.status));
  }

  // פילטר חשבון
  static applyAccountFilter(data, selectedAccounts) {
    if (selectedAccounts.length === 0) {return data;}

    return data.filter(item => selectedAccounts.includes(item.account_id));
  }

  // תרגום טקסט תאריכים לטווח תאריכים
  static getDateRangeFromText(dateRangeText) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    let startDate, endDate;

    switch (dateRangeText) {
    case 'היום':
      startDate = todayStr;
      endDate = todayStr;
      break;

    case 'אתמול': {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      startDate = yesterday.toISOString().split('T')[0];
      endDate = startDate;
      break;
    }

    case 'השבוע': {
      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay();
      startOfWeek.setDate(today.getDate() - dayOfWeek);
      startDate = startOfWeek.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'שבוע אחרון': {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      startDate = weekAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'חודש אחרון': {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      startDate = monthAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case '3 חודשים': {
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      startDate = threeMonthsAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'MTD': {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'YTD': {
      startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case '30 יום': {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      startDate = thirtyDaysAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case '60 יום': {
      const sixtyDaysAgo = new Date(today);
      sixtyDaysAgo.setDate(today.getDate() - 60);
      startDate = sixtyDaysAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case '90 יום': {
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(today.getDate() - 90);
      startDate = ninetyDaysAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'שנה': {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(today.getFullYear() - 1);
      startDate = yearAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'שנה קודמת': {
      startDate = new Date(today.getFullYear() - 1, 0, 1).toISOString().split('T')[0];
      endDate = new Date(today.getFullYear() - 1, 11, 31).toISOString().split('T')[0];
      break;
    }

    default:
      return null;
    }

    return { start: startDate, end: endDate };
  }

  // שמירת פילטרים
  saveFilters() {
    localStorage.setItem('globalFilters', JSON.stringify(this.currentFilters));
  }

  // טעינת פילטרים שמורים
  loadSavedFilters() {
    const saved = localStorage.getItem('globalFilters');
    if (saved) {
      this.currentFilters = { ...this.currentFilters, ...JSON.parse(saved) };
    }
  }

  // איפוס פילטרים
  resetFilters() {
    this.currentFilters = {
      search: '',
      dateRange: 'כל זמן',
      status: [],
      type: [],
      account: [],
    };
    this.saveFilters();
    this.applyAllFilters();
  }

  // הגדרת event listeners גלובליים
  setupGlobalEventListeners() {
    // Event listener לפילטר חיפוש
    document.addEventListener('input', e => {
      if (e.target.id === 'searchFilterInput') {
        this.currentFilters.search = e.target.value;
        this.saveFilters();
        this.applyFilters(); // קריאה לפונקציה החדשה
      }
    });

    // Event listener לפילטר תאריכים
    document.addEventListener('click', e => {
      if (e.target.closest('.date-range-filter-item')) {
        const text = e.target.closest('.date-range-filter-item').querySelector('.option-text').textContent;
        this.updateFilter('dateRange', text);
      }
    });

    // Event listener לפילטר סטטוס
    document.addEventListener('click', e => {
      if (e.target.closest('.status-filter-item')) {
        const text = e.target.closest('.status-filter-item').querySelector('.option-text').textContent;
        const currentStatuses = [...this.currentFilters.status];
        const index = currentStatuses.indexOf(text);

        if (index > -1) {
          currentStatuses.splice(index, 1);
        } else {
          currentStatuses.push(text);
        }

        this.updateFilter('status', currentStatuses);
      }
    });

    // Event listener לפילטר סוג
    document.addEventListener('click', e => {
      if (e.target.closest('.type-filter-item')) {
        const text = e.target.closest('.type-filter-item').querySelector('.option-text').textContent;
        const currentTypes = [...this.currentFilters.type];
        const index = currentTypes.indexOf(text);

        if (index > -1) {
          currentTypes.splice(index, 1);
        } else {
          currentTypes.push(text);
        }

        this.updateFilter('type', currentTypes);
      }
    });

    // Event listener לפילטר חשבון
    document.addEventListener('click', e => {
      if (e.target.closest('.account-filter-item')) {
        const accountId = e.target.closest('.account-filter-item').getAttribute('data-account-id');
        const currentAccounts = [...this.currentFilters.account];
        const index = currentAccounts.indexOf(accountId);

        if (index > -1) {
          currentAccounts.splice(index, 1);
        } else {
          currentAccounts.push(accountId);
        }

        this.updateFilter('account', currentAccounts);
      }
    });
  }

  // קבלת מצב פילטרים נוכחי
  getCurrentFilters() {
    return { ...this.currentFilters };
  }

  // בדיקה אם פילטר רלוונטי לטבלה
  isFilterRelevant(filterName, tableId) {
    const table = this.tables.get(tableId);
    if (!table) {return false;}

    switch (filterName) {
    case 'search':
      return table.fields.some(field =>
        ['name', 'description', 'title', 'symbol', 'account_name'].includes(field));
    case 'dateRange':
      return table.fields.includes('date');
    case 'status':
      return table.fields.includes('status');
    case 'type':
      return table.fields.includes('type');
    case 'account':
      return table.fields.includes('account_id');
    default:
      return false;
    }
  }
  // החזרת טבלאות רשומות
  getRegisteredTables() {
    return Object.fromEntries(this.tables);
  }

  // הפונקציה הראשית להפעלת פילטרים - נקראת מ-header-system.js
  applyFilters() {
    // בדיקה אם אנחנו בעמוד טיקרים
    const isTickersPage = window.location.pathname.includes('tickers') ||
                         document.querySelector('table[data-table-type="tickers"]') ||
                         document.getElementById('tickersContainer');

    if (isTickersPage && window.tickersData && typeof window.updateTickersTable === 'function') {
      // פילטור נתוני הטיקרים
      let filteredTickers = [...window.tickersData];

      // פילטר חיפוש
      if (this.currentFilters.search) {
        filteredTickers = this.filterTickersBySearch(filteredTickers, this.currentFilters.search);
      }

      // פילטר סטטוס
      if (this.currentFilters.status.length > 0) {
        filteredTickers = this.filterTickersByStatus(filteredTickers, this.currentFilters.status);
      }

      // פילטר סוג (מתאים לסוגי טיקרים)
      if (this.currentFilters.type.length > 0) {
        filteredTickers = this.filterTickersByType(filteredTickers, this.currentFilters.type);
      }

      // עדכון הטבלה עם הנתונים המפולטרים
      window.updateTickersTable(filteredTickers);
      
      console.log(`🔍 פילטר הטיקרים הופעל: ${filteredTickers.length}/${window.tickersData.length} טיקרים`);
    } else {
      // עבור דפים אחרים - השתמש במערכת הקיימת
      this.applyAllFilters();
    }
  }

  // פילטור טיקרים לפי חיפוש
  filterTickersBySearch(tickers, searchTerm) {
    if (!searchTerm) return tickers;
    
    const searchLower = searchTerm.toLowerCase();
    return tickers.filter(ticker => {
      // תרגום סטטוס לעברית לחיפוש
      const statusMap = {
        'open': 'פתוח',
        'closed': 'סגור',
        'cancelled': 'מבוטל'
      };
      
      const searchableFields = [
        ticker.symbol || '',
        ticker.name || '',
        ticker.type || '',
        ticker.remarks || '',
        ticker.status || '',
        statusMap[ticker.status] || ''
      ];
      
      return searchableFields.some(field =>
        field.toString().toLowerCase().includes(searchLower)
      );
    });
  }

  // פילטור טיקרים לפי סטטוס
  filterTickersByStatus(tickers, selectedStatuses) {
    if (selectedStatuses.length === 0 || selectedStatuses.includes('הכול')) {
      return tickers;
    }

    // תרגום סטטוסים מעברית לאנגלית
    const statusMap = {
      'פתוח': 'open',
      'סגור': 'closed', 
      'מבוטל': 'cancelled'
    };

    const translatedStatuses = selectedStatuses.map(status => statusMap[status] || status);
    
    return tickers.filter(ticker => 
      translatedStatuses.includes(ticker.status)
    );
  }

  // פילטור טיקרים לפי סוג
  filterTickersByType(tickers, selectedTypes) {
    if (selectedTypes.length === 0 || selectedTypes.includes('הכול')) {
      return tickers;
    }

    // מיפוי סוגי טיקרים מעברית לאנגלית
    const typeMap = {
      'מניה': 'stock',
      'ETF': 'etf', 
      'אג"ח': 'bond',
      'קריפטו': 'crypto',
      'מטבע חוץ': 'forex',
      'סחורה': 'commodity',
      'אחר': 'other'
    };

    const allowedTypes = selectedTypes.map(hebrewType => typeMap[hebrewType] || hebrewType);

    return tickers.filter(ticker => 
      allowedTypes.includes(ticker.type)
    );
  }

  // פונקציה להפעלת פילטר חיפוש - נקראת מ-header-system.js
  applySearchFilter(searchTerm) {
    this.currentFilters.search = searchTerm || '';
    this.saveFilters();
    this.applyFilters();
  }

  // עדכון אפשרויות חשבונות
  static updateAccountOptions(_accounts) {
    // כאן נוכל להוסיף לוגיקה לעדכון רשימת החשבונות בפילטר
  }
}

// יצירת מופע גלובלי
window.filterSystem = new FilterSystem();

// אתחול אוטומטי כשהדף נטען
document.addEventListener('DOMContentLoaded', () => {
  // המתן קצת כדי שהאלמנטים יטענו
  setTimeout(() => {
    if (window.filterSystem && !window.filterSystem.initialized) {
      window.filterSystem.initialize();
    }
  }, 100);
});

// פונקציה לניקוי כל הפילטרים
FilterSystem.prototype.clearFilters = function() {
  console.log('🧹 Clearing all filters...');
  
  // איפוס הפילטרים הנוכחיים
  this.currentFilters = {
    status: [],
    type: [],
    account: [],
    dateRange: '',
    search: ''
  };
  
  // איפוס ממשק המשתמש
  this.resetFilterUI();
  
  // יישום הפילטרים (הצגת כל הנתונים)
  this.applyAllFilters();
  
  console.log('✅ All filters cleared');
};

// פונקציה לאיפוס ממשק המשתמש
FilterSystem.prototype.resetFilterUI = function() {
  // איפוס שדה החיפוש
  const searchInput = document.getElementById('searchFilterInput');
  if (searchInput) {
    searchInput.value = '';
  }
  
  // איפוס פילטר סטטוס
  const statusFilter = document.getElementById('selectedStatus');
  if (statusFilter) {
    statusFilter.textContent = 'כל הסטטוסים';
  }
  
  // איפוס פילטר סוג
  const typeFilter = document.getElementById('selectedType');
  if (typeFilter) {
    typeFilter.textContent = 'כל סוג השקעה';
  }
  
  // איפוס פילטר חשבון
  const accountFilter = document.getElementById('selectedAccount');
  if (accountFilter) {
    accountFilter.textContent = 'כל החשבונות';
  }
  
  // איפוס פילטר תאריכים
  const dateFilter = document.getElementById('selectedDateRange');
  if (dateFilter) {
    dateFilter.textContent = 'כל התאריכים';
  }
  
  // סגירת תפריטים פתוחים
  const openMenus = document.querySelectorAll('.filter-menu');
  openMenus.forEach(menu => {
    menu.style.display = 'none';
  });
  
  // הסרת מצב פעיל מכפתורים
  const activeButtons = document.querySelectorAll('.filter-toggle.active');
  activeButtons.forEach(btn => {
    btn.classList.remove('active');
  });
};

// פונקציה לאיפוס פילטרים לפי העדפות המשתמש
FilterSystem.prototype.resetToUserDefaults = async function() {
  console.log('🔄 Resetting filters to user defaults...');
  
  try {
    // טעינת חשבונות לפני איפוס הפילטר
    if (!window.accountsData || window.accountsData.length === 0) {
      console.log('🔄 Loading accounts before resetting filters...');
      if (typeof window.loadAccountsFromServer === 'function') {
        await window.loadAccountsFromServer();
      } else if (typeof window.loadAllAccountsFromServer === 'function') {
        await window.loadAllAccountsFromServer();
      }
    }
    
    // קבלת העדפות המשתמש
    const defaultStatusFilter = await this.getUserPreference('defaultStatusFilter') || 'all';
    const defaultTypeFilter = await this.getUserPreference('defaultTypeFilter') || 'all';
    const defaultAccountFilter = await this.getUserPreference('defaultAccountFilter') || 'all';
    const defaultDateRangeFilter = await this.getUserPreference('defaultDateRangeFilter') || 'all';
    const defaultSearchFilter = await this.getUserPreference('defaultSearchFilter') || '';
    
    // לוג לבדיקת הערכים הגולמיים
    console.log('🔍 Raw preference values before fallback:', {
      'defaultStatusFilter': await this.getUserPreference('defaultStatusFilter'),
      'defaultTypeFilter': await this.getUserPreference('defaultTypeFilter'),
      'defaultAccountFilter': await this.getUserPreference('defaultAccountFilter'),
      'defaultDateRangeFilter': await this.getUserPreference('defaultDateRangeFilter'),
      'defaultSearchFilter': await this.getUserPreference('defaultSearchFilter')
    });
    
    console.log('📋 User preferences loaded:', {
      status: defaultStatusFilter,
      type: defaultTypeFilter,
      account: defaultAccountFilter,
      dateRange: defaultDateRangeFilter,
      search: defaultSearchFilter
    });
    
    // לוג נוסף לבדיקת הערכים
    console.log('🔍 Raw preference values:', {
      'defaultStatusFilter': defaultStatusFilter,
      'defaultTypeFilter': defaultTypeFilter,
      'defaultAccountFilter': defaultAccountFilter,
      'defaultDateRangeFilter': defaultDateRangeFilter,
      'defaultSearchFilter': defaultSearchFilter
    });
    
    // המרת ערכים מאנגלית לעברית
    const statusTranslation = {
      'all': 'הכול',
      'open': 'פתוח',
      'closed': 'סגור',
      'canceled': 'מבוטל',
    };

    const typeTranslation = {
      'all': 'הכול',
      'swing': 'סווינג',
      'investment': 'השקעה',
      'passive': 'פסיבי'
    };

    const dateRangeTranslation = {
      'all': 'כל זמן',
      'today': 'היום',
      'yesterday': 'אתמול',
      'this_week': 'השבוע',
      'last_week': 'שבוע אחרון',
      'last_month': 'חודש אחרון',
      '3_months': '3 חודשים',
      'mtd': 'MTD',
      '30_days': '30 יום',
      '60_days': '60 יום',
      '90_days': '90 יום',
      'ytd': 'YTD',
      'year': 'שנה',
      'last_year': 'שנה קודמת',
    };

    // איפוס פילטר סטטוס
    const statusValue = statusTranslation[defaultStatusFilter] || 'הכול';
    this.setStatusFilter([statusValue]);
    
    // איפוס פילטר סוג
    const typeValue = typeTranslation[defaultTypeFilter] || 'הכול';
    this.setTypeFilter([typeValue]);
    
    // איפוס פילטר חשבון
    if (defaultAccountFilter !== 'all') {
      // המרת ID לשם חשבון
      const accountName = this.getAccountNameById(defaultAccountFilter);
      if (accountName) {
        console.log(`✅ Setting account filter to: ${accountName}`);
        this.setAccountFilter([accountName]);
      } else {
        console.log(`⚠️ Account not found, falling back to 'all'`);
        this.setAccountFilter([]);
      }
    } else {
      console.log(`✅ Setting account filter to 'all'`);
      this.setAccountFilter([]);
    }
    
    // איפוס פילטר תאריכים
    console.log(`🔍 Date range filter value: "${defaultDateRangeFilter}"`);
    console.log(`🔍 Available translations:`, dateRangeTranslation);
    const dateRangeValue = dateRangeTranslation[defaultDateRangeFilter] || 'כל התאריכים';
    console.log(`🔍 Translated date range: "${dateRangeValue}"`);
    this.setDateRangeFilter(dateRangeValue);
    
    // איפוס פילטר חיפוש
    this.setSearchFilter(defaultSearchFilter);
    
    // יישום הפילטרים
    this.applyAllFilters();
    
    console.log('✅ Filters reset to user defaults');
    
  } catch (error) {
    console.warn('⚠️ Failed to load user preferences, using fallback:', error);
    // Fallback - ניקוי כל הפילטרים
    this.clearFilters();
  }
};

// פונקציה לקבלת העדפת משתמש
FilterSystem.prototype.getUserPreference = async function(preferenceKey) {
  try {
    // ✨ עדכון לתמיכה במערכת V2!
    console.log(`🔍 FilterSystem.getUserPreference(${preferenceKey}) - checking V2 first...`);
    
    // עדיפות ראשונה - מערכת V2 אם זמינה
    if (typeof window.getCurrentPreference === 'function') {
      const value = await window.getCurrentPreference(preferenceKey);
      console.log(`✅ V2 preference ${preferenceKey}: ${value}`);
      return value;
    }
    
    // Fallback - localStorage
    const localValue = localStorage.getItem(`preference_${preferenceKey}`) || null;
    console.log(`🔄 Fallback localStorage preference ${preferenceKey}:`, localValue);
    return localValue;
  } catch (error) {
    console.warn(`⚠️ Failed to get preference ${preferenceKey}:`, error);
    return null;
  }
};

// פונקציה לקבלת שם חשבון לפי ID
FilterSystem.prototype.getAccountNameById = function(accountId) {
  try {
    console.log(`🔍 Looking for account ID: ${accountId}`);
    console.log(`🔍 window.accountsData:`, window.accountsData);
    console.log(`🔍 window.allAccountsData:`, window.allAccountsData);
    
    // נסיון למצוא בחשבונות שנטענו
    if (window.accountsData && Array.isArray(window.accountsData)) {
      const account = window.accountsData.find(a => a.id == accountId);
      if (account) {
        console.log(`✅ Found account in accountsData: ${account.name}`);
        return account.name;
      }
    }
    
    // נסיון למצוא בחשבונות הכלליים
    if (window.allAccountsData && Array.isArray(window.allAccountsData)) {
      const account = window.allAccountsData.find(a => a.id == accountId);
      if (account) {
        console.log(`✅ Found account in allAccountsData: ${account.name}`);
        return account.name;
      }
    }
    
    console.warn(`⚠️ Account with ID ${accountId} not found in loaded accounts`);
    return null;
  } catch (error) {
    console.warn(`⚠️ Error getting account name for ID ${accountId}:`, error);
    return null;
  }
};

// פונקציות עזר להגדרת פילטרים
FilterSystem.prototype.setStatusFilter = function(statuses) {
  this.currentFilters.status = statuses;
  this.updateStatusFilterUI(statuses);
};

FilterSystem.prototype.setTypeFilter = function(types) {
  this.currentFilters.type = types;
  this.updateTypeFilterUI(types);
};

FilterSystem.prototype.setAccountFilter = function(accounts) {
  this.currentFilters.account = accounts;
  this.updateAccountFilterUI(accounts);
};

FilterSystem.prototype.setDateRangeFilter = function(dateRange) {
  this.currentFilters.dateRange = dateRange;
  this.updateDateRangeFilterUI(dateRange);
};

FilterSystem.prototype.setSearchFilter = function(search) {
  this.currentFilters.search = search;
  this.updateSearchFilterUI(search);
};

// פונקציות עזר לעדכון ממשק המשתמש
FilterSystem.prototype.updateStatusFilterUI = function(statuses) {
  const statusFilter = document.getElementById('selectedStatus');
  if (statusFilter) {
    if (statuses.length === 0 || statuses.includes('הכול')) {
      statusFilter.textContent = 'כל הסטטוסים';
    } else {
      statusFilter.textContent = statuses.join(', ');
    }
  }
};

FilterSystem.prototype.updateTypeFilterUI = function(types) {
  const typeFilter = document.getElementById('selectedType');
  if (typeFilter) {
    if (types.length === 0 || types.includes('הכול')) {
      typeFilter.textContent = 'כל סוג השקעה';
    } else {
      typeFilter.textContent = types.join(', ');
    }
  }
};

FilterSystem.prototype.updateAccountFilterUI = function(accounts) {
  console.log(`🔍 updateAccountFilterUI called with:`, accounts);
  const accountFilter = document.getElementById('selectedAccount');
  console.log(`🔍 selectedAccount element:`, accountFilter);
  
  if (accountFilter) {
    if (accounts.length === 0 || accounts.includes('הכול')) {
      accountFilter.textContent = 'כל החשבונות';
      console.log(`✅ Set account filter to: כל החשבונות`);
    } else {
      accountFilter.textContent = accounts.join(', ');
      console.log(`✅ Set account filter to: ${accounts.join(', ')}`);
    }
  } else {
    console.warn(`⚠️ selectedAccount element not found`);
  }
};

FilterSystem.prototype.updateDateRangeFilterUI = function(dateRange) {
  const dateFilter = document.getElementById('selectedDateRange');
  if (dateFilter) {
    dateFilter.textContent = dateRange || 'כל התאריכים';
  }
};

FilterSystem.prototype.updateSearchFilterUI = function(search) {
  const searchInput = document.getElementById('searchFilterInput');
  if (searchInput) {
    searchInput.value = search || '';
  }
};

// ייצוא פונקציות חשובות לגלובל
window.updateFilter = function(filterName, value) {
  if (window.filterSystem) {
    window.filterSystem.updateFilter(filterName, value);
  }
};

window.clearAllFilters = function() {
  if (window.filterSystem) {
    window.filterSystem.clearFilters();
  }
};

window.resetToUserDefaults = function() {
  if (window.filterSystem) {
    return window.filterSystem.resetToUserDefaults();
  }
};

// ===== EVENT LISTENERS FOR FILTERS =====

// Event listeners for date range filter (single selection)
document.addEventListener('DOMContentLoaded', function() {
  const dateRangeItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
  
  // Initialize with "כל זמן" selected by default
  const defaultItem = Array.from(dateRangeItems).find(item => item.getAttribute('data-value') === 'כל זמן');
  if (defaultItem) {
    defaultItem.classList.add('selected');
  }
  dateRangeItems.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      
      const dateRange = item.getAttribute('data-value');
      console.log('🔧 Date range filter item clicked:', dateRange);

      // Single selection - remove selected from all others
      dateRangeItems.forEach(otherItem => {
        otherItem.classList.remove('selected');
        console.log('🔧 Removed selected from:', otherItem.getAttribute('data-value'));
      });
      item.classList.add('selected');
      console.log('🔧 Added selected to:', item.getAttribute('data-value'));

      // Update display text
      const dateRangeElement = document.getElementById('selectedDateRange');
      if (dateRangeElement) {
        let displayText = 'כל זמן';
        
        if (dateRange === 'היום') {
          const today = new Date();
          const todayStr = today.toLocaleDateString('he-IL');
          displayText = `${todayStr} - ${todayStr}`;
        } else if (dateRange === 'אתמול') {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toLocaleDateString('he-IL');
          displayText = `${yesterdayStr} - ${yesterdayStr}`;
        } else if (dateRange !== 'כל זמן') {
          displayText = dateRange;
        }
        
        dateRangeElement.textContent = displayText;
      }

      // Update filter system
      if (window.filterSystem && typeof window.filterSystem.applyFilters === 'function') {
        window.filterSystem.currentFilters.dateRange = dateRange;
        window.filterSystem.applyFilters();
      } else {
        console.warn('⚠️ FilterSystem not available or applyFilters not a function');
      }

      // Close the date range filter menu after selection
      const dateRangeMenu = document.getElementById('dateRangeFilterMenu');
      if (dateRangeMenu) {
        dateRangeMenu.classList.remove('show');
        console.log('🔧 Closed date range filter menu');
      } else {
        console.log('🔧 Date range filter menu not found');
      }
    });
  });
});

// Initialize all filters with default selections
document.addEventListener('DOMContentLoaded', function() {
  // Initialize status filter with "הכול" selected
  const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
  const statusDefaultItem = Array.from(statusItems).find(item => item.getAttribute('data-value') === 'הכול');
  if (statusDefaultItem) {
    statusDefaultItem.classList.add('selected');
  }

  // Initialize type filter with "הכול" selected
  const typeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item');
  const typeDefaultItem = Array.from(typeItems).find(item => item.getAttribute('data-value') === 'הכול');
  if (typeDefaultItem) {
    typeDefaultItem.classList.add('selected');
  }

  // Initialize account filter with "הכול" selected
  const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
  const accountDefaultItem = Array.from(accountItems).find(item => item.getAttribute('data-value') === 'הכול');
  if (accountDefaultItem) {
    accountDefaultItem.classList.add('selected');
  }
});

// ===== FILTER SELECTION FUNCTIONS =====

// Status filter (multi-select)
function selectStatusOption(status) {
  console.log('🔧 selectStatusOption called with:', status);
  
  const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
  const clickedItem = Array.from(statusItems).find(item => item.getAttribute('data-value') === status);
  
  if (clickedItem) {
    if (status === 'הכול') {
      // Selecting "הכול" - clear all others
      statusItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
    } else {
      // Multi-select - toggle selection
      const allItem = Array.from(statusItems).find(item => item.getAttribute('data-value') === 'הכול');
      if (allItem) {
        allItem.classList.remove('selected');
      }
      clickedItem.classList.toggle('selected');
      
      // If no items selected, select "הכול"
      const selectedItems = document.querySelectorAll('#statusFilterMenu .status-filter-item.selected');
      if (selectedItems.length === 0 && allItem) {
        allItem.classList.add('selected');
      }
    }
  }
  
  updateStatusFilterText();
  applyStatusFilter();
  
  // Close the status filter menu after selection
  const statusMenu = document.getElementById('statusFilterMenu');
  if (statusMenu) {
    statusMenu.classList.remove('show');
  }
}

// Type filter (multi-select)
function selectTypeOption(type) {
  console.log('🔧 selectTypeOption called with:', type);
  
  const typeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item');
  const clickedItem = Array.from(typeItems).find(item => item.getAttribute('data-value') === type);
  
  if (clickedItem) {
    if (type === 'הכול') {
      // Selecting "הכול" - clear all others
      typeItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
    } else {
      // Multi-select - toggle selection
      const allItem = Array.from(typeItems).find(item => item.getAttribute('data-value') === 'הכול');
      if (allItem) {
        allItem.classList.remove('selected');
      }
      clickedItem.classList.toggle('selected');
      
      // If no items selected, select "הכול"
      const selectedItems = document.querySelectorAll('#typeFilterMenu .type-filter-item.selected');
      if (selectedItems.length === 0 && allItem) {
        allItem.classList.add('selected');
      }
    }
  }
  
  updateTypeFilterText();
  applyTypeFilter();
  
  // Close the type filter menu after selection
  const typeMenu = document.getElementById('typeFilterMenu');
  if (typeMenu) {
    typeMenu.classList.remove('show');
  }
}

// Account filter (multi-select)
function selectAccountOption(account) {
  console.log('🔧 selectAccountOption called with:', account);
  
  const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
  const clickedItem = Array.from(accountItems).find(item => item.getAttribute('data-value') === account);
  
  if (clickedItem) {
    if (account === 'הכול') {
      // Selecting "הכול" - clear all others
      accountItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
    } else {
      // Multi-select - toggle selection
      const allItem = Array.from(accountItems).find(item => item.getAttribute('data-value') === 'הכול');
      if (allItem) {
        allItem.classList.remove('selected');
      }
      clickedItem.classList.toggle('selected');
      
      // If no items selected, select "הכול"
      const selectedItems = document.querySelectorAll('#accountFilterMenu .account-filter-item.selected');
      if (selectedItems.length === 0 && allItem) {
        allItem.classList.add('selected');
      }
    }
  }
  
  updateAccountFilterText();
  applyAccountFilter();
  
  // Close the account filter menu after selection
  const accountMenu = document.getElementById('accountFilterMenu');
  if (accountMenu) {
    accountMenu.classList.remove('show');
  }
}

// Export functions early to ensure they're available when header-system.js loads
window.selectAccountOption = selectAccountOption;

/**
 * בחירת אפשרות פילטר תאריכים
 */
function selectDateRangeOption(dateRange) {
  console.log('🔧 selectDateRangeOption called with:', dateRange);

  // הסרת בחירה מכל הפריטים
  const dateRangeItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
  dateRangeItems.forEach(item => item.classList.remove('selected'));

  // בחירת הפריט שנלחץ
  const clickedItem = Array.from(dateRangeItems).find(item => item.getAttribute('data-value') === dateRange);
  if (clickedItem) {
    clickedItem.classList.add('selected');
  }

  // עדכון טקסט ההצגה
  updateDateRangeFilterText();

  // הפעלת הפילטר
  applyDateRangeFilter(dateRange);

  // סגירת התפריט
  const dateMenu = document.getElementById('dateRangeFilterMenu');
  if (dateMenu) {
    dateMenu.classList.remove('show');
  }
}

// Export selectDateRangeOption early as well
window.selectDateRangeOption = selectDateRangeOption;

// ===== FILTER TEXT UPDATE FUNCTIONS =====

function updateStatusFilterText() {
  const selectedItems = document.querySelectorAll('#statusFilterMenu .status-filter-item.selected');
  const statusElement = document.getElementById('selectedStatus');
  
  if (statusElement) {
    if (selectedItems.length === 0 || (selectedItems.length === 1 && selectedItems[0].getAttribute('data-value') === 'הכול')) {
      statusElement.textContent = 'כל סטטוס';
    } else if (selectedItems.length === 1) {
      statusElement.textContent = selectedItems[0].getAttribute('data-value');
    } else {
      statusElement.textContent = `${selectedItems.length} סטטוסים`;
    }
  }
}

function updateTypeFilterText() {
  const selectedItems = document.querySelectorAll('#typeFilterMenu .type-filter-item.selected');
  const typeElement = document.getElementById('selectedType');
  
  if (typeElement) {
    if (selectedItems.length === 0 || (selectedItems.length === 1 && selectedItems[0].getAttribute('data-value') === 'הכול')) {
      typeElement.textContent = 'כל סוג השקעה';
    } else if (selectedItems.length === 1) {
      typeElement.textContent = selectedItems[0].getAttribute('data-value');
    } else {
      typeElement.textContent = `${selectedItems.length} סוגים`;
    }
  }
}

function updateAccountFilterText() {
  const selectedItems = document.querySelectorAll('#accountFilterMenu .account-filter-item.selected');
  const accountElement = document.getElementById('selectedAccount');

  if (accountElement) {
    if (selectedItems.length === 0 || (selectedItems.length === 1 && selectedItems[0].getAttribute('data-value') === 'הכול')) {
      accountElement.textContent = 'כל החשבונות';
    } else if (selectedItems.length === 1) {
      accountElement.textContent = selectedItems[0].getAttribute('data-value');
    } else {
      accountElement.textContent = `${selectedItems.length} חשבונות`;
    }
  }
}

function updateDateRangeFilterText() {
  const selectedItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item.selected');
  const dateRangeElement = document.getElementById('selectedDateRange');

  if (dateRangeElement) {
    if (selectedItems.length === 0) {
      dateRangeElement.textContent = 'כל זמן';
    } else if (selectedItems.length === 1) {
      const item = selectedItems[0];
      const value = item.getAttribute('data-value');
      dateRangeElement.textContent = value;
    } else {
      dateRangeElement.textContent = `${selectedItems.length} טווחי זמן`;
    }
  }
}

// ===== FILTER APPLICATION FUNCTIONS =====

function applyStatusFilter() {
  const selectedItems = document.querySelectorAll('#statusFilterMenu .status-filter-item.selected');
  const selectedStatuses = Array.from(selectedItems)
    .map(item => item.getAttribute('data-value'))
    .filter(value => value !== 'הכול');
  
  if (window.filterSystem && typeof window.filterSystem.applyFilters === 'function') {
    window.filterSystem.currentFilters.status = selectedStatuses;
    window.filterSystem.applyFilters();
  }
}

function applyTypeFilter() {
  const selectedItems = document.querySelectorAll('#typeFilterMenu .type-filter-item.selected');
  const selectedTypes = Array.from(selectedItems)
    .map(item => item.getAttribute('data-value'))
    .filter(value => value !== 'הכול');
  
  if (window.filterSystem && typeof window.filterSystem.applyFilters === 'function') {
    window.filterSystem.currentFilters.type = selectedTypes;
    window.filterSystem.applyFilters();
  }
}

function applyAccountFilter() {
  const selectedItems = document.querySelectorAll('#accountFilterMenu .account-filter-item.selected');
  const selectedAccounts = Array.from(selectedItems)
    .map(item => item.getAttribute('data-value'))
    .filter(value => value !== 'הכול');
  
  if (window.filterSystem && typeof window.filterSystem.applyFilters === 'function') {
    window.filterSystem.currentFilters.account = selectedAccounts;
    window.filterSystem.applyFilters();
  }
}

// ===== EXPORT FUNCTIONS TO WINDOW =====

window.selectStatusOption = selectStatusOption;
window.selectTypeOption = selectTypeOption;
// selectAccountOption and selectDateRangeOption are exported early in the file
window.updateStatusFilterText = updateStatusFilterText;
window.updateTypeFilterText = updateTypeFilterText;
window.updateAccountFilterText = updateAccountFilterText;
window.updateDateRangeFilterText = updateDateRangeFilterText;
window.applyStatusFilter = applyStatusFilter;
window.applyTypeFilter = applyTypeFilter;
window.applyAccountFilter = applyAccountFilter;
window.applyDateRangeFilter = applyDateRangeFilter;

