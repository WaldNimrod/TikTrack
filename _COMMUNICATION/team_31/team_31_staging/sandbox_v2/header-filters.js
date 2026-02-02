/**
 * Phoenix-Header-Filters-Ver: v2.0.0 | Header Filters JavaScript
 * Sync-Time: 2026-02-02 00:00:00 IST
 * Team: Team 31 (Blueprint)
 * Status: ✅ EXTERNAL JS - Clean Slate Rule Compliant
 * 
 * Purpose:
 * Handles header filter toggle functionality.
 * All JavaScript is external - NO inline scripts in HTML.
 * 
 * Usage:
 * Add <script src="./header-filters.js"></script> before closing </body> tag.
 * Uses js- prefixed classes for event delegation.
 */

(function initHeaderFilters() {
  'use strict';
  
  function initFilterToggle() {
    const filterToggleBtn = document.getElementById('headerFilterToggleBtnMain');
    const header = document.getElementById('unified-header');
    const filtersContainer = document.querySelector('.filters-container');
    
    if (filterToggleBtn && header && filtersContainer) {
      filterToggleBtn.addEventListener('click', function() {
        const isExpanded = filtersContainer.style.display !== 'none';
        
        if (isExpanded) {
          filtersContainer.style.display = 'none';
          header.style.height = '60px';
          const arrow = filterToggleBtn.querySelector('.header-filter-arrow');
          if (arrow) arrow.textContent = '▼';
        } else {
          filtersContainer.style.display = 'flex';
          header.style.height = '120px';
          const arrow = filterToggleBtn.querySelector('.header-filter-arrow');
          if (arrow) arrow.textContent = '▲';
        }
      });
    }
  }
  
  function initFilterDropdowns() {
    const filterDropdowns = document.querySelectorAll('.filter-dropdown');
    filterDropdowns.forEach(dropdown => {
      const filterMenu = dropdown.querySelector('.filter-menu');
      if (filterMenu) {
        dropdown.addEventListener('mouseenter', function() {
          filterMenu.style.display = 'block';
          filterMenu.style.opacity = '1';
          filterMenu.style.visibility = 'visible';
        });
        
        dropdown.addEventListener('mouseleave', function() {
          filterMenu.style.display = 'none';
          filterMenu.style.opacity = '0';
          filterMenu.style.visibility = 'hidden';
        });
      }
    });
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initFilterToggle();
      initFilterDropdowns();
    });
  } else {
    // DOM already loaded
    initFilterToggle();
    initFilterDropdowns();
  }
})();
