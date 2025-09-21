/**
 * ==================================
 *
 * JS Map System - Utility Functions
 * 
 * Utility and helper functions for the JavaScript mapping system
 * Includes search, navigation, and common operations
 *
 * @author TikTrack Development Team
 * @version 2.1.0 - Split from main js-map.js
 * @lastUpdated January 15, 2025
 */

/**
 * הצג/הסתר כל הסקשנים
 * Toggle all sections visibility
 */
function toggleAllSections() {
  const sections = document.querySelectorAll('.content-section, .top-section');
  const toggleIcon = document.querySelector('.top-section .section-toggle-icon');
  
  if (!sections.length) return;
  
  // בדיקה אם כל הסקשנים סגורים
  const allCollapsed = Array.from(sections).every(section => {
    const sectionBody = section.querySelector('.section-body');
    return sectionBody && (sectionBody.classList.contains('collapsed') || sectionBody.style.display === 'none');
  });
  
  // החלטה אם לפתוח או לסגור הכל
  const shouldOpen = allCollapsed;
  
  sections.forEach(section => {
    const sectionBody = section.querySelector('.section-body');
    if (!sectionBody) return;
    
    if (shouldOpen) {
      // פתיחה
      sectionBody.classList.remove('collapsed');
      sectionBody.style.display = 'block';
    } else {
      // סגירה
      sectionBody.classList.add('collapsed');
      sectionBody.style.display = 'none';
    }
  });
  
  // עדכון אייקון
  if (toggleIcon) {
    toggleIcon.textContent = shouldOpen ? '▼' : '◀';
  }
  
  console.log(`📋 כל הסקשנים ${shouldOpen ? 'נפתחו' : 'נסגרו'}`);
}

/**
 * חיפוש מהיר בפונקציות
 * Perform quick search in functions
 */
function performQuickSearch(searchTerm) {
  if (!searchTerm || searchTerm.length < 2) {
    // הצג את כל הפונקציות אם החיפוש קצר מדי
    showAllFunctions();
    return;
  }
  
  console.log('🔍 חיפוש מהיר:', searchTerm);
  
  // חיפוש בפונקציות
  const functionElements = document.querySelectorAll('.function-item, .function-card');
  let foundCount = 0;
  
  functionElements.forEach(element => {
    const functionName = element.querySelector('.function-name')?.textContent || '';
    const functionCode = element.querySelector('.function-code')?.textContent || '';
    
    const matches = functionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   functionCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (matches) {
      element.style.display = 'block';
      element.classList.add('search-highlight');
      foundCount++;
    } else {
      element.style.display = 'none';
      element.classList.remove('search-highlight');
    }
  });
  
  // עדכון מונה תוצאות
  const resultsCounter = document.getElementById('searchResults');
  if (resultsCounter) {
    resultsCounter.textContent = `נמצאו ${foundCount} פונקציות`;
  }
  
  console.log(`✅ נמצאו ${foundCount} פונקציות עבור "${searchTerm}"`);
}

/**
 * הצג את כל הפונקציות
 * Show all functions (clear search)
 */
function showAllFunctions() {
  const functionElements = document.querySelectorAll('.function-item, .function-card');
  
  functionElements.forEach(element => {
    element.style.display = 'block';
    element.classList.remove('search-highlight');
  });
  
  const resultsCounter = document.getElementById('searchResults');
  if (resultsCounter) {
    resultsCounter.textContent = '';
  }
  
  console.log('📋 הצגת כל הפונקציות');
}

/**
 * הצג/הסתר dropdown של פונקציות
 * Toggle functions dropdown
 */
function toggleFunctionsDropdown() {
  const dropdown = document.getElementById('functionsDropdown');
  const dropdownMenu = dropdown?.nextElementSibling;
  
  if (!dropdownMenu) return;
  
  const isOpen = dropdownMenu.classList.contains('show');
  
  if (isOpen) {
    dropdownMenu.classList.remove('show');
    dropdown.setAttribute('aria-expanded', 'false');
  } else {
    dropdownMenu.classList.add('show');
    dropdown.setAttribute('aria-expanded', 'true');
  }
  
  console.log(`📋 Functions dropdown ${isOpen ? 'נסגר' : 'נפתח'}`);
}

/**
 * Copy Detailed Log - REMOVED: Now handled by js-map.js
 */

/**
 * Scroll to Top
 */
