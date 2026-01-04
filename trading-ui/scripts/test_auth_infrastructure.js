/**
 * Test Authentication Infrastructure
 * =================================
 *
 * Provides testing-specific authentication hooks and session management
 * for automated testing compatibility.
 *
 * File: trading-ui/scripts/test_auth_infrastructure.js
 * Version: 1.0
 * Created: Fix Pack 5 - Phase 1
 */

(function() {
    'use strict';

    const TEST_AUTH_CONFIG = {
        enabled: false,
        testCredentials: {
            username: 'admin',
            password: 'admin123'
        },
        sessionPersistence: true,
        bypassAuth: false,
        debugLogging: true
    };

    // Detect testing environment
    function isTestingEnvironment() {
        return window.location.hostname === 'localhost' ||
               window.location.hostname === '127.0.0.1' ||
               window.location.search.includes('test_mode') ||
               window.localStorage.getItem('tiktrack_test_mode') === 'true';
    }

    // Initialize testing infrastructure
    function initializeTestAuthInfrastructure() {
        if (!isTestingEnvironment()) {
            console.log('[TestAuth] Not in testing environment, skipping initialization');
            return;
        }

        TEST_AUTH_CONFIG.enabled = true;
        console.log('[TestAuth] Initializing test authentication infrastructure');

        // Add testing hooks to window for Selenium access
        window.TestAuthInfrastructure = {
            login: performTestLogin,
            logout: performTestLogout,
            getSessionState: getTestSessionState,
            bypassAuth: setAuthBypass,
            reset: resetTestState
        };

        // Add session persistence for Selenium
        setupSessionPersistence();

        // Add testing event listeners
        setupTestingEventListeners();

        console.log('[TestAuth] Test authentication infrastructure initialized');
    }

    // Perform automated test login
    async function performTestLogin(username = null, password = null) {
        const creds = {
            username: username || TEST_AUTH_CONFIG.testCredentials.username,
            password: password || TEST_AUTH_CONFIG.testCredentials.password
        };

        console.log('[TestAuth] Performing automated login for:', creds.username);

        try {
            // Wait for auth system to be ready
            await waitForAuthSystem();

            // Fill login form
            const usernameInput = document.querySelector('input[name="username"], input[type="text"], #username');
            const passwordInput = document.querySelector('input[name="password"], input[type="password"], #password');
            const loginButton = document.querySelector('button[type="submit"], .login-btn, #login-btn');

            if (!usernameInput || !passwordInput) {
                throw new Error('Login form elements not found');
            }

            // Clear and fill form
            usernameInput.value = '';
            passwordInput.value = '';
            usernameInput.value = creds.username;
            passwordInput.value = creds.password;

            // Trigger input events for validation
            usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
            passwordInput.dispatchEvent(new Event('input', { bubbles: true }));

            // Click login button or submit form
            if (loginButton) {
                loginButton.click();
            } else {
                const form = usernameInput.closest('form');
                if (form) {
                    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                }
            }

            // Wait for authentication to complete
            await waitForAuthentication();

            console.log('[TestAuth] Login attempt completed');
            return { success: true, username: creds.username };

        } catch (error) {
            console.error('[TestAuth] Login failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Perform test logout
    async function performTestLogout() {
        console.log('[TestAuth] Performing automated logout');

        try {
            // Find and click logout button
            const logoutBtn = document.querySelector('.logout-btn, #logout-btn, [data-action="logout"]');
            if (logoutBtn) {
                logoutBtn.click();
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for logout
            }

            // Clear session storage and UnifiedCacheManager auth data
            sessionStorage.clear();
            if (window.UnifiedCacheManager?.initialized) {
                await window.UnifiedCacheManager.remove('authToken', { layer: 'sessionStorage' });
                await window.UnifiedCacheManager.remove('currentUser', { layer: 'sessionStorage' });
            }

            console.log('[TestAuth] Logout completed');
            return { success: true };

        } catch (error) {
            console.error('[TestAuth] Logout failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Get current session state for testing
    async function getTestSessionState() {
        const ucmAuthToken = await window.UnifiedCacheManager?.get('authToken', { layer: 'sessionStorage' }).catch(() => null);
        const ucmCurrentUser = await window.UnifiedCacheManager?.get('currentUser', { layer: 'sessionStorage' }).catch(() => null);

        return {
            isAuthenticated: !!window.authToken,
            currentUser: window.currentUser || null,
            authToken: !!window.authToken,
            sessionStorage: {
                authToken: !!sessionStorage.getItem('authToken'),
                currentUser: !!sessionStorage.getItem('currentUser')
            },
            unifiedCache: {
                authToken: !!ucmAuthToken,
                currentUser: !!ucmCurrentUser
            },
            cookies: document.cookie.includes('session') || document.cookie.includes('auth')
        };
    }

    // Set authentication bypass for testing
    function setAuthBypass(enabled = true) {
        TEST_AUTH_CONFIG.bypassAuth = enabled;
        localStorage.setItem('tiktrack_auth_bypass', enabled.toString());

        if (enabled) {
            console.log('[TestAuth] Authentication bypass enabled');
            // Simulate authenticated state
            window.authToken = 'test_bypass_token';
            window.currentUser = {
                id: 1,
                username: 'test_admin',
                role: 'admin',
                permissions: ['all']
            };

            // Trigger auth success
            if (window.onAuthSuccess) {
                window.onAuthSuccess();
            }
        } else {
            console.log('[TestAuth] Authentication bypass disabled');
            resetTestState();
        }
    }

    // Reset test state
    function resetTestState() {
        TEST_AUTH_CONFIG.bypassAuth = false;
        localStorage.removeItem('tiktrack_auth_bypass');
        sessionStorage.clear();

        // Clear auth state
        window.authToken = null;
        window.currentUser = null;

        console.log('[TestAuth] Test state reset');
    }

    // Setup session persistence for Selenium
    function setupSessionPersistence() {
        // Override session storage to persist across page reloads
        const originalSetItem = sessionStorage.setItem.bind(sessionStorage);
        const originalGetItem = sessionStorage.getItem.bind(sessionStorage);

        sessionStorage.setItem = function(key, value) {
            originalSetItem(key, value);
            // Also store in localStorage for persistence
            localStorage.setItem('session_' + key, value);
        };

        sessionStorage.getItem = function(key) {
            // Try session storage first, then localStorage backup
            let value = originalGetItem(key);
            if (value === null) {
                value = localStorage.getItem('session_' + key);
                if (value !== null) {
                    // Restore to session storage
                    originalSetItem(key, value);
                }
            }
            return value;
        };

        console.log('[TestAuth] Session persistence setup for Selenium compatibility');
    }

    // Setup testing event listeners
    function setupTestingEventListeners() {
        // Listen for auth state changes
        window.addEventListener('auth:login', () => {
            console.log('[TestAuth] Auth login event detected');
        });

        window.addEventListener('auth:logout', () => {
            console.log('[TestAuth] Auth logout event detected');
        });

        // Add global testing commands
        window.testAuthLogin = performTestLogin;
        window.testAuthLogout = performTestLogout;
        window.testGetAuthState = getTestSessionState;
    }

    // Wait for auth system to be ready
    async function waitForAuthSystem() {
        let attempts = 0;
        while (attempts < 20) {
            if (window.checkAuthentication && window.getAuthToken) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        throw new Error('Auth system not ready after 2 seconds');
    }

    // Wait for authentication to complete
    async function waitForAuthentication() {
        let attempts = 0;
        while (attempts < 30) { // 3 seconds
            if (window.authToken && window.currentUser) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        throw new Error('Authentication did not complete within 3 seconds');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTestAuthInfrastructure);
    } else {
        initializeTestAuthInfrastructure();
    }

    console.log('[TestAuth] Test authentication infrastructure script loaded');

})();
