/**
 * TikTrack Authentication System
 * מערכת התחברות גלובלית לאתר
 *
 * Dependencies:
 * - main.js (global utilities)
 * - translation-utils.js (translation functions)
 *
 * File: trading-ui/scripts/auth.js
 * Version: 2.2
 * Last Updated: August 23, 2025
 */


// ===== FUNCTION INDEX =====
// === Object Methods ===
// - reloadButton.onclick() - Onclick

// === Initialization ===
// - setupLoginForm() - Setuploginform
// - createLoginInterface() - Createlogininterface
// - createLogoutButton() - Createlogoutbutton
// - setupVisibilityCheck() - Setupvisibilitycheck

// === Event Handlers ===
// - checkAuthentication() - Checkauthentication
// - hasPermission() - Haspermission

// === UI Functions ===
// - showLoginError() - Showloginerror
// - showLoginSuccess() - Showloginsuccess
// - showDashboard() - Showdashboard
// - showLogin() - Showlogin
// - showLoginModal() - Showloginmodal
// - updateUserProfile() - Updateuserprofile
// - updatePassword() - Updatepassword

// === Data Functions ===
// - saveAuthToCache() - Saveauthtocache
// - getAuthFromCache() - Getauthfromcache
// - setLoadingState() - Setloadingstate
// - saveCredentials() - Savecredentials
// - loadSavedCredentials() - Loadsavedcredentials
// - getAuthToken() - Getauthtoken
// - getCurrentUser() - Getcurrentuser
// - getCurrentUserAsync() - Getcurrentuserasync

// === Utility Functions ===
// - stopVisibilityCheck() - Stopvisibilitycheck

// === Other ===
// - removeAuthFromCache() - Removeauthfromcache
// - forceLogoutAndPrompt() - Forcelogoutandprompt
// - login() - Login
// - register() - Register
// - logout() - Logout
// - isAuthenticated() - Isauthenticated
// - isAuthenticatedSync() - Isauthenticatedsync
// - hasRole() - Hasrole

// משתנים גלובליים
let authToken = null;
let currentUser = null;

// Helper functions for cache operations with consistent key handling
// CRITICAL: Always use includeUserId: false for auth-related keys to avoid key mismatches
// SessionStorageLayer is used for auth tokens (bootstrap compatibility + unified management)
const authCacheOptions = { includeUserId: false, layer: 'sessionStorage' };
const DEV_SESSION_TOKEN_KEY = 'dev_authToken';
const DEV_SESSION_USER_KEY = 'dev_currentUser';
const authBroadcastChannel = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('tiktrack_auth_channel') : null;

/**
 * Helper function to check if current page is a public page (login, register, etc.)
 * @returns {boolean}
 */
function isPublicPage() {
  const path = window.location?.pathname || '';
  const publicPages = ['login.html', 'register.html', 'reset_password.html', 'forgot_password.html'];
  return publicPages.some(page => path.includes(page));
}

/**
 * Helper function to send debug log only if not on public page
 * Prevents CORS errors on login.html and other public pages
 */
function sendDebugLog(location, message, data, hypothesisId) {
  // Debug logging disabled - only log critical errors via console if needed
  // Removed to prevent CORS errors and reduce log noise
  return;
}

// Bootstrap auth from sessionStorage (dev mode) as early as possible
(function bootstrapAuthFromSessionStorage() {
  try {
    if (typeof sessionStorage === 'undefined') return;
    const storedToken = sessionStorage.getItem(DEV_SESSION_TOKEN_KEY);
    const storedUserRaw = sessionStorage.getItem(DEV_SESSION_USER_KEY);
    if (!storedToken || !storedUserRaw) return;
    const storedUser = JSON.parse(storedUserRaw);
    authToken = storedToken;
    currentUser = storedUser;
    // Best effort: sync to UnifiedCacheManager after initialization
    // This ensures bootstrap data is synced to SessionStorageLayer for unified management
    if (window.UnifiedCacheManager) {
      // Try immediate sync if already initialized
      if (window.UnifiedCacheManager.initialized) {
        window.UnifiedCacheManager.save('authToken', storedToken, { 
          layer: 'sessionStorage', 
          includeUserId: false 
        }).catch(() => {});
        window.UnifiedCacheManager.save('currentUser', storedUser, { 
          layer: 'sessionStorage', 
          includeUserId: false 
        }).catch(() => {});
      } else {
        // Wait for initialization and sync (non-blocking)
        const syncInterval = setInterval(() => {
          if (window.UnifiedCacheManager?.initialized) {
            clearInterval(syncInterval);
            window.UnifiedCacheManager.save('authToken', storedToken, { 
              layer: 'sessionStorage', 
              includeUserId: false 
            }).catch(() => {});
            window.UnifiedCacheManager.save('currentUser', storedUser, { 
              layer: 'sessionStorage', 
              includeUserId: false 
            }).catch(() => {});
          }
        }, 100);
        // Timeout after 5 seconds to prevent infinite polling
        setTimeout(() => clearInterval(syncInterval), 5000);
      }
    }
    window.Logger?.info?.('✅ [auth.js] Bootstrapped auth from sessionStorage', {
      page: 'auth',
      hasToken: !!storedToken,
      hasUser: !!storedUser
    });
  } catch (e) {
    window.Logger?.warn?.('⚠️ [auth.js] Failed to bootstrap auth from sessionStorage', { error: e?.message });
  }
})();

function broadcastAuthEvent(eventPayload) {
  // Broadcast via BroadcastChannel if available
  if (authBroadcastChannel) {
    try {
      authBroadcastChannel.postMessage(eventPayload);
    } catch (e) {
      window.Logger?.warn?.('⚠️ [auth.js] BroadcastChannel post failed', { error: e?.message });
    }
  }
  // Also use localStorage event for legacy multi-tab sync
  try {
    localStorage.setItem('tiktrack_auth_event', JSON.stringify(eventPayload));
    setTimeout(() => {
      localStorage.removeItem('tiktrack_auth_event');
    }, 100);
  } catch (e) {
    window.Logger?.warn?.('⚠️ [auth.js] localStorage auth event failed', { error: e?.message });
  }
}

async function saveAuthToCache(user, token = 'session_based') {
  console.log('💾 [auth.js] saveAuthToCache called', {
    userId: user?.id,
    username: user?.username,
    tokenType: typeof token,
    token: !!token
  });
  window.AuthDebugMonitor?.log('info', '💾 saveAuthToCache called', {
    userId: user?.id,
    username: user?.username,
    tokenType: typeof token
  });
  
  try {
    if (window.UnifiedCacheManager?.initialized) {
      // Use SessionStorageLayer through UnifiedCacheManager (preferred method)
      await window.UnifiedCacheManager.save('authToken', token, { 
        layer: 'sessionStorage', 
        includeUserId: false 
      });
      await window.UnifiedCacheManager.save('currentUser', user, { 
        layer: 'sessionStorage', 
        includeUserId: false 
      });
      
      // Also save to bootstrap keys for compatibility (fallback if UnifiedCacheManager not available)
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(DEV_SESSION_TOKEN_KEY, token);
        sessionStorage.setItem(DEV_SESSION_USER_KEY, JSON.stringify(user));
      }
    } else {
      // Fallback: direct sessionStorage (bootstrap mode - before UnifiedCacheManager initializes)
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(DEV_SESSION_TOKEN_KEY, token);
        sessionStorage.setItem(DEV_SESSION_USER_KEY, JSON.stringify(user));
      } else {
        window.AuthDebugMonitor?.log('error', '❌ No sessionStorage available for saveAuthToCache');
        return false;
      }
    }
    
    // Verify - check SessionStorageLayer first, then bootstrap keys
    let verifyUser = null;
    let verifyToken = null;
    if (window.UnifiedCacheManager?.initialized) {
      verifyUser = await window.UnifiedCacheManager.get('currentUser', { 
        layer: 'sessionStorage', 
        includeUserId: false 
      });
      verifyToken = await window.UnifiedCacheManager.get('authToken', { 
        layer: 'sessionStorage', 
        includeUserId: false 
      });
    }
    // Fallback to bootstrap keys if not found in SessionStorageLayer
    if (!verifyUser || !verifyToken) {
      if (typeof sessionStorage !== 'undefined') {
        verifyUser = JSON.parse(sessionStorage.getItem(DEV_SESSION_USER_KEY) || 'null');
        verifyToken = sessionStorage.getItem(DEV_SESSION_TOKEN_KEY);
      }
    }
    
    window.AuthDebugMonitor?.log('info', '✅ saveAuthToCache completed', {
      userSaved: verifyUser !== null,
      tokenSaved: verifyToken !== null,
      userId: verifyUser?.id
    });
    
    return true;
  } catch (error) {
    window.AuthDebugMonitor?.log('error', '❌ saveAuthToCache failed', {
      error: error.message,
      stack: error.stack
    });
    return false;
  }
}

async function getAuthFromCache() {
  window.AuthDebugMonitor?.log('info', '🔍 getAuthFromCache', {});
  
  try {
    // Try SessionStorageLayer through UnifiedCacheManager first (preferred method)
    if (window.UnifiedCacheManager?.initialized) {
      const user = await window.UnifiedCacheManager.get('currentUser', { 
        layer: 'sessionStorage', 
        includeUserId: false 
      });
      const token = await window.UnifiedCacheManager.get('authToken', { 
        layer: 'sessionStorage', 
        includeUserId: false 
      });
      
      if (user && token) {
        window.AuthDebugMonitor?.log('info', '✅ getAuthFromCache result (SessionStorageLayer)', {
          userFound: user !== null,
          tokenFound: token !== null,
          userId: user?.id
        });
        return { user, token };
      }
    }
    
    // Fallback: direct sessionStorage (bootstrap mode - before UnifiedCacheManager initializes)
    if (typeof sessionStorage !== 'undefined') {
      const user = JSON.parse(sessionStorage.getItem(DEV_SESSION_USER_KEY) || 'null');
      const token = sessionStorage.getItem(DEV_SESSION_TOKEN_KEY);
      if (user && token) {
        return { user, token };
      }
    }
    
    window.AuthDebugMonitor?.log('error', '❌ No cache layer available for getAuthFromCache');
    return { user: null, token: null };
  } catch (error) {
    window.AuthDebugMonitor?.log('error', '❌ getAuthFromCache failed', {
      error: error.message
    });
    return { user: null, token: null };
  }
}

