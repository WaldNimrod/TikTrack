/**
 * Render Stage - UAI Stage 4
 * --------------------------------------------------------
 * Renders tables and UI components with loaded data
 * 
 * @description Stage 4 of UAI lifecycle - UI rendering
 * @version v1.0.0
 */

import { StageBase } from './StageBase.js';
import { maskedLog } from '../../../utils/maskedLog.js';

export class RenderStage extends StageBase {
  constructor() {
    super('Render');
    this.components = {};
  }
  
  /**
   * Execute Render stage
   * @returns {Promise<void>}
   */
  async execute() {
    try {
      this.markStarted();
      
      // Wait for Data stage to complete
      await this.waitForStage('Data');
      
      // Get config from UAI
      const config = window.UAI?.config || window.UAIState?.config;
      if (!config) {
        throw new Error('UAI config not found');
      }
      
      // Identify components that need rendering
      const components = this.identifyComponents(config);
      
      if (components.length === 0) {
        maskedLog('[Render Stage] No components identified for rendering');
      } else {
        maskedLog('[Render Stage] Components identified:', { components });
        
        // Load component initializers
        await this.loadComponentInitializers(components, config);
        
        // Initialize components
        await this.initializeComponents(components, config);
      }
      
      // Emit render complete event
      this.emit('complete', {
        components: Object.keys(this.components),
        componentsCount: Object.keys(this.components).length
      });
      
      maskedLog('[Render Stage] Rendering completed', {
        componentsInitialized: Object.keys(this.components).length
      });
      
      this.markCompleted();
    } catch (error) {
      this.markError(error);
      throw error;
    }
  }
  
  /**
   * Identify UI components that need rendering
   * @param {Object} config - UAI config
   * @returns {Array<string>} Component names
   */
  identifyComponents(config) {
    const components = [];
    
    // Check for tables
    if (config.tables && config.tables.length > 0) {
      components.push('table');
    }
    
    // Check DOM for other components
    if (document.querySelector('.js-filter')) {
      components.push('filter');
    }
    
    if (document.querySelector('.info-summary')) {
      components.push('summary');
    }
    
    return components;
  }
  
  /**
   * Load component initializer scripts
   * @param {Array<string>} components - Component names
   * @param {Object} config - UAI config
   * @returns {Promise<void>}
   */
  async loadComponentInitializers(components, config) {
    const pageType = config.pageType || this.detectPageType();
    
    for (const component of components) {
      if (component === 'table') {
        // Load table init script
        const tableInitPath = this.getTableInitPath(pageType);
        if (tableInitPath) {
          await this.loadScript(tableInitPath);
        }
      }
      
      // Add other component loaders as needed
    }
  }
  
  /**
   * Initialize components
   * @param {Array<string>} components - Component names
   * @param {Object} config - UAI config
   * @returns {Promise<void>}
   */
  async initializeComponents(components, config) {
    const pageType = config.pageType || this.detectPageType();
    
    for (const component of components) {
      if (component === 'table') {
        await this.initializeTable(pageType, config);
      }
      
      // Add other component initializers as needed
    }
  }
  
  /**
   * Initialize table component
   * @param {string} pageType - Page type
   * @param {Object} config - UAI config
   * @returns {Promise<void>}
   */
  async initializeTable(pageType, config) {
    try {
      // Get data from UAI state
      const data = window.UAIState?.data || {};
      
      // Find table init function
      const initFunction = this.findTableInitFunction(pageType);
      
      if (initFunction) {
        // Call table init function
        if (typeof initFunction === 'function') {
          await initFunction(data, config);
        } else if (typeof initFunction.init === 'function') {
          await initFunction.init(data, config);
        }
        
        this.components.table = { initialized: true };
        maskedLog('[Render Stage] Table initialized:', { pageType });
      } else {
        maskedLog('[Render Stage] Table init function not found for:', { pageType });
      }
    } catch (error) {
      maskedLog('[Render Stage] Failed to initialize table:', { message: error?.message });
      throw error;
    }
  }
  
  /**
   * Find table init function
   * @param {string} pageType - Page type
   * @returns {Function|Object|null} Init function
   */
  findTableInitFunction(pageType) {
    // Try common patterns for table init functions
    const functionName = this.getTableInitFunctionName(pageType);
    
    // Check global scope
    if (window[functionName]) {
      return window[functionName];
    }
    
    return null;
  }
  
  /**
   * Get table init function name
   * @param {string} pageType - Page type
   * @returns {string} Function name
   */
  getTableInitFunctionName(pageType) {
    // Convert pageType to camelCase function name
    // e.g., "cashFlows" -> "initCashFlowsTable"
    const capitalized = pageType.charAt(0).toUpperCase() + pageType.slice(1);
    return `init${capitalized}Table`;
  }
  
  /**
   * Get table init script path
   * @param {string} pageType - Page type
   * @returns {string|null} Script path
   */
  getTableInitPath(pageType) {
    const pathMap = {
      'cashFlows': '/src/views/financial/cashFlows/cashFlowsTableInit.js',
      'brokersFees': '/src/views/financial/brokersFees/brokersFeesTableInit.js',
      'tradingAccounts': '/src/views/financial/tradingAccounts/tradingAccountsTableInit.js'
    };
    return pathMap[pageType] || null;
  }
  
  /**
   * Detect page type from URL
   * @returns {string} Page type
   */
  detectPageType() {
    const path = window.location.pathname;
    const pageMap = {
      '/cash_flows.html': 'cashFlows',
      '/brokers_fees.html': 'brokersFees',
      '/trading_accounts.html': 'tradingAccounts'
    };
    return pageMap[path] || 'default';
  }
}
