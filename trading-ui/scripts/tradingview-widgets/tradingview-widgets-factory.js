/**
 * TradingView Widgets Factory
 * ============================
 * 
 * Factory pattern for creating TradingView widgets
 * Handles automatic ID generation and widget creation
 * 
 * Documentation: documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_WIDGETS_IMPLEMENTATION_PLAN.md
 * 
 * @module TradingViewWidgetsFactory
 */

(function() {
  'use strict';

  /**
   * TradingView Widgets Factory
   * Creates and manages TradingView widget instances
   */
  window.TradingViewWidgetsFactory = {
    /**
     * Used container IDs (to ensure uniqueness)
     */
    _usedContainerIds: new Set(),

    /**
     * Generate unique container ID
     * @param {string} prefix - ID prefix (optional)
     * @returns {string} Unique container ID
     */
    generateContainerId: function(prefix = 'tradingview-widget') {
      let containerId;
      let attempts = 0;
      const maxAttempts = 100;

      do {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        containerId = `${prefix}-${timestamp}-${random}`;
        attempts++;
      } while (this._usedContainerIds.has(containerId) && attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        if (window.Logger) {
          window.Logger.error('TradingViewWidgetsFactory: Failed to generate unique container ID', {
            module: 'TradingViewWidgetsFactory',
            attempts: attempts
          });
        }
        throw new Error('Failed to generate unique container ID');
      }

      this._usedContainerIds.add(containerId);
      return containerId;
    },

    /**
     * Ensure container ID is unique
     * @param {string} containerId - Container ID to check
     * @returns {string} Unique container ID (original or generated)
     */
    ensureUniqueContainerId: function(containerId) {
      if (!containerId) {
        return this.generateContainerId();
      }

      if (this._usedContainerIds.has(containerId)) {
        if (window.Logger) {
          window.Logger.warn(`TradingViewWidgetsFactory: Container ID "${containerId}" already exists, generating new one`, {
            module: 'TradingViewWidgetsFactory'
          });
        }
        return this.generateContainerId();
      }

      this._usedContainerIds.add(containerId);
      return containerId;
    },

    /**
     * Release container ID (when widget is destroyed)
     * @param {string} containerId - Container ID to release
     */
    releaseContainerId: function(containerId) {
      if (containerId) {
        this._usedContainerIds.delete(containerId);
      }
    },

    /**
     * Create widget (generic factory method)
     * @param {string} widgetType - Widget type identifier
     * @param {Object} config - Widget configuration
     * @returns {Object} Widget instance
     */
    createWidget: function(widgetType, config) {
      // Validate widget type
      if (!window.TradingViewWidgetsConfig) {
        throw new Error('TradingViewWidgetsConfig is not loaded');
      }

      const widgetConfig = window.TradingViewWidgetsConfig.getConfig(widgetType);
      if (!widgetConfig) {
        throw new Error(`Unknown widget type: ${widgetType}`);
      }

      // Validate configuration
      const validation = window.TradingViewWidgetsConfig.validateConfig(widgetType, config);
      if (!validation.valid) {
        throw new Error(`Invalid widget configuration: ${validation.errors.join(', ')}`);
      }

      // Ensure unique container ID
      const containerId = this.ensureUniqueContainerId(config.container_id);

      // Get colors from color system
      let colorConfig = {};
      if (window.TradingViewWidgetsColors) {
        colorConfig = window.TradingViewWidgetsColors.getWidgetColorConfig(widgetType, config.colors || {});
      }

      // Merge configurations
      const finalConfig = Object.assign(
        {},
        widgetConfig.defaultConfig,
        config,
        colorConfig,
        { container_id: containerId }
      );

      // Create widget based on type
      switch (widgetType) {
        case 'advanced-chart':
          return this.createAdvancedChart(finalConfig);
        case 'symbol-overview':
          return this.createSymbolOverview(finalConfig);
        case 'mini-chart':
          return this.createMiniChart(finalConfig);
        case 'ticker-tape':
          return this.createTickerTape(finalConfig);
        case 'market-overview':
          return this.createMarketOverview(finalConfig);
        case 'market-quotes':
          return this.createMarketQuotes(finalConfig);
        case 'economic-calendar':
          return this.createEconomicCalendar(finalConfig);
        case 'financials':
          return this.createFinancials(finalConfig);
        case 'screener':
          return this.createScreener(finalConfig);
        case 'heatmap':
          return this.createHeatmap(finalConfig);
        case 'symbol-profile':
          return this.createSymbolProfile(finalConfig);
        default:
          throw new Error(`Widget creation not implemented for type: ${widgetType}`);
      }
    },

    /**
     * Create Advanced Chart widget
     * @param {Object} config - Widget configuration
     * @returns {Object} Widget instance
     */
    createAdvancedChart: function(config) {
      if (!window.TradingView) {
        throw new Error('TradingView library is not loaded');
      }

      // Ensure container exists
      const container = document.getElementById(config.container_id);
      if (!container) {
        throw new Error(`Container with ID "${config.container_id}" not found`);
      }

      // Create widget
      const widget = new window.TradingView.widget(config);

      if (window.Logger) {
        window.Logger.info('TradingViewWidgetsFactory: Advanced Chart widget created', {
          module: 'TradingViewWidgetsFactory',
          containerId: config.container_id,
          symbol: config.symbol
        });
      }

      return widget;
    },

    /**
     * Create Symbol Overview widget
     * @param {Object} config - Widget configuration
     * @returns {Object} Widget instance (script element)
     */
    createSymbolOverview: function(config) {
      return this._createEmbedWidget('symbol-overview', config);
    },

    /**
     * Create Mini Chart widget
     * @param {Object} config - Widget configuration
     * @returns {Object} Widget instance (script element)
     */
    createMiniChart: function(config) {
      return this._createEmbedWidget('mini-chart', config);
    },

    /**
     * Create Ticker Tape widget
     * @param {Object} config - Widget configuration
     * @returns {Object} Widget instance (script element)
     */
    createTickerTape: function(config) {
      return this._createEmbedWidget('ticker-tape', config);
    },

    /**
     * Create Market Overview widget
     * @param {Object} config - Widget configuration
     * @returns {Object} Widget instance (script element)
     */
    createMarketOverview: function(config) {
      return this._createEmbedWidget('market-overview', config);
    },

    /**
     * Create Market Quotes widget
     * @param {Object} config - Widget configuration
     * @returns {Object} Widget instance (script element)
     */
    createMarketQuotes: function(config) {
      return this._createEmbedWidget('market-quotes', config);
    },

    /**
     * Create Economic Calendar widget
     * @param {Object} config - Widget configuration
     * @returns {Object} Widget instance (script element)
     */
    createEconomicCalendar: function(config) {
      return this._createEmbedWidget('economic-calendar', config);
    },

    /**
     * Create Financials widget
     * @param {Object} config - Widget configuration
     * @returns {Object} Widget instance (script element)
     */
    createFinancials: function(config) {
      return this._createEmbedWidget('financials', config);
    },

    /**
     * Create Screener widget
     * @param {Object} config - Widget configuration
     * @returns {Object} Widget instance (script element)
     */
    createScreener: function(config) {
      return this._createEmbedWidget('screener', config);
    },

    /**
     * Create Heatmap widget
     * @param {Object} config - Widget configuration
     * @returns {Object} Widget instance (script element)
     */
    createHeatmap: function(config) {
      return this._createEmbedWidget('heatmap', config);
    },

    /**
     * Create Symbol Profile widget
     * @param {Object} config - Widget configuration
     * @returns {Object} Widget instance (script element)
     */
    createSymbolProfile: function(config) {
      return this._createEmbedWidget('symbol-profile', config);
    },

    /**
     * Create embed widget (for widgets that use external-embedding scripts)
     * @private
     * @param {string} widgetType - Widget type identifier
     * @param {Object} config - Widget configuration
     * @returns {Object} Widget instance (script element)
     */
    _createEmbedWidget: function(widgetType, config) {
      const widgetConfig = window.TradingViewWidgetsConfig.getConfig(widgetType);
      if (!widgetConfig) {
        throw new Error(`Unknown widget type: ${widgetType}`);
      }

      // Ensure container exists
      let container = document.getElementById(config.container_id);
      if (!container) {
        // Create container if it doesn't exist
        container = document.createElement('div');
        container.id = config.container_id;
        container.className = 'tradingview-widget-container__widget';
        document.body.appendChild(container);
      }

      // Create wrapper div
      const wrapper = document.createElement('div');
      wrapper.className = 'tradingview-widget-container';
      wrapper.appendChild(container);

      // Create script element
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = widgetConfig.script;
      script.async = true;

      // Set script content (configuration)
      const scriptContent = JSON.stringify(config, null, 2);
      script.textContent = scriptContent;

      // Append script to wrapper
      wrapper.appendChild(script);

      // Insert wrapper into container's parent or body
      if (container.parentElement) {
        container.parentElement.appendChild(wrapper);
      } else {
        document.body.appendChild(wrapper);
      }

      if (window.Logger) {
        window.Logger.info(`TradingViewWidgetsFactory: ${widgetType} widget created`, {
          module: 'TradingViewWidgetsFactory',
          containerId: config.container_id,
          widgetType: widgetType
        });
      }

      return {
        container: container,
        wrapper: wrapper,
        script: script,
        type: widgetType,
        config: config
      };
    }
  };

  // Log initialization
  if (window.Logger) {
    window.Logger.info('TradingViewWidgetsFactory initialized', {
      module: 'TradingViewWidgetsFactory'
    });
  } else {
    console.log('✅ TradingViewWidgetsFactory initialized');
  }
})();

