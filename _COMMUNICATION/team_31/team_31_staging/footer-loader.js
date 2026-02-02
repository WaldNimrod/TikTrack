/**
 * Phoenix-Footer-Loader-Ver: v1.3.0 | Modular Footer Loader
 * Sync-Time: 2026-02-01 20:00:00 IST
 * Team: Team 31 (Shared Components)
 * Status: ✅ MODULAR FOOTER LOADER
 * 
 * Purpose:
 * Dynamically loads footer.html into all pages.
 * All pages now use unified structure: .page-wrapper > .page-container > main
 * Footer is injected inside .page-wrapper, after .page-container (same for all pages)
 * 
 * Usage:
 * Add <script src="./footer-loader.js"></script> before closing </body> tag in all pages.
 */

(function loadFooter() {
  'use strict';
  
  // Wait for DOM to be ready
  function initFooter() {
    // Check if footer already exists (prevent duplicate)
    if (document.querySelector('footer.page-footer')) {
      console.warn('Phoenix Footer Loader: Footer already exists. Skipping load.');
      return;
    }
    
    // Load footer.html
    fetch('./footer.html')
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
        
        // Find the footer element
        const footer = tempDiv.querySelector('footer.page-footer');
        if (!footer) {
          console.warn('Phoenix Footer Loader: footer element not found in footer.html');
          return;
        }
        
        // All pages now use unified structure: .page-wrapper > .page-container > main
        const pageWrapper = document.querySelector('.page-wrapper');
        
        if (pageWrapper) {
          // Insert footer inside .page-wrapper, after .page-container (unified for all pages)
          const pageContainer = pageWrapper.querySelector('.page-container');
          if (pageContainer && pageContainer.nextSibling) {
            // Insert after page-container, before any other siblings
            pageWrapper.insertBefore(footer, pageContainer.nextSibling);
          } else {
            // Append to page-wrapper if no next sibling
            pageWrapper.appendChild(footer);
          }
        } else {
          // Fallback: Append to body if .page-wrapper not found (should not happen)
          console.warn('Phoenix Footer Loader: .page-wrapper not found. Appending footer to body.');
          document.body.appendChild(footer);
        }
      })
      .catch(error => {
        console.error('Phoenix Footer Loader: Failed to load footer.html', error);
      });
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooter);
  } else {
    // DOM already loaded
    initFooter();
  }
})();
