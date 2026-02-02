/**
 * Phoenix-Header-Dropdown-Ver: v2.0.0 | Header Dropdown Menu JavaScript
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
 * Add <script src="./header-dropdown.js"></script> before closing </body> tag.
 * Uses js- prefixed classes for event delegation.
 */

(function initHeaderDropdowns() {
  'use strict';
  
  function initDropdownMenus() {
    const dropdownItems = document.querySelectorAll('.tiktrack-nav-item.dropdown');
    
    dropdownItems.forEach(item => {
      const dropdownToggle = item.querySelector('.tiktrack-dropdown-toggle');
      const dropdownMenu = item.querySelector('.tiktrack-dropdown-menu');
      const dropdownArrow = item.querySelector('.tiktrack-dropdown-arrow');
      
      if (!dropdownToggle || !dropdownMenu) return;
      
      // Open dropdown on mouseenter
      item.addEventListener('mouseenter', function() {
        dropdownMenu.style.opacity = '1';
        dropdownMenu.style.visibility = 'visible';
        dropdownMenu.style.transform = 'translateY(0)';
        dropdownMenu.style.display = 'flex';
        
        // Rotate arrow 180 degrees (not 90)
        if (dropdownArrow) {
          dropdownArrow.style.transform = 'rotate(180deg)';
        }
      });
      
      // Close dropdown on mouseleave
      item.addEventListener('mouseleave', function() {
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
