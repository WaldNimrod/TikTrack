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
                'support_and_resistance': 'תמיכה והתנגדות',
                'trend_lines': 'קווי מגמה',
                'technical_patterns': 'דפוסים טכניים',
                'fibonacci': 'פיבונאצ\'י',
                'fibonacci_retracement': 'פיבונאצ\'י'
            },

            // Method details (logic + examples)
            method_details: {
                'moving_averages': {
                    title: 'ממוצעים נעים – זיהוי שינוי מגמה',
                    description: 'בודק את מערכת היחסים בין ממוצעים נעים קצרים וארוכים כדי לזהות חציות שמאותתות על שינוי כיוון או האצה של מגמה קיימת.',
                    example: 'MA20 חוצה מעלה את MA50 → איתות להתחזקות מגמה עולה.'
                },
                'volume_analysis': {
                    title: 'ניתוח נפח – אישור תנועה',
                    description: 'מודד את עוצמת התנועה במחיר מול נפח המסחר כדי לוודא שפריצות או שבירות מתרחשות עם תמיכה אמיתית של קונים/מוכרים.',
                    example: 'נפח גבוה ב־150% מהממוצע ב־20 נרות כשהמחיר פורץ התנגדות.'
                },
                'support_and_resistance': {
                    title: 'תמיכה והתנגדות – עבודה סביב רמות מפתח',
                    description: 'משווה את מחיר השוק לרמות ידועות כדי לאתר נגיעה/היפוך/פריצה של אזורי תמיכה או התנגדות שהוגדרו מראש.',
                    example: 'מחיר יורד אל אזור תמיכה 150₪ (±1%) ומציג נר היפוך עולה.'
                },
                'trend_lines': {
                    title: 'קווי מגמה – שמירה או שבירה של קו',
                    description: 'בודק אם המחיר נשאר מעל או מתחת לקווי מגמה שנבנו על סמך שיאים/שפלים, כדי לזהות שמירה על הכיוון או שבירה שלו.',
                    example: 'סגירה יומית מעל קו מגמת עלייה שנבנה מ־3 שפלים עוקבים.'
                },
                'technical_patterns': {
                    title: 'דפוסים טכניים – זיהוי מבנים נפוצים',
                    description: 'מזהה דפוסים סיסטמטיים (דגל, משולש, Cup & Handle ועוד) ומוודא שהמחיר מגיב בהתאם להתנהגות המצופה מהדפוס.',
                    example: 'תבנית Cup & Handle מסתיימת בפריצה של 2% מעל קו ההתנגדות של הידית.'
                },
                'fibonacci_retracement': {
                    title: 'פיבונאצ\'י – חיפוש נקודות כניסה/יציאה',
                    description: 'בודק האם המחיר נעצר או מתהפך סביב רמות פיבונאצ\'י מרכזיות (38.2%, 50%, 61.8%) כדי להעריך תיקון בריא מול המשך מגמה.',
                    example: 'המניה מתקנת עד לרמת ‎61.8%‎ מן המהלך הקודם ולאחר מכן חוזרת לעלות.'
                }
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

            // Trigger actions
            trigger_actions: {
                'enter_trade_positive': {
                    label: 'כניסה לטרייד (חיובי)',
                    polarity: 'positive'
                },
                'scale_in_positive': {
                    label: 'הגדלת פוזיציה (חיובי)',
                    polarity: 'positive'
                },
                'exit_trade_negative': {
                    label: 'יציאה מהטרייד (שלילי)',
                    polarity: 'negative'
                },
                'scale_out_negative': {
                    label: 'הקטנת פוזיציה (שלילי)',
                    polarity: 'negative'
                }
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
                'parameters_required': 'יש למלא את כל הפרמטרים הנדרשים',
                'trigger_action_required': 'יש לבחור פעולה כשמתקיים תנאי',
                'action_notes_helper': 'הערות טקסט עשיר יוצגו למשתמש בעת הפעלת התנאי',
                'method_info_placeholder': 'בחר שיטת מסחר כדי לראות הסבר ודוגמה.',
                'condition_delete_confirm_title': 'מחיקת תנאי',
                'condition_delete_confirm_message': 'האם אתה בטוח שברצונך למחוק את התנאי הנבחר? הפעולה אינה הפיכה.',
                'condition_delete_confirm_secondary': 'המחיקה תשפיע רק על התנאי הנוכחי.',
                'single_condition_evaluated': 'התנאי נבדק בהצלחה.',
                'single_condition_evaluate_error': 'שגיאה בבדיקת התנאי.',
                'auto_alerts_enabled': 'התראות אוטומטיות הופעלו עבור תנאי זה.',
                'auto_alerts_disabled': 'התראות אוטומטיות כובו עבור תנאי זה.',
                'auto_alerts_toggle_error': 'שגיאה בעדכון מצב ההתראות.',
                'readiness_ready': 'מוכן',
                'readiness_waiting_for_data': 'ממתין לנתונים',
                'readiness_error': 'שגיאה',
                'readiness_ready_message': 'התנאי פעיל וניתן להערכה',
                'readiness_waiting_message': 'התנאי נשמר אבל יתחיל לעבוד לאחר השלמת נתונים',
                'readiness_error_message': 'שגיאה בבדיקת נתונים',
                'load_data_button': 'טען נתונים'
            },
            
            // Form Labels
            form: {
                'select_method': 'בחר שיטת מסחר',
                'method_parameters': 'פרמטרי השיטה',
                'logical_operator': 'אופרטור לוגי',
                'condition_group': 'קבוצת תנאי',
                'is_active': 'פעיל',
                'trigger_action': 'פעולה כשמתקיים',
                'action_notes': 'הערות לפעולה',
                'save_condition': 'שמור תנאי',
                'cancel': 'ביטול',
                'add_condition': 'הוסף תנאי',
                'edit_condition': 'ערוך תנאי',
                'delete_condition': 'מחק תנאי',
                'create_alert': 'צור התראה',
                'method_info_title': 'איך התנאי פועל',
                'method_example_label': 'דוגמה:'
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
     * Get method details (description + example)
     * @function getMethodDetails
     * @param {string} methodKey - Method key
     * @returns {{title: string, description: string, example: string}|null}
     */
    getMethodDetails(methodKey) {
        if (!methodKey) return null;
        const normalizedKey = this._generateMethodKey(methodKey);
        if (!normalizedKey) {
            return null;
        }
        const details = this.get(`method_details.${normalizedKey}`, null);
        if (!details) {
            return null;
        }
        return {
            title: details.title || this.getMethodName(normalizedKey),
            description: details.description || '',
            example: details.example || ''
        };
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
     * Get trigger action definitions
     * @returns {Object} Trigger action map
     */
    getTriggerActions() {
        return this.translations?.trigger_actions || {};
    }

    /**
     * Get trigger action label
     * @param {string} actionKey
     * @returns {string}
     */
    getTriggerActionLabel(actionKey) {
        if (!actionKey) {
            return this.getTriggerActions().enter_trade_positive?.label || actionKey;
        }
        const entry = this.getTriggerActions()[actionKey];
        return entry?.label || actionKey;
    }

    /**
     * Get trigger action polarity (positive/negative)
     * @param {string} actionKey
     * @returns {string}
     */
    getTriggerActionPolarity(actionKey) {
        if (!actionKey) {
            return 'positive';
        }
        const entry = this.getTriggerActions()[actionKey];
        return entry?.polarity || 'neutral';
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

        const triggerActionKey = condition.trigger_action || condition.triggerAction || 'enter_trade_positive';
        const triggerMeta = this.getTriggerActions?.()[triggerActionKey] || {};

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
            entity_type: entityType,
            trigger_action: triggerActionKey,
            trigger_action_label: triggerMeta.label || triggerActionKey,
            trigger_action_polarity: triggerMeta.polarity || 'neutral',
            action_notes: condition.action_notes || ''
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