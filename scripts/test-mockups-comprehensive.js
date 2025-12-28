#!/usr/bin/env node

/**
 * Comprehensive Mockups Testing
 * בודק את כל עמודי המוקאפ:
 * - קונסולה נקייה 100%
 * - תפקוד ממשקים
 * - תפקוד כפתורים
 * - Header System
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8080';
const BASE_DIR = path.resolve(__dirname, '..');

// רשימת עמודי מוקאפ
const MOCKUP_PAGES = [
    { 
        name: 'comparative-analysis-page',
        path: '/mockups/daily-snapshots/comparative_analysis_page.html'
    },
    { 
        name: 'date-comparison-modal',
        path: '/mockups/daily-snapshots/date_comparison_modal.html'
    },
    { 
        name: 'economic-calendar-page',
        path: '/mockups/daily-snapshots/economic_calendar_page.html'
    },
    { 
        name: 'emotional-tracking-widget',
        path: '/mockups/daily-snapshots/emotional_tracking_widget.html'
    },
    { 
        name: 'history-widget',
        path: '/mockups/daily-snapshots/history_widget.html'
    },
    { 
        name: 'portfolio-state-page',
        path: '/mockups/daily-snapshots/portfolio_state_page.html'
    },
    { 
        name: 'price-history-page',
        path: '/mockups/daily-snapshots/price_history_page.html'
    },
    { 
        name: 'strategy-analysis-page',
        path: '/mockups/daily-snapshots/strategy_analysis_page.html'
    },
    { 
        name: 'trade-history-page',
        path: '/mockups/daily-snapshots/trade_history_page.html'
    },
    { 
        name: 'trading-journal-page',
        path: '/mockups/daily-snapshots/trading_journal_page.html'
    },
    { 
        name: 'tradingview-test-page',
        path: '/mockups/daily-snapshots/tradingview_test_page.html'
    },
    { 
        name: 'watch-lists-page',
        path: '/mockups/watch_lists-page.html'
    },
];

const TIMEOUT = 30000; // 30 seconds

/**
 * בדיקת עמוד בודד
 */
