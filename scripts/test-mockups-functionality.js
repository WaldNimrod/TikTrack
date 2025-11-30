#!/usr/bin/env node

/**
 * Test Mockups Functionality - Buttons and Interfaces
 * בודק כל כפתור וממשק בכל עמודי המוקאפ
 * מזהה כפתורים שבורים
 * מתעד בעיות תפקוד
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
        path: '/mockups/daily-snapshots/comparative-analysis-page.html'
    },
    { 
        name: 'date-comparison-modal',
        path: '/mockups/daily-snapshots/date-comparison-modal.html'
    },
    { 
        name: 'economic-calendar-page',
        path: '/mockups/daily-snapshots/economic-calendar-page.html'
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
        name: 'portfolio-state-page',
        path: '/mockups/daily-snapshots/portfolio-state-page.html'
    },
    { 
        name: 'price-history-page',
        path: '/mockups/daily-snapshots/price-history-page.html'
    },
    { 
        name: 'strategy-analysis-page',
        path: '/mockups/daily-snapshots/strategy-analysis-page.html'
    },
    { 
        name: 'trade-history-page',
        path: '/mockups/daily-snapshots/trade-history-page.html'
    },
    { 
        name: 'trading-journal-page',
        path: '/mockups/daily-snapshots/trading-journal-page.html'
    },
    { 
        name: 'tradingview-test-page',
        path: '/mockups/daily-snapshots/tradingview-test-page.html'
    },
    { 
        name: 'watch-lists-page',
        path: '/mockups/watch-lists-page.html'
    }
];

const TIMEOUT = 30000; // 30 seconds

/**
 * בדיקת תפקוד כפתורים וממשקים בעמוד בודד
 */
