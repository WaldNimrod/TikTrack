/**
 * Preferences System - Frontend JavaScript (Legacy/Backward Compatibility)
 * =======================================
 * 
 * מערכת העדפות - JavaScript לממשק המשתמש
 * 
 * ⚠️ NOTE: This file contains legacy functions for backward compatibility.
 * For new code, use preferences-core-new.js (PreferencesCore) or preferences-ui-v4.js (PreferencesV4).
 * 
 * @version 1.0.0
 * @lastUpdated January 2025
 * @author TikTrack Development Team
 * 
 * @deprecated Most functions in this file are deprecated. Use PreferencesCore or PreferencesV4 instead.
 * 
 * Documentation: See documentation/04-FEATURES/CORE/preferences/PREFERENCES_COMPLETE_DEVELOPER_GUIDE.md
 */

// ============================================================================
// FUNCTION INDEX
// ============================================================================
/**
 * ============================================================================
 * FUNCTION INDEX - Preferences System (Legacy)
 * ============================================================================
 * 
 * ⚠️ DEPRECATED: Most functions are deprecated. Use PreferencesCore or PreferencesV4.
 * 
 * Legacy Functions (Backward Compatibility):
 * - getPreference(preferenceName, userId, profileId) - Get single preference (DEPRECATED - use PreferencesCore)
 * - savePreference(preferenceName, value, userId, profileId) - Save single preference (DEPRECATED - use PreferencesCore)
 * - getGroupPreferences(groupName, userId, profileId) - Get group preferences
 * - getPreferencesByNames(preferenceNames, userId, profileId) - Get multiple preferences
 * - getAllUserPreferences(userId, profileId) - Get all preferences (DEPRECATED - use PreferencesCore)
 * - savePreferences(preferences, userId, profileId) - Save multiple preferences (DEPRECATED - use PreferencesCore)
 * - getUserProfiles(userId) - Get user profiles
 * - clearPreferencesCache() - Clear cache (DEPRECATED - use UnifiedCacheManager)
 * - checkPreferencesServiceHealth() - Check service health
 * - getPreferenceInfo(preferenceName) - Get preference info
 * - loadPreferences(userId, profileId) - Load preferences (LEGACY)
 * - saveAllPreferences() - Save all preferences (LEGACY)
 * - resetToDefaults() - Reset to defaults
 * - initializePreferences() - Initialize (LEGACY)
 * - loadProfilesToDropdown() - Load profiles to dropdown (LEGACY - use preferences-page.js)
 * - loadProfile() - Load profile (DEPRECATED)
 * - switchProfile(profileId) - Switch profile (DEPRECATED - use PreferencesData.activateProfile)
 * - saveAsActiveProfile() - Save as active profile (DEPRECATED)
 * 
 * Utility Functions:
 * - getPaginationSize(tableType) - Get pagination size
 * - setPaginationSize(tableType, size) - Set pagination size
 * 
 * Legacy Cache:
 * - window.preferencesCache - Legacy cache object (DEPRECATED - use UnifiedCacheManager)
 * 
 * Documentation: See documentation/04-FEATURES/CORE/preferences/PREFERENCES_COMPLETE_DEVELOPER_GUIDE.md
 * ============================================================================
 */

// ===== GLOBAL PREFERENCES SYSTEM =====

// Global preferences cache
/**
 * Legacy preferences cache object (DEPRECATED - use UnifiedCacheManager)
 * @deprecated Use UnifiedCacheManager instead
 * @type {Object}
 */
window.preferencesCache = {
    data: {},
    timestamp: null,
    ttl: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    /**
     * Check if cache is valid
     * @returns {boolean} True if cache is valid, false otherwise
     */
    isValid: function() {
        if (!this.timestamp) return false;
        return (Date.now() - this.timestamp) < this.ttl;
    },
    /**
     * Set cache data
     * @param {Object} data - Data to cache
     * @returns {void}
     */
    set: function(data) {
        this.data = data;
        this.timestamp = Date.now();
    },
    /**
     * Get cached data if valid
     * @returns {Object|null} Cached data or null if invalid
     */
    get: function() {
        return this.isValid() ? this.data : null;
    },
    /**
     * Clear cache
     * @returns {void}
     */
    clear: function() {
        this.data = {};
        this.timestamp = null;
    }
};

