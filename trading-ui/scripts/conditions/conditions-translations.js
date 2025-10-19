/**
 * Conditions Translations - TikTrack
 * ==================================
 *
 * מערכת תרגום ספציפית למערכת התנאים
 * משתמש במערכת התרגום הכללית translation-utils.js
 *
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated October 19, 2025
 */

/**
 * Conditions Translation Manager
 * מנהל תרגום ספציפי לתנאים
 */
class ConditionsTranslations {
    constructor() {
        this.translations = {
            // Trading Methods
            methods: {
                'moving_average': 'ממוצע נע',
                'rsi': 'RSI',
                'support_resistance': 'תמיכה והתנגדות',
                'trend_lines': 'קווי מגמה',
                'technical_patterns': 'מבנים טכניים',
                'fibonacci': 'פיבונצי'
            },
            
            // Method Categories
            categories: {
                'trend_following': 'מעקב מגמה',
                'mean_reversion': 'חזרה לממוצע',
                'momentum': 'מומנטום',
                'volatility': 'תנודתיות',
                'volume': 'נפח',
                'pattern': 'מבנה'
            },
            
            // Parameters
            parameters: {
                'period': 'תקופה',
                'threshold': 'סף',
                'level': 'רמה',
                'strength': 'עוצמה',
                'timeframe': 'מסגרת זמן',
                'sensitivity': 'רגישות'
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
     * Get translation for key
     * קבלת תרגום למפתח
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
     * Get method name translation
     * קבלת תרגום שם שיטה
     */
    getMethodName(methodKey) {
        return this.get(`methods.${methodKey}`, methodKey);
    }
    
    /**
     * Get category name translation
     * קבלת תרגום שם קטגוריה
     */
    getCategoryName(categoryKey) {
        return this.get(`categories.${categoryKey}`, categoryKey);
    }
    
    /**
     * Get parameter name translation
     * קבלת תרגום שם פרמטר
     */
    getParameterName(parameterKey) {
        return this.get(`parameters.${parameterKey}`, parameterKey);
    }
    
    /**
     * Get operator translation
     * קבלת תרגום אופרטור
     */
    getOperator(operatorKey) {
        return this.get(`operators.${operatorKey}`, operatorKey);
    }
    
    /**
     * Get status translation
     * קבלת תרגום סטטוס
     */
    getStatus(statusKey) {
        return this.get(`status.${statusKey}`, statusKey);
    }
    
    /**
     * Get action translation
     * קבלת תרגום פעולה
     */
    getAction(actionKey) {
        return this.get(`actions.${actionKey}`, actionKey);
    }
    
    /**
     * Get message translation
     * קבלת תרגום הודעה
     */
    getMessage(messageKey) {
        return this.get(`messages.${messageKey}`, messageKey);
    }
    
    /**
     * Get form label translation
     * קבלת תרגום תווית טופס
     */
    getFormLabel(labelKey) {
        return this.get(`form.${labelKey}`, labelKey);
    }
    
    /**
     * Translate condition object
     * תרגום אובייקט תנאי
     */
    translateCondition(condition) {
        if (!condition) return null;
        
        return {
            ...condition,
            method_name: this.getMethodName(condition.method_key),
            category_name: this.getCategoryName(condition.category),
            status_name: this.getStatus(condition.status),
            logical_operator_name: this.getOperator(condition.logical_operator)
        };
    }
    
    /**
     * Translate method object
     * תרגום אובייקט שיטה
     */
    translateMethod(method) {
        if (!method) return null;
        
        return {
            ...method,
            name: this.getMethodName(method.key),
            category_name: this.getCategoryName(method.category)
        };
    }
    
    /**
     * Translate parameters object
     * תרגום אובייקט פרמטרים
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
}

// Create global instance
window.conditionsTranslations = new ConditionsTranslations();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConditionsTranslations;
}