async function testPage(browser, pageInfo) {
    const { name, path: pagePath } = pageInfo;
    const page = await browser.newPage();
    const results = {
        page: name,
        path: pagePath,
        passed: false,
        errors: [],
        warnings: [],
        consoleErrors: [],
        consoleWarnings: [],
        headerSystem: {
            exists: false,
            initialized: false,
            menuWorking: false
        },
        buttons: {
            total: 0,
            working: 0,
            broken: []
        },
        interfaces: {
            total: 0,
            working: 0,
            broken: []
        }
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
            } else if (type === 'warning') {
                results.consoleWarnings.push({
                    type: type,
                    text: text,
                    location: msg.location()
                });
            }
        });

        // האזנה לשגיאות JavaScript
        page.on('pageerror', error => {
            results.errors.push({
                type: 'JavaScript Error',
                message: error.message,
                stack: error.stack
            });
        });

        // טעינת העמוד
        console.log(`  📄 Loading: ${name}...`);
        await page.goto(`${BASE_URL}${pagePath}`, {
            waitUntil: 'networkidle2',
            timeout: TIMEOUT
        });

        // המתן לטעינת המשאבים
        await new Promise(resolve => setTimeout(resolve, 2000));

        // בדיקת Header System
        try {
            const headerExists = await page.$('#unified-header');
            results.headerSystem.exists = !!headerExists;

            if (headerExists) {
                // בדיקה שהתפריט נטען
                const menuItems = await page.$$('nav a, .main-menu a, .header-menu a');
                results.headerSystem.menuWorking = menuItems.length > 0;

                // בדיקה שהתפריט עובד (ניסיון לפתוח תפריט)
                try {
                    const devToolsMenu = await page.$('text=/כלי פיתוח/');
                    if (devToolsMenu) {
                        await devToolsMenu.hover();
                        await new Promise(resolve => setTimeout(resolve, 500));
                        results.headerSystem.menuWorking = true;
                    }
                } catch (e) {
                    // לא קריטי
                }
            }
        } catch (e) {
            results.warnings.push(`Header System check failed: ${e.message}`);
        }

        // בדיקת כפתורים
        try {
            const buttons = await page.$$('button, [data-button-type], [role="button"]');
            results.buttons.total = buttons.length;

            for (let i = 0; i < Math.min(buttons.length, 10); i++) {
                const button = buttons[i];
                try {
                    const isVisible = await button.isIntersectingViewport();
                    const isEnabled = await button.isEnabled();
                    
                    if (isVisible && isEnabled) {
                        results.buttons.working++;
                    }
                } catch (e) {
                    results.buttons.broken.push({
                        index: i,
                        error: e.message
                    });
                }
            }
        } catch (e) {
            results.warnings.push(`Buttons check failed: ${e.message}`);
        }

        // בדיקת ממשקים (forms, inputs, selects)
        try {
            const inputs = await page.$$('input, select, textarea');
            results.interfaces.total = inputs.length;

            for (let i = 0; i < Math.min(inputs.length, 10); i++) {
                const input = inputs[i];
                try {
                    const isVisible = await input.isIntersectingViewport();
                    const isEnabled = await input.isEnabled();
                    
                    if (isVisible && isEnabled) {
                        results.interfaces.working++;
                    }
                } catch (e) {
                    results.interfaces.broken.push({
                        index: i,
                        error: e.message
                    });
                }
            }
        } catch (e) {
            results.warnings.push(`Interfaces check failed: ${e.message}`);
        }

        // בדיקת מבנה HTML בסיסי
        try {
            const backgroundWrapper = await page.$('.background-wrapper');
            const pageBody = await page.$('.page-body');
            const mainContent = await page.$('.main-content');

            if (!backgroundWrapper) {
                results.errors.push('Missing .background-wrapper');
            }
            if (!pageBody) {
                results.errors.push('Missing .page-body');
            }
            if (!mainContent) {
                results.errors.push('Missing .main-content');
            }
        } catch (e) {
            results.warnings.push(`Structure check failed: ${e.message}`);
        }

        // בדיקת CSS נטען
        try {
            const stylesheets = await page.evaluate(() => {
                return Array.from(document.styleSheets)
                    .filter(sheet => {
                        try {
                            return sheet.cssRules && sheet.cssRules.length > 0;
                        } catch (e) {
                            return false;
                        }
                    })
                    .length;
            });
            
            if (stylesheets === 0) {
                results.warnings.push('No stylesheets loaded');
            }
        } catch (e) {
            results.warnings.push(`Stylesheets check failed: ${e.message}`);
        }

        // הערכת הצלחה
        const hasCriticalErrors = results.errors.length > 0 || results.consoleErrors.length > 0;
        const hasStructureErrors = results.errors.some(e => 
            e.includes('Missing') || e.includes('Structure')
        );

        results.passed = !hasCriticalErrors && !hasStructureErrors;

    } catch (error) {
        results.errors.push({
            type: 'Page Load Error',
            message: error.message,
            stack: error.stack
        });
        results.passed = false;
    } finally {
        await page.close();
    }

    return results;
}

/**
 * יצירת דוח
 */
