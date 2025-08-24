/**
 * Main.js - TikTrack Frontend
 * ============================
 * 
 * This file contains global utility functions used across the entire TikTrack application.
 * It serves as the central hub for common functionality including:
 * - Notification system
 * - Table operations (sorting, filtering)
 * - Page summary statistics
 * - Global event handlers
 * - Utility functions
 * 
 * Architecture:
 * - All functions are exported to the global scope (window object)
 * - Functions are organized by category and responsibility
 * - Comprehensive error handling and logging
 * - Backward compatibility maintained for existing functions
 * 
 * Dependencies:
 * - translation-utils.js (loaded before this file)
 * - table-mappings.js (loaded before this file for column mappings)
 * - All page-specific JavaScript files
 * 
 * Table Mapping System:
 * - Column mappings are centralized in table-mappings.js
 * - This file uses window.getColumnValue() from table-mappings.js
 * - Local getColumnValue() function is deprecated
 * 
 * @version 2.2
 * @lastUpdated August 23, 2025
 */

// ===== MAIN.JS - קובץ כללי לכל האתר =====

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

// REMOVED: getColumnValue function - now using window.getColumnValue from table-mappings.js
// הסרה: פונקציה getColumnValue - כעת משתמשים ב-window.getColumnValue מ-table-mappings.js

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

/**
 * מערכת התראות גלובלית - CSS
 * Global notification system CSS injection
 */
function addNotificationStyles() {
  if (document.getElementById('notificationStyles')) {
    return; // כבר קיים
  }

  const style = document.createElement('style');
  style.id = 'notificationStyles';
  style.textContent = `
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99999;
      max-width: 400px;
    }

    .notification-container.modal-notification {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 999999;
      max-width: 350px;
    }

    .notification {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      margin-bottom: 10px;
      padding: 16px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      border-left: 4px solid #007bff;
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s ease;
    }

    .notification.show {
      transform: translateX(0);
      opacity: 1;
    }

    .notification.hide {
      transform: translateX(100%);
      opacity: 0;
    }

    .notification.success {
      border-left-color: #28a745;
    }

    .notification.error {
      border-left-color: #dc3545;
    }

    .notification.warning {
      border-left-color: #ffc107;
    }

    .notification.info {
      border-left-color: #17a2b8;
    }

    .notification-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .notification-content {
      flex: 1;
    }

    .notification-title {
      font-weight: 600;
      margin-bottom: 4px;
      color: #333;
    }

    .notification-message {
      color: #666;
      font-size: 14px;
      line-height: 1.4;
    }

    .notification-close {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #999;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notification-close:hover {
      color: #333;
    }
  `;
  document.head.appendChild(style);
}

// הוספת CSS בטעינת הדף
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addNotificationStyles);
} else {
  addNotificationStyles();
}

/**
 * קובץ JavaScript ראשי לאתר TikTrack
 * 
 * קובץ זה מכיל את הפונקציונליות הבסיסית של האפליקציה
 * כולל אתחול, ניווט, פונקציות עזר כלליות ומערכת התראות
 * 
 * כללי חשובים:
 * 1. פונקציות שקשורות רק לישות אחת מישויות בסיס הנתונים נכתבת בקובץ ייעודי משלה
 * 2. פונקציות כלליות הקשורות לכל העמודים או הישויות נכתבות בקובץ הזה
 * 3. קובץ זה כולל את כל הפונקציונליות מ-grid-table.js ו-grid-data.js
 * 
 * תכולת הקובץ:
 * - מערכת התראות גלובלית (showNotification, showSuccessNotification, וכו')
 * - פונקציות API כלליות (apiCall)
 * - הגדרות עמודות גריד סטנדרטיות
 * - פונקציות עזר כלליות (formatCurrency, formatDate, וכו')
 * - ניהול מצב האפליקציה
 * - פונקציות אתחול גריד
 * 
 * היררכיה: נטען ראשון, מכיל פונקציות בסיסיות
 */

// ===== GRID CORE FUNCTIONS =====
// קובץ ייעודי ללוגיקת הגריד הבסיסית - משותף לכל הדפים

// משתנים גלובליים
let externalFilterPresent = false;

// ===== ייצוא מיידי של פונקציות גלובליות =====
// ייצוא הפונקציות הגלובליות מיד בתחילת הקובץ כדי לוודא שהן זמינות

// פונקציה לאתחול הגדרות תצוגה בדף הערות
window.resetNotesDisplaySettings = function () {
  console.log('🔄 === אתחול הגדרות תצוגה בדף הערות ===');

  // מחיקת הגדרות שמורות
  localStorage.removeItem('notesTopSectionHidden');
  localStorage.removeItem('notesMainSectionHidden');

  // איפוס תצוגת הסקשנים
  const topSection = document.getElementById('notesTopSection');
  const mainSection = document.getElementById('notesMainSection');

  if (topSection) {
    topSection.style.display = 'block';
    console.log('✅ אופס top section');
  }

  if (mainSection) {
    mainSection.style.display = 'block';
    console.log('✅ אופס main section');
  }

  // איפוס אייקונים
  const topIcon = document.querySelector('.top-section .filter-icon');
  const mainIcon = document.querySelector('.content-section .filter-icon');

  if (topIcon) {
    topIcon.textContent = '▲';
    console.log('✅ אופס top icon');
  }

  if (mainIcon) {
    mainIcon.textContent = '▲';
    console.log('✅ אופס main icon');
  }

  console.log('✅ אתחול הגדרות תצוגה הושלם');
};

// פונקציה לאיפוס אוטומטי של הגדרות תצוגה בדף הערות
window.autoResetNotesDisplay = function () {
  if (window.location.pathname.includes('/notes')) {
    console.log('🔄 === איפוס אוטומטי של הגדרות תצוגה בדף הערות ===');

    // בדיקה אם יש הגדרות שמורות שגויות
    const topHidden = localStorage.getItem('notesTopSectionHidden');
    const mainHidden = localStorage.getItem('notesMainSectionHidden');

    if (topHidden === 'true' || mainHidden === 'true') {
      console.log('⚠️ נמצאו הגדרות שגויות - מאתחל...');
      window.resetNotesDisplaySettings();
    }
  }
};

