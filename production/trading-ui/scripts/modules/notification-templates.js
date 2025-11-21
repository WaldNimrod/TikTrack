/**
 * Notification Templates Module - TikTrack
 * ========================================
 * 
 * Predefined notification templates for consistent messaging
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated January 26, 2025
 */

if (window.Logger) {
    window.Logger.info('🎨 Loading Notification Templates Module...', { page: 'notification-templates' });
}

/**
 * Notification Templates Configuration
 */
const NOTIFICATION_TEMPLATES = {
    // Data Loading Templates
    'DATA_LOAD_FAILED': {
        type: 'error',
        title: 'שגיאה בטעינת נתונים',
        message: (context) => `לא ניתן לטעון ${context.entity || 'נתונים'}`,
        category: 'system',
        duration: 5000
    },
    
    'DATA_LOAD_SUCCESS': {
        type: 'success',
        title: 'נתונים נטענו בהצלחה',
        message: (context) => `${context.entity || 'נתונים'} נטענו בהצלחה`,
        category: 'system',
        duration: 3000
    },
    
    'DATA_LOADING': {
        type: 'info',
        title: 'טוען נתונים...',
        message: (context) => `טוען ${context.entity || 'נתונים'}...`,
        category: 'system',
        duration: 2000
    },

    // Save Operations Templates
    'SAVE_SUCCESS': {
        type: 'success',
        title: 'נשמר בהצלחה',
        message: (context) => `${context.entity || 'נתונים'} נשמרו בהצלחה`,
        category: 'business',
        duration: 3000
    },
    
    'SAVE_FAILED': {
        type: 'error',
        title: 'שגיאה בשמירה',
        message: (context) => `לא ניתן לשמור ${context.entity || 'נתונים'}`,
        category: 'business',
        duration: 5000
    },
    
    'SAVE_VALIDATION_ERROR': {
        type: 'warning',
        title: 'שגיאת תקינות',
        message: (context) => context.message || 'הנתונים לא תקינים',
        category: 'validation',
        duration: 4000
    },

    // Delete Operations Templates
    'DELETE_SUCCESS': {
        type: 'success',
        title: 'נמחק בהצלחה',
        message: (context) => `${context.entity || 'פריט'} נמחק בהצלחה`,
        category: 'business',
        duration: 3000
    },
    
    'DELETE_FAILED': {
        type: 'error',
        title: 'שגיאה במחיקה',
        message: (context) => `לא ניתן למחוק ${context.entity || 'פריט'}`,
        category: 'business',
        duration: 5000
    },
    
    'DELETE_CONFIRMATION': {
        type: 'warning',
        title: 'אישור מחיקה',
        message: (context) => `האם אתה בטוח שברצונך למחוק ${context.entity || 'פריט זה'}?`,
        category: 'confirmation',
        duration: 0 // Persistent until user action
    },

    // System Status Templates
    'SYSTEM_ERROR': {
        type: 'error',
        title: 'שגיאת מערכת',
        message: (context) => context.message || 'אירעה שגיאה במערכת',
        category: 'system',
        duration: 6000
    },
    
    'SYSTEM_WARNING': {
        type: 'warning',
        title: 'אזהרת מערכת',
        message: (context) => context.message || 'אזהרה מהמערכת',
        category: 'system',
        duration: 4000
    },
    
    'SYSTEM_INFO': {
        type: 'info',
        title: 'מידע מהמערכת',
        message: (context) => context.message || 'מידע מהמערכת',
        category: 'system',
        duration: 3000
    },

    // Network Templates
    'NETWORK_ERROR': {
        type: 'error',
        title: 'שגיאת רשת',
        message: (context) => 'בעיית חיבור לאינטרנט',
        category: 'network',
        duration: 5000
    },
    
    'API_ERROR': {
        type: 'error',
        title: 'שגיאת API',
        message: (context) => `שגיאה בשירות ${context.service || 'השרת'}`,
        category: 'api',
        duration: 5000
    },

    // User Action Templates
    'USER_ACTION_SUCCESS': {
        type: 'success',
        title: 'פעולה הושלמה',
        message: (context) => context.message || 'הפעולה הושלמה בהצלחה',
        category: 'user-action',
        duration: 3000
    },
    
    'USER_ACTION_FAILED': {
        type: 'error',
        title: 'פעולה נכשלה',
        message: (context) => context.message || 'הפעולה נכשלה',
        category: 'user-action',
        duration: 4000
    },

    // Development Templates
    'DEV_INFO': {
        type: 'info',
        title: 'מידע לפיתוח',
        message: (context) => context.message || 'מידע לפיתוח',
        category: 'development',
        duration: 3000
    },
    
    'DEV_WARNING': {
        type: 'warning',
        title: 'אזהרת פיתוח',
        message: (context) => context.message || 'אזהרה לפיתוח',
        category: 'development',
        duration: 4000
    },
    
    'DEV_ERROR': {
        type: 'error',
        title: 'שגיאת פיתוח',
        message: (context) => context.message || 'שגיאה בפיתוח',
        category: 'development',
        duration: 5000
    }
};

