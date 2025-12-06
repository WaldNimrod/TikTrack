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

// משתנים גלובליים
let authToken = null;
let currentUser = null;

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
          
          // Clear local state
          authToken = null;
          currentUser = null;
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
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
          
        // Show login modal if not already on login/register page
        if (!window.location.pathname.includes('login.html') && 
            !window.location.pathname.includes('register.html')) {
          if (typeof window.TikTrackAuth?.showLoginModal === 'function') {
            await window.TikTrackAuth.showLoginModal();
          } else {
            // Show login modal instead of redirecting
      if (typeof window.TikTrackAuth?.showLoginModal === 'function') {
        await window.TikTrackAuth.showLoginModal();
      } else {
        window.location.href = 'login.html';
      }
          }
        }
        } else if (authEvent.type === 'login') {
          // Login event from another tab - update local state
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
          
          // Reload user data from server
          if (typeof checkAuthentication === 'function') {
            await checkAuthentication();
          }
        }
      } catch (error) {
        console.error('Error processing auth event from storage:', error);
      }
    }
  });
}

// פונקציות התחברות
async function login(username, password) {
  // Use relative URL to work with both development (8080) and production (5001)
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
    credentials: 'include' // Include cookies for session
  });

  const data = await response.json();

  if (!response.ok || data.status !== 'success') {
    throw new Error(data.error?.message || 'שגיאה בהתחברות');
  }

  // Store user in localStorage
  if (data.data?.user) {
    currentUser = data.data.user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }

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
    }),
    credentials: 'include' // Include cookies for session
  });

  const data = await response.json();

  if (!response.ok || data.status !== 'success') {
    throw new Error(data.error?.message || 'שגיאה בהרשמה');
  }

  return {
    success: true,
    user: data.data?.user
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

function showLoginSuccess(message, containerId = 'loginSuccess') {
  const successDiv = document.getElementById(containerId);
  if (successDiv) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';

    // הסתרת הודעת הצלחה אחרי 3 שניות
    setTimeout(() => {
      successDiv.style.display = 'none';
    }, 3000);
  }
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
  // If called from login page, redirect to dashboard instead
  if (window.location.pathname.includes('login.html') || 
      window.location.pathname.includes('register.html')) {
    // Check if we have a redirect destination from auth guard
    const redirectPath = window.AuthGuard?.getRedirectAfterLogin?.();
    if (redirectPath) {
      window.location.href = redirectPath;
    } else {
      // Default to index.html (dashboard)
      window.location.href = 'index.html';
    }
    return;
  }

  // Original behavior for pages with login/dashboard sections
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
  try {
    // Call logout API
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.warn('Logout API call failed:', error);
  }
  
  // Clear local state
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('savedUsername');
  localStorage.removeItem('savedPassword');
  localStorage.removeItem('rememberCredentials');
  
  // Clear sessionStorage (redirectAfterLogin, etc.)
  try {
    sessionStorage.removeItem('redirectAfterLogin');
    // Clear any other sessionStorage keys that might contain user data
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.startsWith('tiktrack_') || key.includes('auth') || key.includes('user')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Error clearing sessionStorage during logout:', error);
  }

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

  // Small delay to allow UI updates, then show login modal
  setTimeout(async () => {
    // Show login modal instead of redirecting
    if (typeof window.TikTrackAuth?.showLoginModal === 'function') {
      await window.TikTrackAuth.showLoginModal();
    } else {
      // Fallback: redirect to login page if modal not available
      window.location.href = 'login.html';
    }
  }, 100);
}

function isAuthenticated() {
  // Check if user is in localStorage
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}

function getAuthToken() {
  return authToken;
}

function getCurrentUser() {
  // Return cached user if available
  if (currentUser) {
    return currentUser;
  }
  
  // Try to load from localStorage
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      return currentUser;
    } catch (e) {
      console.warn('Failed to parse stored user:', e);
    }
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

      if (currentUser) {
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }

      // שמירת פרטי התחברות אם נבחר "זכור אותי"
      saveCredentials(username, password);

      showLoginSuccess('התחברות הצליחה! מעביר לדשבורד...');

      // Broadcast login event to other tabs via localStorage
      try {
        const loginEvent = {
          type: 'login',
          timestamp: new Date().toISOString(),
          source: 'auth.js',
          userId: currentUser?.id
        };
        localStorage.setItem('tiktrack_auth_event', JSON.stringify(loginEvent));
        // Clear immediately so next change will trigger event again
        setTimeout(() => {
          localStorage.removeItem('tiktrack_auth_event');
        }, 100);
      } catch (error) {
        console.warn('Error broadcasting login event to other tabs:', error);
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
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        // מעבר לדשבורד אחרי שנייה
        setTimeout(() => {
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
      showLoginError(error.message);
    } finally {
      setLoadingState(false);
    }
  });
}

