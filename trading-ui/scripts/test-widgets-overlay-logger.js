/**
 * Test Widgets Overlay Logger
 * ===========================
 * 
 * Detailed logging system for widget overlay testing.
 * Logs all events, element positions, hover areas, and errors.
 * 
 * Features:
 * - Detailed event logging (mouseenter, mouseleave, mousemove)
 * - Element position tracking (getBoundingClientRect)
 * - Sensitive area information (item dimensions, gaps)
 * - Overlay information (position, dimensions, visibility)
 * - Error detection and logging
 * - Copy log to clipboard
 * - Clear log functionality
 */

;(function() {
  'use strict';

  const state = {
    initialized: false,
    logs: [],
    maxLogs: 1000,
    logContainer: null,
    logContent: null
  };

  /**
   * Initialize the logger system
   */
  function init() {
    if (state.initialized) {
      return;
    }

    state.logContainer = document.querySelector('.log-container');
    state.logContent = document.getElementById('logContent');

    if (!state.logContent) {
      console.warn('TestWidgetsOverlayLogger: logContent element not found');
      return;
    }

    // Setup copy log button
    const copyLogBtn = document.getElementById('copyLogBtn');
    if (copyLogBtn) {
      copyLogBtn.addEventListener('click', copyLogToClipboard);
    }

    // Setup clear log button
    const clearLogBtn = document.getElementById('clearLogBtn');
    if (clearLogBtn) {
      clearLogBtn.addEventListener('click', clearLog);
    }

    // Setup toggle log button
    const toggleLogBtn = document.getElementById('toggleLogBtn');
    if (toggleLogBtn) {
      toggleLogBtn.addEventListener('click', toggleLog);
    }

    // Intercept console methods
    interceptConsole();

    // Log initialization
    log('info', 'TestWidgetsOverlayLogger initialized', {
      timestamp: new Date().toISOString()
    });

    state.initialized = true;
  }

  /**
   * Intercept console methods to capture logs
   */
  function interceptConsole() {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalDebug = console.debug;

    console.log = function(...args) {
      originalLog.apply(console, args);
      log('info', args.join(' '), { source: 'console.log' });
    };

    console.warn = function(...args) {
      originalWarn.apply(console, args);
      log('warn', args.join(' '), { source: 'console.warn' });
    };

    console.error = function(...args) {
      originalError.apply(console, args);
      log('error', args.join(' '), { source: 'console.error' });
    };

    console.debug = function(...args) {
      originalDebug.apply(console, args);
      log('debug', args.join(' '), { source: 'console.debug' });
    };
  }

  /**
   * Log an event with details
   * @param {string} level - Log level: 'info', 'warn', 'error', 'debug'
   * @param {string} message - Log message
   * @param {Object} details - Additional details
   */
  function log(level, message, details = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      details
    };

    state.logs.push(logEntry);

    // Limit log size
    if (state.logs.length > state.maxLogs) {
      state.logs.shift();
    }

    // Update UI
    updateLogDisplay(logEntry);

    // Also log to console if available
    if (window.Logger) {
      window.Logger[level]?.(message, { ...details, page: 'test-widgets-overlay-logger' });
    }
  }

  /**
   * Log mouse event with element details
   * @param {string} eventType - Event type: 'mouseenter', 'mouseleave', 'mousemove'
   * @param {Event} event - Mouse event
   * @param {HTMLElement} item - Item element
   * @param {HTMLElement} overlay - Overlay element (optional)
   */
  function logMouseEvent(eventType, event, item, overlay = null) {
    if (!item) {
      log('warn', `Mouse event ${eventType} with null item`, {
        eventType,
        target: event.target?.tagName || 'null',
        clientX: event.clientX,
        clientY: event.clientY
      });
      return;
    }

    const itemRect = item.getBoundingClientRect();
    const overlayRect = overlay ? overlay.getBoundingClientRect() : null;

    log('debug', `Mouse ${eventType} on item`, {
      eventType,
      item: {
        id: item.id || 'no-id',
        classList: Array.from(item.classList),
        position: {
          top: itemRect.top,
          left: itemRect.left,
          right: itemRect.right,
          bottom: itemRect.bottom,
          width: itemRect.width,
          height: itemRect.height
        }
      },
      overlay: overlayRect ? {
        position: {
          top: overlayRect.top,
          left: overlayRect.left,
          right: overlayRect.right,
          bottom: overlayRect.bottom,
          width: overlayRect.width,
          height: overlayRect.height
        },
        visible: overlay.style.display !== 'none'
      } : null,
      mouse: {
        clientX: event.clientX,
        clientY: event.clientY,
        pageX: event.pageX,
        pageY: event.pageY
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollX: window.scrollX,
        scrollY: window.scrollY
      }
    });
  }

  /**
   * Log element position details
   * @param {HTMLElement} element - Element to log
   * @param {string} label - Label for the element
   */
  function logElementPosition(element, label) {
    if (!element) {
      log('warn', `${label}: element is null`);
      return;
    }

    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);

    log('debug', `${label} position`, {
      label,
      element: {
        id: element.id || 'no-id',
        tagName: element.tagName,
        classList: Array.from(element.classList)
      },
      position: {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height
      },
      style: {
        position: computedStyle.position,
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        zIndex: computedStyle.zIndex,
        overflow: computedStyle.overflow
      }
    });
  }

  /**
   * Log positioning debug information
   * @param {Object} debugInfo - Debug information object
   */
  function logPositioningDebug(debugInfo) {
    log('debug', 'Positioning debug', debugInfo);
  }

  /**
   * Log overlay setup
   * @param {HTMLElement} listElement - List element
   * @param {string} itemSelector - Item selector
   * @param {string} detailsSelector - Details selector
   * @param {Object} options - Options
   */
  function logOverlaySetup(listElement, itemSelector, detailsSelector, options) {
    log('info', 'Overlay setup', {
      listElement: {
        id: listElement?.id || 'no-id',
        tagName: listElement?.tagName,
        classList: Array.from(listElement?.classList || [])
      },
      itemSelector,
      detailsSelector,
      options
    });

    // Log all items found
    if (listElement) {
      const items = listElement.querySelectorAll(itemSelector);
      log('info', `Found ${items.length} items with selector "${itemSelector}"`, {
        items: Array.from(items).map((item, index) => ({
          index,
          id: item.id || `item-${index}`,
          classList: Array.from(item.classList)
        }))
      });
    }
  }

  /**
   * Log error with stack trace
   * @param {Error} error - Error object
   * @param {string} context - Context where error occurred
   */
  function logError(error, context) {
    log('error', `Error in ${context}: ${error.message}`, {
      context,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    });
  }

  /**
   * Update log display
   * @param {Object} logEntry - Log entry to add
   */
  function updateLogDisplay(logEntry) {
    if (!state.logContent) {
      return;
    }

    const entryDiv = document.createElement('div');
    entryDiv.className = `log-entry ${logEntry.level}`;
    
    const time = new Date(logEntry.timestamp).toLocaleTimeString('he-IL');
    const message = typeof logEntry.message === 'string' 
      ? logEntry.message 
      : JSON.stringify(logEntry.message);
    
    entryDiv.innerHTML = `
      <strong>[${time}] ${logEntry.level.toUpperCase()}:</strong> ${message}
      ${logEntry.details && Object.keys(logEntry.details).length > 0 
        ? `<br><small>${JSON.stringify(logEntry.details, null, 2)}</small>` 
        : ''}
    `;

    state.logContent.appendChild(entryDiv);
    state.logContent.scrollTop = state.logContent.scrollHeight;
  }

  /**
   * Copy log to clipboard
   */
  function copyLogToClipboard() {
    const logText = state.logs.map(entry => {
      const time = new Date(entry.timestamp).toLocaleString('he-IL');
      const details = entry.details && Object.keys(entry.details).length > 0
        ? '\n' + JSON.stringify(entry.details, null, 2)
        : '';
      return `[${time}] ${entry.level.toUpperCase()}: ${entry.message}${details}`;
    }).join('\n\n');

    navigator.clipboard.writeText(logText).then(() => {
      log('info', 'Log copied to clipboard');
      if (window.NotificationSystem) {
        window.NotificationSystem.showSuccess('לוג הועתק לקליפבורד');
      }
    }).catch(err => {
      log('error', 'Failed to copy log to clipboard', { error: err.message });
    });
  }

  /**
   * Clear log
   */
  function clearLog() {
    state.logs = [];
    if (state.logContent) {
      state.logContent.innerHTML = '<div class="log-entry info">לוג נוקה</div>';
    }
    log('info', 'Log cleared');
  }

  /**
   * Toggle log visibility
   */
  function toggleLog() {
    if (!state.logContainer) {
      return;
    }

    const isVisible = state.logContainer.style.display !== 'none';
    state.logContainer.style.display = isVisible ? 'none' : 'flex';
    
    const toggleBtn = document.getElementById('toggleLogBtn');
    if (toggleBtn) {
      toggleBtn.textContent = isVisible ? 'הצג' : 'הסתר';
    }
  }

  // Export to global scope
  window.TestWidgetsOverlayLogger = {
    init,
    log,
    logMouseEvent,
    logElementPosition,
    logOverlaySetup,
    logError,
    logPositioningDebug,
    getLogs: () => state.logs,
    clearLog
  };

})();



