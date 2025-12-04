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
 * - Scroll and resize handling
 *
 * Documentation: See documentation/03-DEVELOPMENT/GUIDES/WIDGET_OVERLAY_SERVICE_GUIDE.md
 *
 * Function Index:
 * - positionOverlay(item, details, options) - Position overlay relative to item
 * - setupOverlayHover(listElement, itemSelector, detailsSelector, options) - Setup hover handlers
 * - destroy(listElement) - Cleanup event listeners
 * - updatePosition(item, details, options) - Update overlay position (for scroll/resize)
 */

;(function widgetOverlayServiceFactory() {
  'use strict';

  // Track active overlays for cleanup
  const activeOverlays = new WeakMap();
  
  // REMOVED: gapBridges - no longer needed with simple li-based hover

  /**
   * Calculate and position overlay using fixed positioning to extend beyond container
   * 
   * IMPORTANT: With position: fixed, getBoundingClientRect() already returns viewport-relative
   * coordinates, so we do NOT need window.scrollY/scrollX offsets.
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
    
    // Position below item (viewport-relative, no scroll offsets needed)
    // IMPORTANT: getBoundingClientRect() returns viewport-relative coordinates
    // position: fixed also uses viewport-relative coordinates
    // So we can use itemRect.bottom directly without adding scrollY
    let top = itemRect.bottom + config.gap;
    let left = itemRect.left;
    let right = 'auto';
    
    // Debug logging (can be removed later)
    if (window.TestWidgetsOverlayLogger && window.TestWidgetsOverlayLogger.log) {
      window.TestWidgetsOverlayLogger.log('debug', 'positionOverlay calculation', {
        itemRect: {
          top: itemRect.top,
          bottom: itemRect.bottom,
          left: itemRect.left,
          right: itemRect.right,
          width: itemRect.width,
          height: itemRect.height
        },
        overlayDimensions: {
          width: overlayWidth,
          height: overlayHeight
        },
        calculatedTop: top,
        calculatedLeft: left,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          scrollY: window.scrollY,
          scrollX: window.scrollX
        }
      });
    }
    
    // For RTL, position from right but still below item
    if (isRTL) {
      left = 'auto';
      // In RTL, align overlay's right edge to item's right edge
      // right = distance from viewport right edge to item's right edge
      right = window.innerWidth - itemRect.right;
    } else {
      // Align overlay to item's left edge
      left = itemRect.left;
    }
    
    // Check if overlay goes beyond viewport bottom
    if (top + overlayHeight > window.innerHeight - config.gap) {
      // Position above item instead
      top = itemRect.top - overlayHeight - config.gap;
      // If still doesn't fit, position at viewport top
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
    
    // Apply fixed positioning (viewport-relative, no scroll offsets)
    details.style.position = 'fixed';
    details.style.top = `${top}px`;
    if (isRTL) {
      details.style.right = typeof right === 'number' ? `${right}px` : 'auto';
      details.style.left = 'auto';
    } else {
      details.style.left = `${left}px`;
      details.style.right = 'auto';
    }
    
    // Force reflow to ensure styles are applied
    void details.offsetHeight;
    
    // Verify final position after applying styles
    if (window.TestWidgetsOverlayLogger && window.TestWidgetsOverlayLogger.logElementPosition) {
      window.TestWidgetsOverlayLogger.logElementPosition(details, 'Overlay after positioning');
    }
    details.style.width = `${overlayWidth}px`;
    details.style.maxWidth = `${config.maxWidth}px`;
    details.style.minWidth = `${config.minWidth}px`;
    
    // Use WidgetZIndexManager for dynamic z-index management
    if (window.WidgetZIndexManager) {
      const zIndex = window.WidgetZIndexManager.registerOverlay(details, item);
      details.style.zIndex = zIndex;
    } else {
      // Fallback to config z-index if WidgetZIndexManager not available
      details.style.zIndex = config.zIndex;
    }
    
    if (!wasVisible) {
      details.style.visibility = '';
      details.style.opacity = '1';
    }
  }

  /**
   * Update overlay position (for scroll/resize events)
   */
  function updatePosition(item, details, options = {}) {
    if (!item || !details) {
      return;
    }
    
    // Only update if overlay is currently visible
    if (details.style.display === 'none' || details.style.visibility === 'hidden') {
      return;
    }
    
    positionOverlay(item, details, options);
  }

  /**
   * Create gap bridges between items to handle hover in gaps
   * Gap bridges are invisible elements that fill the gaps between items
   * 
   * @param {HTMLElement} listElement - The list container
   * @param {string} itemSelector - CSS selector for items
   * @param {Object} config - Configuration
   * @returns {Array} Array of bridge elements created
   */
  function createGapBridges(listElement, itemSelector, config) {
    const items = Array.from(listElement.querySelectorAll(itemSelector));
    const bridges = [];
    
    if (items.length < 2) {
      return bridges; // No gaps if less than 2 items
    }
    
    // Get computed styles to detect gap size
    const firstItem = items[0];
    const firstItemStyle = window.getComputedStyle(firstItem);
    const marginBottom = parseFloat(firstItemStyle.marginBottom) || 0;
    const paddingBottom = parseFloat(firstItemStyle.paddingBottom) || 0;
    const gapSize = marginBottom + paddingBottom;
    
    if (gapSize <= 0) {
      return bridges; // No gap to bridge
    }
    
    // Create bridges between items
    for (let i = 0; i < items.length - 1; i++) {
      const currentItem = items[i];
      const nextItem = items[i + 1];
      
      const currentRect = currentItem.getBoundingClientRect();
      const nextRect = nextItem.getBoundingClientRect();
      
      // Calculate gap position and size
      const gapTop = currentRect.bottom;
      const gapBottom = nextRect.top;
      const gapHeight = gapBottom - gapTop;
      
      if (gapHeight <= 0) {
        continue; // No gap
      }
      
      // Create bridge element
      const bridge = document.createElement('div');
      bridge.className = 'widget-overlay-gap-bridge';
      bridge.setAttribute('data-gap-bridge', 'true');
      bridge.setAttribute('data-bridge-index', i.toString());
      
      // Position bridge absolutely within list (or use fixed if list is positioned)
      const listRect = listElement.getBoundingClientRect();
      const isListFixed = window.getComputedStyle(listElement).position === 'fixed';
      
      if (isListFixed) {
        bridge.style.position = 'fixed';
        bridge.style.top = `${gapTop}px`;
        bridge.style.left = `${listRect.left}px`;
        bridge.style.width = `${listRect.width}px`;
        bridge.style.height = `${gapHeight}px`;
      } else {
        // Calculate relative position
        const relativeTop = gapTop - listRect.top + listElement.scrollTop;
        bridge.style.position = 'absolute';
        bridge.style.top = `${relativeTop}px`;
        bridge.style.left = '0';
        bridge.style.width = '100%';
        bridge.style.height = `${gapHeight}px`;
      }
      
      // Make bridge invisible but interactive
      bridge.style.background = 'transparent';
      bridge.style.pointerEvents = 'auto';
      bridge.style.zIndex = '5'; // Between items (1) and hovered items (10)
      bridge.style.opacity = '0';
      
      // Store reference to adjacent items
      bridge.dataset.prevItemIndex = i.toString();
      bridge.dataset.nextItemIndex = (i + 1).toString();
      
      // Insert bridge after current item
      currentItem.insertAdjacentElement('afterend', bridge);
      
      bridges.push(bridge);
    }
    
    // Store bridges for cleanup
    gapBridges.set(listElement, bridges);
    
    window.Logger?.debug?.('WidgetOverlayService: Gap bridges created', {
      count: bridges.length,
      gapSize,
      listElement: listElement.id || listElement.className,
      page: 'widget-overlay-service'
    });
    
    return bridges;
  }

  /**
   * Remove gap bridges
   * 
   * @param {HTMLElement} listElement - The list container
   */
  function removeGapBridges(listElement) {
    const bridges = gapBridges.get(listElement);
    if (!bridges || bridges.length === 0) {
      return;
    }
    
    bridges.forEach(bridge => {
      if (bridge.parentNode) {
        bridge.parentNode.removeChild(bridge);
      }
    });
    
    gapBridges.delete(listElement);
    
    window.Logger?.debug?.('WidgetOverlayService: Gap bridges removed', {
      count: bridges.length,
      listElement: listElement.id || listElement.className,
      page: 'widget-overlay-service'
    });
  }

  /**
   * Setup hover handlers for widget items with overlay details
   * 
   * @param {HTMLElement} listElement - The list container element
   * @param {string} itemSelector - CSS selector for items (e.g., '.widget-item')
   * @param {string} detailsSelector - CSS selector for details container (e.g., '.widget-item-details')
   * @param {Object} options - Configuration options
   * @param {string} options.hoverClass - CSS class to add on hover (default: 'is-hovered')
   * @param {number} options.transitionDuration - Transition duration in ms (default: 200)
   * @param {number} options.gap - Gap between item and overlay (default: 8)
   * @param {number} options.minWidth - Minimum overlay width (default: 280)
   * @param {number} options.maxWidth - Maximum overlay width (default: 400)
   * @param {number} options.zIndex - Z-index for overlay (default: 1050)
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

    // Simple mouse enter handler - only on li items
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
        window.Logger?.debug?.('WidgetOverlayService: Details container not found', {
          item: item.id || item.className,
          detailsSelector,
          page: 'widget-overlay-service'
        });
        if (window.TestWidgetsOverlayLogger) {
          window.TestWidgetsOverlayLogger.log('warn', 'Details container not found', {
            item: item.id || item.className,
            detailsSelector
          });
        }
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
      
      // Position overlay using requestAnimationFrame to ensure DOM is ready
      // IMPORTANT: We need to recalculate position on every hover to account for scroll changes
      requestAnimationFrame(() => {
        // Recalculate item position in case of scroll
        const currentItemRect = item.getBoundingClientRect();
        positionOverlay(item, details, config);
        // Log element position after positioning
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
          if (!relatedTarget || !item.contains(relatedTarget)) {
            item.classList.remove(config.hoverClass);
            details.style.opacity = '0';
            // Reset positioning after transition
            setTimeout(() => {
              if (!item.classList.contains(config.hoverClass)) {
                // Unregister from WidgetZIndexManager
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
        
        // Store handlers for cleanup
        details.dataset.hoverListenersAttached = 'true';
        details.dataset.overlayEnterHandler = 'handleOverlayEnter';
        details.dataset.overlayLeaveHandler = 'handleOverlayLeave';
      }
    };

    // Simple mouse leave handler - only when leaving li item (going outside)
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

    // Simple event delegation - listen on list, but only react to events on li items
    // Use capture phase to catch events on all child elements
    listElement.addEventListener('mouseenter', handleMouseEnter, true);
    listElement.addEventListener('mouseleave', handleMouseLeave, true);

    // Store for cleanup
    activeOverlays.set(listElement, overlayConfig);

    window.Logger?.debug?.('WidgetOverlayService: Hover handlers attached', {
      listElement: listElement.id || listElement.className,
      itemSelector,
      detailsSelector,
      page: 'widget-overlay-service'
    });
  }

  /**
   * Destroy overlay handlers and cleanup
   * 
   * @param {HTMLElement} listElement - The list container element to cleanup
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
    items.forEach((item) => {
      const details = item.querySelector(overlayConfig.detailsSelector);
      if (details && details.dataset.hoverListenersAttached === 'true') {
        // Note: We can't remove anonymous functions, but we can mark them as removed
        details.dataset.hoverListenersAttached = 'false';
      }
    });

    // Remove from active overlays
    activeOverlays.delete(listElement);

    window.Logger?.debug?.('WidgetOverlayService: Handlers removed', {
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

  window.Logger?.info?.('✅ Widget Overlay Service loaded', { page: 'widget-overlay-service' });
})();