// ===== PAGINATION PREFERENCES =====

/**
 * קבלת העדפת גודל עמוד לטבלאות
 * @param {string} tableType - סוג הטבלה (ברירת מחדל: 'default')
 * @returns {Promise<number>} - מספר רשומות לעמוד
 */
window.getPaginationSize = async function(tableType = 'default') {
    try {
        const preferenceName = `pagination_size_${tableType}`;
        const size = await window.getPreference(preferenceName);
        return size || 20; // ברירת מחדל: 20 רשומות לעמוד
    } catch (error) {
        window.Logger?.warn('Failed to get pagination size preference, using default', { page: 'preferences', error: error?.message || error });
        return 20;
    }
};

/**
 * שמירת העדפת גודל עמוד לטבלאות
 * @param {string} tableType - סוג הטבלה
 * @param {number} size - מספר רשומות לעמוד
 * @returns {Promise<boolean>} - האם השמירה הצליחה
 */
window.setPaginationSize = async function(tableType = 'default', size = 20) {
    try {
        const preferenceName = `pagination_size_${tableType}`;
        return await window.setPreference(preferenceName, size);
    } catch (error) {
        window.Logger?.error('Failed to set pagination size preference', { page: 'preferences', error: error?.message || error });
        return false;
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
        window.Logger?.debug('Getting preference', { page: 'preferences', preferenceName, userId, profileId });

        const cached = window.preferencesCache.get();
        if (cached && cached[preferenceName] !== undefined) {
            window.Logger?.debug('Cache hit for preference', { page: 'preferences', preferenceName, value: cached[preferenceName] });
            return cached[preferenceName];
        }

        const result = await window.PreferencesData.loadPreference({
            preferenceName,
            userId,
            profileId,
        });

        const value = result?.value ?? null;
        window.Logger?.debug('Retrieved preference', { page: 'preferences', preferenceName, value });

        if (cached) {
            cached[preferenceName] = value;
            window.preferencesCache.set(cached);
        }

        return value;
    } catch (error) {
        window.Logger?.error('Error getting preference', { page: 'preferences', preferenceName, error: error?.message || error });
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
        window.Logger?.debug('Getting group preferences', { page: 'preferences', groupName, userId, profileId });

        const cached = window.preferencesCache.get();
        if (cached && cached[`group_${groupName}`]) {
            window.Logger?.debug('Cache hit for group', { page: 'preferences', groupName });
            return cached[`group_${groupName}`];
        }

        const result = await window.PreferencesData.loadPreferenceGroup({
            groupName,
            userId,
            profileId,
        });

        const preferences = result?.preferences || {};
        window.Logger?.debug('Retrieved group preferences', { page: 'preferences', groupName, preferences });

        if (cached) {
            cached[`group_${groupName}`] = preferences;
            window.preferencesCache.set(cached);
        }

        return {
            success: true,
            data: {
                preferences,
            },
        };
    } catch (error) {
        window.Logger?.error('Error getting group preferences', { page: 'preferences', groupName, error: error?.message || error });
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
        window.Logger?.debug('Getting multiple preferences', { page: 'preferences', preferenceNames, userId, profileId });

        const cached = window.preferencesCache.get();
        const missingFromCache = preferenceNames.filter(name => !cached || cached[name] === undefined);
        
        if (missingFromCache.length === 0 && cached) {
            window.Logger?.debug('All preferences found in cache', { page: 'preferences', preferenceNames });
            return preferenceNames.reduce((result, name) => {
                result[name] = cached[name];
                return result;
            }, {});
        }
        
        const preferences = await window.PreferencesData.loadPreferencesByNames({
            names: preferenceNames,
            userId,
            profileId,
        });

        window.Logger?.debug('Retrieved multiple preferences', { page: 'preferences', preferences });

        if (cached) {
            Object.assign(cached, preferences);
            window.preferencesCache.set(cached);
        }

        return preferences;
    } catch (error) {
        window.Logger?.error('Error getting multiple preferences', { page: 'preferences', preferenceNames, error: error?.message || error });
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
        window.Logger?.debug('Getting all user preferences', { page: 'preferences', userId, profileId: profileId || 'active' });
        
        const cached = window.preferencesCache.get();
        if (cached && Object.keys(cached).length > 0) {
            window.Logger?.debug('All preferences found in cache', { page: 'preferences' });
            return cached;
        }
        
        window.Logger?.debug('Cache is empty, fetching fresh data from server', { page: 'preferences' });
        
        const payload = await window.PreferencesData.loadAllPreferencesRaw({
            userId,
            profileId,
            force: true,
        });
        const preferences = payload?.preferences || {};

        window.Logger?.debug('Retrieved all preferences', { page: 'preferences', preferences });

        window.preferencesCache.set(preferences);

        // אם המערכת החדשה זמינה — עדכן הקשר פרופיל כדי לסנכרן משתמש/פרופיל פעיל במערכות הגלובאליות
        try {
            const context = payload?.profileContext || null;
            if (context && window.PreferencesUI && typeof window.PreferencesUI.updateProfileContext === 'function') {
                await window.PreferencesUI.updateProfileContext(context);
            }
        } catch (syncError) {
            window.Logger?.warn('Failed to sync profile context to PreferencesUI', { page: 'preferences', error: syncError?.message || syncError });
        }

        if (window.colorSchemeSystem?.updateCSSVariablesFromPreferences) {
            window.Logger?.debug('Updating CSS variables from preferences', { page: 'preferences' });
            window.colorSchemeSystem.updateCSSVariablesFromPreferences(preferences);
        }

        return preferences;
    } catch (error) {
        window.Logger?.error('Error getting all user preferences', { page: 'preferences', userId, profileId, error: error?.message || error });
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
        window.Logger?.debug('Saving preference', { page: 'preferences', preferenceName, value, userId, profileId });
        
        await window.PreferencesData.savePreference({
            preferenceName,
            value,
            userId,
            profileId,
        });

        const cached = window.preferencesCache.get() || {};
        cached[preferenceName] = value;
        window.preferencesCache.set(cached);
        
        window.Logger?.debug('Saved preference', { page: 'preferences', preferenceName });
        return true;
    } catch (error) {
        window.Logger?.error('Error saving preference', { page: 'preferences', preferenceName, error: error?.message || error });
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
        window.Logger?.debug('Saving multiple preferences', { page: 'preferences', preferences, userId, profileId });

        const result = await window.PreferencesData.savePreferences({
            preferences,
            userId,
            profileId,
        });

        window.Logger?.debug('Saved multiple preferences', { page: 'preferences', result });
        window.preferencesCache.clear();
        return result;
    } catch (error) {
        window.Logger?.error('Error saving multiple preferences', { page: 'preferences', error: error?.message || error });
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
        window.Logger?.debug('Getting user profiles', { page: 'preferences', userId });

        const result = await window.PreferencesData.loadProfiles({ userId });
        window.Logger?.debug('Retrieved user profiles', { page: 'preferences', profiles: result.profiles });
        return result.profiles || [];
    } catch (error) {
        window.Logger?.error('Error getting user profiles', { page: 'preferences', userId, error: error?.message || error });
        throw error;
    }
};