// הגדרת הפונקציות הגלובליות ישירות
window.toggleTopSection = function () {
  const currentPath = window.location.pathname;

  // טיפול מיוחד לדף הערות
  if (currentPath.includes('/notes')) {
    const section = document.getElementById('notesTopSection');
    const toggleBtn = document.querySelector('.top-section button[onclick*="toggleTopSection"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (section && toggleBtn) {
      const isHidden = section.style.display === 'none';
      section.style.display = isHidden ? 'block' : 'none';

      // עדכון האייקון בלבד
      if (icon) {
        icon.textContent = isHidden ? '▲' : '▼';
      }

      // שמירת המצב
      localStorage.setItem('notesTopSectionHidden', !isHidden);
    }
    return;
  }

  // טיפול רגיל לשאר הדפים
  const section = document.querySelector('.top-section .section-body');
  const toggleBtn = document.querySelector('.top-section button[onclick*="toggleTopSection"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (section) {
    const isCollapsed = section.classList.contains('collapsed') || section.style.display === 'none';

    if (isCollapsed) {
      section.classList.remove('collapsed');
      section.style.display = 'block';
    } else {
      section.classList.add('collapsed');
      section.style.display = 'none';
    }

    // עדכון האייקון
    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }

    // קביעת מפתח localStorage לפי הדף הנוכחי
    let storageKey = 'topSectionCollapsed';

    if (currentPath.includes('/alerts')) {
      storageKey = 'alertsTopSectionCollapsed';
    } else if (currentPath.includes('/planning')) {
      storageKey = 'planningTopSectionCollapsed';
    } else if (currentPath.includes('/designs')) {
      storageKey = 'topSectionCollapsed';
    }

    // שמירת המצב ב-localStorage
    localStorage.setItem(storageKey, !isCollapsed);
  }
};

window.toggleMainSection = function () {
  const currentPath = window.location.pathname;

  // טיפול מיוחד לדף הערות
  if (currentPath.includes('/notes')) {
    const section = document.getElementById('notesMainSection');
    const toggleBtn = document.querySelector('.content-section button[onclick*="toggleMainSection"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (section && toggleBtn) {
      const isHidden = section.style.display === 'none';
      section.style.display = isHidden ? 'block' : 'none';

      // עדכון האייקון בלבד
      if (icon) {
        icon.textContent = isHidden ? '▲' : '▼';
      }

      // שמירת המצב
      localStorage.setItem('notesMainSectionHidden', !isHidden);
    }
    return;
  }

  // טיפול רגיל לשאר הדפים
  const section = document.querySelector('.content-section .section-body');
  const toggleBtn = document.querySelector('.content-section button[onclick*="toggleMainSection"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (section) {
    const isCollapsed = section.classList.contains('collapsed') || section.style.display === 'none';

    if (isCollapsed) {
      section.classList.remove('collapsed');
      section.style.display = 'block';
    } else {
      section.classList.add('collapsed');
      section.style.display = 'none';
    }

    // עדכון האייקון
    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }

    // קביעת מפתח localStorage לפי הדף הנוכחי
    let storageKey = 'mainSectionCollapsed';

    if (currentPath.includes('/alerts')) {
      storageKey = 'alertsMainSectionCollapsed';
    } else if (currentPath.includes('/planning')) {
      storageKey = 'planningMainSectionCollapsed';
    } else if (currentPath.includes('/designs')) {
      storageKey = 'mainSectionCollapsed';
    }

    // שמירת המצב ב-localStorage
    localStorage.setItem(storageKey, !isCollapsed);
  }
};

window.restoreAllSectionStates = function () {
  const currentPath = window.location.pathname;

  // טיפול מיוחד לדף הערות
  if (currentPath.includes('/notes')) {
    // שחזור סקשן עליון
    const topSectionHidden = localStorage.getItem('notesTopSectionHidden') === 'true';
    const topSection = document.getElementById('notesTopSection');
    const topButton = document.querySelector('[onclick*="toggleTopSection"]');

    if (topSection && topButton) {
      topSection.style.display = topSectionHidden ? 'none' : 'block';
      topButton.innerHTML = topSectionHidden ? '▶ הצג' : '▼ הסתר';
    }

    // שחזור סקשן ראשי
    const mainSectionHidden = localStorage.getItem('notesMainSectionHidden') === 'true';
    const mainSection = document.getElementById('notesMainSection');
    const mainButton = document.querySelector('[onclick*="toggleMainSection"]');

    if (mainSection && mainButton) {
      mainSection.style.display = mainSectionHidden ? 'none' : 'block';
      mainButton.innerHTML = mainSectionHidden ? '▶ הצג' : '▼ הסתר';
    }
    return;
  }

  // טיפול רגיל לשאר הדפים
  // שחזור מצב top section
  const topSection = document.querySelector('.top-section .section-body');
  const topToggleBtn = document.querySelector('.top-section button[onclick*="toggleTopSection"]');
  const topIcon = topToggleBtn ? topToggleBtn.querySelector('.filter-icon') : null;

  if (topSection && topToggleBtn && topIcon) {
    let storageKey = 'topSectionCollapsed';

    if (currentPath.includes('/alerts')) {
      storageKey = 'alertsTopSectionCollapsed';
    } else if (currentPath.includes('/planning')) {
      storageKey = 'planningTopSectionCollapsed';
    } else if (currentPath.includes('/designs')) {
      storageKey = 'topSectionCollapsed';
    }

    const isCollapsed = localStorage.getItem(storageKey) === 'true';

    if (isCollapsed) {
      topSection.classList.add('collapsed');
      topSection.style.display = 'none';
      topIcon.textContent = '▼';
    } else {
      topSection.classList.remove('collapsed');
      topSection.style.display = 'block';
      topIcon.textContent = '▲';
    }
  }

  // שחזור מצב main section
  const mainSection = document.querySelector('.content-section .section-body');
  const mainToggleBtn = document.querySelector('.content-section button[onclick*="toggleMainSection"]');
  const mainIcon = mainToggleBtn ? mainToggleBtn.querySelector('.filter-icon') : null;

  if (mainSection && mainToggleBtn && mainIcon) {
    let storageKey = 'mainSectionCollapsed';

    if (currentPath.includes('/alerts')) {
      storageKey = 'alertsMainSectionCollapsed';
    } else if (currentPath.includes('/planning')) {
      storageKey = 'planningMainSectionCollapsed';
    } else if (currentPath.includes('/designs')) {
      storageKey = 'mainSectionCollapsed';
    }

    const isCollapsed = localStorage.getItem(storageKey) === 'true';

    if (isCollapsed) {
      mainSection.classList.add('collapsed');
      mainSection.style.display = 'none';
      mainIcon.textContent = '▼';
    } else {
      mainSection.classList.remove('collapsed');
      mainSection.style.display = 'block';
      mainIcon.textContent = '▲';
    }
  }
};

