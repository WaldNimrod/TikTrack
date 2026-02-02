/**
 * Phoenix-Section-Toggle-Ver: v2.0.0 | Section Toggle JavaScript
 * Sync-Time: 2026-02-02 00:00:00 IST
 * Team: Team 31 (Blueprint)
 * Status: ✅ EXTERNAL JS - Clean Slate Rule Compliant
 * 
 * Purpose:
 * Handles section toggle functionality (show/hide section body).
 * All JavaScript is external - NO inline scripts in HTML.
 * 
 * Usage:
 * Add <script src="./section-toggle.js"></script> before closing </body> tag.
 * Uses js- prefixed classes for event delegation.
 */

(function initSectionToggle() {
  'use strict';
  
  function initToggleButtons() {
    // Find all toggle buttons
    const toggleButtons = document.querySelectorAll('.index-section__header-toggle-btn, .dashboard-section__header-toggle-btn');
    
    toggleButtons.forEach(button => {
      // Find the parent section (tt-section)
      const section = button.closest('tt-section');
      if (!section) return;
      
      // Find the section body
      const sectionBody = section.querySelector('.index-section__body, .dashboard-section__body');
      if (!sectionBody) return;
      
      // Find the SVG icon inside the button
      const icon = button.querySelector('svg');
      
      // Set initial state: sections are open by default
      let isOpen = true;
      
      // Add click handler
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Toggle state
        isOpen = !isOpen;
        
        // Toggle section body visibility with smooth animation
        if (isOpen) {
          // Open: Remove hidden attribute and restore display
          sectionBody.removeAttribute('hidden');
          // Use requestAnimationFrame to ensure smooth transition
          requestAnimationFrame(() => {
            sectionBody.style.display = '';
          });
          // Rotate icon to point down (open state)
          if (icon) {
            icon.style.transform = 'rotate(0deg)';
          }
          button.setAttribute('aria-expanded', 'true');
        } else {
          // Close: Set hidden attribute for CSS animation
          sectionBody.setAttribute('hidden', '');
          // Rotate icon to point up (closed state)
          if (icon) {
            icon.style.transform = 'rotate(180deg)';
          }
          button.setAttribute('aria-expanded', 'false');
          // After animation completes, set display to none
          setTimeout(() => {
            if (sectionBody.hasAttribute('hidden')) {
              sectionBody.style.display = 'none';
            }
          }, 300); // Match CSS transition duration
        }
      });
      
      // Set initial aria-expanded
      button.setAttribute('aria-expanded', 'true');
      
      // Add transition for smooth icon rotation
      if (icon) {
        icon.style.transition = 'transform 0.2s ease';
      }
    });
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToggleButtons);
  } else {
    // DOM already loaded
    initToggleButtons();
  }
})();
