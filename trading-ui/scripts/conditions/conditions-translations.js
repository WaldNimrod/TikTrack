/**
 * Conditions Translations - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains the conditions translation system for TikTrack including:
 * - Trading methods translations
 * - Method categories translations
 * - Parameters translations
 * - Logical operators translations
 * - UI text translations
 * - Error messages translations
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-27
 */

/**
 * Conditions Translation Manager class
 * @class ConditionsTranslations
 */
class ConditionsTranslations {
    constructor() {
        this.translations = {
            // Trading Methods
            methods: {
                'moving_average': 'ממוצע נע',
                'moving_averages': 'ממוצעים נעים',
                'volume_analysis': 'ניתוח נפח',
                'support_resistance': 'תמיכה והתנגדות',
                'trend_lines': 'קווי מגמה',
                'technical_patterns': 'דפוסים טכניים',
                'fibonacci': 'פיבונאצ\'י',
                'fibonacci_retracement': 'פיבונאצ\'י'
            },
            
            // Method Categories
            categories: {
                'technical_indicators': 'אינדיקטורים טכניים',
                'price_patterns': 'דפוסי מחיר',
                'support_resistance': 'תמיכה והתנגדות',
                'trend_analysis': 'ניתוח מגמות',
                'volume_analysis': 'ניתוח נפח',
                'fibonacci': 'פיבונאצ\'י'
            },
            
            // Parameters
            parameters: {
                'period': 'תקופה',
                'threshold': 'סף',
                'level': 'רמה',
                'strength': 'עוצמה',
                'timeframe': 'מסגרת זמן',
                'sensitivity': 'רגישות',
                'ma_period': 'תקופת ממוצע נע',
                'ma_type': 'סוג ממוצע נע',
                'comparison_type': 'סוג השוואה',
                'volume_period': 'תקופת נפח',
                'volume_multiplier': 'מכפיל נפח',
                'tolerance_pct': 'אחוז סבילות',
                'trend_type': 'סוג מגמה',
                'lookback_period': 'תקופת בדיקה',
                'pattern_type': 'סוג דפוס',
                'fib_type': 'סוג פיבונאצ\'י',
                'level_price': 'מחיר רמה'
            },
            
            // Logical Operators
            operators: {
                'NONE': 'ללא',
                'AND': 'וגם',
                'OR': 'או'
            },
            
            // Status
            status: {
                'active': 'פעיל',
                'inactive': 'לא פעיל',
                'pending': 'ממתין',
                'triggered': 'הופעל',
                'expired': 'פג תוקף'
            },
            
            // Actions
            actions: {
                'create': 'יצירה',
                'edit': 'עריכה',
                'delete': 'מחיקה',
                'duplicate': 'הכפלה',
                'activate': 'הפעלה',
                'deactivate': 'השבתה',
                'test': 'בדיקה',
                'validate': 'ולידציה'
            },
            
            // Messages
            messages: {
                'loading': 'טוען...',
                'saving': 'שומר...',
                'success': 'הצלחה',
                'error': 'שגיאה',
                'warning': 'אזהרה',
                'info': 'מידע',
                'confirm_delete': 'האם אתה בטוח שברצונך למחוק תנאי זה?',
                'condition_created': 'תנאי נוצר בהצלחה',
                'condition_updated': 'תנאי עודכן בהצלחה',
                'condition_deleted': 'תנאי נמחק בהצלחה',
                'validation_failed': 'ולידציה נכשלה',
                'post_save_prompt_title': 'שמירת תנאי',
                'post_save_prompt_base': 'האם תרצה להוסיף תנאי נוסף ל{entityLabel} {entityName}?',
                'post_save_prompt_confirm_hint': 'אישור – הוסף תנאי נוסף',
                'post_save_prompt_cancel_hint': 'דחייה – חזרה למודול {entityLabel}',
                'condition_entity_label': 'תנאי',
                'condition_create_error': 'שגיאה ביצירת תנאי',
                'condition_update_error': 'שגיאה בעדכון תנאי',
                'condition_delete_error': 'שגיאה במחיקת תנאי',
                'condition_methods_error': 'שגיאה בטעינת שיטות מסחר',
                'method_required': 'יש לבחור שיטת מסחר',
                'parameters_required': 'יש למלא את כל הפרמטרים הנדרשים'
            },
            
            // Form Labels
            form: {
                'select_method': 'בחר שיטת מסחר',
                'method_parameters': 'פרמטרי השיטה',
                'logical_operator': 'אופרטור לוגי',
                'condition_group': 'קבוצת תנאי',
                'is_active': 'פעיל',
                'save_condition': 'שמור תנאי',
                'cancel': 'ביטול',
                'add_condition': 'הוסף תנאי',
                'edit_condition': 'ערוך תנאי',
                'delete_condition': 'מחק תנאי',
                'create_alert': 'צור התראה'
            }
        };
    }
    
