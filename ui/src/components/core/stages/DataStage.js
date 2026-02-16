/**
 * Data Stage - UAI Stage 3
 * --------------------------------------------------------
 * Loads data from API using page-specific data loaders
 * 
 * @description Stage 3 of UAI lifecycle - Data loading
 * @version v1.0.0
 */

import { StageBase } from './StageBase.js';
import sharedServices from '../sharedServices.js';
import { maskedLog } from '../../../utils/maskedLog.js';

export class DataStage extends StageBase {
  constructor() {
    super('Data');
    this.data = {};
    this.loaders = {};
  }
  
  /**
   * Check if user is authenticated
   * Gate A Fix: Prevent 401 errors for guest users
   * @returns {boolean} True if user has valid token
   */
  isAuthenticated() {
    try {
      // Check for access token in localStorage or sessionStorage
      const token = localStorage.getItem('access_token') || 
                    localStorage.getItem('authToken') ||
                    sessionStorage.getItem('access_token') ||
                    sessionStorage.getItem('authToken');
      return !!token && token.trim() !== '';
    } catch (error) {
      maskedLog('[Data Stage] Error checking authentication:', { errorMessage: error.message });
      return false;
    }
  }

  /**
   * Execute Data stage
   * Gate A Fix: Check authentication before API calls to prevent 401 errors
   * @returns {Promise<void>}
   */
  async execute() {
    try {
      this.markStarted();
      
      // Wait for Bridge stage to complete
      await this.waitForStage('Bridge');
      
      // Get config from UAI
      const config = window.UAI?.config || window.UAIState?.config;
      if (!config) {
        throw new Error('UAI config not found');
      }
      
      // Gate A Fix: Check authentication before making API calls
      // Skip data loading when user is not authenticated (all pages - not just requiresAuth)
      // Prevents 10 SEVERE 401 errors when guests land on shared pages (e.g. Home)
      const authenticated = this.isAuthenticated();
      if (!authenticated) {
        maskedLog('[Data Stage] User not authenticated, skipping data loading', {
          pageType: config.pageType,
          requiresAuth: config.requiresAuth
        });
        this.data = {};
        this.storeData();
        this.markCompleted();
        return;
      }
      
      // Ensure Shared Services is initialized
      try {
        await sharedServices.init();
      } catch (error) {
        maskedLog('[Data Stage] Shared Services initialization failed, continuing with fallback:', { message: error?.message });
        // Continue anyway - some pages may not need Shared Services
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
        maskedLog('[Data Stage] No data loader or apiEndpoint configured, skipping data loading');
      }
      
      // Store data in global state
      this.storeData();
      
      // Emit data loaded event
      this.emit('loaded', {
        data: this.data
      });
      
      this.markCompleted();
    } catch (error) {
      // Gate A Fix: Handle 401 errors gracefully - don't throw for unauthenticated users
      if (error.status === 401 || error.code === 'HTTP_401') {
        maskedLog('[Data Stage] 401 Unauthorized - user not authenticated, skipping data loading', {
          pageType: config?.pageType,
          requiresAuth: config?.requiresAuth
        });
        // Set empty data instead of throwing error
        this.data = {};
        this.storeData();
        this.markCompleted();
        return;
      }
      
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
      
      maskedLog('[Data Stage] Data loaded via Shared Services:', { dataKeys: Object.keys(this.data) });
    } catch (error) {
      throw new Error(`Failed to fetch data via Shared Services: ${error.message}`);
    }
  }
  
