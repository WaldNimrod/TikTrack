/**
 * ===== INFO SUMMARY SYSTEM =====
 * 
 * Unified system for rendering and managing info-summary statistics
 * across all user pages with flexible configuration per page.
 * 
 * Features:
 * - Data-driven calculations based on actual data arrays
 * - Automatic updates when table data changes
 * - Support for filters and custom formatters
 * - RTL-aware layout
 * - Backward compatible with existing HTML structure
 * 
 * Documentation: documentation/02-ARCHITECTURE/FRONTEND/INFO_SUMMARY_SYSTEM.md
 * ======================================
 */

class InfoSummarySystem {
  constructor() {
    this.calculators = this.initializeCalculators();
    this.formatters = this.initializeFormatters();
    this.initialized = true;
    
    if (window.Logger) {
      window.Logger.info('Info Summary System initialized', { page: 'info-summary-system' });
    }
  }

  /**
   * Initialize built-in calculators
   */
  initializeCalculators() {
    return {
      // Count total records
      count: (data) => data.length,
      
      // Count by status field
      countByStatus: (data, params) => {
        return data.filter(item => item.status === params.status).length;
      },
      
      // Count by any field/value
      countByField: (data, params) => {
        return data.filter(item => item[params.field] === params.value).length;
      },
      
      // Sum a numeric field
      sumField: (data, params) => {
        return data.reduce((sum, item) => {
          const value = parseFloat(item[params.field]);
          return sum + (isNaN(value) ? 0 : value);
        }, 0);
      },
      
      // Average of a field
      avgField: (data, params) => {
        const validValues = data
          .map(item => parseFloat(item[params.field]))
          .filter(value => !isNaN(value));
        
        if (validValues.length === 0) return 0;
        return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
      },
      
      // Min value of a field
      minField: (data, params) => {
        const validValues = data
          .map(item => parseFloat(item[params.field]))
          .filter(value => !isNaN(value));
        
        return validValues.length > 0 ? Math.min(...validValues) : 0;
      },
      
      // Max value of a field
      maxField: (data, params) => {
        const validValues = data
          .map(item => parseFloat(item[params.field]))
          .filter(value => !isNaN(value));
        
        return validValues.length > 0 ? Math.max(...validValues) : 0;
      },
      
      // Count by multiple conditions
      countByConditions: (data, params) => {
        return data.filter(item => {
          return params.conditions.every(condition => {
            if (condition.operator === '===') {
              return item[condition.field] === condition.value;
            } else if (condition.operator === '!==') {
              return item[condition.field] !== condition.value;
            } else if (condition.operator === '>') {
              return parseFloat(item[condition.field]) > condition.value;
            } else if (condition.operator === '<') {
              return parseFloat(item[condition.field]) < condition.value;
            }
            return false;
          });
        }).length;
      },
      
      // Custom P/L calculation for trades
      customTradesPL: (data) => {
        let totalPL = 0;
        
        data.forEach(trade => {
          if (trade.position && trade.position.quantity && trade.position.average_price) {
            // Get current price from ticker data if available
            const tickerData = window.tickerDataMap && window.tickerDataMap[trade.ticker_id];
            const currentPrice = tickerData?.current_price || trade.current_price || 0;
            const avgPrice = parseFloat(trade.position.average_price) || 0;
            const qty = parseFloat(trade.position.quantity) || 0;
            
            if (currentPrice > 0 && avgPrice > 0) {
              // Same calculation as in the table
              const plValue = (currentPrice - avgPrice) * qty;
              totalPL += plValue;
            }
          }
        });
        
        return totalPL;
      }
    };
  }

  /**
   * Initialize built-in formatters
   */
  initializeFormatters() {
    return {
      // Currency formatting
      currency: (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return '$0';
        return `$${num.toFixed(2)}`;
      },
      
      // Currency formatting with color based on value
      currencyWithColor: (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return '$0';
        
        const formattedValue = `$${num.toFixed(2)}`;
        
        // Get colors from global system
        const colors = window.getTableColors ? window.getTableColors() : { 
          positive: '#28a745', 
          negative: '#dc3545' 
        };
        
        const color = num >= 0 ? colors.positive : colors.negative;
        
        return `<span style="color: ${color}; font-weight: bold;">${formattedValue}</span>`;
      },
      
      // Number formatting with decimals
      number: (value, decimals = 0) => {
        const num = parseFloat(value);
        if (isNaN(num)) return '0';
        return num.toFixed(decimals);
      },
      
      // Percentage formatting
      percentage: (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return '0%';
        return `${num.toFixed(1)}%`;
      },
      
      // Integer formatting
      integer: (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return '0';
        return Math.round(num).toString();
      },
      
      // Custom formatter
      custom: (value, formatter) => {
        if (typeof formatter === 'function') {
          return formatter(value);
        }
        return value.toString();
      }
    };
  }