async function removeAuthFromCache() {
  window.AuthDebugMonitor?.log('warn', '🗑️ removeAuthFromCache called');
  
  try {
    // Remove from SessionStorageLayer through UnifiedCacheManager (preferred method)
    if (window.UnifiedCacheManager?.initialized) {
      await window.UnifiedCacheManager.remove('authToken', { 
        layer: 'sessionStorage', 
        includeUserId: false 
      });
      await window.UnifiedCacheManager.remove('currentUser', { 
        layer: 'sessionStorage', 
        includeUserId: false 
      });
    }
    
    // Always clear bootstrap keys as fallback (bootstrap mode compatibility)
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(DEV_SESSION_TOKEN_KEY);
      sessionStorage.removeItem(DEV_SESSION_USER_KEY);
    }
    
    window.AuthDebugMonitor?.log('info', '✅ removeAuthFromCache completed');
    return true;
  } catch (error) {
    window.AuthDebugMonitor?.log('error', '❌ removeAuthFromCache failed', {
      error: error.message
    });
    return false;
  }
}

/**
 * Force logout: clear all auth caches (all layers) and show login modal
 * Used on 401 / session-expired flows to avoid "phantom auth" states.
 */
async function forceLogoutAndPrompt(reason = 'unauthorized') {
  try {
    // Stop visibility checks to avoid duplicate fetches
    if (typeof stopVisibilityCheck === 'function') {
      stopVisibilityCheck();
    }
  } catch (e) {
    window.Logger?.warn?.('⚠️ [auth.js] Failed to stop visibility check', { error: e?.message });
  }
  
  // Clear in-memory state
  authToken = null;
  currentUser = null;
  
  // Clear all cache layers if available
  try {
    if (window.CacheSyncManager?.clearAll) {
      await window.CacheSyncManager.clearAll();
    }
  } catch (e) {
    window.Logger?.warn?.('⚠️ [auth.js] CacheSyncManager clearAll failed', { error: e?.message });
  }
  
  try {
    if (window.UnifiedCacheManager?.clearAll) {
      await window.UnifiedCacheManager.clearAll({ includeUserId: false });
    } else {
      await removeAuthFromCache();
    }
  } catch (e) {
    window.Logger?.warn?.('⚠️ [auth.js] UnifiedCacheManager clearAll failed', { error: e?.message });
  }
  
  // Broadcast logout to other tabs
  try {
    const logoutEvent = {
      type: 'logout',
      timestamp: new Date().toISOString(),
      source: 'auth.js',
      reason
    };
    broadcastAuthEvent(logoutEvent);
  } catch (e) {
    window.Logger?.warn?.('⚠️ [auth.js] Failed broadcasting logout event', { error: e?.message });
  }
  
  // Show login modal (preferred). No redirect to login.html (page removed).
  if (typeof window.TikTrackAuth?.showLoginModal === 'function') {
    await window.TikTrackAuth.showLoginModal();
  }
}

// Setup storage event listener for multi-tab logout/login sync
if (typeof window.addEventListener === 'function') {
  window.addEventListener('storage', async (event) => {
    // Check if it's our auth event (logout/login)
    if (event.key === 'tiktrack_auth_event' && event.newValue) {
      try {
        const authEvent = JSON.parse(event.newValue);
        if (authEvent.type === 'logout') {
          // Logout event from another tab - clear local state and redirect
          console.log('🔔 Logout event received from another tab');
          
          // Clear local state using helper function
          authToken = null;
          currentUser = null;
          await removeAuthFromCache();
          // Keep saved credentials in localStorage for cross-tab sync
          localStorage.removeItem('savedUsername');
          localStorage.removeItem('savedPassword');
          localStorage.removeItem('rememberCredentials');
          
          // Clear sessionStorage
          try {
            sessionStorage.removeItem('redirectAfterLogin');
            const sessionKeys = Object.keys(sessionStorage);
            sessionKeys.forEach(key => {
              if (key.startsWith('tiktrack_') || key.includes('auth') || key.includes('user')) {
                sessionStorage.removeItem(key);
              }
            });
          } catch (error) {
            console.warn('Error clearing sessionStorage during logout from other tab:', error);
          }
          
          // Clear all cache layers
          try {
            if (window.UnifiedCacheManager?.clearAll) {
              await window.UnifiedCacheManager.clearAll();
            }
            if (window.CacheSyncManager?.clearAll) {
              await window.CacheSyncManager.clearAll();
            }
            // Clear IndexedDB cache databases
            if (window.indexedDB && window.indexedDB.databases) {
              const databases = await window.indexedDB.databases();
              for (const db of databases) {
                if (db.name && db.name.includes('TikTrack') && 
                    (db.name.includes('cache') || db.name === 'unified-cache' || db.name === 'tiktrack-cache')) {
                  const deleteReq = window.indexedDB.deleteDatabase(db.name);
                  deleteReq.onsuccess = () => console.log(`Cleared IndexedDB: ${db.name}`);
                }
              }
            }
          } catch (error) {
            console.warn('Error clearing cache during logout from other tab:', error);
          }
          
          // Clear dashboard data state
          if (window.dashboardDataState) {
            window.dashboardDataState.data = { trades: [], alerts: [], accounts: [], cashFlows: [] };
            window.dashboardDataState.lastLoadedAt = null;
          }
          
          // Update header display
          if (window.headerSystem?.updateUserDisplay) {
            window.headerSystem.updateUserDisplay();
          }
          
          // Dispatch logout event for current tab
          window.dispatchEvent(new CustomEvent('logout:success'));
          window.dispatchEvent(new CustomEvent('user:logged-out'));
          
          // Show login modal (single flow, no login.html redirects)
          if (typeof window.TikTrackAuth?.showLoginModal === 'function') {
            await window.TikTrackAuth.showLoginModal();
          }
        } else if (authEvent.type === 'login') {
          // Login event from another tab - update local state
          // Only process if it's actually from another tab (not from current tab)
          if (authEvent.source === 'auth.js' && event.oldValue === null) {
            // This is from current tab - ignore to prevent infinite loop
            return;
          }
          
          console.log('🔔 Login event received from another tab');
          
          // Check if it's a different user - if so, clear cache and reload
          const currentUserId = currentUser?.id;
          const newUserId = authEvent.userId;
          
          if (currentUserId && newUserId && currentUserId !== newUserId) {
            console.log(`⚠️ Different user logged in (${currentUserId} → ${newUserId}). Clearing cache and reloading.`);
            // Clear all cache layers for user switch
            try {
              if (window.UnifiedCacheManager?.clearAll) {
                await window.UnifiedCacheManager.clearAll();
              }
              if (window.CacheSyncManager?.clearAll) {
                await window.CacheSyncManager.clearAll();
              }
              // Clear dashboard data state
              if (window.dashboardDataState) {
                window.dashboardDataState.data = { trades: [], alerts: [], accounts: [], cashFlows: [] };
                window.dashboardDataState.lastLoadedAt = null;
              }
            } catch (error) {
              console.warn('Error clearing cache during user switch:', error);
            }
          }
          
          // Only reload if user is not already authenticated or user changed
          if (!currentUser || (newUserId && currentUserId !== newUserId)) {
            // Reload user data from server (with debounce to prevent rate limiting)
            if (typeof checkAuthentication === 'function') {
              // Use debounce to prevent multiple rapid calls
              if (!window._authCheckPending) {
                window._authCheckPending = true;
                setTimeout(async () => {
                  await checkAuthentication();
                  window._authCheckPending = false;
                }, 500);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing auth event from storage:', error);
      }
    }
  });

  if (authBroadcastChannel) {
    authBroadcastChannel.onmessage = async (message) => {
      const authEvent = message?.data;
      if (!authEvent) return;
      try {
        if (authEvent.type === 'logout') {
          console.log('🔔 Logout event received via BroadcastChannel');
          authToken = null;
          currentUser = null;
          await removeAuthFromCache();
          try {
            sessionStorage.removeItem('redirectAfterLogin');
          } catch (_) {}
          if (window.headerSystem?.updateUserDisplay) {
            window.headerSystem.updateUserDisplay();
          }
          window.dispatchEvent(new CustomEvent('logout:success'));
          window.dispatchEvent(new CustomEvent('user:logged-out'));
          if (typeof window.TikTrackAuth?.showLoginModal === 'function') {
            await window.TikTrackAuth.showLoginModal();
          }
        } else if (authEvent.type === 'login') {
          console.log('🔔 Login event received via BroadcastChannel');
          // Refresh header; optionally re-check auth
          currentUser = authEvent.user || currentUser;
          authToken = authEvent.token || authToken;
          if (window.headerSystem?.updateUserDisplay) {
            window.headerSystem.updateUserDisplay();
          }
          if (typeof checkAuthentication === 'function') {
            await checkAuthentication();
          }
        }
      } catch (error) {
        console.error('Error handling auth event via BroadcastChannel:', error);
      }
    };
  }
}

// פונקציות התחברות
async function login(username, password) {
  // BREAKPOINT: Login start
  window.AuthDebugMonitor?.log('info', '🔐 LOGIN function called', { username, timestamp: new Date().toISOString() });
  if (window.DEBUG_AUTH_MONITOR === true) debugger; // Breakpoint helper
  
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();

  if (!response.ok || data.status !== 'success') {
    window.AuthDebugMonitor?.log('error', '❌ LOGIN failed', { 
      username, 
      status: response.status,
      error: data.error?.message 
    });
    throw new Error(data.error?.message || 'שגיאה בהתחברות');
  }

  // BREAKPOINT: After successful login response
  window.AuthDebugMonitor?.log('info', '✅ LOGIN response received', { 
    username,
    hasUser: !!data.data?.user,
    userId: data.data?.user?.id,
    userKeys: data.data?.user ? Object.keys(data.data.user) : null
  });
  if (window.DEBUG_AUTH_MONITOR === true) debugger; // Breakpoint helper

  // Store user + token in UnifiedCacheManager - ONLY UnifiedCacheManager, no fallbacks
  if (data.data?.user) {
    currentUser = data.data.user;
    authToken = data.data?.access_token;
    await saveAuthToCache(currentUser, authToken);
    
    // Save timestamp to prevent redirect loop (auth-guard checks this)
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('recent_login_timestamp', Date.now().toString());
    }
  }

  window.AuthDebugMonitor?.log('info', '✅ LOGIN function completed', { username, userId: currentUser?.id });
  return data;
}

// פונקציית הרשמה
async function register(username, password, email, first_name, last_name) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
      email: email || undefined,
      first_name: first_name || undefined,
      last_name: last_name || undefined
    })
  });

  const data = await response.json();

  if (!response.ok || data.status !== 'success') {
    throw new Error(data.error?.message || 'שגיאה בהרשמה');
  }

  return {
    success: true,
    user: data.data?.user,
    access_token: data.data?.access_token
  };
}

