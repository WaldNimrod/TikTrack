/**
 * Tables.js - TikTrack Table Management System
 * ============================================
 * 
 * This file contains all table-related functionality including:
 * - Global sorting system
 * - Table grid operations
 * - Sort state management
 * - Table utilities
 * 
 * Extracted from main.js to improve modularity and maintainability.
 * 
 * Dependencies:
 * - table-mappings.js (for column mappings)
 * - translation-utils.js (for translations)
 * 
 * @version 1.0
 * @lastUpdated August 24, 2025
 */

// ===== מערכת סידור גלובלית =====
// Global sorting system for all tables

/**
 * פונקציה גלובלית לסידור טבלאות
 * Global function for sorting tables
 * 
 * @param {number} columnIndex - אינדקס העמודה לסידור
 * @param {Array} data - הנתונים לסידור
 * @param {string} tableType - סוג הטבלה (planning, trades, accounts, etc.)
 * @param {Function} updateFunction - פונקציה לעדכון הטבלה
 * @returns {Array} הנתונים המסודרים
 */
window.sortTableData = function (columnIndex, data, tableType, updateFunction) {
  console.log(`🔄 Global sortTableData called for ${tableType} table, column ${columnIndex}`);

  // שמירת מצב הסידור הנוכחי
  const currentSortState = window.getSortState(tableType);

  // קביעת כיוון הסידור החדש
  let newDirection = 'asc';
  if (currentSortState.columnIndex === columnIndex) {
    // אם אותה עמודה - החלף כיוון
    newDirection = currentSortState.direction === 'asc' ? 'desc' : 'asc';
  }

  // שמירת מצב הסידור החדש
  window.saveSortState(tableType, columnIndex, newDirection);

  // סידור הנתונים
  const sortedData = [...data].sort((a, b) => {
    let aValue = getColumnValue(a, columnIndex, tableType);
    let bValue = getColumnValue(b, columnIndex, tableType);

    // המרה למספרים אם אפשר
    if (!isNaN(aValue) && !isNaN(bValue)) {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    }

    // המרה לתאריכים אם אפשר
    if (isDateValue(aValue) && isDateValue(bValue)) {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    // סידור
    if (aValue < bValue) {
      return newDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return newDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // עדכון הטבלה
  if (typeof updateFunction === 'function') {
    updateFunction(sortedData);
  }

  // עדכון האייקונים
  updateSortIcons(tableType, columnIndex, newDirection);

  console.log(`✅ Table ${tableType} sorted by column ${columnIndex}, direction: ${newDirection}`);
  return sortedData;
};

/**
 * בדיקה אם ערך הוא תאריך
 * Check if value is a date
 */
function isDateValue(value) {
  if (!value) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * שמירת מצב סידור
 * Save sort state
 */
window.saveSortState = function (tableType, columnIndex, direction) {
  const sortState = {
    columnIndex: columnIndex,
    direction: direction,
    timestamp: Date.now()
  };

  localStorage.setItem(`sortState_${tableType}`, JSON.stringify(sortState));
  console.log(`💾 Sort state saved for ${tableType}:`, sortState);
};

/**
 * קבלת מצב סידור
 * Get sort state
 */
window.getSortState = function (tableType) {
  const savedState = localStorage.getItem(`sortState_${tableType}`);
  if (savedState) {
    return JSON.parse(savedState);
  }
  return { columnIndex: -1, direction: 'asc' };
};

/**
 * עדכון אייקוני סידור
 * Update sort icons
 */
function updateSortIcons(tableType, activeColumnIndex, direction) {
  const table = document.querySelector(`[data-table-type="${tableType}"]`);
  if (!table) return;

  // הסרת כל האייקונים הקיימים
  const headers = table.querySelectorAll('th');
  headers.forEach((header, index) => {
    const existingIcon = header.querySelector('.sort-icon');
    if (existingIcon) {
      existingIcon.remove();
    }
  });

  // הוספת אייקון לעמודה הפעילה
  if (activeColumnIndex >= 0 && activeColumnIndex < headers.length) {
    const activeHeader = headers[activeColumnIndex];
    const icon = document.createElement('span');
    icon.className = 'sort-icon';
    icon.textContent = direction === 'asc' ? ' ▲' : ' ▼';
    icon.style.marginRight = '5px';
    icon.style.color = '#007bff';
    activeHeader.appendChild(icon);
  }
}

/**
 * פונקציה גלובלית לסידור כל הטבלאות
 * Global function for sorting all tables
 * 
 * @param {string} tableType - סוג הטבלה
 * @param {number} columnIndex - אינדקס העמודה
 * @param {Array} data - הנתונים
 * @param {Function} updateFunction - פונקציה לעדכון הטבלה
 */
window.sortAnyTable = function (tableType, columnIndex, data, updateFunction) {
  console.log(`🔄 Global sortAnyTable called for ${tableType} table`);

  // בדיקה אם הפונקציה הגלובלית זמינה
  if (typeof window.sortTableData === 'function') {
    return window.sortTableData(columnIndex, data, tableType, updateFunction);
  } else {
    console.error('❌ Global sortTableData function not available');
    return data;
  }
};

/**
 * פונקציה גלובלית לסידור טבלה (wrapper)
 * Global function for table sorting (wrapper for page-specific usage)
 * 
 * This function provides a unified interface for all page-specific sortTable calls.
 * It automatically handles the data source and update function based on the table type.
 * 
 * @param {string} tableType - סוג הטבלה (planning, trades, accounts, etc.)
 * @param {number} columnIndex - אינדקס העמודה לסידור
 * @param {Array} dataArray - מערך הנתונים לסידור
 * @param {Function} updateFunction - פונקציה לעדכון הטבלה
 * @returns {Array} הנתונים המסודרים
 */
window.sortTable = function (tableType, columnIndex, dataArray, updateFunction) {
  console.log(`🔄 Global sortTable called for ${tableType} table, column ${columnIndex}`);

  // שימוש בפונקציה הגלובלית הקיימת
  if (typeof window.sortTableData === 'function') {
    const sortedData = window.sortTableData(columnIndex, dataArray, tableType, updateFunction);

    // עדכון הנתונים המסוננים בהתאם לסוג הטבלה
    switch (tableType) {
      case 'alerts':
        if (typeof window.filteredAlertsData !== 'undefined') {
          window.filteredAlertsData = sortedData;
        }
        break;
      case 'planning':
        if (typeof window.filteredDesignsData !== 'undefined') {
          window.filteredDesignsData = sortedData;
        }
        break;
      case 'trades':
        if (typeof window.filteredTradesData !== 'undefined') {
          window.filteredTradesData = sortedData;
        }
        break;
      case 'notes':
        if (typeof window.notesData !== 'undefined') {
          window.notesData = sortedData;
        }
        break;
      case 'tickers':
        if (typeof window.tickersData !== 'undefined') {
          window.tickersData = sortedData;
        }
        break;
      case 'cash_flows':
        if (typeof window.cashFlowsData !== 'undefined') {
          window.cashFlowsData = sortedData;
        }
        break;
      case 'executions':
        if (typeof window.executionsData !== 'undefined') {
          window.executionsData = sortedData;
        }
        break;
      default:
        // For other table types, no specific filtered data handling needed
        break;
    }

    return sortedData;
  } else {
    console.error('❌ sortTableData function not found in main.js');
    return dataArray;
  }
};

/**
 * פונקציה גלובלית לשחזור מצב סידור
 * Global function for restoring sort state
 * 
 * @param {string} tableType - סוג הטבלה
 * @param {Array} data - הנתונים
 * @param {Function} updateFunction - פונקציה לעדכון הטבלה
 */
window.restoreAnyTableSort = function (tableType, data, updateFunction) {
  console.log(`🔄 Global restoreAnyTableSort called for ${tableType} table`);

  if (typeof window.getSortState === 'function') {
    const sortState = window.getSortState(tableType);

    if (sortState.columnIndex >= 0 && data && data.length > 0) {
      console.log(`🔄 Restoring sort for ${tableType}: column ${sortState.columnIndex}, direction: ${sortState.direction}`);

      // עדכון האייקונים
      updateSortIcons(tableType, sortState.columnIndex, sortState.direction);

      // סידור הנתונים
      setTimeout(() => {
        window.sortAnyTable(tableType, sortState.columnIndex, data, updateFunction);
      }, 100);
    }
  } else {
    console.log('⚠️ getSortState function not available');
  }
};

/**
 * פונקציה גלובלית לסגירת מודלים
 * Global function for closing modals
 * 
 * This function provides a unified way to close Bootstrap modals across the application.
 * It handles both Bootstrap 5 modal instances and fallback for older implementations.
 * 
 * @param {string} modalId - מזהה המודל לסגירה
 */
window.closeModal = function (modalId) {
  console.log(`🔄 Closing modal: ${modalId}`);

  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    // בדיקה אם Bootstrap זמין
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
        console.log(`✅ Modal ${modalId} closed via Bootstrap`);
      } else {
        // יצירת instance חדש אם לא קיים
        const newModal = new bootstrap.Modal(modalElement);
        newModal.hide();
        console.log(`✅ Modal ${modalId} closed via new Bootstrap instance`);
      }
    } else {
      // fallback לסגירה ידנית
      modalElement.style.display = 'none';
      modalElement.classList.remove('show');

      // הסרת backdrop אם קיים
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }

      // הסרת מחלקות מ-body
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      console.log(`✅ Modal ${modalId} closed via fallback method`);
    }
  } else {
    console.warn(`⚠️ Modal element ${modalId} not found`);
  }
};

// ===== GRID CORE FUNCTIONS =====
// קובץ ייעודי ללוגיקת הגריד הבסיסית - משותף לכל הדפים

// משתנים גלובליים
let externalFilterPresent = false;

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
    width: 100,
    minWidth: 80,
    maxWidth: 120,
    cellClass: params => params.value.includes("(+") ? 'positive' : params.value.includes("(-") ? 'negative' : ''
  },
  {
    headerName: "תאריך",
    field: "date",
    width: 120,
    minWidth: 100,
    maxWidth: 140,
    cellRenderer: params => {
      if (!params.value) return '-';
      const date = new Date(params.value);
      return date.toLocaleDateString('he-IL');
    }
  },
  {
    headerName: "פעולות",
    field: "actions",
    width: 120,
    minWidth: 100,
    maxWidth: 150,
    cellRenderer: params => `
      <div class="action-buttons">
        <button class="btn btn-sm btn-info" onclick="viewItemDetails('${params.data.id}')" title="צפייה בפרטים">👁️</button>
        <button class="btn btn-sm btn-warning" onclick="editItem('${params.data.id}')" title="עריכה">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteItem('${params.data.id}')" title="מחיקה">🗑️</button>
      </div>
    `
  }
];

// ייצוא הפונקציות הגלובליות
window.getDefaultColumnDefs = getDefaultColumnDefs;

console.log('✅ Tables.js loaded successfully');
