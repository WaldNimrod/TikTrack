/**
 * Preferences Group Manager
 * ========================
 * 
 * מנהל קבוצות העדפות - אקורדיון יחודי + lazy loading
 * 
 * תכונות:
 * - רק section אחד פתוח בכל זמן (מלבד top)
 * - טעינת העדפות רק כשפותחים section
 * - שמירת העדפות לפי קבוצה
 * 
 * @version 1.0.0
 * @lastUpdated January 30, 2025
 */

class PreferencesGroupManager {
    constructor() {
        this.openSectionId = null; // רק section אחד פתוח
        this.groupsMap = {
            'section2': 'basic_settings',
            'section3': 'trading_settings',
            'section4': 'filter_settings',
            'section5': 'notification_settings',
            'section6': 'colors_unified',
            'section7': 'chart_settings_unified'
        };
        this.currentUserId = 1;
        this.currentProfileId = null;
        this.valueMappings = {
            defaultStatusFilter: {
                toEnglish: {
                    'פתוח': 'open',
                    'סגור': 'closed',
                    'מבוטל': 'cancelled',
                    'בוטל': 'cancelled',
                    'הכל': 'all',
                    'הכול': 'all',
                    'open': 'open',
                    'closed': 'closed',
                    'cancelled': 'cancelled',
                    'canceled': 'cancelled',
                    'all': 'all'
                }
            },
            defaultTypeFilter: {
                toEnglish: {
                    'Swing': 'swing',
                    'סווינג': 'swing',
                    'השקעה': 'investment',
                    'Investment': 'investment',
                    'פסיבי': 'passive',
                    'Passive': 'passive',
                    'הכל': 'all',
                    'הכול': 'all',
                    'swing': 'swing',
                    'investment': 'investment',
                    'passive': 'passive',
                    'all': 'all'
                }
            },
            defaultDateRangeFilter: {
                toEnglish: {
                    'היום': 'today',
                    'אתמול': 'yesterday',
                    'השבוע': 'this_week',
                    'החודש': 'this_month',
                    'השנה': 'this_year',
                    'השבוע שעבר': 'last_week',
                    'השנה שעברה': 'last_year',
                    'החודש שעבר': 'last_month',
                    '7 ימים אחרונים': 'last_7_days',
                    '30 ימים אחרונים': 'last_30_days',
                    '90 ימים אחרונים': 'last_90_days',
                    'מותאם אישית': 'custom',
                    'כל זמן': 'all',
                    'הכל': 'all',
                    'הכול': 'all',
                    'today': 'today',
                    'yesterday': 'yesterday',
                    'this_week': 'this_week',
                    'this_month': 'this_month',
                    'this_year': 'this_year',
                    'last_week': 'last_week',
                    'last_year': 'last_year',
                    'last_month': 'last_month',
                    'last_7_days': 'last_7_days',
                    'last_30_days': 'last_30_days',
                    'last_90_days': 'last_90_days',
                    'custom': 'custom',
                    'all': 'all'
                }
            },
            defaultSearchFilter: {
                toEnglish: {
                    'הכל': 'all',
                    'הכול': 'all',
                    '': '',
                    'all': 'all'
                }
            }
        };
    }
    
    /**
     * פתיחת section (סוגר אחרים אוטומטית)
     * @param {string} sectionId - Section ID
     */
    async openSection(sectionId) {
        // סגירת כל האחרים
        if (this.openSectionId && this.openSectionId !== sectionId) {
            await this.closeSection(this.openSectionId);
        }
        
        const section = document.getElementById(sectionId);
        if (!section) {
            window.Logger?.warn(`Section ${sectionId} not found`, { page: "preferences-group-manager" });
            return;
        }
        
        const sectionBody = section.querySelector('.section-body');
        const icon = section.querySelector('.section-toggle-icon');
        
        if (sectionBody) {
            sectionBody.classList.remove('collapsed');
            sectionBody.style.display = 'block';
            if (icon) icon.textContent = '▲';
            
            this.openSectionId = sectionId;
            
            window.Logger?.debug(`✅ Opened section ${sectionId}`, { page: "preferences-group-manager" });
            
            // טעינת העדפות הקבוצה
            const groupName = this.groupsMap[sectionId];
            if (groupName && !this.isGroupLoaded(sectionId)) {
                await this.loadGroupData(sectionId, groupName);
            }
        }
    }
    
