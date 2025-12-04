/**
 * Test Widgets Overlay Highlighter
 * ==================================
 * 
 * System for highlighting sensitive areas in widgets for testing.
 * Highlights items with overlay, gaps between items, and open overlays.
 * 
 * Features:
 * - Highlight all items with overlay
 * - Highlight gaps between items
 * - Highlight open overlays
 * - Toggle highlight on/off
 */

;(function() {
  'use strict';

  const state = {
    initialized: false,
    highlighted: false,
    originalStyles: new Map()
  };

  const HIGHLIGHT_CLASS = 'test-overlay-highlight';
  const GAP_HIGHLIGHT_CLASS = 'test-overlay-gap-highlight';
  const OVERLAY_HIGHLIGHT_CLASS = 'test-overlay-open-highlight';

  /**
   * Initialize the highlighter system
   */
  function init() {
    if (state.initialized) {
      return;
    }

    // Setup highlight button
    const highlightBtn = document.getElementById('highlightSensitiveBtn');
    if (highlightBtn) {
      highlightBtn.addEventListener('click', toggleHighlight);
    }

    // Setup remove highlight button
    const removeHighlightBtn = document.getElementById('removeHighlightBtn');
    if (removeHighlightBtn) {
      removeHighlightBtn.addEventListener('click', removeHighlight);
    }

    // Add CSS styles
    addHighlightStyles();

    state.initialized = true;
  }

  /**
   * Add CSS styles for highlighting
   */
  function addHighlightStyles() {
    const style = document.createElement('style');
    style.id = 'test-overlay-highlight-styles';
    style.textContent = `
      .${HIGHLIGHT_CLASS} {
        background: rgba(255, 0, 0, 0.1) !important;
        border: 2px solid rgba(255, 0, 0, 0.3) !important;
        position: relative !important;
      }
      
      .${HIGHLIGHT_CLASS}::before {
        content: 'ITEM';
        position: absolute;
        top: 2px;
        left: 2px;
        background: rgba(255, 0, 0, 0.8);
        color: white;
        font-size: 10px;
        padding: 2px 4px;
        border-radius: 2px;
        z-index: 10001;
        font-weight: bold;
      }
      
      .${GAP_HIGHLIGHT_CLASS} {
        background: rgba(0, 255, 0, 0.1) !important;
        border: 1px dashed rgba(0, 255, 0, 0.5) !important;
      }
      
      .${OVERLAY_HIGHLIGHT_CLASS} {
        background: rgba(0, 0, 255, 0.1) !important;
        border: 2px solid rgba(0, 0, 255, 0.5) !important;
      }
      
      .${OVERLAY_HIGHLIGHT_CLASS}::before {
        content: 'OVERLAY';
        position: absolute;
        top: 2px;
        left: 2px;
        background: rgba(0, 0, 255, 0.8);
        color: white;
        font-size: 10px;
        padding: 2px 4px;
        border-radius: 2px;
        z-index: 10001;
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Toggle highlight on/off
   */
  function toggleHighlight() {
    if (state.highlighted) {
      removeHighlight();
    } else {
      applyHighlight();
    }
  }

  /**
   * Apply highlight to all sensitive areas
   */
  function applyHighlight() {
    if (state.highlighted) {
      return;
    }

    // Highlight items with overlay in Recent Items Widget
    highlightItemsWithOverlay('#recentItemsWidgetTradesList', '.recent-items-widget-item');
    highlightItemsWithOverlay('#recentItemsWidgetPlansList', '.recent-items-widget-item');

    // Highlight items with overlay in Unified Pending Actions Widget
    highlightItemsWithOverlay('#assignPlansList', '.unified-pending-list-item');
    highlightItemsWithOverlay('#assignTradesList', '.unified-pending-list-item');
    highlightItemsWithOverlay('#createPlansList', '.unified-pending-list-item');
    highlightItemsWithOverlay('#createTradesList', '.trade-create-widget-item');

    // Highlight gaps between items
    highlightGaps();

    // Setup observer for overlays
    setupOverlayObserver();

    // Update buttons
    const highlightBtn = document.getElementById('highlightSensitiveBtn');
    const removeHighlightBtn = document.getElementById('removeHighlightBtn');
    if (highlightBtn) {
      highlightBtn.classList.add('d-none');
    }
    if (removeHighlightBtn) {
      removeHighlightBtn.classList.remove('d-none');
    }

    state.highlighted = true;

    if (window.TestWidgetsOverlayLogger) {
      window.TestWidgetsOverlayLogger.log('info', 'Highlight applied to sensitive areas');
    }
  }

  /**
   * Highlight items with overlay
   * @param {string} listSelector - List selector
   * @param {string} itemSelector - Item selector
   */
  function highlightItemsWithOverlay(listSelector, itemSelector) {
    const list = document.querySelector(listSelector);
    if (!list) {
      return;
    }

    const items = list.querySelectorAll(itemSelector);
    items.forEach((item, index) => {
      // Check if item has overlay
      const hasOverlay = item.hasAttribute('data-widget-overlay') || 
                        item.querySelector('[data-overlay="true"]');
      
      if (hasOverlay) {
        // Save original style
        if (!state.originalStyles.has(item)) {
          state.originalStyles.set(item, {
            background: item.style.background,
            border: item.style.border
          });
        }

        // Apply highlight
        item.classList.add(HIGHLIGHT_CLASS);
      }
    });
  }

  /**
   * Highlight gaps between items
   */
  function highlightGaps() {
    // Find all lists with items
    const lists = document.querySelectorAll(`
      #recentItemsWidgetTradesList,
      #recentItemsWidgetPlansList,
      #assignPlansList,
      #assignTradesList,
      #createPlansList,
      #createTradesList
    `);

    lists.forEach(list => {
      // Make sure list has position relative for absolute positioning of gap elements
      const listStyle = window.getComputedStyle(list);
      if (listStyle.position === 'static') {
        list.style.position = 'relative';
      }
      
      const items = Array.from(list.children).filter(child => 
        child.classList.contains('recent-items-widget-item') || 
        child.classList.contains('unified-pending-list-item') ||
        child.classList.contains('trade-create-widget-item')
      );
      
      items.forEach((item, index) => {
        if (index === 0) {
          return; // Skip first item
        }

        const prevItem = items[index - 1];
        const prevRect = prevItem.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        const listRect = list.getBoundingClientRect();
        const gap = itemRect.top - prevRect.bottom;

        if (gap > 0) {
          // Create gap highlight element
          const gapElement = document.createElement('div');
          gapElement.className = GAP_HIGHLIGHT_CLASS;
          gapElement.style.position = 'absolute';
          gapElement.style.left = '0';
          gapElement.style.right = '0';
          gapElement.style.height = `${gap}px`;
          gapElement.style.top = `${prevRect.bottom - listRect.top}px`;
          gapElement.style.pointerEvents = 'none';
          gapElement.style.zIndex = '10000';
          gapElement.setAttribute('data-test-gap', 'true');
          
          // Insert after previous item
          prevItem.insertAdjacentElement('afterend', gapElement);
        }
      });
    });
  }

  /**
   * Setup observer for overlays
   */
  function setupOverlayObserver() {
    // Observe for overlay visibility changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          if (target.hasAttribute('data-overlay') || target.classList.contains('is-hovered')) {
            highlightOpenOverlay(target);
          }
        }
      });
    });

    // Observe all items with overlay
    const items = document.querySelectorAll('[data-widget-overlay="true"]');
    items.forEach(item => {
      observer.observe(item, {
        attributes: true,
        attributeFilter: ['class']
      });
    });
  }

  /**
   * Highlight open overlay
   * @param {HTMLElement} item - Item element
   */
  function highlightOpenOverlay(item) {
    const overlay = item.querySelector('[data-overlay="true"]');
    if (!overlay) {
      return;
    }

    const isVisible = overlay.style.display !== 'none' && 
                     !overlay.classList.contains('d-none') &&
                     item.classList.contains('is-hovered');

    if (isVisible) {
      // Save original style
      if (!state.originalStyles.has(overlay)) {
        state.originalStyles.set(overlay, {
          background: overlay.style.background,
          border: overlay.style.border
        });
      }

      // Apply highlight
      overlay.classList.add(OVERLAY_HIGHLIGHT_CLASS);
    } else {
      overlay.classList.remove(OVERLAY_HIGHLIGHT_CLASS);
    }
  }

  /**
   * Remove all highlights
   */
  function removeHighlight() {
    if (!state.highlighted) {
      return;
    }

    // Remove highlight classes
    document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach(el => {
      el.classList.remove(HIGHLIGHT_CLASS);
    });

    document.querySelectorAll(`.${OVERLAY_HIGHLIGHT_CLASS}`).forEach(el => {
      el.classList.remove(OVERLAY_HIGHLIGHT_CLASS);
    });

    // Remove gap highlights
    document.querySelectorAll(`[data-test-gap="true"]`).forEach(el => {
      el.remove();
    });

    // Restore original styles
    state.originalStyles.forEach((originalStyle, element) => {
      if (originalStyle.background) {
        element.style.background = originalStyle.background;
      }
      if (originalStyle.border) {
        element.style.border = originalStyle.border;
      }
    });
    state.originalStyles.clear();

    // Update buttons
    const highlightBtn = document.getElementById('highlightSensitiveBtn');
    const removeHighlightBtn = document.getElementById('removeHighlightBtn');
    if (highlightBtn) {
      highlightBtn.classList.remove('d-none');
    }
    if (removeHighlightBtn) {
      removeHighlightBtn.classList.add('d-none');
    }

    state.highlighted = false;

    if (window.TestWidgetsOverlayLogger) {
      window.TestWidgetsOverlayLogger.log('info', 'Highlight removed from sensitive areas');
    }
  }

  // Export to global scope
  window.TestWidgetsOverlayHighlighter = {
    init,
    applyHighlight,
    removeHighlight,
    toggleHighlight
  };

})();