  /**
   * Calculate statistics from data array
   * @param {Array} data - The data array to calculate from
   * @param {Array} stats - Array of stat configurations
   * @returns {Object} Calculated statistics
   */
  calculateStatsFromData(data, stats) {
    const results = {};
    
    stats.forEach(stat => {
      try {
        const calculator = this.calculators[stat.calculator];
        if (!calculator) {
          console.warn(`Calculator '${stat.calculator}' not found for stat '${stat.id}'`);
          results[stat.id] = 0;
          return;
        }
        
        const value = calculator(data, stat.params || {});
        results[stat.id] = value;
        
        // Handle sub-stats (like buy/sell breakdown)
        if (stat.subStats) {
          stat.subStats.forEach(subStat => {
            const subCalculator = this.calculators[subStat.calculator];
            if (subCalculator) {
              results[subStat.id] = subCalculator(data, subStat.params || {});
            }
          });
        }
      } catch (error) {
        console.error(`Error calculating stat '${stat.id}':`, error);
        results[stat.id] = 0;
      }
    });
    
    return results;
  }

  /**
   * Format a value using the specified formatter
   * @param {*} value - The value to format
   * @param {string} formatter - The formatter name
   * @param {*} formatterParams - Additional formatter parameters
   * @returns {string} Formatted value
   */
  formatValue(value, formatter, formatterParams = {}) {
    if (!formatter) return value.toString();
    
    const formatterFn = this.formatters[formatter];
    if (!formatterFn) {
      console.warn(`Formatter '${formatter}' not found`);
      return value.toString();
    }
    
    try {
      return formatterFn(value, formatterParams);
    } catch (error) {
      console.error(`Error formatting value '${value}' with formatter '${formatter}':`, error);
      return value.toString();
    }
  }

  /**
   * Render info summary HTML
   * @param {string} containerId - The container element ID
   * @param {Object} stats - Calculated statistics
   * @param {Array} config - Stat configurations
   */
  renderInfoSummary(containerId, stats, config) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container '${containerId}' not found`);
      return;
    }
    
    let html = '';
    
    config.stats.forEach(stat => {
      const value = stats[stat.id];
      const formattedValue = this.formatValue(value, stat.formatter, stat.formatterParams);
      
      // Main stat line
      html += `<div>${stat.label}: <strong id="${stat.id}">${formattedValue}</strong></div>`;
      
      // Sub-stats (like buy/sell breakdown)
      if (stat.subStats) {
        stat.subStats.forEach(subStat => {
          const subValue = stats[subStat.id];
          const subFormattedValue = this.formatValue(subValue, subStat.formatter, subStat.formatterParams);
          const className = subStat.className ? ` class="${subStat.className}"` : '';
          html += `<span id="${subStat.id}"${className}>${subFormattedValue}</span>`;
        });
      }
    });
    
    container.innerHTML = html;
    
    if (window.Logger) {
      window.Logger.info(`Info summary rendered for container '${containerId}'`, { 
        page: 'info-summary-system',
        statsCount: config.stats.length,
        containerId 
      });
    }
  }

  /**
   * Main method: Calculate and render summary statistics
   * @param {Array} data - The data array
   * @param {Object} config - Page configuration
   */
  calculateAndRender(data, config) {
    if (!data || !Array.isArray(data)) {
      console.warn('Invalid data provided to InfoSummarySystem');
      return;
    }
    
    if (!config || !config.stats) {
      console.warn('Invalid config provided to InfoSummarySystem');
      return;
    }
    
    try {
      // Calculate statistics
      const stats = this.calculateStatsFromData(data, config.stats);
      
      // Render the summary
      this.renderInfoSummary(config.containerId, stats, config);
      
    } catch (error) {
      console.error('Error in InfoSummarySystem.calculateAndRender:', error);
    }
  }

  /**
   * Update existing summary with new data
   * @param {Array} data - The new data array
   * @param {string} pageName - The page name (for config lookup)
   */
  updateSummary(data, pageName) {
    if (!window.INFO_SUMMARY_CONFIGS || !window.INFO_SUMMARY_CONFIGS[pageName]) {
      console.warn(`No config found for page '${pageName}'`);
      return;
    }
    
    const config = window.INFO_SUMMARY_CONFIGS[pageName];
    this.calculateAndRender(data, config);
  }
}

// Initialize and expose globally
window.InfoSummarySystem = new InfoSummarySystem();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InfoSummarySystem;
}
