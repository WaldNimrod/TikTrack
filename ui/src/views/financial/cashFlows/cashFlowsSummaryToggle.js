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
      
      // Check if hidden using CSS classes or data attributes (Clean Slate Rule compliance)
      const isHidden = !summaryContent.classList.contains('visible') && 
                      summaryContent.getAttribute('data-visible') !== 'true';
      
      if (isHidden) {
        // Show summary using CSS classes (Clean Slate Rule compliance)
        summaryContent.classList.add('visible');
        summaryContent.setAttribute('data-visible', 'true');
        toggleButton.setAttribute('aria-expanded', 'true');
        toggleButton.setAttribute('title', 'הסתר סיכום מלא');
      } else {
        // Hide summary using CSS classes (Clean Slate Rule compliance)
        summaryContent.classList.remove('visible');
        summaryContent.setAttribute('data-visible', 'false');
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
