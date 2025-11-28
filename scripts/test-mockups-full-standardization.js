#!/usr/bin/env node

/**
 * Full Standardization Testing - Mockups Pages
 * בודק את כל הקריטריונים מרשימת הבדיקה המלאה
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
 * בדיקת סטנדרטיזציה מלאה לעמוד בודד
 */
async function testFullStandardization(browser, pageInfo) {
    const { name, path: pagePath } = pageInfo;
    const page = await browser.newPage();
    const results = {
        page: name,
        path: pagePath,
        passed: true,
        checks: {
            htmlStructure: {
                backgroundWrapper: false,
                unifiedHeader: false,
                pageBody: false,
                mainContent: false,
                headerInWrapper: false
            },
            itcss: {
                masterCss: false,
                headerStyles: false,
                noInlineStyles: false,
                noStyleTags: false
            },
            headerSystem: {
                scriptLoaded: false,
                elementExists: false,
                menuWorks: false
            },
            iconSystem: {
                noDirectImgTags: false,
                usesIconSystem: false
            },
            buttonSystem: {
                hasDataButtonType: false,
                usesDataOnclick: false
            },
            consoleClean: {
                noErrors: false,
                noWarnings: false
            }
        },
        errors: [],
        warnings: []
    };

    try {
        // האזנה לשגיאות
        const consoleMessages = [];
        const pageErrors = [];
        
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            
            consoleMessages.push({ type, text });
            
            if (type === 'error') {
                if (!text.includes('favicon') && 
                    !text.includes('extension') &&
                    !text.includes('chrome-extension') &&
                    !text.includes('net::ERR_')) {
                    results.checks.consoleClean.noErrors = false;
                    results.errors.push(text);
                }
            } else if (type === 'warning') {
                results.checks.consoleClean.noWarnings = false;
                results.warnings.push(text);
            }
        });

        page.on('pageerror', error => {
            pageErrors.push(error);
            results.checks.consoleClean.noErrors = false;
            results.errors.push(error.message);
        });

        // טעינת העמוד
        console.log(`  📄 Loading: ${name}...`);
        await page.goto(`${BASE_URL}${pagePath}`, {
            waitUntil: 'networkidle2',
            timeout: TIMEOUT
        });

        // המתן לטעינת המשאבים
        await new Promise(resolve => setTimeout(resolve, 3000));

        // בדיקת מבנה HTML
        try {
            const htmlChecks = await page.evaluate(() => {
                return {
                    hasBackgroundWrapper: !!document.querySelector('.background-wrapper'),
                    hasUnifiedHeader: !!document.getElementById('unified-header'),
                    hasPageBody: !!document.querySelector('.page-body'),
                    hasMainContent: !!document.querySelector('.main-content'),
                    headerInWrapper: (() => {
                        const header = document.getElementById('unified-header');
                        if (!header) return false;
                        const wrapper = header.closest('.background-wrapper');
                        return !!wrapper;
                    })()
                };
            });
            
            results.checks.htmlStructure = htmlChecks;
        } catch (e) {
            results.errors.push(`HTML structure check failed: ${e.message}`);
        }

        // בדיקת ITCSS
        try {
            const cssChecks = await page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
                const styles = Array.from(document.querySelectorAll('style'));
                const inlineStyles = Array.from(document.querySelectorAll('[style]'));
                
                return {
                    masterCss: links.some(link => link.href.includes('master.css')),
                    headerStyles: links.some(link => link.href.includes('header-styles.css')),
                    noStyleTags: styles.length === 0,
                    noInlineStyles: inlineStyles.length === 0
                };
            });
            
            results.checks.itcss = cssChecks;
        } catch (e) {
            results.errors.push(`ITCSS check failed: ${e.message}`);
        }

        // בדיקת Header System
        try {
            const headerChecks = await page.evaluate(() => {
                const scripts = Array.from(document.querySelectorAll('script[src]'));
                const header = document.getElementById('unified-header');
                const menu = header?.querySelector('nav, .nav, .menu, [role="navigation"]');
                
                return {
                    scriptLoaded: scripts.some(s => s.src.includes('header-system')),
                    elementExists: !!header,
                    menuWorks: !!menu && header?.innerHTML.length > 0
                };
            });
            
            results.checks.headerSystem = headerChecks;
        } catch (e) {
            results.errors.push(`Header System check failed: ${e.message}`);
        }

        // בדיקת Icon System
        try {
            const iconChecks = await page.evaluate(() => {
                const imgIcons = Array.from(document.querySelectorAll('img[src*="icons/tabler"]'));
                const iconSystemElements = Array.from(document.querySelectorAll('[data-icon], .icon-placeholder, [data-icon-type]'));
                
                return {
                    noDirectImgTags: imgIcons.length === 0,
                    usesIconSystem: iconSystemElements.length > 0 || window.IconSystem !== undefined
                };
            });
            
            results.checks.iconSystem = iconChecks;
        } catch (e) {
            results.errors.push(`Icon System check failed: ${e.message}`);
        }

        // בדיקת Button System
        try {
            const buttonChecks = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
                const withDataButtonType = buttons.filter(b => b.hasAttribute('data-button-type'));
                const withOnclick = buttons.filter(b => b.hasAttribute('onclick'));
                const withDataOnclick = buttons.filter(b => b.hasAttribute('data-onclick'));
                
                return {
                    hasDataButtonType: withDataButtonType.length > 0,
                    usesDataOnclick: withDataOnclick.length > 0 && withOnclick.length === 0,
                    totalButtons: buttons.length
                };
            });
            
            results.checks.buttonSystem.hasDataButtonType = buttonChecks.hasDataButtonType;
            results.checks.buttonSystem.usesDataOnclick = buttonChecks.usesDataOnclick;
            
            if (buttonChecks.totalButtons > 0 && buttonChecks.withOnclick > 0) {
                results.warnings.push(`${buttonChecks.withOnclick} buttons use onclick instead of data-onclick`);
            }
        } catch (e) {
            results.errors.push(`Button System check failed: ${e.message}`);
        }

        // בדיקת קונסולה נקייה
        if (results.errors.length === 0 && results.warnings.length === 0) {
            results.checks.consoleClean.noErrors = true;
            results.checks.consoleClean.noWarnings = true;
        }

        // חישוב סטטוס כללי
        const allChecks = [
            ...Object.values(results.checks.htmlStructure),
            ...Object.values(results.checks.itcss),
            ...Object.values(results.checks.headerSystem),
            ...Object.values(results.checks.iconSystem),
            ...Object.values(results.checks.buttonSystem),
            results.checks.consoleClean.noErrors
        ];
        
        results.passed = allChecks.every(check => check === true) && results.errors.length === 0;

    } catch (error) {
        results.passed = false;
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
    let report = `# דוח בדיקות סטנדרטיזציה מלאות - עמודי מוקאפ
# Full Standardization Test Report - Mockups Pages

**תאריך:** ${new Date().toLocaleString('he-IL')}  
**סה"כ עמודים:** ${allResults.length}  
**עמודים שעברו:** ${allResults.filter(r => r.passed).length} ✅  
**עמודים נכשלו:** ${allResults.filter(r => !r.passed).length} ❌  
**שיעור הצלחה:** ${Math.round((allResults.filter(r => r.passed).length / allResults.length) * 100)}%

---

## סיכום כללי

### סטטיסטיקות בדיקות:
`;

    // חישוב סטטיסטיקות
    const stats = {
        htmlStructure: {
            backgroundWrapper: allResults.filter(r => r.checks.htmlStructure.backgroundWrapper).length,
            unifiedHeader: allResults.filter(r => r.checks.htmlStructure.unifiedHeader).length,
            pageBody: allResults.filter(r => r.checks.htmlStructure.pageBody).length,
            mainContent: allResults.filter(r => r.checks.htmlStructure.mainContent).length,
            headerInWrapper: allResults.filter(r => r.checks.htmlStructure.headerInWrapper).length
        },
        itcss: {
            masterCss: allResults.filter(r => r.checks.itcss.masterCss).length,
            headerStyles: allResults.filter(r => r.checks.itcss.headerStyles).length,
            noInlineStyles: allResults.filter(r => r.checks.itcss.noInlineStyles).length,
            noStyleTags: allResults.filter(r => r.checks.itcss.noStyleTags).length
        },
        headerSystem: {
            scriptLoaded: allResults.filter(r => r.checks.headerSystem.scriptLoaded).length,
            elementExists: allResults.filter(r => r.checks.headerSystem.elementExists).length,
            menuWorks: allResults.filter(r => r.checks.headerSystem.menuWorks).length
        },
        consoleClean: {
            noErrors: allResults.filter(r => r.checks.consoleClean.noErrors).length,
            noWarnings: allResults.filter(r => r.checks.consoleClean.noWarnings).length
        }
    };

    report += `
### מבנה HTML:
- ✅ background-wrapper: ${stats.htmlStructure.backgroundWrapper}/${allResults.length}
- ✅ unified-header: ${stats.htmlStructure.unifiedHeader}/${allResults.length}
- ✅ page-body: ${stats.htmlStructure.pageBody}/${allResults.length}
- ✅ main-content: ${stats.htmlStructure.mainContent}/${allResults.length}
- ✅ header in wrapper: ${stats.htmlStructure.headerInWrapper}/${allResults.length}

### ITCSS:
- ✅ master.css: ${stats.itcss.masterCss}/${allResults.length}
- ✅ header-styles.css: ${stats.itcss.headerStyles}/${allResults.length}
- ✅ אין inline styles: ${stats.itcss.noInlineStyles}/${allResults.length}
- ✅ אין style tags: ${stats.itcss.noStyleTags}/${allResults.length}

### Header System:
- ✅ script נטען: ${stats.headerSystem.scriptLoaded}/${allResults.length}
- ✅ אלמנט קיים: ${stats.headerSystem.elementExists}/${allResults.length}
- ✅ תפריט עובד: ${stats.headerSystem.menuWorks}/${allResults.length}

### קונסולה נקייה:
- ✅ ללא שגיאות: ${stats.consoleClean.noErrors}/${allResults.length}
- ✅ ללא אזהרות: ${stats.consoleClean.noWarnings}/${allResults.length}

---

## דוח פרטני לכל עמוד

`;

    for (const result of allResults) {
        const status = result.passed ? '✅' : '❌';
        
        report += `### ${status} ${result.page}\n\n`;
        report += `**נתיב:** \`${result.path}\`\n\n`;

        // מבנה HTML
        report += `**מבנה HTML:**\n`;
        report += `- background-wrapper: ${result.checks.htmlStructure.backgroundWrapper ? '✅' : '❌'}\n`;
        report += `- unified-header: ${result.checks.htmlStructure.unifiedHeader ? '✅' : '❌'}\n`;
        report += `- page-body: ${result.checks.htmlStructure.pageBody ? '✅' : '❌'}\n`;
        report += `- main-content: ${result.checks.htmlStructure.mainContent ? '✅' : '❌'}\n`;
        report += `- header in wrapper: ${result.checks.htmlStructure.headerInWrapper ? '✅' : '❌'}\n\n`;

        // ITCSS
        report += `**ITCSS:**\n`;
        report += `- master.css: ${result.checks.itcss.masterCss ? '✅' : '❌'}\n`;
        report += `- header-styles.css: ${result.checks.itcss.headerStyles ? '✅' : '❌'}\n`;
        report += `- אין inline styles: ${result.checks.itcss.noInlineStyles ? '✅' : '❌'}\n`;
        report += `- אין style tags: ${result.checks.itcss.noStyleTags ? '✅' : '❌'}\n\n`;

        // Header System
        report += `**Header System:**\n`;
        report += `- script נטען: ${result.checks.headerSystem.scriptLoaded ? '✅' : '❌'}\n`;
        report += `- אלמנט קיים: ${result.checks.headerSystem.elementExists ? '✅' : '❌'}\n`;
        report += `- תפריט עובד: ${result.checks.headerSystem.menuWorks ? '✅' : '❌'}\n\n`;

        // Icon System
        report += `**Icon System:**\n`;
        report += `- אין img tags ישירים: ${result.checks.iconSystem.noDirectImgTags ? '✅' : '❌'}\n`;
        report += `- משתמש ב-IconSystem: ${result.checks.iconSystem.usesIconSystem ? '✅' : '❌'}\n\n`;

        // Button System
        report += `**Button System:**\n`;
        report += `- יש data-button-type: ${result.checks.buttonSystem.hasDataButtonType ? '✅' : '❌'}\n`;
        report += `- משתמש ב-data-onclick: ${result.checks.buttonSystem.usesDataOnclick ? '✅' : '❌'}\n\n`;

        // קונסולה
        report += `**קונסולה:**\n`;
        report += `- ללא שגיאות: ${result.checks.consoleClean.noErrors ? '✅' : '❌'}\n`;
        report += `- ללא אזהרות: ${result.checks.consoleClean.noWarnings ? '✅' : '❌'}\n\n`;

        // שגיאות ואזהרות
        if (result.errors.length > 0) {
            report += `**❌ שגיאות:** ${result.errors.length}\n`;
            for (const error of result.errors.slice(0, 5)) {
                const errorText = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
                report += `- ${errorText.substring(0, 200)}\n`;
            }
            if (result.errors.length > 5) {
                report += `- ... ועוד ${result.errors.length - 5} שגיאות\n`;
            }
            report += `\n`;
        }

        if (result.warnings.length > 0) {
            report += `**⚠️ אזהרות:** ${result.warnings.length}\n`;
            for (const warning of result.warnings.slice(0, 5)) {
                report += `- ${warning.substring(0, 200)}\n`;
            }
            if (result.warnings.length > 5) {
                report += `- ... ועוד ${result.warnings.length - 5} אזהרות\n`;
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
    console.log('🧪 Starting full standardization testing...\n');
    console.log(`🌐 Base URL: ${BASE_URL}\n`);

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const allResults = [];

    try {
        for (const pageInfo of MOCKUP_PAGES) {
            console.log(`Testing: ${pageInfo.name}...`);
            const result = await testFullStandardization(browser, pageInfo);
            allResults.push(result);
            
            const status = result.passed ? '✅' : '❌';
            console.log(`  ${status} ${pageInfo.name}`);
        }
    } finally {
        await browser.close();
    }

    // יצירת דוח
    const report = generateReport(allResults);
    
    // שמירת דוח
    const reportPath = path.join(BASE_DIR, 'trading-ui', 'mockups', 'STANDARDIZATION_COMPLETE_REPORT.md');
    fs.writeFileSync(reportPath, report, 'utf-8');
    
    console.log(`\n📄 Report saved: ${reportPath}`);
    
    // סיכום
    const passed = allResults.filter(r => r.passed).length;
    const failed = allResults.filter(r => !r.passed).length;
    const successRate = Math.round((passed / allResults.length) * 100);
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total pages: ${allResults.length}`);
    console.log(`   Passed: ${passed} ✅`);
    console.log(`   Failed: ${failed} ❌`);
    console.log(`   Success rate: ${successRate}%`);
    
    if (failed > 0) {
        console.log(`\n⚠️  ${failed} page(s) failed standardization checks. Check the report for details.`);
        process.exit(1);
    } else {
        console.log(`\n✅ All pages passed standardization checks!`);
        process.exit(0);
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

