const puppeteer = require('puppeteer');

const pages = [
    '/db_display.html',
    '/system_management.html',
    '/watch_list.html',
    '/conditions_modals.html'
];

async function testPage(pageUrl) {
    console.log(`\n=== Testing ${pageUrl} ===`);
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
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();

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
        const loginStart = Date.now();
        await page.goto('http://localhost:8080/login.html', { waitUntil: 'networkidle0', timeout: 30000 });
        const loginLoadTime = Date.now() - loginStart;
        console.log(`Login page loaded in ${loginLoadTime}ms`);

        // Login
        console.log('Logging in...');
        await page.type('#username', 'admin');
        await page.type('#password', 'admin123');
        await page.click('#loginBtn');

        // Wait for redirect
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });

        // Now navigate to target page
        console.log(`Navigating to ${pageUrl}...`);
        const pageStart = Date.now();
        await page.goto(`http://localhost:8080${pageUrl}`, { waitUntil: 'networkidle0', timeout: 15000 }); // Reduced timeout to 15s
        const pageLoadTime = Date.now() - pageStart;
        console.log(`Page loaded in ${pageLoadTime}ms`);

        // Get page title and basic info
        const title = await page.title();
        const hasContent = await page.evaluate(() => {
            return document.body.textContent.trim().length > 0;
        });

        console.log(`Title: "${title}"`);
        console.log(`Has Content: ${hasContent ? 'YES' : 'NO'}`);
        console.log(`Console Errors: ${errors.length}`);
        console.log(`Console Warnings: ${warnings.length}`);

        if (errors.length > 0) {
            console.log('Errors:');
            errors.forEach((error, i) => console.log(`  ${i+1}. ${error}`));
        }

        // Check for modal violations
        const modalCount = await page.evaluate(() => {
            const modals = document.querySelectorAll('.modal, .modal-dialog, [role="dialog"]');
            return modals.length;
        });

        console.log(`Modal Violations: ${modalCount}`);

        // Check for specific functionality based on page
        let hasFunctionality = false;
        if (pageUrl === '/conditions_modals.html') {
            // Check if there are any interactive elements
            hasFunctionality = await page.evaluate(() => {
                const buttons = document.querySelectorAll('button, .btn, input[type="button"], input[type="submit"]');
                const forms = document.querySelectorAll('form');
                return buttons.length > 0 || forms.length > 0;
            });
            console.log(`Has Functionality: ${hasFunctionality ? 'YES' : 'NO'} (interactive elements)`);
        } else {
            hasFunctionality = hasContent; // Basic check for other pages
            console.log(`Has Functionality: ${hasFunctionality ? 'YES' : 'NO'} (content check)`);
        }

        const status = hasContent && errors.length === 0 && modalCount === 0 && hasFunctionality ? 'PASS' : 'FAIL';

        console.log(`Overall Status: ${status}`);

        return {
            page: pageUrl,
            status,
            title,
            hasContent,
            hasFunctionality,
            errors: errors.length,
            warnings: warnings.length,
            modals: modalCount,
            loadTimeMs: pageLoadTime,
            errorDetails: errors.slice(0, 10) // First 10 errors
        };

    } catch (error) {
        console.log(`❌ Error testing ${pageUrl}: ${error.message}`);
        return {
            page: pageUrl,
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
    console.log('🎯 Testing Group B problematic pages');
    console.log('📊 Pages to test:', pages.length);
    console.log('🔐 Login: admin/admin123');

    const results = [];

    for (const pageUrl of pages) {
        const result = await testPage(pageUrl);
        results.push(result);

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
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

        console.log(`${result.page}: ${result.status}`);
    });

    console.log(`\nTotal: ${results.length}, Pass: ${passCount}, Fail: ${failCount}, Error: ${errorCount}`);

    // Save results
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `documentation/05-REPORTS/artifacts/2026_01_04/team_d_group_b_pages_detailed_test_${timestamp}.json`;

    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved: ${filename}`);
}

main().catch(console.error);
