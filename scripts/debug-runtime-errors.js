#!/usr/bin/env node

/**
 * Debug Runtime Errors - Mockups Pages
 * בודק שגיאות runtime בזמן אמת בדפדפן
 * מתעד stack traces מלאים
 * מזהה מיקום מדויק של שגיאות e.includes is not a function
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8080';
const BASE_DIR = path.resolve(__dirname, '..');

// רשימת עמודי מוקאפ עם שגיאות runtime ידועות
const PAGES_WITH_RUNTIME_ERRORS = [
    { 
        name: 'portfolio-state-page',
        path: '/mockups/daily-snapshots/portfolio-state-page.html'
    },
    { 
        name: 'emotional-tracking-widget',
        path: '/mockups/daily-snapshots/emotional-tracking-widget.html'
    },
    { 
        name: 'history-widget',
        path: '/mockups/daily-snapshots/history-widget.html'
    },
    { 
        name: 'trade-history-page',
        path: '/mockups/daily-snapshots/trade-history-page.html'
    }
];

const TIMEOUT = 30000; // 30 seconds

/**
 * בדיקת שגיאות runtime בעמוד בודד
 */
async function debugRuntimeErrors(browser, pageInfo) {
    const { name, path: pagePath } = pageInfo;
    const page = await browser.newPage();
    const results = {
        page: name,
        path: pagePath,
        runtimeErrors: [],
        consoleErrors: [],
        stackTraces: []
    };

    try {
        // האזנה לשגיאות קונסולה
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            
            if (type === 'error') {
                // דלג על שגיאות צפויות/לא קריטיות
                if (!text.includes('favicon') && 
                    !text.includes('extension') &&
                    !text.includes('chrome-extension') &&
                    !text.includes('net::ERR_')) {
                    results.consoleErrors.push({
                        type: type,
                        text: text,
                        location: msg.location()
                    });
                }
            }
        });

        // האזנה לשגיאות JavaScript עם stack traces
        page.on('pageerror', error => {
            const errorInfo = {
                message: error.message,
                stack: error.stack,
                name: error.name
            };
            
            // בדיקה אם זו שגיאת includes
            if (error.message && error.message.includes('includes is not a function')) {
                results.runtimeErrors.push({
                    type: 'e.includes is not a function',
                    ...errorInfo
                });
            } else {
                results.runtimeErrors.push({
                    type: 'JavaScript Error',
                    ...errorInfo
                });
            }
            
            results.stackTraces.push({
                error: error.message,
                stack: error.stack
            });
        });

        // טעינת העמוד
        console.log(`  📄 Loading: ${name}...`);
        await page.goto(`${BASE_URL}${pagePath}`, {
            waitUntil: 'networkidle2',
            timeout: TIMEOUT
        });

        // המתן לטעינת המשאבים והרצת קוד
        await new Promise(resolve => setTimeout(resolve, 3000));

        // ניסיון לזהות שגיאות runtime על ידי הרצת בדיקות
        try {
            // בדיקה אם יש שגיאות ב-console
            const consoleErrors = await page.evaluate(() => {
                const errors = [];
                // אין דרך ישירה לגשת ל-console errors, אבל נוכל לבדוק אם יש שגיאות
                return errors;
            });
        } catch (e) {
            // לא קריטי
        }

    } catch (error) {
        results.runtimeErrors.push({
            type: 'Page Load Error',
            message: error.message,
            stack: error.stack
        });
    } finally {
        await page.close();
    }

    return results;
}

/**
 * יצירת דוח
 */
