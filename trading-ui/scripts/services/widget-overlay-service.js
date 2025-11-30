/**
 * Widget Overlay Service - TikTrack
 * ==================================
 *
 * Shared service for widget hover overlay functionality.
 * Used by widgets that need to display expandable details on hover.
 *
 * This service provides:
 * - Overlay positioning (RTL/LTR support)
 * - Hover event handling
 * - Overlay lifecycle management
 *
 * Documentation: See documentation/03-DEVELOPMENT/GUIDES/WIDGET_STANDARDS_SUMMARY.md
 *
 * Function Index:
 * - positionOverlay(item, details, options) - Position overlay relative to item
 * - setupOverlayHover(listElement, itemSelector, detailsSelector, options) - Setup hover handlers
 */

;(function widgetOverlayServiceFactory() {
  'use strict';

  /**
   * Calculate and position overlay using fixed positioning to extend beyond container
   */
  function positionOverlay(item, details, options = {}) {
    if (!item || !details) {
      return;
    }

    const config = {
      gap: options.gap || 8,
      minWidth: options.minWidth || 280,
      maxWidth: options.maxWidth || 400,
      zIndex: options.zIndex || 9999,
      ...options
    };

    const itemRect = item.getBoundingClientRect();
    const isRTL = document.documentElement.dir === 'rtl' || 
                  getComputedStyle(document.body).direction === 'rtl';
    
    // Temporarily show overlay to get dimensions
    const wasVisible = details.style.display !== 'none';
    if (!wasVisible) {
      details.style.position = 'fixed';
      details.style.visibility = 'hidden';
      details.style.opacity = '0';
      details.style.display = 'block';
    }
    
    const overlayWidth = details.offsetWidth || config.minWidth;
    const overlayHeight = details.offsetHeight || 150;
    
    // Position below item
    let top = itemRect.bottom + config.gap;
    let left = itemRect.left;
    let right = 'auto';
    
    // For RTL, position from right
    if (isRTL) {
      left = 'auto';
      right = window.innerWidth - itemRect.right;
    }
    
    // Check if overlay goes beyond viewport bottom
    if (top + overlayHeight > window.innerHeight) {
      // Position above item instead
      top = itemRect.top - overlayHeight - config.gap;
      // If still doesn't fit, position at viewport top
      if (top < 0) {
        top = config.gap;
      }
    }
    
    // Check horizontal overflow
    if (!isRTL && left + overlayWidth > window.innerWidth) {
      left = window.innerWidth - overlayWidth - config.gap;
      if (left < config.gap) left = config.gap;
    } else if (isRTL && typeof right === 'number' && right + overlayWidth > window.innerWidth) {
      right = window.innerWidth - overlayWidth - config.gap;
      if (right < config.gap) right = config.gap;
    }
    
    // Apply fixed positioning
    details.style.position = 'fixed';
    details.style.top = `${top}px`;
    if (isRTL) {
      details.style.right = `${right}px`;
      details.style.left = 'auto';
    } else {
      details.style.left = `${left}px`;
      details.style.right = 'auto';
    }
    details.style.width = `${overlayWidth}px`;
    details.style.maxWidth = `${config.maxWidth}px`;
    details.style.minWidth = `${config.minWidth}px`;
    details.style.zIndex = config.zIndex;
    
    if (!wasVisible) {
      details.style.visibility = '';
      details.style.display = '';
    }
  }

  /**
   * Setup hover handlers for widget items with overlay details
   */
  function setupOverlayHover(listElement, itemSelector, detailsSelector, options = {}) {
    if (!listElement) {
      window.Logger?.warn?.('WidgetOverlayService: List element not provided', { page: 'widget-overlay-service' });
      return;
    }

    const config = {
      hoverClass: options.hoverClass || 'is-hovered',
      transitionDuration: options.transitionDuration || 200,
      ...options
    };

    // Use event delegation for better performance
    listElement.addEventListener('mouseenter', function(event) {
      const item = event.target.closest(itemSelector);
      if (!item) return;

      const details = item.querySelector(detailsSelector);
      if (!details) return;

      // Mark item as hovered
      item.classList.add(config.hoverClass);
      
      // Show details immediately
      details.style.display = 'block';
      details.style.visibility = 'visible';
      details.style.pointerEvents = 'auto';
      
      // Position overlay using requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        positionOverlay(item, details, config);
        // Trigger opacity transition
        setTimeout(() => {
          if (item.classList.contains(config.hoverClass)) {
            details.style.opacity = '1';
            details.style.transform = 'translateY(0)';
          }
        }, 10);
      });
      
      // Handle hover on overlay itself to keep it open
      if (!details.dataset.hoverListenersAttached) {
        details.addEventListener('mouseenter', () => {
          item.classList.add(config.hoverClass);
          details.style.opacity = '1';
        });
        
        details.addEventListener('mouseleave', (e) => {
          const relatedTarget = e.relatedTarget;
          if (!relatedTarget || !item.contains(relatedTarget)) {
            item.classList.remove(config.hoverClass);
            details.style.opacity = '0';
            // Reset positioning after transition
            setTimeout(() => {
              if (!item.classList.contains(config.hoverClass)) {
                details.style.position = '';
                details.style.top = '';
                details.style.left = '';
                details.style.right = '';
                details.style.width = '';
                details.style.zIndex = '';
              }
            }, config.transitionDuration);
          }
        });
        
        details.dataset.hoverListenersAttached = 'true';
      }
    }, true); // Use capture phase

    listElement.addEventListener('mouseleave', function(event) {
      const item = event.target.closest(itemSelector);
      if (!item) return;

      const relatedTarget = event.relatedTarget;
      const details = item.querySelector(detailsSelector);
      
      // Check if mouse is moving to overlay
      if (details && relatedTarget && details.contains(relatedTarget)) {
        return; // Keep overlay visible
      }
      
      item.classList.remove(config.hoverClass);
      
      // Hide overlay
      if (details) {
        details.style.opacity = '0';
        // Reset positioning after transition
        setTimeout(() => {
          if (!item.classList.contains(config.hoverClass)) {
            details.style.position = '';
            details.style.top = '';
            details.style.left = '';
            details.style.right = '';
            details.style.width = '';
            details.style.zIndex = '';
          }
        }, config.transitionDuration);
      }
    }, true); // Use capture phase
  }

  // Export public API
  window.WidgetOverlayService = {
    positionOverlay,
    setupOverlayHover
  };

  window.Logger?.info?.('✅ Widget Overlay Service loaded', { page: 'widget-overlay-service' });
})();


