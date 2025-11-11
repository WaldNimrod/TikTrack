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

// ===== ENTITY TYPE FILTER BUTTONS GENERATION SYSTEM =====

/**
 * Generate filter buttons HTML for entity type filtering
 * Centralized function used by both alerts page and entity details modal
 * 
 * @function generateEntityTypeFilterButtons
 * @param {Array<string>} entityTypes - Array of entity types to show (e.g., ['account', 'trade', 'trade_plan', 'ticker'])
 * @param {Object} options - Configuration options
 * @param {string} options.filterFunctionName - Function name to call (e.g., 'filterAlertsByRelatedObjectType' or 'window.filterLinkedItemsByType')
 * @param {string} options.tableId - Optional table ID for linked items filtering
 * @param {string} options.containerId - Optional container ID for button IDs
 * @param {boolean} options.useDataOnclick - Use data-onclick instead of onclick (default: false for alerts, true for linked items)
 * @param {boolean} options.useTooltips - Add data-tooltip attributes (default: false for alerts, true for linked items)
 * @param {number} options.iconSize - Icon size in pixels (default: 14 for alerts, 20 for linked items)
 * @returns {string} HTML string for all filter buttons
 */
function generateEntityTypeFilterButtons(entityTypes, options = {}) {
  if (!Array.isArray(entityTypes) || entityTypes.length === 0) {
    return '';
  }
  
  return entityTypes.map(entityType => 
    generateEntityTypeFilterButton(entityType, {
      ...options,
      entityType,
    })
  ).join('');
}

/**
 * Generate single filter button HTML with icon
 * 
 * @function generateEntityTypeFilterButton
 * @param {string} entityType - Entity type (e.g., 'account', 'trade', 'trade_plan', 'ticker')
 * @param {Object} options - Configuration options (same as generateEntityTypeFilterButtons)
 * @returns {string} HTML string for filter button
 */
function generateEntityTypeFilterButton(entityType, options = {}) {
  const {
    filterFunctionName = 'filterAlertsByRelatedObjectType',
    tableId = null,
    containerId = null,
    useDataOnclick = false,
    useTooltips = false,
    iconSize = 14,
    interactionMode = (useDataOnclick ? 'data-onclick' : 'onclick'),
    buttonClassName = 'btn btn-sm btn-outline-primary filter-icon-btn',
    iconClassName = useTooltips ? 'filter-icon' : '',
    showLabel = false,
    labelClassName = 'filter-icon-label',
    disableInlineStyles = false,
    includeDataTypeAttribute = true,
    additionalAttributes = '',
    getDataOnclickExpression = null,
    getOnclickExpression = null,
  } = options;

  // Get icon path from LinkedItemsService or fallback
  const iconPath = (window.LinkedItemsService && window.LinkedItemsService.getLinkedItemIcon)
    ? window.LinkedItemsService.getLinkedItemIcon(entityType)
    : '/trading-ui/images/icons/home.svg';
  
  // Get entity label from LinkedItemsService or fallback
  const entityLabel = (window.LinkedItemsService && window.LinkedItemsService.getEntityLabel)
    ? window.LinkedItemsService.getEntityLabel(entityType)
    : ((window.getEntityLabel && typeof window.getEntityLabel === 'function')
      ? window.getEntityLabel(entityType)
      : entityType);
  
  // Generate onclick or data-onclick value
  let onclickValue = '';
  let dataOnclickValue = '';

  if (interactionMode === 'data-onclick') {
    if (typeof getDataOnclickExpression === 'function') {
      dataOnclickValue = getDataOnclickExpression(entityType, { filterFunctionName, tableId, containerId });
    } else if (tableId) {
      dataOnclickValue = `window.filterLinkedItemsByType('${tableId}', '${entityType}')`;
    } else {
      dataOnclickValue = `${filterFunctionName}('${entityType}')`;
    }
  } else if (interactionMode === 'onclick') {
    if (typeof getOnclickExpression === 'function') {
      onclickValue = getOnclickExpression(entityType, { filterFunctionName, tableId, containerId });
    } else {
      onclickValue = `${filterFunctionName}('${entityType}')`;
    }
  }
  
  // Generate button ID if containerId provided
  const buttonId = containerId ? `filterBtn_${containerId}_${entityType}` : '';
  const idAttr = buttonId ? `id="${buttonId}"` : '';
  
  // Generate tooltip attributes if needed
  const tooltipAttrs = useTooltips 
    ? `data-tooltip="סינון לפי ${entityLabel}" data-tooltip-placement="top" data-tooltip-trigger="hover"`
    : '';
  
  // Generate onclick or data-onclick attribute
  const onclickAttr = (interactionMode === 'onclick' && onclickValue) ? `onclick="${onclickValue}"` : '';
  const dataOnclickAttr = (interactionMode === 'data-onclick' && dataOnclickValue) ? `data-onclick="${dataOnclickValue}"` : '';
  
  const dataTypeAttr = includeDataTypeAttribute ? `data-type="${entityType}"` : '';
  const styleAttr = disableInlineStyles ? '' : 'style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;"';
  const iconStyleAttr = disableInlineStyles ? '' : `style="width: ${iconSize}px; height: ${iconSize}px;"`;
  const labelHtml = showLabel ? `<span class="${labelClassName}">${entityLabel}</span>` : '';
  
  // Generate button HTML
  return `
    <button 
      type="button"
      class="${buttonClassName}"
      ${idAttr}
      ${dataTypeAttr}
      ${onclickAttr}
      ${dataOnclickAttr}
      ${tooltipAttrs}
      title="${entityLabel}"
      ${styleAttr}
      ${additionalAttributes}>
      <img src="${iconPath}" alt="${entityLabel}" ${iconClassName ? `class="${iconClassName}"` : ''} ${iconStyleAttr}>
      ${labelHtml}
    </button>
  `;
}

