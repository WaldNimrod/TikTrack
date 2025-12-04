/**
 * Widget Overlay Service - Floating UI Version
 * ===========================================
 *
 * This is an alternative implementation using Floating UI library
 * for smart overlay positioning that handles all edge cases automatically.
 *
 * Benefits:
 * - Automatic handling of transform, overflow, viewport boundaries
 * - Full RTL support
 * - Lightweight (~3KB gzipped)
 * - Battle-tested and actively maintained
 *
 * Usage:
 * 1. Load Floating UI from CDN: https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.6.0/dist/floating-ui.dom.min.js
 * 2. Replace widget-overlay-service.js with this file
 * 3. Or use both and switch based on availability
 */

;(function widgetOverlayServiceFloatingUIFactory() {
  'use strict';

  // Check if Floating UI is available
  const hasFloatingUI = typeof window.FloatingUIDOM !== 'undefined' || 
                        (typeof window !== 'undefined' && window.computePosition);

  if (!hasFloatingUI) {
    window.Logger?.warn?.('Floating UI not available, falling back to manual positioning', {
      page: 'widget-overlay-service-floating-ui'
    });
    // Fallback to manual positioning if Floating UI not available
    return;
  }

  // Track active overlays for cleanup
  const activeOverlays = new WeakMap();

  /**
   * Position overlay using Floating UI
   */
  async function positionOverlay(item, details, options = {}) {
    if (!item || !details) {
      return;
    }

    const config = {
      gap: options.gap || 8,
      minWidth: options.minWidth || 280,
      maxWidth: options.maxWidth || 400,
      zIndex: options.zIndex || 1050,
      placement: options.placement || 'bottom-start', // bottom-start aligns with left edge
      ...options
    };

    // Get Floating UI functions
    const { computePosition, flip, shift, offset, size } = window.FloatingUIDOM || {
      computePosition: window.computePosition,
      flip: window.flip,
      shift: window.shift,
      offset: window.offset,
      size: window.size
    };

    if (!computePosition) {
      window.Logger?.warn?.('Floating UI computePosition not available', {
        page: 'widget-overlay-service-floating-ui'
      });
      return;
    }

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

    try {
      // Compute position using Floating UI
      const { x, y, placement, middlewareData } = await computePosition(item, details, {
        placement: config.placement,
        middleware: [
          offset(config.gap),
          flip({
            fallbackPlacements: ['top-start', 'bottom-start', 'top-end', 'bottom-end']
          }),
          shift({
            padding: config.gap,
            boundary: 'viewport'
          }),
          size({
            apply({ availableWidth, availableHeight, elements }) {
              // Constrain overlay size
              elements.floating.style.width = `${Math.min(
                Math.max(config.minWidth, availableWidth),
                config.maxWidth
              )}px`;
              elements.floating.style.maxHeight = `${availableHeight}px`;
            }
          })
        ],
        strategy: 'fixed' // Use fixed positioning
      });

      // Apply position
      details.style.position = 'fixed';
      details.style.left = `${x}px`;
      details.style.top = `${y}px`;
      details.style.right = 'auto';
      details.style.bottom = 'auto';

      // Set width constraints
      details.style.minWidth = `${config.minWidth}px`;
      details.style.maxWidth = `${config.maxWidth}px`;

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

      // Log positioning info if debugger available
      if (window.TestWidgetsOverlayLogger) {
        window.TestWidgetsOverlayLogger.logPositioningDebug?.({
          floatingUI: true,
          placement,
          x,
          y,
          middlewareData
        });
      }

    } catch (error) {
      window.Logger?.error?.('Error positioning overlay with Floating UI', {
        error: error.message,
        page: 'widget-overlay-service-floating-ui'
      });
    }
  }

  /**
   * Setup hover handlers - SIMPLE VERSION with Floating UI
   */
  function setupOverlayHover(listElement, itemSelector, detailsSelector, options = {}) {
    if (!listElement) {
      window.Logger?.warn?.('WidgetOverlayService: List element not provided', {
        page: 'widget-overlay-service-floating-ui'
      });
      return;
    }

    const config = {
      hoverClass: options.hoverClass || 'is-hovered',
      transitionDuration: options.transitionDuration || 200,
      closeDelay: options.closeDelay || 150,
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
      handlers: {},
      closeTimeouts: new WeakMap()
    };

    // Event handlers
    const handleMouseEnter = function(event) {
      const item = event.target.closest(itemSelector);
      if (!item) {
        return;
      }

      const details = item.querySelector(detailsSelector) || 
                     listElement.querySelector(`${detailsSelector}[data-item-id="${item.dataset.itemId || ''}"]`);
      
      if (!details) {
        return;
      }

      // Cancel any pending close timeout
      const existingTimeout = overlayConfig.closeTimeouts.get(item);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        overlayConfig.closeTimeouts.delete(item);
      }

      // Mark item as hovered
      item.classList.add(config.hoverClass);

      // Show details immediately
      details.style.display = 'block';
      details.style.opacity = '0';

      // Position overlay using Floating UI
      requestAnimationFrame(async () => {
        await positionOverlay(item, details, config);
        
        // Auto-inspect if debugger available
        if (window.WidgetOverlayDebugger) {
          window.WidgetOverlayDebugger.inspectOverlay(item, details);
        }
      });

      // Handle hover on overlay itself
      const handleOverlayEnter = () => {
        item.classList.add(config.hoverClass);
      };
      const handleOverlayLeave = () => {
        handleMouseLeave.call(item, { target: item });
      };

      details.addEventListener('mouseenter', handleOverlayEnter);
      details.addEventListener('mouseleave', handleOverlayLeave);
    };

    const handleMouseLeave = function(event) {
      const item = event.target.closest(itemSelector);
      if (!item) {
        return;
      }

      const details = item.querySelector(detailsSelector) || 
                     listElement.querySelector(`${detailsSelector}[data-item-id="${item.dataset.itemId || ''}"]`);
      
      if (!details) {
        return;
      }

      // Add delay before closing
      const closeDelay = config.closeDelay || 150;

      // Cancel any existing timeout
      const existingTimeout = overlayConfig.closeTimeouts.get(item);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout for closing
      const closeTimeout = setTimeout(() => {
        overlayConfig.closeTimeouts.delete(item);
        // Double-check that mouse is still not over item or overlay
        if (!item.classList.contains(config.hoverClass)) {
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
        }
      }, closeDelay);
      overlayConfig.closeTimeouts.set(item, closeTimeout);
    };

    // Use event delegation on list element
    listElement.addEventListener('mouseenter', handleMouseEnter, true);
    listElement.addEventListener('mouseleave', handleMouseLeave, true);

    // Store handlers for cleanup
    overlayConfig.handlers = {
      mouseenter: handleMouseEnter,
      mouseleave: handleMouseLeave
    };

    // Store config
    activeOverlays.set(listElement, overlayConfig);
  }

  /**
   * Destroy overlay handlers for a list element
   */
  function destroy(listElement) {
    const config = activeOverlays.get(listElement);
    if (!config) {
      return;
    }

    // Remove event listeners
    if (config.handlers.mouseenter) {
      listElement.removeEventListener('mouseenter', config.handlers.mouseenter, true);
    }
    if (config.handlers.mouseleave) {
      listElement.removeEventListener('mouseleave', config.handlers.mouseleave, true);
    }

    // Clear all timeouts
    const items = listElement.querySelectorAll(config.itemSelector);
    items.forEach(item => {
      const timeout = config.closeTimeouts.get(item);
      if (timeout) {
        clearTimeout(timeout);
      }
    });

    // Remove from active overlays
    activeOverlays.delete(listElement);
  }

  // Export to global scope
  window.WidgetOverlayServiceFloatingUI = {
    setupOverlayHover,
    positionOverlay,
    destroy,
    hasFloatingUI: true
  };

  window.Logger?.info?.('WidgetOverlayService (Floating UI) initialized', {
    page: 'widget-overlay-service-floating-ui'
  });

})();

