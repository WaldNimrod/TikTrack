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
                    field.value = preferences[prefName];
                }
                populatedCount++;
            }
        });
        
        window.Logger?.debug(`Populated ${populatedCount} fields in section ${sectionId}`, { page: "preferences-group-manager" });
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
            const name = input.name || input.id;
            if (!name) return;
            
            // Skip buttons, hidden fields, disabled fields
            if (input.type === 'button' || input.type === 'submit' || input.type === 'hidden') return;
            if (input.disabled) return;
            
            if (input.type === 'checkbox') {
                formData[name] = input.checked ? 'true' : 'false';
            } else {
                formData[name] = input.value;
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

// פונקציות עטיפה ל-toggleSection קיים
window.toggleSection = function(sectionId) {
    if (!sectionId) {
        window.Logger?.warn('toggleSection called without sectionId', { page: "preferences-group-manager" });
        return;
    }
    
    // הסקשן העליון לא מנוהל על ידי PreferencesGroupManager
    // משתמש בלוגיקה המקורית
    if (sectionId === 'top') {
        const section = document.getElementById(sectionId);
        const sectionBody = section?.querySelector('.section-body');
        const icon = section?.querySelector('.section-toggle-icon');
        
        if (sectionBody) {
            const isCollapsed = sectionBody.style.display === 'none';
            sectionBody.style.display = isCollapsed ? 'block' : 'none';
            if (icon) icon.textContent = isCollapsed ? '▲' : '▼';
        }
        return;
    }
    
    // sections אחרים - דרך PreferencesGroupManager
    if (!window.PreferencesGroupManager) {
        window.Logger?.error('PreferencesGroupManager not available', { page: "preferences-group-manager" });
        return;
    }
    
    const section = document.getElementById(sectionId);
    const sectionBody = section?.querySelector('.section-body');
    const isCollapsed = sectionBody?.style.display === 'none' || 
                       sectionBody?.classList.contains('collapsed');
    
    if (isCollapsed) {
        window.PreferencesGroupManager.openSection(sectionId);
    } else {
        window.PreferencesGroupManager.closeSection(sectionId);
    }
};

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

// Override toggleAllSections for preferences page to use our unique accordion
window.toggleAllSectionsOriginal = window.toggleAllSections;
window.toggleAllSections = function() {
    if (!window.PreferencesGroupManager) {
        // Fallback to original if manager not available
        if (window.toggleAllSectionsOriginal) {
            return window.toggleAllSectionsOriginal();
        }
        return;
    }
    
    // Get all sections
    const sections = ['section1', 'section2', 'section3', 'section4', 'section5', 'section6', 'section7'];
    const allClosed = sections.every(sectionId => {
        const section = document.getElementById(sectionId);
        const sectionBody = section?.querySelector('.section-body');
        return !sectionBody || sectionBody.style.display === 'none' || section.classList.contains('collapsed');
    });
    
    window.Logger?.info(`Toggle all sections: ${allClosed ? 'EXPAND (will show only one)' : 'COLLAPSE all'}`, { page: "preferences-group-manager" });
    
    if (allClosed) {
        // Open first preference section (skip top)
        window.PreferencesGroupManager.openSection('section2');
        window.Logger?.info('Opened first preference section (section2)', { page: "preferences-group-manager" });
    } else {
        // Close all sections
        sections.forEach(sectionId => {
            if (window.PreferencesGroupManager.openSectionId === sectionId) {
                window.PreferencesGroupManager.closeSection(sectionId);
            }
        });
        window.Logger?.info('Closed all sections', { page: "preferences-group-manager" });
    }
};

window.Logger?.info('✅ PreferencesGroupManager loaded successfully', { page: "preferences-group-manager" });

