/**
 * Default Value Setter - TikTrack
 * ===============================
 * 
 * מערכת מרכזית להגדרת ברירות מחדל בטפסים
 * מחליפה קוד זהה ב-16 פונקציות showAddModal
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 * 
 * תכונות:
 * - הגדרת תאריך נוכחי (עם/בלי שעה)
 * - טעינת ברירות מחדל מהעדפות משתמש
 * - הגדרת ברירות מחדל לוגיות (status: open, source: manual)
 * - הגדרה מרובה בקריאה אחת
 */

// ===== DEFAULT VALUE SETTER =====

class DefaultValueSetter {
    /**
     * הגדרת תאריך נוכחי (רק תאריך, ללא שעה)
     * 
     * @param {string} fieldId - ID של שדה התאריך
     * @returns {string} - התאריך שהוגדר (YYYY-MM-DD)
     * 
     * @example
     * DefaultValueSetter.setCurrentDate('executionDate');
     */
    static setCurrentDate(fieldId) {
        const element = document.getElementById(fieldId);
        if (!element) {
            console.warn(`⚠️ שדה ${fieldId} לא נמצא`);
            return null;
        }
        
        // CRITICAL FIX: Check field type - datetime-local needs time component
        const fieldType = (element.type || '').toLowerCase();
        if (fieldType === 'datetime-local') {
            // For datetime-local fields, use setCurrentDateTime instead
            return this.setCurrentDateTime(fieldId);
        }
        
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        element.value = dateStr;
        return dateStr;
    }

    /**
     * הגדרת תאריך ושעה נוכחיים
     * 
     * @param {string} fieldId - ID של שדה התאריך
     * @returns {string} - התאריך והשעה שהוגדרו (YYYY-MM-DDTHH:MM)
     * 
     * @example
     * DefaultValueSetter.setCurrentDateTime('cashFlowDate');
     */
    static setCurrentDateTime(fieldId) {
        const element = document.getElementById(fieldId);
        if (!element) {
            console.warn(`⚠️ שדה ${fieldId} לא נמצא`);
            return null;
        }
        
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        const dateTimeStr = `${year}-${month}-${day}T${hours}:${minutes}`;
        
        element.value = dateTimeStr;
        return dateTimeStr;
    }

