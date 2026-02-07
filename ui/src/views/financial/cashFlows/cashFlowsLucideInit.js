/**
 * Cash Flows Lucide Icons Initialization
 * ------------------------------------------
 * Initialize Lucide icons for Cash Flows page
 * Clean Slate Rule: כל ה-JavaScript בקובץ חיצוני
 */

(function initLucideIcons() {
  'use strict';
  
  function initializeIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
  
  // Wait for DOM and Lucide to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Wait a bit for Lucide to load
      setTimeout(initializeIcons, 100);
    });
  } else {
    // DOM already loaded, wait for Lucide
    if (window.lucide) {
      initializeIcons();
    } else {
      window.addEventListener('load', function() {
        setTimeout(initializeIcons, 100);
      });
    }
  }
})();
