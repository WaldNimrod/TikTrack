/**
 * Preferences Events - Event System
 * ===================================
 *
 * מערכת events להעדפות
 *
 * תכונות:
 * - Events מוגדרים היטב
 * - Listeners מינימליים
 * - Decoupling בין שכבות
 *
 * @version 1.0.0
 * @lastUpdated January 2025
 */

// ============================================================================
// PREFERENCES EVENTS CLASS
// ============================================================================

class PreferencesEvents {
  constructor() {
    this.listeners = new Map(); // Track listeners for cleanup
  }

  /**
   * Dispatch event
   * @param {string} eventName - Event name
   * @param {Object} detail - Event detail
   */
  dispatch(eventName, detail = {}) {
    if (typeof window.dispatchEvent !== 'function') {
      window.Logger?.warn?.('window.dispatchEvent not available', {
        page: 'preferences-events',
        eventName,
      });
      return;
    }

    const event = new CustomEvent(eventName, {
      detail: {
        timestamp: Date.now(),
        ...detail,
      },
    });

    window.dispatchEvent(event);

    window.Logger?.debug?.('Dispatched event', {
      page: 'preferences-events',
      eventName,
      detail,
    });
  }

  /**
   * Listen to event
   * @param {string} eventName - Event name
   * @param {Function} handler - Event handler
   * @param {Object} options - Options (once, etc.)
   * @returns {Function} Unsubscribe function
   */
  listen(eventName, handler, options = {}) {
    if (typeof window.addEventListener !== 'function') {
      window.Logger?.warn?.('window.addEventListener not available', {
        page: 'preferences-events',
        eventName,
      });
      return () => {};
    }

    const wrappedHandler = (event) => {
      try {
        handler(event.detail, event);
      } catch (error) {
        window.Logger?.error?.('Error in event handler', {
          page: 'preferences-events',
          eventName,
          error: error?.message,
        });
      }
    };

    window.addEventListener(eventName, wrappedHandler, options);

    // Store for cleanup
    const listenerKey = `${eventName}_${Date.now()}_${Math.random()}`;
    this.listeners.set(listenerKey, { eventName, handler: wrappedHandler, options });

    // Return unsubscribe function
    return () => {
      window.removeEventListener(eventName, wrappedHandler, options);
      this.listeners.delete(listenerKey);
    };
  }

  /**
   * Remove all listeners
   */
  removeAllListeners() {
    this.listeners.forEach(({ eventName, handler, options }) => {
      window.removeEventListener(eventName, handler, options);
    });
    this.listeners.clear();
  }
}

// ============================================================================
// EVENT DEFINITIONS
// ============================================================================

/**
 * Standard preference events
 */
PreferencesEvents.EVENTS = {
  INITIALIZED: 'preferences:initialized',
  LOADED: 'preferences:loaded',
  SAVED: 'preferences:saved',
  FIELD_UPDATED: 'preferences:field-updated',
  GROUP_UPDATED: 'preferences:group-updated',
  SAVE_FAILED: 'preferences:save-failed',
  CACHE_INVALIDATED: 'preferences:cache-invalidated',
};

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

window.PreferencesEvents = new PreferencesEvents();

window.Logger?.info?.('✅ PreferencesEvents loaded', {
  page: 'preferences-events',
});

