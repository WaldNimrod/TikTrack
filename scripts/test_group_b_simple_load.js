const puppeteer = require('puppeteer');

const pages = [
    '/db_display.html',
    '/system_management.html',
    '/watch_list.html',
    '/conditions_modals.html'
];

async function testPageLoad(pageUrl) {
    console.log(`\n=== Testing ${pageUrl} Load ===`);
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

        // Set longer timeout
        page.setDefaultTimeout(60000); // 60 seconds

        console.log('Navigating to page...');
        const response = await page.goto(`http://localhost:8080${pageUrl}`, {
            waitUntil: 'domcontentloaded', // Wait only for DOM, not all resources
            timeout: 60000
        });

        const status = response.status();
        console.log(`HTTP Status: ${status}`);

        if (status === 200) {
            // Wait a bit for basic rendering
            await new Promise(resolve => setTimeout(resolve, 3000));

            const title = await page.title();
            const hasContent = await page.evaluate(() => {
                return document.body.textContent.trim().length > 0;
            });

            console.log(`Title: "${title}"`);
            console.log(`Has Content: ${hasContent ? 'YES' : 'NO'}`);

            // Check for basic modal violations
            const modalCount = await page.evaluate(() => {
                const modals = document.querySelectorAll('.modal, .modal-dialog, [role="dialog"]');
                return modals.length;
            });

            console.log(`Modal Violations: ${modalCount}`);

            const result = hasContent && modalCount === 0 ? 'PASS' : 'FAIL';
            console.log(`Load Status: ${result}`);

            return {
                page: pageUrl,
                status: result,
                httpStatus: status,
                title,
                hasContent,
                modals: modalCount
            };
        } else {
            console.log(`❌ HTTP Error: ${status}`);
            return {
                page: pageUrl,
                status: 'FAIL',
                httpStatus: status,
                error: `HTTP ${status}`
            };
        }

    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
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
    console.log('🎯 Testing Group B pages basic load');
    console.log('📊 Pages to test:', pages.length);

    const results = [];

    for (const pageUrl of pages) {
        const result = await testPageLoad(pageUrl);
        results.push(result);

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
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

        console.log(`${result.page}: ${result.status} (HTTP: ${result.httpStatus || 'N/A'})`);
    });

    console.log(`\nTotal: ${results.length}, Pass: ${passCount}, Fail: ${failCount}, Error: ${errorCount}`);

    // Save results
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `documentation/05-REPORTS/artifacts/2026_01_04/team_d_group_b_basic_load_test_${timestamp}.json`;

    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved: ${filename}`);
}

main().catch(console.error);
