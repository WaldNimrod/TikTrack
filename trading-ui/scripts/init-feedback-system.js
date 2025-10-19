/**
 * Enhanced Feedback System for Smart Initialization
 * מערכת משוב מתקדמת למערכת אתחול חכמה
 * 
 * תאריך יצירה: 19 אוקטובר 2025
 * גרסה: 1.0.0
 * סטטוס: ✅ פעיל
 * 
 * מספקת הודעות שגיאה מפורטות ומדויקות למשתמש
 * ומאפשרת דיבוג אופטימלי של בעיות אתחול
 */

class EnhancedFeedbackSystem {
    constructor() {
        this.errorCategories = {
            'INITIALIZATION': {
                name: 'שגיאות אתחול',
                icon: '🚀',
                color: '#dc3545',
                description: 'שגיאות הקשורות לתהליך האתחול הכללי'
            },
            'PACKAGE_LOADING': {
                name: 'שגיאות טעינת חבילות',
                icon: '📦',
                color: '#fd7e14',
                description: 'שגיאות הקשורות לטעינת חבילות מערכת'
            },
            'SYSTEM_DEPENDENCY': {
                name: 'שגיאות תלות מערכות',
                icon: '🔗',
                color: '#6f42c1',
                description: 'שגיאות הקשורות לתלויות בין מערכות'
            },
            'SCRIPT_LOADING': {
                name: 'שגיאות טעינת סקריפטים',
                icon: '📜',
                color: '#20c997',
                description: 'שגיאות הקשורות לטעינת קבצי JavaScript'
            },
            'CONFIGURATION': {
                name: 'שגיאות קונפיגורציה',
                icon: '⚙️',
                color: '#ffc107',
                description: 'שגיאות הקשורות להגדרות עמוד'
            },
            'PERFORMANCE': {
                name: 'בעיות ביצועים',
                icon: '⚡',
                color: '#17a2b8',
                description: 'אזהרות הקשורות לביצועים'
            },
            'COMPATIBILITY': {
                name: 'בעיות תאימות',
                icon: '🔧',
                color: '#6c757d',
                description: 'בעיות תאימות בין מערכות'
            }
        };

        this.severityLevels = {
            'CRITICAL': {
                name: 'קריטי',
                icon: '🚨',
                color: '#dc3545',
                priority: 1,
                description: 'שגיאה קריטית שמונעת את פעולת המערכת'
            },
            'ERROR': {
                name: 'שגיאה',
                icon: '❌',
                color: '#dc3545',
                priority: 2,
                description: 'שגיאה שמונעת פונקציונליות מסוימת'
            },
            'WARNING': {
                name: 'אזהרה',
                icon: '⚠️',
                color: '#ffc107',
                priority: 3,
                description: 'אזהרה שדורשת תשומת לב'
            },
            'INFO': {
                name: 'מידע',
                icon: 'ℹ️',
                color: '#17a2b8',
                priority: 4,
                description: 'מידע חשוב על פעולת המערכת'
            },
            'SUCCESS': {
                name: 'הצלחה',
                icon: '✅',
                color: '#28a745',
                priority: 5,
                description: 'פעולה הושלמה בהצלחה'
            }
        };

        this.errorHistory = [];
        this.maxHistorySize = 100;
        this.isInitialized = false;
        this.initializationStartTime = null;
        this.initializationEndTime = null;
    }

    /**
     * אתחול מערכת המשוב
     */
    async initialize() {
        try {
            this.initializationStartTime = Date.now();
            
            // בדיקת זמינות מערכת ההתראות
            if (typeof window.showNotification === 'function') {
                this.isInitialized = true;
                this.initializationEndTime = Date.now();
                this.logSuccess('EnhancedFeedbackSystem', 'מערכת המשוב אותחלה בהצלחה');
                return true;
            } else {
                throw new Error('מערכת ההתראות לא זמינה');
            }
        } catch (error) {
            console.error('שגיאה באתחול מערכת המשוב:', error);
            return false;
        }
    }

