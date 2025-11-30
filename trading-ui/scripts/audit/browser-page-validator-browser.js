
/**
 * Browser Page Validator Script
 * 
 * הרצה בדפדפן:
 * 1. פתח את העמוד שברצונך לבדוק
 * 2. פתח את הקונסולה (F12)
 * 3. העתק והדבק את הקוד הזה
 * 4. או השתמש ב: window.browserPageValidator.validateCurrentPage()
 */

(function() {
  'use strict';

  class BrowserPageValidator {
    constructor() {
      this.results = [];
      this.consoleErrors = [];
      this.consoleWarnings = [];
      this.originalError = console.error;
      this.originalWarn = console.warn;
    }

    /**
     * התחלת איסוף שגיאות
     */
    startErrorCollection() {
      this.consoleErrors = [];
      this.consoleWarnings = [];
      
      console.error = (...args) => {
        this.consoleErrors.push({
          message: args.join(' '),
          timestamp: new Date().toISOString(),
          stack: new Error().stack
        });
        this.originalError.apply(console, args);
      };

      console.warn = (...args) => {
        // איסוף רק אזהרות קריטיות
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

    /**
     * עצירת איסוף שגיאות
     */
    stopErrorCollection() {
      console.error = this.originalError;
      console.warn = this.originalWarn;
    }

    /**
     * המתנה לטעינה מלאה
     */
    async waitForPageFullyLoaded() {
      return new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', resolve);
          // Timeout אחרי 10 שניות
          setTimeout(resolve, 10000);
        }
      });
    }

    /**
     * בדיקת עמוד נוכחי
     */
    async validateCurrentPage() {
      const pageName = this.getCurrentPageName();
      console.log(`🔍 Starting validation for page: ${pageName}`);

      // התחלת איסוף שגיאות
      this.startErrorCollection();

      // המתנה לטעינה מלאה
      await this.waitForPageFullyLoaded();
      await new Promise(resolve => setTimeout(resolve, 2000)); // המתנה נוספת

      const result = {
        pageName: pageName,
        timestamp: new Date().toISOString(),
        consoleErrors: [...this.consoleErrors],
        consoleWarnings: [...this.consoleWarnings],
        monitoringResults: null,
        healthCheck: null,
        isValid: false
      };

      // בדיקת מערכת ניטור
      if (typeof window.runDetailedPageScan === 'function') {
        try {
          const pageConfig = window.PAGE_CONFIGS?.[pageName];
          if (pageConfig) {
            result.monitoringResults = await window.runDetailedPageScan(pageName, pageConfig);
          }
        } catch (error) {
          console.error('Error running detailed page scan:', error);
          result.monitoringError = error.message;
        }
      }

      // בדיקת בריאות עמוד
      if (typeof window.pageHealthChecker !== 'undefined') {
        try {
          result.healthCheck = window.pageHealthChecker.performHealthCheck();
        } catch (error) {
          console.error('Error running health check:', error);
          result.healthCheckError = error.message;
        }
      }

      // עצירת איסוף שגיאות
      this.stopErrorCollection();

      // קביעת תקינות
      result.isValid = 
        result.consoleErrors.length === 0 &&
        result.consoleWarnings.length === 0 &&
        (!result.monitoringResults || result.monitoringResults.criticalErrors === 0) &&
        (!result.healthCheck || result.healthCheck.healthy);

      // הצגת תוצאות
      this.displayResults(result);

      return result;
    }

    /**
     * קבלת שם עמוד נוכחי
     */
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

    /**
     * הצגת תוצאות
     */
    displayResults(result) {
      console.group(`📊 Validation Results for: ${result.pageName}`);
      
      console.log(`Status: ${result.isValid ? '✅ VALID' : '❌ INVALID'}`);
      
      if (result.consoleErrors.length > 0) {
        console.group('🔴 Console Errors:');
        result.consoleErrors.forEach((error, i) => {
          console.error(`${i + 1}. ${error.message}`);
        });
        console.groupEnd();
      }

      if (result.consoleWarnings.length > 0) {
        console.group('🟠 Console Warnings:');
        result.consoleWarnings.forEach((warning, i) => {
          console.warn(`${i + 1}. ${warning.message}`);
        });
        console.groupEnd();
      }

      if (result.monitoringResults) {
        console.group('📋 Monitoring Results:');
        console.log(`Critical Errors: ${result.monitoringResults.criticalErrors || 0}`);
        console.log(`Mismatches: ${result.monitoringResults.mismatches || 0}`);
        if (result.monitoringResults.mismatchDetails) {
          result.monitoringResults.mismatchDetails.forEach((detail, i) => {
            console.log(`${i + 1}. ${detail.message || detail.type}`);
          });
        }
        console.groupEnd();
      }

      if (result.healthCheck) {
        console.group('💚 Health Check:');
        console.log(`Healthy: ${result.healthCheck.healthy ? '✅' : '❌'}`);
        if (result.healthCheck.issues && result.healthCheck.issues.length > 0) {
          result.healthCheck.issues.forEach((issue, i) => {
            console.log(`${i + 1}. [${issue.type}] ${issue.message}`);
          });
        }
        console.groupEnd();
      }

      console.groupEnd();
    }

    /**
     * ייצוא תוצאות
     */
    exportResults() {
      const dataStr = JSON.stringify(this.results, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `browser-validation-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  // יצירת instance גלובלי
  if (typeof window.browserPageValidator === 'undefined') {
    window.browserPageValidator = new BrowserPageValidator();
    console.log('✅ Browser Page Validator initialized');
    console.log('📝 Usage: await window.browserPageValidator.validateCurrentPage()');
  }

  return window.browserPageValidator;
})();
