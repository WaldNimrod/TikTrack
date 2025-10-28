#!/usr/bin/env node

/**
 * Comprehensive Function Audit - TikTrack
 * ======================================
 * 
 * בדיקה מקיפה של דפוס הפונקציות החסרות בכל 13 עמודי המשתמש
 * 
 * הדפוס שזיהינו:
 * - קריאות לפונקציות לא קיימות (שמות ישנים)
 * - ייצוא גלובלי של פונקציות לא קיימות
 * - קוד כפול שנוצר במקום להשתמש במערכת המרכזית
 * 
 * @version 1.0.0
 * @created January 29, 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

// רשימת 13 עמודי המשתמש הבסיסיים
const USER_PAGES = [
    'index.html',
    'trades.html', 
    'trade_plans.html',
    'executions.html',
    'alerts.html',
    'tickers.html',
    'trading_accounts.html',
    'cash_flows.html',
    'notes.html',
    'research.html',
    'preferences.html',
    'db_display.html',
    'db_extradata.html'
];

// דפוסים נפוצים של קריאות לא מדויקות
const COMMON_PATTERNS = {
    // קריאות לפונקציות עריכה לא מדויקות
    editFunctions: [
        /edit(\w+)\(/g,
        /window\.edit(\w+)\(/g,
        /showEdit(\w+)Modal\(/g
    ],
    
    // קריאות לפונקציות מחיקה לא מדויקות
    deleteFunctions: [
        /delete(\w+)\(/g,
        /window\.delete(\w+)\(/g,
        /confirmDelete(\w+)\(/g,
        /showDelete(\w+)Modal\(/g
    ],
    
    // קריאות לפונקציות שמירה לא מדויקות
    saveFunctions: [
        /save(\w+)\(/g,
        /window\.save(\w+)\(/g,
        /save(\w+)Data\(/g
    ],
    
    // קריאות לפונקציות מודלים לא מדויקות
    modalFunctions: [
        /show(\w+)Modal\(/g,
        /window\.show(\w+)Modal\(/g,
        /open(\w+)Modal\(/g
    ],
    
    // קריאות לפונקציות מקושרים לא מדויקות
    linkedFunctions: [
        /viewLinkedItemsFor(\w+)\(/g,
        /window\.viewLinkedItemsFor(\w+)\(/g,
        /showLinkedItemsFor(\w+)\(/g
    ],
    
    // ייצוא גלובלי של פונקציות לא קיימות
    globalExports: [
        /window\.(\w+)\s*=\s*\1;/g,
        /window\.(\w+)\s*=\s*(\w+);/g
    ]
};

// פונקציות כלליות קיימות במערכת המרכזית
const CENTRAL_SYSTEM_FUNCTIONS = [
    'ModalManagerV2',
    'CRUDResponseHandler', 
    'EventHandlerManager',
    'EntityDetailsAPI',
    'viewLinkedItemsForTicker',
    'viewLinkedItemsForTrade',
    'viewLinkedItemsForAccount',
    'viewLinkedItemsForAlert',
    'viewLinkedItemsForCashFlow',
    'viewLinkedItemsForNote',
    'viewLinkedItemsForTradePlan',
    'viewLinkedItemsForExecution',
    'showEntityDetails',
    'validateEntityForm',
    'showNotification',
    'showSuccessNotification',
    'showErrorNotification',
    'showWarningNotification',
    'showInfoNotification'
];

class FunctionAuditor {
    constructor() {
        this.results = {
            totalPages: USER_PAGES.length,
            scannedPages: 0,
            issuesFound: [],
            duplicateCode: [],
            recommendations: []
        };
    }

    /**
     * סריקת עמוד בודד
     */
    async scanPage(pageName) {
        console.log(`🔍 סריקת עמוד: ${pageName}`);
        
        const pagePath = path.join(__dirname, '..', 'trading-ui', pageName);
        const scriptPath = path.join(__dirname, '..', 'trading-ui', 'scripts', pageName.replace('.html', '.js'));
        
        const issues = [];
        
        // בדיקת קובץ HTML
        if (fs.existsSync(pagePath)) {
            const htmlContent = fs.readFileSync(pagePath, 'utf8');
            issues.push(...this.scanHTMLContent(htmlContent, pageName));
        }
        
        // בדיקת קובץ JavaScript
        if (fs.existsSync(scriptPath)) {
            const jsContent = fs.readFileSync(scriptPath, 'utf8');
            issues.push(...this.scanJSContent(jsContent, pageName));
        }
        
        return issues;
    }

    /**
     * סריקת תוכן HTML
     */
    scanHTMLContent(content, pageName) {
        const issues = [];
        
        // חיפוש קריאות onclick לא מדויקות
        const onclickMatches = content.match(/onclick="([^"]+)"/g);
        if (onclickMatches) {
            onclickMatches.forEach(match => {
                const functionCall = match.match(/onclick="([^"]+)"/)[1];
                
                // בדיקה אם הפונקציה קיימת במערכת המרכזית
                const isCentralFunction = CENTRAL_SYSTEM_FUNCTIONS.some(func => 
                    functionCall.includes(func)
                );
                
                if (!isCentralFunction && !functionCall.includes('window.')) {
                    issues.push({
                        type: 'HTML_ONCLICK',
                        page: pageName,
                        issue: `קריאה לפונקציה לא מדויקת: ${functionCall}`,
                        recommendation: 'בדוק אם הפונקציה קיימת במערכת המרכזית'
                    });
                }
            });
        }
        
        return issues;
    }

    /**
     * סריקת תוכן JavaScript
     */
    scanJSContent(content, pageName) {
        const issues = [];
        
        // בדיקת דפוסים נפוצים
        Object.entries(COMMON_PATTERNS).forEach(([patternType, patterns]) => {
            patterns.forEach(pattern => {
                const matches = content.match(pattern);
                if (matches) {
                    matches.forEach(match => {
                        issues.push({
                            type: `JS_${patternType.toUpperCase()}`,
                            page: pageName,
                            issue: `דפוס חשוד: ${match}`,
                            recommendation: this.getRecommendation(patternType, match)
                        });
                    });
                }
            });
        });
        
        // בדיקת ייצוא גלובלי של פונקציות לא קיימות
        const globalExports = content.match(/window\.(\w+)\s*=\s*\1;/g);
        if (globalExports) {
            globalExports.forEach(exportLine => {
                const functionName = exportLine.match(/window\.(\w+)\s*=\s*\1;/)[1];
                
                // בדיקה אם הפונקציה מוגדרת בקובץ
                const functionDefined = content.includes(`function ${functionName}(`) || 
                                       content.includes(`async function ${functionName}(`) ||
                                       content.includes(`const ${functionName} =`) ||
                                       content.includes(`let ${functionName} =`);
                
                if (!functionDefined) {
                    issues.push({
                        type: 'JS_GLOBAL_EXPORT',
                        page: pageName,
                        issue: `ייצוא גלובלי של פונקציה לא קיימת: ${functionName}`,
                        recommendation: 'מחק את הייצוא או הגדר את הפונקציה'
                    });
                }
            });
        }
        
        // בדיקת קריאות לפונקציות לא קיימות
        const functionCalls = content.match(/(\w+)\(/g);
        if (functionCalls) {
            functionCalls.forEach(call => {
                const functionName = call.replace('(', '');
                
                // דילוג על פונקציות מובנות
                if (['console', 'window', 'document', 'fetch', 'setTimeout', 'setInterval', 'parseInt', 'parseFloat', 'JSON'].includes(functionName)) {
                    return;
                }
                
                // בדיקה אם הפונקציה מוגדרת או קיימת במערכת המרכזית
                const isDefined = content.includes(`function ${functionName}(`) || 
                                 content.includes(`async function ${functionName}(`) ||
                                 content.includes(`const ${functionName} =`) ||
                                 content.includes(`let ${functionName} =`) ||
                                 content.includes(`window.${functionName}`);
                
                const isCentralFunction = CENTRAL_SYSTEM_FUNCTIONS.includes(functionName);
                
                if (!isDefined && !isCentralFunction) {
                    issues.push({
                        type: 'JS_FUNCTION_CALL',
                        page: pageName,
                        issue: `קריאה לפונקציה לא קיימת: ${functionName}()`,
                        recommendation: 'בדוק אם הפונקציה קיימת במערכת המרכזית או הגדר אותה'
                    });
                }
            });
        }
        
        return issues;
    }

    /**
     * קבלת המלצה לפי סוג הדפוס
     */
    getRecommendation(patternType, match) {
        switch (patternType) {
            case 'editFunctions':
                return 'השתמש ב-showEditModal או ModalManagerV2.showEditModal';
            case 'deleteFunctions':
                return 'השתמש ב-EventHandlerManager.handleDeleteAction או EntityDetailsAPI.deleteEntity';
            case 'saveFunctions':
                return 'השתמש ב-ModalManagerV2 (טיפול אוטומטי) או CRUDResponseHandler';
            case 'modalFunctions':
                return 'השתמש ב-ModalManagerV2.showModal';
            case 'linkedFunctions':
                return 'השתמש ב-window.viewLinkedItemsFor[EntityType]';
            default:
                return 'בדוק את המערכת המרכזית לפונקציה המתאימה';
        }
    }

    /**
     * הרצת הבדיקה המקיפה
     */
    async runComprehensiveAudit() {
        console.log('🚀 מתחיל בדיקה מקיפה של דפוס הפונקציות החסרות...\n');
        
        for (const page of USER_PAGES) {
            try {
                const issues = await this.scanPage(page);
                this.results.issuesFound.push(...issues);
                this.results.scannedPages++;
                
                if (issues.length > 0) {
                    console.log(`⚠️  נמצאו ${issues.length} בעיות בעמוד ${page}`);
                } else {
                    console.log(`✅ עמוד ${page} נקי מבעיות`);
                }
            } catch (error) {
                console.error(`❌ שגיאה בסריקת עמוד ${page}:`, error.message);
            }
        }
        
        this.generateReport();
    }

    /**
     * יצירת דוח מפורט
     */
    generateReport() {
        console.log('\n📊 דוח בדיקה מקיפה - דפוס הפונקציות החסרות\n');
        console.log('='.repeat(60));
        
        console.log(`📈 סטטיסטיקות:`);
        console.log(`   • עמודים נסרקו: ${this.results.scannedPages}/${this.results.totalPages}`);
        console.log(`   • בעיות נמצאו: ${this.results.issuesFound.length}`);
        
        // קיבוץ לפי סוג בעיה
        const issuesByType = {};
        this.results.issuesFound.forEach(issue => {
            if (!issuesByType[issue.type]) {
                issuesByType[issue.type] = [];
            }
            issuesByType[issue.type].push(issue);
        });
        
        console.log(`\n🔍 פירוט בעיות לפי סוג:`);
        Object.entries(issuesByType).forEach(([type, issues]) => {
            console.log(`   • ${type}: ${issues.length} בעיות`);
        });
        
        // קיבוץ לפי עמוד
        const issuesByPage = {};
        this.results.issuesFound.forEach(issue => {
            if (!issuesByPage[issue.page]) {
                issuesByPage[issue.page] = [];
            }
            issuesByPage[issue.page].push(issue);
        });
        
        console.log(`\n📄 פירוט בעיות לפי עמוד:`);
        Object.entries(issuesByPage).forEach(([page, issues]) => {
            console.log(`   • ${page}: ${issues.length} בעיות`);
            issues.forEach(issue => {
                console.log(`     - ${issue.issue}`);
                console.log(`       💡 ${issue.recommendation}`);
            });
        });
        
        // המלצות כלליות
        console.log(`\n💡 המלצות כלליות:`);
        console.log(`   1. בדוק את כל הקריאות לפונקציות לא קיימות`);
        console.log(`   2. השתמש במערכת המרכזית במקום ליצור קוד כפול`);
        console.log(`   3. מחק ייצוא גלובלי של פונקציות לא קיימות`);
        console.log(`   4. עדכן קריאות לפונקציות עם השמות הנכונים`);
        
        // שמירת הדוח לקובץ
        const reportPath = path.join(__dirname, '..', 'reports', 'comprehensive-function-audit-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`\n💾 דוח נשמר ל: ${reportPath}`);
    }
}

// הרצת הבדיקה
if (require.main === module) {
    const auditor = new FunctionAuditor();
    auditor.runComprehensiveAudit().catch(console.error);
}

module.exports = FunctionAuditor;
