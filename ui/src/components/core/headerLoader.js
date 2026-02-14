/**
 * Phoenix-Header-Loader-Ver: v1.1.0 | Modular Header Loader
 * Sync-Time: 2026-02-07 00:00:00 IST
 * Team: Team 31 (Shared Components)
 * Status: ✅ MODULAR HEADER LOADER - Gate B Fixes
 * 
 * Purpose:
 * Dynamically loads unified-header.html into all pages.
 * All pages now use unified structure: header > .page-wrapper > .page-container > main
 * Header is injected at the beginning of <body> (before .page-wrapper)
 * 
 * Usage:
 * Add <script src="./headerLoader.js"></script> in <head> or before closing </body> tag.
 * IMPORTANT: Load phoenixFilterBridge.js BEFORE headerLoader.js
 * 
 * Gate B Fixes:
 * - Safe header insertion (prevents insertBefore errors)
 * - Error handling for header load failures
 */

(function loadHeader() {
  'use strict';
  
  // Helper function for safe logging (avoid import.meta issues)
  // Uses maskedLog for secure logging
  async function safeLog(message, data) {
    try {
      // Dynamic import to avoid module issues in legacy scripts
      const { maskedLog } = await import('../../utils/maskedLog.js');
      if (data) {
        maskedLog(message, data);
      } else {
        maskedLog(message);
      }
    } catch (e) {
      // Fallback if maskedLog import fails - no-op (no raw console per ADR-010)
    }
  }
  
  // Wait for DOM to be ready
  function initHeader() {
    // ADR-013 SSOT: Header Loader must run before React mount - marker for E2E load-order assert
    try { window.__headerLoaderInit = window.__headerLoaderInit || Date.now(); } catch (_) {}
    // Gate B Fix: Skip header loading for auth pages (login, register, reset-password)
    // Auth pages should only show form + footer, no header
    const currentPath = window.location.pathname;
    const authRoutes = ['/login', '/register', '/reset-password'];
    const isAuthPage = authRoutes.some(route => currentPath === route || currentPath.startsWith(route + '/'));
    
    if (isAuthPage) {
      // Gate B Fix: Remove header if it exists (e.g., user navigated from regular page to auth page)
      const existingHeader = document.querySelector('header#unified-header');
      if (existingHeader) {
        safeLog('Phoenix Header Loader: Auth page detected, removing existing header.', { path: currentPath });
        existingHeader.remove();
      } else {
        safeLog('Phoenix Header Loader: Auth page detected, skipping header load.', { path: currentPath });
      }
      return;
    }
    
    // Check if header already exists (prevent duplicate)
    if (document.querySelector('header#unified-header')) {
      safeLog('Phoenix Header Loader: Header already exists. Skipping load.');
      return;
    }
    
    // Ensure body exists before proceeding
    if (!document.body) {
      safeLog('Phoenix Header Loader: document.body not available yet. Retrying...');
      setTimeout(initHeader, 100);
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
          safeLog('Phoenix Header Loader: header element not found in unified-header.html');
          return;
        }
        
        // Inject header at the beginning of <body> (before .page-wrapper)
        // Gate B Fix: Enhanced safe insertion to prevent "node is not a child" errors
        const pageWrapper = document.querySelector('.page-wrapper');
        
        try {
          // Gate B Fix: Enhanced error handling for insertBefore
          if (!document.body) {
            throw new Error('document.body is not available');
          }
          
          // Strategy 1: Insert before .page-wrapper (Team 90 Fix: Use parentNode.insertBefore)
          // Gate B Fix: Use pageWrapper.parentNode.insertBefore instead of document.body.insertBefore
          // This works even when .page-wrapper is not a direct child of body (e.g., React root)
          if (pageWrapper && pageWrapper.parentNode) {
            try {
              // Team 90 Recommended Fix: Use parentNode.insertBefore
              pageWrapper.parentNode.insertBefore(header, pageWrapper);
              safeLog('[Header Loader] Header inserted before .page-wrapper (via parentNode)');
              // Success - skip to handler initialization
              initHeaderHandlers();
              return;
            } catch (insertError) {
              // If insertBefore fails, fall through to next strategy
              safeLog('[Header Loader] parentNode.insertBefore failed for .page-wrapper, trying fallback', {
                error: insertError.message,
                parentNode: pageWrapper.parentNode?.tagName || 'null'
              });
            }
          }
          
          // Strategy 2: Insert before first child if it exists and is still in DOM
          if (document.body.firstChild) {
            const firstChild = document.body.firstChild;
            // Verify firstChild is still in DOM and is a direct child of body
            if (firstChild && firstChild.parentNode === document.body) {
              try {
                document.body.insertBefore(header, firstChild);
                safeLog('[Header Loader] Header inserted before firstChild');
                // Success - skip to handler initialization
                initHeaderHandlers();
                return;
              } catch (insertError) {
                // If insertBefore fails, fall through to appendChild
                safeLog('[Header Loader] insertBefore failed for firstChild, using appendChild', {
                  error: insertError.message
                });
              }
            }
          }
          
          // Strategy 3: Append to body (always works, but header will be at end)
          document.body.appendChild(header);
          safeLog('[Header Loader] Header appended to body (fallback)');
          
        } catch (insertError) {
          // Gate B Fix: Enhanced error handling - log error but don't fail silently
          safeLog('[Header Loader] All insertion strategies failed, using appendChild', { 
            error: insertError.message || insertError,
            errorName: insertError.name,
            pageWrapperExists: !!pageWrapper,
            bodyExists: !!document.body
          });
          
          // Ensure body still exists before appendChild
          if (document.body) {
            try {
              document.body.appendChild(header);
              safeLog('[Header Loader] Header appended to body (error recovery)');
            } catch (appendError) {
              safeLog('[Header Loader] appendChild also failed', { 
                error: appendError.message || appendError 
              });
              // Don't throw - allow page to continue loading even if header fails
              return; // Exit early if header insertion completely fails
            }
          } else {
            // Body doesn't exist - retry later
            safeLog('[Header Loader] document.body not available, retrying...');
            setTimeout(initHeader, 100);
            return;
          }
        }
        
        // Initialize JavaScript handlers after header is loaded
        initHeaderHandlers();
      })
      .catch(error => {
        // Gate B Fix: Enhanced error logging without throwing SEVERE errors
        safeLog('Phoenix Header Loader: Failed to load unified-header.html', { 
          error: error.message || error,
          errorName: error.name,
          headerPath: headerPath
        });
        // Don't throw - allow page to continue loading even if header fails
        // This prevents SEVERE console errors that block E2E tests
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
    // Gate B Fix: Ensure navigationHandler is loaded as legacy script (not module)
    if (!document.querySelector('script[src*="navigationHandler.js"]')) {
      const navScript = document.createElement('script');
      navScript.src = '/src/components/core/navigationHandler.js';
      // Gate B Fix: Explicitly set type to ensure legacy script (not module)
      navScript.type = 'text/javascript';
      navScript.onload = function() {
        // Re-initialize navigation handlers after header is loaded
        if (window.NavigationHandler && window.NavigationHandler.init) {
          setTimeout(() => {
            window.NavigationHandler.init();
          }, 300);
        }
      };
      navScript.onerror = function() {
        safeLog('[Header Loader] Failed to load navigationHandler.js');
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
    
    // Load headerLinksUpdater.js if not already loaded (for dynamic user profile link + management menu visibility)
    if (!document.querySelector('script[src*="headerLinksUpdater.js"]')) {
      const headerLinksScript = document.createElement('script');
      headerLinksScript.src = '/src/components/core/headerLinksUpdater.js';
      headerLinksScript.onload = function() {
        if (window.HeaderLinksUpdater && window.HeaderLinksUpdater.update) {
          window.HeaderLinksUpdater.update();
        }
      };
      document.head.appendChild(headerLinksScript);
    } else if (window.HeaderLinksUpdater && window.HeaderLinksUpdater.update) {
      window.HeaderLinksUpdater.update();
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
  
  // Stage 2 Fix: Listen for navigation events (e.g., Login → Home)
  // Ensure header is loaded after navigation
  window.addEventListener('popstate', function() {
    // Handle browser back/forward navigation
    setTimeout(initHeader, 100);
  });
  
  // Stage 2 Fix: Listen for React Router navigation (SPA navigation)
  // Check for header after route changes
  let lastPath = window.location.pathname;
  setInterval(function() {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      // Wait a bit for React Router to finish rendering
      setTimeout(initHeader, 200);
    }
  }, 100);
})();