function showLoginError(message, containerId = 'loginError') {
  const errorDiv = document.getElementById(containerId);
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    // הסתרת הודעת שגיאה אחרי 5 שניות
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  } else {
    // אם אין אלמנט שגיאה, נציג console error
    // שגיאה
  }
}

function closeLoginModal() {
  const modalId = 'loginModal';
  const modalEl = document.getElementById(modalId);
  if (!modalEl) {return;}
  try {
    const inst = window.bootstrap?.Modal?.getInstance(modalEl) || (window.bootstrap?.Modal ? new window.bootstrap.Modal(modalEl) : null);
    if (inst) {
      inst.hide();
    }
    modalEl.classList.remove('show');
    modalEl.style.display = 'none';
    if (window.ModalNavigationService?.pop) {
      window.ModalNavigationService.pop(modalId);
    }
    if (window.ModalZIndexManager?.forceUpdate) {
      window.ModalZIndexManager.forceUpdate();
    }
    setTimeout(() => modalEl.remove(), 150);
  } catch (e) {
    window.Logger?.warn?.('⚠️ [auth.js] closeLoginModal failed', { error: e?.message });
    modalEl.remove();
  }
}

function showLoginSuccess(message, containerId = 'loginSuccess', showReloadButton = false) {
  window.AuthDebugMonitor?.log('info', '📢 showLoginSuccess called', {
    message,
    containerId,
    showReloadButton,
    timestamp: new Date().toISOString()
  });
  
  const successDiv = document.getElementById(containerId);
  if (!successDiv) {
    window.AuthDebugMonitor?.log('error', '❌ showLoginSuccess: Container not found', {
      containerId
    });
    return;
  }
  
  // Clear previous content
  successDiv.innerHTML = '';
  
  // Add message
  const messageText = document.createElement('div');
  messageText.textContent = message;
  messageText.style.marginBottom = showReloadButton ? '1rem' : '0';
  successDiv.appendChild(messageText);
  
  // Add reload button if requested
  if (showReloadButton) {
    window.AuthDebugMonitor?.log('info', '🔘 Creating reload button');
    
    const reloadButton = document.createElement('button');
    reloadButton.type = 'button';
    reloadButton.className = 'btn btn-primary';
    reloadButton.textContent = '🔄 רענן עמוד';
    reloadButton.style.marginTop = '0.5rem';
    reloadButton.style.width = '100%';
    reloadButton.id = 'loginReloadButton'; // Add ID for easier debugging
    reloadButton.onclick = () => {
      window.AuthDebugMonitor?.log('info', '🔄 Manual reload triggered by user', {
        timestamp: new Date().toISOString(),
        sessionReady: true
      });
      
      // Log final state before reload
      window.AuthDebugMonitor?.getCurrentState().then(state => {
        window.AuthDebugMonitor?.log('info', '🔍 Final state before manual reload', state);
      });
      
      // Small delay to ensure logs are saved
      setTimeout(() => {
        window.location.reload();
      }, 100);
    };
    successDiv.appendChild(reloadButton);
    
    window.AuthDebugMonitor?.log('info', '✅ Reload button added to DOM', {
      buttonId: reloadButton.id,
      buttonText: reloadButton.textContent
    });
  }
  
  successDiv.style.display = 'block';
  
  // Only auto-hide if no reload button
  if (!showReloadButton) {
    setTimeout(() => {
      successDiv.style.display = 'none';
    }, 3000);
  }
  
  window.AuthDebugMonitor?.log('info', '✅ showLoginSuccess completed', {
    containerId,
    showReloadButton,
    display: successDiv.style.display
  });
}

function setLoadingState(isLoading, buttonId = 'loginBtn', textId = 'loginBtnText', spinnerId = 'loginBtnSpinner') {
  const loginBtn = document.getElementById(buttonId);
  const loginBtnText = document.getElementById(textId);
  const loginBtnSpinner = document.getElementById(spinnerId);

  if (loginBtn && loginBtnText && loginBtnSpinner) {
    if (isLoading) {
      loginBtn.disabled = true;
      loginBtnText.style.display = 'none';
      loginBtnSpinner.style.display = 'inline';
    } else {
      loginBtn.disabled = false;
      loginBtnText.style.display = 'inline';
      loginBtnSpinner.style.display = 'none';
    }
  }
}

function saveCredentials(username, password, rememberMeId = 'rememberMe') {
  const rememberMe = document.getElementById(rememberMeId);
  if (rememberMe && rememberMe.checked) {
    localStorage.setItem('savedUsername', username);
    localStorage.setItem('savedPassword', password);
    localStorage.setItem('rememberCredentials', 'true');
  } else {
    localStorage.removeItem('savedUsername');
    localStorage.removeItem('savedPassword');
    localStorage.removeItem('rememberCredentials');
  }
}

function loadSavedCredentials(usernameId = 'username', passwordId = 'password', rememberMeId = 'rememberMe') {
  const rememberCredentials = localStorage.getItem('rememberCredentials');
  if (rememberCredentials === 'true') {
    const savedUsername = localStorage.getItem('savedUsername');
    const savedPassword = localStorage.getItem('savedPassword');

    if (savedUsername && savedPassword) {
      const usernameField = document.getElementById(usernameId);
      const passwordField = document.getElementById(passwordId);
      const rememberMeField = document.getElementById(rememberMeId);

      // Use DataCollectionService to set values if available
      if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
        if (usernameField) window.DataCollectionService.setValue(usernameId, savedUsername, 'text');
        if (passwordField) window.DataCollectionService.setValue(passwordId, savedPassword, 'text');
      } else {
        if (usernameField) usernameField.value = savedUsername;
        if (passwordField) passwordField.value = savedPassword;
      }
      // Use DefaultValueSetter for logical default
      if (rememberMeField) {
        if (window.DefaultValueSetter && typeof window.DefaultValueSetter.setLogicalDefault === 'function') {
          window.DefaultValueSetter.setLogicalDefault(rememberMeField.id || 'rememberMe', true);
        } else {
          rememberMeField.checked = true;
        }
      }
    }
  }
}

function showDashboard(loginSectionId = 'loginSection', dashboardSectionId = 'dashboardSection') {
  // Original behavior for pages with login/dashboard sections (no page redirect)
  const loginSection = document.getElementById(loginSectionId);
  const dashboardSection = document.getElementById(dashboardSectionId);

  if (loginSection) {loginSection.style.display = 'none';}
  if (dashboardSection) {dashboardSection.style.display = 'block';}

  // הפעלת פונקציה גלובלית לטעינת הדשבורד אם קיימת
  if (typeof loadDashboardData === 'function') {
    loadDashboardData();
  }
}

function showLogin(loginSectionId = 'loginSection', dashboardSectionId = 'dashboardSection') {
  const loginSection = document.getElementById(loginSectionId);
  const dashboardSection = document.getElementById(dashboardSectionId);

  if (loginSection) {loginSection.style.display = 'block';}
  if (dashboardSection) {dashboardSection.style.display = 'none';}
}

async function logout() {
  // Stop visibility check
  if (typeof stopVisibilityCheck === 'function') {
    stopVisibilityCheck();
  }
  
  try {
    // Call logout API (no cookies)
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.warn('Logout API call failed:', error);
  }
  
  // Clear local state - ALL storage layers
  authToken = null;
  currentUser = null;
  
  // Clear from UnifiedCacheManager (SessionStorageLayer)
  await removeAuthFromCache();
  
  // Clear from localStorage directly (critical - must be explicit)
  try {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    // Keep saved credentials in localStorage for cross-tab sync (these are safe to keep)
    // localStorage.removeItem('savedUsername'); // Keep for convenience
    // localStorage.removeItem('savedPassword'); // Keep for convenience
    // localStorage.removeItem('rememberCredentials'); // Keep for convenience
  } catch (error) {
    console.warn('Error clearing localStorage during logout:', error);
  }
  
  // Clear sessionStorage (redirectAfterLogin, recent_login_timestamp, etc.)
  try {
    sessionStorage.removeItem('redirectAfterLogin');
    sessionStorage.removeItem('recent_login_timestamp');
    sessionStorage.removeItem('login_redirect_url');
    // Clear any other sessionStorage keys that might contain user data
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.startsWith('tiktrack_') || key.includes('auth') || key.includes('user') || 
          key === 'dev_authToken' || key === 'dev_currentUser') {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Error clearing sessionStorage during logout:', error);
  }
  
  // Clear window globals (for dev/no-cache flows)
  window.authToken = null;
  window.currentUser = null;

  // Clear all cache layers
  try {
    // Clear Unified Cache
    if (window.UnifiedCacheManager?.clearAll) {
      await window.UnifiedCacheManager.clearAll();
    }
    // Clear dashboard data cache
    if (window.UnifiedCacheManager?.clearByPattern) {
      await window.UnifiedCacheManager.clearByPattern('dashboard-data');
    }
    // Clear CacheSyncManager
    if (window.CacheSyncManager?.clearAll) {
      await window.CacheSyncManager.clearAll();
    }
    // Clear IndexedDB if available
    if (window.indexedDB && window.indexedDB.databases) {
      const databases = await window.indexedDB.databases();
      for (const db of databases) {
        if (db.name && db.name.includes('TikTrack')) {
          const deleteReq = window.indexedDB.deleteDatabase(db.name);
          deleteReq.onsuccess = () => console.log(`Cleared IndexedDB: ${db.name}`);
        }
      }
    }
  } catch (error) {
    console.warn('Error clearing cache during logout:', error);
  }

  // Update header display before redirect
  if (window.headerSystem?.updateUserDisplay) {
    window.headerSystem.updateUserDisplay();
  }

  // Broadcast logout event to other tabs via localStorage
  try {
    const logoutEvent = {
      type: 'logout',
      timestamp: new Date().toISOString(),
      source: 'auth.js'
    };
    localStorage.setItem('tiktrack_auth_event', JSON.stringify(logoutEvent));
    // Clear immediately so next change will trigger event again
    setTimeout(() => {
      localStorage.removeItem('tiktrack_auth_event');
    }, 100);
  } catch (error) {
    console.warn('Error broadcasting logout event to other tabs:', error);
  }

  // Dispatch logout event (for current tab)
  window.dispatchEvent(new CustomEvent('logout:success'));
  window.dispatchEvent(new CustomEvent('user:logged-out'));

  // הפעלת פונקציה גלובלית להתנתקות אם קיימת
  if (typeof onLogout === 'function') {
    onLogout();
  }

  // Clear dashboard data state if exists
  if (window.dashboardDataState) {
    window.dashboardDataState.data = { trades: [], alerts: [], accounts: [], cashFlows: [] };
    window.dashboardDataState.lastLoadedAt = null;
  }

  // Redirect to login page after logout (not modal - full page redirect for clean state)
  // Small delay to allow UI updates and cache clearing to complete
  setTimeout(() => {
    window.location.href = '/login.html';
  }, 200);
}

