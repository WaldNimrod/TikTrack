
(async function() {
  'use strict';
  
  class BrowserPageValidator {
    constructor() {
      this.results = [];
      this.consoleErrors = [];
      this.consoleWarnings = [];
      this.originalError = console.error;
      this.originalWarn = console.warn;
    }
    
    startErrorCollection() {
      this.consoleErrors = [];
      this.consoleWarnings = [];
      
      console.error = (...args) => {
        this.consoleErrors.push({
          message: args.join(' '),
          timestamp: new Date().toISOString()
        });
        this.originalError.apply(console, args);
      };
      
      console.warn = (...args) => {
        const message = args.join(' ');
        if (message.includes('not defined') || 
            message.includes('is not a function') ||
            message.includes('Failed to load') ||
            message.includes('404') ||
            message.includes('Network')) {
          this.consoleWarnings.push({
            message: message,
            timestamp: new Date().toISOString()
          });
        }
        this.originalWarn.apply(console, args);
      };
    }
    
    stopErrorCollection() {
      console.error = this.originalError;
      console.warn = this.originalWarn;
    }
    
    async waitForPageFullyLoaded() {
      return new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', resolve);
          setTimeout(resolve, 10000);
        }
      });
    }
    
    getCurrentPageName() {
      const path = window.location.pathname;
      let pageName = path.split('/').pop();
      if (!pageName || pageName === '' || pageName === '/') {
        pageName = 'index';
      } else {
        pageName = pageName.replace('.html', '');
      }
      return pageName;
    }
    
    async validateCurrentPage() {
      const pageName = this.getCurrentPageName();
      console.log(`🔍 Starting validation for page: ${pageName}`);
      
      this.startErrorCollection();
      await this.waitForPageFullyLoaded();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = {
        pageName: pageName,
        timestamp: new Date().toISOString(),
        consoleErrors: [...this.consoleErrors],
        consoleWarnings: [...this.consoleWarnings],
        monitoringResults: null,
        healthCheck: null,
        isValid: false
      };
      
      if (typeof window.runDetailedPageScan === 'function') {
        try {
          const pageConfig = window.PAGE_CONFIGS?.[pageName];
          if (pageConfig) {
            result.monitoringResults = await window.runDetailedPageScan(pageName, pageConfig);
          }
        } catch (error) {
          result.monitoringError = error.message;
        }
      }
      
      if (typeof window.pageHealthChecker !== 'undefined') {
        try {
          result.healthCheck = window.pageHealthChecker.performHealthCheck();
        } catch (error) {
          result.healthCheckError = error.message;
        }
      }
      
      this.stopErrorCollection();
      
      result.isValid = 
        result.consoleErrors.length === 0 &&
        result.consoleWarnings.length === 0 &&
        (!result.monitoringResults || result.monitoringResults.criticalErrors === 0) &&
        (!result.healthCheck || result.healthCheck.healthy);
      
      return result;
    }
  }
  
  if (typeof window.browserPageValidator === 'undefined') {
    window.browserPageValidator = new BrowserPageValidator();
  }
  
  return await window.browserPageValidator.validateCurrentPage();
})();
