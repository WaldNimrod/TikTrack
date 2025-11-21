/**
 * Color Demo Toggle System
 * מערכת הצגה/הסתרה של דוגמאות מערכת הצבעים
 * 
 * @version 1.0.0
 * @since 2025-01-09
 */

/**
 * Toggle visibility of color demo sections
 * @param {string} demoId - ID of demo element
 */
function toggleColorDemo(demoId) {
  const demoElement = document.getElementById(demoId);
  if (demoElement) {
    if (demoElement.style.display === 'none') {
      demoElement.style.display = 'block';
      console.log(`✅ הצגת דמו צבעים: ${demoId}`);
    } else {
      demoElement.style.display = 'none';
      console.log(`❌ הסתרת דמו צבעים: ${demoId}`);
    }
  }
}

/**
 * Show all color demos
 */
function showAllColorDemos() {
  const demos = [
    'alertsColorDemo', 'tradesColorDemo', 'accountsColorDemo', 
    'tickersColorDemo', 'cashFlowsColorDemo', 'notesColorDemo', 
    'executionsColorDemo'
  ];
  demos.forEach(demoId => {
    const element = document.getElementById(demoId);
    if (element) {
      element.style.display = 'block';
    }
  });
  console.log('✅ הצגת כל דמו הצבעים');
}

/**
 * Hide all color demos
 */
function hideAllColorDemos() {
  const demos = [
    'alertsColorDemo', 'tradesColorDemo', 'accountsColorDemo', 
    'tickersColorDemo', 'cashFlowsColorDemo', 'notesColorDemo', 
    'executionsColorDemo'
  ];
  demos.forEach(demoId => {
    const element = document.getElementById(demoId);
    if (element) {
      element.style.display = 'none';
    }
  });
  console.log('❌ הסתרת כל דמו הצבעים');
}

/**
 * Add keyboard shortcut for toggling color demos
 */
function initializeColorDemoShortcuts() {
  // Ctrl+Shift+D to toggle color demos
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      
      // Check if any demo is visible
      const demos = [
        'alertsColorDemo', 'tradesColorDemo', 'accountsColorDemo', 
        'tickersColorDemo', 'cashFlowsColorDemo', 'notesColorDemo', 
        'executionsColorDemo'
      ];
      const anyVisible = demos.some(demoId => {
        const element = document.getElementById(demoId);
        return element && element.style.display !== 'none';
      });
      
      if (anyVisible) {
        hideAllColorDemos();
      } else {
        showAllColorDemos();
      }
    }
  });
}

// Auto-initialize shortcuts
// document.addEventListener('DOMContentLoaded', function() {
//   initializeColorDemoShortcuts();
// //   console.log('🎨 מערכת דמו צבעים מוכנה - לחץ Ctrl+Shift+D להצגה/הסתרה');
// });

// Export functions
window.toggleColorDemo = toggleColorDemo;
window.showAllColorDemos = showAllColorDemos;
window.hideAllColorDemos = hideAllColorDemos;
window.initializeColorDemoShortcuts = initializeColorDemoShortcuts;