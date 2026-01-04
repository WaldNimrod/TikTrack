const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const pages = [
    { url: '/system_management.html', name: 'System Management' },
    { url: '/init_system_management.html', name: 'Init System Management' }
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
        const screenshotPath = `documentation/05-REPORTS/artifacts/2026_01_04/${pageInfo.name.toLowerCase().replace(' ', '_')}_loaded.png`;
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
            const hasSystemManagement = Array.from(menuItems).some(link =>
                link.href && (link.href.includes('system_management') || link.textContent.includes('System'))
            );
            return {
                menuItems: menuItems.length,
                hasSystemManagement: hasSystemManagement
            };
        });

        console.log(`Main Menu: ${menuCheck.menuItems} items, System Management Link: ${menuCheck.hasSystemManagement}`);

        // Check functionality based on page
        let hasFunctionality = false;
        let functionalityDetails = '';

        if (pageInfo.url === '/system_management.html') {
            // Check for system management functionality
            hasFunctionality = await page.evaluate(() => {
                // Look for management panels, buttons, status indicators
                const panels = document.querySelectorAll('.panel, .card, .system-status, .management-section');
                const buttons = document.querySelectorAll('button, .btn, input[type="button"], input[type="submit"]');
                const statusElements = document.querySelectorAll('.status, .indicator, .badge');

                return panels.length > 0 || buttons.length > 2 || statusElements.length > 0;
            });

            // Check for system management specific elements
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

            functionalityDetails = `Cache buttons: ${systemElements.cacheButtons}, System buttons: ${systemElements.systemButtons}, Monitor elements: ${systemElements.monitorElements}`;
            console.log(`System Management Elements: ${functionalityDetails}`);

        } else if (pageInfo.url === '/init_system_management.html') {
            // Check for init system management functionality
            hasFunctionality = await page.evaluate(() => {
                // Look for init system management elements
                const packageElements = document.querySelectorAll('.package, .manifest, [data-type*="package"]');
                const validationElements = document.querySelectorAll('.validator, .validation, [data-type*="valid"]');
                const devTools = document.querySelectorAll('.dev-tool, .development, [data-type*="dev"]');
                const buttons = document.querySelectorAll('button, .btn, input[type="button"], input[type="submit"]');

                return packageElements.length > 0 || validationElements.length > 0 || devTools.length > 0 || buttons.length > 2;
            });

            // Check for specific init system management functionality
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
            console.log(`Init System Management Elements: ${functionalityDetails}`);
        }

        console.log(`Has Functionality: ${hasFunctionality ? 'YES' : 'NO'} (${functionalityDetails})`);
        console.log(`Console Errors: ${errors.length}`);
        console.log(`Console Warnings: ${warnings.length}`);

        if (errors.length > 0) {
            console.log('Errors:');
            errors.slice(0, 5).forEach((error, i) => console.log(`  ${i+1}. ${error.substring(0, 100)}...`));
        }

        // Take final screenshot
        const finalScreenshotPath = `documentation/05-REPORTS/artifacts/2026_01_04/${pageInfo.name.toLowerCase().replace(' ', '_')}_final.png`;
        await page.screenshot({ path: finalScreenshotPath, fullPage: true });
        console.log(`Final screenshot saved: ${finalScreenshotPath}`);

        const status = hasContent && errors.length === 0 && modalCount === 0 && hasFunctionality ? 'PASS' : 'FAIL';

        console.log(`Overall Status: ${status}`);

        return {
            page: pageInfo.url,
            name: pageInfo.name,
            status,
            title,
            hasContent,
            hasFunctionality,
            functionalityDetails,
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
    console.log('🎯 Focused QA for System Management and Conditions Modals');
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
    console.log('='.repeat(50));

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
    });

    console.log(`\nTotal: ${results.length}, Pass: ${passCount}, Fail: ${failCount}, Error: ${errorCount}`);

    // Save results
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `documentation/05-REPORTS/artifacts/2026_01_04/team_d_focused_system_conditions_qa_${timestamp}.json`;

    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved: ${filename}`);
}

main().catch(console.error);