/**
 * Check if user is authenticated (sync version)
 * IMPORTANT: This function only checks in-memory cache as a quick check.
 * For actual authentication verification, use checkAuthentication() which checks with the server.
 * 
 * @returns {boolean} True if user data exists in memory (may be stale)
 */
function isAuthenticated() {
  // Quick sync check - checks in-memory variable first
  // NOTE: This should NOT be used for security checks - use checkAuthentication() instead
  if (currentUser) {
    return true;
  }
  // No fallback - UnifiedCacheManager is async, use isAuthenticatedSync() for async check
  return false;
}

/**
 * Synchronously check authentication status (server verification)
 * This is the authoritative check - always verifies with server
 * 
 * @returns {Promise<boolean>} True if authenticated, false otherwise
 */
async function isAuthenticatedSync() {
  console.log('[auth.js] isAuthenticatedSync: Starting authentication check');
  
  // Check cache - ONLY UnifiedCacheManager (or dev sessionStorage fallback inside helper)
  // Use helper function for consistent key handling
  const { user: cachedUser, token: cachedToken } = await getAuthFromCache();
  if (cachedUser) {
    window.Logger?.info?.('✅ [auth.js] Found cached user', { 
      page: 'auth', 
      userId: cachedUser.id || cachedUser.username 
    });
  } else {
    console.log('[auth.js] isAuthenticatedSync: No cached user found');
  }
  
  try {
    window.AuthDebugMonitor?.log('info', '🔍 isAuthenticatedSync: Checking server authentication');
    if (window.DEBUG_AUTH_MONITOR === true) debugger; // Breakpoint helper
    
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: cachedToken ? { 'Authorization': `Bearer ${cachedToken}` } : undefined
    });
    
    window.AuthDebugMonitor?.log('info', '🔍 isAuthenticatedSync: Server response', {
      status: response.status,
      ok: response.ok
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success' && data.data?.user) {
        // Update cache with fresh data - ONLY UnifiedCacheManager, no fallbacks
        currentUser = data.data.user;
        
        window.AuthDebugMonitor?.log('info', '✅ isAuthenticatedSync: User authenticated', {
          userId: currentUser?.id,
          username: currentUser?.username
        });
        
        // Use helper function for consistent key handling
        await saveAuthToCache(currentUser, 'session_based');
        
        window.AuthDebugMonitor?.log('info', '✅ isAuthenticatedSync: Saved to cache', {
          userId: currentUser?.id
        });
        return true;
      }
    }
    
    // Not authenticated - but don't clear cache immediately if we have cached user
    // It might be a timing issue (session cookie not ready yet)
    if (response.status === 401) {
      if (cachedUser) {
        // We have cached user but server says 401 - might be timing issue
        // Wait a bit and retry once before clearing cache
        console.debug('[auth.js] isAuthenticatedSync: 401 but cached user exists, retrying...');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Wait 1.5 seconds
        
        const retryResponse = await fetch('/api/auth/me', {
          method: 'GET', });
        
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          if (retryData.status === 'success' && retryData.data?.user) {
            // Server check passed on retry - update cache and return true
            currentUser = retryData.data.user;
            if (window.UnifiedCacheManager) {
              await window.UnifiedCacheManager.save('currentUser', currentUser, authCacheOptions);
              await window.UnifiedCacheManager.save('authToken', 'session_based', authCacheOptions);
            }
            return true;
          }
        }
        
        // Retry failed - but if we have cached user, don't clear cache
        // The user might be authenticated but server is slow
        console.debug('[auth.js] isAuthenticatedSync: Retry failed but cached user exists - assuming authenticated');
        currentUser = cachedUser; // Restore from cache
        return true; // Assume authenticated if we have cached user
      } else {
        // No cached user - safe to clear - ONLY UnifiedCacheManager, no fallbacks
        currentUser = null;
        await removeAuthFromCache();
      }
    }
    
    return false;
  } catch (error) {
    // On error, if we have cached user, assume authenticated
    if (cachedUser) {
      console.debug('[auth.js] isAuthenticatedSync: Network error but cached user exists - assuming authenticated');
      currentUser = cachedUser; // Restore from cache
      return true;
    }
    console.warn('Error checking authentication:', error);
    return false;
  }
}

function getAuthToken() {
  return authToken;
}

function getCurrentUser() {
  // Return cached user if available (sync version)
  if (currentUser) {
    return currentUser;
  }
  
  // No fallback - UnifiedCacheManager is async, use getCurrentUserAsync() for async check
  
  // No user found
  return null;
}

/**
 * Get current user asynchronously from UnifiedCacheManager
 * @returns {Promise<Object|null>} User object or null
 */
async function getCurrentUserAsync() {
  // Return cached user if available
  if (currentUser) {
    return currentUser;
  }
  
  // Try to load from UnifiedCacheManager using helper function
  const { user: storedUser, token: storedToken } = await getAuthFromCache();
  if (storedUser) {
    currentUser = storedUser;
    authToken = storedToken;
    return currentUser;
  }
  
  // No user found
  return null;
}

// פונקציה גלובלית לטיפול בטופס התחברות
function setupLoginForm(formId = 'loginForm', onSuccess = null) {
  const form = document.getElementById(formId);
  if (!form) {return;}

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Use DataCollectionService to get values if available
    let username, password;
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) {
      username = window.DataCollectionService.getValue('username', 'text', '');
      password = window.DataCollectionService.getValue('password', 'text', '');
    } else {
      const usernameEl = document.getElementById('username');
      const passwordEl = document.getElementById('password');
      username = usernameEl ? usernameEl.value : '';
      password = passwordEl ? passwordEl.value : '';
    }

    if (!username || !password) {
      showLoginError('אנא מלא את כל השדות');
      return;
    }

    setLoadingState(true);

    try {
      const loginData = await login(username, password);

      // שמירת פרטי התחברות
      authToken = loginData.data?.access_token || 'session_based';
      currentUser = loginData.data?.user;

      // Save to UnifiedCacheManager - ONLY UnifiedCacheManager, no fallbacks
      if (currentUser) {
        if (window.UnifiedCacheManager) {
          // CRITICAL: Save WITHOUT user_id prefix to avoid key mismatch
          const saveOptions = { includeUserId: false };
          
          window.AuthDebugMonitor?.log('info', '💾 Saving auth data after login form', {
            userId: currentUser?.id,
            username: currentUser?.username,
            authTokenType: typeof authToken
          });
          
          // Use helper function for consistent key handling
          await saveAuthToCache(currentUser, authToken);
        } else {
          window.Logger?.error?.('❌ [auth.js] UnifiedCacheManager not available', { page: 'auth' });
          window.AuthDebugMonitor?.log('error', '❌ UnifiedCacheManager not available');
        }
      }

      // שמירת פרטי התחברות אם נבחר "זכור אותי"
      saveCredentials(username, password);

      // Auto-reload page after successful login (instead of showing reload button)
      window.AuthDebugMonitor?.log('info', '✅ LOGIN FORM: Login successful, auto-reloading page', {
        userId: currentUser?.id,
        username: currentUser?.username,
        timestamp: new Date().toISOString()
      });

      // Show success message with reload button (instead of auto-reload)
      window.AuthDebugMonitor?.log('info', '✅ LOGIN FORM: Login successful, showing success message with reload button', {
        userId: currentUser?.id,
        username: currentUser?.username,
        timestamp: new Date().toISOString()
      });

      showLoginSuccess('✅ התחברות הצליחה! לחץ על "רענן עמוד" להמשך', 'loginSuccess', true);

      // Verify button was added
      setTimeout(() => {
        const reloadBtn = document.querySelector('#loginSuccess button');
        if (reloadBtn) {
          window.AuthDebugMonitor?.log('info', '✅ Reload button successfully added to DOM');
        } else {
          window.AuthDebugMonitor?.log('error', '❌ Reload button NOT found in DOM after showLoginSuccess');
        }
      }, 100);

      // Broadcast login event to other tabs
      broadcastAuthEvent({
        type: 'login',
        timestamp: new Date().toISOString(),
        source: 'auth.js',
        userId: currentUser?.id,
        user: currentUser,
        token: authToken
      });

      // CRITICAL: Load user preferences after successful login
      try {
        window.AuthDebugMonitor?.log('info', '📋 Loading user preferences after login', {
          userId: currentUser?.id,
          timestamp: new Date().toISOString()
        });

        // Load preferences to ensure they are available for the UI
        if (window.PreferencesData?.loadAllPreferencesRaw) {
          const prefsPayload = await window.PreferencesData.loadAllPreferencesRaw({ force: true });
          window.AuthDebugMonitor?.log('info', '✅ User preferences loaded after login', {
            userId: currentUser?.id,
            preferencesCount: prefsPayload?.preferences ? Object.keys(prefsPayload.preferences).length : 0
          });
        }
      } catch (prefsError) {
        window.AuthDebugMonitor?.log('warn', '⚠️ Failed to load preferences after login (non-critical)', {
          userId: currentUser?.id,
          error: prefsError?.message
        });
      }

      // Dispatch login success event (for current tab)
      window.dispatchEvent(new CustomEvent('login:success'));
      window.dispatchEvent(new CustomEvent('user:logged-in'));

      // Update header display if available
      if (window.headerSystem?.updateUserDisplay) {
        window.headerSystem.updateUserDisplay();
      }

      // הפעלת callback אם קיים
      if (onSuccess && typeof onSuccess === 'function') {
        setTimeout(async () => {
          // BREAKPOINT: Before callback after login
          window.AuthDebugMonitor?.log('info', '🔄 About to call onSuccess callback', {
            timestamp: new Date().toISOString()
          });
          
          // Verify cache before callback
          const cacheCheck = await window.AuthDebugMonitor?.checkCacheKeys();
          window.AuthDebugMonitor?.log('info', '🔍 Cache state before callback', cacheCheck);
          
          if (window.DEBUG_AUTH_MONITOR === true) debugger; // Breakpoint helper
          
          onSuccess();
        }, 1000);
      } else {
        // מעבר לדשבורד אחרי שנייה
        setTimeout(async () => {
          // BREAKPOINT: Before redirect after login
          window.AuthDebugMonitor?.log('info', '🔄 About to redirect after login', {
            timestamp: new Date().toISOString()
          });
          
          // Verify cache before redirect
          const cacheCheck = await window.AuthDebugMonitor?.checkCacheKeys();
          window.AuthDebugMonitor?.log('info', '🔍 Cache state before redirect', cacheCheck);
          
          if (window.DEBUG_AUTH_MONITOR === true) debugger; // Breakpoint helper
          
          // Check if we have a redirect destination from auth guard
          const redirectPath = window.AuthGuard?.getRedirectAfterLogin?.();
          if (redirectPath) {
            window.location.href = redirectPath;
          } else {
            // Default to index.html (dashboard)
            window.location.href = 'index.html';
          }
        }, 1000);
      }

    } catch (error) {
      // Log error for debugging
      window.AuthDebugMonitor?.log('error', '❌ LOGIN FORM: Login failed', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      // Save error for debugging
      window.AuthDebugMonitor?.saveError(error, {
        type: 'login_form_error',
        username: username
      });
      
      showLoginError(error.message);
    } finally {
      setLoadingState(false);
    }
  });
}

