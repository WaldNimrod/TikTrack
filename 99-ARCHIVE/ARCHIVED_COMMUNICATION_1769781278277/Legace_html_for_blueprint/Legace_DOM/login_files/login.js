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
    const SESSION_TOKEN_KEY = 'authToken';
    const SESSION_USER_KEY = 'currentUser';

    // Wait for DOM and scripts to be ready (supports defer attribute)
    function initializeWhenReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeLoginPage);
        } else {
            // DOM already loaded (defer scripts load after DOMContentLoaded)
            initializeLoginPage();
        }
    }
    
    // Initialize immediately if scripts loaded after DOMContentLoaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initializeLoginPage();
    } else {
        document.addEventListener('DOMContentLoaded', initializeLoginPage);
    }

    function initializeLoginPage() {
        // #region agent log - H8: initializeLoginPage called
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/login.js:initializeLoginPage',message:'H8: initializeLoginPage called',data:{readyState:document.readyState,formExists:!!document.getElementById('loginForm'),windowLoginExists:!!window.login,timestamp:Date.now()},sessionId:'auth-regression-debug',runId:'manifest_auth_fix',hypothesisId:'H8_login_init'})}).catch(()=>{});
        // #endregion
        
        // Force cleanup of any lingering modals/backdrops from previous pages
        forceModalCleanup();

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

    // Force cleanup function for lingering modals
    function forceModalCleanup() {
        console.log('[login.js] Checking for lingering modals on login page load');

        const openModals = document.querySelectorAll('.modal.show');
        const allBackdrops = document.querySelectorAll('.modal-backdrop');
        const hasModalOpenClass = document.body.classList.contains('modal-open');

        console.log('[login.js] Modal check:', {
            openModalsCount: openModals.length,
            openModalIds: Array.from(openModals).map(m => m.id),
            backdropsCount: allBackdrops.length,
            bodyHasModalOpen: hasModalOpenClass,
            page: window.location.pathname
        });

        let cleanupPerformed = false;

        // Hide all visible modals
        openModals.forEach(modal => {
            console.log('[login.js] Force hiding modal:', modal.id);
            modal.classList.remove('show');
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            cleanupPerformed = true;
        });

        // Remove all backdrops
        allBackdrops.forEach(backdrop => {
            console.log('[login.js] Force removing backdrop');
            if (backdrop.parentNode) {
                backdrop.parentNode.removeChild(backdrop);
            }
            cleanupPerformed = true;
        });

        // Clean up body classes and styles
        if (hasModalOpenClass) {
            document.body.classList.remove('modal-open');
            cleanupPerformed = true;
        }

        if (document.body.style.overflow === 'hidden') {
            document.body.style.overflow = '';
            cleanupPerformed = true;
        }

        if (cleanupPerformed) {
            console.log('[login.js] Modal cleanup completed on login page');
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
            // agent log - login function availability check
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    location: 'trading-ui/scripts/login.js:handleLoginSubmit',
                    message: 'Checking for window.login availability',
                    data: {
                        windowLoginType: typeof window.login,
                        documentReadyState: document.readyState,
                        timestamp: Date.now()
                    },
                    sessionId: 'login_function_availability_check',
                    runId: 'option1_login_fix',
                    hypothesisId: 'login_function_available'
                })
            }).catch(() => {});
            // endregion

            // Wait for login function to be available
            let attempts = 0;
            while (typeof window.login !== 'function' && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
                console.log(`[login.js] Waiting for login function, attempt ${attempts}, available:`, typeof window.login);
                
                // agent log - waiting for login function
                if (attempts % 10 === 0) {
                    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            location: 'trading-ui/scripts/login.js:handleLoginSubmit',
                            message: 'Still waiting for window.login',
                            data: {
                                attempts: attempts,
                                windowLoginType: typeof window.login,
                                documentReadyState: document.readyState,
                                timestamp: Date.now()
                            },
                            sessionId: 'login_function_availability_check',
                            runId: 'option1_login_fix',
                            hypothesisId: 'login_function_waiting'
                        })
                    }).catch(() => {});
                }
                // endregion
            }

            if (typeof window.login !== 'function') {
                // region agent log - login function not available error
                fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        location: 'trading-ui/scripts/login.js:handleLoginSubmit',
                        message: 'ERROR: login function not available after waiting',
                        data: {
                            attempts: attempts,
                            windowLoginType: typeof window.login,
                            documentReadyState: document.readyState,
                            timestamp: Date.now()
                        },
                        sessionId: 'login_function_availability_check',
                        runId: 'option1_login_fix',
                        hypothesisId: 'login_function_not_available'
                    })
                }).catch(() => {});
                // endregion
                throw new Error('login function not available after waiting - auth.js failed to load');
            }
            
            // region agent log - login function available success
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    location: 'trading-ui/scripts/login.js:handleLoginSubmit',
                    message: 'SUCCESS: login function available',
                    data: {
                        attempts: attempts,
                        windowLoginType: typeof window.login,
                        documentReadyState: document.readyState,
                        timestamp: Date.now()
                    },
                    sessionId: 'login_function_availability_check',
                    runId: 'option1_login_fix',
                    hypothesisId: 'login_function_available_success'
                })
            }).catch(() => {});
            // endregion

            console.log('[login.js] login function available, calling...');
            const loginData = await window.login(username, password);

            // Success - handle authentication data
            authToken = loginData.data?.token || 'session_based';
            currentUser = loginData.data?.user;
            
            // #region agent log - login.js after window.login call
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/login.js:handleLoginSubmit:afterWindowLogin',message:'After window.login call',data:{hasLoginData:!!loginData,hasAuthToken:!!authToken,hasCurrentUser:!!currentUser,sessionToken:!!sessionStorage.getItem('authToken'),sessionUser:!!sessionStorage.getItem('currentUser'),windowToken:!!window.authToken,windowUser:!!window.currentUser,timestamp:Date.now()},sessionId:'debug-session',runId:'p0_redirect_loop_fix_v2',hypothesisId:'H6_login_flow'})}).catch(()=>{});
            // #endregion

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
                        console.log('[login.js] About to save auth data to UnifiedCacheManager SessionStorageLayer...');
                        try {
                            // Option 1: Use UnifiedCacheManager SessionStorageLayer directly
                            await window.UnifiedCacheManager.save('authToken', authToken, { 
                                layer: 'sessionStorage', 
                                includeUserId: false 
                            });
                            await window.UnifiedCacheManager.save('currentUser', currentUser, { 
                                layer: 'sessionStorage', 
                                includeUserId: false 
                            });
                            
                            // Also save to bootstrap keys for compatibility (before UnifiedCacheManager initializes)
                            if (typeof sessionStorage !== 'undefined') {
                                sessionStorage.setItem(SESSION_TOKEN_KEY, authToken);
                                sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(currentUser));
                            }
                            
                            console.log('[login.js] Successfully saved auth data to UnifiedCacheManager SessionStorageLayer');

                            // Verify the data was saved
                            const savedToken = await window.UnifiedCacheManager.get('authToken', { 
                                layer: 'sessionStorage', 
                                includeUserId: false 
                            });
                            const savedUser = await window.UnifiedCacheManager.get('currentUser', { 
                                layer: 'sessionStorage', 
                                includeUserId: false 
                            });
                            console.log('[login.js] Verification - saved token:', !!savedToken, 'saved user:', !!savedUser);

                        } catch (error) {
                            console.error('[login.js] Failed to save auth data:', error);
                            // Fallback to sessionStorage bootstrap keys
                            if (typeof sessionStorage !== 'undefined') {
                                sessionStorage.setItem(SESSION_TOKEN_KEY, authToken);
                                sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(currentUser));
                            }
                        }
                    } else {
                        console.warn('[login.js] UnifiedCacheManager not initialized, using sessionStorage bootstrap keys');
                        // Fallback to sessionStorage bootstrap keys (Option 1 compliant)
                        if (typeof sessionStorage !== 'undefined') {
                            sessionStorage.setItem(SESSION_TOKEN_KEY, authToken);
                            sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(currentUser));
                            
                            // ✅ CRITICAL FIX: Verify tokens were saved
                            const verifyToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
                            const verifyUser = sessionStorage.getItem(SESSION_USER_KEY);
                            console.log('[login.js] Token verification after save:', {
                                tokenSaved: !!verifyToken,
                                userSaved: !!verifyUser,
                                tokenLength: verifyToken?.length || 0
                            });
                        }

                        // ✅ CRITICAL FIX: Update window objects immediately for immediate authentication
                        window.authToken = authToken;
                        window.currentUser = currentUser;
                        console.log('[login.js] Window globals set:', {
                            windowToken: !!window.authToken,
                            windowUser: !!window.currentUser
                        });
                    }
                } else {
                    console.warn('[login.js] UnifiedCacheManager not available, using sessionStorage bootstrap keys');
                    // Fallback to sessionStorage bootstrap keys (Option 1 compliant)
                    if (typeof sessionStorage !== 'undefined') {
                        sessionStorage.setItem(SESSION_TOKEN_KEY, authToken);
                        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(currentUser));
                        
                        // ✅ CRITICAL FIX: Verify tokens were saved
                        const verifyToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
                        const verifyUser = sessionStorage.getItem(SESSION_USER_KEY);
                        console.log('[login.js] Token verification after save (no UCM):', {
                            tokenSaved: !!verifyToken,
                            userSaved: !!verifyUser,
                            tokenLength: verifyToken?.length || 0
                        });
                    }
                    
                    // ✅ CRITICAL FIX: Set window globals for immediate authentication
                    window.authToken = authToken;
                    window.currentUser = currentUser;
                    console.log('[login.js] Window globals set (no UCM):', {
                        windowToken: !!window.authToken,
                        windowUser: !!window.currentUser
                    });
                }

                // Auth data is stored via saveAuthToCache() function (SessionStorageLayer only per Option 1)

                console.log('[login.js] Auth data saved - token:', authToken ? 'present' : 'null', 'user:', currentUser?.username || 'null');
            }

            // Show success message
            showLoginSuccess('התחברת בהצלחה! מעביר לעמוד הראשי...');

            // Get redirect URL from sessionStorage
            const redirectUrl = sessionStorage.getItem('login_redirect_url') || '/';

            // Clear redirect URL
            sessionStorage.removeItem('login_redirect_url');

            // Debug modal state before redirect
            const openModals = document.querySelectorAll('.modal.show');
            const allBackdrops = document.querySelectorAll('.modal-backdrop');
            console.log('[login.js] Before redirect - checking for lingering modals:', {
                openModalsCount: openModals.length,
                openModalIds: Array.from(openModals).map(m => m.id),
                backdropsCount: allBackdrops.length,
                bodyHasModalOpen: document.body.classList.contains('modal-open'),
                page: window.location.pathname
            });

            // Force cleanup of any lingering modals/backdrops
            openModals.forEach(modal => {
                console.log('[login.js] Force hiding modal:', modal.id);
                const bsModal = bootstrap?.Modal?.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
                }
            });

            allBackdrops.forEach(backdrop => {
                console.log('[login.js] Force removing backdrop:', backdrop.id || 'unnamed');
                if (backdrop.parentNode) {
                    backdrop.parentNode.removeChild(backdrop);
                }
            });

            // Ensure body is clean
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';

            // ✅ CRITICAL FIX: Ensure tokens are persisted before redirect
            // Small delay to ensure sessionStorage is persisted
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Verify tokens one more time before redirect
            const finalTokenCheck = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(SESSION_TOKEN_KEY) : null;
            const finalUserCheck = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(SESSION_USER_KEY) : null;
            console.log('[login.js] Final token check before redirect:', {
                sessionToken: !!finalTokenCheck,
                sessionUser: !!finalUserCheck,
                windowToken: !!window.authToken,
                windowUser: !!window.currentUser
            });
            
            // #region agent log - login.js before redirect
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/login.js:handleLoginSubmit:beforeRedirect',message:'Before redirect - final token check',data:{sessionToken:!!finalTokenCheck,sessionUser:!!finalUserCheck,windowToken:!!window.authToken,windowUser:!!window.currentUser,redirectUrl:redirectUrl,timestamp:Date.now()},sessionId:'debug-session',runId:'p0_redirect_loop_fix_v2',hypothesisId:'H6_redirect_timing'})}).catch(()=>{});
            // #endregion
            
            // ✅ CRITICAL FIX: Use window.location.replace() instead of href to preserve sessionStorage
            // Redirect after short delay
            setTimeout(() => {
                console.log('[login.js] Redirecting to:', redirectUrl);
                // Use replace() instead of href to preserve sessionStorage across navigation
                window.location.replace(redirectUrl);
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
            btnSpinner.classList.toggle('show', loading);
        }
    }

    // Log that script loaded
    if (window.Logger?.debug) {
        window.Logger.debug('[login.js] Login script loaded successfully', { page: 'login' });
    }

})();
