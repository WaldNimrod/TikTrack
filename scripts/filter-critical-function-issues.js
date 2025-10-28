#!/usr/bin/env node

/**
 * Filter Critical Function Issues - TikTrack
 * ==========================================
 * 
 * סקריפט לסינון בעיות קריטיות בלבד מתוך הדוח המקיף
 * 
 * מסנן רק:
 * 1. קריאות לפונקציות שזוהו כלא קיימות בשגיאות קונסולה אמיתיות
 * 2. ייצוא גלובלי של פונקציות שאינן מוגדרות בקובץ
 * 3. קריאות ל-edit/delete/save functions שלא עוברות דרך המערכת המרכזית
 * 
 * @version 1.0.0
 * @created January 29, 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

// פונקציות מובנות ב-JavaScript שלא נחשבות לבעיות
const BUILT_IN_FUNCTIONS = [
    // DOM APIs
    'getElementById', 'querySelector', 'querySelectorAll', 'addEventListener', 'removeEventListener',
    'createElement', 'appendChild', 'removeChild', 'setAttribute', 'getAttribute',
    'classList', 'add', 'remove', 'contains', 'toggle',
    
    // Array methods
    'forEach', 'map', 'filter', 'reduce', 'find', 'some', 'every', 'push', 'pop',
    'shift', 'unshift', 'slice', 'splice', 'join', 'split', 'indexOf', 'includes',
    
    // String methods
    'toString', 'toLowerCase', 'toUpperCase', 'trim', 'substring', 'replace',
    'charAt', 'charCodeAt', 'localeCompare',
    
    // Number methods
    'toFixed', 'toLocaleString', 'toPrecision', 'valueOf',
    
    // Date methods
    'getTime', 'getFullYear', 'getMonth', 'getDate', 'getHours', 'getMinutes',
    'getSeconds', 'toISOString', 'toLocaleDateString', 'toLocaleString',
    
    // Object methods
    'keys', 'values', 'entries', 'hasOwnProperty', 'toString', 'valueOf',
    
    // Math functions
    'abs', 'ceil', 'floor', 'round', 'max', 'min', 'random', 'sqrt',
    
    // JSON methods
    'stringify', 'parse',
    
    // Console methods
    'log', 'error', 'warn', 'info', 'debug',
    
    // Other built-ins
    'isNaN', 'parseInt', 'parseFloat', 'setTimeout', 'setInterval', 'clearTimeout',
    'clearInterval', 'fetch', 'Promise', 'resolve', 'reject', 'then', 'catch',
    'Error', 'TypeError', 'ReferenceError', 'SyntaxError',
    
    // Browser APIs
    'alert', 'confirm', 'prompt', 'open', 'close', 'focus', 'blur',
    'getComputedStyle', 'getPropertyValue', 'setProperty',
    'writeText', 'readText', 'clipboard',
    
    // FormData
    'FormData', 'append', 'get', 'set', 'delete', 'has', 'entries',
    
    // NumberFormat
    'NumberFormat', 'format', 'formatToParts',
    
    // Other common functions
    'function', 'apply', 'call', 'bind', 'from'
];

// פונקציות במערכת המרכזית שלא נחשבות לבעיות
const CENTRAL_SYSTEM_FUNCTIONS = [
    'ModalManagerV2', 'CRUDResponseHandler', 'EventHandlerManager', 'EntityDetailsAPI',
    'viewLinkedItemsForTicker', 'viewLinkedItemsForTrade', 'viewLinkedItemsForAccount',
    'viewLinkedItemsForAlert', 'viewLinkedItemsForCashFlow', 'viewLinkedItemsForNote',
    'viewLinkedItemsForTradePlan', 'viewLinkedItemsForExecution', 'showEntityDetails',
    'validateEntityForm', 'showNotification', 'showSuccessNotification', 'showErrorNotification',
    'showWarningNotification', 'showInfoNotification', 'UnifiedCacheManager',
    'UnifiedInitializationSystem', 'NotificationSystem', 'Logger'
];

class CriticalIssuesFilter {
    constructor() {
        this.criticalIssues = [];
        this.stats = {
            totalIssues: 0,
            criticalIssues: 0,
            filteredOut: 0
        };
    }

    /**
     * סינון בעיות קריטיות מהדוח המקיף
     */
    filterCriticalIssues(comprehensiveReport) {
        console.log('🔍 מסנן בעיות קריטיות...');
        
        this.stats.totalIssues = comprehensiveReport.issuesFound.length;
        
        comprehensiveReport.issuesFound.forEach(issue => {
            if (this.isCriticalIssue(issue)) {
                this.criticalIssues.push(issue);
                this.stats.criticalIssues++;
            } else {
                this.stats.filteredOut++;
            }
        });
        
        console.log(`✅ סינון הושלם: ${this.stats.criticalIssues} בעיות קריטיות מתוך ${this.stats.totalIssues}`);
    }

    /**
     * בדיקה אם בעיה היא קריטית
     */
    isCriticalIssue(issue) {
        // ייצוא גלובלי של פונקציות לא קיימות - תמיד קריטי
        if (issue.type === 'JS_GLOBAL_EXPORT') {
            return true;
        }

        // דפוסים חשודים של קריאות לפונקציות - תמיד קריטי
        if (issue.type === 'JS_EDITFUNCTIONS' || 
            issue.type === 'JS_DELETEFUNCTIONS' || 
            issue.type === 'JS_SAVEFUNCTIONS' ||
            issue.type === 'JS_MODALFUNCTIONS' ||
            issue.type === 'JS_LINKEDFUNCTIONS') {
            return true;
        }

        // קריאות לפונקציות לא קיימות - רק אם לא פונקציה מובנת
        if (issue.type === 'JS_FUNCTION_CALL') {
            const functionName = this.extractFunctionName(issue.issue);
            
            // דילוג על פונקציות מובנות
            if (BUILT_IN_FUNCTIONS.includes(functionName)) {
                return false;
            }
            
            // דילוג על פונקציות במערכת המרכזית
            if (CENTRAL_SYSTEM_FUNCTIONS.includes(functionName)) {
                return false;
            }
            
            // דילוג על פונקציות עם window. prefix
            if (functionName.startsWith('window.')) {
                return false;
            }
            
            return true;
        }

        // HTML onclick קריאות - רק אם לא פונקציה מובנת
        if (issue.type === 'HTML_ONCLICK') {
            const functionName = this.extractFunctionNameFromOnclick(issue.issue);
            
            if (BUILT_IN_FUNCTIONS.includes(functionName)) {
                return false;
            }
            
            if (CENTRAL_SYSTEM_FUNCTIONS.includes(functionName)) {
                return false;
            }
            
            return true;
        }

        return false;
    }

    /**
     * חילוץ שם פונקציה מקריאה לפונקציה לא קיימת
     */
    extractFunctionName(issueText) {
        const match = issueText.match(/קריאה לפונקציה לא קיימת: (\w+)\(\)/);
        return match ? match[1] : '';
    }

    /**
     * חילוץ שם פונקציה מקריאת onclick
     */
    extractFunctionNameFromOnclick(issueText) {
        const match = issueText.match(/קריאה לפונקציה לא מדויקת: (\w+)\(/);
        return match ? match[1] : '';
    }

    /**
     * יצירת דוח קריטי מפורט
     */
    generateCriticalReport() {
        console.log('\n📊 יצירת דוח קריטי מפורט...');
        
        const report = {
            summary: {
                totalIssuesScanned: this.stats.totalIssues,
                criticalIssuesFound: this.stats.criticalIssues,
                issuesFilteredOut: this.stats.filteredOut,
                criticalPercentage: ((this.stats.criticalIssues / this.stats.totalIssues) * 100).toFixed(2)
            },
            criticalIssues: this.criticalIssues,
            issuesByType: this.groupIssuesByType(),
            issuesByPage: this.groupIssuesByPage(),
            recommendations: this.generateRecommendations()
        };

        return report;
    }

    /**
     * קיבוץ בעיות לפי סוג
     */
    groupIssuesByType() {
        const grouped = {};
        this.criticalIssues.forEach(issue => {
            if (!grouped[issue.type]) {
                grouped[issue.type] = [];
            }
            grouped[issue.type].push(issue);
        });
        return grouped;
    }

    /**
     * קיבוץ בעיות לפי עמוד
     */
    groupIssuesByPage() {
        const grouped = {};
        this.criticalIssues.forEach(issue => {
            if (!grouped[issue.page]) {
                grouped[issue.page] = [];
            }
            grouped[issue.page].push(issue);
        });
        return grouped;
    }

    /**
     * יצירת המלצות לתיקון
     */
    generateRecommendations() {
        return {
            immediate: [
                'תיקון ייצוא גלובלי של פונקציות לא קיימות',
                'החלפת קריאות לפונקציות edit/delete/save לפונקציות המערכת המרכזית',
                'מחיקת קוד כפול שנוצר במקום להשתמש במערכת המרכזית'
            ],
            systematic: [
                'בדיקה ידנית של כל הפונקציות שזוהו כבעייתיות',
                'וידוא שהפונקציונאליות ממשיכה לעבוד אחרי התיקונים',
                'תיעוד כל השינויים שבוצעו'
            ],
            prevention: [
                'יצירת כללי קידוד למניעת יצירת קוד כפול',
                'שימוש במערכת המרכזית לכל פעולות CRUD',
                'בדיקות אוטומטיות למניעת ייצוא גלובלי שגוי'
            ]
        };
    }

    /**
     * הרצת הסינון
     */
    async run() {
        try {
            console.log('🚀 מתחיל סינון בעיות קריטיות...\n');
            
            // קריאת הדוח המקיף
            const reportPath = path.join(__dirname, '..', 'reports', 'comprehensive-function-audit-report.json');
            if (!fs.existsSync(reportPath)) {
                throw new Error(`דוח מקיף לא נמצא: ${reportPath}`);
            }
            
            const comprehensiveReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
            console.log(`📄 נטען דוח מקיף עם ${comprehensiveReport.issuesFound.length} בעיות`);
            
            // סינון בעיות קריטיות
            this.filterCriticalIssues(comprehensiveReport);
            
            // יצירת דוח קריטי
            const criticalReport = this.generateCriticalReport();
            
            // שמירת הדוח הקריטי
            const criticalReportPath = path.join(__dirname, '..', 'reports', 'critical-function-issues.json');
            fs.writeFileSync(criticalReportPath, JSON.stringify(criticalReport, null, 2));
            
            // הדפסת סיכום
            this.printSummary(criticalReport);
            
            console.log(`\n💾 דוח קריטי נשמר ל: ${criticalReportPath}`);
            
        } catch (error) {
            console.error('❌ שגיאה בסינון:', error.message);
            process.exit(1);
        }
    }

    /**
     * הדפסת סיכום מפורט
     */
    printSummary(report) {
        console.log('\n📊 סיכום בעיות קריטיות\n');
        console.log('='.repeat(50));
        
        console.log(`📈 סטטיסטיקות:`);
        console.log(`   • בעיות נסרקו: ${report.summary.totalIssuesScanned}`);
        console.log(`   • בעיות קריטיות: ${report.summary.criticalIssuesFound}`);
        console.log(`   • בעיות מסוננות: ${report.summary.issuesFilteredOut}`);
        console.log(`   • אחוז קריטי: ${report.summary.criticalPercentage}%`);
        
        console.log(`\n🔍 פירוט לפי סוג:`);
        Object.entries(report.issuesByType).forEach(([type, issues]) => {
            console.log(`   • ${type}: ${issues.length} בעיות`);
        });
        
        console.log(`\n📄 פירוט לפי עמוד:`);
        Object.entries(report.issuesByPage).forEach(([page, issues]) => {
            console.log(`   • ${page}: ${issues.length} בעיות`);
        });
        
        console.log(`\n💡 המלצות מיידיות:`);
        report.recommendations.immediate.forEach(rec => {
            console.log(`   • ${rec}`);
        });
    }
}

// הרצת הסינון
if (require.main === module) {
    const filter = new CriticalIssuesFilter();
    filter.run().catch(console.error);
}

module.exports = CriticalIssuesFilter;