  /**
   * Load data loader script using dynamic import (ES Module)
   * @param {string} loaderPath - Path to data loader script
   * @returns {Promise<void>}
   */
  async loadDataLoader(loaderPath) {
    try {
      // Use dynamic import for ES modules instead of loadScript()
      // Convert relative path to absolute URL if needed
      let importPath = loaderPath;
      
      // If path is relative, convert to absolute URL
      if (!loaderPath.startsWith('/') && !loaderPath.startsWith('http://') && !loaderPath.startsWith('https://')) {
        // Relative path - convert to absolute URL
        const baseUrl = window.location.origin;
        const currentPath = window.location.pathname;
        const baseDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
        
        // Handle relative paths (./ or ../)
        if (loaderPath.startsWith('./')) {
          importPath = `${baseUrl}${baseDir}/${loaderPath.substring(2)}`;
        } else if (loaderPath.startsWith('../')) {
          // For ../ paths, resolve relative to current directory
          const pathParts = baseDir.split('/').filter(p => p);
          const loaderParts = loaderPath.split('/').filter(p => p && p !== '.');
          
          for (const part of loaderParts) {
            if (part === '..') {
              pathParts.pop();
            } else {
              pathParts.push(part);
            }
          }
          
          importPath = `${baseUrl}/${pathParts.join('/')}`;
        } else {
          // Assume relative to src root
          importPath = `${baseUrl}/src/${loaderPath}`;
        }
      } else if (loaderPath.startsWith('/')) {
        // Absolute path - prepend origin
        importPath = `${window.location.origin}${loaderPath}`;
      }
      
      // Ensure path ends with .js if not already
      if (!importPath.endsWith('.js') && !importPath.includes('?')) {
        importPath += '.js';
      }
      
      // Dynamic import for ES modules
      const module = await import(importPath);
      
      // Store the module for later use
      this.loaders[loaderPath] = module;
      
      maskedLog('[Data Stage] Data loader loaded (ES Module):', { loaderPath, importPath });
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
          maskedLog('[Data Stage] Using Shared Services for data loading');
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
      
      maskedLog('[Data Stage] Data loaded successfully:', { dataKeys: Object.keys(this.data) });
    } catch (error) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }
  
  /**
   * Find loader function from loaded ES module
   * Gate B Fix: Support ES module exports (named exports like loadCashFlowsData, loadBrokersFeesData)
   * @param {string} pageType - Page type
   * @param {string} loaderPath - Loader script path
   * @returns {Function|Object|null} Loader function or object
   */
  findLoaderFunction(pageType, loaderPath) {
    // Check if module was loaded via dynamic import
    if (this.loaders[loaderPath]) {
      const module = this.loaders[loaderPath];
      
      // Try default export first
      if (module.default && typeof module.default === 'function') {
        return module.default;
      }
      
      // Try named export based on page type (e.g., loadCashFlowsData, loadBrokersFeesData)
      const functionName = this.getLoaderFunctionName(pageType);
      if (module[functionName] && typeof module[functionName] === 'function') {
        return module[functionName];
      }
      
      // Try common export names
      if (module.loadData && typeof module.loadData === 'function') {
        return module.loadData;
      }
      
      // Return the module itself if it has a loadData method
      if (typeof module === 'object' && module.loadData) {
        return module;
      }
    }
    
    // Fallback: Check global scope (for legacy loaders like TradingAccountsDataLoader)
    const functionName = this.getLoaderFunctionName(pageType);
    if (window[functionName]) {
      return window[functionName];
    }
    
    // Fallback: Check for global objects (e.g., window.TradingAccountsDataLoader)
    if (pageType === 'tradingAccounts' && window.TradingAccountsDataLoader) {
      return window.TradingAccountsDataLoader.loadAllContainers || window.TradingAccountsDataLoader;
    }
    
    return null;
  }
  
  /**
   * Get expected loader function name from page type
   * Gate B Fix: Map page types to actual exported function names
   * @param {string} pageType - Page type
   * @returns {string} Function name
   */
  getLoaderFunctionName(pageType) {
    // Map page types to actual exported function names
    const functionMap = {
      'cashFlows': 'loadCashFlowsData',
      'brokersFees': 'loadBrokersFeesData',
      'tradingAccounts': 'loadTradingAccountsData',
      'notes': 'loadNotesData'
    };
    
    // Return mapped function name or generate default
    if (functionMap[pageType]) {
      return functionMap[pageType];
    }
    
    // Fallback: Convert pageType to camelCase function name
    // e.g., "otherPage" -> "loadOtherPageData"
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
