#!/usr/bin/env node

/**
 * Verify Event Integration - TikTrack
 * ====================================
 * 
 * כלי בדיקת אינטגרציה בין מערכת האירועים למערכות אחרות
 * 
 * מטרה: לוודא שכל המערכות משתלבות נכון עם EventHandlerManager
 * 
 * @version 1.0.0
 * @created January 27, 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

// מערכות לבדיקה
const SYSTEMS_TO_CHECK = {
    'UnifiedTableSystem': {
        file: 'trading-ui/scripts/unified-table-system.js',
        checkSortableHeaders: true,
        checkDataOnclick: true
    },
    'ButtonSystem': {
        file: 'trading-ui/scripts/button-system-init.js',
        checkDataOnclick: true,
        checkButtonCreation: true
    },
    'ModalManagerV2': {
        file: 'trading-ui/scripts/modal-manager-v2.js',
        checkModalButtons: true
    },
    'UnifiedCacheSystem': {
        file: 'trading-ui/scripts/unified-cache-manager.js',
        checkRefreshButtons: true
    },
    'EventHandlerManager': {
        file: 'trading-ui/scripts/event-handler-manager.js',
        checkDataOnclickHandling: true
    }
};

/**
 * בדיקת UnifiedTableSystem
 */
function checkUnifiedTableSystem(filePath) {
    const results = {
        system: 'UnifiedTableSystem',
        status: 'unknown',
        issues: [],
        recommendations: []
    };
    
    if (!fs.existsSync(filePath)) {
        results.status = 'missing';
        results.issues.push('קובץ UnifiedTableSystem לא נמצא');
        return results;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // בדיקה אם יש תמיכה ב-sortable headers
    const hasSortSupport = /sortable|sort/i.test(content);
    if (!hasSortSupport) {
        results.issues.push('לא נמצא תמיכה ב-sortable headers');
    }
    
    // בדיקה אם יש אינטגרציה עם EventHandlerManager
    const hasEventHandlerIntegration = /EventHandlerManager|data-onclick/i.test(content);
    if (!hasEventHandlerIntegration) {
        results.issues.push('לא נמצא אינטגרציה עם EventHandlerManager');
        results.recommendations.push('הוסף תמיכה ב-data-onclick לכותרות סידור');
    }
    
    results.status = results.issues.length === 0 ? 'ok' : 'issues';
    return results;
}

/**
 * בדיקת Button System
 */
function checkButtonSystem(filePath) {
    const results = {
        system: 'ButtonSystem',
        status: 'unknown',
        issues: [],
        recommendations: []
    };
    
    if (!fs.existsSync(filePath)) {
        results.status = 'missing';
        results.issues.push('קובץ ButtonSystem לא נמצא');
        return results;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // בדיקה אם יוצרים כפתורים עם data-onclick
    const usesDataOnclick = /data-onclick/i.test(content);
    if (!usesDataOnclick) {
        results.issues.push('לא נמצא שימוש ב-data-onclick');
        results.recommendations.push('עדכן את createButtonFromData ליצור כפתורים עם data-onclick');
    }
    
    // בדיקה אם יש שימוש ב-onclick רגיל
    const usesOnclick = /onclick\s*=/i.test(content) && !/data-onclick/i.test(content);
    if (usesOnclick) {
        results.issues.push('נמצא שימוש ב-onclick רגיל');
        results.recommendations.push('המר את כל השימושים ל-data-onclick');
    }
    
    results.status = results.issues.length === 0 ? 'ok' : 'issues';
    return results;
}

/**
 * בדיקת ModalManagerV2
 */
function checkModalManagerV2(filePath) {
    const results = {
        system: 'ModalManagerV2',
        status: 'unknown',
        issues: [],
        recommendations: []
    };
    
    if (!fs.existsSync(filePath)) {
        results.status = 'missing';
        results.issues.push('קובץ ModalManagerV2 לא נמצא');
        return results;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // בדיקה אם יש תמיכה בכפתורי מודולים
    const hasModalButtons = /button|modal/i.test(content);
    if (!hasModalButtons) {
        results.issues.push('לא נמצא תמיכה בכפתורי מודולים');
    }
    
    // בדיקה אם יש תמיכה ב-data-onclick
    const usesDataOnclick = /data-onclick/i.test(content);
    if (!usesDataOnclick) {
        results.issues.push('לא נמצא תמיכה ב-data-onclick');
        results.recommendations.push('הוסף תמיכה ב-data-onclick לכפתורי מודולים');
    }
    
    results.status = results.issues.length === 0 ? 'ok' : 'issues';
    return results;
}

/**
 * בדיקת UnifiedCacheSystem
 */
function checkUnifiedCacheSystem(filePath) {
    const results = {
        system: 'UnifiedCacheSystem',
        status: 'unknown',
        issues: [],
        recommendations: []
    };
    
    if (!fs.existsSync(filePath)) {
        results.status = 'missing';
        results.issues.push('קובץ UnifiedCacheSystem לא נמצא');
        return results;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // בדיקה אם יש תמיכה בכפתורי ריענון
    const hasRefreshSupport = /refresh|clear|reload/i.test(content);
    if (!hasRefreshSupport) {
        results.issues.push('לא נמצא תמיכה בכפתורי ריענון');
    }
    
    results.status = results.issues.length === 0 ? 'ok' : 'issues';
    return results;
}

/**
 * בדיקת EventHandlerManager
 */
function checkEventHandlerManager(filePath) {
    const results = {
        system: 'EventHandlerManager',
        status: 'unknown',
        issues: [],
        recommendations: []
    };
    
    if (!fs.existsSync(filePath)) {
        results.status = 'missing';
        results.issues.push('קובץ EventHandlerManager לא נמצא');
        return results;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // בדיקה אם יש תמיכה ב-data-onclick
    const hasDataOnclickSupport = /data-onclick/i.test(content);
    if (!hasDataOnclickSupport) {
        results.issues.push('לא נמצא תמיכה ב-data-onclick');
        results.recommendations.push('הוסף תמיכה ב-data-onclick');
    }
    
    // בדיקה אם יש תמיכה ב-onclick רגיל (legacy)
    const hasOnclickSupport = /onclick/i.test(content) && !/data-onclick/i.test(content);
    if (hasOnclickSupport) {
        results.issues.push('נמצא תמיכה ב-onclick רגיל (legacy)');
        results.recommendations.push('שקול להסיר תמיכה ב-onclick רגיל אחרי מיגרציה מלאה');
    }
    
    results.status = results.issues.length === 0 ? 'ok' : 'issues';
    return results;
}

/**
 * בדיקת אינטגרציה בין כל המערכות
 */
function checkIntegrationBetweenSystems() {
    const results = {
        integration: 'unknown',
        issues: [],
        recommendations: []
    };
    
    // בדיקה אם UnifiedTableSystem משתמש ב-data-onclick
    const tableSystemPath = path.join(process.cwd(), SYSTEMS_TO_CHECK.UnifiedTableSystem.file);
    if (fs.existsSync(tableSystemPath)) {
        const tableContent = fs.readFileSync(tableSystemPath, 'utf8');
        const tableUsesDataOnclick = /data-onclick/i.test(tableContent);
        
        if (!tableUsesDataOnclick) {
            results.issues.push('UnifiedTableSystem לא משתמש ב-data-onclick');
            results.recommendations.push('עדכן את UnifiedTableSystem להשתמש ב-data-onclick לכותרות סידור');
        }
    }
    
    // בדיקה אם Button System משתמש ב-data-onclick
    const buttonSystemPath = path.join(process.cwd(), SYSTEMS_TO_CHECK.ButtonSystem.file);
    if (fs.existsSync(buttonSystemPath)) {
        const buttonContent = fs.readFileSync(buttonSystemPath, 'utf8');
        const buttonUsesDataOnclick = /data-onclick/i.test(buttonContent);
        
        if (!buttonUsesDataOnclick) {
            results.issues.push('Button System לא משתמש ב-data-onclick');
            results.recommendations.push('עדכן את Button System ליצור כפתורים עם data-onclick');
        }
    }
    
    results.integration = results.issues.length === 0 ? 'ok' : 'issues';
    return results;
}

/**
 * Main function
 */
function main() {
    console.log('🔍 מתחיל בדיקת אינטגרציה...\n');
    
    const allResults = [];
    
    // בדיקת כל המערכות
    Object.entries(SYSTEMS_TO_CHECK).forEach(([systemName, config]) => {
        console.log(`📂 בדיקת ${systemName}...`);
        
        const filePath = path.join(process.cwd(), config.file);
        let result;
        
        switch (systemName) {
            case 'UnifiedTableSystem':
                result = checkUnifiedTableSystem(filePath);
                break;
            case 'ButtonSystem':
                result = checkButtonSystem(filePath);
                break;
            case 'ModalManagerV2':
                result = checkModalManagerV2(filePath);
                break;
            case 'UnifiedCacheSystem':
                result = checkUnifiedCacheSystem(filePath);
                break;
            case 'EventHandlerManager':
                result = checkEventHandlerManager(filePath);
                break;
            default:
                result = { system: systemName, status: 'unknown', issues: [], recommendations: [] };
        }
        
        allResults.push(result);
        
        const statusIcon = result.status === 'ok' ? '✅' : result.status === 'missing' ? '❌' : '⚠️';
        console.log(`   ${statusIcon} ${result.status} - ${result.issues.length} בעיות`);
    });
    
    // בדיקת אינטגרציה בין המערכות
    console.log(`\n📂 בדיקת אינטגרציה בין מערכות...`);
    const integrationResult = checkIntegrationBetweenSystems();
    allResults.push({
        system: 'Integration',
        ...integrationResult
    });
    
    console.log(`\n✅ בדיקה הושלמה.\n`);
    
    // יצירת דוח
    const report = {
        timestamp: new Date().toISOString(),
        systems: allResults,
        summary: {
            total: allResults.length,
            ok: allResults.filter(r => r.status === 'ok').length,
            issues: allResults.filter(r => r.status === 'issues').length,
            missing: allResults.filter(r => r.status === 'missing').length
        }
    };
    
    // שמירת דוח JSON
    const jsonPath = path.join(process.cwd(), 'event-integration-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📄 דוח JSON נשמר: ${jsonPath}`);
    
    // הדפסת סיכום
    console.log('\n📊 סיכום:');
    console.log(`   סה"כ מערכות: ${report.summary.total}`);
    console.log(`   ✅ תקינות: ${report.summary.ok}`);
    console.log(`   ⚠️  בעיות: ${report.summary.issues}`);
    console.log(`   ❌ חסרות: ${report.summary.missing}`);
    
    // רשימת בעיות
    const allIssues = allResults.filter(r => r.issues.length > 0);
    if (allIssues.length > 0) {
        console.log('\n⚠️  בעיות שנמצאו:');
        allIssues.forEach(result => {
            console.log(`\n   ${result.system}:`);
            result.issues.forEach(issue => {
                console.log(`      - ${issue}`);
            });
            if (result.recommendations.length > 0) {
                console.log(`   המלצות:`);
                result.recommendations.forEach(rec => {
                    console.log(`      - ${rec}`);
                });
            }
        });
    }
    
    console.log('\n✅ סיום!');
    
    return report;
}

// הרצה אם הקובץ מופעל ישירות
if (require.main === module) {
    main();
}

module.exports = { main, checkUnifiedTableSystem, checkButtonSystem, checkModalManagerV2, checkUnifiedCacheSystem, checkEventHandlerManager };

