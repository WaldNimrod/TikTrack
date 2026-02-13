/**
 * Phoenix-Portfolio-Summary-Ver: v1.0.0 | Portfolio Summary Toggle JavaScript
 * Sync-Time: 2026-02-02 00:00:00 IST
 * Team: Team 31 (Blueprint)
 * Status: ✅ EXTERNAL JS - Clean Slate Rule Compliant
 * 
 * Purpose:
 * Handles portfolio summary toggle functionality (show/hide second row).
 * All JavaScript is external - NO inline scripts in HTML.
 * 
 * Usage:
 * Add <script src="./portfolioSummaryToggle.js"></script> before closing </body> tag.
 * Uses js- prefixed classes for event delegation.
 */

(function initPortfolioSummary() {
  'use strict';
  
  function initToggle() {
    const portfolioToggleBtn = document.getElementById('portfolioSummaryToggleSize');
    const portfolioSummaryContent = document.getElementById('portfolioSummaryContent');
    
    if (portfolioToggleBtn && portfolioSummaryContent) {
      portfolioToggleBtn.addEventListener('click', function() {
        const isExpanded = portfolioSummaryContent.classList.contains('is-expanded');
        
        if (isExpanded) {
          portfolioSummaryContent.classList.remove('is-expanded');
          portfolioToggleBtn.setAttribute('aria-label', 'הצג סיכום מלא');
          portfolioToggleBtn.setAttribute('title', 'הצג סיכום מלא');
          // Change icon to eye (show more)
          portfolioToggleBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"></path></svg>';
        } else {
          portfolioSummaryContent.classList.add('is-expanded');
          portfolioToggleBtn.setAttribute('aria-label', 'הצג סיכום מצומצם');
          portfolioToggleBtn.setAttribute('title', 'הצג סיכום מצומצם');
          // Change icon to eye-off (show less)
          portfolioToggleBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
        }
      });
    }
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToggle);
  } else {
    // DOM already loaded
    initToggle();
  }
})();
