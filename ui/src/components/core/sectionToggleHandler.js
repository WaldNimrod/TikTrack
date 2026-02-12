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
 * Add <script src="./sectionToggleHandler.js"></script> before closing </body> tag.
 * Uses js- prefixed classes for event delegation.
 */

(function initSectionToggle() {
  'use strict';
  
  /** Open or close all sections in container. If any closed, open all; else close all. */
  function toggleAllSections(container) {
    const sections = container.querySelectorAll('tt-section');
    const anyClosed = Array.from(sections).some(s => {
      const body = s.querySelector('.index-section__body, .dashboard-section__body');
      return body?.hasAttribute('hidden');
    });
    const openAll = anyClosed;
    sections.forEach(section => {
      const body = section.querySelector('.index-section__body, .dashboard-section__body');
      const toggleBtn = section.querySelector('.index-section__header-toggle-btn, .dashboard-section__header-toggle-btn');
      const icon = toggleBtn?.classList.contains('js-expand-collapse-all') ? null : toggleBtn?.querySelector('svg');
      if (!body) return;
      if (openAll) {
        body.removeAttribute('hidden');
        requestAnimationFrame(() => { body.style.display = ''; });
        if (icon) icon.style.transform = 'rotate(0deg)';
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
      } else {
        body.setAttribute('hidden', '');
        if (icon) icon.style.transform = 'rotate(180deg)';
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
        setTimeout(() => {
          if (body.hasAttribute('hidden')) body.style.display = 'none';
        }, 300);
      }
    });
    const expandBtn = container.querySelector('.js-expand-collapse-all');
    if (expandBtn) expandBtn.setAttribute('aria-label', openAll ? 'סגור את כל האזורים' : 'פתח את כל האזורים');
  }
  
  function initExpandCollapseAll() {
    document.querySelectorAll('.js-expand-collapse-all').forEach(btn => {
      const container = btn.closest('tt-container');
      if (!container) return;
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleAllSections(container);
      });
      btn.setAttribute('aria-label', 'הצג/הסתר את כל האזורים');
    });
  }
  
  function initToggleButtons() {
    // Find all toggle buttons (exclude js-expand-collapse-all - handled separately)
    const toggleButtons = document.querySelectorAll('.index-section__header-toggle-btn.js-section-toggle, .dashboard-section__header-toggle-btn.js-section-toggle');
    
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
  function init() {
    initExpandCollapseAll();
    initToggleButtons();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
