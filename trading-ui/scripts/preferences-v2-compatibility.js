/**
 * Preferences V2 Compatibility Layer
 * ==================================
 * 
 * שכבת תאימות בין מערכת העדפות החדשה V2 
 * למערכת הקיימת (filter-system.js וקובצים אחרים).
 * 
 * Author: TikTrack Development Team
 * Version: 2.0
 * Date: January 2025
 */

// פונקציה גלובלית לקבלת העדפה נוכחית - תאימות עם filter-system.js
window.getCurrentPreference = async function(preferenceKey) {
  try {
    console.log(`🔍 getCurrentPreference(${preferenceKey}) called`);
    
    // אם יש מופע V2, השתמש בו
    if (window.preferencesV2 && window.preferencesV2.preferences) {
      const v2Preferences = window.preferencesV2.preferences;
      
      // מיפוי מפתחות V1 ל-V2
      const keyMappings = {
        'defaultStatusFilter': 'defaultFilters.status',
        'defaultTypeFilter': 'defaultFilters.type',
        'defaultAccountFilter': 'defaultFilters.account',
        'defaultDateRangeFilter': 'defaultFilters.dateRange',
        'defaultSearchFilter': 'defaultFilters.search',
        'primaryCurrency': 'general.primaryCurrency',
        'timezone': 'general.timezone',
        'defaultStopLoss': 'general.defaultStopLoss',
        'defaultTargetPrice': 'general.defaultTargetPrice',
        'defaultCommission': 'general.defaultCommission'
      };
      
      const v2Path = keyMappings[preferenceKey];
      if (v2Path) {
        const value = window.preferencesV2.getNestedValue(v2Preferences, v2Path);
        console.log(`✅ Found V2 preference ${preferenceKey}: ${value}`);
        return value;
      }
      
      // חיפוש ישיר במבנה V2
      if (preferenceKey in v2Preferences) {
        const value = v2Preferences[preferenceKey];
        console.log(`✅ Found direct V2 preference ${preferenceKey}: ${value}`);
        return value;
      }
    }
    
    // Fallback ל-API V2
    try {
      const response = await fetch('/api/v2/preferences/');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.preferences) {
          const prefs = data.data.preferences;
          
          // חפש לפי מיפוי
          const keyMappings = {
            'defaultStatusFilter': 'defaultFilters.status',
            'defaultTypeFilter': 'defaultFilters.type',
            'defaultAccountFilter': 'defaultFilters.account',
            'defaultDateRangeFilter': 'defaultFilters.dateRange',
            'defaultSearchFilter': 'defaultFilters.search'
          };
          
          const v2Path = keyMappings[preferenceKey];
          if (v2Path) {
            const value = v2Path.split('.').reduce((obj, key) => obj?.[key], prefs);
            if (value !== undefined) {
              console.log(`✅ Found API V2 preference ${preferenceKey}: ${value}`);
              return value;
            }
          }
        }
      }
    } catch (apiError) {
      console.warn(`⚠️ API V2 fallback failed for ${preferenceKey}:`, apiError);
    }
    
    // Fallback ל-API V1
    try {
      const response = await fetch('/api/v1/preferences/');
      if (response.ok) {
        const data = await response.json();
        if (data[preferenceKey] !== undefined) {
          console.log(`✅ Found V1 preference ${preferenceKey}: ${data[preferenceKey]}`);
          return data[preferenceKey];
        }
      }
    } catch (v1Error) {
      console.warn(`⚠️ V1 fallback failed for ${preferenceKey}:`, v1Error);
    }
    
    // Fallback ל-localStorage
    const localValue = localStorage.getItem(`preference_${preferenceKey}`);
    if (localValue !== null) {
      console.log(`✅ Found localStorage preference ${preferenceKey}: ${localValue}`);
      return localValue;
    }
    
    // ברירות מחדל
    const defaults = {
      'defaultStatusFilter': 'open',
      'defaultTypeFilter': 'swing',
      'defaultAccountFilter': 'all',
      'defaultDateRangeFilter': 'this_week',
      'defaultSearchFilter': '',
      'primaryCurrency': 'USD',
      'timezone': 'Asia/Jerusalem'
    };
    
    const defaultValue = defaults[preferenceKey] || null;
    console.log(`🔄 Using default preference ${preferenceKey}: ${defaultValue}`);
    return defaultValue;
    
  } catch (error) {
    console.error(`❌ Error getting preference ${preferenceKey}:`, error);
    return null;
  }
};

// פונקציה לעדכון העדפה - תאימות
window.setCurrentPreference = async function(preferenceKey, value) {
  try {
    console.log(`✍️ setCurrentPreference(${preferenceKey}, ${value})`);
    
    if (window.preferencesV2) {
      // עדכן במערכת V2
      const keyMappings = {
        'defaultStatusFilter': 'defaultFilters.status',
        'defaultTypeFilter': 'defaultFilters.type',
        'defaultAccountFilter': 'defaultFilters.account',
        'defaultDateRangeFilter': 'defaultFilters.dateRange',
        'defaultSearchFilter': 'defaultFilters.search'
      };
      
      const v2Path = keyMappings[preferenceKey];
      if (v2Path) {
        window.preferencesV2.setNestedValue(window.preferencesV2.preferences, v2Path, value);
        window.preferencesV2.markDirty();
        console.log(`✅ Updated V2 preference ${preferenceKey} to ${value}`);
        return true;
      }
    }
    
    // Fallback ל-localStorage
    localStorage.setItem(`preference_${preferenceKey}`, value);
    console.log(`🔄 Saved to localStorage: ${preferenceKey} = ${value}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error setting preference ${preferenceKey}:`, error);
    return false;
  }
};

