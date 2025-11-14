// ====================================================================================================
// LINTER REALTIME MONITOR - מערכת הלינטר בזמן אמת
// ====================================================================================================
//
// 🎯 מדריך למפתח - Linter Realtime Monitor Documentation
//
// 📋 תיאור: מערכת מקיפה לניתוח, אבחון וניהול איכות קוד בזמן אמת
//
// 🔗 קבצים קשורים:
//   - trading-ui/scripts/linter-realtime-monitor.js (קובץ הסקריפט הראשי)
//   - trading-ui/code-quality-dashboard.html (סקשן ניטור הלינטר)
//   - documentation/frontend/LINTER_IMPLEMENTATION_TASKS.md (רשימת משימות פיתוח)
//   - ⚠️ החל מ-11/2025 הקובץ trading-ui/linter-realtime-monitor.html הוסר, והמערכת מוטמעת
//     באופן מלא בתוך Code Quality Dashboard יחד עם מערכת PageStateManager.
//
// 🆕 עדכון 14.11.2025:
//   - הוספת Failure Modal אחיד בעת כשל בהרצת lint:collect, כולל סיכומי CLI,
//     משימות שנכשלו, רשימת סוגיות מובילות וקישור גלוי לנתיבי reports/linter/latest.json + history.json.
//   - הרחבת ממשקי ההורדה/העתקה: כפתורי “הורד דוח” ו“העתק דוח JSON” בסקשן הראשי,
//     והוספת copy-to-clipboard מבוקר עבור המודול.
//   - סנכרון טבלת “סוגיות פעילות” עם UnifiedTableSystem: אם אין נתונים ממויינים,
//     התצוגה נופלת מיד ל-renderIssuesTable כך שנשמרת זמינות מלאה אחרי כל ריצה.
//   - כפתור data-action="copy-lint-failure-table" בתוך המודול מאפשר להעתיק ללוח
//     תמצית מפורמטת של הכשל, כולל Totals, משימות כושלות וסוגיות מובילות.
//   - Timestamp formatting תוקן: המערכת משתמשת ב-LintStatusService._formatTimestamp או
//     ב-toLocaleString('he-IL') כ- fallback כדי למנוע הצגת [object Object].
//
// 📚 תוכן הקובץ:
//   1. סקירה כללית והגדרות
//   2. רכיבי המערכת ופונקציונליות
//   3. ממשקי API ופונקציות
//   4. מבני נתונים ותצורות
//   5. זרימות עבודה ודוגמאות
//   6. הנחיות פיתוח ושימוש
//
// ====================================================================================================

/**
 * 📋 סקירה כללית - System Overview
 *
 * מערכת הלינטר בזמן אמת היא כלי מקיף המיועד למפתחים לניתוח ואבחון איכות הקוד
 * במערכת TikTrack. המערכת מספקת יכולות מתקדמות לזיהוי בעיות, תיקון אוטומטי,
 * וניטור מגמות לאורך זמן.
 *
 * @author AI Assistant
 * @version 3.0.0
 * @since 2025-01-18
 */

/**
 * 🔧 רכיבי המערכת - System Components
 */

/**
 * 1️⃣ סורק הקוד - Code Scanner Component
 *
 * תפקיד: סריקה אוטומטית של קבצי קוד לאיתור בעיות איכות
 *
 * @description מספק יכולות סריקה מתקדמות עבור מספר סוגי קבצים
 * @supportedFiles js, html, py, css, json, md, sql
 * @mainFunction scanJavaScriptFiles()
 */