    /**
     * רישום שגיאה מפורטת
     */
    logError(category, severity, message, details = {}, context = {}) {
        const errorEntry = {
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            category: category,
            severity: severity,
            message: message,
            details: details,
            context: context,
            stack: this.getStackTrace(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // הוספה להיסטוריה
        this.errorHistory.unshift(errorEntry);
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
        }

        // הצגת הודעה למשתמש
        this.showUserNotification(errorEntry);

        // רישום בקונסול
        this.logToConsole(errorEntry);

        return errorEntry;
    }

    /**
     * רישום הצלחה
     */
    logSuccess(system, message, details = {}) {
        return this.logError('INITIALIZATION', 'SUCCESS', `${system}: ${message}`, details);
    }

    /**
     * רישום אזהרה
     */
    logWarning(category, message, details = {}) {
        return this.logError(category, 'WARNING', message, details);
    }

    /**
     * רישום מידע
     */
    logInfo(category, message, details = {}) {
        return this.logError(category, 'INFO', message, details);
    }

    /**
     * הצגת הודעה למשתמש
     */
    showUserNotification(errorEntry) {
        if (!this.isInitialized) {
            console.error('מערכת המשוב לא אותחלה');
            return;
        }

        const category = this.errorCategories[errorEntry.category];
        const severity = this.severityLevels[errorEntry.severity];

        // בניית הודעה מפורטת
        let notificationMessage = `${severity.icon} ${severity.name}: ${errorEntry.message}`;
        
        if (errorEntry.details && Object.keys(errorEntry.details).length > 0) {
            notificationMessage += '\n\nפרטים נוספים:';
            for (const [key, value] of Object.entries(errorEntry.details)) {
                notificationMessage += `\n• ${key}: ${value}`;
            }
        }

        if (errorEntry.context && Object.keys(errorEntry.context).length > 0) {
            notificationMessage += '\n\nהקשר:';
            for (const [key, value] of Object.entries(errorEntry.context)) {
                notificationMessage += `\n• ${key}: ${value}`;
            }
        }

        // הוספת קישור לדיבוג
        if (errorEntry.severity === 'CRITICAL' || errorEntry.severity === 'ERROR') {
            notificationMessage += `\n\n🔍 מזהה שגיאה: ${errorEntry.id}`;
            notificationMessage += '\nלצפייה בפרטים מלאים, פתח את קונסול הדפדפן';
        }

        // הצגת הודעה
        try {
            window.showNotification(notificationMessage, {
                type: this.getNotificationType(errorEntry.severity),
                duration: this.getNotificationDuration(errorEntry.severity),
                persistent: errorEntry.severity === 'CRITICAL',
                actions: this.getNotificationActions(errorEntry)
            });
        } catch (error) {
            console.error('שגיאה בהצגת הודעה:', error);
        }
    }

    /**
     * רישום בקונסול
     */
    logToConsole(errorEntry) {
        const category = this.errorCategories[errorEntry.category];
        const severity = this.severityLevels[errorEntry.severity];

        const logMessage = `[${category.icon} ${category.name}] ${severity.icon} ${severity.name}: ${errorEntry.message}`;
        
        switch (errorEntry.severity) {
            case 'CRITICAL':
            case 'ERROR':
                console.error(logMessage, errorEntry);
                break;
            case 'WARNING':
                console.warn(logMessage, errorEntry);
                break;
            case 'INFO':
                console.info(logMessage, errorEntry);
                break;
            case 'SUCCESS':
                console.log(logMessage, errorEntry);
                break;
            default:
                console.log(logMessage, errorEntry);
        }
    }

    /**
     * קבלת סוג הודעה
     */
    getNotificationType(severity) {
        switch (severity) {
            case 'CRITICAL':
            case 'ERROR':
                return 'error';
            case 'WARNING':
                return 'warning';
            case 'INFO':
                return 'info';
            case 'SUCCESS':
                return 'success';
            default:
                return 'info';
        }
    }

    /**
     * קבלת משך הצגת הודעה
     */
    getNotificationDuration(severity) {
        switch (severity) {
            case 'CRITICAL':
                return 0; // קבוע
            case 'ERROR':
                return 10000; // 10 שניות
            case 'WARNING':
                return 7000; // 7 שניות
            case 'INFO':
                return 5000; // 5 שניות
            case 'SUCCESS':
                return 3000; // 3 שניות
            default:
                return 5000;
        }
    }

    /**
     * קבלת פעולות הודעה
     */
    getNotificationActions(errorEntry) {
        const actions = [];

        if (errorEntry.severity === 'CRITICAL' || errorEntry.severity === 'ERROR') {
            actions.push({
                text: 'פתח קונסול',
                action: () => {
                    console.log('פתיחת קונסול דפדפן...');
                    // הדרכה למשתמש
                    this.showNotification('לפתיחת קונסול: F12 או Ctrl+Shift+I', {
                        type: 'info',
                        duration: 5000
                    });
                }
            });

            actions.push({
                text: 'דוח שגיאה',
                action: () => {
                    this.generateErrorReport(errorEntry);
                }
            });
        }

        return actions;
    }

    /**
     * יצירת דוח שגיאה
     */
    generateErrorReport(errorEntry) {
        const report = {
            errorId: errorEntry.id,
            timestamp: errorEntry.timestamp,
            category: errorEntry.category,
            severity: errorEntry.severity,
            message: errorEntry.message,
            details: errorEntry.details,
            context: errorEntry.context,
            stack: errorEntry.stack,
            userAgent: errorEntry.userAgent,
            url: errorEntry.url,
            systemInfo: {
                initializationTime: this.initializationEndTime - this.initializationStartTime,
                errorHistoryCount: this.errorHistory.length,
                isInitialized: this.isInitialized
            }
        };

        // העתקה ללוח
        navigator.clipboard.writeText(JSON.stringify(report, null, 2)).then(() => {
            this.showNotification('דוח שגיאה הועתק ללוח', {
                type: 'success',
                duration: 3000
            });
        }).catch(() => {
            // הצגת הדוח בחלון
            const reportWindow = window.open('', '_blank');
            reportWindow.document.write(`
                <html>
                    <head>
                        <title>דוח שגיאה - ${errorEntry.id}</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            pre { background: #f5f5f5; padding: 15px; border-radius: 5px; }
                            .header { background: #dc3545; color: white; padding: 10px; border-radius: 5px; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>דוח שגיאה - ${errorEntry.id}</h1>
                        </div>
                        <pre>${JSON.stringify(report, null, 2)}</pre>
                    </body>
                </html>
            `);
        });
    }

    /**
     * יצירת מזהה שגיאה ייחודי
     */
    generateErrorId() {
        return 'ERR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * קבלת stack trace
     */
    getStackTrace() {
        try {
            throw new Error();
        } catch (e) {
            return e.stack;
        }
    }

    /**
     * קבלת היסטוריית שגיאות
     */
    getErrorHistory(limit = 10) {
        return this.errorHistory.slice(0, limit);
    }

    /**
     * קבלת סטטיסטיקות שגיאות
     */
    getErrorStatistics() {
        const stats = {
            total: this.errorHistory.length,
            byCategory: {},
            bySeverity: {},
            recent: this.errorHistory.slice(0, 5),
            critical: this.errorHistory.filter(e => e.severity === 'CRITICAL').length,
            errors: this.errorHistory.filter(e => e.severity === 'ERROR').length,
            warnings: this.errorHistory.filter(e => e.severity === 'WARNING').length
        };

        // סטטיסטיקות לפי קטגוריה
        for (const error of this.errorHistory) {
            stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1;
            stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
        }

        return stats;
    }

    /**
     * ניקוי היסטוריית שגיאות
     */
    clearErrorHistory() {
        this.errorHistory = [];
        this.logInfo('INITIALIZATION', 'היסטוריית שגיאות נוקתה');
    }

    /**
     * בדיקת תקינות מערכת
     */
    validateSystem() {
        const validation = {
            isInitialized: this.isInitialized,
            notificationSystemAvailable: typeof window.showNotification === 'function',
            errorHistorySize: this.errorHistory.length,
            initializationTime: this.initializationEndTime - this.initializationStartTime,
            issues: []
        };

        if (!validation.isInitialized) {
            validation.issues.push('מערכת המשוב לא אותחלה');
        }

        if (!validation.notificationSystemAvailable) {
            validation.issues.push('מערכת ההתראות לא זמינה');
        }

        if (validation.errorHistorySize > this.maxHistorySize * 0.8) {
            validation.issues.push('היסטוריית שגיאות קרובה לגבול המקסימלי');
        }

        return validation;
    }

    /**
     * הצגת הודעה (wrapper)
     */
    showNotification(message, options = {}) {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, options);
        } else {
            console.log('Notification:', message, options);
        }
    }
}

