# הוראות בדיקה ידנית בדפדפן

## שימוש

1. פתח את העמוד שברצונך לבדוק
2. פתח את הקונסולה (F12)
3. העתק והדבק את הקוד הבא:

```javascript
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
```

4. לחץ Enter
5. העתק את התוצאה (JSON) ושמור אותה

## קריטריוני תקינות

עמוד נחשב **תקין** אם:
- ✅ אין שגיאות בקונסולה (console.error)
- ✅ אין אזהרות קריטיות (console.warn על בעיות מערכת)
- ✅ runDetailedPageScan מחזיר 0 שגיאות קריטיות
- ✅ pageHealthChecker מחזיר healthy: true

## רשימת עמודים לבדיקה

1. index
2. trades
3. trade_plans
4. alerts
5. tickers
6. trading_accounts
7. executions
8. cash_flows
9. notes
10. research
11. data_import
12. preferences
13. db_display
14. db_extradata
15. constraints
16. designs
17. login
18. register
19. forgot-password
20. reset-password
21. button-color-mapping
22. button-color-mapping-simple
23. conditions-modals
24. tooltip-editor
25. preferences-groups-management
26. daily-snapshots-comparative-analysis-page
27. daily-snapshots-date-comparison-modal
28. daily-snapshots-economic-calendar-page
29. daily-snapshots-emotional-tracking-widget
30. daily-snapshots-heatmap-visual-example
31. daily-snapshots-history-widget
32. daily-snapshots-portfolio-state-page
33. daily-snapshots-price-history-page
34. daily-snapshots-strategy-analysis-page
35. daily-snapshots-trade-history-page
36. daily-snapshots-trading-journal-page

## הערות

- **עמוד עם שגיאות בקונסולה = לא תקין**
- כל עמוד חייב לעבור בדיקה
- כל שגיאה חייבת להיות מתועדת