/**
 * Notification Templates Manager Class
 */
class NotificationTemplatesManager {
    constructor() {
        this.isInitialized = false;
    }

    /**
     * Initialize the templates manager
     */
    init() {
        if (this.isInitialized) {
            return;
        }

        try {
            // Make templates globally available
            window.NOTIFICATION_TEMPLATES = NOTIFICATION_TEMPLATES;
            window.notifyTemplate = this.notifyTemplate.bind(this);
            window.notifyError = this.notifyError.bind(this);
            window.notifySuccess = this.notifySuccess.bind(this);
            window.notifyWarning = this.notifyWarning.bind(this);
            window.notifyInfo = this.notifyInfo.bind(this);

            this.isInitialized = true;
            if (window.Logger) {
                window.Logger.info('✅ Notification Templates Manager initialized', { page: 'notification-templates' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error initializing Notification Templates Manager:', error, { page: 'notification-templates' });
            }
        }
    }

    /**
     * Show notification using template
     * @param {string} templateKey - Template key from NOTIFICATION_TEMPLATES
     * @param {object} context - Context object for template variables
     * @param {object} options - Additional options
     */
    notifyTemplate(templateKey, context = {}, options = {}) {
        try {
            const template = NOTIFICATION_TEMPLATES[templateKey];
            if (!template) {
                if (window.Logger) {
                    window.Logger.warning(`Template not found: ${templateKey}`, { page: 'notification-templates' });
                }
                return;
            }

            // Generate message from template
            const message = typeof template.message === 'function' 
                ? template.message(context) 
                : template.message;

            // Merge options with template defaults
            const notificationOptions = {
                type: template.type,
                title: template.title,
                message: message,
                category: template.category,
                duration: template.duration,
                ...options
            };

            // Show notification
            if (typeof window.showNotification === 'function') {
                window.showNotification(
                    notificationOptions.message,
                    notificationOptions.type,
                    notificationOptions.title,
                    notificationOptions.duration,
                    notificationOptions.category
                );
            } else {
                console.log(`Notification: ${notificationOptions.title} - ${notificationOptions.message}`);
            }

        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error showing template notification:', error, { page: 'notification-templates' });
            }
        }
    }

    /**
     * Show error notification using template
     * @param {string} templateKey - Template key
     * @param {object} context - Context object
     */
    notifyError(templateKey, context = {}) {
        this.notifyTemplate(templateKey, context, { type: 'error' });
    }

    /**
     * Show success notification using template
     * @param {string} templateKey - Template key
     * @param {object} context - Context object
     */
    notifySuccess(templateKey, context = {}) {
        this.notifyTemplate(templateKey, context, { type: 'success' });
    }

    /**
     * Show warning notification using template
     * @param {string} templateKey - Template key
     * @param {object} context - Context object
     */
    notifyWarning(templateKey, context = {}) {
        this.notifyTemplate(templateKey, context, { type: 'warning' });
    }

    /**
     * Show info notification using template
     * @param {string} templateKey - Template key
     * @param {object} context - Context object
     */
    notifyInfo(templateKey, context = {}) {
        this.notifyTemplate(templateKey, context, { type: 'info' });
    }

    /**
     * Get all available templates
     * @returns {object} All templates
     */
    getAllTemplates() {
        return NOTIFICATION_TEMPLATES;
    }

    /**
     * Get templates by category
     * @param {string} category - Category name
     * @returns {object} Templates in category
     */
    getTemplatesByCategory(category) {
        const templates = {};
        for (const [key, template] of Object.entries(NOTIFICATION_TEMPLATES)) {
            if (template.category === category) {
                templates[key] = template;
            }
        }
        return templates;
    }

    /**
     * Test a template
     * @param {string} templateKey - Template key
     * @param {object} context - Test context
     */
    testTemplate(templateKey, context = {}) {
        if (window.Logger) {
            window.Logger.info(`Testing template: ${templateKey}`, { page: 'notification-templates' });
        }
        
        // Add test context if none provided
        const testContext = {
            entity: 'פריט בדיקה',
            message: 'הודעה לבדיקה',
            service: 'שירות בדיקה',
            ...context
        };

        this.notifyTemplate(templateKey, testContext);
    }

    /**
     * Test all templates in a category
     * @param {string} category - Category name
     */
    testCategory(category) {
        const templates = this.getTemplatesByCategory(category);
        let delay = 0;

        for (const [key, template] of Object.entries(templates)) {
            setTimeout(() => {
                this.testTemplate(key);
            }, delay);
            delay += 2000; // 2 second delay between notifications
        }
    }
}

// Create global instance
const notificationTemplatesManager = new NotificationTemplatesManager();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        notificationTemplatesManager.init();
    });
} else {
    notificationTemplatesManager.init();
}

// Export globally
window.NotificationTemplatesManager = notificationTemplatesManager;

if (window.Logger) {
    window.Logger.info('✅ Notification Templates Module loaded successfully', { page: 'notification-templates' });
}