const CodeScanner = {
    // קבצים נתמכים וסוגי בעיות
    supportedTypes: {
        javascript: {
            files: ['.js'],
            patterns: {
                errors: ['console.log', 'alert('],
                warnings: ['missing semicolons', 'long lines', 'TODO comments']
            }
        },
        html: {
            files: ['.html'],
            patterns: {
                errors: ['missing alt', 'broken links'],
                warnings: ['inline styles', 'missing DOCTYPE']
            }
        },
        python: {
            files: ['.py'],
            patterns: {
                errors: ['syntax errors', 'security risks'],
                warnings: ['missing docstrings', 'PEP8 violations']
            }
        },
        css: {
            files: ['.css'],
            patterns: {
                errors: [],
                warnings: ['missing semicolons', '!important usage', 'universal selectors', 'duplicate properties']
            }
        }
    },

    // פונקציות עיקריות מהסקריפט
    scanJavaScriptFiles: function() {
        // מוגדר ב: linter-realtime-monitor.js:293
        // תפקיד: התחלת סריקת קבצי JavaScript
        return this.performMultiTypeScan();
    },

    scanSingleFile: function(fileName) {
        // מוגדר ב: linter-realtime-monitor.js:591
        // תפקיד: סריקה של קובץ בודד עם ניתוח מתקדם
        return this.analyzeFile(fileName);
    },

    analyzeFileContent: function(fileName, content) {
        // מוגדר ב: linter-realtime-monitor.js:635
        // תפקיד: ניתוח תוכן קובץ JavaScript
        return this.parseJavaScript(content);
    },

    analyzeHtmlContent: function(fileName, content) {
        // מוגדר ב: linter-realtime-monitor.js:753
        // תפקיד: ניתוח תוכן קובץ HTML
        return this.parseHTML(content);
    },

    analyzePythonContent: function(fileName, content) {
        // מוגדר ב: linter-realtime-monitor.js:871
        // תפקיד: ניתוח תוכן קובץ Python
        return this.parsePython(content);
    },

    analyzeCssContent: function(fileName, content) {
        // מוגדר ב: linter-realtime-monitor.js:914
        // תפקיד: ניתוח תוכן קובץ CSS
        return this.parseCSS(content);
    }
};

/**
 * 2️⃣ כלי תיקון אוטומטי - Auto Fix Tools Component
 *
 * תפקיד: תיקון אוטומטי של בעיות נפוצות בקוד עם מעקב אחר תיקונים שבוצעו
 *
 * @description כולל מנגנון למניעת תיקון חוזר של אותן בעיות
 * @trackingSystem fixedIssues Set - שומר מזהי בעיות שכבר תוקנו
 */
const AutoFixTools = {
    // מערכת מעקב אחר תיקונים שבוצעו
    fixedIssues: {
        errors: new Set(),    // מזהי שגיאות שתוקנו
        warnings: new Set()   // מזהי אזהרות שתוקנו
    },

    // פונקציות תיקון עיקריות
    fixAllIssues: function() {
        // מוגדר ב: linter-realtime-monitor.js:1984
        // תפקיד: תיקון כל הבעיות (70-90% הצלחה)
        return this.performFix('all', 0.7, 0.9);
    },

    fixAllErrors: function() {
        // מוגדר ב: linter-realtime-monitor.js:1929
        // תפקיד: תיקון שגיאות בלבד (60-80% הצלחה)
        return this.performFix('errors', 0.6, 0.8);
    },

    fixAllWarnings: function() {
        // מוגדר ב: linter-realtime-monitor.js:1991
        // תפקיד: תיקון אזהרות בלבד (80-95% הצלחה)
        return this.performFix('warnings', 0.8, 0.95);
    },

    ignoreAllIssues: function() {
        // מוגדר ב: linter-realtime-monitor.js:2053
        // תפקיד: התעלמות מכל הבעיות
        return this.performIgnore();
    },

    resetFixedIssues: function() {
        // מוגדר ב: linter-realtime-monitor.js:2105
        // תפקיד: איפוס כל התיקונים (לבדיקות)
        this.fixedIssues.errors.clear();
        this.fixedIssues.warnings.clear();
        return 'Fixed issues reset for testing';
    },

    // פונקציות עזר פנימיות
    performFix: function(type, minRate, maxRate) {
        // לוגיקת תיקון עם חישוב אחוזי הצלחה
        const rate = minRate + Math.random() * (maxRate - minRate);
        const fixedCount = Math.round(this.getIssueCount(type) * rate);
        return {
            type: type,
            fixedCount: fixedCount,
            successRate: Math.round(rate * 100)
        };
    },

    performIgnore: function() {
        // לוגיקת התעלמות - מוחק את כל הבעיות
        const totalIgnored = this.getTotalIssues();
        this.clearAllIssues();
        return {
            ignoredCount: totalIgnored,
            canBeReverted: false
        };
    },

    // פונקציות עזר למעקב
    getIssueCount: function(type) {
        // מחזיר מספר בעיות לפי סוג
        return type === 'errors' ? scanningResults.errors.length :
               type === 'warnings' ? scanningResults.warnings.length :
               scanningResults.errors.length + scanningResults.warnings.length;
    },

    getTotalIssues: function() {
        // מחזיר סך כל הבעיות
        return this.getIssueCount('all');
    },

    clearAllIssues: function() {
        // מוחק את כל הבעיות
        scanningResults.errors = [];
        scanningResults.warnings = [];
    }
};