function generateReport(allResults) {
    const timestamp = new Date().toISOString();
    const passed = allResults.filter(r => r.passed).length;
    const failed = allResults.filter(r => !r.passed).length;
    const total = allResults.length;

    let report = `# דוח בדיקות מקיף - עמודי מוקאפ
# Comprehensive Mockups Testing Report

**תאריך בדיקה:** ${new Date(timestamp).toLocaleString('he-IL')}  
**סה"כ עמודים:** ${total}  
**עמודים שעברו:** ${passed} ✅  
**עמודים נכשלו:** ${failed} ❌  
**שיעור הצלחה:** ${Math.round((passed / total) * 100)}%

---

## סיכום כללי

`;

    // סטטיסטיקות
    const totalConsoleErrors = allResults.reduce((sum, r) => sum + r.consoleErrors.length, 0);
    const totalConsoleWarnings = allResults.reduce((sum, r) => sum + r.consoleWarnings.length, 0);
    const totalErrors = allResults.reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = allResults.reduce((sum, r) => sum + r.warnings.length, 0);

    report += `### סטטיסטיקות:
- **שגיאות קונסולה:** ${totalConsoleErrors}
- **אזהרות קונסולה:** ${totalConsoleWarnings}
- **שגיאות JavaScript:** ${totalErrors}
- **אזהרות:** ${totalWarnings}

---

## דוח פרטני לכל עמוד

`;

    // דוח לכל עמוד
    allResults.forEach(result => {
        const status = result.passed ? '✅' : '❌';
        
        report += `### ${status} ${result.page}\n\n`;
        report += `**נתיב:** \`${result.path}\`\n\n`;

        // Header System
        report += `**Header System:**\n`;
        report += `- קיים: ${result.headerSystem.exists ? '✅' : '❌'}\n`;
        report += `- תפריט עובד: ${result.headerSystem.menuWorking ? '✅' : '❌'}\n\n`;

        // כפתורים
        report += `**כפתורים:**\n`;
        report += `- סה"כ: ${result.buttons.total}\n`;
        report += `- עובדים: ${result.buttons.working}\n`;
        if (result.buttons.broken.length > 0) {
            report += `- שבורים: ${result.buttons.broken.length}\n`;
        }
        report += `\n`;

        // ממשקים
        report += `**ממשקים:**\n`;
        report += `- סה"כ: ${result.interfaces.total}\n`;
        report += `- עובדים: ${result.interfaces.working}\n`;
        if (result.interfaces.broken.length > 0) {
            report += `- שבורים: ${result.interfaces.broken.length}\n`;
        }
        report += `\n`;

        // שגיאות
        if (result.errors.length > 0) {
            report += `**❌ שגיאות:**\n`;
            result.errors.forEach(error => {
                if (typeof error === 'string') {
                    report += `- ${error}\n`;
                } else {
                    report += `- **${error.type}:** ${error.message}\n`;
                }
            });
            report += `\n`;
        }

        // שגיאות קונסולה
        if (result.consoleErrors.length > 0) {
            report += `**❌ שגיאות קונסולה:** ${result.consoleErrors.length}\n`;
            result.consoleErrors.slice(0, 5).forEach(err => {
                report += `- ${err.text.substring(0, 100)}...\n`;
            });
            if (result.consoleErrors.length > 5) {
                report += `- ... ועוד ${result.consoleErrors.length - 5} שגיאות\n`;
            }
            report += `\n`;
        }

        // אזהרות
        if (result.warnings.length > 0) {
            report += `**⚠️ אזהרות:**\n`;
            result.warnings.forEach(warning => {
                report += `- ${warning}\n`;
            });
            report += `\n`;
        }

        report += `---\n\n`;
    });

    return report;
}

/**
 * הרצה ראשית
 */
async function main() {
    console.log('🧪 Starting comprehensive mockups testing...\n');
    console.log(`🌐 Base URL: ${BASE_URL}\n`);

    // בדיקה שהשרת רץ - נבדוק דרך Puppeteer
    console.log('🔍 Checking server connection...');

    const browser = await puppeteer.launch({
        headless: false, // הרצה עם דפדפן נראה
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const allResults = [];

    try {
        for (const pageInfo of MOCKUP_PAGES) {
            console.log(`Testing: ${pageInfo.name}...`);
            const result = await testPage(browser, pageInfo);
            allResults.push(result);
            
            const status = result.passed ? '✅' : '❌';
            const errorsCount = result.errors.length + result.consoleErrors.length;
            console.log(`  ${status} ${pageInfo.name} (${errorsCount} errors)`);
        }
    } finally {
        await browser.close();
    }

    // יצירת דוח
    const report = generateReport(allResults);
    
    // שמירת דוח
    const reportPath = path.join(BASE_DIR, 'trading-ui', 'mockups', 'MOCKUPS_COMPREHENSIVE_TEST_REPORT.md');
    fs.writeFileSync(reportPath, report, 'utf-8');
    
    console.log(`\n📄 Report saved: ${reportPath}`);
    
    // סיכום
    const passed = allResults.filter(r => r.passed).length;
    const failed = allResults.filter(r => !r.passed).length;
    const total = allResults.length;
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total pages: ${total}`);
    console.log(`   Passed: ${passed} ✅`);
    console.log(`   Failed: ${failed} ${failed > 0 ? '❌' : ''}`);
    console.log(`   Success rate: ${Math.round((passed / total) * 100)}%`);
    
    if (failed > 0) {
        console.log(`\n⚠️  ${failed} page(s) failed. Check the report for details.`);
        process.exit(1);
    } else {
        console.log(`\n✅ All pages passed!`);
        process.exit(0);
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { testPage, generateReport };