function generateReport(allResults) {
    let report = `# דוח דיבוג שגיאות Runtime - עמודי מוקאפ
# Runtime Errors Debug Report - Mockups Pages

**תאריך:** ${new Date().toLocaleString('he-IL')}  
**סה"כ עמודים:** ${allResults.length}  
**עמודים עם שגיאות runtime:** ${allResults.filter(r => r.runtimeErrors.length > 0 || r.consoleErrors.length > 0).length}

---

## סיכום כללי

### סטטיסטיקות:
- **שגיאות runtime:** ${allResults.reduce((sum, r) => sum + r.runtimeErrors.length, 0)}
- **שגיאות קונסולה:** ${allResults.reduce((sum, r) => sum + r.consoleErrors.length, 0)}
- **Stack traces:** ${allResults.reduce((sum, r) => sum + r.stackTraces.length, 0)}

---

## דוח פרטני לכל עמוד

`;

    for (const result of allResults) {
        const hasErrors = result.runtimeErrors.length > 0 || result.consoleErrors.length > 0;
        const status = hasErrors ? '❌' : '✅';
        
        report += `### ${status} ${result.page}\n\n`;
        report += `**נתיב:** \`${result.path}\`\n\n`;

        if (result.runtimeErrors.length > 0) {
            report += `**❌ שגיאות Runtime:** ${result.runtimeErrors.length}\n`;
            for (const error of result.runtimeErrors) {
                report += `- **${error.type}:** ${error.message}\n`;
                if (error.stack) {
                    report += `  - Stack: \`${error.stack.split('\n')[0]}\`\n`;
                }
            }
            report += `\n`;
        }

        if (result.consoleErrors.length > 0) {
            report += `**❌ שגיאות קונסולה:** ${result.consoleErrors.length}\n`;
            for (const error of result.consoleErrors) {
                report += `- ${error.text}\n`;
                if (error.location) {
                    report += `  - Location: ${error.location.url}:${error.location.lineNumber}\n`;
                }
            }
            report += `\n`;
        }

        if (result.stackTraces.length > 0) {
            report += `**📋 Stack Traces:**\n\n`;
            for (const trace of result.stackTraces) {
                report += `\`\`\`\n${trace.stack}\n\`\`\`\n\n`;
            }
        }

        if (!hasErrors) {
            report += `**✅ אין שגיאות runtime**\n\n`;
        }

        report += `---\n\n`;
    }

    return report;
}

/**
 * הרצה ראשית
 */
async function main() {
    console.log('🔍 Starting runtime errors debugging...\n');
    console.log(`🌐 Base URL: ${BASE_URL}\n`);

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const allResults = [];

    try {
        for (const pageInfo of PAGES_WITH_RUNTIME_ERRORS) {
            console.log(`Debugging: ${pageInfo.name}...`);
            const result = await debugRuntimeErrors(browser, pageInfo);
            allResults.push(result);
            
            const errorsCount = result.runtimeErrors.length + result.consoleErrors.length;
            const status = errorsCount === 0 ? '✅' : '❌';
            console.log(`  ${status} ${pageInfo.name} (${errorsCount} errors)`);
        }
    } finally {
        await browser.close();
    }

    // יצירת דוח
    const report = generateReport(allResults);
    
    // שמירת דוח
    const reportPath = path.join(BASE_DIR, 'trading-ui', 'mockups', 'RUNTIME_ERRORS_DEBUG_REPORT.md');
    fs.writeFileSync(reportPath, report, 'utf-8');
    
    console.log(`\n📄 Report saved: ${reportPath}`);
    
    // סיכום
    const pagesWithErrors = allResults.filter(r => r.runtimeErrors.length > 0 || r.consoleErrors.length > 0).length;
    const totalErrors = allResults.reduce((sum, r) => sum + r.runtimeErrors.length + r.consoleErrors.length, 0);
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total pages: ${allResults.length}`);
    console.log(`   Pages with errors: ${pagesWithErrors}`);
    console.log(`   Total errors: ${totalErrors}`);
    
    if (pagesWithErrors > 0) {
        console.log(`\n⚠️  ${pagesWithErrors} page(s) have runtime errors. Check the report for details.`);
        process.exit(1);
    } else {
        console.log(`\n✅ No runtime errors found!`);
        process.exit(0);
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