    /**
     * סגירת section
     * @param {string} sectionId - Section ID
     */
    async closeSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        const sectionBody = section.querySelector('.section-body');
        const icon = section.querySelector('.section-toggle-icon');
        
        if (sectionBody) {
            sectionBody.classList.add('collapsed');
            sectionBody.style.display = 'none';
            if (icon) icon.textContent = '▼';
            
            if (this.openSectionId === sectionId) {
                this.openSectionId = null;
            }
            
            window.Logger?.debug(`✅ Closed section ${sectionId}`, { page: "preferences-group-manager" });
        }
    }
    
    /**
     * טעינת נתוני קבוצה
     * @param {string} sectionId - Section ID
     * @param {string} groupName - Group name
     */
    async loadGroupData(sectionId, groupName) {
        try {
            window.Logger?.info(`📥 Loading group ${groupName}...`, { page: "preferences-group-manager" });
            
            // בדיקה אם PreferencesCore זמין
            if (!window.PreferencesCore || !window.PreferencesCore.loadGroupPreferences) {
                window.Logger?.warn('PreferencesCore not available', { page: "preferences-group-manager" });
                return;
            }
            
            const preferences = await window.PreferencesCore.loadGroupPreferences(groupName);
            this.populateGroupFields(sectionId, preferences);
            this.markGroupAsLoaded(sectionId);
            
            window.Logger?.info(`✅ Loaded ${Object.keys(preferences).length} preferences for group ${groupName}`, { page: "preferences-group-manager" });
        } catch (error) {
            window.Logger?.error(`Failed to load group ${groupName}:`, error, { page: "preferences-group-manager" });
            window.showErrorNotification?.(`שגיאה בטעינת קבוצה ${this.getGroupDisplayName(groupName)}`);
        }
    }
    
    /**
     * מילוי שדות בקבוצה
     * @param {string} sectionId - Section ID
     * @param {Object} preferences - Preferences object
     */
    populateGroupFields(sectionId, preferences) {
        const section = document.getElementById(sectionId);
        if (!section) {
            window.Logger?.warn(`Section ${sectionId} not found for population`, { page: "preferences-group-manager" });
            return;
        }
        
        let populatedCount = 0;
        Object.keys(preferences).forEach(prefName => {
            const field = section.querySelector(`[name="${prefName}"], #${prefName}`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = preferences[prefName] === 'true' || preferences[prefName] === true;
                } else {
                    const normalizedValue = this.normalizePreferenceValue(prefName, preferences[prefName], 'toEnglish');
                    const previousValue = field.value;
                    field.value = normalizedValue;
                    
                    if (field.value !== normalizedValue && preferences[prefName] !== undefined && preferences[prefName] !== null) {
                        field.value = preferences[prefName];
                    }
                    
                    if (field.value === '' && previousValue !== '') {
                        field.value = previousValue;
                    }
                }
                populatedCount++;
            }
        });
        
        window.Logger?.debug(`Populated ${populatedCount} fields in section ${sectionId}`, { page: "preferences-group-manager" });
    }
    
    normalizePreferenceValue(prefName, value, direction = 'toEnglish') {
        if (value === null || value === undefined) {
            return value;
        }
        
        if (!Object.prototype.hasOwnProperty.call(this.valueMappings, prefName)) {
            return value;
        }
        
        const normalizedValue = String(value).trim();
        const mapping = this.valueMappings[prefName].toEnglish || {};
        
        if (direction === 'toEnglish') {
            return mapping[normalizedValue] || normalizedValue;
        }
        
        return mapping[normalizedValue] || normalizedValue;
    }
    
    /**
     * שמירת קבוצה
     * @param {string} groupName - Group name
     */
    async saveGroup(groupName) {
        const sectionId = Object.keys(this.groupsMap).find(
            key => this.groupsMap[key] === groupName
        );
        
        if (!sectionId) {
            window.Logger?.error(`Group ${groupName} not found in mapping`, { page: "preferences-group-manager" });
            window.showErrorNotification?.('קבוצה לא נמצאה');
            return;
        }
        
        const section = document.getElementById(sectionId);
        if (!section) {
            window.Logger?.error(`Section ${sectionId} not found`, { page: "preferences-group-manager" });
            return;
        }
        
        const formData = this.collectGroupData(section);
        
        if (Object.keys(formData).length === 0) {
            window.Logger?.warn(`No data to save for group ${groupName}`, { page: "preferences-group-manager" });
            return;
        }
        
        try {
            window.Logger?.info(`💾 Saving ${Object.keys(formData).length} preferences for group ${groupName}...`, { page: "preferences-group-manager" });
            
            // בדיקה אם PreferencesCore זמין
            if (!window.PreferencesCore || !window.PreferencesCore.saveGroupPreferences) {
                window.Logger?.error('PreferencesCore.saveGroupPreferences not available', { page: "preferences-group-manager" });
                window.showErrorNotification?.('מערכת העדפות לא זמינה');
                return;
            }
            
            // שמירה
            const results = await window.PreferencesCore.saveGroupPreferences(groupName, formData);
            
            // ניקוי cache של הקבוצה
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.refreshUserPreferences) {
                await window.UnifiedCacheManager.refreshUserPreferences(null, groupName);
            }
            
            // הודעת הצלחה
            const displayName = this.getGroupDisplayName(groupName);
            window.showSuccessNotification?.(`✅ ${displayName} נשמרו בהצלחה`);
            
            window.Logger?.info(`✅ Saved ${results.saved} preferences for group ${groupName}`, { page: "preferences-group-manager" });
        } catch (error) {
            window.Logger?.error(`Failed to save group ${groupName}:`, error, { page: "preferences-group-manager" });
            window.showErrorNotification?.('שגיאה בשמירת הגדרות');
        }
    }
    
    /**
     * איסוף נתונים מקבוצה
     * @param {HTMLElement} section - Section element
     * @returns {Object} Form data
     */
    collectGroupData(section) {
        const formData = {};
        const inputs = section.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // For color pickers, use data-color-key if available, otherwise use name or id
            let name = null;
            if (input.type === 'color' && input.dataset.colorKey) {
                name = input.dataset.colorKey;
            } else {
                name = input.name || input.id;
            }
            
            if (!name) return;
            
            // Skip buttons, hidden fields, disabled fields
            if (input.type === 'button' || input.type === 'submit' || input.type === 'hidden') return;
            if (input.disabled) return;
            
            if (input.type === 'checkbox') {
                formData[name] = input.checked ? 'true' : 'false';
            } else {
                formData[name] = this.normalizePreferenceValue(name, input.value, 'toEnglish');
            }
        });
        
        return formData;
    }
    
    /**
     * קבלת שם תצוגה לקבוצה
     * @param {string} groupName - Group name
     * @returns {string} Display name
     */
    getGroupDisplayName(groupName) {
        const names = {
            'basic_settings': 'הגדרות בסיסיות',
            'trading_settings': 'הגדרות מסחר',
            'filter_settings': 'פילטרים',
            'colors_unified': 'צבעים',
            'notification_settings': 'התראות',
            'chart_settings_unified': 'הגדרות גרפים'
        };
        return names[groupName] || groupName;
    }
    
    /**
     * בדיקה אם קבוצה כבר נטענה
     * @param {string} sectionId - Section ID
     * @returns {boolean} Is loaded
     */
    isGroupLoaded(sectionId) {
        const section = document.getElementById(sectionId);
        return section ? section.dataset.loaded === 'true' : false;
    }
    
    /**
     * סימון קבוצה כנטענת
     * @param {string} sectionId - Section ID
     */
    markGroupAsLoaded(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.dataset.loaded = 'true';
        }
    }
}

// אתחול גלובלי
window.PreferencesGroupManager = new PreferencesGroupManager();

// NOTE: toggleSection is handled by ui-utils.js with accordion logic
// We don't override it here - the accordion mode is configured in page-initialization-configs.js

/**
 * שמירת קבוצה
 * @param {string} groupName - Group name
 */
window.savePreferenceGroup = function(groupName) {
    if (!window.PreferencesGroupManager) {
        window.Logger?.error('PreferencesGroupManager not available', { page: "preferences-group-manager" });
        return;
    }
    window.PreferencesGroupManager.saveGroup(groupName);
};

// NOTE: toggleAllSections is handled by ui-utils.js with accordion logic
// We don't override it here - the accordion mode is configured in page-initialization-configs.js

window.Logger?.info('✅ PreferencesGroupManager loaded successfully', { page: "preferences-group-manager" });