// ===== מערכת התראות =====
/**
 * מערכת התראות גלובלית לאתר
 * 
 * מערכת זו מספקת הודעות משתמש יפות ומודרניות במקום alert() הסטנדרטי
 * ההתראות מוצגות בפינה הימנית העליונה של המסך ונעלמות אוטומטית
 * 
 * תכונות:
 * - 4 סוגי התראות: הצלחה, שגיאה, אזהרה, מידע
 * - אנימציות חלקות עם כניסה ויציאה
 * - זמן הצגה מותאם לכל סוג התראה
 * - כפתור סגירה ידני
 * - עיצוב מודרני עם blur effect
 * 
 * שימוש:
 * showSuccessNotification('כותרת', 'הודעה');
 * showErrorNotification('כותרת', 'הודעה');
 * showWarningNotification('כותרת', 'הודעה');
 * showInfoNotification('כותרת', 'הודעה');
 */

/**
 * פונקציה להצגת התראה
 * @param {string} title - כותרת ההתראה
 * @param {string} message - תוכן ההתראה
 * @param {string} type - סוג ההתראה (success, error, warning, info)
 * @param {number} duration - משך זמן בהצגה (במילישניות, ברירת מחדל: 4000)
 * @param {string} containerId - מזהה של container ספציפי (אופציונלי)
 * @param {boolean} isModal - האם ההתראה בתוך מודול (ברירת מחדל: false)
 */
