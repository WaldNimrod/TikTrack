/**
 * Preferences Debug Monitor
 * קוד ניטור ובדיקה לבעיות בטעינת חשבונות מסחר וטבלת סוגי העדפות
 * 
 * Documentation: See documentation/frontend/PREFERENCES_DEBUG_MONITOR.md
 */

// ============================================================================
// FUNCTION INDEX
// ============================================================================
/**
 * ============================================================================
 * FUNCTION INDEX - Preferences Debug Monitor
 * ============================================================================
 * 
 * Core Classes:
 * - PreferencesDebugMonitor - Debug monitoring and diagnostics
 * 
 * Global Functions:
 * - startPreferencesDebugMonitoring() - Start automatic monitoring
 * - stopPreferencesDebugMonitoring() - Stop monitoring
 * - runPreferencesDebugCheck() - Run one-time check
 * - generatePreferencesDebugReport() - Generate detailed report
 * 
 * Global Instances:
 * - window.PreferencesDebugMonitor - Main debug monitor instance
 * 
 * Documentation: See documentation/04-FEATURES/CORE/preferences/PREFERENCES_COMPLETE_DEVELOPER_GUIDE.md
 * ============================================================================
 */

(() => {
  'use strict';

  const MONITOR_NS = 'PreferencesDebugMonitor';
  const PAGE_LOG_CONTEXT = { page: 'preferences-debug-monitor' };

  class PreferencesDebugMonitor {
    constructor() {
      this.monitoring = false;
      this.accountsCheckInterval = null;
      this.typesTableCheckInterval = null;
      this.accountsCheckCount = 0;
      this.typesTableCheckCount = 0;
      this.maxChecks = 10; // מקסימום בדיקות לפני עצירה
    }

    /**
     * התחלת ניטור
     */
    startMonitoring() {
      if (this.monitoring) {
        window.Logger?.warn('⚠️ Monitoring already active', PAGE_LOG_CONTEXT);
        return;
      }

      this.monitoring = true;
      window.Logger?.info('🔍 Starting Preferences Debug Monitor', PAGE_LOG_CONTEXT);

      // בדיקת חשבונות מסחר כל 2 שניות
      this.accountsCheckInterval = setInterval(() => {
        this.checkAccountsLoading();
      }, 2000);

      // בדיקת טבלת סוגי העדפות כל 2 שניות
      this.typesTableCheckInterval = setInterval(() => {
        this.checkTypesTableLoading();
      }, 2000);

      // בדיקה ראשונית מיידית
      setTimeout(() => {
        this.checkAccountsLoading();
        this.checkTypesTableLoading();
      }, 500);

      // עצירה אוטומטית אחרי 20 שניות
      setTimeout(() => {
        this.stopMonitoring();
      }, 20000);
    }

    /**
     * עצירת ניטור
     */
    stopMonitoring() {
      if (!this.monitoring) return;

      this.monitoring = false;
      if (this.accountsCheckInterval) {
        clearInterval(this.accountsCheckInterval);
        this.accountsCheckInterval = null;
      }
      if (this.typesTableCheckInterval) {
        clearInterval(this.typesTableCheckInterval);
        this.typesTableCheckInterval = null;
      }

      window.Logger?.info('🛑 Stopped Preferences Debug Monitor', {
        ...PAGE_LOG_CONTEXT,
        accountsChecks: this.accountsCheckCount,
        typesTableChecks: this.typesTableCheckCount,
      });
    }

    /**
     * בדיקת טעינת חשבונות מסחר
     */
    async checkAccountsLoading() {
      this.accountsCheckCount++;
      if (this.accountsCheckCount > this.maxChecks) {
        this.stopMonitoring();
        return;
      }

      const selectElement = document.getElementById('default_trading_account');
      const logData = {
        ...PAGE_LOG_CONTEXT,
        checkNumber: this.accountsCheckCount,
        timestamp: new Date().toISOString(),
      };

      // בדיקה 1: האם האלמנט קיים?
      if (!selectElement) {
        window.Logger?.error('❌ [Accounts Check] Select element not found', {
          ...logData,
          elementId: 'default_trading_account',
          suggestion: 'Check if the HTML element exists in the preferences page',
        });
        return;
      }

      logData.elementExists = true;
      logData.elementTagName = selectElement.tagName;
      logData.elementDisabled = selectElement.disabled;
      logData.elementVisible = selectElement.offsetParent !== null;

      // בדיקה 2: כמה אופציות יש?
      const optionsCount = selectElement.options?.length || 0;
      const hasEmptyOption = optionsCount > 0 && selectElement.options[0]?.value === '';
      const actualAccountsCount = hasEmptyOption ? optionsCount - 1 : optionsCount;

      logData.optionsCount = optionsCount;
      logData.actualAccountsCount = actualAccountsCount;
      logData.hasEmptyOption = hasEmptyOption;

      // בדיקה 3: האם SelectPopulatorService זמין?
      const hasSelectPopulatorService = Boolean(window.SelectPopulatorService);
      const hasPopulateFunction = Boolean(window.SelectPopulatorService?.populateAccountsSelect);
      logData.hasSelectPopulatorService = hasSelectPopulatorService;
      logData.hasPopulateFunction = hasPopulateFunction;

      // בדיקה 4: האם TradingAccountsData זמין?
      const hasTradingAccountsData = Boolean(window.TradingAccountsData);
      const hasLoadFunction = Boolean(window.TradingAccountsData?.loadTradingAccountsData);
      logData.hasTradingAccountsData = hasTradingAccountsData;
      logData.hasLoadFunction = hasLoadFunction;

      // בדיקה 5: בדיקת API endpoint
      try {
        const testResponse = await fetch(`/api/trading-accounts/open?_t=${Date.now()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        logData.apiStatus = testResponse.status;
        logData.apiOk = testResponse.ok;

        if (testResponse.ok) {
          const testData = await testResponse.json();
          const accountsFromApi = Array.isArray(testData?.data) ? testData.data : (Array.isArray(testData) ? testData : []);
          logData.accountsFromApi = accountsFromApi.length;
          logData.apiResponseStructure = {
            hasData: Boolean(testData?.data),
            isArray: Array.isArray(testData),
            keys: testData ? Object.keys(testData) : [],
          };
        }
      } catch (apiError) {
        logData.apiError = apiError.message;
        logData.apiErrorStack = apiError.stack;
      }

      // בדיקה 6: האם loadAccountsForPreferences נקראת?
      const loadFunctionExists = typeof window.loadAccountsForPreferences === 'function';
      logData.loadFunctionExists = loadFunctionExists;

      // סיכום
      if (actualAccountsCount === 0) {
        window.Logger?.warn('⚠️ [Accounts Check] No accounts loaded in select', logData);
        
        // הצעות לתיקון
        const suggestions = [];
        if (!hasSelectPopulatorService) {
          suggestions.push('SelectPopulatorService is not available - check if select-populator-service.js is loaded');
        }
        if (!hasPopulateFunction) {
          suggestions.push('populateAccountsSelect function is missing from SelectPopulatorService');
        }
        if (!hasTradingAccountsData) {
          suggestions.push('TradingAccountsData service is not available');
        }
        if (logData.apiStatus !== 200) {
          suggestions.push(`API endpoint returned status ${logData.apiStatus} - check backend`);
        }
        if (!loadFunctionExists) {
          suggestions.push('loadAccountsForPreferences function is not defined');
        }

        if (suggestions.length > 0) {
          window.Logger?.error('💡 [Accounts Check] Suggestions:', {
            ...logData,
            suggestions,
          });
        }
      } else {
        window.Logger?.info('✅ [Accounts Check] Accounts loaded successfully', logData);
      }
    }

    /**
     * בדיקת טעינת טבלת סוגי העדפות
     */
    async checkTypesTableLoading() {
      this.typesTableCheckCount++;
      if (this.typesTableCheckCount > this.maxChecks) {
        this.stopMonitoring();
        return;
      }

      const container = document.getElementById('preferenceTypesAuditContainer');
      const tableBody = document.getElementById('preferenceTypesAuditTableBody');
      const logData = {
        ...PAGE_LOG_CONTEXT,
        checkNumber: this.typesTableCheckCount,
        timestamp: new Date().toISOString(),
      };

      // בדיקה 1: האם האלמנטים קיימים?
      if (!container) {
        window.Logger?.error('❌ [Types Table Check] Container element not found', {
          ...logData,
          elementId: 'preferenceTypesAuditContainer',
          suggestion: 'Check if the HTML element exists in the preferences page',
        });
        return;
      }

      if (!tableBody) {
        window.Logger?.error('❌ [Types Table Check] Table body element not found', {
          ...logData,
          elementId: 'preferenceTypesAuditTableBody',
          suggestion: 'Check if the HTML element exists in the preferences page',
        });
        return;
      }

      logData.containerExists = true;
      logData.tableBodyExists = true;
      logData.containerVisible = container.offsetParent !== null;
      logData.tableBodyVisible = tableBody.offsetParent !== null;

      // בדיקה 2: מה התוכן הנוכחי?
      const tableBodyContent = tableBody.innerHTML.trim();
      const isLoading = tableBodyContent.includes('טוען נתונים');
      const isEmpty = tableBodyContent === '' || tableBodyContent === '<tr></tr>';
      const hasError = tableBodyContent.includes('שגיאה') || tableBodyContent.includes('error');
      const hasRows = tableBody.querySelectorAll('tr').length > 0;

      logData.tableBodyContent = tableBodyContent.substring(0, 200); // רק 200 תווים ראשונים
      logData.isLoading = isLoading;
      logData.isEmpty = isEmpty;
      logData.hasError = hasError;
      logData.hasRows = hasRows;
      logData.rowsCount = tableBody.querySelectorAll('tr').length;

      // בדיקה 3: האם PreferencesData זמין?
      const hasPreferencesData = Boolean(window.PreferencesData);
      const hasLoadTypesFunction = Boolean(window.PreferencesData?.loadPreferenceTypes);
      logData.hasPreferencesData = hasPreferencesData;
      logData.hasLoadTypesFunction = hasLoadTypesFunction;

      // בדיקה 4: בדיקת API endpoint (try public first, then admin)
      try {
        let testResponse = await fetch(`/api/preferences/types?_t=${Date.now()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
        });
        if (!testResponse.ok && testResponse.status === 404) {
          // Fallback to admin endpoint
          testResponse = await fetch(`/api/preferences/admin/types?_t=${Date.now()}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
          });
        }
        logData.apiStatus = testResponse.status;
        logData.apiOk = testResponse.ok;

        if (testResponse.ok) {
          const testData = await testResponse.json();
          const typesFromApi = Array.isArray(testData?.data?.preference_types)
            ? testData.data.preference_types
            : (Array.isArray(testData?.preference_types) ? testData.preference_types : []);
          logData.typesFromApi = typesFromApi.length;
          logData.apiResponseStructure = {
            hasData: Boolean(testData?.data),
            hasPreferenceTypes: Boolean(testData?.data?.preference_types),
            isArray: Array.isArray(testData),
            keys: testData ? Object.keys(testData) : [],
          };

          // בדיקת מבנה הנתונים
          if (typesFromApi.length > 0) {
            const firstType = typesFromApi[0];
            logData.firstTypeStructure = {
              hasId: 'id' in firstType,
              hasPreferenceName: 'preference_name' in firstType,
              hasGroupName: 'group_name' in firstType,
              hasGroupId: 'group_id' in firstType,
              keys: Object.keys(firstType),
            };
          }
        } else if (testResponse.status === 401) {
          logData.apiError = 'Authentication required (401)';
          logData.suggestion = 'Check if user is authenticated and require_authentication decorator is working';
        } else if (testResponse.status === 403) {
          logData.apiError = 'Forbidden (403)';
          logData.suggestion = 'Check user permissions';
        }
      } catch (apiError) {
        logData.apiError = apiError.message;
        logData.apiErrorStack = apiError.stack;
      }

      // בדיקה 5: האם renderPreferenceTypesAuditTable קיימת?
      const renderFunctionExists = typeof window.renderPreferenceTypesAuditTable === 'function';
      logData.renderFunctionExists = renderFunctionExists;

      // בדיקה 6: בדיקת normalizeTypesPayload
      if (window.PreferencesData && typeof window.PreferencesData.loadPreferenceTypes === 'function') {
        try {
          const testResult = await window.PreferencesData.loadPreferenceTypes({ force: true });
          logData.loadPreferenceTypesResult = {
            hasTypes: Boolean(testResult?.types),
            typesCount: Array.isArray(testResult?.types) ? testResult.types.length : 0,
            hasCount: 'count' in (testResult || {}),
            keys: testResult ? Object.keys(testResult) : [],
          };

          if (Array.isArray(testResult?.types) && testResult.types.length > 0) {
            const firstType = testResult.types[0];
            logData.normalizedFirstTypeStructure = {
              hasId: 'id' in firstType,
              hasPreferenceName: 'preference_name' in firstType,
              hasGroupName: 'group_name' in firstType,
              hasGroupId: 'group_id' in firstType,
              keys: Object.keys(firstType),
            };
          }
        } catch (loadError) {
          logData.loadError = loadError.message;
          logData.loadErrorStack = loadError.stack;
        }
      }

      // סיכום
      if (isLoading || isEmpty || !hasRows) {
        window.Logger?.warn('⚠️ [Types Table Check] Table not populated', logData);

        // הצעות לתיקון
        const suggestions = [];
        if (!hasPreferencesData) {
          suggestions.push('PreferencesData service is not available - check if preferences-data.js is loaded');
        }
        if (!hasLoadTypesFunction) {
          suggestions.push('loadPreferenceTypes function is missing from PreferencesData');
        }
        if (logData.apiStatus === 401) {
          suggestions.push('API requires authentication - check require_authentication decorator');
        }
        if (logData.apiStatus !== 200 && logData.apiStatus) {
          suggestions.push(`API endpoint returned status ${logData.apiStatus} - check backend`);
        }
        if (!renderFunctionExists) {
          suggestions.push('renderPreferenceTypesAuditTable function is not defined');
        }
        if (logData.typesFromApi === 0 && logData.apiOk) {
          suggestions.push('API returned 0 types - check database for preference_types records');
        }

        if (suggestions.length > 0) {
          window.Logger?.error('💡 [Types Table Check] Suggestions:', {
            ...logData,
            suggestions,
          });
        }
      } else {
        window.Logger?.info('✅ [Types Table Check] Table populated successfully', logData);
      }
    }

    /**
     * בדיקה חד-פעמית של שתי הבעיות
     */
    async runSingleCheck() {
      window.Logger?.info('🔍 Running single debug check', PAGE_LOG_CONTEXT);
      await Promise.all([
        this.checkAccountsLoading(),
        this.checkTypesTableLoading(),
      ]);
    }

    /**
     * יצירת דוח מפורט
     */
    async generateReport() {
      window.Logger?.info('📊 Generating debug report', PAGE_LOG_CONTEXT);

      const report = {
        timestamp: new Date().toISOString(),
        accounts: {},
        typesTable: {},
      };

      // בדיקת חשבונות
      const accountSelect = document.getElementById('default_trading_account');
      if (accountSelect) {
        report.accounts = {
          elementExists: true,
          optionsCount: accountSelect.options?.length || 0,
          selectedValue: accountSelect.value,
          hasSelectPopulatorService: Boolean(window.SelectPopulatorService),
          hasPopulateFunction: Boolean(window.SelectPopulatorService?.populateAccountsSelect),
          hasTradingAccountsData: Boolean(window.TradingAccountsData),
          hasLoadFunction: Boolean(window.TradingAccountsData?.loadTradingAccountsData),
          loadFunctionExists: typeof window.loadAccountsForPreferences === 'function',
        };

        // בדיקת API
        try {
          const apiResponse = await fetch(`/api/trading-accounts/open?_t=${Date.now()}`);
          report.accounts.apiStatus = apiResponse.status;
          if (apiResponse.ok) {
            const apiData = await apiResponse.json();
            report.accounts.apiAccountsCount = Array.isArray(apiData?.data) ? apiData.data.length : 0;
          }
        } catch (error) {
          report.accounts.apiError = error.message;
        }
      } else {
        report.accounts.elementExists = false;
      }

      // בדיקת טבלה
      const container = document.getElementById('preferenceTypesAuditContainer');
      const tableBody = document.getElementById('preferenceTypesAuditTableBody');
      if (container && tableBody) {
        report.typesTable = {
          containerExists: true,
          tableBodyExists: true,
          rowsCount: tableBody.querySelectorAll('tr').length,
          content: tableBody.innerHTML.substring(0, 200),
          hasPreferencesData: Boolean(window.PreferencesData),
          hasLoadTypesFunction: Boolean(window.PreferencesData?.loadPreferenceTypes),
          renderFunctionExists: typeof window.renderPreferenceTypesAuditTable === 'function',
        };

        // בדיקת API (try public first, then admin)
        try {
          let apiResponse = await fetch(`/api/preferences/types?_t=${Date.now()}`, {
            credentials: 'same-origin',
          });
          if (!apiResponse.ok && apiResponse.status === 404) {
            // Fallback to admin endpoint
            apiResponse = await fetch(`/api/preferences/admin/types?_t=${Date.now()}`, {
              credentials: 'same-origin',
            });
          }
          report.typesTable.apiStatus = apiResponse.status;
          if (apiResponse.ok) {
            const apiData = await apiResponse.json();
            const types = Array.isArray(apiData?.data?.preference_types)
              ? apiData.data.preference_types
              : [];
            report.typesTable.apiTypesCount = types.length;
          }
        } catch (error) {
          report.typesTable.apiError = error.message;
        }
      } else {
        report.typesTable.containerExists = Boolean(container);
        report.typesTable.tableBodyExists = Boolean(tableBody);
      }

      window.Logger?.info('📊 Debug report generated', {
        ...PAGE_LOG_CONTEXT,
        report,
      });

      return report;
    }
  }

  // יצירת instance גלובלי
  window.PreferencesDebugMonitor = new PreferencesDebugMonitor();

  // הוספת פונקציות גלובליות לנוחות
  window.startPreferencesDebugMonitoring = () => window.PreferencesDebugMonitor.startMonitoring();
  window.stopPreferencesDebugMonitoring = () => window.PreferencesDebugMonitor.stopMonitoring();
  window.runPreferencesDebugCheck = () => window.PreferencesDebugMonitor.runSingleCheck();
  window.generatePreferencesDebugReport = () => window.PreferencesDebugMonitor.generateReport();

  window.Logger?.info('✅ Preferences Debug Monitor initialized', PAGE_LOG_CONTEXT);
  
  // Log to console as well for immediate visibility
  window.Logger?.debug?.('✅ Preferences Debug Monitor initialized', {
    startMonitoring: typeof window.startPreferencesDebugMonitoring === 'function',
    stopMonitoring: typeof window.stopPreferencesDebugMonitoring === 'function',
    runCheck: typeof window.runPreferencesDebugCheck === 'function',
    generateReport: typeof window.generatePreferencesDebugReport === 'function',
  });
})();

