/**
 * Preferences System - Frontend JavaScript
 * =======================================
 * 
 * מערכת העדפות - JavaScript לממשק המשתמש
 * 
 * @version 1.0.0
 * @lastUpdated January 2025
 * @author TikTrack Development Team
 */

// ===== GLOBAL PREFERENCES SYSTEM =====

// Global preferences cache
window.preferencesCache = {
    data: {},
    timestamp: null,
    ttl: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    isValid: function() {
        if (!this.timestamp) return false;
        return (Date.now() - this.timestamp) < this.ttl;
    },
    set: function(data) {
        this.data = data;
        this.timestamp = Date.now();
    },
    get: function() {
        return this.isValid() ? this.data : null;
    },
    clear: function() {
        this.data = {};
        this.timestamp = null;
    }
};

// ===== CORE ACCESS FUNCTIONS =====

/**
 * קבלת העדפה בודדת
 * @param {string} preferenceName - שם ההעדפה
 * @param {number} userId - מזהה משתמש (ברירת מחדל: 1)
 * @param {number} profileId - מזהה פרופיל (אופציונלי)
 * @returns {Promise<any>} - ערך ההעדפה
 */
window.getPreference = async function(preferenceName, userId = 1, profileId = null) {
    try {
        console.log(`🔍 Getting preference: ${preferenceName}`);
        
        // בדיקת מטמון
        const cached = window.preferencesCache.get();
        if (cached && cached[preferenceName] !== undefined) {
            console.log(`✅ Cache hit for ${preferenceName}:`, cached[preferenceName]);
            return cached[preferenceName];
        }
        
        // שאילתה לשרת
        let url = `/api/v1/preferences/user/single?preference_name=${preferenceName}&user_id=${userId}`;
        if (profileId) {
            url += `&profile_id=${profileId}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
            const result = await response.json();
            const value = result.data?.value;
            
            console.log(`✅ Retrieved ${preferenceName}:`, value);
            
            // עדכון מטמון
            if (cached) {
                cached[preferenceName] = value;
                window.preferencesCache.set(cached);
            }
            
            return value;
      } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
        console.error(`❌ Error getting preference ${preferenceName}:`, error);
        throw error;
    }
};

/**
 * קבלת קבוצת העדפות
 * @param {string} groupName - שם הקבוצה
 * @param {number} userId - מזהה משתמש (ברירת מחדל: 1)
 * @param {number} profileId - מזהה פרופיל (אופציונלי)
 * @returns {Promise<Object>} - מילון עם העדפות הקבוצה
 */
window.getGroupPreferences = async function(groupName, userId = 1, profileId = null) {
    try {
        console.log(`🔍 Getting group preferences: ${groupName}`);
        
        // בדיקת מטמון
        const cached = window.preferencesCache.get();
        if (cached && cached[`group_${groupName}`]) {
            console.log(`✅ Cache hit for group ${groupName}`);
            return cached[`group_${groupName}`];
        }
        
        // שאילתה לשרת
        let url = `/api/v1/preferences/user/group?group=${groupName}&user_id=${userId}`;
        if (profileId) {
            url += `&profile_id=${profileId}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
            const result = await response.json();
            const preferences = result.data?.preferences || {};
            
            console.log(`✅ Retrieved group ${groupName}:`, preferences);
            
            // עדכון מטמון
            if (cached) {
                cached[`group_${groupName}`] = preferences;
                window.preferencesCache.set(cached);
            }
            
            return preferences;
      } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
        console.error(`❌ Error getting group preferences ${groupName}:`, error);
        throw error;
    }
};

/**
 * קבלת העדפות מרובות לפי שמות
 * @param {Array<string>} preferenceNames - רשימת שמות העדפות
 * @param {number} userId - מזהה משתמש (ברירת מחדל: 1)
 * @param {number} profileId - מזהה פרופיל (אופציונלי)
 * @returns {Promise<Object>} - מילון עם העדפות
 */
