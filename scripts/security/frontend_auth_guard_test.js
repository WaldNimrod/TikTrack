/**
 * Frontend Auth Guard Test
 * ========================
 * 
 * Tests to verify that auth-guard is loaded and working on all pages
 * 
 * Usage:
 *   Run in browser console or via automated testing
 * 
 * Author: TikTrack Development Team
 * Date: December 2025
 */

(function() {
    'use strict';
    
    const PUBLIC_PAGES = [
        'login.html',
        'register.html',
        'reset-password.html',
        'forgot-password.html'
    ];
    
    function isPublicPage(pageName) {
        return PUBLIC_PAGES.some(publicPage => pageName.includes(publicPage));
    }
    
    function testAuthGuardOnPage() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const isPublic = isPublicPage(currentPage);
        
        const results = {
            page: currentPage,
            isPublic: isPublic,
            authGuardLoaded: typeof window.AuthGuard !== 'undefined',
            authLoaded: typeof window.isAuthenticated === 'function',
            tests: []
        };
        
        // Test 1: Check if AuthGuard is loaded
        if (results.authGuardLoaded) {
            results.tests.push({
                name: 'AuthGuard loaded',
                passed: true,
                message: 'AuthGuard is available'
            });
        } else {
            results.tests.push({
                name: 'AuthGuard loaded',
                passed: false,
                message: 'AuthGuard is not available - check BASE package configuration'
            });
        }
        
        // Test 2: Check if auth.js functions are available
        if (results.authLoaded) {
            results.tests.push({
                name: 'Auth functions loaded',
                passed: true,
                message: 'isAuthenticated function is available'
            });
        } else {
            results.tests.push({
                name: 'Auth functions loaded',
                passed: false,
                message: 'isAuthenticated function is not available - check BASE package configuration'
            });
        }
        
        // Test 3: Check if AuthGuard.init was called (for non-public pages)
        if (!isPublic) {
            // We can't easily check if init was called, but we can check if the guard would work
            if (results.authGuardLoaded && results.authLoaded) {
                results.tests.push({
                    name: 'AuthGuard ready for protected page',
                    passed: true,
                    message: 'AuthGuard and auth functions are loaded - page should be protected'
                });
            } else {
                results.tests.push({
                    name: 'AuthGuard ready for protected page',
                    passed: false,
                    message: 'AuthGuard or auth functions missing - page is not protected'
                });
            }
        } else {
            results.tests.push({
                name: 'Public page check',
                passed: true,
                message: 'This is a public page - auth guard should skip authentication'
            });
        }
        
        return results;
    }
    
    function testAllPages() {
        // This would need to be run via automated testing framework
        // For now, we provide a function to test the current page
        console.log('Testing auth-guard on current page...');
        const results = testAuthGuardOnPage();
        
        console.log('\n=== Auth Guard Test Results ===');
        console.log(`Page: ${results.page}`);
        console.log(`Is Public: ${results.isPublic}`);
        console.log(`AuthGuard Loaded: ${results.authGuardLoaded}`);
        console.log(`Auth Functions Loaded: ${results.authLoaded}`);
        console.log('\nTest Results:');
        
        results.tests.forEach(test => {
            const icon = test.passed ? '✅' : '❌';
            console.log(`${icon} ${test.name}: ${test.message}`);
        });
        
        const allPassed = results.tests.every(t => t.passed);
        console.log(`\n${allPassed ? '✅ All tests passed' : '❌ Some tests failed'}`);
        
        return results;
    }
    
    // Export for use
    window.AuthGuardTest = {
        testCurrentPage: testAuthGuardOnPage,
        testAllPages: testAllPages,
        run: testAllPages
    };
    
    // Auto-run if in browser console
    if (typeof window !== 'undefined' && window.console) {
        console.log('Auth Guard Test loaded. Run window.AuthGuardTest.run() to test current page.');
    }
})();

