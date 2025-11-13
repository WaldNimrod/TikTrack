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
 * Filter by related object type using unified table pipeline
 * @function filterByRelatedObjectType
 * @param {string} type - Object type: 'all', 'account', 'trade', 'trade_plan', 'ticker'
 * @param {Array} data - Data array to filter (legacy fallback)
 * @param {Function} updateFunction - Function to update table UI
 * @param {string} countSelector - Selector for count element (optional)
 * @param {string} itemName - Item name (e.g., "alerts", "notes")
 * @param {Object} [options] - Additional options
 * @param {string} [options.tableId] - Table DOM id
 * @param {string} [options.tableType] - Unified table type
 * @param {string} [options.entityName] - Entity name for logging
 * @param {boolean} [options.mergeWithActiveFilters=true] - Merge with existing registry filters
 * @param {string} [options.logSource] - Logger source tag
 * @returns {Array} Filtered dataset
 */
function filterByRelatedObjectType(type, data, updateFunction, countSelector, itemName, options = {}) {
  const normalizedType = typeof type === 'string' ? type.trim() : '';
  const effectiveType = normalizedType || 'all';

  const {
    tableId = null,
    tableType: explicitTableType = null,
    entityName = null,
    mergeWithActiveFilters = true,
    logSource = 'related-object-filters',
  } = options || {};

  // עדכון מצב הכפתורים
  const buttons = document.querySelectorAll('[data-type]');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-type') === effectiveType) {
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

  const resolvedTableType =
    explicitTableType ||
    (tableId && window.TableDataRegistry?.resolveTableType?.(tableId)) ||
    entityName ||
    null;

  const filterPayload =
    effectiveType === 'all'
      ? { custom: { relatedType: 'all' } }
      : { custom: { relatedType: effectiveType } };

  let filteredData = [];
  let appliedViaUnified = false;
  const canUseUnifiedFilter = Boolean(window.UnifiedTableSystem?.filter?.apply) && Boolean(resolvedTableType);

  if (canUseUnifiedFilter) {
    try {
      filteredData =
        window.UnifiedTableSystem.filter.apply(resolvedTableType, filterPayload, undefined, {
          mergeWithActiveFilters,
          tableIdOverride: tableId,
        }) || [];
      appliedViaUnified = true;
    } catch (error) {
      if (window.Logger) {
        window.Logger.warn('filterByRelatedObjectType: unified filter failed, falling back to local filtering', {
          entityName,
          tableId,
          tableType: resolvedTableType,
          error: error?.message || error,
          page: logSource,
        });
      } else {
        console.warn('filterByRelatedObjectType: unified filter failed, fallback to legacy mode', error);
      }
      filteredData = legacyFilterRelatedObjects(effectiveType, data);
    }
  } else {
    filteredData = legacyFilterRelatedObjects(effectiveType, data);
  }

  if (!appliedViaUnified && window.TableDataRegistry && resolvedTableType) {
    const filterContext =
      effectiveType === 'all'
        ? {
            status: [],
            type: [],
            account: [],
            search: '',
            dateRange: null,
            custom: {},
          }
        : {
            status: [],
            type: [],
            account: [],
            search: '',
            dateRange: null,
            custom: { relatedType: effectiveType },
          };

    window.TableDataRegistry.setFilteredData(resolvedTableType, Array.isArray(filteredData) ? filteredData : [], {
      tableId,
      skipPageReset: false,
      filterContext,
      clearFilters: effectiveType === 'all',
    });
  }

  const renderCallback = (rows) => {
    if (typeof updateFunction !== 'function') {
      return null;
    }
    try {
      const result = updateFunction(rows);
      if (result && typeof result.then === 'function') {
        result.catch((error) => {
          if (window.Logger) {
            window.Logger.warn('filterByRelatedObjectType: async updateFunction failed', {
              entityName,
              error: error?.message || error,
              page: logSource,
            });
          } else {
            console.warn('filterByRelatedObjectType: async updateFunction failed', error);
          }
        });
      }
      return result;
    } catch (error) {
      if (window.Logger) {
        window.Logger.warn('filterByRelatedObjectType: updateFunction threw an error', {
          entityName,
          error: error?.message || error,
          page: logSource,
        });
      } else {
        console.warn('filterByRelatedObjectType: updateFunction threw an error', error);
      }
      return null;
    }
  };

  if (Array.isArray(filteredData)) {
    if (tableId && typeof window.updateTableWithPagination === 'function' && resolvedTableType) {
      window.updateTableWithPagination({
        tableId,
        tableType: resolvedTableType,
        data: filteredData,
        render: async (pageData) => renderCallback(pageData),
        skipRegistry: true,
      });
    } else {
      renderCallback(filteredData);
    }
  }

  if (typeof countSelector === 'string' && countSelector.trim()) {
    const countElement = document.querySelector(countSelector);
    if (countElement) {
      const label = typeof itemName === 'string' ? ` ${itemName}` : '';
      countElement.textContent = `${Array.isArray(filteredData) ? filteredData.length : 0}${label}`;
    }
  }

  return Array.isArray(filteredData) ? filteredData : [];
}

