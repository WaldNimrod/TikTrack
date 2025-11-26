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

// פונקציות התחברות
async function login(username, password) {
  // Use relative URL to work with both development (8080) and production (5001)
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'שגיאה בהתחברות');
  }

  return data;
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

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');

  // הפעלת פונקציה גלובלית להתנתקות אם קיימת
  if (typeof onLogout === 'function') {
    onLogout();
  } else {
    showLogin();
  }
}

function isAuthenticated() {
  // כרגע יש רק משתמש אחד - נימרוד
  // מערכת המשתמשים המלאה היא עתידית
  return true; // תמיד מחובר (נימרוד)
}

function getAuthToken() {
  return authToken;
}

function getCurrentUser() {
  // כרגע יש רק משתמש אחד - נימרוד
  // מערכת המשתמשים המלאה היא עתידית
  if (currentUser) {
    return currentUser;
  }
  
  // החזרת משתמש ברירת מחדל (נימרוד)
  return {
    id: 1,
    username: 'nimrod',
    name: 'נימרוד',
    email: 'nimrod@tiktrack.com',
    roles: ['admin', 'user'],
    isActive: true
  };
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
      authToken = loginData.data.access_token;
      currentUser = loginData.data.user;

      localStorage.setItem('authToken', authToken);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      // שמירת פרטי התחברות אם נבחר "זכור אותי"
      saveCredentials(username, password);

      showLoginSuccess('התחברות הצליחה! מעביר לדשבורד...');

      // הפעלת callback אם קיים
      if (onSuccess && typeof onSuccess === 'function') {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        // מעבר לדשבורד אחרי שנייה
        setTimeout(() => {
          showDashboard();
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
function checkAuthentication(onAuthenticated = null, onNotAuthenticated = null) {
  // כרגע יש רק משתמש אחד - נימרוד
  // מערכת המשתמשים המלאה היא עתידית
  currentUser = {
    id: 1,
    username: 'nimrod',
    name: 'נימרוד',
    email: 'nimrod@tiktrack.com',
    roles: ['admin', 'user'],
    isActive: true
  };

  if (onAuthenticated && typeof onAuthenticated === 'function') {
    onAuthenticated();
  } else {
    showDashboard();
  }
}

// פונקציה ליצירת ממשק התחברות דינמי
function createLoginInterface(containerId, onSuccess = null) {
  const container = document.getElementById(containerId);
  if (!container) {return;}

  container.innerHTML = `
    <div class="login-container">
      <div class="login-header">
        <div class="login-logo">📊</div>
        <h1 class="login-title">ברוכים הבאים ל-TikTrack</h1>
        <p class="login-subtitle">מערכת ניהול השקעות מתקדמת</p>
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
      
      <div class="demo-credentials">
        <h6>🔑 פרטי התחברות לבדיקה:</h6>
        <p><strong>מנהל:</strong> username=admin, password=admin123</p>
        <p><strong>משתמש:</strong> username=test, password=test123</p>
      </div>
    </div>
  `;

  // הגדרת הטופס
  setupLoginForm('loginForm', onSuccess);
}

// פונקציה ליצירת כפתור התנתקות
function createLogoutButton(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {return;}

  container.innerHTML = `
    <button class="btn" onclick="logout()">
      🚪 התנתק
    </button>
  `;
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

// ייצוא פונקציות גלובליות
window.TikTrackAuth = {
  login,
  logout,
  isAuthenticated,
  getAuthToken,
  getCurrentUser,
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
};
