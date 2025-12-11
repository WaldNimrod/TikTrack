/**
 * Unified UI Positioning Service
 * ===============================
 * 
 * Central service for UI element positioning using Floating UI library.
 * Provides a unified API for all overlay/tooltip positioning needs across the system.
 * 
 * Features:
 * - Automatic positioning with Floating UI (handles transform, overflow, viewport boundaries)
 * - Full RTL support
 * - Fallback to manual positioning if Floating UI not available
 * - Integration with WidgetZIndexManager
 * - GSAP animations support (optional)
 * 
 * Documentation: See documentation/03-DEVELOPMENT/GUIDES/UNIFIED_UI_POSITIONING_GUIDE.md
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - setupOverlay() - Setupoverlay

// === Event Handlers ===
// - positionElement() - Positionelement
// - positionWithFloatingUI() - Positionwithfloatingui
// - positionManually() - Positionmanually
// - handleOverlayEnter() - Handleoverlayenter
// - handleOverlayLeave() - Handleoverlayleave

// === Other ===
// - animateElement() - Animateelement
// - closeOverlayForItem() - Closeoverlayforitem
// - destroy() - Destroy
// - isAvailable() - Isavailable
// - isGSAPAvailable() - Isgsapavailable

;(function unifiedUIPositioningServiceFactory() {
  'use strict';

  // Check if Floating UI is available
  // Floating UI from CDN exposes functions directly on window
  const hasFloatingUI = typeof window !== 'undefined' && (
    typeof window.computePosition !== 'undefined' ||
    (typeof window.FloatingUIDOM !== 'undefined' && typeof window.FloatingUIDOM.computePosition !== 'undefined')
  );

  // Check if GSAP is available
  const hasGSAP = typeof window.gsap !== 'undefined';

  // Track active positioning instances for cleanup
  const activeInstances = new WeakMap();

  /**
   * Position element using Floating UI (if available) or fallback to manual positioning
   * @param {HTMLElement} referenceElement - Reference element (item)
   * @param {HTMLElement} floatingElement - Floating element (overlay)
   * @param {Object} options - Positioning options
   * @returns {Promise<void>}
   */
  async function positionElement(referenceElement, floatingElement, options = {}) {
    if (!referenceElement || !floatingElement) {
      return;
    }

    const config = {
      placement: options.placement || 'bottom-start',
      gap: options.gap || 8,
      minWidth: options.minWidth || 280,
      maxWidth: options.maxWidth || 400,
      zIndex: options.zIndex || 1050,
      strategy: options.strategy || 'fixed',
      middleware: options.middleware || [],
      ...options
    };

    // Use Floating UI if available
    if (hasFloatingUI) {
      return await positionWithFloatingUI(referenceElement, floatingElement, config);
    } else {
      // Fallback to manual positioning
      return positionManually(referenceElement, floatingElement, config);
    }
  }

  /**
   * Position element using Floating UI
   * @private
   */
  async function positionWithFloatingUI(referenceElement, floatingElement, config) {
    try {
      // Get Floating UI functions
      // Floating UI from CDN exposes functions directly on window
      const computePosition = window.computePosition || (window.FloatingUIDOM && window.FloatingUIDOM.computePosition);
      const flip = window.flip || (window.FloatingUIDOM && window.FloatingUIDOM.flip);
      const shift = window.shift || (window.FloatingUIDOM && window.FloatingUIDOM.shift);
      const offset = window.offset || (window.FloatingUIDOM && window.FloatingUIDOM.offset);
      const size = window.size || (window.FloatingUIDOM && window.FloatingUIDOM.size);

      if (!computePosition) {
        window.Logger?.warn?.('Floating UI computePosition not available, falling back to manual positioning', {
          page: 'unified-ui-positioning-service'
        });
        return positionManually(referenceElement, floatingElement, config);
      }

      // Temporarily show element to get dimensions
      const wasVisible = floatingElement.style.display !== 'none';
      if (!wasVisible) {
        floatingElement.style.position = config.strategy;
        floatingElement.style.visibility = 'hidden';
        floatingElement.style.opacity = '0';
        floatingElement.style.display = 'block';
      }

      // Force reflow to get actual dimensions
      void floatingElement.offsetWidth;

      // Build middleware array
      const middleware = [
        offset(config.gap),
        flip({
          fallbackPlacements: ['top-start', 'bottom-start', 'top-end', 'bottom-end'],
          fallbackAxisSideDirection: 'best-fit'
        }),
        shift({
          padding: config.gap,
          boundary: 'viewport'
        }),
        size({
          apply({ availableWidth, availableHeight, elements }) {
            // Constrain element size
            elements.floating.style.width = `${Math.min(
              Math.max(config.minWidth, availableWidth),
              config.maxWidth
            )}px`;
            elements.floating.style.maxHeight = `${availableHeight}px`;
          }
        }),
        ...config.middleware
      ];

      // Get reference element position for debugging
      const refRect = referenceElement.getBoundingClientRect();
      
      // Compute position
      const { x, y, placement, middlewareData } = await computePosition(
        referenceElement,
        floatingElement,
        {
          placement: config.placement,
          middleware,
          strategy: config.strategy
        }
      );

      // Debug: Log positioning result (only if TestWidgetsOverlayLogger is available)
      if (window.TestWidgetsOverlayLogger?.logPositioningDebug) {
        window.TestWidgetsOverlayLogger.logPositioningDebug({
          floatingUI: true,
          placement,
          x,
          y,
          referenceRect: {
            top: refRect.top,
            bottom: refRect.bottom,
            left: refRect.left,
            right: refRect.right,
            width: refRect.width,
            height: refRect.height
          }
        });
      }

      // Apply position
      floatingElement.style.position = config.strategy;
      floatingElement.style.left = `${x}px`;
      floatingElement.style.top = `${y}px`;
      floatingElement.style.right = 'auto';
      floatingElement.style.bottom = 'auto';

      // Set width constraints
      floatingElement.style.minWidth = `${config.minWidth}px`;
      floatingElement.style.maxWidth = `${config.maxWidth}px`;

      // Use WidgetZIndexManager for dynamic z-index management
      if (window.WidgetZIndexManager) {
        const zIndex = window.WidgetZIndexManager.registerOverlay(floatingElement, referenceElement);
        floatingElement.style.zIndex = zIndex;
      } else {
        floatingElement.style.zIndex = config.zIndex;
      }

      if (!wasVisible) {
        floatingElement.style.visibility = '';
        floatingElement.style.opacity = '1';
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
      window.Logger?.error?.('Error positioning element with Floating UI, falling back to manual positioning', {
        error: error.message,
        page: 'unified-ui-positioning-service'
      });
      return positionManually(referenceElement, floatingElement, config);
    }
  }

  /**
   * Manual positioning fallback (original logic)
   * @private
   */
  function positionManually(referenceElement, floatingElement, config) {
    // Get reference position
    const referenceRect = referenceElement.getBoundingClientRect();
    const isRTL = document.documentElement.dir === 'rtl' || 
                  getComputedStyle(document.body).direction === 'rtl';
    
    // Temporarily show element to get dimensions
    const wasVisible = floatingElement.style.display !== 'none';
    if (!wasVisible) {
      floatingElement.style.position = config.strategy;
      floatingElement.style.visibility = 'hidden';
      floatingElement.style.opacity = '0';
      floatingElement.style.display = 'block';
    }
    
    // Force reflow to get actual dimensions
    void floatingElement.offsetWidth;
    
    const floatingWidth = Math.max(floatingElement.offsetWidth || config.minWidth, config.minWidth);
    const floatingHeight = floatingElement.offsetHeight || 150;
    
    // Position below reference element (align with item bottom, not next item)
    let top = referenceRect.bottom + config.gap;
    let left = referenceRect.left;
    let right = 'auto';
    
    // For RTL, position from right
    if (isRTL) {
      left = 'auto';
      right = window.innerWidth - referenceRect.right;
    }
    
    // Check if element goes beyond viewport bottom
    if (top + floatingHeight > window.innerHeight - config.gap) {
      // Position above reference element instead
      top = referenceRect.top - floatingHeight - config.gap;
      if (top < config.gap) {
        top = config.gap;
      }
    }
    
    // Check horizontal overflow
    if (!isRTL) {
      if (left + floatingWidth > window.innerWidth - config.gap) {
        left = window.innerWidth - floatingWidth - config.gap;
      }
      if (left < config.gap) {
        left = config.gap;
      }
    } else {
      if (typeof right === 'number') {
        if (right + floatingWidth > window.innerWidth - config.gap) {
          right = window.innerWidth - floatingWidth - config.gap;
        }
        if (right < config.gap) {
          right = config.gap;
        }
      }
    }
    
    // Apply positioning
    floatingElement.style.position = config.strategy;
    floatingElement.style.top = `${top}px`;
    floatingElement.style.bottom = 'auto';
    floatingElement.style.margin = '0';
    floatingElement.style.transform = 'none';
    
    if (isRTL) {
      floatingElement.style.right = typeof right === 'number' ? `${right}px` : 'auto';
      floatingElement.style.left = 'auto';
    } else {
      floatingElement.style.left = `${left}px`;
      floatingElement.style.right = 'auto';
    }
    
    // Set width constraints
    floatingElement.style.width = `${floatingWidth}px`;
    floatingElement.style.maxWidth = `${config.maxWidth}px`;
    floatingElement.style.minWidth = `${config.minWidth}px`;
    
    // Force reflow
    void floatingElement.offsetHeight;
    
    // Use WidgetZIndexManager for dynamic z-index management
    if (window.WidgetZIndexManager) {
      const zIndex = window.WidgetZIndexManager.registerOverlay(floatingElement, referenceElement);
      floatingElement.style.zIndex = zIndex;
    } else {
      floatingElement.style.zIndex = config.zIndex;
    }
    
    if (!wasVisible) {
      floatingElement.style.visibility = '';
      floatingElement.style.opacity = '1';
    }
  }

  /**
   * Animate element using GSAP (if available) or CSS transitions
   * @param {HTMLElement} element - Element to animate
   * @param {string} action - 'show' or 'hide'
   * @param {Object} options - Animation options
   */
  function animateElement(element, action, options = {}) {
    if (!element) {
      return;
    }

    const config = {
      duration: options.duration || 0.2,
      ease: options.ease || 'power2.out',
      ...options
    };

    if (hasGSAP && action === 'show') {
      // GSAP show animation (faster, no vertical offset for better alignment)
      gsap.fromTo(element, 
        { opacity: 0 },
        { 
          opacity: 1,
          duration: config.duration,
          ease: config.ease,
          onComplete: config.onComplete
        }
      );
    } else if (hasGSAP && action === 'hide') {
      // GSAP hide animation
      gsap.to(element, {
        opacity: 0,
        y: -10,
        duration: config.duration,
        ease: config.ease,
        onComplete: () => {
          element.style.display = 'none';
        }
      });
    } else {
      // CSS transitions fallback
      if (action === 'show') {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      } else {
        element.style.opacity = '0';
        element.style.transform = 'translateY(-4px)';
        setTimeout(() => {
          if (parseFloat(getComputedStyle(element).opacity) === 0) {
            element.style.display = 'none';
          }
        }, config.duration * 1000);
      }
    }
  }

  /**
   * Setup overlay hover handlers
   * @param {HTMLElement} listElement - List container element
   * @param {string} itemSelector - Selector for items
   * @param {string} detailsSelector - Selector for details/overlay
   * @param {Object} options - Configuration options
   */
  function setupOverlay(listElement, itemSelector, detailsSelector, options = {}) {
    if (!listElement) {
      window.Logger?.warn?.('UnifiedUIPositioning: List element not provided', {
        page: 'unified-ui-positioning-service'
      });
      return;
    }

    const config = {
      hoverClass: options.hoverClass || 'is-hovered',
      transitionDuration: options.transitionDuration || 200,
      closeDelay: options.closeDelay || 100, // Reduced delay for faster response
      gap: options.gap || 8,
      minWidth: options.minWidth || 280,
      maxWidth: options.maxWidth || 400,
      zIndex: options.zIndex || 1050,
      placement: options.placement || 'bottom-start',
      useAnimations: options.useAnimations !== false, // Default true
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

    // Helper function to close overlay
    function closeOverlayForItem(item) {
      if (!item) {
        return;
      }

      const details = item.querySelector(detailsSelector) || item.querySelector('[data-overlay="true"]');
      if (!details) {
        return;
      }

      item.classList.remove(config.hoverClass);
      
      if (config.useAnimations) {
        animateElement(details, 'hide', {
          duration: (config.transitionDuration || 100) / 1000,
          onComplete: () => {
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
        });
      } else {
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
    }

    // Event handlers
    const handleMouseEnter = async function(event) {
      const item = event.target.closest(itemSelector);
      if (!item) {
        return;
      }

      // Prevent duplicate calls
      if (item.classList.contains(config.hoverClass)) {
        return;
      }

      // Find details element
      const details = item.querySelector(detailsSelector) || item.querySelector('[data-overlay="true"]');
      if (!details) {
        return;
      }

      // Close all other overlays
      const allItems = listElement.querySelectorAll(itemSelector);
      allItems.forEach(otherItem => {
        if (otherItem !== item) {
          const otherDetails = otherItem.querySelector(detailsSelector) || 
                              otherItem.querySelector('[data-overlay="true"]');
          if (otherDetails && otherDetails.style.display !== 'none') {
            otherItem.classList.remove(config.hoverClass);
            if (window.WidgetZIndexManager) {
              window.WidgetZIndexManager.unregisterOverlay(otherDetails);
            }
            otherDetails.style.display = 'none';
            otherDetails.style.position = '';
            otherDetails.style.top = '';
            otherDetails.style.left = '';
            otherDetails.style.right = '';
            otherDetails.style.width = '';
            otherDetails.style.zIndex = '';
            otherDetails.style.visibility = '';
            otherDetails.style.opacity = '';
          }
        }
      });

      // Mark item as hovered and show overlay
      item.classList.add(config.hoverClass);
      details.style.display = 'block';
      details.style.visibility = 'visible';
      details.style.pointerEvents = 'auto';
      if (config.useAnimations) {
        details.style.opacity = '0';
      } else {
        details.style.opacity = '1';
      }

      // Determine placement (last items prefer top)
      let placement = config.placement || 'bottom-start';
      const allItemsArray = Array.from(listElement.querySelectorAll(itemSelector));
      const itemIndex = allItemsArray.indexOf(item);
      if (itemIndex >= allItemsArray.length - 2) {
        placement = 'top-start';
      }
      
      // Position and animate
      await positionElement(item, details, {
        placement: placement,
        gap: config.gap,
        minWidth: config.minWidth,
        maxWidth: config.maxWidth,
        zIndex: config.zIndex
      });
      
      if (config.useAnimations) {
        animateElement(details, 'show', {
          duration: (config.transitionDuration || 100) / 1000
        });
      }

      // Handle hover on overlay
      const handleOverlayEnter = () => {
        item.classList.add(config.hoverClass);
      };
      
      const handleOverlayLeave = (e) => {
        const relatedTarget = e.relatedTarget;
        if (relatedTarget && (item.contains(relatedTarget) || relatedTarget === item)) {
          return; // Moving to item - keep open
        }
        closeOverlayForItem(item);
      };

      // Remove old listeners if they exist
      if (details.dataset.hoverListenersAttached === 'true') {
        details.removeEventListener('mouseenter', handleOverlayEnter);
        details.removeEventListener('mouseleave', handleOverlayLeave);
      }

      details.addEventListener('mouseenter', handleOverlayEnter);
      details.addEventListener('mouseleave', handleOverlayLeave);
      details.dataset.hoverListenersAttached = 'true';
    };

    const handleMouseLeave = function(event) {
      const item = event.target.closest(itemSelector);
      if (!item) {
        return;
      }

      const relatedTarget = event.relatedTarget;
      
      // If no relatedTarget, mouse left the window - close
      if (!relatedTarget) {
        closeOverlayForItem(item);
        return;
      }

      // If mouse is still inside the same item (moving between child elements) - keep open
      if (item.contains(relatedTarget) || relatedTarget === item) {
        return;
      }

      // If moving to this item's overlay - keep open
      const itemOverlay = item.querySelector('[data-overlay="true"]');
      if (itemOverlay && (itemOverlay.contains(relatedTarget) || relatedTarget === itemOverlay)) {
        return;
      }

      // Mouse is leaving to somewhere else - close
      closeOverlayForItem(item);
    };

    // Use event delegation on list element with capture phase for better event handling
    listElement.addEventListener('mouseenter', handleMouseEnter, true);
    listElement.addEventListener('mouseleave', handleMouseLeave, true);

    // Store handlers for cleanup
    overlayConfig.handlers = {
      mouseenter: handleMouseEnter,
      mouseleave: handleMouseLeave
    };

    // Store config
    activeInstances.set(listElement, overlayConfig);
  }

  /**
   * Destroy overlay handlers for a list element
   * @param {HTMLElement} listElement - List element to cleanup
   */
  function destroy(listElement) {
    const config = activeInstances.get(listElement);
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

    // Remove from active instances
    activeInstances.delete(listElement);
  }

  /**
   * Check if Floating UI is available
   * @returns {boolean}
   */
  function isAvailable() {
    return hasFloatingUI;
  }

  /**
   * Check if GSAP is available
   * @returns {boolean}
   */
  function isGSAPAvailable() {
    return hasGSAP;
  }

  // Export to global scope
  window.UnifiedUIPositioning = {
    positionElement,
    setupOverlay,
    destroy,
    animateElement,
    isAvailable,
    isGSAPAvailable
  };

  window.Logger?.info?.('Unified UI Positioning Service initialized', {
    floatingUI: hasFloatingUI,
    gsap: hasGSAP,
    page: 'unified-ui-positioning-service'
  });

})();