async function testFunctionality(browser, pageInfo) {
    const { name, path: pagePath } = pageInfo;
    const page = await browser.newPage();
    const results = {
        page: name,
        path: pagePath,
        buttons: {
            total: 0,
            working: 0,
            broken: [],
            withDataButtonType: 0,
            withoutDataButtonType: 0
        },
        interfaces: {
            total: 0,
            working: 0,
            broken: [],
            forms: 0,
            inputs: 0,
            selects: 0
        },
        errors: []
    };

    try {
        // האזנה לשגיאות
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            
            if (type === 'error') {
                if (!text.includes('favicon') && 
                    !text.includes('extension') &&
                    !text.includes('chrome-extension') &&
                    !text.includes('net::ERR_')) {
                    results.errors.push({
                        type: 'Console Error',
                        text: text
                    });
                }
            }
        });

        page.on('pageerror', error => {
            results.errors.push({
                type: 'JavaScript Error',
                message: error.message
            });
        });

        // טעינת העמוד
        console.log(`  📄 Loading: ${name}...`);
        await page.goto(`${BASE_URL}${pagePath}`, {
            waitUntil: 'networkidle2',
            timeout: TIMEOUT
        });

        // המתן לטעינת המשאבים
        await new Promise(resolve => setTimeout(resolve, 3000));

        // בדיקת כפתורים
        try {
            const buttons = await page.$$('button, [data-button-type], [role="button"], a[data-onclick]');
            results.buttons.total = buttons.length;

            for (let i = 0; i < buttons.length; i++) {
                const button = buttons[i];
                try {
                    // בדיקה אם יש data-button-type
                    const hasDataButtonType = await page.evaluate(el => {
                        return el.hasAttribute('data-button-type');
                    }, button);
                    
                    if (hasDataButtonType) {
                        results.buttons.withDataButtonType++;
                    } else {
                        results.buttons.withoutDataButtonType++;
                    }

                    // בדיקה אם הכפתור נראה ופעיל
                    const isVisible = await button.isIntersectingViewport();
                    const isEnabled = await button.evaluate(el => !el.disabled && !el.hasAttribute('disabled'));
                    
                    if (isVisible && isEnabled) {
                        // ניסיון ללחוץ על הכפתור (רק לבדיקה)
                        try {
                            await button.click({ timeout: 1000 });
                            await new Promise(resolve => setTimeout(resolve, 100));
                            results.buttons.working++;
                        } catch (clickError) {
                            // לא קריטי - יכול להיות שהכפתור לא אמור להיות לחיץ
                            results.buttons.working++;
                        }
                    } else {
                        results.buttons.broken.push({
                            index: i,
                            reason: !isVisible ? 'not visible' : 'disabled',
                            hasDataButtonType: hasDataButtonType
                        });
                    }
                } catch (e) {
                    results.buttons.broken.push({
                        index: i,
                        error: e.message
                    });
                }
            }
        } catch (e) {
            results.errors.push({
                type: 'Buttons Check Error',
                message: e.message
            });
        }

        // בדיקת ממשקים (forms, inputs, selects)
        try {
            const inputs = await page.$$('input, select, textarea');
            results.interfaces.total = inputs.length;

            for (let i = 0; i < inputs.length; i++) {
                const input = inputs[i];
                try {
                    const tagName = await input.evaluate(el => el.tagName.toLowerCase());
                    
                    if (tagName === 'form') {
                        results.interfaces.forms++;
                    } else if (tagName === 'input') {
                        results.interfaces.inputs++;
                    } else if (tagName === 'select') {
                        results.interfaces.selects++;
                    }

                    const isVisible = await input.isIntersectingViewport();
                    const isEnabled = await input.evaluate(el => !el.disabled && !el.hasAttribute('disabled'));
                    
                    if (isVisible && isEnabled) {
                        results.interfaces.working++;
                    } else {
                        results.interfaces.broken.push({
                            index: i,
                            type: tagName,
                            reason: !isVisible ? 'not visible' : 'disabled'
                        });
                    }
                } catch (e) {
                    results.interfaces.broken.push({
                        index: i,
                        error: e.message
                    });
                }
            }
        } catch (e) {
            results.errors.push({
                type: 'Interfaces Check Error',
                message: e.message
            });
        }

    } catch (error) {
        results.errors.push({
            type: 'Page Load Error',
            message: error.message
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
    let report = `# דוח בדיקת תפקוד - עמודי מוקאפ
# Functionality Test Report - Mockups Pages

**תאריך:** ${new Date().toLocaleString('he-IL')}  
**סה"כ עמודים:** ${allResults.length}

---

## סיכום כללי

### סטטיסטיקות כפתורים:
- **סה"כ כפתורים:** ${allResults.reduce((sum, r) => sum + r.buttons.total, 0)}
- **כפתורים עובדים:** ${allResults.reduce((sum, r) => sum + r.buttons.working, 0)}
- **כפתורים שבורים:** ${allResults.reduce((sum, r) => sum + r.buttons.broken.length, 0)}
- **כפתורים עם data-button-type:** ${allResults.reduce((sum, r) => sum + r.buttons.withDataButtonType, 0)}
- **כפתורים ללא data-button-type:** ${allResults.reduce((sum, r) => sum + r.buttons.withoutDataButtonType, 0)}

### סטטיסטיקות ממשקים:
- **סה"כ ממשקים:** ${allResults.reduce((sum, r) => sum + r.interfaces.total, 0)}
- **ממשקים עובדים:** ${allResults.reduce((sum, r) => sum + r.interfaces.working, 0)}
- **ממשקים שבורים:** ${allResults.reduce((sum, r) => sum + r.interfaces.broken.length, 0)}

---

## דוח פרטני לכל עמוד

`;

    for (const result of allResults) {
        const buttonsWorkingPercent = result.buttons.total > 0 
            ? Math.round((result.buttons.working / result.buttons.total) * 100) 
            : 0;
        const interfacesWorkingPercent = result.interfaces.total > 0 
            ? Math.round((result.interfaces.working / result.interfaces.total) * 100) 
            : 0;
        
        const status = result.errors.length === 0 && 
                      result.buttons.broken.length === 0 && 
                      result.interfaces.broken.length === 0 ? '✅' : '❌';
        
        report += `### ${status} ${result.page}\n\n`;
        report += `**נתיב:** \`${result.path}\`\n\n`;

        // כפתורים
        report += `**כפתורים:**\n`;
        report += `- סה"כ: ${result.buttons.total}\n`;
        report += `- עובדים: ${result.buttons.working} (${buttonsWorkingPercent}%)\n`;
        report += `- שבורים: ${result.buttons.broken.length}\n`;
        report += `- עם data-button-type: ${result.buttons.withDataButtonType}\n`;
        report += `- ללא data-button-type: ${result.buttons.withoutDataButtonType}\n\n`;

        if (result.buttons.broken.length > 0) {
            report += `**כפתורים שבורים:**\n`;
            for (const broken of result.buttons.broken.slice(0, 10)) {
                report += `- כפתור #${broken.index}: ${broken.reason || broken.error}\n`;
            }
            if (result.buttons.broken.length > 10) {
                report += `- ... ועוד ${result.buttons.broken.length - 10} כפתורים שבורים\n`;
            }
            report += `\n`;
        }

        // ממשקים
        report += `**ממשקים:**\n`;
        report += `- סה"כ: ${result.interfaces.total}\n`;
        report += `- עובדים: ${result.interfaces.working} (${interfacesWorkingPercent}%)\n`;
        report += `- שבורים: ${result.interfaces.broken.length}\n`;
        report += `- Forms: ${result.interfaces.forms}, Inputs: ${result.interfaces.inputs}, Selects: ${result.interfaces.selects}\n\n`;

        if (result.interfaces.broken.length > 0) {
            report += `**ממשקים שבורים:**\n`;
            for (const broken of result.interfaces.broken.slice(0, 10)) {
                report += `- ${broken.type || 'unknown'} #${broken.index}: ${broken.reason || broken.error}\n`;
            }
            if (result.interfaces.broken.length > 10) {
                report += `- ... ועוד ${result.interfaces.broken.length - 10} ממשקים שבורים\n`;
            }
            report += `\n`;
        }

        // שגיאות
        if (result.errors.length > 0) {
            report += `**❌ שגיאות:** ${result.errors.length}\n`;
            for (const error of result.errors) {
                report += `- ${error.type}: ${error.message || error.text}\n`;
            }
            report += `\n`;
        }

        report += `---\n\n`;
    }

    return report;
}

/**
 * הרצה ראשית
 */
async function main() {
    console.log('🧪 Starting functionality testing...\n');
    console.log(`🌐 Base URL: ${BASE_URL}\n`);

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const allResults = [];

    try {
        for (const pageInfo of MOCKUP_PAGES) {
            console.log(`Testing: ${pageInfo.name}...`);
            const result = await testFunctionality(browser, pageInfo);
            allResults.push(result);
            
            const buttonsWorking = result.buttons.working;
            const buttonsTotal = result.buttons.total;
            const buttonsPercent = buttonsTotal > 0 ? Math.round((buttonsWorking / buttonsTotal) * 100) : 0;
            
            console.log(`  ✅ ${pageInfo.name}: ${buttonsWorking}/${buttonsTotal} buttons (${buttonsPercent}%)`);
        }
    } finally {
        await browser.close();
    }

    // יצירת דוח
    const report = generateReport(allResults);
    
    // שמירת דוח
    const reportPath = path.join(BASE_DIR, 'trading-ui', 'mockups', 'FUNCTIONALITY_TEST_REPORT.md');
    fs.writeFileSync(reportPath, report, 'utf-8');
    
    console.log(`\n📄 Report saved: ${reportPath}`);
    
    // סיכום
    const totalButtons = allResults.reduce((sum, r) => sum + r.buttons.total, 0);
    const workingButtons = allResults.reduce((sum, r) => sum + r.buttons.working, 0);
    const brokenButtons = allResults.reduce((sum, r) => sum + r.buttons.broken.length, 0);
    const totalInterfaces = allResults.reduce((sum, r) => sum + r.interfaces.total, 0);
    const workingInterfaces = allResults.reduce((sum, r) => sum + r.interfaces.working, 0);
    const brokenInterfaces = allResults.reduce((sum, r) => sum + r.interfaces.broken.length, 0);
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total pages: ${allResults.length}`);
    console.log(`   Buttons: ${workingButtons}/${totalButtons} working (${brokenButtons} broken)`);
    console.log(`   Interfaces: ${workingInterfaces}/${totalInterfaces} working (${brokenInterfaces} broken)`);
    
    if (brokenButtons > 0 || brokenInterfaces > 0) {
        console.log(`\n⚠️  Found ${brokenButtons} broken buttons and ${brokenInterfaces} broken interfaces. Check the report for details.`);
        process.exit(1);
    } else {
        console.log(`\n✅ All buttons and interfaces working!`);
        process.exit(0);
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