// פונקציות תאימות נוספות

// תאימות עם מערכת הצבעים הקיימת
window.loadColorPreferences = async function() {
  try {
    if (window.preferencesV2 && window.preferencesV2.preferences.colorScheme) {
      const colorScheme = window.preferencesV2.preferences.colorScheme;
      
      // עדכן צבעי ערכים מספריים
      if (colorScheme.numericValues && window.updateNumericValueColors) {
        window.updateNumericValueColors(colorScheme.numericValues);
      }
      
      // עדכן צבעי ישויות
      if (colorScheme.entities && window.loadAllColorsFromPreferences) {
        window.loadAllColorsFromPreferences({ entityColors: colorScheme.entities });
      }
      
      // עדכן צבעי סטטוסים
      if (colorScheme.status && window.STATUS_COLORS) {
        Object.assign(window.STATUS_COLORS, colorScheme.status);
      }
      
      console.log('✅ Loaded colors from V2 preferences');
      return true;
    }
    
    // Fallback ל-V1
    console.log('🔄 Falling back to V1 color loading...');
    return false;
    
  } catch (error) {
    console.error('❌ Error loading color preferences:', error);
    return false;
  }
};

// תאימות עם מערכת הפילטרים
window.resetToUserDefaults = async function() {
  try {
    console.log('🔄 resetToUserDefaults called - using V2 system');
    
    if (window.preferencesV2) {
      await window.preferencesV2.loadPreferences();
      
      // עדכן filter-system אם קיים
      if (window.filterSystem) {
        const prefs = window.preferencesV2.preferences;
        
        if (prefs.defaultFilters) {
          // עדכן פילטרים במערכת הקיימת
          window.filterSystem.currentFilters.status = [prefs.defaultFilters.status || 'open'];
          window.filterSystem.currentFilters.type = [prefs.defaultFilters.type || 'swing']; 
          window.filterSystem.currentFilters.dateRange = prefs.defaultFilters.dateRange || 'this_week';
          window.filterSystem.currentFilters.search = prefs.defaultFilters.search || '';
          
          // הפעל הפילטרים
          window.filterSystem.applyAllFilters();
        }
      }
      
      console.log('✅ Reset to V2 user defaults');
      return true;
    }
    
    // Fallback למערכת V1
    console.log('🔄 No V2 system, calling original resetToUserDefaults...');
    return false;
    
  } catch (error) {
    console.error('❌ Error resetting to user defaults:', error);
    return false;
  }
};

// פונקציה לסנכרון בין V2 למערכת הקיימת
window.syncV2WithLegacySystems = function() {
  try {
    if (!window.preferencesV2 || !window.preferencesV2.preferences) {
      return;
    }
    
    const prefs = window.preferencesV2.preferences;
    
    // סנכרן עם filter-system
    if (window.filterSystem && prefs.defaultFilters) {
      const mapping = {
        'status': prefs.defaultFilters.status,
        'type': prefs.defaultFilters.type,
        'dateRange': prefs.defaultFilters.dateRange,
        'search': prefs.defaultFilters.search
      };
      
      Object.entries(mapping).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'status' || key === 'type') {
            window.filterSystem.currentFilters[key] = [value];
          } else {
            window.filterSystem.currentFilters[key] = value;
          }
        }
      });
    }
    
    // סנכרן עם מערכת הצבעים
    if (window.loadColorPreferences) {
      window.loadColorPreferences();
    }
    
    console.log('🔄 Synced V2 with legacy systems');
    
  } catch (error) {
    console.error('❌ Error syncing V2 with legacy systems:', error);
  }
};

// פונקציות עזר לדיבוג ובדיקה

window.debugPreferencesV2 = function() {
  console.log('🐛 PREFERENCES V2 DEBUG INFO:');
  console.log('Current Profile:', window.preferencesV2?.currentProfile);
  console.log('All Profiles:', window.preferencesV2?.profiles);
  console.log('Current Preferences:', window.preferencesV2?.preferences);
  console.log('Is Dirty:', window.preferencesV2?.isDirty);
  console.log('Validation Errors:', window.preferencesV2?.validationErrors);
};

window.testV2System = async function() {
  try {
    console.log('🧪 Testing V2 system...');
    
    // בדוק טעינת פרופילים
    await window.preferencesV2.loadProfiles();
    console.log('✅ Profile loading: OK');
    
    // בדוק טעינת הגדרות
    await window.preferencesV2.loadPreferences();
    console.log('✅ Preferences loading: OK');
    
    // בדוק תקינות
    await window.preferencesV2.validateSettings();
    console.log('✅ Validation: OK');
    
    // בדוק תאימות
    const statusFilter = await window.getCurrentPreference('defaultStatusFilter');
    console.log(`✅ Compatibility: defaultStatusFilter = ${statusFilter}`);
    
    console.log('🎉 V2 system test completed successfully!');
    
  } catch (error) {
    console.error('❌ V2 system test failed:', error);
  }
};

console.log('✅ Preferences V2 Compatibility Layer loaded');