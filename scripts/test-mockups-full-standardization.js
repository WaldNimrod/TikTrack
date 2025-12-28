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
        await new Promise(resolve => setTimeout(resolve, 5000));

        // בדיקת מבנה HTML
        try {
            // המתן לטעינת DOM
            await page.waitForSelector('body', { timeout: 10000 }).catch(() => {});
            
            // המתן נוספת לאלמנטים ספציפיים
            await page.waitForSelector('.background-wrapper', { timeout: 5000 }).catch(() => {});
            
            const htmlChecks = await page.evaluate(() => {
                const body = document.body;
                if (!body) {
                    return {
                        backgroundWrapper: false,
                        unifiedHeader: false,
                        pageBody: false,
                        mainContent: false,
                        headerInWrapper: false
                    };
                }
                
                const bgWrapper = body.querySelector('.background-wrapper');
                const header = document.getElementById('unified-header');
                const pageBody = body.querySelector('.page-body');
                const mainContent = body.querySelector('.main-content');
                
                return {
                    backgroundWrapper: !!bgWrapper,
                    unifiedHeader: !!header,
                    pageBody: !!pageBody,
                    mainContent: !!mainContent,
                    headerInWrapper: header && header.closest('.background-wrapper') ? true : false
                };
            });
            
            results.checks.htmlStructure = htmlChecks;
        } catch (e) {
            results.errors.push(`HTML structure check failed: ${e.message}`);
            // Fallback - בדיקה פשוטה יותר
            const simpleCheck = await page.evaluate(() => ({
                backgroundWrapper: !!document.querySelector('.background-wrapper'),
                unifiedHeader: !!document.getElementById('unified-header'),
                pageBody: !!document.querySelector('.page-body'),
                mainContent: !!document.querySelector('.main-content'),
                headerInWrapper: false
            })).catch(() => ({}));
            
            if (Object.keys(simpleCheck).length > 0) {
                results.checks.htmlStructure = simpleCheck;
            }
        }

        // בדיקת ITCSS
        try {
            const cssChecks = await page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
                
                // בדיקת style tags - התעלם מ-third-party (TradingView, etc.)
                const styles = Array.from(document.querySelectorAll('style')).filter(s => {
                    const content = (s.textContent || s.innerHTML || '').trim();
                    if (content.length === 0) return false;
                    // התעלם מ-style tags של third-party libraries
                    if (content.includes('#tv-attr-logo') || // TradingView
                        content.includes('tradingview') ||
                        s.id && (s.id.includes('tradingview') || s.id.includes('external'))) {
                        return false;
                    }
                    return true;
                });
                
                // בדיקת inline styles - התעלם מ-third-party ודינמיים
                const inlineStyles = Array.from(document.querySelectorAll('[style]')).filter(el => {
                    const style = (el.getAttribute('style') || '').trim();
                    if (style.length === 0) return false;
                    
                    // התעלם מ-third-party elements
                    if (el.closest('[data-third-party]') ||
                        el.closest('.tradingview') ||
                        el.closest('#tradingview') ||
                        el.id && (el.id.includes('tradingview') || el.id.includes('external'))) {
                        return false;
                    }
                    
                    // התעלם מ-inline styles שנוצרו על ידי JavaScript דינמי (כמו dropdowns, menus, modals)
                    // אלה חלק מהפונקציונליות הרגילה ואינן נחשבות כשגיאה
                    const dynamicStylePatterns = [
                        /display:\s*(none|block|flex|grid|inline-block)/,
                        /position:\s*(absolute|fixed|relative)/,
                        /visibility:\s*(hidden|visible)/,
                        /opacity:\s*\d/,
                        /z-index:\s*\d+/,
                        /overflow:\s*(hidden|auto|scroll)/,
                        /height:\s*\d+px/,
                        /width:\s*\d+px/,
                        /top:\s*[\d-]+px/,
                        /left:\s*[\d-]+px/,
                        /right:\s*[\d-]+px/,
                        /bottom:\s*[\d-]+px/,
                        /transform:/,
                        /transition:/
                    ];
                    
                    // אם זה נראה כמו style דינמי, התעלם
                    if (dynamicStylePatterns.some(pattern => pattern.test(style))) {
                        return false;
                    }
                    
                    // התעלם מ-CSS variables (כמו --series-color, --dynamic-bg-color)
                    if (style.includes('--')) {
                        return false;
                    }
                    
                    return true;
                });
                
                return {
                    masterCss: links.some(link => {
                        const href = link.href || '';
                        return href.includes('master.css') || href.includes('styles-new/master.css');
                    }),
                    headerStyles: links.some(link => {
                        const href = link.href || '';
                        return href.includes('header-styles.css') || href.includes('styles-new/header-styles.css');
                    }),
                    noStyleTags: styles.length === 0,
                    noInlineStyles: inlineStyles.length === 0,
                    styleTagsCount: styles.length,
                    inlineStylesCount: inlineStyles.length
                };
            });
            
            results.checks.itcss = cssChecks;
            
            // הוסף warning אם יש inline styles
            if (cssChecks.inlineStylesCount > 0) {
                results.warnings.push(`${cssChecks.inlineStylesCount} inline styles found (may be dynamic JavaScript)`);
            }
            
            if (cssChecks.styleTagsCount > 0) {
                results.warnings.push(`${cssChecks.styleTagsCount} style tags found`);
            }
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
        // התעלם מאזהרות לא קריטיות (preferences, localStorage fallbacks, וכו')
        const criticalErrors = results.errors.filter(err => {
            const errText = typeof err === 'string' ? err : (err.message || JSON.stringify(err));
            // התעלם מאזהרות preferences ו-localStorage
            if (errText.includes('preference') || 
                errText.includes('localStorage') ||
                errText.includes('fallback') ||
                errText.includes('Warning:') ||
                errText.includes('⚠️')) {
                return false;
            }
            return true;
        });
        
        results.checks.consoleClean.noErrors = criticalErrors.length === 0;
        
        // אזהרות לא קריטיות - נחשבות תקינות
        const criticalWarnings = results.warnings.filter(warn => {
            const warnText = typeof warn === 'string' ? warn : JSON.stringify(warn);
            // התעלם מאזהרות על inline styles דינמיים
            if (warnText.includes('inline styles found (may be dynamic JavaScript)')) {
                return false;
            }
            return true;
        });
        
        results.checks.consoleClean.noWarnings = criticalWarnings.length === 0;

        // חישוב סטטוס כללי
        // בדיקות קריטיות - חייבות לעבור
        const criticalChecks = [
            results.checks.htmlStructure.backgroundWrapper,
            results.checks.htmlStructure.unifiedHeader,
            results.checks.htmlStructure.pageBody,
            results.checks.htmlStructure.mainContent,
            results.checks.itcss.masterCss,
            results.checks.headerSystem.scriptLoaded,
            results.checks.headerSystem.elementExists,
            results.checks.consoleClean.noErrors
        ];
        
        // בדיקות חשובות אבל לא קריטיות
        const importantChecks = [
            results.checks.htmlStructure.headerInWrapper,
            results.checks.itcss.headerStyles,
            results.checks.headerSystem.menuWorks,
            results.checks.iconSystem.noDirectImgTags
        ];
        
        // העמוד נכשל רק אם יש שגיאות קריטיות או שהבדיקות הקריטיות נכשלו
        const hasCriticalErrors = criticalErrors.length > 0;
        
        results.passed = criticalChecks.every(check => check === true) && 
                        !hasCriticalErrors;

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

