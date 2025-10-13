/**
 * Data Collection Service - TikTrack
 * ==================================
 * 
 * מערכת מרכזית לאיסוף נתונים מטפסים והמרות טיפוס
 * מחליפה 3,131 קריאות ידניות ל-getElementById במערכת
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 * 
 * תכונות:
 * - איסוף נתונים לפי מפת שדות
 * - המרות טיפוס אוטומטיות (int, float, date, bool)
 * - תמיכה בברירות מחדל
 * - הגדרת ערכים בטופס
 * - ניקוי טפסים
 * - תמיכה ב-FormData למקרים מתקדמים
 */

// ===== DATA COLLECTION SERVICE =====

class DataCollectionService {
    /**
     * איסוף נתונים מטופס לפי מפת שדות
     * 
     * @param {Object} fieldMap - מפת שדות: { fieldName: { id: 'elementId', type: 'text/int/number/date/dateOnly/bool', default: value } }
     * @returns {Object} - אובייקט עם הנתונים
     * 
     * @example
     * const data = DataCollectionService.collectFormData({
     *   trade_id: { id: 'addExecutionTradeId', type: 'int' },
     *   price: { id: 'addExecutionPrice', type: 'number' },
     *   date: { id: 'addExecutionDate', type: 'date' },
     *   notes: { id: 'addExecutionNotes', type: 'text', default: null }
     * });
     */
    static collectFormData(fieldMap) {
        const data = {};
        
        for (const [key, config] of Object.entries(fieldMap)) {
            const element = document.getElementById(config.id);
            
            if (!element) {
                console.warn(`⚠️ שדה ${config.id} לא נמצא בטופס`);
                // אם יש ברירת מחדל, השתמש בה
                if (config.hasOwnProperty('default')) {
                    data[key] = config.default;
                }
                continue;
            }
            
            let value = element.value;
            
            // טיפול בשדות ריקים
            if (!value || value.trim() === '') {
                // אם יש ברירת מחדל, השתמש בה
                if (config.hasOwnProperty('default')) {
                    data[key] = config.default;
                } else {
                    data[key] = null;
                }
                continue;
            }
            
            // המרות טיפוס
            switch (config.type) {
                case 'int':
                    value = parseInt(value);
                    if (isNaN(value)) {
                        console.warn(`⚠️ שדה ${config.id} אינו מספר שלם תקין`);
                        value = config.default !== undefined ? config.default : null;
                    }
                    break;
                    
                case 'number':
                case 'float':
                    value = parseFloat(value);
                    if (isNaN(value)) {
                        console.warn(`⚠️ שדה ${config.id} אינו מספר תקין`);
                        value = config.default !== undefined ? config.default : null;
                    }
                    break;
                    
                case 'date':
                    // תאריך + שעה בפורמט ISO
                    try {
                        value = value ? new Date(value).toISOString() : null;
                    } catch (e) {
                        console.warn(`⚠️ שדה ${config.id} אינו תאריך תקין`);
                        value = null;
                    }
                    break;
                    
                case 'dateOnly':
                    // רק תאריך, ללא שעה (YYYY-MM-DD)
                    try {
                        value = value ? value.split('T')[0] : null;
                    } catch (e) {
                        console.warn(`⚠️ שדה ${config.id} אינו תאריך תקין`);
                        value = null;
                    }
                    break;
                    
                case 'bool':
                case 'boolean':
                case 'checkbox':
                    value = element.checked || false;
                    break;
                    
                case 'text':
                case 'string':
                default:
                    value = value.trim();
                    break;
            }
            
            data[key] = value;
        }
        
        return data;
    }

