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

// ===== FUNCTION INDEX =====
// === Event Handlers ===
// - DataCollectionService.switch() - Switch

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
            
            // Remove # prefix if present (getElementById doesn't need it)
            const elementId = config.id.startsWith('#') ? config.id.substring(1) : config.id;
            const element = document.getElementById(elementId);
            
            if (!element) {
                console.warn(`⚠️ שדה ${config.id} (${elementId}) לא נמצא בטופס`);
                // אם יש ברירת מחדל, השתמש בה
                if (config.hasOwnProperty('default')) {
                    data[key] = config.default;
                }
                continue;
            }
            
            
            if (config.type === 'tags') {
                let selectedTags = [];
                if (window.TagUIManager && typeof window.TagUIManager.getSelectedValues === 'function') {
                    selectedTags = window.TagUIManager.getSelectedValues(element);
                } else {
                    selectedTags = Array.from(element.selectedOptions || [])
                        .map(option => parseInt(option.value, 10))
                        .filter(value => !Number.isNaN(value));
                }
                data[key] = selectedTags;
                continue;
            }
            
            // טיפול מיוחד ב-rich-text editor - לא משתמש ב-value
            if (config.type === 'rich-text') {
                if (window.RichTextEditorService) {
                    // Remove # prefix if present for RichTextEditorService
                    const editorId = config.id.startsWith('#') ? config.id.substring(1) : config.id;
                    const htmlContent = window.RichTextEditorService.getContent(editorId);
                    window.Logger?.debug(`📝 [DataCollectionService] Rich-text content for ${config.id} (${editorId})`, {
                        htmlContentLength: htmlContent?.length || 0,
                        hasContent: !!htmlContent,
                        page: 'data-collection'
                    });
                    
                    // בדיקה אם התוכן ריק (אחרי הסרת תגי HTML)
                    const textContent = htmlContent.replace(/<[^>]*>/g, '').trim();
                    if (!textContent) {
                        // Empty rich-text content is expected when field is not filled - log at debug level
                        window.Logger?.debug(`Empty rich-text content for ${config.id} (${editorId}) - using default`, {
                            htmlContentLength: htmlContent?.length || 0,
                            page: 'data-collection',
                            note: 'This is expected when rich-text field is not filled'
                        });
                        data[key] = config.hasOwnProperty('default') ? config.default : '';
                    } else {
                        data[key] = htmlContent;
                        window.Logger?.debug(`✅ [DataCollectionService] Rich-text content collected for ${config.id} (${editorId})`, {
                            htmlContentLength: htmlContent?.length || 0,
                            textContentLength: textContent?.length || 0,
                            page: 'data-collection'
                        });
                    }
                } else {
                    window.Logger?.warn(`⚠️ RichTextEditorService not available for field ${config.id}`, {
                        page: 'data-collection'
                    });
                    data[key] = config.hasOwnProperty('default') ? config.default : '';
                }
                continue;
            }
            
            let value = element.value;
            
            // טיפול בשדות ריקים
            if (!value || (typeof value === 'string' && value.trim() === '')) {
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
                    value = value.trim();
                    break;
                    
                default:
                    // For other types (like datetime-local, number, etc.), keep as-is
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
        
        
        const missingFields = [];
        const setFields = [];
        
        for (const [key, config] of Object.entries(fieldMap)) {
            
            // Remove # prefix if present (getElementById doesn't need it)
            const elementId = config.id.startsWith('#') ? config.id.substring(1) : config.id;
            const element = document.getElementById(elementId);
            if (!element) {
                console.warn(`⚠️ שדה ${config.id} (${elementId}) לא נמצא בטופס`);
                missingFields.push({fieldId: config.id, elementId: elementId, fieldName: key, fieldType: config.type});
                continue;
            }
            
            
            const value = values[key];
            if (value === undefined || value === null) {
                continue;
            }
            
            // הגדרת ערך לפי סוג
            if (config.type === 'tags') {
                const tagValues = Array.isArray(value) ? value : [];
                if (window.TagUIManager && typeof window.TagUIManager.setSelectedValues === 'function') {
                    window.TagUIManager.setSelectedValues(element, tagValues);
                } else {
                    const valuesSet = new Set(tagValues.map(v => String(v)));
                    Array.from(element.options || []).forEach(option => {
                        option.selected = valuesSet.has(option.value);
                    });
                }
                setFields.push({fieldName: key, fieldId: config.id, value: tagValues, type: 'tags'});
                continue;
            }

            let setValue = value;
            if (config.type === 'bool' || config.type === 'boolean' || config.type === 'checkbox') {
                element.checked = Boolean(value);
                setValue = Boolean(value);
            } else if (config.type === 'date' || config.type === 'dateOnly') {
                // המרת תאריך לפורמט input
                try {
                    // Handle both date strings (yyyy-MM-dd or yyyy-MM-ddThh:mm) and Date objects
                    let dateValue;
                    if (typeof value === 'string') {
                        // If value is already in yyyy-MM-dd format, use it directly
                        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                            dateValue = value;
                        } else {
                            // Otherwise, parse it as a date and convert to yyyy-MM-dd
                            const date = new Date(value);
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            dateValue = `${year}-${month}-${day}`;
                        }
                    } else if (value instanceof Date) {
                        const year = value.getFullYear();
                        const month = String(value.getMonth() + 1).padStart(2, '0');
                        const day = String(value.getDate()).padStart(2, '0');
                        dateValue = `${year}-${month}-${day}`;
                    } else {
                        // Fallback: try to parse as date
                        const date = new Date(value);
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        dateValue = `${year}-${month}-${day}`;
                    }
                    
                    // Both 'date' and 'dateOnly' use yyyy-MM-dd format (date input type)
                    setValue = dateValue;
                    element.value = setValue;
                } catch (e) {
                    console.warn(`⚠️ שגיאה בהמרת תאריך עבור ${config.id}`);
                }
            } else if (element.tagName === 'SELECT') {
                // טיפול מיוחד ב-select elements - צריך לוודא שהערך קיים ב-options
                
                // Try to set value directly first
                element.value = value;
                
                
                // Check if value was set correctly (handle type mismatches)
                // Also check if value matches case-insensitively but not exactly (for Capitalized enum values)
                const valueSetCorrectly = element.value === String(value) || element.value === value;
                const valueMatchesCaseInsensitive = typeof value === 'string' && 
                    element.value && 
                    String(element.value).toLowerCase() === String(value).toLowerCase() &&
                    element.value !== value;
                
                
                if (!valueSetCorrectly || valueMatchesCaseInsensitive) {
                    // Value didn't set - try to find matching option
                    const options = Array.from(element.options);
                    // First try exact match (case-sensitive)
                    let match = options.find(opt => 
                        opt.value === String(value) ||
                        opt.value === value ||
                        String(opt.value) === String(value)
                    );
                    
                    // If no exact match, try case-insensitive match for text values
                    // BUT prefer the original value if it's a valid Capitalized enum value
                    if (!match && typeof value === 'string') {
                        const valueLower = value.toLowerCase();
                        const valueCapitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                        
                        // Try to find exact capitalized match first (for enum values like 'Long', 'Short', 'Swing')
                        match = options.find(opt => 
                            String(opt.value) === valueCapitalized ||
                            String(opt.value).toLowerCase() === valueLower
                        );
                        
                        // If found via case-insensitive match, use the original value if it matches the capitalized form
                        if (match && String(match.value).toLowerCase() === valueLower) {
                            // Check if original value is Capitalized (enum format)
                            if (value === valueCapitalized) {
                                // Use original value (Capitalized) instead of option value
                                element.value = value;
                                setValue = value;
                            } else {
                                // Use match value (lowercase from options)
                                element.value = match.value;
                                setValue = match.value;
                            }
                        } else if (match) {
                            // Match found but value doesn't match lowercase - use match value
                            element.value = match.value;
                            setValue = match.value;
                        } else {
                            // Try numeric match for int types
                            if (config.type === 'int') {
                                match = options.find(opt => 
                                    parseInt(opt.value) === parseInt(value) ||
                                    parseInt(opt.value) === value
                                );
                            }
                            
                            if (match) {
                                element.value = match.value;
                                setValue = match.value;
                            } else {
                                console.warn(`⚠️ ערך ${value} לא נמצא ב-options של ${config.id}`);
                            }
                        }
                    } else if (match) {
                        element.value = match.value;
                        setValue = match.value;
                    } else {
                        console.warn(`⚠️ ערך ${value} לא נמצא ב-options של ${config.id}`);
                    }
                } else {
                    setValue = element.value;
                }
                
                // Trigger change event to update any listeners
                element.dispatchEvent(new Event('change', { bubbles: true }));
                element.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                element.value = value;
                setValue = value;
            }
            
            setFields.push({fieldName: key, fieldId: config.id, value: setValue, type: config.type});
        }
        
        return { missingFields, setFields };
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
            // Silent return - it's normal for fields to not exist on some pages
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
            
            case 'tags':
                if (window.TagUIManager && typeof window.TagUIManager.getSelectedValues === 'function') {
                    return window.TagUIManager.getSelectedValues(element);
                }
                return Array.from(element.selectedOptions || [])
                    .map(option => parseInt(option.value, 10))
                    .filter(num => !Number.isNaN(num));
                
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
        if (type === 'tags') {
            if (window.TagUIManager && typeof window.TagUIManager.setSelectedValues === 'function') {
                window.TagUIManager.setSelectedValues(element, Array.isArray(value) ? value : []);
            } else if (Array.isArray(value)) {
                const valuesSet = new Set(value.map(v => String(v)));
                Array.from(element.options || []).forEach(option => {
                    option.selected = valuesSet.has(option.value);
                });
            }
            return;
        }

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


