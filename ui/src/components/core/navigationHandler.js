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
   * Gate B Fix: Only prevents default for dropdown toggles (href="#"), allows normal navigation for valid links
   */
  function handleDropdownToggle(e) {
    const link = e.currentTarget;
    const href = link.getAttribute('href');

    // Gate B Fix: Only prevent default for dropdown toggles (href="#" or empty)
    // Allow all other links to navigate normally
    if (!href || href === '#' || href === '') {
      e.preventDefault();
      e.stopPropagation();
      // Dropdown open/close is handled by CSS :hover or headerDropdown.js
      return false;
    }

    // Gate B Fix: For valid links, let browser handle navigation naturally
    // Don't prevent default - allow normal navigation
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
      allDropdowns.forEach((menu) => {
        menu.style.opacity = '0';
        menu.style.visibility = 'hidden';
        menu.style.display = 'none';
      });
    }
  }

  /**
   * Initialize dropdown handlers
   * CRITICAL: Only handles dropdowns - navigation is handled by browser
   * Gate B Fix: Removed import.meta usage to prevent module errors
   * Gate B Fix: Ensure navigation links work correctly
   */
  function initDropdownHandlers() {
    // Gate B Fix: Get all dropdown toggle links (href="#" or empty) - these need preventDefault
    const dropdownToggles = document.querySelectorAll(
      '.tiktrack-dropdown-toggle[href="#"], .tiktrack-dropdown-toggle[href=""]',
    );

    // Debug logging - check for debug mode via localStorage (Gate B Fix: no import.meta)
    const isDebugMode =
      localStorage.getItem('phoenix_debug') === 'true' ||
      new URLSearchParams(window.location.search).get('debug') === 'true';

    if (isDebugMode) {
      // Import maskedLog dynamically to avoid module issues
      import('../../utils/maskedLog.js')
        .then(({ maskedLog }) => {
          maskedLog('Navigation Handler: Found dropdown toggles', {
            count: dropdownToggles.length,
          });
        })
        .catch(() => {
          // Fallback if import fails
        });
    }

    // Gate B Fix: Add click handlers for dropdown toggles only (href="#" or empty)
    // Navigation links (with valid hrefs) are handled by browser automatically - no interference needed
    dropdownToggles.forEach((toggle) => {
      toggle.addEventListener('click', handleDropdownToggle);
    });

    // Add click outside handler to close dropdowns
    document.addEventListener('click', handleClickOutside);

    // Debug logging
    if (isDebugMode) {
      // Import maskedLog dynamically to avoid module issues
      import('../../utils/maskedLog.js')
        .then(({ maskedLog }) => {
          maskedLog(
            'Navigation Handler: Initialized dropdown handlers and navigation links',
          );
        })
        .catch(() => {
          // Fallback if import fails
        });
    }
  }

  /**
   * Initialize when DOM is ready
   */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
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
    init: initDropdownHandlers,
  };
})();