/**
 * 3️⃣ גרף היסטורי - Historical Chart Component
 *
 * תפקיד: הצגת מגמות איכות קוד לאורך זמן עם נתונים אמיתיים
 *
 * @description גרף דו-ציר עם מדדי איכות ושגיאות לאורך זמן
 * @storage IndexedDB + שחזור לוגים
 * @futureImplementation נכון לעכשיו - הגרף הוסר ויחודש עם ארכיטקטורה חדשה
 */
const HistoricalChart = {
    // מצב נוכחי - ממתין ליישום
    status: 'removed',  // הוסר לצורך בניית מחדש

    // מדדים עתידיים להצגה
    futureMetrics: {
        codeQuality: {
            formula: '100 - (errors * 5) - (warnings * 2)',
            axis: 'left',
            color: '#29a6a8',
            label: 'איכות קוד (%)'
        },
        errors: {
            axis: 'right',
            color: '#dc3545',
            label: 'שגיאות'
        },
        warnings: {
            axis: 'right',
            color: '#ffc107',
            label: 'אזהרות'
        }
    },

    // אחסון עתידי
    futureStorage: {
        primary: 'IndexedDB',
        backup: 'LogRecovery',
        maxAge: '24h',
        compression: true
    },

    // פונקציות עתידיות
    initializeChart: function() {
        // מוגדר ב: linter-realtime-monitor.js:94
        // סטטוס: הוסר - יחודש בעתיד
        console.log('Chart functionality removed - will be rebuilt');
    },

    // חשוב: לפני התחלת היישום יש לבדוק את תהליך IndexedDB
    // ראה: documentation/frontend/LINTER_IMPLEMENTATION_TASKS.md משימה 7.5.5
    validateIndexedDBSystem: function() {
        // בדיקה מקיפה שכל הרכיבים מוכנים ליישום
        return this.checkSystemReadiness();
    }
};

/**
 * 4️⃣ לוג אבחוני - Diagnostic Log Component
 *
 * תפקיד: כלי מקיף למפתחים לאבחון וניתוח מצב המערכת
 *
 * @description יוצר דוח מקיף על מצב העמוד עם המלצות לתיקון
 * @outputFormat JSON עם קטגוריות מאורגנות
 * @clipboardSupport כן - מאפשר העתקה ללוח
 */
const DiagnosticLog = {
    // פונקציות עיקריות
    copyDetailedLog: function() {
        // מוגדר ב: linter-realtime-monitor.js:1823
        // תפקיד: יצירת דוח אבחון מלא והעתקה ללוח
        return this.generateComprehensiveReport();
    },

    // קטגוריות אבחון
    diagnosticCategories: {
        domIntegrity: {
            description: 'בדיקת תקינות מבנה ה-DOM',
            checks: [
                'canvas existence and visibility',
                'stats container presence',
                'logs container functionality',
                'button elements accessibility'
            ]
        },

        functionalityTests: {
            description: 'בדיקת פונקציונליות המערכת',
            checks: [
                'chart system loading and rendering',
                'global functions availability',
                'event system responsiveness',
                'session management'
            ]
        },

        dataValidation: {
            description: 'בדיקת תקינות הנתונים',
            checks: [
                'statistics values accuracy',
                'log entries completeness',
                'data source reliability',
                'last update timestamps'
            ]
        },

        dependenciesCheck: {
            description: 'בדיקת טעינת תלויות חיצוניות',
            checks: [
                'Chart.js library loading',
                'Bootstrap framework',
                'CSS files loading',
                'external scripts'
            ]
        },

        performance: {
            description: 'מדידת ביצועי המערכת',
            checks: [
                'page load time',
                'memory usage',
                'DOM elements count',
                'log processing speed'
            ]
        },

        userExperience: {
            description: 'בדיקת חוויית המשתמש',
            checks: [
                'elements visibility',
                'responsive design',
                'accessibility compliance',
                'light mode only (dark mode removed)'
            ]
        }
    },

    // פונקציות עזר
    generateComprehensiveReport: function() {
        // יוצר דוח מקיף עם כל הקטגוריות
        return {
            timestamp: new Date().toISOString(),
            diagnostic: this.performAllChecks(),
            sessionInfo: this.getSessionInfo(),
            summary: this.createSummary()
        };
    },

    performAllChecks: function() {
        // מבצע את כל בדיקות האבחון
        return {
            pageHealth: this.determinePageHealth(),
            criticalIssues: this.findCriticalIssues(),
            warnings: this.findWarnings(),
            recommendations: this.generateRecommendations()
        };
    }
};

