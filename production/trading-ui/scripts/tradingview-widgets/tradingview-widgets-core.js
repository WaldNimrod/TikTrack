/**
 * TradingView Widgets Core Manager
 * =================================
 * 
 * Central management system for all TradingView widgets
 * Handles lifecycle, theme, locale, and responsive design
 * 
 * Documentation: documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_WIDGETS_IMPLEMENTATION_PLAN.md
 * 
 * @module TradingViewWidgetsManager
 */


// ===== FUNCTION INDEX =====

// === Event Handlers ===
// - handleResize() - Handleresize

(function() {
  'use strict';

  /**
   * TradingView Widgets Manager
   * Central system for managing all TradingView widgets
   */
  window.TradingViewWidgetsManager = {
    /**
     * Widget registry (containerId → widget instance)
     */
    _widgets: new Map(),

    /**
     * Initialization state
     */
    _initialized: false,

    /**
     * Resize debounce timer
     */
    _resizeTimer: null,

    /**
     * Initialize the TradingView Widgets system
     * Waits for dependencies to load
     * 
     * @returns {Promise<void>}
     */
    init: async function() {
      if (this._initialized) {
        if (window.Logger) {
          window.Logger.warn('TradingViewWidgetsManager: Already initialized', {
            module: 'TradingViewWidgetsManager'
          });
        }
        return;
      }

      try {
        // Wait for dependencies
        await this._waitForDependencies();

        // Setup resize handler
        this._setupResizeHandler();

        // Setup color watcher
        if (window.TradingViewWidgetsColors) {
          window.TradingViewWidgetsColors.watchColorChanges((colors) => {
            if (window.Logger) {
              window.Logger.info('TradingViewWidgetsManager: Colors changed, widgets need recreation', {
                module: 'TradingViewWidgetsManager',
                colors: colors
              });
            }
          });
        }

        this._initialized = true;

        // TradingViewWidgetsManager initialized successfully
      } catch (error) {
        if (window.Logger) {
          window.Logger.error('TradingViewWidgetsManager: Initialization failed', error, {
            module: 'TradingViewWidgetsManager'
          });
        }
        throw error;
      }
    },

    /**
     * Wait for all dependencies to load
     * @private
     * @returns {Promise<void>}
     */
    _waitForDependencies: async function() {
      const maxWait = 10000; // 10 seconds
      const checkInterval = 100; // 100ms
      let elapsed = 0;

      // Wait for TradingViewWidgetsConfig
      while (!window.TradingViewWidgetsConfig && elapsed < maxWait) {
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        elapsed += checkInterval;
      }

      if (!window.TradingViewWidgetsConfig) {
        throw new Error('TradingViewWidgetsConfig not loaded');
      }

      // Wait for TradingViewWidgetsColors
      while (!window.TradingViewWidgetsColors && elapsed < maxWait) {
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        elapsed += checkInterval;
      }

      if (!window.TradingViewWidgetsColors) {
        throw new Error('TradingViewWidgetsColors not loaded');
      }

      // Wait for TradingViewWidgetsFactory
      while (!window.TradingViewWidgetsFactory && elapsed < maxWait) {
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        elapsed += checkInterval;
      }

      if (!window.TradingViewWidgetsFactory) {
        throw new Error('TradingViewWidgetsFactory not loaded');
      }

      // Wait for preferences (optional, but recommended)
      elapsed = 0;
      while (!window.currentPreferences && !window.userPreferences && elapsed < maxWait) {
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        elapsed += checkInterval;
      }

      // Preferences are optional, so we continue even if not loaded
    },

    /**
     * Setup resize handler for responsive design
     * @private
     */
    _setupResizeHandler: function() {
      const handleResize = () => {
        // Debounce resize events
        if (this._resizeTimer) {
          clearTimeout(this._resizeTimer);
        }

        this._resizeTimer = setTimeout(() => {
          this.handleResize();
        }, 150); // 150ms debounce
      };

      window.addEventListener('resize', handleResize);

      // Also listen to container resize using ResizeObserver (if available)
      if (window.ResizeObserver) {
        this._resizeObserver = new ResizeObserver(() => {
          handleResize();
        });
      }
    },

    /**
     * Create a new widget
     * @param {Object} config - Widget configuration
     * @param {string} config.type - Widget type identifier
     * @param {string} config.containerId - Container ID (optional, will be generated if not provided)
     * @param {Object} config.config - Widget-specific configuration
     * @returns {Object} Widget instance
     */
    createWidget: function(config) {
      if (!this._initialized) {
        throw new Error('TradingViewWidgetsManager not initialized. Call init() first.');
      }

      if (!config || !config.type) {
        throw new Error('Widget type is required');
      }

      try {
        // Ensure container ID
        const containerId = config.containerId || config.container_id || 
          window.TradingViewWidgetsFactory.generateContainerId();

        // Prepare widget config
        const widgetConfig = Object.assign({}, config.config || config, {
          container_id: containerId
        });

        // Create widget using factory
        const widget = window.TradingViewWidgetsFactory.createWidget(config.type, widgetConfig);

        // Register widget
        this._widgets.set(containerId, {
          type: config.type,
          instance: widget,
          config: widgetConfig,
          containerId: containerId,
          createdAt: Date.now()
        });

        // Setup resize observer for this widget
        if (this._resizeObserver) {
          const container = document.getElementById(containerId);
          if (container) {
            this._resizeObserver.observe(container);
          }
        }

        if (window.Logger) {
          window.Logger.info('TradingViewWidgetsManager: Widget created', {
            module: 'TradingViewWidgetsManager',
            type: config.type,
            containerId: containerId
          });
        }

        return widget;
      } catch (error) {
        if (window.Logger) {
          window.Logger.error('TradingViewWidgetsManager: Failed to create widget', error, {
            module: 'TradingViewWidgetsManager',
            type: config.type
          });
        }
        throw error;
      }
    },

    /**
     * Update widget configuration
     * Note: TradingView widgets don't support dynamic updates
     * This function recreates the widget with new configuration
     * 
     * @param {string} widgetId - Widget container ID
     * @param {Object} updates - Configuration updates
     * @returns {Object} Updated widget instance
     */
    updateWidget: function(widgetId, updates) {
      const widgetData = this._widgets.get(widgetId);
      if (!widgetData) {
        throw new Error(`Widget with ID "${widgetId}" not found`);
      }

      // Destroy existing widget
      this.destroyWidget(widgetId);

      // Create new widget with updated config
      const newConfig = Object.assign({}, widgetData.config, updates);
      return this.createWidget({
        type: widgetData.type,
        containerId: widgetId,
        config: newConfig
      });
    },

    /**
     * Destroy widget
     * @param {string} widgetId - Widget container ID
     */
    destroyWidget: function(widgetId) {
      const widgetData = this._widgets.get(widgetId);
      if (!widgetData) {
        if (window.Logger) {
          window.Logger.warn(`TradingViewWidgetsManager: Widget "${widgetId}" not found for destruction`, {
            module: 'TradingViewWidgetsManager'
          });
        }
        return;
      }

      try {
        // Remove resize observer
        if (this._resizeObserver) {
          const container = document.getElementById(widgetId);
          if (container) {
            this._resizeObserver.unobserve(container);
          }
        }

        // Remove widget from DOM (for embed widgets)
        if (widgetData.instance && widgetData.instance.wrapper) {
          widgetData.instance.wrapper.remove();
        }

        // Release container ID
        if (window.TradingViewWidgetsFactory) {
          window.TradingViewWidgetsFactory.releaseContainerId(widgetId);
        }

        // Remove from registry
        this._widgets.delete(widgetId);

        if (window.Logger) {
          window.Logger.info('TradingViewWidgetsManager: Widget destroyed', {
            module: 'TradingViewWidgetsManager',
            containerId: widgetId
          });
        }
      } catch (error) {
        if (window.Logger) {
          window.Logger.error('TradingViewWidgetsManager: Error destroying widget', error, {
            module: 'TradingViewWidgetsManager',
            containerId: widgetId
          });
        }
      }
    },

    /**
     * Get widget by container ID
     * @param {string} widgetId - Widget container ID
     * @returns {Object|null} Widget data or null if not found
     */
    getWidget: function(widgetId) {
      return this._widgets.get(widgetId) || null;
    },

    /**
     * Get all widgets
     * @returns {Array} Array of widget data objects
     */
    getAllWidgets: function() {
      return Array.from(this._widgets.values());
    },

    /**
     * Refresh all widgets (recreate with current colors/theme)
     */
    refreshAllWidgets: function() {
      const widgets = this.getAllWidgets();
      
      if (window.Logger) {
        window.Logger.info('TradingViewWidgetsManager: Refreshing all widgets', {
          module: 'TradingViewWidgetsManager',
          count: widgets.length
        });
      }

      widgets.forEach(widgetData => {
        try {
          // Destroy and recreate with current colors
          this.updateWidget(widgetData.containerId, {});
        } catch (error) {
          if (window.Logger) {
            window.Logger.error('TradingViewWidgetsManager: Error refreshing widget', error, {
              module: 'TradingViewWidgetsManager',
              containerId: widgetData.containerId
            });
          }
        }
      });
    },

    /**
     * Apply theme to all widgets
     * Note: Requires widget recreation
     * 
     * @param {string} theme - Theme value ('light' or 'dark')
     */
    applyTheme: function(theme) {
      if (theme !== 'light' && theme !== 'dark') {
        throw new Error('Theme must be "light" or "dark"');
      }

      const widgets = this.getAllWidgets();
      widgets.forEach(widgetData => {
        try {
          this.updateWidget(widgetData.containerId, {
            theme: theme,
            colorTheme: theme
          });
        } catch (error) {
          if (window.Logger) {
            window.Logger.error('TradingViewWidgetsManager: Error applying theme', error, {
              module: 'TradingViewWidgetsManager',
              containerId: widgetData.containerId
            });
          }
        }
      });
    },

    /**
     * Apply locale to all widgets
     * Note: Requires widget recreation
     * 
     * @param {string} locale - Locale value (e.g., 'he', 'en')
     */
    applyLocale: function(locale) {
      const widgets = this.getAllWidgets();
      widgets.forEach(widgetData => {
        try {
          this.updateWidget(widgetData.containerId, {
            locale: locale
          });
        } catch (error) {
          if (window.Logger) {
            window.Logger.error('TradingViewWidgetsManager: Error applying locale', error, {
              module: 'TradingViewWidgetsManager',
              containerId: widgetData.containerId
            });
          }
        }
      });
    },

    /**
     * Handle resize events (responsive design)
     * TradingView widgets handle resize automatically with autosize: true
     */
    handleResize: function() {
      // TradingView widgets with autosize: true handle resize automatically
      // This function is here for future enhancements or manual resize handling
      
      if (window.Logger) {
        window.Logger.debug('TradingViewWidgetsManager: Resize handled', {
          module: 'TradingViewWidgetsManager',
          widgetsCount: this._widgets.size
        });
      }
    },

    /**
     * Get statistics about widgets
     * @returns {Object} Widget statistics
     */
    getStats: function() {
      const widgets = this.getAllWidgets();
      const stats = {
        total: widgets.length,
        byType: {},
        initialized: this._initialized
      };

      widgets.forEach(widget => {
        stats.byType[widget.type] = (stats.byType[widget.type] || 0) + 1;
      });

      return stats;
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.TradingViewWidgetsManager.init().catch(error => {
        if (window.Logger) {
          window.Logger.error('TradingViewWidgetsManager: Auto-initialization failed', error, {
            module: 'TradingViewWidgetsManager'
          });
        }
      });
    });
  } else {
    // DOM already loaded
    window.TradingViewWidgetsManager.init().catch(error => {
      if (window.Logger) {
        window.Logger.error('TradingViewWidgetsManager: Auto-initialization failed', error, {
          module: 'TradingViewWidgetsManager'
        });
      }
    });
  }

  // Log initialization
  if (window.Logger) {
    window.Logger.info('TradingViewWidgetsManager module loaded', {
      module: 'TradingViewWidgetsManager'
    });
  } else {
    console.log('✅ TradingViewWidgetsManager module loaded');
  }
})();