function showNotification(title, message, type = 'info', duration = 4000, containerId = null, isModal = false) {
  // יצירת container אם לא קיים
  let container = document.getElementById('notificationContainer');

  if (containerId) {
    // אם יש container ספציפי, נשתמש בו
    container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.className = isModal ? 'notification-container modal-notification' : 'notification-container';

      // אם זה מודול, נוסיף את ה-container לתוך המודול
      if (isModal) {
        const modalId = containerId.replace('notificationContainer_', '');
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.appendChild(container);
        } else {
          document.body.appendChild(container);
        }
      } else {
        document.body.appendChild(container);
      }
    }
  } else {
    // container גלובלי
    if (!container) {
      container = document.createElement('div');
      container.id = 'notificationContainer';
      container.className = 'notification-container';
      document.body.appendChild(container);
    }
  }

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  notification.innerHTML = `
    <div class="notification-icon">${icons[type] || icons.info}</div>
    <div class="notification-content">
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(notification);

  // אנימציית כניסה
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // הסרה אוטומטית
  if (duration > 0) {
    setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }, duration);
  }
}

/**
 * פונקציות עזר להתראות
 * 
 * פונקציות אלו מספקות ממשק נוח להצגת התראות מסוגים שונים
 * כל פונקציה מגדירה זמן הצגה מותאם לסוג ההתראה
 */

/**
 * הצגת התראת הצלחה
 * @param {string} title - כותרת ההתראה
 * @param {string} message - תוכן ההתראה
 * @param {number} duration - משך זמן בהצגה (ברירת מחדל: 4000ms)
 */
function showSuccessNotification(title, message, duration = 4000) {
  showNotification(title, message, 'success', duration);
}

/**
 * הצגת התראת שגיאה
 * @param {string} title - כותרת ההתראה
 * @param {string} message - תוכן ההתראה
 * @param {number} duration - משך זמן בהצגה (ברירת מחדל: 6000ms)
 */
function showErrorNotification(title, message, duration = 6000) {
  showNotification(title, message, 'error', duration);
}

/**
 * הצגת התראת אזהרה
 * @param {string} title - כותרת ההתראה
 * @param {string} message - תוכן ההתראה
 * @param {number} duration - משך זמן בהצגה (ברירת מחדל: 5000ms)
 */
function showWarningNotification(title, message, duration = 5000) {
  console.log('🔔 === SHOW WARNING NOTIFICATION ===');
  console.log('🔔 Title:', title);
  console.log('🔔 Message:', message);
  console.log('🔔 Duration:', duration);
  showNotification(title, message, 'warning', duration);
}

/**
 * פונקציות להתראות בתוך מודול
 * 
 * פונקציות אלו מאפשרות הצגת התראות בתוך מודול ספציפי
 * עם מיקום מותאם וזמן הצגה קצר יותר
 */

/**
 * הצגת התראה בתוך מודול
 * @param {string} modalId - מזהה המודול
 * @param {string} title - כותרת ההתראה
 * @param {string} message - תוכן ההתראה
 * @param {string} type - סוג ההתראה (success, error, warning, info)
 * @param {number} duration - משך זמן בהצגה (ברירת מחדל: 3000ms)
 */
// פונקציות showModalNotification הועברו ל-ui-utils.js





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
    width: 140,
    minWidth: 120,
    maxWidth: 160
  },
  {
    headerName: "סוג",
    field: "type",
    width: 100,
    minWidth: 80,
    maxWidth: 120,
    filter: true,
    filterParams: {
      filterOptions: ['equals', 'notEqual'],
      defaultOption: 'equals'
    }
  },
  {
    headerName: "תאריך",
    field: "date",
    width: 120,
    minWidth: 100,
    maxWidth: 140,
    filter: true,
    filterParams: {
      filterOptions: ['equals', 'notEqual', 'greaterThan', 'lessThan'],
      defaultOption: 'equals'
    }
  },
  {
    headerName: "טיקר",
    field: "ticker",
    width: 100,
    minWidth: 80,
    maxWidth: 120,
    filter: true,
    filterParams: {
      filterOptions: ['equals', 'notEqual', 'contains'],
      defaultOption: 'contains'
    }
  }
];

// ===== GRID DATA MANAGEMENT =====
// קובץ ייעודי לניהול נתונים - משותף לכל הדפים

// נתוני דוגמה סטנדרטיים - ללא חשבונות ספציפיים
const getDefaultRowData = () => [
  { ticker: "AAPL", date: "2025-08-01", type: "סווינג", amount: "$25,000 (#100)", target: "$210 (12.3%)", stop: "$180 (-6.7%)", current: "$184.32 (+1.2%)", status: "פתוח", action: "⬅️", account: "" },
  { ticker: "TSLA", date: "2025-07-30", type: "השקעה", amount: "$20,000 (#100)", target: "$780 (10.1%)", stop: "$690 (-4.8%)", current: "$688.90 (-2.1%)", status: "סגור", action: "⬅️", account: "" },
  { ticker: "NVDA", date: "2025-07-28", type: "השקעה", amount: "$15,000 (#75)", target: "$540 (8.2%)", stop: "$480 (-4.5%)", current: "$503.20 (+0.5%)", status: "פתוח", action: "⬅️", account: "" },
  { ticker: "AMZN", date: "2025-07-27", type: "פאסיבי", amount: "$10,000 (#50)", target: "$140 (6.3%)", stop: "$126 (-3.1%)", current: "$129.00 (-1.0%)", status: "מבוטל", action: "⬅️", account: "" },
  { ticker: "GOOG", date: "2025-07-26", type: "השקעה", amount: "$20,000 (#60)", target: "$148 (9.0%)", stop: "$130 (-3.4%)", current: "$141.00 (+1.6%)", status: "פתוח", action: "⬅️", account: "" },
  { ticker: "MSFT", date: "2025-07-25", type: "סווינג", amount: "$18,000 (#90)", target: "$355 (11.2%)", stop: "$320 (-4.2%)", current: "$342.00 (+2.4%)", status: "סגור", action: "⬅️", account: "" }
];

// פונקציה לטעינת נתונים מהשרת
async function loadPlansFromServer() {
  try {
    console.log('Loading plans from server...');

    // כאן תהיה קריאה לשרת האמיתי
    // const response = await fetch('/api/plans');
    // const data = await response.json();

    // כרגע נחזיר נתוני דוגמה
    const data = getDefaultRowData();

    console.log('Plans loaded from server:', data.length, 'items');
    return data;
  } catch (error) {
    console.error('Error loading plans from server:', error);
    // במקרה של שגיאה, נחזיר נתוני דוגמה
    return getDefaultRowData();
  }
}

// פונקציה לחילוץ סכום מהשדה amount
function extractAmount(amountString) {
  if (!amountString) return 0;

  // מחפש מספר אחרי הסימן $ ולפני הסימן (
  const match = amountString.match(/\$([0-9,]+)/);
  if (match) {
    // מסיר פסיקים וממיר למספר
    return parseFloat(match[1].replace(/,/g, ''));
  }

  // אם לא מצאנו $, נחפש מספר רגיל
  const numberMatch = amountString.match(/[\d,]+/);
  if (numberMatch) {
    return parseInt(numberMatch[0].replace(/,/g, ''));
  }

  return 0;
}

// פונקציה לעדכון סטטיסטיקות
/**
 * Update page summary statistics
 * 
 * This function updates the summary statistics displayed on various pages.
 * It calculates and displays counts, totals, and other aggregated data
 * based on the current page's data.
 * 
 * @param {Object|null} data - Optional data object. If null, uses current page data
 * @returns {void}
 * 
 * Usage:
 * - Called automatically when page data changes
 * - Can be called manually with specific data
 * - Updates summary elements on the current page
 */
function updatePageSummaryStats(data = null) {
  console.log('=== updateSummaryStats called ===');
  console.log('Input data:', data);
  console.log('window.rowData:', window.rowData);
  console.log('window.gridApi exists:', !!window.gridApi);

  let statsData;

  // אם לא הועברו נתונים, השתמש בנתונים המוצגים בגריד (כמו בדף התכנונים)
  if (!data && window.gridApi) {
    const displayedRows = [];
    window.gridApi.forEachNodeAfterFilter(node => {
      displayedRows.push(node.data);
    });
    statsData = displayedRows;
    console.log('Using displayed rows from grid:', statsData);
  } else if (!data) {
    statsData = window.rowData || [];
    console.log('Using window.rowData:', statsData);
  } else {
    statsData = data;
    console.log('Using provided data:', statsData);
  }

  console.log('Stats data to process:', statsData);
  console.log('Stats data length:', statsData.length);

  if (statsData.length === 0) {
    console.log('No data to calculate statistics');
    // עדכון תצוגה עם אפסים
    updateStatsDisplay({
      totalRecords: 0,
      totalAmount: 0,
      averageAmount: 0
    });
    return;
  }

  // חישוב סטטיסטיקות כלליות
  const totalRecords = statsData.length;
  let totalAmount = 0;

  // חישוב סכום כולל
  statsData.forEach(record => {
    try {
      totalAmount += extractAmount(record.amount);
    } catch (e) {
      console.log('שגיאה בחישוב סכום לרשומה:', record, e);
    }
  });

  // חישוב סכום ממוצע
  const averageAmount = totalRecords > 0 ? Math.round(totalAmount / totalRecords) : 0;

  console.log('Summary statistics calculated:', {
    totalRecords: totalRecords,
    totalAmount: totalAmount,
    averageAmount: averageAmount
  });

  // עדכון תצוגת הסטטיסטיקות
  updateStatsDisplay({
    totalRecords: totalRecords,
    totalAmount: totalAmount,
    averageAmount: averageAmount
  });
}

// פונקציה לעדכון תצוגת הסטטיסטיקות
function updateStatsDisplay(stats) {
  console.log('=== updateStatsDisplay called ===');
  console.log('Stats to display:', stats);

  // פונקציה לעיצוב מספרים עם פסיקים
  const formatNumber = (num) => {
    return num.toLocaleString('he-IL');
  };

  // פונקציה לעיצוב סכומים בדולרים
  const formatCurrency = (num) => {
    return `$${num.toLocaleString('he-IL')}`;
  };

  // עדכון התצוגה עם המידע החדש
  const summaryDiv = document.querySelector('.info-summary');
  if (summaryDiv) {
    summaryDiv.innerHTML = `
      <div>סה"כ רשומות: <strong>${formatNumber(stats.totalRecords)}</strong></div>
      <div>סה"כ סכום: <strong>${formatCurrency(stats.totalAmount)}</strong></div>
      <div>סכום ממוצע: <strong>${formatCurrency(stats.averageAmount)}</strong></div>
    `;
    console.log('Updated info-summary with:', stats);
  } else {
    console.warn('info-summary element not found');
  }

  console.log('Stats display updated:', stats);
}

// ===== Section Toggle Functions =====

/**
 * פונקציה לפתיחה וסגירה של סקשן ספציפי
 * @param {string} sectionId - מזהה הסקשן
 */
function toggleSection(sectionId) {
  console.log(`🔄 Toggling section: ${sectionId}`);

  const section = document.querySelector(`[data-section="${sectionId}"]`);
  if (!section) {
    console.warn(`Section with data-section="${sectionId}" not found`);
    return;
  }

  const sectionBody = section.querySelector('.section-body');
  const toggleBtn = section.querySelector(`button[onclick*="toggleSection('${sectionId}')"], button[onclick*="toggleSection(${sectionId})"]`);
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (sectionBody) {
    const isCollapsed = sectionBody.classList.contains('collapsed') || sectionBody.style.display === 'none';

    if (isCollapsed) {
      section.classList.remove('collapsed');
      sectionBody.style.display = 'block';
      console.log(`📖 Section ${sectionId} expanded`);
    } else {
      section.classList.add('collapsed');
      sectionBody.style.display = 'none';
      console.log(`📖 Section ${sectionId} collapsed`);
    }

    // עדכון האייקון
    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }

    // שמירת המצב ב-localStorage
    const storageKey = `${sectionId}SectionCollapsed`;
    localStorage.setItem(storageKey, !isCollapsed);
  }
}

/**
 * פונקציה לפתיחה וסגירה של כל הסקשנים
 */
function toggleAllSections() {
  console.log('🔄 Toggling all sections');

  const sections = document.querySelectorAll('.content-section');
  const toggleBtn = document.querySelector('button[onclick*="toggleAllSections"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

  if (sections.length === 0) {
    console.warn('No sections found');
    return;
  }

  // בדיקה אם כל הסקשנים סגורים
  const allCollapsed = Array.from(sections).every(section => {
    const sectionBody = section.querySelector('.section-body');
    return sectionBody && (sectionBody.classList.contains('collapsed') || sectionBody.style.display === 'none');
  });

  // פתיחה או סגירה של כל הסקשנים
  sections.forEach(section => {
    const sectionBody = section.querySelector('.section-body');
    const sectionId = section.getAttribute('data-section');

    if (sectionBody) {
      if (allCollapsed) {
        // פתיחת כל הסקשנים
        sectionBody.classList.remove('collapsed');
        sectionBody.style.display = 'block';
        localStorage.setItem(`${sectionId}SectionCollapsed`, false);
      } else {
        // סגירת כל הסקשנים
        sectionBody.classList.add('collapsed');
        sectionBody.style.display = 'none';
        localStorage.setItem(`${sectionId}SectionCollapsed`, true);
      }
    }
  });

  // עדכון האייקון
  if (icon) {
    icon.textContent = allCollapsed ? '▼' : '▲';
  }

  console.log(`📖 All sections ${allCollapsed ? 'expanded' : 'collapsed'}`);
}

// חשיפת הפונקציות הגלובליות
window.toggleSection = toggleSection;
window.toggleAllSections = toggleAllSections;

/**
 * פונקציה לשחזור המצב השמור של הסקשנים
 */
function restoreSectionStates() {
  console.log('🔄 Restoring section states from localStorage');

  const sections = document.querySelectorAll('.content-section');

  sections.forEach(section => {
    const sectionId = section.getAttribute('data-section');
    const sectionBody = section.querySelector('.section-body');
    const toggleBtn = section.querySelector(`button[onclick*="toggleSection('${sectionId}')"], button[onclick*="toggleSection(${sectionId})"]`);
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionId && sectionBody) {
      const storageKey = `${sectionId}SectionCollapsed`;
      const isCollapsed = localStorage.getItem(storageKey) === 'true';

      if (isCollapsed) {
        sectionBody.classList.add('collapsed');
        sectionBody.style.display = 'none';
        if (icon) {
          icon.textContent = '▼';
        }
        console.log(`📖 Section ${sectionId} restored as collapsed`);
      } else {
        sectionBody.classList.remove('collapsed');
        sectionBody.style.display = 'block';
        if (icon) {
          icon.textContent = '▲';
        }
        console.log(`📖 Section ${sectionId} restored as expanded`);
      }
    }
  });
}

// הוספת event listener לטעינת המצב השמור
document.addEventListener('DOMContentLoaded', function () {
  // המתנה קצרה לוודא שהדף נטען לחלוטין
  setTimeout(() => {
    restoreSectionStates();
  }, 100);
});

// חשיפת הפונקציה הגלובלית
window.restoreSectionStates = restoreSectionStates;

/**
 * פונקציה לעיצוב תאריך
 */
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL') + ' ' + date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

/**
 * פונקציה לעיצוב תאריך ושעה
 */
function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL') + ' ' + date.toLocaleTimeString('he-IL');
}

/**
 * פונקציה לעיצוב תאריך בלבד (ללא שעה)
 */
function formatDateOnly(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL');
}

// חשיפת פונקציות התאריך הגלובליות
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.formatDateOnly = formatDateOnly;



/**
 * פונקציה לצפייה באלמנטים מקושרים
 * Global function for viewing linked items
 * 
 * @param {number|string} itemId - מזהה האלמנט
 * @param {string} itemType - סוג האלמנט (optional)
 */
function viewLinkedItems(itemId, itemType = null) {
  console.log('🔄 צפייה באלמנטים מקושרים:', { itemId, itemType });

  // זיהוי סוג האלמנט לפי הדף הנוכחי אם לא צוין
  if (!itemType) {
    const currentPath = window.location.pathname;
    console.log('📍 נתיב נוכחי:', currentPath);
    if (currentPath.includes('/accounts')) itemType = 'account';
    else if (currentPath.includes('/trades') || currentPath.includes('trades.html')) itemType = 'trade';
    else if (currentPath.includes('/tickers')) itemType = 'ticker';
    else if (currentPath.includes('/alerts')) itemType = 'alert';
    else if (currentPath.includes('/cash_flows')) itemType = 'cash_flow';
    else if (currentPath.includes('/notes')) itemType = 'note';
    else if (currentPath.includes('/trade_plans')) itemType = 'trade_plan';
    else if (currentPath.includes('/executions')) itemType = 'execution';
  }

  console.log('🎯 סוג אלמנט שנבחר:', itemType);

  // טעינת הנתונים המקושרים
  loadLinkedItemsData(itemId, itemType);
}

/**
 * פונקציה לטעינת נתונים מקושרים
 * Load linked items data from server
 * 
 * @param {number|string} itemId - מזהה האלמנט
 * @param {string} itemType - סוג האלמנט
 */
async function loadLinkedItemsData(itemId, itemType) {
  try {
    console.log(`🔄 טעינת נתונים מקושרים ל-${itemType} ${itemId}`);

    // קריאה ל-API לקבלת נתונים מקושרים
    const response = await fetch(`/api/v1/linked-items/${itemType}/${itemId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📊 נתונים מקושרים נטענו:', data);

    // הצגת המודל עם הנתונים
    showLinkedItemsModal(data, itemType, itemId);

  } catch (error) {
    console.error('❌ שגיאה בטעינת נתונים מקושרים:', error);

    // הצגת הודעה למשתמש
    if (typeof window.showNotification === 'function') {
      window.showNotification('מציג נתונים לדוגמה - API בפיתוח', 'info');
    }

    // הצגת מודל עם נתונים לדוגמה (לפיתוח)
    showLinkedItemsModal(getMockLinkedData(itemType, itemId), itemType, itemId);
  }
}