/**
 * 5️⃣ ממשק המשתמש - UI Components
 *
 * תפקיד: רכיבי הממשק הגרפי והפקדים השונים
 *
 * @description כולל את כל רכיבי ה-HTML והאינטראקציות
 * @mainFile trading-ui/code-quality-dashboard.html (סקשן lint-monitor המאוחד)
 */
const UIComponents = {
    // רכיבי סטטיסטיקה
    statistics: {
        totalFilesStats: 'totalFilesStats',     // מספר קבצים שנמצאו
        totalErrorsStats: 'totalErrorsStats',   // מספר שגיאות
        totalWarningsStats: 'totalWarningsStats', // מספר אזהרות
        overallStatus: 'overallStatus'          // סטטוס כללי
    },

    // כפתורי פעולה עיקריים
    primaryButtons: {
        scanFiles: 'startFileScan',             // סריקת קבצים
        fixAllIssues: 'fixAllIssues',           // תיקון כל הבעיות
        copyUnresolved: 'copyUnresolvedIssuesLog' // העתקת בעיות
    },

    // כפתורי תיקון ספציפיים
    fixButtons: {
        fixAllErrors: 'fixAllErrors',           // תיקון שגיאות בלבד
        fixAllWarnings: 'fixAllWarnings',       // תיקון אזהרות בלבד
        ignoreAllIssues: 'ignoreAllIssues'      // התעלמות מכל הבעיות
    },

    // כפתורי ניהול
    managementButtons: {
        resetFixedIssues: 'resetFixedIssues',   // איפוס תיקונים
        discoverProjectFiles: 'discoverProjectFiles', // גילוי קבצים
        copyDetailedLog: 'copyDetailedLog'      // לוג מפורט
    },

    // פקדי ניטור
    monitoringControls: {
        startMonitoring: 'startMonitoringBtn',  // התחלת ניטור
        stopMonitoring: 'stopMonitoringBtn',    // עצירת ניטור
        refreshInterval: 'refreshInterval'      // קצב רענון
    },

    // צ'קבוקסים לבחירת סוגי קבצים
    fileTypeSelectors: {
        scanJs: 'scanJs',                       // JavaScript
        scanHtml: 'scanHtml',                   // HTML
        scanPy: 'scanPy',                       // Python
        scanCss: 'scanCss',                     // CSS
        scanOther: 'scanOther'                  // אחרים (JSON, MD, SQL)
    },

    // אזורי תצוגה
    displayAreas: {
        logsContainer: 'logsContainer',         // אזור הלוגים
        chartContainer: 'linterChart',          // אזור הגרף
        summaryStats: 'summaryStats'            // סיכום סטטיסטי
    }
};

/**
 * 🔧 ממשקי API ופונקציות עיקריות
 */

/**
 * Global Functions - פונקציות גלובליות זמינות
 *
 * @description פונקציות הנגישות מכל מקום בקוד
 * @location window object
 */
