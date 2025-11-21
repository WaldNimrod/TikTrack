/**
 * Initialization Checker - TikTrack Initialization System
 * ========================================================
 * 
 * Checks for duplicate initialization calls and conflicts.
 * Detects:
 * - Multiple initialization calls
 * - Conflicting initialization systems
 * - Missing initialization
 * 
 * Related Documentation:
 * - documentation/REFACTOR_INITIALIZATION_SYSTEM_PLAN.md
 * 
 * @version 1.0.0
 * @created 2025-01-27
 * @author TikTrack Development Team
 */

(function() {
  'use strict';

  if (typeof window.InitializationChecker !== 'undefined') {
    return; // Already loaded
  }

  class InitializationChecker {
    constructor() {
      this.initializationCalls = [];
      this.initializationSystems = new Set();
      this.duplicates = [];
      this.conflicts = [];
    }

    /**
     * Record initialization call
     * @param {string} system - System name
     * @param {string} method - Method name
     * @param {number} timestamp - Timestamp
     */
    recordInitialization(system, method, timestamp = Date.now()) {
      this.initializationCalls.push({
        system: system,
        method: method,
        timestamp: timestamp
      });
      this.initializationSystems.add(system);
    }

    /**
     * Check for duplicate initializations
     * @returns {Array<Object>} Duplicate calls
     */
    checkDuplicates() {
      this.duplicates = [];
      const callMap = new Map();

      for (const call of this.initializationCalls) {
        const key = `${call.system}.${call.method}`;
        if (!callMap.has(key)) {
          callMap.set(key, []);
        }
        callMap.get(key).push(call);
      }

      for (const [key, calls] of callMap.entries()) {
        if (calls.length > 1) {
          this.duplicates.push({
            key: key,
            count: calls.length,
            calls: calls
          });
        }
      }

      return this.duplicates;
    }

    /**
     * Check for conflicting initialization systems
     * @returns {Array<string>} Conflicting systems
     */
    checkConflicts() {
      this.conflicts = [];
      const systems = Array.from(this.initializationSystems);

      // Check for known conflicts
      const knownConflicts = [
        ['unified-app-initializer', 'core-systems'],
        ['UnifiedAppInitializer', 'UnifiedAppInitializer'] // Same system called twice
      ];

      for (const [system1, system2] of knownConflicts) {
        if (systems.includes(system1) && systems.includes(system2)) {
          this.conflicts.push(`${system1} conflicts with ${system2}`);
        }
      }

      // Check for multiple instances of same system
      const systemCounts = new Map();
      for (const call of this.initializationCalls) {
        const count = systemCounts.get(call.system) || 0;
        systemCounts.set(call.system, count + 1);
      }

      for (const [system, count] of systemCounts.entries()) {
        if (count > 1) {
          this.conflicts.push(`${system} initialized ${count} times`);
        }
      }

      return this.conflicts;
    }

    /**
     * Check if preferences are initialized correctly
     * @returns {Object} Preferences initialization status
     */
    checkPreferencesInitialization() {
      const preferencesCalls = this.initializationCalls.filter(
        call => call.system.includes('Preferences') || call.method.includes('Preferences')
      );

      const hasPreferencesUIV4 = preferencesCalls.some(
        call => call.system === 'PreferencesUIV4' || call.method === 'PreferencesUIV4.initialize'
      );

      const hasPreferencesCore = preferencesCalls.some(
        call => call.system === 'PreferencesCore' || call.method === 'PreferencesCore.initializeWithLazyLoading'
      );

      const hasCoreSystems = this.initializationCalls.some(
        call => call.system === 'core-systems' || call.method === 'initializePreferencesForPage'
      );

      return {
        initialized: preferencesCalls.length > 0,
        viaCoreSystems: hasCoreSystems,
        hasUIV4: hasPreferencesUIV4,
        hasCore: hasPreferencesCore,
        duplicateCalls: preferencesCalls.length > 1,
        calls: preferencesCalls
      };
    }

    /**
     * Analyze all initialization issues
     * @returns {Object} Analysis result
     */
    analyze() {
      const duplicates = this.checkDuplicates();
      const conflicts = this.checkConflicts();
      const preferences = this.checkPreferencesInitialization();

      return {
        duplicates: duplicates,
        conflicts: conflicts,
        preferences: preferences,
        totalCalls: this.initializationCalls.length,
        uniqueSystems: this.initializationSystems.size,
        hasIssues: duplicates.length > 0 || conflicts.length > 0 || preferences.duplicateCalls
      };
    }

    /**
     * Print analysis report to console
     */
    printReport() {
      const result = this.analyze();

      console.group('🔍 Initialization Check Report');
      console.log(`Total Initialization Calls: ${result.totalCalls}`);
      console.log(`Unique Systems: ${result.uniqueSystems}`);

      if (result.duplicates.length > 0) {
        console.group('⚠️ Duplicate Initializations:');
        result.duplicates.forEach(dup => {
          console.warn(`${dup.key}: called ${dup.count} times`);
        });
        console.groupEnd();
      } else {
        console.log('✅ No duplicate initializations');
      }

      if (result.conflicts.length > 0) {
        console.group('❌ Conflicts:');
        result.conflicts.forEach(conflict => {
          console.error(conflict);
        });
        console.groupEnd();
      } else {
        console.log('✅ No conflicts');
      }

      console.group('📄 Preferences Initialization:');
      console.log(`Initialized: ${result.preferences.initialized ? '✅' : '❌'}`);
      console.log(`Via Core Systems: ${result.preferences.viaCoreSystems ? '✅' : '❌'}`);
      console.log(`Has UIV4: ${result.preferences.hasUIV4 ? '✅' : '❌'}`);
      console.log(`Has Core: ${result.preferences.hasCore ? '✅' : '❌'}`);
      console.log(`Duplicate Calls: ${result.preferences.duplicateCalls ? '⚠️' : '✅'}`);
      if (result.preferences.calls.length > 0) {
        console.log(`Calls: ${result.preferences.calls.length}`);
      }
      console.groupEnd();

      console.groupEnd();
      return result;
    }
  }

  // Export
  window.InitializationChecker = InitializationChecker;

  // Auto-initialize
  const checker = new InitializationChecker();
  window.initializationChecker = checker;
  console.log('✅ Initialization Checker initialized');
})();