// ===== UTILITY FUNCTIONS =====

/**
 * מחיקת מטמון העדפות
 */
window.clearPreferencesCache = function() {
    window.Logger?.debug('Clearing preferences cache', { page: 'preferences' });
    window.preferencesCache.clear();
};

/**
 * בדיקת תקינות השירות
 * @returns {Promise<boolean>} - האם השירות תקין
 */
window.checkPreferencesServiceHealth = async function() {
    try {
        window.Logger?.debug('Checking preferences service health', { page: 'preferences' });
        const health = await window.PreferencesData.checkHealth();
        window.Logger?.debug('Preferences service is healthy', { page: 'preferences', health });
        return true;
    } catch (error) {
        window.Logger?.error('Error checking preferences service health', { page: 'preferences', error: error?.message || error });
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
        window.Logger?.debug('Getting preference info', { page: 'preferences', preferenceName });
        const info = await window.PreferencesData.loadPreferenceInfo(preferenceName);
        window.Logger?.debug('Retrieved preference info', { page: 'preferences', preferenceName, info });
        return info;
    } catch (error) {
        window.Logger?.error('Error getting preference info', { page: 'preferences', preferenceName, error: error?.message || error });
        throw error;
    }
};

// ===== LEGACY COMPATIBILITY =====

/**
 * טעינת העדפות (תואם למערכת הישנה)
 * @returns {Promise<boolean>} - האם הטעינה הצליחה
 */
