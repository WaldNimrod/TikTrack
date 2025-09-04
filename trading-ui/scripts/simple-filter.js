/**
 * Simple Filter System - TikTrack
 * ================================
 *
 * מערכת פילטור פשוטה לפרויקט TikTrack
 *
 * קובץ זה מכיל פונקציות פילטור בסיסיות:
 * 1. SEARCH FILTERS - פילטרי חיפוש טקסט פשוטים
 * 2. BASIC FILTERS - פילטרים בסיסיים לטבלאות
 * 3. QUICK FILTERS - פילטרים מהירים וקלים לשימוש
 *
 * קובץ: trading-ui/scripts/simple-filter.js
 * גרסה: 1.0
 * תאריך יצירה: ספטמבר 2025
 *
 * הפרדה מ-filter-system.js:
 * - filter-system.js: מערכת פילטור מתקדמת וחכמה
 * - simple-filter.js: פילטרים פשוטים ובסיסיים
 *
 * תלויות:
 * - main.js (פונקציות גלובליות)
 * - table-mappings.js (מיפוי עמודות)
 *
 * דוקומנטציה מפורטת: documentation/frontend/JAVASCRIPT_ARCHITECTURE.md
 */

// ===== SEARCH FILTER FUNCTIONS =====

/**
 * Apply simple text search filter
 * SIMPLE FILTER - Basic text search across table data
 *
 * @param {Array} data - Array of data objects to filter
 * @param {string} searchTerm - Search term to filter by
 * @param {Array} searchFields - Array of field names to search in
 * @returns {Array} Filtered data array
 */
function applySimpleTextFilter(data, searchTerm, searchFields = []) {
  if (!searchTerm || searchTerm.trim() === '') {
    return data;
  }

  const searchLower = searchTerm.toLowerCase().trim();

  return data.filter(item => {
    // If specific fields provided, search only in those
    if (searchFields.length > 0) {
      return searchFields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(searchLower);
      });
    }

    // Otherwise search in all string fields
    return Object.values(item).some(value => {
      return value && value.toString().toLowerCase().includes(searchLower);
    });
  });
}

/**
 * Apply simple status filter
 * SIMPLE FILTER - Basic status filtering
 *
 * @param {Array} data - Array of data objects to filter
 * @param {Array} selectedStatuses - Array of status values to filter by
 * @param {string} statusField - Name of status field (default: 'status')
 * @returns {Array} Filtered data array
 */
function applySimpleStatusFilter(data, selectedStatuses, statusField = 'status') {
  if (!selectedStatuses || selectedStatuses.length === 0) {
    return data;
  }

  return data.filter(item => {
    return selectedStatuses.includes(item[statusField]);
  });
}

/**
 * Apply simple date range filter
 * SIMPLE FILTER - Basic date range filtering
 *
 * @param {Array} data - Array of data objects to filter
 * @param {string} startDate - Start date (YYYY-MM-DD format)
 * @param {string} endDate - End date (YYYY-MM-DD format)
 * @param {string} dateField - Name of date field (default: 'date')
 * @returns {Array} Filtered data array
 */
function applySimpleDateRangeFilter(data, startDate, endDate, dateField = 'date') {
  if (!startDate && !endDate) {
    return data;
  }

  return data.filter(item => {
    const itemDate = item[dateField];
    if (!itemDate) return false;

    const itemDateObj = new Date(itemDate);
    const startDateObj = startDate ? new Date(startDate) : null;
    const endDateObj = endDate ? new Date(endDate) : null;

    if (startDateObj && itemDateObj < startDateObj) return false;
    if (endDateObj && itemDateObj > endDateObj) return false;

    return true;
  });
}

// ===== COMBINED FILTER FUNCTIONS =====

/**
 * Apply multiple simple filters
 * SIMPLE FILTER - Combine multiple basic filters
 *
 * @param {Array} data - Array of data objects to filter
 * @param {Object} filters - Object containing filter criteria
 * @returns {Array} Filtered data array
 */
function applySimpleFilters(data, filters = {}) {
  let filteredData = data;

  // Apply text search filter
  if (filters.searchTerm && filters.searchFields) {
    filteredData = applySimpleTextFilter(filteredData, filters.searchTerm, filters.searchFields);
  }

  // Apply status filter
  if (filters.selectedStatuses) {
    filteredData = applySimpleStatusFilter(filteredData, filters.selectedStatuses, filters.statusField);
  }

  // Apply date range filter
  if (filters.startDate || filters.endDate) {
    filteredData = applySimpleDateRangeFilter(
      filteredData,
      filters.startDate,
      filters.endDate,
      filters.dateField
    );
  }

  return filteredData;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Reset all simple filters
 * SIMPLE FILTER - Reset all filter inputs to default values
 *
 * @param {string} containerId - ID of container with filter inputs
 */
function resetSimpleFilters(containerId = 'filter-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Reset text inputs
  const textInputs = container.querySelectorAll('input[type="text"], input[type="search"]');
  textInputs.forEach(input => {
    input.value = '';
  });

  // Reset select elements
  const selectElements = container.querySelectorAll('select');
  selectElements.forEach(select => {
    select.selectedIndex = 0;
  });

  // Reset checkboxes
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
  });

  // Reset date inputs
  const dateInputs = container.querySelectorAll('input[type="date"]');
  dateInputs.forEach(input => {
    input.value = '';
  });
}

/**
 * Get filter values from form
 * SIMPLE FILTER - Extract filter values from form elements
 *
 * @param {string} formId - ID of form containing filter inputs
 * @returns {Object} Object containing filter values
 */
function getSimpleFilterValues(formId) {
  const form = document.getElementById(formId);
  if (!form) return {};

  const filters = {};

  // Get search term
  const searchInput = form.querySelector('[data-filter="search"]');
  if (searchInput) {
    filters.searchTerm = searchInput.value.trim();
  }

  // Get selected statuses
  const statusCheckboxes = form.querySelectorAll('[data-filter="status"]:checked');
  if (statusCheckboxes.length > 0) {
    filters.selectedStatuses = Array.from(statusCheckboxes).map(cb => cb.value);
  }

  // Get date range
  const startDateInput = form.querySelector('[data-filter="start-date"]');
  const endDateInput = form.querySelector('[data-filter="end-date"]');
  if (startDateInput) filters.startDate = startDateInput.value;
  if (endDateInput) filters.endDate = endDateInput.value;

  return filters;
}

// ===== EXPORT TO GLOBAL SCOPE =====

// Export SIMPLE FILTER functions to global scope
window.applySimpleTextFilter = applySimpleTextFilter;
window.applySimpleStatusFilter = applySimpleStatusFilter;
window.applySimpleDateRangeFilter = applySimpleDateRangeFilter;
window.applySimpleFilters = applySimpleFilters;
window.resetSimpleFilters = resetSimpleFilters;
window.getSimpleFilterValues = getSimpleFilterValues;

// Export the module itself
window.simpleFilterSystem = {
  applySimpleTextFilter,
  applySimpleStatusFilter,
  applySimpleDateRangeFilter,
  applySimpleFilters,
  resetSimpleFilters,
  getSimpleFilterValues,
};

// בדיקת פונקציות בסוף טעינת simple-filter.js
// simple-filter.js נטען
// applySimpleTextFilter קיים
// applySimpleFilters קיים
// resetSimpleFilters קיים