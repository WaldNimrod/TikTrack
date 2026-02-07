/**
 * Data Stage - UAI Stage 3
 * --------------------------------------------------------
 * Loads data from API using page-specific data loaders
 * 
 * @description Stage 3 of UAI lifecycle - Data loading
 * @version v1.0.0
 */

import { StageBase } from './StageBase.js';
import sharedServices from '../Shared_Services.js';

export class DataStage extends StageBase {
  constructor() {
    super('Data');
    this.data = {};
    this.loaders = {};
  }
  
  /**
   * Execute Data stage
   * @returns {Promise<void>}
   */
  async execute() {
    try {
      this.markStarted();
      
      // Wait for Bridge stage to complete
      await this.waitForStage('Bridge');
      
      // Ensure Shared Services is initialized
      try {
        await sharedServices.init();
      } catch (error) {
        console.warn('[Data Stage] Shared Services initialization failed, continuing with fallback:', error);
        // Continue anyway - some pages may not need Shared Services
      }
      
      // Get config from UAI
      const config = window.UAI?.config || window.UAIState?.config;
      if (!config) {
        throw new Error('UAI config not found');
      }
      
      // Get data loader path from config
      if (config.dataLoader) {
        await this.loadDataLoader(config.dataLoader);
        await this.fetchData(config);
      } else if (config.apiEndpoint) {
        // Use Shared Services directly if apiEndpoint is configured
        await this.fetchDataViaSharedServices(config);
      } else {
        // No data loader configured - skip data loading
        console.log('[Data Stage] No data loader or apiEndpoint configured, skipping data loading');
      }
      
      // Store data in global state
      this.storeData();
      
      // Emit data loaded event
      this.emit('loaded', {
        data: this.data
      });
      
      this.markCompleted();
    } catch (error) {
      this.markError(error);
      throw error;
    }
  }
  
  /**
   * Fetch data via Shared Services (PDSC Client)
   * @param {Object} config - UAI config
   * @returns {Promise<void>}
   */
  async fetchDataViaSharedServices(config) {
    try {
      // Get filters from Bridge
      const filters = window.PhoenixBridge?.state?.filters || {};
      
      // Fetch data using Shared Services
      const response = await sharedServices.get(config.apiEndpoint, filters);
      this.data = response.data || response;
      
      console.log('[Data Stage] Data loaded via Shared Services:', Object.keys(this.data));
    } catch (error) {
      throw new Error(`Failed to fetch data via Shared Services: ${error.message}`);
    }
  }
  
  /**
   * Load data loader script
   * @param {string} loaderPath - Path to data loader script
   * @returns {Promise<void>}
   */
  async loadDataLoader(loaderPath) {
    try {
      // Load the data loader script
      await this.loadScript(loaderPath);
      
      // Data loader should export a function or set a global function
      // The loader will be called in fetchData()
      console.log('[Data Stage] Data loader loaded:', loaderPath);
    } catch (error) {
      throw new Error(`Failed to load data loader: ${loaderPath} - ${error.message}`);
    }
  }
  
  /**
   * Fetch data using the loaded data loader
   * @param {Object} config - UAI config
   * @returns {Promise<void>}
   */
  async fetchData(config) {
    try {
      // Get filters from Bridge
      const filters = window.PhoenixBridge?.state?.filters || {};
      
      // Determine page type from config
      const pageType = config.pageType || this.detectPageType();
      
      // Try to find and call the data loader function
      // Data loaders typically export a function or set a global function
      const loaderFunction = this.findLoaderFunction(pageType, config.dataLoader);
      
      if (!loaderFunction) {
        // If no loader function found, try using Shared Services directly
        // This allows pages to use PDSC Client without custom data loaders
        if (config.apiEndpoint) {
          console.log('[Data Stage] Using Shared Services for data loading');
          const response = await sharedServices.get(config.apiEndpoint, filters);
          this.data = response.data || response;
        } else {
          throw new Error(`Data loader function not found for page type: ${pageType}`);
        }
      } else {
        // Call the data loader function with filters
        // Most data loaders accept filters as parameter
        if (typeof loaderFunction === 'function') {
          this.data = await loaderFunction(filters);
        } else if (typeof loaderFunction.loadData === 'function') {
          this.data = await loaderFunction.loadData(filters);
        } else {
          throw new Error(`Invalid data loader format for page type: ${pageType}`);
        }
      }
      
      console.log('[Data Stage] Data loaded successfully:', Object.keys(this.data));
    } catch (error) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }
  
  /**
   * Find loader function from loaded script
   * @param {string} pageType - Page type
   * @param {string} loaderPath - Loader script path
   * @returns {Function|Object|null} Loader function or object
   */
  findLoaderFunction(pageType, loaderPath) {
    // Try common patterns for data loader functions
    const functionName = this.getLoaderFunctionName(pageType);
    
    // Check global scope
    if (window[functionName]) {
      return window[functionName];
    }
    
    // Check if loader exports a default function
    // (This would require dynamic import, which is more complex)
    // For now, we rely on global functions set by the loader scripts
    
    return null;
  }
  
  /**
   * Get expected loader function name from page type
   * @param {string} pageType - Page type
   * @returns {string} Function name
   */
  getLoaderFunctionName(pageType) {
    // Convert pageType to camelCase function name
    // e.g., "cashFlows" -> "loadCashFlowsData"
    const capitalized = pageType.charAt(0).toUpperCase() + pageType.slice(1);
    return `load${capitalized}Data`;
  }
  
  /**
   * Detect page type from URL or config
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
  
  /**
   * Store data in global state
   */
  storeData() {
    // Store in Bridge state
    if (window.PhoenixBridge && window.PhoenixBridge.state) {
      window.PhoenixBridge.state.pageData = this.data;
    }
    
    // Store in UAI state
    window.UAIState = window.UAIState || {};
    window.UAIState.data = this.data;
    
    // Store in stage instance
    this.data = this.data;
  }
}