window.loadPreferences = async function(userId = 1, profileId = null) {
    try {
        window.Logger?.debug('Loading preferences from system', { page: 'preferences', userId, profileId });
        
        // Clear cache to ensure fresh data
        if (window.preferencesCache && window.preferencesCache.clear) {
            window.Logger?.debug('Clearing preferences cache before loading', { page: 'preferences' });
            window.preferencesCache.clear();
        }
        
        // אם לא צוין profileId, נטען את הפרופיל הפעיל
        if (!profileId) {
            const profiles = await window.getUserProfiles(userId);
            const activeProfile = profiles.find(p => p.active);
            if (activeProfile) {
                profileId = activeProfile.id;
                window.Logger?.debug('Using active profile', { page: 'preferences', profileName: activeProfile.name, profileId });
            }
        }
        
        const preferences = await window.getAllUserPreferences(userId, profileId);
        
        // Apply preferences to form - update all fields
        window.Logger?.debug('Applying preferences to form', { page: 'preferences' });
        
        // Update all form fields
        Object.keys(preferences).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                const value = preferences[key];
                
                if (element.type === 'checkbox') {
                    // Handle boolean values that might come as strings
                    const boolValue = (value === true || value === 'true' || value === '1' || value === 1);
                    element.checked = boolValue;
                } else if (element.type === 'number') {
                    element.value = parseFloat(value) || 0;
                } else if (element.type === 'color') {
                    element.value = value || '#000000';
                } else if (element.tagName === 'SELECT') {
                    element.value = value || '';
                } else {
                    element.value = value || '';
                }
                
                window.Logger?.debug('Updated preference field', { page: 'preferences', key, value, type: element.type || element.tagName });
            } else {
                window.Logger?.warn('Element not found for preference', { page: 'preferences', key });
            }
        });
        
        window.Logger?.debug('All form fields updated successfully', { page: 'preferences' });
        
        // Return preferences data
        return {
            success: true,
            data: preferences
        };
    } catch (error) {
        window.Logger?.error('Error loading preferences', { page: 'preferences', userId, profileId, error: error?.message || error });
        
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
        window.Logger?.debug('Saving all preferences to system', { page: 'preferences' });
        
        // Collect form data (if function exists)
        if (typeof window.collectFormData === 'function') {
            const formData = window.collectFormData();
            await window.savePreferences(formData);
            
            // Preferences saved successfully
            
            return true;
    } else {
            window.Logger?.warn('collectFormData function not found', { page: 'preferences' });
            return false;
        }
    } catch (error) {
        window.Logger?.error('Error saving preferences', { page: 'preferences', error: error?.message || error });
        
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
        window.Logger?.debug('Initializing Preferences System', { page: 'preferences' });

        // נטען אך ורק דרך המערכת החדשה
        if (!window.PreferencesUI || typeof window.PreferencesUI.loadAllPreferences !== 'function') {
            window.Logger?.error('PreferencesUI is not available - cannot initialize preferences system without the new flow', { page: 'preferences' });
            return false;
        }
        await window.PreferencesUI.loadAllPreferences();
        window.Logger?.debug('Preferences System initialized via PreferencesUI (no fallback)', { page: 'preferences' });
        return true;
    } catch (error) {
        window.Logger?.error('Error initializing Preferences System', { page: 'preferences', error: error?.message || error });
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
        window.Logger?.debug('Resetting all preferences to defaults', { page: 'preferences' });
        
        const currentPreferences = await window.getAllUserPreferences();
        
        const { types: preferenceTypes = [] } = await window.PreferencesData.loadPreferenceTypes({ force: true });
        
        // יצירת אובייקט עם ברירות מחדל
        const defaultPreferences = {};
        preferenceTypes.forEach(pref => {
            if (pref.default_value !== null) {
                defaultPreferences[pref.preference_name] = pref.default_value;
            }
        });
        
        const saveResult = await window.savePreferences(defaultPreferences);
        if (saveResult?.success !== false) {
            window.Logger?.debug('All preferences reset to defaults successfully', { page: 'preferences' });
            
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
        window.Logger?.error('Error resetting preferences to defaults', { page: 'preferences', error: error?.message || error });
        
        if (typeof showNotification === 'function') {
            showNotification('שגיאה באיפוס ההעדפות: ' + error.message, 'error');
        } else {
            alert('שגיאה באיפוס ההעדפות: ' + error.message);
        }
        
        return false;
    }
};

