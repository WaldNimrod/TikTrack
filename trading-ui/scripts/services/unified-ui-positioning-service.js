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
      closeDelay: options.closeDelay || 150,
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
      handlers: {},
      closeTimeouts: new WeakMap()
    };

    // Event handlers
    const handleMouseEnter = function(event) {
      const item = event.target.closest(itemSelector);
      if (!item) {
        return;
      }

      // Try multiple ways to find details element
      let details = item.querySelector(detailsSelector);
      
      // If not found, try without attribute selector
      if (!details && detailsSelector.includes('[')) {
        const baseSelector = detailsSelector.split('[')[0];
        details = item.querySelector(baseSelector);
      }
      
      // If still not found, try with data-overlay attribute
      if (!details) {
        details = item.querySelector('[data-overlay="true"]');
      }
      
      // Last resort: search in listElement
      if (!details) {
        details = listElement.querySelector(`${detailsSelector}[data-item-id="${item.dataset.itemId || ''}"]`);
      }
      
      if (!details) {
        window.Logger?.warn?.('UnifiedUIPositioning: Details element not found', {
          itemSelector,
          detailsSelector,
          item: item.className,
          page: 'unified-ui-positioning-service'
        });
        return;
      }

      // Close all other overlays in this list before opening new one
      const allItems = listElement.querySelectorAll(itemSelector);
      allItems.forEach(otherItem => {
        if (otherItem !== item) {
          // Remove hover class
          otherItem.classList.remove(config.hoverClass);
          
          // Find and close its overlay
          const otherDetails = otherItem.querySelector(detailsSelector) || 
                              listElement.querySelector(`${detailsSelector}[data-item-id="${otherItem.dataset.itemId || ''}"]`);
          if (otherDetails && otherDetails.style.display !== 'none') {
            // Cancel any pending timeout for this item
            const otherTimeout = overlayConfig.closeTimeouts.get(otherItem);
            if (otherTimeout) {
              clearTimeout(otherTimeout);
              overlayConfig.closeTimeouts.delete(otherItem);
            }
            
            // Close immediately
            if (config.useAnimations) {
              animateElement(otherDetails, 'hide', {
                duration: config.transitionDuration / 1000,
                onComplete: () => {
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
              });
            } else {
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
        }
      });

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
      if (config.useAnimations) {
        details.style.opacity = '0';
      } else {
        details.style.opacity = '1';
      }

      // Determine placement based on item position in list
      let placement = config.placement || 'bottom-start';
      const allItems = Array.from(listElement.querySelectorAll(itemSelector));
      const itemIndex = allItems.indexOf(item);
      const isLastItem = itemIndex === allItems.length - 1;
      const isSecondToLast = itemIndex === allItems.length - 2;
      
      // If item is near the end of the list, prefer top placement
      if (isLastItem || isSecondToLast) {
        placement = 'top-start';
      }

      // Position overlay immediately (no delay)
      await positionElement(item, details, {
        placement: placement,
        gap: config.gap,
        minWidth: config.minWidth,
        maxWidth: config.maxWidth,
        zIndex: config.zIndex
      });
      
      // Animate if enabled (faster animation)
      if (config.useAnimations) {
        animateElement(details, 'show', {
          duration: (config.transitionDuration || 100) / 1000
        });
      }
      
      // Auto-inspect if debugger available
      if (window.WidgetOverlayDebugger) {
        window.WidgetOverlayDebugger.inspectOverlay(item, details);
      }

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
          
          // Hide overlay with animation
          if (config.useAnimations) {
            animateElement(details, 'hide', {
              duration: config.transitionDuration / 1000,
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
            // Immediate hide
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

    // Clear all timeouts
    const items = listElement.querySelectorAll(config.itemSelector);
    items.forEach(item => {
      const timeout = config.closeTimeouts.get(item);
      if (timeout) {
        clearTimeout(timeout);
      }
    });

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

