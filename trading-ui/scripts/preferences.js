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
            
            return {
                success: true,
                data: {
                    preferences: preferences
                }
            };
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
        console.log(`🔍 Getting all user preferences for user ${userId}, profile: ${profileId || 'active'}`);
        
        // בדיקת מטמון - רק אם לא ביקשנו טעינה מחדש
        const cached = window.preferencesCache.get();
        if (cached && Object.keys(cached).length > 0) {
            console.log(`✅ All preferences found in cache`);
            return cached;
        }
        
        console.log(`🔄 Cache is empty, fetching fresh data from server...`);
        
        // שאילתה לשרת
        let url = `/api/v1/preferences/user?user_id=${userId}`;
        if (profileId) {
            url += `&profile_id=${profileId}`;
        }
        
        console.log(`🔍 Fetching from URL: ${url}`);
        
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
            const result = await response.json();
            
            if (result.success) {
                console.log(`✅ Saved multiple preferences:`, result);
                
                // עדכון מטמון - נקה מטמון כדי לטעון מחדש מהשרת
                window.preferencesCache.clear();
                
                return true;
      } else {
                throw new Error(`API returned success: false - ${result.message || 'Unknown error'}`);
            }
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
window.loadPreferences = async function(userId = 1, profileId = null) {
    try {
        console.log(`📂 Loading preferences from system... (user: ${userId}, profile: ${profileId})`);
        
        // Clear cache to ensure fresh data
        if (window.preferencesCache && window.preferencesCache.clear) {
            console.log('🗑️ Clearing preferences cache before loading...');
            window.preferencesCache.clear();
        }
        
        // אם לא צוין profileId, נטען את הפרופיל הפעיל
        if (!profileId) {
            const profiles = await window.getUserProfiles(userId);
            const activeProfile = profiles.find(p => p.active);
            if (activeProfile) {
                profileId = activeProfile.id;
                console.log(`📂 Using active profile: ${activeProfile.name} (ID: ${profileId})`);
            }
        }
        
        const preferences = await window.getAllUserPreferences(userId, profileId);
        
        // Apply preferences to form - update all fields
        console.log('🎯 Applying preferences to form...');
        
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
                
                console.log(`🎯 Updated ${key} = ${value} (type: ${element.type || element.tagName})`);
            } else {
                console.warn(`⚠️ Element not found for preference: ${key}`);
            }
        });
        
        console.log('✅ All form fields updated successfully');
        
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

// ===== PROFILE MANAGEMENT =====

/**
 * טעינת פרופילים לרשימה הנפתחת
 */
window.loadProfilesToDropdown = async function() {
    try {
        console.log('📂 Loading profiles to dropdown...');
        
        const profiles = await window.getUserProfiles();
        const profileSelect = document.getElementById('profileSelect');
        
        if (!profileSelect) {
            console.warn('⚠️ Profile select element not found');
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
            
            console.log(`✅ Loaded ${profiles.length} profiles to dropdown`);
            return true;
        } else {
            // הוסף אפשרות ברירת מחדל
            const defaultOption = document.createElement('option');
            defaultOption.value = 'ברירת מחדל';
            defaultOption.textContent = 'ברירת מחדל';
            defaultOption.selected = true;
            profileSelect.appendChild(defaultOption);
            
            console.log('✅ Added default profile option');
            return true;
    }
    
  } catch (error) {
        console.error('❌ Error loading profiles to dropdown:', error);
        return false;
    }
};

/**
 * טעינת פרופיל
 */
window.loadProfile = async function() {
    try {
        console.log('📂 Loading profile...');
        
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
            console.log('✅ Default profile loaded');
    } else {
            // טעינת פרופיל ספציפי
            const profiles = await window.getUserProfiles();
            const profile = profiles.find(p => p.name === selectedProfile);
            
            if (profile) {
                await window.loadPreferences(1, profile.id);
                console.log(`✅ Profile loaded: ${selectedProfile}`);
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
        console.error('❌ Error loading profile:', error);
    if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בטעינת פרופיל: ' + error.message);
        }
        return false;
    }
};

