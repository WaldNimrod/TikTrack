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
    
    // Use console.log instead of Logger to avoid potential circular dependencies
    // Logger may depend on InfoSummarySystem through toggleSection
    const DEBUG_MODE = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.search.includes('debug=true');
    
    if (DEBUG_MODE) {
      console.debug('Info Summary System initialized');
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
      },
      
      // Custom total balance calculation for trading accounts (requires API calls)
      customTradingAccountsBalance: async (data) => {
        console.log('🔍 customTradingAccountsBalance called with', data?.length, 'accounts');
        if (!data || !Array.isArray(data) || data.length === 0) {
          console.log('⚠️ No accounts data, returning 0');
          return { amount: 0, currency: 'USD' };
        }
        
        try {
          // Load balances for all accounts in batch
          const accountIds = data.map(acc => acc.id);
          console.log('📡 Loading balances for account IDs:', accountIds);
          let balancesMap = new Map();
          
          if (typeof window.loadAccountBalancesBatch === 'function') {
            console.log('✅ Calling window.loadAccountBalancesBatch...');
            balancesMap = await window.loadAccountBalancesBatch(accountIds);
            console.log('✅ Received balances map with', balancesMap.size, 'entries');
          } else if (typeof loadAccountBalancesBatch === 'function') {
            console.log('✅ Calling loadAccountBalancesBatch...');
            balancesMap = await loadAccountBalancesBatch(accountIds);
            console.log('✅ Received balances map with', balancesMap.size, 'entries');
          } else {
            console.warn('⚠️ loadAccountBalancesBatch not available');
            return { amount: 0, currency: 'USD' };
          }
          
          // Calculate total balance and get currency
          let totalBalance = 0;
          let baseCurrency = null; // Will be set from first account
          
          balancesMap.forEach((balanceData) => {
            if (balanceData && balanceData.base_currency_total) {
              totalBalance += parseFloat(balanceData.base_currency_total) || 0;
              // Use the currency from the first account with balance
              if (balanceData.base_currency && !baseCurrency) {
                baseCurrency = balanceData.base_currency;
              }
            }
          });
          
          // Default to USD if no currency found
          if (!baseCurrency) {
            baseCurrency = 'USD';
          }
          
          console.log('✅ Total balance calculated:', { amount: totalBalance, currency: baseCurrency });
          return { amount: totalBalance, currency: baseCurrency };
        } catch (error) {
          console.error('❌ Error calculating total balance:', error);
          return { amount: 0, currency: 'USD' };
        }
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
      currencyWithColor: (value, params = {}) => {
        // Support both number and object with amount/currency
        let amount = 0;
        let currency = '$';
        
        if (typeof value === 'object' && value !== null && value.amount !== undefined) {
          // Object format: { amount: 1234.56, currency: 'USD' }
          amount = parseFloat(value.amount) || 0;
          const currencyCode = value.currency || 'USD';
          
          // Convert currency code to symbol
          switch (currencyCode.toUpperCase()) {
            case 'USD': currency = '$'; break;
            case 'ILS': currency = '₪'; break;
            case 'EUR': currency = '€'; break;
            case 'GBP': currency = '£'; break;
            case 'JPY': currency = '¥'; break;
            default: currency = currencyCode; // If already a symbol, use as is
          }
        } else {
          // Number format (backward compatibility)
          amount = parseFloat(value);
          if (isNaN(amount)) {
            // Use renderAmount for consistency
            if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
              return window.FieldRendererService.renderAmount(0, '$', 2, false); // showSign = false for zero
            }
            return '$0';
          }
          currency = '$'; // Default
        }
        
        // Format balance like in table: number + currency symbol (RTL), with color based on value
        // Show minus sign for negative values (showSign = true)
        if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
          return window.FieldRendererService.renderAmount(amount, currency, 2, true); // showSign = true (show minus for negative)
        }
        
        // Fallback if renderAmount not available
        const formatted = Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const colorClass = amount >= 0 ? 'numeric-value-positive' : 'numeric-value-negative';
        // RTL: מספר קודם (ימין), אחר כך סימן מטבע (שמאל)
        return `<span class="${colorClass}">${formatted}${currency}</span>`;
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
   * @returns {Promise<Object>|Object} Calculated statistics (Promise if async calculators are used)
   */
  async calculateStatsFromData(data, stats) {
    const results = {};
    const asyncCalculations = [];
    
    stats.forEach((stat, index) => {
      try {
        const calculator = this.calculators[stat.calculator];
        if (!calculator) {
          console.warn(`Calculator '${stat.calculator}' not found for stat '${stat.id}'`);
          results[stat.id] = 0;
          return;
        }
        
        // Check if calculator is async
        const calculatorResult = calculator(data, stat.params || {});
        if (calculatorResult instanceof Promise) {
          // Store async calculation
          asyncCalculations.push({
            statId: stat.id,
            promise: calculatorResult
          });
          results[stat.id] = null; // Will be filled after async completes
        } else {
          results[stat.id] = calculatorResult;
        }
        
        // Handle sub-stats (like buy/sell breakdown)
        if (stat.subStats) {
          stat.subStats.forEach(subStat => {
            const subCalculator = this.calculators[subStat.calculator];
            if (subCalculator) {
              const subResult = subCalculator(data, subStat.params || {});
              if (subResult instanceof Promise) {
                asyncCalculations.push({
                  statId: subStat.id,
                  promise: subResult
                });
                results[subStat.id] = null;
              } else {
                results[subStat.id] = subResult;
              }
            }
          });
        }
      } catch (error) {
        console.error(`Error calculating stat '${stat.id}':`, error);
        results[stat.id] = 0;
      }
    });
    
    // Wait for all async calculations to complete
    if (asyncCalculations.length > 0) {
      const asyncResults = await Promise.all(
        asyncCalculations.map(item => item.promise)
      );
      asyncCalculations.forEach((item, index) => {
        results[item.statId] = asyncResults[index];
      });
    }
    
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
    
    console.log('📝 Setting innerHTML to:', html.substring(0, 300));
    container.innerHTML = html;
    console.log('✅ innerHTML set. Current innerHTML:', container.innerHTML.substring(0, 300));
    
    // Use console.log instead of Logger to avoid potential circular dependencies
    const DEBUG_MODE = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.search.includes('debug=true');
    
    if (DEBUG_MODE) {
      console.debug(`Info summary rendered for container '${containerId}'`, { 
        statsCount: config.stats.length,
        containerId 
      });
    }
  }

  /**
   * Main method: Calculate and render summary statistics
   * @param {Array} data - The data array
   * @param {Object} config - Page configuration
   * @returns {Promise<void>}
   */
  async calculateAndRender(data, config) {
    console.log('🔍 InfoSummarySystem.calculateAndRender called with:', { dataLength: data?.length, statsCount: config?.stats?.length, containerId: config?.containerId });
    
    if (!data || !Array.isArray(data)) {
      console.warn('Invalid data provided to InfoSummarySystem');
      return;
    }
    
    if (!config || !config.stats) {
      console.warn('Invalid config provided to InfoSummarySystem');
      return;
    }
    
    try {
      // Calculate statistics (now async to support async calculators)
      console.log('⚙️ Calculating stats from data...');
      const stats = await this.calculateStatsFromData(data, config.stats);
      console.log('✅ Stats calculated:', stats);
      
      // Render the summary
      this.renderInfoSummary(config.containerId, stats, config);
      console.log('✅ Summary rendered to container:', config.containerId);
      console.log('📄 HTML Content:', document.getElementById(config.containerId)?.innerHTML?.substring(0, 200));
      
    } catch (error) {
      console.error('Error in InfoSummarySystem.calculateAndRender:', error);
    }
  }

  /**
   * Update existing summary with new data
   * @param {Array} data - The new data array
   * @param {string} pageName - The page name (for config lookup)
   */
  async updateSummary(data, pageName) {
    if (!window.INFO_SUMMARY_CONFIGS || !window.INFO_SUMMARY_CONFIGS[pageName]) {
      console.warn(`No config found for page '${pageName}'`);
      return;
    }
    
    const config = window.INFO_SUMMARY_CONFIGS[pageName];
    await this.calculateAndRender(data, config);
  }
}

// Initialize and expose globally
window.InfoSummarySystem = new InfoSummarySystem();
console.log('✅ InfoSummarySystem initialized with customTradingAccountsBalance calculator');

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InfoSummarySystem;
}
