/**
 * Navigation Handler - מטפל בפתיחה/סגירה של Dropdowns בתפריט
 * --------------------------------------------------------
 * מטפל רק ב-dropdowns (פתיחה/סגירה) - לא בניווט
 * 
 * Clean Slate Rule: כל ה-JavaScript בקובץ חיצוני
 * 
 * IMPORTANT: 
 * - Navigation is handled by standard <a> tags - browser handles it automatically
 * - This handler ONLY manages dropdown open/close behavior
 * - No React Router bypass logic needed - all links use standard browser navigation
 */

(function initNavigationHandler() {
  'use strict';

  /**
   * Handle dropdown toggle clicks
   * Only prevents default for dropdown toggles (href="#")
   */
  function handleDropdownToggle(e) {
    const link = e.currentTarget;
    const href = link.getAttribute('href');
    
    // Only prevent default for dropdown toggles (href="#" or empty)
    if (!href || href === '#' || href === '') {
      e.preventDefault();
      // Dropdown open/close is handled by CSS :hover or headerDropdown.js
      return false;
    }
    
    // For valid links, let browser handle navigation naturally
    return true;
  }

  /**
   * Close dropdown when clicking outside
   */
  function handleClickOutside(e) {
    const clickedElement = e.target;
    const dropdown = clickedElement.closest('.tiktrack-nav-item.dropdown');
    
    if (!dropdown) {
      // Clicked outside dropdown - close all dropdowns
      const allDropdowns = document.querySelectorAll('.tiktrack-dropdown-menu');
      allDropdowns.forEach(menu => {
        menu.style.opacity = '0';
        menu.style.visibility = 'hidden';
        menu.style.display = 'none';
      });
    }
  }

  /**
   * Initialize dropdown handlers
   * CRITICAL: Only handles dropdowns - navigation is handled by browser
   */
  function initDropdownHandlers() {
    // Get all dropdown toggle links (href="#" or empty)
    const dropdownToggles = document.querySelectorAll('.tiktrack-dropdown-toggle[href="#"], .tiktrack-dropdown-toggle[href=""]');
    
      // Debug logging - only in development with debug flag
      if (import.meta.env.DEV && import.meta.env.VITE_DEBUG === 'true') {
        console.log('Navigation Handler: Found', dropdownToggles.length, 'dropdown toggles');
      }
    
    // Add click handlers for dropdown toggles only
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', handleDropdownToggle);
    });
    
    // Add click outside handler to close dropdowns
    document.addEventListener('click', handleClickOutside);
    
    // Debug logging - only in development with debug flag
    if (import.meta.env.DEV && import.meta.env.VITE_DEBUG === 'true') {
      console.log('Navigation Handler: Initialized dropdown handlers');
    }
  }

  /**
   * Initialize when DOM is ready
   */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initDropdownHandlers, 100);
      });
    } else {
      setTimeout(initDropdownHandlers, 100);
    }
  }

  // Auto-initialize
  init();

  // Export for manual updates
  window.NavigationHandler = {
    init: initDropdownHandlers
  };
})();
