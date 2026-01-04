#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const PAGES_TO_TEST = [
    '/cache_management.html',
    '/chart_management.html',
    '/code_quality_dashboard.html',
    '/css_management.html'
];

async function testPage(pageUrl) {
    console.log(`🔍 Testing page: ${pageUrl}`);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        // Collect console messages and errors
        const consoleMessages = [];
        const pageErrors = [];

        page.on('console', msg => {
            const text = msg.text();
            consoleMessages.push({
                type: msg.type(),
                text: text,
                timestamp: new Date().toISOString()
            });
        });

        page.on('pageerror', error => {
            pageErrors.push({
                type: 'error',
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
        });

        // Navigate to page
        console.log(`  📄 Loading: ${BASE_URL}${pageUrl}`);
        const response = await page.goto(`${BASE_URL}${pageUrl}`, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait a bit for scripts to load
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check if page loaded successfully
        const status = response.status();
        const title = await page.title();

        // Check for modal artifacts
        const modalElements = await page.$$('[class*="modal"], [id*="modal"], .popup, .overlay');
        const modalCount = modalElements.length;

        // Check for required globals
        const globalsCheck = await page.evaluate(() => {
            return {
                API_BASE_URL: typeof window.API_BASE_URL !== 'undefined',
                Logger: typeof window.Logger !== 'undefined',
                ModalManagerV2: typeof window.ModalManagerV2 !== 'undefined',
                UnifiedAppInitializer: typeof window.UnifiedAppInitializer !== 'undefined',
                TikTrackAuth: typeof window.TikTrackAuth !== 'undefined'
            };
        });

        // Filter console messages
        const criticalErrors = consoleMessages.filter(msg =>
            msg.type === 'error' ||
            msg.text.includes('MIME type') ||
            msg.text.includes('SyntaxError') ||
            msg.text.includes('TypeError') ||
            msg.text.includes('ReferenceError')
        );

        const apiErrors = consoleMessages.filter(msg =>
            msg.text.includes('401') ||
            msg.text.includes('403') ||
            msg.text.includes('500')
        );

        const result = {
            page: pageUrl,
            timestamp: new Date().toISOString(),
            status: status,
            title: title,
            load_success: status === 200,
            modal_artifacts: modalCount,
            required_globals: globalsCheck,
            console_messages: {
                total: consoleMessages.length,
                critical_errors: criticalErrors.length,
                api_errors: apiErrors.length
            },
            critical_errors_sample: criticalErrors.slice(0, 5),
            qa_verdict: (status === 200 && modalCount === 0) ? 'PASS' : 'FAIL',
            notes: []
        };

        if (status !== 200) {
            result.notes.push(`HTTP ${status} - Page failed to load`);
        }

        if (modalCount > 0) {
            result.notes.push(`${modalCount} modal artifacts detected`);
        }

        if (!Object.values(globalsCheck).every(v => v)) {
            result.notes.push('Missing required globals');
        }

        console.log(`  ✅ Status: ${status}`);
        console.log(`  🎯 Modals: ${modalCount}`);
        console.log(`  🔧 Globals: ${Object.values(globalsCheck).filter(v => v).length}/5`);
        console.log(`  📝 Console: ${criticalErrors.length} critical errors`);
        console.log(`  🎉 QA Verdict: ${result.qa_verdict}`);
        console.log('');

        return result;

    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        return {
            page: pageUrl,
            timestamp: new Date().toISOString(),
            error: error.message,
            qa_verdict: 'ERROR'
        };
    } finally {
        await browser.close();
    }
}

async function main() {
    console.log('🚀 Starting Puppeteer QA Test for Group C pages\n');

    const results = [];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    for (const pageUrl of PAGES_TO_TEST) {
        const result = await testPage(pageUrl);
        results.push(result);
    }

    // Summary
    const passed = results.filter(r => r.qa_verdict === 'PASS').length;
    const failed = results.filter(r => r.qa_verdict === 'FAIL').length;
    const errors = results.filter(r => r.qa_verdict === 'ERROR').length;

    console.log('📊 QA Summary:');
    console.log(`  ✅ PASS: ${passed}`);
    console.log(`  ❌ FAIL: ${failed}`);
    console.log(`  ⚠️  ERROR: ${errors}`);
    console.log(`  📈 Total: ${results.length}`);

    // Save results
    const outputFile = `documentation/05-REPORTS/artifacts/${timestamp}_group_c_puppeteer_qa_results.json`;
    fs.writeFileSync(outputFile, JSON.stringify({
        test_type: 'Puppeteer QA Test - Team F (Selenium Replacement)',
        timestamp: new Date().toISOString(),
        pages_tested: PAGES_TO_TEST.length,
        results: results,
        summary: {
            passed: passed,
            failed: failed,
            errors: errors,
            overall_status: (passed === PAGES_TO_TEST.length) ? 'ALL_PASS' : 'ISSUES_FOUND'
        }
    }, null, 2));

    console.log(`\n💾 Results saved to: ${outputFile}`);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testPage };
