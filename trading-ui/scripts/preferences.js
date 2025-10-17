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

// Global preferences cache - Now using UnifiedCacheManager directly

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
        return size || 25; // ברירת מחדל: 25 רשומות לעמוד
    } catch (error) {
        console.warn('Failed to get pagination size preference, using default:', error);
        return 25;
    }
};

/**
 * שמירת העדפת גודל עמוד לטבלאות
 * @param {string} tableType - סוג הטבלה
 * @param {number} size - מספר רשומות לעמוד
 * @returns {Promise<boolean>} - האם השמירה הצליחה
 */
window.setPaginationSize = async function(tableType = 'default', size = 25) {
    try {
        const preferenceName = `pagination_size_${tableType}`;
        return await window.savePreference(preferenceName, size);
    } catch (error) {
        console.error('Failed to set pagination size preference:', error);
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
window.getPreference = async function(preferenceName, userId = null, profileId = null) {
    try {
        // קבלת המשתמש הפעיל אם לא סופק
        // כרגע יש רק משתמש אחד - נימרוד (ID: 1)
        if (!userId) {
            if (typeof window.TikTrackAuth !== 'undefined' && window.TikTrackAuth.getCurrentUser) {
                const currentUser = window.TikTrackAuth.getCurrentUser();
                userId = currentUser ? currentUser.id : 1; // נימרוד - המשתמש היחיד
            } else {
                userId = 1; // נימרוד - המשתמש היחיד במערכת
            }
        }
        
        console.log(`🔍 Getting preference: ${preferenceName} for user: ${userId}`);
        
        // בדיקת מטמון
        if (window.UnifiedCacheManager) {
            const cached = await window.UnifiedCacheManager.get('user-preferences');
            if (cached && cached[preferenceName] !== undefined) {
                console.log(`✅ Cache hit for ${preferenceName}:`, cached[preferenceName]);
                return cached[preferenceName];
            }
        }
        
        // שאילתה לשרת
        let url = `/api/preferences/user/single?preference_name=${preferenceName}&user_id=${userId}`;
        if (profileId) {
            url += `&profile_id=${profileId}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
            const result = await response.json();
            const value = result.data?.value;
            
            console.log(`✅ Retrieved ${preferenceName}:`, value);
            
            // עדכון מטמון רק אם זמין
            if (window.UnifiedCacheManager) {
                try {
                    const cached = await window.UnifiedCacheManager.get('user-preferences') || {};
                    cached[preferenceName] = value;
                    await window.UnifiedCacheManager.save('user-preferences', cached, {
                        syncToBackend: true
                    });
                } catch (cacheError) {
                    console.warn('⚠️ Could not update preferences cache:', cacheError.message);
                }
            }
            
            return value;
      } else if (response.status === 500) {
            // No dummy data - show clear message when preference is missing
            console.log(`⚠️ Preference ${preferenceName} not found in database - returning null`);
            return null;
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
        if (window.UnifiedCacheManager) {
            const cached = await window.UnifiedCacheManager.get('user-preferences');
            if (cached && cached[`group_${groupName}`]) {
                console.log(`✅ Cache hit for group ${groupName}`);
                return cached[`group_${groupName}`];
            }
        }
        
        // שאילתה לשרת
        let url = `/api/preferences/user/group?group=${groupName}&user_id=${userId}`;
        if (profileId) {
            url += `&profile_id=${profileId}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
            const result = await response.json();
            const preferences = result.data?.preferences || {};
            
            console.log(`✅ Retrieved group ${groupName}:`, preferences);
            
            // עדכון מטמון
            if (window.UnifiedCacheManager) {
                try {
                    const cached = await window.UnifiedCacheManager.get('user-preferences') || {};
                    cached[`group_${groupName}`] = preferences;
                    await window.UnifiedCacheManager.save('user-preferences', cached, {
                        syncToBackend: true
                    });
                } catch (cacheError) {
                    console.warn('⚠️ Could not update preferences cache:', cacheError.message);
                }
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
window.getPreferencesByNames = async function(preferenceNames, userId = null, profileId = null) {
    try {
        // קבלת המשתמש הפעיל אם לא סופק
        // כרגע יש רק משתמש אחד - נימרוד (ID: 1)
        if (!userId) {
            if (typeof window.TikTrackAuth !== 'undefined' && window.TikTrackAuth.getCurrentUser) {
                const currentUser = window.TikTrackAuth.getCurrentUser();
                userId = currentUser ? currentUser.id : 1; // נימרוד - המשתמש היחיד
            } else {
                userId = 1; // נימרוד - המשתמש היחיד במערכת
            }
        }
        
        console.log(`🔍 Getting multiple preferences:`, preferenceNames, `for user: ${userId}`);
        
        // בדיקת מטמון
        let cached = null;
        if (window.UnifiedCacheManager) {
            cached = await window.UnifiedCacheManager.get('user-preferences');
        }
        const missingFromCache = preferenceNames.filter(name => !cached || cached[name] === undefined);
        
        if (missingFromCache.length === 0 && cached) {
            console.log(`✅ All preferences found in cache`);
            return preferenceNames.reduce((result, name) => {
                result[name] = cached[name];
                return result;
            }, {});
        }
        
        // שאילתה לשרת
        const response = await fetch('/api/preferences/user/multiple', {
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
            if (window.UnifiedCacheManager) {
                try {
                    const cached = await window.UnifiedCacheManager.get('user-preferences') || {};
                    Object.assign(cached, preferences);
                    await window.UnifiedCacheManager.save('user-preferences', cached, {
                        syncToBackend: true
                    });
                } catch (cacheError) {
                    console.warn('⚠️ Could not update preferences cache:', cacheError.message);
                }
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
        if (window.UnifiedCacheManager) {
            const cached = await window.UnifiedCacheManager.get('user-preferences');
            if (cached && Object.keys(cached).length > 0) {
                console.log(`✅ All preferences found in cache`);
                return cached;
            }
        }
        
        console.log(`🔄 Cache is empty, fetching fresh data from server...`);
        
        // שאילתה לשרת
        let url = `/api/preferences/user?user_id=${userId}`;
        if (profileId) {
            url += `&profile_id=${profileId}`;
        }
        
        console.log(`🔍 Fetching from URL: ${url}`);
        
        const response = await fetch(url);
        if (response.ok) {
            const result = await response.json();
            const preferences = result.data?.preferences || {};
            const serverProfileId = result.data?.profile_id;
            
            console.log(`✅ Retrieved all preferences:`, preferences);
            console.log(`📂 Server returned profile_id: ${serverProfileId}`);

            // עדכון מטמון
            if (window.UnifiedCacheManager) {
                try {
                    await window.UnifiedCacheManager.save('user-preferences', preferences, {
                        syncToBackend: true
                    });
                } catch (cacheError) {
                    console.warn('⚠️ Could not update preferences cache:', cacheError.message);
                }
            }
            
            // אם השרת החזיר profile_id, נשתמש בו
            if (serverProfileId && !profileId) {
                console.log(`📂 Using server profile_id: ${serverProfileId}`);
                profileId = serverProfileId;
                
                // עדכון ה-dropdown עם הפרופיל שהשרת החזיר
                const profiles = await window.getUserProfiles(userId);
                const serverProfile = profiles.find(p => p.id === serverProfileId);
                if (serverProfile) {
                    const profileSelect = document.getElementById('profileSelect');
                    if (profileSelect) {
                        profileSelect.value = serverProfile.name;
                        console.log(`📋 Updated dropdown to server profile: ${serverProfile.name}`);
                    }
                    
                    // עדכון activeProfileInfo
                    const activeProfileInfo = document.getElementById('activeProfileInfo');
                    if (activeProfileInfo) {
                        activeProfileInfo.textContent = serverProfile.name;
                        console.log(`📊 Updated active profile info to: ${serverProfile.name}`);
                    }
                }
            }

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
        
        const response = await fetch('/api/preferences/user/single', {
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
            if (window.UnifiedCacheManager) {
                try {
                    const cached = await window.UnifiedCacheManager.get('user-preferences') || {};
                    cached[preferenceName] = value;
                    await window.UnifiedCacheManager.save('user-preferences', cached, {
                        syncToBackend: true
                    });
                } catch (cacheError) {
                    console.warn('⚠️ Could not update preferences cache:', cacheError.message);
                }
            }
            
            // סינכרון עם Backend Cache
            if (window.CacheSyncManager) {
                try {
                    await window.CacheSyncManager.invalidate(['preferences', 'user_preferences']);
                } catch (syncError) {
                    console.warn('⚠️ Could not sync cache with backend:', syncError.message);
                }
            }
            
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
      
      const response = await fetch('/api/preferences/user', {
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
            
            if (result.success || result.data) {
                console.log(`✅ Saved multiple preferences:`, result);
                
                // עדכון מטמון - נקה מטמון כדי לטעון מחדש מהשרת
                if (window.UnifiedCacheManager) {
                    try {
                        await window.UnifiedCacheManager.remove('user-preferences');
                    } catch (cacheError) {
                        console.warn('⚠️ Could not clear preferences cache:', cacheError.message);
                    }
                }
                
                // סינכרון עם Backend Cache
                if (window.CacheSyncManager) {
                    try {
                        await window.CacheSyncManager.invalidate(['preferences', 'user_preferences']);
                    } catch (syncError) {
                        console.warn('⚠️ Could not sync cache with backend:', syncError.message);
                    }
                }
                
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
        
        const response = await fetch(`/api/preferences/profiles?user_id=${userId}`);
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
window.clearPreferencesCache = async function() {
    console.log(`🗑️ Clearing preferences cache`);
    if (window.UnifiedCacheManager) {
        try {
            await window.UnifiedCacheManager.remove('user-preferences');
        } catch (cacheError) {
            console.warn('⚠️ Could not clear preferences cache:', cacheError.message);
        }
    }
};

/**
 * בדיקת תקינות השירות
 * @returns {Promise<boolean>} - האם השירות תקין
 */
window.checkPreferencesServiceHealth = async function() {
    try {
        console.log(`🔍 Checking preferences service health`);
        
        const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
        const response = await fetch(`${base}/api/preferences/health`);
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
        
        const response = await fetch(`/api/preferences/info/${preferenceName}`);
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
        if (window.UnifiedCacheManager) {
            console.log('🗑️ Clearing preferences cache before loading...');
            try {
                await window.UnifiedCacheManager.remove('user-preferences');
            } catch (cacheError) {
                console.warn('⚠️ Could not clear preferences cache:', cacheError.message);
            }
        }
        
        // אם לא צוין profileId, נטען את הפרופיל הפעיל
        if (!profileId) {
            const profiles = await window.getUserProfiles(userId);
            const activeProfile = profiles.find(p => p.active);
            if (activeProfile) {
                profileId = activeProfile.id;
                console.log(`📂 Using active profile: ${activeProfile.name} (ID: ${profileId})`);
                
                // Update dropdown to show the active profile
                const profileSelect = document.getElementById('profileSelect');
                if (profileSelect) {
                    profileSelect.value = activeProfile.name;
                    console.log(`📋 Set dropdown to active profile: ${activeProfile.name}`);
                }
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
 * טעינת כל ההעדפות לעמוד
 * @returns {Promise<boolean>} - האם הטעינה הצליחה
 */
window.loadAllPreferences = async function() {
    try {
        console.log('📥 Loading all preferences to page...');
        
        // Load preferences from server
        const preferences = await window.getAllUserPreferences();
        
        if (preferences) {
            // Populate form fields with loaded preferences
            await window.populatePreferencesForm(preferences);
            
            // Update UI counters
            window.updatePreferencesCounters(preferences);
            
            // Load profiles to dropdown to ensure sync
            await window.loadProfilesToDropdown();
            
            console.log('✅ All preferences loaded successfully');
            return true;
        } else {
            console.warn('⚠️ No preferences loaded');
            return false;
        }
    } catch (error) {
        console.error('❌ Error loading preferences:', error);
        return false;
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
            const result = await window.savePreferences(formData);
            
            if (result) {
                // Preferences saved successfully - show notification
                if (typeof window.showSuccessNotification === 'function') {
                    window.showSuccessNotification('העדפות נשמרו בהצלחה!', 'כל ההעדפות נשמרו במערכת');
                } else if (typeof window.showNotification === 'function') {
                    window.showNotification('העדפות נשמרו בהצלחה!', 'success');
                }
                console.log('✅ All preferences saved successfully');
                return true;
            } else {
                throw new Error('Failed to save preferences');
            }
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
        await window.loadAllPreferences();
        
        // התחלת מערכת polling אוטומטית
        window.startPreferencesPolling();
      
        console.log('✅ Preferences System initialized successfully');
      return true;
    } catch (error) {
        console.error('❌ Error initializing Preferences System:', error);
      return false;
    }
};

// ===== POLLING SYSTEM =====

/**
 * מערכת polling אוטומטית להעדפות
 * מתחברת לשרת כל 30 שניות לעדכון אוטומטי
 */
window.preferencesPollingInterval = null;
window.preferencesPollingEnabled = true;

window.startPreferencesPolling = function() {
    try {
        console.log('🔄 Starting preferences polling system...');
        
        // עצירת polling קיים אם קיים
        window.stopPreferencesPolling();
        
        // הגדרת polling כל 30 שניות
        window.preferencesPollingInterval = setInterval(async () => {
            if (!window.preferencesPollingEnabled) {
                return;
            }
            
            try {
                console.log('🔄 Polling preferences for updates...');
                
                // בדיקה אם יש עדכונים חדשים
                const hasUpdates = await window.checkForPreferencesUpdates();
                
                if (hasUpdates) {
                    console.log('📥 New preferences updates found, refreshing...');
                    await window.loadAllPreferences();
                }
                
            } catch (error) {
                console.error('❌ Error during preferences polling:', error);
                // לא עוצרים את ה-polling בגלל שגיאה אחת
            }
        }, 30000); // 30 שניות
        
        console.log('✅ Preferences polling started (30s interval)');
        
    } catch (error) {
        console.error('❌ Error starting preferences polling:', error);
    }
};

window.stopPreferencesPolling = function() {
    if (window.preferencesPollingInterval) {
        clearInterval(window.preferencesPollingInterval);
        window.preferencesPollingInterval = null;
        console.log('⏹️ Preferences polling stopped');
    }
};

window.checkForPreferencesUpdates = async function() {
    try {
        // בדיקה פשוטה - האם יש שינויים בהעדפות
        // נשתמש ב-API של preferences עם timestamp
        const response = await fetch('/api/preferences/user/check-updates?user_id=1');
        
        if (response.ok) {
            const data = await response.json();
            return data.hasUpdates || false;
        }
        
        return false;
        
    } catch (error) {
        console.error('❌ Error checking for preferences updates:', error);
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
        const response = await fetch('/api/preferences/admin/types');
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
        if (saveResult) {
            console.log('✅ All preferences reset to defaults successfully');
            
            // Show success notification before page reload
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('העדפות אופסו לברירות מחדל!', 'הדף ירענן בעוד רגע');
            } else if (typeof window.showNotification === 'function') {
                window.showNotification('העדפות אופסו לברירות מחדל!', 'success');
            }
            
            // רענון הדף
            setTimeout(() => {
                window.location.reload();
            }, 2000); // Increased delay to show notification
            
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
            
            // עדכון ה-dropdown עם הערך הנוכחי אם הוא כבר מוגדר
            const currentValue = profileSelect.value;
            if (currentValue) {
                profileSelect.value = currentValue;
                console.log(`📋 Preserved dropdown value: ${currentValue}`);
            }
            
            console.log(`✅ Loaded ${profiles.length} profiles to dropdown`);
            
            // עדכון הסטטיסטיקה - פרופיל פעיל (רק אם לא עודכן כבר)
            const activeProfile = profiles.find(p => p.active);
            const activeProfileInfo = document.getElementById('activeProfileInfo');
            if (activeProfileInfo && activeProfile && !activeProfileInfo.textContent) {
                activeProfileInfo.textContent = activeProfile.name;
                console.log(`📊 Updated active profile info on initial load: ${activeProfile.name}`);
            }
            
            return true;
        } else {
            // הוסף אפשרות ברירת מחדל
            const defaultOption = document.createElement('option');
            defaultOption.value = 'ברירת מחדל';
            defaultOption.textContent = 'ברירת מחדל';
            defaultOption.selected = true;
            profileSelect.appendChild(defaultOption);
            
            // עדכון הסטטיסטיקה - ברירת מחדל (רק אם לא עודכן כבר)
            const activeProfileInfo = document.getElementById('activeProfileInfo');
            if (activeProfileInfo && !activeProfileInfo.textContent) {
                activeProfileInfo.textContent = 'ברירת מחדל';
                console.log(`📊 Updated active profile info on initial load: ברירת מחדל`);
            }
            
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
        
        // Profiles are loaded automatically by loadAllPreferences, no need to load again
        
        // קבלת פרופיל נבחר
        const profileSelect = document.getElementById('profileSelect');
        if (!profileSelect) {
            throw new Error('Profile select element not found');
        }
        
        const selectedProfile = profileSelect.value;
        if (!selectedProfile || selectedProfile === 'ברירת מחדל') {
            // Default profile is loaded automatically by loadAllPreferences
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
        
        // הסטטיסטיקה תתעדכן רק אחרי שמירה אמיתית בבסיס הנתונים
        
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
        const response = await fetch('/api/preferences/profiles/activate', {
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
            if (result.success || result.data) {
                // נקה מטמון וטען מחדש
                if (window.UnifiedCacheManager) {
                    try {
                        await window.UnifiedCacheManager.remove('user-preferences');
                    } catch (cacheError) {
                        console.warn('⚠️ Could not clear preferences cache:', cacheError.message);
                    }
                }
                // Preferences will be reloaded by the calling function
                
                console.log('✅ Profile switched successfully');
                
                // הסטטיסטיקה תתעדכן רק בפונקציה saveAsActiveProfile
                
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
            
            // Debug: Log form data to see what we're collecting
            console.log('📋 Form data collected:', formData);
            
            if (Object.keys(formData).length === 0) {
                console.warn('⚠️ No form data to save');
                if (typeof window.showWarningNotification === 'function') {
                    window.showWarningNotification('אזהרה', 'אין העדפות לשמירה');
                }
                return false;
            }
            
            // Debug: Check if profileSelect is in form data
            if (formData.profileSelect) {
                console.log('📋 Profile selection in form data:', formData.profileSelect);
            } else {
                console.warn('⚠️ Profile selection not found in form data!');
            }
            
            // Get the selected profile from dropdown (not necessarily the active one)
            console.log('👤 Getting user profiles...');
            const profiles = await window.getUserProfiles();
            console.log('👤 Available profiles:', profiles);
            
            // Debug: Check current dropdown value
            const profileSelect = document.getElementById('profileSelect');
            if (profileSelect) {
                console.log('📋 Current dropdown value:', profileSelect.value);
                console.log('📋 Current dropdown options:', Array.from(profileSelect.options).map(o => o.value));
            }
            
            const selectedProfileName = profileSelect ? profileSelect.value : null;
            console.log('👤 Selected profile from dropdown:', selectedProfileName);
            
            let targetProfile = null;
            if (!selectedProfileName || selectedProfileName === 'ברירת מחדל') {
                targetProfile = profiles.find(p => p.name === 'ברירת מחדל');
            } else {
                targetProfile = profiles.find(p => p.name === selectedProfileName);
            }
            
            if (!targetProfile) {
                throw new Error(`Profile not found: ${selectedProfileName}`);
            }
            
            console.log(`💾 Saving to selected profile: ${targetProfile.name} (ID: ${targetProfile.id})`);
            
            // Debug: Check if target profile is already active
            const currentActiveProfile = profiles.find(p => p.active);
            if (currentActiveProfile && currentActiveProfile.id === targetProfile.id) {
                console.log('⚠️ Target profile is already active, no need to switch');
                if (typeof window.showInfoNotification === 'function') {
                    window.showInfoNotification('מידע', 'הפרופיל כבר פעיל');
                }
                return true;
            }
            
            // Save preferences to selected profile
            if (typeof window.savePreferences === 'function') {
                console.log('💾 Calling savePreferences...');
                const result = await window.savePreferences(formData, 1, targetProfile.id);
                console.log('💾 Save result:', result);
                
                if (result) {
                    console.log('✅ Preferences saved to selected profile successfully');
                    
                    // Step 1: Switch active profile in database
                    console.log(`🔄 Switching active profile in database to: ${targetProfile.name} (ID: ${targetProfile.id})...`);
                    try {
                        await window.switchProfile(targetProfile.id);
                        console.log('✅ Profile switch completed successfully');
                    } catch (error) {
                        console.error('❌ Error switching profile:', error);
                        throw error;
                    }
                    
                    // Step 2: Clear all caches using global cache clearing system
                    console.log('🗑️ Clearing all caches using global system...');
                    if (window.UnifiedCacheManager) {
                        try {
                            await window.UnifiedCacheManager.remove('user-preferences');
                        } catch (cacheError) {
                            console.warn('⚠️ Could not clear preferences cache:', cacheError.message);
                        }
                    }
                    
                    // Clear other system caches if available
                    if (typeof window.clearGlobalCache === 'function') {
                        window.clearGlobalCache('preferences', 'full');
                    }
                    
                    // Clear unified cache system for preferences
                    if (window.UnifiedCacheManager) {
                        try {
                            await window.UnifiedCacheManager.clear('preferences');
                            console.log('🗑️ Cleared unified cache preferences');
                        } catch (error) {
                            console.warn('⚠️ Could not clear unified cache preferences:', error);
                        }
                    }
                    
                    // Step 3: Reload all data from database according to new active profile
                    console.log('🔄 Reloading all data from database for new active profile...');
                    
                    // Clear preferences cache before loading to ensure fresh data
                    if (window.UnifiedCacheManager) {
                        try {
                            await window.UnifiedCacheManager.remove('user-preferences');
                            console.log('🗑️ Cleared preferences cache before reload');
                        } catch (cacheError) {
                            console.warn('⚠️ Could not clear preferences cache:', cacheError.message);
                        }
                    }
                    
                    await window.loadPreferences();
                    // Colors and profiles are loaded automatically by loadPreferences
                    
                    // Ensure dropdown shows the correct selected profile
                    const profileSelect = document.getElementById('profileSelect');
                    if (profileSelect) {
                        profileSelect.value = targetProfile.name;
                        console.log(`📋 Updated dropdown selection to: ${targetProfile.name}`);
                    }
                    
                    // Step 4: Update statistics
                    const activeProfileInfo = document.getElementById('activeProfileInfo');
                    if (activeProfileInfo) {
                        activeProfileInfo.textContent = targetProfile.name;
                        console.log(`📊 Updated active profile info: ${targetProfile.name}`);
                    }
                    
                    // Show success notification
                    if (typeof window.showSuccessNotification === 'function') {
                        window.showSuccessNotification('הצלחה', `פרופיל "${targetProfile.name}" הופעל והעדפות נשמרו בהצלחה`);
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

// Note: Preferences initialization is handled by Unified App Initializer
// in page-initialization-configs.js to avoid duplication

// ===== USER PROFILES =====


// ===== COPY DETAILED LOG =====

/**
 * העתקת לוג מפורט של עמוד ההעדפות - מה המשתמש רואה
 * מבוסס על המדריך: DETAILED_LOG_SYSTEM_GUIDE.md
 */
async function copyDetailedLog() {
    try {
        console.log('🚀🚀🚀 PREFERENCES copyDetailedLog function called!');
        console.log('📋 Generating detailed log for preferences page...');
        console.log('🎯 This should be the PREFERENCES log, not system management!');
        
        const log = [];
        const timestamp = new Date().toLocaleString('he-IL');
        
        // Header - לפי המדריך
        log.push('=== לוג מפורט - עמוד העדפות TikTrack ===');
        console.log('🎯 PREFERENCES LOG: Starting to build log...');
        log.push(`זמן יצירה: ${timestamp}`);
        log.push(`עמוד: ${window.location.href}`);
        log.push('');
        
        // 1. מצב כללי של העמוד - לפי המדריך
        log.push('--- מצב כללי של העמוד ---');
        log.push(`כותרת: ${document.title}`);
        log.push(`סטטוס טעינה: ${document.readyState}`);
        
        // Page Title Info
        const pageHeader = document.querySelector('.page-header h1');
        if (pageHeader) {
            log.push(`כותרת עמוד: ${pageHeader.textContent.trim()}`);
        }
        
        // Header Info - שיפור שלי
        const header = document.getElementById('unified-header');
        if (header) {
            const navItems = header.querySelectorAll('.tiktrack-nav-item');
            log.push(`פריטי ניווט: ${navItems.length}`);
            
            // בדיקת נראות - לפי המדריך
            const visibleNavItems = Array.from(navItems).filter(item => 
                item && item.offsetParent !== null
            ).length;
            log.push(`פריטי ניווט נראים: ${visibleNavItems}`);
        } else {
            log.push('Header: לא נמצא');
        }
        log.push('');
        
        // 2. סטטיסטיקות - מה המשתמש רואה (לפי המדריך)
        log.push('--- סטטיסטיקות ---');
        const stats = [
            { id: 'preferencesCount', label: 'מספר העדפות' },
            { id: 'profilesCount', label: 'מספר פרופילים' },
            { id: 'groupsCount', label: 'מספר קבוצות' }
        ];
        
        stats.forEach(stat => {
            const element = document.getElementById(stat.id);
            const value = element ? element.textContent.trim() : '0';
            const visible = element && element.offsetParent !== null ? 'נראה' : 'לא נראה';
            log.push(`${stat.label}: ${value} (${visible})`);
        });
        
        // פרופיל פעיל - שיפור שלי
        const activeProfileElement = document.getElementById('activeProfileInfo');
        if (activeProfileElement) {
            log.push(`פרופיל נוכחי: ${activeProfileElement.textContent.trim()}`);
        }
        log.push('');
        
        // 3. מצב סקשנים - לפי המדריך עם שיפורים
        log.push('--- מצב סקשנים ---');
        const sections = document.querySelectorAll('.content-section, .top-section');
        log.push(`מספר סקשנים: ${sections.length}`);
        
        sections.forEach((section, index) => {
            const sectionId = section.id || `section-${index + 1}`;
            const sectionBody = section.querySelector('.section-body');
            const isVisible = sectionBody ? 
                sectionBody.style.display !== 'none' && !sectionBody.classList.contains('collapsed') : 
                true;
            const toggleIcon = section.querySelector('.section-toggle-icon');
            const iconText = toggleIcon ? toggleIcon.textContent.trim() : '?';
            const visible = section && section.offsetParent !== null ? 'נראה' : 'לא נראה';
            
            log.push(`  ${index + 1}. "${sectionId}": ${isVisible ? 'פתוח' : 'סגור'} (${iconText}) - ${visible}`);
        });
        log.push('');
        
        // 4. הגדרות/העדפות - לפי המדריך
        log.push('--- הגדרות בסיסיות ---');
        const basicSettings = [
            { id: 'primaryCurrency', label: 'מטבע ראשי' },
            { id: 'secondaryCurrency', label: 'מטבע משני' },
            { id: 'timezone', label: 'אזור זמן' },
            { id: 'language', label: 'שפה' }
        ];
        
        basicSettings.forEach(setting => {
            const element = document.getElementById(setting.id);
            if (element) {
                const value = element.value || element.textContent?.trim() || 'לא מוגדר';
                const visible = element.offsetParent !== null ? 'נראה' : 'לא נראה';
                log.push(`${setting.label}: ${value} (${visible})`);
            }
        });
        log.push('');
        
        // הגדרות מסחר - שיפור שלי
        log.push('--- הגדרות מסחר ---');
        const tradingSettings = [
            { id: 'maxRisk', label: 'סיכון מקסימלי' },
            { id: 'maxAccountRisk', label: 'סיכון חשבון מקסימלי' },
            { id: 'maxPositionSize', label: 'גודל פוזיציה מקסימלי' },
            { id: 'maxTradeRisk', label: 'סיכון עסקה מקסימלי' }
        ];
        
        tradingSettings.forEach(setting => {
            const element = document.getElementById(setting.id);
            if (element) {
                const value = element.value || element.textContent?.trim() || 'לא מוגדר';
                log.push(`${setting.label}: ${value}`);
            }
        });
        log.push('');
        
        // 5. Checkboxes - לפי המדריך (ללא הגבלה)
        log.push('--- הגדרות פעילות ---');
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        log.push(`מספר checkboxes: ${checkboxes.length}`);
        
        checkboxes.forEach((checkbox, index) => {
            const label = checkbox.closest('label')?.textContent?.trim() || 
                         checkbox.getAttribute('name') || 
                         `checkbox-${index + 1}`;
            const status = checkbox.checked ? 'מופעל' : 'מבוטל';
            const visible = checkbox.offsetParent !== null ? 'נראה' : 'לא נראה';
            log.push(`  ${index + 1}. ${label}: ${status} (${visible})`);
        });
        log.push('');
        
        // 6. כפתורים - לפי המדריך
        log.push('--- כפתורים ---');
        const buttonIds = ['saveAllBtn', 'resetBtn', 'toggleAllBtn'];
        buttonIds.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                const visible = btn.offsetParent !== null ? 'נראה' : 'לא נראה';
                const disabled = btn.disabled ? 'מבוטל' : 'פעיל';
                const text = btn.textContent?.trim() || btn.value || 'ללא טקסט';
                log.push(`${btnId}: ${visible} - ${disabled} - "${text}"`);
            } else {
                log.push(`${btnId}: לא קיים`);
            }
        });
        log.push('');
        
        // בחירת פרופיל - שיפור שלי
        const profileSelect = document.getElementById('profileSelect');
        if (profileSelect) {
            log.push('--- בחירת פרופיל ---');
            log.push(`פרופיל נבחר: ${profileSelect.value}`);
            const options = Array.from(profileSelect.options).map(opt => opt.text);
            log.push(`אפשרויות זמינות: ${options.join(', ')}`);
            log.push('');
        }
        
        // 6.5. צבעים - שיפור שלי
        log.push('--- צבעים ---');
        const colorFields = [
            'primaryColor', 'secondaryColor', 'successColor', 'warningColor', 'dangerColor', 'infoColor',
            'entityTradePlanColor', 'entityTradePlanColorLight', 'entityTradePlanColorDark',
            'entityTradeColor', 'entityTradeColorLight', 'entityTradeColorDark',
            'entityAlertColor', 'entityAlertColorLight', 'entityAlertColorDark',
            'entityNoteColor', 'entityNoteColorLight', 'entityNoteColorDark',
            'entityTradingAccountColor', 'entityTradingAccountColorLight', 'entityTradingAccountColorDark',
            'entityTickerColor', 'entityTickerColorLight', 'entityTickerColorDark',
            'entityExecutionColor', 'entityExecutionColorLight', 'entityExecutionColorDark',
            'entityCashFlowColor', 'entityCashFlowColorLight', 'entityCashFlowColorDark',
            'valuePositiveColor', 'valuePositiveColorLight', 'valuePositiveColorDark',
            'valueNegativeColor', 'valueNegativeColorLight', 'valueNegativeColorDark',
            'valueNeutralColor', 'valueNeutralColorLight', 'valueNeutralColorDark',
            'chartPrimaryColor', 'chartBackgroundColor', 'chartTextColor', 'chartGridColor', 'chartBorderColor', 'chartPointColor'
        ];
        
        let colorsFound = 0;
        colorFields.forEach(fieldName => {
            const colorInput = document.getElementById(fieldName);
            if (colorInput && colorInput.value) {
                log.push(`${fieldName}: ${colorInput.value}`);
                colorsFound++;
            }
        });
        
        if (colorsFound === 0) {
            log.push('⚠️ אין צבעים מוגדרים - כל השדות ריקים!');
            log.push('🔧 צריך לטעון צבעי ברירת מחדל');
        } else {
            log.push(`✅ סה"כ צבעים מוגדרים: ${colorsFound}/${colorFields.length}`);
        }
        
        // 7. סטטוס חיבור/מערכת - לפי המדריך
        log.push('--- סטטוס מערכת ---');
        try {
            const healthResponse = await fetch('/api/preferences/health');
            if (healthResponse.ok) {
                const healthData = await healthResponse.json();
                log.push(`API מערכת העדפות: ${healthData.success ? 'עובד' : 'לא עובד'}`);
                if (healthData.data) {
                    log.push(`סטטוס: ${healthData.data.status}`);
                }
            }
        } catch (error) {
            log.push(`API מערכת העדפות: שגיאה - ${error.message}`);
        }
        
        // Cache Status - שיפור שלי
        if (window.UnifiedCacheManager) {
            try {
                const cached = await window.UnifiedCacheManager.get('user-preferences');
                log.push(`Cache תקין: ${cached ? 'כן' : 'לא'}`);
                log.push(`Cache size: ${cached ? Object.keys(cached).length : 0} פריטים`);
            } catch (error) {
                log.push(`Cache: שגיאה בבדיקה - ${error.message}`);
            }
        }
        log.push('');
        
        // 8. מידע טכני - לפי המדריך
        log.push('--- מידע טכני ---');
        log.push(`זמן יצירת הלוג: ${timestamp}`);
        log.push(`גרסת דפדפן: ${navigator.userAgent}`);
        log.push(`רזולוציה מסך: ${screen.width}x${screen.height}`);
        log.push(`גודל חלון: ${window.innerWidth}x${window.innerHeight}`);
        log.push(`שפת דפדפן: ${navigator.language}`);
        log.push(`פלטפורמה: ${navigator.platform}`);
        
        // שיפורים שלי - מידע נוסף
        log.push(`זמן טעינת עמוד: ${performance.timing ? 
            (performance.timing.loadEventEnd - performance.timing.navigationStart) + 'ms' : 
            'לא זמין'}`);
        log.push(`זיכרון זמין: ${navigator.deviceMemory ? navigator.deviceMemory + 'GB' : 'לא זמין'}`);
        log.push('');
        
        // Footer - לפי המדריך
        log.push('=== סוף לוג ===');
        
        const logText = log.join('\n');
        
        // Copy to clipboard with fallback for focus issues
        try {
            await navigator.clipboard.writeText(logText);
        } catch (clipboardError) {
            // Fallback: create a temporary textarea for copying
            console.log('📋 Clipboard API failed, using fallback method...');
            const textarea = document.createElement('textarea');
            textarea.value = logText;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            textarea.setSelectionRange(0, 99999); // For mobile devices
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        
        // Show success notification ONLY after successful copy
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('לוג מפורט הועתק ללוח', 'הלוג מכיל את כל מה שרואה המשתמש בעמוד');
        } else if (typeof window.showNotification === 'function') {
            window.showNotification('לוג מפורט הועתק ללוח', 'success');
        } else {
            alert('לוג מפורט הועתק ללוח!');
        }
        
        console.log('📋 Detailed log copied to clipboard');
        console.log('📋 Log content:', logText);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error copying detailed log:', error);
        
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בהעתקת הלוג', error.message);
        } else if (typeof window.showNotification === 'function') {
            window.showNotification('שגיאה בהעתקת הלוג: ' + error.message, 'error');
        } else {
            alert('שגיאה בהעתקת הלוג: ' + error.message);
        }
        
        return false;
    }
};

/**
 * העתקת לוג מפורט של מערכת העדפות
 */
window.copyPreferencesDetailedLog = async function() {
    try {
        const timestamp = new Date().toLocaleString('he-IL');
        
        // קבלת מידע על המשתמש הפעיל
        let activeProfile = 'לא זמין';
        if (typeof window.TikTrackAuth !== 'undefined' && window.TikTrackAuth.getCurrentUser) {
            const currentUser = window.TikTrackAuth.getCurrentUser();
            if (currentUser) {
                activeProfile = currentUser.name || currentUser.username || 'נימרוד';
            }
        }
        
        // קבלת מספר העדפות
        let preferencesCount = 'לא זמין';
        try {
            if (window.UnifiedCacheManager) {
                const cached = await window.UnifiedCacheManager.get('user-preferences');
                if (cached) {
                    preferencesCount = Object.keys(cached).length;
                }
            }
        } catch (error) {
            console.warn('Error getting preferences count:', error);
        }
        
        // קבלת מספר פרופילים
        let profilesCount = 1; // נימרוד - המשתמש היחיד
        try {
            if (typeof window.getUserProfiles === 'function') {
                const profiles = await window.getUserProfiles();
                profilesCount = profiles ? profiles.length : 1;
            }
        } catch (error) {
            console.warn('Error getting profiles count:', error);
            profilesCount = 1; // נימרוד - המשתמש היחיד
        }
        
        // איסוף מידע על כל הסקשנים
        const sections = [];
        for (let i = 1; i <= 7; i++) {
            const section = document.getElementById(`section${i}`);
            if (section) {
                const title = section.querySelector('h2')?.textContent || `סקשן ${i}`;
                const isVisible = !section.classList.contains('d-none');
                sections.push(`  ${i}. ${title}: ${isVisible ? 'פתוח' : 'סגור'}`);
            }
        }
        
        // איסוף מידע על העדפות פעילות
        const activePreferences = [];
        const preferenceInputs = document.querySelectorAll('input[type="checkbox"], input[type="range"], select');
        preferenceInputs.forEach(input => {
            if (input.type === 'checkbox') {
                activePreferences.push(`  ${input.name || input.id}: ${input.checked ? 'פעיל' : 'לא פעיל'}`);
            } else if (input.type === 'range') {
                activePreferences.push(`  ${input.name || input.id}: ${input.value}`);
            } else if (input.tagName === 'SELECT') {
                activePreferences.push(`  ${input.name || input.id}: ${input.value}`);
            }
        });
        
        const logContent = `🔔 לוג מפורט - מערכת העדפות
📅 תאריך ושעה: ${timestamp}
👤 פרופיל פעיל: ${activeProfile}
📊 מספר העדפות: ${preferencesCount}
👥 מספר פרופילים: ${profilesCount}

📋 סטטוס סקשנים:
${sections.join('\n')}

⚙️ העדפות פעילות:
${activePreferences.slice(0, 20).join('\n')}${activePreferences.length > 20 ? '\n  ... ועוד ' + (activePreferences.length - 20) + ' העדפות' : ''}

🔧 מידע טכני:
  - מערכת העדפות: פעילה
  - Cache: ${window.UnifiedCacheManager ? 'זמין' : 'לא זמין'}
  - שירות: ${typeof window.preferencesService !== 'undefined' ? 'זמין' : 'זמין (מקומי)'}

📝 הערות:
  - לוג זה מכיל מידע על מצב מערכת העדפות
  - כולל פרופיל פעיל, העדפות, וסטטוס סקשנים
  - נוצר אוטומטית על ידי מערכת העדפות`;

        navigator.clipboard.writeText(logContent).then(() => {
            if (window.showSuccessNotification) {
                window.showSuccessNotification('לוג מפורט הועתק ללוח');
            } else {
                alert('לוג מפורט הועתק ללוח');
            }
        }).catch(err => {
            console.error('שגיאה בהעתקה:', err);
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה בהעתקת הלוג');
            } else {
                alert('שגיאה בהעתקת הלוג');
            }
        });
        
    } catch (error) {
        console.error('שגיאה ביצירת לוג מפורט:', error);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה ביצירת הלוג');
        } else {
            alert('שגיאה ביצירת הלוג');
        }
    }
};

/**
 * שמירת מצב העבודה של ההתראות
 */
window.saveNotificationMode = async function() {
    try {
        const selectedMode = document.querySelector('input[name="notificationMode"]:checked');
        if (!selectedMode) {
            window.showNotification('בחר מצב עבודה', 'warning');
            return;
        }
        
        const mode = selectedMode.value;
        console.log(`💾 שמירת מצב עבודה: ${mode}`);
        
        // שמירה בבסיס הנתונים
        const response = await fetch('/api/preferences/user/single', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: 1,
                preference_name: 'notification_mode',
                value: mode
            })
        });
        
        if (response.ok) {
            window.showNotification(`מצב העבודה נשמר: ${getModeDisplayName(mode)}`, 'success');
            updateCurrentModeStatus(mode);
        } else {
            throw new Error('שגיאה בשמירה');
        }
    } catch (error) {
        console.error('❌ שגיאה בשמירת מצב עבודה:', error);
        window.showNotification('שגיאה בשמירת מצב העבודה', 'error');
    }
};

/**
 * בדיקת מצב העבודה הנוכחי
 */
window.testNotificationMode = async function() {
    try {
        const response = await fetch('/api/preferences/user/single?preference_name=notification_mode&user_id=1');
        const data = await response.json();
        
        if (data.success) {
            const currentMode = data.data?.value || 'work';
            window.showNotification(`מצב נוכחי: ${getModeDisplayName(currentMode)}`, 'info');
            updateCurrentModeStatus(currentMode);
        } else {
            window.showNotification('לא ניתן לטעון מצב נוכחי', 'warning');
        }
    } catch (error) {
        console.error('❌ שגיאה בבדיקת מצב נוכחי:', error);
        window.showNotification('שגיאה בבדיקת מצב נוכחי', 'error');
    }
};

/**
 * קבלת שם תצוגה למצב
 */
function getModeDisplayName(mode) {
    const modeNames = {
        'debug': 'מצב דיבג',
        'development': 'מצב פיתוח', 
        'work': 'מצב עבודה',
        'silent': 'מצב מושתק'
    };
    return modeNames[mode] || mode;
}

/**
 * עדכון תצוגת המצב הנוכחי
 */
function updateCurrentModeStatus(mode) {
    const statusContainer = document.getElementById('currentModeStatus');
    if (!statusContainer) return;
    
    const iconClass = {
        'debug': 'fas fa-bug',
        'development': 'fas fa-code',
        'work': 'fas fa-briefcase', 
        'silent': 'fas fa-volume-mute'
    }[mode] || 'fas fa-question';
    
    const iconColor = {
        'debug': 'text-muted',
        'development': 'text-primary',
        'work': 'text-success',
        'silent': 'text-danger'
    }[mode] || 'text-muted';
    
    statusContainer.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="${iconClass} ${iconColor} me-2"></i>
            <div>
                <span class="fw-bold">${getModeDisplayName(mode)}</span>
                <br><small class="text-muted">${getModeDescription(mode)}</small>
            </div>
        </div>
    `;
}

/**
 * קבלת תיאור למצב
 */
function getModeDescription(mode) {
    const descriptions = {
        'debug': 'הצגת כל ההתראות המפורטות כולל הודעות משניות',
        'development': 'הצגת הודעות מרכזיות בלבד',
        'work': 'מצב ברירת מחדל - מאזן בין מידע לרעש',
        'silent': 'הצגת הודעות שגיאה בלבד'
    };
    return descriptions[mode] || 'מצב לא ידוע';
}


/**
 * מילוי טפסי ההעדפות עם נתונים
 * @param {Object} preferences - נתוני ההעדפות
 */
window.populatePreferencesForm = async function(preferences) {
    try {
        console.log('📝 Populating preferences form...');
        console.log('📝 Preferences received:', Object.keys(preferences).length, 'items');
        
        // Preferences are populated directly in form fields (no table needed)
        
        // Load notification mode
        if (preferences.notification_mode) {
            const modeRadio = document.getElementById(`mode${preferences.notification_mode.charAt(0).toUpperCase() + preferences.notification_mode.slice(1)}`);
            if (modeRadio) {
                modeRadio.checked = true;
                updateCurrentModeStatus(preferences.notification_mode);
            }
        }
        
        // Basic settings
        if (preferences.primaryCurrency) {
            const currencySelect = document.getElementById('primaryCurrency');
            if (currencySelect) currencySelect.value = preferences.primaryCurrency;
        }
        
        if (preferences.timezone) {
            const timezoneSelect = document.getElementById('timezone');
            if (timezoneSelect) timezoneSelect.value = preferences.timezone;
        }
        
        
        // Notification categories
        const categorySettings = [
            'notifications_development_enabled', 'notifications_system_enabled',
            'notifications_business_enabled', 'notifications_performance_enabled',
            'notifications_ui_enabled', 'notifications_general_enabled'
        ];
        
        categorySettings.forEach(setting => {
            const element = document.getElementById(setting);
            if (element && preferences[setting] !== undefined) {
                element.checked = preferences[setting];
            }
        });
        
        // Console logs
        const consoleSettings = [
            'console_logs_development_enabled', 'console_logs_system_enabled',
            'console_logs_business_enabled', 'console_logs_performance_enabled',
            'console_logs_ui_enabled'
        ];
        
        consoleSettings.forEach(setting => {
            const element = document.getElementById(setting);
            if (element && preferences[setting] !== undefined) {
                element.checked = preferences[setting];
            }
        });
        
        // Trading settings - עם ערכי ברירת מחדל
        const defaultStopLoss = preferences.defaultStopLoss || '2.0';
        const defaultTargetPrice = preferences.defaultTargetPrice || '4.0';
        const defaultCommission = preferences.defaultCommission || '0.65';
        
        const stopLossElement = document.getElementById('defaultStopLoss');
        if (stopLossElement) {
            stopLossElement.value = defaultStopLoss;
            console.log(`📊 Set defaultStopLoss: ${defaultStopLoss}`);
        }
        
        const targetPriceElement = document.getElementById('defaultTargetPrice');
        if (targetPriceElement) {
            targetPriceElement.value = defaultTargetPrice;
            console.log(`📊 Set defaultTargetPrice: ${defaultTargetPrice}`);
        }
        
        const commissionElement = document.getElementById('defaultCommission');
        if (commissionElement) {
            commissionElement.value = defaultCommission;
            console.log(`📊 Set defaultCommission: ${defaultCommission}`);
        }
        
        // Color settings
        const colorSettings = [
            'primaryColor', 'secondaryColor', 'successColor', 'warningColor',
            'dangerColor', 'infoColor'
        ];
        
        colorSettings.forEach(setting => {
            const element = document.getElementById(setting);
            if (element && preferences[setting]) {
                element.value = preferences[setting];
            }
        });
        
        console.log('✅ Preferences form populated successfully');
        
    } catch (error) {
        console.error('❌ Error populating preferences form:', error);
    }
};

/**
 * עדכון מונים של ההעדפות
 * @param {Object} preferences - נתוני ההעדפות
 */
window.updatePreferencesCounters = function(preferences) {
    try {
        console.log('📊 Updating preferences counters...');
        
        // Count preferences
        const preferencesCount = Object.keys(preferences).length;
        console.log(`📊 Found ${preferencesCount} preferences to count`);
        
        const preferencesCountElement = document.getElementById('preferencesCount');
        console.log(`📊 preferencesCountElement found:`, preferencesCountElement ? 'YES' : 'NO');
        if (preferencesCountElement) {
            preferencesCountElement.textContent = preferencesCount;
            console.log(`📊 Updated preferences count: ${preferencesCount}`);
        } else {
            console.error('❌ preferencesCountElement not found!');
        }
        
        // Count profiles - get real count from API
        const profilesCountElement = document.getElementById('profilesCount');
        if (profilesCountElement) {
            // Get real profiles count
            if (typeof window.getUserProfiles === 'function') {
                window.getUserProfiles().then(profiles => {
                    const profilesCount = profiles ? profiles.length : 0;
                    profilesCountElement.textContent = profilesCount;
                    console.log(`📊 Updated profiles count: ${profilesCount}`);
                }).catch(error => {
                    console.warn('Error getting profiles count:', error);
                    profilesCountElement.textContent = '1'; // Fallback
                });
            } else {
                profilesCountElement.textContent = '1'; // Fallback
            }
        }
        
        // Count groups - get real count from API
        const groupsCountElement = document.getElementById('groupsCount');
        if (groupsCountElement) {
            // Get real groups count
            fetch('/api/preferences/groups')
                .then(response => response.json())
                .then(result => {
                    const groupsCount = result.data?.groups ? result.data.groups.length : 0;
                    groupsCountElement.textContent = groupsCount;
                    console.log(`📊 Updated groups count: ${groupsCount}`);
                })
                .catch(error => {
                    console.warn('Error getting groups count:', error);
                    groupsCountElement.textContent = '17'; // Fallback
                });
        }
        
        console.log('✅ Preferences counters updated successfully');
        
    } catch (error) {
        console.error('❌ Error updating preferences counters:', error);
    }
};

// ===== EXPORT FOR TESTING =====

// Export functions for testing
// Debug: Verify function is loaded
console.log('🔧 preferences.js loaded - copyDetailedLog function:', typeof copyDetailedLog);

// Profile selection - NO automatic switching, just UI selection
// Profile selection event listener is now handled by the unified initialization system
// Removed duplicate DOMContentLoaded listener to prevent conflicts

/**
 * איסוף נתוני טופס העדפות
 * @returns {Object} - נתוני הטופס
 */
window.collectFormData = function() {
    try {
        console.log('📋 Collecting form data...');
        const formData = {};
        
        // Collect all form elements
        const formElements = document.querySelectorAll('input, select, textarea');
        
        formElements.forEach(element => {
            if (element.id && element.id !== '') {
                if (element.type === 'checkbox') {
                    formData[element.id] = element.checked;
                } else if (element.type === 'color') {
                    formData[element.id] = element.value;
                } else {
                    formData[element.id] = element.value;
                }
            }
        });
        
        console.log(`📋 Collected ${Object.keys(formData).length} form fields`);
        return formData;
        
    } catch (error) {
        console.error('❌ Error collecting form data:', error);
        return {};
    }
};


/**
 * מחיקת פרופיל
 */
window.deleteProfile = async function() {
    try {
        console.log('🗑️ Deleting profile...');
        
        const profileSelect = document.getElementById('profileSelect');
        if (!profileSelect || profileSelect.options.length <= 1) {
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה', 'לא ניתן למחוק את הפרופיל האחרון');
            }
            return false;
        }
        
        const selectedProfile = profileSelect.value;
        if (selectedProfile === 'ברירת מחדל') {
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה', 'לא ניתן למחוק את פרופיל ברירת המחדל');
            }
            return false;
        }
        
        // אישור מחיקה
        if (!confirm(`האם אתה בטוח שברצונך למחוק את הפרופיל "${selectedProfile}"?`)) {
            return false;
        }
        
        // מחיקת הפרופיל מהרשימה
        profileSelect.remove(profileSelect.selectedIndex);
        profileSelect.value = 'ברירת מחדל';
        
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('הצלחה', `פרופיל "${selectedProfile}" נמחק בהצלחה`);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error deleting profile:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'שגיאה במחיקת הפרופיל: ' + error.message);
        }
        return false;
    }
};

/**
 * טעינת צבעי ברירת מחדל
 */
window.loadDefaultColors = function() {
    try {
        console.log('🎨 Loading default colors...');
        
        // צבעי מערכת בסיסיים
        const defaultColors = {
            // צבעי מערכת
            primaryColor: '#007bff',
            secondaryColor: '#6c757d', 
            successColor: '#28a745',
            warningColor: '#ffc107',
            dangerColor: '#dc3545',
            infoColor: '#17a2b8',
            
            // צבעי ישויות - Trade Plans (3 וריאנטים)
            entityTradePlanColor: '#007bff',
            entityTradePlanColorLight: '#e3f2fd',
            entityTradePlanColorDark: '#0056b3',
            
            // צבעי ישויות - Trades (3 וריאנטים)
            entityTradeColor: '#28a745',
            entityTradeColorLight: '#e8f5e8',
            entityTradeColorDark: '#1e7e34',
            
            // צבעי ישויות - Alerts (3 וריאנטים)
            entityAlertColor: '#ffc107',
            entityAlertColorLight: '#fff8e1',
            entityAlertColorDark: '#e0a800',
            
            // צבעי ישויות - Notes (3 וריאנטים)
            entityNoteColor: '#6c757d',
            entityNoteColorLight: '#f8f9fa',
            entityNoteColorDark: '#495057',
            
            // צבעי ישויות - Trading Accounts (3 וריאנטים)
            entityTradingAccountColor: '#17a2b8',
            entityTradingAccountColorLight: '#e1f7fa',
            entityTradingAccountColorDark: '#117a8b',
            
            // צבעי ישויות - Tickers (3 וריאנטים)
            entityTickerColor: '#6f42c1',
            entityTickerColorLight: '#f3f0ff',
            entityTickerColorDark: '#5a32a3',
            
            // צבעי ישויות - Executions (3 וריאנטים)
            entityExecutionColor: '#fd7e14',
            entityExecutionColorLight: '#fff4e6',
            entityExecutionColorDark: '#e55a00',
            
            // צבעי ישויות - Cash Flows (3 וריאנטים)
            entityCashFlowColor: '#20c997',
            entityCashFlowColorLight: '#e6fcf5',
            entityCashFlowColorDark: '#17a085',
            
            // צבעי ערכים מספריים (3 וריאנטים)
            valuePositiveColor: '#28a745',
            valuePositiveColorLight: '#e8f5e8',
            valuePositiveColorDark: '#1e7e34',
            valueNegativeColor: '#dc3545',
            valueNegativeColorLight: '#fdeaea',
            valueNegativeColorDark: '#c82333',
            valueNeutralColor: '#6c757d',
            valueNeutralColorLight: '#f8f9fa',
            valueNeutralColorDark: '#495057',
            
            // צבעי גרפים
            chartPrimaryColor: '#007bff',
            chartBackgroundColor: '#ffffff',
            chartTextColor: '#212529',
            chartGridColor: '#dee2e6',
            chartBorderColor: '#dee2e6',
            chartPointColor: '#007bff'
        };
        
        // הגדרת הצבעים בשדות
        Object.entries(defaultColors).forEach(([fieldName, colorValue]) => {
            const colorInput = document.getElementById(fieldName);
            if (colorInput) {
                colorInput.value = colorValue;
                console.log(`🎨 Set ${fieldName}: ${colorValue}`);
            }
        });
        
        console.log('✅ Default colors loaded successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Error loading default colors:', error);
        return false;
    }
};


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
        loadAllPreferences: window.loadAllPreferences,
        saveAllPreferences: window.saveAllPreferences,
        resetToDefaults: window.resetToDefaults,
        initializePreferences: window.initializePreferences,
        copyPreferencesDetailedLog: window.copyPreferencesDetailedLog,
        copyDetailedLog: copyDetailedLog,
        populatePreferencesForm: window.populatePreferencesForm,
        updatePreferencesCounters: window.updatePreferencesCounters,
        saveAsActiveProfile: window.saveAsActiveProfile,
        deleteProfile: window.deleteProfile,
        saveNotificationMode: window.saveNotificationMode,
        testNotificationMode: window.testNotificationMode,
        loadDefaultColors: window.loadDefaultColors,
        collectFormData: window.collectFormData,
        startPreferencesPolling: window.startPreferencesPolling,
        stopPreferencesPolling: window.stopPreferencesPolling,
        checkForPreferencesUpdates: window.checkForPreferencesUpdates
    };
}
