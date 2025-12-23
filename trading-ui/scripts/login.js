/**
 * Login Page Script
 * TikTrack - Login Page JavaScript
 *
 * Handles login form submission and authentication
 * Version: 1.0.0
 * Created: December 21, 2025
 */

(function() {
    'use strict';

    // Constants from auth.js - must match
    const DEV_SESSION_TOKEN_KEY = 'dev_authToken';
    const DEV_SESSION_USER_KEY = 'dev_currentUser';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeLoginPage();
    });

    function initializeLoginPage() {
        const form = document.getElementById('loginForm');
        if (!form) {
            console.error('[login.js] Login form not found');
            return;
        }

        // Setup form submission handler
        form.addEventListener('submit', handleLoginSubmit);

        // Focus on username field
        const usernameField = document.getElementById('username');
        if (usernameField) {
            usernameField.focus();
        }

        // Log initialization
        if (window.Logger?.info) {
            window.Logger.info('[login.js] Login page initialized successfully', { page: 'login' });
        }
    }

    async function handleLoginSubmit(e) {
        console.log('[login.js] handleLoginSubmit called');
        e.preventDefault();
        console.log('[login.js] preventDefault called');

        // Get form values
        const username = document.getElementById('username')?.value?.trim();
        const password = document.getElementById('password')?.value?.trim();

        console.log('[login.js] Form values:', { username: username ? 'present' : 'empty', password: password ? 'present' : 'empty' });

        if (!username || !password) {
            showLoginError('אנא מלא את כל השדות');
            return;
        }

        // Set loading state
        setLoadingState(true);

        try {
            // Call login API
            const loginData = await login(username, password);

            // Success - handle authentication data
            authToken = loginData.data?.access_token || 'session_based';
            currentUser = loginData.data?.user;

            // Wait for UnifiedCacheManager to be ready and save to cache
            if (currentUser) {
                // Wait for UnifiedCacheManager to be initialized
                if (window.UnifiedCacheManager) {
                    // Wait up to 5 seconds for initialization
                    let attempts = 0;
                    while (!window.UnifiedCacheManager.initialized && attempts < 50) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                        attempts++;
                    }

                    if (window.UnifiedCacheManager.initialized) {
                        console.log('[login.js] About to save auth data to UnifiedCacheManager...');
                        try {
                            await saveAuthToCache(currentUser, authToken);
                            console.log('[login.js] Successfully saved auth data to UnifiedCacheManager');

                            // Verify the data was saved
                            const savedToken = await window.UnifiedCacheManager.get('authToken', { includeUserId: false });
                            const savedUser = await window.UnifiedCacheManager.get('currentUser', { includeUserId: false });
                            console.log('[login.js] Verification - saved token:', !!savedToken, 'saved user:', !!savedUser);

                        } catch (error) {
                            console.error('[login.js] Failed to save auth data:', error);
                        }
                    } else {
                        console.warn('[login.js] UnifiedCacheManager not initialized, using fallback storage');
                        // Fallback to sessionStorage
                        if (typeof sessionStorage !== 'undefined') {
                            sessionStorage.setItem(DEV_SESSION_USER_KEY, JSON.stringify(currentUser));
                            sessionStorage.setItem(DEV_SESSION_TOKEN_KEY, authToken);
                        }
                    }
                } else {
                    console.warn('[login.js] UnifiedCacheManager not available, using fallback storage');
                    // Fallback to sessionStorage
                    if (typeof sessionStorage !== 'undefined') {
                        sessionStorage.setItem(DEV_SESSION_USER_KEY, JSON.stringify(currentUser));
                        sessionStorage.setItem(DEV_SESSION_TOKEN_KEY, authToken);
                    }
                }

                // Also save to localStorage as backup (for api-fetch-wrapper)
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('authToken', authToken);
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                }

                console.log('[login.js] Auth data saved - token:', authToken ? 'present' : 'null', 'user:', currentUser?.username || 'null');
            }

            // Show success message
            showLoginSuccess('התחברת בהצלחה! מעביר לעמוד הראשי...');

            // Get redirect URL from sessionStorage
            const redirectUrl = sessionStorage.getItem('login_redirect_url') || '/';

            // Clear redirect URL
            sessionStorage.removeItem('login_redirect_url');

            // Redirect after short delay
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1500);

        } catch (error) {
            console.error('[login.js] Login failed:', error);
            showLoginError(error.message || 'שגיאה בהתחברות');
        } finally {
            setLoadingState(false);
        }
    }

    function showLoginError(message) {
        const errorDiv = document.getElementById('loginError');
        const successDiv = document.getElementById('loginSuccess');

        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }

        if (successDiv) {
            successDiv.style.display = 'none';
        }
    }

    function showLoginSuccess(message) {
        const errorDiv = document.getElementById('loginError');
        const successDiv = document.getElementById('loginSuccess');

        if (successDiv) {
            successDiv.textContent = message;
            successDiv.style.display = 'block';
        }

        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    function setLoadingState(loading) {
        const submitBtn = document.getElementById('loginBtn');
        const btnText = document.getElementById('loginBtnText');
        const btnSpinner = document.getElementById('loginBtnSpinner');

        if (submitBtn) {
            submitBtn.disabled = loading;
        }

        if (btnText) {
            btnText.style.display = loading ? 'none' : 'inline';
        }

        if (btnSpinner) {
            btnSpinner.style.display = loading ? 'inline' : 'none';
        }
    }

    // Log that script loaded
    if (window.Logger?.debug) {
        window.Logger.debug('[login.js] Login script loaded successfully', { page: 'login' });
    }

})();
