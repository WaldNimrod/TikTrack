/**
 * ========================================
 * CRUD Response Patterns Analyzer
 * ========================================
 * 
 * מטרה: זיהוי אוטומטי של כל מקומות הטיפול בתגובות CRUD
 * ושימוש ב-CRUDResponseHandler
 * 
 * רץ בקונסול הדפדפן:
 * 1. פתח כל עמוד CRUD
 * 2. העתק והרץ את הסקריפט
 * 3. קבל דוח מפורט של כל מקום לתיקון
 * 
 * תאריך: 10 אוקטובר 2025
 * ========================================
 */

console.log('🔍 Starting CRUD Response Patterns Analysis...\n');

// רשימת עמודי CRUD
const crudPages = [
    'trading_accounts',
    'trades', 
    'cash_flows',
    'trade_plans',
    'executions',
    'tickers',
    'alerts',
    'notes'
];

// תבניות לזיהוי
const patterns = {
    responseCheck: /if\s*\(\s*!response\.ok\s*\)/g,
    errorHandling: /if\s*\(\s*response\.status\s*===\s*400\s*\)/g,
    showSuccess: /showSuccessNotification/g,
    modalHide: /modal\.hide\(\)|Modal\.getInstance.*\.hide\(\)/g,
    cacheRemove: /UnifiedCacheManager\.remove/g,
    reloadFunction: /await\s+(load\w+Data|this\.load\w+)\(/g
};

// ניתוח
async function analyzePage(pageName) {
    try {
        const response = await fetch(`/scripts/${pageName}.js`);
        if (!response.ok) {
            console.log(`⚠️ ${pageName}: קובץ לא נמצא`);
            return null;
        }
        
        const code = await response.text();
        const lines = code.split('\n');
        
        // מציאת כל מקומות response.ok
        const matches = [];
        lines.forEach((line, index) => {
            if (line.match(/if\s*\(\s*!response\.ok\s*\)/)) {
                // מציאת שם הפונקציה
                let functionName = 'unknown';
                for (let i = index; i >= 0 && i > index - 50; i--) {
                    const fnMatch = lines[i].match(/(?:async\s+)?function\s+(\w+)/);
                    if (fnMatch) {
                        functionName = fnMatch[1];
                        break;
                    }
                    const arrowMatch = lines[i].match(/const\s+(\w+)\s*=.*=>/);
                    if (arrowMatch) {
                        functionName = arrowMatch[1];
                        break;
                    }
                }
                
                // בדיקת סוג הפעולה
                let operationType = 'unknown';
                const context = lines.slice(Math.max(0, index - 20), index).join('\n');
                if (context.match(/method:\s*['"]POST['"]/)) operationType = 'POST (save)';
                else if (context.match(/method:\s*['"]PUT['"]/)) operationType = 'PUT (update)';
                else if (context.match(/method:\s*['"]DELETE['"]/)) operationType = 'DELETE';
                
                // בדיקה אם כבר משתמש ב-CRUDResponseHandler
                const nextLines = lines.slice(index, index + 5).join('\n');
                const alreadyIntegrated = nextLines.includes('CRUDResponseHandler');
                
                matches.push({
                    line: index + 1,
                    function: functionName,
                    type: operationType,
                    integrated: alreadyIntegrated
                });
            }
        });
        
        return {
            page: pageName,
            total: matches.length,
            integrated: matches.filter(m => m.integrated).length,
            pending: matches.filter(m => !m.integrated).length,
            matches: matches
        };
        
    } catch (error) {
        console.error(`❌ ${pageName}: שגיאה בניתוח`, error);
        return null;
    }
}

// ריצה על כל העמודים
async function analyzeAll() {
    console.log('📊 מנתח את כל עמודי CRUD...\n');
    
    const results = [];
    for (const page of crudPages) {
        const result = await analyzePage(page);
        if (result) {
            results.push(result);
        }
    }
    
    // סיכום
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 סיכום ניתוח CRUD Response Patterns');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    let totalMatches = 0;
    let totalIntegrated = 0;
    let totalPending = 0;
    
    results.forEach(r => {
        const status = r.pending === 0 ? '✅' : '🔄';
        const percentage = r.total > 0 ? Math.round((r.integrated / r.total) * 100) : 0;
        
        console.log(`${status} ${r.page}.js:`);
        console.log(`   סה"כ: ${r.total} | משולבים: ${r.integrated} | ממתינים: ${r.pending} (${percentage}%)`);
        
        if (r.pending > 0) {
            console.log(`   פונקציות ממתינות:`);
            r.matches.filter(m => !m.integrated).forEach(m => {
                console.log(`      - שורה ${m.line}: ${m.function}() - ${m.type}`);
            });
        }
        console.log('');
        
        totalMatches += r.total;
        totalIntegrated += r.integrated;
        totalPending += r.pending;
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 סיכום כללי:');
    console.log(`   סה"כ מקומות: ${totalMatches}`);
    console.log(`   משולבים: ${totalIntegrated} (${Math.round((totalIntegrated/totalMatches)*100)}%)`);
    console.log(`   ממתינים: ${totalPending} (${Math.round((totalPending/totalMatches)*100)}%)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // המלצות
    console.log('💡 המלצות:');
    const pendingPages = results.filter(r => r.pending > 0);
    if (pendingPages.length > 0) {
        console.log(`   עמודים לשילוב (${pendingPages.length}):`);
        pendingPages.forEach(p => {
            console.log(`   - ${p.page}.js (${p.pending} מקומות)`);
        });
    } else {
        console.log('   ✅ כל העמודים משולבים! 🎉');
    }
    
    return results;
}

// הרצה
analyzeAll().then(results => {
    console.log('\n✅ ניתוח הושלם!');
    console.log('📋 התוצאות שמורות ב-window.crudAnalysisResults');
    window.crudAnalysisResults = results;
});

