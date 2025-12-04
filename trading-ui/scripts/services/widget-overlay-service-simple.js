/**
 * Widget Overlay Service - Simplified Version
 * ===========================================
 *
 * SIMPLE APPROACH:
 * - Each li is the active area
 * - mouseenter on li = open overlay
 * - mouseleave from li (going outside) = close overlay
 * - No gap bridges, no mousemove handlers, no complexity
 */

;(function widgetOverlayServiceFactory() {
  'use strict';

  // Track active overlays for cleanup
  const activeOverlays = new WeakMap();

  /**
   * Calculate and position overlay using fixed positioning
   */
  function positionOverlay(item, details, options = {}) {
    if (!item || !details) {
      return;
    }

    const config = {
      gap: options.gap || 8,
      minWidth: options.minWidth || 280,
      maxWidth: options.maxWidth || 400,
      zIndex: options.zIndex || 1050,
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
    
    // Force reflow to get actual dimensions
    void details.offsetWidth;
    
    const overlayWidth = Math.max(details.offsetWidth || config.minWidth, config.minWidth);
    const overlayHeight = details.offsetHeight || 150;
    
    // Position below item (viewport-relative)
    let top = itemRect.bottom + config.gap;
    let left = itemRect.left;
    let right = 'auto';
    
    // For RTL, position from right
    if (isRTL) {
      left = 'auto';
      right = window.innerWidth - itemRect.right;
    }
    
    // Check if overlay goes beyond viewport bottom
    if (top + overlayHeight > window.innerHeight - config.gap) {
      // Position above item instead
      top = itemRect.top - overlayHeight - config.gap;
      if (top < config.gap) {
        top = config.gap;
      }
    }
    
    // Check horizontal overflow
    if (!isRTL) {
      if (left + overlayWidth > window.innerWidth - config.gap) {
        left = window.innerWidth - overlayWidth - config.gap;
      }
      if (left < config.gap) {
        left = config.gap;
      }
    } else {
      if (typeof right === 'number' && right + overlayWidth > window.innerWidth - config.gap) {
        right = window.innerWidth - overlayWidth - config.gap;
      }
      if (typeof right === 'number' && right < config.gap) {
        right = config.gap;
      }
    }
    
    // Apply fixed positioning
    details.style.position = 'fixed';
    details.style.top = `${top}px`;
    if (isRTL) {
      details.style.right = typeof right === 'number' ? `${right}px` : 'auto';
      details.style.left = 'auto';
    } else {
      details.style.left = `${left}px`;
      details.style.right = 'auto';
    }
    
    details.style.width = `${overlayWidth}px`;
    details.style.maxWidth = `${config.maxWidth}px`;
    details.style.minWidth = `${config.minWidth}px`;
    
    // Use WidgetZIndexManager for dynamic z-index management
    if (window.WidgetZIndexManager) {
      const zIndex = window.WidgetZIndexManager.registerOverlay(details, item);
      details.style.zIndex = zIndex;
    } else {
      details.style.zIndex = config.zIndex;
    }
    
    if (!wasVisible) {
      details.style.visibility = '';
      details.style.opacity = '1';
    }
  }

  /**
   * Setup hover handlers - SIMPLE VERSION
   * Each li is the active area, mouseenter/mouseleave handle everything
   */
  function setupOverlayHover(listElement, itemSelector, detailsSelector, options = {}) {
    if (!listElement) {
      window.Logger?.warn?.('WidgetOverlayService: List element not provided', { page: 'widget-overlay-service' });
      return;
    }

    const config = {
      hoverClass: options.hoverClass || 'is-hovered',
      transitionDuration: options.transitionDuration || 200,
      gap: options.gap || 8,
      minWidth: options.minWidth || 280,
      maxWidth: options.maxWidth || 400,
      zIndex: options.zIndex || 1050,
      ...options
    };

    // Store config for cleanup
    const overlayConfig = {
      listElement,
      itemSelector,
      detailsSelector,
      config,
      handlers: {}
    };
    
    // Log overlay setup
    if (window.TestWidgetsOverlayLogger) {
      window.TestWidgetsOverlayLogger.logOverlaySetup(listElement, itemSelector, detailsSelector, config);
    }

    // SIMPLE mouse enter handler - only on li items
    const handleMouseEnter = function(event) {
      if (!event || !event.target) {
        return;
      }
      
      // Find the li item that contains the target (or is the target)
      const item = event.target.closest ? event.target.closest(itemSelector) : null;
      
      if (!item) {
        return;
      }

      const details = item.querySelector(detailsSelector);
      if (!details) {
        return;
      }
      
      // Log mouse event
      if (window.TestWidgetsOverlayLogger) {
        window.TestWidgetsOverlayLogger.logMouseEvent('mouseenter', event, item, details);
      }

      // Mark item as hovered
      item.classList.add(config.hoverClass);
      
      // Show details immediately
      details.style.display = 'block';
      details.style.visibility = 'visible';
      details.style.pointerEvents = 'auto';
      
      // Position overlay
      requestAnimationFrame(() => {
        positionOverlay(item, details, config);
        if (window.TestWidgetsOverlayLogger) {
          window.TestWidgetsOverlayLogger.logElementPosition(item, 'Item after positioning');
          window.TestWidgetsOverlayLogger.logElementPosition(details, 'Overlay after positioning');
        }
      });
      
      // Handle hover on overlay itself to keep it open
      if (!details.dataset.hoverListenersAttached) {
        const handleOverlayEnter = () => {
          item.classList.add(config.hoverClass);
          details.style.opacity = '1';
        };
        
        const handleOverlayLeave = (e) => {
          const relatedTarget = e.relatedTarget;
          // Only close if mouse is going outside (not to another item)
          if (!relatedTarget || (!item.contains(relatedTarget) && !relatedTarget.closest(itemSelector))) {
            item.classList.remove(config.hoverClass);
            details.style.opacity = '0';
            setTimeout(() => {
              if (!item.classList.contains(config.hoverClass)) {
                if (window.WidgetZIndexManager) {
                  window.WidgetZIndexManager.unregisterOverlay(details);
                }
                
                details.style.display = 'none';
                details.style.position = '';
                details.style.top = '';
                details.style.left = '';
                details.style.right = '';
                details.style.width = '';
                details.style.zIndex = '';
                details.style.visibility = '';
                details.style.opacity = '';
              }
            }, config.transitionDuration);
          }
        };
        
        details.addEventListener('mouseenter', handleOverlayEnter);
        details.addEventListener('mouseleave', handleOverlayLeave);
        
        details.dataset.hoverListenersAttached = 'true';
      }
    };

    // SIMPLE mouse leave handler - only when leaving li item (going outside)
    const handleMouseLeave = function(event) {
      if (!event || !event.target) {
        return;
      }
      
      // Find the li item that contains the target (or is the target)
      const item = event.target.closest ? event.target.closest(itemSelector) : null;
      
      if (!item) {
        return;
      }

      const relatedTarget = event.relatedTarget;
      const details = item.querySelector(detailsSelector);
      
      // Check if mouse is moving to overlay (keep it open)
      if (details && relatedTarget && details.contains(relatedTarget)) {
        return;
      }
      
      // Check if mouse is moving to another item (don't close)
      if (relatedTarget && relatedTarget.closest && relatedTarget.closest(itemSelector)) {
        return;
      }
      
      // Mouse is leaving the item - going outside
      item.classList.remove(config.hoverClass);
      
      // Hide overlay
      if (details) {
        details.style.opacity = '0';
        setTimeout(() => {
          if (!item.classList.contains(config.hoverClass)) {
            if (window.WidgetZIndexManager) {
              window.WidgetZIndexManager.unregisterOverlay(details);
            }
            
            details.style.display = 'none';
            details.style.position = '';
            details.style.top = '';
            details.style.left = '';
            details.style.right = '';
            details.style.width = '';
            details.style.zIndex = '';
            details.style.visibility = '';
            details.style.opacity = '';
          }
        }, config.transitionDuration);
      }
    };

    // Store handlers
    overlayConfig.handlers.mouseenter = handleMouseEnter;
    overlayConfig.handlers.mouseleave = handleMouseLeave;

    // Simple event delegation - listen on list, react to events on li items
    listElement.addEventListener('mouseenter', handleMouseEnter, true);
    listElement.addEventListener('mouseleave', handleMouseLeave, true);

    // Store for cleanup
    activeOverlays.set(listElement, overlayConfig);

    window.Logger?.info?.('WidgetOverlayService: Hover handlers attached (simple mode)', {
      listElement: listElement.id || listElement.className,
      itemSelector,
      detailsSelector,
      page: 'widget-overlay-service'
    });
  }

  /**
   * Update overlay position (for scroll/resize events)
   */
  function updatePosition(item, details, options = {}) {
    if (!item || !details) {
      return;
    }
    
    if (details.style.display === 'none' || details.style.visibility === 'hidden') {
      return;
    }
    
    positionOverlay(item, details, options);
  }

  /**
   * Destroy overlay handlers and cleanup
   */
  function destroy(listElement) {
    if (!listElement) {
      return;
    }

    const overlayConfig = activeOverlays.get(listElement);
    if (!overlayConfig) {
      return;
    }
    
    // Remove event listeners
    if (overlayConfig.handlers.mouseenter) {
      listElement.removeEventListener('mouseenter', overlayConfig.handlers.mouseenter, true);
    }
    if (overlayConfig.handlers.mouseleave) {
      listElement.removeEventListener('mouseleave', overlayConfig.handlers.mouseleave, true);
    }

    // Cleanup all overlay listeners
    const items = listElement.querySelectorAll(overlayConfig.itemSelector);
    items.forEach(item => {
      const details = item.querySelector(overlayConfig.detailsSelector);
      if (details && details.dataset.hoverListenersAttached === 'true') {
        // Remove overlay event listeners
        const overlayEnter = details.onmouseenter;
        const overlayLeave = details.onmouseleave;
        if (overlayEnter) {
          details.removeEventListener('mouseenter', overlayEnter);
        }
        if (overlayLeave) {
          details.removeEventListener('mouseleave', overlayLeave);
        }
        delete details.dataset.hoverListenersAttached;
      }
    });

    activeOverlays.delete(listElement);

    window.Logger?.info?.('WidgetOverlayService: Handlers removed', {
      listElement: listElement.id || listElement.className,
      page: 'widget-overlay-service'
    });
  }

  // Export public API
  window.WidgetOverlayService = {
    positionOverlay,
    setupOverlayHover,
    updatePosition,
    destroy
  };

  window.Logger?.info?.('✅ Widget Overlay Service loaded (simple mode)', { page: 'widget-overlay-service' });
})();

