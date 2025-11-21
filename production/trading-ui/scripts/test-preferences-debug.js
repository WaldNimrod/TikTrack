/**
 * Preferences Debug Test Script
 * בדיקת מדויקת של טעינת העדפות - ללא ניחושים
 * 
 * @version 1.0.0
 * @created 2025-01-27
 */

(function() {
  'use strict';

  /**
   * Preferences Debug Test Class
   */
  class PreferencesDebugTest {
    constructor() {
      this.results = {
        timestamp: new Date().toISOString(),
        userId: null,
        profileId: null,
        tests: []
      };
    }

    /**
     * Test 1: Check window.currentPreferences after lazy loading
     */
    async test1_CheckGlobalPreferences() {
      const test = {
        name: 'Test 1: Check window.currentPreferences',
        passed: false,
        details: {}
      };

      // Wait a bit for lazy loading to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      test.details.currentPreferencesExists = typeof window.currentPreferences !== 'undefined';
      test.details.currentPreferencesType = typeof window.currentPreferences;
      test.details.currentPreferencesKeys = window.currentPreferences ? Object.keys(window.currentPreferences) : [];
      test.details.currentPreferencesCount = window.currentPreferences ? Object.keys(window.currentPreferences).length : 0;
      test.details.currentPreferencesSample = window.currentPreferences ? 
        Object.fromEntries(Object.entries(window.currentPreferences).slice(0, 10)) : null;

      test.details.userPreferencesExists = typeof window.userPreferences !== 'undefined';
      test.details.userPreferencesCount = window.userPreferences ? Object.keys(window.userPreferences).length : 0;

      test.details.preferencesCriticalLoaded = window.__preferencesCriticalLoaded || false;
      test.details.preferencesCriticalLoadedDetail = window.__preferencesCriticalLoadedDetail || null;

      test.passed = test.details.currentPreferencesCount > 0;

      this.results.tests.push(test);
      return test;
    }

    /**
     * Test 2: Check API response for all preferences
     */
    async test2_CheckAllPreferencesAPI() {
      const test = {
        name: 'Test 2: Check /api/preferences/user API',
        passed: false,
        details: {}
      };

      try {
        const userId = window.PreferencesCore?.currentUserId || 1;
        const profileId = window.PreferencesCore?.currentProfileId || 0;
        
        test.details.requestedUserId = userId;
        test.details.requestedProfileId = profileId;

        const url = `/api/preferences/user?user_id=${userId}&profile_id=${profileId}`;
        test.details.url = url;

        const response = await fetch(url);
        test.details.responseStatus = response.status;
        test.details.responseStatusText = response.statusText;
        test.details.responseHeaders = Object.fromEntries(response.headers.entries());

        if (response.ok) {
          const data = await response.json();
          test.details.responseData = data;
          test.details.hasPreferences = !!data.preferences;
          test.details.preferencesType = typeof data.preferences;
          test.details.preferencesIsArray = Array.isArray(data.preferences);
          
          if (Array.isArray(data.preferences)) {
            test.details.preferencesArrayLength = data.preferences.length;
            test.details.preferencesArraySample = data.preferences.slice(0, 5);
          } else if (data.preferences && typeof data.preferences === 'object') {
            test.details.preferencesObjectKeys = Object.keys(data.preferences);
            test.details.preferencesObjectCount = Object.keys(data.preferences).length;
            test.details.preferencesObjectSample = Object.fromEntries(Object.entries(data.preferences).slice(0, 10));
          }

          test.details.hasProfileContext = !!data.profileContext;
          test.details.profileContext = data.profileContext;

          test.passed = test.details.hasPreferences && (
            (test.details.preferencesIsArray && test.details.preferencesArrayLength > 0) ||
            (!test.details.preferencesIsArray && test.details.preferencesObjectCount > 0)
          );
        } else {
          test.details.error = `HTTP ${response.status}: ${response.statusText}`;
          const errorText = await response.text();
          test.details.errorBody = errorText;
        }
      } catch (error) {
        test.details.error = error.message;
        test.details.errorStack = error.stack;
      }

      this.results.tests.push(test);
      return test;
    }

    /**
     * Test 3: Check API response for specific group
     */
    async test3_CheckGroupAPI(groupName) {
      const test = {
        name: `Test 3: Check /api/preferences/user/group API for '${groupName}'`,
        passed: false,
        details: { groupName }
      };

      try {
        const userId = window.PreferencesCore?.currentUserId || 1;
        const profileId = window.PreferencesCore?.currentProfileId || 0;
        
        test.details.requestedUserId = userId;
        test.details.requestedProfileId = profileId;

        const url = `/api/preferences/user/group?group=${groupName}&user_id=${userId}&profile_id=${profileId}`;
        test.details.url = url;

        const response = await fetch(url);
        test.details.responseStatus = response.status;
        test.details.responseStatusText = response.statusText;
        test.details.responseHeaders = Object.fromEntries(response.headers.entries());

        if (response.ok) {
          const data = await response.json();
          test.details.responseData = data;
          test.details.hasData = !!data.data;
          test.details.hasPreferences = !!data.data?.preferences;
          test.details.preferencesType = typeof data.data?.preferences;
          test.details.preferencesIsArray = Array.isArray(data.data?.preferences);
          
          if (Array.isArray(data.data?.preferences)) {
            test.details.preferencesArrayLength = data.data.preferences.length;
            test.details.preferencesArraySample = data.data.preferences.slice(0, 5);
            
            // Check if array has preference_name and saved_value/default_value
            if (test.details.preferencesArrayLength > 0) {
              const firstPref = data.data.preferences[0];
              test.details.firstPreferenceStructure = {
                hasPreferenceName: !!firstPref.preference_name,
                hasSavedValue: 'saved_value' in firstPref,
                hasDefaultValue: 'default_value' in firstPref,
                keys: Object.keys(firstPref)
              };
            }
          } else if (data.data?.preferences && typeof data.data.preferences === 'object') {
            test.details.preferencesObjectKeys = Object.keys(data.data.preferences);
            test.details.preferencesObjectCount = Object.keys(data.data.preferences).length;
            test.details.preferencesObjectSample = Object.fromEntries(Object.entries(data.data.preferences).slice(0, 10));
          }

          test.details.hasProfileContext = !!data.data?.profile_context;
          test.details.profileContext = data.data?.profile_context;

          test.passed = test.details.hasPreferences && (
            (test.details.preferencesIsArray && test.details.preferencesArrayLength > 0) ||
            (!test.details.preferencesIsArray && test.details.preferencesObjectCount > 0)
          );
        } else {
          test.details.error = `HTTP ${response.status}: ${response.statusText}`;
          const errorText = await response.text();
          test.details.errorBody = errorText;
        }
      } catch (error) {
        test.details.error = error.message;
        test.details.errorStack = error.stack;
      }

      this.results.tests.push(test);
      return test;
    }

    /**
     * Test 4: Check PreferencesV4.getGroup result
     */
    async test4_CheckPreferencesV4GetGroup(groupName) {
      const test = {
        name: `Test 4: Check PreferencesV4.getGroup('${groupName}') result`,
        passed: false,
        details: { groupName }
      };

      try {
        if (!window.PreferencesV4 || typeof window.PreferencesV4.getGroup !== 'function') {
          test.details.error = 'PreferencesV4.getGroup not available';
          this.results.tests.push(test);
          return test;
        }

        const userId = window.PreferencesCore?.currentUserId || 1;
        const profileId = window.PreferencesCore?.currentProfileId || 0;
        
        test.details.requestedUserId = userId;
        test.details.requestedProfileId = profileId;

        const result = await window.PreferencesV4.getGroup(groupName, profileId, userId);
        test.details.result = result;
        test.details.hasValues = !!result.values;
        test.details.valuesType = typeof result.values;
        test.details.valuesIsArray = Array.isArray(result.values);
        test.details.valuesKeys = result.values ? Object.keys(result.values) : [];
        test.details.valuesCount = result.values ? Object.keys(result.values).length : 0;
        test.details.valuesSample = result.values ? 
          Object.fromEntries(Object.entries(result.values).slice(0, 10)) : null;

        test.details.hasProfileContext = !!result.profileContext;
        test.details.profileContext = result.profileContext;
        test.details.fromCache = result.fromCache || false;

        test.passed = test.details.hasValues && test.details.valuesCount > 0;
      } catch (error) {
        test.details.error = error.message;
        test.details.errorStack = error.stack;
      }

      this.results.tests.push(test);
      return test;
    }

    /**
     * Test 5: Check PreferencesCore state
     */
    async test5_CheckPreferencesCoreState() {
      const test = {
        name: 'Test 5: Check PreferencesCore state',
        passed: false,
        details: {}
      };

      if (!window.PreferencesCore) {
        test.details.error = 'PreferencesCore not available';
        this.results.tests.push(test);
        return test;
      }

      test.details.currentUserId = window.PreferencesCore.currentUserId;
      test.details.currentProfileId = window.PreferencesCore.currentProfileId;
      test.details.latestProfileContext = window.PreferencesCore.latestProfileContext;

      test.details.hasGetAllPreferences = typeof window.PreferencesCore.getAllPreferences === 'function';
      if (test.details.hasGetAllPreferences) {
        try {
          const allPrefs = await window.PreferencesCore.getAllPreferences(
            test.details.currentUserId,
            test.details.currentProfileId
          );
          test.details.getAllPreferencesResult = {
            type: typeof allPrefs,
            isArray: Array.isArray(allPrefs),
            keys: allPrefs && typeof allPrefs === 'object' ? Object.keys(allPrefs) : [],
            count: allPrefs && typeof allPrefs === 'object' ? Object.keys(allPrefs).length : 0,
            sample: allPrefs && typeof allPrefs === 'object' ? 
              Object.fromEntries(Object.entries(allPrefs).slice(0, 10)) : null
          };
        } catch (error) {
          test.details.getAllPreferencesError = error.message;
        }
      }

      test.passed = test.details.currentUserId !== null && test.details.currentUserId !== undefined;

      this.results.tests.push(test);
      return test;
    }

    /**
     * Run all tests
     */
    async runAllTests() {
      console.log('🧪 Starting Preferences Debug Tests...');
      console.log('='.repeat(80));

      // Get userId and profileId from PreferencesCore if available
      if (window.PreferencesCore) {
        this.results.userId = window.PreferencesCore.currentUserId;
        this.results.profileId = window.PreferencesCore.currentProfileId;
      }

      // Test 1: Check global preferences
      console.log('\n📋 Running Test 1: Check window.currentPreferences...');
      await this.test1_CheckGlobalPreferences();

      // Test 2: Check all preferences API
      console.log('\n📋 Running Test 2: Check /api/preferences/user API...');
      await this.test2_CheckAllPreferencesAPI();

      // Test 3: Check group APIs for problematic groups
      // Updated to match actual group names in database
      const groupsToTest = ['ui_settings', 'trading_settings', 'colors_unified', 'basic_settings', 'filter_settings', 'notification_settings', 'chart_settings_unified'];
      for (const group of groupsToTest) {
        console.log(`\n📋 Running Test 3: Check /api/preferences/user/group API for '${group}'...`);
        await this.test3_CheckGroupAPI(group);
      }

      // Test 4: Check PreferencesV4.getGroup for problematic groups
      for (const group of groupsToTest) {
        console.log(`\n📋 Running Test 4: Check PreferencesV4.getGroup('${group}')...`);
        await this.test4_CheckPreferencesV4GetGroup(group);
      }

      // Test 5: Check PreferencesCore state
      console.log('\n📋 Running Test 5: Check PreferencesCore state...');
      await this.test5_CheckPreferencesCoreState();

      // Print summary
      console.log('\n' + '='.repeat(80));
      console.log('📊 TEST SUMMARY');
      console.log('='.repeat(80));
      
      const passed = this.results.tests.filter(t => t.passed).length;
      const failed = this.results.tests.filter(t => !t.passed).length;
      
      console.log(`Total Tests: ${this.results.tests.length}`);
      console.log(`✅ Passed: ${passed}`);
      console.log(`❌ Failed: ${failed}`);
      
      console.log('\n📋 Detailed Results:');
      this.results.tests.forEach((test, index) => {
        const status = test.passed ? '✅' : '❌';
        console.log(`\n${status} ${test.name}`);
        console.log(JSON.stringify(test.details, null, 2));
      });

      // Save results to window for inspection
      window.__preferencesDebugTestResults = this.results;
      console.log('\n💾 Results saved to window.__preferencesDebugTestResults');

      return this.results;
    }
  }

  // Export to window
  window.PreferencesDebugTest = PreferencesDebugTest;
  
  // Auto-run if on preferences page
  if (window.location.pathname.includes('/preferences')) {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          const test = new PreferencesDebugTest();
          test.runAllTests();
        }, 3000); // Wait 3 seconds for initialization
      });
    } else {
      setTimeout(() => {
        const test = new PreferencesDebugTest();
        test.runAllTests();
      }, 3000);
    }
  }

  // Manual run function
  window.runPreferencesDebugTest = function() {
    const test = new PreferencesDebugTest();
    return test.runAllTests();
  };

  console.log('✅ Preferences Debug Test script loaded');
  console.log('💡 Run manually: window.runPreferencesDebugTest()');
})();