// פונקציה לבדיקת התחברות בעת טעינת הדף

async function checkAuthentication(onAuthenticated = null, onNotAuthenticated = null) {

    console.log('[auth.js] checkAuthentication: Starting authentication check');
    console.log('[auth.js] checkAuthentication: Looking for stored tokens...');
    console.log('[auth.js] checkAuthentication: UnifiedCacheManager exists:', !!window.UnifiedCacheManager);
    console.log('[auth.js] checkAuthentication: UnifiedCacheManager initialized:', window.UnifiedCacheManager?.initialized);

  // Prevent multiple simultaneous calls - wait for existing call instead of skipping
  if (window._checkingAuth) {
    console.log('[auth.js] checkAuthentication: Already checking, waiting for result...');
    // Wait for the existing call to complete instead of returning undefined
    // Try to get the promise immediately
    if (window._checkingAuthPromise) {
      console.log('[auth.js] checkAuthentication: Found existing promise, waiting for result...');
      const result = await window._checkingAuthPromise;
      console.log('[auth.js] checkAuthentication: Got result from existing promise:', result);
      return result;
    }
    // If no promise exists yet, wait for it to be created (may be created between checks)
    console.log('[auth.js] checkAuthentication: No promise yet, waiting for it to be created...');
    let attempts = 0;
    const maxAttempts = 100; // Wait up to 10 seconds (100 * 100ms)
    while (window._checkingAuth && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
      if (window._checkingAuthPromise) {
        console.log('[auth.js] checkAuthentication: Promise created after', attempts, 'attempts, waiting for result...');
        const result = await window._checkingAuthPromise;
        console.log('[auth.js] checkAuthentication: Got result after waiting:', result);
        return result;
      }
    }
    // If still checking after waiting, it means the promise was never created or resolved
    console.warn('[auth.js] checkAuthentication: Still checking after', maxAttempts, 'attempts, returning error');
    return { authenticated: false, user: null, error: 'check_timeout' };
  }
  window._checkingAuth = true;
  // Create promise that will be resolved with the result
  let resolvePromise;
  window._checkingAuthPromise = new Promise((resolve) => {
    resolvePromise = resolve;
  });
  
  // Wrap everything in try-catch-finally to ensure promise is resolved
  let finalResult;
  try {
    // Ensure we have a token before hitting the server
    let tokenAvailable = false;
    let effectiveToken = null;

    // First try UnifiedCacheManager if available
    if (window.UnifiedCacheManager) {
      // Wait for initialization if needed
      if (!window.UnifiedCacheManager.initialized) {
        let attempts = 0;
        while (!window.UnifiedCacheManager.initialized && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
      }

      if (window.UnifiedCacheManager.initialized) {
        const t = await window.UnifiedCacheManager.get('authToken', authCacheOptions).catch((e) => {
          return null;
        });
        if (t) {
          tokenAvailable = true;
          effectiveToken = t;
        }
      }
    }
    if (!tokenAvailable && typeof sessionStorage !== 'undefined') {
      const t = sessionStorage.getItem(DEV_SESSION_TOKEN_KEY);
      if (t) {
        tokenAvailable = true;
        effectiveToken = t;
        authToken = t;
        const uRaw = sessionStorage.getItem(DEV_SESSION_USER_KEY);
        try {
          const u = uRaw ? JSON.parse(uRaw) : null;
          currentUser = u;
          // Mirror to globals for dev/no-cache flows
          window.authToken = authToken;
          window.currentUser = currentUser;
          // Mirror to localStorage so api-fetch-wrapper can pick it up if needed
          localStorage.setItem('authToken', authToken);
          if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
          }
          if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
            await window.UnifiedCacheManager.save('authToken', t, authCacheOptions);
            if (u) await window.UnifiedCacheManager.save('currentUser', u, authCacheOptions);
          }
        } catch (_) {}
      }
    }

    console.log('[auth.js] checkAuthentication: tokenAvailable =', tokenAvailable, 'effectiveToken =', effectiveToken ? 'present' : 'null');
    console.log('[auth.js] checkAuthentication: UnifiedCacheManager initialized =', window.UnifiedCacheManager?.initialized);
    console.log('[auth.js] checkAuthentication: sessionStorage token =', (typeof sessionStorage !== 'undefined') ? (sessionStorage.getItem(DEV_SESSION_TOKEN_KEY) ? 'present' : 'null') : 'no sessionStorage');

    if (!tokenAvailable) {
      console.log('[auth.js] checkAuthentication: No token found');
      window.Logger?.info?.('❌ [auth.js] No token available, skipping /api/auth/me', { page: 'auth' });
      if (onNotAuthenticated && typeof onNotAuthenticated === 'function') {
        onNotAuthenticated();
      }
      // Return result without showing modal - let caller decide what to do
      finalResult = { authenticated: false, user: null, error: 'no_token' };
      if (resolvePromise) resolvePromise(finalResult);
      return finalResult;
    }

    console.log('[auth.js] checkAuthentication: Checking server authentication...');
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: effectiveToken ? { 'Authorization': `Bearer ${effectiveToken}` } : undefined
      // Authorization also injected by api-fetch-wrapper if present
    });
    console.log('[auth.js] checkAuthentication: Server response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('[auth.js] checkAuthentication: Server response data:', data);
      if (data.status === 'success' && data.data?.user) {
        const newUser = data.data.user;
        const wasAuthenticated = !!currentUser;
        const userChanged = currentUser?.id !== newUser?.id;
        
        currentUser = newUser;
        // Preserve real token if available (dev/no-cache uses bearer token)
        authToken = effectiveToken || authToken || 'session_based'; // Session-based fallback
        // Mirror to globals/localStorage for dev/no-cache flows
        window.authToken = authToken;
        window.currentUser = currentUser;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        // Save to UnifiedCacheManager using helper function
        await saveAuthToCache(currentUser, authToken);
        
        // Save timestamp to prevent redirect loop (auth-guard checks this)
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('recent_login_timestamp', Date.now().toString());
        }

        // Close login modal if present (prevents lingering modal in dev/no-cache)
        closeLoginModal();
        
        // Mark that user just logged in (prevents auth-guard from checking immediately)
        if (typeof window.AuthGuard?.markJustLoggedIn === 'function') {
          window.AuthGuard.markJustLoggedIn();
        }
        
        // Only broadcast login event if user actually changed (new login or user switch)
        if (!wasAuthenticated || userChanged) {
          // Broadcast login event to other tabs
          broadcastAuthEvent({
            type: 'login',
            timestamp: new Date().toISOString(),
            source: 'auth.js',
            userId: currentUser?.id,
            user: currentUser,
            token: authToken
          });
        }
        
        finalResult = { authenticated: true, user: currentUser, error: null };
        if (onAuthenticated && typeof onAuthenticated === 'function') {
          onAuthenticated();
        } else {
          showDashboard();
        }
        if (resolvePromise) resolvePromise(finalResult);
        return finalResult;
      }
    } else if (response.status === 401) {
      // 401 is expected when not authenticated - silently handle it
      // Don't log as error to avoid console pollution
    }
  } catch (error) {
    // Only log non-401 errors to avoid console pollution
    // 401 errors are expected and handled silently
    if (error.message && !error.message.includes('401')) {
      console.warn('Failed to check authentication:', error);
    }
  } finally {
    // Ensure promise is resolved even if there was an error
    if (resolvePromise && !finalResult) {
      finalResult = { authenticated: false, user: null, error: 'check_failed' };
      resolvePromise(finalResult);
    }
    window._checkingAuth = false;
    window._checkingAuthPromise = null;
  }
  
  // Server check failed - check cache first - ONLY UnifiedCacheManager, no fallbacks
  let cachedUser = null;
  if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
    cachedUser = await window.UnifiedCacheManager.get('currentUser', authCacheOptions);
  }
  
  // If server said unauthenticated, always clear auth cache and force login
  if (cachedUser) {
    console.debug('[auth.js] checkAuthentication: Server check failed, clearing cached auth and showing login');
  }
  currentUser = null;
  authToken = null;
  await removeAuthFromCache();
  
  // No cached user - safe to clear - ONLY UnifiedCacheManager, no fallbacks
  currentUser = null;
  authToken = null;
  await removeAuthFromCache();
  
  // Not authenticated

  finalResult = { authenticated: false, user: null, error: 'authentication_failed' };
  
  if (onNotAuthenticated && typeof onNotAuthenticated === 'function') {
    onNotAuthenticated();
  } else {
    // Show login modal; fallback to homepage
    if (typeof window.TikTrackAuth?.showLoginModal === 'function') {

      await window.TikTrackAuth.showLoginModal();
    } else {

      window.location.href = '/';
    }
  }

  if (resolvePromise) resolvePromise(finalResult);
  return finalResult;
}

// פונקציה ליצירת ממשק התחברות דינמי
function createLoginInterface(containerId, onSuccess = null) {
  const container = document.getElementById(containerId);
  if (!container) {return;}

  container.textContent = '';
  const loginHTML = `
    <div class="login-header">
      <div class="login-logo">
        <img src="images/logo.svg" alt="TikTrack Logo" />
      </div>
      <h1 class="login-title">התחברות</h1>
      <p class="login-subtitle">ברוכים הבאים ל-TikTrack</p>
    </div>
    
    <div class="login-error" id="loginError"></div>
    <div class="login-success" id="loginSuccess"></div>
    
    <form id="loginForm">
      <div class="form-group">
        <label class="form-label" for="username">שם משתמש</label>
        <input type="text" id="username" class="form-control" placeholder="הכנס שם משתמש" required>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="password">סיסמה</label>
        <input type="password" id="password" class="form-control" placeholder="הכנס סיסמה" required>
      </div>
      
      <div class="remember-me">
        <input type="checkbox" id="rememberMe">
        <label for="rememberMe">זכור אותי לתקופת הפיתוח</label>
      </div>
      
      <button type="submit" class="btn-login" id="loginBtn">
        <span id="loginBtnText">התחבר</span>
        <span id="loginBtnSpinner" style="display: none;">⏳ מתחבר...</span>
      </button>
    </form>
    
    <div style="text-align: center; margin-top: 1rem;">
      <a href="forgot_password.html" style="color: #26baac; text-decoration: none; font-size: 0.9rem;">שכחת סיסמה?</a>
    </div>
    
    <div class="demo-credentials">
      <h6>פרטי התחברות לדמו:</h6>
      <p><strong>מנהל:</strong> username=admin, password=admin123</p>
      <p><strong>משתמש:</strong> username=user, password=user123</p>
    </div>
  `;
  // Use innerHTML instead of DOMParser for better compatibility
  container.innerHTML = loginHTML;

  // הגדרת הטופס
  setupLoginForm('loginForm', onSuccess);
}