    /**
     * הגדרת ערך מהעדפות משתמש
     * 
     * @param {string} fieldId - ID של השדה
     * @param {string} preferenceName - שם ההעדפה (primaryCurrency, default_trading_account, etc.)
     * @returns {Promise<*>} - הערך שהוגדר או null
     * 
     * @example
     * await DefaultValueSetter.setPreferenceValue('currencySelect', 'primaryCurrency');
     */
    static async setPreferenceValue(fieldId, preferenceName) {
        const element = document.getElementById(fieldId);
        if (!element) {
            console.warn(`⚠️ שדה ${fieldId} לא נמצא`);
            return null;
        }
        
        try {
            // 1) קודם מתוך ההעדפות שבזיכרון (ללא קריאת API)
            // Try multiple sources: PreferencesSystem, window.currentPreferences, getPreferenceFromMemory
            let cachedValue = null;
            
            // Try PreferencesSystem first
            const cachedPrefs = window.PreferencesSystem?.manager?.currentPreferences;
            if (cachedPrefs && cachedPrefs[preferenceName] !== undefined && cachedPrefs[preferenceName] !== null) {
                cachedValue = cachedPrefs[preferenceName];
            }
            
            // Try window.currentPreferences if not found
            if (cachedValue === null && window.currentPreferences && typeof window.currentPreferences === 'object') {
                cachedValue = window.currentPreferences[preferenceName] ?? null;
            }
            
            // Try getPreferenceFromMemory if available (async)
            if (cachedValue === null && typeof window.getPreferenceFromMemory === 'function') {
                try {
                    cachedValue = await window.getPreferenceFromMemory(preferenceName);
                } catch (e) {
                    // Silent fail - continue
                }
            }
            
            if (cachedValue !== null && cachedValue !== undefined) {
              // Use DataCollectionService to set value if available
              if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                window.DataCollectionService.setValue(element.id, cachedValue, 'text');
              } else {
                element.value = cachedValue;
              }
              return cachedValue;
            }
            // 2) אם אין ערך במטמון – לא לקרוא ל-API כאן כדי להימנע משגיאות 500 על העדפות חסרות
            return null;
        } catch (error) {
            console.warn(`⚠️ setPreferenceValue (memory-first) failed for ${preferenceName}:`, error);
            return null;
        }
    }

    /**
     * הגדרת ברירת מחדל לוגית
     * 
     * @param {string} fieldId - ID של השדה
     * @param {*} defaultValue - ערך ברירת מחדל
     * @returns {*} - הערך שהוגדר
     * 
     * @example
     * DefaultValueSetter.setLogicalDefault('tradeStatus', 'open');
     * DefaultValueSetter.setLogicalDefault('executionSource', 'manual');
     */
    static setLogicalDefault(fieldId, defaultValue) {
        const element = document.getElementById(fieldId);
        if (!element) {
            console.warn(`⚠️ שדה ${fieldId} לא נמצא`);
            return null;
        }
        
        if (element.type === 'checkbox') {
            element.checked = Boolean(defaultValue);
        } else {
          // Use DataCollectionService to set value if available
          if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
            window.DataCollectionService.setValue(element.id, defaultValue, 'text');
          } else {
            element.value = defaultValue;
          }
        }
        
        return defaultValue;
    }

    /**
     * הגדרת כל ברירות המחדל בקריאה אחת
     * 
     * @param {Object} config - הגדרות: { dates: [...], preferences: [...], logical: [...] }
     * @returns {Promise<void>}
     * 
     * @example
     * await DefaultValueSetter.setAllDefaults({
     *   dates: [
     *     { fieldId: 'tradeDate', includeTime: false },
     *     { fieldId: 'executionDate', includeTime: true }
     *   ],
     *   preferences: [
     *     { fieldId: 'currencySelect', preferenceName: 'primaryCurrency' },
     *     { fieldId: 'accountSelect', preferenceName: 'default_trading_account' }
     *   ],
     *   logical: [
     *     { fieldId: 'tradeStatus', value: 'open' },
     *     { fieldId: 'executionSource', value: 'manual' }
     *   ]
     * });
     */
    static async setAllDefaults(config = {}) {
        // הגדרת תאריכים
        if (config.dates && Array.isArray(config.dates)) {
            config.dates.forEach(dateConfig => {
                if (dateConfig.includeTime) {
                    this.setCurrentDateTime(dateConfig.fieldId);
                } else {
                    this.setCurrentDate(dateConfig.fieldId);
                }
            });
        }
        
        // הגדרת ערכים מהעדפות
        if (config.preferences && Array.isArray(config.preferences)) {
            const promises = config.preferences.map(prefConfig => 
                this.setPreferenceValue(prefConfig.fieldId, prefConfig.preferenceName)
            );
            await Promise.all(promises);
        }
        
        // הגדרת ערכים לוגיים
        if (config.logical && Array.isArray(config.logical)) {
            config.logical.forEach(logicalConfig => {
                this.setLogicalDefault(logicalConfig.fieldId, logicalConfig.value);
            });
        }
    }

    /**
     * הגדרת ברירת מחדל לטופס שלם
     * פונקציה נוחה לטפסים עם מבנה סטנדרטי
     * 
     * @param {Object} config - הגדרות מלאות לטופס
     * @returns {Promise<void>}
     * 
     * @example
     * await DefaultValueSetter.setFormDefaults({
     *   formId: 'addTradeForm',
     *   dateField: 'tradeDate',
     *   includeTime: false,
     *   preferenceFields: {
     *     'accountSelect': 'default_trading_account',
     *     'currencySelect': 'primaryCurrency'
     *   },
     *   logicalDefaults: {
     *     'tradeStatus': 'open',
     *     'tradeSource': 'manual'
     *   }
     * });
     */
    static async setFormDefaults(config = {}) {
        const defaults = {
            dates: [],
            preferences: [],
            logical: []
        };
        
        // תאריך
        if (config.dateField) {
            defaults.dates.push({
                fieldId: config.dateField,
                includeTime: config.includeTime || false
            });
        }
        
        // העדפות
        if (config.preferenceFields) {
            for (const [fieldId, preferenceName] of Object.entries(config.preferenceFields)) {
                defaults.preferences.push({ fieldId, preferenceName });
            }
        }
        
        // לוגיים
        if (config.logicalDefaults) {
            for (const [fieldId, value] of Object.entries(config.logicalDefaults)) {
                defaults.logical.push({ fieldId, value });
            }
        }
        
        await this.setAllDefaults(defaults);
    }
}

// ===== EXPORT TO GLOBAL SCOPE =====

window.DefaultValueSetter = DefaultValueSetter;

// Shortcuts למתודות נפוצות
window.setCurrentDate = (fieldId) => DefaultValueSetter.setCurrentDate(fieldId);
window.setCurrentDateTime = (fieldId) => DefaultValueSetter.setCurrentDateTime(fieldId);
window.setPreferenceValue = (fieldId, preferenceName) => DefaultValueSetter.setPreferenceValue(fieldId, preferenceName);
window.setLogicalDefault = (fieldId, defaultValue) => DefaultValueSetter.setLogicalDefault(fieldId, defaultValue);
window.setAllDefaults = (config) => DefaultValueSetter.setAllDefaults(config);
window.setFormDefaults = (config) => DefaultValueSetter.setFormDefaults(config);


