/**
 * Phoenix-Header-Loader-Ver: v1.0.0 | Modular Header Loader
 * Sync-Time: 2026-02-03 00:00:00 IST
 * Team: Team 31 (Shared Components)
 * Status: ✅ MODULAR HEADER LOADER
 * 
 * Purpose:
 * Dynamically loads unified-header.html into all pages.
 * All pages now use unified structure: header > .page-wrapper > .page-container > main
 * Header is injected at the beginning of <body> (before .page-wrapper)
 * 
 * Usage:
 * Add <script src="./headerLoader.js"></script> in <head> or before closing </body> tag.
 * IMPORTANT: Load phoenixFilterBridge.js BEFORE headerLoader.js
 */

(function loadHeader() {
  'use strict';
  
  // Wait for DOM to be ready
  function initHeader() {
    // Check if header already exists (prevent duplicate)
    if (document.querySelector('header#unified-header')) {
      console.warn('Phoenix Header Loader: Header already exists. Skipping load.');
      return;
    }
    
    // Use absolute path - Vite serves files from /src/ automatically
    const headerPath = '/src/views/shared/unified-header.html';
    
    // Load unified-header.html
    fetch(headerPath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        // Create temporary container to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html.trim();
        
        // Find the header element
        const header = tempDiv.querySelector('header#unified-header');
        if (!header) {
          console.warn('Phoenix Header Loader: header element not found in unified-header.html');
          return;
        }
        
        // Inject header at the beginning of <body> (before .page-wrapper)
        const pageWrapper = document.querySelector('.page-wrapper');
        
        if (pageWrapper) {
          // Insert header before .page-wrapper
          document.body.insertBefore(header, pageWrapper);
        } else {
          // Fallback: Insert at the beginning of body
          if (document.body.firstChild) {
            document.body.insertBefore(header, document.body.firstChild);
          } else {
            document.body.appendChild(header);
          }
        }
        
        // Initialize JavaScript handlers after header is loaded
        initHeaderHandlers();
      })
      .catch(error => {
        console.error('Phoenix Header Loader: Failed to load unified-header.html', error);
      });
  }
  
  /**
   * Initialize JavaScript handlers for header
   */
  function initHeaderHandlers() {
    // Load headerDropdown.js if not already loaded
    if (!document.querySelector('script[src*="headerDropdown.js"]')) {
      const dropdownScript = document.createElement('script');
      dropdownScript.src = '/src/components/core/headerDropdown.js';
      document.head.appendChild(dropdownScript);
    }
    
    // Load headerFilters.js if not already loaded
    if (!document.querySelector('script[src*="headerFilters.js"]')) {
      const filtersScript = document.createElement('script');
      filtersScript.src = '/src/components/core/headerFilters.js';
      document.head.appendChild(filtersScript);
    }
    
    // Load navigationHandler.js if not already loaded
    if (!document.querySelector('script[src*="navigationHandler.js"]')) {
      const navScript = document.createElement('script');
      navScript.src = '/src/components/core/navigationHandler.js';
      navScript.onload = function() {
        // Re-initialize navigation handlers after header is loaded
        if (window.NavigationHandler && window.NavigationHandler.init) {
          setTimeout(() => {
            window.NavigationHandler.init();
          }, 300);
        }
      };
      document.head.appendChild(navScript);
    } else {
      // If already loaded, re-initialize after a delay to ensure header is in DOM
      setTimeout(() => {
        if (window.NavigationHandler && window.NavigationHandler.init) {
          window.NavigationHandler.init();
        }
      }, 300);
    }
    
    // Load headerLinksUpdater.js if not already loaded (for dynamic user profile link)
    if (!document.querySelector('script[src*="headerLinksUpdater.js"]')) {
      const headerLinksScript = document.createElement('script');
      headerLinksScript.src = '/src/components/core/headerLinksUpdater.js';
      document.head.appendChild(headerLinksScript);
    }
    
    // Initialize Phoenix Bridge if available
    if (window.PhoenixBridge) {
      // Bridge will handle filter initialization
      setTimeout(() => {
        if (window.PhoenixBridge.syncWithUrl) {
          window.PhoenixBridge.syncWithUrl();
        }
      }, 100);
    }
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    // DOM already loaded
    initHeader();
  }
})();
