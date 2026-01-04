const puppeteer = require('puppeteer');

async function testLoginPageErrors() {
    console.log('=== LOGIN PAGE ERRORS ANALYSIS ===');
    console.log('Testing login page for runtime errors and extension conflicts');

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--disable-extensions']
        });

        const page = await browser.newPage();

        // Collect all console messages
        const consoleMessages = [];
        const errors = [];

        page.on('console', msg => {
            const text = msg.text();
            consoleMessages.push(text);
            console.log(`[CONSOLE] ${text}`);
        });

        page.on('pageerror', error => {
            errors.push(error.message);
            console.log(`[PAGE ERROR] ${error.message}`);
        });

        // Navigate to login page
        console.log('\n--- NAVIGATING TO LOGIN PAGE ---');
        await page.goto('http://localhost:8080/login.html', { waitUntil: 'networkidle2' });

        // Wait for page to fully load
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check for extension-related errors
        console.log('\n--- ANALYZING ERRORS ---');

        const extensionErrors = consoleMessages.filter(msg =>
            msg.includes('runtime.lastError') ||
            msg.includes('LastPass') ||
            msg.includes('Cannot create item with duplicate id')
        );

        const colorSchemeErrors = consoleMessages.filter(msg =>
            msg.includes('headerSystemReady: undefined') ||
            msg.includes('headerSystemExists: undefined')
        );

        console.log(`Extension-related errors: ${extensionErrors.length}`);
        console.log(`Color scheme timing issues: ${colorSchemeErrors.length}`);
        console.log(`Total console messages: ${consoleMessages.length}`);
        console.log(`Page errors: ${errors.length}`);

        // Check script loading order
        const scriptsLoaded = await page.evaluate(() => {
            const scripts = Array.from(document.scripts);
            return scripts.map(s => ({
                src: s.src,
                loaded: s.src ? true : false
            })).filter(s => s.src);
        });

        console.log('\n--- SCRIPT LOADING ANALYSIS ---');
        console.log(`Total scripts loaded: ${scriptsLoaded.length}`);

        const relevantScripts = scriptsLoaded.filter(s =>
            s.src.includes('login.js') ||
            s.src.includes('test_auth_infrastructure.js') ||
            s.src.includes('color-scheme-system.js')
        );

        console.log('Relevant scripts:');
        relevantScripts.forEach(script => {
            console.log(`  - ${script.src.split('/').pop()}`);
        });

        // Check for modal elements
        const modalElements = await page.$$eval('.modal, .modal-backdrop', elements => elements.length);
        console.log(`Modal elements found: ${modalElements}`);

        console.log('\n=== ANALYSIS RESULTS ===');

        if (extensionErrors.length > 0) {
            console.log('❌ EXTENSION CONFLICTS DETECTED:');
            console.log('   LastPass extension is causing duplicate ID errors');
            console.log('   This is a browser extension compatibility issue, not an app bug');
        } else {
            console.log('✅ No extension conflicts detected');
        }

        if (colorSchemeErrors.length > 0) {
            console.log('❌ COLOR SCHEME TIMING ISSUE:');
            console.log('   Color scheme running before header system is ready');
            console.log('   This indicates initialization order problem');
        } else {
            console.log('✅ Color scheme timing OK');
        }

        if (modalElements > 0) {
            console.log('❌ MODAL ELEMENTS DETECTED:');
            console.log(`   Found ${modalElements} modal elements on login page`);
        } else {
            console.log('✅ No modal elements on login page');
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testLoginPageErrors();
