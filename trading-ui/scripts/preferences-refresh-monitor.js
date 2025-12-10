/**
 * Preferences Refresh Monitor
 * ============================
 * 
 * ניטור מפורט של תהליכי רענון העדפות
 * בודק מה קורה בפועל בכל שלב
 * 
 * @version 1.0.0
 * @created 2025-01-27
 */


// ===== FUNCTION INDEX =====

// === Monitoring ===
// - PreferencesRefreshMonitor.init() - Init
// - PreferencesRefreshMonitor.startMonitoring() - Start Monitoring
// - PreferencesRefreshMonitor.checkRefreshStatus() - Check Refresh Status

// === UI Functions ===
// - PreferencesRefreshMonitor.updateUI() - Update Ui
// - PreferencesRefreshMonitor.displayStatus() - Display Status

(function() {
  'use strict';

  const Monitor = {
    logs: [],
    snapshots: {},
    
    log(step, data) {
      const entry = {
        timestamp: new Date().toISOString(),
        step,
        data: JSON.parse(JSON.stringify(data)), // Deep clone
      };
      this.logs.push(entry);
      console.log(`📊 [Monitor] ${step}:`, data);
      window.Logger?.info?.(`📊 [Monitor] ${step}`, { 
        page: 'preferences-refresh-monitor',
        ...data 
      });
    },
    
    snapshot(name) {
      const snap = {
        timestamp: new Date().toISOString(),
        currentPreferences: { ...(window.currentPreferences || {}) },
        userPreferences: { ...(window.userPreferences || {}) },
        preferencesCount: Object.keys(window.currentPreferences || {}).length,
        preferencesV4Cache: window.PreferencesV4 ? {
          groupCacheSize: window.PreferencesV4.groupCache?.size || 0,
          cacheByGroupSize: window.PreferencesV4.cacheByGroup?.size || 0,
          etagByGroupSize: window.PreferencesV4.etagByGroup?.size || 0,
        } : null,
        localStorageKeys: Object.keys(localStorage).filter(k => 
          k.includes('preference') || k.includes('preferences')
        ),
        summaryElements: {
          preferencesCount: document.getElementById('preferencesCount')?.textContent || 'N/A',
          profilesCount: document.getElementById('profilesCount')?.textContent || 'N/A',
          groupsCount: document.getElementById('groupsCount')?.textContent || 'N/A',
          activeProfileName: document.getElementById('activeProfileName')?.textContent || 'N/A',
          activeUserName: document.getElementById('activeUserName')?.textContent || 'N/A',
        },
        formValues: this._captureFormValues(),
      };
      this.snapshots[name] = snap;
      this.log(`Snapshot: ${name}`, {
        preferencesCount: snap.preferencesCount,
        localStorageKeysCount: snap.localStorageKeys.length,
        summaryElements: snap.summaryElements,
      });
      return snap;
    },
    
    _captureFormValues() {
      const form = document.getElementById('preferencesForm');
      if (!form) return {};
      
      const values = {};
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        if (input.id || input.name) {
          const key = input.id || input.name;
          if (input.type === 'checkbox' || input.type === 'radio') {
            values[key] = input.checked ? input.value : '';
          } else {
            values[key] = input.value || '';
          }
        }
      });
      return values;
    },
    
    compareSnapshots(before, after) {
      const beforeSnap = this.snapshots[before];
      const afterSnap = this.snapshots[after];
      
      if (!beforeSnap || !afterSnap) {
        this.log('Compare Error', { 
          error: 'Missing snapshots',
          available: Object.keys(this.snapshots)
        });
        return null;
      }
      
      const comparison = {
        preferencesCount: {
          before: beforeSnap.preferencesCount,
          after: afterSnap.preferencesCount,
          changed: beforeSnap.preferencesCount !== afterSnap.preferencesCount,
        },
        localStorageKeys: {
          before: beforeSnap.localStorageKeys.length,
          after: afterSnap.localStorageKeys.length,
          changed: beforeSnap.localStorageKeys.length !== afterSnap.localStorageKeys.length,
          removed: beforeSnap.localStorageKeys.filter(k => !afterSnap.localStorageKeys.includes(k)),
          added: afterSnap.localStorageKeys.filter(k => !beforeSnap.localStorageKeys.includes(k)),
        },
        summaryElements: {},
        formValues: {
          changed: [],
          unchanged: [],
        },
      };
      
      // Compare summary elements
      Object.keys(beforeSnap.summaryElements).forEach(key => {
        const beforeVal = beforeSnap.summaryElements[key];
        const afterVal = afterSnap.summaryElements[key];
        comparison.summaryElements[key] = {
          before: beforeVal,
          after: afterVal,
          changed: beforeVal !== afterVal,
        };
      });
      
      // Compare form values
      Object.keys(beforeSnap.formValues).forEach(key => {
        const beforeVal = beforeSnap.formValues[key];
        const afterVal = afterSnap.formValues[key];
        if (beforeVal !== afterVal) {
          comparison.formValues.changed.push({
            key,
            before: beforeVal,
            after: afterVal,
          });
        } else {
          comparison.formValues.unchanged.push(key);
        }
      });
      
      this.log(`Comparison: ${before} → ${after}`, comparison);
      return comparison;
    },
    
    generateReport() {
      const report = {
        timestamp: new Date().toISOString(),
        logs: this.logs,
        snapshots: this.snapshots,
        summary: {
          totalLogs: this.logs.length,
          totalSnapshots: Object.keys(this.snapshots).length,
          snapshots: Object.keys(this.snapshots),
        },
      };
      
      console.log('📊 ===== PREFERENCES REFRESH MONITOR REPORT =====');
      console.log(JSON.stringify(report, null, 2));
      console.log('📊 ===== END REPORT =====');
      
      window.Logger?.info?.('📊 Preferences Refresh Monitor Report Generated', {
        page: 'preferences-refresh-monitor',
        totalLogs: report.summary.totalLogs,
        totalSnapshots: report.summary.totalSnapshots,
      });
      
      return report;
    },
    
    clear() {
      this.logs = [];
      this.snapshots = {};
      this.log('Monitor Cleared', {});
    },
  };

  // Wrap existing functions with monitoring
  const originalClearCache = window.clearPreferencesCache;
  const originalReloadData = window.reloadPreferencesData;
  const originalRefreshData = window.refreshPreferencesData;

  window.clearPreferencesCache = async function() {
    Monitor.log('clearPreferencesCache START', {});
    Monitor.snapshot('before_clearCache');
    
    try {
      const result = await originalClearCache();
      Monitor.snapshot('after_clearCache');
      Monitor.compareSnapshots('before_clearCache', 'after_clearCache');
      Monitor.log('clearPreferencesCache END', { success: true, result });
      return result;
    } catch (error) {
      Monitor.log('clearPreferencesCache ERROR', { error: error.message, stack: error.stack });
      throw error;
    }
  };

  window.reloadPreferencesData = async function() {
    Monitor.log('reloadPreferencesData START', {});
    Monitor.snapshot('before_reload');
    
    try {
      const result = await originalReloadData();
      
      // Wait a bit for UI to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      Monitor.snapshot('after_reload');
      const comparison = Monitor.compareSnapshots('before_reload', 'after_reload');
      
      Monitor.log('reloadPreferencesData END', { 
        success: true, 
        result,
        comparison: {
          preferencesCountChanged: comparison?.preferencesCount?.changed || false,
          summaryElementsChanged: Object.values(comparison?.summaryElements || {}).some(v => v.changed),
          formValuesChanged: (comparison?.formValues?.changed?.length || 0) > 0,
        }
      });
      
      return result;
    } catch (error) {
      Monitor.log('reloadPreferencesData ERROR', { error: error.message, stack: error.stack });
      throw error;
    }
  };

  window.refreshPreferencesData = async function() {
    Monitor.log('refreshPreferencesData START', {});
    Monitor.snapshot('before_refresh');
    
    try {
      const result = await originalRefreshData();
      
      // Wait a bit for UI to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Monitor.snapshot('after_refresh');
      const comparison = Monitor.compareSnapshots('before_refresh', 'after_refresh');
      
      Monitor.log('refreshPreferencesData END', { 
        success: true, 
        result,
        comparison: {
          preferencesCountChanged: comparison?.preferencesCount?.changed || false,
          summaryElementsChanged: Object.values(comparison?.summaryElements || {}).some(v => v.changed),
          formValuesChanged: (comparison?.formValues?.changed?.length || 0) > 0,
          localStorageKeysRemoved: comparison?.localStorageKeys?.removed?.length || 0,
          localStorageKeysAdded: comparison?.localStorageKeys?.added?.length || 0,
        }
      });
      
      return result;
    } catch (error) {
      Monitor.log('refreshPreferencesData ERROR', { error: error.message, stack: error.stack });
      throw error;
    }
  };

  // Expose monitor globally
  window.PreferencesRefreshMonitor = Monitor;
  
  // Auto-generate report after 30 seconds (for testing)
  setTimeout(() => {
    if (Monitor.logs.length > 0) {
      console.log('📊 Auto-generating monitor report after 30 seconds...');
      Monitor.generateReport();
    }
  }, 30000);

  console.log('✅ Preferences Refresh Monitor loaded');
  window.Logger?.info?.('✅ Preferences Refresh Monitor initialized', { 
    page: 'preferences-refresh-monitor' 
  });
})();