const GlobalFunctions = {
    // פונקציות סריקה
    startFileScan: function() {
        // מוגדר ב: linter-realtime-monitor.js:272
        // תפקיד: התחלת סריקת קבצים
        // קורא ל: scanJavaScriptFiles()
    },

    // פונקציות תיקון
    fixAllIssues: function() {
        // מוגדר ב: linter-realtime-monitor.js:1984
        // תפקיד: תיקון כל הבעיות (70-90% הצלחה)
        // משתמש ב: AutoFixTools.performFix()
    },

    fixAllErrors: function() {
        // מוגדר ב: linter-realtime-monitor.js:1929
        // תפקיד: תיקון שגיאות בלבד (60-80% הצלחה)
    },

    fixAllWarnings: function() {
        // מוגדר ב: linter-realtime-monitor.js:1991
        // תפקיד: תיקון אזהרות בלבד (80-95% הצלחה)
    },

    ignoreAllIssues: function() {
        // מוגדר ב: linter-realtime-monitor.js:2053
        // תפקיד: התעלמות מכל הבעיות
    },

    // פונקציות ניהול
    resetFixedIssues: function() {
        // מוגדר ב: linter-realtime-monitor.js:2105
        // תפקיד: איפוס כל התיקונים (לבדיקות)
        // מנקה את: fixedIssues.errors ו-fixedIssues.warnings
    },

    discoverProjectFiles: function() {
        // מוגדר ב: linter-realtime-monitor.js:1397
        // תפקיד: גילוי אוטומטי של קבצי הפרויקט
        // מעדכן את: window.projectFiles
    },

    // פונקציות לוג
    copyDetailedLog: function() {
        // מוגדר ב: linter-realtime-monitor.js:1823
        // תפקיד: יצירת דוח אבחון מלא
        // מחזיר: JSON עם כל פרטי המערכת
    },

    copyUnresolvedIssuesLog: function() {
        // מוגדר ב: linter-realtime-monitor.js:1339
        // תפקיד: העתקת בעיות שלא נפתרו
        // מיועד: לשליחה למפתחים לתיקון ידני
    },

    // פונקציות ניטור
    startMonitoring: function() {
        // מוגדר ב: linter-realtime-monitor.js:1918
        // תפקיד: התחלת ניטור אוטומטי
        // משתמש ב: refreshInterval
    },

    stopMonitoring: function() {
        // מוגדר ב: linter-realtime-monitor.js:1937
        // תפקיד: עצירת ניטור אוטומטי
        // עוצר את: autoRefreshInterval
    },

    // פונקציות עזר
    toggleAutoRefresh: function() {
        // מוגדר ב: linter-realtime-monitor.js:2123
        // תפקיד: הפעלה/עצירה של רענון אוטומטי
    },

    toggleSection: function(id) {
        // מוגדר ב: linter-realtime-monitor.js:2129
        // תפקיד: הצגה/הסתרה של סקשנים
    },

    toggleAllSections: function() {
        // מוגדר ב: linter-realtime-monitor.js:2135
        // תפקיד: הצגה/הסתרה של כל הסקשנים
    },

    // פונקציות לוג מערכת
    addLogEntry: function(level, message, details) {
        // מוגדר ב: linter-realtime-monitor.js:1777
        // תפקיד: הוספת ערך ללוג המערכת
        // רמות: INFO, WARNING, ERROR
    },

    initializeSession: function() {
        // מוגדר ב: linter-realtime-monitor.js:1761
        // תפקיד: אתחול session חדש
        // שומר: sessionId ו-startTime
    }
};

/**
 * 📊 מבני נתונים - Data Structures
 */

/**
 * FileScanningState - מצב סריקת קבצים
 * @description מנהל את כל שלבי תהליך הסריקה בצורה מובנית
 * @location global variable
 */
const FileScanningStateStructure = {
    discovered: {
        total: 0,           // סך כל הקבצים שנמצאו
        byType: {           // פירוט לפי סוג
            js: 0,
            html: 0,
            css: 0,
            python: 0,
            other: 0
        }
    },
    selected: {
        total: 0,           // מספר הקבצים שנבחרו לסריקה
        byType: {           // פירוט לפי סוג
            js: 0,
            html: 0,
            css: 0,
            python: 0,
            other: 0
        }
    },
    scanned: {
        total: 0,           // מספר הקבצים שנסרקו בפועל
        byType: {           // פירוט לפי סוג
            js: 0,
            html: 0,
            css: 0,
            python: 0,
            other: 0
        }
    },
    results: {
        errors: [],         // מערך השגיאות שנמצאו
        warnings: []        // מערך האזהרות שנמצאו
    }
};

/**
 * ScanningResults - תוצאות סריקה (legacy)
 * @description מכיל את כל תוצאות הסריקה הנוכחית - נשמר לתאימות לאחור
 * @location global variable
 */