function scrollToTop() {
  console.log('⬆️ Scrolling to top...');
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

/**
 * Export Duplicates Report
 */
function exportDuplicatesReport() {
  console.log('📊 Exporting duplicates report...');
  
  const duplicatesData = [
    {
      functionName: 'showNotification',
      locations: ['notification-system.js', 'ui-utils.js'],
      similarity: 95,
      recommendation: 'איחוד לפונקציה אחת במערכת ההתראות הגלובלית'
    },
    {
      functionName: 'toggleSection',
      locations: ['ui-utils.js', 'linter-realtime-monitor.js'],
      similarity: 100,
      recommendation: 'הסרת הפונקציה המקומית - שימוש בגלובלית בלבד'
    }
  ];
  
  const report = {
    title: 'דוח כפילויות - JS Map System',
    generatedAt: new Date().toLocaleString('he-IL'),
    summary: {
      totalDuplicates: duplicatesData.length,
      highSimilarity: duplicatesData.filter(d => d.similarity >= 90).length,
      mediumSimilarity: duplicatesData.filter(d => d.similarity < 90).length
    },
    duplicates: duplicatesData
  };
  
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `duplicates-report-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  
  if (typeof showNotification === 'function') {
    showNotification('דוח כפילויות יוצא בהצלחה', 'success');
  }
}

/**
 * Refresh Duplicates Analysis
 */
function refreshDuplicatesAnalysis() {
  console.log('🔄 Refreshing duplicates analysis...');
  
  if (typeof showDuplicatesAnalysis === 'function') {
    showDuplicatesAnalysis();
  }
  
  if (typeof showNotification === 'function') {
    showNotification('ניתוח כפילויות עודכן', 'success');
  }
}

/**
 * Export Local Functions Report
 */
function exportLocalFunctionsReport() {
  console.log('📊 Exporting local functions report...');
  
  const localFunctionsData = [
    {
      fileName: 'accounts.js',
      functions: [
        { name: 'validateAccountData', usage: 3, recommendation: 'העברה ל-ui-utils.js' },
        { name: 'formatAccountDisplay', usage: 5, recommendation: 'העברה ל-formatting.js' }
      ]
    },
    {
      fileName: 'alerts.js',
      functions: [
        { name: 'checkAlertConditions', usage: 2, recommendation: 'העברה ל-alert-service.js' },
        { name: 'formatAlertMessage', usage: 4, recommendation: 'העברה ל-formatting.js' }
      ]
    }
  ];
  
  const report = {
    title: 'דוח פונקציות מקומיות - JS Map System',
    generatedAt: new Date().toLocaleString('he-IL'),
    summary: {
      totalFiles: localFunctionsData.length,
      totalFunctions: localFunctionsData.reduce((sum, file) => sum + file.functions.length, 0)
    },
    files: localFunctionsData
  };
  
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `local-functions-report-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  
  if (typeof showNotification === 'function') {
    showNotification('דוח פונקציות מקומיות יוצא בהצלחה', 'success');
  }
}

/**
 * Refresh Local Functions Analysis
 */
function refreshLocalFunctionsAnalysis() {
  console.log('🔄 Refreshing local functions analysis...');
  
  if (typeof showLocalFunctionsAnalysis === 'function') {
    showLocalFunctionsAnalysis();
  }
  
  if (typeof showNotification === 'function') {
    showNotification('ניתוח פונקציות מקומיות עודכן', 'success');
  }
}

/**
 * Initialize Error Tracking
 */
function initializeErrorTracking() {
  console.log('🔍 Initializing error tracking...');
  
  // Initialize console errors array
  window.consoleErrors = window.consoleErrors || [];
  
  // Override console.error to track errors
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Call original function
    originalConsoleError.apply(console, args);
    
    // Track error
    window.consoleErrors.push({
      timestamp: new Date().toISOString(),
      message: args.join(' '),
      stack: new Error().stack
    });
    
    // Keep only last 50 errors
    if (window.consoleErrors.length > 50) {
      window.consoleErrors = window.consoleErrors.slice(-50);
    }
  };
  
  console.log('✅ Error tracking initialized');
}

// Export functions to global scope
window.toggleAllSections = toggleAllSections;
window.performQuickSearch = performQuickSearch;
window.toggleFunctionsDropdown = toggleFunctionsDropdown;
// window.copyDetailedLog = copyDetailedLog; // REMOVED: Causes conflicts with other pages
window.scrollToTop = scrollToTop;
window.exportDuplicatesReport = exportDuplicatesReport;
window.refreshDuplicatesAnalysis = refreshDuplicatesAnalysis;
window.exportLocalFunctionsReport = exportLocalFunctionsReport;
window.refreshLocalFunctionsAnalysis = refreshLocalFunctionsAnalysis;

// Initialize error tracking when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeErrorTracking);
} else {
  initializeErrorTracking();
}

console.log('✅ js-map-utils.js loaded successfully');