// פונקציה לבדיקת התחברות בעת טעינת הדף
async function checkAuthentication(onAuthenticated = null, onNotAuthenticated = null) {
  // Try to get current user from API
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success' && data.data?.user) {
        currentUser = data.data.user;
        authToken = 'session_based'; // Session-based auth
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('authToken', authToken);
        
        // Broadcast login event to other tabs
        try {
          const loginEvent = {
            type: 'login',
            timestamp: new Date().toISOString(),
            source: 'auth.js',
            userId: currentUser?.id
          };
          localStorage.setItem('tiktrack_auth_event', JSON.stringify(loginEvent));
          setTimeout(() => {
            localStorage.removeItem('tiktrack_auth_event');
          }, 100);
        } catch (error) {
          console.warn('Error broadcasting login event to other tabs:', error);
        }
        
        if (onAuthenticated && typeof onAuthenticated === 'function') {
          onAuthenticated();
        } else {
          showDashboard();
        }
        return;
      }
    }
  } catch (error) {
    console.warn('Failed to check authentication:', error);
  }
  
  // Not authenticated - try localStorage as fallback
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      if (onAuthenticated && typeof onAuthenticated === 'function') {
        onAuthenticated();
      } else {
        showDashboard();
      }
      return;
    } catch (e) {
      // Invalid stored user
    }
  }
  
  // Not authenticated
  currentUser = null;
  if (onNotAuthenticated && typeof onNotAuthenticated === 'function') {
    onNotAuthenticated();
  } else {
    // Redirect to login if not on login/register page
    if (!window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('register.html')) {
      // Show login modal instead of redirecting
      if (typeof window.TikTrackAuth?.showLoginModal === 'function') {
        await window.TikTrackAuth.showLoginModal();
      } else {
        window.location.href = 'login.html';
      }
    }
  }
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
      <a href="forgot-password.html" style="color: #26baac; text-decoration: none; font-size: 0.9rem;">שכחת סיסמה?</a>
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
  const modalId = 'loginModal';
  
  // Remove existing modal if any
  const existingModal = document.getElementById(modalId);
  if (existingModal) {
    existingModal.remove();
  }
  
  // Remove any orphaned backdrops
  const backdrops = document.querySelectorAll('.modal-backdrop');
  backdrops.forEach(backdrop => backdrop.remove());
  
  // Create modal HTML
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
  
  // Create login interface inside modal
  const container = document.getElementById('loginModalContainer');
  if (container) {
    createLoginInterface('loginModalContainer', async () => {
      // On successful login, close modal and reload page or redirect
      const modalElement = document.getElementById(modalId);
      if (modalElement && window.bootstrap) {
        const modal = window.bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
      }
      
      // Wait a bit for modal to close, then reload or redirect
      setTimeout(() => {
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        } else {
          // Reload current page to refresh UI
          window.location.reload();
        }
      }, 300);
    });
  }
  
  // Show modal using Bootstrap
  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    // Wait a bit for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (window.bootstrap && window.bootstrap.Modal) {
      const modal = new window.bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
      });
      modal.show();
    } else {
      // Fallback: wait for Bootstrap to load
      let attempts = 0;
      const checkBootstrap = setInterval(() => {
        attempts++;
        if (window.bootstrap && window.bootstrap.Modal) {
          clearInterval(checkBootstrap);
          const modal = new window.bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: false
          });
          modal.show();
        } else if (attempts > 50) {
          clearInterval(checkBootstrap);
          console.error('Bootstrap Modal not available after waiting');
        }
      }, 100);
    }
  }
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
    },
    credentials: 'include',
    body: JSON.stringify(updates),
  });

  const data = await response.json();

  if (!response.ok || data.status !== 'success') {
    throw new Error(data.error?.message || 'שגיאה בעדכון פרופיל');
  }

  // Update local storage
  if (data.data?.user) {
    currentUser = data.data.user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
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
    },
    credentials: 'include',
    body: JSON.stringify({
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

// ייצוא פונקציות גלובליות
window.TikTrackAuth = {
  login,
  logout,
  isAuthenticated,
  getAuthToken,
  getCurrentUser,
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
};

// Export register function globally
window.register = register;
