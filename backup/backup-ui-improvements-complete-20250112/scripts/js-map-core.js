/**
 * ==================================
 *
 * JS Map System - Core Functions
 * 
 * Core functionality for the JavaScript mapping system
 * Includes main classes and initialization functions
 *
 * @author TikTrack Development Team
 * @version 2.1.0 - Split from main js-map.js
 * @lastUpdated January 15, 2025
 */

/**
 * מערכת מפת פונקציות JS - גרסה מוטמעת
 * מציגה מיפוי של עמודים לקבצים ופונקציות מפורטות
 * 
 * NOTE: JsMapSystem class moved to js-map.js to avoid duplication
 * This file now contains only utility functions
 */

// Legacy JsMapSystem class - MOVED TO js-map.js
// This is kept for compatibility but should not be used
/*
*/

/**
 * Load JS Map Data
 */
function loadJsMapData() {
  console.log('📊 Loading JS Map Data...');
  
  if (window.jsMapSystem) {
    window.jsMapSystem.loadJsMapData();
  }
}

/**
 * Refresh JS Map
 */
function refreshJsMap() {
  console.log('🔄 Refreshing JS Map...');
  
  if (window.jsMapSystem) {
    window.jsMapSystem.loadJsMapData();
    window.jsMapSystem.updateDashboardStats();
  }
  
  // Show success notification
  if (typeof showNotification === 'function') {
    showNotification('מפת JS עודכנה בהצלחה', 'success');
  }
}

/**
 * Toggle Function Group
 */
function toggleFunctionGroup(header) {
  const content = header.nextElementSibling;
  const icon = header.querySelector('.toggle-icon');
  
  if (content && icon) {
    if (content.style.display === 'none') {
      content.style.display = 'block';
      icon.textContent = '▼';
    } else {
      content.style.display = 'none';
      icon.textContent = '◀';
    }
  }
}

/**
 * Open Function Details
 */
function openFunctionDetails(file, functionName) {
  console.log(`🔍 Opening function details: ${functionName} in ${file}`);
  
  // This will be implemented in js-map-ui.js
  if (typeof openFunctionModal === 'function') {
    openFunctionModal(functionName, '', '');
  }
}

/**
 * Initialize JS Map Page
 */
// initializeJsMapPage moved to js-map.js to avoid duplication

// Initialize when DOM is ready - MOVED TO js-map.js
// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', initializeJsMapPage);
// } else {
//   initializeJsMapPage();
// }

console.log('✅ js-map-core.js loaded successfully');