// פונקציה ליצירת כפתור התנתקות
function createLogoutButton(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {return;}

  container.textContent = '';
  const button = document.createElement('button');
  button.className = 'btn';
  button.onclick = logout;
  button.textContent = '🚪 התנתק';
  container.appendChild(button);
}

/**
 * Show login modal instead of redirecting to login page
 * הצגת modal כניסה במקום redirect לעמוד כניסה
 */

async function showLoginModal(onSuccess = null) {

  // PREVENT MULTIPLE MODALS: Check if already showing
  // TEMPORARILY DISABLED FOR DEBUGGING
  /*
  if (window._loginModalShowing) {
    console.warn('[auth.js] showLoginModal prevented - already showing modal');
    return;
  }
  */
  console.log('[auth.js] showLoginModal: setting flag to true');
  window._loginModalShowing = true;

  window.Logger?.info?.('🔐 [auth.js] showLoginModal called', { page: 'auth' });
  // Skip if already authenticated (dev/no-cache support via globals/session/localStorage)
  try {
    const devToken = (typeof sessionStorage !== 'undefined') ? sessionStorage.getItem(DEV_SESSION_TOKEN_KEY) : null;
    const devUser = (typeof sessionStorage !== 'undefined') ? sessionStorage.getItem(DEV_SESSION_USER_KEY) : null;
    const lsToken = (typeof localStorage !== 'undefined') ? localStorage.getItem('authToken') : null;
    if (currentUser || authToken || devToken || lsToken) {
      window.Logger?.info?.('ℹ️ [auth.js] showLoginModal skipped - token/user already present', {
        hasCurrentUser: !!currentUser,
        hasAuthToken: !!authToken,
        hasDevToken: !!devToken,
        hasLSToken: !!lsToken
      });
      // If a stale modal exists, remove it
      const stale = document.getElementById('loginModal');
      if (stale) {
        stale.remove();
      }
      return;
    }
  } catch (e) {
    window.Logger?.warn?.('⚠️ [auth.js] showLoginModal skip check failed', { error: e?.message });
  }

  const modalId = 'loginModal';

  // CLEANUP ALL EXISTING MODALS FIRST - prevent zombie modals
  const allExistingModals = document.querySelectorAll('#loginModal');
  if (allExistingModals.length > 0) {
    window.Logger?.info?.('🔍 [auth.js] Cleaning up all existing login modals', { count: allExistingModals.length, page: 'auth' });
    allExistingModals.forEach(modal => {
      try {
        modal.remove();
      } catch (e) {
        // Ignore errors when removing
      }
    });
  }

  // Also clean up any orphaned backdrops
  const orphanedBackdrops = document.querySelectorAll('.modal-backdrop');
  orphanedBackdrops.forEach(backdrop => {
    try {
      backdrop.remove();
    } catch (e) {
      // Ignore errors when removing
    }
  });
  
  // Remove orphaned Bootstrap backdrops (leave the global backdrop managed by ModalManagerV2)
  const strayBackdrops = document.querySelectorAll('.modal-backdrop:not(#globalModalBackdrop)');
  if (strayBackdrops.length > 0) {
    window.Logger?.info?.('🔍 [auth.js] Removing orphaned backdrops', { page: 'auth', count: strayBackdrops.length });
    strayBackdrops.forEach(backdrop => backdrop.remove());
  }
  
  // Create modal HTML - z-index will be managed by ModalZIndexManager
  const loginModalHTML = `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="display: none;"></button>
          </div>
          <div class="modal-body pt-0">
            <div id="loginModalContainer"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to DOM
  document.body.insertAdjacentHTML('beforeend', loginModalHTML);
  // Ensure the global backdrop is present and standardized
  if (window.ModalManagerV2?.ensureGlobalBackdrop) {
    window.ModalManagerV2.ensureGlobalBackdrop();
  }

  // Z-Index handling via central systems (ModalZIndexManager + ModalNavigationService)
  const modalEl = document.getElementById(modalId);
  const stack = window.ModalNavigationService?.getStack?.() || [];
  const stackIndex = stack.length; // push-as-new-top
  const zDefaults = { modal: 1200, dialog: 1201, content: 1202, backdrop: 1199 };
  const zCalc = (window.ModalZIndexManager?.calculateModalZIndex)
    ? window.ModalZIndexManager.calculateModalZIndex(stackIndex, stackIndex + 1)
    : zDefaults;

  if (modalEl) {
    const dialog = modalEl.querySelector('.modal-dialog');
    const content = modalEl.querySelector('.modal-content');
    modalEl.style.zIndex = zCalc.modal;
    if (dialog) dialog.style.zIndex = zCalc.dialog;
    if (content) content.style.zIndex = zCalc.content;
    const globalBackdrop = document.getElementById('globalModalBackdrop');
    if (globalBackdrop) {
      globalBackdrop.style.zIndex = zCalc.backdrop;
    }
    // Register in navigation stack to keep nesting order consistent
    if (window.ModalNavigationService?.push) {
      window.ModalNavigationService.push({ modalId, element: modalEl, source: 'auth-login', timestamp: Date.now() });
    }
    // Force z-index recalculation using the central manager if available
    if (window.ModalZIndexManager?.forceUpdate) {
      window.ModalZIndexManager.forceUpdate(modalEl);
    }
  }
  window.Logger?.info?.('✅ [auth.js] Modal HTML added to DOM', { page: 'auth' });
  
  // Create login interface inside modal
  const container = document.getElementById('loginModalContainer');
  if (container) {
    window.Logger?.info?.('✅ [auth.js] Container found, creating login interface', { page: 'auth' });
    createLoginInterface('loginModalContainer', async () => {
      // Login successful - page will auto-reload, just log success
      window.AuthDebugMonitor?.log('info', '✅ Login completed successfully - page will auto-reload', {
        timestamp: new Date().toISOString()
      });

      // Close modal since page will reload
      const modalInstance = window.bootstrap?.Modal?.getInstance(modalEl) || (window.bootstrap?.Modal ? new window.bootstrap.Modal(modalEl) : null);
      if (modalInstance) {
        modalInstance.hide();
      }
      modalEl.classList.remove('show');
      modalEl.style.display = 'none';
      // Remove from navigation stack if present
      if (window.ModalNavigationService?.pop) {
        window.ModalNavigationService.pop(modalId);
      }
      // Update z-index stack
      if (window.ModalZIndexManager?.forceUpdate) {
        window.ModalZIndexManager.forceUpdate();
      }
      // Remove element after a short delay to allow transitions
      setTimeout(() => modalEl.remove(), 150);
    });
  } else {
    window.Logger?.error?.('❌ [auth.js] Container not found', { page: 'auth' });
  }
  
  // Show modal using Bootstrap
  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    window.Logger?.info?.('✅ [auth.js] Modal element found, checking Bootstrap', { 
      page: 'auth',
      hasBootstrap: typeof window.bootstrap !== 'undefined',
      hasModal: typeof window.bootstrap?.Modal !== 'undefined'
    });
    
    // Wait a bit for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (window.bootstrap && window.bootstrap.Modal) {
      window.Logger?.info?.('✅ [auth.js] Bootstrap available, showing modal', { page: 'auth' });
      try {
        const modal = new window.bootstrap.Modal(modalElement, {
          backdrop: 'static',
          keyboard: false
        });
        modal.show();
        window.Logger?.info?.('✅ [auth.js] Modal.show() called successfully', { page: 'auth' });
        if (window.ModalZIndexManager?.registerModal) {
          window.ModalZIndexManager.registerModal(modalElement);
        }
        
        // Register modal in ModalNavigationService stack before forcing z-index update
        if (window.ModalNavigationService?.registerModalOpen) {
          try {
            window.ModalNavigationService.registerModalOpen(modalElement, {
              modalId,
              source: 'auth.js',
              type: 'auth',
            });
          } catch (e) {
            window.Logger?.warn?.('⚠️ [auth.js] registerModalOpen failed (non-blocking)', {
              page: 'auth',
              error: e?.message,
            });
          }
        }

        // Update z-index using ModalZIndexManager (central z-index management system)
        if (window.ModalZIndexManager) {
          if (typeof window.ModalZIndexManager.forceUpdate === 'function') {
            // Use requestAnimationFrame for immediate update, then retry with setTimeout
            requestAnimationFrame(() => {
              window.ModalZIndexManager.forceUpdate(modalElement);
              
              // Retry after a short delay to ensure z-index is set correctly
              setTimeout(() => {
                window.ModalZIndexManager.forceUpdate(modalElement);
                window.Logger?.info?.('✅ [auth.js] Z-index updated via ModalZIndexManager', { page: 'auth' });
              }, 120);
            });
          } else {
            window.Logger?.warn?.('⚠️ [auth.js] ModalZIndexManager.forceUpdate not available', { page: 'auth' });
          }
        } else {
          window.Logger?.warn?.('⚠️ [auth.js] ModalZIndexManager not available, using fallback', { page: 'auth' });
        }
        
        // No manual backdrop creation here; ModalManagerV2/ModalZIndexManager manage the single global backdrop
      } catch (error) {
        window.Logger?.error?.('❌ [auth.js] Error showing modal', { 
          page: 'auth',
          error: error.message,
          stack: error.stack
        });
      }
    } else {
      window.Logger?.warn?.('⏳ [auth.js] Bootstrap not available, waiting...', { page: 'auth' });
      // Fallback: wait for Bootstrap to load
      let attempts = 0;
      const checkBootstrap = setInterval(() => {
        attempts++;
        if (window.bootstrap && window.bootstrap.Modal) {
          clearInterval(checkBootstrap);
          window.Logger?.info?.('✅ [auth.js] Bootstrap loaded, showing modal', { 
            page: 'auth',
            attempts: attempts
          });
          try {
          const modal = new window.bootstrap.Modal(modalElement, {
              backdrop: 'static',
              keyboard: false
            });
            modal.show();
            window.Logger?.info?.('✅ [auth.js] Modal.show() called successfully (after wait)', { page: 'auth' });
          if (window.ModalZIndexManager?.registerModal) {
            window.ModalZIndexManager.registerModal(modalElement);
          }
            
            // Update z-index using ModalZIndexManager (central z-index management system)
            if (window.ModalZIndexManager) {
              if (typeof window.ModalZIndexManager.registerModal === 'function') {
                window.ModalZIndexManager.registerModal(modalElement);
              }
              if (typeof window.ModalZIndexManager.forceUpdate === 'function') {
                // Use requestAnimationFrame for immediate update, then retry with setTimeout
                requestAnimationFrame(() => {
                  window.ModalZIndexManager.forceUpdate(modalElement);
                  
                  // Retry after a short delay to ensure z-index is set correctly
                  setTimeout(() => {
                    window.ModalZIndexManager.forceUpdate(modalElement);
                    window.Logger?.info?.('✅ [auth.js] Z-index updated via ModalZIndexManager (after wait)', { page: 'auth' });
                  }, 100);
                });
              } else {
                window.Logger?.warn?.('⚠️ [auth.js] ModalZIndexManager.forceUpdate not available (after wait)', { page: 'auth' });
              }
            } else {
              window.Logger?.warn?.('⚠️ [auth.js] ModalZIndexManager not available, using fallback (after wait)', { page: 'auth' });
            }
            
            // No manual backdrop creation here; ModalManagerV2/ModalZIndexManager manage the single global backdrop
          } catch (error) {
            window.Logger?.error?.('❌ [auth.js] Error showing modal (after wait)', { 
              page: 'auth',
              error: error.message,
              stack: error.stack
            });
          }
        } else if (attempts > 50) {
          clearInterval(checkBootstrap);
          window.Logger?.error?.('❌ [auth.js] Bootstrap Modal not available after waiting', { 
            page: 'auth',
            attempts: attempts
          });
        }
      }, 100);
    }
  } else {
    window.Logger?.error?.('❌ [auth.js] Modal element not found after adding to DOM', { page: 'auth' });
  }

  // RELEASE THE LOCK when modal is closed or after timeout
  setTimeout(() => {
    window._loginModalShowing = false;
  }, 5000); // INCREASED: Allow modal to be shown for 5 seconds before allowing new ones
}

// פונקציה לבדיקת הרשאות
function hasPermission(permission) {
  if (!currentUser || !currentUser.roles) {return false;}

  // כאן אפשר להוסיף לוגיקה לבדיקת הרשאות
  // כרגע נחזיר true לכל משתמש מחובר
  return true;
}

// פונקציה לבדיקת תפקיד
function hasRole(role) {
  if (!currentUser || !currentUser.roles) {return false;}
  return currentUser.roles.includes(role);
}

/**
 * Update user profile
 */
async function updateUserProfile(updates) {
  const response = await fetch('/api/auth/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    }, body: JSON.stringify(updates),
  });

  const data = await response.json();

  if (!response.ok || data.status !== 'success') {
    throw new Error(data.error?.message || 'שגיאה בעדכון פרופיל');
  }

  // Update cache
  if (data.data?.user) {
    currentUser = data.data.user;
    if (window.UnifiedCacheManager) {
      await window.UnifiedCacheManager.save('currentUser', currentUser, authCacheOptions);
    } else {
      window.Logger?.error?.('❌ [auth.js] UnifiedCacheManager not available', { page: 'auth' });
    }
  }

  return data;
}

/**
 * Update user password
 */
async function updatePassword(currentPassword, newPassword) {
  const response = await fetch('/api/auth/me/password', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    }, body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.status !== 'success') {
    throw new Error(data.error?.message || 'שגיאה בעדכון סיסמה');
  }

  return data;
}

/**
 * Dev helper: set auth token/user in cache (supports in-memory/sessionStorage when UC disabled)
 */
async function devSetAuth(token, user) {
  authToken = token || authToken;
  currentUser = user || currentUser;
  if (currentUser) {
    await saveAuthToCache(currentUser, authToken || 'session_based');
  }
  broadcastAuthEvent({
    type: 'login',
    timestamp: new Date().toISOString(),
    source: 'auth.js',
    userId: currentUser?.id,
    user: currentUser,
    token: authToken
  });
  if (window.headerSystem?.updateUserDisplay) {
    window.headerSystem.updateUserDisplay();
  }
  return { user: currentUser, token: authToken };
}

/**
 * Dev helper: clear auth token/user
 */
async function devClearAuth(reason = 'dev_clear') {
  authToken = null;
  currentUser = null;
  await removeAuthFromCache();
  broadcastAuthEvent({
    type: 'logout',
    timestamp: new Date().toISOString(),
    source: 'auth.js',
    reason
  });
  if (window.headerSystem?.updateUserDisplay) {
    window.headerSystem.updateUserDisplay();
  }
  return true;
}

/**
 * Registration modal (reuses register + login flows)
 */
async function showRegisterModal(onSuccess = null) {
  const modalId = 'registerModal';
  document.getElementById(modalId)?.remove();
  const modalHtml = `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title">הרשמה</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div id="registerErrorModal" class="alert alert-danger" style="display:none;"></div>
            <div id="registerSuccessModal" class="alert alert-success" style="display:none;"></div>
            <form id="registerFormModal" novalidate>
              <div class="mb-3">
                <label for="registerUsernameModal" class="form-label">שם משתמש</label>
                <input type="text" class="form-control" id="registerUsernameModal" required autocomplete="username">
              </div>
              <div class="mb-3">
                <label for="registerEmailModal" class="form-label">אימייל (אופציונלי)</label>
                <input type="email" class="form-control" id="registerEmailModal" autocomplete="email">
              </div>
              <div class="mb-3">
                <label for="registerPasswordModal" class="form-label">סיסמה</label>
                <input type="password" class="form-control" id="registerPasswordModal" required autocomplete="new-password">
              </div>
              <div class="mb-3">
                <label for="registerPasswordConfirmModal" class="form-label">אימות סיסמה</label>
                <input type="password" class="form-control" id="registerPasswordConfirmModal" required autocomplete="new-password">
              </div>
              <button type="submit" class="btn btn-primary w-100" id="registerSubmitBtn">
                <span id="registerSubmitBtnText">הרשמה</span>
                <span id="registerSubmitBtnSpinner" style="display:none;">⏳</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  window.ModalManagerV2?.ensureGlobalBackdrop?.();

  const form = document.getElementById('registerFormModal');
  const errorBox = document.getElementById('registerErrorModal');
  const successBox = document.getElementById('registerSuccessModal');

  const showError = message => {
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.style.display = 'block';
    }
  };
  const showSuccess = message => {
    if (successBox) {
      successBox.textContent = message;
      successBox.style.display = 'block';
    }
  };

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (errorBox) errorBox.style.display = 'none';
      if (successBox) successBox.style.display = 'none';

      const username = document.getElementById('registerUsernameModal')?.value?.trim();
      const email = document.getElementById('registerEmailModal')?.value?.trim();
      const password = document.getElementById('registerPasswordModal')?.value || '';
      const confirm = document.getElementById('registerPasswordConfirmModal')?.value || '';

      if (!username || !password) {
        showError('יש למלא שם משתמש וסיסמה');
        return;
      }
      if (password !== confirm) {
        showError('הסיסמאות אינן תואמות');
        return;
      }

      setLoadingState(true, 'registerSubmitBtn', 'registerSubmitBtnText', 'registerSubmitBtnSpinner');
      try {
        await register(username, password, email);
        showSuccess('✅ הרשמה הצליחה, מתחבר...');
        await login(username, password);
        if (typeof onSuccess === 'function') {
          await onSuccess();
        } else {
          window.location.href = '/';
        }
      } catch (err) {
        showError(err?.message || 'שגיאה בהרשמה');
      } finally {
        setLoadingState(false, 'registerSubmitBtn', 'registerSubmitBtnText', 'registerSubmitBtnSpinner');
      }
    });
  }

  const modalEl = document.getElementById(modalId);
  if (modalEl && window.bootstrap?.Modal) {
    const modal = new window.bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false });
    modal.show();
    window.ModalZIndexManager?.registerModal?.(modalEl);
  }
}

