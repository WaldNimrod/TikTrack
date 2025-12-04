/**
 * Widget Overlay Debugger
 * =======================
 * 
 * Visual debugging tool for widget overlay positioning issues.
 * Automatically detects and reports CSS issues that affect fixed positioning.
 * 
 * Features:
 * - Visual overlay with positioning info
 * - Automatic CSS inspection of parent containers
 * - Transform/overflow detection
 * - Positioning context analysis
 */

;(function() {
  'use strict';

  const state = {
    initialized: false,
    debugOverlay: null,
    inspectionResults: []
  };

  /**
   * Initialize debugger
   */
  function init() {
    if (state.initialized) {
      return;
    }

    createDebugOverlay();
    state.initialized = true;
  }

  /**
   * Create visual debug overlay
   */
  function createDebugOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'widget-overlay-debugger';
    overlay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: #fff;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 99999;
      max-width: 400px;
      max-height: 80vh;
      overflow-y: auto;
      display: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    overlay.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <strong>Widget Overlay Debugger</strong>
        <button id="debugger-close" style="background: #ff4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">×</button>
      </div>
      <div id="debugger-content"></div>
    `;
    document.body.appendChild(overlay);
    state.debugOverlay = overlay;

    // Close button
    document.getElementById('debugger-close')?.addEventListener('click', () => {
      overlay.style.display = 'none';
    });

    // Toggle with Ctrl+Shift+D
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
      }
    });
  }

  /**
   * Inspect element and all parent containers for CSS issues
   */
  function inspectElement(element, overlayElement) {
    if (!element || !overlayElement) {
      return null;
    }

    const results = {
      element: {
        tagName: element.tagName,
        id: element.id || 'no-id',
        classes: Array.from(element.classList),
        rect: element.getBoundingClientRect()
      },
      overlay: {
        tagName: overlayElement.tagName,
        id: overlayElement.id || 'no-id',
        classes: Array.from(overlayElement.classList),
        rect: overlayElement.getBoundingClientRect(),
        computedStyle: window.getComputedStyle(overlayElement)
      },
      parents: [],
      issues: []
    };

    // Check all parent containers
    let parent = element.parentElement;
    let level = 0;
    while (parent && parent !== document.body && level < 10) {
      const computedStyle = window.getComputedStyle(parent);
      const rect = parent.getBoundingClientRect();
      
      const parentInfo = {
        level,
        tagName: parent.tagName,
        id: parent.id || 'no-id',
        classes: Array.from(parent.classList).slice(0, 5), // First 5 classes
        rect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height
        },
        css: {
          position: computedStyle.position,
          transform: computedStyle.transform,
          overflow: computedStyle.overflow,
          overflowX: computedStyle.overflowX,
          overflowY: computedStyle.overflowY,
          willChange: computedStyle.willChange,
          zIndex: computedStyle.zIndex
        },
        issues: []
      };

      // Detect issues
      if (computedStyle.transform !== 'none') {
        parentInfo.issues.push({
          type: 'transform',
          severity: 'high',
          message: `Parent has transform: ${computedStyle.transform} - This creates a new positioning context for fixed elements!`
        });
        results.issues.push({
          type: 'transform-parent',
          element: `${parent.tagName}${parent.id ? '#' + parent.id : ''}`,
          message: parentInfo.issues[parentInfo.issues.length - 1].message
        });
      }

      if (computedStyle.position === 'fixed' || computedStyle.position === 'absolute') {
        parentInfo.issues.push({
          type: 'positioned-parent',
          severity: 'medium',
          message: `Parent has position: ${computedStyle.position} - May affect positioning context`
        });
      }

      if (computedStyle.overflow !== 'visible' || computedStyle.overflowX !== 'visible' || computedStyle.overflowY !== 'visible') {
        parentInfo.issues.push({
          type: 'overflow',
          severity: 'low',
          message: `Parent has overflow: ${computedStyle.overflow} - May clip fixed elements`
        });
      }

      results.parents.push(parentInfo);
      parent = parent.parentElement;
      level++;
    }

    // Check overlay positioning
    const itemRect = element.getBoundingClientRect();
    const overlayRect = overlayElement.getBoundingClientRect();
    const expectedLeft = itemRect.left;
    const actualLeft = overlayRect.left;
    const offset = actualLeft - expectedLeft;

    if (Math.abs(offset) > 1) {
      results.issues.push({
        type: 'position-offset',
        severity: 'high',
        message: `Overlay offset: ${offset.toFixed(1)}px (expected: ${expectedLeft.toFixed(1)}, actual: ${actualLeft.toFixed(1)})`,
        expected: expectedLeft,
        actual: actualLeft,
        offset: offset
      });
    }

    // Check if overlay style.left matches computed left
    const styleLeft = overlayElement.style.left;
    const computedLeft = overlayRect.left;
    if (styleLeft && !styleLeft.includes('auto')) {
      const styleLeftValue = parseFloat(styleLeft);
      if (Math.abs(styleLeftValue - computedLeft) > 1) {
        results.issues.push({
          type: 'style-computed-mismatch',
          severity: 'high',
          message: `Style left (${styleLeft}) doesn't match computed left (${computedLeft.toFixed(1)}px) - CSS is overriding!`,
          styleLeft: styleLeftValue,
          computedLeft: computedLeft
        });
      }
    }

    return results;
  }

  /**
   * Display inspection results in debug overlay
   */
  function displayResults(results) {
    if (!state.debugOverlay) {
      init();
    }

    const content = state.debugOverlay.querySelector('#debugger-content');
    if (!content) {
      return;
    }

    let html = '';

    // Summary
    html += `<div style="margin-bottom: 15px; padding: 10px; background: ${results.issues.length > 0 ? '#ff4444' : '#00aa00'}; border-radius: 4px;">`;
    html += `<strong>Issues Found: ${results.issues.length}</strong>`;
    html += `</div>`;

    // Element info
    html += `<div style="margin-bottom: 10px;">`;
    html += `<strong>Item:</strong> ${results.element.tagName}${results.element.id ? '#' + results.element.id : ''}<br>`;
    html += `<strong>Position:</strong> left: ${results.element.rect.left.toFixed(1)}px<br>`;
    html += `</div>`;

    // Overlay info
    html += `<div style="margin-bottom: 10px;">`;
    html += `<strong>Overlay:</strong> ${results.overlay.tagName}${results.overlay.id ? '#' + results.overlay.id : ''}<br>`;
    html += `<strong>Position:</strong> left: ${results.overlay.rect.left.toFixed(1)}px<br>`;
    html += `<strong>Style Left:</strong> ${results.overlay.computedStyle.left || 'auto'}<br>`;
    html += `<strong>Computed Left:</strong> ${results.overlay.rect.left.toFixed(1)}px<br>`;
    html += `</div>`;

    // Issues
    if (results.issues.length > 0) {
      html += `<div style="margin-bottom: 10px;">`;
      html += `<strong style="color: #ff4444;">Issues:</strong><br>`;
      results.issues.forEach((issue, index) => {
        html += `<div style="margin-top: 5px; padding: 5px; background: rgba(255, 68, 68, 0.2); border-radius: 3px;">`;
        html += `<strong>${issue.type}:</strong> ${issue.message}`;
        if (issue.offset !== undefined) {
          html += `<br><small>Offset: ${issue.offset > 0 ? '+' : ''}${issue.offset.toFixed(1)}px</small>`;
        }
        html += `</div>`;
      });
      html += `</div>`;
    }

    // Parent containers with issues
    const problematicParents = results.parents.filter(p => p.issues.length > 0);
    if (problematicParents.length > 0) {
      html += `<div style="margin-bottom: 10px;">`;
      html += `<strong style="color: #ffaa00;">Problematic Parents:</strong><br>`;
      problematicParents.forEach((parent, index) => {
        html += `<div style="margin-top: 5px; padding: 5px; background: rgba(255, 170, 0, 0.2); border-radius: 3px;">`;
        html += `<strong>${parent.tagName}${parent.id ? '#' + parent.id : ''}</strong> (level ${parent.level})<br>`;
        parent.issues.forEach(issue => {
          html += `<small style="color: #ffaa00;">⚠ ${issue.message}</small><br>`;
        });
        html += `</div>`;
      });
      html += `</div>`;
    }

    content.innerHTML = html;
    state.debugOverlay.style.display = 'block';
  }

  /**
   * Inspect overlay positioning for a specific item
   */
  function inspectOverlay(itemElement, overlayElement) {
    const results = inspectElement(itemElement, overlayElement);
    if (results) {
      displayResults(results);
      return results;
    }
    return null;
  }

  /**
   * Auto-inspect all active overlays
   */
  function inspectAllActiveOverlays() {
    // Find all visible overlays
    const overlays = document.querySelectorAll('[data-overlay="true"], .recent-items-widget-details-container, .unified-pending-details, .trade-create-widget-details');
    const visibleOverlays = Array.from(overlays).filter(overlay => {
      const style = window.getComputedStyle(overlay);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    });

    if (visibleOverlays.length === 0) {
      if (state.debugOverlay) {
        const content = state.debugOverlay.querySelector('#debugger-content');
        if (content) {
          content.innerHTML = '<div style="color: #ffaa00;">No active overlays found. Hover over an item to inspect.</div>';
          state.debugOverlay.style.display = 'block';
        }
        return;
      }
    }

    // Inspect first visible overlay
    const overlay = visibleOverlays[0];
    const item = overlay.closest('li') || document.querySelector('.recent-items-widget-item.is-hovered, .unified-pending-list-item.is-hovered, .trade-create-widget-item.is-hovered');
    
    if (item) {
      inspectOverlay(item, overlay);
    }
  }

  // Export to global scope
  window.WidgetOverlayDebugger = {
    init,
    inspectOverlay,
    inspectAllActiveOverlays,
    inspectElement
  };

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();