/**
 * פונקציה להצגת מודל פרטים מקושרים
 * Show linked items modal with data
 * 
 * @param {Object} data - הנתונים להצגה
 * @param {string} itemType - סוג האלמנט
 * @param {string|number} itemId - מזהה האלמנט
 */
function showLinkedItemsModal(data, itemType, itemId) {
  console.log('🔄 הצגת מודל פרטים מקושרים:', { data, itemType, itemId });

  // יצירת תוכן המודל
  const modalContent = createLinkedItemsModalContent(data, itemType, itemId);

  // יצירת המודל
  const modal = createModal('linkedItemsModal', 'פרטים מקושרים', modalContent);

  // הצגת המודל
  if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    console.log('🚀 הצגת מודל Bootstrap');
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
  } else {
    console.log('⚠️ Bootstrap לא זמין, מציג fallback');
    // fallback למודל פשוט
    modal.style.display = 'block';
    modal.classList.add('show');
  }
}

/**
 * פונקציה ליצירת תוכן המודל
 * Create modal content for linked items
 * 
 * @param {Object} data - הנתונים להצגה
 * @param {string} itemType - סוג האלמנט
 * @param {string|number} itemId - מזהה האלמנט
 * @returns {string} HTML content
 */
function createLinkedItemsModalContent(data, itemType, itemId) {
  const itemTypeNames = {
    'trade': 'טרייד',
    'account': 'חשבון',
    'ticker': 'טיקר',
    'alert': 'התראה',
    'cash_flow': 'תזרים מזומנים',
    'note': 'הערה',
    'trade_plan': 'תוכנית טרייד',
    'execution': 'ביצוע'
  };

  const itemTypeName = itemTypeNames[itemType] || itemType;

  let content = `
    <div class="modal-header">
      <h5 class="modal-title">פרטים מקושרים - ${itemTypeName} ${itemId}</h5>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body">
      <!-- הודעת פיתוח -->
      <div class="development-notice">
        <div class="development-header">
          <h6>🚧 מערכת בפיתוח</h6>
          <p>מערכת הפרטים המקושרים נמצאת בפיתוח. להלן דוגמה של הנתונים שיוצגו:</p>
        </div>
      </div>
      
      <div class="linked-items-container">
        <div class="linked-items-section">
          <h6>🔗 ישויות בנות (Child Entities)</h6>
          <div class="linked-items-list" id="childEntitiesList">
            ${createLinkedItemsList(data.childEntities || [])}
          </div>
        </div>
        
        <div class="linked-items-section">
          <h6>📋 ישויות אם (Parent Entities)</h6>
          <div class="linked-items-list" id="parentEntitiesList">
            ${createLinkedItemsList(data.parentEntities || [])}
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>
      <button type="button" class="btn btn-primary" onclick="exportLinkedItemsData('${itemType}', ${itemId})">ייצא נתונים</button>
    </div>
  `;

  return content;
}