/**
 * Forgot password modal
 */
async function showForgotPasswordModal(onSuccess = null) {
  const modalId = 'forgotPasswordModal';
  document.getElementById(modalId)?.remove();
  const modalHtml = `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title">שחזור סיסמה</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div id="forgotErrorModal" class="alert alert-danger" style="display:none;"></div>
            <div id="forgotSuccessModal" class="alert alert-success" style="display:none;"></div>
            <p class="text-muted mb-3">הזן אימייל או שם משתמש ונשלח קישור לאיפוס.</p>
            <form id="forgotPasswordFormModal" novalidate>
              <div class="mb-3">
                <label for="forgotEmailOrUsernameModal" class="form-label">אימייל או שם משתמש</label>
                <input type="text" class="form-control" id="forgotEmailOrUsernameModal" required autocomplete="username email">
              </div>
              <button type="submit" class="btn btn-primary w-100" id="forgotSubmitBtn">
                <span id="forgotSubmitBtnText">שלח קישור איפוס</span>
                <span id="forgotSubmitBtnSpinner" style="display:none;">⏳</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  window.ModalManagerV2?.ensureGlobalBackdrop?.();

  const form = document.getElementById('forgotPasswordFormModal');
  const errorBox = document.getElementById('forgotErrorModal');
  const successBox = document.getElementById('forgotSuccessModal');

  const showError = message => {
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.style.display = 'block';
    }
  };
  const showSuccess = message => {
    if (successBox) {
      successBox.textContent = message;
      successBox.style.display = 'block';
    }
  };

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (errorBox) errorBox.style.display = 'none';
      if (successBox) successBox.style.display = 'none';

      const value = document.getElementById('forgotEmailOrUsernameModal')?.value?.trim();
      if (!value) {
        showError('יש להזין אימייל או שם משתמש');
        return;
      }

      const payload = value.includes('@') ? { email: value } : { username: value };

      setLoadingState(true, 'forgotSubmitBtn', 'forgotSubmitBtnText', 'forgotSubmitBtnSpinner');
      try {
        const response = await fetch('/api/auth/password-reset/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok || data.status !== 'success') {
          throw new Error(data.error?.message || 'שליחה נכשלה');
        }
        showSuccess(data.data?.message || 'אם המשתמש קיים, נשלח קישור איפוס.');
        if (typeof onSuccess === 'function') {
          await onSuccess();
        }
      } catch (err) {
        showError(err?.message || 'שליחה נכשלה');
      } finally {
        setLoadingState(false, 'forgotSubmitBtn', 'forgotSubmitBtnText', 'forgotSubmitBtnSpinner');
      }
    });
  }

  const modalEl = document.getElementById(modalId);
  if (modalEl && window.bootstrap?.Modal) {
    const modal = new window.bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false });
    modal.show();
    window.ModalZIndexManager?.registerModal?.(modalEl);
  }
}

/**
 * Reset password modal (token-based)
 */
async function showResetPasswordModal(tokenFromUrl = null, onSuccess = null) {
  const modalId = 'resetPasswordModal';
  document.getElementById(modalId)?.remove();

  const token = tokenFromUrl || new URLSearchParams(window.location.search).get('token');
  const modalHtml = `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title">איפוס סיסמה</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div id="resetErrorModal" class="alert alert-danger" style="display:none;"></div>
            <div id="resetSuccessModal" class="alert alert-success" style="display:none;"></div>
            <p class="text-muted mb-3">הזן סיסמה חדשה. מינימום 6 תווים.</p>
            <form id="resetPasswordFormModal" novalidate>
              <div class="mb-3">
                <label for="resetPasswordModalInput" class="form-label">סיסמה חדשה</label>
                <input type="password" class="form-control" id="resetPasswordModalInput" required autocomplete="new-password">
              </div>
              <div class="mb-3">
                <label for="resetPasswordConfirmModal" class="form-label">אימות סיסמה</label>
                <input type="password" class="form-control" id="resetPasswordConfirmModal" required autocomplete="new-password">
              </div>
              <button type="submit" class="btn btn-primary w-100" id="resetSubmitBtn">
                <span id="resetSubmitBtnText">אפס סיסמה</span>
                <span id="resetSubmitBtnSpinner" style="display:none;">⏳</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  window.ModalManagerV2?.ensureGlobalBackdrop?.();

  const form = document.getElementById('resetPasswordFormModal');
  const errorBox = document.getElementById('resetErrorModal');
  const successBox = document.getElementById('resetSuccessModal');

  const showError = message => {
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.style.display = 'block';
    }
  };
  const showSuccess = message => {
    if (successBox) {
      successBox.textContent = message;
      successBox.style.display = 'block';
    }
  };

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (errorBox) errorBox.style.display = 'none';
      if (successBox) successBox.style.display = 'none';

      const newPassword = document.getElementById('resetPasswordModalInput')?.value || '';
      const confirm = document.getElementById('resetPasswordConfirmModal')?.value || '';

      if (!token) {
        showError('טוקן איפוס חסר');
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        showError('סיסמה חייבת להכיל לפחות 6 תווים');
        return;
      }
      if (newPassword !== confirm) {
        showError('הסיסמאות אינן תואמות');
        return;
      }

      setLoadingState(true, 'resetSubmitBtn', 'resetSubmitBtnText', 'resetSubmitBtnSpinner');
      try {
        const validateResponse = await fetch('/api/auth/password-reset/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const validateData = await validateResponse.json();
        if (!validateResponse.ok || validateData.status !== 'success' || validateData.data?.valid !== true) {
          throw new Error(validateData.error?.message || 'הקישור לא תקף או שפג תוקפו');
        }

        const response = await fetch('/api/auth/password-reset/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, new_password: newPassword })
        });
        const data = await response.json();
        if (!response.ok || data.status !== 'success') {
          throw new Error(data.error?.message || 'איפוס נכשל');
        }
        showSuccess(data.data?.message || 'הסיסמה אופסה בהצלחה');
        if (typeof onSuccess === 'function') {
          await onSuccess();
        }
      } catch (err) {
        showError(err?.message || 'איפוס נכשל');
      } finally {
        setLoadingState(false, 'resetSubmitBtn', 'resetSubmitBtnText', 'resetSubmitBtnSpinner');
      }
    });
  }

  const modalEl = document.getElementById(modalId);
  if (modalEl && window.bootstrap?.Modal) {
    const modal = new window.bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false });
    modal.show();
    window.ModalZIndexManager?.registerModal?.(modalEl);
  }
}

