/**
 * TradingView Widgets Colors Integration
 * =======================================
 * 
 * Integration with dynamic color system for TradingView widgets
 * 
 * Documentation: documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_WIDGETS_IMPLEMENTATION_PLAN.md
 * 
 * @module TradingViewWidgetsColors
 */

(function() {
  'use strict';

  /**
   * TradingView Widgets Colors Manager
   * Handles color integration with user preferences and dynamic color system
   */
  window.TradingViewWidgetsColors = {
    /**
     * Color change watchers
     */
    _colorWatchers: [],

    /**
     * Get chart colors from user preferences
     * Fallback chain: Preferences → CSS variables → Entity colors → Logo colors → Defaults
     * 
     * @returns {Object} Chart colors object
     */
    getChartColors: function() {
      const colors = {};
      
      // Try to get from currentPreferences
      const preferences = window.currentPreferences || window.userPreferences || {};
      
      // Chart color keys
      const colorKeys = {
        primary: 'chartPrimaryColor',
        secondary: 'chartSecondaryColor',
        background: 'chartBackgroundColor',
        text: 'chartTextColor',
        grid: 'chartGridColor',
        border: 'chartBorderColor',
        point: 'chartPointColor'
      };

      // Fallback chain for each color
      for (const [key, prefKey] of Object.entries(colorKeys)) {
        colors[key] = this._getColorWithFallback(prefKey, key);
      }

      // Logo colors (final fallback)
      if (!colors.primary) colors.primary = '#26baac'; // Turquoise-Green
      if (!colors.secondary) colors.secondary = '#fc5a06'; // Orange-Red

      return colors;
    },

    /**
     * Get color with fallback chain
     * @private
     * @param {string} preferenceKey - Preference key name
     * @param {string} cssVarKey - CSS variable key (without --)
     * @returns {string} Color value
     */
    _getColorWithFallback: function(preferenceKey, cssVarKey) {
      // 1. Try user preferences
      const preferences = window.currentPreferences || window.userPreferences || {};
      if (preferences[preferenceKey]) {
        return preferences[preferenceKey];
      }

      // 2. Try ColorManager (if available)
      if (window.ColorManager && window.ColorManager.colorCache) {
        const cached = window.ColorManager.colorCache.get(preferenceKey);
        if (cached) {
          return cached;
        }
      }

      // 3. Try CSS variables
      const cssVar = `--chart-${cssVarKey.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      const cssValue = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
      if (cssValue) {
        return cssValue;
      }

      // 4. Try entity colors (for primary/secondary)
      if (cssVarKey === 'primary' && preferences.entityTradeColor) {
        return preferences.entityTradeColor;
      }
      if (cssVarKey === 'secondary' && preferences.secondaryColor) {
        return preferences.secondaryColor;
      }

      // 5. Return null (will use logo colors as final fallback)
      return null;
    },

    /**
     * Get widget color configuration for a specific widget type
     * Maps chart colors to TradingView widget color parameters
     * 
     * @param {string} widgetType - Widget type identifier
     * @param {Object} userColors - Optional user-provided colors
     * @returns {Object} Widget color configuration
     */
    getWidgetColorConfig: function(widgetType, userColors = {}) {
      const chartColors = this.getChartColors();
      const preferences = window.currentPreferences || window.userPreferences || {};
      
      // Get theme from preferences
      const theme = preferences.theme || 'light';
      
      // Base color config
      const colorConfig = {
        colorTheme: theme,
        locale: preferences.language || 'he',
        isTransparent: false
      };

      // Widget-specific color mappings
      switch (widgetType) {
        case 'advanced-chart':
          // Advanced Chart uses theme and toolbar_bg
          colorConfig.theme = theme;
          colorConfig.toolbar_bg = chartColors.background || '#f1f3f6';
          break;

        case 'symbol-overview':
        case 'mini-chart':
          // Symbol Overview and Mini Chart use lineColor, topColor, bottomColor
          colorConfig.lineColor = userColors.lineColor || `rgba(${this._hexToRgb(chartColors.primary)}, 1)`;
          colorConfig.topColor = userColors.topColor || `rgba(${this._hexToRgb(chartColors.primary)}, 0.3)`;
          colorConfig.bottomColor = userColors.bottomColor || `rgba(${this._hexToRgb(chartColors.primary)}, 0.1)`;
          break;

        case 'market-quotes':
          // Market Quotes uses plotLineColorGrowing and plotLineColorFalling
          colorConfig.plotLineColorGrowing = userColors.plotLineColorGrowing || chartColors.primary;
          colorConfig.plotLineColorFalling = userColors.plotLineColorFalling || chartColors.secondary;
          break;

        default:
          // Other widgets use colorTheme
          colorConfig.colorTheme = theme;
          break;
      }

      // Merge user-provided colors (override defaults)
      return Object.assign({}, colorConfig, userColors);
    },

    /**
     * Convert hex color to RGB
     * @private
     * @param {string} hex - Hex color string
     * @returns {string} RGB color string (r, g, b)
     */
    _hexToRgb: function(hex) {
      if (!hex) return '38, 186, 172'; // Default to logo primary color
      
      // Remove # if present
      hex = hex.replace('#', '');
      
      // Parse RGB
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      return `${r}, ${g}, ${b}`;
    },

    /**
     * Apply colors to a widget instance
     * Updates widget colors dynamically
     * 
     * @param {Object} widget - Widget instance
     * @param {Object} colors - Color configuration
     */
    applyColorsToWidget: function(widget, colors) {
      if (!widget) {
        if (window.Logger) {
          window.Logger.warn('TradingViewWidgetsColors: Cannot apply colors - widget is null', {
            module: 'TradingViewWidgetsColors'
          });
        }
        return;
      }

      // TradingView widgets don't support dynamic color updates after creation
      // Colors must be set during widget initialization
      if (window.Logger) {
        window.Logger.info('TradingViewWidgetsColors: Colors should be set during widget initialization', {
          module: 'TradingViewWidgetsColors',
          note: 'TradingView widgets require color configuration at creation time'
        });
      }
    },

    /**
     * Watch for color changes and update all widgets
     * @param {Function} callback - Callback function to call when colors change
     */
    watchColorChanges: function(callback) {
      if (typeof callback !== 'function') {
        if (window.Logger) {
          window.Logger.warn('TradingViewWidgetsColors: watchColorChanges requires a function callback', {
            module: 'TradingViewWidgetsColors'
          });
        }
        return;
      }

      this._colorWatchers.push(callback);

      // Listen to preferences loaded event
      document.addEventListener('preferences:all-loaded', () => {
        if (window.Logger) {
          window.Logger.info('TradingViewWidgetsColors: Preferences loaded, notifying watchers', {
            module: 'TradingViewWidgetsColors',
            watchersCount: this._colorWatchers.length
          });
        }
        this._notifyColorWatchers();
      });

      // Listen to CSS variable changes (if MutationObserver is available)
      if (window.MutationObserver) {
        const observer = new MutationObserver(() => {
          this._notifyColorWatchers();
        });

        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['style', 'class']
        });
      }
    },

    /**
     * Notify all color watchers
     * @private
     */
    _notifyColorWatchers: function() {
      const colors = this.getChartColors();
      this._colorWatchers.forEach(callback => {
        try {
          callback(colors);
        } catch (error) {
          if (window.Logger) {
            window.Logger.error('TradingViewWidgetsColors: Error in color watcher callback', error, {
              module: 'TradingViewWidgetsColors'
            });
          }
        }
      });
    },

    /**
     * Update colors for all widgets
     * Note: TradingView widgets don't support dynamic color updates
     * This function logs a warning and suggests recreating widgets
     */
    updateAllWidgetsColors: function() {
      if (window.Logger) {
        window.Logger.warn('TradingViewWidgetsColors: TradingView widgets require recreation for color updates', {
          module: 'TradingViewWidgetsColors',
          suggestion: 'Use TradingViewWidgetsManager.refreshAllWidgets() to recreate widgets with new colors'
        });
      }

      // Notify watchers
      this._notifyColorWatchers();
    },

    /**
     * Get current theme (light/dark)
     * @returns {string} Theme value ('light' or 'dark')
     */
    getTheme: function() {
      const preferences = window.currentPreferences || window.userPreferences || {};
      return preferences.theme || 'light';
    },

    /**
     * Get current locale
     * @returns {string} Locale value (e.g., 'he', 'en')
     */
    getLocale: function() {
      const preferences = window.currentPreferences || window.userPreferences || {};
      return preferences.language || 'he';
    }
  };

  // Initialize color watching on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (window.Logger) {
        window.Logger.info('TradingViewWidgetsColors initialized', {
          module: 'TradingViewWidgetsColors'
        });
      }
    });
  } else {
    if (window.Logger) {
      window.Logger.info('TradingViewWidgetsColors initialized', {
        module: 'TradingViewWidgetsColors'
      });
    }
  }
})();

