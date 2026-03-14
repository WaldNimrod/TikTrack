/**
 * Phoenix-Header-Dropdown-Ver: v1.0.0 | Header Dropdown Menu JavaScript
 * Sync-Time: 2026-02-02 00:00:00 IST
 * Team: Team 31 (Blueprint)
 * Status: ✅ EXTERNAL JS - Clean Slate Rule Compliant
 *
 * Purpose:
 * Handles dropdown menu functionality in the main navigation.
 * All JavaScript is external - NO inline scripts in HTML.
 *
 * Features:
 * - Dropdown menus open/close on hover
 * - Arrow rotation 180 degrees (not 90)
 * - Menu visibility and animation
 *
 * Usage:
 * Add <script src="./headerDropdown.js"></script> before closing </body> tag.
 * Uses js- prefixed classes for event delegation.
 */

(function initHeaderDropdowns() {
  'use strict';

  function initDropdownMenus() {
    const dropdownItems = document.querySelectorAll(
      '.tiktrack-nav-item.dropdown',
    );

    dropdownItems.forEach((item) => {
      const dropdownToggle = item.querySelector('.tiktrack-dropdown-toggle');
      const dropdownMenu = item.querySelector('.tiktrack-dropdown-menu');
      const dropdownArrow = item.querySelector('.tiktrack-dropdown-arrow');

      if (!dropdownToggle || !dropdownMenu) return;

      // Open dropdown on mouseenter
      item.addEventListener('mouseenter', function () {
        dropdownMenu.style.opacity = '1';
        dropdownMenu.style.visibility = 'visible';
        dropdownMenu.style.transform = 'translateY(0)';
        dropdownMenu.style.display = 'flex';

        // Rotate arrow 180 degrees (not 90)
        if (dropdownArrow) {
          dropdownArrow.style.transform = 'rotate(180deg)';
        }
      });

      // Close dropdown on mouseleave with delay to allow clicks
      let mouseLeaveTimeout = null;
      item.addEventListener('mouseleave', function () {
        // Clear any existing timeout
        if (mouseLeaveTimeout) {
          clearTimeout(mouseLeaveTimeout);
        }

        // Add delay before closing to allow clicks on dropdown items
        mouseLeaveTimeout = setTimeout(() => {
          dropdownMenu.style.opacity = '0';
          dropdownMenu.style.visibility = 'hidden';
          dropdownMenu.style.transform = 'translateY(-10px)';

          // Reset arrow rotation
          if (dropdownArrow) {
            dropdownArrow.style.transform = 'rotate(0deg)';
          }

          // Hide menu after transition
          setTimeout(() => {
            if (dropdownMenu.style.opacity === '0') {
              dropdownMenu.style.display = 'none';
            }
          }, 300); // Match CSS transition duration
        }, 200); // Delay before closing - allows time for click events
      });

      // Keep dropdown open when hovering over menu items
      dropdownMenu.addEventListener('mouseenter', function () {
        // Cancel any pending close
        if (mouseLeaveTimeout) {
          clearTimeout(mouseLeaveTimeout);
          mouseLeaveTimeout = null;
        }

        // Ensure menu is visible
        dropdownMenu.style.opacity = '1';
        dropdownMenu.style.visibility = 'visible';
        dropdownMenu.style.transform = 'translateY(0)';
        dropdownMenu.style.display = 'flex';
      });

      // Handle clicks on dropdown items - prevent immediate close
      const dropdownLinks = dropdownMenu.querySelectorAll(
        'a.tiktrack-dropdown-item',
      );
      dropdownLinks.forEach((link) => {
        link.addEventListener('click', function (e) {
          // Don't prevent default - let navigation handler deal with it
          // But ensure dropdown stays open long enough for click to register
          // The navigation handler will close it if needed
        });
      });
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDropdownMenus);
  } else {
    // DOM already loaded
    initDropdownMenus();
  }
})();