// ייצוא פונקציות גלובליות
window.TikTrackAuth = {
  login,
  logout,
  isAuthenticated,
  isAuthenticatedSync,
  getAuthToken,
  getCurrentUser,
  getCurrentUserAsync,
  updateUserProfile,
  updatePassword,
  setupLoginForm,
  checkAuthentication,
  createLoginInterface,
  createLogoutButton,
  hasPermission,
  hasRole,
  showLogin,
  showDashboard,
  showLoginError,
  showLoginSuccess,
  setLoadingState,
  register,
  loadSavedCredentials,
  showLoginModal,
  // Helper functions for consistent cache operations
  saveAuthToCache,
  getAuthFromCache,
  removeAuthFromCache,
  forceLogoutAndPrompt,
  devSetAuth,
  devClearAuth,
  showRegisterModal,
  showForgotPasswordModal,
  showResetPasswordModal,
};

// ✅ לוג אימות - ניטור הגדרת window.TikTrackAuth
if (window.Logger) {
  window.Logger.info('✅ [auth.js] window.TikTrackAuth defined', {
    page: 'auth',
    hasShowLoginModal: typeof window.TikTrackAuth?.showLoginModal === 'function',
    functions: Object.keys(window.TikTrackAuth || {}),
    timestamp: new Date().toISOString()
  });
} else {
  console.log('✅ [auth.js] window.TikTrackAuth defined', {
    hasShowLoginModal: typeof window.TikTrackAuth?.showLoginModal === 'function',
    functions: Object.keys(window.TikTrackAuth || {})
  });
}

// Export register function globally
window.register = register;

/**
 * Session validation on visibility change
 * בודק שהסשן עדיין תקף כשהמשתמש חוזר לטאב
 * אם הסשן פג תוקף, מנתק את המשתמש ומעביר למסך הכניסה
 * 
 * Uses VisibilityChange API instead of periodic checks for better performance
 */
let visibilityCheckHandler = null;

function setupVisibilityCheck() {
  // Remove existing handler if any
  if (visibilityCheckHandler) {
    document.removeEventListener('visibilitychange', visibilityCheckHandler);
  }
  
  // Check session when user returns to tab
  visibilityCheckHandler = async () => {
    if (document.visibilityState === 'visible') {
      // Skip check if user just logged in (prevents race condition)
      if (typeof window.AuthGuard !== 'undefined' && 
          window.AuthGuard._justLoggedIn && 
          (Date.now() - (window.AuthGuard._loginTimestamp || 0)) < 3000) {
        return;
      }
      
      // User returned to tab - check session if user appears authenticated
      // ONLY UnifiedCacheManager, no fallbacks
      let storedUser = null;
      if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        storedUser = await window.UnifiedCacheManager.get('currentUser', authCacheOptions);
      }
      if (!storedUser) {
        // No user data - nothing to validate
        return;
      }
      
      // Add small delay to avoid checking immediately after tab becomes visible
      // This prevents race conditions with other auth checks
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        // Check with server using token header
        const response = await fetch('/api/auth/me', {
          method: 'GET'
          // Authorization injected by api-fetch-wrapper
        });
        
        if (!response.ok || response.status === 401) {
          // Session expired or invalid
          console.log('🔒 Session expired - logging out...');
          
          // Clear local state - ONLY UnifiedCacheManager, no fallbacks
          currentUser = null;
          authToken = null;
          await removeAuthFromCache();
          
          // Broadcast logout event to other tabs
          try {
            const logoutEvent = {
              type: 'logout',
              timestamp: new Date().toISOString(),
              source: 'auth.js',
              reason: 'session_expired'
            };
            localStorage.setItem('tiktrack_auth_event', JSON.stringify(logoutEvent));
            setTimeout(() => {
              localStorage.removeItem('tiktrack_auth_event');
            }, 100);
          } catch (error) {
            console.warn('Error broadcasting logout event:', error);
          }
          
          // Show login modal or redirect
          if (typeof window.TikTrackAuth?.showLoginModal === 'function') {
            await window.TikTrackAuth.showLoginModal();
          } else {
            window.location.href = '/';
          }
        } else {
          // Session is valid - update cache with fresh data
          const data = await response.json();
          if (data.status === 'success' && data.data?.user) {
            currentUser = data.data.user;
            if (window.UnifiedCacheManager) {
              await window.UnifiedCacheManager.save('currentUser', currentUser, authCacheOptions);
              await window.UnifiedCacheManager.save('authToken', authToken, authCacheOptions);
            } else {
              window.Logger?.error?.('❌ [auth.js] UnifiedCacheManager not available', { page: 'auth' });
            }
          }
        }
      } catch (error) {
        // On error, don't disconnect - might be network issue
        console.debug('Session validation error (non-critical):', error);
      }
    }
  };
  
  // Add event listener
  document.addEventListener('visibilitychange', visibilityCheckHandler);
  console.log('✅ Session validation on visibility change enabled');
}

function stopVisibilityCheck() {
  if (visibilityCheckHandler) {
    document.removeEventListener('visibilitychange', visibilityCheckHandler);
    visibilityCheckHandler = null;
    console.log('✅ Session validation on visibility change disabled');
  }
}

// Setup visibility check when auth.js loads (if user is authenticated)
// Note: This uses async check, so we need to handle it properly
if (typeof window !== 'undefined') {
  const setupVisibilityCheckIfAuthenticated = async () => {
    // Check UnifiedCacheManager - ONLY UnifiedCacheManager, no fallbacks
    let storedUser = null;
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
      storedUser = await window.UnifiedCacheManager.get('currentUser', authCacheOptions);
    }
    if (storedUser) {
      // Setup validation after a short delay to avoid conflicts with initial auth check
      setTimeout(() => {
        setupVisibilityCheck();
      }, 1000);
    }
  };
  
  if (document.readyState === 'complete') {
    // Page already loaded
    setupVisibilityCheckIfAuthenticated();
  } else {
    // Wait for page to load
    window.addEventListener('load', () => {
      setupVisibilityCheckIfAuthenticated();
    });
  }
}

// Stop visibility check on logout
// Note: stopVisibilityCheck is called at the start of logout()

// Export session validation functions (for backward compatibility)
// Note: This must be after window.TikTrackAuth is defined (line 1133)
// This code runs after window.TikTrackAuth is defined, so we can safely access it
if (typeof window !== 'undefined' && typeof window.TikTrackAuth !== 'undefined') {
  window.TikTrackAuth.setupVisibilityCheck = setupVisibilityCheck;
  window.TikTrackAuth.stopVisibilityCheck = stopVisibilityCheck;
  // Legacy aliases (deprecated - use setupVisibilityCheck/stopVisibilityCheck)
  window.TikTrackAuth.startSessionValidation = setupVisibilityCheck;
  window.TikTrackAuth.stopSessionValidation = stopVisibilityCheck;
}