    /**
     * איסוף כל הנתונים מטופס (FormData)
     * שימושי לטפסים פשוטים ללא צורך בהמרות
     * 
     * @param {string} formId - ID של הטופס
     * @returns {Object} - אובייקט עם כל השדות
     * 
     * @example
     * const data = DataCollectionService.collectAllFormData('addTradeForm');
     */
    static collectAllFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) {
            console.warn(`⚠️ טופס ${formId} לא נמצא`);
            return {};
        }
        
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    /**
     * הגדרת ערכים בטופס
     * 
     * @param {Object} fieldMap - מפת שדות: { fieldName: { id: 'elementId', type: 'text/int/number/date/bool' } }
     * @param {Object} values - ערכים להגדרה
     * 
     * @example
     * DataCollectionService.setFormData({
     *   trade_id: { id: 'editExecutionTradeId', type: 'int' },
     *   price: { id: 'editExecutionPrice', type: 'number' }
     * }, { trade_id: 123, price: 45.67 });
     */
    static setFormData(fieldMap, values) {
        for (const [key, config] of Object.entries(fieldMap)) {
            const element = document.getElementById(config.id);
            if (!element) {
                console.warn(`⚠️ שדה ${config.id} לא נמצא בטופס`);
                continue;
            }
            
            const value = values[key];
            if (value === undefined || value === null) {
                continue;
            }
            
            // הגדרת ערך לפי סוג
            if (config.type === 'bool' || config.type === 'boolean' || config.type === 'checkbox') {
                element.checked = Boolean(value);
            } else if (config.type === 'date' || config.type === 'dateOnly') {
                // המרת תאריך לפורמט input
                try {
                    const date = new Date(value);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    
                    if (config.type === 'date') {
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        element.value = `${year}-${month}-${day}T${hours}:${minutes}`;
                    } else {
                        element.value = `${year}-${month}-${day}`;
                    }
                } catch (e) {
                    console.warn(`⚠️ שגיאה בהמרת תאריך עבור ${config.id}`);
                }
            } else {
                element.value = value;
            }
        }
    }

    /**
     * ניקוי טופס
     * 
     * @param {string} formId - ID של הטופס
     * @param {boolean} clearValidation - האם לנקות גם סימוני ולידציה
     * 
     * @example
     * DataCollectionService.resetForm('addTradeForm', true);
     */
    static resetForm(formId, clearValidation = true) {
        const form = document.getElementById(formId);
        if (!form) {
            console.warn(`⚠️ טופס ${formId} לא נמצא`);
            return;
        }
        
        // ניקוי הטופס
        form.reset();
        
        // ניקוי סימוני ולידציה
        if (clearValidation) {
            // הסרת is-invalid מכל השדות
            const invalidFields = form.querySelectorAll('.is-invalid');
            invalidFields.forEach(field => {
                field.classList.remove('is-invalid');
            });
            
            // הסרת is-valid מכל השדות
            const validFields = form.querySelectorAll('.is-valid');
            validFields.forEach(field => {
                field.classList.remove('is-valid');
            });
            
            // ניקוי הודעות שגיאה
            const errorElements = form.querySelectorAll('.invalid-feedback, .error-message');
            errorElements.forEach(error => {
                error.textContent = '';
                error.style.display = 'none';
            });
            
            // שימוש במערכת הגלובלית אם זמינה
            if (typeof window.clearValidation === 'function') {
                window.clearValidation(formId);
            }
        }
    }

    /**
     * קבלת ערך בודד משדה עם המרת טיפוס
     * 
     * @param {string} fieldId - ID של השדה
     * @param {string} type - סוג ההמרה (int, number, date, dateOnly, bool, text)
     * @param {*} defaultValue - ברירת מחדל
     * @returns {*} - ערך מומר או ברירת מחדל
     * 
     * @example
     * const price = DataCollectionService.getValue('priceField', 'number', 0);
     */
    static getValue(fieldId, type = 'text', defaultValue = null) {
        const element = document.getElementById(fieldId);
        if (!element) {
            console.warn(`⚠️ שדה ${fieldId} לא נמצא`);
            return defaultValue;
        }
        
        let value = element.value;
        
        if (!value || value.trim() === '') {
            return defaultValue;
        }
        
        // המרות טיפוס
        switch (type) {
            case 'int':
                value = parseInt(value);
                return isNaN(value) ? defaultValue : value;
                
            case 'number':
            case 'float':
                value = parseFloat(value);
                return isNaN(value) ? defaultValue : value;
                
            case 'date':
                try {
                    return value ? new Date(value).toISOString() : defaultValue;
                } catch (e) {
                    return defaultValue;
                }
                
            case 'dateOnly':
                try {
                    return value ? value.split('T')[0] : defaultValue;
                } catch (e) {
                    return defaultValue;
                }
                
            case 'bool':
            case 'boolean':
            case 'checkbox':
                return element.checked || false;
                
            case 'text':
            case 'string':
            default:
                return value.trim();
        }
    }

    /**
     * הגדרת ערך בודד לשדה
     * 
     * @param {string} fieldId - ID של השדה
     * @param {*} value - ערך להגדרה
     * @param {string} type - סוג השדה
     * 
     * @example
     * DataCollectionService.setValue('priceField', 123.45, 'number');
     */
    static setValue(fieldId, value, type = 'text') {
        const element = document.getElementById(fieldId);
        if (!element) {
            console.warn(`⚠️ שדה ${fieldId} לא נמצא`);
            return;
        }
        
        if (value === undefined || value === null) {
            return;
        }
        
        // הגדרת ערך לפי סוג
        if (type === 'bool' || type === 'boolean' || type === 'checkbox') {
            element.checked = Boolean(value);
        } else if (type === 'date') {
            // המרת תאריך לפורמט datetime-local
            try {
                const date = new Date(value);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                element.value = `${year}-${month}-${day}T${hours}:${minutes}`;
            } catch (e) {
                console.warn(`⚠️ שגיאה בהמרת תאריך עבור ${fieldId}`, e);
            }
        } else if (type === 'dateOnly') {
            // רק תאריך, ללא שעה
            try {
                const date = new Date(value);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                element.value = `${year}-${month}-${day}`;
            } catch (e) {
                console.warn(`⚠️ שגיאה בהמרת תאריך עבור ${fieldId}`, e);
            }
        } else {
            // Check if element supports .value (input, select, textarea)
            if ('value' in element && (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA')) {
                element.value = value;
            } else {
                // For display elements (span, div, strong, etc.) use textContent
                element.textContent = value;
            }
        }
    }
}

// ===== EXPORT TO GLOBAL SCOPE =====

window.DataCollectionService = DataCollectionService;

// Shortcuts למתודות נפוצות
window.collectFormData = (fieldMap) => DataCollectionService.collectFormData(fieldMap);
window.collectAllFormData = (formId) => DataCollectionService.collectAllFormData(formId);
window.setFormData = (fieldMap, values) => DataCollectionService.setFormData(fieldMap, values);
window.resetForm = (formId, clearValidation) => DataCollectionService.resetForm(formId, clearValidation);


