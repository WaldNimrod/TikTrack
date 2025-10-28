/**
 * Related Object Filters - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains a centralized filtering system for filtering items by related object type.
 * Supports all entities with `related_type_id` field and filter buttons with `data-type` attribute.
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/RELATED_OBJECT_FILTERS_SYSTEM.md
 * 
 * Author: TikTrack Development Team
 * Version: 2.0
 * Last Updated: 2025-01-27
 */

/**
 * Filter by related object type
 * @function filterByRelatedObjectType
 * @param {string} type - Object type: 'all', 'account', 'trade', 'trade_plan', 'ticker'
 * @param {Array} data - Data array to filter
 * @param {Function} updateFunction - Function to update table
 * @param {string} countSelector - Selector for count element
 * @param {string} itemName - Item name (e.g., "alerts", "notes")
 * @returns {void}
 */
function filterByRelatedObjectType(type, data, updateFunction, countSelector, itemName) {
  // פילטר לפי סוג אובייקט מקושר - סוג: ${type}, כמות נתונים: ${data.length}

  // עדכון מצב הכפתורים
  const buttons = document.querySelectorAll('[data-type]');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-type') === type) {
      btn.classList.add('active');
      btn.classList.remove('btn');
      btn.style.backgroundColor = 'white';
      const colors = window.getTableColors ? window.getTableColors() : { positive: '#28a745' };
      btn.style.color = colors.positive;
      btn.style.borderColor = colors.positive;
    } else {
      btn.classList.remove('active');
      btn.classList.add('btn');
      btn.style.backgroundColor = '';
      btn.style.color = '';
      btn.style.borderColor = '';
    }
  });

  // מיפוי סוגים ל-ID
  const typeMapping = {
    'all': null,
    'account': 1,
    'trade': 2,
    'trade_plan': 3,
    'ticker': 4,
  };

  const targetTypeId = typeMapping[type];

  // פילטור הנתונים
  let filteredData = data;

  if (type !== 'all') {
    filteredData = data.filter(item => item.related_type_id === targetTypeId);
  }

  // עדכון הטבלה עם הנתונים המסוננים
  if (typeof updateFunction === 'function') {
    updateFunction(filteredData);
  }

  // עדכון ספירת רשומות
  const countElement = document.querySelector(countSelector);
  if (countElement) {
    countElement.textContent = `${filteredData.length} ${itemName}`;
  }

  // סוננו ${itemName} לפי סוג '${type}': נמצאו ${filteredData.length} פריטים

  return filteredData;
}

/**
 * Filter alerts by related object type
 * @function filterAlertsByRelatedObjectType
 * @param {string} type - Object type to filter by
 * @returns {void}
 */
function filterAlertsByRelatedObjectType(type) {
  if (typeof window.alertsData === 'undefined') {
    // נתוני התראות לא זמינים
    return;
  }

  return filterByRelatedObjectType(
    type,
    window.alertsData,
    window.updateAlertsTable,
    '.table-count',
    'התראות',
  );
}

/**
 * Filter notes by related object type
 * @function filterNotesByRelatedObjectType
 * @param {string} type - Object type to filter by
 * @returns {void}
 */
function filterNotesByRelatedObjectType(type) {
  if (typeof window.notesData === 'undefined') {
    // נתוני הערות לא זמינים
    return;
  }

  return filterByRelatedObjectType(
    type,
    window.notesData,
    window.updateNotesTable,
    '.table-count',
    'הערות',
  );
}

/**
 * Create related object filter
 * @function createRelatedObjectFilter
 * @param {string} entityName - Entity name
 * @param {string} dataVarName - Data variable name
 * @param {string} updateFunctionName - Update function name
 * @param {string} itemName - Item name
 * @param {string} countSelector - Count selector
 * @returns {void}
 */
function createRelatedObjectFilter(entityName, dataVarName, updateFunctionName, itemName, countSelector = '.table-count') {
  // יצירת שם פונקציה לפי התקן
  const filterFunctionName = `filter${entityName.charAt(0).toUpperCase() + entityName.slice(1)}ByRelatedObjectType`;
  
  // הגדרת הפונקציה באופן דינמי
  window[filterFunctionName] = function(type) {
    if (typeof window[dataVarName] === 'undefined') {
      console.warn(`⚠️ נתוני ${itemName} לא זמינים לסינון`);
      return;
    }

    return filterByRelatedObjectType(
      type,
      window[dataVarName],
      window[updateFunctionName],
      countSelector,
      itemName
    );
  };

  console.log(`✅ נוצר פילטר לפי סוג אובייקט מקושר עבור ${itemName}: ${filterFunctionName}`);
  return window[filterFunctionName];
}

/**
 * Initialize related object filters
 * @function initializeRelatedObjectFilters
 * @returns {void}
 */
function initializeRelatedObjectFilters() {
  // הגדרת תצורות הפילטרים לכל יישות
  const filterConfigs = [
    {
      entityName: 'alerts',
      dataVarName: 'alertsData',
      updateFunctionName: 'updateAlertsTable',
      itemName: 'התראות'
    },
    {
      entityName: 'notes',
      dataVarName: 'notesData', 
      updateFunctionName: 'updateNotesTable',
      itemName: 'הערות'
    }
    // נוכל להוסיף עוד יישויות כאן בקלות בעתיד
  ];

  // יצירת פילטרים לכל ההגדרות
  filterConfigs.forEach(config => {
    createRelatedObjectFilter(
      config.entityName,
      config.dataVarName,
      config.updateFunctionName,
      config.itemName
    );
  });

  console.log('🚀 מערכת הפילטרים לפי סוג אובייקט מקושר אותחלה');
}

// ===== GLOBAL EXPORTS =====
window.filterByRelatedObjectType = filterByRelatedObjectType;
window.filterAlertsByRelatedObjectType = filterAlertsByRelatedObjectType;
window.filterNotesByRelatedObjectType = filterNotesByRelatedObjectType;
window.createRelatedObjectFilter = createRelatedObjectFilter;
window.initializeRelatedObjectFilters = initializeRelatedObjectFilters;