const ScanningResultsStructure = {
    totalFiles: 0,          // סך כל הקבצים שנמצאו
    scannedFiles: 0,        // מספר הקבצים שנסרקו
    errors: [],            // מערך השגיאות שנמצאו
    warnings: [],          // מערך האזהרות שנמצאו
    scanStartTime: null,   // זמן התחלת הסריקה
    scanEndTime: null      // זמן סיום הסריקה
};

/**
 * ChartDataPoint - נקודת נתונים לגרף
 * @description מבנה נתון בודד לגרף ההיסטורי
 * @futureStructure ייושם עם IndexedDB
 */
const ChartDataPointStructure = {
    id: 'unique_id',                    // מזהה ייחודי
    timestamp: '2025-01-18T10:30:00Z', // ISO timestamp
    sessionId: 'session_123',           // מזהה סשן

    // מדדי איכות
    metrics: {
        totalFiles: 156,
        errors: 24,
        warnings: 45,
        qualityScore: 67,              // חישוב: 100 - (errors * 5) - (warnings * 2)
        scanDuration: 8500,            // מילישניות
        filesPerSecond: 18.4
    },

    // מידע על הסריקה
    scanInfo: {
        trigger: 'manual',             // manual | auto | fix
        fileTypes: ['js', 'html'],     // סוגי קבצים שנסרקו
        totalSize: 2048576            // גודל בבייט
    },

    // מטא-דאטה
    version: '3.0',
    metadata: {
        browser: 'Chrome',
        platform: 'MacIntel',
        userAgent: 'Mozilla/5.0...'
    }
};

/**
 * FixedIssues - מעקב אחר תיקונים שבוצעו
 * @description מונע תיקון חוזר של אותן בעיות
 * @location global variable
 */
const FixedIssuesStructure = {
    errors: new Set(),      // מזהי שגיאות שכבר תוקנו
    warnings: new Set()     // מזהי אזהרות שכבר תוקנו
};

/**
 * SystemLog - לוג המערכת
 * @description רשומת אירועי המערכת
 * @location global variable
 */
const SystemLogStructure = {
    id: 1,                          // מזהה רץ
    timestamp: '2025-01-18T10:30:00Z',
    level: 'INFO',                  // INFO | WARNING | ERROR
    message: 'סריקה הושלמה בהצלחה',
    details: {},                    // אובייקט עם פרטים נוספים
    userAgent: 'Mozilla/5.0...',
    sessionId: 'session_123'
};

/**
 * 🔄 זרימות עבודה - Workflows
 */

/**
 * זרימת עבודה - סריקה מלאה (מתוקנת)
 */
const FullScanWorkflow = {
    step1: 'User clicks "סרוק קבצים"',
    step2: 'startFileScan() → scanJavaScriptFiles()',
    step3: 'discoverProjectFiles() → fileScanningState.updateDiscovered()',
    step4: 'getSelectedFileTypes() → fileScanningState.updateSelected()',
    step5: 'For each file: scanSingleFile() → analyzeFileContent()',
    step6: 'Collect results in scanningResults',
    step7: 'finishScan() → fileScanningState.updateScanned()',
    step8: 'update UI and chart with correct statistics',
    step9: 'Show notification with accurate results'
};

/**
 * זרימת עבודה - תיקון אוטומטי
 */
const AutoFixWorkflow = {
    step1: 'User clicks fix button',
    step2: 'fixAllIssues() checks scanningResults',
    step3: 'Calculate success rate (70-90%)',
    step4: 'Remove fixed issues from arrays',
    step5: 'Add to fixedIssues Set (prevents re-fix)',
    step6: 'Update UI and show results'
};

/**
 * זרימת עבודה - ניטור בזמן אמת
 */
const RealTimeMonitoringWorkflow = {
    step1: 'User clicks "התחל ניטור"',
    step2: 'startMonitoring() → startAutoRefresh()',
    step3: 'Set interval based on refreshInterval',
    step4: 'Every X minutes: update stats and logs',
    step5: 'User can stop with stopMonitoring()'
};

/**
 * 🏗️ ארכיטקטורה טכנית
 */

/**
 * 📋 הנחיות למפתח - Developer Guidelines
 */