/**
 * החלפת פרופיל פעיל
 */
window.switchProfile = async function(profileId) {
    try {
        console.log(`🔄 Switching to profile: ${profileId}`);
        
        // עדכון פרופיל פעיל בשרת
        const response = await fetch('/api/v1/preferences/profiles/activate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: 1,
                profile_id: profileId
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                // נקה מטמון וטען מחדש
                window.preferencesCache.clear();
                await window.loadPreferences();
                
                console.log('✅ Profile switched successfully');
      if (typeof window.showSuccessNotification === 'function') {
                    window.showSuccessNotification('פרופיל הוחלף בהצלחה!');
                }
                
                return true;
            }
        }
        
        throw new Error('Failed to switch profile');
        
  } catch (error) {
        console.error('❌ Error switching profile:', error);
    if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בהחלפת פרופיל: ' + error.message);
        }
        return false;
    }
};

/**
 * שמירת העדפות נוכחיות כפרופיל פעיל
 * @returns {Promise<boolean>} - האם השמירה הצליחה
 */
window.saveAsActiveProfile = async function() {
    try {
        console.log('💾 Saving current preferences as active profile...');
        
        // Collect form data
        if (typeof window.collectFormData === 'function') {
            console.log('📋 Calling collectFormData...');
            const formData = window.collectFormData();
            
            if (Object.keys(formData).length === 0) {
                console.warn('⚠️ No form data to save');
                if (typeof window.showWarningNotification === 'function') {
                    window.showWarningNotification('אזהרה', 'אין העדפות לשמירה');
                }
                return false;
            }
            
            // Get current active profile
            console.log('👤 Getting user profiles...');
            const profiles = await window.getUserProfiles();
            console.log('👤 Available profiles:', profiles);
            
            const activeProfile = profiles.find(p => p.active);
            console.log('👤 Active profile:', activeProfile);
            
            if (!activeProfile) {
                throw new Error('No active profile found');
            }
            
            console.log(`💾 Saving to active profile: ${activeProfile.name} (ID: ${activeProfile.id})`);
            
            // Save preferences to active profile
            if (typeof window.savePreferences === 'function') {
                console.log('💾 Calling savePreferences...');
                const result = await window.savePreferences(formData, 1, activeProfile.id);
                console.log('💾 Save result:', result);
                
                if (result) {
                    console.log('✅ Preferences saved to active profile successfully');
                    
                    // Show success notification
                    if (typeof window.showSuccessNotification === 'function') {
                        window.showSuccessNotification('הצלחה', `העדפות נשמרו לפרופיל: ${activeProfile.name}`);
                    }
                    
                    // Clear cache manually to ensure fresh data
                    if (window.preferencesCache && window.preferencesCache.clear) {
                        console.log('🗑️ Clearing preferences cache manually...');
                        window.preferencesCache.clear();
                    }
                    
                    // Reload preferences to update form
                    if (typeof window.loadPreferences === 'function') {
                        console.log('🔄 Reloading preferences to update form...');
                        await window.loadPreferences(1, activeProfile.id);
                    }
                    
                    // Reload colors to update color pickers
                    if (typeof window.loadColorsForPreferences === 'function') {
                        console.log('🎨 Reloading colors to update color pickers...');
                        await window.loadColorsForPreferences();
                    }
                    
                    return true;
                }
            } else {
                console.error('❌ window.savePreferences function not available');
            }
        } else {
            console.error('❌ window.collectFormData function not available');
        }
        
        throw new Error('Failed to save preferences');
        
    } catch (error) {
        console.error('❌ Error saving preferences to active profile:', error);
        
        // Show error notification
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'שגיאה בשמירת העדפות: ' + error.message);
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
