/**
 * ========================================
 * מערכת פילטרים חכמה גלובלית
 * ========================================
 * 
 * מערכת פילטרים מאוחדת שמתאימה את עצמה לכל טבלה
 * 
 * Dependencies:
 * - table-mappings.js (for column mappings)
 * - main.js (global utilities)
 * - translation-utils.js (translation functions)
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
      account: []
    };

    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;

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
      ...config
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
    if (!table || !table.element) return;

    const rows = table.element.querySelectorAll('tbody tr');
    const data = [];



    rows.forEach((row, rowIndex) => {
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
    if (!table) return;

    console.log(`🔍 === FILTER PROCESS FOR TABLE ${tableId} ===`);
    console.log(`🔍 Current filters:`, this.currentFilters);

    let filteredData = [...table.data];
    console.log(`🔍 Starting filter process for table ${tableId} with ${filteredData.length} rows`);

    // פילטר חיפוש (סטטי)
    if (this.currentFilters.search && table.fields.some(field =>
      ['name', 'description', 'title', 'symbol', 'account_name'].includes(field))) {
      console.log(`🔍 Applying search filter: "${this.currentFilters.search}"`);
      filteredData = this.applySearchFilter(filteredData, this.currentFilters.search);
      console.log(`🔍 After search filter: ${filteredData.length} rows`);
    }

    // פילטר תאריכים (סטטי)
    if (this.currentFilters.dateRange && this.currentFilters.dateRange !== 'כל זמן' &&
      table.fields.includes('date')) {
      console.log(`🔍 Applying date filter: "${this.currentFilters.dateRange}"`);
      const dateRange = this.getDateRangeFromText(this.currentFilters.dateRange);
      filteredData = this.applyDateFilter(filteredData, dateRange);
      console.log(`🔍 After date filter: ${filteredData.length} rows`);
    }

    // פילטר סטטוס (דינמי)
    if (this.currentFilters.status.length > 0 && table.fields.includes('status')) {
      console.log(`🔍 Applying status filter:`, this.currentFilters.status);
      filteredData = this.applyStatusFilter(filteredData, this.currentFilters.status);
      console.log(`🔍 After status filter: ${filteredData.length} rows`);
    }

    // פילטר סוג (דינמי)
    if (this.currentFilters.type.length > 0 && table.fields.includes('type')) {
      console.log(`🔍 Applying type filter:`, this.currentFilters.type);
      filteredData = this.applyTypeFilter(filteredData, this.currentFilters.type);
      console.log(`🔍 After type filter: ${filteredData.length} rows`);
    }

    // פילטר חשבון (דינמי)
    if (this.currentFilters.account.length > 0 && table.fields.includes('account_id')) {
      console.log(`🔍 Applying account filter:`, this.currentFilters.account);
      filteredData = this.applyAccountFilter(filteredData, this.currentFilters.account);
      console.log(`🔍 After account filter: ${filteredData.length} rows`);
    }

    table.filteredData = filteredData;

    // עדכון הטבלה ה-HTML
    this.updateTableDisplay(tableId, filteredData);
  }

  // עדכון תצוגת הטבלה
  updateTableDisplay(tableId, filteredData) {
    const table = this.tables.get(tableId);
    if (!table || !table.element) return;

    const tbody = table.element.querySelector('tbody');
    if (!tbody) return;

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

    console.log(`🎯 Updated table ${tableId}: showing ${filteredData.length} of ${table.data.length} rows`);
  }

  // פילטר חיפוש
  applySearchFilter(data, searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') return data;

    const searchLower = searchTerm.toLowerCase().trim();

    return data.filter(item => {
      // חיפוש בשדות ספציפיים
      const searchableFields = [
        item.symbol || '',
        item.type || '',
        item.status || '',
        item.account_name || '',
        item.notes || ''
      ];

      return searchableFields.some(field =>
        field.toString().toLowerCase().includes(searchLower)
      );
    });
  }

  // פילטר תאריכים
  applyDateFilter(data, dateRange) {
    if (!dateRange || !dateRange.start || !dateRange.end) return data;

    return data.filter(item => {
      if (!item.date) return false;
      const itemDate = new Date(item.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  // פונקציה לתרגום סטטוס מעברית לאנגלית
  translateStatusToEnglish(hebrewStatus) {
    const statusMap = {
      'פתוח': 'open',
      'סגור': 'closed',
      'מבוטל': 'cancelled'
    };
    return statusMap[hebrewStatus] || hebrewStatus;
  }

  // פונקציה לתרגום סטטוס מאנגלית לעברית
  translateStatusToHebrew(englishStatus) {
    const statusMap = {
      'open': 'פתוח',
      'closed': 'סגור',
      'cancelled': 'מבוטל'
    };
    return statusMap[englishStatus] || englishStatus;
  }

  // פילטר סטטוס
  applyStatusFilter(data, selectedStatuses) {
    if (selectedStatuses.length === 0) return data;

    console.log('🔍 Applying status filter:', selectedStatuses);
    console.log('🔍 Data before filter:', data);

    // תרגום הסטטוסים הנבחרים לאנגלית
    const translatedStatuses = selectedStatuses.map(status => this.translateStatusToEnglish(status));
    console.log('🔍 Translated statuses:', translatedStatuses);

    return data.filter(item => {
      const itemStatus = item.status;
      const itemSymbol = item.ticker || item.symbol || item.name || 'unknown';
      console.log(`🔍 Checking item ${itemSymbol}: status="${itemStatus}" against translatedStatuses:`, translatedStatuses);

      // בדיקה - אם הסטטוס של הפריט נמצא ברשימת הסטטוסים המתורגמים
      const isMatch = translatedStatuses.includes(itemStatus);
      console.log(`🔍 Item ${itemSymbol}: ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);

      return isMatch;
    });
  }

  // פילטר סוג
  applyTypeFilter(data, selectedTypes) {
    if (selectedTypes.length === 0) return data;

    return data.filter(item => {
      return selectedTypes.includes(item.type);
    });
  }

  // פילטר חשבון
  applyAccountFilter(data, selectedAccounts) {
    if (selectedAccounts.length === 0) return data;

    return data.filter(item => {
      return selectedAccounts.includes(item.account_id);
    });
  }

  // תרגום טקסט תאריכים לטווח תאריכים
  getDateRangeFromText(dateRangeText) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    let startDate, endDate;

    switch (dateRangeText) {
      case 'היום':
        startDate = todayStr;
        endDate = todayStr;
        break;

      case 'אתמול':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        startDate = yesterday.toISOString().split('T')[0];
        endDate = startDate;
        break;

      case 'השבוע':
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        startDate = startOfWeek.toISOString().split('T')[0];
        endDate = todayStr;
        break;

      case 'שבוע אחרון':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
        endDate = todayStr;
        break;

      case 'חודש אחרון':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        startDate = monthAgo.toISOString().split('T')[0];
        endDate = todayStr;
        break;

      case '3 חודשים':
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        startDate = threeMonthsAgo.toISOString().split('T')[0];
        endDate = todayStr;
        break;

      case 'MTD':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        endDate = todayStr;
        break;

      case 'YTD':
        startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        endDate = todayStr;
        break;

      case '30 יום':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        startDate = thirtyDaysAgo.toISOString().split('T')[0];
        endDate = todayStr;
        break;

      case '60 יום':
        const sixtyDaysAgo = new Date(today);
        sixtyDaysAgo.setDate(today.getDate() - 60);
        startDate = sixtyDaysAgo.toISOString().split('T')[0];
        endDate = todayStr;
        break;

      case '90 יום':
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(today.getDate() - 90);
        startDate = ninetyDaysAgo.toISOString().split('T')[0];
        endDate = todayStr;
        break;

      case 'שנה':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(today.getFullYear() - 1);
        startDate = yearAgo.toISOString().split('T')[0];
        endDate = todayStr;
        break;

      case 'שנה קודמת':
        startDate = new Date(today.getFullYear() - 1, 0, 1).toISOString().split('T')[0];
        endDate = new Date(today.getFullYear() - 1, 11, 31).toISOString().split('T')[0];
        break;

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
      console.log('📥 Loaded saved filters:', this.currentFilters);
    }
  }

  // איפוס פילטרים
  resetFilters() {
    this.currentFilters = {
      search: '',
      dateRange: 'כל זמן',
      status: [],
      type: [],
      account: []
    };
    this.saveFilters();
    this.applyAllFilters();
    console.log('🔄 Filters reset');
  }

  // הגדרת event listeners גלובליים
  setupGlobalEventListeners() {
    // Event listener לפילטר חיפוש
    document.addEventListener('input', (e) => {
      if (e.target.id === 'searchFilterInput') {
        this.updateFilter('search', e.target.value);
      }
    });

    // Event listener לפילטר תאריכים
    document.addEventListener('click', (e) => {
      if (e.target.closest('.date-range-filter-item')) {
        const text = e.target.closest('.date-range-filter-item').querySelector('.option-text').textContent;
        this.updateFilter('dateRange', text);
      }
    });

    // Event listener לפילטר סטטוס
    document.addEventListener('click', (e) => {
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
    document.addEventListener('click', (e) => {
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
    document.addEventListener('click', (e) => {
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
    if (!table) return false;

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

  // החזרת פילטרים נוכחיים
  getCurrentFilters() {
    return { ...this.currentFilters };
  }

  // עדכון אפשרויות חשבונות
  updateAccountOptions(accounts) {
    console.log('🔧 Updating account options:', accounts);
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