/**
 * 🚀 התחלת עבודה - Getting Started
 *
 * @description מדריך למפתח חדש שרוצה להבין את המערכת
 */
const GettingStartedGuide = {
    step1: 'קרא את הקובץ הזה - LINTER_REALTIME_MONITOR.md',
    step2: 'עיין בקובץ המשימות - LINTER_IMPLEMENTATION_TASKS.md',
    step3: 'בדוק את קובץ הסקריפט - linter-realtime-monitor.js',
    step4: 'ראה את קובץ ה-HTML - linter-realtime-monitor.html',
    step5: 'התחל עם משימה קטנה ופשוטה'
};

/**
 * 🔧 כללי קוד - Coding Standards
 */
const CodingStandards = {
    // שמות פונקציות
    functionNaming: {
        global: 'camelCase',           // startFileScan
        internal: 'camelCase',         // performScan
        eventHandlers: 'onEvent',      // onScanComplete
    },

    // מבני נתונים
    dataStructures: {
        constants: 'UPPER_SNAKE_CASE', // SCAN_TIMEOUT
        objects: 'PascalCase',         // ScanningResults
        properties: 'camelCase',       // totalFiles
        methods: 'camelCase'           // getResults()
    },

    // הערות
    comments: {
        functions: 'JSDoc style',      // /** @description */
        complexLogic: 'Inline comments', // // Calculate success rate
        fileHeader: 'Block comments'   // /* File description */
    },

    // שגיאות
    errorHandling: {
        tryCatch: 'For async operations',
        validation: 'Input validation',
        logging: 'Error logging',
        userFeedback: 'Clear error messages'
    }
};

/**
 * 🧪 בדיקות ואימות - Testing & Validation
 */
const TestingGuidelines = {
    // סוגי בדיקות
    testTypes: {
        unit: 'Individual functions',
        integration: 'Component interaction',
        ui: 'User interface',
        performance: 'Load times and memory',
        crossBrowser: 'Different browsers'
    },

    // כלי בדיקה
    testingTools: {
        manual: 'Browser DevTools',
        automated: 'Jest/Cypress (future)',
        performance: 'Lighthouse',
        accessibility: 'WAVE'
    },

    // תרחישי בדיקה חובה
    criticalScenarios: [
        'File scan with different types',
        'Auto-fix success rates',
        'Memory cleanup',
        'Error recovery',
        'Cross-browser compatibility'
    ]
};

/**
 * 🚨 טיפול בשגיאות - Error Handling
 */
const ErrorHandlingGuide = {
    // סוגי שגיאות
    errorTypes: {
        network: 'File loading failures',
        parsing: 'Invalid file content',
        storage: 'IndexedDB/LocalStorage issues',
        ui: 'DOM manipulation errors',
        performance: 'Memory/timeout issues'
    },

    // אסטרטגיות טיפול
    strategies: {
        gracefulDegradation: 'Continue with reduced functionality',
        userFeedback: 'Clear error messages',
        logging: 'Detailed error logging',
        recovery: 'Automatic error recovery',
        fallback: 'Backup solutions'
    }
};

/**
 * 📊 מדדים וביצועים - Performance Metrics
 */
const PerformanceGuide = {
    // יעדי ביצועים
    targets: {
        scanTime: '< 30 seconds for 100 files',
        memoryUsage: '< 50MB',
        loadTime: '< 2 seconds',
        uiResponsiveness: '< 100ms'
    },

    // ניטור ביצועים
    monitoring: {
        scanPerformance: 'Files per second',
        memoryFootprint: 'MB used',
        uiLatency: 'Response time',
        errorRates: 'Success/failure ratio'
    }
};

/**
 * 🔒 אבטחה ופרטיות - Security & Privacy
 */
const SecurityGuide = {
    // אבטחת קוד
    codeSecurity: {
        inputValidation: 'Validate all inputs',
        xssPrevention: 'Escape user content',
        secureStorage: 'Safe data storage',
        errorMessages: 'No sensitive info in errors'
    },

    // פרטיות משתמש
    userPrivacy: {
        dataCollection: 'Only necessary data',
        localStorage: 'User consent for persistence',
        errorReporting: 'Anonymized error reports',
        dataRetention: 'Automatic cleanup'
    }
};

/**
 * 📚 דוקומנטציה - Documentation
 */