/**
 * Legacy fallback filtering when unified table system is unavailable
 * @param {string} type - Related object type
 * @param {Array} data - Dataset to filter
 * @returns {Array} Filtered dataset
 */
function legacyFilterRelatedObjects(type, data) {
  const sourceArray = Array.isArray(data) ? data : [];
  if (!Array.isArray(sourceArray) || sourceArray.length === 0 || type === 'all') {
    return [...sourceArray];
  }

  const normalized = String(type || '').toLowerCase();
  const canonicalType = normalized === 'account' ? 'trading_account' : normalized;

  const typeIdMapping = {
    trading_account: 1,
    trade: 2,
    trade_plan: 3,
    ticker: 4,
  };

  const targetTypeId = typeIdMapping[canonicalType] ?? null;

  return sourceArray.filter((item) => {
    if (!item || typeof item !== 'object') {
      return false;
    }
    if (targetTypeId !== null && Number(item.related_type_id) === targetTypeId) {
      return true;
    }
    const relatedType = String(
      item.related_type ||
      item.relatedType ||
      item.related_object_type ||
      item.type ||
      ''
    ).toLowerCase();

    if (!relatedType) {
      return false;
    }

    if (relatedType === canonicalType) {
      return true;
    }

    if (canonicalType === 'trading_account' && relatedType === 'account') {
      return true;
    }

    return false;
  });
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
    {
      tableId: 'alertsTable',
      tableType: 'alerts',
      entityName: 'alerts',
      mergeWithActiveFilters: true,
      logSource: 'alerts-related-filter',
    }
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
    {
      tableId: 'notesTable',
      tableType: 'notes',
      entityName: 'notes',
      mergeWithActiveFilters: true,
      logSource: 'notes-related-filter',
    }
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
function createRelatedObjectFilter(entityName, dataVarName, updateFunctionName, itemName, countSelector = '.table-count', options = {}) {
  // יצירת שם פונקציה לפי התקן
  const filterFunctionName = `filter${entityName.charAt(0).toUpperCase() + entityName.slice(1)}ByRelatedObjectType`;
  const tableIdOption = Object.prototype.hasOwnProperty.call(options, 'tableId') ? options.tableId : `${entityName}Table`;
  const tableTypeOption = Object.prototype.hasOwnProperty.call(options, 'tableType') ? options.tableType : entityName;
  const mergeWithActiveFiltersOption = Object.prototype.hasOwnProperty.call(options, 'mergeWithActiveFilters')
    ? options.mergeWithActiveFilters
    : true;
  const logSourceOption = options.logSource || `related-object-filters:${entityName}`;

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
      itemName,
      {
        tableId: tableIdOption,
        tableType: tableTypeOption,
        entityName,
        mergeWithActiveFilters: mergeWithActiveFiltersOption,
        logSource: logSourceOption,
      }
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
      itemName: 'התראות',
      tableId: 'alertsTable',
      tableType: 'alerts',
      countSelector: '.table-count',
      logSource: 'alerts-related-filter',
    },
    {
      entityName: 'notes',
      dataVarName: 'notesData', 
      updateFunctionName: 'updateNotesTable',
      itemName: 'הערות',
      tableId: 'notesTable',
      tableType: 'notes',
      countSelector: '.table-count',
      logSource: 'notes-related-filter',
    }
    // נוכל להוסיף עוד יישויות כאן בקלות בעתיד
  ];

  // יצירת פילטרים לכל ההגדרות
  filterConfigs.forEach(config => {
    createRelatedObjectFilter(
      config.entityName,
      config.dataVarName,
      config.updateFunctionName,
      config.itemName,
      config.countSelector || '.table-count',
      {
        tableId: config.tableId,
        tableType: config.tableType,
        mergeWithActiveFilters: config.mergeWithActiveFilters,
        logSource: config.logSource,
      }
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
