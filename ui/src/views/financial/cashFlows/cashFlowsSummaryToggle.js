/**
 * Cash Flows Summary Toggle Handler
 * ------------------------------------------
 * Toggles the extended summary section (second row) in Cash Flows summary
 * Clean Slate Rule: כל ה-JavaScript בקובץ חיצוני
 */

(function initSummaryToggle() {
  'use strict';
  
  function initializeToggle() {
    const toggleButton = document.getElementById('cashFlowsSummaryToggle');
    const summaryContent = document.getElementById('cashFlowsSummaryContent');
    
    if (!toggleButton || !summaryContent) {
      return;
    }
    
    toggleButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const isHidden = summaryContent.style.display === 'none' || 
                      summaryContent.style.display === '' ||
                      window.getComputedStyle(summaryContent).display === 'none';
      
      if (isHidden) {
        summaryContent.style.display = 'flex';
        toggleButton.setAttribute('aria-expanded', 'true');
        toggleButton.setAttribute('title', 'הסתר סיכום מלא');
      } else {
        summaryContent.style.display = 'none';
        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.setAttribute('title', 'הצג סיכום מלא');
      }
    });
  }
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeToggle);
  } else {
    initializeToggle();
  }
})();