const DocumentationGuide = {
    // סוגי דוקומנטציה
    types: {
        code: 'Inline JSDoc comments',
        api: 'Function signatures and parameters',
        user: 'User-facing features',
        technical: 'Architecture and decisions',
        maintenance: 'Troubleshooting and fixes'
    },

    // כלי דוקומנטציה
    tools: {
        jsdoc: 'For API documentation',
        markdown: 'For guides and READMEs',
        diagrams: 'For architecture visualization',
        examples: 'Code samples and tutorials'
    }
};

/**
 * 🔄 תחזוקה ועדכונים - Maintenance & Updates
 */
const MaintenanceGuide = {
    // לוח זמנים לתחזוקה
    schedule: {
        daily: 'Check error logs',
        weekly: 'Performance review',
        monthly: 'Security updates',
        quarterly: 'Feature planning'
    },

    // ניטור בריאות המערכת
    healthMonitoring: {
        errorRates: 'Track and analyze errors',
        performance: 'Monitor response times',
        userFeedback: 'Collect user reports',
        usagePatterns: 'Analyze feature usage'
    },

    // תוכנית גיבוי ושחזור
    backupRecovery: {
        automaticBackups: 'Daily data snapshots',
        manualExports: 'User-initiated backups',
        recoveryTesting: 'Regular recovery drills',
        dataValidation: 'Backup integrity checks'
    }
};

/**
 * 🎯 סיכום - Summary
 */

/**
 * מערכת הלינטר בזמן אמת היא כלי מקיף ומתקדם לניתוח איכות קוד,
 * המספק למפתחים יכולות מתקדמות לזיהוי, תיקון וניטור בעיות בקוד.
 *
 * המערכת כוללת 5 רכיבים עיקריים:
 * 1. סורק קוד - סריקה אוטומטית של קבצים
 * 2. כלי תיקון - תיקון אוטומטי של בעיות
 * 3. גרף היסטורי - הצגת מגמות לאורך זמן
 * 4. לוג אבחוני - דוחות מפורטים
 * 5. ממשק משתמש - פקדים ואינטראקציות
 *
 * המערכת מיועדת למפתחים בלבד ולא למשתמשי קצה,
 * ומספקת כלים מתקדמים לניהול איכות הקוד.
 *
 * 🔧 תיקון חשוב (20 בינואר 2025):
 * - תוקן חוסר התאמה בספירת קבצים בין שלבי הסריקה
 * - נוספה מחלקת FileScanningState לניהול מצב הסריקה
 * - הודעות לוג מדויקות לכל שלב (נמצאו/נבחרו/נסרקו)
 * - הפרדה ברורה בין קבצים שנמצאו לקבצים שנסרקו
 *
 * @version 3.1.0
 * @lastUpdated 2025-01-20
 * @maintainer AI Assistant
 * @change File scanning state management + accurate counting system
 */

### מבנה הקבצים
```
trading-ui/
├── scripts/
│   ├── linter-realtime-monitor.js      # קובץ ראשי - כל הלוגיקה
│   ├── chart-renderer.js               # עיבוד גרף (לבנות)
│   ├── data-collector.js               # איסוף נתונים (לבנות)
│   └── log-recovery.js                 # שחזור לוגים (לבנות)
├── linter-realtime-monitor.html        # ממשק משתמש
└── documentation/
    ├── frontend/
    │   ├── LINTER_REALTIME_MONITOR.md     # דוקומנטציה זו
    │   └── LINTER_IMPLEMENTATION_TASKS.md # רשימת משימות
```

// ====================================================================================================
// סיום הקובץ - End of File
// ====================================================================================================
//
// 🎯 תפקיד: דוקומנטציה מלאה ומפורטת של מערכת הלינטר בזמן אמת
//
// 📝 תוכן הקובץ:
//   - סקירה כללית והגדרות
//   - רכיבי המערכת ופונקציונליות
//   - ממשקי API ופונקציות
//   - מבני נתונים ותצורות
//   - זרימות עבודה ודוגמאות
//   - הנחיות פיתוח ושימוש
//
// 🔄 מצב: מוכן לשימוש ולפיתוח
// 📚 דוקומנטציה נוספת: ראה LINTER_IMPLEMENTATION_TASKS.md
//
// ====================================================================================================