    /**
     * Get translation
     * @function get
     * @param {string} key - Translation key
     * @param {string|null} defaultValue - Default value
     * @returns {string} Translated text
     */
    get(key, defaultValue = null) {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue || key;
            }
        }
        
        return value;
    }
    
    /**
     * Get method name
     * @function getMethodName
     * @param {string} methodKey - Method key
     * @returns {string} Method name
     */
    getMethodName(methodKey) {
        return this.get(`methods.${methodKey}`, methodKey);
    }
    
    /**
     * Get category name
     * @function getCategoryName
     * @param {string} categoryKey - Category key
     * @returns {string} Category name
     */
    getCategoryName(categoryKey) {
        return this.get(`categories.${categoryKey}`, categoryKey);
    }
    
    /**
     * Get parameter name
     * @function getParameterName
     * @param {string} parameterKey - Parameter key
     * @returns {string} Parameter name
     */
    getParameterName(parameterKey) {
        return this.get(`parameters.${parameterKey}`, parameterKey);
    }
    
    /**
     * Get operator
     * @function getOperator
     * @param {string} operatorKey - Operator key
     * @returns {string} Operator text
     */
    getOperator(operatorKey) {
        return this.get(`operators.${operatorKey}`, operatorKey);
    }
    
    /**
     * Get status
     * @function getStatus
     * @param {string} statusKey - Status key
     * @returns {string} Status text
     */
    getStatus(statusKey) {
        return this.get(`status.${statusKey}`, statusKey);
    }
    
    /**
     * Get action
     * @function getAction
     * @param {string} actionKey - Action key
     * @returns {string} Action text
     */
    getAction(actionKey) {
        return this.get(`actions.${actionKey}`, actionKey);
    }
    
    /**
     * Get message
     * @function getMessage
     * @param {string} messageKey - Message key
     * @returns {string} Message text
     */
    getMessage(messageKey) {
        return this.get(`messages.${messageKey}`, messageKey);
    }
    
    /**
     * Get form label
     * @function getFormLabel
     * @param {string} labelKey - Label key
     * @returns {string} Label text
     */
    getFormLabel(labelKey) {
        return this.get(`form.${labelKey}`, labelKey);
    }
    
    /**
     * Translate condition object
     * @function translateCondition
     * @param {Object} condition - Condition object
     * @returns {Object} Translated condition
     */
    translateCondition(condition, entityType = 'plan') {
        if (!condition) return null;

        const methodData = condition.method || {};
        const methodKey = condition.method_key
            || methodData.method_key
            || methodData.key
            || this._generateMethodKey(methodData.name_en);
        const categoryKey = condition.category || methodData.category || '';
        const status = condition.status
            || (condition.is_active === false ? 'inactive' : 'active');

        return {
            ...condition,
            method_key: methodKey,
            method_name: this.getMethodName(methodKey),
            category: categoryKey,
            category_name: this.getCategoryName(categoryKey),
            status,
            status_name: this.getStatus(status),
            logical_operator_name: this.getOperator(condition.logical_operator),
            parameters: this._normalizeParameters(condition.parameters_json || condition.parameters),
            entity_type: entityType
        };
    }
    
    /**
     * Translate method object
     * @function translateMethod
     * @param {Object} method - Method object
     * @returns {Object} Translated method
     */
    translateMethod(method) {
        if (!method) return null;
        
        const methodKey = method.key || method.method_key || this._generateMethodKey(method.name_en);
        return {
            ...method,
            key: methodKey,
            method_key: methodKey,
            name: this.getMethodName(methodKey),
            category_name: this.getCategoryName(method.category),
            parameters: method.parameters || []
        };
    }
    
    /**
     * Translate parameters object
     * @function translateParameters
     * @param {Object} parameters - Parameters object
     * @returns {Object} Translated parameters
     */
    translateParameters(parameters) {
        if (!parameters) return {};
        
        const translated = {};
        for (const [key, value] of Object.entries(parameters)) {
            const translatedKey = this.getParameterName(key);
            translated[translatedKey] = value;
        }
        
        return translated;
    }

    _generateMethodKey(name) {
        if (!name) return '';
        return name
            .toLowerCase()
            .replace(/&/g, 'and')
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');
    }

    _normalizeParameters(parameters) {
        if (!parameters) return {};
        if (typeof parameters === 'string') {
            try {
                return JSON.parse(parameters);
            } catch (error) {
                window.Logger?.warn('[ConditionsTranslations] Failed to parse parameters_json', { error: error?.message, value: parameters }, { page: 'conditions-translations' });
                return {};
            }
        }
        return parameters;
    }
}

// Create global instance
window.conditionsTranslations = new ConditionsTranslations();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConditionsTranslations;
}