// ===== PROFILE MANAGEMENT =====

/**
 * טעינת פרופילים לרשימה הנפתחת
 */
window.loadProfilesToDropdown = async function() {
    try {
        window.Logger?.debug('Loading profiles to dropdown', { page: 'preferences' });
        
        const profiles = await window.getUserProfiles();
        const profileSelect = document.getElementById('profileSelect');
        
        if (!profileSelect) {
            window.Logger?.warn('Profile select element not found', { page: 'preferences' });
            return false;
        }
        
        // נקה את הרשימה
        profileSelect.innerHTML = '';
        
        if (profiles && profiles.length > 0) {
            profiles.forEach(profile => {
                const option = document.createElement('option');
                option.value = profile.name;
                option.textContent = profile.name;
                if (profile.active) {
                    option.selected = true;
                }
                profileSelect.appendChild(option);
            });
            
            window.Logger?.debug('Loaded profiles to dropdown', { page: 'preferences', count: profiles.length });
            return true;
        } else {
            // הוסף אפשרות ברירת מחדל
            const defaultOption = document.createElement('option');
            defaultOption.value = 'ברירת מחדל';
            defaultOption.textContent = 'ברירת מחדל';
            defaultOption.selected = true;
            profileSelect.appendChild(defaultOption);
            
            window.Logger?.debug('Added default profile option', { page: 'preferences' });
            return true;
    }
    
  } catch (error) {
        window.Logger?.error('Error loading profiles to dropdown', { page: 'preferences', error: error?.message || error });
        return false;
    }
};

/**
 * טעינת פרופיל
 * @deprecated Use PreferencesData.loadProfiles() and PreferencesUI.loadAllPreferences() instead
 * @function loadProfile
 * @returns {Promise<boolean>} Success status
 */
window.loadProfile = async function() {
    try {
        window.Logger?.debug('Loading profile', { page: 'preferences' });
        
        // טען פרופילים לרשימה הנפתחת
        await window.loadProfilesToDropdown();
        
        // קבלת פרופיל נבחר
        const profileSelect = document.getElementById('profileSelect');
        if (!profileSelect) {
            throw new Error('Profile select element not found');
        }
        
        const selectedProfile = profileSelect.value;
        if (!selectedProfile || selectedProfile === 'ברירת מחדל') {
            // טעינת פרופיל ברירת מחדל
            await window.loadPreferences();
            window.Logger?.debug('Default profile loaded', { page: 'preferences' });
    } else {
            // טעינת פרופיל ספציפי
            const profiles = await window.getUserProfiles();
            const profile = profiles.find(p => p.name === selectedProfile);
            
            if (profile) {
                await window.loadPreferences(1, profile.id);
                window.Logger?.debug('Profile loaded', { page: 'preferences', profileName: selectedProfile });
            } else {
                throw new Error(`Profile not found: ${selectedProfile}`);
            }
        }
        
        // הצגת הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('פרופיל נטען בהצלחה!');
    }
    
        return true;
        
  } catch (error) {
        window.Logger?.error('Error loading profile', { page: 'preferences', error: error?.message || error });
    if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בטעינת פרופיל: ' + error.message);
        }
        return false;
    }
};

/**
 * החלפת פרופיל פעיל
 * @deprecated Use PreferencesData.activateProfile() instead
 * @function switchProfile
 * @param {number} profileId - Profile ID
 * @returns {Promise<boolean>} Success status
 */
