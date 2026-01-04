const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const pages = [
    { url: '/alerts.html', name: 'Alerts' },
    { url: '/preferences.html', name: 'Preferences' },
    { url: '/system_management.html', name: 'System Management' },
    { url: '/init_system_management.html', name: 'Init System Management' },
    { url: '/test_header_only.html', name: 'Test Header Only' },
    { url: '/test_monitoring.html', name: 'Test Monitoring' }
];

async function testPageDetailed(pageInfo) {
    console.log(`\n=== Testing ${pageInfo.name} (${pageInfo.url}) ===`);
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu',
                '--disable-cache',
                '--disable-background-timer-throttling',
                '--disable-renderer-backgrounding',
                '--window-size=1920,1080'
            ]
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        // Listen for console errors
        const errors = [];
        const warnings = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            } else if (msg.type() === 'warning') {
                warnings.push(msg.text());
            }
        });

        // Navigate to login page first
        console.log('Navigating to login page...');
        await page.goto('http://localhost:8080/login.html', { waitUntil: 'networkidle0', timeout: 30000 });

        // Login
        console.log('Logging in...');
        await page.type('#username', 'admin');
        await page.type('#password', 'admin123');
        await page.click('#loginBtn');

        // Wait for redirect
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });

        // Now navigate to target page
        console.log(`Navigating to ${pageInfo.url}...`);
        const pageStart = Date.now();
        await page.goto(`http://localhost:8080${pageInfo.url}`, { waitUntil: 'networkidle0', timeout: 45000 });
        const pageLoadTime = Date.now() - pageStart;
        console.log(`Page loaded in ${pageLoadTime}ms`);

        // Take screenshot after load
        const screenshotPath = `documentation/05-REPORTS/artifacts/2026_01_04/${pageInfo.name.toLowerCase().replace(' ', '_')}_task0_loaded.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Screenshot saved: ${screenshotPath}`);

        // Get page title and basic info
        const title = await page.title();
        const hasContent = await page.evaluate(() => {
            return document.body.textContent.trim().length > 0;
        });

        console.log(`Title: "${title}"`);
        console.log(`Has Content: ${hasContent ? 'YES' : 'NO'}`);

        // Check for modal violations
        const modalCount = await page.evaluate(() => {
            const modals = document.querySelectorAll('.modal, .modal-dialog, [role="dialog"]');
            return modals.length;
        });

        console.log(`Modal Violations: ${modalCount}`);

        // Check main menu navigation
        const menuCheck = await page.evaluate(() => {
            const menuItems = document.querySelectorAll('#unified-header nav a, .main-menu a, .header-menu a');
            return {
                menuItems: menuItems.length,
                hasActiveLinks: Array.from(menuItems).some(link => link.href && link.href !== '#')
            };
        });

        console.log(`Main Menu: ${menuCheck.menuItems} items, Active Links: ${menuCheck.hasActiveLinks}`);

        // Check functionality based on page type
        let hasFunctionality = false;
        let functionalityDetails = '';
        let pageType = 'unknown';

        if (pageInfo.url === '/alerts.html') {
            pageType = 'alerts';
            hasFunctionality = await page.evaluate(() => {
                const alertElements = document.querySelectorAll('.alert, .notification, [data-type*="alert"]');
                const buttons = document.querySelectorAll('button, .btn, input[type="button"]');
                return alertElements.length > 0 || buttons.length > 1;
            });

            const alertElements = await page.evaluate(() => {
                const alerts = document.querySelectorAll('.alert-item, .notification-item');
                const addButtons = document.querySelectorAll('[data-action*="add"], .add-alert');
                const dismissButtons = document.querySelectorAll('[data-action*="dismiss"], .dismiss-alert');
                return {
                    alerts: alerts.length,
                    addButtons: addButtons.length,
                    dismissButtons: dismissButtons.length
                };
            });

            functionalityDetails = `Alerts: ${alertElements.alerts}, Add: ${alertElements.addButtons}, Dismiss: ${alertElements.dismissButtons}`;

        } else if (pageInfo.url === '/preferences.html') {
            pageType = 'preferences';
            hasFunctionality = await page.evaluate(() => {
                const prefElements = document.querySelectorAll('.preference, .setting, [data-type*="pref"]');
                const inputs = document.querySelectorAll('input, select, textarea');
                const saveButtons = document.querySelectorAll('[data-action*="save"], .save-btn');
                return prefElements.length > 0 || inputs.length > 2 || saveButtons.length > 0;
            });

            const prefElements = await page.evaluate(() => {
                const inputs = document.querySelectorAll('input[type="checkbox"], input[type="radio"], select');
                const saveButtons = document.querySelectorAll('[data-action*="save"], .save-preferences');
                const resetButtons = document.querySelectorAll('[data-action*="reset"], .reset-preferences');
                return {
                    inputs: inputs.length,
                    saveButtons: saveButtons.length,
                    resetButtons: resetButtons.length
                };
            });

            functionalityDetails = `Inputs: ${prefElements.inputs}, Save: ${prefElements.saveButtons}, Reset: ${prefElements.resetButtons}`;

        } else if (pageInfo.url === '/system_management.html') {
            pageType = 'system_management';
            hasFunctionality = await page.evaluate(() => {
                const panels = document.querySelectorAll('.panel, .card, .system-status, .management-section');
                const buttons = document.querySelectorAll('button, .btn, input[type="button"]');
                const statusElements = document.querySelectorAll('.status, .indicator, .badge');
                return panels.length > 0 || buttons.length > 2 || statusElements.length > 0;
            });

            const systemElements = await page.evaluate(() => {
                const cacheButtons = document.querySelectorAll('[data-action*="cache"], .cache-clear');
                const systemButtons = document.querySelectorAll('[data-action*="system"], .system-action');
                const monitorElements = document.querySelectorAll('.monitor, .system-monitor');
                return {
                    cacheButtons: cacheButtons.length,
                    systemButtons: systemButtons.length,
                    monitorElements: monitorElements.length
                };
            });

            functionalityDetails = `Cache: ${systemElements.cacheButtons}, System: ${systemElements.systemButtons}, Monitor: ${systemElements.monitorElements}`;

        } else if (pageInfo.url === '/init_system_management.html') {
            pageType = 'init_system_management';
            hasFunctionality = await page.evaluate(() => {
                const packageElements = document.querySelectorAll('.package, .manifest, [data-type*="package"]');
                const validationElements = document.querySelectorAll('.validator, .validation, [data-type*="valid"]');
                const devTools = document.querySelectorAll('.dev-tool, .development, [data-type*="dev"]');
                const buttons = document.querySelectorAll('button, .btn, input[type="button"]');
                return packageElements.length > 0 || validationElements.length > 0 || devTools.length > 0 || buttons.length > 2;
            });

            const initSystemElements = await page.evaluate(() => {
                const packageButtons = document.querySelectorAll('[data-action*="package"], .package-btn');
                const validationButtons = document.querySelectorAll('[data-action*="validate"], .validate-btn');
                const analyzerElements = document.querySelectorAll('.analyzer, .script-analyzer');
                const manifestElements = document.querySelectorAll('.manifest, .package-manifest');
                return {
                    packageButtons: packageButtons.length,
                    validationButtons: validationButtons.length,
                    analyzerElements: analyzerElements.length,
                    manifestElements: manifestElements.length
                };
            });

            functionalityDetails = `Package: ${initSystemElements.packageButtons}, Validate: ${initSystemElements.validationButtons}, Analyzer: ${initSystemElements.analyzerElements}, Manifest: ${initSystemElements.manifestElements}`;

        } else if (pageInfo.url === '/test_header_only.html') {
            pageType = 'test_header_only';
            hasFunctionality = await page.evaluate(() => {
                const header = document.querySelector('#unified-header, .header, .main-header');
                const menuItems = document.querySelectorAll('nav a, .menu a, .header-menu a');
                return header !== null && menuItems.length > 0;
            });

            const headerElements = await page.evaluate(() => {
                const header = document.querySelector('#unified-header, .header, .main-header');
                const menuItems = document.querySelectorAll('nav a, .menu a, .header-menu a');
                const logo = document.querySelector('.logo, .brand, img[alt*="logo"]');
                return {
                    hasHeader: header !== null,
                    menuItems: menuItems.length,
                    hasLogo: logo !== null
                };
            });

            functionalityDetails = `Header: ${headerElements.hasHeader}, Menu Items: ${headerElements.menuItems}, Logo: ${headerElements.hasLogo}`;

        } else if (pageInfo.url === '/test_monitoring.html') {
            pageType = 'test_monitoring';
            hasFunctionality = await page.evaluate(() => {
                const monitors = document.querySelectorAll('.monitor, .monitoring, [data-type*="monitor"]');
                const charts = document.querySelectorAll('.chart, .graph, canvas, svg');
                const metrics = document.querySelectorAll('.metric, .stat, .counter');
                return monitors.length > 0 || charts.length > 0 || metrics.length > 0;
            });

            const monitoringElements = await page.evaluate(() => {
                const charts = document.querySelectorAll('.chart, canvas, svg');
                const metrics = document.querySelectorAll('.metric, .stat, .counter');
                const refreshButtons = document.querySelectorAll('[data-action*="refresh"], .refresh-btn');
                return {
                    charts: charts.length,
                    metrics: metrics.length,
                    refreshButtons: refreshButtons.length
                };
            });

            functionalityDetails = `Charts: ${monitoringElements.charts}, Metrics: ${monitoringElements.metrics}, Refresh: ${monitoringElements.refreshButtons}`;
        }

        console.log(`Page Type: ${pageType}`);
        console.log(`Has Functionality: ${hasFunctionality ? 'YES' : 'NO'} (${functionalityDetails})`);
        console.log(`Console Errors: ${errors.length}`);
        console.log(`Console Warnings: ${warnings.length}`);

        if (errors.length > 0) {
            console.log('Errors:');
            errors.slice(0, 5).forEach((error, i) => console.log(`  ${i+1}. ${error.substring(0, 100)}...`));
        }

        // Take final screenshot
        const finalScreenshotPath = `documentation/05-REPORTS/artifacts/2026_01_04/${pageInfo.name.toLowerCase().replace(' ', '_')}_task0_final.png`;
        await page.screenshot({ path: finalScreenshotPath, fullPage: true });
        console.log(`Final screenshot saved: ${finalScreenshotPath}`);

        const status = hasContent && errors.length === 0 && modalCount === 0 && hasFunctionality ? 'PASS' : 'FAIL';

        console.log(`Overall Status: ${status}`);

        return {
            page: pageInfo.url,
            name: pageInfo.name,
            pageType,
            status,
            title,
            hasContent,
            hasFunctionality,
            functionalityDetails,
            menuItems: menuCheck.menuItems,
            activeMenuLinks: menuCheck.hasActiveLinks,
            errors: errors.length,
            warnings: warnings.length,
            modals: modalCount,
            loadTimeMs: pageLoadTime,
            errorDetails: errors.slice(0, 10),
            screenshots: [screenshotPath, finalScreenshotPath]
        };

    } catch (error) {
        console.log(`❌ Error testing ${pageInfo.url}: ${error.message}`);
        return {
            page: pageInfo.url,
            name: pageInfo.name,
            status: 'ERROR',
            error: error.message
        };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function main() {
    console.log('🎯 Task 0 Option1 - Focused QA for 6 Pages');
    console.log('📊 Pages to test:', pages.length);
    console.log('🔐 Login: admin/admin123');
    console.log('📸 Screenshots will be saved to documentation/05-REPORTS/artifacts/2026_01_04/');

    const results = [];

    for (const pageInfo of pages) {
        const result = await testPageDetailed(pageInfo);
        results.push(result);

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log('\n🎯 SUMMARY');
    console.log('='.repeat(60));

    let passCount = 0;
    let failCount = 0;
    let errorCount = 0;

    results.forEach(result => {
        if (result.status === 'PASS') passCount++;
        else if (result.status === 'FAIL') failCount++;
        else if (result.status === 'ERROR') errorCount++;

        console.log(`${result.name}: ${result.status}`);
        if (result.loadTimeMs) {
            console.log(`  Load time: ${result.loadTimeMs}ms`);
        }
        if (result.functionalityDetails) {
            console.log(`  Functionality: ${result.functionalityDetails}`);
        }
        if (result.errors > 0) {
            console.log(`  Errors: ${result.errors}`);
        }
        if (result.menuItems !== undefined) {
            console.log(`  Menu: ${result.menuItems} items`);
        }
    });

    console.log(`\nTotal: ${results.length}, Pass: ${passCount}, Fail: ${failCount}, Error: ${errorCount}`);

    // Save results
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `documentation/05-REPORTS/artifacts/2026_01_04/team_d_task0_6_pages_qa_${timestamp}.json`;

    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved: ${filename}`);
}

main().catch(console.error);
