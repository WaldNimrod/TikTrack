/**
 * TradingView Widgets Configuration
 * ==================================
 * 
 * Configuration for all 11 official TradingView widgets
 * 
 * Documentation: documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_WIDGETS_IMPLEMENTATION_PLAN.md
 * 
 * @module TradingViewWidgetsConfig
 */

(function() {
  'use strict';

  /**
   * TradingView Widgets Configuration
   * Contains default configurations for all 11 official TradingView widgets
   */
  window.TradingViewWidgetsConfig = {
    /**
     * Single script for Advanced Chart widget
     * All other widgets use their own embed scripts
     */
    WIDGET_SCRIPT: 'https://s3.tradingview.com/tv.js',

    /**
     * Widget Types Configuration
     * Each widget type has its own script and default configuration
     */
    WIDGET_TYPES: {
      'advanced-chart': {
        script: 'https://s3.tradingview.com/tv.js',
        defaultConfig: {
          autosize: true,
          symbol: 'NASDAQ:AAPL',
          interval: 'D',
          timezone: 'Asia/Jerusalem',
          theme: 'light',
          style: '1',
          locale: 'he',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          width: '100%',
          height: 600
        },
        requiredParams: ['symbol', 'container_id'],
        supportsRTL: false, // RTL not officially supported - checked in documentation
        responsive: true
      },

      'symbol-overview': {
        script: 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js',
        defaultConfig: {
          symbols: [{
            proName: 'NASDAQ:AAPL',
            title: 'Apple Inc.'
          }],
          chartOnly: false,
          width: '100%',
          height: 400,
          locale: 'he',
          colorTheme: 'light',
          autosize: true,
          showVolume: false,
          hideDateRanges: false,
          scalePosition: 'right',
          scaleMode: 'Normal',
          fontFamily: '-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif',
          fontSize: '10',
          noTimeScale: false,
          valuesTracking: '1',
          changeMode: 'price-and-percent',
          chartType: 'area',
          isTransparent: false
        },
        requiredParams: ['symbols'],
        supportsRTL: false,
        responsive: true
      },

      'mini-chart': {
        script: 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js',
        defaultConfig: {
          symbol: 'NASDAQ:AAPL',
          width: '100%',
          height: 220,
          dateRange: '1M',
          colorTheme: 'light',
          isTransparent: false,
          locale: 'he',
          largeChartUrl: ''
        },
        requiredParams: ['symbol'],
        supportsRTL: false,
        responsive: true
      },

      'ticker-tape': {
        script: 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js',
        defaultConfig: {
          symbols: [
            { proName: 'NASDAQ:AAPL', title: 'Apple' },
            { proName: 'NASDAQ:MSFT', title: 'Microsoft' },
            { proName: 'NASDAQ:GOOGL', title: 'Google' }
          ],
          colorTheme: 'light',
          isTransparent: false,
          displayMode: 'regular',
          locale: 'he'
        },
        requiredParams: ['symbols'],
        supportsRTL: false,
        responsive: true
      },

      'market-overview': {
        script: 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js',
        defaultConfig: {
          colorTheme: 'light',
          dateRange: '1M',
          showChart: true,
          locale: 'he',
          largeChartUrl: '',
          isTransparent: false,
          width: '100%',
          height: 600,
          tabs: [
            {
              title: 'מניות',
              symbols: [
                { s: 'FOREXCOM:SPXUSD', d: 'S&P 500' },
                { s: 'FOREXCOM:NSXUSD', d: 'NASDAQ 100' },
                { s: 'FOREXCOM:DJI', d: 'Dow Jones' }
              ],
              originalTitle: 'Indices'
            }
          ]
        },
        requiredParams: ['tabs'],
        supportsRTL: false,
        responsive: true
      },

      'market-quotes': {
        script: 'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js',
        defaultConfig: {
          width: '100%',
          height: 600,
          symbolsGroups: [
            {
              name: 'מניות',
              originalName: 'Indices',
              symbols: [
                { name: 'NASDAQ:AAPL', displayName: 'Apple' },
                { name: 'NASDAQ:MSFT', displayName: 'Microsoft' }
              ]
            }
          ],
          showSymbolLogo: true,
          colorTheme: 'light',
          isTransparent: false,
          locale: 'he'
        },
        requiredParams: ['symbolsGroups'],
        supportsRTL: false,
        responsive: true
      },

      'economic-calendar': {
        script: 'https://s3.tradingview.com/external-embedding/embed-widget-events.js',
        defaultConfig: {
          colorTheme: 'light',
          isTransparent: false,
          width: '100%',
          height: 600,
          locale: 'he',
          importanceFilter: '-1,0,1'
        },
        requiredParams: [],
        supportsRTL: false,
        responsive: true
      },

      'financials': {
        script: 'https://s3.tradingview.com/external-embedding/embed-widget-financials.js',
        defaultConfig: {
          symbol: 'NASDAQ:AAPL',
          colorTheme: 'light',
          isTransparent: false,
          locale: 'he',
          width: '100%',
          height: 600
        },
        requiredParams: ['symbol'],
        supportsRTL: false,
        responsive: true
      },

      'screener': {
        script: 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js',
        defaultConfig: {
          width: '100%',
          height: 600,
          defaultColumn: 'overview',
          screener_type: 'stock_market',
          displayCurrency: 'USD',
          colorTheme: 'light',
          locale: 'he',
          isTransparent: false
        },
        requiredParams: [],
        supportsRTL: false,
        responsive: true
      },

      'heatmap': {
        script: 'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js',
        defaultConfig: {
          exchanges: ['NYSE', 'NASDAQ'],
          dataSource: 'SPX500',
          grouping: 'sector',
          blockSize: 'market_cap',
          blockColor: 'change',
          locale: 'he',
          symbolUrl: '',
          colorTheme: 'light',
          isTransparent: false
        },
        requiredParams: ['exchanges', 'dataSource'],
        supportsRTL: false,
        responsive: true
      },

      'symbol-profile': {
        script: 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js',
        defaultConfig: {
          symbol: 'NASDAQ:AAPL',
          colorTheme: 'light',
          locale: 'he',
          width: '100%',
          height: 600,
          isTransparent: false
        },
        requiredParams: ['symbol'],
        supportsRTL: false,
        responsive: true
      }
    },

    /**
     * Get configuration for a specific widget type
     * @param {string} widgetType - Widget type identifier
     * @returns {Object|null} Widget configuration or null if not found
     */
    getConfig: function(widgetType) {
      if (!this.WIDGET_TYPES[widgetType]) {
        if (window.Logger) {
          window.Logger.error(`TradingViewWidgetsConfig: Widget type "${widgetType}" not found`, {
            module: 'TradingViewWidgetsConfig',
            availableTypes: Object.keys(this.WIDGET_TYPES)
          });
        }
        return null;
      }
      return this.WIDGET_TYPES[widgetType];
    },

    /**
     * Validate widget configuration
     * @param {string} widgetType - Widget type identifier
     * @param {Object} config - Configuration to validate
     * @returns {Object} Validation result { valid: boolean, errors: string[] }
     */
    validateConfig: function(widgetType, config) {
      const widgetConfig = this.getConfig(widgetType);
      if (!widgetConfig) {
        return {
          valid: false,
          errors: [`Widget type "${widgetType}" not found`]
        };
      }

      const errors = [];
      const requiredParams = widgetConfig.requiredParams || [];

      // Check required parameters
      for (const param of requiredParams) {
        if (!config || config[param] === undefined || config[param] === null) {
          errors.push(`Required parameter "${param}" is missing`);
        }
      }

      // Check container_id (required for all widgets)
      if (!config || !config.container_id) {
        errors.push('Required parameter "container_id" is missing');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    /**
     * Get all available widget types
     * @returns {string[]} Array of widget type identifiers
     */
    getAvailableTypes: function() {
      return Object.keys(this.WIDGET_TYPES);
    },

    /**
     * Check if widget type supports RTL
     * @param {string} widgetType - Widget type identifier
     * @returns {boolean} True if RTL is supported
     */
    supportsRTL: function(widgetType) {
      const config = this.getConfig(widgetType);
      return config ? config.supportsRTL : false;
    }
  };

  // Log initialization
  if (window.Logger) {
    window.Logger.info('TradingViewWidgetsConfig initialized', {
      module: 'TradingViewWidgetsConfig',
      widgetTypes: Object.keys(window.TradingViewWidgetsConfig.WIDGET_TYPES).length
    });
  } else {
    console.log('✅ TradingViewWidgetsConfig initialized');
  }
})();