window.switchProfile = async function(profileId) {
    try {
        window.Logger?.debug('Switching to profile', { page: 'preferences', profileId });
        await window.PreferencesData.activateProfile({ profileId, userId: 1 });

        window.preferencesCache.clear();
        await window.loadPreferences();

        window.Logger?.debug('Profile switched successfully', { page: 'preferences', profileId });
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('פרופיל הוחלף בהצלחה!');
        }

        return true;
        
  } catch (error) {
        window.Logger?.error('Error switching profile', { page: 'preferences', profileId, error: error?.message || error });
    if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בהחלפת פרופיל: ' + error.message);
        }
        return false;
    }
};

/**
 * שמירת העדפות נוכחיות כפרופיל פעיל
 * @deprecated Use PreferencesUI.saveAllPreferences() instead
 * @function saveAsActiveProfile
 * @returns {Promise<boolean>} - האם השמירה הצליחה
 */
window.saveAsActiveProfile = async function() {
    try {
        window.Logger?.debug('Saving current preferences as active profile', { page: 'preferences' });
        
        // Collect form data
        if (typeof window.collectFormData === 'function') {
            window.Logger?.debug('Calling collectFormData', { page: 'preferences' });
            const formData = window.collectFormData();
            
            if (Object.keys(formData).length === 0) {
                window.Logger?.warn('No form data to save', { page: 'preferences' });
                if (typeof window.showWarningNotification === 'function') {
                    window.showWarningNotification('אזהרה', 'אין העדפות לשמירה');
                }
                return false;
            }
            
            // Get current active profile
            window.Logger?.debug('Getting user profiles', { page: 'preferences' });
            const profiles = await window.getUserProfiles();
            window.Logger?.debug('Available profiles', { page: 'preferences', profiles });
            
            const activeProfile = profiles.find(p => p.active);
            window.Logger?.debug('Active profile', { page: 'preferences', activeProfile });
            
            if (!activeProfile) {
                throw new Error('No active profile found');
            }
            
            window.Logger?.debug('Saving to active profile', { page: 'preferences', profileName: activeProfile.name, profileId: activeProfile.id });
            
            // Save preferences to active profile
            if (typeof window.savePreferences === 'function') {
                window.Logger?.debug('Calling savePreferences', { page: 'preferences' });
                const result = await window.savePreferences(formData, 1, activeProfile.id);
                window.Logger?.debug('Save result', { page: 'preferences', result });
                
                if (result) {
                    window.Logger?.debug('Preferences saved to active profile successfully', { page: 'preferences', profileName: activeProfile.name });
                    
                    // Show success notification
                    if (typeof window.showSuccessNotification === 'function') {
                        window.showSuccessNotification('הצלחה', `העדפות נשמרו לפרופיל: ${activeProfile.name}`);
                    }
                    
                    // Clear cache manually to ensure fresh data
                    if (window.preferencesCache && window.preferencesCache.clear) {
                        window.Logger?.debug('Clearing preferences cache manually', { page: 'preferences' });
                        window.preferencesCache.clear();
                    }
                    
                    // Reload preferences to update form
                    if (typeof window.loadPreferences === 'function') {
                        window.Logger?.debug('Reloading preferences to update form', { page: 'preferences' });
                        await window.loadPreferences(1, activeProfile.id);
                    }
                    
                    // Reload colors to update color pickers
                    if (typeof window.loadColorsForPreferences === 'function') {
                        window.Logger?.debug('Reloading colors to update color pickers', { page: 'preferences' });
                        await window.loadColorsForPreferences();
                    }
                    
                    return true;
                }
            } else {
                window.Logger?.error('window.savePreferences function not available', { page: 'preferences' });
            }
        } else {
            window.Logger?.error('window.collectFormData function not available', { page: 'preferences' });
        }
        
        throw new Error('Failed to save preferences');
        
    } catch (error) {
        window.Logger?.error('Error saving preferences to active profile', { page: 'preferences', error: error?.message || error });
        
        // Show error notification
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'שגיאה בשמירת העדפות: ' + error.message);
        }
        
        return false;
    }
};

// ===== AUTO-INITIALIZATION =====
// NOTE:
// Auto-initialization is now managed by the unified app initializer and, on the
// preferences page itself, by the V4 flow (PreferencesUIV4).
// To prevent double initialization and noisy errors, this legacy
// DOMContentLoaded handler has been removed. The functions in this file remain
// available for backward-compatible callers.

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