// יצירת instance גלובלי
window.enhancedFeedbackSystem = new EnhancedFeedbackSystem();

// אתחול אוטומטי
document.addEventListener('DOMContentLoaded', async () => {
    await window.enhancedFeedbackSystem.initialize();
});

// חשיפת API גלובלי
window.EnhancedFeedbackSystem = EnhancedFeedbackSystem;
window.logError = (category, severity, message, details, context) => {
    return window.enhancedFeedbackSystem.logError(category, severity, message, details, context);
};
window.logSuccess = (system, message, details) => {
    return window.enhancedFeedbackSystem.logSuccess(system, message, details);
};
window.logWarning = (category, message, details) => {
    return window.enhancedFeedbackSystem.logWarning(category, message, details);
};
window.logInfo = (category, message, details) => {
    return window.enhancedFeedbackSystem.logInfo(category, message, details);
};

// חשיפת פונקציות עזר
window.getErrorHistory = (limit) => {
    return window.enhancedFeedbackSystem.getErrorHistory(limit);
};
window.getErrorStatistics = () => {
    return window.enhancedFeedbackSystem.getErrorStatistics();
};
window.clearErrorHistory = () => {
    return window.enhancedFeedbackSystem.clearErrorHistory();
};
window.validateFeedbackSystem = () => {
    return window.enhancedFeedbackSystem.validateSystem();
};

console.log('✅ Enhanced Feedback System loaded successfully');