window.getPreferencesByNames = async function(preferenceNames, userId = 1, profileId = null) {
    try {
        console.log(`🔍 Getting multiple preferences:`, preferenceNames);
        
        // בדיקת מטמון
        const cached = window.preferencesCache.get();
        const missingFromCache = preferenceNames.filter(name => !cached || cached[name] === undefined);
        
        if (missingFromCache.length === 0 && cached) {
            console.log(`✅ All preferences found in cache`);
            return preferenceNames.reduce((result, name) => {
                result[name] = cached[name];
                return result;
            }, {});
        }
        
        // שאילתה לשרת
        const response = await fetch('/api/v1/preferences/user/multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
            body: JSON.stringify({
                preference_names: preferenceNames,
                user_id: userId,
                profile_id: profileId
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            const preferences = result.data?.preferences || {};
            
            console.log(`✅ Retrieved multiple preferences:`, preferences);
            
            // עדכון מטמון
            if (cached) {
                Object.assign(cached, preferences);
                window.preferencesCache.set(cached);
            }
            
            return preferences;
      } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
        console.error(`❌ Error getting multiple preferences:`, error);
        throw error;
    }
};

/**
 * קבלת כל ההעדפות של משתמש
 * @param {number} userId - מזהה משתמש (ברירת מחדל: 1)
 * @param {number} profileId - מזהה פרופיל (אופציונלי)
 * @returns {Promise<Object>} - מילון עם כל ההעדפות
 */
window.getAllUserPreferences = async function(userId = 1, profileId = null) {
    try {
        console.log(`🔍 Getting all user preferences for user ${userId}`);
        
        // בדיקת מטמון
        const cached = window.preferencesCache.get();
        if (cached && Object.keys(cached).length > 0) {
            console.log(`✅ All preferences found in cache`);
            return cached;
        }
        
        // שאילתה לשרת
        let url = `/api/v1/preferences/user?user_id=${userId}`;
        if (profileId) {
            url += `&profile_id=${profileId}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
            const result = await response.json();
            const preferences = result.data?.preferences || {};
            
            console.log(`✅ Retrieved all preferences:`, preferences);

            // עדכון מטמון
            window.preferencesCache.set(preferences);

            // עדכון CSS Variables מצבעים דינמיים
            if (window.colorSchemeSystem && window.colorSchemeSystem.updateCSSVariablesFromPreferences) {
                console.log('🎨 Updating CSS variables from preferences...');
                window.colorSchemeSystem.updateCSSVariablesFromPreferences(preferences);
            }

            return preferences;
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`❌ Error getting all user preferences:`, error);
        throw error;
    }
};

// ===== SAVE FUNCTIONS =====

/**
 * שמירת העדפה בודדת
 * @param {string} preferenceName - שם ההעדפה
 * @param {any} value - ערך ההעדפה
 * @param {number} userId - מזהה משתמש (ברירת מחדל: 1)
 * @param {number} profileId - מזהה פרופיל (אופציונלי)
 * @returns {Promise<boolean>} - האם השמירה הצליחה
 */
window.savePreference = async function(preferenceName, value, userId = 1, profileId = null) {
    try {
        console.log(`💾 Saving preference: ${preferenceName} = ${value}`);
        
        const response = await fetch('/api/v1/preferences/user/single', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                preference_name: preferenceName,
                value: value,
                user_id: userId,
                profile_id: profileId
            })
        });
        
        if (response.ok) {
            console.log(`✅ Saved preference: ${preferenceName}`);
            
            // עדכון מטמון
            const cached = window.preferencesCache.get() || {};
            cached[preferenceName] = value;
            window.preferencesCache.set(cached);
            
            return true;
      } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
        console.error(`❌ Error saving preference ${preferenceName}:`, error);
        throw error;
    }
};

/**
 * שמירת העדפות מרובות
 * @param {Object} preferences - מילון עם העדפות
 * @param {number} userId - מזהה משתמש (ברירת מחדל: 1)
 * @param {number} profileId - מזהה פרופיל (אופציונלי)
 * @returns {Promise<boolean>} - האם השמירה הצליחה
 */
window.savePreferences = async function(preferences, userId = 1, profileId = null) {
    try {
        console.log(`💾 Saving multiple preferences:`, preferences);
      
      const response = await fetch('/api/v1/preferences/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
            body: JSON.stringify({
                preferences: preferences,
                user_id: userId,
                profile_id: profileId
            })
        });
        
        if (response.ok) {
            console.log(`✅ Saved multiple preferences`);
            
            // עדכון מטמון
            const cached = window.preferencesCache.get() || {};
            Object.assign(cached, preferences);
            window.preferencesCache.set(cached);
            
            return true;
      } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
        console.error(`❌ Error saving multiple preferences:`, error);
        throw error;
    }
};

// ===== PROFILE MANAGEMENT =====

/**
 * קבלת פרופילים של משתמש
 * @param {number} userId - מזהה משתמש (ברירת מחדל: 1)
 * @returns {Promise<Array>} - רשימת פרופילים
 */
window.getUserProfiles = async function(userId = 1) {
    try {
        console.log(`🔍 Getting user profiles for user ${userId}`);
        
        const response = await fetch(`/api/v1/preferences/profiles?user_id=${userId}`);
        if (response.ok) {
            const result = await response.json();
            const profiles = result.data?.profiles || [];
            
            console.log(`✅ Retrieved user profiles:`, profiles);
            return profiles;
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`❌ Error getting user profiles:`, error);
        throw error;
    }
};

// ===== UTILITY FUNCTIONS =====

/**
 * מחיקת מטמון העדפות
 */
window.clearPreferencesCache = function() {
    console.log(`🗑️ Clearing preferences cache`);
    window.preferencesCache.clear();
};

/**
 * בדיקת תקינות השירות
 * @returns {Promise<boolean>} - האם השירות תקין
 */
window.checkPreferencesServiceHealth = async function() {
    try {
        console.log(`🔍 Checking preferences service health`);
        
        const response = await fetch('/api/v1/preferences/health');
        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Preferences service is healthy:`, result.data);
            return true;
      } else {
            console.log(`❌ Preferences service is unhealthy: HTTP ${response.status}`);
        return false;
      }
    } catch (error) {
        console.error(`❌ Error checking preferences service health:`, error);
      return false;
    }
};

/**
 * קבלת מידע על העדפה
 * @param {string} preferenceName - שם ההעדפה
 * @returns {Promise<Object>} - מידע על ההעדפה
 */
window.getPreferenceInfo = async function(preferenceName) {
    try {
        console.log(`🔍 Getting preference info: ${preferenceName}`);
        
        const response = await fetch(`/api/v1/preferences/info/${preferenceName}`);
        if (response.ok) {
            const result = await response.json();
            const info = result.data?.info;
            
            console.log(`✅ Retrieved preference info:`, info);
            return info;
      } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
        console.error(`❌ Error getting preference info:`, error);
        throw error;
    }
};

// ===== LEGACY COMPATIBILITY =====

/**
 * טעינת העדפות (תואם למערכת הישנה)
 * @returns {Promise<boolean>} - האם הטעינה הצליחה
 */
window.loadPreferences = async function() {
    try {
        console.log('📂 Loading preferences from system...');
        
        const preferences = await window.getAllUserPreferences();
        
        // Apply preferences to form (if function exists)
        if (typeof window.applyPreferencesToForm === 'function') {
            window.applyPreferencesToForm(preferences);
        }
        
        // Return preferences data
        return {
            success: true,
            data: preferences
        };
    } catch (error) {
        console.error('❌ Error loading preferences:', error);
        
        // Show error notification
        if (typeof window.showError === 'function') {
            window.showError('שגיאה בטעינת העדפות', 'שגיאה בטעינת העדפות מהמערכת החדשה: ' + error.message);
        }
        
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * שמירת העדפות (תואם למערכת הישנה)
 * @returns {Promise<boolean>} - האם השמירה הצליחה
 */
window.saveAllPreferences = async function() {
    try {
        console.log('💾 Saving all preferences to system...');
        
        // Collect form data (if function exists)
        if (typeof window.collectFormData === 'function') {
            const formData = window.collectFormData();
            await window.savePreferences(formData);
            
            // Preferences saved successfully
            
            return true;
    } else {
            console.warn('⚠️ collectFormData function not found');
            return false;
        }
  } catch (error) {
        console.error('❌ Error saving preferences:', error);
        
        // Show error notification
        if (typeof window.showError === 'function') {
            window.showError('שגיאה בשמירת העדפות', 'שגיאה בשמירת העדפות במערכת החדשה: ' + error.message);
        }
        
        return false;
    }
};

// ===== INITIALIZATION =====

/**
 * אתחול מערכת העדפות
 */
window.initializePreferences = async function() {
    try {
        console.log('🚀 Initializing Preferences System...');
        
        // בדיקת תקינות השירות
        const isHealthy = await window.checkPreferencesServiceHealth();
        if (!isHealthy) {
            console.warn('⚠️ Preferences service is not healthy, using fallback');
        return false;
      }
      
        // טעינת העדפות ראשונית
        await window.getAllUserPreferences();
      
        console.log('✅ Preferences System initialized successfully');
      return true;
  } catch (error) {
        console.error('❌ Error initializing Preferences System:', error);
      return false;
    }
};

// ===== RESET TO DEFAULTS =====

/**
 * איפוס כל ההעדפות לברירות מחדל
 * Reset all preferences to default values
 * 
 * @returns {Promise<boolean>} - האם האיפוס הצליח
 */
window.resetToDefaults = async function() {
    try {
        console.log('🔄 Resetting all preferences to defaults...');
        
        // קבלת כל ההעדפות הנוכחיות
        const currentPreferences = await window.getAllUserPreferences();
        if (!currentPreferences.success) {
            throw new Error('Failed to get current preferences');
        }
        
        // קבלת ברירות מחדל מהמערכת
        const response = await fetch('/api/v1/preferences/admin/types');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const preferenceTypes = data.data.preference_types || [];
        
        // יצירת אובייקט עם ברירות מחדל
        const defaultPreferences = {};
        preferenceTypes.forEach(pref => {
            if (pref.default_value !== null) {
                defaultPreferences[pref.preference_name] = pref.default_value;
            }
        });
        
        // שמירת ברירות המחדל
        const saveResult = await window.savePreferences(defaultPreferences);
        if (saveResult.success) {
            console.log('✅ All preferences reset to defaults successfully');
            
            // Page will reload to show changes
            
            // רענון הדף
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
            return true;
      } else {
            throw new Error('Failed to save default preferences');
    }
    
  } catch (error) {
        console.error('❌ Error resetting preferences to defaults:', error);
        
        if (typeof showNotification === 'function') {
            showNotification('שגיאה באיפוס ההעדפות: ' + error.message, 'error');
        } else {
            alert('שגיאה באיפוס ההעדפות: ' + error.message);
        }
        
        return false;
    }
};

// ===== AUTO-INITIALIZATION =====

// אתחול אוטומטי כשהדף נטען
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, initializing Preferences System...');
    
    // אתחול המערכת
    window.initializePreferences().then(success => {
        if (success) {
            console.log('🎉 Preferences System ready!');
        } else {
            console.warn('⚠️ Preferences System initialization failed');
        }
    });
});

// ===== EXPORT FOR TESTING =====

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getPreference: window.getPreference,
        getGroupPreferences: window.getGroupPreferences,
        getPreferencesByNames: window.getPreferencesByNames,
        getAllUserPreferences: window.getAllUserPreferences,
        savePreference: window.savePreference,
        savePreferences: window.savePreferences,
        getUserProfiles: window.getUserProfiles,
        clearPreferencesCache: window.clearPreferencesCache,
        checkPreferencesServiceHealth: window.checkPreferencesServiceHealth,
        getPreferenceInfo: window.getPreferenceInfo,
        loadPreferences: window.loadPreferences,
        saveAllPreferences: window.saveAllPreferences,
        resetToDefaults: window.resetToDefaults,
        initializePreferences: window.initializePreferences
    };
}