/**
 * Generate "All" filter button HTML
 * 
 * @function generateAllFilterButton
 * @param {Object} options - Configuration options
 * @param {string} options.filterFunctionName - Function name to call
 * @param {string} options.tableId - Optional table ID for linked items filtering
 * @param {boolean} options.useOnclick - Use onclick instead of data-onclick (default: true for alerts)
 * @returns {string} HTML string for "All" button
 */
function generateAllFilterButton(options = {}) {
  const {
    filterFunctionName = 'filterAlertsByRelatedObjectType',
    tableId = null,
    useOnclick = true,
    interactionMode = undefined,
    buttonClassName = 'btn btn-sm active',
    disableInlineStyles = false,
    label = 'הכל',
    additionalAttributes = '',
    getDataOnclickExpression = null,
    getOnclickExpression = null,
  } = options;
  
  // Generate onclick or data-onclick value
  let onclickValue = '';
  let dataOnclickValue = '';

  const resolvedInteraction = interactionMode
    ? interactionMode
    : (useOnclick === false ? 'data-onclick' : 'onclick');

  if (resolvedInteraction === 'data-onclick') {
    if (typeof getDataOnclickExpression === 'function') {
      dataOnclickValue = getDataOnclickExpression('all', { filterFunctionName, tableId });
    } else if (tableId) {
      dataOnclickValue = `window.filterLinkedItemsByType('${tableId}', 'all')`;
    } else {
      dataOnclickValue = `${filterFunctionName}('all')`;
    }
  } else if (resolvedInteraction === 'onclick') {
    if (typeof getOnclickExpression === 'function') {
      onclickValue = getOnclickExpression('all', { filterFunctionName, tableId });
    } else {
      onclickValue = `${filterFunctionName}('all')`;
    }
  } else {
    onclickValue = '';
    dataOnclickValue = '';
  }
  
  const colors = window.getTableColors ? window.getTableColors() : { positive: '#28a745' };
  const styleAttr = disableInlineStyles
    ? ''
    : `style="background-color: white; color: ${colors.positive}; border-color: ${colors.positive};"`;
  
  const onclickAttr = (resolvedInteraction === 'onclick' && onclickValue) ? `onclick="${onclickValue}"` : '';
  const dataOnclickAttr = (resolvedInteraction === 'data-onclick' && dataOnclickValue) ? `data-onclick="${dataOnclickValue}"` : '';
  
  return `
    <button 
      type="button"
      class="${buttonClassName}" 
      ${onclickAttr}
      ${dataOnclickAttr}
      data-type="all" 
      title="הצג הכל"
      ${styleAttr}
      ${additionalAttributes}>
      ${label}
    </button>
  `;
}

// ===== GLOBAL EXPORTS =====
window.filterByRelatedObjectType = filterByRelatedObjectType;
window.filterAlertsByRelatedObjectType = filterAlertsByRelatedObjectType;
window.filterNotesByRelatedObjectType = filterNotesByRelatedObjectType;
window.createRelatedObjectFilter = createRelatedObjectFilter;
window.initializeRelatedObjectFilters = initializeRelatedObjectFilters;

// New centralized filter button generation functions
window.generateEntityTypeFilterButtons = generateEntityTypeFilterButtons;
window.generateEntityTypeFilterButton = generateEntityTypeFilterButton;
window.generateAllFilterButton = generateAllFilterButton;