/**
 * פונקציה ליצירת רשימת אלמנטים מקושרים
 * Create linked items list HTML
 * 
 * @param {Array} items - רשימת האלמנטים
 * @returns {string} HTML content
 */
function createLinkedItemsList(items) {
  if (!items || items.length === 0) {
    return '<div class="no-linked-items">אין אלמנטים מקושרים</div>';
  }

  return items.map(item => `
    <div class="linked-item-card">
      <div class="linked-item-header">
        <span class="linked-item-type">${getItemTypeIcon(item.type)} ${getItemTypeDisplayName(item.type)}</span>
        <span class="linked-item-id">#${item.id}</span>
      </div>
      <div class="linked-item-content">
        <div class="linked-item-title">${item.title || item.name || `אלמנט ${item.id}`}</div>
        <div class="linked-item-details">
          ${createDetailedItemInfo(item)}
        </div>
        <div class="linked-item-actions">
          <button class="btn btn-sm btn-outline-primary" onclick="viewItemDetails('${item.type}', ${item.id})" title="צפייה בפרטים">
            👁️ צפייה
          </button>
          <button class="btn btn-sm btn-outline-secondary" onclick="editItem('${item.type}', ${item.id})" title="עריכה">
            ✏️ ערוך
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('${item.type}', ${item.id})" title="מחיקה">
            🗑️ מחק
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * פונקציה לקבלת אייקון לסוג אלמנט
 * Get icon for item type
 * 
 * @param {string} type - סוג האלמנט
 * @returns {string} אייקון
 */
function getItemTypeIcon(type) {
  const icons = {
    'trade': '📈',
    'account': '💰',
    'ticker': '📊',
    'alert': '🔔',
    'cash_flow': '💸',
    'note': '📝',
    'trade_plan': '📋',
    'execution': '⚡'
  };
  return icons[type] || '📄';
}

/**
 * פונקציה ליצירת מודל
 * Create modal element
 * 
 * @param {string} id - מזהה המודל
 * @param {string} title - כותרת המודל
 * @param {string} content - תוכן המודל
 * @returns {HTMLElement} אלמנט המודל
 */
function createModal(id, title, content) {
  // הסרת מודל קיים אם יש
  const existingModal = document.getElementById(id);
  if (existingModal) {
    existingModal.remove();
  }

  // יצירת המודל החדש עם מבנה Bootstrap נכון
  const modal = document.createElement('div');
  modal.id = id;
  modal.className = 'modal fade';
  modal.setAttribute('tabindex', '-1');
  modal.setAttribute('aria-labelledby', `${id}Label`);
  modal.setAttribute('aria-hidden', 'true');

  // הוספת מבנה Bootstrap נכון
  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        ${content}
      </div>
    </div>
  `;

  // הוספה לדף
  document.body.appendChild(modal);

  return modal;
}

/**
 * פונקציה ליצירת מידע מפורט על אלמנט
 * Create detailed item information
 * 
 * @param {Object} item - האלמנט
 * @returns {string} HTML עם פרטים מפורטים
 */
function createDetailedItemInfo(item) {
  console.log('🔄 יצירת פרטים מפורטים עבור:', item);
  let details = '';

  // הוספת תיאור כללי
  if (item.description || item.notes) {
    details += `<div class="item-description">${item.description || item.notes}</div>`;
  }

  // הוספת פרטים ספציפיים לפי סוג
  switch (item.type) {
    case 'trade':
      console.log('🔄 יצירת פרטי טרייד');
      details += createTradeDetails(item);
      break;
    case 'account':
      console.log('🔄 יצירת פרטי חשבון');
      details += createAccountDetails(item);
      break;
    case 'ticker':
      console.log('🔄 יצירת פרטי טיקר');
      details += createTickerDetails(item);
      break;
    case 'alert':
      console.log('🔄 יצירת פרטי התראה');
      details += createAlertDetails(item);
      break;
    case 'cash_flow':
      console.log('🔄 יצירת פרטי תזרים מזומנים');
      details += createCashFlowDetails(item);
      break;
    case 'note':
      console.log('🔄 יצירת פרטי הערה');
      details += createNoteDetails(item);
      break;
    case 'trade_plan':
      console.log('🔄 יצירת פרטי תוכנית טרייד');
      details += createTradePlanDetails(item);
      break;
    case 'execution':
      console.log('🔄 יצירת פרטי ביצוע');
      details += createExecutionDetails(item);
      break;
    default:
      console.log('🔄 יצירת פרטים כלליים');
      details += createGenericDetails(item);
  }

  console.log('🔄 פרטים סופיים:', details);
  return details;
}

/**
 * פונקציות ליצירת פרטים ספציפיים לכל סוג אלמנט
 */

function createTradeDetails(item) {
  return `
    <div class="item-details-grid">
      <div class="detail-item">
        <span class="detail-label">סטטוס:</span>
        <span class="detail-value status-${item.status || 'unknown'}">${item.status || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">סוג השקעה:</span>
        <span class="detail-value">${item.investment_type || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">צד:</span>
        <span class="detail-value">${item.side || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">רווח/הפסד:</span>
        <span class="detail-value ${item.total_pl >= 0 ? 'positive' : 'negative'}">${item.total_pl ? `$${item.total_pl.toFixed(2)}` : 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">תאריך יצירה:</span>
        <span class="detail-value">${item.created_at || 'לא מוגדר'}</span>
      </div>
    </div>
  `;
}

function createAccountDetails(item) {
  return `
    <div class="item-details-grid">
      <div class="detail-item">
        <span class="detail-label">מטבע:</span>
        <span class="detail-value">${item.currency || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">יתרה במזומן:</span>
        <span class="detail-value">${item.cash_balance ? `$${item.cash_balance.toFixed(2)}` : 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">ערך כולל:</span>
        <span class="detail-value">${item.total_value ? `$${item.total_value.toFixed(2)}` : 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">רווח/הפסד כולל:</span>
        <span class="detail-value ${item.total_pl >= 0 ? 'positive' : 'negative'}">${item.total_pl ? `$${item.total_pl.toFixed(2)}` : 'לא מוגדר'}</span>
      </div>
    </div>
  `;
}

function createTickerDetails(item) {
  return `
    <div class="item-details-grid">
      <div class="detail-item">
        <span class="detail-label">סוג:</span>
        <span class="detail-value">${item.type || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">מטבע:</span>
        <span class="detail-value">${item.currency || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">טריידים פעילים:</span>
        <span class="detail-value">${item.active_trades ? 'כן' : 'לא'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">תאריך עדכון:</span>
        <span class="detail-value">${item.updated_at || 'לא מוגדר'}</span>
      </div>
    </div>
  `;
}

function createAlertDetails(item) {
  return `
    <div class="item-details-grid">
      <div class="detail-item">
        <span class="detail-label">סטטוס:</span>
        <span class="detail-value status-${item.status || 'unknown'}">${item.status || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">סוג התראה:</span>
        <span class="detail-value">${item.alert_type || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">הופעלה:</span>
        <span class="detail-value">${item.is_triggered ? 'כן' : 'לא'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">תאריך יצירה:</span>
        <span class="detail-value">${item.created_at || 'לא מוגדר'}</span>
      </div>
    </div>
  `;
}

function createCashFlowDetails(item) {
  return `
    <div class="item-details-grid">
      <div class="detail-item">
        <span class="detail-label">סטטוס:</span>
        <span class="detail-value status-${item.status || 'unknown'}">${item.status || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">סוג:</span>
        <span class="detail-value">${item.flow_type || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">סכום:</span>
        <span class="detail-value ${item.amount >= 0 ? 'positive' : 'negative'}">${item.amount ? `$${item.amount.toFixed(2)}` : 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">תאריך:</span>
        <span class="detail-value">${item.flow_date || 'לא מוגדר'}</span>
      </div>
    </div>
  `;
}

function createNoteDetails(item) {
  return `
    <div class="item-details-grid">
      <div class="detail-item">
        <span class="detail-label">סטטוס:</span>
        <span class="detail-value status-${item.status || 'unknown'}">${item.status || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">סוג הערה:</span>
        <span class="detail-value">${item.note_type || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">תאריך יצירה:</span>
        <span class="detail-value">${item.created_at || 'לא מוגדר'}</span>
      </div>
    </div>
  `;
}

function createTradePlanDetails(item) {
  return `
    <div class="item-details-grid">
      <div class="detail-item">
        <span class="detail-label">סטטוס:</span>
        <span class="detail-value status-${item.status || 'unknown'}">${item.status || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">סוג השקעה:</span>
        <span class="detail-value">${item.investment_type || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">צד:</span>
        <span class="detail-value">${item.side || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">תאריך יצירה:</span>
        <span class="detail-value">${item.created_at || 'לא מוגדר'}</span>
      </div>
    </div>
  `;
}

function createExecutionDetails(item) {
  return `
    <div class="item-details-grid">
      <div class="detail-item">
        <span class="detail-label">סטטוס:</span>
        <span class="detail-value status-${item.status || 'unknown'}">${item.status || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">פעולה:</span>
        <span class="detail-value">${item.action || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">כמות:</span>
        <span class="detail-value">${item.quantity || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">מחיר:</span>
        <span class="detail-value">${item.price ? `$${item.price.toFixed(2)}` : 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">תאריך ביצוע:</span>
        <span class="detail-value">${item.execution_date || 'לא מוגדר'}</span>
      </div>
    </div>
  `;
}

function createGenericDetails(item) {
  return `
    <div class="item-details-grid">
      <div class="detail-item">
        <span class="detail-label">סטטוס:</span>
        <span class="detail-value status-${item.status || 'unknown'}">${item.status || 'לא מוגדר'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">תאריך יצירה:</span>
        <span class="detail-value">${item.created_at || 'לא מוגדר'}</span>
      </div>
    </div>
  `;
}

/**
 * פונקציה לקבלת נתונים לדוגמה (לפיתוח)
 * Get mock data for development
 * 
 * @param {string} itemType - סוג האלמנט
 * @param {string|number} itemId - מזהה האלמנט
 * @returns {Object} נתונים לדוגמה
 */
function getMockLinkedData(itemType, itemId) {
  console.log(`🎭 יצירת נתונים לדוגמה עבור ${itemType} ${itemId}`);

  const mockData = {
    childEntities: [
      {
        id: 1,
        type: 'execution',
        title: 'ביצוע קנייה AAPL',
        description: 'קניית 100 מניות AAPL במחיר $150',
        status: 'completed'
      },
      {
        id: 2,
        type: 'alert',
        title: 'התראה מחיר AAPL',
        description: 'התראה על מחיר $150',
        status: 'active'
      },
      {
        id: 3,
        type: 'note',
        title: 'הערה על הטרייד',
        description: 'טרייד ארוך טווח על Apple',
        status: 'active'
      }
    ],
    parentEntities: [
      {
        id: 1,
        type: 'account',
        title: 'חשבון ראשי',
        description: 'חשבון המסחר הראשי',
        status: 'active'
      },
      {
        id: 1,
        type: 'trade_plan',
        title: 'תוכנית AAPL',
        description: 'תוכנית מסחר על Apple לטווח ארוך',
        status: 'open'
      },
      {
        id: 1,
        type: 'ticker',
        title: 'AAPL - Apple Inc.',
        description: 'מניה של Apple Inc.',
        status: 'active'
      }
    ]
  };

  return mockData;
}

/**
 * פונקציה לייצוא נתונים מקושרים
 * Export linked items data
 * 
 * @param {string} itemType - סוג האלמנט
 * @param {string|number} itemId - מזהה האלמנט
 */
function exportLinkedItemsData(itemType, itemId) {
  console.log(`🔄 ייצוא נתונים מקושרים ל-${itemType} ${itemId}`);

  // כאן תהיה לוגיקת הייצוא
  if (typeof window.showNotification === 'function') {
    window.showNotification('ייצוא נתונים תפותח בקרוב', 'info');
  }
}

/**
 * פונקציה לצפייה בפרטי אלמנט
 * View item details
 * 
 * @param {string} type - סוג האלמנט
 * @param {string|number} id - מזהה האלמנט
 */
function viewItemDetails(type, id) {
  console.log(`🔄 צפייה בפרטי ${type} ${id}`);

  // ניווט לדף המתאים
  const pageMap = {
    'trade': '/trades',
    'account': '/accounts',
    'ticker': '/tickers',
    'alert': '/alerts',
    'cash_flow': '/cash_flows',
    'note': '/notes',
    'trade_plan': '/trade_plans',
    'execution': '/executions'
  };

  const targetPage = pageMap[type];
  if (targetPage) {
    window.location.href = targetPage;
  }
}

/**
 * פונקציה לעריכת אלמנט
 * Edit item
 * 
 * @param {string} type - סוג האלמנט
 * @param {string|number} id - מזהה האלמנט
 */
function editItem(type, id) {
  console.log(`🔄 עריכת ${type} ${id}`);

  // קריאה לפונקציית העריכה המתאימה
  const editFunctions = {
    'trade': 'editTradeRecord',
    'account': 'editAccount',
    'ticker': 'editTicker',
    'alert': 'editAlert',
    'cash_flow': 'editCashFlow',
    'note': 'editNote',
    'trade_plan': 'editTradePlan',
    'execution': 'editExecution'
  };

  const editFunction = editFunctions[type];
  if (editFunction && typeof window[editFunction] === 'function') {
    window[editFunction](id);
  }
}

/**
 * פונקציה למחיקת אלמנט
 * Delete item
 * 
 * @param {string} type - סוג האלמנט
 * @param {string|number} id - מזהה האלמנט
 */
function deleteItem(type, id) {
  console.log(`🔄 מחיקת ${type} ${id}`);

  // קריאה לפונקציית המחיקה המתאימה
  const deleteFunctions = {
    'trade': 'deleteTradeRecord',
    'account': 'deleteAccount',
    'ticker': 'deleteTicker',
    'alert': 'deleteAlert',
    'cash_flow': 'deleteCashFlow',
    'note': 'deleteNote',
    'trade_plan': 'deleteTradePlan',
    'execution': 'deleteExecution'
  };

  const deleteFunction = deleteFunctions[type];
  if (deleteFunction && typeof window[deleteFunction] === 'function') {
    window[deleteFunction](id);
  }
}

// חשיפת פונקציות גלובליות
window.viewLinkedItems = viewLinkedItems;
window.loadLinkedItemsData = loadLinkedItemsData;
window.showLinkedItemsModal = showLinkedItemsModal;
window.createLinkedItemsModalContent = createLinkedItemsModalContent;
window.exportLinkedItemsData = exportLinkedItemsData;
window.createDetailedItemInfo = createDetailedItemInfo;
window.getItemTypeIcon = getItemTypeIcon;
window.getItemTypeDisplayName = getItemTypeDisplayName;
window.viewItemDetails = viewItemDetails;
window.editItem = editItem;
window.deleteItem = deleteItem;

/**
 * פונקציה לאתחול פילטרים לדף
 * Initialize page filters
 * 
 * @param {string} pageName - שם הדף
 */
function initializePageFilters(pageName) {
  console.log(`🔄 אתחול פילטרים לדף: ${pageName}`);

  // כאן תהיה לוגיקת אתחול הפילטרים
  // כרגע זו פונקציה ריקה כי הפילטרים מטופלים על ידי header-system.js

  console.log(`✅ פילטרים לאתחול לדף ${pageName} הושלמו`);
}

// חשיפת פונקציית אתחול הפילטרים
window.initializePageFilters = initializePageFilters;

/**
 * פונקציה להגדרת כותרות למיון
 * Setup sortable headers for tables
 */
function setupSortableHeaders() {
  console.log('🔄 הגדרת כותרות למיון');

  // כאן תהיה לוגיקת הגדרת כותרות למיון
  // כרגע זו פונקציה ריקה כי המיון מטופל על ידי מערכת אחרת

  console.log('✅ כותרות למיון הוגדרו');
}

// חשיפת פונקציית הגדרת כותרות למיון
window.setupSortableHeaders = setupSortableHeaders;

/**
 * פונקציה לעדכון סטטיסטיקות הטבלה
 * Update table statistics
 */
function updateTableStats() {
  console.log('🔄 עדכון סטטיסטיקות הטבלה');

  // כאן תהיה לוגיקת עדכון הסטטיסטיקות
  // כרגע זו פונקציה ריקה

  console.log('✅ סטטיסטיקות הטבלה עודכנו');
}

// חשיפת פונקציית עדכון סטטיסטיקות
window.updateTableStats = updateTableStats;

/**
 * פונקציה לדיבוג פילטרים שמורים
 * Debug saved filters
 * 
 * @param {string} pageName - שם הדף
 */
function debugSavedFilters(pageName) {
  console.log(`🔄 דיבוג פילטרים שמורים עבור דף: ${pageName}`);

  // בדיקת פילטרים שמורים ב-localStorage
  const savedStatuses = localStorage.getItem(`${pageName}FilterStatuses`);
  const savedDateRange = localStorage.getItem(`${pageName}FilterDateRange`);
  const savedSearch = localStorage.getItem(`${pageName}FilterSearch`);

  console.log(`📊 פילטרים שמורים עבור ${pageName}:`, {
    statuses: savedStatuses,
    dateRange: savedDateRange,
    search: savedSearch
  });
}

// חשיפת פונקציית דיבוג פילטרים
window.debugSavedFilters = debugSavedFilters;

/**
 * פונקציה לשחזור מצב סקשן עיצובים (לא רלוונטי לדף המעקב)
 * Restore designs section state (not relevant for trades page)
 */
function restoreDesignsSectionState() {
  console.log('🔄 שחזור מצב סקשן עיצובים (לא רלוונטי לדף המעקב)');
  // פונקציה ריקה - לא רלוונטית לדף המעקב
}

// חשיפת פונקציית שחזור מצב עיצובים
window.restoreDesignsSectionState = restoreDesignsSectionState;
